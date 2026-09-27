"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { APPLICATION_STATUSES } from "@/lib/applications";
import { isOneOf } from "@/lib/options";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export type ApplyState = { error?: "generic" | "already" };

/** Candidato se candidata a uma vaga nativa. O banco valida papel, vaga aberta e duplicidade. */
export async function applyToJob(_prev: ApplyState, fd: FormData): Promise<ApplyState> {
  const jobId = String(fd.get("jobId") ?? "");
  if (!UUID_RE.test(jobId)) return { error: "generic" };
  const { supabase, user } = await requireUser();

  const { error } = await supabase.from("applications").insert({ job_id: jobId, candidate_id: user.id });
  if (error) {
    console.error("applyToJob failed", error.code, error.message);
    return { error: error.code === "23505" ? "already" : "generic" };
  }
  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/applications");
  return {};
}

export async function withdrawApplication(fd: FormData) {
  const id = String(fd.get("applicationId") ?? "");
  if (!UUID_RE.test(id)) return;
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("applications").delete().eq("id", id).eq("candidate_id", user.id);
  if (error) console.error("withdrawApplication failed", error.code, error.message);
  revalidatePath("/applications");
}

/** Empresa muda o status de uma candidatura. RLS: só a dona da vaga consegue. */
export async function updateApplicationStatus(fd: FormData) {
  const id = String(fd.get("applicationId") ?? "");
  const status = fd.get("status");
  const jobId = String(fd.get("jobId") ?? "");
  if (!UUID_RE.test(id) || !UUID_RE.test(jobId) || !isOneOf(APPLICATION_STATUSES, status)) return;
  const { supabase } = await requireUser();
  const { error } = await supabase.from("applications").update({ status }).eq("id", id);
  if (error) console.error("updateApplicationStatus failed", error.code, error.message);
  revalidatePath(`/employer/jobs/${jobId}`);
}

/** Empresa fecha ou reabre a própria vaga. */
export async function setJobOpen(fd: FormData) {
  const jobId = String(fd.get("jobId") ?? "");
  const open = fd.get("open") === "true";
  if (!UUID_RE.test(jobId)) return;
  const { supabase } = await requireUser();
  const { error } = await supabase.from("jobs").update({ status: open ? "open" : "closed" }).eq("id", jobId);
  if (error) console.error("setJobOpen failed", error.code, error.message);
  revalidatePath(`/employer/jobs/${jobId}`);
  revalidatePath("/employer");
  revalidatePath("/jobs");
}
