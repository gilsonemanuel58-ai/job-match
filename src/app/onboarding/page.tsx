import { redirect } from "next/navigation";
import { t } from "@/i18n";
import { getCurrentUser } from "@/lib/auth";
import { getProfile } from "@/lib/profile";
import { PageShell } from "@/components/page-shell";
import { CandidateForm } from "@/components/candidate-form";
import { EmployerForm } from "@/components/employer-form";

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (await getProfile(user.id)) redirect("/profile");

  // Tipo escolhido no cadastro (link mágico). Sem escolha: candidato.
  const isEmployer = user.user_metadata?.role === "employer";

  return isEmployer ? (
    <PageShell title={t.onboarding.employerTitle} subtitle={t.onboarding.employerSubtitle}>
      <EmployerForm initial={{}} />
    </PageShell>
  ) : (
    <PageShell title={t.onboarding.title} subtitle={t.onboarding.subtitle}>
      <CandidateForm initial={{}} />
    </PageShell>
  );
}
