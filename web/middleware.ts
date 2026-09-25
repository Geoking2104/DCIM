import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
  localePrefix: 'always',
  localeDetection: false
});

export const config = {
  matcher: ['/', '/(fr|en)/:path*']
};
