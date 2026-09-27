import Link from "next/link";
import { t } from "@/i18n";
import { buttonVariants } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

// Placeholder honesto até a Fase 2 (cadastro e login).
export default function SignupPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-start justify-center gap-4 px-4 py-20 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight">{t.comingSoon.title}</h1>
        <p className="text-lg text-muted-foreground">{t.comingSoon.body}</p>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          {t.comingSoon.back}
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
