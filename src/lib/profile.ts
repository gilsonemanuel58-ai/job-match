import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/options";

export interface ProfileBundle {
  role: UserRole;
  fullName: string;
  candidate: {
    region: string | null;
    jobAreas: string[];
    visa: string | null;
    english: string | null;
    employmentType: string | null;
    shifts: string[];
    availableFrom: string | null;
  } | null;
  company: {
    id: string;
    name: string;
    region: string | null;
    website: string | null;
    description: string | null;
  } | null;
}

/** Perfil completo do usuário logado. null = ainda não fez o onboarding. RLS garante que só lê o próprio. */
export async function getProfile(userId: string): Promise<ProfileBundle | null> {
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", userId).maybeSingle();
  if (!profile) return null;

  if (profile.role === "candidate") {
    const { data: c } = await supabase
      .from("candidate_profiles")
      .select("region, job_areas, visa, english, employment_type, shifts, available_from")
      .eq("user_id", userId)
      .maybeSingle();
    return {
      role: "candidate",
      fullName: profile.full_name,
      company: null,
      candidate: c
        ? {
            region: c.region,
            jobAreas: c.job_areas ?? [],
            visa: c.visa,
            english: c.english,
            employmentType: c.employment_type,
            shifts: c.shifts ?? [],
            availableFrom: c.available_from,
          }
        : null,
    };
  }

  const { data: co } = await supabase
    .from("companies")
    .select("id, name, region, website, description")
    .eq("owner_id", userId)
    .order("created_at")
    .limit(1)
    .maybeSingle();
  return { role: "employer", fullName: profile.full_name, candidate: null, company: co ?? null };
}
