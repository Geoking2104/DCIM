import {getRequestConfig} from 'next-intl/server';

export const locales = ['fr', 'en'] as const;
export const defaultLocale = 'fr';

export default getRequestConfig(async ({locale}) => {
  const resolved = locales.includes(locale as any) ? locale : defaultLocale;
  return {
    locale: resolved,
    messages: (await import(`../messages/${resolved}.json`)).default
  };
});
