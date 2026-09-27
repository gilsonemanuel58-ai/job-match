import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Region } from "@/lib/types";

export const APPLICATION_STATUSES = ["applied", "reviewing", "interview", "rejected", "hired"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export interface MyApplication {
  id: string;
  status: ApplicationStatus;
  createdAt: string;
  job: { id: string; title: string; companyName: string; region: Region; isDemo: boolean; open: boolean };
}

/** Candidatura do usuário logado para uma vaga (RLS: só a própria). */
export async function getMyApplicationFor(jobId: string, userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("applications")
    .select("id, status, created_at")
    .eq("job_id", jobId)
    .eq("candidate_id", userId)
    .maybeSingle();
  return data ? { id: data.id as string, status: data.status as ApplicationStatus, createdAt: data.created_at as string } : null;
}

export async function listMyApplications(userId: string): Promise<MyApplication[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select("id, status, created_at, jobs(id, title, company_name, region, is_demo, status)")
    .eq("candidate_id", userId)
    .order("created_at", { ascending: false });
  if (error) console.error("listMyApplications failed", error.code, error.message);
  return (data ?? []).flatMap((a) => {
    const j = Array.isArray(a.jobs) ? a.jobs[0] : a.jobs;
    // O banco deixa o candidato ler vagas em que se candidatou, mesmo fechadas.
    return [
      {
        id: a.id,
        status: a.status,
        createdAt: a.created_at,
        job: j
          ? { id: j.id, title: j.title, companyName: j.company_name, region: j.region, isDemo: j.is_demo, open: j.status === "open" }
          : { id: "", title: "—", companyName: "—", region: "dublin_city" as Region, isDemo: false, open: false },
      },
    ];
  });
}

export interface EmployerJobRow {
  id: string;
  title: string;
  region: Region;
  open: boolean;
  createdAt: string;
  applicants: number;
}

export async function listCompanyJobs(companyId: string): Promise<EmployerJobRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("id, title, region, status, created_at, applications(count)")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
  if (error) console.error("listCompanyJobs failed", error.code, error.message);
  return (data ?? []).map((j) => ({
    id: j.id,
    title: j.title,
    region: j.region,
    open: j.status === "open",
    createdAt: j.created_at,
    applicants: (j.applications as { count: number }[] | null)?.[0]?.count ?? 0,
  }));
}

export interface Applicant {
  applicationId: string;
  status: ApplicationStatus;
  appliedAt: string;
  name: string;
  email: string | null;
  region: string | null;
  visa: string | null;
  english: string | null;
  employmentType: string | null;
  shifts: string[];
  availableFrom: string | null;
  jobAreas: string[];
}

/** Vaga da empresa + candidatos. RLS garante que só a dona da vaga lê. */
export async function getEmployerJob(jobId: string, companyId: string) {
  const supabase = await createClient();
  const { data: job } = await supabase
    .from("jobs")
    .select("id, title, region, status, company_id")
    .eq("id", jobId)
    .eq("company_id", companyId)
    .maybeSingle();
  if (!job) return null;

  const { data, error } = await supabase
    .from("applications")
    .select(
      "id, status, created_at, profiles(full_name, email, candidate_profiles(region, visa, english, employment_type, shifts, available_from, job_areas))"
    )
    .eq("job_id", jobId)
    .order("created_at", { ascending: true });
  if (error) console.error("getEmployerJob applicants failed", error.code, error.message);

  const applicants: Applicant[] = (data ?? []).map((a) => {
    const p = (Array.isArray(a.profiles) ? a.profiles[0] : a.profiles) as Record<string, unknown> | null;
    const cpRaw = p?.candidate_profiles as unknown;
    const cp = (Array.isArray(cpRaw) ? cpRaw[0] : cpRaw) as Record<string, unknown> | null;
    return {
      applicationId: a.id,
      status: a.status,
      appliedAt: a.created_at,
      name: (p?.full_name as string) || "—",
      email: (p?.email as string) ?? null,
      region: (cp?.region as string) ?? null,
      visa: (cp?.visa as string) ?? null,
      english: (cp?.english as string) ?? null,
      employmentType: (cp?.employment_type as string) ?? null,
      shifts: (cp?.shifts as string[]) ?? [],
      availableFrom: (cp?.available_from as string) ?? null,
      jobAreas: (cp?.job_areas as string[]) ?? [],
    };
  });

  return { id: job.id as string, title: job.title as string, region: job.region as Region, open: job.status === "open", applicants };
}
