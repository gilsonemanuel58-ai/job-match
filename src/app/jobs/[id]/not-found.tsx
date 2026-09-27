import Link from "next/link";
import { t } from "@/i18n";
import { buttonVariants } from "@/components/ui/button";
import { PageShell } from "@/components/page-shell";

export default function JobNotFound() {
  return (
    <PageShell title={t.jobs.detail.notFoundTitle} subtitle={t.jobs.detail.notFoundBody}>
      <Link href="/jobs" className={buttonVariants({ variant: "outline", className: "w-fit" })}>
        {t.jobs.back}
      </Link>
    </PageShell>
  );
}
