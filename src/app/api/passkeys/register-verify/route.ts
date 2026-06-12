import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { rpID, expectedOrigin, consumeChallenge } from "@/lib/passkeys";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const expectedChallenge = await consumeChallenge();
  if (!expectedChallenge) {
    return Response.json({ error: "challenge expired" }, { status: 400 });
  }

  const body = await req.json();
  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: body.response,
      expectedChallenge,
      expectedOrigin,
      expectedRPID: rpID,
    });
  } catch {
    return Response.json({ error: "verification failed" }, { status: 400 });
  }
  if (!verification.verified || !verification.registrationInfo) {
    return Response.json({ error: "not verified" }, { status: 400 });
  }

  const { credential } = verification.registrationInfo;
  await db.passkey.create({
    data: {
      id: credential.id,
      userId: user.id,
      publicKey: Buffer.from(credential.publicKey).toString("base64url"),
      counter: credential.counter,
      transports: credential.transports?.join(",") ?? null,
      name: String(body.name ?? "").trim() || "Passkey",
    },
  });

  return Response.json({ verified: true });
}
