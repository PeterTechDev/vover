"use server";

import { cookies } from "next/headers";

export async function setLocaleCookie(locale: string) {
  const validLocales = ["pt-BR", "en"];
  if (!validLocales.includes(locale)) return;
  const cookieStore = await cookies();
  cookieStore.set("NEXT_LOCALE", locale, {
    maxAge: 365 * 24 * 60 * 60,
    path: "/",
    sameSite: "lax",
  });
}
