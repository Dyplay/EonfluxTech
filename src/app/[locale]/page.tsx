import { useTranslations } from 'next-intl';

type Props = {
  params: { locale: string }
};

export default function Home({ params: { locale } }: Props) {
  const t = useTranslations();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="py-12 text-center">
        <h1 className="text-4xl font-bold mb-4">{t('home.hero_title')}</h1>
        <p className="text-xl mb-8">{t('home.hero_subtitle')}</p>
        <button className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors">
          {t('home.cta_button')}
        </button>
      </section>
      
      <section className="py-12">
        <h2 className="text-2xl font-bold mb-6 text-center">{t('home.featured_products')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Product cards would go here */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Product 1</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Product description goes here.</p>
            <button className="text-primary hover:underline">{t('home.learn_more')}</button>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Product 2</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Product description goes here.</p>
            <button className="text-primary hover:underline">{t('home.learn_more')}</button>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Product 3</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Product description goes here.</p>
            <button className="text-primary hover:underline">{t('home.learn_more')}</button>
          </div>
        </div>
      </section>
      
      <section className="py-12">
        <h2 className="text-2xl font-bold mb-6 text-center">{t('home.testimonials')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Testimonial cards would go here */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p className="italic mb-4">"This product has transformed our business operations."</p>
            <p className="font-semibold">- John Doe, CEO</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p className="italic mb-4">"The best solution we've found for our needs."</p>
            <p className="font-semibold">- Jane Smith, CTO</p>
          </div>
        </div>
      </section>
    </div>
  );
} 