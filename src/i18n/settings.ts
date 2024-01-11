export const fallbackLng = process.env.NEXT_PUBLIC_DEFAULT_LANG || 'en';
export const languages = [fallbackLng];
export const defaultNS = "translation";
export const cookieName = "i18next";

export function getOptions(
  lng = fallbackLng,
  ns: string | string[] = defaultNS
) {
  return {
    debug: false, //process.env.NODE_ENV === 'development',
    supportedLngs: languages,
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns,
    // initImmediate: false,
  };
}

export function getLang(lang?: any) {
  if (!lang) {
    return fallbackLng;
  }

  const lng = lang["lang"] || fallbackLng;
  return lng;
}
