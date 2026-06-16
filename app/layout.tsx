import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import type { ReactNode } from 'react';
import SuppressWebflowNoise from './_components/SuppressWebflowNoise';

export const metadata: Metadata = {
  title: { default: 'Springs', template: '%s' },
  description: 'Wellness-residences',
  metadataBase: new URL('https://springs.estate'),
  openGraph: { type: 'website', locale: 'en_US', images: ['/assets/manifest/og.jpg'] },
  twitter: { card: 'summary_large_image', images: ['/assets/manifest/og.jpg'] },
  manifest: '/assets/manifest/manifest.webmanifest',
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: '/favicon-light.png', media: '(prefers-color-scheme: light)' },
      { url: '/assets/manifest/favicon-96x96-dark.png', media: '(prefers-color-scheme: light)', sizes: '96x96', type: 'image/png' },
      { url: '/assets/manifest/favicon-32x32-dark.png', media: '(prefers-color-scheme: light)', sizes: '32x32', type: 'image/png' },
      { url: '/assets/manifest/favicon-16x16-dark.png', media: '(prefers-color-scheme: light)', sizes: '16x16', type: 'image/png' },
      { url: '/favicon.ico', media: '(prefers-color-scheme: dark)' },
      { url: '/assets/manifest/favicon-96x96-light.png', media: '(prefers-color-scheme: dark)', sizes: '96x96', type: 'image/png' },
      { url: '/assets/manifest/favicon-32x32-light.png', media: '(prefers-color-scheme: dark)', sizes: '32x32', type: 'image/png' },
      { url: '/assets/manifest/favicon-16x16-light.png', media: '(prefers-color-scheme: dark)', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/assets/manifest/apple-touch-icon.png',
    other: [{ rel: 'mask-icon', url: '/assets/manifest/safari-pinned-tab.svg', color: '#ffffff' }],
  },
  other: {
    'theme-color': '#162D24',
    'msapplication-config': '/assets/manifest/browserconfig.xml',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  viewportFit: 'cover',
  themeColor: '#162D24',
};

const noJsBoot = `
document.documentElement.classList.remove('no-js');
document.documentElement.classList.add('js');
if (navigator.platform.toUpperCase().indexOf('WIN') >= 0) {
  document.documentElement.classList.add('is-win');
}
// shared.js (Webflow runtime) emits a few known-noisy diagnostics that the
// original Springs site silently absorbs but Next.js's dev overlay surfaces
// as Runtime / Console Errors. We filter only these specific patterns so
// any real errors still bubble up.
//   1) scroller plugin: getComputedStyle(t).transform is undefined for
//      certain elements -> "Cannot read properties of undefined (reading
//      'match')" inside hn().
//   2) parallax plugin: console.error when one of its multiple measure
//      selectors (.sticky, .sticky-slider, etc) doesn't exist on the
//      current page. By design, varies per page.
//   3) Barba init: defensive guard in case data-barba wrapper isn't found.
(function () {
  function isWebflowNoise(msg) {
    if (msg == null) return false;
    if (typeof msg !== 'string') msg = String(msg);
    return msg.indexOf("reading 'match'") !== -1
        || msg.indexOf('No Barba wrapper') !== -1
        || msg.indexOf('Parallax plugin failed to find measureSelector') !== -1
        || msg.indexOf('this.textures[0].image.width') !== -1
        || msg.indexOf("evaluating 'this.textures") !== -1;
  }
  window.addEventListener('error', function (e) {
    if (e && e.error && isWebflowNoise(e.error.message)) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }, true);
  window.addEventListener('unhandledrejection', function (e) {
    var msg = e && e.reason && (e.reason.message || String(e.reason));
    if (isWebflowNoise(msg)) {
      e.preventDefault();
    }
  });
  var origError = console.error;
  console.error = function () {
    for (var i = 0; i < arguments.length; i++) {
      if (isWebflowNoise(arguments[i])) return;
    }
    return origError.apply(console, arguments);
  };
})();
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html dir="ltr" lang="en" className="has-hover no-js not-ready" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://storage.googleapis.com" crossOrigin="" />
        <style>{`body { background: #F5E8D1; color: #F5E8D1; } a { color: #F5E8D1; } .js.not-ready, .js.not-ready * { transition: none !important; }`}</style>
        <link rel="stylesheet" href="/assets/stylesheets/global.css" />
        <Script id="boot-js-class" strategy="beforeInteractive">{noJsBoot}</Script>
      </head>
      {/* Barba.js (bundled in shared.js) refuses to init without a wrapper
          and throws "No Barba wrapper found". We give it a wrapper so init
          succeeds quietly, then RawHtml stamps data-barba-prevent="all" on
          every <a> inside the page so Barba never actually intercepts a
          click. Net effect: Barba is loaded but inert; Next.js stays in
          charge of routing. */}
      <body data-barba="wrapper">
        <SuppressWebflowNoise />
        {children}
      </body>
    </html>
  );
}
