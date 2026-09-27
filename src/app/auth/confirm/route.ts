import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Destino do link do e-mail.
 * - `token_hash` + `type`: funciona mesmo se o e-mail for aberto em outro aparelho.
 * - `code`: fluxo PKCE padrão do Supabase (mesmo navegador).
 * Depois de logar: sem perfil → onboarding; com perfil → perfil.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const code = url.searchParams.get("code");

  const supabase = await createClient();
  let ok = false;

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    ok = !error;
    if (error) console.error("verifyOtp failed", error.status, error.message);
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
    if (error) console.error("exchangeCodeForSession failed", error.status, error.message);
  }

  const redirectTo = request.nextUrl.clone();
  redirectTo.search = "";

  if (!ok) {
    redirectTo.pathname = "/login";
    redirectTo.searchParams.set("error", "link");
    return NextResponse.redirect(redirectTo);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("id").eq("id", user!.id).maybeSingle();

  redirectTo.pathname = profile ? "/profile" : "/onboarding";
  return NextResponse.redirect(redirectTo);
}
