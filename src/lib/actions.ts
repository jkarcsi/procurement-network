"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { createSession, destroySession, getSessionUser } from "./auth";
import { clarifyIntake, buildSpec, compareOffers, type ClarifyResult, type QA } from "./ai";
import { shortlistSuppliers } from "./matching";
import { sendRfqInviteEmail, sendOfferReceivedEmail, sendWelcomeEmail } from "./email";
import { notifyUser, notifyCompanyUsers } from "./notifications";
import { acceptOffer } from "./offers";
import { chargeCredits, grantCredits, COMPARISON_COST, WELCOME_BONUS, CREDIT_PACKAGES } from "./credits";
import { getStripe } from "./stripe";
import { checkRfqCreationLimit, checkInviteLimit } from "./limits";
import { rateLimit, RATE_LIMIT_MESSAGE } from "./rateLimit";
import { track } from "./analytics";

async function clientIp(): Promise<string> {
  const fwd = (await headers()).get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || "local";
}

// ---------- Auth ----------

export async function registerAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const companyName = String(formData.get("companyName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = formData.get("role") === "SUPPLIER" ? "SUPPLIER" : "BUYER";

  if (!rateLimit(`register:${await clientIp()}`, 5, 60 * 60 * 1000)) {
    redirect("/register?error=" + encodeURIComponent(RATE_LIMIT_MESSAGE));
  }
  if (!name || !companyName || !email || password.length < 8) {
    redirect("/register?error=" + encodeURIComponent("Minden mező kötelező, a jelszó legalább 8 karakter."));
  }
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    redirect("/register?error=" + encodeURIComponent("Ezzel az e-mail címmel már van fiók."));
  }

  const company = await db.company.create({ data: { name: companyName, type: role } });
  if (role === "SUPPLIER") {
    await db.supplierProfile.create({ data: { companyId: company.id, email } });
  } else {
    await grantCredits(company.id, WELCOME_BONUS, "BONUS", "Üdvözlő kreditek regisztrációért");
  }
  const user = await db.user.create({
    data: {
      name,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role,
      companyId: company.id,
    },
  });
  await sendWelcomeEmail({ to: email, name, role });
  await track("user_registered", user.id, { role });
  await createSession(user.id);
  redirect(role === "SUPPLIER" ? "/supplier/profile" : "/dashboard");
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  if (!rateLimit(`login:${await clientIp()}:${email}`, 5, 5 * 60 * 1000)) {
    redirect("/login?error=" + encodeURIComponent(RATE_LIMIT_MESSAGE) + (next ? `&next=${encodeURIComponent(next)}` : ""));
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user || !user.active || !(await bcrypt.compare(password, user.passwordHash))) {
    redirect("/login?error=" + encodeURIComponent("Hibás e-mail cím vagy jelszó.") + (next ? `&next=${encodeURIComponent(next)}` : ""));
  }
  await createSession(user.id);
  if (next && next.startsWith("/")) redirect(next);
  redirect(user.role === "SUPPLIER" ? "/supplier" : user.role === "ADMIN" ? "/admin" : "/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

// ---------- RFQ intake / creation ----------

export async function clarifyRfqAction(intakeText: string): Promise<ClarifyResult | { error: string }> {
  const user = await getSessionUser();
  if (!user || user.role !== "BUYER") return { error: "Bejelentkezés szükséges (vevői fiókkal)." };
  // Caps cost of the model-backed clarify step
  if (!rateLimit(`clarify:${user.id}`, 20, 60 * 60 * 1000)) return { error: RATE_LIMIT_MESSAGE };
  const text = intakeText.trim();
  if (text.length < 10) return { error: "Írd le legalább egy mondatban, mire van szükséged." };
  return clarifyIntake(text);
}

export async function createRfqAction(payload: {
  intakeText: string;
  title: string;
  categoryId: string | null;
  regionId: string | null;
  deadline: string | null;
  qa: QA[];
}): Promise<{ error: string } | void> {
  const user = await getSessionUser();
  if (!user || user.role !== "BUYER" || !user.companyId) redirect("/login");

  const limit = await checkRfqCreationLimit(user.companyId);
  if (!limit.ok) return { error: limit.error };

  const category = payload.categoryId
    ? await db.category.findUnique({ where: { id: payload.categoryId } })
    : null;
  const region = payload.regionId
    ? await db.region.findUnique({ where: { id: payload.regionId } })
    : null;

  const { spec } = await buildSpec(
    payload.intakeText,
    payload.qa,
    category?.name ?? null,
    region?.name ?? null,
  );

  const rfq = await db.rfq.create({
    data: {
      companyId: user.companyId,
      createdById: user.id,
      intakeText: payload.intakeText,
      title: payload.title.trim() || "Ajánlatkérés",
      categoryId: category?.id ?? null,
      regionId: region?.id ?? null,
      deadline: payload.deadline ? new Date(payload.deadline) : null,
      spec: JSON.stringify(spec),
      status: "READY",
      questions: {
        create: payload.qa.map((x, i) => ({
          order: i,
          question: x.question,
          answer: x.answer.trim() || null,
        })),
      },
      auditLogs: {
        create: { actor: user.email, event: "RFQ_CREATED", meta: payload.intakeText },
      },
    },
  });

  await track("rfq_created", user.id, { categoryId: category?.id ?? "none" });
  redirect(`/rfq/${rfq.id}`);
}

// ---------- RFQ send-out ----------

export async function sendRfqAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user || user.role !== "BUYER" || !user.companyId) redirect("/login");

  const rfqId = String(formData.get("rfqId") ?? "");
  const rfq = await db.rfq.findUnique({
    where: { id: rfqId },
    include: { company: true, category: true },
  });
  if (!rfq || rfq.companyId !== user.companyId || rfq.status !== "READY") {
    redirect(`/rfq/${rfqId}`);
  }

  const supplierIds = formData.getAll("supplierIds").map(String);
  const extraEmails = String(formData.get("extraEmails") ?? "")
    .split(/[\n,;]+/)
    .map((e) => e.trim())
    .filter((e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e));

  if (supplierIds.length === 0 && extraEmails.length === 0) {
    redirect(`/rfq/${rfqId}?error=${encodeURIComponent("Válassz legalább egy beszállítót vagy adj meg e-mail címet.")}`);
  }

  const limit = await checkInviteLimit(user.companyId, supplierIds.length + extraEmails.length);
  if (!limit.ok) {
    redirect(`/rfq/${rfqId}?error=${encodeURIComponent(limit.error)}`);
  }

  const spec = rfq.spec ? (JSON.parse(rfq.spec) as { summary?: string }) : {};
  const summary = spec.summary ?? rfq.intakeText;
  const deadlineStr = rfq.deadline ? rfq.deadline.toISOString().slice(0, 10) : null;

  // Recompute scores for the audit trail
  const matches = rfq.categoryId
    ? await shortlistSuppliers(rfq.categoryId, rfq.regionId, 100)
    : [];

  for (const supplierId of supplierIds) {
    const supplier = await db.supplierProfile.findUnique({
      where: { id: supplierId },
      include: { company: true },
    });
    if (!supplier) continue;
    const match = matches.find((m) => m.supplierId === supplierId);
    const token = crypto.randomBytes(24).toString("base64url");
    await db.rfqInvite.create({
      data: {
        rfqId: rfq.id,
        supplierId: supplier.id,
        email: supplier.email,
        companyName: supplier.company.name,
        token,
        matchScore: match?.score ?? null,
        matchReason: match?.reason ?? null,
      },
    });
    await db.supplierProfile.update({
      where: { id: supplier.id },
      data: { inviteCount: { increment: 1 } },
    });
    await sendRfqInviteEmail({
      to: supplier.email,
      companyName: supplier.company.name,
      rfqId: rfq.id,
      rfqTitle: rfq.title,
      buyerCompany: rfq.company.name,
      summary,
      deadline: deadlineStr,
      token,
    });
    await notifyCompanyUsers({
      companyId: supplier.companyId,
      type: "RFQ_INVITE",
      message: `Új ajánlatkérés érkezett: ${rfq.title} (${rfq.company.name})`,
      linkUrl: `/r/${token}`,
    });
  }

  for (const email of extraEmails) {
    const token = crypto.randomBytes(24).toString("base64url");
    await db.rfqInvite.create({
      data: {
        rfqId: rfq.id,
        email,
        companyName: email,
        token,
        matchReason: "kézzel hozzáadott külső beszállító",
      },
    });
    await sendRfqInviteEmail({
      to: email,
      companyName: email,
      rfqId: rfq.id,
      rfqTitle: rfq.title,
      buyerCompany: rfq.company.name,
      summary,
      deadline: deadlineStr,
      token,
    });
  }

  await db.rfq.update({ where: { id: rfq.id }, data: { status: "SENT" } });
  await db.auditLog.create({
    data: {
      rfqId: rfq.id,
      actor: user.email,
      event: "RFQ_SENT",
      meta: `${supplierIds.length} hálózati + ${extraEmails.length} külső beszállító`,
    },
  });
  await track("rfq_sent", user.id, {
    invites: supplierIds.length + extraEmails.length,
  });

  revalidatePath(`/rfq/${rfq.id}`);
  redirect(`/rfq/${rfq.id}`);
}

// ---------- Supplier application to an open opportunity ----------

export async function joinOpenRfqAction(formData: FormData) {
  const user = await getSessionUser();
  const profile = user?.company?.supplierProfile;
  if (!user || user.role !== "SUPPLIER" || !profile) {
    redirect("/login?next=/supplier/opportunities");
  }

  const rfqId = String(formData.get("rfqId") ?? "");
  const rfq = await db.rfq.findUnique({ where: { id: rfqId } });
  if (!rfq || rfq.status !== "SENT" || (rfq.deadline && rfq.deadline < new Date())) {
    redirect(
      `/supplier/opportunities?error=${encodeURIComponent("Ez az ajánlatkérés már nem elérhető.")}`,
    );
  }

  const categoryMatch = rfq.categoryId
    ? await db.supplierCategory.findUnique({
        where: { supplierId_categoryId: { supplierId: profile.id, categoryId: rfq.categoryId } },
      })
    : null;
  if (!categoryMatch) {
    redirect(
      `/supplier/opportunities?error=${encodeURIComponent("Ez az ajánlatkérés nem illeszkedik a profilod kategóriáihoz.")}`,
    );
  }

  // Mirror the region filter of findOpenRfqsForSupplier: the listing hides
  // out-of-region RFQs, so a hand-crafted POST must not bypass it either.
  const regionMatch =
    !rfq.regionId ||
    profile.nationwide ||
    Boolean(
      await db.supplierRegion.findUnique({
        where: { supplierId_regionId: { supplierId: profile.id, regionId: rfq.regionId } },
      }),
    );
  if (!regionMatch) {
    redirect(
      `/supplier/opportunities?error=${encodeURIComponent("Ez az ajánlatkérés nem illeszkedik a profilod régióihoz.")}`,
    );
  }

  const existing = await db.rfqInvite.findFirst({
    where: { rfqId: rfq.id, supplierId: profile.id },
  });
  if (existing) redirect(`/r/${existing.token}`);

  const matches = await shortlistSuppliers(rfq.categoryId!, rfq.regionId, 1000);
  const match = matches.find((m) => m.supplierId === profile.id);
  const token = crypto.randomBytes(24).toString("base64url");

  await db.rfqInvite.create({
    data: {
      rfqId: rfq.id,
      supplierId: profile.id,
      email: profile.email,
      companyName: user.company?.name ?? profile.email,
      token,
      source: "SELF",
      matchScore: match?.score ?? null,
      matchReason: match ? `saját jelentkezés – ${match.reason}` : "saját jelentkezés nyílt lehetőségre",
    },
  });
  await db.supplierProfile.update({
    where: { id: profile.id },
    data: { inviteCount: { increment: 1 } },
  });
  await db.auditLog.create({
    data: {
      rfqId: rfq.id,
      actor: profile.email,
      event: "SUPPLIER_JOINED",
      meta: `${user.company?.name ?? profile.email} jelentkezett a nyílt lehetőségre`,
    },
  });

  revalidatePath(`/rfq/${rfq.id}`);
  redirect(`/r/${token}`);
}

// ---------- Supplier reply (public, token-based) ----------

export async function submitOfferAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  if (!rateLimit(`offer:${token}`, 5, 60 * 60 * 1000)) {
    redirect(`/r/${token}?error=${encodeURIComponent(RATE_LIMIT_MESSAGE)}`);
  }
  const invite = await db.rfqInvite.findUnique({
    where: { token },
    include: { rfq: true, supplier: { include: { company: true } } },
  });
  if (!invite || invite.status === "OFFERED") redirect(`/r/${token}`);
  if (invite.rfq.status === "DECIDED" || invite.rfq.status === "CLOSED") redirect(`/r/${token}`);

  const priceNet = Number.parseInt(String(formData.get("priceNet") ?? ""), 10);
  const priceUnit = String(formData.get("priceUnit") ?? "").trim() || "egyösszegű";
  const startDate = String(formData.get("startDate") ?? "").trim() || null;
  const validUntil = String(formData.get("validUntil") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const companyName =
    invite.supplier?.company.name ?? (String(formData.get("companyName") ?? "").trim() || invite.companyName);
  const contactEmail = String(formData.get("contactEmail") ?? "").trim() || invite.email;

  if (!Number.isFinite(priceNet) || priceNet <= 0) {
    redirect(`/r/${token}?error=${encodeURIComponent("Adj meg érvényes nettó árat (Ft).")}`);
  }

  await db.offer.create({
    data: {
      rfqId: invite.rfqId,
      inviteId: invite.id,
      companyName,
      contactEmail,
      priceNet,
      priceUnit,
      startDate,
      validUntil,
      notes,
    },
  });
  await db.rfqInvite.update({
    where: { id: invite.id },
    data: { status: "OFFERED", respondedAt: new Date() },
  });

  if (invite.supplierId && invite.supplier) {
    const hours = (Date.now() - invite.sentAt.getTime()) / 3_600_000;
    const n = invite.supplier.responseCount + 1;
    const prevAvg = invite.supplier.avgResponseHours ?? hours;
    await db.supplierProfile.update({
      where: { id: invite.supplierId },
      data: {
        responseCount: { increment: 1 },
        avgResponseHours: (prevAvg * (n - 1) + hours) / n,
      },
    });
  }

  await db.auditLog.create({
    data: {
      rfqId: invite.rfqId,
      actor: contactEmail,
      event: "OFFER_SUBMITTED",
      meta: `${companyName}: ${priceNet} Ft (${priceUnit})`,
    },
  });

  // Notify the buyer (RFQ creator, or any user of the buyer company)
  const buyerUser = invite.rfq.createdById
    ? await db.user.findUnique({ where: { id: invite.rfq.createdById } })
    : await db.user.findFirst({ where: { companyId: invite.rfq.companyId } });
  if (buyerUser) {
    await sendOfferReceivedEmail({
      to: buyerUser.email,
      rfqId: invite.rfqId,
      rfqTitle: invite.rfq.title,
      supplierCompany: companyName,
      priceText: `${priceNet.toLocaleString("hu-HU")} Ft (${priceUnit})`,
    });
    await notifyUser({
      userId: buyerUser.id,
      type: "OFFER_RECEIVED",
      message: `${companyName} ajánlatot adott: ${invite.rfq.title}`,
      linkUrl: `/rfq/${invite.rfqId}`,
    });
  }

  await track("offer_submitted", contactEmail, { source: invite.source });

  revalidatePath(`/rfq/${invite.rfqId}`);
  redirect(`/r/${token}?ok=1`);
}

export async function declineInviteAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const invite = await db.rfqInvite.findUnique({ where: { token } });
  if (!invite || invite.status === "OFFERED" || invite.status === "DECLINED") redirect(`/r/${token}`);

  await db.rfqInvite.update({
    where: { id: invite.id },
    data: { status: "DECLINED", respondedAt: new Date() },
  });
  await db.auditLog.create({
    data: { rfqId: invite.rfqId, actor: invite.email, event: "INVITE_DECLINED", meta: invite.companyName },
  });
  revalidatePath(`/rfq/${invite.rfqId}`);
  redirect(`/r/${token}`);
}

// ---------- Buyer decision ----------

export async function acceptOfferAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user || user.role !== "BUYER" || !user.companyId) redirect("/login");

  const offerId = String(formData.get("offerId") ?? "");
  const result = await acceptOffer(offerId, {
    id: user.id,
    email: user.email,
    companyId: user.companyId,
  });
  if (!result.ok) redirect("/dashboard");

  revalidatePath(`/rfq/${result.rfqId}`);
  redirect(`/rfq/${result.rfqId}`);
}

export async function compareOffersAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user || user.role !== "BUYER" || !user.companyId) redirect("/login");

  const rfqId = String(formData.get("rfqId") ?? "");
  const rfq = await db.rfq.findUnique({ where: { id: rfqId }, include: { offers: true } });
  if (!rfq || rfq.companyId !== user.companyId || rfq.offers.length === 0) redirect(`/rfq/${rfqId}`);

  const paid = await chargeCredits(
    user.companyId,
    COMPARISON_COST,
    `Procura elemzés – ${rfq.title}`,
  );
  if (!paid) {
    redirect(
      `/rfq/${rfqId}?error=${encodeURIComponent("Nincs elég kredited az elemzéshez. Tölts fel kreditet a Kreditek oldalon.")}`,
    );
  }

  const spec = rfq.spec ? (JSON.parse(rfq.spec) as { summary?: string }) : {};
  const { text, aiUsed } = await compareOffers(
    spec.summary ?? rfq.intakeText,
    rfq.offers.map((o) => ({
      companyName: o.companyName,
      priceNet: o.priceNet,
      priceUnit: o.priceUnit,
      startDate: o.startDate,
      validUntil: o.validUntil,
      notes: o.notes,
    })),
  );

  await db.rfq.update({ where: { id: rfq.id }, data: { aiComparison: text } });
  await db.auditLog.create({
    data: { rfqId: rfq.id, actor: user.email, event: "ANALYSIS_RUN", meta: aiUsed ? "részletes elemzés" : "alap elemzés" },
  });

  revalidatePath(`/rfq/${rfq.id}`);
  redirect(`/rfq/${rfq.id}`);
}

// ---------- Credits ----------

// With Stripe configured (test mode), purchases go through hosted Checkout
// and credits are granted by the webhook on payment. Without Stripe (demo),
// credits are granted immediately.
export async function purchaseCreditsAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user || user.role !== "BUYER" || !user.companyId) redirect("/login?next=/credits");

  const packageId = String(formData.get("packageId") ?? "");
  const pkg = CREDIT_PACKAGES.find((p) => p.id === packageId);
  if (!pkg) redirect("/credits");

  const stripe = getStripe();
  if (stripe) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "huf",
            // Stripe HUF amounts are in fillér and must be divisible by 100
            unit_amount: pkg.priceHuf * 100,
            product_data: { name: `Procura ${pkg.name} – ${pkg.credits} kredit` },
          },
        },
      ],
      success_url: `${baseUrl}/credits?ok=1`,
      cancel_url: `${baseUrl}/credits?canceled=1`,
      metadata: { companyId: user.companyId, packageId: pkg.id },
    });
    redirect(session.url ?? "/credits");
  }

  await grantCredits(
    user.companyId,
    pkg.credits,
    "PURCHASE",
    `${pkg.name} (${pkg.credits} kredit) – demo fizetés`,
  );
  await track("credits_purchased", user.id, { packageId: pkg.id, credits: pkg.credits, mode: "demo" });

  revalidatePath("/credits");
  redirect("/credits?ok=1");
}

// With Stripe configured (test mode), the upgrade goes through hosted
// Checkout in subscription mode and the webhook flips the plan. Without
// Stripe (demo), the plan flips immediately.
export async function upgradeToProAction() {
  const user = await getSessionUser();
  if (!user || user.role !== "BUYER" || !user.companyId) redirect("/login?next=/pricing");

  const company = await db.company.findUniqueOrThrow({ where: { id: user.companyId } });
  if (company.plan === "PRO") redirect("/pricing?pro=1");

  const stripe = getStripe();
  if (stripe) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "huf",
            unit_amount: 4990 * 100,
            recurring: { interval: "month" },
            product_data: { name: "Procura Pro előfizetés" },
          },
        },
      ],
      success_url: `${baseUrl}/pricing?pro=1`,
      cancel_url: `${baseUrl}/pricing?canceled=1`,
      metadata: { companyId: user.companyId },
    });
    redirect(session.url ?? "/pricing");
  }

  await db.company.update({ where: { id: user.companyId }, data: { plan: "PRO" } });
  await track("pro_upgraded", user.id, { mode: "demo" });
  revalidatePath("/pricing");
  redirect("/pricing?pro=1");
}

// ---------- Notifications ----------

export async function markAllNotificationsReadAction() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/notifications");

  await db.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  });

  revalidatePath("/notifications");
  revalidatePath("/", "layout");
  redirect("/notifications");
}

// ---------- Admin ----------

export async function toggleUserActiveAction(formData: FormData) {
  const admin = await getSessionUser();
  if (!admin || admin.role !== "ADMIN") redirect("/login?next=/admin");

  const userId = String(formData.get("userId") ?? "");
  if (userId === admin.id) redirect("/admin/users");

  const target = await db.user.findUnique({ where: { id: userId } });
  if (target) {
    await db.user.update({ where: { id: userId }, data: { active: !target.active } });
    await db.auditLog.create({
      data: {
        actor: admin.email,
        event: target.active ? "USER_DEACTIVATED" : "USER_REACTIVATED",
        meta: target.email,
      },
    });
  }

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function deleteApiKeyAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user || !user.companyId) redirect("/login?next=/account");

  const apiKeyId = String(formData.get("apiKeyId") ?? "");
  await db.apiKey.deleteMany({ where: { id: apiKeyId, companyId: user.companyId } });

  revalidatePath("/account");
  redirect("/account");
}

// GDPR erasure: personal data is removed/anonymized immediately; business
// records (RFQs, offers, audit trail) are retained per the terms, detached
// from the person via anonymization.
export async function deleteAccountAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/account");

  const confirmation = String(formData.get("confirmEmail") ?? "").trim().toLowerCase();
  if (confirmation !== user.email) {
    redirect(`/account?error=${encodeURIComponent("A megerősítéshez írd be pontosan a fiók e-mail címét.")}`);
  }

  await db.notification.deleteMany({ where: { userId: user.id } });
  await db.user.update({
    where: { id: user.id },
    data: {
      email: `deleted-${user.id}@anonim.procura.hu`,
      name: "Törölt felhasználó",
      passwordHash: crypto.randomBytes(32).toString("hex"),
      active: false,
    },
  });
  await db.auditLog.create({
    data: { actor: `deleted-${user.id}`, event: "ACCOUNT_DELETED", meta: user.role },
  });

  await destroySession();
  redirect("/?deleted=1");
}

// ---------- Supplier profile ----------

export async function updateSupplierProfileAction(formData: FormData) {
  const user = await getSessionUser();
  const profile = user?.company?.supplierProfile;
  if (!user || user.role !== "SUPPLIER" || !profile) redirect("/login");

  const categoryIds = formData.getAll("categories").map(String);
  const regionIds = formData.getAll("regions").map(String);

  await db.supplierProfile.update({
    where: { id: profile.id },
    data: {
      phone: String(formData.get("phone") ?? "").trim() || null,
      website: String(formData.get("website") ?? "").trim() || null,
      description: String(formData.get("description") ?? "").trim() || null,
      certifications: String(formData.get("certifications") ?? "").trim() || null,
      nationwide: formData.get("nationwide") === "on",
    },
  });
  await db.supplierCategory.deleteMany({ where: { supplierId: profile.id } });
  await db.supplierRegion.deleteMany({ where: { supplierId: profile.id } });
  if (categoryIds.length > 0) {
    await db.supplierCategory.createMany({
      data: categoryIds.map((categoryId) => ({ supplierId: profile.id, categoryId })),
    });
  }
  if (regionIds.length > 0) {
    await db.supplierRegion.createMany({
      data: regionIds.map((regionId) => ({ supplierId: profile.id, regionId })),
    });
  }

  revalidatePath("/supplier/profile");
  redirect("/supplier/profile?ok=1");
}
