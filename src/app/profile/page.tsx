import Link from "next/link";
import { redirect } from "next/navigation";
import { t } from "@/i18n";
import { getCurrentUser } from "@/lib/auth";
import { getProfile } from "@/lib/profile";
import { signOut } from "@/app/auth/actions";
import { buttonVariants, Button } from "@/components/ui/button";
import { PageShell } from "@/components/page-shell";

const f = t.profile.fields;

function label<K extends string>(labels: Record<K, string>, key: string | null | undefined) {
  return key && key in labels ? labels[key as K] : null;
}

function Row({ name, value }: { name: string; value: string | null }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border py-3 last:border-0 sm:flex-row sm:gap-6">
      <dt className="w-36 shrink-0 text-sm text-muted-foreground">{name}</dt>
      <dd className={value ? "text-[15px] font-medium" : "text-[15px] text-warning"}>{value ?? t.profile.notSet}</dd>
    </div>
  );
}

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const profile = await getProfile(user.id);
  if (!profile) redirect("/onboarding");

  const c = profile.candidate;
  const co = profile.company;
  const date = c?.availableFrom
    ? new Intl.DateTimeFormat("en-IE", { day: "numeric", month: "long", year: "numeric" }).format(new Date(c.availableFrom + "T12:00:00"))
    : null;

  return (
    <PageShell title={t.profile.title}>
      <p className="rounded-md bg-secondary px-4 py-3 text-sm text-secondary-foreground">
        {profile.role === "candidate" ? t.profile.candidateNote : t.profile.employerNote}
      </p>

      <dl className="rounded-md border border-border bg-card px-5 py-2">
        <Row name={f.name} value={profile.fullName || null} />
        <Row name={f.email} value={user.email ?? null} />
        {profile.role === "candidate" ? (
          <>
            <Row name={f.region} value={label(t.regions, c?.region)} />
            <Row name={f.jobAreas} value={c?.jobAreas.map((a) => label(t.jobAreas, a)).filter(Boolean).join(", ") || null} />
            <Row name={f.visa} value={label(t.visaStatus, c?.visa)} />
            <Row name={f.english} value={label(t.english, c?.english)} />
            <Row name={f.employmentType} value={label(t.employmentType, c?.employmentType)} />
            <Row name={f.shifts} value={c?.shifts.map((s) => label(t.shifts, s)).filter(Boolean).join(", ") || null} />
            <Row name={f.availableFrom} value={date} />
          </>
        ) : (
          <>
            <Row name={f.companyName} value={co?.name ?? null} />
            <Row name={f.region} value={label(t.regions, co?.region)} />
            <Row name={f.website} value={co?.website ?? null} />
            <Row name={f.description} value={co?.description ?? null} />
          </>
        )}
      </dl>

      <div className="flex flex-col gap-3 sm:flex-row">
        {profile.role === "candidate" && (
          <Link href="/jobs" className={buttonVariants({ size: "lg" })}>
            {t.profile.browseJobs}
          </Link>
        )}
        <Link href="/profile/edit" className={buttonVariants({ size: "lg", variant: profile.role === "candidate" ? "outline" : "default" })}>
          {t.profile.edit}
        </Link>
        <form action={signOut}>
          <Button type="submit" variant="outline" size="lg" className="w-full">
            {t.auth.signOut}
          </Button>
        </form>
      </div>
    </PageShell>
  );
}
