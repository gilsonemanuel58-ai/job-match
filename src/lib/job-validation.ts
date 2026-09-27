import {
  EMPLOYMENT_TYPES,
  ENGLISH_LEVELS,
  IRISH_MIN_WAGE_HOURLY,
  JOB_AREAS,
  JOB_VISA_INFO,
  PPSN_ANSWERS,
  REGIONS,
  SALARY_PERIODS,
  SHIFTS,
  isOneOf,
} from "@/lib/options";
import type { RawValues } from "@/lib/validation";

// Validação da vaga publicada pela empresa. Roda no servidor.

export type JobFieldError =
  | "required"
  | "chooseOne"
  | "chooseAtLeastOne"
  | "invalidNumber"
  | "hoursRange"
  | "belowMinimum"
  | "maxBelowMin"
  | "periodNeeded";

export interface JobInput {
  title: string;
  region: (typeof REGIONS)[number];
  area: (typeof JOB_AREAS)[number];
  employmentType: (typeof EMPLOYMENT_TYPES)[number];
  shifts: (typeof SHIFTS)[number][];
  hoursPerWeek: number | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryPeriod: (typeof SALARY_PERIODS)[number] | null;
  visaInfo: (typeof JOB_VISA_INFO)[number];
  englishRequired: (typeof ENGLISH_LEVELS)[number] | null;
  requiresPpsn: boolean | null;
  description: string;
  requirements: string | null;
}

type Result = { ok: true; data: JobInput } | { ok: false; errors: Record<string, JobFieldError>; values: RawValues };

/** "" → null; número válido → número; inválido → NaN. Aceita vírgula decimal (14,50). */
function num(v: string): number | null {
  if (!v) return null;
  const n = Number(v.replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
}

export function parseJob(fd: FormData): Result {
  const s = (k: string, max = 200) => String(fd.get(k) ?? "").trim().slice(0, max);
  const values: RawValues = {
    title: s("title", 100),
    region: s("region"),
    area: s("area"),
    employmentType: s("employmentType"),
    shifts: fd.getAll("shifts").map(String),
    hoursPerWeek: s("hoursPerWeek", 5),
    salaryMin: s("salaryMin", 10),
    salaryMax: s("salaryMax", 10),
    salaryPeriod: s("salaryPeriod"),
    visaInfo: s("visaInfo"),
    englishRequired: s("englishRequired"),
    ppsn: s("ppsn"),
    description: s("description", 2000),
    requirements: s("requirements", 1000),
  };
  const e: Record<string, JobFieldError> = {};

  if (!values.title) e.title = "required";
  if (!isOneOf(REGIONS, values.region)) e.region = "chooseOne";
  if (!isOneOf(JOB_AREAS, values.area)) e.area = "chooseOne";
  if (!isOneOf(EMPLOYMENT_TYPES, values.employmentType)) e.employmentType = "chooseOne";
  const shifts = [...new Set(values.shifts as string[])];
  if (!shifts.length || !shifts.every((x) => isOneOf(SHIFTS, x))) e.shifts = "chooseAtLeastOne";
  if (!isOneOf(JOB_VISA_INFO, values.visaInfo)) e.visaInfo = "chooseOne";
  if (values.englishRequired && !isOneOf(ENGLISH_LEVELS, values.englishRequired)) e.englishRequired = "chooseOne";
  if (!isOneOf(PPSN_ANSWERS, values.ppsn)) e.ppsn = "chooseOne";
  if (!values.description) e.description = "required";

  const hours = num(values.hoursPerWeek as string);
  if (hours !== null && (Number.isNaN(hours) || !Number.isInteger(hours) || hours < 1 || hours > 60)) e.hoursPerWeek = "hoursRange";

  const min = num(values.salaryMin as string);
  const max = num(values.salaryMax as string);
  const period = values.salaryPeriod as string;
  if (Number.isNaN(min) || (min !== null && min <= 0)) e.salaryMin = "invalidNumber";
  if (Number.isNaN(max) || (max !== null && max <= 0)) e.salaryMax = "invalidNumber";
  if ((min !== null || max !== null) && !isOneOf(SALARY_PERIODS, period)) e.salaryPeriod = "periodNeeded";
  if (!e.salaryMin && !e.salaryMax && min !== null && max !== null && max < min) e.salaryMax = "maxBelowMin";
  // Salário por hora abaixo do mínimo legal não é publicado.
  if (period === "hour") {
    if (!e.salaryMin && min !== null && min < IRISH_MIN_WAGE_HOURLY) e.salaryMin = "belowMinimum";
    if (!e.salaryMax && max !== null && min === null && max < IRISH_MIN_WAGE_HOURLY) e.salaryMax = "belowMinimum";
  }

  if (Object.keys(e).length) return { ok: false, errors: e, values };
  const hasSalary = min !== null || max !== null;
  return {
    ok: true,
    data: {
      title: values.title as string,
      region: values.region as JobInput["region"],
      area: values.area as JobInput["area"],
      employmentType: values.employmentType as JobInput["employmentType"],
      shifts: shifts as JobInput["shifts"],
      hoursPerWeek: hours,
      salaryMin: min,
      salaryMax: max,
      salaryPeriod: hasSalary ? (period as JobInput["salaryPeriod"]) : null,
      visaInfo: values.visaInfo as JobInput["visaInfo"],
      englishRequired: (values.englishRequired as JobInput["englishRequired"]) || null,
      requiresPpsn: values.ppsn === "yes" ? true : values.ppsn === "no" ? false : null,
      description: values.description as string,
      requirements: (values.requirements as string) || null,
    },
  };
}
