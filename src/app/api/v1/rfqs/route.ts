import { db } from "@/lib/db";
import { authenticateApiKey, apiError } from "@/lib/apiAuth";
import { buildSpec } from "@/lib/ai";
import { checkRfqCreationLimit } from "@/lib/limits";
import { RFQ_STATUS } from "@/lib/format";

function serializeRfq(rfq: {
  id: string;
  title: string;
  status: string;
  categoryId: string | null;
  regionId: string | null;
  deadline: Date | null;
  createdAt: Date;
}) {
  return {
    id: rfq.id,
    title: rfq.title,
    status: rfq.status,
    categoryId: rfq.categoryId,
    regionId: rfq.regionId,
    deadline: rfq.deadline?.toISOString() ?? null,
    createdAt: rfq.createdAt.toISOString(),
  };
}

export async function GET(req: Request) {
  const auth = await authenticateApiKey(req);
  if (!auth.ok) return apiError(auth.status, auth.message);
  const company = auth.company;

  const status = new URL(req.url).searchParams.get("status") ?? undefined;
  const rfqs = await db.rfq.findMany({
    where: { companyId: company.id, ...(status && RFQ_STATUS[status] ? { status } : {}) },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return Response.json({ data: rfqs.map(serializeRfq) });
}

export async function POST(req: Request) {
  const auth = await authenticateApiKey(req);
  if (!auth.ok) return apiError(auth.status, auth.message);
  const company = auth.company;
  if (company.type !== "BUYER") return apiError(403, "Only buyer companies can create RFQs");

  const limit = await checkRfqCreationLimit(company.id);
  if (!limit.ok) return apiError(403, limit.error);

  let body: { title?: string; intakeText?: string; categoryId?: string; regionId?: string; deadline?: string };
  try {
    body = await req.json();
  } catch {
    return apiError(400, "Invalid JSON body");
  }
  const intakeText = String(body.intakeText ?? "").trim();
  if (intakeText.length < 10) return apiError(400, "intakeText must be at least 10 characters");

  const deadline = body.deadline ? new Date(body.deadline) : null;
  if (deadline && Number.isNaN(deadline.getTime())) {
    return apiError(400, "deadline must be a valid date (YYYY-MM-DD)");
  }

  const category = body.categoryId
    ? await db.category.findUnique({ where: { id: body.categoryId } })
    : null;
  const region = body.regionId ? await db.region.findUnique({ where: { id: body.regionId } }) : null;

  const { spec } = await buildSpec(intakeText, [], category?.name ?? null, region?.name ?? null);
  const rfq = await db.rfq.create({
    data: {
      companyId: company.id,
      intakeText,
      title: String(body.title ?? "").trim() || intakeText.slice(0, 80),
      categoryId: category?.id ?? null,
      regionId: region?.id ?? null,
      deadline,
      spec: JSON.stringify(spec),
      status: "READY",
      auditLogs: { create: { actor: `api:${company.name}`, event: "RFQ_CREATED", meta: intakeText } },
    },
  });
  return Response.json({ data: serializeRfq(rfq) }, { status: 201 });
}
