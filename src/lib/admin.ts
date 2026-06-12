import { redirect } from "next/navigation";
import { getSessionUser } from "./auth";

// Every /admin page calls this itself (project convention: no middleware).
export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") redirect("/login?next=/admin");
  return user;
}
