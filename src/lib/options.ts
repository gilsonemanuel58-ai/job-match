// Valores aceitos em formulários. Espelham os enums do banco.
// Validação no servidor usa estas listas: nada fora delas é salvo.

export const REGIONS = ["dublin_city", "dublin_county", "cork", "limerick"] as const;
export const VISA_STATUSES = ["stamp_2", "stamp_1g", "stamp_4", "eu_eea", "other"] as const;
export const ENGLISH_LEVELS = ["basic", "intermediate", "advanced", "fluent"] as const;
export const EMPLOYMENT_TYPES = ["part_time", "full_time", "both"] as const;
export const SHIFTS = ["morning", "afternoon", "evening", "night", "weekend", "flexible"] as const;
export const JOB_AREAS = [
  "hospitality",
  "retail",
  "cleaning",
  "warehouse",
  "food_production",
  "delivery",
  "care",
  "construction",
  "office",
  "other",
] as const;
export const USER_ROLES = ["candidate", "employer"] as const;

export type UserRole = (typeof USER_ROLES)[number];
export type VisaStatus = (typeof VISA_STATUSES)[number];
export type JobArea = (typeof JOB_AREAS)[number];

export const MAX_JOB_AREAS = 3;

export function isOneOf<T extends readonly string[]>(list: T, value: unknown): value is T[number] {
  return typeof value === "string" && (list as readonly string[]).includes(value);
}

export const JOB_VISA_INFO = ["stamp_2_ok", "work_permit_required", "eu_only", "not_informed"] as const;
export const SALARY_PERIODS = ["hour", "week", "month", "year"] as const;
export const PPSN_ANSWERS = ["yes", "no", "unknown"] as const;

/** Salário mínimo nacional da Irlanda, 20+ anos, desde 1 jan 2026 (citizensinformation.ie). */
export const IRISH_MIN_WAGE_HOURLY = 14.15;
