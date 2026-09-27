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
  notInformed: "Not informed",
  demoLabel: "Demo listing",
  placeholder: {
    title: "Job Match",
    subtitle: "Work for students and immigrants in Dublin, Cork and Limerick.",
    status: "Phase 1 — project setup. Visual design pending reference approval.",
  },
} as const;

export type Messages = typeof en;
