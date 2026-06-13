import { db } from "@/lib/db";
import { authenticateBearer, apiError } from "@/lib/apiAuth";
import { CREDIT_PACKAGES, COMPARISON_COST } from "@/lib/credits";

// Credit balance, packages, and recent ledger for the mobile app.
export async function GET(req: Request) {
  const auth = await authenticateBearer(req);
  if (!auth.ok) return apiError(auth.status, auth.message);

  const [company, transactions] = await Promise.all([
    db.company.findUniqueOrThrow({ where: { id: auth.company.id } }),
    db.creditTransaction.findMany({
      where: { companyId: auth.company.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  return Response.json({
    balance: company.creditBalance,
    comparisonCost: COMPARISON_COST,
    packages: CREDIT_PACKAGES,
    transactions: transactions.map((t) => ({
      id: t.id,
      amount: t.amount,
      balanceAfter: t.balanceAfter,
      type: t.type,
      description: t.description,
      createdAt: t.createdAt.toISOString(),
    })),
  });
}
