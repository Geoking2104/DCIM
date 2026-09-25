import {getRequestConfig} from 'next-intl/server';

export const locales = ['fr', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'fr';

export default getRequestConfig(async ({locale, requestLocale}) => {
  let resolved = locale || (requestLocale ? await requestLocale : defaultLocale);
  if (!locales.includes(resolved as Locale)) resolved = defaultLocale;
  return {
    locale: resolved,
    messages: (await import(`../messages/${resolved}.json`)).default
  };
});
