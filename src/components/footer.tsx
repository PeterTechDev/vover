import Link from "next/link";
import { getTranslations } from "next-intl/server";

interface FooterProps {
  isLoggedIn?: boolean;
}

export async function Footer({ isLoggedIn = false }: FooterProps) {
  const t = await getTranslations("Footer");
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-border/30 bg-background px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          {/* Brand */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground font-extrabold text-xs shadow-sm shadow-primary/30">
                V
              </div>
              <span className="font-extrabold text-sm tracking-tight">over</span>
            </div>
            <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed">
              {t("tagline")}
            </p>
          </div>

          {/* Links grid */}
          <div className="flex flex-wrap gap-x-10 gap-y-4 text-sm">
            <div className="flex flex-col gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">{t("explore")}</p>
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">{t("discover")}</Link>
              <Link href="/feed" className="text-muted-foreground hover:text-foreground transition-colors">{t("feed")}</Link>
              <Link href="/stats" className="text-muted-foreground hover:text-foreground transition-colors">{t("stats")}</Link>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">{t("account")}</p>
              <Link href="/watchlist" className="text-muted-foreground hover:text-foreground transition-colors">{t("watchlist")}</Link>
              <Link href="/watched" className="text-muted-foreground hover:text-foreground transition-colors">{t("watched")}</Link>
              {isLoggedIn ? (
                <Link href="/profile" className="text-muted-foreground hover:text-foreground transition-colors">{t("profile")}</Link>
              ) : (
                <Link href="/auth" className="text-muted-foreground hover:text-foreground transition-colors">{t("signIn")}</Link>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">{t("company")}</p>
              <Link href="/about" className="text-muted-foreground/60 hover:text-foreground transition-colors">{t("about")}</Link>
              <Link href="/privacy" className="text-muted-foreground/60 hover:text-foreground transition-colors">{t("privacy")}</Link>
              <Link href="/terms" className="text-muted-foreground/60 hover:text-foreground transition-colors">{t("terms")}</Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-center gap-2 border-t border-border/20 pt-6 text-center md:flex-row md:justify-between">
          <p className="text-xs text-muted-foreground/80">
            &copy; {year} Vover. {t("allRightsReserved")}
          </p>
          <p className="text-xs text-muted-foreground/70">
            {t("movieDataBy")}{" "}
            <a
              href="https://www.themoviedb.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-muted-foreground transition-colors"
            >
              TMDB
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
