import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { signSessionToken } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { apiError } from "@/lib/apiAuth";

// Mobile sign-in: email + password → bearer session token. The token is
// stored in the device's secure storage and gated by biometrics in the app.
export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return apiError(400, "Invalid JSON body");
  }
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`mobile-login:${ip}:${email}`, 5, 5 * 60 * 1000)) {
    return apiError(429, "Túl sok próbálkozás. Várj néhány percet, és próbáld újra.");
  }

  const user = await db.user.findUnique({ where: { email }, include: { company: true } });
  if (!user || !user.active || !(await bcrypt.compare(password, user.passwordHash))) {
    return apiError(401, "Hibás e-mail cím vagy jelszó.");
  }

  return Response.json({
    token: signSessionToken(user.id),
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    company: user.company
      ? {
          id: user.company.id,
          name: user.company.name,
          type: user.company.type,
          plan: user.company.plan,
          creditBalance: user.company.creditBalance,
        }
      : null,
  });
}
