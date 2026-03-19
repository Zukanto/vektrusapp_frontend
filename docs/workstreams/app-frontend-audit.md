# Vektrus App Frontend — Vollständiges Audit

**Stand:** 2026-03-18
**Basis:** CLAUDE.md, brand-summary.md (v2.5), vektrus-visual-rules.md (v2.5), vektrus-messaging.md, vektrus-assets-reference.md (v2.5), Pulse/Planner/Brand-Studio Produktdokumente, vollständige Codebase-Analyse

---

## 1. Kurzfassung des Verständnisses

### Gestalterisch
Die App ist als **ruhiges, helles, premium AI SaaS Interface** konzipiert. 85–90 % der Fläche soll flach, hell und vertrauenswürdig sein (Mint White, Vektrus Blue, Anthrazit). 10–15 % dürfen bei aktiver KI-Tätigkeit eine Glassmorphic-Ebene mit dem Vektrus Pulse Gradient (Blau → Violett → Pink → Warm) zeigen. Diese Z-Achsen-Hierarchie (Flat Base + AI Glass Layer) ist das zentrale Design-Prinzip ab v2.5.

### Strukturell
React 18 + TypeScript SPA mit Vite, TailwindCSS, Framer Motion, Supabase. 12 Hauptmodule (Dashboard, ToolHub, Chat, Planner, Pulse, Insights, Vision, Media, Brand Studio, Profile, Help). Sidebar-Navigation mit modulspezifischem Farbakzent-System. Komponentenbibliothek orientiert an shadcn/ui-Patterns (custom).

### Produktlogisch
Echte Produktlogik mit n8n-Webhooks, Supabase-Polling, Realtime-Subscriptions, Status-Workflows (draft → approved → scheduled → published), Cross-Modul-Events, Pulse-Generierungspipeline, Brand-Analyse-Pipeline, Vision-Generierung. Alle async Flows nutzen Polling mit Timeouts.

---

## 2. Gesamturteil

**Der aktuelle Zustand ist solide, aber noch nicht auf dem Niveau, das die Brand-Dokumentation v2.5 definiert.**

Die App fühlt sich bereits ruhig, strukturiert und produktreif an. Die Grundfarben, Typografie und Spacing-Rhythmen sind größtenteils konsistent. Die Produktlogik funktioniert und ist sauber implementiert.

**Was fehlt:** Das gesamte AI State Layer (Pulse Gradient, Glassmorphism, Z-Achsen-Modell, animierte Gradient-Blobs) ist in der Implementierung **praktisch nicht vorhanden**. Die App arbeitet visuell nahezu ausschließlich auf Ebene 0 (Flat). Die in v2.5 definierten „magischen KI-Momente" existieren noch nicht. Darüber hinaus gibt es Inkonsistenzen im Farbsystem, im Shadow/Radius-System und bei States.

---

## 3. Bereiche, die bereits gut zur Marke passen

### Stärken

1. **Grundfarbpalette korrekt implementiert:**
   Vektrus Blue (#49B7E3) als Primary, Mint White (#F4FCFE) als Background, Anthrazit (#111111) als Text, Grau (#7A7A7A) als Secondary Text. Konsistent über alle Module.

2. **Typografie-Hierarchie grundsätzlich korrekt:**
   Manrope für Headlines, Inter/system-ui für Body. Schriftgrößen folgen grob der Hierarchie (28px H1, 20px H2, 15px Body, 13px Small).

3. **Calm-Tech-Grundcharakter erreicht:**
   Kein Neon, kein Cyberpunk, kein Gamer-Look. Die App fühlt sich ruhig und strukturiert an.

4. **Modul-Farbsystem durchdacht:**
   Jedes Modul hat eine dezente Akzentfarbe über `module-colors.ts` mit CSS-Variable-Injection via `ModuleWrapper`. Gut implementiertes Pattern.

5. **Produktlogik sauber separiert:**
   Supabase-Integration, Webhook-Calls, Polling, Status-Management sind funktional und respektvoll implementiert.

6. **Semantische Statusfarben korrekt:**
   Success (#49D69E), Error (#FA7E70), Warning/Pending (#F4BE9D) werden semantisch korrekt verwendet.

7. **BriefingCard im Dashboard:**
   Gutes Beispiel für premium Card-Design: weicher Shadow (`0 4px 20px rgba(0,0,0,0.06)`), großzügiges Padding (32px 36px), Count-Up Animation, Trend-Indikatoren.

8. **Brand Processing Screen:**
   Sauberer AI-Processing-State mit `ai-orb` (Violet Radial-Gradient), Fortschrittsbalken, Step-Indikator. Einer der wenigen Stellen, wo AI Violet korrekt als KI-Prozess-Indikator eingesetzt wird.

---

## 4. Die wichtigsten Inkonsistenzen und Brand-Verstöße

### KRITISCH

**K1: Vektrus Pulse Gradient fehlt vollständig in der Implementierung**
- Der in v2.5 definierte 4-Farb-Gradient (`#49B7E3 → #7C6CF2 → #E8A0D6 → #F4BE9D`) existiert in keiner einzigen Komponente der App.
- Kein CSS-Token, keine CSS-Klasse, kein Gradient-Asset implementiert.
- Betroffene Stellen, die laut Brand-Docs den Pulse Gradient nutzen sollten: AI-Button-Hover, Glassmorphic-Card-Borders, KI-Processing-Glows.

**K2: Glassmorphic AI Layer (Ebene 1) nicht implementiert**
- Kein einziges `glass-modal`, `glass-panel` oder `glass-chat-bubble` existiert in der App-UI.
- `backdrop-filter: blur()` wird zwar in einigen Stellen genutzt (ProcessingOverlay, GlassIcons im ToolHub), aber **nicht** im Sinne des Z-Achsen-Modells.
- Die definierte Spezifikation (`rgba(255,255,255,0.8)`, `backdrop-filter: blur(12px)`, `shadow: 0 8px 32px rgba(0,0,0,0.08)`) ist nirgends als wiederverwendbarer Token vorhanden.

**K3: Animated Gradient Blobs für KI-States fehlen vollständig**
- Die in v2.5 definierten langsam bewegten Gradient-Blobs hinter Glass-Panels bei KI-Processing-States existieren nicht.
- Die `ai-orb` Animation in `index.css` ist ein Anfang (Violet Radial-Gradient), aber nicht das definierte Blob-System.

### HOCH

**H1: Sidebar-Farbzuordnung fehlerhaft**
- `VektrusSidebar.tsx:20-21`: Dashboard nutzt `useModuleColors('chat')` statt eigener Farbe.
- `VektrusSidebar.tsx:27`: Brand Studio nutzt `useModuleColors('chat')` statt eigener Farbe oder `useModuleColors('brand')` (fehlt komplett als Modul-Definition).
- `VektrusSidebar.tsx:61`: ToolHub nutzt `dashboardColors.primary` (= chat-Farbe) statt Vektrus Blue.
- Es fehlen Modul-Definitionen in `module-colors.ts` für: `dashboard`, `toolhub`, `brand`, `help`.

**H2: Kein AI-Action-Button-Typ definiert**
- `button.tsx` hat 6 Varianten: default, destructive, outline, secondary, ghost, link.
- Es fehlt eine `ai-action` Variante mit Violet-Border und Pulse-Gradient-Hover wie in `vektrus-visual-rules.md` definiert.
- KI-Aktionen (Pulse starten, Text neu generieren, Design generieren) nutzen den Standard-Blue-Button statt eines differenzierten AI-Buttons.

**H3: Manrope als Body-Font im gesamten HTML**
- `index.css:13`: `body { font-family: 'Manrope', ... }` setzt Manrope als Default für alles.
- Laut Brand-Docs: Manrope nur für Headlines/Brand-Momente, Inter/system-ui für Body.
- Resultat: Alle Labels, Paragraphs, Tooltips rendern in Manrope statt Inter.
- Wo explizit `fontFamily: 'Inter, system-ui, sans-serif'` gesetzt wird (z.B. BriefingCard), wird es korrekt, aber das ist nur in wenigen Komponenten der Fall.

**H4: Shadow-System inkonsistent**
- BriefingCard: `0 4px 20px rgba(0,0,0,0.06)` (inline)
- PulsePage Cards: `0px 4px 18px rgba(17,17,17,0.06)` (inline)
- Button default: `shadow-md` → `shadow-lg` auf Hover (Tailwind)
- ProcessingOverlay: `shadow-2xl` (Tailwind)
- Sidebar Indicator: `shadow-xl` (Tailwind)
- Es gibt keinen definierten Shadow-Token-Satz. Jede Komponente definiert Shadows individuell.

**H5: Border-Radius inkonsistent**
- Button: `rounded-xl` (12px)
- BriefingCard: `rounded-[20px]`
- PulsePage Cards: `rounded-[14px]`
- Chat Loading Bubble: `rounded-2xl rounded-tl-md` (16px + 6px)
- Skeleton Cards: `rounded-xl` (12px)
- ProcessingOverlay Card: `rounded-2xl` (16px)
- Laut Visual Rules: Cards 12–16px, Buttons 10px. Die App nutzt 12px, 14px, 16px und 20px ohne klares System.

### MITTEL

**M1: AI Violet wird an korrekten Stellen eingesetzt, aber ohne System**
- `#7C6CF2` kommt vor in: BriefingCard (linker Gradient-Streifen, Sparkles-Icon), ActivityTimeline (content_generated Event), DashAiInsights (linker Border), InsightsTopPosts, DesignStatusBadge, GenerationProgressBanner, CarouselSlideNavigator, ReviewModal, BrandProcessing (ai-orb).
- Die Nutzung ist semantisch größtenteils korrekt (KI-Aktivität), aber es gibt keinen zentralen AI-Color-Token.
- Risiko: Ohne Token kann die 10%-Regel nicht kontrolliert werden.

**M2: Empty States sind funktional, aber nicht premium**
- PulsePage: Grauer Icon-Container + Text, keine Illustration, kein Call-to-Action-Button.
- VisionProjectList: Text + Button, aber Standard-Styling.
- MediaPage: Hat `renderEmptyState()`, aber generisches Pattern.
- ContentSlotEditor Media-Tab: "Noch keine Medien vorhanden" als einfacher Text.
- Kein einheitliches Empty-State-Pattern über die App.

**M3: Loading States variieren stark**
- DashboardHome: Custom `dashPulse` Keyframe-Animation (Kreis mit Pulseffekt).
- BrandProcessing: `ai-orb` mit Step-Indikator (gut).
- ContentPlanner: `SkeletonWeekView` mit `animate-pulse` (okay).
- BrandAnalyzePage: Einfacher Spinner (`border-2 border-[#49B7E3] animate-spin`).
- Chat: `VektrusLoadingBubble` mit Statusrotation und Shimmer (aufwändig, aber setzt Vektrus Blue statt AI Violet ein).
- Kein einheitliches Loading-Pattern.

**M4: Hover-States inkonsistent**
- DashboardHome Notification-Bell: `onMouseEnter/Leave` mit inline JS statt Tailwind hover.
- PulsePage Mode-Cards: `hover:scale-[1.02] hover:border-[#49B7E3]/30`
- PulsePage History: `hover:shadow-lg hover:border hover:border-[#49B7E3]/30 hover:-translate-y-0.5`
- Buttons: Standard Tailwind hover.
- Kein einheitliches Hover-Elevation-System.

**M5: ToolHub GlassIcons nutzen HSL-Gradienten statt Brand-Farben**
- `glass-icons.tsx`: Verwendet generische HSL-Gradienten (`hsl(223, 90%, 50%)` etc.) statt Vektrus-Farbwerte.
- Das 3D-Glass-Icon-Pattern im ToolHub ist technisch beeindruckend, aber visuell nicht markenkonform (zu generisch, zu intensiv für Calm Tech).

**M6: Module-Gradient-System nutzt Blue→Accent statt definierte Brand-Gradienten**
- `module-utilities.css`: `.module-button-primary` nutzt `linear-gradient(135deg, primary → accent)`.
- Für Pulse-Modul: `#49B7E3 → #49B7E3` (identischer Gradient = kein sichtbarer Gradient).
- Für Chat: `#00CED1 → #00BCD4` (Cyan-Gradient, nicht Vektrus Blue).
- Diese Modul-Gradienten haben keine Verbindung zum Pulse Gradient oder zu den Brand-definierten Gradienten.

### NIEDRIG

**N1: Checkbox-Styling nutzt Light Blue statt Module-Farbe**
- `index.css`: `.custom-checkbox:checked` nutzt `#B6EBF7`. Das ist markenkonform, aber nicht modulsensitiv.

**N2: CSS Syntax-Fehler in `module-utilities.css`**
- Zeile 243 und 254: `justify-center;` statt `justify-content: center;`. Vermutlich Typo, der den Browser ignoriert (Browser versteht das nicht als gültiges Property).

**N3: Logo-Komponente zeigt gleiches Bild in expanded und collapsed State**
- `VektrusSidebar.tsx`: `VektrusLogo` und `VektrusLogoIcon` rendern beide das gleiche Cloudinary-Bild. Im collapsed State sollte idealerweise das Symbol-Only Logo verwendet werden.

**N4: Einige Inline-`<style>`-Tags statt zentraler Keyframes**
- `DashboardHome.tsx:45`: Inline `@keyframes dashPulse`.
- `VektrusLoadingBubble.tsx:96–113`: Inline `@keyframes` für Shine, Pulse, Wobble.
- Sollte in `index.css` oder einem zentralen Animations-System leben.

---

## 5. Bereiche mit zu generischer oder zu lauter AI-Anmutung

1. **ToolHub GlassIcons:** Die 3D-Glas-Icons mit ihren generischen HSL-Gradienten und dem starken Perspektiv-Hover-Effekt wirken zu „Tech Demo" und nicht wie Calm Tech Premium.

2. **Chat Loading Bubble:** Die `VektrusLoadingBubble` nutzt Emojis als Statusanzeiger (🧠, 🔍, 📚, ✨, 🚀) und einen Vektrus-Blue-Hintergrund. Emojis wirken playful-chaotic, nicht intelligent-calm. Die Bubble sollte dezenter und professioneller sein.

3. **Modul-Farbvielfalt:** 7 verschiedene Modul-Akzentfarben (Cyan, Royal Blue, Purple, Pink, Amber, Vektrus Blue, Indigo) erzeugen in der Sidebar zusammen einen bunten Eindruck. Das widerspricht dem Calm-Tech-Prinzip.

---

## 6. Bereiche, in denen das neue AI-Layer sinnvoll eingesetzt werden könnte

1. **Pulse Wizard Generating Overlay:** Aktuell ein Standard-Modal. Idealer Ort für Glassmorphic Panel mit animierten Pulse-Gradient-Blobs.
2. **Brand Processing Screen:** Bereits `ai-orb` vorhanden. Könnte mit Glass-Panel und Gradient-Blobs aufgewertet werden.
3. **Chat AI Response Loading:** Die Loading Bubble ist der natürlichste Ort für subtilen AI-State-Indikator mit Pulse Gradient.
4. **Pulse Auto Quick-Start Card:** Wenn Pulse Auto implementiert wird, wäre die Auto-Karte ein guter Ort für einen subtilen Pulse-Gradient-Border.
5. **AI Rewrite Panel im Planner:** Beim Regenerieren von Text/Design. Dezenter Gradient-Border-Glow während Processing.
6. **Design-Generierungs-Status in ReviewModal:** Während ein Design generiert wird, könnte der Bild-Platzhalter einen subtilen Gradient-Shimmer zeigen.

---

## 7. Bereiche, in denen das neue AI-Layer explizit NICHT eingesetzt werden sollte

Laut Schutzraum-Regeln in `vektrus-visual-rules.md`:

1. **Sidebar / Navigation** — bleibt komplett flach
2. **Content Planner Kalender-Tage** — bleibt flach
3. **Analytics-Charts und Datenvisualisierung** — bleibt flach
4. **Standard-Buttons** (Speichern, Abbrechen, Bearbeiten) — bleibt flach
5. **Settings / Profil / Admin-Bereiche** — bleibt flach
6. **Dashboard KPI-Cards und Tabellen** — bleibt flach (BriefingCard ist Grenzfall: der AI-Sparkles-Indikator ist okay, aber kein Glass-Effekt nötig)

---

## 8. Globale vs. modulbezogene Probleme

### Globale Probleme (betreffen die gesamte App)

| ID | Problem | Priorität |
|----|---------|-----------|
| K1 | Pulse Gradient Token/System fehlt | Kritisch |
| K2 | Glassmorphic Layer System fehlt | Kritisch |
| K3 | Gradient Blob Animationen fehlen | Kritisch |
| H3 | Body-Font falsch (Manrope statt Inter) | Hoch |
| H4 | Shadow-System nicht tokenisiert | Hoch |
| H5 | Border-Radius nicht vereinheitlicht | Hoch |
| M1 | AI Violet ohne zentralen Token | Mittel |
| M2 | Empty States ohne einheitliches Pattern | Mittel |
| M3 | Loading States ohne einheitliches Pattern | Mittel |
| M4 | Hover-States inkonsistent | Mittel |
| N4 | Inline Keyframes statt zentraler Animationen | Niedrig |

### Modulbezogene Probleme

| Modul | Problem | Priorität |
|-------|---------|-----------|
| Sidebar | H1: Falsche Farbzuordnung (Dashboard, ToolHub, Brand) | Hoch |
| Sidebar | N3: Logo collapsed = expanded | Niedrig |
| Buttons | H2: AI-Action-Button-Typ fehlt | Hoch |
| ToolHub | M5: GlassIcons nicht markenkonform | Mittel |
| Chat | Emoji-basierte Loading-Bubble zu playful | Mittel |
| Module Colors | M6: Gradient-System ohne Brand-Bezug | Mittel |
| CSS | N2: Syntax-Fehler in module-utilities.css | Niedrig |

---

## 9. Priorisierte Findings-Übersicht

### Kritisch (muss vor Feature-Weiterentwicklung gelöst werden)
1. **K1** — Pulse Gradient Token/System implementieren
2. **K2** — Glassmorphic AI Layer CSS-Klassen bereitstellen
3. **K3** — Gradient Blob Animationssystem bereitstellen

### Hoch (sollte in den nächsten Arbeitspaketen gelöst werden)
4. **H1** — Sidebar-Modul-Farbzuordnung korrigieren
5. **H2** — AI-Action-Button-Variante einführen
6. **H3** — Body-Font auf Inter/system-ui als Default umstellen
7. **H4** — Shadow-Token-System definieren und einsetzen
8. **H5** — Border-Radius-Token-System definieren und einsetzen

### Mittel (modulweise bei Überarbeitung miterledigen)
9. **M1** — AI Violet als zentralen Token definieren
10. **M2** — Einheitliches Empty-State-Component erstellen
11. **M3** — Einheitliches Loading-State-Component erstellen
12. **M4** — Hover-Elevation-System vereinheitlichen
13. **M5** — ToolHub GlassIcons mit Brand-Farben
14. **M6** — Module-Gradient-System überarbeiten

### Niedrig (bei Gelegenheit miterledigen)
15. **N1** — Checkbox Module-Color-Awareness
16. **N2** — CSS Syntax-Fehler fixen
17. **N3** — Sidebar Logo collapsed vs. expanded
18. **N4** — Inline Keyframes zentralisieren

---

## 10. Betroffene Dateien

### Globale Foundations
- `src/index.css` — Font-Default, Animationen, Keyframes
- `src/styles/module-colors.ts` — Modul-Farbdefinitionen (fehlende Module)
- `src/styles/module-utilities.css` — CSS-Utilities, Syntax-Fehler
- `src/components/ui/button.tsx` — Button-Varianten
- `src/components/ui/ModuleWrapper.tsx` — CSS-Variable-Injection
- `tailwind.config.js` — Tailwind-Erweiterungen

### Neue Dateien (zu erstellen)
- `src/styles/ai-layer.css` — Pulse Gradient Tokens, Glass-Klassen, Glow-Blobs, AI-Animationen
- oder als Teil von `index.css` / Tailwind Plugin

### Sidebar
- `src/components/dashboard/VektrusSidebar.tsx`

### Module
- `src/components/pulse/PulsePage.tsx`
- `src/components/chat/VektrusLoadingBubble.tsx`
- `src/components/brand/BrandProcessing.tsx`
- `src/components/planner/LoadingStates.tsx`
- `src/components/planner/wizard/GeneratingOverlay.tsx`
- `src/components/toolhub/ToolGrid.tsx` / `ToolHubPage.tsx`
- `src/components/ui/glass-icons.tsx`
- `src/components/dashboard/DashboardHome.tsx`
- `src/components/dashboard/BriefingCard.tsx`
