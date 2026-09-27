import "server-only";
import { createClient } from "@/lib/supabase/server";
import { EMPLOYMENT_TYPES, JOB_AREAS, REGIONS, isOneOf } from "@/lib/options";
import type { JobDetail, JobSummary } from "@/lib/types";

const SUMMARY_COLUMNS =
  "id, source, title, company_name, region, area, employment_type, shifts, salary_min, salary_max, salary_period, visa_info, visa_signal, english_required, requires_ppsn, external_url, is_demo";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

function toSummary(r: Row): JobSummary {
  return {
    id: r.id,
    source: r.source,
    title: r.title,
    companyName: r.company_name,
    region: r.region,
    area: r.area,
    employmentType: r.employment_type,
    shifts: r.shifts ?? [],
    salaryMin: r.salary_min == null ? null : Number(r.salary_min),
    salaryMax: r.salary_max == null ? null : Number(r.salary_max),
    salaryPeriod: r.salary_period,
    visaInfo: r.visa_info,
    visaSignal: r.visa_signal,
    englishRequired: r.english_required,
    requiresPpsn: r.requires_ppsn,
    externalUrl: r.external_url,
    isDemo: r.is_demo,
  };
}

export interface JobFilters {
  q?: string;
  region?: string;
  area?: string;
  type?: string;
}

/** Só aceita filtros conhecidos. Qualquer outra coisa na URL é ignorada. */
export function cleanFilters(raw: Record<string, string | string[] | undefined>): JobFilters {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;
  const q = one(raw.q)?.slice(0, 80);
  const region = one(raw.region);
  const area = one(raw.area);
  const type = one(raw.type);
  return {
    q,
    region: isOneOf(REGIONS, region) ? region : undefined,
    area: isOneOf(JOB_AREAS, area) ? area : undefined,
    type: isOneOf(EMPLOYMENT_TYPES, type) ? type : undefined,
  };
}

export async function listJobs(filters: JobFilters): Promise<{ jobs: JobSummary[]; error: boolean }> {
  const supabase = await createClient();
  let query = supabase.from("jobs").select(SUMMARY_COLUMNS).eq("status", "open");

  if (filters.region) query = query.eq("region", filters.region);
  if (filters.area) query = query.eq("area", filters.area);
  // "both" (tanto faz) aceita qualquer vaga; part-time também mostra vagas "both".
  if (filters.type && filters.type !== "both") query = query.in("employment_type", [filters.type, "both"]);
  if (filters.q) {
    // Remove caracteres com significado especial no filtro do PostgREST.
    const term = filters.q.replace(/[%,()*\\"':]/g, " ").trim();
    if (term) query = query.or(`title.ilike.%${term}%,company_name.ilike.%${term}%`);
  }

  const { data, error } = await query.order("posted_at", { ascending: false, nullsFirst: false }).limit(50);
  if (error) {
    console.error("listJobs failed", error.code, error.message);
    return { jobs: [], error: true };
  }
  return { jobs: (data ?? []).map(toSummary), error: false };
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getJob(id: string): Promise<JobDetail | null> {
  if (!UUID_RE.test(id)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select(`${SUMMARY_COLUMNS}, description, requirements, hours_per_week, posted_at, status, companies(description, website)`)
    .eq("id", id)
    .maybeSingle();
  if (error) console.error("getJob failed", error.code, error.message);
  if (!data) return null;
  const company = Array.isArray(data.companies) ? data.companies[0] : data.companies;
  return {
    ...toSummary(data),
    description: data.description ?? "",
    requirements: data.requirements,
    hoursPerWeek: data.hours_per_week,
    postedAt: data.posted_at,
    companyDescription: company?.description ?? null,
    companyWebsite: company?.website ?? null,
    status: data.status,
  };
}
