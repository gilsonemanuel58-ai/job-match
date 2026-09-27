import {
  EMPLOYMENT_TYPES,
  ENGLISH_LEVELS,
  JOB_AREAS,
  MAX_JOB_AREAS,
  REGIONS,
  SHIFTS,
  VISA_STATUSES,
  isOneOf,
} from "@/lib/options";

// Validação de formulários. Roda no SERVIDOR: nunca confiar no navegador.
// Erros são chaves de t.onboarding.errors.

export type FieldError = "required" | "chooseOne" | "chooseAtLeastOne" | "tooMany" | "invalidUrl" | "invalidDate";

export interface CandidateInput {
  fullName: string;
  region: (typeof REGIONS)[number];
  jobAreas: (typeof JOB_AREAS)[number][];
  visa: (typeof VISA_STATUSES)[number];
  english: (typeof ENGLISH_LEVELS)[number];
  employmentType: (typeof EMPLOYMENT_TYPES)[number];
  shifts: (typeof SHIFTS)[number][];
  availableFrom: string | null; // YYYY-MM-DD
}

export interface EmployerInput {
  fullName: string;
  companyName: string;
  region: (typeof REGIONS)[number];
  website: string | null;
  description: string | null;
}

/** Valores crus do formulário, devolvidos à tela quando há erro. */
export type RawValues = Record<string, string | string[]>;

type Result<T> = { ok: true; data: T } | { ok: false; errors: Record<string, FieldError>; values: RawValues };

const str = (fd: FormData, key: string, max = 200) => String(fd.get(key) ?? "").trim().slice(0, max);
const list = (fd: FormData, key: string) => fd.getAll(key).map(String);

export function parseCandidate(fd: FormData): Result<CandidateInput> {
  const values: RawValues = {
    fullName: str(fd, "fullName", 100),
    region: str(fd, "region"),
    jobAreas: list(fd, "jobAreas"),
    visa: str(fd, "visa"),
    english: str(fd, "english"),
    employmentType: str(fd, "employmentType"),
    shifts: list(fd, "shifts"),
    availableFrom: str(fd, "availableFrom", 10),
  };
  const errors: Record<string, FieldError> = {};

  if (!values.fullName) errors.fullName = "required";
  if (!isOneOf(REGIONS, values.region)) errors.region = "chooseOne";
  const areas = [...new Set(values.jobAreas as string[])];
  if (areas.length === 0 || !areas.every((a) => isOneOf(JOB_AREAS, a))) errors.jobAreas = "chooseAtLeastOne";
  else if (areas.length > MAX_JOB_AREAS) errors.jobAreas = "tooMany";
  if (!isOneOf(VISA_STATUSES, values.visa)) errors.visa = "chooseOne";
  if (!isOneOf(ENGLISH_LEVELS, values.english)) errors.english = "chooseOne";
  if (!isOneOf(EMPLOYMENT_TYPES, values.employmentType)) errors.employmentType = "chooseOne";
  const shifts = [...new Set(values.shifts as string[])];
  if (shifts.length === 0 || !shifts.every((s) => isOneOf(SHIFTS, s))) errors.shifts = "chooseAtLeastOne";
  const date = values.availableFrom as string;
  if (date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)))) errors.availableFrom = "invalidDate";

  if (Object.keys(errors).length) return { ok: false, errors, values };
  return {
    ok: true,
    data: {
      fullName: values.fullName as string,
      region: values.region as CandidateInput["region"],
      jobAreas: areas as CandidateInput["jobAreas"],
      visa: values.visa as CandidateInput["visa"],
      english: values.english as CandidateInput["english"],
      employmentType: values.employmentType as CandidateInput["employmentType"],
      shifts: shifts as CandidateInput["shifts"],
      availableFrom: date || null,
    },
  };
}

export function parseEmployer(fd: FormData): Result<EmployerInput> {
  const values: RawValues = {
    fullName: str(fd, "fullName", 100),
    companyName: str(fd, "companyName", 120),
    region: str(fd, "region"),
    website: str(fd, "website", 200),
    description: str(fd, "description", 600),
  };
  const errors: Record<string, FieldError> = {};

  if (!values.fullName) errors.fullName = "required";
  if (!values.companyName) errors.companyName = "required";
  if (!isOneOf(REGIONS, values.region)) errors.region = "chooseOne";
  const website = values.website as string;
  if (website) {
    try {
      const u = new URL(website);
      if (u.protocol !== "https:" && u.protocol !== "http:") throw new Error();
    } catch {
      errors.website = "invalidUrl";
    }
  }

  if (Object.keys(errors).length) return { ok: false, errors, values };
  return {
    ok: true,
    data: {
      fullName: values.fullName as string,
      companyName: values.companyName as string,
      region: values.region as EmployerInput["region"],
      website: website || null,
      description: (values.description as string) || null,
    },
  };
}

/** Todos os campos do formulário, mantendo listas (checkboxes) como arrays. */
export function rawValues(fd: FormData): RawValues {
  const out: RawValues = {};
  for (const key of new Set(fd.keys())) {
    if (key.startsWith("$")) continue; // campos internos do React
    const all = fd.getAll(key).map(String);
    out[key] = all.length > 1 || key === "jobAreas" || key === "shifts" ? all : all[0];
  }
  return out;
}
