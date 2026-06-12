import { generateRegistrationOptions } from "@simplewebauthn/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { rpName, rpID, storeChallenge } from "@/lib/passkeys";

export async function POST() {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const existing = await db.passkey.findMany({ where: { userId: user.id } });
  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userName: user.email,
    userDisplayName: user.name,
    userID: new TextEncoder().encode(user.id),
    attestationType: "none",
    excludeCredentials: existing.map((p) => ({ id: p.id })),
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
    },
  });
  await storeChallenge(options.challenge);
  return Response.json(options);
}
