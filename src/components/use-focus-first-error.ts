"use client";

import { useEffect, useRef } from "react";

/**
 * Depois de um envio com erro, leva a pessoa até o primeiro campo com problema.
 * Sem isso, no celular o erro fica fora da tela e parece que o botão não fez nada.
 */
export function useFocusFirstError(state: unknown, hasErrors: boolean) {
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (!hasErrors || !formRef.current) return;
    const first = formRef.current.querySelector<HTMLElement>('[aria-invalid="true"]');
    const target = first ?? formRef.current.querySelector<HTMLElement>('[role="alert"]');
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    // fieldset não recebe foco; foca o primeiro input dentro dele
    const focusable = target.matches("input, select, textarea") ? target : target.querySelector<HTMLElement>("input, select, textarea");
    focusable?.focus({ preventScroll: true });
  }, [state, hasErrors]);
  return formRef;
}
