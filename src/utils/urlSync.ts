import type { CatalogueSection, GarmentItem } from '../types/catalogue';
import type { CatalogueNavigationMap } from './catalogueOrder';

export type AppViewMode = 'workbench' | 'buyer' | 'paperback';

export interface ParsedCatalogueUrl {
  viewMode?: AppViewMode;
  section?: CatalogueSection;
  buyerViewStyle?: 'book' | 'card';
  demoMode?: boolean;
  bookPage?: number;
  mobileSide?: 'verso' | 'recto';
}

const MODE_TO_PARAM: Record<AppViewMode, string> = {
  workbench: 'studio',
  buyer: 'web',
  paperback: 'print-edition',
};

const PARAM_TO_MODE: Record<string, AppViewMode> = {
  studio: 'workbench',
  workbench: 'workbench',
  web: 'buyer',
  buyer: 'buyer',
  'print-edition': 'paperback',
  print: 'paperback',
  paperback: 'paperback',
};

const PARAM_TO_SECTION: Record<string, CatalogueSection> = {
  flipbook: 'flipbook',
  fabrics: 'fabrics',
  collection: 'index',
  index: 'index',
  print: 'print',
  'print-sheet': 'print',
};

export function parseDemoFlagFromLocation(): boolean | undefined {
  if (typeof window === 'undefined') return undefined;
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('demo');
  if (raw === '1' || raw === 'true' || raw === 'on') return true;
  if (raw === '0' || raw === 'false' || raw === 'off') return false;
  return undefined;
}

export function parseCatalogueUrl(
  orderedGarments: GarmentItem[],
  navMap: CatalogueNavigationMap
): ParsedCatalogueUrl {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const result: ParsedCatalogueUrl = {};

  const modeRaw = params.get('mode')?.trim().toLowerCase();
  if (modeRaw && PARAM_TO_MODE[modeRaw]) {
    result.viewMode = PARAM_TO_MODE[modeRaw];
  }

  const layoutRaw = params.get('layout')?.trim().toLowerCase();
  if (layoutRaw === 'card' || layoutRaw === 'book') {
    result.buyerViewStyle = layoutRaw;
  }

  const demoVal = parseDemoFlagFromLocation();
  if (demoVal !== undefined) {
    result.demoMode = demoVal;
  }

  const sideRaw = params.get('side')?.trim().toLowerCase();
  if (sideRaw === 'b' || sideRaw === 'recto') {
    result.mobileSide = 'recto';
  } else if (sideRaw === 'a' || sideRaw === 'verso') {
    result.mobileSide = 'verso';
  }

  const viewRaw = params.get('view')?.trim().toLowerCase();
  if (viewRaw && PARAM_TO_SECTION[viewRaw]) {
    result.section = PARAM_TO_SECTION[viewRaw];
  }

  // Direct style lookup by SKU or garment id (highest priority for Slack/email sharing)
  const styleRaw = params.get('style')?.trim();
  if (styleRaw) {
    const normalized = styleRaw.toLowerCase();
    const match = orderedGarments.find(
      (g) =>
        g.sku.toLowerCase() === normalized ||
        g.id.toLowerCase() === normalized
    );
    if (match) {
      result.section = 'flipbook';
      result.bookPage =
        navMap.garmentPageById.get(match.id) ?? navMap.productOffset;
      return result;
    }
  }

  // Direct fabric family lookup
  const fabricRaw = params.get('fabric')?.trim();
  if (fabricRaw) {
    const normalized = fabricRaw.toLowerCase();
    const matchedProgram = navMap.orderedFabrics.find(
      (f) => f.fabricCode.toLowerCase() === normalized
    );
    if (matchedProgram) {
      const pageIdx = navMap.fabricPageByCode.get(matchedProgram.fabricCode);
      if (pageIdx !== undefined) {
        result.section = 'flipbook';
        result.bookPage = pageIdx;
        return result;
      }
    }
  }

  // Numeric spread page lookup (1-indexed ?page=1..totalSpreads)
  const pageRaw = params.get('page')?.trim();
  if (pageRaw) {
    const parsedNum = Number(pageRaw);
    if (Number.isFinite(parsedNum) && parsedNum >= 1) {
      result.bookPage = Math.max(
        0,
        Math.min(navMap.totalSpreads - 1, Math.round(parsedNum) - 1)
      );
      if (!result.section) result.section = 'flipbook';
    }
  }

  return result;
}

export function buildCatalogueShareUrl(opts: {
  section: CatalogueSection;
  viewMode: AppViewMode;
  buyerViewStyle: 'book' | 'card';
  bookPage: number;
  navMap: CatalogueNavigationMap;
  mobileSide?: 'verso' | 'recto';
  isMobile?: boolean;
}): string {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams();

  if (opts.viewMode !== 'buyer') {
    params.set('mode', MODE_TO_PARAM[opts.viewMode]);
  }

  if (opts.section === 'flipbook') {
    const { productOffset, orderedGarments, orderedFabrics } = opts.navMap;
    if (
      opts.bookPage >= productOffset &&
      opts.bookPage < productOffset + orderedGarments.length
    ) {
      const garment = orderedGarments[opts.bookPage - productOffset];
      if (garment) {
        params.set('style', garment.sku);
      }
      params.set('page', String(opts.bookPage + 1));
    } else if (opts.bookPage >= 2 && opts.bookPage < productOffset) {
      const fabric = orderedFabrics[opts.bookPage - 2];
      if (fabric) {
        params.set('fabric', fabric.fabricCode);
      }
      params.set('page', String(opts.bookPage + 1));
    } else {
      params.set('page', String(opts.bookPage + 1));
    }

    if (opts.viewMode === 'buyer' && opts.buyerViewStyle === 'card') {
      params.set('layout', 'card');
    }

    if (opts.isMobile && opts.mobileSide === 'recto') {
      params.set('side', 'b');
    }
  } else {
    params.set('view', opts.section === 'index' ? 'collection' : opts.section);
  }

  const query = params.toString();
  return `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
}
