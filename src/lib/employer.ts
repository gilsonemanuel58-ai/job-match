import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getProfile } from "@/lib/profile";

/** Garante empresa logada com perfil de negócio. Devolve usuário e empresa, ou redireciona. */
export async function requireEmployer() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const profile = await getProfile(user.id);
  if (!profile) redirect("/onboarding");
  if (profile.role !== "employer") redirect("/applications");
  if (!profile.company) redirect("/profile/edit");
  return { user, company: profile.company };
}
