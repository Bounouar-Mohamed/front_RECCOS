import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Bebas_Neue, Inter } from 'next/font/google';
import { routing } from '@/i18n/routing';
import { Metadata } from 'next';
import { css } from '@/styled-system/css';
import '../globals.css';
import { Navbar } from '../components/Navbar';
import { PreloaderWrapper } from '../components/PreloaderWrapper';
import { Logo } from '@/app/ui/logo';
import { LenisProvider } from '../components/LenisProvider';
import { LenisScrollTriggerBridge } from '../components/LenisScrollTriggerBridge';
import { DebugScroll } from '../components/DebugScroll';
import { ConditionalFooter } from '@/app/components/ConditionalFooter';
import { MobileGuard } from '../components/MobileGuard';
import { ToastProvider } from '@/app/components/Toast/ToastProvider';
import { AuthHydrator } from '@/app/components/AuthHydrator';


const headerStyles = {
  container: css({
    position: 'fixed',
    top: { base: 4, md: 6 },
    left: { base: 4, md: 8 },
    right: { base: 4, md: 8 },
    zIndex: 10000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: { base: 'calc(100% - 2rem)', md: 'calc(100% - 4rem)' },
    gap: { base: 2, md: 4 },
  }),
};

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas-neue',
});

const inter = Inter({
  weight: ['200', '500'],
  subsets: ['latin'],
  variable: '--font-inter',
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Métadonnées SEO par locale
const metadataByLocale: Record<string, Metadata> = {
  fr: {
    title: 'RECCOS - Investissement Immobilier Fractionné à Dubai | Appartements Pas Chers',
    description: 'Investissez dans l\'immobilier à Dubai avec RECCOS. Achetez des parts d\'appartements Damac, Emaar et autres promoteurs à prix réduits. Investissement immobilier fractionné accessible, appartements pas chers à Dubai, UAE. Plateforme sécurisée pour acheter et revendre des tokens immobiliers.',
    keywords: 'investissement immobilier, appartement pas cher, Dubai, UAE, Damac, Emaar, investissement, parts d\'appartements, fractionné, tokens, immobilier Dubai, appartement Dubai, investir Dubai, propriété fractionnée, real estate Dubai, investissement accessible, appartement abordable, promoteur immobilier Dubai, marché immobilier UAE',
    openGraph: {
      title: 'RECCOS - Investissement Immobilier Fractionné à Dubai | Appartements Pas Chers',
      description: 'Investissez dans l\'immobilier à Dubai avec RECCOS. Achetez des parts d\'appartements Damac, Emaar et autres promoteurs à prix réduits. Investissement accessible, appartements pas chers.',
      url: 'https://reccos.ae',
      siteName: 'RECCOS',
      locale: 'fr_FR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'RECCOS - Investissement Immobilier Fractionné à Dubai',
      description: 'Investissez dans l\'immobilier à Dubai. Appartements pas chers, Damac, Emaar. Investissement accessible.',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: 'https://reccos.ae',
      languages: {
        'fr': 'https://reccos.ae/fr',
        'en': 'https://reccos.ae/en',
        'ar': 'https://reccos.ae/ar',
      },
    },
    other: {
      'geo.region': 'AE-DU',
      'geo.placename': 'Dubai',
      'geo.position': '25.2048;55.2708',
      'ICBM': '25.2048, 55.2708',
    },
  },
  en: {
    title: 'RECCOS - Fractional Real Estate Investment in Dubai | Cheap Apartments',
    description: 'Invest in Dubai real estate with RECCOS. Buy apartment shares from Damac, Emaar and other developers at reduced prices. Accessible fractional real estate investment, cheap apartments in Dubai, UAE. Secure platform to buy and resell real estate tokens.',
    keywords: 'real estate investment, cheap apartments, Dubai, UAE, Damac, Emaar, investment, apartment shares, fractional, tokens, Dubai real estate, Dubai apartments, invest Dubai, fractional ownership, Dubai property, accessible investment, affordable apartments, Dubai developers, UAE real estate market',
    openGraph: {
      title: 'RECCOS - Fractional Real Estate Investment in Dubai | Cheap Apartments',
      description: 'Invest in Dubai real estate with RECCOS. Buy apartment shares from Damac, Emaar and other developers at reduced prices. Accessible investment, cheap apartments.',
      url: 'https://reccos.ae',
      siteName: 'RECCOS',
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'RECCOS - Fractional Real Estate Investment in Dubai',
      description: 'Invest in Dubai real estate. Cheap apartments, Damac, Emaar. Accessible investment.',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: 'https://reccos.ae',
      languages: {
        'fr': 'https://reccos.ae/fr',
        'en': 'https://reccos.ae/en',
        'ar': 'https://reccos.ae/ar',
      },
    },
    other: {
      'geo.region': 'AE-DU',
      'geo.placename': 'Dubai',
      'geo.position': '25.2048;55.2708',
      'ICBM': '25.2048, 55.2708',
    },
  },
  ar: {
    title: 'RECCOS - الاستثمار العقاري المجزأ في دبي | شقق رخيصة',
    description: 'استثمر في العقارات بدبي مع RECCOS. اشترِ أسهم شقق من داماك، إعمار ومطورين آخرين بأسعار مخفضة. استثمار عقاري مجزأ سهل، شقق رخيصة في دبي، الإمارات. منصة آمنة لشراء وبيع الرموز العقارية.',
    keywords: 'استثمار عقاري, شقق رخيصة, دبي, الإمارات, داماك, إعمار, استثمار, أسهم شقق, مجزأ, tokens, عقارات دبي, شقق دبي, استثمر دبي, ملكية مجزأة, عقارات دبي, استثمار سهل, شقق بأسعار معقولة, مطورون دبي, سوق العقارات الإمارات',
    openGraph: {
      title: 'RECCOS - الاستثمار العقاري المجزأ في دبي | شقق رخيصة',
      description: 'استثمر في العقارات بدبي مع RECCOS. اشترِ أسهم شقق من داماك، إعمار ومطورين آخرين بأسعار مخفضة. استثمار سهل، شقق رخيصة.',
      url: 'https://reccos.ae',
      siteName: 'RECCOS',
      locale: 'ar_AE',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'RECCOS - الاستثمار العقاري المجزأ في دبي',
      description: 'استثمر في العقارات بدبي. شقق رخيصة، داماك، إعمار. استثمار سهل.',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: 'https://reccos.ae',
      languages: {
        'fr': 'https://reccos.ae/fr',
        'en': 'https://reccos.ae/en',
        'ar': 'https://reccos.ae/ar',
      },
    },
    other: {
      'geo.region': 'AE-DU',
      'geo.placename': 'Dubai',
      'geo.position': '25.2048;55.2708',
      'ICBM': '25.2048, 55.2708',
    },
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return metadataByLocale[locale] || metadataByLocale.en;
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href={`https://reccos.ae/${locale}`} />
        <meta name="author" content="RECCOS" />
        <meta name="theme-color" content="#f5f3ee" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var hasShownPreloader = sessionStorage.getItem('preloader-shown');
                  if (!hasShownPreloader) {
                    var style = document.createElement('style');
                    style.textContent = '#app-content { visibility: hidden; opacity: 0; }';
                    document.head.appendChild(style);
                  } else {
                    // Si le preloader a déjà été affiché, marquer le body immédiatement
                    // Utiliser DOMContentLoaded pour s'assurer que le body existe
                    if (document.body) {
                      document.body.setAttribute('data-preloader-ready', 'true');
                    } else {
                      document.addEventListener('DOMContentLoaded', function() {
                        document.body.setAttribute('data-preloader-ready', 'true');
                      });
                    }
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${bebasNeue.variable} ${inter.variable}`} suppressHydrationWarning>
        <MobileGuard>
          <LenisProvider>
            {/* <LenisScrollTriggerBridge /> */}
            <NextIntlClientProvider messages={messages}>
              <ToastProvider>
                <AuthHydrator />
                <PreloaderWrapper />
                <DebugScroll />
                <div id="app-content" className="h-full">
                  <header className={headerStyles.container}>
                    <Navbar />
                  </header>
                  {children}
                  <ConditionalFooter />
                </div>
              </ToastProvider>
            </NextIntlClientProvider>
          </LenisProvider>
        </MobileGuard>
      </body>
    </html>
  );
}