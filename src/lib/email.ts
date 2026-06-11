import { db } from "./db";

// Demo e-mail réteg: a leveleket az EmailOutbox táblába írja, a /outbox
// oldalon megtekinthetők. Éles bevezetésnél itt cserélhető valós providerre
// (pl. Resend, SES) ugyanazzal az interfésszel.

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export function replyUrl(token: string): string {
  return `${BASE_URL}/r/${token}`;
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
  const subject = `Ajánlatkérés: ${params.rfqTitle}`;
  const body = [
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
    ``,
    `Üdvözlettel,`,
    `Procura – AI-támogatott B2B beszerzési hálózat`,
  ]
    .filter((line) => line !== null)
    .join("\n");

  await db.emailOutbox.create({
    data: { to: params.to, subject, body, rfqId: params.rfqId },
  });
  console.log(`[email outbox] -> ${params.to}: ${subject}`);
}
