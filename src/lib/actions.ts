"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { createSession, destroySession, getSessionUser } from "./auth";
import { clarifyIntake, buildSpec, compareOffers, type ClarifyResult, type QA } from "./ai";
import { shortlistSuppliers } from "./matching";
import { sendRfqInviteEmail, sendOfferReceivedEmail, sendOfferAcceptedEmail } from "./email";
import { chargeCredits, grantCredits, COMPARISON_COST, WELCOME_BONUS, CREDIT_PACKAGES } from "./credits";
import { getStripe } from "./stripe";
import { checkRfqCreationLimit, checkInviteLimit } from "./limits";

// ---------- Auth ----------

export async function registerAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const companyName = String(formData.get("companyName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = formData.get("role") === "SUPPLIER" ? "SUPPLIER" : "BUYER";

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
  await createSession(user.id);
  redirect(role === "SUPPLIER" ? "/supplier/profile" : "/dashboard");
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  const user = await db.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    redirect("/login?error=" + encodeURIComponent("Hibás e-mail cím vagy jelszó.") + (next ? `&next=${encodeURIComponent(next)}` : ""));
  }
  await createSession(user.id);
  if (next && next.startsWith("/")) redirect(next);
  redirect(user.role === "SUPPLIER" ? "/supplier" : "/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

// ---------- RFQ intake / creation ----------

export async function clarifyRfqAction(intakeText: string): Promise<ClarifyResult | { error: string }> {
  const user = await getSessionUser();
  if (!user || user.role !== "BUYER") return { error: "Bejelentkezés szükséges (vevői fiókkal)." };
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
  }

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
  const offer = await db.offer.findUnique({
    where: { id: offerId },
    include: { rfq: { include: { company: true } }, invite: true },
  });
  if (!offer || offer.rfq.companyId !== user.companyId) redirect("/dashboard");

  await db.offer.update({ where: { id: offer.id }, data: { status: "ACCEPTED" } });
  await db.offer.updateMany({
    where: { rfqId: offer.rfqId, id: { not: offer.id } },
    data: { status: "REJECTED" },
  });
  await db.rfq.update({ where: { id: offer.rfqId }, data: { status: "DECIDED" } });
  await db.auditLog.create({
    data: {
      rfqId: offer.rfqId,
      actor: user.email,
      event: "OFFER_ACCEPTED",
      meta: `${offer.companyName}: ${offer.priceNet} Ft (${offer.priceUnit})`,
    },
  });

  await sendOfferAcceptedEmail({
    to: offer.contactEmail,
    rfqId: offer.rfqId,
    rfqTitle: offer.rfq.title,
    supplierCompany: offer.companyName,
    buyerCompany: offer.rfq.company.name,
    token: offer.invite?.token ?? null,
  });

  revalidatePath(`/rfq/${offer.rfqId}`);
  redirect(`/rfq/${offer.rfqId}`);
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

  revalidatePath("/credits");
  redirect("/credits?ok=1");
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
