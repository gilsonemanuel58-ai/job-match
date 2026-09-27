import Link from "next/link";
import { t } from "@/i18n";
import { cn } from "@/lib/utils";
import { formatSalary, formatSchedule } from "@/lib/format";
import type { JobSummary, MatchResult } from "@/lib/types";
import { buttonVariants } from "@/components/ui/button";

interface JobCardProps {
  job: JobSummary;
  match?: MatchResult | null;
  /** Destino do botão. Vagas externas usam o link original. */
  href: string;
  /** Rótulo extra, ex.: "Example" na landing page. */
  label?: string;
  className?: string;
}

/** Um fato da vaga: rótulo em cima, valor embaixo. `tone` indica compatível / não informado. */
function Fact({ label, value, tone }: { label: string; value: string; tone?: "good" | "unknown" }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "text-[13px] font-semibold",
          tone === "good" && "text-success",
          tone === "unknown" && "text-warning"
        )}
      >
        {value}
      </dd>
    </div>
  );
}

export function JobCard({ job, match, href, label, className }: JobCardProps) {
  const salary = formatSalary(job);
  const schedule = formatSchedule(job);
  // Link para fora do site (ex.: anúncio original no Careerjet) abre em nova aba.
  const isExternal = /^https?:\/\//.test(href);

  // Visto: vaga nativa informa diretamente; externa só tem "indício no anúncio".
  const visa =
    job.visaInfo !== "not_informed"
      ? { value: t.job.visaValues[job.visaInfo], tone: job.visaInfo === "stamp_2_ok" ? ("good" as const) : undefined }
      : job.visaSignal
        ? { value: t.job.visaFoundInAd, tone: undefined }
        : { value: t.job.notInformed, tone: "unknown" as const };

  const english = job.englishRequired
    ? { value: t.english[job.englishRequired] }
    : { value: t.job.notInformed, tone: "unknown" as const };

  const ppsn =
    job.requiresPpsn == null
      ? { value: t.job.notInformed, tone: "unknown" as const }
      : { value: job.requiresPpsn ? t.job.ppsnRequired : t.job.ppsnNotRequired };

  const note = job.visaInfo === "not_informed" && job.visaSignal
    ? t.job.visaSignalNote(job.visaSignal)
    : match?.reasons.length
      ? `${t.job.why} ${match.reasons.join(", ")}`
      : null;

  return (
    <article className={cn("flex flex-col gap-3 rounded-md border border-border bg-card p-4 text-card-foreground", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 className="text-lg font-semibold leading-snug">{job.title}</h3>
          <p className="text-sm text-muted-foreground">
            {job.companyName} · {t.regions[job.region]}
          </p>
        </div>
        {match && (
          <span
            className={cn(
              "shrink-0 rounded-sm px-2.5 py-1 text-[13px] font-bold",
              match.score >= 85 ? "bg-success-soft text-success" : "bg-muted text-foreground"
            )}
          >
            {t.job.match(match.score)}
          </span>
        )}
      </div>

      <p className={cn("text-[15px] font-semibold", !salary && "text-warning")}>
        {salary ?? t.job.salaryNotInformed}
        {schedule && <span className="font-normal text-muted-foreground"> · {schedule}</span>}
      </p>

      <dl className="grid grid-cols-3 gap-2">
        <Fact label={t.job.visa} {...visa} />
        <Fact label={t.job.englishLabel} {...english} />
        <Fact label={t.job.ppsn} {...ppsn} />
      </dl>

      {note && <p className="border-t border-border pt-2.5 text-xs text-muted-foreground">{note}</p>}

      <div className="flex items-center gap-2">
        <Link
          href={href}
          className={cn(
            buttonVariants({ variant: isExternal ? "outline" : "default" }),
            "flex-1",
            isExternal && "border-primary text-primary"
          )}
          {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {isExternal ? t.job.applyExternal : t.job.viewJob}
        </Link>
        {(label || job.isDemo) && (
          <span className="rounded-sm border border-border px-1.5 py-0.5 text-[11px] text-muted-foreground">
            {label ?? t.job.demoListing}
          </span>
        )}
      </div>
    </article>
  );
}
