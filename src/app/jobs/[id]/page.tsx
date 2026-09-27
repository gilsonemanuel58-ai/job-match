import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, ExternalLink, Info, MapPin } from "lucide-react";
import { t } from "@/i18n";
import { cn } from "@/lib/utils";
import { getJob } from "@/lib/jobs";
import { getCurrentUser } from "@/lib/auth";
import { formatSalary, formatSchedule } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const d = t.jobs.detail;
const STAMP2_TERM_HOURS = 20; // irishimmigration.ie — horas por semana durante as aulas

export async function generateMetadata({ params }: PageProps<"/jobs/[id]">): Promise<Metadata> {
  const job = await getJob((await params).id);
  return { title: job ? `${job.title} — ${job.companyName} | Job Match` : "Job Match" };
}

function Fact({ label, value, tone }: { label: string; value: string; tone?: "good" | "unknown" }) {
  return (
    <div className="flex flex-col gap-1 rounded-md border border-border bg-card p-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className={cn("text-base font-semibold", tone === "good" && "text-success", tone === "unknown" && "text-warning")}>{value}</dd>
    </div>
  );
}

export default async function JobPage({ params }: PageProps<"/jobs/[id]">) {
  const job = await getJob((await params).id);
  if (!job) notFound();
  const user = await getCurrentUser();

  const salary = formatSalary(job);
  const schedule = formatSchedule(job);
  const isExternal = job.source === "careerjet" && job.externalUrl;
  const posted = job.postedAt
    ? new Intl.DateTimeFormat("en-IE", { day: "numeric", month: "long" }).format(new Date(job.postedAt))
    : null;

  const visa =
    job.visaInfo !== "not_informed"
      ? { value: t.job.visaValues[job.visaInfo], tone: job.visaInfo === "stamp_2_ok" ? ("good" as const) : undefined }
      : job.visaSignal
        ? { value: t.job.visaFoundInAd, tone: undefined }
        : { value: t.job.notInformed, tone: "unknown" as const };
  const english = job.englishRequired ? { value: t.english[job.englishRequired] } : { value: t.job.notInformed, tone: "unknown" as const };
  const ppsn =
    job.requiresPpsn == null
      ? { value: t.job.notInformed, tone: "unknown" as const }
      : { value: job.requiresPpsn ? t.job.ppsnRequired : t.job.ppsnNotRequired };

  const overStamp2 = job.hoursPerWeek != null && job.hoursPerWeek > STAMP2_TERM_HOURS;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto grid w-full max-w-6xl flex-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_340px] lg:items-start">
        <div className="flex flex-col gap-8">
          <Link href="/jobs" className="flex w-fit items-center gap-1.5 text-sm font-medium text-primary hover:underline">
            <ArrowLeft aria-hidden className="size-4" />
            {t.jobs.back}
          </Link>

          <header className="flex flex-col gap-3">
            {job.isDemo && (
              <span className="w-fit rounded-sm border border-border px-2 py-0.5 text-xs text-muted-foreground">{t.job.demoListing}</span>
            )}
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{job.title}</h1>
            <p className="text-lg text-muted-foreground">{job.companyName}</p>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[15px]">
              <li className="flex items-center gap-1.5">
                <MapPin aria-hidden className="size-4 text-muted-foreground" />
                {t.regions[job.region]}
              </li>
              <li className="flex items-center gap-1.5">
                <Clock aria-hidden className="size-4 text-muted-foreground" />
                {job.hoursPerWeek ? d.hoursPerWeek(job.hoursPerWeek) : <span className="text-warning">{d.hoursNotInformed}</span>}
              </li>
              {posted && <li className="text-muted-foreground">{d.postedOn(posted)}</li>}
            </ul>
            <p className={cn("text-xl font-semibold", !salary && "text-warning")}>
              {salary ?? t.job.salaryNotInformed}
              {schedule && <span className="text-base font-normal text-muted-foreground"> · {schedule}</span>}
            </p>
          </header>

          <section aria-labelledby="immigrant" className="flex flex-col gap-3">
            <h2 id="immigrant" className="text-xl font-semibold">
              {d.immigrantTitle}
            </h2>
            <dl className="grid gap-3 sm:grid-cols-3">
              <Fact label={t.job.visa} {...visa} />
              <Fact label={t.job.englishLabel} {...english} />
              <Fact label={t.job.ppsn} {...ppsn} />
            </dl>
            {job.visaSignal && job.visaInfo === "not_informed" && (
              <p className="text-sm text-muted-foreground">{t.job.visaSignalNote(job.visaSignal)}</p>
            )}
            <div className={cn("flex gap-3 rounded-md p-4 text-sm", overStamp2 ? "bg-warning-soft text-warning" : "bg-secondary text-secondary-foreground")}>
              <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
              <div className="flex flex-col gap-1">
                {overStamp2 && <p className="font-semibold">{d.stamp2Over(job.hoursPerWeek!)}</p>}
                <p>{d.stamp2Rule}</p>
                <a
                  href="https://www.irishimmigration.ie/coming-to-study-in-ireland/frequently-asked-questions-for-students/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-fit font-medium underline underline-offset-4"
                >
                  {d.stamp2Source}
                </a>
              </div>
            </div>
          </section>

          <section aria-labelledby="role" className="flex flex-col gap-3">
            <h2 id="role" className="text-xl font-semibold">
              {d.aboutRole}
            </h2>
            <p className="whitespace-pre-line text-[15px] leading-relaxed">{job.description || t.job.notInformed}</p>
          </section>

          <section aria-labelledby="req" className="flex flex-col gap-3">
            <h2 id="req" className="text-xl font-semibold">
              {d.requirements}
            </h2>
            <p className={cn("whitespace-pre-line text-[15px] leading-relaxed", !job.requirements && "text-muted-foreground")}>
              {job.requirements ?? d.noRequirements}
            </p>
          </section>

          {job.companyDescription && (
            <section aria-labelledby="company" className="flex flex-col gap-3">
              <h2 id="company" className="text-xl font-semibold">
                {d.aboutCompany}
              </h2>
              <p className="text-[15px] leading-relaxed text-muted-foreground">{job.companyDescription}</p>
            </section>
          )}
        </div>

        {/* Ação principal: fixa no desktop, no fim do conteúdo no celular */}
        <aside className="flex flex-col gap-3 rounded-md border border-border bg-card p-5 lg:sticky lg:top-24">
          <p className="font-semibold">{job.title}</p>
          <p className="-mt-2 text-sm text-muted-foreground">{job.companyName}</p>
          {isExternal ? (
            <>
              <a href={job.externalUrl!} target="_blank" rel="noopener noreferrer" className={buttonVariants({ size: "lg" })}>
                {d.applyExternal}
                <ExternalLink aria-hidden />
              </a>
              <p className="text-xs text-muted-foreground">{d.externalNote}</p>
            </>
          ) : user ? (
            <>
              <button type="button" disabled className={buttonVariants({ size: "lg" })}>
                {d.applyNative}
              </button>
              <p className="text-sm text-muted-foreground">{d.applySoon}</p>
            </>
          ) : (
            <Link href="/signup" className={buttonVariants({ size: "lg" })}>
              {d.signUpToApply}
            </Link>
          )}
        </aside>
      </main>
      <SiteFooter />
    </>
  );
}
