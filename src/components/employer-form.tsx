"use client";

import { useActionState } from "react";
import { useFocusFirstError } from "@/components/use-focus-first-error";
import { saveEmployer, type SaveState } from "@/app/onboarding/actions";
import { t } from "@/i18n";
import { REGIONS } from "@/lib/options";
import type { FieldError, RawValues } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChoiceGroup, ErrorText, toOptions } from "@/components/form-fields";

const o = t.onboarding;

function TextField({
  name,
  label,
  value,
  error,
  type = "text",
  autoComplete,
}: {
  name: string;
  label: string;
  value?: string | string[];
  error?: FieldError;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name} className="text-base font-semibold">
        {label}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        defaultValue={(value as string) ?? ""}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className="h-11"
      />
      <ErrorText id={`${name}-error`} error={error} />
    </div>
  );
}

export function EmployerForm({ initial }: { initial: RawValues }) {
  const [state, action, pending] = useActionState<SaveState, FormData>(saveEmployer, { values: initial });
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

      <TextField name="fullName" label={o.fullName} value={v.fullName} error={e.fullName} autoComplete="name" />
      <TextField name="companyName" label={o.companyName} value={v.companyName} error={e.companyName} autoComplete="organization" />
      <ChoiceGroup columns="compact" name="region" legend={o.companyRegion} type="radio" options={toOptions(REGIONS, t.regions)} defaultValue={v.region} error={e.region} />
      <TextField name="website" label={o.website} value={v.website} error={e.website} type="url" autoComplete="url" />

      <div className="flex flex-col gap-2">
        <Label htmlFor="description" className="text-base font-semibold">
          {o.description}
        </Label>
        <textarea
          id="description"
          name="description"
          rows={4}
          maxLength={600}
          defaultValue={(v.description as string) ?? ""}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
        />
      </div>

      <Button type="submit" size="lg" disabled={pending} className="sm:w-fit">
        {pending ? o.saving : o.save}
      </Button>
    </form>
  );
}
