import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { rpID, storeChallenge } from "@/lib/passkeys";

// Public: usernameless (discoverable credential) sign-in. The browser offers
// the locally stored passkeys; we identify the user from the credential id
// in the verify step.
export async function POST() {
  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: "preferred",
  });
  await storeChallenge(options.challenge);
  return Response.json(options);
}
