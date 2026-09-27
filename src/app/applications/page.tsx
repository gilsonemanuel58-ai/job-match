import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Inbox } from "lucide-react";
import { t } from "@/i18n";
import { getCurrentRole, getCurrentUser } from "@/lib/auth";
import { listMyApplications } from "@/lib/applications";
import { withdrawApplication } from "@/app/applications/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { PageShell } from "@/components/page-shell";
import { StatusBadge } from "@/components/status-badge";

export const metadata: Metadata = { title: "My applications — Job Match" };

const a = t.applications;
const fmt = new Intl.DateTimeFormat("en-IE", { day: "numeric", month: "short", year: "numeric" });

export default async function ApplicationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const role = await getCurrentRole();
  if (role === "employer") redirect("/employer");
  if (!role) redirect("/onboarding");

  const apps = await listMyApplications(user.id);

  return (
    <PageShell title={a.mineTitle} subtitle={a.mineSubtitle}>
      {apps.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-md border border-border bg-card p-8">
          <Inbox aria-hidden className="size-6 text-muted-foreground" />
          <h2 className="text-lg font-semibold">{a.mineEmptyTitle}</h2>
          <p className="text-muted-foreground">{a.mineEmptyBody}</p>
          <Link href="/jobs" className={buttonVariants()}>
            {a.browse}
          </Link>
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {apps.map((app) => (
              <li key={app.id} className="flex flex-col gap-3 rounded-md border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-col gap-1">
                  {app.job.id ? (
                    <Link href={`/jobs/${app.job.id}`} className="font-semibold text-foreground hover:text-primary hover:underline">
                      {app.job.title}
                    </Link>
                  ) : (
                    <span className="font-semibold">{app.job.title}</span>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {app.job.companyName} · {t.regions[app.job.region]} · {fmt.format(new Date(app.createdAt))}
                    {app.job.isDemo && ` · ${t.job.demoListing}`}
                    {!app.job.open && ` · ${t.employer.closed}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={app.status} />
                  {(app.status === "applied" || app.status === "reviewing") && (
                    // Dois passos: abrir e confirmar. Evita desistência por toque acidental.
                    <details className="group relative">
                      <summary className="cursor-pointer list-none rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted [&::-webkit-details-marker]:hidden">
                        {a.withdraw}
                      </summary>
                      <form action={withdrawApplication} className="absolute right-0 z-10 mt-1 rounded-md border border-border bg-card p-2 shadow-lg">
                        <input type="hidden" name="applicationId" value={app.id} />
                        <Button type="submit" variant="destructive" size="sm" className="whitespace-nowrap">
                          {a.withdrawConfirm}
                        </Button>
                      </form>
                    </details>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground">
            {a.statusHelp} {a.externalNote}
          </p>
        </>
      )}
    </PageShell>
  );
}
