"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { parseJob, type JobFieldError } from "@/lib/job-validation";
import { rawValues, type RawValues } from "@/lib/validation";

export type JobFormState = { errors?: Record<string, JobFieldError>; formError?: "save" | "noCompany"; values?: RawValues };

export async function createJob(_prev: JobFormState, fd: FormData): Promise<JobFormState> {
  const parsed = parseJob(fd);
  if (!parsed.ok) return { errors: parsed.errors, values: parsed.values };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: company } = await supabase.from("companies").select("id, name").eq("owner_id", user.id).limit(1).maybeSingle();
  if (!company) return { formError: "noCompany", values: rawValues(fd) };

  const d = parsed.data;
  const { data: job, error } = await supabase
    .from("jobs")
    .insert({
      source: "native",
      company_id: company.id,
      company_name: company.name,
      title: d.title,
      region: d.region,
      area: d.area,
      employment_type: d.employmentType,
      shifts: d.shifts,
      hours_per_week: d.hoursPerWeek,
      salary_min: d.salaryMin,
      salary_max: d.salaryMax,
      salary_period: d.salaryPeriod,
      visa_info: d.visaInfo,
      english_required: d.englishRequired,
      requires_ppsn: d.requiresPpsn,
      description: d.description,
      requirements: d.requirements,
      posted_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !job) {
    console.error("createJob failed", error?.code, error?.message);
    return { formError: "save", values: rawValues(fd) };
  }
  revalidatePath("/jobs");
  revalidatePath("/employer");
  redirect(`/employer/jobs/${job.id}`);
}
