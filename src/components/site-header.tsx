import Link from "next/link";
import { t } from "@/i18n";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="text-lg font-bold tracking-tight text-foreground">
          {t.brand}
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1 sm:gap-2">
          <Link href="/#how" className="hidden rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground sm:block">
            {t.nav.howItWorks}
          </Link>
          <Link href="/#employers" className="hidden rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground sm:block">
            {t.nav.employers}
          </Link>
          <Link href="/signup" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-10")}>
            {t.nav.signIn}
          </Link>
        </nav>
      </div>
    </header>
  );
}
