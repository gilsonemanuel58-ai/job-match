import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, Plus } from "lucide-react";
import { t } from "@/i18n";
import { cn } from "@/lib/utils";
import { requireEmployer } from "@/lib/employer";
import { listCompanyJobs } from "@/lib/applications";
import { buttonVariants } from "@/components/ui/button";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = { title: "Your jobs — Job Match" };

const e = t.employer;

export default async function EmployerDashboard() {
  const { company } = await requireEmployer();
  const jobs = await listCompanyJobs(company.id);

  return (
    <PageShell title={e.dashboardTitle} subtitle={e.dashboardSubtitle(company.name)}>
      <Link href="/employer/jobs/new" className={buttonVariants({ size: "lg", className: "w-fit" })}>
        <Plus aria-hidden />
        {e.postJob}
      </Link>

      {jobs.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-md border border-border bg-card p-8">
          <Briefcase aria-hidden className="size-6 text-muted-foreground" />
          <h2 className="text-lg font-semibold">{e.emptyTitle}</h2>
          <p className="text-muted-foreground">{e.emptyBody}</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {jobs.map((job) => (
            <li key={job.id} className="flex flex-col gap-3 rounded-md border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-1">
                <span className="font-semibold">{job.title}</span>
                <p className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
                  <span className={cn("rounded-sm px-1.5 py-0.5 text-xs font-semibold", job.open ? "bg-success-soft text-success" : "bg-muted")}>
                    {job.open ? e.open : e.closed}
                  </span>
                  {t.regions[job.region]} · {e.applicants(job.applicants)}
                </p>
              </div>
              <Link href={`/employer/jobs/${job.id}`} className={buttonVariants({ variant: "outline" })}>
                {e.manage}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
