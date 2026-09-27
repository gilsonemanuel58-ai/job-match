import { redirect } from "next/navigation";
import { t } from "@/i18n";
import { getCurrentUser } from "@/lib/auth";
import { getProfile } from "@/lib/profile";
import { profileToValues } from "@/lib/profile-values";
import { PageShell } from "@/components/page-shell";
import { CandidateForm } from "@/components/candidate-form";
import { EmployerForm } from "@/components/employer-form";

export default async function EditProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const profile = await getProfile(user.id);
  if (!profile) redirect("/onboarding");

  const initial = profileToValues(profile);
  return (
    <PageShell title={t.profile.edit}>
      {profile.role === "candidate" ? <CandidateForm initial={initial} /> : <EmployerForm initial={initial} />}
    </PageShell>
  );
}
