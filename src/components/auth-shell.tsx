import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  switchText: string;
  switchHref: string;
  switchLabel: string;
}

/** Moldura comum das telas de login e cadastro. */
export function AuthShell({ title, subtitle, children, switchText, switchHref, switchLabel }: AuthShellProps) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-12 sm:py-16">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="text-base text-muted-foreground">{subtitle}</p>
        </div>
        {children}
        <p className="text-sm text-muted-foreground">
          {switchText}{" "}
          <Link href={switchHref} className="font-semibold text-primary underline-offset-4 hover:underline">
            {switchLabel}
          </Link>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
