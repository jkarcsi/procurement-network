import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

// GDPR data portability: everything we store about the signed-in user and
// their company, as a downloadable JSON file.
export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const [rfqs, supplierData, creditLedger, notifications, apiKeys] = await Promise.all([
    user.companyId
      ? db.rfq.findMany({
          where: { companyId: user.companyId },
          include: { questions: true, invites: true, offers: true, auditLogs: true },
        })
      : Promise.resolve([]),
    user.company?.supplierProfile
      ? db.supplierProfile.findUnique({
          where: { id: user.company.supplierProfile.id },
          include: {
            categories: { include: { category: true } },
            regions: { include: { region: true } },
            invites: { include: { offer: true } },
          },
        })
      : Promise.resolve(null),
    user.companyId
      ? db.creditTransaction.findMany({ where: { companyId: user.companyId } })
      : Promise.resolve([]),
    db.notification.findMany({ where: { userId: user.id } }),
    user.companyId
      ? db.apiKey.findMany({
          where: { companyId: user.companyId },
          select: { name: true, createdAt: true, lastUsedAt: true },
        })
      : Promise.resolve([]),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    user: { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt },
    company: user.company
      ? { id: user.company.id, name: user.company.name, type: user.company.type, plan: user.company.plan, creditBalance: user.company.creditBalance }
      : null,
    rfqs,
    supplierProfile: supplierData,
    creditLedger,
    notifications,
    apiKeys,
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="procura-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
