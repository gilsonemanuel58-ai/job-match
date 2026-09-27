import { cn } from "@/lib/utils";
import { t } from "@/i18n";
import type { FieldError } from "@/lib/validation";

export function ErrorText({ id, error }: { id: string; error?: FieldError }) {
  if (!error) return null;
  return (
    <p id={id} className="text-sm font-medium text-destructive">
      {t.onboarding.errors[error]}
    </p>
  );
}

interface ChoiceGroupProps {
  name: string;
  legend: string;
  hint?: string;
  type: "radio" | "checkbox";
  options: readonly { value: string; label: string }[];
  defaultValue?: string | string[];
  error?: FieldError;
  /** "compact": duas colunas até no celular (para rótulos curtos). */
  columns?: 1 | 2 | "compact";
}

/** Grupo de opções em "tiles" grandes (alvo de toque ≥ 44px). Input nativo por baixo: teclado e leitor de tela funcionam. */
export function ChoiceGroup({ name, legend, hint, type, options, defaultValue, error, columns = 2 }: ChoiceGroupProps) {
  const selected = new Set(Array.isArray(defaultValue) ? defaultValue : defaultValue ? [defaultValue] : []);
  const describedBy = [hint && `${name}-hint`, error && `${name}-error`].filter(Boolean).join(" ") || undefined;

  return (
    <fieldset className="flex flex-col gap-2" aria-describedby={describedBy} aria-invalid={error ? true : undefined}>
      <legend className="mb-1 text-base font-semibold">{legend}</legend>
      {hint && (
        <p id={`${name}-hint`} className="-mt-1 text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      <div className={cn("grid gap-2", columns === 2 && "sm:grid-cols-2", columns === "compact" && "grid-cols-2")}>
        {options.map((o) => (
          <label
            key={o.value}
            className={cn(
              "flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-border bg-card px-3 py-2.5 text-[15px] transition-colors hover:bg-muted",
              "has-[:checked]:border-primary has-[:checked]:bg-secondary has-[:checked]:font-semibold has-[:checked]:text-secondary-foreground",
              "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
              error && "border-destructive/50"
            )}
          >
            <input
              type={type}
              name={name}
              value={o.value}
              defaultChecked={selected.has(o.value)}
              className="size-4 shrink-0 accent-[var(--primary)]"
            />
            {o.label}
          </label>
        ))}
      </div>
      <ErrorText id={`${name}-error`} error={error} />
    </fieldset>
  );
}

/** Transforma um objeto de rótulos (i18n) em lista de opções, na ordem dada. */
export function toOptions<K extends string>(keys: readonly K[], labels: Record<K, string>) {
  return keys.map((k) => ({ value: k, label: labels[k] }));
}
