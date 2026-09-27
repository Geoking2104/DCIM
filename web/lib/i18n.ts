import {getRequestConfig} from 'next-intl/server';

export const locales = ['fr', 'en'] as const;
export const defaultLocale = 'fr';

export default getRequestConfig(async ({requestLocale}) => {
  const requested = await requestLocale;
  const resolved = locales.find((locale) => locale === requested) ?? defaultLocale;
  return {
    locale: resolved,
    messages: (await import(`../messages/${resolved}.json`)).default
  };
});
