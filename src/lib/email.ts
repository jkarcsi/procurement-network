import { Resend } from "resend";
import { db } from "./db";

// Email layer with two delivery modes:
//  - RESEND_API_KEY set: delivered via Resend AND recorded in EmailOutbox
//    (the outbox doubles as a sent-mail audit log, visible on /outbox)
//  - no key (dev/demo): outbox only, reply links are opened from /outbox
// A provider failure never breaks the calling flow — the outbox record is
// the source of truth and the error is logged.
// Email bodies are Hungarian — the product targets the Hungarian market.

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const EMAIL_FROM = process.env.EMAIL_FROM || "Procura <onboarding@resend.dev>";

const FOOTER = ["", "Üdvözlettel,", "Procura – B2B beszerzési hálózat"];

export function replyUrl(token: string): string {
  return `${BASE_URL}/r/${token}`;
}

async function sendEmail(params: {
  to: string;
  subject: string;
  lines: (string | null)[];
  rfqId?: string;
}) {
  const body = params.lines.filter((line) => line !== null).join("\n");

  await db.emailOutbox.create({
    data: { to: params.to, subject: params.subject, body, rfqId: params.rfqId ?? null },
  });

  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { error } = await resend.emails.send({
        from: EMAIL_FROM,
        to: params.to,
        subject: params.subject,
        text: body,
      });
      if (error) throw error;
      console.log(`[email resend] -> ${params.to}: ${params.subject}`);
      return;
    } catch (err) {
      console.error(`[email resend] failed for ${params.to}, outbox record kept:`, err);
    }
  }
  console.log(`[email outbox] -> ${params.to}: ${params.subject}`);
}

export async function sendRfqInviteEmail(params: {
  to: string;
  companyName: string;
  rfqId: string;
  rfqTitle: string;
  buyerCompany: string;
  summary: string;
  deadline: string | null;
  token: string;
}) {
  await sendEmail({
    to: params.to,
    subject: `Ajánlatkérés: ${params.rfqTitle}`,
    rfqId: params.rfqId,
    lines: [
      `Tisztelt ${params.companyName}!`,
      ``,
      `${params.buyerCompany} ajánlatkérést küldött Önöknek a Procura B2B beszerzési hálózaton keresztül.`,
      ``,
      `Tárgy: ${params.rfqTitle}`,
      `Összefoglaló: ${params.summary}`,
      params.deadline ? `Ajánlattételi határidő: ${params.deadline}` : null,
      ``,
      `Az ajánlatkérés részletei és az ajánlattétel regisztráció nélkül, egy kattintással elérhető itt:`,
      replyUrl(params.token),
      ...FOOTER,
    ],
  });
}

export async function sendOfferReceivedEmail(params: {
  to: string;
  rfqId: string;
  rfqTitle: string;
  supplierCompany: string;
  priceText: string;
}) {
  await sendEmail({
    to: params.to,
    subject: `Új ajánlat érkezett: ${params.rfqTitle}`,
    rfqId: params.rfqId,
    lines: [
      `Kedves Ajánlatkérő!`,
      ``,
      `${params.supplierCompany} ajánlatot adott a(z) „${params.rfqTitle}” ajánlatkérésedre.`,
      `Ajánlott ár: ${params.priceText}`,
      ``,
      `Az összes beérkezett ajánlatot összehasonlítható formában itt találod:`,
      `${BASE_URL}/rfq/${params.rfqId}`,
      ...FOOTER,
    ],
  });
}

export async function sendOfferAcceptedEmail(params: {
  to: string;
  rfqId: string;
  rfqTitle: string;
  supplierCompany: string;
  buyerCompany: string;
  token: string | null;
}) {
  await sendEmail({
    to: params.to,
    subject: `Elfogadták az ajánlatát: ${params.rfqTitle}`,
    rfqId: params.rfqId,
    lines: [
      `Tisztelt ${params.supplierCompany}!`,
      ``,
      `Örömmel értesítjük: ${params.buyerCompany} elfogadta az ajánlatukat a(z) „${params.rfqTitle}” ajánlatkérésre.`,
      `Az ajánlatkérő hamarosan felveszi Önökkel a kapcsolatot a részletek egyeztetéséhez.`,
      params.token ? `` : null,
      params.token ? `Az ajánlat részletei itt tekinthetők meg:` : null,
      params.token ? replyUrl(params.token) : null,
      ...FOOTER,
    ],
  });
}
