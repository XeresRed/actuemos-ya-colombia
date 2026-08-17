'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';

interface GoogleTagManagerProps {
  gtmId?: string;
}

export function GoogleTagManager({ gtmId }: GoogleTagManagerProps) {
  const [enabled, setEnabled] = useState<boolean>(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('ayc_cookie_consent');
      if (consent === 'all') {
        setEnabled(true);
      }

      const handleConsentChange = (e: Event) => {
        const customEvent = e as CustomEvent<string>;
        if (customEvent.detail === 'all') {
          setEnabled(true);
        } else {
          setEnabled(false);
        }
      };

      window.addEventListener('ayc_cookie_consent_changed', handleConsentChange);
      return () => {
        window.removeEventListener('ayc_cookie_consent_changed', handleConsentChange);
      };
    } catch {
      // Ignorar si localStorage no está disponible
    }
  }, []);

  if (!gtmId || !enabled) return null;

  return (
    <>
      <Script
        id="google-tag-manager"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`,
        }}
      />
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
    </>
  );
}

export default GoogleTagManager;
