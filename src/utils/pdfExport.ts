import { jsPDF } from 'jspdf';
import { toJpeg } from 'html-to-image';
import type { PrintOrientation } from '../types/catalogue';

export interface PdfExportProgress {
  current: number;
  total: number;
  statusText: string;
}

async function waitForImagesReady(container: HTMLElement): Promise<void> {
  const imgs = Array.from(container.querySelectorAll('img'));
  await Promise.all(
    imgs.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        const finish = () => resolve();
        img.addEventListener('load', finish, { once: true });
        img.addEventListener('error', finish, { once: true });
        window.setTimeout(finish, 3000);
      });
    })
  );
}

let cachedFontCssPromise: Promise<string> | null = null;

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read font blob'));
    reader.readAsDataURL(blob);
  });
}

async function resolveEmbeddedFontCss(): Promise<string> {
  if (typeof document === 'undefined' || typeof fetch !== 'function') return '';

  const links = Array.from(
    document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"][href]')
  ).filter((el) => el.href.includes('fonts.googleapis.com'));

  if (links.length === 0) return '';

  const fontDataCache = new Map<string, string>();
  const cssParts: string[] = [];

  for (const link of links) {
    try {
      const res = await fetch(link.href, { mode: 'cors' });
      if (!res.ok) continue;
      let cssText = await res.text();
      const urls = Array.from(cssText.matchAll(/url\((['"]?)(https?:\/\/[^)'"]+)\1\)/g));
      await Promise.all(
        urls.map(async (match) => {
          const fontUrl = match[2];
          if (fontDataCache.has(fontUrl)) return;
          try {
            const fontRes = await fetch(fontUrl, { mode: 'cors' });
            if (!fontRes.ok) return;
            const dataUrl = await blobToDataUrl(await fontRes.blob());
            if (dataUrl) fontDataCache.set(fontUrl, dataUrl);
          } catch {
            // Skip unreadable font file cleanly without throwing SecurityError
          }
        })
      );

      cssText = cssText.replace(/url\((['"]?)(https?:\/\/[^)'"]+)\1\)/g, (full, _q, u) => {
        const embedded = fontDataCache.get(u);
        return embedded ? `url("${embedded}")` : full;
      });
      cssParts.push(cssText);
    } catch {
      // Ignore network/CORS errors; still return '' so html-to-image skips cssRules inspection
    }
  }

  return cssParts.join('\n');
}

function getEmbeddedFontCss(): Promise<string> {
  if (!cachedFontCssPromise) {
    cachedFontCssPromise = resolveEmbeddedFontCss();
  }
  return cachedFontCssPromise;
}

export async function generateCataloguePdfFromContainer(opts: {
  container: HTMLElement;
  orientation: PrintOrientation;
  fileName: string;
  onProgress?: (progress: PdfExportProgress) => void;
  shouldCancel?: () => boolean;
}): Promise<{ saved: boolean; pageCount: number }> {
  const { container, orientation, fileName, onProgress, shouldCancel } = opts;

  if (typeof document !== 'undefined' && document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // Proceed even if font readiness rejects
    }
  }

  const fontEmbedCSS = await getEmbeddedFontCss();

  const sheets = Array.from(
    container.querySelectorAll<HTMLElement>('.print-sheet')
  );
  if (sheets.length === 0) {
    throw new Error('No printable catalogue sheets were found.');
  }

  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidthMm = doc.internal.pageSize.getWidth();
  const pageHeightMm = doc.internal.pageSize.getHeight();
  const captureWidthPx = orientation === 'landscape' ? 1190 : 794;
  const captureHeightPx = orientation === 'landscape' ? 842 : 1123;

  for (let i = 0; i < sheets.length; i++) {
    if (shouldCancel?.()) {
      return { saved: false, pageCount: i };
    }

    const sheet = sheets[i];
    onProgress?.({
      current: i + 1,
      total: sheets.length,
      statusText: `Rendering PDF sheet ${i + 1} of ${sheets.length}…`,
    });

    await waitForImagesReady(sheet);

    // Yield briefly so the progress toast stays responsive
    await new Promise((r) => window.requestAnimationFrame(() => r(undefined)));

    const dataUrl = await toJpeg(sheet, {
      quality: 0.92,
      pixelRatio: 1.75,
      backgroundColor: '#FFFFFF',
      fontEmbedCSS,
      width: sheet.offsetWidth || captureWidthPx,
      height: Math.max(sheet.offsetHeight || captureHeightPx, captureHeightPx),
      style: {
        margin: '0',
        boxShadow: 'none',
      },
    });

    if (i > 0) {
      doc.addPage('a4', orientation);
    }

    const sheetW = sheet.offsetWidth || captureWidthPx;
    const sheetH = Math.max(sheet.offsetHeight || captureHeightPx, captureHeightPx);
    const scale = Math.min(pageWidthMm / sheetW, pageHeightMm / sheetH);
    const renderW = sheetW * scale;
    const renderH = sheetH * scale;
    const offsetX = (pageWidthMm - renderW) / 2;
    const offsetY = (pageHeightMm - renderH) / 2;

    doc.addImage(dataUrl, 'JPEG', offsetX, offsetY, renderW, renderH, undefined, 'FAST');
  }

  doc.save(fileName);
  return { saved: true, pageCount: sheets.length };
}
