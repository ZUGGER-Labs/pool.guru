import { createInstance, FlatNamespace, KeyPrefix } from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next/initReactI18next";
import { getOptions } from "./settings";
import { FallbackNs } from "react-i18next";
/*
import * as enTrans from './locales/en.json'
import * as zhTrans from './locales/zh-CN.json'

i18next.use(initReactI18next)
// .use(resourcesToBackend((language: string, namespace: string) => import(`./locales/${language}.json`)))
const defaultNS = 'translation'
console.log('en locale:', enTrans)
i18next.init({
    resources: {
        en: {
            translation: enTrans,
        },
        'zh-CN': {
            translation: zhTrans,
        }
    },
    debug: true,
    supportedLngs: ['en', 'zh-CN'],
    fallbackLng: 'en',
    lng: 'en',
    // fallbackNS: defaultNS,
    // defaultNS,
    // ns: [],
    initImmediate: false
})
// await i18next.init(getOptions())

export default i18next
*/

/*
const initI18next = (lang: string, ns?: string) => {
  const i18nInstance = createInstance()
  i18nInstance
    .use(initReactI18next)
    .use(resourcesToBackend((language: string, namespace: string) => import(`./locales/${language}.json`)))
    .init(getOptions(lang, ns))

  return i18nInstance
}

export function useTranslation(lang: string, ns?: string) {
  const i18nextInstance = initI18next(lang, ns)
  console.log('useTranslation', lang, ns)

    const i18nEn = i18nextInstance.getFixedT('zh-CN')
//   console.log('i18nextInstance', i18nextInstance)
  console.log('exploreTopLink', i18nEn('exploreTopLink'))
  return {
    t: i18nextInstance.getFixedT(lang, Array.isArray(ns) ? ns[0] : ns),
    i18n: i18nextInstance
  }
}
*/

const initI18next = async (lng: string, ns: string | string[]) => {
  // on server side we create a new instance for each render, because during compilation everything seems to be executed in parallel
  const i18nInstance = createInstance();
  await i18nInstance
    .use(initReactI18next)
    .use(
      resourcesToBackend(
        (language: string, namespace: string) =>
          import(`./locales/${language}.json`)
      )
    )
    .init(getOptions(lng, ns));
  return i18nInstance;
};

export async function getTranslation<
  Ns extends FlatNamespace,
  KPrefix extends KeyPrefix<FallbackNs<Ns>> = undefined
>(lng: string, ns?: Ns, options: { keyPrefix?: KPrefix } = {}) {
  const i18nextInstance = await initI18next(
    lng,
    Array.isArray(ns) ? (ns as string[]) : (ns as string)
  );
  return {
    t: i18nextInstance.getFixedT(lng, ns, options.keyPrefix),
    i18n: i18nextInstance,
  };
}
