"use client";

import { useActionState, useState } from "react";
import { MailCheck } from "lucide-react";
import { sendMagicLink, type MagicLinkState } from "@/app/auth/actions";
import { t } from "@/i18n";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UserRole } from "@/lib/options";

interface AuthFormProps {
  /** Cadastro mostra a escolha candidato/empresa. Login não. */
  mode: "login" | "signup";
  defaultRole?: UserRole;
  linkError?: boolean;
}

const initial: MagicLinkState = { status: "idle" };

export function AuthForm({ mode, defaultRole = "candidate", linkError }: AuthFormProps) {
  const [state, action, pending] = useActionState(sendMagicLink, initial);
  const [role, setRole] = useState<UserRole>(defaultRole);
  const [reset, setReset] = useState(0);

  if (state.status === "sent" && reset === 0) {
    return (
      <div role="status" className="flex flex-col gap-4 rounded-md border border-border bg-card p-6">
        <MailCheck aria-hidden className="size-8 text-success" strokeWidth={1.75} />
        <h2 className="text-xl font-semibold">{t.auth.sentTitle}</h2>
        <p className="text-[15px] leading-relaxed text-muted-foreground">{t.auth.sentBody(state.email)}</p>
        <Button variant="outline" className="w-fit" onClick={() => setReset((n) => n + 1)}>
          {t.auth.useAnotherEmail}
        </Button>
      </div>
    );
  }

  const error = state.status === "error" ? t.auth.errors[state.error] : linkError ? t.auth.errors.linkInvalid : null;
  const emailError = state.status === "error" && state.error === "invalidEmail";

  return (
    <form
      action={(fd) => {
        setReset(0);
        return action(fd);
      }}
      className="flex flex-col gap-5 rounded-md border border-border bg-card p-6"
      noValidate
    >
      {mode === "signup" && (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-medium">{t.auth.roleLegend}</legend>
          <div className="grid grid-cols-2 gap-2">
            {(["candidate", "employer"] as const).map((r) => (
              <label
                key={r}
                className={cn(
                  "flex h-12 cursor-pointer items-center justify-center rounded-md border text-sm font-semibold transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                  role === r ? "border-primary bg-secondary text-secondary-foreground" : "border-border hover:bg-muted"
                )}
              >
                <input
                  type="radio"
                  name="role"
                  value={r}
                  checked={role === r}
                  onChange={() => setRole(r)}
                  className="sr-only"
                />
                {r === "candidate" ? t.auth.roleCandidate : t.auth.roleEmployer}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">{t.auth.emailLabel}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          placeholder={t.auth.emailPlaceholder}
          defaultValue={state.status !== "idle" ? state.email : ""}
          aria-invalid={emailError || undefined}
          aria-describedby={error ? "auth-error" : undefined}
          className="h-11"
        />
      </div>

      {error && (
        <p id="auth-error" role="alert" className="rounded-md bg-warning-soft px-3 py-2 text-sm text-warning">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? t.auth.sending : t.auth.submit}
      </Button>
    </form>
  );
}
