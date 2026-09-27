import { t } from "@/i18n";
import { cn } from "@/lib/utils";
import type { ApplicationStatus } from "@/lib/applications";

// Cor com função: verde = avançou, cinza = em andamento, neutro escuro = encerrado.
const styles: Record<ApplicationStatus, string> = {
  applied: "bg-muted text-foreground",
  reviewing: "bg-secondary text-secondary-foreground",
  interview: "bg-success-soft text-success",
  hired: "bg-success text-white",
  rejected: "bg-muted text-muted-foreground",
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span className={cn("inline-flex w-fit items-center rounded-sm px-2.5 py-1 text-[13px] font-semibold", styles[status])}>
      {t.applications.status[status]}
    </span>
  );
}
