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
