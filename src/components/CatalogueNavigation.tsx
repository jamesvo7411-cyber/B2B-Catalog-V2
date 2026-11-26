import React from 'react';
import { Sparkles } from 'lucide-react';
import type { GarmentCategory } from '../types/catalogue';
import {
  SECTION_THEME,
  type CatalogueNavigationMap,
  type SectionId,
} from '../utils/catalogueOrder';

interface RunningHeaderProps {
  sectionId: SectionId;
  categoryLabel: string;
  pageLabel: string;
  rightContext?: React.ReactNode;
  overImage?: boolean;
  onSectionClick?: () => void;
  onCategoryClick?: () => void;
}

export const RunningHeader: React.FC<RunningHeaderProps> = ({
  sectionId,
  categoryLabel,
  pageLabel,
  rightContext,
  overImage = false,
  onSectionClick,
  onCategoryClick,
}) => {
  const section = SECTION_THEME[sectionId];

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2 pb-2 ${
        overImage
          ? 'border-b border-[#111111]/18 [text-shadow:0_1px_10px_rgba(247,246,242,0.92)]'
          : 'border-b border-[#E8E6E0]'
      }`}
    >
      <div className="flex min-w-0 items-center gap-1.5 font-mono leading-none">
        <span
          aria-hidden="true"
          className="h-2.5 w-[3px] shrink-0"
          style={{ backgroundColor: section.markerColor }}
        />
        {onSectionClick ? (
          <button
            type="button"
            onClick={onSectionClick}
            className="truncate text-[8.5px] font-semibold uppercase tracking-[0.15em] text-[#111111] underline decoration-transparent underline-offset-2 transition-colors hover:decoration-[#111111] cursor-pointer"
          >
            {section.label}
          </button>
        ) : (
          <span className="truncate text-[8.5px] font-semibold uppercase tracking-[0.15em] text-[#111111]">
            {section.label}
          </span>
        )}
        <span aria-hidden="true" className="text-[8.5px] text-[#9E9B92]">
          /
        </span>
        {onCategoryClick ? (
          <button
            type="button"
            onClick={onCategoryClick}
            className="truncate text-[8.5px] font-medium uppercase tracking-[0.13em] text-[#55534E] underline decoration-transparent underline-offset-2 transition-colors hover:text-[#111111] hover:decoration-[#55534E] cursor-pointer"
          >
            {categoryLabel}
          </button>
        ) : (
          <span className="truncate text-[8.5px] font-medium uppercase tracking-[0.13em] text-[#55534E]">
            {categoryLabel}
          </span>
        )}
        <span aria-hidden="true" className="text-[8.5px] text-[#9E9B92]">
          /
        </span>
        <span className="shrink-0 text-[9.5px] font-bold tracking-[0.06em] text-[#0A0A0A] tabular-nums">
          {pageLabel}
        </span>
      </div>
      {rightContext && (
        <span className="shrink-0 font-mono text-[8.5px] font-medium uppercase tracking-[0.13em] text-[#5F5D57] tabular-nums">
          {rightContext}
        </span>
      )}
    </div>
  );
};

interface SectionWayfinderBarProps {
  activeSection: SectionId;
  activeCategory?: GarmentCategory | null;
  navMap: CatalogueNavigationMap;
  demoMode?: boolean;
  showSections?: boolean;
  onToggleDemoMode?: () => void;
  onSelectSpread: (pageIndex: number) => void;
}

const SHORT_CATEGORY_LABEL: Record<GarmentCategory, string> = {
  Trousers: 'Trousers',
  Shorts: 'Shorts',
  Polos: 'Polos',
  'Tees & V-Necks': 'Tees',
  Skirts: 'Skirts',
};

export const SectionWayfinderBar: React.FC<SectionWayfinderBarProps> = ({
  activeSection,
  activeCategory,
  navMap,
  demoMode = false,
  showSections = true,
  onToggleDemoMode,
  onSelectSpread,
}) => {
  return (
    <div
      aria-label={showSections ? 'Section and category navigation' : 'Category quick-jump'}
      className={`${
        showSections
          ? 'mb-3 flex flex-wrap items-center justify-between gap-x-5 gap-y-2 border-b border-[#E2E0DA] pb-2.5 text-[11px]'
          : 'flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 pb-2 text-[11px]'
      }`}
    >
      {/* Optional 5 Understated Color-Coded Sections */}
      {showSections && (
        <nav aria-label="Catalogue sections" className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {navMap.sections.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => onSelectSpread(section.startSpreadPage)}
                aria-current={isActive ? 'location' : undefined}
                className={`group relative inline-flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap cursor-pointer ${
                  isActive ? 'font-semibold text-[#0A0A0A]' : 'text-[#66645F] hover:text-[#0A0A0A]'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`h-2.5 w-[2.5px] shrink-0 transition-opacity ${
                    isActive ? 'opacity-100' : 'opacity-45 group-hover:opacity-90'
                  }`}
                  style={{ backgroundColor: section.markerColor }}
                />
                <span>{section.label}</span>
                <span className="font-mono text-[9px] text-[#8E8B82] tabular-nums">
                  {String(section.startSpreadPage + 1).padStart(2, '0')}
                </span>
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-0 -bottom-[11px] left-0 h-[1.5px]"
                    style={{ backgroundColor: section.markerColor }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      )}

      {/* Category Quick Jump + Optional Demo Mode Toggle */}
      <div
        className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 ${
          !showSections ? 'w-full justify-between' : ''
        }`}
      >
        <div
          role="navigation"
          aria-label="Garment categories"
          className={`flex flex-wrap items-center gap-3 ${
            showSections && onToggleDemoMode ? 'border-r border-[#E2E0DA] pr-4' : ''
          }`}
        >
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#8E8B82]">
            Categories
          </span>
          {navMap.categoryRanges.map((cat) => {
            const isCatActive = activeCategory === cat.name;
            return (
              <button
                key={cat.name}
                type="button"
                title={`${cat.name} (${cat.count} styles · ${cat.label})`}
                onClick={() => onSelectSpread(cat.firstPage)}
                className={`border-b py-0.5 text-[11px] transition-colors whitespace-nowrap cursor-pointer ${
                  isCatActive
                    ? 'border-[#0A0A0A] font-semibold text-[#0A0A0A]'
                    : 'border-transparent text-[#66645F] hover:border-[#BDBAB2] hover:text-[#0A0A0A]'
                }`}
              >
                {SHORT_CATEGORY_LABEL[cat.name]}
              </button>
            );
          })}
        </div>

        {onToggleDemoMode && (
          <button
            type="button"
            onClick={onToggleDemoMode}
            aria-pressed={demoMode}
            title="Demo Mode prioritizes image-complete fabric and product pages, then places pages with missing images last"
            className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-[10.5px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              demoMode
                ? 'border-[#0A0A0A] bg-[#0A0A0A] text-white'
                : 'border-[#DCDAD3] bg-white text-[#4A4843] hover:border-[#0A0A0A] hover:text-[#0A0A0A]'
            }`}
          >
            <Sparkles className="h-3 w-3" />
            <span>{demoMode ? 'Demo Mode: On' : 'Demo Mode'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

interface BookThumbIndexRailProps {
  activeSection: SectionId;
  navMap: CatalogueNavigationMap;
  onSelectSpread: (pageIndex: number) => void;
}

export const BookThumbIndexRail: React.FC<BookThumbIndexRailProps> = ({
  activeSection,
  navMap,
  onSelectSpread,
}) => {
  return (
    <aside
      aria-label="Thumb index navigation"
      className="hidden xl:flex flex-col justify-start gap-1.5 pt-8 select-none"
    >
      {navMap.sections.map((section, idx) => {
        const isActive = activeSection === section.id;
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelectSpread(section.startSpreadPage)}
            aria-current={isActive ? 'location' : undefined}
            title={`${section.label} · Starts on P.${String(section.startSpreadPage + 1).padStart(2, '0')}`}
            className={`group relative flex w-[92px] flex-col items-start border-y border-r px-2.5 py-2.5 text-left transition-all cursor-pointer ${
              isActive
                ? '-ml-px z-10 border-[#CFCBC2] bg-white text-[#0A0A0A] shadow-[4px_4px_14px_rgba(0,0,0,0.05)]'
                : 'border-[#E6E4DE] bg-[#FAF9F5]/90 text-[#6B6860] hover:bg-white hover:text-[#0A0A0A]'
            }`}
          >
            <span
              aria-hidden="true"
              className={`absolute inset-y-0 left-0 transition-all ${
                isActive ? 'w-[3.5px]' : 'w-[2px] opacity-60 group-hover:opacity-100'
              }`}
              style={{ backgroundColor: section.markerColor }}
            />
            <span className="pl-1 font-mono text-[8.5px] tracking-[0.12em] text-[#8A877F] tabular-nums">
              0{idx + 1} · P.{String(section.startSpreadPage + 1).padStart(2, '0')}
            </span>
            <span className="mt-0.5 pl-1 text-[10px] font-medium leading-tight">
              {section.shortLabel === 'Tech Info' ? 'Technical' : section.label.replace(' Collection', '')}
            </span>
          </button>
        );
      })}
    </aside>
  );
};

interface CatalogueProgressSliderProps {
  bookPage: number;
  totalSpreads: number;
  activeSection: SectionId;
  navMap: CatalogueNavigationMap;
  spreadLabel: string;
  paperback?: boolean;
  onSelectSpread: (pageIndex: number) => void;
  getSpreadLabel?: (pageIndex: number) => string;
}

export const CatalogueProgressSlider: React.FC<CatalogueProgressSliderProps> = ({
  bookPage,
  totalSpreads,
  activeSection,
  navMap,
  spreadLabel,
  paperback = false,
  onSelectSpread,
  getSpreadLabel,
}) => {
  const [hoverPage, setHoverPage] = React.useState<number | null>(null);
  const [hoverPct, setHoverPct] = React.useState<number | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const maxIndex = Math.max(1, totalSpreads - 1);
  const progressPct = Math.max(0, Math.min(100, (bookPage / maxIndex) * 100));
  const activeSecObj = navMap.sections.find((s) => s.id === activeSection) ?? navMap.sections[0];

  const getSectionDisplayName = (id: SectionId, label: string): string => {
    if (id === 'technical' && paperback) return 'Colophon';
    return label.replace(' Collection', '');
  };

  const handleTrackPointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverPct(ratio * 100);
    setHoverPage(Math.round(ratio * maxIndex));
  };

  const previewPage = isDragging ? bookPage : hoverPage;
  const previewPct = isDragging ? progressPct : hoverPct;
  const previewSection =
    previewPage !== null
      ? navMap.sections.find(
          (s) =>
            previewPage >= s.startSpreadPage &&
            previewPage <= s.endSpreadPage
        ) ?? activeSecObj
      : activeSecObj;

  const trackBg = paperback ? 'bg-[#D6D0C4]' : 'bg-[#E5E3DD]';
  const chapterInteractive = !paperback;

  return (
    <div
      aria-label="Catalogue progress and chapter navigation"
      className={`mt-3 select-none border-t pt-2.5 ${
        paperback ? 'border-[#DCD7CC]' : 'border-[#E6E4DD]'
      }`}
    >
      {/* Chapter (Section) Indicator Strip Directly Coupled to the Slider */}
      <div className="mb-1.5 grid grid-cols-5 items-end gap-1.5 sm:gap-3">
        {navMap.sections.map((sec, idx) => {
          const isActive = activeSection === sec.id;
          const chapterLabel = getSectionDisplayName(sec.id, sec.label);
          const content = (
            <>
              <span
                aria-hidden="true"
                className={`mb-1 block h-[2px] w-full transition-opacity duration-200 ${
                  isActive ? 'opacity-100' : 'opacity-30 group-hover/chap:opacity-75'
                }`}
                style={{ backgroundColor: sec.markerColor }}
              />
              <span className="flex items-baseline justify-between gap-1">
                <span
                  className={`truncate text-[10.5px] leading-tight transition-colors ${
                    isActive
                      ? 'font-semibold text-[#0A0A0A]'
                      : paperback
                        ? 'font-normal text-[#6B675E]'
                        : 'font-medium text-[#6B6860] group-hover/chap:text-[#0A0A0A]'
                  }`}
                >
                  <span className="mr-1 font-mono text-[9px] text-[#8E8B82] tabular-nums">
                    0{idx + 1}
                  </span>
                  {chapterLabel}
                </span>
                <span className="hidden font-mono text-[9px] text-[#8E8B82] tabular-nums sm:inline">
                  P.{String(sec.startSpreadPage + 1).padStart(2, '0')}
                </span>
              </span>
            </>
          );

          return chapterInteractive ? (
            <button
              key={sec.id}
              type="button"
              onClick={() => onSelectSpread(sec.startSpreadPage)}
              aria-current={isActive ? 'location' : undefined}
              title={`Jump to ${sec.label} (P.${String(sec.startSpreadPage + 1).padStart(2, '0')})`}
              className="group/chap min-w-0 text-left transition-opacity cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A0A0A]"
            >
              {content}
            </button>
          ) : (
            <div key={sec.id} className="group/chap min-w-0 text-left">
              {content}
            </div>
          );
        })}
      </div>

      {/* Continuous Progress Bar Slider + Proportional Section Ticks */}
      <div
        className="relative flex h-7 items-center"
        onMouseMove={handleTrackPointerMove}
        onMouseLeave={() => {
          setHoverPage(null);
          setHoverPct(null);
        }}
      >
        {/* Live Hover / Drag Preview Tooltip */}
        {previewPage !== null && previewPct !== null && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-9 z-30 -translate-x-1/2 whitespace-nowrap border border-[#111111]/20 bg-[#111111] px-2.5 py-1 text-[10px] text-white shadow-md"
            style={{ left: `${Math.max(8, Math.min(92, previewPct))}%` }}
          >
            <span className="font-mono font-semibold tabular-nums">
              P.{String(previewPage + 1).padStart(2, '0')}
            </span>
            <span className="mx-1.5 text-white/45">·</span>
            <span className="text-white/80">
              {getSectionDisplayName(previewSection.id, previewSection.label)}
            </span>
            {getSpreadLabel && (
              <>
                <span className="mx-1.5 text-white/45">·</span>
                <span className="inline-block max-w-[220px] truncate align-bottom text-white/95">
                  {getSpreadLabel(previewPage).replace(/^P\.\d+\s*·\s*/, '')}
                </span>
              </>
            )}
          </div>
        )}

        {/* Track Rail */}
        <div className={`relative h-[3px] w-full ${trackBg}`}>
          {/* Active Progress Fill */}
          <div
            className="absolute inset-y-0 left-0 transition-[width] duration-100 ease-out"
            style={{
              width: `${progressPct}%`,
              backgroundColor: activeSecObj?.markerColor ?? '#0A0A0A',
            }}
          />

          {/* Proportional Chapter Start Ticks Along Track */}
          {navMap.sections.map((sec) => {
            const pct = (sec.startSpreadPage / maxIndex) * 100;
            const isPastOrCurrent = bookPage >= sec.startSpreadPage;
            return (
              <span
                key={`tick-${sec.id}`}
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 h-2.5 w-[2px] -translate-x-1/2 -translate-y-1/2 transition-opacity"
                style={{
                  left: `${pct}%`,
                  backgroundColor: isPastOrCurrent ? sec.markerColor : '#B5B1A7',
                }}
              />
            );
          })}

          {/* Crisp Architectural Scrubber Thumb */}
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-150 ${
              isDragging ? 'h-4 w-2 scale-110' : 'h-3.5 w-1.5'
            } bg-[#0A0A0A] shadow-[0_1px_3px_rgba(0,0,0,0.25)]`}
            style={{ left: `${progressPct}%` }}
          />
        </div>

        {/* Accessible Full-Width Range Input */}
        <input
          type="range"
          min={0}
          max={totalSpreads - 1}
          step={1}
          value={bookPage}
          aria-label="Scrub catalogue spreads"
          aria-valuetext={spreadLabel}
          onPointerDown={() => setIsDragging(true)}
          onPointerUp={() => setIsDragging(false)}
          onPointerCancel={() => setIsDragging(false)}
          onBlur={() => setIsDragging(false)}
          onChange={(e) => onSelectSpread(Number(e.target.value))}
          className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
        />
      </div>

      {/* Quiet Footer Readout */}
      <div
        className={`flex flex-wrap items-center justify-between gap-2 text-[10.5px] ${
          paperback ? 'text-[#6B675E]' : 'text-[#6F6C65]'
        }`}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden="true"
            className="h-2.5 w-[2.5px] shrink-0"
            style={{ backgroundColor: activeSecObj?.markerColor ?? '#0A0A0A' }}
          />
          <span className="truncate font-mono text-[#171715]">{spreadLabel}</span>
        </div>
        <div className="flex shrink-0 items-center gap-3 font-mono text-[10px] tabular-nums">
          <span className="hidden sm:inline">Scroll wheel or drag slider to turn pages</span>
          <span className="font-semibold text-[#171715]">
            {String(bookPage + 1).padStart(2, '0')} / {String(totalSpreads).padStart(2, '0')}
          </span>
        </div>
      </div>
    </div>
  );
};
