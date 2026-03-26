"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLocaleCookie } from "@/actions/set-locale";
import { Button } from "@/components/ui/button";

interface LanguageSwitcherProps {
  currentLocale: string;
}

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const t = useTranslations("LanguageSwitcher");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleSwitch() {
    const next = currentLocale === "pt-BR" ? "en" : "pt-BR";
    await setLocaleCookie(next);
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-xs font-semibold text-muted-foreground hover:text-foreground px-2"
      onClick={handleSwitch}
      disabled={isPending}
      aria-label={t("label")}
    >
      {currentLocale === "pt-BR" ? t("en") : t("ptBR")}
    </Button>
  );
}
