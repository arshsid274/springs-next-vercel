import Script from 'next/script';

export type ExtractedScript =
  | { kind: 'src'; src: string; attrs: Record<string, string> }
  | { kind: 'inline'; code: string; attrs: Record<string, string> };

// Mounts the executable scripts extracted from the original HTML page using
// next/script with strategy="afterInteractive". Scripts mount in the order
// they appear in this list, which matches the order they appeared in the
// source <body>. src paths are normalized to absolute `/assets/...` paths so
// they resolve from the /public folder.
export default function PageScripts({ scripts, slug }: { scripts: ExtractedScript[]; slug: string }) {
  return (
    <>
      {scripts.map((s, i) => {
        const id = `page-script-${slug}-${i}`;
        const strategy = s.attrs.async !== undefined ? 'lazyOnload' : 'afterInteractive';
        if (s.kind === 'src') {
          const src = normalizeSrc(s.src);
          return (
            <Script
              key={id}
              id={id}
              src={src}
              strategy={strategy}
              fetchPriority={(s.attrs.fetchpriority as 'high' | 'low' | 'auto' | undefined) ?? undefined}
            />
          );
        }
        return (
          <Script key={id} id={id} strategy={strategy}>
            {s.code}
          </Script>
        );
      })}
    </>
  );
}

function normalizeSrc(src: string): string {
  if (/^(?:https?:)?\/\//i.test(src)) return src;
  if (src.startsWith('/')) return src;
  return `/${src.replace(/^\.\//, '')}`;
}
