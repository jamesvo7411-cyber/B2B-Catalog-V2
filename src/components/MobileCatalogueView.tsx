import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import {
  ChevronRight,
  Grid,
  Layers,
  Maximize,
  Menu,
  Minimize,
  Printer,
  Redo2,
  Ruler,
  Share2,
  Sparkles,
  Undo2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type { GarmentItem } from '../types/catalogue';
import {
  getFactoryColorImageKey,
  getPreferredFactoryFabricImage,
} from '../data/factoryFabricColors';
import {
  SECTION_THEME,
  type CatalogueNavigationMap,
  type SectionId,
} from '../utils/catalogueOrder';
import { MobileDisplayContext, resolveMobileDisplayUrl } from '../utils/mobileMedia';
import { displayBuyerProductTitle } from '../utils/productDisplay';
import type { SpreadLeafSide } from './GarmentSpread';

const LEAF_W = 595;
const LEAF_H = 842;

interface Pt {
  x: number;
  y: number;
}

interface MobileCurlSession {
  side: 'right' | 'left';
  cornerY: number;
  targetMobileIndex: number;
  pointer: Pt;
  target: Pt;
  mode: 'dragging' | 'animating';
  animStart?: Pt;
  animEnd?: Pt;
  animStartTime?: number;
  animDuration?: number;
  commitOnFinish?: boolean;
}

interface MobileCatalogueViewProps {
  garments: GarmentItem[];
  navMap?: CatalogueNavigationMap;
  activeSection?: SectionId;
  demoMode?: boolean;
  onToggleDemoMode?: () => void;
  bookPage: number;
  totalSpreads: number;
  productOffset: number;
  mode: 'workbench' | 'buyer' | 'paperback';
  editMode: boolean;
  showSafeZones?: boolean;
  onToggleSafeZones?: () => void;
  customFramingCount?: number;
  fabricColorImages?: Record<string, string>;
  getSpreadLabel: (page: number) => string;
  renderStaticPage: (
    page: number,
    side?: SpreadLeafSide,
    isPreviewLayer?: boolean
  ) => React.ReactNode;
  onChangeBookPage: (page: number) => void;
  onToggleEditMode: () => void;
  onOpenCropPresetModal?: () => void;
  onOpenPrintPdf?: () => void;
  printPdfLabel?: string;
  initialSide?: 'verso' | 'recto';
  onSideChange?: (side: 'verso' | 'recto') => void;
  onCopyShareLink?: () => void;
}

interface MobilePageEntry {
  id: string;
  spreadIndex: number;
  side: 'verso' | 'recto';
  sectionId: SectionId;
  shortTitle: string;
  folioCode: string;
}

function clampSingleLeafPointer(
  p: Pt,
  W: number,
  H: number,
  side: 'right' | 'left',
  cornerY: number
): Pt {
  let x = p.x;
  let y = p.y;

  // Forward peel anchors along left spine (x = 0); reverse sweep centers cleanly at (W, cornerY)
  const anchorX = side === 'right' ? 0 : W;
  const s1 = { x: anchorX, y: cornerY };
  const r1 = W;
  const s2 = { x: anchorX, y: H - cornerY };
  const r2 = Math.hypot(W, H);

  for (let i = 0; i < 4; i++) {
    const d1 = Math.hypot(x - s1.x, y - s1.y);
    if (d1 > r1 && d1 > 0.001) {
      x = s1.x + ((x - s1.x) / d1) * r1;
      y = s1.y + ((y - s1.y) / d1) * r1;
    }
    const d2 = Math.hypot(x - s2.x, y - s2.y);
    if (d2 > r2 && d2 > 0.001) {
      x = s2.x + ((x - s2.x) / d2) * r2;
      y = s2.y + ((y - s2.y) / d2) * r2;
    }
  }

  if (side === 'right') {
    x = Math.max(-W + 1, Math.min(W - 0.5, x));
  } else {
    x = Math.max(0.5, Math.min(2 * W - 1, x));
  }
  return { x, y };
}

function clipPolyHalfPlane(
  poly: Pt[],
  M: Pt,
  N: Pt,
  keepPositive: boolean
): Pt[] {
  if (poly.length === 0) return [];
  const signed = (p: Pt) => (p.x - M.x) * N.x + (p.y - M.y) * N.y;
  const isInside = (d: number) => (keepPositive ? d >= -1e-5 : d <= 1e-5);

  const out: Pt[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const da = signed(a);
    const db = signed(b);
    const aIn = isInside(da);
    const bIn = isInside(db);

    if (aIn && bIn) {
      out.push(b);
    } else if (aIn && !bIn) {
      const t = da / (da - db || 1e-6);
      out.push({ x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) });
    } else if (!aIn && bIn) {
      const t = da / (da - db || 1e-6);
      out.push({ x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) });
      out.push(b);
    }
  }
  return out;
}

function polyToCssPct(poly: Pt[], w: number, h: number): string {
  if (poly.length < 3 || w <= 0 || h <= 0) return 'polygon(0 0, 0 0, 0 0)';
  const coords = poly
    .map((p) => {
      const px = ((p.x / w) * 100).toFixed(3);
      const py = ((p.y / h) * 100).toFixed(3);
      return `${px}% ${py}%`;
    })
    .join(', ');
  return `polygon(${coords})`;
}

export const MobileCatalogueView: React.FC<MobileCatalogueViewProps> = ({
  garments,
  navMap,
  activeSection = 'introduction',
  demoMode = false,
  onToggleDemoMode,
  bookPage,
  totalSpreads,
  productOffset,
  mode,
  editMode,
  showSafeZones = false,
  onToggleSafeZones,
  customFramingCount = 0,
  fabricColorImages = {},
  getSpreadLabel,
  renderStaticPage,
  onChangeBookPage,
  onToggleEditMode,
  onOpenCropPresetModal,
  onOpenPrintPdf,
  printPdfLabel = 'Print PDF',
  initialSide,
  onSideChange,
  onCopyShareLink,
}) => {
  const isMobileWorkbench = mode === 'workbench';
  const isMobilePaperback = mode === 'paperback';

  // Complete sequential 1-page A4 folio stream across all modes
  const mobilePages = useMemo<MobilePageEntry[]>(() => {
    const list: MobilePageEntry[] = [];
    const fabrics = navMap?.orderedFabrics ?? [];

    // 0: Overview & Cover
    list.push({
      id: '0-verso',
      spreadIndex: 0,
      side: 'verso',
      sectionId: 'introduction',
      shortTitle: 'CM / OEM / ODM Overview',
      folioCode: 'P.01A',
    });
    list.push({
      id: '0-recto',
      spreadIndex: 0,
      side: 'recto',
      sectionId: 'introduction',
      shortTitle: 'Cover · Dream Tomorrow',
      folioCode: 'P.01B',
    });

    // 1: Table of Contents
    list.push({
      id: '1-verso',
      spreadIndex: 1,
      side: 'verso',
      sectionId: 'introduction',
      shortTitle: "Directory · Men's Line",
      folioCode: 'P.02A',
    });
    list.push({
      id: '1-recto',
      spreadIndex: 1,
      side: 'recto',
      sectionId: 'introduction',
      shortTitle: "Directory · Women's Line",
      folioCode: 'P.02B',
    });

    // 2 .. productOffset - 1: Fabric Swatch Library
    for (let s = 2; s < productOffset; s++) {
      const code = fabrics[s - 2]?.fabricCode ?? `Fabric ${s - 1}`;
      const pNum = String(s + 1).padStart(2, '0');
      list.push({
        id: `${s}-verso`,
        spreadIndex: s,
        side: 'verso',
        sectionId: 'fabrics',
        shortTitle: `Fabric ${code} · Specs`,
        folioCode: `P.${pNum}A`,
      });
      list.push({
        id: `${s}-recto`,
        spreadIndex: s,
        side: 'recto',
        sectionId: 'fabrics',
        shortTitle: `Fabric ${code} · Colorways`,
        folioCode: `P.${pNum}B`,
      });
    }

    // Products: Two authentic A4 leaves per garment (Hero Verso + Specs/Details Recto)
    garments.forEach((item, idx) => {
      const s = productOffset + idx;
      const pNum = String(s + 1).padStart(2, '0');
      const secId: SectionId = item.gender === 'Women' ? 'women' : 'men';
      const title = isMobileWorkbench ? item.title : displayBuyerProductTitle(item.title);
      list.push({
        id: `${s}-verso`,
        spreadIndex: s,
        side: 'verso',
        sectionId: secId,
        shortTitle: `${item.sku} · ${title}`,
        folioCode: `P.${pNum}A`,
      });
      list.push({
        id: `${s}-recto`,
        spreadIndex: s,
        side: 'recto',
        sectionId: secId,
        shortTitle: `${item.sku} · Details & Colorways`,
        folioCode: `P.${pNum}B`,
      });
    });

    // Penultimate spread: Size Charts
    const sizeSpread = totalSpreads - 2;
    const sizeNum = String(sizeSpread + 1).padStart(2, '0');
    list.push({
      id: `${sizeSpread}-verso`,
      spreadIndex: sizeSpread,
      side: 'verso',
      sectionId: 'technical',
      shortTitle: "Women's Size Chart",
      folioCode: `P.${sizeNum}A`,
    });
    list.push({
      id: `${sizeSpread}-recto`,
      spreadIndex: sizeSpread,
      side: 'recto',
      sectionId: 'technical',
      shortTitle: "Men's Size Chart",
      folioCode: `P.${sizeNum}B`,
    });

    // Final spread: Colophon / Studio Specs + Closing Folio
    const endSpread = totalSpreads - 1;
    const endNum = String(endSpread + 1).padStart(2, '0');
    list.push({
      id: `${endSpread}-verso`,
      spreadIndex: endSpread,
      side: 'verso',
      sectionId: 'technical',
      shortTitle: isMobileWorkbench ? 'Studio Pre-Press & CSV/JSON' : 'Dream Tomorrow · Colophon',
      folioCode: `P.${endNum}A`,
    });
    list.push({
      id: `${endSpread}-recto`,
      spreadIndex: endSpread,
      side: 'recto',
      sectionId: 'technical',
      shortTitle: 'Closing Folio · Contact',
      folioCode: `P.${endNum}B`,
    });

    return list;
  }, [garments, isMobileWorkbench, navMap, productOffset, totalSpreads]);

  const [leafSidePref, setLeafSidePref] = useState<'verso' | 'recto'>(initialSide ?? 'verso');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [thumbnailView, setThumbnailView] = useState(false);
  const [scrubPreviewIdx, setScrubPreviewIdx] = useState<number | null>(null);
  const [zoomScale, setZoomScale] = useState(1);
  const isZoomed = zoomScale > 1.02;
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const [isPseudoFullscreen, setIsPseudoFullscreen] = useState(false);
  const [slotSize, setSlotSize] = useState<{ w: number; h: number }>({
    w: typeof window !== 'undefined' ? window.innerWidth : 390,
    h: typeof window !== 'undefined' ? window.innerHeight : 680,
  });
  const [curl, setCurl] = useState<MobileCurlSession | null>(null);

  const stageRootRef = useRef<HTMLElement | null>(null);
  const viewportSlotRef = useRef<HTMLDivElement | null>(null);
  const leafContainerRef = useRef<HTMLDivElement | null>(null);
  const curlRef = useRef<MobileCurlSession | null>(null);
  const zoomScaleRef = useRef<number>(1);
  zoomScaleRef.current = zoomScale;
  const lastInternalSpreadRef = useRef<number>(bookPage);
  const prevInitialSideRef = useRef<'verso' | 'recto' | undefined>(initialSide);
  const pointerDownStartRef = useRef<{ x: number; y: number } | null>(null);
  const wheelAccumRef = useRef<{ value: number; dir: 'next' | 'prev'; lastTs: number }>({
    value: 0,
    dir: 'next',
    lastTs: 0,
  });
  const wheelCooldownUntilRef = useRef<number>(0);
  const swipeSessionRef = useRef<{
    x: number;
    y: number;
    startTime: number;
    targetIdx: number;
    side: 'right' | 'left';
    cornerY: number;
    lock: 'none' | 'horizontal' | 'vertical';
  } | null>(null);
  const pinchSessionRef = useRef<{
    startDist: number;
    startZoom: number;
    normX: number;
    normY: number;
  } | null>(null);
  const pinchCooldownUntilRef = useRef<number>(0);
  const lastTapRef = useRef<{ ts: number; x: number; y: number } | null>(null);
  const isScrubbingRef = useRef<boolean>(false);
  const scrubPreviewRef = useRef<number | null>(null);

  const isFullscreen = isNativeFullscreen || isPseudoFullscreen;

  useEffect(() => {
    curlRef.current = curl;
  }, [curl]);

  // Sync external navigation jumps (TOC/categories/popstate) without interfering with internal swipes
  useEffect(() => {
    const externalSideChanged = initialSide !== prevInitialSideRef.current;
    if (bookPage !== lastInternalSpreadRef.current) {
      lastInternalSpreadRef.current = bookPage;
      const nextSide = externalSideChanged && initialSide ? initialSide : 'verso';
      prevInitialSideRef.current = nextSide;
      setLeafSidePref(nextSide);
      if (nextSide !== initialSide) {
        onSideChange?.(nextSide);
      }
    } else if (externalSideChanged && initialSide) {
      prevInitialSideRef.current = initialSide;
      setLeafSidePref(initialSide);
    }
  }, [bookPage, initialSide, onSideChange]);

  const activeMobileIndex = useMemo(() => {
    const exact = mobilePages.findIndex(
      (p) => p.spreadIndex === bookPage && p.side === leafSidePref
    );
    if (exact >= 0) return exact;
    const bySpread = mobilePages.findIndex((p) => p.spreadIndex === bookPage);
    return bySpread >= 0 ? bySpread : 0;
  }, [mobilePages, bookPage, leafSidePref]);

  const currentPage = mobilePages[activeMobileIndex] ?? mobilePages[0];
  const secTheme = SECTION_THEME[currentPage?.sectionId ?? activeSection];

  const activeProduct = useMemo(() => {
    const s = currentPage?.spreadIndex ?? bookPage;
    if (s >= productOffset && s < productOffset + garments.length) {
      return garments[s - productOffset];
    }
    return null;
  }, [bookPage, currentPage?.spreadIndex, garments, productOffset]);

  const commitMobileIndex = useCallback(
    (targetIdx: number) => {
      const clamped = Math.max(0, Math.min(mobilePages.length - 1, targetIdx));
      const next = mobilePages[clamped];
      if (!next) return;
      lastInternalSpreadRef.current = next.spreadIndex;
      prevInitialSideRef.current = next.side;
      setLeafSidePref(next.side);
      onSideChange?.(next.side);
      if (next.spreadIndex !== bookPage) {
        onChangeBookPage(next.spreadIndex);
      }
      if (zoomScaleRef.current > 1.02 && viewportSlotRef.current) {
        window.requestAnimationFrame(() => {
          if (viewportSlotRef.current) {
            viewportSlotRef.current.scrollLeft = 0;
            viewportSlotRef.current.scrollTop = 0;
          }
        });
      }
    },
    [bookPage, mobilePages, onChangeBookPage, onSideChange]
  );

  const flushScrubCommit = useCallback(() => {
    isScrubbingRef.current = false;
    const pendingIdx = scrubPreviewRef.current;
    if (pendingIdx !== null) {
      scrubPreviewRef.current = null;
      setScrubPreviewIdx(null);
      commitMobileIndex(pendingIdx);
    }
  }, [commitMobileIndex]);

  const jumpToSpread = (spreadIdx: number, side: 'verso' | 'recto' = 'verso') => {
    const clampedSpread = Math.max(0, Math.min(totalSpreads - 1, spreadIdx));
    lastInternalSpreadRef.current = clampedSpread;
    prevInitialSideRef.current = side;
    setLeafSidePref(side);
    onSideChange?.(side);
    onChangeBookPage(clampedSpread);
    setDrawerOpen(false);
    setThumbnailView(false);
    setCurl(null);
  };

  // Measure available remaining stage dimensions cleanly without overflowing 100dvh
  useEffect(() => {
    const el = viewportSlotRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 120 && rect.height > 120) {
        setSlotSize((prev) =>
          Math.abs(prev.w - rect.width) < 1 && Math.abs(prev.h - rect.height) < 1
            ? prev
            : { w: rect.width, h: rect.height }
        );
      }
    };
    update();
    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [isFullscreen, mode]);

  const fitScale = useMemo(() => {
    const availW = Math.max(220, slotSize.w - 12);
    const topBottomPad = isFullscreen ? 10 : 12;
    const availH = Math.max(220, slotSize.h - topBottomPad);
    const raw = Math.min(availW / LEAF_W, availH / LEAF_H, 1.16);
    return Math.round(Math.max(0.32, raw) * 1000) / 1000;
  }, [slotSize.w, slotSize.h, isFullscreen]);

  const effectiveScale = Math.round(fitScale * zoomScale * 1000) / 1000;
  const scaledW = Math.round(LEAF_W * effectiveScale);
  const scaledH = Math.round(LEAF_H * effectiveScale);

  const applyAnchoredZoom = useCallback(
    (nextScaleRaw: number, clientMidX?: number, clientMidY?: number, anchorOverride?: { normX: number; normY: number }) => {
      const clamped = Math.round(Math.max(1, Math.min(2.8, nextScaleRaw)) * 1000) / 1000;
      const slotEl = viewportSlotRef.current;
      const leafEl = leafContainerRef.current;

      if (!slotEl || !leafEl || clientMidX === undefined || clientMidY === undefined) {
        setZoomScale(clamped);
        return;
      }

      const leafRect = leafEl.getBoundingClientRect();
      const slotRect = slotEl.getBoundingClientRect();
      const normX =
        anchorOverride?.normX ??
        Math.max(0, Math.min(1, (clientMidX - leafRect.left) / (leafRect.width || 1)));
      const normY =
        anchorOverride?.normY ??
        Math.max(0, Math.min(1, (clientMidY - leafRect.top) / (leafRect.height || 1)));
      const midInSlotX = clientMidX - slotRect.left;
      const midInSlotY = clientMidY - slotRect.top;

      flushSync(() => {
        setZoomScale(clamped);
      });

      if (clamped > 1.02) {
        const curLeafRect = leafEl.getBoundingClientRect();
        const curSlotRect = slotEl.getBoundingClientRect();
        const leafOffsetX = curLeafRect.left - curSlotRect.left + slotEl.scrollLeft;
        const leafOffsetY = curLeafRect.top - curSlotRect.top + slotEl.scrollTop;
        slotEl.scrollLeft = Math.max(0, leafOffsetX + normX * curLeafRect.width - midInSlotX);
        slotEl.scrollTop = Math.max(0, leafOffsetY + normY * curLeafRect.height - midInSlotY);
      } else {
        slotEl.scrollLeft = 0;
        slotEl.scrollTop = 0;
      }
    },
    []
  );

  const toggleFullscreen = useCallback(async () => {
    if (isNativeFullscreen) {
      try {
        await document.exitFullscreen();
      } catch {
        setIsNativeFullscreen(false);
      }
      setIsPseudoFullscreen(false);
      return;
    }
    if (isPseudoFullscreen) {
      setIsPseudoFullscreen(false);
      return;
    }
    const target = stageRootRef.current;
    if (target && typeof target.requestFullscreen === 'function') {
      try {
        await target.requestFullscreen();
        return;
      } catch {
        // Fallback inside iframes / iOS Safari
      }
    }
    setIsPseudoFullscreen(true);
  }, [isNativeFullscreen, isPseudoFullscreen]);

  useEffect(() => {
    const onFsChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsNativeFullscreen(active);
      if (!active) setIsPseudoFullscreen(false);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (drawerOpen) {
          setDrawerOpen(false);
          return;
        }
        if (isPseudoFullscreen) {
          setIsPseudoFullscreen(false);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [drawerOpen, isPseudoFullscreen]);

  // 60fps animation & drag smoothing loop for Single-Leaf Page Curl
  useEffect(() => {
    if (!curl) return;
    let rafId = 0;

    const tick = (now: number) => {
      const current = curlRef.current;
      if (!current) return;

      if (current.mode === 'animating') {
        const startTime = current.animStartTime ?? now;
        const dur = current.animDuration ?? 380;
        const rawT = Math.min(1, (now - startTime) / dur);
        const t = 1 - Math.pow(1 - rawT, 3);
        const s = current.animStart ?? current.pointer;
        const e = current.animEnd ?? current.target;

        const isBottom = current.cornerY > LEAF_H / 2;
        const liftDir = isBottom ? -1 : 1;
        const arcBump = Math.sin(rawT * Math.PI) * 76 * liftDir;

        const nextPt = {
          x: s.x + (e.x - s.x) * t,
          y: s.y + (e.y - s.y) * t + arcBump,
        };

        if (rawT >= 1) {
          const commitIdx = current.commitOnFinish ? current.targetMobileIndex : null;
          curlRef.current = null;
          setCurl(null);
          if (commitIdx !== null) {
            commitMobileIndex(commitIdx);
          }
          return;
        }

        const updated: MobileCurlSession = { ...current, pointer: nextPt };
        curlRef.current = updated;
        setCurl(updated);
        rafId = requestAnimationFrame(tick);
        return;
      }

      // Dragging spring smoothing
      const dx = current.target.x - current.pointer.x;
      const dy = current.target.y - current.pointer.y;
      if (Math.hypot(dx, dy) > 0.35) {
        const updated: MobileCurlSession = {
          ...current,
          pointer: {
            x: current.pointer.x + dx * 0.42,
            y: current.pointer.y + dy * 0.42,
          },
        };
        curlRef.current = updated;
        setCurl(updated);
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [Boolean(curl), commitMobileIndex]);

  const toLeafCoords = useCallback((clientX: number, clientY: number): Pt => {
    const el = leafContainerRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / (rect.width || 1)) * LEAF_W,
      y: ((clientY - rect.top) / (rect.height || 1)) * LEAF_H,
    };
  }, []);

  // Global pointer tracking for active corner drag
  useEffect(() => {
    if (!curl || curl.mode !== 'dragging') return;

    const handleMove = (e: PointerEvent) => {
      const pt = toLeafCoords(e.clientX, e.clientY);
      setCurl((prev) => (prev && prev.mode === 'dragging' ? { ...prev, target: pt } : prev));
    };

    const handleUp = (e: PointerEvent) => {
      const current = curlRef.current;
      if (!current || current.mode !== 'dragging') return;

      const endPt = toLeafCoords(e.clientX, e.clientY);
      const downInfo = pointerDownStartRef.current;
      const distMoved = downInfo
        ? Math.hypot(e.clientX - downInfo.x, e.clientY - downInfo.y)
        : 999;

      const isQuickClick = distMoved < 10;
      const pastThreshold =
        current.side === 'right' ? endPt.x < LEAF_W * 0.62 : endPt.x > LEAF_W * 0.38;
      const shouldCommit = isQuickClick || pastThreshold;

      const destCorner: Pt = shouldCommit
        ? {
            x: current.side === 'right' ? -LEAF_W + 1 : 2 * LEAF_W - 1,
            y: current.cornerY,
          }
        : {
            x: current.side === 'right' ? LEAF_W : 0,
            y: current.cornerY,
          };

      setCurl({
        ...current,
        mode: 'animating',
        animStart: current.pointer,
        animEnd: destCorner,
        animStartTime: performance.now(),
        animDuration: shouldCommit ? 360 : 240,
        commitOnFinish: shouldCommit,
      });
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
  }, [curl?.mode, toLeafCoords]);

  const triggerCurlTurn = useCallback(
    (dir: 'next' | 'prev') => {
      const nextIdx =
        dir === 'next' ? activeMobileIndex + 1 : activeMobileIndex - 1;
      if (nextIdx < 0 || nextIdx >= mobilePages.length) return;
      if (isZoomed) {
        commitMobileIndex(nextIdx);
        return;
      }

      const side: 'right' | 'left' = dir === 'next' ? 'right' : 'left';
      const cornerY = LEAF_H;
      const startPt: Pt =
        side === 'right' ? { x: LEAF_W - 22, y: LEAF_H - 20 } : { x: 22, y: LEAF_H - 20 };
      const endPt: Pt =
        side === 'right' ? { x: -LEAF_W + 1, y: LEAF_H } : { x: 2 * LEAF_W - 1, y: LEAF_H };

      setCurl({
        side,
        cornerY,
        targetMobileIndex: nextIdx,
        pointer: startPt,
        target: endPt,
        mode: 'animating',
        animStart: startPt,
        animEnd: endPt,
        animStartTime: performance.now(),
        animDuration: 420,
        commitOnFinish: true,
      });
    },
    [activeMobileIndex, commitMobileIndex, isZoomed, mobilePages.length]
  );

  // Scoped Wheel Zone: wheel inside Catalogue frame flips page; outside scrolls the page normally
  useEffect(() => {
    const leafEl = leafContainerRef.current;
    if (!leafEl) return;

    const handleCatalogueWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) return;
      if (isZoomed || drawerOpen || thumbnailView) return;

      const target = e.target as HTMLElement | null;
      if (target?.closest('select, input, textarea, [data-stop-wheel-turn="true"]')) {
        return;
      }

      const absY = Math.abs(e.deltaY);
      const absX = Math.abs(e.deltaX);
      const dominantDelta = absY >= absX ? e.deltaY : e.deltaX;
      if (Math.abs(dominantDelta) < 2) return;

      const dir: 'next' | 'prev' = dominantDelta > 0 ? 'next' : 'prev';
      if (dir === 'prev' && activeMobileIndex <= 0) return;
      if (dir === 'next' && activeMobileIndex >= mobilePages.length - 1) return;

      // Capture only inside Catalogue zone so page scrolls freely when mouse leaves the sheet
      e.preventDefault();
      e.stopPropagation();

      const now = performance.now();
      if (now < wheelCooldownUntilRef.current) return;

      const prev = wheelAccumRef.current;
      const gapTooLong = now - prev.lastTs > 180;
      const reversed = prev.dir !== dir;
      const nextValue =
        gapTooLong || reversed
          ? Math.abs(dominantDelta)
          : prev.value + Math.abs(dominantDelta);

      wheelAccumRef.current = { value: nextValue, dir, lastTs: now };

      if (nextValue >= 34) {
        wheelAccumRef.current = { value: 0, dir, lastTs: now };
        wheelCooldownUntilRef.current = now + 500;
        triggerCurlTurn(dir);
      }
    };

    leafEl.addEventListener('wheel', handleCatalogueWheel, { passive: false });
    return () => leafEl.removeEventListener('wheel', handleCatalogueWheel);
  }, [
    activeMobileIndex,
    drawerOpen,
    isZoomed,
    mobilePages.length,
    thumbnailView,
    triggerCurlTurn,
  ]);

  const startDragCorner = (
    e: React.PointerEvent,
    side: 'right' | 'left',
    cornerY: number
  ) => {
    if (isZoomed || drawerOpen || e.button > 0) return;
    const nextIdx = side === 'right' ? activeMobileIndex + 1 : activeMobileIndex - 1;
    if (nextIdx < 0 || nextIdx >= mobilePages.length) return;

    e.preventDefault();
    e.stopPropagation();

    pointerDownStartRef.current = { x: e.clientX, y: e.clientY };
    const pt = toLeafCoords(e.clientX, e.clientY);
    const startPeek: Pt = {
      x: side === 'right' ? Math.min(pt.x, LEAF_W - 20) : Math.max(pt.x, 20),
      y: pt.y,
    };

    setCurl({
      side,
      cornerY,
      targetMobileIndex: nextIdx,
      pointer: startPeek,
      target: startPeek,
      mode: 'dragging',
    });
  };

  // Touch gesture controller on the fitted stage:
  // - 2-finger pinch & spread smoothly zooms between 1.0x and 2.8x anchored to finger midpoint
  // - Double-tap toggles quick 1.75x reading zoom
  // - 1-finger horizontal swipe flips pages (strictly when not zoomed); when zoomed, 1-finger pans natively
  useEffect(() => {
    const slotEl = viewportSlotRef.current;
    if (!slotEl) return;

    const getTouchDistAndMid = (t1: Touch, t2: Touch) => ({
      dist: Math.max(12, Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)),
      midX: (t1.clientX + t2.clientX) / 2,
      midY: (t1.clientY + t2.clientY) / 2,
    });

    const onTouchStart = (e: TouchEvent) => {
      if (drawerOpen || thumbnailView) return;

      // Two-finger pinch/spread works at any zoom level and cancels any active single-finger drag
      if (e.touches.length === 2) {
        if (e.cancelable) e.preventDefault();
        swipeSessionRef.current = null;
        if (curlRef.current?.mode === 'dragging') {
          curlRef.current = null;
          setCurl(null);
        }
        const { dist, midX, midY } = getTouchDistAndMid(e.touches[0], e.touches[1]);
        const leafRect = leafContainerRef.current?.getBoundingClientRect();
        const normX = leafRect
          ? Math.max(0, Math.min(1, (midX - leafRect.left) / (leafRect.width || 1)))
          : 0.5;
        const normY = leafRect
          ? Math.max(0, Math.min(1, (midY - leafRect.top) / (leafRect.height || 1)))
          : 0.5;
        pinchSessionRef.current = {
          startDist: dist,
          startZoom: zoomScaleRef.current,
          normX,
          normY,
        };
        return;
      }

      if (e.touches.length !== 1) return;
      if (performance.now() < pinchCooldownUntilRef.current) return;

      const touch = e.touches[0];
      const target = e.target as HTMLElement | null;

      // Double-tap quick zoom toggle (skip buttons/links/selects/corner curl zones)
      const isInteractiveTarget = Boolean(
        target?.closest('button, a, select, input, [role="button"], [data-corner-zone="true"]')
      );
      if (!isInteractiveTarget) {
        const now = performance.now();
        const prevTap = lastTapRef.current;
        if (
          prevTap &&
          now - prevTap.ts < 300 &&
          Math.hypot(touch.clientX - prevTap.x, touch.clientY - prevTap.y) < 34
        ) {
          lastTapRef.current = null;
          swipeSessionRef.current = null;
          if (e.cancelable) e.preventDefault();
          const targetZoom = zoomScaleRef.current > 1.05 ? 1 : 1.75;
          applyAnchoredZoom(targetZoom, touch.clientX, touch.clientY);
          return;
        }
        lastTapRef.current = { ts: now, x: touch.clientX, y: touch.clientY };
      }

      // When zoomed in, allow native 2D panning instead of triggering page flips
      if (zoomScaleRef.current > 1.02) {
        swipeSessionRef.current = null;
        return;
      }

      const activeCurl = curlRef.current;
      if (activeCurl?.mode === 'dragging' || activeCurl?.mode === 'animating') return;
      if (isInteractiveTarget) return;

      swipeSessionRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        startTime: performance.now(),
        targetIdx: activeMobileIndex,
        side: 'right',
        cornerY: LEAF_H,
        lock: 'none',
      };
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        if (e.cancelable) e.preventDefault();
        swipeSessionRef.current = null;

        const { dist, midX, midY } = getTouchDistAndMid(e.touches[0], e.touches[1]);
        if (!pinchSessionRef.current) {
          const leafRect = leafContainerRef.current?.getBoundingClientRect();
          pinchSessionRef.current = {
            startDist: dist,
            startZoom: zoomScaleRef.current,
            normX: leafRect
              ? Math.max(0, Math.min(1, (midX - leafRect.left) / (leafRect.width || 1)))
              : 0.5,
            normY: leafRect
              ? Math.max(0, Math.min(1, (midY - leafRect.top) / (leafRect.height || 1)))
              : 0.5,
          };
          return;
        }

        const pinch = pinchSessionRef.current;
        const nextScale = pinch.startZoom * (dist / pinch.startDist);
        applyAnchoredZoom(nextScale, midX, midY, {
          normX: pinch.normX,
          normY: pinch.normY,
        });
        return;
      }

      if (pinchSessionRef.current) return;

      const sw = swipeSessionRef.current;
      if (!sw || e.touches.length !== 1 || zoomScaleRef.current > 1.02) return;

      const touch = e.touches[0];
      const dx = touch.clientX - sw.x;
      const dy = touch.clientY - sw.y;

      if (sw.lock === 'none') {
        if (Math.hypot(dx, dy) < 10) return;

        // Require clear horizontal dominance (|dx| > 1.25 * |dy| and >= 10px) before initiating flip
        const isClearHorizontal = Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.25;
        if (!isClearHorizontal) {
          sw.lock = 'vertical';
          return;
        }

        const side: 'right' | 'left' = dx < 0 ? 'right' : 'left';
        const nextIdx = side === 'right' ? activeMobileIndex + 1 : activeMobileIndex - 1;
        if (nextIdx < 0 || nextIdx >= mobilePages.length) {
          sw.lock = 'vertical';
          return;
        }

        sw.lock = 'horizontal';
        sw.side = side;
        sw.targetIdx = nextIdx;
        const rect = leafContainerRef.current?.getBoundingClientRect();
        const relY = rect ? ((touch.clientY - rect.top) / (rect.height || 1)) * LEAF_H : LEAF_H;
        sw.cornerY = relY < LEAF_H * 0.42 ? 0 : LEAF_H;

        if (e.cancelable) e.preventDefault();

        const initPt = toLeafCoords(touch.clientX, touch.clientY);
        setCurl({
          side,
          cornerY: sw.cornerY,
          targetMobileIndex: nextIdx,
          pointer: initPt,
          target: initPt,
          mode: 'dragging',
        });
        return;
      }

      if (sw.lock === 'horizontal') {
        if (e.cancelable) e.preventDefault();
        const pt = toLeafCoords(touch.clientX, touch.clientY);
        setCurl((prev) =>
          prev && prev.mode === 'dragging' ? { ...prev, target: pt } : prev
        );
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (pinchSessionRef.current && e.touches.length < 2) {
        pinchSessionRef.current = null;
        pinchCooldownUntilRef.current = performance.now() + 260;
        if (zoomScaleRef.current < 1.06) {
          setZoomScale(1);
        }
      }

      const sw = swipeSessionRef.current;
      swipeSessionRef.current = null;
      if (!sw || sw.lock !== 'horizontal') return;

      const current = curlRef.current;
      if (!current || current.mode !== 'dragging') return;

      const touch = e.changedTouches[0];
      const dx = touch ? touch.clientX - sw.x : 0;
      const elapsedMs = performance.now() - sw.startTime;
      const isDirectionalRight = current.side === 'right' ? dx < 0 : dx > 0;
      const shouldCommit =
        isDirectionalRight && (Math.abs(dx) > 48 || (Math.abs(dx) > 24 && elapsedMs < 240));

      const destCorner: Pt = shouldCommit
        ? {
            x: current.side === 'right' ? -LEAF_W + 1 : 2 * LEAF_W - 1,
            y: current.cornerY,
          }
        : {
            x: current.side === 'right' ? LEAF_W : 0,
            y: current.cornerY,
          };

      setCurl({
        ...current,
        mode: 'animating',
        animStart: current.pointer,
        animEnd: destCorner,
        animStartTime: performance.now(),
        animDuration: shouldCommit ? 340 : 220,
        commitOnFinish: shouldCommit,
      });
    };

    slotEl.addEventListener('touchstart', onTouchStart, { passive: false });
    slotEl.addEventListener('touchmove', onTouchMove, { passive: false });
    slotEl.addEventListener('touchend', onTouchEnd, { passive: true });
    slotEl.addEventListener('touchcancel', onTouchEnd, { passive: true });
    return () => {
      slotEl.removeEventListener('touchstart', onTouchStart);
      slotEl.removeEventListener('touchmove', onTouchMove);
      slotEl.removeEventListener('touchend', onTouchEnd);
      slotEl.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [
    activeMobileIndex,
    applyAnchoredZoom,
    drawerOpen,
    mobilePages.length,
    thumbnailView,
    toLeafCoords,
  ]);

  // Single-leaf diagonal polygon & fold crease computation
  const geom = useMemo(() => {
    if (!curl || isZoomed) return null;
    const W = LEAF_W;
    const H = LEAF_H;

    const P = clampSingleLeafPointer(curl.pointer, W, H, curl.side, curl.cornerY);
    const C: Pt = { x: curl.side === 'right' ? W : 0, y: curl.cornerY };
    const vx = C.x - P.x;
    const vy = C.y - P.y;
    const dist = Math.hypot(vx, vy);
    if (dist < 2) return null;

    const M: Pt = { x: (C.x + P.x) / 2, y: (C.y + P.y) / 2 };
    const N: Pt = { x: vx / dist, y: vy / dist };

    const pageRect: Pt[] = [
      { x: 0, y: 0 },
      { x: W, y: 0 },
      { x: W, y: H },
      { x: 0, y: H },
    ];

    const remainingPoly = clipPolyHalfPlane(pageRect, M, N, false);
    const peelPoly = clipPolyHalfPlane(pageRect, M, N, true);
    if (peelPoly.length < 3) return null;

    const flapPoly = peelPoly.map((pt) => {
      const d = (pt.x - M.x) * N.x + (pt.y - M.y) * N.y;
      return { x: pt.x - 2 * d * N.x, y: pt.y - 2 * d * N.y };
    });

    const foldAngleRad = Math.atan2(N.y, N.x);
    const foldLength = Math.hypot(W, H) * 2;
    const curlProgress = Math.min(1, dist / (W * 1.4));

    return {
      M,
      foldAngleDeg: (foldAngleRad * 180) / Math.PI,
      foldLength,
      curlProgress,
      remainingClip: polyToCssPct(remainingPoly, W, H),
      peelClip: polyToCssPct(peelPoly, W, H),
      flapClip: polyToCssPct(flapPoly, W, H),
    };
  }, [curl, isZoomed]);

  const targetEntry = curl ? mobilePages[curl.targetMobileIndex] : null;
  const currentLeafElement = useMemo(
    () => renderStaticPage(currentPage.spreadIndex, currentPage.side, false),
    [currentPage.side, currentPage.spreadIndex, renderStaticPage]
  );
  const targetLeafElement = useMemo(
    () =>
      targetEntry
        ? renderStaticPage(targetEntry.spreadIndex, targetEntry.side, true)
        : null,
    [renderStaticPage, targetEntry?.side, targetEntry?.spreadIndex]
  );
  const displayScrubIdx = scrubPreviewIdx ?? activeMobileIndex;
  const scrubPreviewPage =
    scrubPreviewIdx !== null ? mobilePages[scrubPreviewIdx] ?? null : null;
  const scrubTheme = scrubPreviewPage
    ? SECTION_THEME[scrubPreviewPage.sectionId]
    : secTheme;
  const progressPct =
    mobilePages.length > 1 ? (displayScrubIdx / (mobilePages.length - 1)) * 100 : 0;

  const cornerHitZones = !isZoomed
    ? [
        {
          side: 'right' as const,
          cornerY: LEAF_H,
          pos: 'bottom-0 right-0',
          enabled: activeMobileIndex < mobilePages.length - 1,
          label: 'Drag or tap bottom-right corner to turn next page',
        },
        {
          side: 'right' as const,
          cornerY: 0,
          pos: 'top-0 right-0',
          enabled: activeMobileIndex < mobilePages.length - 1,
          label: 'Drag or tap top-right corner to turn next page',
        },
        {
          side: 'left' as const,
          cornerY: LEAF_H,
          pos: 'bottom-0 left-0',
          enabled: activeMobileIndex > 0,
          label: 'Drag or tap bottom-left corner to turn previous page',
        },
        {
          side: 'left' as const,
          cornerY: 0,
          pos: 'top-0 left-0',
          enabled: activeMobileIndex > 0,
          label: 'Drag or tap top-left corner to turn previous page',
        },
      ]
    : [];

  return (
    <MobileDisplayContext.Provider value={true}>
    <section
      ref={stageRootRef}
      aria-label={
        isMobilePaperback
          ? 'Print Edition 1-page flipbook reader'
          : 'Mobile 1-page catalogue flipbook'
      }
      className={`relative flex flex-col overflow-hidden ${
        isFullscreen
          ? 'fixed inset-0 z-50 h-dvh w-screen'
          : 'h-full min-h-0 w-full flex-1'
      } ${isMobilePaperback ? 'bg-[#EFECE5]' : 'bg-[#F2F1ED]'}`}
    >
      {/* SINGLE-PAGE FLIPBOOK STAGE (Unobstructed corners; pinch/spread or double-tap enables 2D panning) */}
      <div
        ref={viewportSlotRef}
        style={{
          touchAction: isZoomed ? 'pan-x pan-y' : 'pan-y',
        }}
        className={`relative flex min-h-0 flex-1 overscroll-contain ${
          isZoomed
            ? 'items-start justify-start overflow-auto p-2 pb-4'
            : isFullscreen
              ? 'items-center justify-center overflow-hidden px-1.5 py-1'
              : 'items-center justify-center overflow-hidden px-1.5 py-1.5'
        }`}
      >

        {/* Scaled Physical A4 Page Wrapper (595 x 842 scaled cleanly) */}
        <div
          className={isZoomed ? 'mx-auto min-w-fit shrink-0' : 'shrink-0'}
          style={{
            width: `${scaledW}px`,
            height: `${scaledH}px`,
            touchAction: isZoomed ? 'pan-x pan-y' : 'pan-y',
          }}
        >
          <div
            ref={leafContainerRef}
            style={{
              width: `${LEAF_W}px`,
              height: `${LEAF_H}px`,
              transform: `scale(${effectiveScale})`,
              transformOrigin: 'top left',
              boxShadow:
                '2px 0 0 #F4F3EE, 3px 0 0 #DDDAD2, 5px 0 0 #F4F3EE, 6px 0 0 #CFCBC2, 0 12px 28px rgba(0, 0, 0, 0.11)',
            }}
            className="relative overflow-hidden border border-[#DCDAD2] bg-white"
          >
            {/* Underneath Revealed Leaf during Page Curl (memoized across 60fps frames) */}
            {geom && targetLeafElement && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-white"
              >
                {targetLeafElement}
              </div>
            )}

            {/* Primary Current A4 Leaf (Clipped along diagonal fold crease during curl; memoized across 60fps frames) */}
            <div
              className="relative z-10 h-full w-full overflow-hidden bg-white"
              style={geom ? { clipPath: geom.remainingClip } : undefined}
            >
              {currentLeafElement}
            </div>

            {/* Cast Shadow along Diagonal Fold Line onto Underneath Page */}
            {geom && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
                style={{ clipPath: geom.peelClip }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: `${geom.M.x}px`,
                    top: `${geom.M.y}px`,
                    width: '62px',
                    height: `${geom.foldLength}px`,
                    transformOrigin: '0 50%',
                    transform: `translate(0, -50%) rotate(${geom.foldAngleDeg}deg)`,
                    background: `linear-gradient(to right, rgba(0, 0, 0, ${
                      0.14 + geom.curlProgress * 0.14
                    }) 0%, rgba(0, 0, 0, 0.05) 42%, transparent 100%)`,
                  }}
                />
              </div>
            )}

            {/* Lifted Diagonal Paper Curl Flap (without full-page GPU filter: drop-shadow for mobile stability) */}
            {geom && curl && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-30 overflow-hidden"
                style={{
                  clipPath: geom.flapClip,
                  background:
                    'linear-gradient(135deg, #FFFFFF 0%, #F7F6F2 58%, #EAE8E1 100%)',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: `${geom.M.x}px`,
                    top: `${geom.M.y}px`,
                    width: '54px',
                    height: `${geom.foldLength}px`,
                    transformOrigin: '100% 50%',
                    transform: `translate(-100%, -50%) rotate(${geom.foldAngleDeg}deg)`,
                    background:
                      'linear-gradient(to left, rgba(0,0,0,0.18) 0%, rgba(255,255,255,0.6) 18%, rgba(0,0,0,0.04) 58%, transparent 100%)',
                  }}
                />
              </div>
            )}

            {/* Corner-Peel Touch Hot Zones */}
            {cornerHitZones.map((zone) =>
              zone.enabled ? (
                <div
                  key={`${zone.side}-${zone.cornerY}`}
                  data-corner-zone="true"
                  role="button"
                  tabIndex={0}
                  aria-label={zone.label}
                  onPointerDown={(e) => startDragCorner(e, zone.side, zone.cornerY)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      triggerCurlTurn(zone.side === 'right' ? 'next' : 'prev');
                    }
                  }}
                  className={`absolute ${zone.pos} z-40 h-20 w-20 touch-none`}
                >
                  {zone.side === 'right' && zone.cornerY === LEAF_H && !curl && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute right-0 bottom-0 h-5 w-5 border-t border-l border-[#D0CEC7] bg-gradient-to-tl from-[#ECEAE3] via-white to-transparent opacity-70"
                    />
                  )}
                </div>
              ) : null
            )}
          </div>
        </div>
      </div>

      {/* INTEGRATED BOTTOM FLIPBOOK BAR (HAMBURGER MENU · ARROWS & FOLIO · ZOOM · FULLSCREEN · LIVE SCRUBBER) */}
      <footer
        className={`relative sticky bottom-0 z-40 shrink-0 border-t px-2.5 pt-0.5 ${
          isMobilePaperback
            ? 'border-[#DCD7CC] bg-[#FAF8F3]/96'
            : 'border-[#E3E1DB] bg-white/96'
        }`}
        style={{ paddingBottom: 'max(0.3rem, env(safe-area-inset-bottom))' }}
      >
        {/* Live Page/Style Preview Pill while Scrubbing (Omotenashi: see destination before releasing thumb) */}
        {scrubPreviewPage && (
          <div className="pointer-events-none absolute right-3 bottom-full left-3 mb-2 flex justify-center">
            <div className="inline-flex max-w-full items-center gap-2 border border-[#111111]/15 bg-[#111111]/92 px-3 py-1.5 text-white shadow-lg">
              <span
                aria-hidden="true"
                className="h-3 w-[3px] shrink-0"
                style={{ backgroundColor: scrubTheme.markerColor }}
              />
              <span className="shrink-0 font-mono text-[10.5px] font-semibold text-white/85 tabular-nums">
                {scrubPreviewPage.folioCode}
              </span>
              <span className="truncate text-[11px] font-medium">
                {scrubPreviewPage.shortTitle}
              </span>
            </div>
          </div>
        )}

        <div className="mx-auto max-w-xl">
          <div className="flex items-center justify-between gap-1">
            {/* Left: Hamburger Menu */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open catalogue menu"
              title="Catalogue Menu & Chapters"
              className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#E5E3DD] bg-white text-[#111111] transition-colors active:bg-[#F3F2EE]"
            >
              <Menu className="h-4 w-4" />
            </button>

            {/* Center: Prev · Page Counter · Next */}
            <div className="flex min-w-0 items-center justify-center gap-0.5">
              <button
                type="button"
                disabled={activeMobileIndex <= 0}
                onClick={() => triggerCurlTurn('prev')}
                aria-label="Previous page"
                className="flex h-8 w-9 shrink-0 items-center justify-center text-[#111111] transition-opacity active:opacity-55 disabled:opacity-25"
              >
                <Undo2 className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                aria-label="Jump to chapter or style"
                className="flex min-w-0 items-center gap-1.5 px-1.5 py-0.5 text-center font-mono text-[11px] font-semibold text-[#111111] tabular-nums"
              >
                <span>{displayScrubIdx + 1}</span>
                <span className="text-[#9E9B93]">/ {mobilePages.length}</span>
                <span aria-hidden="true" className="text-[#C8C5BE]">·</span>
                <span className="truncate font-sans text-[11px] font-medium text-[#55534E]">
                  {(scrubPreviewPage ?? currentPage).folioCode}
                </span>
              </button>

              <button
                type="button"
                disabled={activeMobileIndex >= mobilePages.length - 1}
                onClick={() => triggerCurlTurn('next')}
                aria-label="Next page"
                className="flex h-8 w-9 shrink-0 items-center justify-center text-[#111111] transition-opacity active:opacity-55 disabled:opacity-25"
              >
                <Redo2 className="h-4 w-4" />
              </button>
            </div>

            {/* Right: Zoom & Fullscreen */}
            <div className="flex shrink-0 items-center border border-[#E5E3DD] bg-white">
              <button
                type="button"
                onClick={() => setZoomScale((z) => (z > 1.02 ? 1 : 1.75))}
                aria-label={isZoomed ? 'Fit page to screen' : 'Zoom in to read'}
                title={isZoomed ? 'Fit Page' : 'Zoom In'}
                className={`flex h-8 min-w-8 items-center justify-center gap-1 border-r border-[#EAE8E2] px-1.5 transition-colors ${
                  isZoomed ? 'bg-[#0A0A0A] text-white' : 'text-[#111111] active:bg-[#F3F2EE]'
                }`}
              >
                {isZoomed ? (
                  <ZoomOut className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <ZoomIn className="h-3.5 w-3.5 shrink-0" />
                )}
                {isZoomed && (
                  <span className="font-mono text-[10px] font-medium tabular-nums">
                    {Math.round(zoomScale * 100)}%
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => void toggleFullscreen()}
                aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                className={`flex h-8 w-8 items-center justify-center transition-colors ${
                  isFullscreen ? 'bg-[#0A0A0A] text-white' : 'text-[#111111] active:bg-[#F3F2EE]'
                }`}
              >
                {isFullscreen ? (
                  <Minimize className="h-3.5 w-3.5" />
                ) : (
                  <Maximize className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Slim Bottom Progress Scrubber (Smooth thumb preview + commit on release) */}
          <div className="relative flex h-4 items-center">
            <div className="relative h-[4px] w-full rounded-full bg-[#DFDDD6]">
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-75"
                style={{
                  width: `${progressPct}%`,
                  backgroundColor: scrubTheme.markerColor,
                }}
              />
              <span
                aria-hidden="true"
                className="absolute top-1/2 h-2.5 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#66645F]"
                style={{ left: `${progressPct}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={Math.max(0, mobilePages.length - 1)}
              step={1}
              value={displayScrubIdx}
              aria-label="Scrub catalogue pages"
              onPointerDown={() => {
                isScrubbingRef.current = true;
                scrubPreviewRef.current = null;
              }}
              onTouchStart={() => {
                isScrubbingRef.current = true;
                scrubPreviewRef.current = null;
              }}
              onChange={(e) => {
                const nextIdx = Number(e.target.value);
                if (isScrubbingRef.current) {
                  scrubPreviewRef.current = nextIdx;
                  setScrubPreviewIdx(nextIdx);
                } else {
                  scrubPreviewRef.current = null;
                  setScrubPreviewIdx(null);
                  commitMobileIndex(nextIdx);
                }
              }}
              onPointerUp={flushScrubCommit}
              onPointerCancel={flushScrubCommit}
              onTouchEnd={flushScrubCommit}
              onTouchCancel={flushScrubCommit}
              onBlur={flushScrubCommit}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </div>
        </div>
      </footer>

      {/* MOBILE THUMBNAIL SPREADS GRID OVERLAY */}
      {thumbnailView && !isMobilePaperback && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#FAF9F6]">
          <div className="flex shrink-0 items-center justify-between border-b border-[#DCDAD3] bg-white px-4 py-3">
            <div>
              <h2 className="font-sans text-sm font-bold text-[#111111]">
                All {totalSpreads} Spreads
              </h2>
              <p className="text-[11px] text-[#66645F]">
                Tap any spread to jump straight to its pages.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setThumbnailView(false)}
              className="border border-[#0A0A0A] bg-[#0A0A0A] px-3 py-1.5 text-xs font-medium text-white"
            >
              Return
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 pb-10">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {Array.from({ length: totalSpreads }, (_, idx) => {
                const isCurrent = idx === bookPage;
                const isProd = idx >= productOffset && idx < productOffset + garments.length;
                const prod = isProd ? garments[idx - productOffset] : null;
                const isSwatch = idx >= 2 && idx < productOffset;
                const swatch = isSwatch ? navMap?.orderedFabrics[idx - 2] : null;
                const swatchHero = swatch
                  ? getPreferredFactoryFabricImage(swatch.fabricCode, fabricColorImages)
                  : undefined;
                const firstCol = swatch?.factoryColors[0];
                const colImg = firstCol
                  ? fabricColorImages[
                      getFactoryColorImageKey(swatch!.fabricCode, firstCol.colorName)
                    ] ?? firstCol.swatchImageUrl
                  : undefined;
                const swatchImg = swatchHero?.imageUrl || colImg;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => jumpToSpread(idx, 'verso')}
                    className={`border bg-white p-2 text-left transition-all ${
                      isCurrent ? 'border-[#0A0A0A] ring-1 ring-[#0A0A0A]' : 'border-[#E5E3DD]'
                    }`}
                  >
                    <div className="mb-1.5 flex items-center justify-between font-mono text-[9.5px] text-[#77756F] tabular-nums">
                      <span>P.{String(idx + 1).padStart(2, '0')}</span>
                      <span className="truncate pl-1">
                        {idx === 0
                          ? 'Intro'
                          : idx === 1
                            ? 'TOC'
                            : swatch
                              ? swatch.fabricCode
                              : prod
                                ? prod.sku
                                : idx === totalSpreads - 2
                                  ? 'Sizes'
                                  : 'Studio'}
                      </span>
                    </div>
                    <div className="aspect-[16/10] w-full overflow-hidden border border-[#ECEAE3] bg-[#F7F6F2]">
                      {prod?.media.hero.url ? (
                        <img
                          src={resolveMobileDisplayUrl(prod.media.hero.url, true)}
                          alt={prod.title}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover object-top"
                        />
                      ) : swatchImg ? (
                        <img
                          src={resolveMobileDisplayUrl(swatchImg, true)}
                          alt={swatch?.fabricCode}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center font-serif text-xs italic text-[#737373]">
                          {idx === 0
                            ? 'DT Intro'
                            : idx === 1
                              ? 'Directory'
                              : idx === totalSpreads - 2
                                ? 'Size Charts'
                                : 'Thank You'}
                        </div>
                      )}
                    </div>
                    <p className="mt-1.5 truncate text-[11px] font-medium text-[#111111]">
                      {prod
                        ? isMobileWorkbench
                          ? prod.title
                          : displayBuyerProductTitle(prod.title)
                        : swatch
                          ? `Fabric ${swatch.fabricCode}`
                          : idx === 0
                            ? 'Cover & Overview'
                            : idx === 1
                              ? 'Table of Contents'
                              : idx === totalSpreads - 2
                                ? 'Size Charts'
                                : 'Colophon & Contact'}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SLIDE-UP CHAPTER & CONTENTS DRAWER */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/45"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[82vh] overflow-y-auto border-t border-[#DCDAD3] bg-white px-4 pt-4 pb-8 shadow-2xl"
            style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
          >
            <div className="mb-4 flex items-start justify-between gap-3 border-b border-[#EAE8E2] pb-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 shrink-0 text-[#111111]" />
                  <span className="font-sans text-sm font-bold text-[#111111]">
                    Catalogue Contents
                  </span>
                </div>
                <p className="mt-1 truncate font-mono text-[10px] text-[#77756F]">
                  Now viewing: {currentPage.folioCode} · {currentPage.shortTitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close contents drawer"
                className="shrink-0 border border-[#DCDAD3] p-1.5 text-[#111111]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* 5 Chapters */}
            <div className="mb-4">
              <p className="mb-2 font-mono text-[9.5px] uppercase tracking-[0.14em] text-[#77756F]">
                Chapters
              </p>
              <div className="space-y-1.5">
                {(navMap?.sections ?? []).map((sec, idx) => {
                  const isCurrent = currentPage?.sectionId === sec.id;
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => jumpToSpread(sec.startSpreadPage, 'verso')}
                      className={`flex w-full items-center justify-between border px-3 py-2.5 text-left text-xs ${
                        isCurrent
                          ? 'border-[#111111] bg-[#111111] text-white'
                          : 'border-[#E6E4DE] bg-[#FAF9F6] text-[#111111]'
                      }`}
                    >
                      <span className="flex items-center gap-2 font-medium">
                        <span
                          aria-hidden="true"
                          className="h-3 w-[3px]"
                          style={{ backgroundColor: sec.markerColor }}
                        />
                        <span className="font-mono text-[10px] opacity-70 tabular-nums">
                          0{idx + 1}
                        </span>
                        <span>{sec.label}</span>
                      </span>
                      <span className="flex items-center gap-1 font-mono text-[10px] opacity-75 tabular-nums">
                        P.{String(sec.startSpreadPage + 1).padStart(2, '0')}
                        <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Categories Quick Jump */}
            {navMap && !isMobilePaperback && (
              <div className="mb-4">
                <p className="mb-2 font-mono text-[9.5px] uppercase tracking-[0.14em] text-[#77756F]">
                  Categories
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {navMap.categoryRanges.map((cat) => {
                    const isCatActive = activeProduct?.category === cat.name;
                    return (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() => jumpToSpread(cat.firstPage, 'verso')}
                        className={`border px-2.5 py-1.5 text-[11px] font-medium ${
                          isCatActive
                            ? 'border-[#111111] bg-[#111111] text-white'
                            : 'border-[#DCDAD3] bg-white text-[#111111]'
                        }`}
                      >
                        {cat.name} ({cat.count})
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Direct Spread / Style Jump */}
            <div className="mb-4">
              <label
                htmlFor="mobile-drawer-jump"
                className="mb-1.5 block font-mono text-[9.5px] uppercase tracking-[0.14em] text-[#77756F]"
              >
                Jump to Page / Style
              </label>
              <select
                id="mobile-drawer-jump"
                value={bookPage}
                onChange={(e) => jumpToSpread(Number(e.target.value), 'verso')}
                className="w-full border border-[#111111] bg-white px-3 py-2.5 font-mono text-xs text-[#111111]"
              >
                {Array.from({ length: totalSpreads }, (_, index) => (
                  <option key={index} value={index}>
                    {getSpreadLabel(index)}
                  </option>
                ))}
              </select>
            </div>

            {/* View, Export, Demo Order & Studio Tools */}
            {(!isMobilePaperback || Boolean(onOpenPrintPdf) || Boolean(onCopyShareLink) || isMobileWorkbench) && (
              <div className="border-t border-[#EAE8E2] pt-3">
                <p className="mb-2 font-mono text-[9.5px] uppercase tracking-[0.14em] text-[#77756F]">
                  {isMobileWorkbench ? 'View & Studio Tools' : 'View & Ordering'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {onCopyShareLink && (
                    <button
                      type="button"
                      onClick={() => {
                        setDrawerOpen(false);
                        onCopyShareLink();
                      }}
                      className="inline-flex items-center gap-1.5 border border-[#DCDAD3] bg-white px-3 py-2 text-xs font-medium text-[#111111]"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      <span>Copy Page Link</span>
                    </button>
                  )}
                  {!isMobilePaperback && (
                    <button
                      type="button"
                      onClick={() => {
                        setThumbnailView((v) => !v);
                        setDrawerOpen(false);
                      }}
                      className={`inline-flex items-center gap-1.5 border px-3 py-2 text-xs font-medium ${
                        thumbnailView
                          ? 'border-[#111111] bg-[#111111] text-white'
                          : 'border-[#DCDAD3] bg-white text-[#111111]'
                      }`}
                    >
                      <Grid className="h-3.5 w-3.5" />
                      <span>{thumbnailView ? 'Flipbook View' : 'All Spreads'}</span>
                    </button>
                  )}
                  {onOpenPrintPdf && (
                    <button
                      type="button"
                      onClick={() => {
                        setDrawerOpen(false);
                        onOpenPrintPdf();
                      }}
                      className="inline-flex items-center gap-1.5 border border-[#111111] bg-white px-3 py-2 text-xs font-medium text-[#111111]"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      <span>{printPdfLabel}</span>
                    </button>
                  )}
                  {!isMobilePaperback && onToggleDemoMode && (
                    <button
                      type="button"
                      onClick={() => {
                        onToggleDemoMode();
                        setDrawerOpen(false);
                      }}
                      className={`inline-flex items-center gap-1.5 border px-3 py-2 text-xs font-medium ${
                        demoMode
                          ? 'border-[#111111] bg-[#111111] text-white'
                          : 'border-[#DCDAD3] bg-white text-[#111111]'
                      }`}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Demo Order: {demoMode ? 'On' : 'Off'}</span>
                    </button>
                  )}
                  {isMobileWorkbench && onToggleSafeZones && (
                    <button
                      type="button"
                      onClick={() => {
                        onToggleSafeZones();
                        setDrawerOpen(false);
                      }}
                      className={`inline-flex items-center gap-1.5 border px-3 py-2 text-xs font-medium ${
                        showSafeZones
                          ? 'border-[#111111] bg-[#111111] text-white'
                          : 'border-[#DCDAD3] bg-white text-[#111111]'
                      }`}
                    >
                      <Ruler className="h-3.5 w-3.5" />
                      <span>Guides: {showSafeZones ? 'On' : 'Off'}</span>
                    </button>
                  )}
                  {isMobileWorkbench && (
                    <button
                      type="button"
                      onClick={() => {
                        onToggleEditMode();
                        setDrawerOpen(false);
                      }}
                      className={`border px-3 py-2 text-xs font-medium ${
                        editMode
                          ? 'border-[#111111] bg-[#111111] text-white'
                          : 'border-[#DCDAD3] bg-white text-[#111111]'
                      }`}
                    >
                      Replace Mode: {editMode ? 'On' : 'Off'}
                    </button>
                  )}
                  {isMobileWorkbench && onOpenCropPresetModal && (
                    <button
                      type="button"
                      onClick={() => {
                        setDrawerOpen(false);
                        onOpenCropPresetModal();
                      }}
                      className="border border-[#DCDAD3] bg-white px-3 py-2 text-xs font-medium text-[#111111]"
                    >
                      {customFramingCount > 0 ? `Crops I/O (${customFramingCount})` : 'Crops I/O'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
    </MobileDisplayContext.Provider>
  );
};
