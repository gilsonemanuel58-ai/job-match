"use client";

import { useEffect } from "react";

/**
 * Widget oficial "JobBox" do Careerjet (programa de publishers).
 * Roda no navegador do visitante: não precisa de IP fixo de servidor,
 * que a API do Careerjet exige e a Netlify grátis não tem.
 * O ID do widget é público (vai no HTML de qualquer site que usa o widget).
 */
const WIDGET_URL = "https://widget.careerjet.net/job-box/a469913e13e471c6177ba20363e1fd69";
const SCRIPT_SRC = "https://static.careerjet.org/js/all_widget_job_box_3rd_party.min.js";
const SCRIPT_ID = "cj-job-box";

export function CareerjetJobBox({ search, location }: { search: string; location: string }) {
  useEffect(() => {
    // O script do Careerjet lê os .cj-job-box quando carrega. Ao trocar de filtro,
    // recarregamos o script para ele montar o widget de novo (igual ao snippet oficial, com ?t=).
    document.getElementById(SCRIPT_ID)?.remove();
    const js = document.createElement("script");
    js.id = SCRIPT_ID;
    js.async = true;
    js.src = `${SCRIPT_SRC}?t=${Date.now()}`;
    document.body.appendChild(js);
    return () => js.remove();
  }, [search, location]);

  return (
    <div
      key={`${search}|${location}`}
      className="cj-job-box min-h-40"
      data-url={WIDGET_URL}
      data-search={search}
      data-location={location}
    />
  );
}
