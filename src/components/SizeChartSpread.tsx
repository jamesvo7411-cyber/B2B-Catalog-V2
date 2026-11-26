import React from 'react';
import { Globe, Mail, Phone } from 'lucide-react';
import type { CatalogueMetadata } from '../types/catalogue';
import { BRAND_LOGO_PATH } from '../data/garments';

export interface SizeChartRow {
  size: string;
  col1: string;
  col2: string;
  col3: string;
  weight: string;
  height: string;
}

export const WOMENS_SCRUBS_TOP: SizeChartRow[] = [
  { size: 'XXS', col1: '35', col2: '87', col3: '61', weight: '45-49', height: '148-152' },
  { size: 'XS', col1: '36', col2: '92', col3: '62', weight: '50-54', height: '153-157' },
  { size: 'S', col1: '38', col2: '97', col3: '63', weight: '55-59', height: '158-162' },
  { size: 'M', col1: '39', col2: '102', col3: '64', weight: '60-64', height: '163-167' },
  { size: 'L', col1: '41', col2: '108', col3: '65', weight: '65-69', height: '168-172' },
  { size: 'XL', col1: '43', col2: '114', col3: '67', weight: '70-74', height: '173-177' },
  { size: 'XXL', col1: '45', col2: '121', col3: '68', weight: '75+', height: '177+' },
];

export const WOMENS_SCRUBS_PANTS: SizeChartRow[] = [
  { size: 'XXS', col1: '65', col2: '94', col3: '98', weight: '45-49', height: '148-152' },
  { size: 'XS', col1: '70', col2: '99', col3: '100', weight: '50-54', height: '153-157' },
  { size: 'S', col1: '75', col2: '104', col3: '102', weight: '55-59', height: '158-162' },
  { size: 'M', col1: '80', col2: '109', col3: '103', weight: '60-64', height: '163-167' },
  { size: 'L', col1: '86', col2: '115', col3: '104', weight: '65-69', height: '168-172' },
  { size: 'XL', col1: '91', col2: '121', col3: '105', weight: '70-74', height: '173-177' },
  { size: 'XXL', col1: '96', col2: '128', col3: '106', weight: '75+', height: '177+' },
];

export const MENS_SCRUBS_TOP: SizeChartRow[] = [
  { size: 'XXS', col1: '43', col2: '99', col3: '68', weight: '48-53', height: '154-158' },
  { size: 'XS', col1: '44', col2: '104', col3: '69', weight: '54-59', height: '159-163' },
  { size: 'S', col1: '45', col2: '109', col3: '70', weight: '60-65', height: '164-168' },
  { size: 'M', col1: '47', col2: '114', col3: '71', weight: '66-71', height: '169-173' },
  { size: 'L', col1: '49', col2: '121', col3: '72', weight: '72-77', height: '174-178' },
  { size: 'XL', col1: '50', col2: '127', col3: '74', weight: '78-83', height: '179-183' },
  { size: 'XXL', col1: '52', col2: '133', col3: '75', weight: '84+', height: '184+' },
];

export const MENS_SCRUBS_PANTS: SizeChartRow[] = [
  { size: 'XXS', col1: '67', col2: '95', col3: '100', weight: '48-53', height: '154-158' },
  { size: 'XS', col1: '72', col2: '100', col3: '102', weight: '54-59', height: '159-163' },
  { size: 'S', col1: '77', col2: '105', col3: '104', weight: '60-65', height: '164-168' },
  { size: 'M', col1: '83', col2: '110', col3: '106', weight: '66-71', height: '169-173' },
  { size: 'L', col1: '88', col2: '117', col3: '107', weight: '72-77', height: '174-178' },
  { size: 'XL', col1: '93', col2: '123', col3: '108', weight: '78-83', height: '179-183' },
  { size: 'XXL', col1: '98', col2: '130', col3: '110', weight: '84+', height: '184+' },
];

interface SizeTableBlockProps {
  title: string;
  headers: [string, string, string, string, string, string];
  rows: SizeChartRow[];
  compact?: boolean;
}

const SizeTableBlock: React.FC<SizeTableBlockProps> = ({
  title,
  headers,
  rows,
  compact = false,
}) => (
  <div>
    <h3
      className={`text-center font-serif font-normal tracking-tight text-[#141413] ${
        compact ? 'mb-1 text-[17px]' : 'mb-1.5 text-[20px] sm:text-[22px]'
      }`}
    >
      {title}
    </h3>
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-center tabular-nums">
        <thead>
          <tr className="border-b border-dotted border-[#5A5853] text-[9.5px] font-semibold text-[#141413]">
            {headers.map((header, idx) => (
              <th
                key={header}
                className={`px-1 py-1 font-semibold leading-tight ${
                  idx < headers.length - 1 ? 'border-r border-dotted border-[#7C7972]' : ''
                }`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.size}
              className="text-[10.5px] text-[#22211F] transition-colors hover:bg-[#FAF9F5]"
            >
              <td className="border-r border-dotted border-[#7C7972] px-1 py-0.5 font-semibold text-[#141413]">
                {row.size}
              </td>
              <td className="border-r border-dotted border-[#7C7972] px-1 py-0.5">
                {row.col1}
              </td>
              <td className="border-r border-dotted border-[#7C7972] px-1 py-0.5">
                {row.col2}
              </td>
              <td className="border-r border-dotted border-[#7C7972] px-1 py-0.5">
                {row.col3}
              </td>
              <td className="border-r border-dotted border-[#7C7972] px-1 py-0.5">
                {row.weight}
              </td>
              <td className="px-1 py-0.5">{row.height}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const SizeChartLeafBody: React.FC<{
  gender: 'Women' | 'Men';
  compact?: boolean;
}> = ({ gender, compact = false }) => {
  const isWomen = gender === 'Women';
  const topRows = isWomen ? WOMENS_SCRUBS_TOP : MENS_SCRUBS_TOP;
  const pantsRows = isWomen ? WOMENS_SCRUBS_PANTS : MENS_SCRUBS_PANTS;

  return (
    <div className="flex flex-1 flex-col justify-between">
      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#141413]">
            DREAM TOMORROW
          </span>
          <img
            src={BRAND_LOGO_PATH}
            alt="DT"
            className="h-4 w-auto object-contain"
          />
        </div>
        <h2
          className={`font-serif font-normal leading-[1.06] tracking-tight text-[#141413] ${
            compact ? 'text-[22px]' : 'text-[26px] sm:text-[28px]'
          }`}
        >
          {isWomen ? "Women's" : "Men's"}
          <br />
          Size Chart
        </h2>
      </div>

      <div className={compact ? 'my-3 space-y-3.5' : 'my-2.5 space-y-4'}>
        <SizeTableBlock
          title="Scrubs Top"
          headers={['Size', 'Shoulder (cm)', 'Chest (cm)', 'Length (cm)', 'Weight (kg)', 'Height (cm)']}
          rows={topRows}
          compact={compact}
        />
        <SizeTableBlock
          title="Scrubs Pants"
          headers={['Size', 'Waist (cm)', 'Hip (cm)', 'Length (cm)', 'Weight (kg)', 'Height (cm)']}
          rows={pantsRows}
          compact={compact}
        />
      </div>

      <p className="pt-1 text-[9.5px] font-medium text-[#3F3E3A]">
        Measurement Tolerance: ±3 cm
      </p>
    </div>
  );
};

export const ThankYouLeafBody: React.FC<{
  meta: CatalogueMetadata;
  canInteract: boolean;
}> = ({ meta, canInteract }) => {
  const phone = meta.contactPhone ?? '0392 52 68 52';
  const email = meta.contactEmail || 'contact@dtuniforms.com';
  const websiteLabel = meta.showroomUrl.replace(/^https?:\/\//i, '').replace(/\/+$/, '') || 'www.dtuniforms.com';

  return (
    <div className="flex flex-1 flex-col justify-between py-4">
      <div />

      <div className="my-auto text-center">
        <h2 className="font-sans text-[54px] font-black uppercase leading-[0.88] tracking-[-0.04em] text-[#141413] sm:text-[72px]">
          THANK YOU
        </h2>
        <p className="mt-3 font-sans text-[11px] font-bold uppercase tracking-[0.55em] text-[#1D1C1A] sm:text-xs">
          D . T &nbsp; A P P A R E L
        </p>
      </div>

      <div className="mt-8 space-y-2.5 text-left text-[#232220]">
        <p className="font-sans text-sm font-bold tracking-tight text-[#141413]">
          Contact Us
        </p>
        <div className="space-y-1.5 text-[11.5px] text-[#353430]">
          <div className="flex items-center gap-2.5">
            <Phone className="h-3.5 w-3.5 shrink-0 text-[#45433F]" />
            {canInteract ? (
              <a
                href={`tel:${phone.replace(/\s+/g, '')}`}
                className="tabular-nums underline decoration-transparent underline-offset-4 transition-colors hover:text-[#0A0A0A] hover:decoration-[#0A0A0A]"
              >
                {phone}
              </a>
            ) : (
              <span className="tabular-nums">{phone}</span>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            <Mail className="h-3.5 w-3.5 shrink-0 text-[#45433F]" />
            {canInteract ? (
              <a
                href={`mailto:${email}`}
                className="underline decoration-transparent underline-offset-4 transition-colors hover:text-[#0A0A0A] hover:decoration-[#0A0A0A]"
              >
                {email}
              </a>
            ) : (
              <span>{email}</span>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            <Globe className="h-3.5 w-3.5 shrink-0 text-[#45433F]" />
            {canInteract ? (
              <a
                href={meta.showroomUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-transparent underline-offset-4 transition-colors hover:text-[#0A0A0A] hover:decoration-[#0A0A0A]"
              >
                {websiteLabel}
              </a>
            ) : (
              <span>{websiteLabel}</span>
            )}
          </div>
        </div>
        <p className="pt-2 font-sans text-xs font-bold tracking-tight text-[#141413]">
          “Work your shift, Own your style!”
        </p>
      </div>
    </div>
  );
};
