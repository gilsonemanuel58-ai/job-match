"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { parseCandidate, parseEmployer, rawValues, type FieldError, type RawValues } from "@/lib/validation";

export type SaveState = {
  errors?: Record<string, FieldError>;
  formError?: boolean;
  values?: RawValues;
};

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function saveCandidate(_prev: SaveState, fd: FormData): Promise<SaveState> {
  const parsed = parseCandidate(fd);
  if (!parsed.ok) return { errors: parsed.errors, values: parsed.values };
  const { supabase, user } = await requireUser();
  const d = parsed.data;

  // 1) perfil base (o banco impede trocar candidato ↔ empresa depois)
  const { error: e1 } = await supabase
    .from("profiles")
    .upsert({ id: user.id, role: "candidate", full_name: d.fullName }, { onConflict: "id" });
  // 2) dados do candidato
  const { error: e2 } = e1
    ? { error: e1 }
    : await supabase.from("candidate_profiles").upsert(
        {
          user_id: user.id,
          region: d.region,
          job_areas: d.jobAreas,
          visa: d.visa,
          english: d.english,
          employment_type: d.employmentType,
          shifts: d.shifts,
          available_from: d.availableFrom,
        },
        { onConflict: "user_id" }
      );

  if (e2) {
    console.error("saveCandidate failed", e2.code, e2.message);
    return { formError: true, values: rawValues(fd) };
  }
  redirect("/profile");
}

export async function saveEmployer(_prev: SaveState, fd: FormData): Promise<SaveState> {
  const parsed = parseEmployer(fd);
  if (!parsed.ok) return { errors: parsed.errors, values: parsed.values };
  const { supabase, user } = await requireUser();
  const d = parsed.data;

  const { error: e1 } = await supabase
    .from("profiles")
    .upsert({ id: user.id, role: "employer", full_name: d.fullName }, { onConflict: "id" });

  let error = e1;
  if (!error) {
    const company = { name: d.companyName, region: d.region, website: d.website, description: d.description };
    const { data: existing } = await supabase.from("companies").select("id").eq("owner_id", user.id).limit(1).maybeSingle();
    ({ error } = existing
      ? await supabase.from("companies").update(company).eq("id", existing.id)
      : await supabase.from("companies").insert({ ...company, owner_id: user.id }));
  }

  if (error) {
    console.error("saveEmployer failed", error.code, error.message);
    return { formError: true, values: rawValues(fd) };
  }
  redirect("/profile");
}
