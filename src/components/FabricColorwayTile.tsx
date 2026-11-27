import React from 'react';
import { getFactoryColorImageKey } from '../data/factoryFabricColors';
import { getColorSwatchHex } from '../data/garments';
import type { FactoryFabricColor } from '../types/catalogue';
import { getBuyerFacingColorNote, getDisplayColorName } from '../utils/fabricDisplay';
import { getBuyerVisibleValue } from '../utils/productDisplay';
import { FabricColorImageTile } from './FabricSwatchBoard';

interface FabricColorwayTileProps {
  color: FactoryFabricColor;
  imageUrl: string;
  interactive: boolean;
  aspectClass?: string;
  expanded?: boolean;
  fillHeight?: boolean;
  className?: string;
  onReplace?: (imageKey: string, dataUrl: string) => void;
  onError?: (message: string) => void;
}

export const FabricColorwayTile: React.FC<FabricColorwayTileProps> = React.memo(({
  color,
  imageUrl,
  interactive,
  aspectClass = 'aspect-[4/3]',
  expanded = false,
  fillHeight = false,
  className = '',
  onReplace,
  onError,
}) => {
  const imageKey = getFactoryColorImageKey(color.fabricCode, color.colorName);
  const colorHex = getColorSwatchHex(color.colorName) ?? '#B8B6B0';
  const sourceNote = getBuyerFacingColorNote(color);
  const effectiveAspectClass = fillHeight ? 'min-h-[68px] flex-1 w-full' : aspectClass;

  return (
    <article
      className={`flex min-w-0 flex-col border border-[#E5E3DE] bg-white ${
        fillHeight ? 'h-full min-h-0' : ''
      } ${className}`}
    >
      <FabricColorImageTile
        color={color}
        imageUrl={imageUrl}
        interactive={interactive}
        aspectClass={effectiveAspectClass}
        tightCrop
        onReplace={onReplace ? (dataUrl) => onReplace(imageKey, dataUrl) : undefined}
        onError={onError}
      />
      <div
        className={`flex flex-col ${fillHeight ? 'shrink-0' : 'flex-1'} ${
          expanded ? 'px-3 py-2.5' : 'px-2.5 py-2'
        }`}
      >
        <div className="flex min-w-0 items-center gap-1.5">
          <span
            aria-label={`${getDisplayColorName(color)} color`}
            className="h-3 w-3 shrink-0 rounded-full border border-black/15"
            style={{ backgroundColor: colorHex }}
          />
          <h3
            className={`min-w-0 break-words font-bold leading-tight text-[#111111] ${
              expanded ? 'text-xs' : 'text-[11px]'
            }`}
          >
            {getDisplayColorName(color)}
          </h3>
        </div>
        {(interactive || getBuyerVisibleValue(color.reference)) && (
          <p className="mt-0.5 break-words font-mono text-[8.5px] font-medium leading-snug text-[#33322F]">
            {getBuyerVisibleValue(color.reference) || (interactive ? 'TCX not listed' : '')}
          </p>
        )}
        {(interactive || getBuyerVisibleValue(color.shadeCode)) && (
          <p className="mt-0.5 break-words font-mono text-[8.5px] leading-snug text-[#68665F]">
            {getBuyerVisibleValue(color.shadeCode) ||
              (interactive ? 'Color code not listed' : '')}
          </p>
        )}
        {expanded &&
          (interactive || getBuyerVisibleValue(color.lotWeightGsm) || getBuyerVisibleValue(color.lotWidth)) && (
          <p className="mt-1 font-mono text-[8.5px] text-[#55534E] tabular-nums">
            {[
              getBuyerVisibleValue(color.lotWeightGsm) ||
                (interactive ? 'Lot GSM not listed' : ''),
              getBuyerVisibleValue(color.lotWidth) ||
                (interactive ? 'Lot width not listed' : ''),
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        )}
        {interactive && sourceNote && (
          <p className={`mt-1 text-[8px] leading-snug text-[#68665F] ${expanded ? 'line-clamp-2' : 'line-clamp-1'}`}>
            {sourceNote}
          </p>
        )}
      </div>
    </article>
  );
});
