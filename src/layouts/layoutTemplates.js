/**
 * Layout Templates Configuration
 * All 20 commercial layouts organized by industry sector
 */

export const layoutTemplates = [
  // ==================== ALIMENTARI & SUPERMERCATI ====================
  {
    id: 'alimentari_prezzone_impatto',
    name: "Prezzone d'Impatto",
    category: 'Alimentari',
    description: 'Card sottocosto con badge rosso e prezzo verticale gigante',
    pageSize: 4,
    gridConfig: { columns: 2, rows: 2 },
    features: ['price-badge', 'discount-highlight', 'bold-typography'],
    cssClass: 'layout-prezzone'
  },
  {
    id: 'alimentari_spesa_difesa',
    name: 'Spesa Difesa',
    category: 'Alimentari',
    description: 'Griglia pulita con badge "Novità" e testo centratissimo',
    pageSize: 9,
    gridConfig: { columns: 3, rows: 3 },
    features: ['novelty-badge', 'clean-grid', 'centered-text'],
    cssClass: 'layout-spesa-difesa'
  },
  {
    id: 'alimentari_bancone_freschi',
    name: 'Bancone dei Freschi',
    category: 'Alimentari',
    description: 'Layout a righe con origine del prodotto e descrizione dettagliata',
    pageSize: 4,
    gridConfig: { columns: 1, rows: 4 },
    features: ['origin-label', 'detailed-description', 'row-layout'],
    cssClass: 'layout-bancone-freschi'
  },
  {
    id: 'alimentari_combo_offerta',
    name: 'Combo Offerta',
    category: 'Alimentari',
    description: 'Box con prodotto principale + omaggio affiancato',
    pageSize: 2,
    gridConfig: { columns: 2, rows: 1 },
    features: ['bundle-display', 'gift-badge', 'side-by-side'],
    cssClass: 'layout-combo'
  },
  {
    id: 'alimentari_griglia_stock',
    name: 'Griglia Stock',
    category: 'Alimentari',
    description: 'Griglia compatta a 6 prodotti per pagina per offerte di volume',
    pageSize: 16,
    gridConfig: { columns: 4, rows: 4 },
    features: ['compact-grid', 'volume-pricing', 'dense-layout'],
    cssClass: 'layout-griglia-stock'
  },

  // ==================== ABBIGLIAMENTO & MODA ====================
  {
    id: 'abbigliamento_lookbook_minimal',
    name: 'Lookbook Minimal',
    category: 'Abbigliamento',
    description: 'Immagine grande stile rivista con collezione e descrizione sobria',
    pageSize: 1,
    gridConfig: { columns: 1, rows: 1 },
    features: ['hero-image', 'editorial-style', 'minimal-text'],
    cssClass: 'layout-lookbook'
  },
  {
    id: 'abbigliamento_split_verticale',
    name: 'Split Lui & Lei',
    category: 'Abbigliamento',
    description: 'Divisione Uomo / Donna a colonne alterne',
    pageSize: 2,
    gridConfig: { columns: 2, rows: 1 },
    features: ['split-columns', 'gender-segmentation', 'vertical-divider'],
    cssClass: 'layout-split'
  },
  {
    id: 'abbigliamento_outfit_completo',
    name: 'Outfit Completo',
    category: 'Abbigliamento',
    description: 'Prodotto Hero principale in alto e accessori correlati in basso',
    pageSize: 4,
    gridConfig: { columns: 2, rows: 2 },
    features: ['hero-product', 'accessories-grid', 'outfit-coordination'],
    cssClass: 'layout-outfit'
  },
  {
    id: 'abbigliamento_catalogo_accessori',
    name: 'Catalogo Accessori',
    category: 'Abbigliamento',
    description: 'Badge "Best Seller" e griglia accessori',
    pageSize: 5,
    gridConfig: { columns: 3, rows: 2 },
    features: ['bestseller-badge', 'accessory-grid', 'category-tags'],
    cssClass: 'layout-accessori'
  },

  // ==================== FERRAMENTA & FAI DA TE ====================
  {
    id: 'ferramenta_fai_da_te',
    name: 'Griglia Tecnica Fai da Te',
    category: 'Ferramenta',
    description: 'Tabella specifiche tecniche (alimentazione, voltaggio, garanzia)',
    pageSize: 6,
    gridConfig: { columns: 3, rows: 2 },
    features: ['tech-specs-table', 'warranty-badge', 'power-info'],
    cssClass: 'layout-fai-da-te'
  },
  {
    id: 'ferramenta_vetrina_3col',
    name: 'Vetrina Elettroutensili',
    category: 'Ferramenta',
    description: '3 colonne con intestazione professionale e valigetta inclusa',
    pageSize: 3,
    gridConfig: { columns: 3, rows: 1 },
    features: ['professional-header', 'case-included', 'three-column'],
    cssClass: 'layout-vetrina-3col'
  },
  {
    id: 'ferramenta_offerte_pallet',
    name: 'Offerte Pallet',
    category: 'Ferramenta',
    description: 'Layout per lotti grandi e sconto percentuale evidenziato',
    pageSize: 2,
    gridConfig: { columns: 2, rows: 1 },
    features: ['bulk-pricing', 'percentage-discount', 'pallet-info'],
    cssClass: 'layout-pallet'
  },

  // ==================== ELETTRONICA & TECH ====================
  {
    id: 'tech_grande_occasione',
    name: 'Grande Occasione Tech',
    category: 'Tech',
    description: 'Layout single-product Hero con spec-circles e badge "Tasso Zero"',
    pageSize: 1,
    gridConfig: { columns: 1, rows: 1 },
    features: ['hero-single', 'spec-circles', 'finance-badge', 'zero-rate'],
    cssClass: 'layout-tech-single'
  },
  {
    id: 'tech_tutto_telefonia',
    name: 'Tutto Telefonia',
    category: 'Tech',
    description: 'Layout smartphone con indicazione memoria GB e garanzia',
    pageSize: 6,
    gridConfig: { columns: 3, rows: 2 },
    features: ['memory-badge', 'warranty-info', 'smartphone-grid'],
    cssClass: 'layout-telefonia'
  },
  {
    id: 'tech_grandi_elettro',
    name: 'Grandi Elettrodomestici',
    category: 'Tech',
    description: 'Righe trasversali con classe energetica e installazione',
    pageSize: 4,
    gridConfig: { columns: 1, rows: 4 },
    features: ['energy-class', 'installation-info', 'row-layout'],
    cssClass: 'layout-grandi-elettro'
  },
  {
    id: 'tech_accessori_multi',
    name: 'Accessori Tech',
    category: 'Tech',
    description: 'Card compatte per cavi, caricabatterie e gadget',
    pageSize: 6,
    gridConfig: { columns: 3, rows: 2 },
    features: ['compact-cards', 'gadget-grid', 'multi-product'],
    cssClass: 'layout-tech-accessori'
  },

  // ==================== VERDE & BEAUTY / PARAFARMACIA ====================
  {
    id: 'green_vetrina_fioriti',
    name: 'Vetrina Green Piante',
    category: 'Green & Beauty',
    description: 'Scheda botanica con icone sole/acqua e prezzo verde',
    pageSize: 4,
    gridConfig: { columns: 2, rows: 2 },
    features: ['botanical-card', 'care-icons', 'green-pricing'],
    cssClass: 'layout-green-vetrina'
  },
  {
    id: 'beauty_spa_editoriale',
    name: 'Promo Beauty & Spa',
    category: 'Green & Beauty',
    description: 'Layout estetico per cosmetici e trattamenti con tag pelli sensibili',
    pageSize: 3,
    gridConfig: { columns: 2, rows: 2 },
    features: ['editorial-aesthetic', 'skin-type-tags', 'treatment-focus'],
    cssClass: 'layout-beauty-spa'
  },
  {
    id: 'beauty_parafarmacia',
    name: 'Offerte Parafarmacia',
    category: 'Green & Beauty',
    description: 'Badge sconto circolare e focus sul prezzo netto',
    pageSize: 6,
    gridConfig: { columns: 3, rows: 2 },
    features: ['circular-discount', 'net-price-focus', 'pharmacy-style'],
    cssClass: 'layout-parafarmacia'
  },
  {
    id: 'beauty_last_minute',
    name: 'Last Minute Offerte Flash',
    category: 'Green & Beauty',
    description: 'Header flash banner personalizzabile (es. "Solo 48 ore")',
    pageSize: 2,
    gridConfig: { columns: 2, rows: 1 },
    features: ['flash-banner', 'urgency-badge', 'time-limited'],
    cssClass: 'layout-last-minute'
  }
];

/**
 * Get layout template by ID
 * @param {string} layoutId - The layout ID
 * @returns {Object|null} - The layout template or null
 */
export const getLayoutById = (layoutId) => {
  return layoutTemplates.find((tpl) => tpl.id === layoutId) || null;
};

/**
 * Get all layouts for a specific category
 * @param {string} category - Industry category
 * @returns {Array} - Array of layout templates
 */
export const getLayoutsByCategory = (category) => {
  return layoutTemplates.filter((tpl) => tpl.category === category);
};

/**
 * Get all unique categories
 * @returns {Array<string>} - Array of category names
 */
export const getLayoutCategories = () => {
  const categories = new Set(layoutTemplates.map((tpl) => tpl.category));
  return Array.from(categories);
};

/**
 * Map legacy template IDs to new layout IDs
 */
export const legacyTemplateMapping = {
  'grid-3': 'alimentari_spesa_difesa',
  'list-classic': 'alimentari_bancone_freschi',
  'hero-featured': 'tech_grande_occasione',
  'grid-2': 'alimentari_prezzone_impatto'
};

export default layoutTemplates;
