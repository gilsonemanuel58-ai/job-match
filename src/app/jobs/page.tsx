import type { Metadata } from "next";
import Link from "next/link";
import { SearchX, TriangleAlert } from "lucide-react";
import { t } from "@/i18n";
import { cleanFilters, listJobs } from "@/lib/jobs";
import { buttonVariants } from "@/components/ui/button";
import { JobCard } from "@/components/job-card";
import { JobFiltersForm } from "@/components/job-filters";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = { title: "Jobs — Job Match" };

export default async function JobsPage({ searchParams }: PageProps<"/jobs">) {
  const filters = cleanFilters(await searchParams);
  const { jobs, error } = await listJobs(filters);
  const hasDemo = jobs.some((j) => j.isDemo);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">{t.jobs.title}</h1>
          <p className="text-base text-muted-foreground">{t.jobs.subtitle}</p>
        </div>

        <JobFiltersForm filters={filters} />

        {hasDemo && (
          <p className="rounded-md bg-warning-soft px-4 py-3 text-sm font-medium text-warning">{t.jobs.demoNotice}</p>
        )}

        {error ? (
          <div role="alert" className="flex flex-col items-start gap-2 rounded-md border border-border bg-card p-8">
            <TriangleAlert aria-hidden className="size-6 text-destructive" />
            <h2 className="text-lg font-semibold">{t.jobs.errorTitle}</h2>
            <p className="text-muted-foreground">{t.jobs.errorBody}</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-start gap-3 rounded-md border border-border bg-card p-8">
            <SearchX aria-hidden className="size-6 text-muted-foreground" />
            <h2 className="text-lg font-semibold">{t.jobs.emptyTitle}</h2>
            <p className="text-muted-foreground">{t.jobs.emptyBody}</p>
            <Link href="/jobs" className={buttonVariants({ variant: "outline" })}>
              {t.jobs.clear}
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm font-medium text-muted-foreground" aria-live="polite">
              {t.jobs.count(jobs.length)}
            </p>
            <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <li key={job.id} className="flex">
                  <JobCard job={job} href={`/jobs/${job.id}`} className="w-full" />
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
