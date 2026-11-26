import type {
  CatalogueMetadata,
  FabricSwatchProgram,
  GarmentCategory,
  GarmentGender,
  GarmentItem,
  MediaSlotKey,
} from '../types/catalogue';
import { getFactoryColorLabels, getFactoryFabricColors } from './factoryFabricColors';
import { getExpectedImageFile, PRODUCT_ASSETS } from './productAssets';
import { PRODUCT_STUDIO_ASSETS } from './productStudioAssets';
import { publicAssetUrl } from '../utils/publicAssetUrl';

export const BRAND_LOGO_PATH = publicAssetUrl(
  '/assets/aistudio/image_d4ceae1f.png'
);

export const COVER_ATELIER_ILLUSTRATION =
  publicAssetUrl('/src/assets/images/cover_atelier_plate_1795580913741.jpg');

export const DEFAULT_CATALOGUE_META: CatalogueMetadata = {
  season: 'Dream Tomorrow (DT) — B2B Landscape Catalogue',
  edition: 'CM · OEM · ODM Capability & 43-Style Line Book',
  subtitle:
    'A modular monochrome B2B lookbook and textile specification book for Dream Tomorrow (DT), structured for CM, OEM, and ODM wholesale partners.',
  presentationNote:
    'Visual frames map directly to each official style code and swatchbook fabric roll. Drag and drop local images onto any studio slot to preview live in-browser.',
  contactPhone: '0392 52 68 52',
  contactEmail: 'contact@dtuniforms.com',
  showroomUrl: 'https://www.dtuniforms.com',
};

export const CATEGORIES: {
  name: GarmentCategory;
  numeral: string;
  range: string;
  count: number;
  craftFocus: string;
}[] = [
  {
    name: 'Trousers',
    numeral: 'I',
    range: '01 – 04',
    count: 4,
    craftFocus: 'Structured suiting drape, belt-loop waistbands, and clean pocket lines',
  },
  {
    name: 'Shorts',
    numeral: 'II',
    range: '05 – 09',
    count: 5,
    craftFocus: 'Stretch twill & A82 tailoring with cuffed hems and contoured waistbands',
  },
  {
    name: 'Polos',
    numeral: 'III',
    range: '10 – 23',
    count: 14,
    craftFocus: 'Button & zip plackets across Cotton-Modal, 4-Way Piqué, and Slub 20 knits',
  },
  {
    name: 'Tees & V-Necks',
    numeral: 'IV',
    range: '24 – 40',
    count: 17,
    craftFocus: 'Breathable Combed Cotton, Cotton-Modal, and compact stretch essentials',
  },
  {
    name: 'Skirts',
    numeral: 'V',
    range: '41 – 43',
    count: 3,
    craftFocus: 'A-line skorts and knife-pleated skirts with built-in inner shorts',
  },
];

export const CM_OEM_ODM_PILLARS = [
  {
    index: '01',
    code: 'CM',
    title: 'Cut & Make',
    subtitle: 'Buyer-Supplied Fabrics',
    illustration: publicAssetUrl(
      '/src/assets/images/pillar_cm_illustration_1795580914784.jpg'
    ),
    cropScaleClass: 'scale-[1.13]',
    buyerSupplies: 'Fabric rolls, trims & tech pack',
    dtDelivers: 'Cutting, sewing & inline QC',
    detail: 'Precision cutting and assembly for client-supplied textiles and graded specs.',
  },
  {
    index: '02',
    code: 'OEM',
    title: 'Original Equipment',
    subtitle: 'Full-Package Sourcing',
    illustration: publicAssetUrl(
      '/src/assets/images/pillar_oem_illustration_1795580915075.jpg'
    ),
    cropScaleClass: 'scale-[1.03]',
    buyerSupplies: 'Spec sheet & TCX palette',
    dtDelivers: '15-mill fabric sourcing & bulk',
    detail: 'Full mill sourcing across 15 verified knit & suiting programs to your tech pack.',
  },
  {
    index: '03',
    code: 'ODM',
    title: 'Original Design',
    subtitle: 'Turnkey Branded Blocks',
    illustration: publicAssetUrl(
      '/src/assets/images/pillar_odm_illustration_1795580916550.jpg'
    ),
    cropScaleClass: 'scale-[1.03]',
    buyerSupplies: 'Brand labels & colorway order',
    dtDelivers: '43 Men’s & Women’s styles',
    detail: 'Ready-to-brand Men’s (Nam) and Women’s (Nữ) silhouettes for rapid sampling.',
  },
];

const COLOR_HEX_MAP: Record<string, string> = {
  black: '#111111',
  'black beauty': '#1A1A1C',
  white: '#F8F8F6',
  'bright white': '#FFFFFF',
  'cream white': '#F3EFE6',
  cream: '#EFECE3',
  egret: '#EFECE3',
  'stone grey': '#9C9B96',
  'smoke grey': '#6A6D70',
  'cement grey': '#8B8E8F',
  'salt-and-pepper grey': '#8A8C8E',
  'heather grey': '#A7A9AC',
  'heather grey (melange)': '#9B9E9F',
  'melange grey': '#9B9E9F',
  'charcoal grey': '#4F5459',
  'dark grey': '#4A4D50',
  'light grey': '#C8CACD',
  'slate blue-grey': '#6B7F8E',
  'bean grey': '#7F7B75',
  grey: '#808285',
  fog: '#C6C8C7',
  beige: '#D9CFC0',
  khaki: '#B6A88D',
  'stone khaki': '#B6AA92',
  navy: '#1D2939',
  'dark blue': '#1B2D4F',
  'sky blue': '#9CB7CC',
  'light blue': '#9CB7CC',
  blue: '#2E5B88',
  'sea blue': '#3E7A9E',
  turquoise: '#3BA99C',
  'orchid ice': '#DFD1DE',
  peach: '#E5B096',
  mauve: '#9E7B82',
  'mauve pink': '#C88FA4',
  brick: '#9E4B3B',
  pink: '#E8A5B8',
  'light pink': '#F2CBD4',
  'deep pink': '#D94F7A',
  'dusty rose': '#C48B8E',
  'lotus pink': '#E49EB0',
  'lime pink': '#DF8FA8',
  yellow: '#E6C24C',
  'butter yellow': '#F1DF97',
  purple: '#7E5A8F',
  carrot: '#DF6D3B',
  'cream orange': '#E99D6B',
  'pastel orange': '#F2B27E',
  'deep orange': '#D95D2E',
  'terracotta orange': '#C45B3B',
  brown: '#5C3A2B',
  chocolate: '#5C3A2B',
  green: '#3E7A5A',
  mint: '#7AC4AE',
  'mint green': '#7AC4AE',
  olive: '#5A6145',
  'olive green': '#5B6442',
  'silver sage': '#AEB5AC',
  jade: '#4B8B74',
  b8385: '#6B7F8E',
  b7901: '#7AC4AE',
  bc14: '#4F5459',
};

export function getColorSwatchHex(colorLabel: string): string | null {
  const cleaned = colorLabel
    .replace(/\(.*?\)/g, '')
    .trim()
    .toLowerCase();
  if (cleaned.includes('pending')) return null;
  if (COLOR_HEX_MAP[cleaned]) return COLOR_HEX_MAP[cleaned];
  for (const [key, hex] of Object.entries(COLOR_HEX_MAP)) {
    if (cleaned.includes(key)) return hex;
  }
  return '#BDBDBD';
}

interface RawProductRow {
  rowNum: number;
  gender: GarmentGender;
  genderCode: 'Nam' | 'Nữ';
  productGroupVi: string;
  sku: string;
  mcCode?: string;
  title: string;
  category: GarmentCategory;
  chapterNumeral: string;
  fabricCode: string;
  composition: string;
  weightGsm: string;
  fabricWidth: string;
  stretchFeelNote: string;
  colorCount: number;
  colorways: string[];
  summary: string;
  keyFeatures: string[];
  descriptionBullets?: string[];
  seamFinish?: string;
  pocketConstruction?: string;
  dataFlags?: string[];
}

const COLORS_A82 = getFactoryColorLabels('A82');
const COLORS_A28 = getFactoryColorLabels('A28');
const COLORS_A29 = getFactoryColorLabels('A29');
const COLORS_K03 = getFactoryColorLabels('K03');
const COLORS_MODAL_NAM = getFactoryColorLabels('MODAL NAM');
const COLORS_PIQUE_NAM = getFactoryColorLabels('PQ 4 CHIỀU / PIQUE NAM – 4 WAYS');
const COLORS_SLUB20 = getFactoryColorLabels('SLUB 20');
const COLORS_CM26_NAM = getFactoryColorLabels('CM26 NAM');
const COLORS_CM36 = getFactoryColorLabels('CM36');
const COLORS_CM40 = getFactoryColorLabels('CM40');
const COLORS_FTR76 = getFactoryColorLabels('76');
const COLORS_MODAL_NU = getFactoryColorLabels('MODAL NỮ');
const COLORS_PIQUE_YODY_NU = getFactoryColorLabels('YODY NỮ');
const COLORS_CM26_NU = getFactoryColorLabels('CM26 NỮ');
const COLORS_CM30 = getFactoryColorLabels('CM30');

const RAW_PRODUCTS: RawProductRow[] = [
  // I. TROUSERS (01 – 04)
  {
    rowNum: 1,
    gender: 'Men',
    genderCode: 'Nam',
    productGroupVi: 'Quần Dài Nam',
    sku: 'MLPA82',
    title: "Men's Straight-Leg Trouser Pants",
    category: 'Trousers',
    chapterNumeral: 'I',
    fabricCode: 'A82',
    composition: '95% Rayon Polyester, 5% Spandex',
    weightGsm: '330 GSM',
    fabricWidth: '152 cm',
    stretchFeelNote: 'Dense, smooth-surface 330 GSM suiting with crisp recovery and light stretch.',
    colorCount: COLORS_A82.length,
    colorways: COLORS_A82,
    summary:
      'Classic relaxed straight-leg trouser in dense, wrinkle-resistant 330 GSM Rayon-Polyester suiting with crisp drape.',
    keyFeatures: [
      '95% Rayon Polyester, 5% Spandex',
      'Relaxed full-length straight-leg cut',
      'Belt-loop waistband with button & zip fly',
      '2 piped side slant pockets + 2 button-through back pockets',
    ],
    seamFinish: 'Belt-loop waistband with button & zip fly; full-length straight leg',
    pocketConstruction: '4 pockets: 2 piped side slant pockets & 2 button-through back pockets',
  },
  {
    rowNum: 2,
    gender: 'Men',
    genderCode: 'Nam',
    productGroupVi: 'Quần Dài Nam',
    sku: 'MLPA28',
    title: "Men's Straight-Leg Trouser Pants",
    category: 'Trousers',
    chapterNumeral: 'I',
    fabricCode: 'A28',
    composition: '75% Polyester, 20% Rayon, 5% Spandex',
    weightGsm: '245–250 GSM',
    fabricWidth: '150 cm (1M50)',
    stretchFeelNote: 'Breathable mid-weight suiting engineered for daily crease resistance and mobility.',
    colorCount: COLORS_A28.length,
    colorways: COLORS_A28,
    summary:
      'Crisp office straight-leg trouser in breathable 75/20/5 Poly-Rayon-Spandex suiting that holds its line all day.',
    keyFeatures: [
      '75% Polyester, 20% Rayon, 5% Spandex',
      'Relaxed full-length straight-leg cut',
      'Belt-loop waistband with button & zip fly',
      '2 side slant pockets + 2 button-through back pockets',
    ],
    seamFinish: 'Belt-loop waistband with button & zip fly; full-length straight leg',
    pocketConstruction: '4 pockets: 2 side slant pockets & 2 button-through back pockets',
  },
  {
    rowNum: 3,
    gender: 'Men',
    genderCode: 'Nam',
    productGroupVi: 'Quần Dài Nam',
    sku: 'MLPA29',
    title: "Men's Straight-Leg Trouser Pants",
    category: 'Trousers',
    chapterNumeral: 'I',
    fabricCode: 'A29',
    composition: '75% Polyester, 20% Rayon, 5% Spandex',
    weightGsm: '330–350 GSM',
    fabricWidth: '150 cm (1M50)',
    stretchFeelNote: 'Thick heavyweight suiting for cooler seasons with crisp vertical leg retention.',
    colorCount: COLORS_A29.length,
    colorways: COLORS_A29,
    summary:
      'Structured heavyweight office trouser featuring softly curved S-shaped front pockets and sharp seasonal drape.',
    keyFeatures: [
      '75% Polyester, 20% Rayon, 5% Spandex',
      'Relaxed full-length straight-leg cut',
      'Belt-loop waistband with button & zip fly',
      '2 S-shaped side pockets + 2 back pockets',
    ],
    seamFinish: 'Belt-loop waistband with button & zip fly; heavyweight winter drape',
    pocketConstruction: '4 pockets: 2 curved S-shaped side pockets & 2 back pockets',
  },
  {
    rowNum: 23,
    gender: 'Women',
    genderCode: 'Nữ',
    productGroupVi: 'Quần Dài Nữ',
    sku: 'WBL0001',
    title: "Women's Slightly Flared Trouser Pants",
    category: 'Trousers',
    chapterNumeral: 'I',
    fabricCode: '76',
    composition: '76% Polyester, 18% Rayon, 6% Spandex',
    weightGsm: '203 GSM',
    fabricWidth: '57/58"',
    stretchFeelNote: 'Mid-weight fluid suiting that resists wrinkles while draping cleanly in motion.',
    colorCount: COLORS_FTR76.length,
    colorways: COLORS_FTR76,
    summary:
      'Leg-lengthening slightly flared office trouser in fluid Poly-Rayon-Spandex finished with wide cuffed hems.',
    keyFeatures: [
      '76% Polyester, 18% Rayon, 6% Spandex',
      'Slightly flared straight-leg silhouette',
      'Medium waistband with button & zip fly',
      'Wide cuffed hem + 3 pockets (2 slant front, 1 right back)',
    ],
    seamFinish: 'Medium waistband, button & zip fly, statement wide cuffed hem',
    pocketConstruction: '3 pockets: 2 side slant pockets & 1 right back pocket',
  },

  // II. SHORTS (05 – 09)
  {
    rowNum: 4,
    gender: 'Men',
    genderCode: 'Nam',
    productGroupVi: 'Quần Short Khaki Nam',
    sku: 'MSPA28',
    title: "Men's Straight-Leg Shorts Pant",
    category: 'Shorts',
    chapterNumeral: 'II',
    fabricCode: 'A28',
    composition: '75% Polyester, 20% Rayon, 5% Spandex',
    weightGsm: '245–250 GSM',
    fabricWidth: '150 cm (1M50)',
    stretchFeelNote: 'Soft, matte suiting twill matching the A28 trouser line with cool stretch recovery.',
    colorCount: COLORS_A28.length,
    colorways: COLORS_A28,
    summary:
      'Polished straight-leg shorts in wrinkle-resistant A28 suiting blend for effortless everyday wear and travel.',
    keyFeatures: [
      '75% Polyester, 20% Rayon, 5% Spandex',
      'Clean straight-leg cut above the knee',
      'Standard belt-loop waist with button & zip fly',
      '4 pockets (2 side slant pockets, 2 back pockets)',
    ],
    seamFinish: 'Standard belt-loop waistband with button & zip fly',
    pocketConstruction: '4 pockets: 2 side slant pockets & 2 back pockets',
  },
  {
    rowNum: 5,
    gender: 'Men',
    genderCode: 'Nam',
    productGroupVi: 'Quần Short Nam',
    sku: 'MSPK03',
    title: "Men's Straight-Leg Khaki Shorts Pant",
    category: 'Shorts',
    chapterNumeral: 'II',
    fabricCode: 'K03',
    composition: '95% Cotton, 5% Spandex',
    weightGsm: '240 GSM',
    fabricWidth: '150 cm (1M50)',
    stretchFeelNote: 'Thick, breathable 95% cotton khaki twill with responsive 5% stretch comfort.',
    colorCount: COLORS_K03.length,
    colorways: COLORS_K03,
    summary:
      'Rugged, breathable straight-leg khaki shorts woven from stretch cotton twill for outdoor and daily utility.',
    keyFeatures: [
      '95% Cotton, 5% Spandex',
      'Durable straight-leg khaki silhouette',
      'Standard belt-loop waist with button & zip fly',
      '4 pockets (2 side slant pockets, 2 back pockets)',
    ],
    seamFinish: 'Standard belt-loop waistband with button & zip fly',
    pocketConstruction: '4 pockets: 2 side slant pockets & 2 back pockets',
  },
  {
    rowNum: 24,
    gender: 'Women',
    genderCode: 'Nữ',
    productGroupVi: 'Quần Short Nữ',
    sku: 'WBS0001-A82',
    mcCode: 'WBS0001',
    title: "Women's High-Waisted Cuffed Shorts",
    category: 'Shorts',
    chapterNumeral: 'II',
    fabricCode: 'A82',
    composition: '95% Rayon Polyester, 5% Spandex',
    weightGsm: '330 GSM',
    fabricWidth: '152 cm',
    stretchFeelNote: 'Smooth, structured 330 GSM suiting resisting creases with gentle comfort stretch.',
    colorCount: COLORS_A82.length,
    colorways: COLORS_A82,
    summary:
      'High-waisted tailored shorts in crisp A82 cloth featuring clean center-front pintuck topstitching and medium cuffed hems.',
    keyFeatures: [
      '95% Rayon Polyester, 5% Spandex',
      'High-waisted flat-front straight fit',
      'Concealed back zip closure',
      'Center-front pintuck topstitching & medium cuffed hem',
    ],
    seamFinish: 'Flat-front high waist with concealed back zip & medium cuffed hems',
    pocketConstruction: 'Clean pocketless front with center-front pintuck seam line',
  },
  {
    rowNum: 25,
    gender: 'Women',
    genderCode: 'Nữ',
    productGroupVi: 'Quần Short Nữ',
    sku: 'WBS0002-A82',
    title: "Women's A-Line Shorts",
    category: 'Shorts',
    chapterNumeral: 'II',
    fabricCode: 'A82',
    composition: '95% Rayon Polyester, 5% Spandex',
    weightGsm: '330 GSM',
    fabricWidth: '152 cm',
    stretchFeelNote: 'Structured 330 GSM suiting holding a crisp, crease-resistant A-line flare.',
    colorCount: COLORS_A82.length,
    colorways: COLORS_A82,
    summary:
      'Waist-defining high-rise A-line shorts with a wide contoured waistband, concealed back zip, and short side hem slits.',
    keyFeatures: [
      '95% Rayon Polyester, 5% Spandex',
      'High-waisted flared A-line silhouette',
      'Wide contoured flat-front waistband',
      'Concealed back zip & short side hem slits',
    ],
    seamFinish: 'Wide high-rise waistband, back zip closure & short side hem slits',
    pocketConstruction: 'Sleek flat-front A-line panelling with clean thigh flare',
  },
  {
    rowNum: 26,
    gender: 'Women',
    genderCode: 'Nữ',
    productGroupVi: 'Quần Short Nữ',
    sku: 'WBS0003-A82',
    title: "Women's Elastic-Back A-Line Shorts",
    category: 'Shorts',
    chapterNumeral: 'II',
    fabricCode: 'A82',
    composition: '95% Rayon Polyester, 5% Spandex',
    weightGsm: '330 GSM',
    fabricWidth: '152 cm',
    stretchFeelNote: 'Smooth 330 GSM woven drape pairing structured A-line form with easy care.',
    colorCount: COLORS_A82.length,
    colorways: COLORS_A82,
    summary:
      'High-waisted A-line shorts pairing a tailored button-and-zip trouser front with an adaptable elastic back waistband.',
    keyFeatures: [
      '95% Rayon Polyester, 5% Spandex',
      'High-waisted A-line silhouette',
      'Wide waistband with elasticized back',
      'Front button and zip fly closure',
    ],
    seamFinish: 'Tailored flat-front waistband with elastic back channel & front fly',
    pocketConstruction: 'Slanted side-seam pockets integrated cleanly into the A-line cut',
  },

  // III. POLOS (10 – 23)
  {
    rowNum: 6,
    gender: 'Men',
    genderCode: 'Nam',
    productGroupVi: 'Áo Thun Polo Nam',
    sku: 'MPOLO-MD1',
    title: "Men's 3-Button Polo Shirt",
    category: 'Polos',
    chapterNumeral: 'III',
    fabricCode: 'MODAL NAM',
    composition: '94% Cotton Modal, 6% Spandex',
    weightGsm: '190–200 (195) GSM',
    fabricWidth: '175–180 cm',
    stretchFeelNote: 'Smooth, cool-to-the-touch cotton-modal knit with wrinkle-resistant 4-way stretch.',
    colorCount: COLORS_MODAL_NAM.length,
    colorways: COLORS_MODAL_NAM,
    summary:
      'Smart-casual 3-button polo in cooling cotton-modal stretch jersey, finished with elasticized cuffs and 3 cm side vents.',
    keyFeatures: [
      '94% Cotton, 6% Spandex (Swatch book: Cotton Modal)',
      'Polo collar · 13 cm 3-button placket',
      'Short sleeves with elasticized cuffs',
      'Straight fit with 3 cm side vents',
    ],
    seamFinish: 'Classic polo collar, elasticized cuffs & 3 cm side vents',
    pocketConstruction: '13 cm 3-button front placket; clean torso',
    dataFlags: ['I02: Swatch book states 94% Cotton Modal, 6% Spandex; product text states 94% Cotton, 6% Spandex.'],
  },
  {
    rowNum: 7,
    gender: 'Men',
    genderCode: 'Nam',
    productGroupVi: 'Áo Thun Polo Nam',
    sku: 'MPOLO-MD2',
    title: "Men's Faux-Pocket Polo Shirt",
    category: 'Polos',
    chapterNumeral: 'III',
    fabricCode: 'MODAL NAM',
    composition: '94% Cotton Modal, 6% Spandex',
    weightGsm: '190–200 (195) GSM',
    fabricWidth: '175–180 cm',
    stretchFeelNote: 'Silky cotton-modal blend with breathable moisture absorption and shape stability.',
    colorCount: COLORS_MODAL_NAM.length,
    colorways: COLORS_MODAL_NAM,
    summary:
      'Refined straight-fit polo featuring a 13 cm 2-button placket, elasticized cuffs, and a decorative chest faux welt pocket.',
    keyFeatures: [
      '94% Cotton, 6% Spandex (Swatch book: Cotton Modal)',
      'Polo collar · 13 cm 2-button placket',
      '1 faux chest pocket accent',
      'Elasticized short sleeves & 3 cm side vents',
    ],
    seamFinish: 'Polo collar, elasticized cuffs & 3 cm side vents',
    pocketConstruction: '13 cm 2-button placket + 1 decorative faux chest pocket',
    dataFlags: ['I02: Swatch book states 94% Cotton Modal, 6% Spandex; product text states 94% Cotton, 6% Spandex.'],
  },
  {
    rowNum: 8,
    gender: 'Men',
    genderCode: 'Nam',
    productGroupVi: 'Áo Thun Polo Nam',
    sku: 'MPOLO-MD3',
    mcCode: 'MTPZ001',
    title: "Men's Shiny Zip Polo Shirt",
    category: 'Polos',
    chapterNumeral: 'III',
    fabricCode: 'MODAL NAM',
    composition: '94% Cotton Modal, 6% Spandex',
    weightGsm: '190–200 (195) GSM',
    fabricWidth: '175–180 cm',
    stretchFeelNote: 'Ultra-soft, cooling cotton-modal knit with responsive 4-way stretch.',
    colorCount: COLORS_MODAL_NAM.length,
    colorways: COLORS_MODAL_NAM,
    summary:
      'Modern polo in silky stretch modal knit swapping buttons for a smooth 13 cm mirror-finish metallic zipper placket.',
    keyFeatures: [
      '94% Cotton, 6% Spandex (Swatch book: Cotton Modal)',
      'Polo collar · 13 cm mirror-finish zipper placket',
      'Short sleeves with elasticized cuffs',
      'Straight fit with 3 cm side vents',
    ],
    seamFinish: 'Polo collar, elasticized cuffs & 3 cm side vents',
    pocketConstruction: '13 cm mirror-finish metallic zipper placket',
    dataFlags: ['I02: Swatch book states 94% Cotton Modal, 6% Spandex; product text states 94% Cotton, 6% Spandex.'],
  },
  {
    rowNum: 9,
    gender: 'Men',
    genderCode: 'Nam',
    productGroupVi: 'Áo Thun Polo Nam',
    sku: 'MPOLO-MD4',
    title: "Men's Concealed-Zip Polo Shirt",
    category: 'Polos',
    chapterNumeral: 'III',
    fabricCode: 'MODAL NAM',
    composition: '94% Cotton Modal, 6% Spandex',
    weightGsm: '190–200 (195) GSM',
    fabricWidth: '175–180 cm',
    stretchFeelNote: 'Airy, smooth cotton-modal fabric engineered for lasting color and shape retention.',
    colorCount: COLORS_MODAL_NAM.length,
    colorways: COLORS_MODAL_NAM,
    summary:
      'Minimalist tailored polo crafted with a flat, fabric-covered 13 cm concealed zipper placket and elasticized cuffs.',
    keyFeatures: [
      '94% Cotton, 6% Spandex (Swatch book: Cotton Modal)',
      'Polo collar · 13 cm concealed zipper placket',
      'Short sleeves with elasticized cuffs',
      'Straight fit with 3 cm side vents',
    ],
    seamFinish: 'Polo collar, elasticized cuffs & 3 cm side vents',
    pocketConstruction: 'Flat 13 cm fabric-concealed zipper placket',
    dataFlags: ['I02: Swatch book states 94% Cotton Modal, 6% Spandex; product text states 94% Cotton, 6% Spandex.'],
  },
  {
    rowNum: 10,
    gender: 'Men',
    genderCode: 'Nam',
    productGroupVi: 'Áo Thun Polo Nam',
    sku: 'MPOLO-PQ1',
    mcCode: 'MTP0001',
    title: "Men's 2-Button Polo Shirt",
    category: 'Polos',
    chapterNumeral: 'III',
    fabricCode: 'PQ 4 CHIỀU / PIQUE NAM – 4 WAYS',
    composition: '95% Cotton, 5% Spandex',
    weightGsm: '190–200 GSM',
    fabricWidth: '185–195 cm',
    stretchFeelNote: 'Structured, breathable piqué weave with soft hand-feel and 4-way stretch mobility.',
    colorCount: COLORS_PIQUE_NAM.length,
    colorways: COLORS_PIQUE_NAM,
    summary:
      'Structured 2-button polo in breathable 4-way stretch cotton piqué with elasticized cuffs and 3 cm side vents.',
    keyFeatures: [
      '95% Cotton, 5% Spandex · 4-Way Piqué',
      'Polo collar · 13 cm 2-button placket',
      'Short sleeves with elasticized cuffs',
      'Straight fit with 3 cm side vents',
    ],
    seamFinish: 'Structured polo collar, elasticized cuffs & 3 cm side vents',
    pocketConstruction: '13 cm 2-button placket; clean pocketless chest',
  },
  {
    rowNum: 11,
    gender: 'Men',
    genderCode: 'Nam',
    productGroupVi: 'Áo Thun Polo Nam',
    sku: 'MPOLO-PQ2',
    title: "Men's 3-Button Polo Shirt",
    category: 'Polos',
    chapterNumeral: 'III',
    fabricCode: 'PQ 4 CHIỀU / PIQUE NAM – 4 WAYS',
    composition: '95% Cotton, 5% Spandex',
    weightGsm: '190–200 GSM',
    fabricWidth: '185–195 cm',
    stretchFeelNote: 'Airy, structured honeycomb cotton piqué with 4-way stretch and minimal pilling.',
    colorCount: COLORS_PIQUE_NAM.length,
    colorways: COLORS_PIQUE_NAM,
    summary:
      'Masculine 4-way piqué polo distinguished by an elongated 15 cm 3-button placket, ribbed cuffs, and 2 cm side vents.',
    keyFeatures: [
      '95% Cotton, 5% Spandex · 4-Way Piqué',
      'Polo collar · 15 cm 3-button placket',
      'Short sleeves with ribbed cuffs',
      'Straight fit with 2 cm side vents',
    ],
    seamFinish: 'Polo collar, fine ribbed cuffs & 2 cm side vents',
    pocketConstruction: '15 cm elongated 3-button placket',
  },
  {
    rowNum: 12,
    gender: 'Men',
    genderCode: 'Nam',
    productGroupVi: 'Áo Thun Polo Nam',
    sku: 'MPOLO-PQ3',
    mcCode: 'MTPZ001',
    title: "Men's Mirror-Zip Polo Shirt",
    category: 'Polos',
    chapterNumeral: 'III',
    fabricCode: 'PQ 4 CHIỀU / PIQUE NAM – 4 WAYS',
    composition: '95% Cotton, 5% Spandex',
    weightGsm: '190–200 GSM',
    fabricWidth: '185–195 cm',
    stretchFeelNote: 'Crisp cotton-spandex micro-piqué holding structured collar geometry wash after wash.',
    colorCount: COLORS_PIQUE_NAM.length,
    colorways: COLORS_PIQUE_NAM,
    summary:
      'Polished yet dynamic 4-way piqué polo accented with a 13 cm mirror-finish metallic zipper and ribbed cuffs.',
    keyFeatures: [
      '95% Cotton, 5% Spandex · 4-Way Piqué',
      'Polo collar · 13 cm mirror-finish zipper',
      'Short sleeves with ribbed cuffs',
      'Straight fit with 2 cm side vents',
    ],
    seamFinish: 'Polo collar, ribbed cuffs & 2 cm side vents',
    pocketConstruction: '13 cm mirror-finish exposed metallic zipper placket',
  },
  {
    rowNum: 13,
    gender: 'Men',
    genderCode: 'Nam',
    productGroupVi: 'Áo Thun Polo Nam',
    sku: 'MPOLO-PQ4',
    title: "Men's Concealed-Zip Polo Shirt",
    category: 'Polos',
    chapterNumeral: 'III',
    fabricCode: 'PQ 4 CHIỀU / PIQUE NAM – 4 WAYS',
    composition: '95% Cotton, 5% Spandex',
    weightGsm: '190–200 GSM',
    fabricWidth: '185–195 cm',
    stretchFeelNote: 'Breathable 4-way stretch cotton piqué with firm anti-sag silhouette structure.',
    colorCount: COLORS_PIQUE_NAM.length,
    colorways: COLORS_PIQUE_NAM,
    summary:
      'Dressy minimalist 4-way piqué polo combining a clean 13 cm concealed zipper placket with ribbed sleeve cuffs.',
    keyFeatures: [
      '95% Cotton, 5% Spandex · 4-Way Piqué',
      'Polo collar · 13 cm concealed zipper placket',
      'Short sleeves with ribbed cuffs',
      'Straight fit with 2 cm side vents',
    ],
    seamFinish: 'Polo collar, ribbed cuffs & 2 cm side vents',
    pocketConstruction: '13 cm concealed zipper placket under fabric flap',
  },
  {
    rowNum: 14,
    gender: 'Men',
    genderCode: 'Nam',
    productGroupVi: 'Áo Thun Polo Nam',
    sku: 'MPOLO-SL201',
    title: "Men's 100% Cotton Polo Shirt",
    category: 'Polos',
    chapterNumeral: 'III',
    fabricCode: 'SLUB 20',
    composition: '100% Cotton',
    weightGsm: '185–190 GSM',
    fabricWidth: '208 cm (2.08 m)',
    stretchFeelNote: 'Organic 100% cotton slub yarn texture offering dry breathability and structured drape.',
    colorCount: COLORS_SLUB20.length,
    colorways: COLORS_SLUB20,
    summary:
      'Naturally breathable 100% cotton slub polo tailored in a clean straight fit with a 13 cm 3-button placket.',
    keyFeatures: [
      '100% Cotton · Slub 20 knit',
      'Polo collar · 13 cm 3-button placket',
      'Open clean-hemmed short sleeves',
      'Straight fit with 2 cm side vents',
    ],
    seamFinish: 'Polo collar, open short sleeves & 2 cm side vents',
    pocketConstruction: '13 cm 3-button placket on textured cotton slub body',
  },
  {
    rowNum: 15,
    gender: 'Men',
    genderCode: 'Nam',
    productGroupVi: 'Áo Thun Polo Nam',
    sku: 'MPOLO-SL203',
    title: "Men's 100% Cotton Zip Polo Shirt",
    category: 'Polos',
    chapterNumeral: 'III',
    fabricCode: 'SLUB 20',
    composition: '100% Cotton',
    weightGsm: '185–190 GSM',
    fabricWidth: '208 cm (2.08 m)',
    stretchFeelNote: '100% pure cotton slub texture with crisp hand-feel and natural moisture absorption.',
    colorCount: COLORS_SLUB20.length,
    colorways: COLORS_SLUB20,
    summary:
      'Contemporary 100% cotton slub polo featuring a light-catching 13 cm mirror-finish zipper and 3 cm side vents.',
    keyFeatures: [
      '100% Cotton · Slub 20 knit',
      'Polo collar · 13 cm mirror-finish zipper',
      'Open short sleeves',
      'Straight fit with 3 cm side vents',
    ],
    seamFinish: 'Polo collar, open short sleeves & 3 cm side vents',
    pocketConstruction: '13 cm mirror-finish exposed zipper placket',
  },
  {
    rowNum: 27,
    gender: 'Women',
    genderCode: 'Nữ',
    productGroupVi: 'Áo Thun Polo Nữ',
    sku: 'WPOLO-MD1',
    title: "Women's Slim-Fit Zip Polo Shirt",
    category: 'Polos',
    chapterNumeral: 'III',
    fabricCode: 'MODAL NAM',
    composition: '94% Cotton Modal, 6% Spandex',
    weightGsm: '190–200 (195) GSM',
    fabricWidth: '175–180 cm',
    stretchFeelNote: 'Silky, cool-to-the-touch stretch cotton-modal jersey draping smoothly close to the body.',
    colorCount: COLORS_MODAL_NAM.length,
    colorways: COLORS_MODAL_NAM,
    summary:
      'Sporty, feminine slim-fit polo in stretch cotton-modal jersey featuring sculpted 3/4 sleeves and a 21 cm metal zipper.',
    keyFeatures: [
      '94% Cotton, 6% Spandex (Swatch book: MODAL-M)',
      'Polo collar · 21 cm exposed metal zipper',
      'Three-quarter sleeves',
      'Contoured slim fit',
    ],
    seamFinish: 'Slim-fit 3/4-sleeve cut with spread polo collar',
    pocketConstruction: '21 cm deep exposed metal zipper placket',
    dataFlags: [
      'I01: Synced to MODAL NAM 8-color lineup per official sheet (confirm vs earlier Modal Nữ assignment).',
      'I02: Swatch book states 94% Cotton Modal, 6% Spandex; product text states 94% Cotton, 6% Spandex.',
    ],
  },
  {
    rowNum: 28,
    gender: 'Women',
    genderCode: 'Nữ',
    productGroupVi: 'Áo Thun Polo Nữ',
    sku: 'WPOLO-MD2',
    title: "Women's 5-Button Polo Shirt",
    category: 'Polos',
    chapterNumeral: 'III',
    fabricCode: 'MODAL NỮ',
    composition: '94% Cotton Modal, 6% Spandex',
    weightGsm: '190–200 (195) GSM',
    fabricWidth: '175–180 cm',
    stretchFeelNote: 'Cooling, silky-soft Cotton Modal blend with breathable stretch and supple drape.',
    colorCount: COLORS_MODAL_NU.length,
    colorways: COLORS_MODAL_NU,
    summary:
      'Soft feminine polo in 94% Cotton Modal blend tailored with an elongated 16 cm 5-button placket and cinched waist.',
    keyFeatures: [
      '94% Cotton Modal, 6% Spandex',
      'Polo collar · 16 cm 5-button placket',
      'Short sleeves',
      'Regular fit with cinched waist & 5 cm side vents',
    ],
    seamFinish: 'Cinched-waist regular fit, short sleeves & 5 cm side vents',
    pocketConstruction: '16 cm narrow 5-button front placket',
  },
  {
    rowNum: 29,
    gender: 'Women',
    genderCode: 'Nữ',
    productGroupVi: 'Áo Thun Polo Nữ',
    sku: 'WPOLO-YD1',
    title: "Women's Slim-Fit 5-Button Polo Shirt",
    category: 'Polos',
    chapterNumeral: 'III',
    fabricCode: 'YODY NỮ',
    composition: '50% Polyester, 45% Cotton, 5% Spandex',
    weightGsm: '190–200 GSM',
    fabricWidth: '180–185 cm',
    stretchFeelNote: 'Crisp Poly-Cotton-Spandex performance piqué with colorfast, quick-dry resilience.',
    colorCount: COLORS_PIQUE_YODY_NU.length,
    colorways: COLORS_PIQUE_YODY_NU,
    summary:
      'Contoured slim-fit performance piqué polo with an elongated 20 cm 5-button placket and 5 cm side vents.',
    keyFeatures: [
      '50% Polyester, 45% Cotton, 5% Spandex',
      'Polo collar · 20 cm 5-button placket',
      'Short sleeves',
      'Slim fit with 5 cm deep side vents',
    ],
    seamFinish: 'Slim-fit piqué cut with 5 cm deep side vents',
    pocketConstruction: 'Elongated 20 cm 5-button narrow placket',
  },
  {
    rowNum: 30,
    gender: 'Women',
    genderCode: 'Nữ',
    productGroupVi: 'Áo Thun Polo Nữ',
    sku: 'WPOLO-YD2',
    title: "Women's Contrast-Trim Polo Shirt",
    category: 'Polos',
    chapterNumeral: 'III',
    fabricCode: 'YODY NỮ',
    composition: '50% Polyester, 45% Cotton, 5% Spandex',
    weightGsm: '190–200 GSM',
    fabricWidth: '180–185 cm',
    stretchFeelNote: 'Wrinkle-resistant Poly-Cotton-Spandex piqué retaining vivid color and structure.',
    colorCount: COLORS_PIQUE_YODY_NU.length,
    colorways: COLORS_PIQUE_YODY_NU,
    summary:
      'Tailored contrast-trim polo framed with crisp white inner placket piping, 3 decorative buttons, and a cinched waist.',
    keyFeatures: [
      '50% Polyester, 45% Cotton, 5% Spandex',
      'Polo collar · 18 cm placket with contrast inner trim',
      '3 decorative buttons · Short sleeves',
      'Regular cinched-waist fit & 5 cm side vents',
    ],
    seamFinish: 'Regular cinched-waist fit, contrast inner placket & 5 cm side vents',
    pocketConstruction: '18 cm contrast-trimmed placket with 3 decorative buttons',
  },

  // IV. TEES & V-NECKS (24 – 40)
  {
    rowNum: 16,
    gender: 'Men',
    genderCode: 'Nam',
    productGroupVi: 'Áo Thun Tshirt Nam',
    sku: 'MTSHIRT-MD1',
    title: "Men's Straight-Fit Crew Neck T-Shirt",
    category: 'Tees & V-Necks',
    chapterNumeral: 'IV',
    fabricCode: 'MODAL NAM',
    composition: '94% Cotton Modal, 6% Spandex',
    weightGsm: '190–200 (195) GSM',
    fabricWidth: '175–180 cm',
    stretchFeelNote: 'Smooth, breathable stretch knit with moisture-wicking modal softness.',
    colorCount: COLORS_MODAL_NAM.length,
    colorways: COLORS_MODAL_NAM,
    summary:
      'Minimalist straight-fit crew neck tee in smooth, moisture-wicking stretch jersey built for shape-retaining everyday wear.',
    keyFeatures: [
      '94% Cotton, 6% Spandex (Swatch book: Cotton Modal)',
      'Durable shape-retaining ribbed crew neck',
      'Straight fit',
      'Mid-bicep short sleeves',
    ],
    seamFinish: 'Durable ribbed crew neck & twin-needle short sleeves',
    pocketConstruction: 'Clean pocketless chest',
    dataFlags: ['I02: Swatch book states 94% Cotton Modal, 6% Spandex; product text states 94% Cotton, 6% Spandex.'],
  },
  {
    rowNum: 17,
    gender: 'Men',
    genderCode: 'Nam',
    productGroupVi: 'Áo Thun Tshirt Nam',
    sku: 'MTSHIRT-MD2',
    title: "Men's Button-Placket Crew Neck T-Shirt",
    category: 'Tees & V-Necks',
    chapterNumeral: 'IV',
    fabricCode: 'MODAL NAM',
    composition: '94% Cotton Modal, 6% Spandex',
    weightGsm: '190–200 (195) GSM',
    fabricWidth: '175–180 cm',
    stretchFeelNote: 'Silky-soft, cool cotton-modal knit with responsive stretch recovery.',
    colorCount: COLORS_MODAL_NAM.length,
    colorways: COLORS_MODAL_NAM,
    summary:
      'Crew neck Henley tee elevated with a 13 cm 3-button front placket in cool, elastic stretch cotton-modal jersey.',
    keyFeatures: [
      '94% Cotton, 6% Spandex (Swatch book: Cotton Modal)',
      'Ribbed crew neck · 13 cm 3-button placket',
      'Roomy straight fit',
      'Short sleeves',
    ],
    seamFinish: 'Ribbed crew neck with 13 cm 3-button front placket',
    pocketConstruction: '13 cm 3-button Henley placket; clean torso',
    dataFlags: ['I02: Swatch book states 94% Cotton Modal, 6% Spandex; product text states 94% Cotton, 6% Spandex.'],
  },
  {
    rowNum: 18,
    gender: 'Men',
    genderCode: 'Nam',
    productGroupVi: 'Áo Thun Tshirt Nam',
    sku: 'MTSHIRT-MD3',
    title: "Men's Button-Neck Pocket T-Shirt",
    category: 'Tees & V-Necks',
    chapterNumeral: 'IV',
    fabricCode: 'MODAL NAM',
    composition: '94% Cotton Modal, 6% Spandex',
    weightGsm: '190–200 (195) GSM',
    fabricWidth: '175–180 cm',
    stretchFeelNote: 'Breathable 4-way stretch modal blend resisting creases throughout the day.',
    colorCount: COLORS_MODAL_NAM.length,
    colorways: COLORS_MODAL_NAM,
    summary:
      'Utility-inspired crew tee pairing a 13 cm 3-button neckline and functional chest patch pocket with 4-way stretch comfort.',
    keyFeatures: [
      '94% Cotton, 6% Spandex (Swatch book: Cotton Modal)',
      'Ribbed crew neck · 13 cm 3-button placket',
      '1 functional front chest pocket',
      'Straight fit · Short sleeves',
    ],
    seamFinish: 'Ribbed crew neck, 13 cm 3-button placket & straight body',
    pocketConstruction: '1 front chest patch pocket + 3-button Henley neck',
    dataFlags: ['I02: Swatch book states 94% Cotton Modal, 6% Spandex; product text states 94% Cotton, 6% Spandex.'],
  },
  {
    rowNum: 19,
    gender: 'Men',
    genderCode: 'Nam',
    productGroupVi: 'Áo Thun Tshirt Nam',
    sku: 'MTSHIRT-CM26',
    mcCode: 'MTT0003',
    title: "Men's 100% Cotton Crew Neck T-Shirt",
    category: 'Tees & V-Necks',
    chapterNumeral: 'IV',
    fabricCode: 'CM26 NAM',
    composition: '100% Cotton',
    weightGsm: '195–200 GSM',
    fabricWidth: '175–180 cm',
    stretchFeelNote: '100% combed 26s pure cotton delivering crisp structure and high moisture absorption.',
    colorCount: COLORS_CM26_NAM.length,
    colorways: COLORS_CM26_NAM,
    summary:
      'Durable 100% combed cotton crew tee balancing structured drape, breathability, and natural skin comfort.',
    keyFeatures: [
      '100% Cotton · Combed 26s',
      'Classic ribbed crew neck',
      'Straight fit',
      'Short sleeves',
    ],
    seamFinish: 'Ribbed crew neck & structured straight-fit seams',
    pocketConstruction: 'Clean pocketless chest',
  },
  {
    rowNum: 20,
    gender: 'Men',
    genderCode: 'Nam',
    productGroupVi: 'Áo Thun Tshirt Nam',
    sku: 'MVNECK-CM26',
    title: "Men's V-Neck T-Shirt",
    category: 'Tees & V-Necks',
    chapterNumeral: 'IV',
    fabricCode: 'CM26 NAM',
    composition: '100% Cotton',
    weightGsm: '195–200 GSM',
    fabricWidth: '175–180 cm',
    stretchFeelNote: 'Smooth, colorfast 100% combed cotton knit engineered for cool moisture absorption.',
    colorCount: COLORS_CM26_NAM.length,
    colorways: COLORS_CM26_NAM,
    summary:
      'Sleek straight-fit tee in breathable 100% combed cotton finished with a balanced, modest mitered V-neckline.',
    keyFeatures: [
      '100% Cotton · Combed 26s',
      'Modest ribbed V-neck',
      'Straight fit',
      'Short sleeves',
    ],
    seamFinish: 'Mitered V-neck rib binding & straight-fit seams',
    pocketConstruction: 'Clean pocketless chest',
  },
  {
    rowNum: 21,
    gender: 'Men',
    genderCode: 'Nam',
    productGroupVi: 'Áo Thun Tshirt Nam',
    sku: 'MTSHIRT-CM36',
    title: "Men's Crew Neck T-Shirt",
    category: 'Tees & V-Necks',
    chapterNumeral: 'IV',
    fabricCode: 'CM36',
    composition: '95% Cotton, 5% Spandex',
    weightGsm: '220 GSM',
    fabricWidth: '177 cm',
    stretchFeelNote: 'Substantial 220 GSM cotton-spandex jersey combining crisp structure with flexible stretch.',
    colorCount: COLORS_CM36.length,
    colorways: COLORS_CM36,
    summary:
      'Mid-heavyweight 220 GSM stretch cotton crew tee offering reliable shape retention for solo or layered styling.',
    keyFeatures: [
      '95% Cotton, 5% Spandex · 220 GSM',
      'Sturdy ribbed crew neck',
      'Straight fit',
      'Short sleeves',
    ],
    seamFinish: 'Substantial ribbed crew neck & twin-needle hems',
    pocketConstruction: 'Clean pocketless chest',
  },
  {
    rowNum: 22,
    gender: 'Men',
    genderCode: 'Nam',
    productGroupVi: 'Áo Thun Tshirt Nam',
    sku: 'MTSHIRT-CM40',
    title: "Men's Crew Neck T-Shirt",
    category: 'Tees & V-Necks',
    chapterNumeral: 'IV',
    fabricCode: 'CM40',
    composition: '100% Cotton',
    weightGsm: '125–130 GSM',
    fabricWidth: '155 cm',
    stretchFeelNote: 'Featherweight 40s pure cotton single jersey with ultra-soft, fast-absorbing breathability.',
    colorCount: COLORS_CM40.length,
    colorways: COLORS_CM40,
    summary:
      'Ultra-lightweight 100% combed 40s cotton tee engineered for maximum airflow and relaxed warm-weather movement.',
    keyFeatures: [
      '100% Cotton · Featherweight 40s',
      'Ribbed crew neck',
      'Roomy straight fit',
      'Short sleeves',
    ],
    seamFinish: 'Fine single-jersey crew neck & light twin-needle hems',
    pocketConstruction: 'Clean pocketless chest',
  },
  {
    rowNum: 31,
    gender: 'Women',
    genderCode: 'Nữ',
    productGroupVi: 'Áo Thun Tshirt Nữ',
    sku: 'WVNECK-MD',
    mcCode: 'WTTV001',
    title: "Women's Cinched-Waist V-Neck T-Shirt",
    category: 'Tees & V-Necks',
    chapterNumeral: 'IV',
    fabricCode: 'MODAL NAM',
    composition: '94% Cotton Modal, 6% Spandex',
    weightGsm: '190–200 (195) GSM',
    fabricWidth: '175–180 cm',
    stretchFeelNote: 'Silky-smooth, non-clinging stretch cotton-modal knit with soft moisture breathability.',
    colorCount: COLORS_MODAL_NAM.length,
    colorways: COLORS_MODAL_NAM,
    summary:
      'Gently waist-contoured V-neck tee in cooling stretch cotton-modal jersey for a sleek, flattering everyday profile.',
    keyFeatures: [
      '94% Cotton, 6% Spandex (Swatch book: MODAL-M)',
      'Flattering V-neck',
      'Regular fit with cinched waist',
      'Short sleeves',
    ],
    seamFinish: 'Contoured waist seams & clean V-neck binding',
    pocketConstruction: 'Clean chest profile',
    dataFlags: [
      'I01: Synced to MODAL NAM 8-color lineup per official sheet (confirm vs earlier Modal Nữ assignment).',
      'I02: Swatch book states 94% Cotton Modal, 6% Spandex; product text states 94% Cotton, 6% Spandex.',
    ],
  },
  {
    rowNum: 32,
    gender: 'Women',
    genderCode: 'Nữ',
    productGroupVi: 'Áo Thun Tshirt Nữ',
    sku: 'WTSHIRT-MD1',
    title: "Women's Cropped Slim-Fit T-Shirt",
    category: 'Tees & V-Necks',
    chapterNumeral: 'IV',
    fabricCode: 'MODAL NAM',
    composition: '94% Cotton Modal, 6% Spandex',
    weightGsm: '190–200 (195) GSM',
    fabricWidth: '175–180 cm',
    stretchFeelNote: 'Cool, wrinkle-resistant cotton-modal blend with crisp 4-way stretch recovery.',
    colorCount: COLORS_MODAL_NAM.length,
    colorways: COLORS_MODAL_NAM,
    summary:
      'Sporty cropped slim-fit crew tee in resilient stretch modal blend shaped to pair cleanly with high-rise bottoms.',
    keyFeatures: [
      '94% Cotton, 6% Spandex (Swatch book: MODAL-M)',
      'Shape-retaining ribbed crew neck',
      'Cropped slim-fit length',
      'Short sleeves',
    ],
    seamFinish: 'Cropped twin-needle hem & snug ribbed crew neck',
    pocketConstruction: 'Clean minimalist front',
    dataFlags: [
      'I01: Synced to MODAL NAM 8-color lineup per official sheet (confirm vs earlier Modal Nữ assignment).',
      'I02: Swatch book states 94% Cotton Modal, 6% Spandex; product text states 94% Cotton, 6% Spandex.',
    ],
  },
  {
    rowNum: 33,
    gender: 'Women',
    genderCode: 'Nữ',
    productGroupVi: 'Áo Thun Tshirt Nữ',
    sku: 'WTSHIRT-MD2',
    title: "Women's Trimmed Straight-Fit T-Shirt",
    category: 'Tees & V-Necks',
    chapterNumeral: 'IV',
    fabricCode: 'MODAL NAM',
    composition: '94% Cotton Modal, 6% Spandex',
    weightGsm: '190–200 (195) GSM',
    fabricWidth: '175–180 cm',
    stretchFeelNote: 'Smooth, cool cotton-modal stretch knit offering breathable all-day drape.',
    colorCount: COLORS_MODAL_NAM.length,
    colorways: COLORS_MODAL_NAM,
    summary:
      'Straight-fit cotton-modal crew tee distinguished by crisp contrast binding along the short sleeve cuffs and bottom hem.',
    keyFeatures: [
      '94% Cotton, 6% Spandex (Swatch book: MODAL-M)',
      'Ribbed crew neck · Straight fit',
      'Contrast-trimmed short sleeves',
      'Contrast-trimmed bottom hem',
    ],
    seamFinish: 'Contrast binding along sleeve cuffs & bottom hem',
    pocketConstruction: 'Minimalist bound-edge ringer profile',
    dataFlags: [
      'I01: Synced to MODAL NAM 8-color lineup per official sheet (confirm vs earlier Modal Nữ assignment).',
      'I02: Swatch book states 94% Cotton Modal, 6% Spandex; product text states 94% Cotton, 6% Spandex.',
    ],
  },
  {
    rowNum: 34,
    gender: 'Women',
    genderCode: 'Nữ',
    productGroupVi: 'Áo Thun Tshirt Nữ',
    sku: 'WTSHIRT-CM261',
    title: "Women's T-Shirt (Sample Pending)",
    category: 'Tees & V-Necks',
    chapterNumeral: 'IV',
    fabricCode: 'CM26 NỮ',
    composition: '100% Cotton',
    weightGsm: '180–185 GSM',
    fabricWidth: '175–180 cm',
    stretchFeelNote: '180–185 GSM combed 26s pure cotton jersey (sample specifications pending).',
    colorCount: 0,
    colorways: [],
    summary:
      'Style slot assigned to CM26-F combed cotton jersey; sample garment specifications and colorways remain pending.',
    keyFeatures: [
      '100% Cotton · CM26-F (180–185 GSM)',
      'Sample status: Pending confirmation ("Chưa có mẫu")',
      'Colorways awaiting sample sign-off',
    ],
    descriptionBullets: [
      'Fabric program CM26 NỮ (100% Cotton, 180–185 GSM) carried forward from mill schedule.',
      'Style features and approved colorway roster pending physical sample confirmation.',
    ],
    seamFinish: 'Pending sample sign-off',
    pocketConstruction: 'Pending sample sign-off',
    dataFlags: [
      'I04: No sample or official spec yet ("Chưa có mẫu"); fabric CM26-F carried over with empty colorways.',
    ],
  },
  {
    rowNum: 35,
    gender: 'Women',
    genderCode: 'Nữ',
    productGroupVi: 'Áo Thun Tshirt Nữ',
    sku: 'WTSHIRT-CM262',
    title: "Women's Cinched-Waist Crew Neck T-Shirt",
    category: 'Tees & V-Necks',
    chapterNumeral: 'IV',
    fabricCode: 'CM26 NỮ',
    composition: '100% Cotton',
    weightGsm: '180–185 GSM',
    fabricWidth: '175–180 cm',
    stretchFeelNote: 'Breathable 100% combed cotton knit with crisp structure and non-irritating comfort.',
    colorCount: COLORS_CM26_NU.length,
    colorways: COLORS_CM26_NU,
    summary:
      'Waist-tailored crew neck tee in crisp 100% cotton jersey, combining airy breathability with a neat contoured silhouette.',
    keyFeatures: [
      '100% Cotton · Combed 26s',
      'Classic ribbed crew neck',
      'Regular fit with cinched waist',
      'Short sleeves',
    ],
    seamFinish: 'Contoured waist seams & fine ribbed crew collar',
    pocketConstruction: 'Clean pocketless front',
  },
  {
    rowNum: 36,
    gender: 'Women',
    genderCode: 'Nữ',
    productGroupVi: 'Áo Thun Tshirt Nữ',
    sku: 'WVNECK-CM26',
    title: "Women's Cinched-Waist V-Neck T-Shirt",
    category: 'Tees & V-Necks',
    chapterNumeral: 'IV',
    fabricCode: 'CM26 NỮ',
    composition: '100% Cotton',
    weightGsm: '180–185 GSM',
    fabricWidth: '175–180 cm',
    stretchFeelNote: 'Smooth, absorbent 100% pure cotton keeping a structured, fresh appearance.',
    colorCount: COLORS_CM26_NU.length,
    colorways: COLORS_CM26_NU,
    summary:
      'Airy 100% cotton V-neck tee cut with a softly cinched waist and flattering modest neckline for daily wear.',
    keyFeatures: [
      '100% Cotton · Combed 26s',
      'Modest ribbed V-neck',
      'Regular fit with cinched waist',
      'Short sleeves',
    ],
    seamFinish: 'Mitered V-neck rib binding & waist-contoured seams',
    pocketConstruction: 'Clean chest profile',
    dataFlags: ['I06: Studio sample photo marked pending ("ảnh chưa chụp") in official sheet.'],
  },
  {
    rowNum: 37,
    gender: 'Women',
    genderCode: 'Nữ',
    productGroupVi: 'Áo Thun Tshirt Nữ',
    sku: 'WTSHIRT-CM402',
    title: "Women's Oversized T-Shirt",
    category: 'Tees & V-Necks',
    chapterNumeral: 'IV',
    fabricCode: 'CM40',
    composition: '100% Cotton',
    weightGsm: '125–130 GSM',
    fabricWidth: '155 cm',
    stretchFeelNote: 'Featherlight 40s combed 100% cotton jersey for maximum warm-weather airflow.',
    colorCount: COLORS_CM40.length,
    colorways: COLORS_CM40,
    summary:
      'Relaxed oversized longline tee in ultra-lightweight 100% cotton jersey featuring a crisp raised neckband.',
    keyFeatures: [
      '100% Cotton · Featherweight 40s',
      'Ribbed crew neck with raised neckband',
      'Longline straight fit, oversized silhouette',
      'Relaxed short sleeves',
    ],
    seamFinish: 'Raised ribbed neckband & oversized longline drape',
    pocketConstruction: 'Clean unbranded oversized front',
  },
  {
    rowNum: 38,
    gender: 'Women',
    genderCode: 'Nữ',
    productGroupVi: 'Áo Thun Tshirt Nữ',
    sku: 'WTSHIRT-L',
    mcCode: 'WTTL001',
    title: "Women's Cinched-Waist Long-Sleeve T-Shirt",
    category: 'Tees & V-Necks',
    chapterNumeral: 'IV',
    fabricCode: 'CM30',
    composition: '94% Cotton, 6% Spandex',
    weightGsm: '175–185 GSM',
    fabricWidth: '175 cm (1M75)',
    stretchFeelNote: 'Fine compact 40s cotton-spandex knit with dense 4-way recovery and smooth sheen.',
    colorCount: COLORS_CM30.length,
    colorways: COLORS_CM30,
    summary:
      'Transitional long-sleeve crew tee in fine compact jersey cut with a regular cinched waist for effortless layering.',
    keyFeatures: [
      '100% Cotton (Swatch book CM30: 94% Cotton, 6% Spandex)',
      'Ribbed crew neck',
      'Full-length long sleeves',
      'Regular fit with cinched waist',
    ],
    seamFinish: 'Contoured waist seams & full-length sleeves',
    pocketConstruction: 'Clean layered-ready front',
    dataFlags: ['I03: Product text states 100% Cotton; CM30 swatch book states 94% Cotton, 6% Spandex.'],
  },
  {
    rowNum: 39,
    gender: 'Women',
    genderCode: 'Nữ',
    productGroupVi: 'Áo Thun Tshirt Nữ',
    sku: 'WTSHIRT1-CM30',
    title: "Women's Regular Straight-Fit T-Shirt",
    category: 'Tees & V-Necks',
    chapterNumeral: 'IV',
    fabricCode: 'CM30',
    composition: '94% Cotton, 6% Spandex',
    weightGsm: '175–185 GSM',
    fabricWidth: '175 cm (1M75)',
    stretchFeelNote: 'Smooth compact knit delivering even surface hand-feel and resilient comfort.',
    colorCount: COLORS_CM30.length,
    colorways: COLORS_CM30,
    summary:
      'Versatile regular-length straight-fit crew tee crafted for balanced everyday proportions across all silhouettes.',
    keyFeatures: [
      '100% Cotton (Swatch book CM30: 94% Cotton, 6% Spandex)',
      'Shape-retaining ribbed crew neck',
      'Straight fit, regular hip length',
      'Short sleeves',
    ],
    seamFinish: 'Ribbed crew neck & regular straight-fit seams',
    pocketConstruction: 'Clean minimal front',
    dataFlags: ['I03: Product text states 100% Cotton; CM30 swatch book states 94% Cotton, 6% Spandex.'],
  },
  {
    rowNum: 40,
    gender: 'Women',
    genderCode: 'Nữ',
    productGroupVi: 'Áo Thun Tshirt Nữ',
    sku: 'WTSHIRT2',
    title: "Women's Relaxed Crop Top",
    category: 'Tees & V-Necks',
    chapterNumeral: 'IV',
    fabricCode: 'CM30',
    composition: '94% Cotton, 6% Spandex',
    weightGsm: '175–185 GSM',
    fabricWidth: '175 cm (1M75)',
    stretchFeelNote: 'Compact jersey with clean drape and smooth, soft hand-feel.',
    colorCount: COLORS_CM30.length,
    colorways: COLORS_CM30,
    summary:
      'Fresh waist-skimming relaxed crop top engineered to pair effortlessly with high-waisted trousers, shorts, or skirts.',
    keyFeatures: [
      '100% Cotton (Swatch book CM30: 94% Cotton, 6% Spandex)',
      'Ribbed crew neck',
      'Relaxed-fit crop length',
      'Short sleeves',
    ],
    seamFinish: 'Relaxed cropped twin-needle hem & ribbed crew collar',
    pocketConstruction: 'Clean modern cropped torso',
    dataFlags: ['I03: Product text states 100% Cotton; CM30 swatch book states 94% Cotton, 6% Spandex.'],
  },

  // V. SKIRTS (41 – 43)
  {
    rowNum: 41,
    gender: 'Women',
    genderCode: 'Nữ',
    productGroupVi: 'Váy Nữ',
    sku: 'WBSK001-A82',
    title: "Women's A-Line Skort",
    category: 'Skirts',
    chapterNumeral: 'V',
    fabricCode: 'A82',
    composition: '95% Rayon Polyester, 5% Spandex',
    weightGsm: '330 GSM',
    fabricWidth: '152 cm',
    stretchFeelNote: 'Structured 330 GSM Rayon-Polyester suiting maintaining crisp asymmetrical wrap geometry.',
    colorCount: COLORS_A82.length,
    colorways: COLORS_A82,
    summary:
      'Asymmetrical wrap-front A-line skort uniting a polished skirt silhouette with built-in tailored inner shorts.',
    keyFeatures: [
      '95% Rayon Polyester, 5% Spandex',
      'A-line skort with asymmetrical wrap front',
      'Concealed back zip closure',
      'Wide cuffed hem & 2 faux back pockets',
    ],
    seamFinish: 'Asymmetrical wrap front over built-in shorts; concealed back zip',
    pocketConstruction: '2 faux back welt pockets & wide cuffed hem',
  },
  {
    rowNum: 42,
    gender: 'Women',
    genderCode: 'Nữ',
    productGroupVi: 'Váy Nữ',
    sku: 'WBSK002-A82',
    title: "Women's Low-Rise Skort",
    category: 'Skirts',
    chapterNumeral: 'V',
    fabricCode: 'A82',
    composition: '95% Rayon Polyester, 5% Spandex',
    weightGsm: '330 GSM',
    fabricWidth: '152 cm',
    stretchFeelNote: 'Cool, smooth 330 GSM suiting weave with light comfort stretch and sharp structure.',
    colorCount: COLORS_A82.length,
    colorways: COLORS_A82,
    summary:
      'Modern low-rise skort with skirt-front overlay, wide cuffed hems, and a concealed left-side zipper.',
    keyFeatures: [
      '95% Rayon Polyester, 5% Spandex',
      'Modern low-rise skort silhouette',
      'Concealed left-side zip closure',
      'Wide cuffed hem & 1 faux right back pocket',
    ],
    seamFinish: 'Low-rise waist, concealed left-side zip & wide cuffed hems',
    pocketConstruction: '1 faux right back pocket with clean skirt-front overlay',
  },
  {
    rowNum: 43,
    gender: 'Women',
    genderCode: 'Nữ',
    productGroupVi: 'Váy Nữ',
    sku: 'WSP0001',
    title: "Women's A-Line Pleated Skirt",
    category: 'Skirts',
    chapterNumeral: 'V',
    fabricCode: '76',
    composition: '76% Polyester, 18% Rayon, 6% Spandex',
    weightGsm: '203 GSM',
    fabricWidth: '57/58"',
    stretchFeelNote: 'Crisp Poly-Rayon-Spandex suiting holding sharp knife pleats with stretch ease.',
    colorCount: COLORS_FTR76.length,
    colorways: COLORS_FTR76,
    summary:
      'Gently flared knife-pleated A-line skirt anchored on a wide high-rise waistband with built-in inner shorts.',
    keyFeatures: [
      '76% Polyester, 18% Rayon, 6% Spandex',
      'Uniform knife pleats with built-in inner shorts',
      'High-rise wide waistband',
      'Gently flared A-line silhouette & side zip',
    ],
    seamFinish: 'Wide high-rise waistband, knife pleats & built-in inner shorts',
    pocketConstruction: 'Concealed side zipper with uninterrupted pleated drape',
  },
];

interface SkuDetailHints {
  pocket: string;
  seam: string;
  custom: string;
}

const SKU_DETAIL_HINTS: Record<string, SkuDetailHints> = {
  MLPA82: {
    pocket: 'Piped side pocket & waist closeup',
    seam: 'Button-through back welt closeup',
    custom: 'Straight-leg ankle drape',
  },
  MSPA28: {
    pocket: 'Rear welt pocket & DT tab closeup',
    seam: 'Back rise & waist closeup',
    custom: 'Side slant pocket & fly closeup',
  },
  MSPK03: {
    pocket: 'Rear welt & DT tab closeup',
    seam: 'Waistband & button fly closeup',
    custom: 'Cotton twill texture & hem',
  },
  'WBS0002-A82': {
    pocket: 'Wide waist & side hem slit',
    seam: 'Concealed back zip closeup',
    custom: 'Flared A-line hem detail',
  },
  'WBS0003-A82': {
    pocket: 'Tailored front & fly closeup',
    seam: 'Elastic-back waistband closeup',
    custom: 'A-line side drape',
  },
  'MPOLO-MD1': {
    pocket: '13 cm 3-button placket closeup',
    seam: 'Polo collar & elasticized cuff',
    custom: 'Straight-fit drape',
  },
  'MPOLO-MD2': {
    pocket: '2-button placket & faux chest pocket',
    seam: 'Collar & elasticized cuff closeup',
    custom: 'Body drape & side vent',
  },
  'MPOLO-MD4': {
    pocket: '13 cm concealed-zip placket',
    seam: 'Collar & cuff finish closeup',
    custom: 'Straight-fit drape',
  },
  'MPOLO-PQ2': {
    pocket: '15 cm 3-button placket & piqué grain',
    seam: '2 cm side vent & hem closeup',
    custom: 'Ribbed collar & cuff finish',
  },
  'MPOLO-PQ4': {
    pocket: '13 cm concealed zip & collar',
    seam: 'Ribbed cuff & piqué surface',
    custom: 'Straight-fit silhouette',
  },
  'MPOLO-SL201': {
    pocket: '3-button placket & slub grain',
    seam: 'Sleeve cuff & 2 cm side vent',
    custom: '100% cotton slub drape',
  },
  'MPOLO-SL203': {
    pocket: '13 cm mirror zipper & slub texture',
    seam: 'Polo collar & sleeve closeup',
    custom: 'Straight-fit silhouette',
  },
  'WPOLO-MD1': {
    pocket: '21 cm metal zipper closeup',
    seam: 'Three-quarter sleeve & collar',
    custom: 'Slim-fit profile',
  },
  'WPOLO-MD2': {
    pocket: '16 cm 5-button placket closeup',
    seam: 'Cinched waist & 5 cm side vent',
    custom: 'Short-sleeve profile',
  },
  'WPOLO-YD1': {
    pocket: '20 cm 5-button placket & piqué',
    seam: 'Collar & 5 cm side vent closeup',
    custom: 'Slim-fit silhouette',
  },
  'WPOLO-YD2': {
    pocket: '18 cm contrast-trim placket',
    seam: 'Decorative buttons & collar closeup',
    custom: 'Cinched-waist profile',
  },
  'MTSHIRT-MD1': {
    pocket: 'Ribbed crew neck closeup',
    seam: 'Sleeve & shoulder seam closeup',
    custom: 'Straight-fit body drape',
  },
  'MTSHIRT-MD2': {
    pocket: '13 cm 3-button placket closeup',
    seam: 'Ribbed collar & sleeve closeup',
    custom: 'Roomy straight fit',
  },
  'MTSHIRT-MD3': {
    pocket: '3-button neck & chest pocket',
    seam: 'Pocket stitching & sleeve closeup',
    custom: 'Straight-fit drape',
  },
  'MVNECK-CM26': {
    pocket: 'Ribbed V-neck collar closeup',
    seam: 'Sleeve & shoulder seam closeup',
    custom: 'Straight-fit hem',
  },
  'MTSHIRT-CM36': {
    pocket: 'Sturdy ribbed crew neck closeup',
    seam: '220 GSM knit & cuff closeup',
    custom: 'Straight-fit silhouette',
  },
  'MTSHIRT-CM40': {
    pocket: 'Fine crew neck rib closeup',
    seam: '40s lightweight cotton texture',
    custom: 'Relaxed straight fit',
  },
  'WVNECK-MD': {
    pocket: 'V-neck collar closeup',
    seam: 'Cinched waist & sleeve closeup',
    custom: 'Contoured fit profile',
  },
  'WTSHIRT-MD1': {
    pocket: 'Ribbed crew neck closeup',
    seam: 'Cropped hem & sleeve closeup',
    custom: 'Slim-fit contour',
  },
  'WTSHIRT-MD2': {
    pocket: 'Crew neck & trimmed sleeve cuff',
    seam: 'Contrast-trimmed bottom hem',
    custom: 'Straight-fit silhouette',
  },
  'WTSHIRT-CM262': {
    pocket: 'Ribbed crew neck closeup',
    seam: 'Sleeve seam & cuff closeup',
    custom: 'Cinched-waist silhouette',
  },
  'WTSHIRT-CM402': {
    pocket: 'Raised neckband & collar closeup',
    seam: 'Oversized hem & cuff closeup',
    custom: 'Relaxed longline drape',
  },
  'WTSHIRT1-CM30': {
    pocket: 'Crew collar & surface closeup',
    seam: 'Short sleeve & hem closeup',
    custom: 'Regular straight-fit drape',
  },
  WTSHIRT2: {
    pocket: 'Ribbed crew collar closeup',
    seam: 'Cropped hem & sleeve closeup',
    custom: 'Relaxed crop proportion',
  },
  'WBSK001-A82': {
    pocket: '2 faux back pockets & back zip',
    seam: 'Asymmetric wrap front closeup',
    custom: 'Wide cuffed hem detail',
  },
  'WBSK002-A82': {
    pocket: '1 faux right back pocket closeup',
    seam: 'Left-side zip & low-rise waist',
    custom: 'Wide cuffed hem detail',
  },
  WSP0001: {
    pocket: 'Wide high-rise waistband & pleats',
    seam: 'Side zip & built-in shorts detail',
    custom: 'A-line pleat movement',
  },
};

function getCraftDetails(row: RawProductRow): {
  stitchDensity: string;
  seamFinish: string;
  pocketConstruction: string;
  moq: string;
  bullets: string[];
  features: string[];
  detailHints: SkuDetailHints;
} {
  const isVNeck = row.sku.includes('VNECK');
  const seamFinish = row.seamFinish ?? 'Clean tailored seams & shape-retaining neckline';
  const pocketConstruction = row.pocketConstruction ?? 'Clean front construction';
  const bullets =
    row.descriptionBullets && row.descriptionBullets.length > 0
      ? row.descriptionBullets
      : [row.summary, row.stretchFeelNote];

  return {
    stitchDensity: '',
    seamFinish,
    pocketConstruction,
    moq: '',
    bullets,
    features: row.keyFeatures,
    detailHints: SKU_DETAIL_HINTS[row.sku] ?? {
      pocket: isVNeck ? 'V-neck & front detail' : 'Neckline / waist detail',
      seam: 'Construction & seam closeup',
      custom: 'Fit & drape study',
    },
  };
}

function createBlankMedia(
  index: number,
  row: RawProductRow
): Record<MediaSlotKey, GarmentItem['media'][MediaSlotKey]> {
  const num = String(index).padStart(2, '0');
  return {
    hero: {
      url: '',
      stage: 'blank',
      caption: `Fig. ${num}.A — ${row.sku} Primary Silhouette`,
      aspectLabel: '5:4 Image',
      note: '',
    },
    pocket: {
      url: '',
      stage: 'blank',
      caption: `Fig. ${num}.B — Detail 01`,
      aspectLabel: '4:3 Image',
      note: '',
    },
    seam: {
      url: '',
      stage: 'blank',
      caption: `Fig. ${num}.C — Detail 02`,
      aspectLabel: '4:3 Image',
      note: '',
    },
    swatch: {
      url: '',
      stage: 'blank',
      caption: `Fig. ${num}.D — Fabric image`,
      aspectLabel: '1:1 Image',
      note: '',
    },
    custom: {
      url: '',
      stage: 'blank',
      caption: `Fig. ${num}.E — Detail 03`,
      aspectLabel: '4:3 Image',
      note: '',
    },
  };
}

export function buildDefaultDescriptionBullets(specs: {
  composition: string;
  weightGsm: string;
  pocketConstruction: string;
  seamFinish: string;
}): string[] {
  return [
    `${specs.composition} (${specs.weightGsm}) engineered for breathable structure.`,
    `${specs.seamFinish} with ${specs.pocketConstruction.toLowerCase()}.`,
  ];
}

export function buildDefaultKeyFeatures(specs: {
  stitchDensity?: string;
  seamFinish: string;
  pocketConstruction: string;
  fabricRollRef: string;
  composition?: string;
}): string[] {
  return [
    specs.composition ? `${specs.composition} (${specs.fabricRollRef})` : `Fabric ${specs.fabricRollRef}`,
    specs.seamFinish,
    specs.pocketConstruction,
  ].filter(Boolean);
}

export const DEFAULT_COLORWAYS: string[] = ['Black', 'White', 'Grey', 'Navy'];

export function createInitialGarments(): GarmentItem[] {
  return RAW_PRODUCTS.map((row, idx) => {
    const num = idx + 1;
    const craft = getCraftDetails(row);
    const slug = row.sku.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const assetMapping = PRODUCT_ASSETS[row.sku];
    const studioMapping = PRODUCT_STUDIO_ASSETS[row.sku];
    const expectedHeroFile = assetMapping
      ? getExpectedImageFile(assetMapping.sourceImage)
      : undefined;
    const media = createBlankMedia(num, row);
    const heroFile = studioMapping?.heroFile ?? assetMapping?.heroFile;

    if (heroFile) {
      media.hero = {
        ...media.hero,
        url: publicAssetUrl(`/catalogue-media/${encodeURIComponent(heroFile)}`),
        fallbackUrl:
          row.sku === 'WTSHIRT-MD2'
            ? publicAssetUrl('/assets/aistudio/WTSHIRT-MD2_Hero_acd4d06e.jpg')
            : undefined,
        stage: 'studio-final',
        caption: `${media.hero.caption} · ${heroFile}`,
        note: `Local image file: ${heroFile}`,
      };
    } else if (expectedHeroFile) {
      media.hero.note = `Expected local image file: ${expectedHeroFile} (not found in the image folder; drop it here when available).`;
    }

    const detailFiles = studioMapping
      ? studioMapping.detailFiles
      : Object.fromEntries(
          (assetMapping?.followingFiles ?? [])
            .slice(0, 3)
            .map((fileName, fileIndex) => [
              (['pocket', 'seam', 'custom'] as const)[fileIndex],
              fileName,
            ])
        );
    (['pocket', 'seam', 'custom'] as const).forEach((slotKey) => {
      const fileName = detailFiles[slotKey];
      if (!fileName) return;
      media[slotKey] = {
        ...media[slotKey],
        url: publicAssetUrl(`/catalogue-media/${encodeURIComponent(fileName)}`),
        stage: 'studio-final',
        caption: `${media[slotKey].caption} · ${fileName}`,
        note: `Studio product detail image: ${fileName}`,
      };
    });

    if (studioMapping?.fabricFile) {
      media.swatch = {
        ...media.swatch,
        url: publicAssetUrl(
          `/catalogue-media/${encodeURIComponent(studioMapping.fabricFile)}`
        ),
        stage: 'studio-final',
        caption: `${media.swatch.caption} · ${studioMapping.fabricFile}`,
        note: `Verified product fabric image: ${studioMapping.fabricFile}`,
        isFactoryFabricImage: true,
      };
    }

    return {
      id: `garment-${String(num).padStart(2, '0')}`,
      index: num,
      sku: row.sku,
      title: row.title,
      gender: row.gender,
      genderCode: row.genderCode,
      productGroupVi: row.productGroupVi,
      category: row.category,
      chapterNumeral: row.chapterNumeral,
      summary: row.summary,
      descriptionBullets: craft.bullets,
      keyFeatures: craft.features,
      colorCount: row.colorCount,
      colorways: row.colorways,
      dataFlags: row.dataFlags,
      productUrl:
        assetMapping?.productUrl ??
        `https://dreamtomorrow.studio/b2b/line-sheet/${slug}`,
      videoUrl: '',
      videoTitle: `${row.sku} Drape & Movement Study`,
      specs: {
        fabricRollRef: row.fabricCode,
        composition: row.composition,
        weightGsm: row.weightGsm,
        fabricWidth: row.fabricWidth,
        stretchFeelNote: row.stretchFeelNote,
        stitchDensity: craft.stitchDensity,
        seamFinish: craft.seamFinish,
        pocketConstruction: craft.pocketConstruction,
        cmOemOdmScope: 'CM / OEM / ODM Ready',
        sizeRun: row.gender === 'Men' ? 'S / M / L / XL / XXL' : 'XS / S / M / L / XL',
        moq: craft.moq,
        leadTime: '',
        wholesaleRef: 'CM / OEM / ODM Quote',
      },
      media,
      detailHints: craft.detailHints,
    };
  });
}

export function buildFabricSwatchPrograms(garments: GarmentItem[]): FabricSwatchProgram[] {
  const map = new Map<string, FabricSwatchProgram>();

  for (const g of garments) {
    const key = g.specs.fabricRollRef;
    const existing = map.get(key);
    if (!existing) {
      const factoryColors = getFactoryFabricColors(key);
      map.set(key, {
        fabricCode: key,
        factoryColors,
        composition: g.specs.composition,
        weightGsm: g.specs.weightGsm,
        fabricWidth: g.specs.fabricWidth,
        stretchFeelNote: g.specs.stretchFeelNote,
        colorCount: factoryColors.length,
        colorways: [...g.colorways],
        linkedSkus: [g.sku],
        linkedIndices: [g.index],
        genders: [g.gender],
        dataFlags: g.dataFlags ? [...g.dataFlags] : [],
        swatchImageUrl: g.media.swatch.url,
        swatchImageStage: g.media.swatch.stage,
        isSessionDrop: g.media.swatch.isSessionDrop,
      });
    } else {
      existing.linkedSkus.push(g.sku);
      existing.linkedIndices.push(g.index);
      if (!existing.genders.includes(g.gender)) {
        existing.genders.push(g.gender);
      }
      if (!existing.swatchImageUrl && g.media.swatch.url) {
        existing.swatchImageUrl = g.media.swatch.url;
        existing.swatchImageStage = g.media.swatch.stage;
        existing.isSessionDrop = g.media.swatch.isSessionDrop;
      }
    }
  }

  return Array.from(map.values());
}

export function getFabricSwatchSpreadCount(garments: GarmentItem[]): number {
  return buildFabricSwatchPrograms(garments).length;
}

export function getProductSpreadOffset(garments: GarmentItem[]): number {
  return 2 + getFabricSwatchSpreadCount(garments);
}

export function getFabricSwatchSpreadPage(fabricCode: string, garments: GarmentItem[]): number {
  const programIndex = buildFabricSwatchPrograms(garments).findIndex(
    (program) => program.fabricCode === fabricCode
  );
  return programIndex < 0 ? 2 : 2 + programIndex;
}

export const METALLIC_THEMES = [
  {
    id: 'platinum' as const,
    label: 'Brushed Platinum',
    swatch: '#9BA2A9',
    note: 'Cool silver-steel hairlines on pure gallery white',
  },
  {
    id: 'champagne' as const,
    label: 'Champagne Brass',
    swatch: '#B4A48A',
    note: 'Warm understated satin metal on pure gallery white',
  },
  {
    id: 'graphite' as const,
    label: 'Graphite Steel',
    swatch: '#575C61',
    note: 'High-contrast architectural gunmetal monochrome',
  },
];

export const STAGE_LABELS: Record<'blank' | 'ai-concept' | 'studio-final', string> = {
  blank: 'Blank Slot',
  'ai-concept': 'AI Concept',
  'studio-final': 'Studio Final',
};

export const PRINT_PRODUCTION_SPEC = {
  pageFormat: 'A4 / A3 ISO 216 (1:1.414 · 1190 × 842 Spread)',
  spreadDimensionsMm: '297 × 210 mm A4 Landscape Spread · 210 × 297 mm A4 Portrait Leaf (420 × 297 mm A3 Spread)',
  bleedMm: 3,
  trimMarginMm: 10,
  innerGutterMm: 18,
  outerMarginMm: 14,
  targetDpi: 300,
  colorProfile: 'sRGB Web Prototype → CMYK ISO Coated v2 (FOGRA39)',
  bindingMethod: 'Smyth-Sewn Lay-Flat / Saddle-Stitch B2B Lookbook',
} as const;
