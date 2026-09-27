import { redirect } from "next/navigation";
import { t } from "@/i18n";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";
import { getCurrentUser } from "@/lib/auth";

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  if (await getCurrentUser()) redirect("/profile");
  const { role } = await searchParams;
  return (
    <AuthShell
      title={t.auth.signupTitle}
      subtitle={t.auth.signupSubtitle}
      switchText={t.auth.haveAccount}
      switchHref="/login"
      switchLabel={t.auth.goLogin}
    >
      <AuthForm mode="signup" defaultRole={role === "employer" ? "employer" : "candidate"} />
    </AuthShell>
  );
}
