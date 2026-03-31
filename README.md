# FUNtastic AI Future: Podcast Generator Web

Ultimate Local-First Podcast Generator with AI - Generate engaging podcasts using local AI models with Clean Architecture and offline-first design.

## 🚀 GitHub Pages Deployment

Tento projekt je automaticky nasazován na GitHub Pages při každém commitu do main/master větve.

### Nastavení GitHub Pages

1. **Připojte projekt k GitHubu v Praut s.r.o.:**
   - Klikněte na tlačítko GitHub v pravém horním rohu
   - Vyberte "Connect to GitHub"  
   - Autorizujte Praut s.r.o. GitHub App
   - Vyberte účet/organizaci pro repository
   - Klikněte "Create Repository"

2. **Aktivujte GitHub Pages:**
   - Jděte do nastavení repository na GitHubu
   - Sekce "Pages" v levém menu
   - Source: "GitHub Actions"
   - Uložte nastavení

3. **Automatický deployment:**
   - Při každém push do main/master větve se spustí GitHub Action
   - Build proběhne automaticky
   - Aplikace se nasadí na `https://[username].github.io/FUNtastic-AI-Future-PodcastWeb/`

### Lokální development

```bash
# Instalace závislostí
npm install

# Development server
npm run dev

# Build pro produkci
npm run build

# Preview produkčního buildu
npm run preview
```

## 🔧 API Konfigurace

Pro plnou funkčnost potřebujete nastavit API klíče:

### Povinné API klíče:
- **ElevenLabs API** - pro generování hlasů
  - Získat na: https://elevenlabs.io/app/speech-synthesis
  - Formát: `sk_...`
  
- **OpenAI API** - pro generování scénářů  
  - Získать na: https://platform.openai.com/api-keys
  - Formát: `sk-...`

### Volitelné API klíče:
- **NewsAPI** - pro sběr tech novinek
  - Získat na: https://newsapi.org/account
  
- **Reddit API** - pro sběr z r/technology
  - Nastavit na: https://www.reddit.com/prefs/apps

## 🎙️ Funkce

- ✅ Automatický sběr tech novinek z více zdrojů
- ✅ AI analýza a výběr top témat týdne  
- ✅ Generování přirozeného dialogu mezi specialisty
- ✅ Syntéza českých hlasů pomocí ElevenLabs
- ✅ Kompletní správa epizod a historie
- ✅ Responsivní design s tmavým tech vzhledem

## 🤖 AI Specialisté

- **Petr Mára** - Analytik trendů (makro pohled, budoucnost)
- **Lubo Smid** - Technický expert (frameworky, implementace)  
- **Jarda Beck** - UX/Produkt specialista (praktické využití)

## 📊 Zdroje dat

- Hacker News API
- Reddit r/technology, r/MachineLearning
- ArXiv AI Papers
- TechCrunch RSS
- Product Hunt
- MIT Technology Review

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui  
- **Build:** Vite
- **Deployment:** GitHub Pages
- **AI Services:** OpenAI GPT-4 + ElevenLabs TTS

## 📝 License

MIT License - volně použitelné pro komerční i nekomerční účely.

---

**Vytvořeno s ❤️ Martinem Švandou z Praut s.r.o.**
