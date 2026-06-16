#!/usr/bin/env node
// Extracts everything needed from a source .html file to render it 1:1 inside
// Next.js. Writes four artifacts under app/_html/<slug>.*:
//   .body.html        body inner HTML, executable <script> tags stripped
//                     (template scripts kept).
//   .scripts.json     ordered list of executable scripts
//                     { kind: 'src'|'inline', src?, code?, attrs }
//   .meta.json        per-page <head> data: title, description, keywords,
//                     canonical, ogImage, stylesheets[]
//   .body-attrs.json  attributes from the <body> tag (e.g. data-barba)
//
// Usage:
//   node scripts/extract-page.mjs <source.html> <slug>
//
// All <link rel="stylesheet"> hrefs are normalized to absolute /assets/...
// paths (handles ../ from subdirs like flat/ and gallery/). Asset paths in
// the body markup are left untouched — the browser resolves them relative to
// the page URL, which matches the original site's directory layout.

import fs from 'node:fs';
import path from 'node:path';

const [, , srcPath, slug] = process.argv;
if (!srcPath || !slug) {
  console.error('usage: extract-page.mjs <source.html> <slug>');
  process.exit(1);
}

const html = fs.readFileSync(path.resolve(srcPath), 'utf8');

const bodyOpen = html.search(/<body\b[^>]*>/i);
const bodyClose = html.search(/<\/body\s*>/i);
if (bodyOpen < 0 || bodyClose < 0) {
  console.error('Could not find <body>...</body> in source.');
  process.exit(1);
}
const openTagEnd = html.indexOf('>', bodyOpen) + 1;
let body = html.slice(openTagEnd, bodyClose);

const bodyAttrsMatch = html.slice(bodyOpen, openTagEnd).match(/<body\b([^>]*)>/i);
const bodyAttrs = bodyAttrsMatch ? bodyAttrsMatch[1].trim() : '';

const headBlock = html.slice(0, bodyOpen);

const scripts = [];
const scriptRe = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
body = body.replace(scriptRe, (match, rawAttrs, code) => {
  const attrs = parseAttrs(rawAttrs);
  const type = (attrs.type || '').toLowerCase();
  if (type && type !== 'text/javascript' && type !== 'application/javascript' && type !== 'module') {
    return match;
  }
  if (attrs.src) {
    scripts.push({ kind: 'src', src: attrs.src, attrs });
  } else {
    const trimmed = code.trim();
    if (
      trimmed.includes('__CF$cv$params') ||
      trimmed.includes('cdn-cgi/challenge-platform')
    ) {
      return '';
    }
    if (trimmed) scripts.push({ kind: 'inline', code: trimmed, attrs });
  }
  return '';
});

const title = (headBlock.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? '').trim();
const description = metaContent(headBlock, 'name', 'description');
const keywords = metaContent(headBlock, 'name', 'keywords');
const ogTitle = metaContent(headBlock, 'property', 'og:title');
const ogDescription = metaContent(headBlock, 'property', 'og:description');
const ogImage = metaContent(headBlock, 'property', 'og:image');
const ogUrl = metaContent(headBlock, 'property', 'og:url');
const canonical = headBlock.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1] ?? '';

const stylesheets = [];
const linkRe = /<link\b([^>]*?)>/gi;
let m;
while ((m = linkRe.exec(headBlock)) !== null) {
  const attrs = parseAttrs(m[1]);
  if ((attrs.rel || '').toLowerCase() !== 'stylesheet') continue;
  if (!attrs.href) continue;
  const abs = toAbsoluteAsset(attrs.href);
  if (abs === '/assets/stylesheets/global.css') continue;
  stylesheets.push(abs);
}

const meta = {
  title,
  description,
  keywords,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  stylesheets,
};

const outDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'app', '_html');
fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(path.join(outDir, `${slug}.body.html`), body);
fs.writeFileSync(path.join(outDir, `${slug}.scripts.json`), JSON.stringify(scripts, null, 2));
fs.writeFileSync(path.join(outDir, `${slug}.meta.json`), JSON.stringify(meta, null, 2));
fs.writeFileSync(path.join(outDir, `${slug}.body-attrs.json`), JSON.stringify({ bodyAttrs }, null, 2));

console.log(`[${slug}] body=${body.length}b scripts=${scripts.length} css=${stylesheets.length} title="${title}"`);

function metaContent(haystack, attrName, attrValue) {
  const re = new RegExp(`<meta[^>]*\\b${attrName}=["']${attrValue}["'][^>]*\\bcontent=["']([^"']*)["']`, 'i');
  return haystack.match(re)?.[1] ?? '';
}

function toAbsoluteAsset(href) {
  if (/^(?:https?:)?\/\//i.test(href)) return href;
  let h = href;
  while (h.startsWith('../')) h = h.slice(3);
  if (h.startsWith('./')) h = h.slice(2);
  if (!h.startsWith('/')) h = '/' + h;
  return h;
}

function parseAttrs(s) {
  const out = {};
  const re = /([a-zA-Z_:][\w:.-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    const name = m[1].toLowerCase();
    const val = m[2] ?? m[3] ?? m[4] ?? '';
    out[name] = val;
  }
  return out;
}
