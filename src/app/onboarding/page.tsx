import Link from "next/link";
import { redirect } from "next/navigation";
import { t } from "@/i18n";
import { getCurrentUser } from "@/lib/auth";
import { getProfile } from "@/lib/profile";
import { PageShell } from "@/components/page-shell";
import { CandidateForm } from "@/components/candidate-form";
import { EmployerForm } from "@/components/employer-form";

export default async function OnboardingPage({ searchParams }: PageProps<"/onboarding">) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (await getProfile(user.id)) redirect("/profile");

  // Tipo escolhido no cadastro (link mágico). Sem escolha: candidato.
  const { as } = await searchParams;
  const isEmployer = as ? as === "employer" : user.user_metadata?.role === "employer";
  const switchLink = (
    <Link href={`/onboarding?as=${isEmployer ? "candidate" : "employer"}`} className="-mt-4 w-fit text-sm font-medium text-primary underline-offset-4 hover:underline">
      {isEmployer ? t.onboarding.switchToCandidate : t.onboarding.switchToEmployer}
    </Link>
  );

  return isEmployer ? (
    <PageShell title={t.onboarding.employerTitle} subtitle={t.onboarding.employerSubtitle}>
      {switchLink}
      <EmployerForm initial={{}} />
    </PageShell>
  ) : (
    <PageShell title={t.onboarding.title} subtitle={t.onboarding.subtitle}>
      {switchLink}
      <CandidateForm initial={{}} />
    </PageShell>
  );
}
