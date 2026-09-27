import { redirect } from "next/navigation";
import { t } from "@/i18n";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  if (await getCurrentUser()) redirect("/profile");
  const { error } = await searchParams;
  return (
    <AuthShell
      title={t.auth.loginTitle}
      subtitle={t.auth.loginSubtitle}
      switchText={t.auth.noAccount}
      switchHref="/signup"
      switchLabel={t.auth.goSignup}
    >
      <AuthForm mode="login" linkError={error === "link"} />
    </AuthShell>
  );
}
