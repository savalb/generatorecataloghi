# 🚀 Guida al Deploy su Vercel

## Prerequisiti
- Account Vercel (gratuito o pro)
- Repository GitHub/GitLab/Bitbucket con il codice
- Progetto Supabase configurato

---

## 📋 Metodo 1: Deploy Tramite Dashboard Vercel (Consigliato)

### Passo 1: Push del Codice su GitHub
```bash
git add .
git commit -m "Initial commit - Piattaforma Volantini SaaS"
git branch -M main
git remote add origin https://github.com/tuo-username/volantini-saas.git
git push -u origin main
```

### Passo 2: Importa su Vercel
1. Vai su [vercel.com](https://vercel.com) e accedi
2. Clicca **"Add New Project"**
3. Seleziona **"Import Git Repository"**
4. Scegli il repository `volantini-saas`
5. Configura il progetto:
   - **Framework Preset**: Vite (rilevato automaticamente)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Passo 3: Configura le Environment Variables
Nella dashboard Vercel, vai su **Settings → Environment Variables** e aggiungi:

```
VITE_SUPABASE_URL=tua_supabase_url
VITE_SUPABASE_ANON_KEY=tua_supabase_anon_key
```

### Passo 4: Deploy
Clicca **"Deploy"** e attendi il completamento (~2-3 minuti).

---

## 🖥️ Metodo 2: Deploy Tramite Vercel CLI

### Installazione Globale della CLI
```bash
npm install -g vercel
```

### Login a Vercel
```bash
vercel login
```

### Deploy di Preview
```bash
vercel
```

### Deploy di Produzione
```bash
vercel --prod
```

---

## ⚙️ Metodo 3: Deploy da Terminale (One-Command)

Se hai già la CLI installata:

```bash
# Login (se non l'hai mai fatto)
vercel login

# Deploy diretto in produzione
vercel --prod
```

---

## 🔧 Configurazione Supabase

### 1. Crea il Progetto Supabase
Vai su [supabase.com](https://supabase.com) e crea un nuovo progetto.

### 2. Esegui lo Script SQL
Copia il contenuto di `supabase_setup.sql` ed eseguilo nell'editor SQL di Supabase.

### 3. Recupera le Credenziali
Vai su **Settings → API** e copia:
- **Project URL** → `VITE_SUPABASE_URL`
- **anon/public key** → `VITE_SUPABASE_ANON_KEY`

### 4. Configura Storage
Crea un bucket pubblico chiamato `product-images`:
1. Vai su **Storage**
2. Clicca **"New Bucket"**
3. Nome: `product-images`
4. Public bucket: ✅ abilitato

---

## 🌐 Dominio Personalizzato (Opzionale)

1. Vai su **Project Settings → Domains**
2. Aggiungi il tuo dominio (es. `volantini.tuaazienda.it`)
3. Configura i DNS come indicato:
   - **Type**: CNAME
   - **Name**: `www` (o @ per il root)
   - **Value**: `cname.vercel-dns.com`

---

## 📊 Post-Deploy Checklist

- [ ] Verifica che il build sia completato senza errori
- [ ] Testa l'upload di un'immagine (compressione WebP)
- [ ] Verifica il funzionamento dello sfogliabile 3D
- [ ] Testa il flusso ordine WhatsApp
- [ ] Controlla che gli analytics vengano tracciati
- [ ] Verifica la stampa A4 (Ctrl+P → Salva come PDF)

---

## 🐛 Troubleshooting

### Errore: "Build failed"
- Controlla i log di build nella dashboard Vercel
- Verifica che tutte le dipendenze siano in `package.json`
- Assicurati che `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` siano impostate

### Errore: "Page not found" dopo deploy
- Controlla che `vercel.json` sia presente nella root
- Verifica che il routing SPA sia configurato correttamente

### Immagini non caricano
- Controlla che il bucket `product-images` sia pubblico
- Verifica le policy RLS di Supabase Storage

---

## 📈 Ottimizzazioni Post-Deploy

1. **Abilita ISR (Incremental Static Regeneration)** se necessario
2. **Configura Edge Functions** per analytics in tempo reale
3. **Attiva Vercel Analytics** per monitorare le performance
4. **Imposta Alert** per errori e downtime

---

## 🔗 Link Utili

- [Documentazione Vercel](https://vercel.com/docs)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Supabase Docs](https://supabase.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

---

**🎉 Il tuo volantino digitale è pronto per il mercato!**
