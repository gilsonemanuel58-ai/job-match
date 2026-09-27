import Link from "next/link";
import { t } from "@/i18n";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="text-lg font-bold tracking-tight text-foreground">
          {t.brand}
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1 sm:gap-2">
          <Link href="/jobs" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            {t.nav.jobs}
          </Link>
          <Link href="/#how" className="hidden rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground lg:block">
            {t.nav.howItWorks}
          </Link>
          <Link href="/#employers" className="hidden rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground sm:block">
            {t.nav.employers}
          </Link>
          <Link href={user ? "/profile" : "/login"} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-10")}>
            {user ? t.nav.myProfile : t.nav.signIn}
          </Link>
        </nav>
      </div>
    </header>
  );
}
