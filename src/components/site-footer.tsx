import { t } from "@/i18n";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:px-6">
        <p className="font-semibold text-foreground">{t.brand}</p>
        <p className="max-w-2xl">{t.landing.footer.disclaimer}</p>
        <a
          href="https://github.com/gilsonemanuel58-ai/job-match"
          className="w-fit text-primary underline-offset-4 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t.landing.footer.source}
        </a>
      </div>
    </footer>
  );
}
