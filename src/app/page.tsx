import { Badge } from "@/components/ui/badge";
import { t } from "@/i18n";

// Página provisória. A landing page real só será desenhada
// depois que as referências visuais forem aprovadas.
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-4 px-4 py-16">
      <Badge variant="muted" className="w-fit">{t.placeholder.status}</Badge>
      <h1 className="text-4xl font-semibold tracking-tight">{t.placeholder.title}</h1>
      <p className="text-lg text-muted-foreground">{t.placeholder.subtitle}</p>
    </main>
  );
}
