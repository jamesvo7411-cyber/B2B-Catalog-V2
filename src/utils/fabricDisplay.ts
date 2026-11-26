import type { FactoryFabricColor } from '../types/catalogue';

export function getDisplayColorName(color: FactoryFabricColor): string {
  return color.colorName.trim();
}

export function getBuyerFacingColorNote(color: FactoryFabricColor): string | undefined {
  const note = color.sourceNote.trim();
  if (!note) return undefined;
  if (/also listed as/i.test(note)) return note;
  return undefined;
}
