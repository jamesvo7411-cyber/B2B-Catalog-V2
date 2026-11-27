import React, { createContext, useContext } from 'react';
import { publicAssetUrl } from './publicAssetUrl';

export const MobileDisplayContext = createContext<boolean>(false);

export function useMobileDisplayMode(): boolean {
  return useContext(MobileDisplayContext);
}

/**
 * Resolves lightweight mobile-sized JPEG display assets when rendering inside
 * the mobile 1-page flipbook reader. Desktop spreads, lightbox zoom inspection,
 * and PDF/print export always continue using the original high-resolution files.
 */
export function resolveMobileDisplayUrl(
  originalUrl: string,
  useMobileMedia: boolean
): string {
  if (!useMobileMedia || !originalUrl) return originalUrl;
  if (
    originalUrl.startsWith('data:') ||
    originalUrl.startsWith('blob:') ||
    originalUrl.startsWith('http://') ||
    originalUrl.startsWith('https://')
  ) {
    return originalUrl;
  }

  const base = import.meta.env.BASE_URL || '/';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  let rel = originalUrl;
  if (rel.startsWith(normalizedBase)) {
    rel = rel.slice(normalizedBase.length);
  } else {
    rel = rel.replace(/^\/+/, '');
  }

  if (rel.startsWith('catalogue-media/')) {
    return publicAssetUrl(`mobile-media/${rel}`);
  }
  if (rel.startsWith('assets/fabric-swatches/')) {
    return publicAssetUrl(`mobile-media/fabric-swatches/${rel.slice('assets/fabric-swatches/'.length)}`);
  }
  if (rel.startsWith('src/assets/images/')) {
    return publicAssetUrl(`mobile-media/atelier/${rel.slice('src/assets/images/'.length)}`);
  }
  return originalUrl;
}
