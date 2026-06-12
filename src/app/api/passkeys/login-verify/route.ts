import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { createSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { rpID, expectedOrigin, consumeChallenge } from "@/lib/passkeys";

export async function POST(req: Request) {
  const expectedChallenge = await consumeChallenge();
  if (!expectedChallenge) {
    return Response.json({ error: "challenge expired" }, { status: 400 });
  }

  const body = await req.json();
  const credentialId = String(body.response?.id ?? "");
  const passkey = await db.passkey.findUnique({
    where: { id: credentialId },
    include: { user: true },
  });
  if (!passkey) return Response.json({ error: "unknown credential" }, { status: 400 });
  if (!passkey.user.active) return Response.json({ error: "account disabled" }, { status: 403 });

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response: body.response,
      expectedChallenge,
      expectedOrigin,
      expectedRPID: rpID,
      credential: {
        id: passkey.id,
        publicKey: new Uint8Array(Buffer.from(passkey.publicKey, "base64url")),
        counter: passkey.counter,
        transports: passkey.transports
          ? (passkey.transports.split(",") as AuthenticatorTransport[])
          : undefined,
      },
    });
  } catch {
    return Response.json({ error: "verification failed" }, { status: 400 });
  }
  if (!verification.verified) {
    return Response.json({ error: "not verified" }, { status: 400 });
  }

  await db.passkey.update({
    where: { id: passkey.id },
    data: { counter: verification.authenticationInfo.newCounter, lastUsedAt: new Date() },
  });
  await createSession(passkey.userId);

  return Response.json({
    verified: true,
    redirect: passkey.user.role === "SUPPLIER" ? "/supplier" : "/dashboard",
  });
}
