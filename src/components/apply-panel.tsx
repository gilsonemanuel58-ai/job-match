"use client";

import { useActionState } from "react";
import { applyToJob, type ApplyState } from "@/app/applications/actions";
import { t } from "@/i18n";
import { Button } from "@/components/ui/button";

const a = t.applications;

/** Botão de candidatura com aviso do que é compartilhado. Depois de enviar, a página recarrega com o status. */
export function ApplyForm({ jobId, isDemo }: { jobId: string; isDemo: boolean }) {
  const [state, action, pending] = useActionState<ApplyState, FormData>(applyToJob, {});
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="jobId" value={jobId} />
      <p className="text-sm text-muted-foreground">{a.shareNotice}</p>
      {isDemo && <p className="rounded-md bg-warning-soft px-3 py-2 text-sm text-warning">{a.demoNotice}</p>}
      {state.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {a.errors[state.error]}
        </p>
      )}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? a.applying : a.applyButton}
      </Button>
    </form>
  );
}
