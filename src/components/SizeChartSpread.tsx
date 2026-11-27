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
          title="Tops, Polos & Tees"
          headers={['Size', 'Shoulder (cm)', 'Chest (cm)', 'Length (cm)', 'Weight (kg)', 'Height (cm)']}
          rows={topRows}
          compact={compact}
        />
        <SizeTableBlock
          title="Trousers, Shorts & Skirts"
          headers={['Size', 'Waist (cm)', 'Hip (cm)', 'Length (cm)', 'Weight (kg)', 'Height (cm)']}
          rows={pantsRows}
          compact={compact}
        />
      </div>

      <p className="pt-1 text-[9.5px] font-medium text-[#3F3E3A]">
        Measurement Tolerance: ±3 cm · Graded on regular casualwear blocks
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
  const websiteLabel =
    meta.showroomUrl.replace(/^https?:\/\//i, '').replace(/\/+$/, '') || 'www.dtuniforms.com';

  const nextSteps = [
    {
      num: '01',
      title: 'Strike-Offs & Samples',
      detail: 'Proto fits, fabric lab dips & trim approvals',
    },
    {
      num: '02',
      title: '15 Textile Programs',
      detail: 'Piqué knits, cotton jersey & suiting twills',
    },
    {
      num: '03',
      title: 'CM / OEM / ODM Runs',
      detail: 'Flexible 50–100 pc MOQ & custom relabeling',
    },
  ];

  return (
    <div className="flex flex-1 flex-col justify-between py-2">
      {/* Top Atelier Signature Bar */}
      <div className="flex items-center justify-between border-b border-[#E7E4DC] pb-3">
        <div className="flex items-center gap-2.5">
          <img
            src={BRAND_LOGO_PATH}
            alt="DT"
            className="h-5 w-auto object-contain"
          />
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#5F5D57]">
            D.T Apparel · Series 01
          </span>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#7B7870]">
          Closing Folio
        </span>
      </div>

      {/* Asymmetric Editorial Closing Statement */}
      <div className="my-auto py-4">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#7A776F]">
          Dream Tomorrow · Manufacturing Partner
        </p>
        <h2 className="mt-2.5 max-w-[14ch] font-serif text-[34px] font-normal leading-[1.03] tracking-tight text-[#141413] sm:text-[40px]">
          Tailored for Every Day, Built to Your Line.
        </h2>
        <p className="mt-3 max-w-[44ch] text-[11px] leading-relaxed text-[#4F4D47]">
          Thank you for reviewing our 43-style casualwear and textile catalogue. Share a style code or fabric reference to initiate sample yardage, custom colorways, or tech-pack costing.
        </p>

        {/* Three-Column Next-Step Ledger */}
        <div className="mt-6 grid grid-cols-3 gap-3 border-y border-[#E7E4DC] py-3.5">
          {nextSteps.map((step) => (
            <div key={step.num} className="min-w-0">
              <p className="font-mono text-[8.5px] font-semibold tracking-[0.14em] text-[#8B8880] tabular-nums">
                {step.num}
              </p>
              <p className="mt-1 text-[10.5px] font-semibold leading-snug text-[#141413]">
                {step.title}
              </p>
              <p className="mt-0.5 text-[9px] leading-snug text-[#63605A]">
                {step.detail}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Direct Inquiry Ledger */}
      <div className="border-t border-[#141413]/15 pt-3.5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1.5 text-[10.5px] text-[#2B2A27]">
            <p className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#7B7870]">
              Direct Merchandising Desk
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3 w-3 shrink-0 text-[#595751]" />
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
              </span>

              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3 w-3 shrink-0 text-[#595751]" />
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
              </span>

              <span className="inline-flex items-center gap-1.5">
                <Globe className="h-3 w-3 shrink-0 text-[#595751]" />
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
              </span>
            </div>
          </div>

          <p className="font-serif text-[12px] italic text-[#1D1C1A]">
            “Work your shift, own your style.”
          </p>
        </div>
      </div>
    </div>
  );
};
