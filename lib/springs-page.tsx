import fs from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import RawHtml from '@/app/_components/RawHtml';
import PageScripts, { type ExtractedScript } from '@/app/_components/PageScripts';

export type PageMeta = {
  title: string;
  description: string;
  keywords: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
  stylesheets: string[];
};

const HTML_DIR = path.join(process.cwd(), 'app', '_html');

export function loadPage(slug: string): {
  body: string;
  scripts: ExtractedScript[];
  meta: PageMeta;
} {
  const body = fs.readFileSync(path.join(HTML_DIR, `${slug}.body.html`), 'utf8');
  const scripts = JSON.parse(
    fs.readFileSync(path.join(HTML_DIR, `${slug}.scripts.json`), 'utf8'),
  ) as ExtractedScript[];
  const meta = JSON.parse(
    fs.readFileSync(path.join(HTML_DIR, `${slug}.meta.json`), 'utf8'),
  ) as PageMeta;
  return { body, scripts, meta };
}

export function pageMetadata(slug: string): Metadata {
  const { meta } = { meta: loadPage(slug).meta };
  return {
    title: meta.title || undefined,
    description: meta.description || undefined,
    keywords: meta.keywords ? meta.keywords.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
    alternates: meta.canonical ? { canonical: meta.canonical } : undefined,
    openGraph:
      meta.ogTitle || meta.ogDescription || meta.ogImage || meta.ogUrl
        ? {
            title: meta.ogTitle || undefined,
            description: meta.ogDescription || undefined,
            url: meta.ogUrl || undefined,
            images: meta.ogImage ? [meta.ogImage] : undefined,
          }
        : undefined,
    twitter:
      meta.ogTitle || meta.ogDescription || meta.ogImage
        ? {
            card: 'summary_large_image',
            title: meta.ogTitle || undefined,
            description: meta.ogDescription || undefined,
            images: meta.ogImage ? [meta.ogImage] : undefined,
          }
        : undefined,
  };
}

export default function SpringsPage({ slug }: { slug: string }) {
  const { body, scripts, meta } = loadPage(slug);
  return (
    <>
      {meta.stylesheets.map((href) => (
        // Rendering <link> in a server component lets Next hoist it into <head>.
        // We render per-page CSS here so global.css (in layout.tsx) stays the
        // only stylesheet shared across routes.
        <link key={href} rel="stylesheet" href={href} />
      ))}
      <RawHtml html={body} />
      <PageScripts slug={slug} scripts={scripts} />
    </>
  );
}
