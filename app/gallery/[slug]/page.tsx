import { notFound } from 'next/navigation';
import fs from 'node:fs';
import path from 'node:path';
import SpringsPage, { pageMetadata } from '@/lib/springs-page';

function resolveSlug(routeSlug: string): string | null {
  const m = routeSlug.match(/^([\w-]+)\.html$/);
  if (!m) return null;
  const internal = `gallery-${m[1]}`;
  const bodyFile = path.join(process.cwd(), 'app', '_html', `${internal}.body.html`);
  return fs.existsSync(bodyFile) ? internal : null;
}

export async function generateStaticParams() {
  const dir = path.join(process.cwd(), 'app', '_html');
  return fs
    .readdirSync(dir)
    .filter((f) => f.startsWith('gallery-') && f.endsWith('.body.html'))
    .map((f) => ({ slug: `${f.replace(/^gallery-/, '').replace(/\.body\.html$/, '')}.html` }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const internal = resolveSlug(slug);
  if (!internal) return {};
  return pageMetadata(internal);
}

export default async function GallerySubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const internal = resolveSlug(slug);
  if (!internal) notFound();
  return <SpringsPage slug={internal} />;
}
