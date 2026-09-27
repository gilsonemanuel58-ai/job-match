import "server-only";
import { getCurrentRole, getCurrentUser } from "@/lib/auth";
import { getProfile } from "@/lib/profile";
import type { MatchCandidate } from "@/lib/match";

/** Dados do candidato logado para o match, ou null (visitante, empresa, sem perfil). */
export async function getMatchCandidate(): Promise<MatchCandidate | null> {
  const user = await getCurrentUser();
  if (!user || (await getCurrentRole()) !== "candidate") return null;
  const c = (await getProfile(user.id))?.candidate;
  if (!c) return null;
  return {
    region: c.region as MatchCandidate["region"],
    jobAreas: c.jobAreas,
    visa: c.visa as MatchCandidate["visa"],
    english: c.english as MatchCandidate["english"],
    employmentType: c.employmentType as MatchCandidate["employmentType"],
    shifts: c.shifts as MatchCandidate["shifts"],
  };
}
