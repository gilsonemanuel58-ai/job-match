// Match entre candidato e vaga. Regras simples, transparentes e fáceis de mudar.
// Função pura: sem banco, sem rede — por isso é testada isoladamente.

import type { EmploymentType, EnglishLevel, JobVisaInfo, Region, Shift } from "@/lib/types";

export interface MatchCandidate {
  region: Region | null;
  jobAreas: string[];
  visa: "stamp_2" | "stamp_1g" | "stamp_4" | "eu_eea" | "other" | null;
  english: EnglishLevel | null;
  employmentType: EmploymentType | null;
  shifts: Shift[];
}

export interface MatchJob {
  region: Region;
  area: string | null;
  visaInfo: JobVisaInfo;
  englishRequired: EnglishLevel | null;
  employmentType: EmploymentType | null;
  shifts: Shift[];
  hoursPerWeek: number | null;
}

/** Motivos e avisos são chaves; o texto fica no i18n. */
export type MatchReason = "region" | "nearbyRegion" | "area" | "visa" | "english" | "shifts" | "jobType";
export type MatchWarning =
  | "visaPermit" // Stamp 2 e a vaga pede work permit
  | "visaEuOnly" // não-EU e a vaga é só EU/EEA
  | "visaUnknown" // vaga não informa visto (Stamp 2)
  | "stamp2Hours" // mais de 20h/semana — só permitido nas férias
  | "stamp2FullTime" // full-time sem horas informadas, com Stamp 2
  | "englishAbove"; // pede inglês acima do nível do candidato

export interface Match {
  score: number; // 0–100
  reasons: MatchReason[];
  warnings: MatchWarning[];
  /** Há um impedimento legal/formal provável (visto). */
  blocked: boolean;
}

export const WEIGHTS = { region: 30, nearbyRegion: 15, area: 25, visa: 20, english: 10, shifts: 10, jobType: 5 } as const;
export const ENGLISH_PENALTY = 15;
export const BLOCKED_MAX_SCORE = 20;
/** irishimmigration.ie: Stamp 2 pode trabalhar 20h/semana durante as aulas. */
export const STAMP2_TERM_HOURS = 20;

const ENGLISH_ORDER: EnglishLevel[] = ["basic", "intermediate", "advanced", "fluent"];

export function computeMatch(c: MatchCandidate, j: MatchJob): Match {
  let score = 0;
  const reasons: MatchReason[] = [];
  const warnings: MatchWarning[] = [];
  let blocked = false;

  // Cidade
  if (c.region && c.region === j.region) {
    score += WEIGHTS.region;
    reasons.push("region");
  } else if (c.region && isDublin(c.region) && isDublin(j.region)) {
    score += WEIGHTS.nearbyRegion;
    reasons.push("nearbyRegion");
  }

  // Área de trabalho
  if (j.area && c.jobAreas.includes(j.area)) {
    score += WEIGHTS.area;
    reasons.push("area");
  }

  // Visto
  const fullRights = c.visa === "stamp_4" || c.visa === "stamp_1g" || c.visa === "eu_eea";
  if (j.visaInfo === "eu_only") {
    if (c.visa === "eu_eea") {
      score += WEIGHTS.visa;
      reasons.push("visa");
    } else if (c.visa) {
      blocked = true;
      warnings.push("visaEuOnly");
    }
  } else if (j.visaInfo === "work_permit_required") {
    if (fullRights) {
      score += WEIGHTS.visa;
      reasons.push("visa");
    } else if (c.visa === "stamp_2") {
      blocked = true;
      warnings.push("visaPermit");
    }
  } else if (j.visaInfo === "stamp_2_ok") {
    if (c.visa === "stamp_2" || fullRights) {
      score += WEIGHTS.visa;
      reasons.push("visa");
    }
  } else if (c.visa === "stamp_2") {
    warnings.push("visaUnknown");
  }

  // Horas com Stamp 2
  if (c.visa === "stamp_2") {
    if (j.hoursPerWeek != null && j.hoursPerWeek > STAMP2_TERM_HOURS) warnings.push("stamp2Hours");
    else if (j.hoursPerWeek == null && j.employmentType === "full_time") warnings.push("stamp2FullTime");
  }

  // Inglês
  if (j.englishRequired && c.english) {
    if (ENGLISH_ORDER.indexOf(c.english) >= ENGLISH_ORDER.indexOf(j.englishRequired)) {
      score += WEIGHTS.english;
      reasons.push("english");
    } else {
      score -= ENGLISH_PENALTY;
      warnings.push("englishAbove");
    }
  }

  // Horários
  if (c.shifts.includes("flexible") || j.shifts.includes("flexible") || c.shifts.some((s) => j.shifts.includes(s))) {
    if (c.shifts.length && j.shifts.length) {
      score += WEIGHTS.shifts;
      reasons.push("shifts");
    }
  }

  // Tipo de contrato
  if (c.employmentType && j.employmentType) {
    const ok = c.employmentType === "both" || j.employmentType === "both" || c.employmentType === j.employmentType;
    if (ok) {
      score += WEIGHTS.jobType;
      reasons.push("jobType");
    }
  }

  score = Math.max(0, Math.min(100, score));
  if (blocked) score = Math.min(score, BLOCKED_MAX_SCORE);
  return { score, reasons, warnings, blocked };
}

function isDublin(r: Region) {
  return r === "dublin_city" || r === "dublin_county";
}

/** Ordena por match (maior primeiro); empate mantém a ordem original (mais recente). */
export function sortByMatch<T>(items: T[], getMatch: (x: T) => Match): T[] {
  return items
    .map((x, i) => ({ x, i, m: getMatch(x) }))
    .sort((a, b) => b.m.score - a.m.score || a.i - b.i)
    .map((e) => e.x);
}
