import Link from "next/link";
import { BadgeCheck, FileText, Languages, MapPin } from "lucide-react";
import { t } from "@/i18n";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { JobCard } from "@/components/job-card";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import type { JobSummary, Region } from "@/lib/types";

const copy = t.landing;

// Vaga de EXEMPLO para ilustrar o card. Marcada como "Example" na tela.
const exampleJob: JobSummary = {
  id: "example",
  source: "native",
  title: "Barista",
  companyName: "Example Café",
  region: "dublin_city",
  area: "hospitality",
  employmentType: "part_time",
  shifts: ["weekend"],
  salaryMin: 14.5,
  salaryMax: null,
  salaryPeriod: "hour",
  visaInfo: "stamp_2_ok",
  visaSignal: null,
  englishRequired: "intermediate",
  requiresPpsn: null,
  externalUrl: null,
  isDemo: true,
  hoursPerWeek: 20,
};

const clarityIcons = [BadgeCheck, Languages, FileText];
const cities: Region[] = ["dublin_city", "dublin_county", "cork", "limerick"];

function SectionHeading({ id, title, subtitle }: { id?: string; title: string; subtitle?: string }) {
  return (
    <div className="flex max-w-2xl flex-col gap-2">
      <h2 id={id} className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </h2>
      {subtitle && <p className="text-base text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* HERO */}
        <section className="bg-navy text-navy-foreground">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-16">
            <div className="flex flex-col gap-6">
              <p className="text-sm font-medium text-navy-muted">{copy.hero.eyebrow}</p>
              <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">{copy.hero.title}</h1>
              <p className="max-w-xl text-lg leading-relaxed text-navy-muted">{copy.hero.subtitle}</p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className={cn(buttonVariants({ size: "lg" }), "bg-card text-primary hover:bg-secondary")}
                >
                  {copy.hero.primaryCta}
                </Link>
                <Link
                  href="#how"
                  className={cn(
                    buttonVariants({ size: "lg", variant: "outline" }),
                    "border-navy-muted/40 bg-transparent text-navy-foreground hover:bg-white/10"
                  )}
                >
                  {copy.hero.secondaryCta}
                </Link>
              </div>
              <p className="text-sm text-navy-muted">{copy.hero.note}</p>
            </div>
            <div className="mx-auto w-full max-w-md lg:mx-0">
              <JobCard
                job={exampleJob}
                match={{ score: 85, reasons: ["region", "area", "visa", "shifts"], warnings: [], blocked: false }}
                href="/signup"
                label={t.job.example}
                className="shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)]"
              />
            </div>
          </div>
        </section>

        {/* O QUE CADA VAGA INFORMA */}
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 sm:py-20">
          <SectionHeading title={copy.clarity.title} subtitle={copy.clarity.subtitle} />
          <ul className="grid gap-4 md:grid-cols-3">
            {copy.clarity.items.map((item, i) => {
              const Icon = clarityIcons[i];
              return (
                <li key={item.title} className="flex flex-col gap-3 rounded-md border border-border bg-card p-6">
                  <Icon aria-hidden className="size-6 text-primary" strokeWidth={1.75} />
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-[15px] leading-relaxed text-muted-foreground">{item.body}</p>
                </li>
              );
            })}
          </ul>
          <div className="flex flex-col gap-4 rounded-md bg-warning-soft p-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
            <div className="flex flex-col gap-1">
              <p className="text-lg font-semibold">{copy.clarity.honestyTitle}</p>
              <p className="max-w-2xl text-[15px] text-foreground/80">{copy.clarity.honestyBody}</p>
            </div>
            <div className="flex w-fit shrink-0 flex-col gap-0.5 rounded-md border border-border bg-card px-4 py-3">
              <span className="text-xs text-muted-foreground">{t.job.pay}</span>
              <span className="text-sm font-semibold text-warning">{t.job.notInformed}</span>
            </div>
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section className="border-y border-border bg-card">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 sm:py-20">
            <SectionHeading id="how" title={copy.how.title} />
            <ol className="grid gap-8 md:grid-cols-3">
              {copy.how.steps.map((step, i) => (
                <li key={step.title} className="flex flex-col gap-3">
                  <span
                    aria-hidden
                    className="flex size-10 items-center justify-center rounded-md bg-secondary text-base font-bold text-secondary-foreground"
                  >
                    {i + 1}
                  </span>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="text-[15px] leading-relaxed text-muted-foreground">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* CIDADES */}
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-16 sm:px-6 sm:py-20">
          <SectionHeading title={copy.cities.title} subtitle={copy.cities.subtitle} />
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {cities.map((city) => (
              <li key={city} className="flex items-center gap-2 rounded-md border border-border bg-card px-4 py-4 font-medium">
                <MapPin aria-hidden className="size-4 shrink-0 text-primary" />
                {t.regions[city]}
              </li>
            ))}
          </ul>
        </section>

        {/* EMPRESAS */}
        <section aria-labelledby="employers" className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
          <div className="flex flex-col gap-6 rounded-lg bg-navy p-8 text-navy-foreground sm:p-10 md:flex-row md:items-center md:justify-between">
            <div className="flex max-w-xl flex-col gap-2">
              <h2 id="employers" className="text-2xl font-semibold tracking-tight">
                {copy.employers.title}
              </h2>
              <p className="text-navy-muted">{copy.employers.body}</p>
            </div>
            <Link
              href="/signup?role=employer"
              className={cn(buttonVariants({ size: "lg" }), "shrink-0 bg-card text-primary hover:bg-secondary")}
            >
              {copy.employers.cta}
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
