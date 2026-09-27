import { t } from "@/i18n";
import type { JobSummary } from "@/lib/types";

// €14 para valores inteiros, €13.50 para quebrados (nunca €13.5)
function euro(value: number): string {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** "€13.50 / hour", "€12 – €14 / hour" ou null quando não informado. */
export function formatSalary(job: Pick<JobSummary, "salaryMin" | "salaryMax" | "salaryPeriod">): string | null {
  const { salaryMin: min, salaryMax: max, salaryPeriod: period } = job;
  if (min == null && max == null) return null;
  const amount =
    min != null && max != null && min !== max
      ? `${euro(min)} – ${euro(max)}`
      : euro((min ?? max) as number);
  return period ? `${amount} / ${t.salaryPeriod[period]}` : amount;
}

export function formatSchedule(job: Pick<JobSummary, "employmentType" | "shifts">): string | null {
  const parts = [
    job.employmentType ? t.employmentType[job.employmentType] : null,
    ...job.shifts.map((s) => t.shifts[s]),
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}
