import type { ProfileBundle } from "@/lib/profile";
import type { RawValues } from "@/lib/validation";

/** Converte o perfil salvo em valores iniciais do formulário (tela de edição). */
export function profileToValues(p: ProfileBundle): RawValues {
  if (p.role === "candidate") {
    const c = p.candidate;
    return {
      fullName: p.fullName,
      region: c?.region ?? "",
      jobAreas: c?.jobAreas ?? [],
      visa: c?.visa ?? "",
      english: c?.english ?? "",
      employmentType: c?.employmentType ?? "",
      shifts: c?.shifts ?? [],
      availableFrom: c?.availableFrom ?? "",
    };
  }
  const co = p.company;
  return {
    fullName: p.fullName,
    companyName: co?.name ?? "",
    region: co?.region ?? "",
    website: co?.website ?? "",
    description: co?.description ?? "",
  };
}
