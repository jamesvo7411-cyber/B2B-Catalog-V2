import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  ExternalLink,
  Film,
  Printer,
  SlidersHorizontal,
} from 'lucide-react';
import type { GarmentItem, ImageCrop, MediaSlot, MediaSlotKey } from '../types/catalogue';
import { MediaPlate } from './MediaPlate';
import { ColorSwatchList } from './ColorSwatchList';
import { ProductSpecStrip } from './ProductSpecStrip';
import { SizeRunChips } from './SizeRunChips';
import { RunningHeader } from './CatalogueNavigation';
import {
  formatSpreadPageCode,
  getFabricFamilyName,
  type CatalogueNavigationMap,
} from '../utils/catalogueOrder';
import {
  conciseSourceNote,
  displayBuyerProductTitle,
  getBuyerVisibleValue,
} from '../utils/productDisplay';

export type SpreadLeafSide = 'full' | 'verso' | 'recto';

interface GarmentSpreadProps {
  garment: GarmentItem;
  allGarments: GarmentItem[];
  spreadNumber?: number; // 1-based spread number matching TOC & Fabric Library
  navMap?: CatalogueNavigationMap;
  editMode: boolean;
  isWorkbench?: boolean;
  paperbackMode?: boolean;
  isShortlisted: boolean;
  embeddedInFlipbook?: boolean;
  side?: SpreadLeafSide;
  showSafeZones?: boolean;
  isPreviewLayer?: boolean;
  onPrev: () => void;
  onNext: () => void;
  onJumpToIndex: (index: number) => void;
  onJumpToGarmentId?: (garmentId: string) => void;
  onJumpToSpread?: (pageIndex: number) => void;
  onToggleShortlist: (id: string) => void;
  onReplaceFile: (garmentId: string, slotKey: MediaSlotKey, dataUrl: string) => void;
  onUpdateCrop: (garmentId: string, slotKey: MediaSlotKey, crop: ImageCrop) => void;
  onInspectMedia: (slot: MediaSlot, titleLabel: string, garmentTitle: string) => void;
  onOpenEditor: (focusSlot?: MediaSlotKey) => void;
  onOpenVideo: (garment: GarmentItem) => void;
  onExportCurrentPdf: () => void;
  onSelectFabricCode: (fabricCode: string) => void;
  onOpenFabricColorPicker?: (garment: GarmentItem) => void;
}

function getBalancedDetailGrid(count: number): { gridClass: string; aspectClass: string } {
  if (count === 1) return { gridClass: 'grid-cols-1', aspectClass: 'aspect-[16/9] w-full' };
  if (count === 3) return { gridClass: 'grid-cols-3', aspectClass: 'aspect-[4/3] w-full' };
  return { gridClass: 'grid-cols-2', aspectClass: 'aspect-[16/9] w-full' };
}

export const GarmentSpread: React.FC<GarmentSpreadProps> = ({
  garment,
  allGarments,
  spreadNumber,
  navMap,
  editMode,
  isWorkbench = false,
  paperbackMode = false,
  isShortlisted,
  embeddedInFlipbook = false,
  side = 'full',
  showSafeZones = false,
  isPreviewLayer = false,
  onPrev,
  onNext,
  onJumpToIndex,
  onJumpToGarmentId,
  onJumpToSpread,
  onToggleShortlist,
  onReplaceFile,
  onUpdateCrop,
  onInspectMedia,
  onOpenEditor,
  onOpenVideo,
  onExportCurrentPdf,
  onSelectFabricCode,
  onOpenFabricColorPicker,
}) => {
  const canInteract = !paperbackMode && !isPreviewLayer;
  const paddedNumber = String(garment.index).padStart(2, '0');
  const paddedTotal = String(allGarments.length).padStart(2, '0');
  const effectiveSpread = spreadNumber ?? garment.index;
  const spreadPadded = String(effectiveSpread).padStart(2, '0');
  const versoPage = `P.${spreadPadded}A`;
  const rectoPage = `P.${spreadPadded}B`;
  const sectionId = garment.gender === 'Women' ? 'women' : 'men';
  const sectionStartSpread = navMap?.sections.find((s) => s.id === sectionId)?.startSpreadPage;
  const categoryStartSpread = navMap?.categoryRanges.find((c) => c.name === garment.category)?.firstPage;
  const fabricSpreadIdx = navMap?.fabricPageByCode.get(garment.specs.fabricRollRef);
  const fabricPageLabel =
    fabricSpreadIdx !== undefined ? formatSpreadPageCode(fabricSpreadIdx) : undefined;
  const fabricFamilyName = getFabricFamilyName(garment.specs.fabricRollRef);
  const mediaKeys: MediaSlotKey[] = ['hero', 'pocket', 'seam', 'swatch', 'custom'];
  const populatedCount = mediaKeys.filter((key) => Boolean(garment.media[key]?.url)).length;
  const fabricSiblings = allGarments.filter(
    (item) =>
      item.id !== garment.id &&
      item.specs.fabricRollRef.toLowerCase() === garment.specs.fabricRollRef.toLowerCase()
  );
  const sourceNote = conciseSourceNote(garment.dataFlags);
  const [unavailableSlots, setUnavailableSlots] = useState<Partial<Record<MediaSlotKey, boolean>>>({});

  useEffect(() => {
    setUnavailableSlots({});
  }, [
    garment.id,
    garment.media.hero.url,
    garment.media.hero.fallbackUrl,
    garment.media.pocket.url,
    garment.media.seam.url,
    garment.media.swatch.url,
    garment.media.custom.url,
  ]);

  const markSlotUnavailable = (slotKey: MediaSlotKey) => {
    setUnavailableSlots((prev) => (prev[slotKey] ? prev : { ...prev, [slotKey]: true }));
  };

  const productDetailSlots: { key: MediaSlotKey; label: string }[] = [
    { key: 'pocket', label: 'Detail 01' },
    { key: 'seam', label: 'Detail 02' },
    { key: 'swatch', label: 'Fabric Image' },
    { key: 'custom', label: 'Detail 03' },
  ];
  const visibleProductDetailSlots = productDetailSlots.filter(({ key }) => {
    const slot = garment.media[key];
    return Boolean(slot.url || slot.fallbackUrl) && !unavailableSlots[key];
  });
  const detailLayout = getBalancedDetailGrid(visibleProductDetailSlots.length);
  const buyerColorwayCount = garment.colorways.filter(
    (color) =>
      getBuyerVisibleValue(color) && !color.toLowerCase().includes('pending')
  ).length;
  const hasHeroAsset =
    Boolean(garment.media.hero.url || garment.media.hero.fallbackUrl) &&
    !unavailableSlots.hero;

  const renderMedia = (
    slotKey: MediaSlotKey,
    titleLabel: string,
    aspectClass: string,
    compact = false,
    imageOverlay?: React.ReactNode,
    displayScale = 1,
    topOverlay?: React.ReactNode,
    overlayMode: 'gradient' | 'card' = 'gradient',
    fullHeight = false
  ) => {
    const slot = garment.media[slotKey];
    if (!isWorkbench && !slot.url && !slot.fallbackUrl) return null;
    const isSwatchSlot = slotKey === 'swatch';
    const canEditSlot = isWorkbench && !isSwatchSlot;
    const canReframeSlot = isWorkbench && !isPreviewLayer;
    const swatchHandler =
      isSwatchSlot && isWorkbench && !isPreviewLayer && onOpenFabricColorPicker
        ? () => onOpenFabricColorPicker(garment)
        : undefined;

    return (
      <MediaPlate
        slotKey={slotKey}
        slot={slot}
        aspectClass={aspectClass}
        titleLabel={titleLabel}
        editMode={editMode && !isPreviewLayer && canEditSlot}
        interactive={!paperbackMode}
        editable={canEditSlot}
        allowReframe={canReframeSlot}
        showBlankGuides={isWorkbench}
        compact={compact || !isWorkbench}
        fullHeight={fullHeight}
        displayScale={displayScale}
        topOverlay={topOverlay}
        imageOverlay={imageOverlay}
        overlayMode={overlayMode}
        customActionLabel={isSwatchSlot && isWorkbench ? 'Switch color' : undefined}
        onCustomClick={swatchHandler}
        onImageUnavailable={markSlotUnavailable}
        onReplaceFile={
          isPreviewLayer || !canEditSlot
            ? undefined
            : (key, url) => onReplaceFile(garment.id, key, url)
        }
        onUpdateCrop={
          isPreviewLayer || !isWorkbench
            ? undefined
            : (key, crop) => onUpdateCrop(garment.id, key, crop)
        }
        onInspect={
          isPreviewLayer || paperbackMode
            ? undefined
            : (s, label) => onInspectMedia(s, label, garment.title)
        }
        onOpenEditor={isPreviewLayer || !canEditSlot ? undefined : (key) => onOpenEditor(key)}
      />
    );
  };

  const renderDetailPlate = (
    slotKey: MediaSlotKey,
    label: string,
    aspectClass = 'aspect-[16/10] w-full'
  ) => {
    const slot = garment.media[slotKey];
    const hasLoadedAsset =
      Boolean(slot.url || slot.fallbackUrl) && !unavailableSlots[slotKey];

    if (!hasLoadedAsset) return null;

    return (
      <div key={slotKey} className="min-w-0">
        {renderMedia(
          slotKey,
          `${garment.sku} ${label}`,
          aspectClass,
          true,
          undefined,
          slotKey === 'swatch' ? 1.65 : 1
        )}
        <div className="mt-1 flex items-baseline justify-between gap-1.5">
          <p className="font-mono text-[8.5px] font-semibold uppercase tracking-wide text-[#33322F]">
            {label}
          </p>
          {slotKey === 'swatch' && fabricPageLabel && (
            canInteract ? (
              <button
                type="button"
                onClick={() => onSelectFabricCode(garment.specs.fabricRollRef)}
                className="font-mono text-[8px] text-[#66645F] underline decoration-[#C2BFB8] underline-offset-2 hover:text-[#111111] hover:decoration-[#111111] cursor-pointer"
              >
                {garment.specs.fabricRollRef} · {fabricPageLabel}
              </button>
            ) : (
              <span className="font-mono text-[8px] text-[#66645F]">
                {garment.specs.fabricRollRef} · {fabricPageLabel}
              </span>
            )
          )}
        </div>
      </div>
    );
  };

  const leafShell = (leafSide: 'verso' | 'recto', children: React.ReactNode) => {
    const verso = leafSide === 'verso';
    const isLeafFrame = side === 'verso' || side === 'recto';
    return (
      <div
        className={`relative flex min-h-0 flex-col bg-white py-6 ${
          isLeafFrame ? 'h-[842px] overflow-hidden' : 'h-full md:h-[842px] md:overflow-hidden'
        } ${verso ? 'pl-8 pr-12' : 'pl-12 pr-8'}`}
      >
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 w-14 ${
            isLeafFrame ? 'block' : 'hidden md:block'
          } ${verso ? 'spine-verso-shadow right-0' : 'spine-recto-shadow left-0'}`}
        />
        {showSafeZones && isWorkbench && (
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute top-4 bottom-4 border border-dashed border-[var(--metallic-soft)]/70 ${
              verso ? 'left-4 right-8' : 'left-8 right-4'
            }`}
          />
        )}
        {children}
      </div>
    );
  };

  const heroTopLockup = (
    <div className="space-y-2">
      {!isWorkbench && (
        <div className={canInteract ? 'pointer-events-auto' : 'pointer-events-none'}>
          <RunningHeader
            sectionId={sectionId}
            categoryLabel={garment.category}
            pageLabel={versoPage}
            rightContext="DREAM TOMORROW"
            overImage
            onSectionClick={
              canInteract && sectionStartSpread !== undefined && onJumpToSpread
                ? () => onJumpToSpread(sectionStartSpread)
                : undefined
            }
            onCategoryClick={
              canInteract && categoryStartSpread !== undefined && onJumpToSpread
                ? () => onJumpToSpread(categoryStartSpread)
                : undefined
            }
          />
        </div>
      )}
      <div className="flex items-start justify-between gap-3 [text-shadow:0_1px_10px_rgba(247,246,242,0.92)]">
        <div className="inline-block">
          <span className="block font-serif text-4xl font-light leading-[0.86] tracking-tight text-[#111111] tabular-nums sm:text-[46px]">
            {paddedNumber}
          </span>
          <span className="mt-1.5 inline-block border-t border-[#111111]/25 pt-1 font-mono text-[8.5px] font-semibold uppercase tracking-[0.16em] text-[#3E3C37]">
            {garment.gender} · {garment.category}
          </span>
        </div>
        {isWorkbench ? (
          <span className="pt-1 font-mono text-[8.5px] font-semibold uppercase tracking-[0.18em] text-[#33322F]">
            Dream Tomorrow
          </span>
        ) : canInteract && embeddedInFlipbook ? (
          <button
            type="button"
            onClick={() => onToggleShortlist(garment.id)}
            className={`pointer-events-auto inline-flex items-center gap-1.5 border px-2.5 py-1 text-[9.5px] font-medium backdrop-blur-xs transition-colors cursor-pointer ${
              isShortlisted
                ? 'border-[#0A0A0A] bg-[#0A0A0A] text-white'
                : 'border-[#111111]/20 bg-[#F7F6F2]/85 text-[#111111] hover:border-[#0A0A0A]'
            }`}
          >
            {isShortlisted ? <Check className="h-3 w-3" /> : <Bookmark className="h-3 w-3" />}
            <span>{isShortlisted ? 'Saved' : 'Save style'}</span>
          </button>
        ) : null}
      </div>
    </div>
  );

  const heroBottomCard = (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="font-serif text-[24px] font-normal leading-[1.04] tracking-tight text-[#0A0A0A] sm:text-[27px]">
          {!isWorkbench ? displayBuyerProductTitle(garment.title) : garment.title}
        </h1>
        <span className="shrink-0 font-mono text-[10px] font-semibold tracking-[0.14em] text-[#3E3C37] tabular-nums">
          {garment.sku}
        </span>
      </div>
      <div className="mt-2">
        <ProductSpecStrip
          item={garment}
          overlay
          disabled={!canInteract}
          onSelectFabricCode={canInteract ? onSelectFabricCode : undefined}
          showWorkbenchNotes={isWorkbench}
          showFabricCrossReference={false}
        />
      </div>
      {!isWorkbench && (
        <div className="mt-2 flex items-center justify-between border-t border-[#111111]/15 pt-1.5 font-mono text-[8.5px] font-semibold text-[#4E4C47] tabular-nums">
          <span>{versoPage}</span>
          <div className="flex items-center gap-3">
            {canInteract && garment.videoUrl && (
              <button
                type="button"
                onClick={() => onOpenVideo(garment)}
                className="inline-flex items-center gap-1 text-[#111111] underline decoration-[#8A877F] underline-offset-2 hover:decoration-[#111111] cursor-pointer"
              >
                <Film className="h-2.5 w-2.5" />
                <span>{garment.videoTitle || 'Motion study'}</span>
              </button>
            )}
            <span>
              STYLE {paddedNumber} · {garment.productGroupVi.toUpperCase()}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  const isLeafFrame = side === 'verso' || side === 'recto';

  const versoLeaf = !isWorkbench ? (
    <div
      className={`relative flex w-full flex-col overflow-hidden bg-[#FAF9F5] ${
        isLeafFrame ? 'h-[842px]' : 'h-full min-h-[500px] md:h-[842px]'
      }`}
    >
      <div
        aria-hidden="true"
        className={`spine-verso-shadow pointer-events-none absolute inset-y-0 right-0 z-30 w-14 ${
          isLeafFrame ? 'block' : 'hidden md:block'
        }`}
      />
      {hasHeroAsset ? (
        <div
          className={`relative flex h-full w-full flex-1 flex-col ${
            isLeafFrame ? 'min-h-0' : 'min-h-[500px] md:min-h-0'
          }`}
        >
          {renderMedia(
            'hero',
            'Primary image',
            'h-full w-full flex-1',
            true,
            heroBottomCard,
            1,
            heroTopLockup,
            'card',
            true
          )}
        </div>
      ) : (
        <div
          className={`relative flex h-full w-full flex-1 flex-col justify-between bg-[#FAF9F5] p-6 ${
            isLeafFrame ? 'min-h-0' : 'min-h-[460px] md:min-h-0'
          }`}
        >
          {heroTopLockup}
          <div className="my-auto px-6 py-10 text-center">
            <p className="font-serif text-3xl font-normal tracking-tight text-[#3E3C37]">
              {displayBuyerProductTitle(garment.title)}
            </p>
            <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[#77756F]">
              {garment.sku} · {garment.specs.fabricRollRef}
            </p>
          </div>
          <div className="pt-2">{heroBottomCard}</div>
        </div>
      )}
    </div>
  ) : (
    leafShell(
      'verso',
      <>
        <header className="relative z-10 mb-3">
          <RunningHeader
            sectionId={sectionId}
            categoryLabel={garment.category}
            pageLabel={versoPage}
            rightContext={garment.sku}
            onSectionClick={
              canInteract && sectionStartSpread !== undefined && onJumpToSpread
                ? () => onJumpToSpread(sectionStartSpread)
                : undefined
            }
            onCategoryClick={
              canInteract && categoryStartSpread !== undefined && onJumpToSpread
                ? () => onJumpToSpread(categoryStartSpread)
                : undefined
            }
          />
        </header>

        <main className="relative z-10 flex min-h-0 flex-1 flex-col gap-2.5">
          {renderMedia(
            'hero',
            'Primary image',
            isLeafFrame ? 'min-h-0 w-full flex-1' : 'min-h-[420px] md:min-h-0 w-full flex-1',
            false,
            heroBottomCard,
            1,
            heroTopLockup,
            'card',
            true
          )}

          {(sourceNote || (embeddedInFlipbook && !isPreviewLayer)) && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
              {sourceNote ? (
                <p className="flex max-w-[65ch] items-start gap-1.5 text-[9px] leading-relaxed text-[#77756F]">
                  <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                  <span>{sourceNote}</span>
                </p>
              ) : (
                <span />
              )}
              {embeddedInFlipbook && !isPreviewLayer && (
                <div className="flex shrink-0 items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onToggleShortlist(garment.id)}
                    className="inline-flex items-center gap-1.5 text-[10px] text-[#55534E] transition-colors hover:text-[#111] cursor-pointer"
                  >
                    {isShortlisted ? <Check className="h-3 w-3" /> : <Bookmark className="h-3 w-3" />}
                    <span>{isShortlisted ? 'Saved' : 'Save style'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenEditor()}
                    className="inline-flex items-center gap-1.5 text-[10px] text-[#55534E] transition-colors hover:text-[#111] cursor-pointer"
                  >
                    <SlidersHorizontal className="h-3 w-3" />
                    <span>Edit</span>
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E8E6E0] pt-2 text-[10px] text-[#111111]">
            <div className="flex items-center gap-4">
              {garment.videoUrl && (
                <button
                  type="button"
                  disabled={isPreviewLayer}
                  onClick={() => onOpenVideo(garment)}
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-[#111] cursor-pointer"
                >
                  <Film className="h-3 w-3" />
                  <span>{garment.videoTitle || 'View video'}</span>
                </button>
              )}
              {garment.productUrl && (
                <a
                  href={garment.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-[#111]"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Product source</span>
                </a>
              )}
            </div>
            <span className="font-mono text-[9px] font-semibold text-[#111111]">
              {populatedCount}/5 images
            </span>
          </div>
        </main>

        <footer className="relative z-10 mt-3 flex items-center justify-between border-t border-[#E8E6E0] pt-2 font-mono text-[9px] font-semibold text-[#111111] tabular-nums">
          <span>{versoPage}</span>
          <span>STYLE {paddedNumber} · {garment.productGroupVi.toUpperCase()}</span>
        </footer>
      </>
    )
  );

  const sharedHighlightsAndLinks = (
    <section className="flex flex-1 flex-col justify-between gap-3">
      <div>
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[#55534E]">
            Material &amp; Design Highlights
          </h3>
          <SizeRunChips sizeRun={garment.specs.sizeRun} size="xs" />
        </div>
        <p className="mt-2 font-serif text-[14.5px] italic leading-snug text-[#1F1E1B]">
          {garment.summary}
        </p>
        {garment.keyFeatures.length > 0 && (
          <ul className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-[#EFECE6] pt-2.5">
            {garment.keyFeatures.map((feat, idx) => (
              <li key={idx} className="flex items-baseline gap-2 text-[10.5px] leading-snug text-[#292824]">
                <span className="font-mono text-[8.5px] text-[var(--metallic-strong)] tabular-nums">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Cross-Reference Bar: Fabric Library Path + Shared Styles */}
      <div className="space-y-1.5 border-t border-[#E8E6E0] pt-2.5 text-[9.5px] text-[#66645F]">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span>
            <span className="font-mono text-[8.5px] uppercase tracking-wider text-[#77756F]">
              Fabric{' '}
            </span>
            {canInteract ? (
              <button
                type="button"
                onClick={() => onSelectFabricCode(garment.specs.fabricRollRef)}
                className="font-mono font-semibold text-[#111111] underline decoration-[#B8B5AD] underline-offset-2 hover:decoration-[#111111] cursor-pointer"
              >
                {garment.specs.fabricRollRef}
              </button>
            ) : (
              <span className="font-mono font-semibold text-[#111111]">
                {garment.specs.fabricRollRef}
              </span>
            )}
            <span className="text-[#55534E]"> · {fabricFamilyName}</span>
          </span>
          {fabricPageLabel && (
            canInteract ? (
              <button
                type="button"
                onClick={() => onSelectFabricCode(garment.specs.fabricRollRef)}
                className="shrink-0 font-mono text-[8.5px] font-semibold text-[#111111] underline decoration-[#B8B5AD] underline-offset-2 hover:decoration-[#111111] cursor-pointer tabular-nums"
              >
                See Fabric Library {fabricPageLabel} →
              </button>
            ) : (
              <span className="shrink-0 font-mono text-[8.5px] text-[#55534E] tabular-nums">
                Fabric Library {fabricPageLabel}
              </span>
            )
          )}
        </div>

        {fabricSiblings.length > 0 && (
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[9px]">
            <span className="font-mono text-[8px] uppercase tracking-wider text-[#77756F]">
              Related styles:
            </span>
            {fabricSiblings.map((sibling, index) => {
              const sibPage = navMap?.garmentPageById.get(sibling.id);
              const sibPageLabel = sibPage !== undefined ? formatSpreadPageCode(sibPage) : '';
              return (
                <React.Fragment key={sibling.id}>
                  {index > 0 && <span className="text-[#BDBAB2]">·</span>}
                  {canInteract ? (
                    <button
                      type="button"
                      onClick={() =>
                        onJumpToGarmentId
                          ? onJumpToGarmentId(sibling.id)
                          : onJumpToIndex(sibling.index)
                      }
                      className="font-mono text-[#292824] underline decoration-[#D4D1CA] underline-offset-2 hover:text-[#0A0A0A] hover:decoration-[#111111] cursor-pointer tabular-nums"
                    >
                      {sibling.sku}
                      {sibPageLabel ? ` (${sibPageLabel})` : ''}
                    </button>
                  ) : (
                    <span className="font-mono text-[#4E4C47] tabular-nums">
                      {sibling.sku}
                      {sibPageLabel ? ` (${sibPageLabel})` : ''}
                    </span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );

  const rectoLeaf = leafShell(
    'recto',
    <>
      <header className="relative z-10 mb-3">
        <RunningHeader
          sectionId={sectionId}
          categoryLabel={garment.category}
          pageLabel={rectoPage}
          rightContext={`${garment.sku} · FABRIC ${garment.specs.fabricRollRef}`}
          onSectionClick={
            canInteract && sectionStartSpread !== undefined && onJumpToSpread
              ? () => onJumpToSpread(sectionStartSpread)
              : undefined
          }
          onCategoryClick={
            canInteract && categoryStartSpread !== undefined && onJumpToSpread
              ? () => onJumpToSpread(categoryStartSpread)
              : undefined
          }
        />
      </header>

      <main className="relative z-10 flex min-h-0 flex-1 flex-col justify-between gap-2.5">
        {!isWorkbench ? (
          <>
            {visibleProductDetailSlots.length > 0 && (
              <section className="border-b border-[#E8E6E0] pb-2.5">
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                  <h2 className="font-serif text-[22px] font-normal leading-none tracking-tight text-[#141412]">
                    Details &amp; Material
                  </h2>
                  <span className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-[#77756F]">
                    {visibleProductDetailSlots.length}{' '}
                    {visibleProductDetailSlots.length === 1 ? 'plate' : 'plates'}
                  </span>
                </div>
                <div className={`grid gap-2.5 ${detailLayout.gridClass}`}>
                  {visibleProductDetailSlots.map(({ key, label }) =>
                    renderDetailPlate(key, label, detailLayout.aspectClass)
                  )}
                </div>
              </section>
            )}

            <section className="border-b border-[#E8E6E0] pb-2.5">
              <div className="mb-1.5 flex items-baseline justify-between gap-2">
                <h3 className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[#55534E]">
                  Colorways
                </h3>
                <span className="font-mono text-[9px] text-[#77756F] tabular-nums">
                  {buyerColorwayCount} {buyerColorwayCount === 1 ? 'shade' : 'shades'}
                </span>
              </div>
              <ColorSwatchList
                colorways={garment.colorways}
                fabricCode={garment.specs.fabricRollRef}
                compact
                editorial
                showPendingColorways={false}
              />
            </section>

            {sharedHighlightsAndLinks}
          </>
        ) : (
          <>
            <section className="border-b border-[#E8E6E0] pb-2.5">
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <h2 className="font-serif text-xl tracking-tight text-[#24231F]">
                  Details &amp; Material
                </h2>
                {!isPreviewLayer && onOpenFabricColorPicker && (
                  <button
                    type="button"
                    onClick={() => onOpenFabricColorPicker(garment)}
                    className="font-mono text-[8.5px] font-semibold text-[#111111] underline decoration-[#B8B5AD] underline-offset-2 hover:decoration-[#111111] cursor-pointer"
                  >
                    Switch swatch ({garment.specs.fabricRollRef})
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {renderMedia('pocket', 'Detail 01', 'aspect-[16/9]')}
                {renderMedia('seam', 'Detail 02', 'aspect-[16/9]')}
                {garment.media.swatch.url ? (
                  renderMedia('swatch', 'Fabric image', 'aspect-[16/9]', false, undefined, 1.65)
                ) : (
                  <button
                    type="button"
                    disabled={isPreviewLayer || !onOpenFabricColorPicker}
                    onClick={() => onOpenFabricColorPicker?.(garment)}
                    className="flex aspect-[16/9] w-full flex-col items-center justify-center border border-dashed border-[#D8D6D0] bg-[#F7F6F2] px-2 text-center transition-colors hover:border-[#0A0A0A] cursor-pointer disabled:cursor-default"
                  >
                    <span className="font-mono text-[8px] font-semibold uppercase tracking-wide text-[#55534E]">
                      Select {garment.specs.fabricRollRef} swatch
                    </span>
                  </button>
                )}
                {renderMedia('custom', 'Detail 03', 'aspect-[16/9]')}
              </div>
            </section>

            <section className="border-b border-[#E8E6E0] pb-3">
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <h3 className="font-mono text-[9px] tracking-[0.12em] text-[#77756F]">
                  COLORWAYS · SHADE REFS
                </h3>
                <span className="font-mono text-[8.5px] text-[#77756F] tabular-nums">
                  {garment.colorways.length}{' '}
                  {garment.colorways.length === 1 ? 'shade' : 'shades'}
                </span>
              </div>
              <ColorSwatchList
                colorways={garment.colorways}
                fabricCode={garment.specs.fabricRollRef}
                compact
                editorial
                showPendingColorways
              />
            </section>

            {sharedHighlightsAndLinks}
          </>
        )}
      </main>

      <footer className="relative z-10 mt-3 flex items-center justify-between border-t border-[#E8E6E0] pt-2 font-mono text-[9px] font-semibold text-[#111111] tabular-nums">
        <span>{paddedNumber}.B–E</span>
        <span>{rectoPage}</span>
      </footer>
    </>
  );

  if (side === 'verso') return versoLeaf;
  if (side === 'recto') return rectoLeaf;

  return (
    <div className={embeddedInFlipbook ? '' : 'mx-auto max-w-[1360px] px-6 py-8 lg:px-10 lg:py-10'}>
      {!embeddedInFlipbook && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4">
            <button type="button" onClick={onPrev} className="inline-flex items-center gap-1.5 text-[#55534E] hover:text-[#111]">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>
            <label className="flex items-center gap-1.5 font-mono text-xs text-[#24231F]">
              <span className="sr-only">Jump to style code</span>
              <select
                value={garment.index}
                onChange={(event) => onJumpToIndex(Number(event.target.value))}
                className="bg-white py-1 font-mono text-xs text-[#24231F] focus:outline-none"
              >
                {allGarments.map((item) => (
                  <option key={item.id} value={item.index}>
                    {String(item.index).padStart(2, '0')} · {item.sku} ({item.gender})
                  </option>
                ))}
              </select>
              <span className="text-[#77756F]">of {paddedTotal}</span>
            </label>
            <button type="button" onClick={onNext} className="inline-flex items-center gap-1.5 text-[#55534E] hover:text-[#111]">
              <span>Next</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {isWorkbench && (
              <span className="font-mono text-[10px] text-[#77756F]">
                {populatedCount}/5 images
              </span>
            )}
            <button
              type="button"
              onClick={() => onToggleShortlist(garment.id)}
              className="inline-flex items-center gap-1.5 text-xs text-[#55534E] hover:text-[#111]"
            >
              {isShortlisted ? <Check className="h-3 w-3" /> : <Bookmark className="h-3 w-3" />}
              <span>{isShortlisted ? 'Saved' : 'Save style'}</span>
            </button>
            {isWorkbench && (
              <button type="button" onClick={() => onOpenEditor()} className="inline-flex items-center gap-1.5 text-xs text-[#55534E] hover:text-[#111]">
                <SlidersHorizontal className="h-3 w-3" />
                <span>Edit</span>
              </button>
            )}
            <button type="button" onClick={onExportCurrentPdf} className="inline-flex items-center gap-1.5 text-xs text-[#55534E] hover:text-[#111]">
              <Printer className="h-3 w-3" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>
      )}

      <div className="relative grid h-full grid-cols-1 bg-white lg:grid-cols-2">
        {versoLeaf}
        {rectoLeaf}
        <div
          aria-hidden="true"
          className="book-spine-crease pointer-events-none absolute inset-y-0 left-1/2 hidden w-1.5 -translate-x-1/2 lg:block"
        />
      </div>
    </div>
  );
};
