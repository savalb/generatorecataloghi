# 🚀 Piattaforma SaaS Volantini Commerciali

Piattaforma Web ad alte prestazioni per la creazione, impaginazione e pubblicazione di volantini commerciali stampabili (A4) e sfogliabili digitali 3D per PMI e Distributori all'Ingrosso.

## 🎯 Funzionalità Principali

### Per Commercianti e Distributori
- **Catalogo Prodotti**: Gestione completa con foto, prezzi, descrizioni, categorie e note su peso/quantità
- **Volantini Stampa A4**: Impaginazione WYSIWYG con page-break automatici (277mm altezza pagina)
- **Sfogliabile Digitale 3D**: Flipbook HTML/JS con lazy loading progressivo per connessioni 3G/4G
- **Ordini WhatsApp**: Flusso B2B/B2C con selettore quantità e calcolo automatico prodotti a peso
- **Dashboard Analytics**: Tracciamento aperture, clic prodotto e ordini WhatsApp con revenue stima

### 📐 20 Layout Settoriali Inclusi

#### Alimentari & Supermercati (5)
- `alimentari_prezzone_impatto` - Card sottocosto con badge rosso e prezzo verticale gigante
- `alimentari_spesa_difesa` - Griglia pulita con badge "Novità"
- `alimentari_bancone_freschi` - Layout a righe con origine del prodotto
- `alimentari_combo_offerta` - Prodotto principale + omaggio affiancato
- `alimentari_griglia_stock` - Griglia compatta 6 prodotti per pagina

#### Abbigliamento & Moda (4)
- `abbigliamento_lookbook_minimal` - Immagine grande stile rivista
- `abbigliamento_split_verticale` - Divisione Uomo/Donna a colonne
- `abbigliamento_outfit_completo` - Hero product + accessori correlati
- `abbigliamento_catalogo_accessori` - Griglia accessori con badge "Best Seller"

#### Ferramenta & Fai da Te (3)
- `ferramenta_fai_da_te` - Tabella specifiche tecniche
- `ferramenta_vetrina_3col` - 3 colonne professionali
- `ferramenta_offerte_pallet` - Layout per lotti grandi

#### Elettronica & Tech (4)
- `tech_grande_occasione` - Single-product Hero con spec-circles
- `tech_tutto_telefonia` - Layout smartphone con memoria GB
- `tech_grandi_elettro` - Righe trasversali con classe energetica
- `tech_accessori_multi` - Card compatte per gadget

#### Verde & Beauty / Parafarmacia (4)
- `green_vetrina_fioriti` - Scheda botanica con icone sole/acqua
- `beauty_spa_editoriale` - Layout estetico cosmetici
- `beauty_parafarmacia` - Badge sconto circolare
- `beauty_last_minute` - Header flash banner personalizzabile

## 🛠️ Stack Tecnologico

| Layer | Tecnologia |
|-------|-----------|
| Frontend | React 18+ con Vite |
| Styling | Vanilla CSS + Design Tokens (no framework pesanti) |
| Backend | Supabase (PostgreSQL, Auth, Storage) |
| Icone | Lucide-React |
| Deployment | Vercel |
| Image Processing | HTML5 Canvas (compressione WebP client-side) |

## 🚀 Quick Start

### Prerequisiti
- Node.js 18+
- Account Supabase
- Account Vercel (per deploy)

### Installazione Locale
```bash
npm install
npm run dev
```

### Build Produzione
```bash
npm run build
npm run preview
```

## 📊 Schema Database (Supabase)

Le tabelle principali sono definite in `supabase_setup.sql`:
- `tenants` - Profili aziendali
- `products` - Anagrafica prodotti
- `catalogs` - Volantini/cataloghi
- `catalog_items` - Relazione prodotti-volantino
- `analytics_events` - Tracciamento conversioni

## 🔧 Configurazione Ambiente

Copia `.env.example` in `.env` e configura:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 🌐 Deploy su Vercel

Vedi [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md) per istruzioni dettagliate.

### Metodo Rapido
1. Push su GitHub
2. Importa repo su Vercel
3. Configura environment variables
4. Deploy automatico

## 📈 Feature Tecniche Avanzate

- ✅ Compressione automatica WebP prima dell'upload
- ✅ Lazy loading progressivo immagini (pagine adiacenti)
- ✅ Page-break CSS per stampa A4 perfetta
- ✅ Tracking analytics pre-redirect WhatsApp
- ✅ Calcolo automatico prodotti a peso (kg/etto)
- ✅ Text overflow ellipsis per titoli lunghi
- ✅ Dark mode ready con Design Tokens
- ✅ Responsive mobile-first

## 📄 License

MIT

---

**Sviluppato con ❤️ per PMI e Distributori Italiani**
