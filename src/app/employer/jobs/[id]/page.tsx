import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Users } from "lucide-react";
import { t } from "@/i18n";
import { cn } from "@/lib/utils";
import { requireEmployer } from "@/lib/employer";
import { APPLICATION_STATUSES, getEmployerJob, type Applicant } from "@/lib/applications";
import { setJobOpen, updateApplicationStatus } from "@/app/applications/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { PageShell } from "@/components/page-shell";
import { StatusBadge } from "@/components/status-badge";

export const metadata: Metadata = { title: "Manage job — Job Match" };

const e = t.employer;
const fmt = new Intl.DateTimeFormat("en-IE", { day: "numeric", month: "short" });

function label<K extends string>(labels: Record<K, string>, key: string | null) {
  return key && key in labels ? labels[key as K] : t.profile.notSet;
}

function ApplicantCard({ a, jobId }: { a: Applicant; jobId: string }) {
  const facts: [string, string][] = [
    [t.profile.fields.visa, label(t.visaStatus, a.visa)],
    [t.profile.fields.english, label(t.english, a.english)],
    [t.profile.fields.region, label(t.regions, a.region)],
    [t.profile.fields.employmentType, label(t.employmentType, a.employmentType)],
    [t.profile.fields.shifts, a.shifts.map((s) => label(t.shifts, s)).join(", ") || t.profile.notSet],
    [t.profile.fields.availableFrom, a.availableFrom ? fmt.format(new Date(a.availableFrom + "T12:00:00")) : t.profile.notSet],
  ];
  return (
    <li className="flex flex-col gap-4 rounded-md border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="font-semibold">{a.name}</span>
          {a.email && (
            <a href={`mailto:${a.email}`} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
              <Mail aria-hidden className="size-4" />
              {a.email}
            </a>
          )}
          <span className="text-xs text-muted-foreground">{e.appliedOn(fmt.format(new Date(a.appliedAt)))}</span>
        </div>
        <StatusBadge status={a.status} />
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
        {facts.map(([k, v]) => (
          <div key={k} className="flex flex-col">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="font-medium">{v}</dd>
          </div>
        ))}
      </dl>
      <form action={updateApplicationStatus} className="flex flex-wrap items-end gap-2 border-t border-border pt-3">
        <input type="hidden" name="applicationId" value={a.applicationId} />
        <input type="hidden" name="jobId" value={jobId} />
        <div className="flex flex-col gap-1">
          <label htmlFor={`status-${a.applicationId}`} className="text-sm font-medium">
            {e.changeStatus}
          </label>
          <select
            id={`status-${a.applicationId}`}
            name="status"
            defaultValue={a.status}
            className="h-10 rounded-md border border-input bg-card px-3 text-base md:text-sm"
          >
            {APPLICATION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {t.applications.status[s]}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" variant="outline" className="h-10">
          {e.save}
        </Button>
      </form>
    </li>
  );
}

export default async function ManageJobPage({ params }: PageProps<"/employer/jobs/[id]">) {
  const { company } = await requireEmployer();
  const job = await getEmployerJob((await params).id, company.id);
  if (!job) notFound();

  return (
    <PageShell title={job.title} subtitle={`${company.name} · ${t.regions[job.region]}`}>
      <Link href="/employer" className="-mt-4 flex w-fit items-center gap-1.5 text-sm font-medium text-primary hover:underline">
        <ArrowLeft aria-hidden className="size-4" />
        {e.backToDashboard}
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <span className={cn("rounded-sm px-2 py-1 text-sm font-semibold", job.open ? "bg-success-soft text-success" : "bg-muted")}>
          {job.open ? e.open : e.closed}
        </span>
        <form action={setJobOpen}>
          <input type="hidden" name="jobId" value={job.id} />
          <input type="hidden" name="open" value={job.open ? "false" : "true"} />
          <Button type="submit" variant="outline">
            {job.open ? e.closeJob : e.reopenJob}
          </Button>
        </form>
        {job.open && (
          <Link href={`/jobs/${job.id}`} className={buttonVariants({ variant: "ghost" })}>
            {e.viewPublic}
          </Link>
        )}
      </div>

      <section aria-labelledby="applicants" className="flex flex-col gap-3">
        <h2 id="applicants" className="text-xl font-semibold">
          {e.applicantsTitle} ({job.applicants.length})
        </h2>
        {job.applicants.length === 0 ? (
          <div className="flex items-center gap-3 rounded-md border border-border bg-card p-6 text-muted-foreground">
            <Users aria-hidden className="size-5" />
            {e.applicantsEmpty}
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {job.applicants.map((a) => (
              <ApplicantCard key={a.applicationId} a={a} jobId={job.id} />
            ))}
          </ul>
        )}
      </section>
    </PageShell>
  );
}
