/**
 * Textos da interface. Nada de texto solto nos componentes:
 * para traduzir depois, basta criar pt.ts / es.ts com as mesmas chaves.
 */
export const en = {
  brand: "Job Match",

  regions: {
    dublin_city: "Dublin City",
    dublin_county: "Dublin (county)",
    cork: "Cork",
    limerick: "Limerick",
  },
  english: {
    basic: "Basic",
    intermediate: "Intermediate",
    advanced: "Advanced",
    fluent: "Fluent",
  },
  employmentType: {
    full_time: "Full-time",
    part_time: "Part-time",
    both: "Full or part-time",
  },
  shifts: {
    morning: "Mornings",
    afternoon: "Afternoons",
    evening: "Evenings",
    night: "Nights",
    weekend: "Weekends",
    flexible: "Flexible hours",
  },
  salaryPeriod: {
    hour: "hour",
    week: "week",
    month: "month",
    year: "year",
  },

  job: {
    notInformed: "Not informed",
    salaryNotInformed: "Pay not informed",
    pay: "Pay",
    visa: "Visa",
    englishLabel: "English",
    ppsn: "PPSN",
    ppsnRequired: "Needed to start",
    ppsnNotRequired: "Not needed to start",
    visaValues: {
      stamp_2_ok: "Stamp 2 OK",
      work_permit_required: "Work permit",
      eu_only: "EU/EEA only",
      not_informed: "Not informed",
    },
    visaFoundInAd: "Found in ad*",
    visaSignalNote: (signal: string) => `*"${signal}" appears in the listing. Not a guarantee.`,
    match: (score: number) => `${score}% match`,
    why: "Why:",
    viewJob: "View job",
    applyExternal: "Apply on original site",
    demoListing: "Demo listing",
    example: "Example",
  },

  nav: {
    howItWorks: "How it works",
    employers: "For employers",
    signIn: "Sign in",
  },

  landing: {
    hero: {
      eyebrow: "For students and newcomers in Ireland",
      title: "Find work in Ireland that fits your visa.",
      subtitle:
        "Jobs in Dublin, Cork and Limerick — with what other job boards leave out: Stamp 2 rules, the English level really needed and whether you need a PPSN to start.",
      primaryCta: "Create your free profile",
      secondaryCta: "See how it works",
      note: "Free for job seekers. Takes about 2 minutes.",
    },
    clarity: {
      title: "Every job answers three questions",
      subtitle: "The questions you would otherwise ask a friend — or find out after the interview.",
      items: [
        {
          title: "Can I work with my visa?",
          body: "We show whether the employer accepts Stamp 2 students — before you spend time applying.",
        },
        {
          title: "Is my English enough?",
          body: "The level the job really needs, not a generic \"fluent English\" copied into every ad.",
        },
        {
          title: "Do I need a PPSN first?",
          body: "Some employers let you start while your PPSN is on the way. We tell you when they do.",
        },
      ],
      honestyTitle: "When we don't know, we say so.",
      honestyBody:
        "If a listing doesn't give the pay, the visa rules or the English level, you'll see \"Not informed\" — never a guess.",
    },
    how: {
      title: "How it works",
      steps: [
        {
          title: "Tell us about you",
          body: "Where you live, your visa, your English and when you can work. Five quick questions.",
        },
        {
          title: "See jobs that match",
          body: "Each job shows a match score and the reason for it, so you know why it's there.",
        },
        {
          title: "Apply and follow up",
          body: "Apply in one tap to employers on Job Match, or go straight to the original listing.",
        },
      ],
    },
    cities: {
      title: "Where we are",
      subtitle: "Starting with the cities where most international students live and work.",
    },
    employers: {
      title: "Hiring students or newcomers?",
      body: "Post a job for free and reach people who are ready to work — with their visa and availability clear from the start.",
      cta: "Post a job",
    },
    footer: {
      disclaimer:
        "Job Match is in development. Listings marked \"Demo\" are examples, not real vacancies. Always check visa rules on the official Irish Immigration Service website.",
      source: "Source code on GitHub",
    },
  },

  comingSoon: {
    title: "Sign-up opens soon",
    body: "We're building this step right now. Come back in a few days.",
    back: "Back to home",
  },
} as const;

export type Messages = typeof en;
