import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronRight,
  Layers,
  LayoutGrid,
  Maximize,
  Minimize,
  Redo2,
  Sparkles,
  Undo2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type { GarmentItem } from '../types/catalogue';
import {
  SECTION_THEME,
  type CatalogueNavigationMap,
  type SectionId,
} from '../utils/catalogueOrder';
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
  customFramingCount?: number;
  getSpreadLabel: (page: number) => string;
  renderStaticPage: (
    page: number,
    side?: SpreadLeafSide,
    isPreviewLayer?: boolean
  ) => React.ReactNode;
  onChangeBookPage: (page: number) => void;
  onToggleEditMode: () => void;
  onOpenCropPresetModal?: () => void;
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
  customFramingCount = 0,
  getSpreadLabel,
  renderStaticPage,
  onChangeBookPage,
  onToggleEditMode,
  onOpenCropPresetModal,
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

    // Final spread: Colophon / Studio Specs + Thank You
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
      shortTitle: 'Thank You · Contact Us',
      folioCode: `P.${endNum}B`,
    });

    return list;
  }, [garments, isMobileWorkbench, navMap, productOffset, totalSpreads]);

  const [leafSidePref, setLeafSidePref] = useState<'verso' | 'recto'>('verso');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const [isPseudoFullscreen, setIsPseudoFullscreen] = useState(false);
  const [slotSize, setSlotSize] = useState<{ w: number; h: number }>({ w: 390, h: 640 });
  const [curl, setCurl] = useState<MobileCurlSession | null>(null);

  const stageRootRef = useRef<HTMLElement | null>(null);
  const viewportSlotRef = useRef<HTMLDivElement | null>(null);
  const leafContainerRef = useRef<HTMLDivElement | null>(null);
  const curlRef = useRef<MobileCurlSession | null>(null);
  const lastInternalSpreadRef = useRef<number>(bookPage);
  const pointerDownStartRef = useRef<{ x: number; y: number } | null>(null);
  const swipeSessionRef = useRef<{
    x: number;
    y: number;
    targetIdx: number;
    side: 'right' | 'left';
    cornerY: number;
    lock: 'none' | 'horizontal' | 'vertical';
  } | null>(null);

  const isFullscreen = isNativeFullscreen || isPseudoFullscreen;

  useEffect(() => {
    curlRef.current = curl;
  }, [curl]);

  // If external hyperlink inside a spread jumps bookPage, land cleanly on that spread's verso page
  useEffect(() => {
    if (bookPage !== lastInternalSpreadRef.current) {
      lastInternalSpreadRef.current = bookPage;
      setLeafSidePref('verso');
    }
  }, [bookPage]);

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

  const commitMobileIndex = useCallback(
    (targetIdx: number) => {
      const clamped = Math.max(0, Math.min(mobilePages.length - 1, targetIdx));
      const next = mobilePages[clamped];
      if (!next) return;
      lastInternalSpreadRef.current = next.spreadIndex;
      setLeafSidePref(next.side);
      if (next.spreadIndex !== bookPage) {
        onChangeBookPage(next.spreadIndex);
      }
    },
    [bookPage, mobilePages, onChangeBookPage]
  );

  const jumpToSpread = (spreadIdx: number, side: 'verso' | 'recto' = 'verso') => {
    const clampedSpread = Math.max(0, Math.min(totalSpreads - 1, spreadIdx));
    lastInternalSpreadRef.current = clampedSpread;
    setLeafSidePref(side);
    onChangeBookPage(clampedSpread);
    setDrawerOpen(false);
    setCurl(null);
  };

  // Measure live stage slot for Fit-to-Screen 1-page A4 scaling
  useEffect(() => {
    const el = viewportSlotRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 120 && rect.height > 120) {
        setSlotSize({ w: rect.width, h: rect.height });
      }
    };
    update();
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        if (cr.width > 120 && cr.height > 120) {
          setSlotSize({ w: cr.width, h: cr.height });
        }
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [isFullscreen, mode]);

  const fitScale = useMemo(() => {
    const availW = Math.max(240, slotSize.w - 22);
    const availH = Math.max(300, slotSize.h - 20);
    const raw = Math.min(availW / LEAF_W, availH / LEAF_H, 1.15);
    return Math.round(Math.max(0.35, raw) * 1000) / 1000;
  }, [slotSize.w, slotSize.h]);

  const effectiveScale = isZoomed ? Math.max(0.95, Math.min(1.4, fitScale * 1.68)) : fitScale;
  const scaledW = Math.round(LEAF_W * effectiveScale);
  const scaledH = Math.round(LEAF_H * effectiveScale);

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
      if (e.key === 'Escape' && isPseudoFullscreen) {
        setIsPseudoFullscreen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isPseudoFullscreen]);

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

  const triggerCurlTurn = (dir: 'next' | 'prev') => {
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
  };

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

  // Horizontal touch swipe anywhere on sheet initiates live diagonal curl when not zoomed
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isZoomed || drawerOpen || e.touches.length !== 1) return;
    if (curl?.mode === 'dragging' || curl?.mode === 'animating') return;
    const target = e.target as HTMLElement | null;
    if (target?.closest('button, a, select, input, [role="button"]')) return;

    const touch = e.touches[0];
    swipeSessionRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      targetIdx: activeMobileIndex,
      side: 'right',
      cornerY: LEAF_H,
      lock: 'none',
    };
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const sw = swipeSessionRef.current;
    if (!sw || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const dx = touch.clientX - sw.x;
    const dy = touch.clientY - sw.y;

    if (sw.lock === 'none') {
      if (Math.abs(dx) < 12 && Math.abs(dy) < 12) return;
      if (Math.abs(dy) > Math.abs(dx)) {
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

      const initPt = toLeafCoords(touch.clientX, touch.clientY);
      setCurl({
        side,
        cornerY: sw.cornerY,
        targetMobileIndex: nextIdx,
        pointer: initPt,
        target: initPt,
        mode: 'dragging',
      });
    }

    if (sw.lock === 'horizontal') {
      const pt = toLeafCoords(touch.clientX, touch.clientY);
      setCurl((prev) =>
        prev && prev.mode === 'dragging' ? { ...prev, target: pt } : prev
      );
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const sw = swipeSessionRef.current;
    swipeSessionRef.current = null;
    if (!sw || sw.lock !== 'horizontal') return;

    const current = curlRef.current;
    if (!current || current.mode !== 'dragging') return;

    const touch = e.changedTouches[0];
    const dx = touch ? touch.clientX - sw.x : 0;
    const shouldCommit = Math.abs(dx) > 48;

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
  const progressPct =
    mobilePages.length > 1 ? (activeMobileIndex / (mobilePages.length - 1)) * 100 : 0;

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
          : isMobileWorkbench
            ? 'h-[calc(100dvh-9.5rem)] w-full'
            : mode === 'buyer'
              ? 'h-[calc(100dvh-6.75rem)] w-full'
              : 'h-[calc(100dvh-4rem)] w-full'
      } ${isMobilePaperback ? 'bg-[#EFECE5]' : 'bg-[#F2F1ED]'}`}
    >
      {/* Top-Right Floating Compact Controls (Contents · Zoom · Fullscreen) */}
      <div className="absolute top-2.5 right-3 z-40 flex items-center border border-[#DCDAD3] bg-white/95 shadow-sm backdrop-blur-sm">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open catalogue contents"
          title="Catalogue Contents & Chapters"
          className="flex h-9 w-9 items-center justify-center border-r border-[#EAE8E2] text-[#111111] active:bg-[#F3F2EE]"
        >
          <LayoutGrid className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setIsZoomed((z) => !z)}
          aria-label={isZoomed ? 'Fit page to screen' : 'Zoom in to read'}
          title={isZoomed ? 'Fit Page' : 'Zoom In'}
          className={`flex h-9 w-9 items-center justify-center border-r border-[#EAE8E2] transition-colors ${
            isZoomed ? 'bg-[#0A0A0A] text-white' : 'text-[#111111] active:bg-[#F3F2EE]'
          }`}
        >
          {isZoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={() => void toggleFullscreen()}
          aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          className={`flex h-9 w-9 items-center justify-center transition-colors ${
            isFullscreen ? 'bg-[#0A0A0A] text-white' : 'text-[#111111] active:bg-[#F3F2EE]'
          }`}
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </button>
      </div>

      {/* SINGLE-PAGE FLIPBOOK STAGE */}
      <div
        ref={viewportSlotRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className={`relative flex min-h-0 flex-1 ${
          isZoomed
            ? 'items-start justify-start overflow-auto p-3'
            : 'items-center justify-center overflow-hidden px-2.5 pt-2.5 pb-1.5'
        }`}
      >

        {/* Scaled Physical A4 Page Wrapper (595 x 842 scaled cleanly) */}
        <div
          className={isZoomed ? 'mx-auto shrink-0' : 'shrink-0'}
          style={{
            width: `${scaledW}px`,
            height: `${scaledH}px`,
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
                '2px 0 0 #F4F3EE, 3px 0 0 #DDDAD2, 5px 0 0 #F4F3EE, 6px 0 0 #CFCBC2, 0 12px 32px rgba(0, 0, 0, 0.12)',
            }}
            className="relative overflow-hidden border border-[#DCDAD2] bg-white"
          >
            {/* Underneath Revealed Leaf during Page Curl */}
            {geom && targetEntry && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-0 isolate overflow-hidden bg-white"
              >
                {renderStaticPage(targetEntry.spreadIndex, targetEntry.side, true)}
              </div>
            )}

            {/* Primary Current A4 Leaf (Clipped along diagonal fold crease during curl) */}
            <div
              className="relative z-10 isolate h-full w-full overflow-hidden bg-white"
              style={geom ? { clipPath: geom.remainingClip } : undefined}
            >
              {renderStaticPage(currentPage.spreadIndex, currentPage.side, false)}
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

            {/* Lifted Diagonal Paper Curl Flap */}
            {geom && curl && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-30 isolate overflow-hidden"
                style={{
                  filter: `drop-shadow(${
                    curl.side === 'right' ? '-5px' : '5px'
                  } 5px 12px rgba(0, 0, 0, ${0.14 + geom.curlProgress * 0.12}))`,
                }}
              >
                <div
                  className="absolute inset-0 isolate overflow-hidden"
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
                        'linear-gradient(to left, rgba(0,0,0,0.16) 0%, rgba(255,255,255,0.6) 18%, rgba(0,0,0,0.04) 58%, transparent 100%)',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Corner-Peel Touch Hot Zones */}
            {cornerHitZones.map((zone) =>
              zone.enabled ? (
                <div
                  key={`${zone.side}-${zone.cornerY}`}
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

      {/* MINIMAL BOTTOM FLIPBOOK BAR (TURN ARROWS + PAGE NUMBER + PROGRESS SLIDER) */}
      <footer
        className={`shrink-0 border-t px-3 pt-1 ${
          isMobilePaperback
            ? 'border-[#DCD7CC] bg-[#FAF8F3]/95'
            : 'border-[#E3E1DB] bg-white/95'
        }`}
        style={{ paddingBottom: 'max(0.45rem, env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto max-w-xl">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              disabled={activeMobileIndex <= 0}
              onClick={() => triggerCurlTurn('prev')}
              aria-label="Previous page"
              className="flex h-9 w-11 items-center justify-center text-[#111111] transition-opacity active:opacity-55 disabled:opacity-25"
            >
              <Undo2 className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="flex min-w-0 items-center gap-2 px-2 py-1 text-center font-mono text-[11px] font-semibold text-[#111111] tabular-nums"
            >
              <span>{activeMobileIndex + 1}</span>
              <span className="text-[#9E9B93]">/ {mobilePages.length}</span>
              <span aria-hidden="true" className="text-[#C8C5BE]">·</span>
              <span className="truncate font-sans text-[11px] font-medium text-[#55534E]">
                {currentPage.folioCode}
              </span>
            </button>

            <button
              type="button"
              disabled={activeMobileIndex >= mobilePages.length - 1}
              onClick={() => triggerCurlTurn('next')}
              aria-label="Next page"
              className="flex h-9 w-11 items-center justify-center text-[#111111] transition-opacity active:opacity-55 disabled:opacity-25"
            >
              <Redo2 className="h-4 w-4" />
            </button>
          </div>

          {/* Slim Bottom Progress Scrubber */}
          <div className="relative mt-0.5 flex h-4 items-center">
            <div className="relative h-[4px] w-full rounded-full bg-[#DFDDD6]">
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-100"
                style={{
                  width: `${progressPct}%`,
                  backgroundColor: secTheme.markerColor,
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
              value={activeMobileIndex}
              aria-label="Scrub catalogue pages"
              onChange={(e) => commitMobileIndex(Number(e.target.value))}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </div>
        </div>
      </footer>

      {/* SLIDE-UP CHAPTER & CONTENTS DRAWER */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/45 backdrop-blur-[2px]">
          <div
            className="max-h-[82vh] overflow-y-auto border-t border-[#DCDAD3] bg-white px-4 pt-4 pb-8 shadow-2xl"
            style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
          >
            <div className="mb-4 flex items-center justify-between border-b border-[#EAE8E2] pb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#111111]" />
                <span className="font-sans text-sm font-bold text-[#111111]">
                  Catalogue Contents
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close contents drawer"
                className="border border-[#DCDAD3] p-1.5 text-[#111111]"
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
                  {navMap.categoryRanges.map((cat) => (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => jumpToSpread(cat.firstPage, 'verso')}
                      className="border border-[#DCDAD3] bg-white px-2.5 py-1.5 text-[11px] font-medium text-[#111111]"
                    >
                      {cat.name} ({cat.count})
                    </button>
                  ))}
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

            {/* Studio Tools */}
            {isMobileWorkbench && (
              <div className="border-t border-[#EAE8E2] pt-3">
                <p className="mb-2 font-mono text-[9.5px] uppercase tracking-[0.14em] text-[#77756F]">
                  Studio Tools
                </p>
                <div className="flex flex-wrap gap-2">
                  {onToggleDemoMode && (
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
                  {onOpenCropPresetModal && (
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
  );
};
