import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Define the list of supported locales
export const locales = ['en', 'de', 'hu'];
export const defaultLocale = 'en';

export default getRequestConfig(async ({ locale }) => {
  // Validate that the locale is supported
  if (!locale || !locales.includes(locale as any)) {
    notFound();
  }

  return {
    messages: (await import(`./messages/${locale}.json`)).default,
    locale: locale
  };
}); 