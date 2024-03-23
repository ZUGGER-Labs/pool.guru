"use server";

import { TFunction } from "i18next";
import { getLang } from "@/i18n/settings";
import { getTranslation } from "@/i18n/server";

export type HeaderProps = {
  t: TFunction;
  pathname: string;
  lang: string;
  searchParams: URLSearchParams;
};

export async function getHeaderProps(
  searchParams: URLSearchParams,
  pathname: string
): Promise<HeaderProps> {
  const lang = getLang(searchParams);
  const { t } = await getTranslation(lang);

  return {
    t,
    lang,
    pathname,
    searchParams: searchParams,
  };
}
