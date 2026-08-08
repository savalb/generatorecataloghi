import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { 
  Plus, Trash2, Layout, Image, Palette, Share2, Printer, 
  ChevronRight, LogOut, Check, Sparkles, Download, ArrowLeft,
  FileText, Smartphone, Monitor, ShoppingBag, Settings, Grid, Columns, BarChart2,
  Wand2, Upload, QrCode, Send, Eye, Edit3, Brain, FileSpreadsheet, X
} from 'lucide-react';
import './App.css';

// Preset Brand Palettes
const BRAND_PALETTES = [
  { name: 'Verde Campania', primary: '#2C5E43', secondary: '#8CB89D', desc: 'Fresco, naturale, biologico' },
  { name: 'Azzurro Costiera', primary: '#1E6091', secondary: '#76C893', desc: 'Solare, marittimo, vivace' },
  { name: 'Rosso Pompei', primary: '#A62B2B', secondary: '#D9A05B', desc: 'Tradizionale, caldo, storico' },
  { name: 'Sole del Sud', primary: '#D97706', secondary: '#FCD34D', desc: 'Accogliente, energico, luminoso' },
  { name: 'Vesuvio Notte', primary: '#1F2937', secondary: '#EF4444', desc: 'Moderno, deciso, contrastato' },
  { name: 'Oro & Nero', primary: '#111827', secondary: '#D4AF37', desc: 'Elegante, premium, raffinato' }
];

// 20 Layouts Templates structure mapping
const LAYOUT_TEMPLATES = [
  // Alimentari
  { id: 'alimentari_prezzone_impatto', name: "Prezzone d'Impatto (2x2)", category: 'Alimentari', pageSize: 4 },
  { id: 'alimentari_spesa_difesa', name: 'Spesa Difesa (3x3)', category: 'Alimentari', pageSize: 9 },
  { id: 'alimentari_bancone_freschi', name: 'Bancone dei Freschi (Righe)', category: 'Alimentari', pageSize: 4 },
  { id: 'alimentari_combo_offerta', name: 'Combo Offerta', category: 'Alimentari', pageSize: 2 },
  { id: 'alimentari_griglia_stock', name: 'Griglia Stock (4x4)', category: 'Alimentari', pageSize: 16 },
  
  // Abbigliamento
  { id: 'abbigliamento_lookbook_minimal', name: 'Lookbook Minimal (1 Prod)', category: 'Abbigliamento', pageSize: 1 },
  { id: 'abbigliamento_split_verticale', name: 'Split Lui & Lei (Verticale)', category: 'Abbigliamento', pageSize: 2 },
  { id: 'abbigliamento_outfit_completo', name: 'Outfit Completo (Hero+3)', category: 'Abbigliamento', pageSize: 4 },
  { id: 'abbigliamento_catalogo_accessori', name: 'Catalogo Accessori (1+4)', category: 'Abbigliamento', pageSize: 5 },
  
  // Ferramenta
  { id: 'ferramenta_fai_da_te', name: 'Griglia Tecnica Fai da Te (3x2)', category: 'Ferramenta', pageSize: 6 },
  { id: 'ferramenta_vetrina_3col', name: 'Vetrina Elettroutensili (3 Col)', category: 'Ferramenta', pageSize: 3 },
  { id: 'ferramenta_offerte_pallet', name: 'Offerte Pallet (Stock)', category: 'Ferramenta', pageSize: 2 },
  
  // Tech
  { id: 'tech_grande_occasione', name: 'Grande Occasione Tech (1 Prod)', category: 'Tech', pageSize: 1 },
  { id: 'tech_tutto_telefonia', name: 'Tutto Telefonia (2x3)', category: 'Tech', pageSize: 6 },
  { id: 'tech_grandi_elettro', name: 'Grandi Elettrodomestici (Righe)', category: 'Tech', pageSize: 4 },
  { id: 'tech_accessori_multi', name: 'Accessori Tech (3x2)', category: 'Tech', pageSize: 6 },
  
  // Green & Beauty
  { id: 'green_vetrina_fioriti', name: 'Vetrina Green Piante (2x2)', category: 'Green & Beauty', pageSize: 4 },
  { id: 'beauty_spa_editoriale', name: 'Promo Beauty & Spa (Hero+2)', category: 'Green & Beauty', pageSize: 3 },
  { id: 'beauty_parafarmacia', name: 'Offerte Parafarmacia (3x2)', category: 'Green & Beauty', pageSize: 6 },
  { id: 'beauty_last_minute', name: 'Last Minute Offerte Flash', category: 'Green & Beauty', pageSize: 2 }
];

export default function App() {
  // Auth states
  const [session, setSession] = useState(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authBusinessName, setAuthBusinessName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // App core states
  const [tenant, setTenant] = useState(null);
  const [products, setProducts] = useState([]);
  const [catalogs, setCatalogs] = useState([]);
  const [catalogItems, setCatalogItems] = useState([]);
  const [selectedCatalog, setSelectedCatalog] = useState(null);

  // UI state
  const [activeTab, setActiveTab] = useState('flyers'); // 'products', 'flyers', 'brand', 'publish'
  const [mobileSubTab, setMobileSubTab] = useState('edit'); // 'edit' or 'preview'
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [appLoading, setAppLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductDesc, setNewProductDesc] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('');
  const [newProductImage, setNewProductImage] = useState(null);
  const [newProductImagePreview, setNewProductImagePreview] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);

  // Catalog Form states
  const [newCatalogName, setNewCatalogName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('grid-3'); // 'grid-3', 'list-classic', 'hero-featured'
  const [customPageSize, setCustomPageSize] = useState(null); // null = usa default del template

  // Settings states
  const [editBusinessName, setEditBusinessName] = useState('');
  const [editPalette, setEditPalette] = useState(BRAND_PALETTES[0]);
  const [editWhatsappPhone, setEditWhatsappPhone] = useState('');

  // Publish Dialog States
  const [publishModal, setPublishModal] = useState(null); // 'print' or 'whatsapp'
  const [whatsappPhone, setWhatsappPhone] = useState('');

  // Publish / Flipbook states
  const [publishedFlipbookUrl, setPublishedFlipbookUrl] = useState('');
  
  // CSV Import States
  const [csvPreviewProducts, setCsvPreviewProducts] = useState([]);
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [csvFile, setCsvFile] = useState(null);

  // AI Copywriter States
  const [showAiCopywriter, setShowAiCopywriter] = useState(false);
  const [aiProductInput, setAiProductInput] = useState({ name: '', description: '' });
  const [aiGeneratedText, setAiGeneratedText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Onboarding Wizard States
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState({ sector: '', logo: null, colors: BRAND_PALETTES[0] });

  // Mobile Preview Toggle
  const [mobilePreviewMode, setMobilePreviewMode] = useState(false);

  // QR Code State
  const [qrCodeValue, setQrCodeValue] = useState('');

  // Landing & Analytics States
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [analyticsEvents, setAnalyticsEvents] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);


  // SEO & GEO metadata injection
  useEffect(() => {
    if (!session) {
      document.title = 'Difetti Cataloghi - Crea Volantini e Cataloghi Digitali per WhatsApp';
      
      // Update meta description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', 'Il primo generatore di cataloghi e volantini digitali sfogliabili 3D pensato per le PMI del sud Italia. Condividi su WhatsApp e aumenta le vendite locali.');

      // Inject Schema.org JSON-LD
      let schemaScript = document.getElementById('seo-jsonld');
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.id = 'seo-jsonld';
        schemaScript.type = 'application/ld+json';
        document.head.appendChild(schemaScript);
      }
      schemaScript.text = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Difetti Cataloghi",
        "operatingSystem": "All",
        "applicationCategory": "BusinessApplication",
        "offers": {
          "@type": "Offer",
          "price": "14.99",
          "priceCurrency": "EUR"
        },
        "description": "Generatore di cataloghi e volantini digitali sfogliabili 3D con integrazione WhatsApp per le piccole e medie imprese del sud Italia.",
        "publisher": {
          "@type": "Organization",
          "name": "BRTC Digital Adv"
        }
      });
    }
  }, [session]);

  // Handle Session
  useEffect(() => {
    let isMounted = true;

    // Safety timeout: forza la disattivazione dello spinner dopo 1.5s max
    const safetyTimer = setTimeout(() => {
      if (isMounted) setAppLoading(false);
    }, 1500);

    const initSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (isMounted) {
          const activeSession = data?.session || null;
          setSession(activeSession);
          if (activeSession) {
            await fetchTenantData(activeSession.user.id);
          } else {
            setAppLoading(false);
          }
        }
      } catch (err) {
        console.error('Errore inizializzazione sessione:', err);
        if (isMounted) setAppLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setSession(session);
      if (session) {
        fetchTenantData(session.user.id);
      } else {
        setTenant(null);
        setAppLoading(false);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, []);

  // Fetch all business & tenant data
  const fetchTenantData = async (userId) => {
    try {
      setAppLoading(true);
      // Fetch Tenant
      let { data: tenantData, error: tenantErr } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', userId)
        .single();

      if (tenantErr) throw tenantErr;
      setTenant(tenantData);
      setEditBusinessName(tenantData.business_name);
      setEditWhatsappPhone(tenantData.whatsapp_phone || '');
      
      const savedPalette = BRAND_PALETTES.find(p => p.primary === tenantData.brand_colors?.primary) || BRAND_PALETTES[0];
      setEditPalette(savedPalette);

      // Draft check: if business name is set but setup not completed, resume at step 2
      if (!tenantData.setup_completed && tenantData.business_name && tenantData.business_name !== 'La Mia Attività') {
        setOnboardingStep(2);
      }

      if (tenantData.setup_completed) {
        // Fetch Products
        let { data: prodData } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        setProducts(prodData || []);

        // Fetch Catalogs
        let { data: catData } = await supabase
          .from('catalogs')
          .select('*')
          .order('created_at', { ascending: false });
        setCatalogs(catData || []);

        if (catData && catData.length > 0) {
          setSelectedCatalog(catData[0]);
          fetchCatalogItems(catData[0].id);
        }

        // Fetch Analytics
        fetchAnalyticsData(userId);
      }
    } catch (err) {
      console.error('Errore nel recupero dati business:', err);
    } finally {
      setAppLoading(false);
    }
  };

  // Fetch Analytics events
  const fetchAnalyticsData = async (tenantId) => {
    try {
      setAnalyticsLoading(true);
      let { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setAnalyticsEvents(data || []);
    } catch (err) {
      console.error('Errore caricamento statistiche:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };


  // Fetch catalog items for selected catalog
  const fetchCatalogItems = async (catalogId) => {
    try {
      let { data, error } = await supabase
        .from('catalog_items')
        .select(`
          id,
          position,
          page_number,
          product_id,
          products (
            id,
            name,
            price,
            description,
            image_url,
            category
          )
        `)
        .eq('catalog_id', catalogId)
        .order('position', { ascending: true });

      if (error) throw error;
      setCatalogItems(data || []);
    } catch (err) {
      console.error('Errore caricamento catalog items:', err);
    }
  };

  // Auth Actions
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      if (isRegistering) {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: {
            data: {
              business_name: authBusinessName
            }
          }
        });
        if (error) throw error;
        alert('Registrazione completata! Verifica la tua email o accedi.');
        setIsRegistering(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword
        });
        if (error) throw error;
      }
    } catch (err) {
      setAuthError(err.message || 'Errore di autenticazione');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Image compression client-side (WebP, max 800px width/height)
  const compressImage = (file) => {
    return new Promise((resolve) => {
      // Se non è un'immagine, procediamo
      if (!file.type.startsWith('image/')) {
        return resolve(file);
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 800;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", { type: "image/webp" });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          }, 'image/webp', 0.85);
        };
        img.onerror = () => resolve(file);
      };
      reader.onerror = () => resolve(file);
    });
  };

  // Image Upload helper
  const handleImageUpload = async (file, folder) => {
    if (!file) return null;
    
    let fileToUpload = file;
    try {
      fileToUpload = await compressImage(file);
    } catch (err) {
      console.warn("Impossibile comprimere l'immagine, uso file originale:", err);
    }

    const fileExt = fileToUpload.name.split('.').pop();
    const fileName = `${session.user.id}/${folder}-${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('assets')
      .upload(fileName, fileToUpload);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('assets')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  // CSV Import Handler
  const handleCsvImport = (file) => {
    setCsvFile(file);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedProducts = results.data.map((row, index) => ({
          id: `csv-${index}`,
          name: row.nome || row.name || '',
          price: row.prezzo || row.price || '',
          description: row.descrizione || row.description || '',
          category: row.categoria || row.category || '',
          image_url: row.immagine || row.image || ''
        }));
        setCsvPreviewProducts(parsedProducts);
        setShowCsvImport(true);
      }
    });
  };

  const confirmCsvImport = async () => {
    if (!csvPreviewProducts.length) return;
    
    setActionLoading(true);
    try {
      for (const product of csvPreviewProducts) {
        await supabase.from('products').insert({
          tenant_id: session.user.id,
          name: product.name,
          price: product.price,
          description: product.description,
          category: product.category,
          image_url: product.image_url
        });
      }
      alert(`${csvPreviewProducts.length} prodotti importati con successo!`);
      setShowCsvImport(false);
      setCsvPreviewProducts([]);
      setCsvFile(null);
      // Refresh products
      fetchTenantData(session.user.id);
    } catch (err) {
      console.error('Errore importazione CSV:', err);
      alert('Errore durante l\'importazione. Riprova.');
    } finally {
      setActionLoading(false);
    }
  };

  // AI Copywriter Helper (Simulated - In production call n8n/Make webhook)
  const generateAiCopy = async () => {
    if (!aiProductInput.name && !aiProductInput.description) return;
    
    setAiLoading(true);
    // Simulated AI response - replace with actual API call to n8n/OpenRouter
    setTimeout(() => {
      const templates = [
        `🔥 OFFERTA IMPERDIBILE! ${aiProductInput.name} a soli €${aiProductInput.price || 'XX'}! ${aiProductInput.description ? aiProductInput.description : 'Qualità eccezionale per te.'} Affrettati, scorte limitate!`,
        `✨ NOVITÀ ESCLUSIVA ✨ ${aiProductInput.name}. ${aiProductInput.description || 'Il miglior prodotto della categoria.'} Vieni a scoprirlo in negozio!`,
        `💥 SUPER PREZZO 💥 ${aiProductInput.name} solo oggi a €${aiProductInput.price || 'XX'}! ${aiProductInput.description || 'Non perdere questa occasione unica.'} Ti aspettiamo!`
      ];
      const randomPick = templates[Math.floor(Math.random() * templates.length)];
      setAiGeneratedText(randomPick);
      setAiLoading(false);
    }, 1500);
  };

  // Onboarding Wizard Handlers
  const completeWizard = async () => {
    setActionLoading(true);
    try {
      let logoUrl = tenant?.logo_url;
      if (wizardData.logo) {
        logoUrl = await handleImageUpload(wizardData.logo, 'logo');
      }
      
      await supabase.from('tenants').update({
        business_name: wizardData.businessName || editBusinessName,
        brand_colors: { primary: wizardData.colors.primary, secondary: wizardData.colors.secondary },
        logo_url: logoUrl,
        sector: wizardData.sector,
        setup_completed: true
      }).eq('id', session.user.id);
      
      setWizardStep(1);
      fetchTenantData(session.user.id);
    } catch (err) {
      console.error('Errore completamento wizard:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Color Extraction Utility
  const extractColorsFromLogo = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 10;
        canvas.height = 10;
        ctx.drawImage(img, 0, 0, 10, 10);
        const imgData = ctx.getImageData(0, 0, 10, 10).data;
        
        let rSum = 0, gSum = 0, bSum = 0, count = 0;
        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i];
          const g = imgData[i+1];
          const b = imgData[i+2];
          const brightness = (r + g + b) / 3;
          const maxDiff = Math.max(Math.abs(r-g), Math.abs(r-b), Math.abs(g-b));
          if (brightness > 30 && brightness < 220 && maxDiff > 15) {
            rSum += r;
            gSum += g;
            bSum += b;
            count++;
          }
        }
        
        const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => {
          const hex = x.toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        }).join('');

        if (count > 0) {
          const primary = rgbToHex(Math.round(rSum/count), Math.round(gSum/count), Math.round(bSum/count));
          const secondary = rgbToHex(Math.round((rSum/count + 128) % 256), Math.round((gSum/count + 128) % 256), Math.round((bSum/count + 128) % 256));
          resolve({ primary, secondary });
        } else {
          resolve({ primary: '#2C5E43', secondary: '#8CB89D' });
        }
      };
    });
  };

  // Onboarding step 1 completion (persistent draft)
  const handleOnboardingStep1Next = async () => {
    try {
      setActionLoading(true);
      let logoUrl = tenant.logo_url;
      
      if (newProductImage) {
        logoUrl = await handleImageUpload(newProductImage, 'logo');
      }

      const { error } = await supabase
        .from('tenants')
        .update({
          business_name: editBusinessName,
          logo_url: logoUrl
        })
        .eq('id', session.user.id);

      if (error) throw error;
      setTenant({ ...tenant, business_name: editBusinessName, logo_url: logoUrl });
      setOnboardingStep(2);
    } catch (err) {
      alert('Errore nel salvare la bozza: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Importazione prodotti da File CSV (Excel) client-side robusto
  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target.result;
        const lines = text.split('\n');
        
        let delimiter = ';';
        if (lines[0].indexOf(';') === -1 && lines[0].indexOf(',') !== -1) {
          delimiter = ',';
        }

        const splitCSVLine = (line, delim) => {
          const result = [];
          let current = '';
          let inQuotes = false;
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === delim && !inQuotes) {
              result.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current.trim());
          return result;
        };

        const headers = splitCSVLine(lines[0], delimiter).map(h => h.trim().toLowerCase());
        const parsedProducts = [];

        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          const values = splitCSVLine(lines[i], delimiter);
          
          const item = {};
          headers.forEach((header, index) => {
            item[header] = values[index] || '';
          });
          
          let rawPrice = item.prezzo || item.price || '0';
          rawPrice = rawPrice.replace(/[^0-9.,]/g, '').replace(',', '.');
          const parsedPrice = parseFloat(rawPrice) || 0;

          parsedProducts.push({
            name: item.nome || item.name || 'Prodotto senza nome',
            price: parsedPrice,
            description: item.descrizione || item.description || '',
            category: item.categoria || item.category || 'Generale',
            image_url: item.immagine || item.image_url || null
          });
        }

        if (parsedProducts.length === 0) throw new Error('Nessun prodotto valido trovato nel file.');
        setCsvPreviewProducts(parsedProducts);
      } catch (err) {
        alert('Errore lettura file CSV: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  // Conferma l'importazione ed esegue upsert (evita duplicati)
  const handleConfirmCSVImport = async () => {
    if (csvPreviewProducts.length === 0) return;
    setActionLoading(true);
    try {
      // Ottiene i prodotti attuali per rilevare duplicati sul nome
      const { data: currentProds, error: fetchErr } = await supabase
        .from('products')
        .select('id, name')
        .eq('tenant_id', session.user.id);
        
      if (fetchErr) throw fetchErr;
      
      const existingNamesMap = {};
      currentProds?.forEach(p => {
        existingNamesMap[p.name.toLowerCase().trim()] = p.id;
      });

      const toUpdate = [];
      const toInsert = [];

      csvPreviewProducts.forEach(item => {
        const key = item.name.toLowerCase().trim();
        if (existingNamesMap[key]) {
          toUpdate.push({
            id: existingNamesMap[key],
            tenant_id: session.user.id,
            name: item.name,
            price: item.price,
            description: item.description,
            category: item.category,
            image_url: item.image_url
          });
        } else {
          toInsert.push({
            tenant_id: session.user.id,
            name: item.name,
            price: item.price,
            description: item.description,
            category: item.category,
            image_url: item.image_url
          });
        }
      });

      if (toInsert.length > 0) {
        const { error: insErr } = await supabase
          .from('products')
          .insert(toInsert);
        if (insErr) throw insErr;
      }

      if (toUpdate.length > 0) {
        for (let prod of toUpdate) {
          const { error: updErr } = await supabase
            .from('products')
            .update({
              price: prod.price,
              description: prod.description,
              category: prod.category,
              image_url: prod.image_url
            })
            .eq('id', prod.id);
          if (updErr) throw updErr;
        }
      }

      alert(`Importazione completata! ${toInsert.length} inseriti, ${toUpdate.length} aggiornati.`);
      setCsvPreviewProducts([]);
      
      let { data: newProds } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      setProducts(newProds || []);
    } catch (err) {
      alert('Errore importazione: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Pubblica Catalogo Online (Flipbook CSS-native)
  const handlePublishFlipbook = async () => {
    if (!selectedCatalog) return alert('Seleziona prima un volantino.');
    
    // Plan enforcement check
    if (tenant?.plan === 'pro') {
      setPublishModal('upgrade');
      return;
    }

    setActionLoading(true);
    try {
      const slug = `${selectedCatalog.id}-${Date.now()}`;
      let pagesHtml = '';

      // Pagina Copertina
      pagesHtml += `
        <div class="page">
          <div class="front cover-page" style="border-left: 8px solid ${tenant.brand_colors?.primary || '#1E3A8A'};">
            <div class="cover-content">
              ${tenant.logo_url ? `<img src="${tenant.logo_url}" class="book-logo" />` : ''}
              <h1 style="color: ${tenant.brand_colors?.primary || '#1E3A8A'};">${selectedCatalog.name}</h1>
              <h3>${tenant.business_name}</h3>
              <p class="promo-tag">Sfoglia le nostre offerte esclusive</p>
              <div class="swipe-hint">Tocca per sfogliare →</div>
            </div>
          </div>
          <div class="back">
            <div class="page-header-small">${tenant.business_name}</div>
            <div class="page-content-inside">
              <p>Offerte valide fino a esaurimento scorte.</p>
            </div>
          </div>
        </div>
      `;

      const currentTpl = selectedCatalog.layout_config?.template || 'grid-3';
      const pageSize = getEffectivePageSize(selectedCatalog);
      
      const getLayoutClass = (tpl) => {
        switch (tpl) {
          case 'alimentari_prezzone_impatto': return 'layout-prezzone';
          case 'alimentari_spesa_difesa': return 'layout-spesa-difesa';
          case 'alimentari_bancone_freschi': return 'layout-bancone-freschi';
          case 'alimentari_combo_offerta': return 'layout-combo';
          case 'alimentari_griglia_stock': return 'layout-griglia-stock';
          case 'abbigliamento_lookbook_minimal': return 'layout-lookbook';
          case 'abbigliamento_split_verticale': return 'layout-split';
          case 'abbigliamento_outfit_completo': return 'layout-outfit';
          case 'abbigliamento_catalogo_accessori': return 'layout-accessori';
          case 'ferramenta_fai_da_te': return 'layout-fai-da-te';
          case 'ferramenta_vetrina_3col': return 'layout-vetrina-3col';
          case 'ferramenta_offerte_pallet': return 'layout-pallet';
          case 'tech_grande_occasione': return 'layout-tech-single';
          case 'tech_tutto_telefonia': return 'layout-telefonia';
          case 'tech_grandi_elettro': return 'layout-grandi-elettro';
          case 'tech_accessori_multi': return 'layout-tech-accessori';
          case 'green_vetrina_fioriti': return 'layout-green-vetrina';
          case 'beauty_spa_editoriale': return 'layout-beauty-spa';
          case 'beauty_parafarmacia': return 'layout-parafarmacia';
          case 'beauty_last_minute': return 'layout-last-minute';
          
          case 'list-classic': return 'products-list-layout';
          case 'hero-featured': return 'products-hero-featured-layout';
          case 'grid-2': return 'products-grid-layout grid-2-columns';
          case 'grid-3':
          default: return 'products-grid-layout';
        }
      };

      const generateItemHtml = (item, index, p) => {
        const product = item.products;
        const pos = index + 1;
        const isWeight = (product.description && (product.description.toLowerCase().includes('kg') || product.description.toLowerCase().includes('all\'etto') || product.description.toLowerCase().includes('all-etto') || product.description.toLowerCase().includes('peso'))) || (product.category && (product.category.toLowerCase().includes('kg') || product.category.toLowerCase().includes('all\'etto') || product.category.toLowerCase().includes('all-etto') || product.category.toLowerCase().includes('peso')));

        const waLink = tenant.whatsapp_phone ? `
          <div style="display: flex; align-items: center; gap: 4px; margin-top: auto; justify-content: space-between; width: 100%;">
            <div class="qty-selector" style="display: inline-flex; align-items: center; background: #f1f5f9; border-radius: 4px; padding: 2px; border: 1px solid #cbd5e1;" onclick="event.stopPropagation();">
              <button class="qty-btn minus" style="background: none; border: none; padding: 1px 5px; font-weight: bold; cursor: pointer; font-size: 10px; line-height: 1;" onclick="event.stopPropagation(); changeQty(this, -1)">-</button>
              <span class="qty-val" style="padding: 0 4px; font-size: 10px; font-weight: bold;">1</span>
              <button class="qty-btn plus" style="background: none; border: none; padding: 1px 5px; font-weight: bold; cursor: pointer; font-size: 10px; line-height: 1;" onclick="event.stopPropagation(); changeQty(this, 1)">+</button>
            </div>
            <button class="bp-wa-btn" 
                    style="background-color: #25D366; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; cursor: pointer; display: inline-flex; align-items: center; line-height: 1.2;"
                    data-is-weight="${isWeight}"
                    onclick="sendOrder(this, '${product.name.replace(/'/g, "\\'")}', ${product.price})">
              Ordina
            </button>
          </div>
        ` : '';

        // DEC-06: Lazy loading progressivo delle immagini per le pagine successive alla seconda (p > 1)
        const isLazy = p > 1;
        const imgAttr = (url) => isLazy ? `data-src="${url}" src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'></svg>"` : `src="${url}"`;
        const bgStyle = (url) => isLazy ? `data-bg="${url}" style="background-color: #f1f5f9; background-size: cover; background-position: center;"` : `style="background-image: url('${url}'); background-size: cover; background-position: center;"`;

        switch (currentTpl) {
          case 'alimentari_prezzone_impatto':
            return `
              <div class="card-prezzone">
                <div class="prezzone-badge">SOTTOCOSTO</div>
                ${product.image_url ? `<div class="image-container" ${bgStyle(product.image_url)}></div>` : ''}
                <div class="prezzone-body">
                  <h4 style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden; margin: 0 0 4px 0;">${product.name}</h4>
                  <div class="price-row-vertical">
                    <span class="price-tag">€${product.price.toFixed(2)}</span>
                    <small class="price-unit">al kg</small>
                  </div>
                </div>
                <div style="padding: 0 12px 12px 12px; display: flex; justify-content: flex-end; margin-top: auto;">
                  ${waLink}
                </div>
              </div>
            `;
          case 'alimentari_spesa_difesa':
            return `
              <div class="card-spesa-difesa">
                <div class="sd-badge">Novità</div>
                ${product.image_url ? `<img ${imgAttr(product.image_url)} alt="${product.name}" />` : ''}
                <h4 style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden; margin: 2px 0; width: 100%; text-align: center;">${product.name}</h4>
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-top: auto;">
                  <span class="price">€${product.price.toFixed(2)}</span>
                  ${waLink}
                </div>
              </div>
            `;
          case 'alimentari_bancone_freschi':
            return `
              <div class="row-fresco">
                ${product.image_url ? `<img ${imgAttr(product.image_url)} class="img-block" alt="${product.name}" />` : '<div class="img-block empty"></div>'}
                <div class="desc-block">
                  <strong style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">${product.name}</strong>
                  <p>${product.description || 'Prodotto fresco selezionato con cura'}</p>
                  <span class="provenienza">Campania</span>
                </div>
                <div class="price-block">
                  <span class="price-num">€${product.price.toFixed(2)}</span>
                  <small class="price-unit">all'etto</small>
                  <div style="margin-top: 4px;">${waLink}</div>
                </div>
              </div>
            `;
          case 'alimentari_combo_offerta':
            return `
              <div class="combo-block">
                <div class="combo-items">
                  ${product.image_url ? `<img ${imgAttr(product.image_url)} alt="${product.name}" style="width: 45%; height: 80px; object-fit: cover; border-radius: 4px;" />` : ''}
                  <div class="combo-plus-icon">+</div>
                  <div class="combo-second-placeholder" style="width: 45%; height: 80px; background: #e2e8f0; border-radius: 4px; display: flex; align-items: center; justify-content: center; fontSize: 10px; color: #64748b">
                    Omaggio
                  </div>
                </div>
                <div class="combo-price-zone">
                  <small class="combo-label">COMBO</small>
                  <span class="price">€${product.price.toFixed(2)}</span>
                  <div style="margin-top: 4px;">${waLink}</div>
                </div>
              </div>
            `;
          case 'alimentari_griglia_stock':
            return `
              <div class="card-stock">
                ${product.image_url ? `<img ${imgAttr(product.image_url)} alt="${product.name}" />` : ''}
                <span class="stock-title" style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden; width: 100%; text-align: center;">${product.name}</span>
                <div class="price-badge">€${product.price.toFixed(2)}</div>
                <div style="margin-top: 4px; display: flex; justify-content: center;">${waLink}</div>
              </div>
            `;
          case 'abbigliamento_lookbook_minimal':
            return `
              <div class="layout-lookbook">
                ${product.image_url ? `<div class="lookbook-image" ${bgStyle(product.image_url)} style="height: 260px; border-radius: 6px;"></div>` : '<div class="lookbook-image empty" style="height: 260px; background: #e2e8f0;"></div>'}
                <div class="lookbook-details">
                  <small class="collection-tag">Nuova Collezione</small>
                  <h3 class="lookbook-title" style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden; margin: 4px 0;">${product.name}</h3>
                  <p class="lookbook-desc" style="font-size: 11px; margin: 4px 0; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">${product.description || ''}</p>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
                    <span class="lookbook-price">€${product.price.toFixed(2)}</span>
                    ${waLink}
                  </div>
                </div>
              </div>
            `;
          case 'abbigliamento_split_verticale':
            return `
              <div class="split-pane ${pos % 2 === 0 ? 'right' : 'left'}">
                <span class="column-tag">${pos % 2 === 0 ? 'DONNA' : 'UOMO'}</span>
                ${product.image_url ? `<img ${imgAttr(product.image_url)} alt="${product.name}" />` : ''}
                <div class="split-info">
                  <h4 style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden; margin: 0;">${product.name}</h4>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
                    <span class="price">€${product.price.toFixed(2)}</span>
                    ${waLink}
                  </div>
                </div>
              </div>
            `;
          case 'abbigliamento_outfit_completo':
            const isOutfitHero = pos === 1;
            return `
              <div class="${isOutfitHero ? 'outfit-hero' : 'outfit-item-small'}">
                ${product.image_url ? `<img ${imgAttr(product.image_url)} alt="${product.name}" />` : ''}
                <div class="outfit-info">
                  ${isOutfitHero ? `<h3 style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden; margin: 6px 0 2px 0;">${product.name}</h3>` : `<h4 style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden; margin: 2px 0; text-align: center; width: 90%;">${product.name}</h4>`}
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto; width: 100%;">
                    <span class="price">€${product.price.toFixed(2)}</span>
                    ${waLink}
                  </div>
                </div>
              </div>
            `;
          case 'abbigliamento_catalogo_accessori':
            const isAccessoryTop = pos === 1;
            return `
              <div class="${isAccessoryTop ? 'accessori-top' : 'accessories-card-small'}">
                ${product.image_url ? `<img ${imgAttr(product.image_url)} alt="${product.name}" />` : ''}
                <div class="accessori-info">
                  ${isAccessoryTop ? `
                    <span class="top-banner">BEST SELLER</span>
                    <h3 style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden; margin: 6px 0;">${product.name}</h3>
                  ` : `<h4 style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden; margin: 2px 0; width: 90%;">${product.name}</h4>`}
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto; width: 100%;">
                    <span class="price">€${product.price.toFixed(2)}</span>
                    ${waLink}
                  </div>
                </div>
              </div>
            `;
          case 'ferramenta_fai_da_te':
            return `
              <div class="card-tecnica">
                ${product.image_url ? `<img ${imgAttr(product.image_url)} class="card-tecnica-image" alt="${product.name}" />` : ''}
                <div class="card-tecnica-info">
                  <h4 style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden; margin: 0;">${product.name}</h4>
                  <table class="specs-table">
                    <tbody>
                      <tr>
                        <td>Alimentazione:</td>
                        <td>230V / Batteria</td>
                      </tr>
                    </tbody>
                  </table>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto; width: 100%;">
                    <span class="price-tag">€${product.price.toFixed(2)}</span>
                    ${waLink}
                  </div>
                </div>
              </div>
            `;
          case 'ferramenta_vetrina_3col':
            return `
              <div class="col-vetrina">
                <div class="brand-header">PROFESSIONALE</div>
                ${product.image_url ? `<img ${imgAttr(product.image_url)} alt="${product.name}" style="height: 100px; object-fit: contain; width: 100%;" />` : ''}
                <div class="vetrina-body">
                  <h4 style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden; margin: 6px 0;">${product.name}</h4>
                  <span class="accessories-badge">Valigetta</span>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto; width: 100%;">
                    <span class="price-tag">€${product.price.toFixed(2)}</span>
                    ${waLink}
                  </div>
                </div>
              </div>
            `;
          case 'ferramenta_offerte_pallet':
            return `
              <div class="pallet-card">
                ${product.image_url ? `<img ${imgAttr(product.image_url)} alt="${product.name}" style="width: 40%; height: 80px; object-fit: cover;" />` : ''}
                <div class="pallet-body" style="padding-left: 12px; flex: 1; display: flex; flex-direction: column;">
                  <h4 style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden; margin: 0; width: 100%;">${product.name}</h4>
                  <div class="pallet-price-box">
                    <small class="discount">-35%</small>
                    <span class="price">€${product.price.toFixed(2)}</span>
                  </div>
                  <div style="margin-top: auto; display: flex; justify-content: flex-end;">${waLink}</div>
                </div>
              </div>
            `;
          case 'tech_grande_occasione':
            return `
              <div class="layout-tech-single">
                <span class="finance-badge">TASSO ZERO</span>
                ${product.image_url ? `<img ${imgAttr(product.image_url)} class="tech-image-hero" alt="${product.name}" />` : ''}
                <div class="tech-details" style="text-align: center;">
                  <h2 style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden; margin: 4px 0; color: white;">${product.name}</h2>
                  <div class="tech-specs-circles">
                    <div class="spec-circle"><strong>5G</strong><small>Rete</small></div>
                    <div class="spec-circle"><strong>12GB</strong><small>RAM</small></div>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
                    <span class="price">€${product.price.toFixed(2)}</span>
                    ${waLink}
                  </div>
                </div>
              </div>
            `;
          case 'tech_tutto_telefonia':
            return `
              <div class="phone-card">
                <span class="phone-badge-gb">256GB</span>
                ${product.image_url ? `<img ${imgAttr(product.image_url)} alt="${product.name}" style="width: 35%; height: 70px; object-fit: contain;" />` : ''}
                <div class="phone-info" style="padding-left: 8px; flex: 1;">
                  <h4 style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden; margin: 0;">${product.name}</h4>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
                    <span class="price">€${product.price.toFixed(2)}</span>
                    ${waLink}
                  </div>
                </div>
              </div>
            `;
          case 'tech_grandi_elettro':
            return `
              <div class="elettro-row">
                ${product.image_url ? `<img ${imgAttr(product.image_url)} alt="${product.name}" style="width: 25%; height: 70px; object-fit: contain;" />` : ''}
                <div class="elettro-desc" style="width: 50%; padding: 0 8px;">
                  <strong style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">${product.name}</strong>
                </div>
                <div class="elettro-energy" style="width: 25%; display: flex; flex-direction: column; align-items: center;">
                  <span class="energy-label energy-A">Classe A</span>
                  <span class="price" style="font-weight: bold; margin-top: 2px;">€${product.price.toFixed(2)}</span>
                  <div style="margin-top: auto;">${waLink}</div>
                </div>
              </div>
            `;
          case 'tech_accessori_multi':
            return `
              <div class="tech-acc-card">
                ${product.image_url ? `<img ${imgAttr(product.image_url)} alt="${product.name}" style="height: 60px; object-fit: contain;" />` : ''}
                <div class="tech-acc-body">
                  <h4 style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden; margin: 2px 0;">${product.name}</h4>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
                    <span class="price">€${product.price.toFixed(2)}</span>
                    ${waLink}
                  </div>
                </div>
              </div>
            `;
          case 'green_vetrina_fioriti':
            return `
              <div class="green-card">
                ${product.image_url ? `<img ${imgAttr(product.image_url)} alt="${product.name}" style="width: 100%; height: 90px; object-fit: cover; border-radius: 12px;" />` : ''}
                <div class="green-body" style="padding: 4px 0;">
                  <h4 style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden; margin: 4px 0;">${product.name}</h4>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
                    <span class="price">€${product.price.toFixed(2)}</span>
                    ${waLink}
                  </div>
                </div>
              </div>
            `;
          case 'beauty_spa_editoriale':
            const isSpaHero = pos === 1;
            return `
              <div class="${isSpaHero ? 'beauty-hero' : 'beauty-small-card'}">
                ${product.image_url ? `<img ${imgAttr(product.image_url)} alt="${product.name}" />` : ''}
                <div class="beauty-body">
                  ${isSpaHero ? `<h3 style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden; margin: 4px 0;">${product.name}</h3>` : `<h4 style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden; margin: 2px 0;">${product.name}</h4>`}
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto; width: 100%;">
                    <span class="price">€${product.price.toFixed(2)}</span>
                    ${waLink}
                  </div>
                </div>
              </div>
            `;
          case 'beauty_parafarmacia':
            return `
              <div class="parafarmacia-card">
                <div class="discount-badge-circle">-25%</div>
                ${product.image_url ? `<img ${imgAttr(product.image_url)} alt="${product.name}" style="width: 100%; height: 80px; object-fit: contain;" />` : ''}
                <div class="parafarmacia-body" style="padding-top: 4px;">
                  <h4 style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden; margin: 0;">${product.name}</h4>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
                    <span class="price">€${product.price.toFixed(2)}</span>
                    ${waLink}
                  </div>
                </div>
              </div>
            `;
          case 'beauty_last_minute':
            return `
              <div class="card-flash">
                <div class="flash-header">${product.category || 'Solo 48 ore'}</div>
                ${product.image_url ? `<img ${imgAttr(product.image_url)} alt="${product.name}" style="width: 100%; height: 80px; object-fit: cover;" />` : ''}
                <div class="flash-body" style="padding: 4px;">
                  <h4 style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden; margin: 2px 0;">${product.name}</h4>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
                    <span class="price">€${product.price.toFixed(2)}</span>
                    ${waLink}
                  </div>
                </div>
              </div>
            `;
          default:
            return `
              <div class="book-product-card" data-product-name="${product.name.replace(/"/g, '&quot;')}">
                ${product.image_url ? `<img ${imgAttr(product.image_url)} class="bp-img" loading="lazy" />` : ''}
                <div class="bp-body">
                  <h4 style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden; margin: 0 0 4px 0;">${product.name}</h4>
                  <p>${product.description || ''}</p>
                  <div class="bp-price-row" style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
                    <span class="bp-price" style="color: ${tenant.brand_colors?.primary || '#1E3A8A'}; font-weight: bold; font-size: 12px;">
                      €${product.price.toFixed(2)}
                    </span>
                    ${waLink}
                  </div>
                </div>
              </div>
            `;
        }
      };

      const totalPages = Math.ceil(catalogItems.length / pageSize);

      for (let p = 0; p < totalPages; p++) {
        const pageItems = catalogItems.slice(p * pageSize, (p + 1) * pageSize);
        
        pagesHtml += `
          <div class="page">
            <div class="front" style="border-left: 6px solid ${tenant.brand_colors?.primary || '#1E3A8A'}; display: flex; flex-direction: column;">
              <div class="page-header-small" style="color: ${tenant.brand_colors?.primary || '#1E3A8A'}; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 12px; font-size: 12px; font-weight: bold;">
                ${selectedCatalog.name} - Pagina ${p + 1}
              </div>
              <div class="flyer-layouts-container ${getLayoutClass(currentTpl)}" style="display: ${currentTpl === 'list-classic' ? 'flex' : 'grid'}; flex-direction: column; gap: 8px; flex: 1;">
                ${pageItems.map((item, index) => generateItemHtml(item, index, p)).join('')}
              </div>
            </div>
            <div class="back" style="display: flex; flex-direction: column; justify-content: space-between;">
              <div class="page-header-small" style="border-bottom: 2px solid ${tenant.brand_colors?.primary || '#1E3A8A'}; color: ${tenant.brand_colors?.primary || '#1E3A8A'};">
                ${tenant.business_name}
              </div>
              <div class="page-content-inside text-center" style="display: flex; flex-direction: column; justify-content: center; align-items: center; flex: 1;">
                <p style="font-size: 12px; color: #64748b;">Sfoglia la pagina successiva per scoprire altre novità!</p>
              </div>
            </div>
          </div>
        `;
      }

      // Copertina Finale
      pagesHtml += `
        <div class="page">
          <div class="front back-cover-page" style="border-right: 8px solid ${tenant.brand_colors?.primary || '#1E3A8A'};">
            <div class="cover-content">
              <h2>Ti aspettiamo in Negozio!</h2>
              <p>Seguici per non perdere le prossime offerte.</p>
              ${tenant.logo_url ? `<img src="${tenant.logo_url}" class="book-logo" />` : ''}
            </div>
          </div>
          <div class="back"></div>
        </div>
      `;

      // Static HTML template builder
      const staticHtml = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\${selectedCatalog.name} - \${tenant.business_name}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background: #0f172a;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      font-family: 'Plus Jakarta Sans', sans-serif;
      overflow: hidden;
    }
    .book {
      width: 380px;
      height: 560px;
      position: relative;
      perspective: 1500px;
    }
    .page {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      transform-style: preserve-3d;
      transform-origin: left center;
      transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
    }
    .page.flipped {
      transform: rotateY(-180deg);
    }
    .front, .back {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      backface-visibility: hidden;
      background: #fff;
      color: #333;
      box-sizing: border-box;
      padding: 24px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      display: flex;
      flex-direction: column;
      border-radius: 4px;
    }
    .back {
      transform: rotateY(180deg);
    }
    .cover-page, .back-cover-page {
      background: #fafafa;
      justify-content: center;
      align-items: center;
      text-align: center;
    }
    .book-logo {
      max-height: 60px;
      margin-bottom: 24px;
    }
    .cover-page h1 {
      font-size: 24px;
      margin: 12px 0;
    }
    .cover-page h3 {
      font-size: 16px;
      color: #64748b;
    }
    .promo-tag {
      margin-top: 40px;
      font-weight: bold;
      color: #dc2626;
    }
    .swipe-hint {
      margin-top: auto;
      font-size: 11px;
      color: #94a3b8;
    }
    .page-header-small {
      font-size: 11px;
      font-weight: 700;
      padding-bottom: 8px;
      margin-bottom: 16px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    /* ==========================================================================
       IL MIO VOLANTINO - 20 LAYOUT STRUTTURALI DEDICATI
       ========================================================================== */

    .flyer-layouts-container {
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      display: grid;
      flex: 1;
    }

    /* 1. Prezzone d'Impatto (alimentari_prezzone_impatto) */
    .layout-prezzone {
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(2, 1fr);
      gap: 8px;
    }
    .card-prezzone {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border: 1.5px solid var(--primary-color);
      border-radius: 6px;
      overflow: hidden;
      position: relative;
      background: white;
      min-height: 130px;
    }
    .card-prezzone .image-container {
      height: 70px;
      background-size: cover;
      background-position: center;
    }
    .card-prezzone .prezzone-badge {
      position: absolute;
      top: 4px;
      left: 4px;
      background-color: #dc2626;
      color: white;
      font-size: 7px;
      font-weight: 800;
      padding: 1px 4px;
      border-radius: 2px;
      z-index: 2;
    }
    .card-prezzone .prezzone-body {
      padding: 6px;
    }
    .card-prezzone h4 {
      font-size: 10px;
      margin: 0 0 2px 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .card-prezzone .price-row-vertical {
      display: flex;
      flex-direction: column;
      line-height: 1.1;
    }
    .card-prezzone .price-tag {
      font-size: 14px;
      font-weight: 900;
      color: var(--primary-color);
    }
    .card-prezzone .price-unit {
      font-size: 7px;
      color: #64748b;
    }

    /* 2. Spesa Difesa (alimentari_spesa_difesa) */
    .layout-spesa-difesa {
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(3, 1fr);
      gap: 4px;
    }
    .card-spesa-difesa {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: 4px;
      border: 1px solid #e2e8f0;
      background-color: #ffffff;
      border-radius: 4px;
      position: relative;
      min-height: 75px;
    }
    .card-spesa-difesa img {
      max-height: 30px;
      object-fit: contain;
    }
    .card-spesa-difesa h4 {
      font-size: 8px;
      text-align: center;
      margin: 2px 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 100%;
    }
    .card-spesa-difesa .price {
      font-size: 10px;
      font-weight: 800;
      color: #000000;
    }
    .card-spesa-difesa .sd-badge {
      position: absolute;
      top: 1px;
      right: 1px;
      background: var(--secondary-color);
      color: #000;
      font-size: 5px;
      font-weight: bold;
      padding: 1px 2px;
      border-radius: 1px;
    }

    /* 3. Bancone dei Freschi (alimentari_bancone_freschi) */
    .layout-bancone-freschi {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .row-fresco {
      display: flex;
      align-items: center;
      height: 52px;
      border-bottom: 1px dashed var(--secondary-color);
      padding-bottom: 4px;
      background: white;
    }
    .row-fresco .img-block {
      width: 40px;
      height: 40px;
      object-fit: cover;
      border-radius: 4px;
      flex-shrink: 0;
    }
    .row-fresco .desc-block {
      flex: 1;
      padding: 0 8px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .row-fresco .desc-block strong {
      font-size: 10px;
    }
    .row-fresco .desc-block p {
      font-size: 8px;
      color: #64748b;
      margin: 1px 0 0 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .row-fresco .desc-block .provenienza {
      font-size: 7px;
      color: var(--primary-color);
      font-weight: bold;
    }
    .row-fresco .price-block {
      width: 55px;
      background: var(--secondary-color);
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 2px;
      height: 38px;
      flex-shrink: 0;
    }
    .row-fresco .price-num {
      font-size: 10px;
      font-weight: 900;
    }
    .row-fresco .price-unit {
      font-size: 6px;
      font-weight: bold;
      text-transform: uppercase;
    }

    /* 4. Combo Offerta (alimentari_combo_offerta) */
    .layout-combo {
      grid-template-rows: repeat(2, 1fr);
      gap: 8px;
    }
    .combo-block {
      display: flex;
      border: 1.5px solid var(--secondary-color);
      border-radius: 6px;
      overflow: hidden;
      background: #fffbf0;
      height: 95px;
    }
    .combo-items {
      display: flex;
      width: 70%;
      justify-content: space-around;
      align-items: center;
      position: relative;
      padding: 4px;
    }
    .combo-plus-icon {
      font-size: 14px;
      font-weight: bold;
      color: var(--secondary-color);
    }
    .combo-price-zone {
      width: 30%;
      background-color: var(--secondary-color);
      color: white;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 4px;
    }
    .combo-price-zone .combo-label {
      font-size: 7px;
      font-weight: bold;
    }
    .combo-price-zone .price {
      font-size: 13px;
      font-weight: 900;
    }

    /* 5. Griglia Stock (alimentari_griglia_stock) */
    .layout-griglia-stock {
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(4, 1fr);
      gap: 3px;
      background-color: #f1f5f9;
    }
    .card-stock {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      padding: 2px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      font-size: 7px;
      min-height: 52px;
    }
    .card-stock img {
      height: 20px;
      object-fit: contain;
    }
    .card-stock .stock-title {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 100%;
      text-align: center;
    }
    .card-stock .price-badge {
      background-color: #000;
      color: #fff;
      text-align: center;
      font-weight: bold;
      border-radius: 2px;
      font-size: 7px;
      padding: 1px 2px;
      width: 90%;
    }

    /* 6. Lookbook Minimal (abbigliamento_lookbook_minimal) */
    .layout-lookbook {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 12px;
      background-color: #faf9f6;
    }
    .lookbook-image {
      flex-grow: 1;
      border-radius: 4px;
    }
    .lookbook-details {
      margin-top: 8px;
      text-align: center;
    }
    .lookbook-details .collection-tag {
      font-size: 8px;
      text-transform: uppercase;
      color: #64748b;
    }
    .lookbook-title {
      font-family: serif;
      font-size: 14px;
      color: #1a1a1a;
      margin: 2px 0;
    }
    .lookbook-desc {
      font-size: 8px;
      color: #666;
    }
    .lookbook-price {
      font-size: 13px;
      color: #111;
      font-weight: bold;
    }

    /* 7. Split Lui & Lei (abbigliamento_split_verticale) */
    .layout-split {
      grid-template-columns: repeat(2, 1fr);
      height: 100%;
    }
    .split-pane {
      display: flex;
      flex-direction: column;
      padding: 10px;
      justify-content: space-between;
      background: white;
    }
    .split-pane.left {
      border-right: 1px solid #e5e7eb;
      background-color: #f3f4f6;
    }
    .split-pane.right {
      background-color: #fdf2f8;
    }
    .split-pane img {
      height: 110px;
      object-fit: cover;
      border-radius: 4px;
    }
    .split-pane .column-tag {
      font-size: 7px;
      font-weight: 800;
      color: var(--primary-color);
    }
    .split-pane h4 {
      font-size: 9px;
      margin: 0;
    }
    .split-pane .price {
      font-size: 10px;
      font-weight: bold;
    }

    /* 8. Outfit Completo (abbigliamento_outfit_completo) */
    .layout-outfit {
      grid-template-columns: 1.2fr 0.8fr;
      gap: 6px;
      padding: 6px;
      height: 100%;
    }
    .outfit-hero {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border: 1px solid #ddd;
      padding: 6px;
      background: #ffffff;
      border-radius: 4px;
    }
    .outfit-hero img {
      height: 130px;
      object-fit: cover;
      border-radius: 2px;
    }
    .outfit-hero h3 {
      font-size: 10px;
      margin: 4px 0 2px 0;
    }
    .outfit-hero .price {
      font-size: 11px;
      font-weight: bold;
      color: var(--primary-color);
    }
    .outfit-item-small {
      border: 1px solid #ddd;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: 2px;
      background: #ffffff;
      border-radius: 4px;
      font-size: 8px;
      min-height: 65px;
    }
    .outfit-item-small img {
      height: 30px;
      object-fit: contain;
    }
    .outfit-item-small h4 {
      margin: 1px 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 90%;
      text-align: center;
    }

    /* 9. Catalogo Accessori (abbigliamento_catalogo_accessori) */
    .layout-accessori {
      grid-template-rows: 1.2fr 0.8fr;
      gap: 6px;
      padding: 6px;
      height: 100%;
    }
    .accessori-top {
      display: flex;
      border: 1px solid #eaeaea;
      background: #fff;
      padding: 6px;
      border-radius: 4px;
    }
    .accessori-top img {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 4px;
    }
    .accessori-top .accessori-info {
      flex: 1;
      padding-left: 10px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .accessori-top .top-banner {
      font-size: 6px;
      background-color: #000;
      color: #fff;
      padding: 1px 4px;
      border-radius: 2px;
      align-self: flex-start;
      font-weight: bold;
    }
    .accessori-top h3 {
      font-size: 11px;
      margin: 4px 0;
    }
    .accessori-top .price {
      font-size: 12px;
      font-weight: 800;
    }
    .accessories-card-small {
      border: 1px solid #eaeaea;
      background: #fff;
      padding: 2px;
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      border-radius: 4px;
      min-height: 70px;
    }
    .accessories-card-small img {
      height: 30px;
      object-fit: contain;
    }
    .accessories-card-small h4 {
      font-size: 8px;
      margin: 1px 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 90%;
    }

    /* 10. Fai da Te (ferramenta_fai_da_te) */
    .layout-fai-da-te {
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(3, 1fr);
      gap: 6px;
      padding: 6px;
    }
    .card-tecnica {
      border: 1px solid #475569;
      border-radius: 4px;
      background-color: #f8fafc;
      padding: 4px;
      display: flex;
      min-height: 70px;
    }
    .card-tecnica-image {
      width: 35%;
      object-fit: contain;
    }
    .card-tecnica-info {
      width: 65%;
      padding-left: 4px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .card-tecnica-info h4 {
      font-size: 9px;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .specs-table {
      font-size: 6px;
      color: #475569;
      border-top: 1px solid #cbd5e1;
      margin-top: 2px;
      width: 100%;
    }
    .card-tecnica-info .price-tag {
      font-size: 10px;
      font-weight: 800;
    }

    /* 11. Vetrina Elettroutensili (ferramenta_vetrina_3col) */
    .layout-vetrina-3col {
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
      padding: 6px;
    }
    .col-vetrina {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      background: #ffffff;
      padding: 6px;
      position: relative;
      min-height: 150px;
    }
    .col-vetrina .brand-header {
      font-size: 7px;
      font-weight: 800;
      color: var(--primary-color);
      border-bottom: 1px solid var(--secondary-color);
      text-transform: uppercase;
      padding-bottom: 2px;
      margin-bottom: 4px;
    }
    .col-vetrina h4 {
      font-size: 9px;
      margin: 4px 0;
    }
    .col-vetrina .accessories-badge {
      font-size: 6px;
      background-color: #f1f5f9;
      padding: 1px 3px;
      border-radius: 2px;
      align-self: flex-start;
    }

    /* 12. Offerte Pallet (ferramenta_offerte_pallet) */
    .layout-pallet {
      grid-template-rows: repeat(2, 1fr);
      gap: 8px;
    }
    .pallet-card {
      background-color: #fef08a;
      border: 2px dashed #b45309;
      border-radius: 6px;
      display: flex;
      padding: 8px;
      height: 95px;
    }
    .pallet-card h4 {
      font-size: 10px;
      margin: 0;
    }
    .pallet-card .qty {
      font-size: 8px;
      color: #b45309;
      font-weight: bold;
    }
    .pallet-price-box {
      margin-left: auto;
      background-color: #b45309;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      transform: rotate(-2deg);
      min-width: 60px;
    }
    .pallet-price-box .discount {
      font-size: 7px;
    }
    .pallet-price-box .price {
      font-size: 12px;
      font-weight: 900;
    }

    /* 13. Grande Occasione Tech (tech_grande_occasione) */
    .layout-tech-single {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
      padding: 16px;
      background: radial-gradient(circle, #2563eb 0%, #1e3a8a 100%);
      color: #ffffff;
      border-radius: 4px;
    }
    .layout-tech-single .tech-image-hero {
      height: 100px;
      object-fit: contain;
    }
    .layout-tech-single .tech-specs-circles {
      display: flex;
      justify-content: space-around;
      margin: 8px 0;
    }
    .layout-tech-single .spec-circle {
      width: 38px;
      height: 38px;
      background-color: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      font-size: 7px;
    }
    .layout-tech-single .finance-badge {
      background-color: #ef4444;
      text-align: center;
      padding: 1px 6px;
      font-weight: 800;
      border-radius: 2px;
      font-size: 8px;
      align-self: center;
    }
    .layout-tech-single h2 {
      font-size: 13px;
      color: white;
      margin: 4px 0;
    }

    /* 14. Tutto Telefonia (tech_tutto_telefonia) */
    .layout-telefonia {
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(3, 1fr);
      gap: 6px;
      padding: 6px;
    }
    .phone-card {
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      background: white;
      padding: 4px;
      display: flex;
      position: relative;
      min-height: 70px;
    }
    .phone-badge-gb {
      position: absolute;
      top: 2px;
      right: 2px;
      background: #2563eb;
      color: white;
      font-weight: bold;
      padding: 1px 3px;
      font-size: 6px;
      border-radius: 1px;
    }
    .phone-card h4 {
      font-size: 9px;
      margin: 0;
    }
    .phone-card .warranty {
      font-size: 7px;
      color: #64748b;
    }

    /* 15. Grandi Elettrodomestici (tech_grandi_elettro) */
    .layout-grandi-elettro {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .elettro-row {
      display: flex;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 4px;
      height: 52px;
      align-items: center;
      background: #ffffff;
    }
    .elettro-row img {
      width: 38px;
      height: 38px;
      object-fit: contain;
    }
    .elettro-desc {
      flex: 1;
      padding: 0 8px;
    }
    .elettro-desc strong {
      font-size: 9px;
    }
    .elettro-energy {
      width: 60px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .elettro-energy .energy-label {
      font-size: 7px;
      font-weight: bold;
      color: #fff;
      padding: 1px 3px;
      border-radius: 2px;
      text-transform: uppercase;
    }
    .elettro-energy .energy-A { background-color: #15803d; }
    .elettro-energy .price {
      font-size: 10px;
      font-weight: bold;
    }

    /* 16. Accessori Tech (tech_accessori_multi) */
    .layout-tech-accessori {
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(2, 1fr);
      gap: 4px;
      padding: 4px;
    }
    .tech-acc-card {
      background-color: #f1f5f9;
      border: 1px solid #334155;
      font-family: monospace;
      padding: 4px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      border-radius: 4px;
      min-height: 95px;
    }
    .tech-acc-card img {
      height: 38px;
      object-fit: contain;
    }
    .tech-acc-card h4 {
      font-size: 8px;
      margin: 2px 0;
      text-align: center;
    }

    /* 17. Vetrina Green (green_vetrina_fioriti) */
    .layout-green-vetrina {
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(2, 1fr);
      gap: 8px;
      padding: 8px;
      background-color: #f0fdf4;
      border-radius: 4px;
    }
    .green-card {
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.02);
      padding: 6px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 120px;
    }
    .green-card h4 {
      font-size: 10px;
      margin: 2px 0;
    }
    .green-specs-icons {
      display: flex;
      gap: 3px;
    }
    .green-icon-indicator {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #dcfce7;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 7px;
    }

    /* 18. Promo Beauty & Spa (beauty_spa_editoriale) */
    .layout-beauty-spa {
      grid-template-columns: 1.1fr 0.9fr;
      gap: 8px;
      padding: 8px;
      background-color: #fafaf9;
    }
    .beauty-hero {
      border: 1px solid #e7e5e4;
      background: white;
      padding: 6px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border-radius: 4px;
    }
    .beauty-hero img {
      height: 110px;
      object-fit: cover;
    }
    .beauty-hero h3 {
      font-size: 10px;
      margin: 4px 0;
    }
    .beauty-hero .price {
      font-size: 11px;
      font-weight: bold;
    }
    .beauty-small-card {
      background: white;
      border: 1px solid #e7e5e4;
      padding: 4px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      border-radius: 4px;
      min-height: 75px;
    }
    .beauty-small-card img {
      height: 35px;
      object-fit: contain;
    }
    .beauty-small-card h4 {
      font-size: 8px;
      margin: 2px 0;
      text-align: center;
    }

    /* 19. Parafarmacia (beauty_parafarmacia) */
    .layout-parafarmacia {
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(3, 1fr);
      gap: 6px;
      padding: 6px;
      background-color: #f0f9ff;
      border-radius: 4px;
    }
    .parafarmacia-card {
      background: #ffffff;
      border: 1px solid #bae6fd;
      border-radius: 4px;
      padding: 4px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      min-height: 70px;
    }
    .discount-badge-circle {
      position: absolute;
      top: 2px;
      left: 2px;
      background: #0284c7;
      color: white;
      font-weight: 900;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 6px;
      z-index: 2;
    }
    .parafarmacia-card h4 {
      font-size: 8px;
      margin: 0;
    }

    /* 20. Last Minute (beauty_last_minute) */
    .layout-last-minute {
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      padding: 8px;
      background-color: #fffbeb;
      border-radius: 4px;
    }
    .card-flash {
      border: 1.5px solid #dc2626;
      border-radius: 4px;
      background: white;
      padding: 4px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      min-height: 90px;
    }
    .flash-header {
      background: #dc2626;
      color: white;
      text-align: center;
      padding: 1px;
      font-weight: 800;
      font-size: 7px;
      border-radius: 2px 2px 0 0;
      margin: -4px -4px 4px -4px;
    }
    .card-flash h4 {
      font-size: 9px;
      margin: 2px 0;
    }
    .card-flash .qty {
      font-size: 7px;
      color: #dc2626;
      font-weight: bold;
    }

    .bp-wa-btn {
      transition: background-color 0.2s;
    }
    .bp-wa-btn:hover {
      background-color: #128C7E !important;
    }

    .book-products-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      flex: 1;
    }
    .book-product-card {
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      background: #fff;
    }
    .bp-img {
      width: 100%;
      height: 100px;
      object-fit: cover;
    }
    .bp-body {
      padding: 8px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .bp-body h4 {
      font-size: 11px;
      margin: 0 0 4px 0;
    }
    .bp-body p {
      font-size: 9px;
      color: #64748b;
      margin: 0 0 8px 0;
      flex: 1;
    }
    .bp-price {
      font-size: 12px;
      font-weight: 700;
    }
    .text-center {
      text-align: center;
    }
    .page-content-inside {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      flex: 1;
    }

    @media print {
      div[style*="position: fixed"] {
        display: none !important;
      }
      body {
        background: white !important;
        overflow: visible !important;
      }
      .book {
        box-shadow: none !important;
        transform: none !important;
        position: relative !important;
        width: 100% !important;
        height: auto !important;
      }
      .page {
        position: relative !important;
        display: block !important;
        page-break-after: always !important;
        break-after: page !important;
        transform: none !important;
        box-shadow: none !important;
        opacity: 1 !important;
        width: 100% !important;
        height: 277mm !important; /* Proporzione A4 */
        margin-bottom: 20px !important;
      }
      .back {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div style="position: fixed; top: 16px; left: 0; width: 100%; display: flex; justify-content: center; z-index: 100;">
    <button onclick="window.print()" style="background-color: #A62B2B; color: white; border: none; padding: 8px 16px; border-radius: 20px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 8px; font-family: sans-serif; font-size: 13px;">
      🖨️ Stampa / Salva PDF
    </button>
  </div>

  <div class="book" id="book">
    \${pagesHtml}
  </div>

  <script>
    // Supabase REST configuration
    const supabaseUrl = '${import.meta.env.VITE_SUPABASE_URL}';
    const supabaseKey = '${import.meta.env.VITE_SUPABASE_ANON_KEY}';
    const tenantId = '${session.user.id}';
    const catalogId = '${selectedCatalog.id}';

    async function trackEvent(eventType, metadata = {}) {
      try {
        await fetch(supabaseUrl + '/rest/v1/analytics_events', {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': 'Bearer ' + supabaseKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            tenant_id: tenantId,
            catalog_id: catalogId,
            event_type: eventType,
            metadata: metadata
          })
        });
      } catch (err) {
        console.error('Analytics error:', err);
      }
    }

    // Track Page View
    trackEvent('view_catalog', { referrer: document.referrer });

    const pages = document.querySelectorAll('.page');
    
    function loadPageImages(pageIndex) {
      const page = pages[pageIndex];
      if (!page) return;
      page.querySelectorAll('img[data-src]').forEach(img => {
        img.src = img.getAttribute('data-src');
        img.removeAttribute('data-src');
      });
      page.querySelectorAll('[data-bg]').forEach(el => {
        el.style.backgroundImage = "url('" + el.getAttribute('data-bg') + "')";
        el.removeAttribute('data-bg');
      });
    }

    // Carichiamo inizialmente le prime pagine
    loadPageImages(0);
    loadPageImages(1);
    loadPageImages(2);

    pages.forEach((page, index) => {
      page.style.zIndex = pages.length - index;
      
      page.addEventListener('click', (e) => {
        if (e.target.closest('.bp-wa-btn')) return;
        
        if (page.classList.contains('flipped')) {
          page.classList.remove('flipped');
          page.style.zIndex = pages.length - index;
          
          // Carica le immagini delle pagine precedenti quando si sfoglia a ritroso
          if (index > 0) loadPageImages(index - 1);
          loadPageImages(index);
          
          setTimeout(() => {
            for (let i = index + 1; i < pages.length; i++) {
              pages[i].style.zIndex = pages.length - i;
            }
          }, 150);
        } else {
          page.classList.add('flipped');
          page.style.zIndex = index + 1;
          
          // Carica progressivamente le immagini delle pagine successive
          loadPageImages(index + 1);
          loadPageImages(index + 2);
        }
      });
    });

    window.changeQty = function(btn, delta) {
      const container = btn.closest('.qty-selector');
      const valEl = container.querySelector('.qty-val');
      let qty = parseInt(valEl.innerText) + delta;
      if (qty < 1) qty = 1;
      valEl.innerText = qty;
    };

    window.sendOrder = function(btn, name, price) {
      event.stopPropagation();
      var qty = 1;
      const card = btn.closest('.card-prezzone, .card-spesa-difesa, .row-fresco, .combo-block, .card-stock, .layout-lookbook, .split-pane, .outfit-hero, .outfit-item-small, .accessori-top, .accessories-card-small, .card-tecnica, .col-vetrina, .pallet-card, .layout-tech-single, .phone-card, .elettro-row, .tech-acc-card, .green-card, .beauty-hero, .beauty-small-card, .parafarmacia-card, .card-flash, .book-product-card');
      if (card) {
        const qtyEl = card.querySelector('.qty-val');
        if (qtyEl) qty = parseInt(qtyEl.innerText);
      }
      
      const isWeight = btn.getAttribute('data-is-weight') === 'true';
      const weightNote = isWeight ? ' (Prezzo stimato al kg/etto. Il peso reale sara calcolato alla bilancia)' : '';
      
      const message = 'Ciao! Vorrei ordinare dal volantino ' + '${selectedCatalog.name.replace(/'/g, "\\'")}' + ': \n- n. ' + qty + ' x ' + name + ' (Prezzo: €' + price.toFixed(2) + weightNote + ')';
      
      // DEC-10: Salvataggio dell'ordine in analytics
      trackEvent('click_whatsapp', { product_name: name, quantity: qty, price: price, total: price * qty });
      
      const waUrl = 'https://wa.me/' + '${tenant.whatsapp_phone.replace(/[^0-9]/g, '')}' + '?text=' + encodeURIComponent(message);
      window.open(waUrl, '_blank');
    };

    // Track product click
    document.querySelectorAll('.book-product-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.bp-wa-btn') || e.target.closest('.qty-selector')) return;
        const prodName = card.getAttribute('data-product-name');
        trackEvent('click_product', { product_name: prodName });
      });
    });
  </script>
</body>
</html>`;

      const htmlBlob = new Blob([staticHtml], { type: 'text/html' });
      const htmlFile = new File([htmlBlob], `\${slug}.html`, { type: 'text/html' });

      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(`publications/\${slug}.html`, htmlFile, {
          contentType: 'text/html',
          cacheControl: '3600'
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('assets')
        .getPublicUrl(`publications/\${slug}.html`);

      // Database Record creation
      const { error: dbError } = await supabase
        .from('flipbook_publications')
        .insert({
          catalog_id: selectedCatalog.id,
          slug: slug,
          is_active: true
        });

      if (dbError) throw dbError;

      setPublishedFlipbookUrl(publicUrlData.publicUrl);
      alert('Volantino Digitale Sfogliabile pubblicato con successo!');
    } catch (err) {
      alert('Errore pubblicazione: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Skip onboarding flow
  const handleSkipOnboarding = async () => {
    try {
      setActionLoading(true);
      const nameToSave = editBusinessName || 'La Mia Attività';
      const { error } = await supabase
        .from('tenants')
        .update({
          business_name: nameToSave,
          brand_colors: { primary: BRAND_PALETTES[0].primary, secondary: BRAND_PALETTES[0].secondary },
          setup_completed: true
        })
        .eq('id', session.user.id);

      if (error) throw error;
      
      // Auto create first catalog
      const { error: catErr } = await supabase
        .from('catalogs')
        .insert({
          tenant_id: session.user.id,
          name: 'Volantino di Lancio',
          layout_config: { template: 'grid-3', custom_title: nameToSave }
        });

      if (catErr) throw catErr;

      // Re-fetch all data and redirect to dashboard
      await fetchTenantData(session.user.id);
    } catch (err) {
      alert('Errore saltando il setup: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Onboarding flow completion
  const handleOnboardingSubmit = async () => {
    try {
      setActionLoading(true);
      let logoUrl = tenant.logo_url;

      if (newProductImage) {
        logoUrl = await handleImageUpload(newProductImage, 'logo');
      }

      const { error } = await supabase
        .from('tenants')
        .update({
          business_name: editBusinessName,
          logo_url: logoUrl,
          brand_colors: { primary: editPalette.primary, secondary: editPalette.secondary },
          setup_completed: true
        })
        .eq('id', session.user.id);

      if (error) throw error;
      
      // Auto create first catalog
      const { data: catData, error: catErr } = await supabase
        .from('catalogs')
        .insert({
          tenant_id: session.user.id,
          name: 'Volantino di Lancio',
          layout_config: { template: 'grid-3', custom_title: editBusinessName }
        })
        .select()
        .single();

      if (catErr) throw catErr;

      // Re-fetch all data and redirect to dashboard
      await fetchTenantData(session.user.id);
    } catch (err) {
      alert('Errore onboarding: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Helper to render flyer items based on selected template (Supports the 20 layouts)
  const renderFlyerItems = (template, items, isPrintOnly = false) => {
    if (items.length === 0) {
      return <p className="placeholder-text">Aggiungi prodotti dal pannello a sinistra per iniziare.</p>;
    }

    // Mappatura dei layout
    const getLayoutClass = (tpl) => {
      switch (tpl) {
        case 'alimentari_prezzone_impatto': return 'layout-prezzone';
        case 'alimentari_spesa_difesa': return 'layout-spesa-difesa';
        case 'alimentari_bancone_freschi': return 'layout-bancone-freschi';
        case 'alimentari_combo_offerta': return 'layout-combo';
        case 'alimentari_griglia_stock': return 'layout-griglia-stock';
        case 'abbigliamento_lookbook_minimal': return 'layout-lookbook';
        case 'abbigliamento_split_verticale': return 'layout-split';
        case 'abbigliamento_outfit_completo': return 'layout-outfit';
        case 'abbigliamento_catalogo_accessori': return 'layout-accessori';
        case 'ferramenta_fai_da_te': return 'layout-fai-da-te';
        case 'ferramenta_vetrina_3col': return 'layout-vetrina-3col';
        case 'ferramenta_offerte_pallet': return 'layout-pallet';
        case 'tech_grande_occasione': return 'layout-tech-single';
        case 'tech_tutto_telefonia': return 'layout-telefonia';
        case 'tech_grandi_elettro': return 'layout-grandi-elettro';
        case 'tech_accessori_multi': return 'layout-tech-accessori';
        case 'green_vetrina_fioriti': return 'layout-green-vetrina';
        case 'beauty_spa_editoriale': return 'layout-beauty-spa';
        case 'beauty_parafarmacia': return 'layout-parafarmacia';
        case 'beauty_last_minute': return 'layout-last-minute';
        
        // Legacy templates
        case 'list-classic': return 'products-list-layout';
        case 'hero-featured': return 'products-hero-featured-layout';
        case 'grid-2': return 'products-grid-layout grid-2-columns';
        case 'grid-3':
        default: return 'products-grid-layout';
      }
    };

    const layoutClass = getLayoutClass(template);

    // Se si tratta dei vecchi template, manteniamo la vecchia struttura
    if (template === 'list-classic') {
      return (
        <div className={layoutClass}>
          {items.map(item => (
            <div key={item.id} className="classic-list-row">
              <div className="row-main">
                <strong>{item.products.name}</strong>
                <p>{item.products.description}</p>
              </div>
              <div className="row-right">
                <span className="price-tag" style={{ color: 'var(--brand-primary)' }}>
                  €{item.products.price.toFixed(2)}
                </span>
                {!isPrintOnly && (
                  <button className="remove-item-btn" onClick={() => handleRemoveFromCatalog(item.id)}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className={`flyer-layouts-container ${layoutClass}`} style={{ '--primary-color': tenant?.brand_colors?.primary || '#1E3A8A', '--secondary-color': tenant?.brand_colors?.secondary || '#FFC107' }}>
        {items.map((item, index) => {
          const product = item.products;
          const pos = index + 1;

          // Rendering personalizzato per ciascun layout
          switch (template) {
            case 'alimentari_prezzone_impatto':
              return (
                <div key={item.id} className="card-prezzone">
                  <div className="prezzone-badge">SOTTOCOSTO</div>
                  {product.image_url && <div className="image-container" style={{ backgroundImage: `url(${product.image_url})` }}></div>}
                  <div className="prezzone-body">
                    <h4 style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{product.name}</h4>
                    <div className="price-row-vertical">
                      <span className="price-tag">€{product.price.toFixed(2)}</span>
                      <small class="price-unit">al kg</small>
                    </div>
                  </div>
                  {!isPrintOnly && (
                    <button className="remove-item-btn abs" onClick={() => handleRemoveFromCatalog(item.id)}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              );

            case 'alimentari_spesa_difesa':
              return (
                <div key={item.id} className="card-spesa-difesa">
                  <div className="sd-badge">Novità</div>
                  {product.image_url && <img src={product.image_url} alt={product.name} />}
                  <h4 style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', textAlign: 'center', width: '100%' }}>{product.name}</h4>
                  <span className="price">€{product.price.toFixed(2)}</span>
                  {!isPrintOnly && (
                    <button className="remove-item-btn abs" onClick={() => handleRemoveFromCatalog(item.id)}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              );

            case 'alimentari_bancone_freschi':
              return (
                <div key={item.id} className="row-fresco">
                  {product.image_url ? <img src={product.image_url} className="img-block" alt={product.name} /> : <div className="img-block empty"></div>}
                  <div className="desc-block">
                    <strong style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{product.name}</strong>
                    <p>{product.description || 'Prodotto fresco selezionato con cura'}</p>
                    <span className="provenienza">Campania</span>
                  </div>
                  <div className="price-block">
                    <span className="price-num">€{product.price.toFixed(2)}</span>
                    <small className="price-unit">all'etto</small>
                  </div>
                  {!isPrintOnly && (
                    <button className="remove-item-btn inline" onClick={() => handleRemoveFromCatalog(item.id)}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              );

            case 'alimentari_combo_offerta':
              return (
                <div key={item.id} className="combo-block">
                  <div className="combo-items">
                    {product.image_url && <img src={product.image_url} alt={product.name} style={{ width: '45%', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />}
                    <div className="combo-plus-icon">+</div>
                    <div className="combo-second-placeholder" style={{ width: '45%', height: '80px', background: '#e2e8f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#64748b' }}>
                      Omaggio
                    </div>
                  </div>
                  <div className="combo-price-zone">
                    <small className="combo-label">COMBO</small>
                    <span className="price">€{product.price.toFixed(2)}</span>
                  </div>
                  {!isPrintOnly && (
                    <button className="remove-item-btn abs" onClick={() => handleRemoveFromCatalog(item.id)}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              );

            case 'alimentari_griglia_stock':
              return (
                <div key={item.id} className="card-stock">
                  {product.image_url && <img src={product.image_url} alt={product.name} />}
                  <span className="stock-title" style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', width: '100%', textAlign: 'center' }}>{product.name}</span>
                  <div className="price-badge">€{product.price.toFixed(2)}</div>
                  {!isPrintOnly && (
                    <button className="remove-item-btn abs" onClick={() => handleRemoveFromCatalog(item.id)}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              );

            case 'abbigliamento_lookbook_minimal':
              return (
                <div key={item.id} className="layout-lookbook">
                  {product.image_url ? (
                    <div className="lookbook-image" style={{ backgroundImage: `url(${product.image_url})`, height: '300px', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '6px' }}></div>
                  ) : <div className="lookbook-image empty" style={{ height: '300px', background: '#e2e8f0' }}></div>}
                  <div className="lookbook-details">
                    <small className="collection-tag">Nuova Collezione</small>
                    <h3 className="lookbook-title" style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{product.name}</h3>
                    <p className="lookbook-desc" style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{product.description}</p>
                    <span className="lookbook-price">€{product.price.toFixed(2)}</span>
                  </div>
                  {!isPrintOnly && (
                    <button className="remove-item-btn abs" onClick={() => handleRemoveFromCatalog(item.id)}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              );

            case 'abbigliamento_split_verticale':
              return (
                <div key={item.id} className={`split-pane ${pos % 2 === 0 ? 'right' : 'left'}`}>
                  <span className="column-tag">{pos % 2 === 0 ? 'DONNA' : 'UOMO'}</span>
                  {product.image_url && <img src={product.image_url} alt={product.name} />}
                  <div className="split-info">
                    <h4 style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', margin: 0 }}>{product.name}</h4>
                    <span className="price">€{product.price.toFixed(2)}</span>
                  </div>
                  {!isPrintOnly && (
                    <button className="remove-item-btn abs" onClick={() => handleRemoveFromCatalog(item.id)}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              );

            case 'abbigliamento_outfit_completo':
              const isHero = pos === 1;
              return (
                <div key={item.id} className={isHero ? 'outfit-hero' : 'outfit-item-small'}>
                  {product.image_url && <img src={product.image_url} alt={product.name} />}
                  <div className="outfit-info">
                    {isHero ? <h3>{product.name}</h3> : <h4>{product.name}</h4>}
                    <span className="price">€{product.price.toFixed(2)}</span>
                  </div>
                  {!isPrintOnly && (
                    <button className="remove-item-btn abs" onClick={() => handleRemoveFromCatalog(item.id)}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              );

            case 'abbigliamento_catalogo_accessori':
              const isAccessoryTop = pos === 1;
              return (
                <div key={item.id} className={isAccessoryTop ? 'accessori-top' : 'accessories-card-small'}>
                  {product.image_url && <img src={product.image_url} alt={product.name} />}
                  <div className="accessori-info">
                    {isAccessoryTop ? (
                      <>
                        <span className="top-banner">BEST SELLER</span>
                        <h3>{product.name}</h3>
                      </>
                    ) : <h4>{product.name}</h4>}
                    <span className="price">€{product.price.toFixed(2)}</span>
                  </div>
                  {!isPrintOnly && (
                    <button className="remove-item-btn abs" onClick={() => handleRemoveFromCatalog(item.id)}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              );

            case 'ferramenta_fai_da_te':
              return (
                <div key={item.id} className="card-tecnica">
                  {product.image_url && <img src={product.image_url} className="card-tecnica-image" alt={product.name} />}
                  <div className="card-tecnica-info">
                    <h4>{product.name}</h4>
                    <table className="specs-table">
                      <tbody>
                        <tr>
                          <td>Alimentazione:</td>
                          <td>230V / Batteria</td>
                        </tr>
                        <tr>
                          <td>Garanzia:</td>
                          <td>3 Anni Kasko</td>
                        </tr>
                      </tbody>
                    </table>
                    <span className="price-tag">€{product.price.toFixed(2)}</span>
                  </div>
                  {!isPrintOnly && (
                    <button className="remove-item-btn abs" onClick={() => handleRemoveFromCatalog(item.id)}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              );

            case 'ferramenta_vetrina_3col':
              return (
                <div key={item.id} className="col-vetrina">
                  <div className="brand-header">PROFESSIONALE</div>
                  {product.image_url && <img src={product.image_url} alt={product.name} style={{ height: '120px', objectFit: 'contain', width: '100%' }} />}
                  <div className="vetrina-body">
                    <h4>{product.name}</h4>
                    <span className="accessories-badge">Valigetta inclusa</span>
                    <span className="price-tag" style={{ fontSize: '16px', fontWeight: 'bold' }}>€{product.price.toFixed(2)}</span>
                  </div>
                  {!isPrintOnly && (
                    <button className="remove-item-btn abs" onClick={() => handleRemoveFromCatalog(item.id)}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              );

            case 'ferramenta_offerte_pallet':
              return (
                <div key={item.id} className="pallet-card">
                  {product.image_url && <img src={product.image_url} alt={product.name} style={{ width: '40%', height: '100px', objectFit: 'cover' }} />}
                  <div className="pallet-body" style={{ paddingLeft: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h4>{product.name}</h4>
                    <span className="qty">Min. 1 Bancale</span>
                    <div className="pallet-price-box">
                      <small className="discount">-35%</small>
                      <span className="price">€{product.price.toFixed(2)}</span>
                    </div>
                  </div>
                  {!isPrintOnly && (
                    <button className="remove-item-btn abs" onClick={() => handleRemoveFromCatalog(item.id)}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              );

            case 'tech_grande_occasione':
              return (
                <div key={item.id} className="layout-tech-single">
                  <span className="finance-badge">TASSO ZERO</span>
                  {product.image_url && <img src={product.image_url} className="tech-image-hero" alt={product.name} />}
                  <div className="tech-details" style={{ textAlign: 'center' }}>
                    <h2>{product.name}</h2>
                    <div className="tech-specs-circles">
                      <div className="spec-circle">
                        <strong>5G</strong>
                        <small>Rete</small>
                      </div>
                      <div className="spec-circle">
                        <strong>12GB</strong>
                        <small>RAM</small>
                      </div>
                      <div className="spec-circle">
                        <strong>OLED</strong>
                        <small>Schermo</small>
                      </div>
                    </div>
                    <span className="price" style={{ fontSize: '24px', fontWeight: 'bold' }}>€{product.price.toFixed(2)}</span>
                  </div>
                  {!isPrintOnly && (
                    <button className="remove-item-btn abs" onClick={() => handleRemoveFromCatalog(item.id)}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              );

            case 'tech_tutto_telefonia':
              return (
                <div key={item.id} className="phone-card">
                  <span className="phone-badge-gb">256GB</span>
                  {product.image_url && <img src={product.image_url} alt={product.name} style={{ width: '40%', height: '80px', objectFit: 'contain' }} />}
                  <div className="phone-info" style={{ paddingLeft: '8px', flex: 1 }}>
                    <h4>{product.name}</h4>
                    <small className="warranty">Garanzia Italia 2 Anni</small>
                    <span className="price" style={{ display: 'block', marginTop: '6px', fontWeight: 'bold' }}>€{product.price.toFixed(2)}</span>
                  </div>
                  {!isPrintOnly && (
                    <button className="remove-item-btn abs" onClick={() => handleRemoveFromCatalog(item.id)}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              );

            case 'tech_grandi_elettro':
              return (
                <div key={item.id} className="elettro-row">
                  {product.image_url && <img src={product.image_url} alt={product.name} style={{ width: '25%', height: '80px', objectFit: 'contain' }} />}
                  <div className="elettro-desc" style={{ width: '50%', padding: '0 12px' }}>
                    <strong>{product.name}</strong>
                    <p style={{ fontSize: '10px', color: '#64748b' }}>Consegna e installazione inclusi</p>
                  </div>
                  <div className="elettro-energy" style={{ width: '25%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span className="energy-label energy-A">Classe A</span>
                    <span className="price" style={{ fontWeight: 'bold', marginTop: '4px' }}>€{product.price.toFixed(2)}</span>
                  </div>
                  {!isPrintOnly && (
                    <button className="remove-item-btn abs" onClick={() => handleRemoveFromCatalog(item.id)}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              );

            case 'tech_accessori_multi':
              return (
                <div key={item.id} className="tech-acc-card">
                  {product.image_url && <img src={product.image_url} alt={product.name} style={{ height: '70px', objectFit: 'contain' }} />}
                  <div className="tech-acc-body">
                    <span className="code">IT-4890</span>
                    <h4>{product.name}</h4>
                    <span className="price">€{product.price.toFixed(2)}</span>
                  </div>
                  {!isPrintOnly && (
                    <button className="remove-item-btn abs" onClick={() => handleRemoveFromCatalog(item.id)}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              );

            case 'green_vetrina_fioriti':
              return (
                <div key={item.id} className="green-card">
                  {product.image_url && <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '12px' }} />}
                  <div className="green-body" style={{ padding: '8px 0' }}>
                    <h4>{product.name}</h4>
                    <div className="green-specs-icons">
                      <span className="green-icon-indicator" title="Esposizione al Sole">☀️</span>
                      <span className="green-icon-indicator" title="Irrigazione Regolare">💧</span>
                    </div>
                    <span className="price" style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--brand-primary)', display: 'block', marginTop: '8px' }}>€{product.price.toFixed(2)}</span>
                  </div>
                  {!isPrintOnly && (
                    <button className="remove-item-btn abs" onClick={() => handleRemoveFromCatalog(item.id)}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              );

            case 'beauty_spa_editoriale':
              const isSpaHero = pos === 1;
              return (
                <div key={item.id} className={isSpaHero ? 'beauty-hero' : 'beauty-small-card'}>
                  {product.image_url && <img src={product.image_url} alt={product.name} />}
                  <div className="beauty-body">
                    {isSpaHero ? <h3>{product.name}</h3> : <h4>{product.name}</h4>}
                    <span className="skin-badge">Pelli Sensibili</span>
                    <span className="price">€{product.price.toFixed(2)}</span>
                  </div>
                  {!isPrintOnly && (
                    <button className="remove-item-btn abs" onClick={() => handleRemoveFromCatalog(item.id)}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              );

            case 'beauty_parafarmacia':
              return (
                <div key={item.id} className="parafarmacia-card">
                  <div className="discount-badge-circle">-25%</div>
                  {product.image_url && <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '90px', objectFit: 'contain' }} />}
                  <div className="parafarmacia-body" style={{ paddingTop: '8px' }}>
                    <h4>{product.name}</h4>
                    <span className="price" style={{ fontWeight: 'bold', color: '#0284c7' }}>€{product.price.toFixed(2)}</span>
                  </div>
                  {!isPrintOnly && (
                    <button className="remove-item-btn abs" onClick={() => handleRemoveFromCatalog(item.id)}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              );

            case 'beauty_last_minute':
              return (
                <div key={item.id} className="card-flash">
                  <div className="flash-header">{product.category || 'Solo 48 ore'}</div>
                  {product.image_url && <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '90px', objectFit: 'cover' }} />}
                  <div className="flash-body" style={{ padding: '8px' }}>
                    <h4 style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{product.name}</h4>
                    <span className="qty">Max 3 pezzi</span>
                    <span className="price" style={{ fontWeight: 'bold', color: '#dc2626', display: 'block', fontSize: '16px' }}>€{product.price.toFixed(2)}</span>
                  </div>
                  {!isPrintOnly && (
                    <button className="remove-item-btn abs" onClick={() => handleRemoveFromCatalog(item.id)}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              );

            // Default card styles for generic grid
            default:
              return (
                <div key={item.id} className={template === 'grid-2' ? 'grid-product-card card-large' : 'grid-product-card'}>
                  {product.image_url && (
                    <img src={product.image_url} alt={product.name} className="card-img" />
                  )}
                  <div className="card-body">
                    <h4>{product.name}</h4>
                    <p>{product.description}</p>
                    <div className="card-footer">
                      <span className="price-tag" style={{ color: 'var(--brand-primary)' }}>
                        €{product.price.toFixed(2)}
                      </span>
                      {!isPrintOnly && (
                        <button className="remove-item-btn" onClick={() => handleRemoveFromCatalog(item.id)}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
          }
        })}
      </div>
    );
  };

  // Product CRUD
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      let imageUrl = editingProduct ? editingProduct.image_url : null;
      if (newProductImage) {
        imageUrl = await handleImageUpload(newProductImage, 'product');
      }

      const payload = {
        tenant_id: session.user.id,
        name: newProductName,
        price: parseFloat(newProductPrice),
        description: newProductDesc,
        category: newProductCategory,
        image_url: imageUrl
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert(payload);
        if (error) throw error;
      }

      // Reset Form
      setNewProductName('');
      setNewProductPrice('');
      setNewProductDesc('');
      setNewProductCategory('');
      setNewProductImage(null);
      setNewProductImagePreview('');
      setEditingProduct(null);

      // Refresh products list
      let { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      setProducts(data || []);
    } catch (err) {
      alert('Errore salvataggio prodotto: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditProductClick = (product) => {
    setEditingProduct(product);
    setNewProductName(product.name);
    setNewProductPrice(product.price);
    setNewProductDesc(product.description || '');
    setNewProductCategory(product.category || '');
    setNewProductImagePreview(product.image_url || '');
  };

  const handleDeleteProduct = async (prodId) => {
    if (!confirm('Sei sicuro di voler eliminare questo prodotto?')) return;
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', prodId);
      if (error) throw error;
      setProducts(products.filter(p => p.id !== prodId));
    } catch (err) {
      alert('Errore eliminazione: ' + err.message);
    }
  };

  // Add Product to current catalog
  const handleAddProductToCatalog = async (product) => {
    if (!selectedCatalog) return;
    try {
      const maxPosition = catalogItems.reduce((max, item) => item.position > max ? item.position : max, 0);
      const effectivePageSize = getEffectivePageSize(selectedCatalog);
      const nextPage = catalogItems.length > 0 ? Math.floor(catalogItems.length / effectivePageSize) + 1 : 1;

      const { data, error } = await supabase
        .from('catalog_items')
        .insert({
          catalog_id: selectedCatalog.id,
          product_id: product.id,
          position: maxPosition + 1,
          page_number: nextPage
        })
        .select(`
          id,
          position,
          page_number,
          product_id,
          products (
            id,
            name,
            price,
            description,
            image_url,
            category
          )
        `)
        .single();

      if (error) throw error;
      setCatalogItems([...catalogItems, data]);
    } catch (err) {
      alert('Errore aggiunta prodotto al catalogo: ' + err.message);
    }
  };

  const handleRemoveFromCatalog = async (itemId) => {
    try {
      const { error } = await supabase
        .from('catalog_items')
        .delete()
        .eq('id', itemId);
      if (error) throw error;
      setCatalogItems(catalogItems.filter(item => item.id !== itemId));
    } catch (err) {
      alert('Errore rimozione: ' + err.message);
    }
  };

  // Create Catalog
  const handleCreateCatalog = async (e) => {
    e.preventDefault();
    if (!newCatalogName) return;
    try {
      const { data, error } = await supabase
        .from('catalogs')
        .insert({
          tenant_id: session.user.id,
          name: newCatalogName,
          layout_config: { template: selectedTemplate, custom_title: tenant.business_name }
        })
        .select()
        .single();

      if (error) throw error;
      setCatalogs([data, ...catalogs]);
      setSelectedCatalog(data);
      setCatalogItems([]);
      setNewCatalogName('');
    } catch (err) {
      alert('Errore creazione catalogo: ' + err.message);
    }
  };

  // Helper: calcola il pageSize effettivo (custom override oppure default del template)
  const getEffectivePageSize = (catalog, items) => {
    const stored = catalog?.layout_config?.custom_page_size;
    if (stored && stored > 0) return stored;
    if (customPageSize && customPageSize > 0) return customPageSize;
    const tpl = catalog?.layout_config?.template || 'grid-3';
    const found = LAYOUT_TEMPLATES.find(t => t.id === tpl);
    if (found) return found.pageSize;
    if (tpl === 'grid-2') return 2;
    if (tpl === 'list-classic') return 5;
    return 4;
  };

  // Update layout template
  const handleUpdateTemplate = async (templateName) => {
    if (!selectedCatalog) return;
    try {
      const updatedConfig = { ...selectedCatalog.layout_config, template: templateName };
      const { error } = await supabase
        .from('catalogs')
        .update({ layout_config: updatedConfig })
        .eq('id', selectedCatalog.id);

      if (error) throw error;
      setSelectedCatalog({ ...selectedCatalog, layout_config: updatedConfig });
      setCatalogs(catalogs.map(c => c.id === selectedCatalog.id ? { ...c, layout_config: updatedConfig } : c));
      // Reset customPageSize locale quando si cambia template
      setCustomPageSize(null);
    } catch (err) {
      alert('Errore aggiornamento template: ' + err.message);
    }
  };

  // Aggiorna il numero di slot (prodotti) per pagina e persiste su Supabase
  const handleUpdatePageSize = async (delta) => {
    if (!selectedCatalog) return;
    const currentEffective = getEffectivePageSize(selectedCatalog);
    const newSize = Math.max(1, Math.min(20, currentEffective + delta));
    try {
      const updatedConfig = { ...selectedCatalog.layout_config, custom_page_size: newSize };
      const { error } = await supabase
        .from('catalogs')
        .update({ layout_config: updatedConfig })
        .eq('id', selectedCatalog.id);
      if (error) throw error;
      const updated = { ...selectedCatalog, layout_config: updatedConfig };
      setSelectedCatalog(updated);
      setCatalogs(catalogs.map(c => c.id === selectedCatalog.id ? { ...c, layout_config: updatedConfig } : c));
      setCustomPageSize(newSize);
    } catch (err) {
      alert('Errore aggiornamento slot: ' + err.message);
    }
  };

  // Custom styling colors from tenant
  const brandStyle = {
    '--brand-primary': tenant?.brand_colors?.primary || '#1E3A8A',
    '--brand-secondary': tenant?.brand_colors?.secondary || '#10B981',
  };

  if (appLoading) {
    return (
      <div className="app-loader">
        <Sparkles className="spin" size={48} color="#A62B2B" />
        <p>Caricamento piattaforma...</p>
      </div>
    );
  }

  // Not logged in UI
  if (!session && !showAuthForm) {
    return (
      <div className="landing-container">
        {/* Header */}
        <header className="landing-header">
          <div className="logo-section">
            <Sparkles size={28} color="#A62B2B" />
            <span className="brand-title">Difetti Cataloghi</span>
          </div>
          <button className="btn btn-secondary" onClick={() => setShowAuthForm(true)}>
            Accedi al SaaS
          </button>
        </header>

        {/* Hero Section */}
        <section className="landing-hero">
          <div className="hero-content">
            <span className="tagline">L'alleato digitale per le PMI del Sud Italia</span>
            <h1>Il tuo volantino digitale pronto in 5 minuti. Sfoglia, clicca e vendi.</h1>
            <p>
              Basta fogli Excel disordinati o PDF pesanti che i clienti non riescono ad aprire. 
              Crea un volantino interattivo ed elegante ottimizzato per i telefoni dei tuoi clienti, con ordini diretti su WhatsApp.
            </p>
            <div className="cta-group">
              <button className="btn btn-primary btn-lg" onClick={() => { setIsRegistering(true); setShowAuthForm(true); }}>
                Inizia Ora Gratis
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="mockup-phone">
              <div className="phone-screen">
                <div className="mockup-header">
                  <span>Bottega Campana S.r.l.</span>
                </div>
                <div className="mockup-products">
                  <div className="m-prod-card">
                    <div className="m-prod-img-placeholder">🍅</div>
                    <div className="m-prod-info">
                      <h5>Pomodori San Marzano DOP</h5>
                      <span className="m-price">€4.50/Kg</span>
                      <span className="m-wa-badge">Ordina su WA</span>
                    </div>
                  </div>
                  <div className="m-prod-card">
                    <div className="m-prod-img-placeholder">🧀</div>
                    <div className="m-prod-info">
                      <h5>Caciocavallo Silano</h5>
                      <span className="m-price">€18.90/Kg</span>
                      <span className="m-wa-badge">Ordina su WA</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="landing-story">
          <div className="story-card">
            <p className="story-quote">
              "Prima mandavo foto sfocate del tabellone dei prezzi o PDF pesanti che nessuno scaricava. 
              Con Difetti Cataloghi, i clienti sfogliano il listino direttamente dal telefono e mi inviano l'ordine con un click. Ho raddoppiato le vendite a domicilio in Irpinia!"
            </p>
            <div className="story-author">
              <strong>— Pasquale S.</strong>, Macelleria Irpina (Avellino)
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="landing-features">
          <h2>Creato su misura per le attività locali</h2>
          <div className="features-grid">
            <div className="feature-card">
              <Palette size={24} color="#A62B2B" className="feature-icon" />
              <h3>Identità del Sud</h3>
              <p>Palette di colori locali ("Verde Campania", "Azzurro Costiera", "Rosso Pompei") progettate per risuonare con le tradizioni del nostro territorio.</p>
            </div>
            <div className="feature-card">
              <Smartphone size={24} color="#A62B2B" className="feature-icon" />
              <h3>100% Mobile-First</h3>
              <p>I tuoi clienti aprono tutto da smartphone. I nostri volantini sfogliabili si caricano istantaneamente in meno di 1.5 secondi anche con connessione debole.</p>
            </div>
            <div className="feature-card">
              <Share2 size={24} color="#A62B2B" className="feature-icon" />
              <h3>Condivisione su WhatsApp</h3>
              <p>Genera un link pubblico leggero ed elegante, perfetto da inviare in chat o da inserire nella bio delle tue pagine Instagram e TikTok.</p>
            </div>
            <div className="feature-card">
              <FileText size={24} color="#A62B2B" className="feature-icon" />
              <h3>Importazione Excel / CSV</h3>
              <p>Non serve reinserire i prodotti a mano. Carica il tuo listino CSV esistente e lascia che l'algoritmo generi il catalogo in automatico.</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="landing-footer">
          <p>© 2026 BRTC Digital Adv di Alberto Saveriano. Tutti i diritti riservati.</p>
        </footer>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="auth-container">
        <button className="btn btn-secondary back-to-landing-btn" onClick={() => setShowAuthForm(false)}>
          <ArrowLeft size={16} /> Torna alla Home
        </button>
        <div className="auth-card">
          <div className="auth-header">
            <Sparkles size={40} color="#A62B2B" />
            <h1>Difetti Cataloghi</h1>
            <p>Genera volantini e menù digitali in pochi click</p>
          </div>
          
          <form onSubmit={handleAuth} className="auth-form">
            {isRegistering && (
              <div className="form-group">
                <label>Nome Attività / Negozio</label>
                <input 
                  type="text" 
                  value={authBusinessName} 
                  onChange={(e) => setAuthBusinessName(e.target.value)} 
                  placeholder="Es. Antica Salumeria"
                  required
                />
              </div>
            )}
            
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                value={authEmail} 
                onChange={(e) => setAuthEmail(e.target.value)} 
                placeholder="nome@negozio.it"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                value={authPassword} 
                onChange={(e) => setAuthPassword(e.target.value)} 
                placeholder="Minimo 6 caratteri"
                required
              />
            </div>

            {authError && <p className="auth-error-msg">{authError}</p>}

            <button type="submit" className="btn btn-primary btn-block" disabled={authLoading}>
              {authLoading ? 'Elaborazione...' : (isRegistering ? 'Crea il tuo Account' : 'Accedi')}
            </button>
          </form>

          <div className="auth-footer">
            <button className="btn-link" onClick={() => setIsRegistering(!isRegistering)}>
              {isRegistering ? 'Hai già un account? Accedi' : 'Nuovo qui? Registra la tua attività'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Onboarding UI
  if (tenant && !tenant.setup_completed) {
    return (
      <div className="onboarding-container" style={brandStyle}>
        <div className="onboarding-card">
          <div className="onboarding-progress">
            <div className={`progress-dot ${onboardingStep >= 1 ? 'active' : ''}`}>1</div>
            <div className="progress-line"></div>
            <div className={`progress-dot ${onboardingStep >= 2 ? 'active' : ''}`}>2</div>
          </div>

          {onboardingStep === 1 && (
            <div className="onboarding-step">
              <h2>Configura la tua Attività</h2>
              <p>Inserisci i dati principali per iniziare a impaginare.</p>
              
              <div className="form-group">
                <label>Nome del Negozio</label>
                <input 
                  type="text" 
                  value={editBusinessName} 
                  onChange={(e) => setEditBusinessName(e.target.value)}
                  placeholder="Nome dell'attività"
                />
              </div>

              <div className="form-group">
                <label>Carica Logo (Opzionale)</label>
                <div className="image-upload-zone">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      setNewProductImage(file);
                      if (file) {
                        setNewProductImagePreview(URL.createObjectURL(file));
                        try {
                          const extracted = await extractColorsFromLogo(file);
                          setEditPalette({
                            name: 'Colori Estratti dal Logo',
                            primary: extracted.primary,
                            secondary: extracted.secondary,
                            desc: 'Palette generata in base al tuo brand'
                          });
                        } catch (err) {
                          console.error('Non è stato possibile estrarre i colori dal logo', err);
                        }
                      }
                    }}
                    id="logo-upload"
                    className="hidden-input"
                  />
                  <label htmlFor="logo-upload" className="upload-label">
                    {newProductImagePreview ? (
                      <img src={newProductImagePreview} alt="Anteprima Logo" className="logo-preview-img" />
                    ) : (
                      <>
                        <Image size={32} />
                        <span>Clicca per caricare il logo</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <button 
                className="btn btn-primary btn-block" 
                onClick={handleOnboardingStep1Next}
                disabled={!editBusinessName || actionLoading}
              >
                {actionLoading ? 'Salvataggio...' : 'Continua'} <ChevronRight size={18} />
              </button>

              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <button 
                  type="button"
                  className="btn-link" 
                  onClick={handleSkipOnboarding}
                  disabled={actionLoading}
                  style={{ fontSize: '13px', color: 'var(--text-secondary)', border: 'none', background: 'none', cursor: 'pointer' }}
                >
                  Salta setup ed entra nella Dashboard
                </button>
              </div>
            </div>
          )}

          {onboardingStep === 2 && (
            <div className="onboarding-step">
              <h2>Scegli la tua Palette di Colori</h2>
              <p>Questi colori verranno usati per decorare i tuoi volantini.</p>

              <div className="palette-grid">
                {BRAND_PALETTES.map((palette) => (
                  <div 
                    key={palette.name} 
                    className={`palette-card ${editPalette.name === palette.name ? 'selected' : ''}`}
                    onClick={() => setEditPalette(palette)}
                  >
                    <div className="palette-colors">
                      <div className="color-bar" style={{ backgroundColor: palette.primary }}></div>
                      <div className="color-bar" style={{ backgroundColor: palette.secondary }}></div>
                    </div>
                    <div className="palette-info">
                      <h4>{palette.name}</h4>
                      <p>{palette.desc}</p>
                    </div>
                    {editPalette.name === palette.name && <div className="checked-badge"><Check size={14} /></div>}
                  </div>
                ))}
              </div>

              <div className="btn-row">
                <button className="btn btn-secondary" onClick={() => setOnboardingStep(1)}>
                  <ArrowLeft size={18} /> Indietro
                </button>
                <button className="btn btn-primary" onClick={handleOnboardingSubmit} disabled={actionLoading}>
                  {actionLoading ? 'Configurazione...' : 'Completa Setup'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Dashboard & Work Area
  return (
    <>
      <div className="app-layout" style={brandStyle}>
      {/* Sidebar Desktop / Bottom bar Mobile */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          {tenant?.logo_url ? (
            <img src={tenant.logo_url} alt="Logo" className="sidebar-logo" />
          ) : (
            <Sparkles size={24} color="var(--brand-primary)" />
          )}
          <h3>{tenant?.business_name}</h3>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'flyers' ? 'active' : ''}`} 
            onClick={() => setActiveTab('flyers')}
          >
            <FileText size={20} />
            <span>Volantini</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'products' ? 'active' : ''}`} 
            onClick={() => setActiveTab('products')}
          >
            <ShoppingBag size={20} />
            <span>Prodotti</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'brand' ? 'active' : ''}`} 
            onClick={() => setActiveTab('brand')}
          >
            <Settings size={20} />
            <span>Brand</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`} 
            onClick={() => { setActiveTab('analytics'); fetchAnalyticsData(session.user.id); }}
          >
            <BarChart2 size={20} />
            <span>Statistiche</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'publish' ? 'active' : ''}`} 
            onClick={() => setActiveTab('publish')}
          >
            <Share2 size={20} />
            <span>Pubblica</span>
          </button>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Esci</span>
        </button>
      </aside>

      {/* Main Workspace Area */}
      <main className="workspace">
        {/* Mobile Sub-Header to switch tabs */}
        <div className="mobile-header">
          <div className="brand-badge-mobile">
            {tenant?.logo_url && <img src={tenant.logo_url} alt="Logo" />}
            <span>{tenant?.business_name}</span>
          </div>
          <button className="btn-icon" onClick={handleLogout}><LogOut size={16} /></button>
        </div>

        {/* Tab content */}
        <div className="content-container">
          
          {/* FLYERS TAB */}
          {activeTab === 'flyers' && (
            <div className="tab-split">
              {/* Sidebar editing block */}
              <div className={`editor-controls ${mobileSubTab === 'edit' ? 'mobile-visible' : 'mobile-hidden'}`}>
                <div className="card">
                  <h3>Crea Nuovo Volantino</h3>
                  <form onSubmit={handleCreateCatalog} className="horizontal-form">
                    <input 
                      type="text" 
                      placeholder="Es. Offerte di Luglio" 
                      value={newCatalogName}
                      onChange={(e) => setNewCatalogName(e.target.value)}
                      required
                    />
                    <button type="submit" className="btn btn-primary"><Plus size={18} /></button>
                  </form>
                </div>

                <div className="card">
                  <h3>Seleziona Volantino</h3>
                  <div className="selector-list">
                    {catalogs.map(cat => (
                      <button 
                        key={cat.id} 
                        className={`selector-item ${selectedCatalog?.id === cat.id ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedCatalog(cat);
                          fetchCatalogItems(cat.id);
                        }}
                      >
                        <FileText size={16} />
                        <span>{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedCatalog && (
                  <>
                    <div className="card">
                      <h3>Layout & Template</h3>
                      <p className="card-desc">Scegli uno dei 20 layout dedicati per categoria.</p>
                      
                      <div className="form-group margin-top">
                        <select 
                          className="form-control"
                          value={selectedCatalog.layout_config?.template || 'grid-3'}
                          onChange={(e) => handleUpdateTemplate(e.target.value)}
                          style={{ 
                            width: '100%', 
                            padding: '10px 12px', 
                            borderRadius: '6px', 
                            border: '1px solid var(--border-color)', 
                            backgroundColor: 'var(--bg-secondary)', 
                            color: 'var(--text-primary)',
                            fontSize: '13px',
                            fontWeight: '600'
                          }}
                        >
                          <optgroup label="Layout Standard">
                            <option value="grid-3">Griglia Standard (3 colonne)</option>
                            <option value="grid-2">Griglia Grande (2 colonne)</option>
                            <option value="list-classic">Lista Classica (Testo)</option>
                          </optgroup>
                          
                          {Object.entries(
                            LAYOUT_TEMPLATES.reduce((acc, tpl) => {
                              if (!acc[tpl.category]) acc[tpl.category] = [];
                              acc[tpl.category].push(tpl);
                              return acc;
                            }, {})
                          ).map(([cat, tpls]) => (
                            <optgroup key={cat} label={cat}>
                              {tpls.map(tpl => (
                                <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>

                      {/* Controllo Slot per Pagina */}
                      <div style={{ marginTop: '16px' }}>
                        <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                          Prodotti per Pagina
                        </label>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: '1.4' }}>
                          Modifica quanti prodotti appaiono su ogni pagina del volantino.
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px 12px' }}>
                          <button
                            id="slot-decrease-btn"
                            onClick={() => handleUpdatePageSize(-1)}
                            disabled={getEffectivePageSize(selectedCatalog) <= 1}
                            style={{
                              width: '36px', height: '36px', borderRadius: '6px',
                              border: '1px solid var(--border-color)',
                              background: getEffectivePageSize(selectedCatalog) <= 1 ? 'var(--bg-secondary)' : 'var(--bg-primary)',
                              color: getEffectivePageSize(selectedCatalog) <= 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                              cursor: getEffectivePageSize(selectedCatalog) <= 1 ? 'not-allowed' : 'pointer',
                              fontWeight: '700', fontSize: '18px', display: 'flex',
                              alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s'
                            }}
                          >−</button>
                          <div style={{ flex: 1, textAlign: 'center' }}>
                            <span style={{ fontSize: '22px', fontWeight: '800', color: 'var(--brand-primary)' }}>
                              {getEffectivePageSize(selectedCatalog)}
                            </span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>slot / pagina</span>
                          </div>
                          <button
                            id="slot-increase-btn"
                            onClick={() => handleUpdatePageSize(1)}
                            disabled={getEffectivePageSize(selectedCatalog) >= 20}
                            style={{
                              width: '36px', height: '36px', borderRadius: '6px',
                              border: '1px solid var(--border-color)',
                              background: getEffectivePageSize(selectedCatalog) >= 20 ? 'var(--bg-secondary)' : 'var(--brand-primary)',
                              color: getEffectivePageSize(selectedCatalog) >= 20 ? 'var(--text-muted)' : '#fff',
                              cursor: getEffectivePageSize(selectedCatalog) >= 20 ? 'not-allowed' : 'pointer',
                              fontWeight: '700', fontSize: '18px', display: 'flex',
                              alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s'
                            }}
                          >+</button>
                        </div>
                        {selectedCatalog.layout_config?.custom_page_size && (
                          <button
                            onClick={async () => {
                              const tpl = selectedCatalog.layout_config?.template || 'grid-3';
                              const found = LAYOUT_TEMPLATES.find(t => t.id === tpl);
                              const defaultSize = found ? found.pageSize : 4;
                              const updatedConfig = { ...selectedCatalog.layout_config };
                              delete updatedConfig.custom_page_size;
                              const { error } = await supabase.from('catalogs').update({ layout_config: updatedConfig }).eq('id', selectedCatalog.id);
                              if (!error) {
                                setSelectedCatalog({ ...selectedCatalog, layout_config: updatedConfig });
                                setCatalogs(catalogs.map(c => c.id === selectedCatalog.id ? { ...c, layout_config: updatedConfig } : c));
                                setCustomPageSize(null);
                              }
                            }}
                            style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: '0' }}
                          >
                            ↩ Ripristina default del template
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="card">
                      <h3>Prodotti da Aggiungere</h3>
                      <p className="card-desc">Tocca un prodotto per inserirlo in questo volantino.</p>
                      <div className="product-picker-list">
                        {products.map(prod => {
                          const isInCatalog = catalogItems.some(item => item.product_id === prod.id);
                          return (
                            <div key={prod.id} className="picker-item">
                              <div className="picker-info">
                                <strong>{prod.name}</strong>
                                <span>€{prod.price.toFixed(2)}</span>
                              </div>
                              <button 
                                className={`btn-circle ${isInCatalog ? 'btn-success' : 'btn-primary'}`}
                                onClick={() => handleAddProductToCatalog(prod)}
                                disabled={isInCatalog}
                              >
                                {isInCatalog ? <Check size={14} /> : <Plus size={14} />}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Canvas Preview block */}
              <div className={`canvas-preview ${mobileSubTab === 'preview' ? 'mobile-visible' : 'mobile-hidden'}`}>
                {selectedCatalog ? (
                  <div className="canvas-wrapper">
                    <div className="canvas-header-actions">
                      <h4>Anteprima Stampa</h4>
                      <div className="view-mode-badge">
                        <Monitor size={14} /> Desktop Live
                      </div>
                    </div>

                    {/* The Printable Page Canvas */}
                    <div className="canvas-pages-container" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                      {(() => {
                        const currentTpl = selectedCatalog.layout_config?.template || 'grid-3';
                        const pageSize = getEffectivePageSize(selectedCatalog);
                        const totalPages = Math.ceil(catalogItems.length / pageSize) || 1;
                        
                        const pages = [];
                        for (let p = 0; p < totalPages; p++) {
                          const pageItems = catalogItems.slice(p * pageSize, (p + 1) * pageSize);
                          pages.push(
                            <div key={p} className="flyer-sheet printing-page" style={{ position: 'relative' }}>
                              <header className="flyer-sheet-header" style={{ borderBottomColor: 'var(--brand-primary)' }}>
                                {tenant?.logo_url && <img src={tenant.logo_url} alt="Logo" className="flyer-logo" />}
                                <div>
                                  <h1 style={{ color: 'var(--brand-primary)' }}>{selectedCatalog.name}</h1>
                                  <p>{tenant?.business_name} - Pagina {p + 1}</p>
                                </div>
                              </header>
                              {renderFlyerItems(currentTpl, pageItems, false)}
                            </div>
                          );
                        }
                        return pages;
                      })()}
                    </div>
                  </div>
                ) : (
                  <div className="empty-state">
                    <FileText size={48} />
                    <h3>Nessun Volantino Selezionato</h3>
                    <p>Crea o seleziona un volantino per iniziare ad impaginare.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === 'products' && (
            <div className="tab-split">
              {/* Product management sidebar */}
              <div className="editor-controls mobile-visible">
                <div className="card">
                  <h3>{editingProduct ? 'Modifica Prodotto' : 'Aggiungi Prodotto'}</h3>
                  <form onSubmit={handleSaveProduct} className="form-vertical">
                    <div className="form-group">
                      <label>Nome Prodotto</label>
                      <input 
                        type="text" 
                        value={newProductName} 
                        onChange={(e) => setNewProductName(e.target.value)} 
                        placeholder="Es. Prosciutto di Parma"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Prezzo (€)</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        value={newProductPrice} 
                        onChange={(e) => setNewProductPrice(e.target.value)} 
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Descrizione / Offerta (Opzionale)</label>
                      <textarea 
                        value={newProductDesc} 
                        onChange={(e) => setNewProductDesc(e.target.value)} 
                        placeholder="Es. Taglio fresco a fette sottili"
                      />
                    </div>
                    <div className="form-group">
                      <label>Categoria (Opzionale)</label>
                      <input 
                        type="text" 
                        value={newProductCategory} 
                        onChange={(e) => setNewProductCategory(e.target.value)} 
                        placeholder="Es. Salumeria"
                      />
                    </div>

                    <div className="form-group">
                      <label>Foto Prodotto</label>
                      <div className="image-upload-zone">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => {
                            const file = e.target.files[0];
                            setNewProductImage(file);
                            if (file) setNewProductImagePreview(URL.createObjectURL(file));
                          }}
                          id="prod-upload"
                          className="hidden-input"
                        />
                        <label htmlFor="prod-upload" className="upload-label">
                          {newProductImagePreview ? (
                            <img src={newProductImagePreview} alt="Preview" className="logo-preview-img" />
                          ) : (
                            <>
                              <Image size={24} />
                              <span>Scegli Foto</span>
                            </>
                          )}
                        </label>
                      </div>
                    </div>

                    <div className="btn-row">
                      {editingProduct && (
                        <button 
                          type="button" 
                          className="btn btn-secondary" 
                          onClick={() => {
                            setEditingProduct(null);
                            setNewProductName('');
                            setNewProductPrice('');
                            setNewProductDesc('');
                            setNewProductCategory('');
                            setNewProductImagePreview('');
                          }}
                        >
                          Annulla
                        </button>
                      )}
                      <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                        {actionLoading ? 'Salvataggio...' : 'Salva Prodotto'}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="card">
                  <h3>Importa Prodotti (Excel/CSV)</h3>
                  <p className="card-desc">Scarica il template, compila i prodotti in Excel e importali in blocco.</p>
                  
                  <div className="form-group">
                    <a 
                      href="data:text/csv;charset=utf-8,Nome%3BPrezzo%3BCategoria%3BDescrizione%3BImmagine%0AProsciutto%20di%20Parma%3B15.90%3BSalumeria%3BTaglio%20fresco%20a%20fette%20sottili%3Bhttps%3A%2F%2Fimages.unsplash.com%2Fphoto-1629731910211-137b79752dcc%0APizza%20Margherita%3B6.50%3BPizzeria%3BPomodoro%2C%20mozzarella%20e%20basilico%3B" 
                      download="template_prodotti.csv"
                      className="btn btn-secondary btn-block"
                      style={{ textDecoration: 'none', marginBottom: '12px' }}
                    >
                      Scarica Template CSV
                    </a>
                  </div>

                  <div className="form-group">
                    <label>Carica File CSV Compilato</label>
                    <input 
                      type="file" 
                      accept=".csv" 
                      onChange={handleImportCSV} 
                    />
                  </div>

                  {csvPreviewProducts.length > 0 && (
                    <div className="csv-preview-box margin-top" style={{ border: '1px solid var(--border-color)', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)' }}>
                      <h4>Anteprima Caricamento ({csvPreviewProducts.length} righe)</h4>
                      <p className="card-desc">L'importazione aggiornerà i prezzi/descrizioni se il nome del prodotto esiste già, altrimenti ne creerà uno nuovo.</p>
                      
                      <div className="preview-items-list" style={{ maxHeight: '180px', overflowY: 'auto', margin: '10px 0', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {csvPreviewProducts.slice(0, 10).map((p, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                            <span><strong>{p.name}</strong> ({p.category})</span>
                            <span>€{p.price.toFixed(2)}</span>
                          </div>
                        ))}
                        {csvPreviewProducts.length > 10 && <p className="text-center" style={{ color: 'var(--text-secondary)' }}>+ altri {csvPreviewProducts.length - 10} prodotti...</p>}
                      </div>

                      <div className="btn-row">
                        <button className="btn btn-secondary" onClick={() => setCsvPreviewProducts([])}>Annulla</button>
                        <button className="btn btn-primary" onClick={handleConfirmCSVImport} disabled={actionLoading}>
                          {actionLoading ? 'Importazione...' : 'Conferma ed Evita Duplicati'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* List of existing products */}
              <div className="canvas-preview mobile-visible">
                <div className="card">
                  <h3>Lista Prodotti Disponibili</h3>
                  <div className="products-grid-admin">
                    {products.map(prod => (
                      <div key={prod.id} className="admin-product-row">
                        {prod.image_url ? (
                          <img src={prod.image_url} alt={prod.name} className="row-thumb" />
                        ) : (
                          <div className="row-thumb-empty"><Image size={18} /></div>
                        )}
                        <div className="row-details">
                          <h4>{prod.name}</h4>
                          <span className="row-price">€{prod.price.toFixed(2)}</span>
                        </div>
                        <div className="row-actions">
                          <button className="btn-icon" onClick={() => handleEditProductClick(prod)}>
                            <Settings size={16} />
                          </button>
                          <button className="btn-icon btn-icon-danger" onClick={() => handleDeleteProduct(prod.id)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {products.length === 0 && (
                      <p className="placeholder-text">Nessun prodotto creato. Aggiungilo usando il modulo di sinistra.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BRAND TAB */}
          {activeTab === 'brand' && (
            <div className="tab-split">
              <div className="editor-controls mobile-visible">
                <div className="card">
                  <h3>Impostazioni Brand</h3>
                  <div className="form-group">
                    <label>Nome attività</label>
                    <input 
                      type="text" 
                      value={editBusinessName} 
                      onChange={(e) => setEditBusinessName(e.target.value)} 
                    />
                  </div>

                  <div className="form-group">
                    <label>Telefono WhatsApp Aziendale (es. 393331234567)</label>
                    <input 
                      type="text" 
                      value={editWhatsappPhone} 
                      onChange={(e) => setEditWhatsappPhone(e.target.value)} 
                      placeholder="Codice nazione + numero"
                    />
                  </div>

                  <div className="form-group">
                    <label>Palette Colore</label>
                    <div className="palette-selector-list">
                      {BRAND_PALETTES.map(palette => (
                        <button 
                          key={palette.name} 
                          className={`palette-bar-btn ${editPalette.name === palette.name ? 'active' : ''}`}
                          onClick={() => setEditPalette(palette)}
                        >
                          <div className="bar-colors">
                            <span style={{ backgroundColor: palette.primary }}></span>
                            <span style={{ backgroundColor: palette.secondary }}></span>
                          </div>
                          <span>{palette.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    className="btn btn-primary btn-block" 
                    onClick={async () => {
                      try {
                        const { error } = await supabase
                          .from('tenants')
                          .update({
                            business_name: editBusinessName,
                            brand_colors: { primary: editPalette.primary, secondary: editPalette.secondary },
                            whatsapp_phone: editWhatsappPhone
                          })
                          .eq('id', session.user.id);
                        if (error) throw error;
                        setTenant({
                          ...tenant,
                          business_name: editBusinessName,
                          brand_colors: { primary: editPalette.primary, secondary: editPalette.secondary },
                          whatsapp_phone: editWhatsappPhone
                        });
                        alert('Impostazioni salvate con successo!');
                      } catch (err) {
                        alert('Errore salvataggio: ' + err.message);
                      }
                    }}
                  >
                    Salva Impostazioni
                  </button>
                </div>
              </div>
              
              <div className="canvas-preview mobile-hidden">
                <div className="card text-center">
                  <h3>Anteprima Stile</h3>
                  <p>Ecco come appaiono i colori sui pulsanti e dettagli dell'app.</p>
                  <div className="btn-row justify-center margin-top">
                    <button className="btn btn-primary">Pulsante Primario</button>
                    <button className="btn btn-secondary">Pulsante Secondario</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <div className="analytics-panel">
              <div className="card">
                <h3>Statistiche Volantini Digitali</h3>
                <p className="card-desc">Monitora l'efficacia dei tuoi volantini inviati ai clienti.</p>

                {analyticsLoading ? (
                  <p>Caricamento statistiche in corso...</p>
                ) : (
                  <>
                    <div className="stats-summary-grid">
                      <div className="stat-card">
                        <span className="stat-title">Visualizzazioni Totali</span>
                        <span className="stat-number">
                          {analyticsEvents.filter(e => e.event_type === 'view_catalog').length}
                        </span>
                      </div>
                      <div className="stat-card">
                        <span className="stat-title">Clic sui Prodotti</span>
                        <span className="stat-number">
                          {analyticsEvents.filter(e => e.event_type === 'click_product').length}
                        </span>
                      </div>
                      <div className="stat-card">
                        <span className="stat-title">Ordini WhatsApp Cliccati</span>
                        <span className="stat-number">
                          {analyticsEvents.filter(e => e.event_type === 'click_whatsapp').length}
                        </span>
                      </div>
                    </div>

                    <div className="margin-top">
                      <h4>Attività Recente dei Clienti</h4>
                      <div className="analytics-events-list">
                        {analyticsEvents.slice(0, 15).map(event => (
                          <div key={event.id} className="event-list-row">
                            <span className="event-time">
                              {new Date(event.created_at).toLocaleString('it-IT', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                            </span>
                            <span className="event-type-badge" data-type={event.event_type}>
                              {event.event_type === 'view_catalog' && 'Apertura Volantino'}
                              {event.event_type === 'click_product' && 'Dettagli Prodotto'}
                              {event.event_type === 'click_whatsapp' && 'Clic Ordine WhatsApp'}
                            </span>
                            <span className="event-details">
                              {event.event_type === 'click_product' && `Prodotto: ${event.metadata?.product_name || 'N/D'}`}
                              {event.event_type === 'click_whatsapp' && `Ordinato: ${event.metadata?.quantity || 1}x ${event.metadata?.product_name || 'N/D'} (Tot: €${((event.metadata?.total || event.metadata?.price || 0) * (event.metadata?.quantity || 1)).toFixed(2)})`}
                              {event.event_type === 'view_catalog' && `Referrer: ${event.metadata?.referrer || 'Diretto'}`}
                            </span>
                          </div>
                        ))}
                        {analyticsEvents.length === 0 && (
                          <p className="placeholder-text">Nessun dato raccolto ancora. Condividi il volantino per iniziare a raccogliere visite!</p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

           {/* PUBLISH TAB */}
          {activeTab === 'publish' && (
            <div className="publish-panel-centered">
              <div className="publish-hero">
                <Sparkles size={48} color="var(--brand-primary)" />
                <h2>Il tuo volantino è pronto!</h2>
                <p>Scegli come vuoi distribuirlo per raggiungere i tuoi clienti.</p>
              </div>

              <div className="publish-options-grid">
                <div className="publish-card">
                  <Printer size={32} className="pub-icon" />
                  <h3>Stampa o Salva in PDF</h3>
                  <p>Scarica il PDF sul tuo dispositivo o invialo alla stampante per copie fisiche.</p>
                  <button className="btn btn-primary btn-block" onClick={() => setPublishModal('print')}>
                    Procedi alla Stampa
                  </button>
                </div>

                <div className="publish-card">
                  <Share2 size={32} className="pub-icon" />
                  <h3>Condividi Sfogliabile Digitale</h3>
                  <p>Ottieni un link pubblico interattivo con effetto sfoglio 3D per WhatsApp.</p>
                  
                  {publishedFlipbookUrl ? (
                    <div className="flipbook-success-box">
                      <input type="text" className="link-copy-input" readOnly value={publishedFlipbookUrl} />
                      <div className="btn-row margin-top">
                        <button 
                          className="btn btn-secondary" 
                          onClick={() => {
                            navigator.clipboard.writeText(publishedFlipbookUrl);
                            alert('Link copiato negli appunti!');
                          }}
                        >
                          Copia Link
                        </button>
                        <button className="btn btn-primary" onClick={() => setPublishModal('whatsapp')}>
                          Condividi
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      className="btn btn-primary btn-block" 
                      onClick={handlePublishFlipbook}
                      disabled={actionLoading}
                    >
                      {actionLoading ? 'Generazione in corso...' : 'Pubblica Online (Genera Sfogliabile)'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Mobile Switch bar for edit/preview inside flyers */}
        {activeTab === 'flyers' && (
          <div className="mobile-switch-bar">
            <button 
              className={`switch-btn ${mobileSubTab === 'edit' ? 'active' : ''}`}
              onClick={() => setMobileSubTab('edit')}
            >
              <Settings size={18} />
              <span>Modifica</span>
            </button>
            <button 
              className={`switch-btn ${mobileSubTab === 'preview' ? 'active' : ''}`}
              onClick={() => setMobileSubTab('preview')}
            >
              <Layout size={18} />
              <span>Anteprima</span>
            </button>
          </div>
        )}
      </main>

      {/* STAMPA STEP-BY-STEP MODAL */}
      {publishModal === 'print' && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>🖨️ Come Stampare o salvare come PDF</h3>
            <div className="step-list">
              <div className="step-row">
                <span className="step-num">1</span>
                <p>Premi il pulsante <strong>"Apri Finestra di Stampa"</strong> qui sotto.</p>
              </div>
              <div className="step-row">
                <span className="step-num">2</span>
                <p>Nel menù di stampa del browser, seleziona <strong>"Salva come PDF"</strong> o seleziona la tua stampante fisica.</p>
              </div>
              <div className="step-row">
                <span className="step-num">3</span>
                <p><strong>IMPORTANTE:</strong> Nelle impostazioni avanzate di stampa, attiva l'opzione <strong>"Grafica di sfondo"</strong> per vedere i colori dei volantini.</p>
              </div>
            </div>

            <div className="btn-row margin-top">
              <button className="btn btn-secondary" onClick={() => setPublishModal(null)}>Annulla</button>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  setPublishModal(null);
                  window.print();
                }}
              >
                Apri Finestra di Stampa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WHATSAPP MODAL */}
      {publishModal === 'whatsapp' && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>📱 Condividi su WhatsApp</h3>
            <p>Genera un link per inviare il tuo volantino digitale via messaggio.</p>
            
            <div className="form-group">
              <label>Numero di Telefono del destinatario (es. 3331234567)</label>
              <input 
                type="tel" 
                value={whatsappPhone} 
                onChange={(e) => setWhatsappPhone(e.target.value)} 
                placeholder="Inserisci il numero"
              />
            </div>

            <div className="btn-row margin-top">
              <button className="btn btn-secondary" onClick={() => setPublishModal(null)}>Chiudi</button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  if (!selectedCatalog) return;
                  const finalUrl = publishedFlipbookUrl || window.location.href;
                  const message = `Ciao! Guarda il nostro volantino delle offerte "${selectedCatalog.name}" qui: ${finalUrl}`;
                  const url = `https://wa.me/${whatsappPhone ? '39' + whatsappPhone : ''}?text=${encodeURIComponent(message)}`;
                  window.open(url, '_blank');
                  setPublishModal(null);
                }}
              >
                Invia Messaggio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STRIPE UPGRADE SIMULATION MODAL */}
      {publishModal === 'upgrade' && (
        <div className="modal-backdrop">
          <div className="modal-content upgrade-modal">
            <div className="text-center">
              <Sparkles size={40} color="var(--brand-primary)" className="spin" />
              <h3>Passa al piano Premium 🚀</h3>
              <p className="margin-top">Sblocca il volantino sfogliabile online 3D da condividere su WhatsApp e Social.</p>
            </div>
            
            <div className="stripe-pricing-card margin-top">
              <h4>Piano Premium</h4>
              <span className="price-tag">€14,99 <small>/ mese</small></span>
              <ul className="premium-features-list">
                <li><Check size={14} /> Volantini sfogliabili 3D illimitati</li>
                <li><Check size={14} /> Caching ultra-veloce su CDN Cloudflare</li>
                <li><Check size={14} /> Link condivisibili via WhatsApp con 1 tap</li>
                <li><Check size={14} /> Logo aziendale personalizzato</li>
              </ul>
            </div>

            <div className="btn-row margin-top">
              <button className="btn btn-secondary" onClick={() => setPublishModal(null)}>Annulla</button>
              <button 
                className="btn btn-primary"
                onClick={async () => {
                  try {
                    setActionLoading(true);
                    const { error } = await supabase
                      .from('tenants')
                      .update({ plan: 'premium' })
                      .eq('id', session.user.id);
                    if (error) throw error;
                    
                    setTenant({ ...tenant, plan: 'premium' });
                    setPublishModal(null);
                    alert('Abbonamento Premium attivato! Ora puoi generare il tuo volantino sfogliabile.');
                  } catch (err) {
                    alert('Errore attivazione abbonamento: ' + err.message);
                  } finally {
                    setActionLoading(false);
                  }
                }}
              >
                Simula Stripe Checkout (€14,99)
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* BLOCCO SOLO PER LA STAMPA FISICA */}
      {selectedCatalog && (
        <div className="print-only-flyer">
          {(() => {
            const currentTpl = selectedCatalog.layout_config?.template || 'grid-3';
            const foundTemplate = LAYOUT_TEMPLATES.find(t => t.id === currentTpl);
            const pageSize = foundTemplate ? foundTemplate.pageSize : (currentTpl === 'grid-2' ? 2 : (currentTpl === 'list-classic' ? 5 : 4));
            const totalPages = Math.ceil(catalogItems.length / pageSize) || 1;
            
            const pages = [];
            for (let p = 0; p < totalPages; p++) {
              const pageItems = catalogItems.slice(p * pageSize, (p + 1) * pageSize);
              pages.push(
                <div key={p} className="flyer-sheet-print-page">
                  <header className="flyer-sheet-header" style={{ borderBottomColor: tenant?.brand_colors?.primary || '#1E3A8A' }}>
                    {tenant?.logo_url && <img src={tenant.logo_url} alt="Logo" className="flyer-logo" />}
                    <div>
                      <h1 style={{ color: tenant?.brand_colors?.primary || '#1E3A8A' }}>{selectedCatalog.name}</h1>
                      <p>{tenant?.business_name} - Pagina {p + 1}</p>
                    </div>
                  </header>
                  {renderFlyerItems(currentTpl, pageItems, true)}
                </div>
              );
            }
            return pages;
          })()}
        </div>
      )}
    </>
  );
}
