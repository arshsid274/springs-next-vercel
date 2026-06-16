'use client';

import { useEffect } from 'react';

// Re-patches console.error and the global error listeners AFTER Next.js's dev
// overlay has installed its own patches. Without this, the dev overlay
// captures shared.js noise (parallax measureSelector warnings, scroller
// `match` on undefined, etc.) before our earlier beforeInteractive filter
// gets a chance to suppress it.
//
// All real errors still propagate — only the three known shared.js noise
// patterns are dropped.

const NOISE_PATTERNS = [
  "reading 'match'",
  'No Barba wrapper',
  'Parallax plugin failed to find measureSelector',
  // WebGL plugins (webgl-nature.js, webgl-wellness.js) race on texture init:
  // if a source image hasn't finished decoding when the first frame draws,
  // this.textures[0].image is null. The original site swallows this; locally
  // it surfaces on first paint with cold caches.
  "this.textures[0].image.width",
  "evaluating 'this.textures",
];

function isNoise(value: unknown): boolean {
  if (value == null) return false;
  const s = typeof value === 'string' ? value : String((value as { message?: unknown })?.message ?? value);
  return NOISE_PATTERNS.some((p) => s.indexOf(p) !== -1);
}

declare global {
  interface Window {
    __webflowNoiseSuppressed?: boolean;
  }
}

export default function SuppressWebflowNoise() {
  useEffect(() => {
    if (typeof window === 'undefined' || window.__webflowNoiseSuppressed) return;
    window.__webflowNoiseSuppressed = true;

    const origError = console.error;
    console.error = function (...args: unknown[]) {
      for (const a of args) if (isNoise(a)) return;
      return origError.apply(console, args as []);
    };

    const origWarn = console.warn;
    console.warn = function (...args: unknown[]) {
      for (const a of args) if (isNoise(a)) return;
      return origWarn.apply(console, args as []);
    };

    const onError = (e: ErrorEvent) => {
      if (e && (isNoise(e.error) || isNoise(e.message))) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      if (e && isNoise(e.reason)) e.preventDefault();
    };

    window.addEventListener('error', onError, true);
    window.addEventListener('unhandledrejection', onRejection);
  }, []);

  return null;
}
