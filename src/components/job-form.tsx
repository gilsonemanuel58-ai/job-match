"use client";

import { useActionState } from "react";
import { useFocusFirstError } from "@/components/use-focus-first-error";
import { createJob, type JobFormState } from "@/app/employer/actions";
import { t } from "@/i18n";
import { EMPLOYMENT_TYPES, ENGLISH_LEVELS, JOB_AREAS, JOB_VISA_INFO, PPSN_ANSWERS, REGIONS, SALARY_PERIODS, SHIFTS } from "@/lib/options";
import type { JobFieldError } from "@/lib/job-validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toOptions } from "@/components/form-fields";
import { cn } from "@/lib/utils";

const f = t.employer.form;
const err = t.employer.errors;

function Err({ id, error }: { id: string; error?: JobFieldError }) {
  if (!error) return null;
  return (
    <p id={id} className="text-sm font-medium text-destructive">
      {err[error]}
    </p>
  );
}

/** Mesmo visual do ChoiceGroup do onboarding, com as mensagens de erro da empresa. */
function Choices({
  name, legend, hint, type, options, value, error, compact,
}: {
  name: string; legend: string; hint?: string; type: "radio" | "checkbox";
  options: { value: string; label: string }[]; value?: string | string[]; error?: JobFieldError; compact?: boolean;
}) {
  const selected = new Set(Array.isArray(value) ? value : value ? [value] : []);
  return (
    <fieldset className="flex flex-col gap-2" aria-invalid={error ? true : undefined} aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}>
      <legend className="mb-1 text-base font-semibold">{legend}</legend>
      {hint && <p id={`${name}-hint`} className="-mt-1 text-sm text-muted-foreground">{hint}</p>}
      <div className={cn("grid gap-2", compact ? "grid-cols-2" : "sm:grid-cols-2")}>
        {options.map((o) => (
          <label
            key={o.value}
            className={cn(
              "flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-border bg-card px-3 py-2.5 text-[15px] hover:bg-muted",
              "has-[:checked]:border-primary has-[:checked]:bg-secondary has-[:checked]:font-semibold has-[:checked]:text-secondary-foreground",
              "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
              error && "border-destructive/50"
            )}
          >
            <input type={type} name={name} value={o.value} defaultChecked={selected.has(o.value)} className="size-4 shrink-0 accent-[var(--primary)]" />
            {o.label}
          </label>
        ))}
      </div>
      <Err id={`${name}-error`} error={error} />
    </fieldset>
  );
}

function Field({ name, label, hint, value, error, type = "text", inputMode, className }: {
  name: string; label: string; hint?: string; value?: string | string[]; error?: JobFieldError;
  type?: string; inputMode?: "decimal" | "numeric"; className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={name} className="text-base font-semibold">{label}</Label>
      {hint && <p id={`${name}-hint`} className="-mt-1 text-sm text-muted-foreground">{hint}</p>}
      <Input
        id={name} name={name} type={type} inputMode={inputMode}
        defaultValue={(value as string) ?? ""}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
        className="h-11"
      />
      <Err id={`${name}-error`} error={error} />
    </div>
  );
}

const textareaClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm";

export function JobForm() {
  const [state, action, pending] = useActionState<JobFormState, FormData>(createJob, {});
  const v = state.values ?? {};
  const e = state.errors ?? {};
  const hasErrors = Object.keys(e).length > 0 || state.formError;

  const formRef = useFocusFirstError(state, Boolean(hasErrors));

  return (
    <form ref={formRef} action={action} key={JSON.stringify(v)} noValidate className="flex flex-col gap-8">
      {hasErrors && (
        <p role="alert" className="rounded-md bg-warning-soft px-4 py-3 text-sm font-medium text-warning">
          {state.formError ? err[state.formError] : err.summary}
        </p>
      )}

      <Field name="title" label={f.title} hint={f.titleHint} value={v.title} error={e.title} />
      <Choices compact name="region" legend={f.region} type="radio" options={toOptions(REGIONS, t.regions)} value={v.region} error={e.region} />
      <Choices name="area" legend={f.area} type="radio" options={toOptions(JOB_AREAS, t.jobAreas)} value={v.area} error={e.area} />
      <Choices compact name="employmentType" legend={f.employmentType} type="radio" options={toOptions(EMPLOYMENT_TYPES, t.employmentType)} value={v.employmentType} error={e.employmentType} />
      <Choices compact name="shifts" legend={f.shifts} type="checkbox" options={toOptions(SHIFTS, t.shifts)} value={v.shifts} error={e.shifts} />
      <Field name="hoursPerWeek" label={f.hoursPerWeek} hint={f.hoursHint} value={v.hoursPerWeek} error={e.hoursPerWeek} inputMode="numeric" className="sm:w-64" />

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-base font-semibold">{f.pay}</legend>
        <p className="-mt-1 text-sm text-muted-foreground">{f.salaryHint}</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field name="salaryMin" label={f.salaryMin} value={v.salaryMin} error={e.salaryMin} inputMode="decimal" />
          <Field name="salaryMax" label={f.salaryMax} value={v.salaryMax} error={e.salaryMax} inputMode="decimal" />
          <div className="flex flex-col gap-2">
            <Label htmlFor="salaryPeriod" className="text-base font-semibold">{f.salaryPeriod}</Label>
            <select id="salaryPeriod" name="salaryPeriod" defaultValue={(v.salaryPeriod as string) || "hour"}
              aria-invalid={e.salaryPeriod ? true : undefined}
              className="h-11 rounded-md border border-input bg-card px-3 text-base md:text-sm">
              {SALARY_PERIODS.map((p) => <option key={p} value={p}>{t.salaryPeriod[p]}</option>)}
            </select>
            <Err id="salaryPeriod-error" error={e.salaryPeriod} />
          </div>
        </div>
      </fieldset>

      <Choices name="visaInfo" legend={f.visa} type="radio" options={toOptions(JOB_VISA_INFO, f.visaOptions)} value={v.visaInfo} error={e.visaInfo} />
      <Choices compact name="englishRequired" legend={f.english} type="radio" options={toOptions(ENGLISH_LEVELS, t.english)} value={v.englishRequired} error={e.englishRequired} />
      <Choices name="ppsn" legend={f.ppsn} type="radio" options={toOptions(PPSN_ANSWERS, f.ppsnOptions)} value={v.ppsn ?? "unknown"} error={e.ppsn} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="description" className="text-base font-semibold">{f.description}</Label>
        <textarea id="description" name="description" rows={5} maxLength={2000} defaultValue={(v.description as string) ?? ""}
          aria-invalid={e.description ? true : undefined} aria-describedby={e.description ? "description-error" : undefined} className={textareaClass} />
        <Err id="description-error" error={e.description} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="requirements" className="text-base font-semibold">{f.requirements}</Label>
        <textarea id="requirements" name="requirements" rows={3} maxLength={1000} defaultValue={(v.requirements as string) ?? ""} className={textareaClass} />
      </div>

      <Button type="submit" size="lg" disabled={pending} className="sm:w-fit">
        {pending ? f.submitting : f.submit}
      </Button>
    </form>
  );
}
