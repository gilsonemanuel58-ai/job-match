import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { t } from "@/i18n";
import { requireEmployer } from "@/lib/employer";
import { PageShell } from "@/components/page-shell";
import { JobForm } from "@/components/job-form";

export const metadata: Metadata = { title: "Post a job — Job Match" };

export default async function NewJobPage() {
  await requireEmployer();
  return (
    <PageShell title={t.employer.newTitle} subtitle={t.employer.newSubtitle}>
      <Link href="/employer" className="-mt-4 flex w-fit items-center gap-1.5 text-sm font-medium text-primary hover:underline">
        <ArrowLeft aria-hidden className="size-4" />
        {t.employer.backToDashboard}
      </Link>
      <JobForm />
    </PageShell>
  );
}
