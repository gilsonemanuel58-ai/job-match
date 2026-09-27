import Link from "next/link";
import { t } from "@/i18n";
import { EMPLOYMENT_TYPES, JOB_AREAS, REGIONS } from "@/lib/options";
import type { JobFilters } from "@/lib/jobs";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const selectClass =
  "h-11 w-full rounded-md border border-input bg-card px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm";

function Select({ name, label, value, options }: { name: string; label: string; value?: string; options: [string, string][] }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <select id={name} name={name} defaultValue={value ?? ""} className={selectClass}>
        <option value="">{t.jobs.any}</option>
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Filtros por GET: funciona sem JavaScript e a URL pode ser compartilhada. */
export function JobFiltersForm({ filters }: { filters: JobFilters }) {
  const active = Object.values(filters).some(Boolean);
  return (
    <form method="get" action="/jobs" role="search" className="grid gap-3 rounded-md border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto] lg:items-end">
      <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-1">
        <Label htmlFor="q">{t.jobs.searchLabel}</Label>
        <Input id="q" name="q" type="search" defaultValue={filters.q ?? ""} placeholder={t.jobs.searchPlaceholder} className="h-11" />
      </div>
      <Select name="region" label={t.jobs.regionLabel} value={filters.region} options={REGIONS.map((r) => [r, t.regions[r]])} />
      <Select name="area" label={t.jobs.areaLabel} value={filters.area} options={JOB_AREAS.map((a) => [a, t.jobAreas[a]])} />
      <Select
        name="type"
        label={t.jobs.typeLabel}
        value={filters.type}
        options={EMPLOYMENT_TYPES.filter((e) => e !== "both").map((e) => [e, t.employmentType[e]])}
      />
      <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
        <Button type="submit" className="flex-1 lg:flex-none">
          {t.jobs.apply}
        </Button>
        {active && (
          <Link href="/jobs" className={buttonVariants({ variant: "ghost" })}>
            {t.jobs.clear}
          </Link>
        )}
      </div>
    </form>
  );
}
