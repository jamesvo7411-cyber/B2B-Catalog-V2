import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Crop,
  Grid,
  LayoutGrid,
  Maximize,
  Maximize2,
  Minimize,
  Pin,
  PinOff,
  Printer,
  Replace,
  Ruler,
  Scan,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type {
  CatalogueMetadata,
  GarmentItem,
  ImageCrop,
  MediaSlot,
  MediaSlotKey,
  MetallicTheme,
} from '../types/catalogue';
import { BRAND_LOGO_PATH } from '../data/garments';
import { getFactoryColorImageKey, getPreferredFactoryFabricImage } from '../data/factoryFabricColors';
import {
  buildCatalogueNavigationMap,
  getActiveSectionForSpread,
  type CatalogueNavigationMap,
} from '../utils/catalogueOrder';
import { displayBuyerProductTitle } from '../utils/productDisplay';
import {
  BookThumbIndexRail,
  CatalogueProgressSlider,
  SectionWayfinderBar,
} from './CatalogueNavigation';
import { PageCurlBook } from './PageCurlBook';
import { SpreadPages } from './SpreadPages';
import { MobileCatalogueView } from './MobileCatalogueView';
import { ProductShowcasePage } from './ProductShowcasePage';
import type { SpreadLeafSide } from './GarmentSpread';

export type FlipbookStageMode = 'workbench' | 'buyer' | 'paperback';

interface FlipbookStageProps {
  garments: GarmentItem[];
  navMap?: CatalogueNavigationMap;
  demoMode?: boolean;
  onToggleDemoMode?: () => void;
  isMobile: boolean;
  mode: FlipbookStageMode;
  buyerViewStyle?: 'book' | 'card';
  onChangeBuyerViewStyle?: (style: 'book' | 'card') => void;
  meta: CatalogueMetadata;
  metallicTheme: MetallicTheme;
  bookPage: number;
  editMode: boolean;
  shortlist: string[];
  coverCustomImage: string;
  showSafeZones: boolean;
  turnRequest: { dir: 'next' | 'prev'; nonce: number } | null;
  onRequestTurn: (dir: 'next' | 'prev') => void;
  onChangeBookPage: (page: number) => void;
  onToggleEditMode: () => void;
  onChangeMetallicTheme: (theme: MetallicTheme) => void;
  onToggleSafeZones: () => void;
  onDropCoverImage: (dataUrl: string) => void;
  onReplaceFile: (garmentId: string, slotKey: MediaSlotKey, dataUrl: string) => void;
  onUpdateCrop: (garmentId: string, slotKey: MediaSlotKey, crop: ImageCrop) => void;
  fabricColorImages: Record<string, string>;
  onReplaceFabricColorImage?: (imageKey: string, dataUrl: string) => void;
  onImageUploadError?: (message: string) => void;
  onToggleShortlist: (id: string) => void;
  onInspectMedia: (slot: MediaSlot, titleLabel: string, garmentTitle: string) => void;
  onOpenEditor: (garmentIndex: number, focusSlot?: MediaSlotKey) => void;
  onOpenVideo: (garment: GarmentItem) => void;
  onExportCurrentPdf: (garmentIndex: number) => void;
  onSelectFabricCode: (fabricCode: string) => void;
  onSelectGarmentIndex?: (garmentIndex: number) => void;
  onOpenFullPrintModal: () => void;
  onExportCsv: () => void;
  onExportJson: () => void;
  onTriggerImportCsv: () => void;
  onTriggerImportJson: () => void;
  customFramingCount?: number;
  onOpenFabricColorPicker?: (garment: GarmentItem) => void;
  onOpenCropPresetModal?: () => void;
}

const ZOOM_STEPS = [0.75, 1, 1.25, 1.5] as const;

export const FlipbookStage: React.FC<FlipbookStageProps> = ({
  garments,
  navMap,
  demoMode = false,
  onToggleDemoMode,
  isMobile,
  mode,
  buyerViewStyle = 'book',
  onChangeBuyerViewStyle,
  meta,
  metallicTheme,
  bookPage,
  editMode,
  shortlist,
  coverCustomImage,
  showSafeZones,
  turnRequest,
  onRequestTurn,
  onChangeBookPage,
  onToggleEditMode,
  onChangeMetallicTheme,
  onToggleSafeZones,
  onDropCoverImage,
  onReplaceFile,
  onUpdateCrop,
  fabricColorImages,
  onReplaceFabricColorImage,
  onImageUploadError,
  onToggleShortlist,
  onInspectMedia,
  onOpenEditor,
  onOpenVideo,
  onExportCurrentPdf,
  onSelectFabricCode,
  onSelectGarmentIndex,
  onOpenFullPrintModal,
  onExportCsv,
  onExportJson,
  onTriggerImportCsv,
  onTriggerImportJson,
  customFramingCount = 0,
  onOpenFabricColorPicker,
  onOpenCropPresetModal,
}) => {
  const isWorkbench = mode === 'workbench';
  const isBuyer = mode === 'buyer';
  const isPaperback = mode === 'paperback';

  const effectiveNavMap =
    navMap ?? buildCatalogueNavigationMap(garments, demoMode, fabricColorImages);
  const orderedGarments = effectiveNavMap.orderedGarments;
  const swatchPrograms = effectiveNavMap.orderedFabrics;
  const swatchSpreadCount = swatchPrograms.length;
  const productOffset = effectiveNavMap.productOffset;
  const totalSpreads = effectiveNavMap.totalSpreads;

  const [zoom, setZoom] = useState<number>(1);
  const [fitToScreen, setFitToScreen] = useState<boolean>(true);
  const [thumbnailView, setThumbnailView] = useState<boolean>(false);
  const [topControlsHovered, setTopControlsHovered] = useState<boolean>(false);
  const [topControlsFocused, setTopControlsFocused] = useState<boolean>(false);
  const [topControlsPinned, setTopControlsPinned] = useState<boolean>(false);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState<boolean>(false);
  const [isPseudoFullscreen, setIsPseudoFullscreen] = useState<boolean>(false);
  const [slotSize, setSlotSize] = useState<{ w: number; h: number }>({ w: 1320, h: 720 });
  const [naturalBookSize, setNaturalBookSize] = useState<{ w: number; h: number }>({
    w: 1190,
    h: 842,
  });

  const fullscreenContainerRef = useRef<HTMLDivElement | null>(null);
  const bookViewportRef = useRef<HTMLDivElement | null>(null);
  const hideTopTimerRef = useRef<number | null>(null);
  const wheelAccumRef = useRef<{ value: number; dir: 'next' | 'prev'; lastTs: number }>({
    value: 0,
    dir: 'next',
    lastTs: 0,
  });
  const wheelCooldownUntilRef = useRef<number>(0);

  const isFullscreen = isNativeFullscreen || isPseudoFullscreen;
  const showBuyerFocusCard = isBuyer && buyerViewStyle === 'card';
  const isToolbarDocked = showBuyerFocusCard || thumbnailView;
  const topControlsVisible =
    isToolbarDocked ||
    (isWorkbench && topControlsPinned) ||
    topControlsHovered ||
    topControlsFocused;

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
    const target = fullscreenContainerRef.current;
    if (target && typeof target.requestFullscreen === 'function') {
      try {
        await target.requestFullscreen();
        return;
      } catch {
        // Fallback for sandboxed iframes blocking requestFullscreen
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

  const cancelHideTopControls = useCallback(() => {
    if (hideTopTimerRef.current !== null) {
      window.clearTimeout(hideTopTimerRef.current);
      hideTopTimerRef.current = null;
    }
  }, []);

  const revealTopControls = useCallback(() => {
    cancelHideTopControls();
    setTopControlsHovered(true);
  }, [cancelHideTopControls]);

  const scheduleHideTopControls = useCallback(
    (delayMs = 220) => {
      cancelHideTopControls();
      hideTopTimerRef.current = window.setTimeout(() => {
        setTopControlsHovered(false);
        hideTopTimerRef.current = null;
      }, delayMs);
    },
    [cancelHideTopControls]
  );

  useEffect(() => () => cancelHideTopControls(), [cancelHideTopControls]);

  useEffect(() => {
    if (isPaperback) {
      setZoom(1);
      setFitToScreen(true);
      setThumbnailView(false);
      setTopControlsPinned(false);
    }
  }, [isPaperback]);

  useEffect(() => {
    if (isMobile) {
      setThumbnailView(false);
      setIsPseudoFullscreen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      const inInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
      if (e.key === 'Escape') {
        if (isPseudoFullscreen) {
          setIsPseudoFullscreen(false);
        }
        if (topControlsHovered && !topControlsPinned) {
          cancelHideTopControls();
          setTopControlsHovered(false);
          setTopControlsFocused(false);
        }
      } else if (!inInput && !isMobile && (e.key === 'f' || e.key === 'F') && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        void toggleFullscreen();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [cancelHideTopControls, isMobile, isPseudoFullscreen, toggleFullscreen, topControlsHovered, topControlsPinned]);

  // Measure the available book viewport slot for clean zero-scroll Fit-to-Screen scaling
  useEffect(() => {
    const el = bookViewportRef.current;
    if (!el || isMobile || isToolbarDocked) return;

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
  }, [isMobile, isToolbarDocked, isFullscreen, topControlsPinned, mode]);

  const computedFitScale = useMemo(() => {
    if (!fitToScreen || zoom !== 1) return 1;
    const hasThumbRail = !isPaperback && slotSize.w >= 1180;
    const edgeArrowAllowance = 76;
    const thumbRailAllowance = hasThumbRail ? 98 : 0;
    const availW = Math.max(360, slotSize.w - edgeArrowAllowance - thumbRailAllowance);
    const availH = Math.max(260, slotSize.h - 14);
    const scaleW = availW / Math.max(640, naturalBookSize.w);
    const scaleH = availH / Math.max(360, naturalBookSize.h);
    const maxAllowed = isFullscreen ? 1.08 : 1.0;
    const raw = Math.max(0.4, Math.min(maxAllowed, Math.min(scaleW, scaleH)));
    return Math.round(raw * 1000) / 1000;
  }, [fitToScreen, zoom, isPaperback, slotSize.w, slotSize.h, naturalBookSize.w, naturalBookSize.h, isFullscreen]);

  // Desktop mouse-wheel & trackpad scroll-to-turn-page (active when the spread fits cleanly without vertical overflow)
  useEffect(() => {
    const el = bookViewportRef.current;
    if (!el || isMobile || thumbnailView || showBuyerFocusCard) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target?.closest(
          'select, input, textarea, [role="dialog"], [data-stop-wheel-turn="true"]'
        )
      ) {
        return;
      }

      // If user zoomed into 100%/125%/150% and the spread overflows vertically, let them scroll naturally to read!
      const hasVerticalOverflow = el.scrollHeight > el.clientHeight + 6;
      if (hasVerticalOverflow || zoom !== 1 || !fitToScreen) {
        return;
      }

      const absY = Math.abs(e.deltaY);
      const absX = Math.abs(e.deltaX);
      const dominantDelta = absY >= absX ? e.deltaY : e.deltaX;
      if (Math.abs(dominantDelta) < 2) return;

      const dir: 'next' | 'prev' = dominantDelta > 0 ? 'next' : 'prev';

      if (dir === 'prev' && bookPage <= 0) return;
      if (dir === 'next' && bookPage >= totalSpreads - 1) return;

      e.preventDefault();

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

      if (nextValue >= 38) {
        wheelAccumRef.current = { value: 0, dir, lastTs: now };
        wheelCooldownUntilRef.current = now + 520;
        onRequestTurn(dir);
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [bookPage, fitToScreen, isMobile, onRequestTurn, showBuyerFocusCard, thumbnailView, totalSpreads, zoom]);

  const getSpreadLabel = (page: number): string => {
    if (page === 0) return 'P.01 · Cover & CM / OEM / ODM Overview';
    if (page === 1) return 'P.02 · Table of Contents & Directory';
    if (page >= 2 && page < productOffset) {
      const program = swatchPrograms[page - 2];
      return `P.${String(page + 1).padStart(2, '0')} · Fabric ${program?.fabricCode ?? ''} (${page - 1}/${swatchSpreadCount})`;
    }
    if (page >= productOffset && page < productOffset + orderedGarments.length) {
      const item = orderedGarments[page - productOffset];
      const title = isWorkbench ? item.title : displayBuyerProductTitle(item.title);
      return `P.${String(page + 1).padStart(2, '0')} · ${item.sku} — ${title}`;
    }
    if (page === totalSpreads - 2) {
      return `P.${String(totalSpreads - 1).padStart(2, '0')} · Women's & Men's Size Charts`;
    }
    return isWorkbench
      ? `P.${String(totalSpreads).padStart(2, '0')} · Studio Specs & Thank You`
      : `P.${String(totalSpreads).padStart(2, '0')} · Thank You & Contact Us`;
  };

  const activeProduct =
    bookPage >= productOffset && bookPage < productOffset + orderedGarments.length
      ? orderedGarments[bookPage - productOffset]
      : null;
  const activeSection = getActiveSectionForSpread(bookPage, effectiveNavMap);

  const stepZoom = (delta: number) => {
    setFitToScreen(false);
    const idx = ZOOM_STEPS.indexOf(zoom as (typeof ZOOM_STEPS)[number]);
    const currentIdx = idx === -1 ? 1 : idx;
    const nextIdx = Math.max(0, Math.min(ZOOM_STEPS.length - 1, currentIdx + delta));
    setZoom(ZOOM_STEPS[nextIdx]);
  };

  const toggleFitMode = () => {
    if (fitToScreen && zoom === 1) {
      setFitToScreen(false);
      setZoom(1);
    } else {
      setZoom(1);
      setFitToScreen(true);
    }
  };

  const renderSpread = useCallback(
    (pageIndex: number, side: SpreadLeafSide, isPreviewLayer: boolean) => (
      <SpreadPages
        pageIndex={pageIndex}
        totalSpreads={totalSpreads}
        garments={orderedGarments}
        navMap={effectiveNavMap}
        demoMode={demoMode}
        meta={meta}
        metallicTheme={metallicTheme}
        editMode={editMode && isWorkbench}
        isWorkbench={isWorkbench}
        paperbackMode={isPaperback}
        shortlist={shortlist}
        coverCustomImage={coverCustomImage}
        showSafeZones={isWorkbench ? showSafeZones : false}
        side={side}
        isPreviewLayer={isPreviewLayer}
        onGoToPage={onChangeBookPage}
        onChangeMetallicTheme={onChangeMetallicTheme}
        onDropCoverImage={onDropCoverImage}
        onReplaceFile={onReplaceFile}
        onUpdateCrop={onUpdateCrop}
        fabricColorImages={fabricColorImages}
        onReplaceFabricColorImage={onReplaceFabricColorImage}
        onImageUploadError={onImageUploadError}
        onToggleShortlist={onToggleShortlist}
        onInspectMedia={onInspectMedia}
        onOpenEditor={onOpenEditor}
        onOpenVideo={onOpenVideo}
        onExportCurrentPdf={onExportCurrentPdf}
        onSelectFabricCode={onSelectFabricCode}
        onExportCsv={onExportCsv}
        onExportJson={onExportJson}
        onTriggerImportCsv={onTriggerImportCsv}
        onTriggerImportJson={onTriggerImportJson}
        onOpenFabricColorPicker={onOpenFabricColorPicker}
      />
    ),
    [
      totalSpreads,
      orderedGarments,
      effectiveNavMap,
      demoMode,
      isWorkbench,
      isPaperback,
      meta,
      metallicTheme,
      editMode,
      shortlist,
      coverCustomImage,
      showSafeZones,
      onChangeBookPage,
      onChangeMetallicTheme,
      onDropCoverImage,
      onReplaceFile,
      onUpdateCrop,
      fabricColorImages,
      onReplaceFabricColorImage,
      onImageUploadError,
      onToggleShortlist,
      onInspectMedia,
      onOpenEditor,
      onOpenVideo,
      onExportCurrentPdf,
      onSelectFabricCode,
      onExportCsv,
      onExportJson,
      onTriggerImportCsv,
      onTriggerImportJson,
      onOpenFabricColorPicker,
    ]
  );

  if (isMobile) {
    return (
      <MobileCatalogueView
        garments={orderedGarments}
        navMap={effectiveNavMap}
        activeSection={activeSection}
        demoMode={demoMode}
        onToggleDemoMode={isWorkbench ? onToggleDemoMode : undefined}
        bookPage={bookPage}
        totalSpreads={totalSpreads}
        productOffset={productOffset}
        mode={mode}
        editMode={editMode && isWorkbench}
        customFramingCount={customFramingCount}
        getSpreadLabel={getSpreadLabel}
        renderStaticPage={(page, leafSide, isPreviewLayer) =>
          renderSpread(page, leafSide ?? 'full', Boolean(isPreviewLayer))
        }
        onChangeBookPage={onChangeBookPage}
        onToggleEditMode={onToggleEditMode}
        onOpenCropPresetModal={onOpenCropPresetModal}
      />
    );
  }

  const desktopTopControls = isPaperback ? (
    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#4A4740]">
      <button
        type="button"
        onClick={() => onRequestTurn('prev')}
        className="inline-flex items-center gap-1.5 border border-[#D4CFC3] bg-[#FAF8F3] px-3 py-1.5 font-medium text-[#22201C] transition-colors hover:border-[#22201C] whitespace-nowrap cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Previous Page</span>
      </button>

      <div className="min-w-0 flex-1 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#6B675E] tabular-nums">
          Folio {String(bookPage + 1).padStart(2, '0')} / {String(totalSpreads).padStart(2, '0')}
        </p>
        <p className="mt-0.5 truncate font-serif text-sm italic text-[#2D2B27]">
          {getSpreadLabel(bookPage)}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleFitMode}
          className={`inline-flex items-center gap-1.5 border px-2.5 py-1.5 text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
            fitToScreen && zoom === 1
              ? 'border-[#22201C] bg-[#22201C] text-white'
              : 'border-[#D4CFC3] bg-[#FAF8F3] text-[#22201C] hover:border-[#22201C]'
          }`}
        >
          <Scan className="h-3 w-3" />
          <span>{fitToScreen && zoom === 1 ? 'Fit' : '100%'}</span>
        </button>

        <button
          type="button"
          onClick={() => void toggleFullscreen()}
          className="inline-flex items-center gap-1.5 border border-[#D4CFC3] bg-[#FAF8F3] px-2.5 py-1.5 text-[11px] font-medium text-[#22201C] transition-colors hover:border-[#22201C] whitespace-nowrap cursor-pointer"
        >
          {isFullscreen ? <Minimize className="h-3.5 w-3.5" /> : <Maximize className="h-3.5 w-3.5" />}
          <span>{isFullscreen ? 'Exit Full' : 'Fullscreen'}</span>
        </button>

        <button
          type="button"
          onClick={() => onRequestTurn('next')}
          className="inline-flex items-center gap-1.5 border border-[#D4CFC3] bg-[#FAF8F3] px-3 py-1.5 font-medium text-[#22201C] transition-colors hover:border-[#22201C] whitespace-nowrap cursor-pointer"
        >
          <span>Next Page</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  ) : (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E5E5] pb-2.5 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {!showBuyerFocusCard && (
            <>
              <button
                type="button"
                onClick={() => {
                  setThumbnailView(false);
                  onRequestTurn('prev');
                }}
                className="inline-flex items-center gap-1.5 border border-[#E5E5E5] bg-white px-3 py-1.5 font-medium text-[#0A0A0A] transition-colors hover:border-[#0A0A0A] whitespace-nowrap cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Prev</span>
              </button>

              <label className="flex items-center gap-2 font-mono text-xs text-[#0A0A0A]">
                <BookOpen className="h-3.5 w-3.5 text-[var(--metallic-strong)]" />
                <span className="sr-only">Jump to catalogue spread</span>
                <select
                  value={bookPage}
                  onChange={(e) => {
                    setThumbnailView(false);
                    onChangeBookPage(Number(e.target.value));
                  }}
                  className="max-w-[230px] sm:max-w-[330px] border border-[#E5E5E5] bg-white px-2.5 py-1.5 font-mono text-xs text-[#0A0A0A] focus:border-[#0A0A0A] focus:outline-none cursor-pointer"
                >
                  {Array.from({ length: totalSpreads }, (_, i) => (
                    <option key={i} value={i}>
                      {getSpreadLabel(i)}
                    </option>
                  ))}
                </select>
                <span className="text-[#737373] tabular-nums whitespace-nowrap">
                  / {String(totalSpreads).padStart(2, '0')}
                </span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setThumbnailView(false);
                  onRequestTurn('next');
                }}
                className="inline-flex items-center gap-1.5 border border-[#E5E5E5] bg-white px-3 py-1.5 font-medium text-[#0A0A0A] transition-colors hover:border-[#0A0A0A] whitespace-nowrap cursor-pointer"
              >
                <span>Next</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </>
          )}

          {isBuyer && onChangeBuyerViewStyle && (
            <div
              role="group"
              aria-label="Web Edition view layout"
              className="inline-flex items-center border border-[#DCDAD3] bg-white p-0.5"
            >
              <button
                type="button"
                onClick={() => onChangeBuyerViewStyle('book')}
                aria-pressed={buyerViewStyle === 'book'}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  buyerViewStyle === 'book'
                    ? 'bg-[#0A0A0A] text-white'
                    : 'text-[#55534E] hover:text-[#0A0A0A]'
                }`}
              >
                <BookOpen className="h-3 w-3" />
                <span>2-Page Book</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setThumbnailView(false);
                  if (
                    bookPage < productOffset ||
                    bookPage >= productOffset + orderedGarments.length
                  ) {
                    onChangeBookPage(productOffset);
                  }
                  onChangeBuyerViewStyle('card');
                }}
                aria-pressed={buyerViewStyle === 'card'}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  buyerViewStyle === 'card'
                    ? 'bg-[#0A0A0A] text-white'
                    : 'text-[#55534E] hover:text-[#0A0A0A]'
                }`}
              >
                <LayoutGrid className="h-3 w-3" />
                <span>Focus Card</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!showBuyerFocusCard && (
            <button
              type="button"
              onClick={() => setThumbnailView((v) => !v)}
              className={`inline-flex items-center gap-1.5 border px-2.5 py-1.5 text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                thumbnailView
                  ? 'border-[#0A0A0A] bg-[#0A0A0A] text-white'
                  : 'border-[#E5E5E5] bg-white text-[#404040] hover:border-[#0A0A0A]'
              }`}
            >
              <Grid className="h-3 w-3" />
              <span>{thumbnailView ? 'Close Grid' : 'Thumbnails'}</span>
            </button>
          )}

          {isWorkbench && (
            <>
              <button
                type="button"
                onClick={onToggleSafeZones}
                title="Toggle print safe-zone and inner binding gutter guides"
                className={`inline-flex items-center gap-1.5 border px-2.5 py-1.5 text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  showSafeZones
                    ? 'border-[#0A0A0A] bg-[#FAFAFA] text-[#0A0A0A]'
                    : 'border-[#E5E5E5] bg-white text-[#525252] hover:border-[#0A0A0A]'
                }`}
              >
                <Ruler className="h-3 w-3" />
                <span>Gutter Guides</span>
              </button>

              <button
                type="button"
                onClick={onToggleEditMode}
                title="Click plates to replace images instead of inspecting"
                className={`inline-flex items-center gap-1.5 border px-2.5 py-1.5 text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  editMode
                    ? 'border-[#0A0A0A] bg-[#0A0A0A] text-white'
                    : 'border-[#E5E5E5] bg-white text-[#525252] hover:border-[#0A0A0A]'
                }`}
              >
                <Replace className="h-3 w-3" />
                <span>{editMode ? 'Replace: On' : 'Replace'}</span>
              </button>

              {onOpenCropPresetModal && (
                <button
                  type="button"
                  onClick={onOpenCropPresetModal}
                  title="Import or export crop, pan, and zoom values"
                  className="inline-flex items-center gap-1.5 border border-[#E5E5E5] bg-white px-2.5 py-1.5 text-[11px] font-medium text-[#404040] transition-colors hover:border-[#0A0A0A] hover:text-[#0A0A0A] whitespace-nowrap cursor-pointer"
                >
                  <Crop className="h-3 w-3" />
                  <span className="tabular-nums">
                    {customFramingCount > 0 ? `Crops I/O (${customFramingCount})` : 'Crops I/O'}
                  </span>
                </button>
              )}
            </>
          )}

          {!showBuyerFocusCard && (
            <div className="flex items-center border border-[#E5E5E5] bg-white">
              <button
                type="button"
                onClick={toggleFitMode}
                title={fitToScreen && zoom === 1 ? 'Switch to full 100% scrollable reading scale' : 'Auto-fit spread inside screen'}
                className={`border-r border-[#EFEFEF] px-2 py-1 text-[10.5px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  fitToScreen && zoom === 1
                    ? 'bg-[#0A0A0A] text-white'
                    : 'text-[#404040] hover:bg-[#FAFAFA] hover:text-[#0A0A0A]'
                }`}
              >
                Fit
              </button>
              <button
                type="button"
                onClick={() => stepZoom(-1)}
                disabled={!fitToScreen && zoom <= ZOOM_STEPS[0]}
                aria-label="Zoom out"
                className="p-1.5 text-[#404040] hover:text-[#0A0A0A] disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setFitToScreen(false);
                  setZoom(1);
                }}
                title="View at native 100% crisp scale (scroll vertically to read details)"
                className={`border-x border-[#EFEFEF] px-2 py-1 font-mono text-[11px] tabular-nums cursor-pointer ${
                  !fitToScreen && zoom === 1
                    ? 'bg-[#F5F4F0] font-semibold text-[#0A0A0A]'
                    : 'text-[#0A0A0A] hover:bg-[#FAFAFA]'
                }`}
              >
                {fitToScreen && zoom === 1
                  ? `${Math.round(computedFitScale * 100)}%`
                  : `${Math.round(zoom * 100)}%`}
              </button>
              <button
                type="button"
                onClick={() => stepZoom(1)}
                disabled={zoom >= ZOOM_STEPS[ZOOM_STEPS.length - 1]}
                aria-label="Zoom in"
                className="p-1.5 text-[#404040] hover:text-[#0A0A0A] disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              {(!fitToScreen || zoom !== 1) && (
                <button
                  type="button"
                  onClick={() => {
                    setZoom(1);
                    setFitToScreen(true);
                  }}
                  title="Reset to Fit Screen"
                  aria-label="Reset zoom to Fit Screen"
                  className="border-l border-[#EFEFEF] p-1.5 text-[#525252] hover:text-[#0A0A0A] cursor-pointer"
                >
                  <Maximize2 className="h-3 w-3" />
                </button>
              )}
            </div>
          )}

          {!showBuyerFocusCard && (
            <button
              type="button"
              onClick={() => void toggleFullscreen()}
              title={isFullscreen ? 'Exit Fullscreen (Esc / F)' : 'Enter Fullscreen view (F)'}
              className={`inline-flex items-center gap-1.5 border px-2.5 py-1.5 text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                isFullscreen
                  ? 'border-[#0A0A0A] bg-[#0A0A0A] text-white'
                  : 'border-[#E5E5E5] bg-white text-[#404040] hover:border-[#0A0A0A] hover:text-[#0A0A0A]'
              }`}
            >
              {isFullscreen ? <Minimize className="h-3 w-3" /> : <Maximize className="h-3 w-3" />}
              <span>{isFullscreen ? 'Exit Full' : 'Fullscreen'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() =>
              activeProduct ? onExportCurrentPdf(activeProduct.index) : onOpenFullPrintModal()
            }
            className="inline-flex items-center gap-1.5 border border-[#0A0A0A] bg-white px-3 py-1.5 text-[11px] font-medium text-[#0A0A0A] transition-colors hover:bg-[#0A0A0A] hover:text-white whitespace-nowrap cursor-pointer"
          >
            <Printer className="h-3 w-3" />
            <span>{activeProduct ? `Print ${activeProduct.sku}` : 'Print PDF'}</span>
          </button>

          {isWorkbench && !isToolbarDocked && (
            <button
              type="button"
              onClick={() => setTopControlsPinned((v) => !v)}
              aria-pressed={topControlsPinned}
              title={topControlsPinned ? 'Unpin toolbar (auto-fade)' : 'Pin toolbar visible'}
              className={`inline-flex items-center gap-1 border px-2 py-1.5 text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                topControlsPinned
                  ? 'border-[#0A0A0A] bg-[#0A0A0A] text-white'
                  : 'border-[#E5E5E5] bg-white text-[#525252] hover:border-[#0A0A0A] hover:text-[#0A0A0A]'
              }`}
            >
              {topControlsPinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
              <span className="hidden xl:inline">{topControlsPinned ? 'Unpin' : 'Pin'}</span>
            </button>
          )}
        </div>
      </div>

      {!showBuyerFocusCard && (
        <div className="pt-2">
          <SectionWayfinderBar
            activeSection={activeSection}
            activeCategory={activeProduct?.category ?? null}
            navMap={effectiveNavMap}
            demoMode={demoMode}
            showSections={false}
            onToggleDemoMode={isWorkbench ? onToggleDemoMode : undefined}
            onSelectSpread={(page) => {
              setThumbnailView(false);
              onChangeBookPage(page);
            }}
          />
        </div>
      )}
    </>
  );

  const stageViewportClasses = isToolbarDocked
    ? isPaperback
      ? 'min-h-[calc(100vh-4rem)] bg-[#EFECE5] pb-5 pt-2'
      : isBuyer
        ? 'min-h-[calc(100vh-4rem)] bg-[#F7F6F2] pb-5 pt-2'
        : 'pb-5 pt-2'
    : isFullscreen
      ? `fixed inset-0 z-50 flex h-dvh w-screen flex-col overflow-hidden ${
          isPaperback ? 'bg-[#EFECE5]' : isBuyer ? 'bg-[#F7F6F2]' : 'bg-[#F7F6F2]'
        }`
      : `flex flex-col overflow-hidden ${
          isWorkbench ? 'h-[calc(100dvh-6.75rem)]' : 'h-[calc(100dvh-4rem)]'
        } ${
          isPaperback ? 'bg-[#EFECE5]' : isBuyer ? 'bg-[#F7F6F2]' : 'bg-white'
        }`;

  return (
    <div ref={fullscreenContainerRef} className={stageViewportClasses}>
      <section
        aria-label={
          isPaperback
            ? 'Print Edition catalogue preview'
            : isBuyer
              ? 'Web Edition digital catalogue'
              : 'Studio page-curl catalogue'
        }
        className={`relative mx-auto flex w-full max-w-[1460px] flex-1 min-h-0 flex-col justify-between px-4 sm:px-6 lg:px-10 ${
          isToolbarDocked ? 'py-3 lg:py-4' : 'pt-1.5 pb-2.5'
        }`}
      >
        {/* ====================================================================
            TOP CONTROL BAR — DOCKED IN FOCUS/GRID VIEW, AUTO-FADE OVERLAY IN BOOK VIEW
            ==================================================================== */}
        {isToolbarDocked ? (
          <div className="mb-4 border-b border-[#E5E5E5] pb-1">{desktopTopControls}</div>
        ) : (
          <>
            {/* Dedicated Center-Top Arrow-Down Trigger Zone + Top-Right Fit/Fullscreen Controls */}
            {!topControlsVisible && (
              <div
                onMouseEnter={revealTopControls}
                onMouseLeave={() => scheduleHideTopControls(220)}
                className="pointer-events-auto absolute top-0 left-1/2 z-30 -translate-x-1/2 px-4 pt-1.5 pb-2"
              >
                <button
                  type="button"
                  onClick={revealTopControls}
                  title="Hover or click to open menu"
                  aria-label="Open top catalogue menu"
                  className={`flex h-7 w-7 items-center justify-center rounded-full border backdrop-blur-sm transition-all duration-200 shadow-sm cursor-pointer ${
                    isPaperback
                      ? 'border-[#D4CFC3] bg-[#FAF8F3]/90 text-[#4A4740] hover:border-[#22201C] hover:text-[#22201C]'
                      : 'border-[#DCDAD3] bg-white/90 text-[#55534E] hover:border-[#0A0A0A] hover:text-[#0A0A0A]'
                  }`}
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {!topControlsVisible && (
              <div className="pointer-events-none absolute inset-x-0 top-1.5 z-30 mx-auto flex max-w-[1460px] justify-end gap-1.5 px-4 sm:px-6 lg:px-10">
                <button
                  type="button"
                  onClick={toggleFitMode}
                  title={
                    fitToScreen && zoom === 1
                      ? 'Fitted to screen — click to inspect at 100% native scale'
                      : 'Click to auto-fit spread inside screen'
                  }
                  className={`pointer-events-auto inline-flex items-center gap-1 border px-2 py-1 text-[10px] font-medium backdrop-blur-sm transition-all duration-200 cursor-pointer ${
                    fitToScreen && zoom === 1
                      ? isPaperback
                        ? 'border-[#D4CFC3] bg-[#FAF8F3]/85 text-[#4A4740] opacity-75 hover:border-[#22201C] hover:opacity-100'
                        : 'border-[#DCDAD3] bg-white/85 text-[#55534E] opacity-75 hover:border-[#0A0A0A] hover:opacity-100'
                      : 'border-[#0A0A0A] bg-[#0A0A0A] text-white'
                  }`}
                >
                  <Scan className="h-3 w-3" />
                  <span className="tabular-nums">
                    {fitToScreen && zoom === 1
                      ? `Fit ${Math.round(computedFitScale * 100)}%`
                      : `${Math.round(zoom * 100)}%`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => void toggleFullscreen()}
                  title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Fullscreen View (F)'}
                  aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                  className={`pointer-events-auto inline-flex items-center gap-1 border px-2 py-1 text-[10px] font-medium backdrop-blur-sm transition-all duration-200 cursor-pointer ${
                    isFullscreen
                      ? 'border-[#0A0A0A] bg-[#0A0A0A] text-white'
                      : isPaperback
                        ? 'border-[#D4CFC3] bg-[#FAF8F3]/85 text-[#4A4740] opacity-75 hover:border-[#22201C] hover:text-[#22201C] hover:opacity-100'
                        : 'border-[#DCDAD3] bg-white/85 text-[#55534E] opacity-75 hover:border-[#0A0A0A] hover:text-[#0A0A0A] hover:opacity-100'
                  }`}
                >
                  {isFullscreen ? <Minimize className="h-3 w-3" /> : <Maximize className="h-3 w-3" />}
                  <span className="hidden sm:inline">{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
                </button>
              </div>
            )}

            {/* Auto-Fading Floating Controls Overlay (Opens from center-top indicator; hides promptly on mouse leave) */}
            <div
              onMouseEnter={revealTopControls}
              onMouseLeave={() => scheduleHideTopControls(220)}
              onFocusCapture={() => {
                cancelHideTopControls();
                setTopControlsFocused(true);
              }}
              onBlurCapture={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                  setTopControlsFocused(false);
                }
              }}
              className={`${
                isWorkbench && topControlsPinned
                  ? 'relative mb-2 shrink-0'
                  : 'absolute inset-x-4 top-2 z-40 sm:inset-x-6 lg:inset-x-10'
              } border backdrop-blur-md transition-all duration-150 ${
                isPaperback
                  ? 'border-[#D4CFC3] bg-[#FAF8F3]/95 px-4 py-2.5 shadow-[0_12px_30px_rgba(28,25,20,0.09)]'
                  : 'border-[#DCDAD3] bg-white/95 px-4 pt-3 pb-0.5 shadow-[0_14px_34px_rgba(0,0,0,0.08)]'
              } ${
                topControlsVisible
                  ? 'translate-y-0 opacity-100 pointer-events-auto'
                  : '-translate-y-2 opacity-0 pointer-events-none'
              }`}
            >
              {desktopTopControls}
            </div>
          </>
        )}

        {/* ====================================================================
            STAGE CONTENT: FOCUS CARD | THUMBNAIL GRID | 3D PAGE-CURL BOOK
            ==================================================================== */}
        {showBuyerFocusCard ? (
          <ProductShowcasePage
            garment={activeProduct ?? orderedGarments[0]}
            garments={orderedGarments}
            navMap={effectiveNavMap}
            demoMode={demoMode}
            shortlist={shortlist}
            onToggleShortlist={onToggleShortlist}
            onSelectSpread={(page) => {
              if (page < productOffset || page >= productOffset + orderedGarments.length) {
                onChangeBuyerViewStyle?.('book');
              }
              onChangeBookPage(page);
            }}
            onSelectGarment={(index) => {
              if (onSelectGarmentIndex) {
                onSelectGarmentIndex(index);
              } else {
                const match = orderedGarments.find((g) => g.index === index);
                onChangeBookPage(
                  match ? effectiveNavMap.garmentPageById.get(match.id) ?? productOffset : productOffset
                );
              }
            }}
            onSelectFabricCode={(fabricCode) => {
              onChangeBuyerViewStyle?.('book');
              onSelectFabricCode(fabricCode);
            }}
            onInspectMedia={onInspectMedia}
          />
        ) : !isPaperback && thumbnailView ? (
          <div className="border border-[#E5E5E5] bg-[#FAFAFA] p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E5E5] pb-3">
              <div>
                <h2 className="font-sans text-lg font-semibold tracking-tight text-[#0A0A0A]">
                  All {totalSpreads} Two-Page Landscape Spreads
                </h2>
                <p className="text-xs text-[#525252]">
                  Select any spread thumbnail (Verso | Spine | Recto) to jump directly in the flipbook.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setThumbnailView(false)}
                className="border border-[#0A0A0A] bg-[#0A0A0A] px-3 py-1.5 text-xs font-medium text-white cursor-pointer"
              >
                Return to Flipbook
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {Array.from({ length: totalSpreads }, (_, i) => {
                const isCurrent = i === bookPage;
                const isProduct = i >= productOffset && i < productOffset + orderedGarments.length;
                const product = isProduct ? orderedGarments[i - productOffset] : null;
                const isSwatch = i >= 2 && i < productOffset;
                const swatchProgram = isSwatch ? swatchPrograms[i - 2] : null;
                const swatchHero = swatchProgram
                  ? getPreferredFactoryFabricImage(swatchProgram.fabricCode, fabricColorImages)
                  : undefined;
                const firstColor = swatchProgram?.factoryColors[0];
                const colorImage = firstColor
                  ? fabricColorImages[getFactoryColorImageKey(swatchProgram.fabricCode, firstColor.colorName)] ??
                    firstColor.swatchImageUrl
                  : undefined;

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      onChangeBookPage(i);
                      setThumbnailView(false);
                    }}
                    className={`group flex flex-col border bg-white p-2 text-left transition-colors cursor-pointer ${
                      isCurrent
                        ? 'border-[#0A0A0A] ring-1 ring-[#0A0A0A]'
                        : 'border-[#E2E2E2] hover:border-[#0A0A0A]'
                    }`}
                  >
                    <div className="relative grid aspect-[16/10] w-full grid-cols-2 border border-[#EBEBEB] bg-white overflow-hidden">
                      <div className="relative flex items-center justify-center border-r border-[#E0E0E0] bg-[#FCFCFC] p-1.5">
                        <div className="spine-verso-shadow pointer-events-none absolute inset-y-0 right-0 w-2" />
                        {i === 0 ? (
                          <span className="font-sans text-[9px] font-semibold text-[#0A0A0A] text-center">
                            DREAM TOMORROW
                          </span>
                        ) : i === 1 ? (
                          <span className="font-mono text-[8px] text-[#525252]">TOC · MEN</span>
                        ) : isSwatch ? (
                          swatchHero ? (
                            <img
                              src={swatchHero.imageUrl}
                              alt={`${swatchProgram?.fabricCode ?? 'Fabric'} swatch`}
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="font-mono text-[8px] text-[#525252]">
                              {swatchProgram?.fabricCode ?? 'FABRIC'}
                            </span>
                          )
                        ) : product ? (
                          product.media.hero.url ? (
                            <img
                              src={product.media.hero.url}
                              alt={product.sku}
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="font-mono text-[8px] font-medium text-[#525252]">
                              {product.sku}
                            </span>
                          )
                        ) : i === totalSpreads - 2 ? (
                          <span className="font-mono text-[8px] text-[#525252]">WOMEN SIZE</span>
                        ) : (
                          <span className="font-mono text-[8px] text-[#525252]">COLOPHON</span>
                        )}
                      </div>

                      <div className="relative flex flex-col items-center justify-center bg-white p-1.5">
                        <div className="spine-recto-shadow pointer-events-none absolute inset-y-0 left-0 w-2" />
                        {i === 0 ? (
                          coverCustomImage ? (
                            <img
                              src={coverCustomImage}
                              alt="Cover"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <img
                              src={BRAND_LOGO_PATH}
                              alt="DT"
                              className="h-5 w-auto object-contain"
                            />
                          )
                        ) : i === 1 ? (
                          <span className="font-mono text-[8px] text-[#525252]">INDEX · WOMEN</span>
                        ) : isSwatch ? (
                          colorImage ? (
                            <img
                              src={colorImage}
                              alt={`${swatchProgram?.fabricCode ?? 'Fabric'} colorway`}
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="font-mono text-[8px] text-[#737373]">
                              {swatchProgram?.factoryColors.length ?? 0} COLORWAYS
                            </span>
                          )
                        ) : product ? (
                          <div className="w-full space-y-1 px-1">
                            <div className="grid grid-cols-2 gap-1">
                              <div className="aspect-[4/3] border border-[#EAEAEA] bg-[#FAFAFA]" />
                              <div className="aspect-[4/3] border border-[#EAEAEA] bg-[#FAFAFA]" />
                            </div>
                            <div className="h-1 w-3/4 bg-[#E5E5E5]" />
                            <div className="h-1 w-1/2 bg-[#EFEFEF]" />
                          </div>
                        ) : i === totalSpreads - 2 ? (
                          <span className="font-mono text-[8px] text-[#525252]">MEN SIZE</span>
                        ) : (
                          <span className="font-mono text-[8px] text-[#525252]">THANK YOU</span>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 flex items-baseline justify-between gap-1">
                      <span className="font-mono text-[10px] font-semibold text-[#0A0A0A] tabular-nums">
                        Sp. {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="truncate font-mono text-[9.5px] text-[#737373]">
                        {product
                          ? product.sku
                          : i === 0
                            ? 'COVER'
                            : i === 1
                              ? 'TOC'
                              : isSwatch
                                ? swatchProgram?.fabricCode ?? 'FABRIC'
                                : i === totalSpreads - 2
                                  ? 'SIZE'
                                  : 'END'}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[10.5px] text-[#404040]">
                      {product
                        ? isWorkbench
                          ? product.title
                          : displayBuyerProductTitle(product.title)
                        : i === 0
                          ? 'Brand & CM/OEM/ODM'
                          : i === 1
                            ? 'Style Directory'
                            : isSwatch
                              ? `${swatchProgram?.factoryColors.length ?? 0} colorways · 1 fabric family`
                              : i === totalSpreads - 2
                                ? "Women's & Men's Size Charts"
                                : isWorkbench
                                  ? 'Studio Specs & Thank You'
                                  : 'Thank You & Contact Us'}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div
            ref={bookViewportRef}
            className={`relative flex min-h-0 flex-1 items-center ${
              fitToScreen && zoom === 1
                ? 'justify-center overflow-hidden pt-2'
                : 'items-start justify-center overflow-auto pt-8 pb-4'
            }`}
          >
            {/* Left Side Turn Trigger */}
            <button
              type="button"
              aria-label="Previous spread"
              disabled={bookPage <= 0}
              onClick={() => onRequestTurn('prev')}
              className={`mr-1.5 hidden h-10 w-8 shrink-0 items-center justify-center border transition-all lg:inline-flex ${
                bookPage <= 0
                  ? 'border-transparent text-transparent pointer-events-none'
                  : isPaperback
                    ? 'border-[#D4CFC3] bg-[#FAF8F3]/90 text-[#4A4740] hover:border-[#22201C] hover:text-[#22201C] cursor-pointer'
                    : 'border-[#E2E0DA] bg-white/90 text-[#55534E] hover:border-[#0A0A0A] hover:text-[#0A0A0A] cursor-pointer'
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex min-w-0 items-start justify-center">
              <div className="min-w-0">
                <PageCurlBook
                  bookPage={bookPage}
                  totalSpreads={totalSpreads}
                  zoom={zoom}
                  fitScale={computedFitScale}
                  classicMode={isPaperback}
                  curlEnabled
                  turnRequest={turnRequest}
                  onCommitPage={onChangeBookPage}
                  onBookSizeChange={setNaturalBookSize}
                  renderSpread={renderSpread}
                />
              </div>
              {!isPaperback && (
                <BookThumbIndexRail
                  activeSection={activeSection}
                  navMap={effectiveNavMap}
                  onSelectSpread={(page) => {
                    setThumbnailView(false);
                    onChangeBookPage(page);
                  }}
                />
              )}
            </div>

            {/* Right Side Turn Trigger */}
            <button
              type="button"
              aria-label="Next spread"
              disabled={bookPage >= totalSpreads - 1}
              onClick={() => onRequestTurn('next')}
              className={`ml-1.5 hidden h-10 w-8 shrink-0 items-center justify-center border transition-all lg:inline-flex ${
                bookPage >= totalSpreads - 1
                  ? 'border-transparent text-transparent pointer-events-none'
                  : isPaperback
                    ? 'border-[#D4CFC3] bg-[#FAF8F3]/90 text-[#4A4740] hover:border-[#22201C] hover:text-[#22201C] cursor-pointer'
                    : 'border-[#E2E0DA] bg-white/90 text-[#55534E] hover:border-[#0A0A0A] hover:text-[#0A0A0A] cursor-pointer'
              }`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ====================================================================
            BOTTOM PROGRESS BAR SLIDER & SYNCHRONIZED CHAPTER INDICATOR
            ==================================================================== */}
        {!showBuyerFocusCard && !thumbnailView && (
          <div className="shrink-0">
            <CatalogueProgressSlider
              bookPage={bookPage}
              totalSpreads={totalSpreads}
              activeSection={activeSection}
              navMap={effectiveNavMap}
              spreadLabel={getSpreadLabel(bookPage)}
              paperback={isPaperback}
              onSelectSpread={(page) => {
                setThumbnailView(false);
                onChangeBookPage(page);
              }}
              getSpreadLabel={getSpreadLabel}
            />
          </div>
        )}
      </section>
    </div>
  );
};
