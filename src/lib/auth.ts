import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/** Usuário logado (validado no servidor do Supabase) ou null. Uma chamada por requisição. */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/** Papel do usuário logado ("candidate" | "employer") ou null (sem login ou sem perfil). */
export const getCurrentRole = cache(async (): Promise<"candidate" | "employer" | null> => {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return (data?.role as "candidate" | "employer" | undefined) ?? null;
});
