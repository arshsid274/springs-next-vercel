'use client';

import { useEffect, useRef } from 'react';

// Injects untouched HTML markup as a sibling fragment inside <body>. The
// extractor strips executable <script> tags up front, so what lands here is
// pure markup (with type="text/template" scripts preserved as inert nodes).
// We render into a wrapping <div> with display:contents so it has zero effect
// on layout / CSS selectors like `body > *`.
export default function RawHtml({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Stamp every link inside the injected markup with data-barba-prevent so
    // Barba (loaded as part of shared.js) ignores clicks and lets the browser
    // do a normal navigation. Barba's prevent attribute is read at click
    // time, so we can set it after init.
    if (ref.current) {
      ref.current.querySelectorAll('a[href]').forEach((a) => {
        if (!a.hasAttribute('data-barba-prevent')) {
          a.setAttribute('data-barba-prevent', 'all');
        }
      });
    }
    // shared.js expects the document to look "ready" for its initial scan.
    const t = window.setTimeout(() => {
      document.documentElement.classList.remove('not-ready');
    }, 0);
    return () => window.clearTimeout(t);
  }, [html]);

  return (
    <div ref={ref} style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />
  );
}
