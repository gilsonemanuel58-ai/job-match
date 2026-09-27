"use client";

import { useActionState } from "react";
import { useFocusFirstError } from "@/components/use-focus-first-error";
import { saveCandidate, type SaveState } from "@/app/onboarding/actions";
import { t } from "@/i18n";
import { EMPLOYMENT_TYPES, ENGLISH_LEVELS, JOB_AREAS, REGIONS, SHIFTS, VISA_STATUSES } from "@/lib/options";
import type { RawValues } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChoiceGroup, ErrorText, toOptions } from "@/components/form-fields";

const o = t.onboarding;

export function CandidateForm({ initial }: { initial: RawValues }) {
  const [state, action, pending] = useActionState<SaveState, FormData>(saveCandidate, { values: initial });
  const v = state.values ?? initial;
  const e = state.errors ?? {};

  const formRef = useFocusFirstError(state, Boolean(state.formError || Object.keys(e).length));

  return (
    <form ref={formRef} action={action} key={JSON.stringify(v)} noValidate className="flex flex-col gap-8">
      {(state.formError || Object.keys(e).length > 0) && (
        <p role="alert" className="rounded-md bg-warning-soft px-4 py-3 text-sm font-medium text-warning">
          {state.formError ? o.errors.save : o.errors.summary}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="fullName" className="text-base font-semibold">
          {o.fullName}
        </Label>
        <Input
          id="fullName"
          name="fullName"
          autoComplete="name"
          defaultValue={(v.fullName as string) ?? ""}
          aria-invalid={e.fullName ? true : undefined}
          aria-describedby={e.fullName ? "fullName-error" : undefined}
          className="h-11"
        />
        <ErrorText id="fullName-error" error={e.fullName} />
      </div>

      <ChoiceGroup columns="compact" name="region" legend={o.region} type="radio" options={toOptions(REGIONS, t.regions)} defaultValue={v.region} error={e.region} />
      <ChoiceGroup
        name="jobAreas"
        legend={o.jobAreas}
        hint={o.jobAreasHint}
        type="checkbox"
        options={toOptions(JOB_AREAS, t.jobAreas)}
        defaultValue={v.jobAreas}
        error={e.jobAreas}
      />
      <ChoiceGroup
        columns="compact"
        name="visa"
        legend={o.visa}
        hint={o.visaHint}
        type="radio"
        options={toOptions(VISA_STATUSES, t.visaStatus)}
        defaultValue={v.visa}
        error={e.visa}
      />
      <ChoiceGroup columns="compact" name="english" legend={o.english} type="radio" options={toOptions(ENGLISH_LEVELS, t.english)} defaultValue={v.english} error={e.english} />
      <ChoiceGroup
        columns="compact"
        name="employmentType"
        legend={o.employmentType}
        type="radio"
        options={toOptions(EMPLOYMENT_TYPES, t.employmentType)}
        defaultValue={v.employmentType}
        error={e.employmentType}
      />
      <ChoiceGroup columns="compact" name="shifts" legend={o.shifts} hint={o.shiftsHint} type="checkbox" options={toOptions(SHIFTS, t.shifts)} defaultValue={v.shifts} error={e.shifts} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="availableFrom" className="text-base font-semibold">
          {o.availableFrom}
        </Label>
        <Input
          id="availableFrom"
          name="availableFrom"
          type="date"
          defaultValue={(v.availableFrom as string) ?? ""}
          aria-invalid={e.availableFrom ? true : undefined}
          className="h-11 w-full sm:w-56"
        />
        <ErrorText id="availableFrom-error" error={e.availableFrom} />
      </div>

      <Button type="submit" size="lg" disabled={pending} className="sm:w-fit">
        {pending ? o.saving : o.save}
      </Button>
    </form>
  );
}
