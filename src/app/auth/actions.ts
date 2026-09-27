"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isOneOf, USER_ROLES } from "@/lib/options";

export type MagicLinkState =
  | { status: "idle" }
  | { status: "sent"; email: string }
  | { status: "error"; error: "invalidEmail" | "rateLimit" | "generic"; email: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Envia o link mágico. Serve para login e cadastro (o Supabase cria a conta se não existir). */
export async function sendMagicLink(_prev: MagicLinkState, formData: FormData): Promise<MagicLinkState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = formData.get("role");

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return { status: "error", error: "invalidEmail", email };
  }

  const origin = (await headers()).get("origin");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: origin ? `${origin}/auth/confirm` : undefined,
      // O tipo de conta escolhido no cadastro. Só vale para contas novas;
      // o perfil definitivo é criado no onboarding.
      data: isOneOf(USER_ROLES, role) ? { role } : undefined,
    },
  });

  if (error) {
    const rate = error.status === 429 || /rate limit/i.test(error.message);
    console.error("signInWithOtp failed", error.status, error.message);
    return { status: "error", error: rate ? "rateLimit" : "generic", email };
  }

  return { status: "sent", email };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
