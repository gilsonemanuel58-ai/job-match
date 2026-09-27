// Tipos que espelham o banco (supabase/migrations/0001_initial_schema.sql).
// Se mudar um enum no banco, mude aqui também.

export type Region = "dublin_city" | "dublin_county" | "cork" | "limerick";
export type JobSource = "native" | "careerjet";
export type JobVisaInfo = "stamp_2_ok" | "work_permit_required" | "eu_only" | "not_informed";
export type EnglishLevel = "basic" | "intermediate" | "advanced" | "fluent";
export type EmploymentType = "full_time" | "part_time" | "both";
export type Shift = "morning" | "afternoon" | "evening" | "night" | "weekend" | "flexible";
export type SalaryPeriod = "hour" | "week" | "month" | "year";

/** O que a tela precisa para desenhar uma vaga. `null` = não informado. */
export interface JobSummary {
  id: string;
  source: JobSource;
  title: string;
  companyName: string;
  region: Region;
  area: string | null;
  employmentType: EmploymentType | null;
  shifts: Shift[];
  salaryMin: number | null;
  salaryMax: number | null;
  salaryPeriod: SalaryPeriod | null;
  visaInfo: JobVisaInfo;
  visaSignal: string | null; // trecho do anúncio (vagas externas)
  englishRequired: EnglishLevel | null;
  requiresPpsn: boolean | null;
  externalUrl: string | null;
  isDemo: boolean;
}

/** Vaga completa, para a página de detalhe. */
export interface JobDetail extends JobSummary {
  description: string;
  requirements: string | null;
  hoursPerWeek: number | null;
  postedAt: string | null;
  companyDescription: string | null;
  companyWebsite: string | null;
}

/** Resultado do match. `null` quando o usuário ainda não tem perfil. */
export interface MatchResult {
  score: number; // 0–100
  reasons: string[];
}
