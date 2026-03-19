# Vektrus App Frontend — Handoff für den nächsten Chat

**Stand:** 2026-03-19
**Kontext:** AP-01 bis AP-08 vollständig umgesetzt (inkl. AP-07 Content Planner). Chat-Corrective-Pass durchgeführt.

---

## AP-01 — Umgesetzt ✓

### Was gemacht wurde

AP-01 ist abgeschlossen. Die globale Design-Foundation ist nun vorhanden.

#### 1. `src/styles/ai-layer.css` (NEU erstellt)

Definiert alle globalen Design-Tokens und das AI State System:

- **`:root` CSS Custom Properties:**
  - `--vektrus-pulse-gradient`: `linear-gradient(135deg, #49B7E3 0%, #7C6CF2 33%, #E8A0D6 66%, #F4BE9D 100%)`
  - `--vektrus-ai-violet`: `#7C6CF2`
  - `--vektrus-ai-violet-rgb`: `124, 108, 242`
  - `--vektrus-glass-bg/blur/border/shadow` — Glass Layer Tokens
  - `--vektrus-shadow-subtle/card/elevated/modal` — Shadow System
  - `--vektrus-radius-sm/md/lg/xl` — Radius System (8/12/16/20px)

- **Glass Layer CSS-Klassen:**
  - `.glass-modal` — für primäre AI-Modals (backdrop-filter: blur 12px)
  - `.glass-panel` — für floating AI Panels (blur 10px, leichter)

- **AI Border Gradient:**
  - `.ai-border-gradient` — Pseudo-Element mit Pulse Gradient border (1px)
  - Default opacity 0, wird auf hover oder mit `.ai-active` sichtbar

- **Glow Blob Animationen:**
  - 3 Keyframes: `ai-blob-drift-1/2/3` (6–8s ease-in-out)
  - `.ai-glow-blob` + `.blob-1/2/3` — die Blob-Elemente
  - `.ai-blob-container` — Wrapper-Container
  - `.ai-blob-container.ai-active` — macht Blobs sichtbar (opacity 1)

#### 2–6. Weitere AP-01-Änderungen

Siehe vorheriges Handoff für Details zu: `index.css` (Font), `module-utilities.css` (Bugfixes), `module-colors.ts` (neue Module), `tailwind.config.js` (Tokens), `button.tsx` (ai-action Variante).

---

## AP-02 — Umgesetzt ✓

Sidebar & Navigation markenkonform gemacht. Siehe vorheriges Handoff für Details.

---

## AP-03 — Umgesetzt ✓

AI-State-System implementiert: BrandProcessing Glass+Blobs, GeneratingOverlay Blobs, VektrusLoadingBubble professionalisiert.

---

## AP-04 — Umgesetzt ✓

Dashboard auf konsistente AP-01-Tokens umgestellt.

---

## AP-05 — Umgesetzt ✓

Pulse-Modul auf konsistente Tokens, AI-Action-Styling, Empty State, Wizard/ReviewModal markenkonsistent.

---

## AP-06 — Umgesetzt ✓

### Was gemacht wurde

Chat-Modul markenkonformer, ruhiger und hochwertiger gemacht. Emojis konsequent durch Lucide-Icons ersetzt. AI-Messages auf calm-premium Oberfläche umgestellt.

#### 1. `src/components/chat/types.ts`

- `ChatAction.icon`: Typ von `string` auf `React.ReactNode` geändert
- Ermöglicht Lucide-Icons statt Emojis in Action-Buttons

#### 2. `src/components/chat/ChatBubble.tsx`

**AI-Avatar professionalisiert:**
- Emoji `✨` → `<Sparkles>` Lucide-Icon
- Gradient: `from-[#49D69E] to-[#49B7E3]` (Grün→Blau) → `from-[#49B7E3] to-[var(--vektrus-ai-violet)]` (konsistent mit LoadingBubble)
- Avatar-Radius: `rounded-xl` → `rounded-[var(--vektrus-radius-sm)]`
- Shadow: `shadow-lg` → `shadow-card`

**AI-Message-Bubble auf ruhige Oberfläche:**
- Vorher: `bg-[#49B7E3] text-white` (solides Blau, laut)
- Jetzt: `bg-white text-[#111111]` mit `border-[rgba(73,183,227,0.12)]` und `shadow-card` (calm premium)
- Radius: `rounded-2xl` → `rounded-[var(--vektrus-radius-lg)]`
- Markdown `prose-invert` → `prose-sm` (da jetzt dunkler Text auf hell)
- Code-Blöcke: `bg-white/10` → `bg-[#F4FCFE]`
- Cursor-Animation: `bg-white` → `bg-[#49B7E3]`

**User-Bubble auf Tokens:**
- Radius: `rounded-2xl` → `rounded-[var(--vektrus-radius-lg)]`
- Shadow: `shadow-md` → `shadow-card`

**Action-Buttons Brand-konform:**
- "In Contentplan übernehmen": `rounded-xl` → `rounded-[10px]`, subtile Border hinzugefügt
- "Bild zum Posting erstellen": `#C0A6F8`/`#4C3D99` (nicht-Brand) → `var(--vektrus-ai-violet)` Tint/Text
- Response-Actions: `rounded-xl` → `rounded-[10px]`, `hover:scale-105` → `hover:scale-[1.03]`
- Sekundäre Actions: `bg-[#B4E8E5]` → `bg-[#F4FCFE]` mit Brand-Border (ruhiger)

#### 3. `src/components/chat/ChatContainer.tsx`

**Header professionalisiert:**
- Avatar: `🤖` Emoji → `<Sparkles>` in blau-violettem Gradient-Container
- Border: `border-gray-200` → `border-[rgba(73,183,227,0.12)]`
- Heading: `font-manrope` hinzugefügt

**Init-State:**
- `🤖` → `<Sparkles>` Icon in Gradient-Container mit `shadow-card`

**Tip-Box auf Brand-Farben:**
- `cyan-*` Tailwind-Klassen → Brand-Farben (`#F4FCFE`, `#49B7E3`, `#111111`, `#7A7A7A`)
- `rounded-xl` → `rounded-[var(--vektrus-radius-md)]`
- Tippfehler in deutschen Umlauten korrigiert

**Error-State:**
- `⚠️` Emoji → `<AlertCircle>` Lucide-Icon
- `rounded-lg` → `rounded-[var(--vektrus-radius-sm)]`
- Border opacity reduziert (subtiler)

**Welcome-Message-Actions auf Lucide-Icons:**
- `📅` → `<Calendar>`, `💡` → `<Lightbulb>`, `📊` → `<BarChart3>`

**generateResponseActions auf Lucide-Icons:**
- Alle Emojis durch passende Lucide-Icons ersetzt (Calendar, PenLine, Palette, Sparkles, Lightbulb, ThumbsUp, ClipboardList)

#### 4. `src/components/chat/InputBar.tsx`

- Suggestions: Emojis aus Labels entfernt (📅, 📊, ✍️, 🚀)
- Suggestion-Buttons: `rounded-xl` → `rounded-[var(--vektrus-radius-sm)]`, `border-gray-200` → Brand-Border
- Form-Container: `rounded-xl` → `rounded-[var(--vektrus-radius-md)]`, `border-gray-200` → Brand-Border
- Send-Button: `rounded-xl` → `rounded-[10px]`, `shadow-md/lg` → `shadow-card/elevated`

#### 5. `src/components/chat/LoadingMessage.tsx`

- Emoji `🎨` entfernt
- Gradient: `from-[#49D69E] to-[#49B7E3]` → `from-[#49B7E3] to-[var(--vektrus-ai-violet)]` (Brand-konform)
- Glow: opacity 50% → 30% (subtiler)
- Text: `text-white` → `text-[#111111]` (da Bubble jetzt hell)
- Sparkles-Icon: `text-[var(--vektrus-ai-violet)]` hinzugefügt
- Progress Bar: `from-[#49D69E] to-[#49B7E3]` → Pulse Gradient
- Bounce-Dots: Pulse-Gradient-Farben (Blau, Violet, Pink)
- Margin-Fix: `ml-13` → `ml-[52px]`

#### 6. `src/components/chat/SmartActionPanel.tsx`

- "Empfehlungen generieren" Button: `🚀` Emoji → `<Sparkles>` Icon, AI Violet Background, `rounded-[10px]`, `shadow-card`
- Header: `font-manrope` hinzugefügt
- Alle Borders: `border-gray-200` → `border-[rgba(73,183,227,0.12)]` (Brand)
- Selection-Buttons: `rounded-lg` → `rounded-[var(--vektrus-radius-sm)]`
- Quick-Action-Buttons: `rounded-lg` → `rounded-[var(--vektrus-radius-sm)]`, Brand-Border

#### 7. `src/components/chat/VektrusLoadingBubble.tsx`

- Inline `<style>` Block entfernt (3 Keyframes)
- Keyframes in `index.css` zentralisiert: `vektrus-shine`, `vektrus-pulse-icon`, `vektrus-fade-slide-in`

#### 8. `src/index.css`

- 3 Keyframes aus VektrusLoadingBubble hierher verschoben (N4 für Chat erledigt)

---

## AP-08 — Umgesetzt ✓

### Was gemacht wurde

Brand Studio auf konsistente AP-01-Tokens migriert. "Analyse starten" Button als AI-Action gestylt.

#### 1. `src/components/brand/BrandAnalyzePage.tsx`

- Error-Button: `rounded-xl` → `rounded-[10px]`, `shadow-card` hinzugefügt

#### 2. `src/components/brand/BrandResult.tsx`

- Header-Icon: `rounded-xl` → `rounded-[var(--vektrus-radius-sm)]`
- Heading: `font-manrope` hinzugefügt
- "Neu analysieren" Button: `rounded-xl` → `rounded-[10px]`
- Style-Summary-Card: Inline `boxShadow` → `shadow-card`, `rounded-2xl` → `rounded-[var(--vektrus-radius-lg)]`

#### 3. `src/components/brand/BrandWizard.tsx`

- Header-Icon: `rounded-xl` → `rounded-[var(--vektrus-radius-sm)]`
- Heading: `font-manrope` hinzugefügt
- Footer-Buttons: `rounded-xl` → `rounded-[10px]`, Shadows → `shadow-card/elevated`
- **"Analyse starten" Button auf AI-Action:** `bg-[#49B7E3]` → `bg-[var(--vektrus-ai-violet)]` (signalisiert KI-Aktion, konsistent mit Pulse "Content generieren")

#### 4. `src/components/brand/wizard/Step1Upload.tsx`

- Heading: `font-manrope` hinzugefügt
- Design-Cards: Inline `boxShadow` → `shadow-card`, `rounded-2xl` → `rounded-[var(--vektrus-radius-lg)]`
- Upload-Area: `rounded-2xl` → `rounded-[var(--vektrus-radius-lg)]`
- Tip-Box: `rounded-2xl` → `rounded-[var(--vektrus-radius-md)]`
- "Dateien auswählen" Button: `rounded-xl` → `rounded-[10px]`

#### 5. `src/components/brand/wizard/Step2Details.tsx`

- Heading: `font-manrope` hinzugefügt
- Logo-Card: Inline `boxShadow` → `shadow-card`, `rounded-2xl` → `rounded-[var(--vektrus-radius-lg)]`
- Details-Card: Inline `boxShadow` → `shadow-card`, `rounded-2xl` → `rounded-[var(--vektrus-radius-lg)]`
- Visual-Style-Buttons: `rounded-xl` → `rounded-[var(--vektrus-radius-sm)]`

#### 6. `src/components/brand/wizard/Step3Start.tsx`

- Heading: `font-manrope` hinzugefügt
- Summary-Card: Inline `boxShadow` → `shadow-card`, `rounded-2xl` → `rounded-[var(--vektrus-radius-lg)]`
- Privacy-Box: `rounded-2xl` → `rounded-[var(--vektrus-radius-md)]`

---

## Was ausdrücklich NICHT verändert wurde (AP-06 + AP-08)

- Keine Chat-Logik: vektrusChatService, chatSessionService, useChatCompletion, Realtime-Subscriptions
- Keine Änderung des Markdown-Renderings (Struktur)
- Keine Änderung des Workflow-Action-Panels oder SmartActionPanel-Logik
- Keine Änderung der Image-Integration (Supabase, externalSupabase)
- Kein neues Chat-Feature
- Keine Brand-Logik: n8n Webhook, Polling, brand_profiles Supabase-Struktur
- Kein Refactor der Brand-Result-Subkomponenten (ColorSection, FontPicker, TypographySection etc.)
- BrandProcessing nicht verändert (bereits in AP-03 erledigt)
- `ai-layer.css` nicht verändert (nur genutzt)
- Keine neuen Dateien erstellt
- Kein AP-07 (Planner) angefasst

---

## Wichtige Hinweise für den nächsten Chat

### Token-System — Status nach AP-06 + AP-08

Module, die jetzt konsistent auf AP-01-Tokens sind:
- Dashboard (AP-04)
- Pulse: PulsePage, WizardRoot, PostResultsList, ReviewModal (AP-05)
- BrandProcessing, GeneratingOverlay, VektrusLoadingBubble (AP-03)
- Sidebar (AP-02)
- **Chat: ChatBubble, ChatContainer, InputBar, LoadingMessage, SmartActionPanel (AP-06)**
- **Brand Studio: BrandAnalyzePage, BrandResult, BrandWizard, Step1/2/3 (AP-08)**

Module, die noch NICHT auf Tokens migriert sind:
- Content Planner (AP-07)
- Vision, Media, Insights, Profile (AP-09)
- ToolHub (AP-10)

### AI-Action-Styling — Aktuelle Nutzung

- PulsePage "Starten"-CTA: `var(--vektrus-ai-violet)` (AP-05)
- WizardRoot "Content generieren"-Button: Solid AI Violet (AP-05)
- **SmartActionPanel "Empfehlungen generieren": AI Violet Background (AP-06)**
- **BrandWizard "Analyse starten": AI Violet Background (AP-08)**
- `ai-action` Button-Variante in `button.tsx` existiert, wird aber von den genannten Stellen per Custom-Styling genutzt

### Chat — Design-Entscheidungen

- **AI-Bubble auf weiße Oberfläche umgestellt.** Begründung: Das vorherige solid `#49B7E3` als Hintergrund für ALLE AI-Messages war "laut" und entsprach nicht dem Calm-Tech-Prinzip. Weiß mit subtiler Brand-Border ist deutlich ruhiger und ermöglicht bessere Lesbarkeit für lange Texte.
- **Loading-Bubble (VektrusLoadingBubble) behält den Blau→Violet-Gradient.** So entsteht eine klare Differenzierung: "AI denkt" = lebendiger Gradient, "AI hat geantwortet" = ruhige, flache Oberfläche.
- **ChatAction.icon ist jetzt `React.ReactNode`** statt `string`. Das ermöglicht Lucide-Icons. Falls andere Teile des Codes noch Emojis als String setzen, muss der Typ dort entsprechend angepasst werden.

### SmartActionPanel — Emojis in Auswahl-Grids

- Die Emojis in den Audience/Goal-Buttons (🏢, 👥, 🎨, 🚀, 📢, ❤️, 🎯, 💰) wurden **bewusst beibehalten**. Sie dienen als visuelle Identifikatoren in kleinen Selection-Cards und sind in diesem Kontext funktional. Bei einer eventuellen Überarbeitung des SmartActionPanels (z.B. AP-11) könnten sie durch Custom-Icons oder Lucide-Icons ersetzt werden.

### Inline Keyframes — Status

- `VektrusLoadingBubble.tsx`: ✓ Keyframes zentralisiert in `index.css` (AP-06)
- `GeneratingOverlay.tsx`: `@keyframes shimmer` und `@keyframes scanline` bleiben inline — zentralisieren bei AP-07 oder AP-12
- Dashboard: ✓ Inline Keyframes entfernt (AP-04)

### Schutzraum-Regeln werden weiterhin eingehalten

- Kein Glass auf Chat (Basis-Ebene)
- AI Violet nur für KI-CTAs und -Indikatoren (SmartActionPanel Generate-Button, BrandWizard Analyse-Button)
- Pulse Gradient nicht auf Chat-Messages oder Brand-Wizard-UI
- Standard-Aktionen (Navigation, Contentplan-Button) bleiben in Vektrus Blue

---

## AP-07 — Umgesetzt ✓

### Was gemacht wurde

Content Planner vollständig auf AP-01-Tokens migriert. Alle Planner-Komponenten nutzen jetzt konsistente Shadow-, Radius- und Farbwerte. Nicht-Brand-Farben ersetzt. Emojis in Summary-Cards durch Lucide-Icons ersetzt. AI-bezogene Aktionen nutzen jetzt AI Violet statt generische Violett-Töne. Keine Produktlogik-Änderungen.

#### 1. `src/components/planner/LoadingStates.tsx`

- SkeletonCard: `rounded-xl` → `rounded-[var(--vektrus-radius-md)]`, `bg-gray-200` → `bg-[#B6EBF7]/20`
- SkeletonWeekView: `bg-gray-200` → `bg-[#B6EBF7]/20`, `rounded-lg` → `rounded-[var(--vektrus-radius-sm)]`
- ProcessingOverlay: `rounded-2xl` → `rounded-[var(--vektrus-radius-lg)]`, `shadow-2xl` → `shadow-modal`, `font-manrope` auf Heading
- Progress-Bar-Track: `bg-gray-200` → `bg-[#F4FCFE]`

#### 2. `src/components/planner/NotificationBar.tsx`

- Info-Farben: `#DBEAFE` → `#E6F6FB`, `#BFDBFE` → `#B6EBF7` (Brand Light Blue)
- Success-Farben: `#D1FAE5` → `rgba(73, 214, 158, 0.1)`, `#6EE7B7` → `rgba(73, 214, 158, 0.3)` (Brand Success)
- Warning-Border: `#FCD34D` → `#F4BE9D` (Brand Pending)

#### 3. `src/components/planner/PlannerHeader.tsx`

- `border-b-4` → `border-b-2` (ruhiger)
- Alle `rounded-lg` → `rounded-[var(--vektrus-radius-sm)]`
- Pulse-Button: `rounded-lg` → `rounded-[10px]`, `hover:shadow-sm` → `hover:shadow-subtle`
- MonthView-Toggle: `text-gray-600` → `text-[#7A7A7A]`, `hover:bg-gray-100` → `hover:bg-[#F4FCFE]`
- Platform-Filter-Buttons: `rounded-lg` → `rounded-[var(--vektrus-radius-sm)]`

#### 4. `src/components/planner/MonthView.tsx`

- Month-Header: `rounded-2xl border-2` → `rounded-[var(--vektrus-radius-lg)] border`, `shadow-sm` → `shadow-card`
- Nav-Buttons: Gradient-Hover + `scale-105` → schlichte `hover:bg-[#F4FCFE]` + `scale` entfernt
- Calendar-Icon: `w-12 h-12 rounded-xl gradient shadow-md` → `w-10 h-10 rounded-[var(--vektrus-radius-sm)] bg-[#49B7E3] shadow-subtle`
- "Zur Wochenansicht"-Button: Gradient → solides `bg-[#49B7E3]`, `rounded-xl` → `rounded-[10px]`
- Week-Cards: `rounded-2xl border-2` → `rounded-[var(--vektrus-radius-lg)] border`, ruhigere Hover
- KW-Badge: `w-14 h-14 gradient shadow-md` → `w-12 h-12 bg-[#49B7E3] shadow-subtle`
- Stats-Badges: `rounded-xl gradient` → `rounded-[var(--vektrus-radius-sm)]` flache Farben
- Published-Farbe: `#2ecc71` → `#49D69E` (Brand Success)
- KI-Vorschläge-Farbe: `#B6EBF7` → `var(--vektrus-ai-violet)`
- Monatsübersicht-Card: `rounded-xl border-gray-200` → `rounded-[var(--vektrus-radius-md)] border-[rgba(73,183,227,0.12)] shadow-subtle`
- Summary-Cells: `rounded-lg` → `rounded-[var(--vektrus-radius-sm)]`
- "Veroeffentlicht" → "Veröffentlicht" (Umlaut korrigiert)

#### 5. `src/components/planner/WeekView.tsx`

- Week-Grid: `rounded-xl border-gray-200` → `rounded-[var(--vektrus-radius-md)] border-[rgba(73,183,227,0.12)] shadow-subtle`
- Slot-Cards: `rounded-xl hover:shadow-lg` → `rounded-[var(--vektrus-radius-md)] hover:shadow-card`
- Hover-Preview: `rounded-xl shadow-2xl border-gray-200` → `rounded-[var(--vektrus-radius-md)] shadow-elevated border-[rgba(73,183,227,0.12)]`
- Context-Menu: `rounded-xl shadow-2xl border-gray-200` → `rounded-[var(--vektrus-radius-md)] shadow-elevated border-[rgba(73,183,227,0.12)]`
- "Neuer Post"-Button: `rounded-lg hover:scale-105` → `rounded-[var(--vektrus-radius-sm)] hover:opacity-90`
- Week Summary: Emojis (📅, 🤖) → Lucide-Icons (CalendarClock, Sparkles, Check, Zap)
- Summary-Cards: `rounded-xl border-gray-200` → `rounded-[var(--vektrus-radius-md)] border-[rgba(73,183,227,0.12)] shadow-subtle`
- Pulse-Posts-Card: `border-purple-200 bg-purple-100 text-purple-600` → AI Violet Tokens
- Auto-Save: Emoji ✅ entfernt, `border-gray-200` → Brand-Border
- Empty-Slot-Buttons: `rounded-lg` → `rounded-[var(--vektrus-radius-sm)]`, `hover:bg-[#B6EBF7]/5` → `hover:bg-[#F4FCFE]`
- "Veroeffentlicht" → "Veröffentlicht" (Umlaut korrigiert)

#### 6. `src/components/planner/AIRewritePanel.tsx`

- Outer-Panel: `rounded-2xl shadow-2xl` → `rounded-[var(--vektrus-radius-lg)] shadow-modal`
- Header-Icon: `rounded-xl plannerColors.primaryLight` → `rounded-[var(--vektrus-radius-sm)] rgba(124,108,242,0.08)` mit AI Violet Icon
- Heading: `font-manrope` hinzugefügt
- Close-Button: `rounded-lg` → `rounded-[var(--vektrus-radius-sm)]`
- Tone-Buttons: `rounded-xl hover:scale-105` → `rounded-[var(--vektrus-radius-md)] hover:scale-[1.02]`
- Loading-Spinner: `plannerColors.primary` → `var(--vektrus-ai-violet)` (KI-Aktion)
- Error-State: `bg-red-50 border-2 border-red-200 rounded-xl` → `bg-red-50 border border-[#FA7E70]/30 rounded-[var(--vektrus-radius-md)]`
- Comparison-Sections: `rounded-xl` → `rounded-[var(--vektrus-radius-md)]`
- Initial-State Icon: Background AI Violet Tint
- Footer "Abbrechen": `rounded-lg` → `rounded-[10px]`
- Footer "Text übernehmen": `plannerColors.gradient` → `var(--vektrus-ai-violet)`, `rounded-lg hover:shadow-lg` → `rounded-[10px] shadow-card hover:shadow-elevated`

#### 7. `src/components/planner/ContentPlanner.tsx`

- Generating-Overlay: `rounded-2xl shadow-2xl` → `rounded-[var(--vektrus-radius-lg)] shadow-modal`
- Spinner: `border-[#49D69E]` → `border-[var(--vektrus-ai-violet)]` (KI-Aktion)
- Icon: Emoji `✨` → `<Sparkles>` Lucide-Icon in AI Violet
- Heading: `font-manrope` hinzugefügt
- Progress-Bar: `from-[#49D69E] to-[#49B7E3]` → `var(--vektrus-pulse-gradient)` (konsistent mit AP-01)
- Pulse-Banner "Starten"-Button: `rounded-md` → `rounded-[var(--vektrus-radius-sm)]`

#### 8. `src/components/planner/PostReviewModal.tsx`

- **Vollständige `#C0A6F8` / `#4C3D99` Elimination:** Alle Nicht-Brand-Violett-Werte durch `var(--vektrus-ai-violet)` bzw. `rgba(124,108,242,...)` Tints ersetzt
- Outer: `rounded-2xl` → `rounded-[var(--vektrus-radius-lg)] shadow-modal`, `bg-black/50` → `bg-black/40`
- Header: `font-manrope`, `border-gray-200` → Brand-Border
- Sparkles-Icon: `text-[#C0A6F8]` → `text-[var(--vektrus-ai-violet)]`
- Heading: Emoji `✨` entfernt
- Navigation-Leiste: `bg-gray-50 border-gray-200` → `bg-[#F4FCFE] border-[rgba(73,183,227,0.12)]`
- Thumbnail-Buttons: `rounded-lg` → `rounded-[var(--vektrus-radius-sm)]`
- KI-generiert Badge: `bg-[#C0A6F8] text-[#4C3D99]` → `bg-[rgba(124,108,242,0.1)] text-[var(--vektrus-ai-violet)]`
- Regenerate-Button: `bg-[#C0A6F8] text-[#4C3D99]` → `bg-[rgba(124,108,242,0.12)] text-[var(--vektrus-ai-violet)]`
- Optimize-Button: `bg-[#B6EBF7]` → `bg-[#F4FCFE]` mit Brand-Border
- Emoji-Button: `bg-[#F4BE9D]` → dezentere Tints
- "Text für Bild"-Button: Gradient `#C0A6F8→#A084F5` → solid `var(--vektrus-ai-violet)`
- Textarea: `focus:ring-[#C0A6F8]` → `focus:ring-[var(--vektrus-ai-violet)]/30`
- Media CTA: Gradient-Border → `border-[rgba(124,108,242,0.25)]`
- Tip-Emoji 💡 entfernt
- Right-Panel: `bg-gray-50` → `bg-[#F4FCFE]`
- Content-Score-Card: `rounded-lg border-gray-200` → `rounded-[var(--vektrus-radius-md)] border-[rgba(73,183,227,0.12)]`
- Footer-Buttons: Emojis (🗑️, ➕, ✅) entfernt
- "Verwerfen": `rounded-xl` → `rounded-[10px]`
- "Als Entwurf speichern": `bg-[#F4BE9D]` → dezente Tint mit Border
- "Einplanen": `rounded-xl hover:scale-105` → `rounded-[10px] shadow-card hover:shadow-elevated`
- Footer: `bg-gray-50 border-gray-200` → `bg-[#F4FCFE] border-[rgba(73,183,227,0.12)]`
- `#A084F5` → `var(--vektrus-ai-violet)`

#### 9. `src/components/planner/ContentSlotEditor.tsx`

- **Nur Token-Migration, kein Refactor.** Gezielte Änderungen an den visuell wichtigsten Stellen:
- Date/Time-Section: `rounded-2xl border-2 gradient` → `rounded-[var(--vektrus-radius-lg)] border shadow-subtle`
- Clock-Icon: `gradient rounded-xl shadow-md` → `bg-[#49B7E3] rounded-[var(--vektrus-radius-sm)] shadow-subtle`
- Heading: `font-manrope` hinzugefügt
- Datum/Uhrzeit-Emojis (📅, ⏰) entfernt
- Input-Fields: `rounded-xl border-2 shadow-sm hover:shadow-md` → `rounded-[var(--vektrus-radius-md)] border shadow-subtle` (ruhiger)
- "KI Umschreiben"-Button: `#9D4EDD` → `var(--vektrus-ai-violet)`, `rounded-xl hover:scale-105 shadow-lg` → `rounded-[10px] shadow-card hover:shadow-elevated`
- Content-Type-Buttons: `scale-105` → `scale-[1.02]`, Gradient → flache Fläche
- Platform-Selection: `scale-[1.02] gradient shadow-lg` → keine Scale, `bg-[#F4FCFE] shadow-card`
- KI-Vorschlag-Section: `#9D4EDD`/`#B87EE6` → `rgba(124,108,242,...)` Tokens
- Action-Buttons (Posten): `shadow-xl hover:shadow-2xl hover:scale-[1.02]` → `shadow-card hover:shadow-elevated hover:scale-[1.01]`
- Media-Library-Modal: `rounded-2xl` → `rounded-[var(--vektrus-radius-lg)] shadow-modal`
- Options-Tab Date/Time: gleiche Behandlung wie Content-Tab

---

## Was ausdrücklich NICHT verändert wurde (AP-07)

- Keine Drag & Drop Logik
- Keine Supabase Realtime Subscriptions
- Keine Social Posting Logik (postToSocialMedia, socialPostingService)
- Kein CalendarService (loadPosts, createPost, updatePost, deletePost)
- Keine Status-Workflow-Transitions (draft → scheduled → published → failed)
- Keine Polling-Logik
- Kein n8n Webhook-Code
- Keine PlannerContext-Logik
- Keine PulseGeneration-Integration
- Kein AI Glass Layer auf Kalender-Tage (Schutzraum eingehalten)
- Emojis in Selection-Grids (Goals, Content-Types, Tones) bewusst beibehalten (funktionale Identifikatoren)
- ContentSlotEditor: nur Token-Migration an den visuell wichtigsten Stellen, kein Refactor der 1750+ Zeilen-Struktur

---

## Nächstes empfohlenes Arbeitspaket

### AP-09 + AP-10: Vision, Media, Insights, Profile + ToolHub

**Was zu tun ist:**
- Vision, Media, Insights, Profile auf AP-01-Tokens migrieren (AP-09)
- ToolHub GlassIcons mit Brand-Farben ersetzen (AP-10)
- Weniger komplex als AP-07, können zusammengefasst werden

**Danach:** AP-11 (Empty States) + AP-12 (Final Polish)

---

## Offene Punkte (weiterhin bekannt)

| ID | Problem | In welchem AP | Status |
|----|---------|---------------|--------|
| H1 | Sidebar-Farbzuordnung falsch | AP-02 | ✓ Erledigt |
| N3 | Logo collapsed = expanded | AP-02 | ✓ Erledigt |
| K2/K3 | Glass Layer + Blobs in Komponenten | AP-03 | ✓ Erledigt |
| H4 | Shadow-System inkonsistent | AP-04/05/06/07/08 | ✓ Erledigt (Dashboard, Pulse, Chat, Brand, Planner) |
| H5 | Border-Radius inkonsistent | AP-04/05/06/07/08 | ✓ Erledigt (Dashboard, Pulse, Chat, Brand, Planner) |
| M4 | Hover-States inkonsistent | AP-04/05/06/07 | ✓ Erledigt (Dashboard, Pulse, Chat, Planner) |
| N4 | Inline Keyframes (dashPulse) | AP-04 | ✓ Erledigt |
| N4 | Inline Keyframes (LoadingBubble) | AP-06 | ✓ Erledigt |
| H2 | AI-Action-Button-Typ eingesetzt | AP-05/06/08 | ✓ Erledigt (Pulse, Chat, Brand) |
| M2 | Empty States kein einheitliches Pattern | AP-05/11 | ✓ Pulse verbessert, Rest in AP-11 |
| M3 | Loading States variieren | AP-06/07 ff. | ✓ Chat + Planner verbessert |
| M5 | ToolHub GlassIcons nicht markenkonform | AP-10 | Offen |
| N4 | Inline Keyframes (GeneratingOverlay) | AP-07/12 | Offen |

---

## Geänderte Dateien in AP-06

| Datei | Art der Änderung |
|-------|------------------|
| `src/components/chat/types.ts` | ChatAction.icon: string → React.ReactNode |
| `src/components/chat/ChatBubble.tsx` | AI-Avatar Icon, Bubble calm-premium, Radius/Shadow Tokens, Action-Button Branding |
| `src/components/chat/ChatContainer.tsx` | Header Avatar/Border, Tip-Box Brand-Farben, Init/Error States, Welcome-Actions Icons |
| `src/components/chat/InputBar.tsx` | Suggestion-Emojis entfernt, Radius/Shadow/Border Tokens |
| `src/components/chat/LoadingMessage.tsx` | Emoji entfernt, Brand-Gradient, Pulse-Gradient Progress, Text-Farben |
| `src/components/chat/SmartActionPanel.tsx` | Generate-Button AI-Action, Header Font, Border/Radius Tokens |
| `src/components/chat/VektrusLoadingBubble.tsx` | Inline-Keyframes entfernt (nach index.css verschoben) |
| `src/index.css` | 3 Keyframes aus LoadingBubble zentralisiert |

## Geänderte Dateien in AP-08

| Datei | Art der Änderung |
|-------|------------------|
| `src/components/brand/BrandAnalyzePage.tsx` | Error-Button Radius/Shadow Token |
| `src/components/brand/BrandResult.tsx` | Header Icon/Font Tokens, Button Radius, Style-Summary Tokens |
| `src/components/brand/BrandWizard.tsx` | Header Tokens, "Analyse starten" AI-Action, Footer Buttons |
| `src/components/brand/wizard/Step1Upload.tsx` | Heading Font, Design-Card/Upload/Tip Tokens |
| `src/components/brand/wizard/Step2Details.tsx` | Heading Font, Cards/Buttons Tokens |
| `src/components/brand/wizard/Step3Start.tsx` | Heading Font, Summary-Card/Privacy Tokens |

## Geänderte Dateien in AP-07

| Datei | Art der Änderung |
|-------|------------------|
| `src/components/planner/LoadingStates.tsx` | Skeleton Brand-Farben, ProcessingOverlay Radius/Shadow/Font Tokens |
| `src/components/planner/NotificationBar.tsx` | Info/Success/Warning auf Brand-Farben |
| `src/components/planner/PlannerHeader.tsx` | Border ruhiger, Radius/Shadow Tokens, Brand-Farben |
| `src/components/planner/MonthView.tsx` | Tokens, Published-Farbe fix, ruhigere Hover, font-manrope |
| `src/components/planner/WeekView.tsx` | Tokens, Summary Emojis→Icons, Context-Menu/Hover-Preview Tokens |
| `src/components/planner/AIRewritePanel.tsx` | Tokens, AI Violet für KI-Aktionen, ruhigere Motion |
| `src/components/planner/ContentPlanner.tsx` | Generating-Overlay Tokens + AI Violet + Sparkles-Icon |
| `src/components/planner/PostReviewModal.tsx` | Vollständige #C0A6F8/#4C3D99 Elimination → AI Violet, Tokens, Emojis entfernt |
| `src/components/planner/ContentSlotEditor.tsx` | Gezielte Token-Migration: Date/Time, KI-Button, Platform/ContentType Buttons, Action Buttons, Modal |

---

## Token-System — Status nach AP-07

Module, die jetzt konsistent auf AP-01-Tokens sind:
- Dashboard (AP-04)
- Pulse: PulsePage, WizardRoot, PostResultsList, ReviewModal (AP-05)
- BrandProcessing, GeneratingOverlay, VektrusLoadingBubble (AP-03)
- Sidebar (AP-02)
- Chat: ChatBubble, ChatContainer, InputBar, LoadingMessage, SmartActionPanel (AP-06)
- Brand Studio: BrandAnalyzePage, BrandResult, BrandWizard, Step1/2/3 (AP-08)
- **Content Planner: ContentPlanner, WeekView, MonthView, PlannerHeader, NotificationBar, LoadingStates, AIRewritePanel, PostReviewModal, ContentSlotEditor (AP-07)**

Module, die noch NICHT auf Tokens migriert sind:
- Vision, Media, Insights, Profile (AP-09)
- ToolHub (AP-10)

### ContentSlotEditor — Bekannte offene Token-Stellen

Die folgenden Stellen im ContentSlotEditor nutzen noch Ad-hoc-Werte statt Tokens. Sie wurden bewusst nicht angefasst, um die 1750+ Zeilen Datei nicht unnötig zu destabilisieren:

- Einige `rounded-xl` in Platform-Buttons und Icon-Containern (Zeilen ~548, 559)
- `rounded-xl` in Tone-Selection und Hashtag-Input (Zeilen ~919, 941, 977)
- `shadow-sm` auf einigen inneren Elementen
- Diverse `hover:shadow-md` / `hover:scale-[1.02]` Hover-Effekte
- `#B4E8E5` Gradient-Farbwerte in Label-Icons

Diese könnten bei AP-12 (Final Polish) adressiert werden.

---

## Relevante Dateien, die der nächste Chat zuerst lesen soll

### Pflicht
1. `CLAUDE.md`
2. `docs/brand/vektrus-visual-rules.md`
3. `docs/workstreams/app-frontend-audit.md`
4. `docs/workstreams/app-frontend-rollout-plan.md`
5. `docs/workstreams/app-frontend-handoff.md` (dieses Dokument)

---

## Corrective Design Pass — Umgesetzt ✓

**Stand:** 2026-03-18
**Kontext:** Globaler visueller Corrective Pass nach AP-01 bis AP-08.

### Warum dieser Pass nötig war

Nach Abschluss der AP-01–AP-08 Arbeitspakete waren mehrere visuelle Schwächen verblieben:
- Shadow-System zu flach (Einschicht-Shadows, 6% Opacity auf hellen Hintergründen kaum sichtbar)
- Borders durchgehend zu schwach (12% Opacity auf `rgba(73,183,227,...)`)
- 5 Module komplett nicht migriert (Vision, Media, Insights, Profile, ToolHub)
- Zahlreiche `border-gray-200`, `bg-gray-100`, `text-gray-*` Referenzen in bereits migrierten Modulen
- `#C0A6F8` (Off-Brand-Violett) statt AI Violet Token in mehreren Modulen
- Inline boxShadow-Stile statt Token-Referenzen
- Inkonsistente Radius-Werte

### Was geändert wurde

#### 1. Globale Token-Korrekturen

**`src/styles/ai-layer.css`:**
- **Shadow-System auf Multi-Layer-Shadows umgestellt** (jede Stufe hat jetzt einen Tight-Layer für Kantendefinition + einen Depth-Layer für Tiefenwirkung)
  - `shadow-subtle`: `0 1px 2px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.03)`
  - `shadow-card`: `0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)`
  - `shadow-elevated`: `0 1px 3px rgba(0,0,0,0.05), 0 8px 28px rgba(0,0,0,0.09)`
  - `shadow-modal`: `0 2px 4px rgba(0,0,0,0.05), 0 16px 48px rgba(0,0,0,0.14)`
- **Border-Token-System eingeführt:**
  - `--vektrus-border-subtle: rgba(73,183,227,0.10)`
  - `--vektrus-border-default: rgba(73,183,227,0.18)`
  - `--vektrus-border-strong: rgba(73,183,227,0.28)`
- **Radius-System deutlich erhöht — keine eckigen Kanten mehr:**
  - `--vektrus-radius-sm`: 8px → **12px** (Inputs, Chips, Badges, kleine Buttons)
  - `--vektrus-radius-md`: 12px → **16px** (Standard-Cards, Container)
  - `--vektrus-radius-lg`: 16px → **20px** (Große Cards, Modals, Panels)
  - `--vektrus-radius-xl`: 20px → **24px** (Hero-Elemente, Feature-Cards)
- **Alle Tailwind-Defaults ebenfalls erhöht** (rounded, rounded-md, rounded-lg, rounded-xl, rounded-2xl)

**`tailwind.config.js`:**
- Shadow-Tokens synchron mit ai-layer.css aktualisiert
- **Tailwind borderRadius-Defaults überschrieben** (DEFAULT=12px, md=12px, lg=14px, xl=16px, 2xl=20px, 3xl=24px)

**`src/components/ui/button.tsx`:**
- Basis-Radius: `rounded-[var(--vektrus-radius-sm)]` (12px, weich gerundet)
- Default-Variante: `shadow-md` → `shadow-card`, `hover:shadow-lg` → `hover:shadow-elevated`
- Destructive: `shadow-md` → `shadow-card`
- Outline: `border-2 border-gray-200` → `border border-[rgba(73,183,227,0.18)] shadow-subtle`

**Globale Radius-Migration (460+ Stellen):**
- ALLE `rounded` (4px), `rounded-sm` (2px), `rounded-md` (6px) → `rounded-[var(--vektrus-radius-sm)]`
- ALLE `rounded-lg` (8px) → `rounded-[var(--vektrus-radius-sm)]`
- ALLE `rounded-xl` (12px) → `rounded-[var(--vektrus-radius-md)]`
- ALLE `rounded-[10px]` → `rounded-[var(--vektrus-radius-sm)]`
- ALLE `rounded-2xl` → `rounded-[var(--vektrus-radius-lg)]` (bereits in vorherigem Pass)
- Direktionale Radius (rounded-t-xl etc.) → Token-Varianten
- **Null verbleibende eckige Radius-Werte im gesamten src/**

#### 2. Border-Opacity globaler Mindeststandard

Alle `rgba(73,183,227,0.12)` → `rgba(73,183,227,0.18)` in:
- Chat (ChatBubble, ChatContainer, LoadingMessage, SmartActionPanel, InputBar)
- Brand (BrandProcessing, BrandResult, BrandWizard, Step3Start, ColorSection, TonalitySection, TypographySection, VisualStyleSection)
- Planner (MonthView, WeekView, PostReviewModal)
- Insights (InsightsPage, InsightsTopPosts)

Alle `rgba(73,183,227,0.15)` → `rgba(73,183,227,0.18)` in:
- Chat (ChatBubble, InputBar, SmartActionPanel)
- Planner (ContentSlotEditor, PostReviewModal, AiImageGenerationModal)
- Auth (LoggedOutPage)

#### 3. Vollständige Token-Migration nicht-migrierter Module

**Vision:**
- `rounded-xl/2xl` → Token-Radius
- `shadow-lg/2xl` → Token-Shadows
- `border-gray-*` → Brand-Borders
- `bg-gray-*` → Brand-Backgrounds
- `text-gray-*` → Brand-Textfarben
- Rose/Pink-Gradients → AI Violet (für AI-Aktionen)
- `shadow-rose-500/*` entfernt
- Focus-States: `rose-400` → `#49B7E3`

**Media:**
- Gleiche Token-Migration wie Vision
- `#C0A6F8`/`#4C3D99` → `var(--vektrus-ai-violet)`
- `#A084F5` → `#6b5ce0` (AI Violet hover-Derivat)
- Inline `boxShadow: '0px 24px 60px...'` → `var(--vektrus-shadow-modal)`

**Insights:**
- Gleiche Token-Migration
- `#C0A6F8`/`#4C3D99` → `var(--vektrus-ai-violet)`
- Inline boxShadow-Werte → Token-Referenzen
- InsightsKpiCards, InsightsTopPosts: Hover-Shadows → Token-Variablen

**Profile:**
- Gleiche Token-Migration
- SocialAuthCallback: Radius/Shadow/Border Tokens

**ToolHub:**
- Gleiche Token-Migration (FeedbackSection, FaqSection, RoadmapSection, QuickStartGuide, TipsCarousel, HowItWorks)

**Auth:**
- AuthPage, ResetPasswordPage, ForgotPasswordPage: Token-Migration

**Help:**
- HelpPage: Token-Migration

#### 4. Breiter Gray-Cleanup

52+ Dateien mit verbleibenden `border-gray-200`, `bg-gray-*` Referenzen korrigiert, darunter:
- Wizard-Komponenten (Step1-4, VisualStep1-5, ModeSelection, etc.)
- Chat-Subkomponenten (ContentplanScheduler, EnhancedInputBar, WorkflowActionPanel, etc.)
- Dashboard-Subkomponenten (AiInsightCard, Header, WeekPreview)
- Planner-Subkomponenten (ContentGenerationAnimation, AIRewritePanel, etc.)
- UI-Komponenten (sidebar.tsx, sign-in.tsx, ai-chat-image-generation.tsx)

### Geänderte Dateien (Zusammenfassung)

| Bereich | Dateien | Art der Änderung |
|---------|---------|------------------|
| Globale Tokens | `ai-layer.css`, `tailwind.config.js` | Multi-Layer-Shadows, Border-Tokens, Radius-sm |
| Button | `button.tsx` | Token-Shadows, Brand-Border, konsistenter Radius |
| Vision (5 Dateien) | VisionProjectList, VisionHeader, VisionVideoPreview, VisionCreatorWizard, VisionPage | Vollständige Token-Migration + Rose→AI Violet |
| Media (4 Dateien) | MediaPage, MediaDetailSidebar, MediaUploadModal, PostSelectionModal | Token-Migration + #C0A6F8→AI Violet |
| Insights (16 Dateien) | Alle Insights-Komponenten | Token-Migration + Inline-Shadows + #C0A6F8→AI Violet |
| Profile (2 Dateien) | ProfilePage, SocialAuthCallback | Token-Migration |
| ToolHub (8 Dateien) | Alle ToolHub-Komponenten | Token-Migration |
| Auth (5 Dateien) | AuthPage, LoginForm, SignupForm, ForgotPasswordPage, ResetPasswordPage | Token-Migration |
| Help (1 Datei) | HelpPage | Token-Migration |
| Chat | ChatBubble, ChatContainer, InputBar, SmartActionPanel, + Subkomponenten | Border-Opacity + Gray-Cleanup |
| Brand | BrandProcessing, BrandResult, BrandWizard, result/*, wizard/* | Border-Opacity + Gray-Cleanup |
| Planner | MonthView, WeekView, PostReviewModal, ContentSlotEditor, AIRewritePanel, + Wizard/* | Border-Opacity + Gray-Cleanup |
| Dashboard | DashboardHome, BriefingCard, ActionCards, ActivityTimeline, DashAiInsights, + Subkomponenten | Gray-Cleanup |
| VektrusLoadingBubble | VektrusLoadingBubble.tsx | Radius-Token für Bubble |
| **Gesamt** | **~80+ Dateien** | |

### Was ausdrücklich NICHT geändert wurde

- Keine Produktlogik (n8n Webhooks, Supabase, Polling, Publishing, Status-Transitions)
- Keine strukturellen Architektur-Änderungen
- Keine neuen Features
- Keine Drag & Drop-Logik
- Keine Routing-Änderungen
- Keine Chat-Service/Session-Logik
- Keine Kalender-Service-Logik
- Emojis in Selection-Grids (Goals, Content-Types, Tones, Audience) bewusst beibehalten

### Bekannte offene Punkte

| ID | Problem | Status |
|----|---------|--------|
| M5 | ToolHub GlassIcons nutzen generische HSL-Gradienten | Offen — die 3D-Glass-Icons in `glass-icons.tsx` sind visuell nicht markenkonform, aber ein Full-Redesign war out of scope |
| N4 | Inline Keyframes in GeneratingOverlay | Offen — `shimmer` und `scanline` Keyframes bleiben inline |
| — | ContentSlotEditor hat ~20 verbleibende Ad-hoc-Werte | Offen — bei 1750+ Zeilen bewusst nicht vollständig migriert |
| — | `#B6EBF7` als Hardcode statt CSS-Variable | Niedrig — funktional korrekt, aber nicht referenzierbar |
| — | Status-Badge-Farben in Insights/Vision nutzen Tailwind-Semantik (`bg-green-100` etc.) | Absichtlich belassen — semantische Farben für Status-Badges sind funktional angemessen |
| — | Amber-Farben für Beta/Demo-Hinweise | Absichtlich belassen — Amber ist semantisch korrekt für Warnungen/Hinweise |

### Empfehlung

Ein finaler **Visual QA Pass im Browser** wird empfohlen, um:
1. Die tatsächliche visuelle Wirkung der Multi-Layer-Shadows zu prüfen
2. Sicherzustellen, dass die 10px radius-sm Erhöhung überall stimmig wirkt
3. Spezifische White-on-Mint-White Stellen im Live-UI zu identifizieren
4. ToolHub GlassIcons ggf. mit Brand-konformen Alternativen zu ersetzen
5. ContentSlotEditor verbleibende Ad-hoc-Werte zu adressieren

---

## Token-System — Status nach Corrective Design Pass

**Alle Module sind jetzt auf das AP-01-Token-System migriert:**
- Dashboard (AP-04 + Corrective)
- Pulse (AP-05 + Corrective)
- Chat (AP-06 + Corrective)
- Brand Studio (AP-08 + Corrective)
- Planner (AP-07 + Corrective)
- Sidebar (AP-02)
- BrandProcessing, GeneratingOverlay, VektrusLoadingBubble (AP-03)
- **Vision (Corrective Pass)**
- **Media (Corrective Pass)**
- **Insights (Corrective Pass)**
- **Profile (Corrective Pass)**
- **ToolHub (Corrective Pass)**
- **Auth (Corrective Pass)**
- **Help (Corrective Pass)**

**Keine Module mehr ausstehend für Token-Migration.**

---

## AI State Layer — Systematische Integration ✓

**Stand:** 2026-03-18
**Kontext:** Gezielte Erweiterung des bestehenden AI State Layers nach AP-01 bis AP-08 + Corrective Pass.

### Warum dieser Pass nötig war

Nach den bisherigen Arbeitspaketen waren die globalen Tokens und CSS-Klassen vorhanden, aber an mehreren konkreten Stellen noch nicht eingesetzt:
- Pulse Startscreen hatte kein Glass, kein Hero-Glow, flache Icons statt Pulse Gradient
- Pulse Wizard hatte kein Glass-Modal, keine Overlay-Blobs, flachen Stepper, kein Gradient-Hover auf CTA
- GeneratingOverlay hatte noch inline Keyframes
- Content Planner hatte keine Pulse-Gradient-Markierungen auf Slots/Badges
- Chat AI-Bubbles waren flach/weiß statt dunkler Glassmorphism
- Typing Indicator hatte weiße Dots statt Pulse-Gradient-Dots
- Dashboard KI-Empfehlungen hatten flat border-left statt Gradient-Border

### Technischer Grundlagen-Check

**Import-Reihenfolge in index.css: KORREKT bestätigt.**
- `@import` Anweisungen stehen vor `@tailwind` Direktiven
- `ai-layer.css` wird korrekt importiert und im Build-Output enthalten
- TypeScript-Kompilierung fehlerfrei, Vite-Build erfolgreich

### Was geändert wurde

#### 1. `src/styles/ai-layer.css` — Neue globale Utilities

- **`.glass-ai-layer`**: Exakte Task-Spezifikation (rgba(255,255,255,0.8), blur(12px), shadow 0 8px 32px)
- **`.border-gradient-ai`**: 2px Pulse-Gradient-Border via Pseudo-Element, opacity 0 → hover/ai-active
- **`.ai-typing-dots`**: Drei Dots mit sequentieller Pulse-Gradient-Animation (1.4s, Blau→Violett→Pink)
- **`.pulse-gradient-icon`**: Pulse-Gradient als Background für Icon-Container
- **`.glass-ai-dark`**: Dunkler Glassmorphism (rgba(30,30,30,0.7), blur 12px) für Chat AI-Bubbles
- **`.ai-hero-glow`**: Subtiler Gradient-Streifen hinter Headings (opacity 7%, blur 40px)

#### 2. `src/index.css` — Zentralisierte Keyframes

- `@keyframes overlay-shimmer` und `@keyframes scanline` aus GeneratingOverlay hierher verschoben

#### 3. `src/components/pulse/PulsePage.tsx` — Pulse Startscreen

- Zap-Icon: `colors.gradient` → `pulse-gradient-icon` (Pulse Gradient statt Modul-Blau)
- H1 "Vektrus Pulse": `ai-hero-glow` dahinter (opacity 7%, blur 40px, fast unsichtbar)
- Mode-Cards: `bg-white border` → `glass-ai-layer border-gradient-ai` (Glassmorphism + Gradient-Border auf Hover)
- Mode-Card-Icons: `rgba(73,183,227,0.15)` → `pulse-gradient-icon` (weiße Icons auf Gradient)

#### 4. `src/components/planner/wizard/WizardRoot.tsx` — Pulse Wizard

- **Overlay-Hintergrund**: `bg-black/60` → `bg-black/40` + 3 animierte `ai-hero-glow` Blobs (opacity 4–6%, blur 50–60px, langsame Drift-Animation)
- **Modal-Container**: `bg-white rounded-xl shadow-modal` → `glass-modal` (Frosted-Glass-Look)
- **Wizard-Icon**: `bg-gradient-to-br from-[#49B7E3] to-[#B4E8E5]` → `pulse-gradient-icon`
- **Stepper/Progress-Bar**: Flache Farben (Grün für abgeschlossen, Blau für aktiv) → Pulse Gradient auf allen aktiven/abgeschlossenen Segmenten
- **"Content generieren"-CTA**: Default bleibt AI Violet, **Hover wechselt zu Pulse Gradient** via onMouseEnter/Leave

#### 5. `src/components/planner/wizard/GeneratingOverlay.tsx` — KI-Ladebildschirm

- **Glass Layer**: `glass-ai-layer` Klasse auf Container hinzugefügt (zusätzlich zu bestehendem `ai-blob-container ai-active`)
- **Inline Keyframes entfernt**: `<style>` Block mit `shimmer` und `scanline` Keyframes entfernt (jetzt in `index.css`)

#### 6. `src/components/planner/WeekView.tsx` — Content Planner

- **"Mit Pulse füllen"-Slots**: Flaches Blau → `pulse-gradient-icon` (runder Gradient-Icon) + AI-Violet-Text + violette Dashed-Border
- **Pulse-Badge auf generierten Posts**: Kleines `bg-white/25` Quadrat → Pill-Badge "Pulse" mit Pulse-Gradient-Hintergrund + Zap-Icon + Text
- **Pulse Posts Summary-Card**: Flat-Icon → `pulse-gradient-icon` (weiß auf Gradient) + `border-gradient-ai ai-active`

#### 7. `src/components/chat/ChatBubble.tsx` — Chat AI-Bubbles

- **AI-Bubble**: `bg-white border text-[#111111]` → `glass-ai-dark border-gradient-ai ai-active` (dunkler Glassmorphism mit Pulse-Gradient-Border)
- **Markdown-Rendering**: `prose-sm` → `prose-sm prose-invert` (alle Textfarben auf weiß)
- **Code-Blöcke**: `bg-[#F4FCFE] text-[#111111]` → `bg-white/10 text-white/90`
- **Cursor-Animation**: `bg-[#49B7E3]` → `bg-white`
- **Timestamp**: `text-[#7A7A7A]` → `text-white/50` (für AI-Bubbles)

#### 8. `src/components/chat/VektrusLoadingBubble.tsx` — Typing Indicator

- **AnimatedDots**: Custom JS-Animation mit weißen Dots → CSS-Klasse `.ai-typing-dots` mit drei Dots in Pulse-Gradient-Farben (Blau, Violett, Pink), sequentiell animiert

#### 9. `src/components/dashboard/DashAiInsights.tsx` — KI-Analyse

- **Card-Border**: `borderLeft: 4px solid AI Violet` → `border-gradient-ai ai-active` (Pulse-Gradient-Umrandung statt flat Left-Border)
- **Sparkles-Icon**: Flat AI-Violet → `pulse-gradient-icon` (runder Container mit Pulse Gradient)

#### 10. `src/components/dashboard/AiInsightCard.tsx` — KI-Empfehlungen

- **Card-Border**: `border border-[rgba(...)]` → `border-gradient-ai ai-active shadow-subtle` (Pulse-Gradient-Umrandung)
- **Icon**: `Lightbulb` in `bg-[#B6EBF7]` → `Sparkles` in `pulse-gradient-icon` (weißes Icon auf Gradient)

### Was ausdrücklich NICHT verändert wurde

- Keine Produktlogik (n8n Webhooks, Supabase, Polling, Publishing, Status-Transitions)
- Keine Sidebar/Navigation
- Keine Kalender-Grundfläche (Schutzraum)
- Keine Charts/Datenvisualisierung
- Keine Standard-Buttons (Speichern, Abbrechen)
- Kein Gradient als Vollflächen-Hintergrund
- Keine Gradient-Schriften
- Keine Chat-Service/Session-Logik
- Keine Drag & Drop-Logik
- Keine Routing-Änderungen
- Wizard Visual-Variante (selectedMode === 'visual') nicht verändert

### Geänderte Dateien

| Datei | Art der Änderung |
|-------|------------------|
| `src/styles/ai-layer.css` | 6 neue CSS-Klassen/Utilities + 1 Keyframe-Animation |
| `src/index.css` | 2 zentralisierte Keyframes (overlay-shimmer, scanline) |
| `src/components/pulse/PulsePage.tsx` | Hero-Glow, Glass-Cards, Gradient-Icons, Gradient-Border-Hover |
| `src/components/planner/wizard/WizardRoot.tsx` | Overlay-Blobs, Glass-Modal, Gradient-Stepper, CTA-Gradient-Hover |
| `src/components/planner/wizard/GeneratingOverlay.tsx` | Glass-Layer, inline Keyframes entfernt |
| `src/components/planner/WeekView.tsx` | Pulse-Slot-Icon, Pulse-Badge, Summary-Card Gradient |
| `src/components/chat/ChatBubble.tsx` | Dark Glass AI-Bubble, prose-invert, Gradient-Border |
| `src/components/chat/VektrusLoadingBubble.tsx` | Pulse-Gradient Typing Dots |
| `src/components/dashboard/DashAiInsights.tsx` | Gradient-Border, Gradient-Icon |
| `src/components/dashboard/AiInsightCard.tsx` | Gradient-Border, Gradient-Icon |

### AI State Layer — Vollständigkeits-Status

| Bereich | Status |
|---------|--------|
| Globale Tokens & Utilities | ✓ Vollständig |
| Pulse Gradient Token | ✓ Vorhanden seit AP-01 |
| Glass-Layer-Klassen (glass-modal, glass-panel, glass-ai-layer) | ✓ Vollständig |
| AI Border Gradient (ai-border-gradient, border-gradient-ai) | ✓ Vollständig |
| Glow Blob Animations | ✓ Vorhanden seit AP-01 |
| Pulse Startscreen | ✓ Glass + Gradient-Icons + Hero-Glow + Border-Hover |
| Pulse Wizard Modal | ✓ Glass-Modal + Overlay-Blobs + Gradient-Stepper + CTA-Hover |
| GeneratingOverlay | ✓ Blobs + Glass + Gradient-Progress (seit AP-03, jetzt ergänzt) |
| BrandProcessing | ✓ Glass-Panel + Blobs (seit AP-03) |
| Content Planner Pulse-Slots | ✓ Gradient-Icon + Violet-Markierung |
| Content Planner Pulse-Badge | ✓ Pill-Badge mit Pulse Gradient |
| Chat AI-Bubbles | ✓ Dark Glassmorphism + Gradient-Border |
| Chat Typing Indicator | ✓ Pulse-Gradient-Dots |
| Dashboard KI-Analyse | ✓ Gradient-Border + Gradient-Icon |
| Dashboard KI-Empfehlungen | ✓ Gradient-Border + Gradient-Icon |

### Noch offene Punkte

| Punkt | Status | Empfehlung |
|-------|--------|------------|
| Wizard Visual-Variante hat kein Glass/Blobs | Offen | Bei Bedarf analog zum Theme-Wizard umstellen |
| Chat-Launcher fehlt (kein FAB vorhanden) | N/A | Kein floating Chat-Launcher im aktuellen Design |
| ToolHub GlassIcons nicht markenkonform | Offen | Separates Arbeitspaket (AP-10) |
| ContentSlotEditor verbleibende Ad-hoc-Werte | Offen | AP-12 (Final Polish) |
| Visual QA im Browser | Empfohlen | Dunkle AI-Bubbles im Chat besonders prüfen |

### Empfehlung

Ein **Visual QA Pass im Browser** wird empfohlen, besonders für:
1. Die dunklen Chat-AI-Bubbles (Lesbarkeit, Kontrast, Zusammenspiel mit hellem Chat-Hintergrund)
2. Die Wizard-Overlay-Blobs (Subtilität prüfen, dürfen nicht ablenken)
3. Die Pulse-Gradient-Icons auf dem Pulse Startscreen
4. Das border-gradient-ai auf den Dashboard KI-Karten

---

## Globaler Icon Audit + Modernization Pass — Umgesetzt ✓

**Stand:** 2026-03-19
**Kontext:** Eigenständiger Icon-Pass nach AP-01 bis AP-08 + Corrective Pass + AI State Layer Integration.

### Warum dieser Pass nötig war

Nach Abschluss aller bisherigen Arbeitspakete war das Icon-System der App funktional korrekt (99% Lucide React), hatte aber mehrere Qualitätsprobleme:
- ~12 Stellen mit Emojis statt professioneller Lucide-Icons
- Falsche Icon-Aliase in mehreren Dateien (z.B. `Circle as CircleHelp`, `CreditCard as Edit`)
- Off-Brand-Farben (#C0A6F8/#4C3D99) in HelpPage
- Inkonsistente Platform-Darstellung (Emojis vs. Custom SVGs vs. Lucide)

### Icon-System-Regelwerk (gilt ab jetzt)

**Icon-Bibliothek:** Ausschließlich Lucide React.

**Größenlogik:**
- `w-3 h-3` (12px): Micro-Indikatoren, Badges
- `w-3.5 h-3.5` (14px): Status-Icons in Badges
- `w-4 h-4` (16px): Standard/Default — Button-Icons, Inline-Actions, Form-Labels
- `w-5 h-5` (20px): Header-Icons, Sidebar, primäre Action-Buttons
- `w-6 h-6` (24px): Section-Header, Contact-Cards
- `w-8+ h-8+`: Modal-Header, Empty States

**Immer `className="w-X h-X"` verwenden, nicht `size={N}` Props.**

**Farblogik:**
- Neutral: `text-[#7A7A7A]` — sekundäre Icons, Labels
- Primary: `text-[#49B7E3]` — primäre Aktionen, Links
- Dark: `text-[#111111]` — starke Emphasis
- White: `text-white` — auf farbigen Hintergründen
- AI Violet: `text-[var(--vektrus-ai-violet)]` — NUR echte KI-Aktionen
- Success: `text-[#49D69E]`, Error: `text-[#FA7E70]`, Warning: `text-[#F4BE9D]`

**Container:**
- Kein Container: Inline-Actions, Button-Icons, Navigation
- Rund (`rounded-full`): Status-Indikatoren, Avatare
- Gerundetes Quadrat (`rounded-[var(--vektrus-radius-sm)]`): Modul-Icons, Feature-Cards
- Gradient (`pulse-gradient-icon`): NUR für KI-Aktions-Icons

**KI-Icons:** Sparkles (primär), Zap (Pulse), Brain (KI denkt). Gradient-Container nur für KI-Momente.

**Emojis:** Grundsätzlich nicht verwenden, außer in funktionalen Selection-Grids (Audience/Goal/Tone-Auswahl) und Rating-Elementen, wo sie als kompakte visuelle Identifikatoren dienen.

### Was geändert wurde

#### 1. Emoji-zu-Icon-Modernisierung

**`src/components/dashboard/AiInsightCard.tsx`:**
- Emojis 🎯, 💡, ⚠️ → Lucide Target, Lightbulb, AlertTriangle mit semantischen Farben
- Emoji 📊 → Lucide BarChart3 mit Brand Blue
- Imports: Target, AlertTriangle, BarChart3 hinzugefügt

**`src/components/dashboard/OnboardingChecklist.tsx`:**
- Emoji 🎉 → Lucide PartyPopper
- Import: PartyPopper hinzugefügt

**`src/components/dashboard/WeekPreview.tsx`:**
- Platform-Emojis (📷, 🎵, 💼, 👥, ✖️, 📱) → Lucide Platform-Icons (Instagram, Music2, Linkedin, Facebook, Twitter, Calendar)
- getPlatformIcon() gibt jetzt React-Elemente statt Strings zurück
- Imports: Instagram, Linkedin, Facebook, Music2, Twitter hinzugefügt

**`src/components/insights/InsightsTopPosts.tsx`:**
- 📅 → Lucide Calendar (size=11)
- ❤️ → Lucide Heart, 💬 → MessageCircle, ↗️ → Share2
- ✨ → Lucide Sparkles (2 Stellen: recycle_reason + Toast)
- Imports: Calendar, Heart, MessageCircle, Share2, Sparkles hinzugefügt

**`src/components/insights/insightsHelpers.tsx`:**
- FORMAT_LABELS: Emojis entfernt (📝, 📸, 🎠, 🎬 → reine Text-Labels)

**`src/components/media/PostSelectionModal.tsx`:**
- Platform-Emojis (📷, 💼, 🎵, 👥, 🐦, 📱) → Lucide Platform-Icons
- getPlatformIcon() gibt React-Elemente statt Strings zurück
- Imports: Instagram, Linkedin, Music2, Facebook, Twitter, Globe hinzugefügt

**`src/components/planner/wizard/CarouselSlideNavigator.tsx`:**
- Status-Emojis (✅, 🔄, ⚠️, ❌) → Lucide CheckCircle, Loader2, AlertTriangle, XCircle
- Typ-Emojis (🎯, 🚀, 💡) → Lucide Target, Rocket, Lightbulb
- Fehler-Emoji ⚠️ → Lucide AlertTriangle
- Imports: CheckCircle, Loader2, AlertTriangle, XCircle, Target, Rocket, Lightbulb hinzugefügt

**`src/components/planner/wizard/StoryPostCard.tsx`:**
- 📱 → Lucide Smartphone (3 Stellen: Badge, Preview, Fallback)
- ⚠️ → Lucide AlertTriangle
- 🎭 → Lucide Theater
- ⏰ → Lucide Clock
- Imports: Smartphone, AlertTriangle, Theater, Clock hinzugefügt

**`src/components/help/HelpPage.tsx`:**
- 👋 → Sparkles Icon in Brand Blue Container
- 🎉 aus Heading entfernt
- 🧭, 🎯, 📅, 🤖 → Compass, Target, Calendar, Bot als Lucide-Icons in farbigen Containern
- 📋 → ClipboardList, 🎯 → Target, 🔥 → Flame, 📝 → Send, 💭 → MessageSquare, 📚 → BookOpen
- Off-Brand-Farben (#C0A6F8/#4C3D99) → AI Violet Tokens (rgba(124,108,242,...))
- Gradient from-[#C0A6F8]/20 → from-[rgba(124,108,242,0.08)]
- Imports: Compass, Target, Bot, ClipboardList, Flame, BookOpen, MessageSquare, PartyPopper hinzugefügt

#### 2. Falsche Icon-Aliase korrigiert

**`src/components/dashboard/VektrusSidebar.tsx`:**
- `Circle as CircleHelp` → echtes `CircleHelp` (Fragezeichen-Kreis statt leerer Kreis)
- `Circle as XCircle` → echtes `XCircle` (X im Kreis statt leerer Kreis)
- `Loader as Loader2` → echtes `Loader2`
- `CircleCheck as CheckCircle` → echtes `CheckCircle`

**`src/components/media/MediaPage.tsx`:**
- `CreditCard as Edit` → `PenLine` (korrektes Edit-Icon)
- `MoveVertical as MoreVertical` → echtes `MoreVertical`
- `Grid3x2 as Grid3X3` → echtes `Grid3X3`
- `ListFilter as Filter` → echtes `Filter`

### Geänderte Dateien

| Datei | Art der Änderung |
|-------|------------------|
| `src/components/dashboard/AiInsightCard.tsx` | Emojis → Lucide Icons (Target, Lightbulb, AlertTriangle, BarChart3) |
| `src/components/dashboard/OnboardingChecklist.tsx` | 🎉 → PartyPopper |
| `src/components/dashboard/WeekPreview.tsx` | Platform-Emojis → Lucide Platform-Icons |
| `src/components/dashboard/VektrusSidebar.tsx` | Falsche Icon-Aliase korrigiert (CircleHelp, XCircle, Loader2, CheckCircle) |
| `src/components/insights/InsightsTopPosts.tsx` | Engagement/Datum/Recycling-Emojis → Lucide Icons |
| `src/components/insights/insightsHelpers.tsx` | FORMAT_LABELS Emojis entfernt |
| `src/components/media/PostSelectionModal.tsx` | Platform-Emojis → Lucide Platform-Icons |
| `src/components/media/MediaPage.tsx` | Falsche Icon-Aliase korrigiert (PenLine, MoreVertical, Grid3X3, Filter) |
| `src/components/planner/wizard/CarouselSlideNavigator.tsx` | Status/Typ-Emojis → Lucide Icons |
| `src/components/planner/wizard/StoryPostCard.tsx` | Alle Emojis → Lucide Icons (Smartphone, AlertTriangle, Theater, Clock) |
| `src/components/help/HelpPage.tsx` | 13 Emojis → Lucide Icons + Off-Brand-Farben → AI Violet Tokens |
| `src/components/planner/ContentSlotEditor.tsx` | Content-Type-Emojis (📝📖🎥🔄) → Lucide FileText/BookOpen/Film/Layers, Tone-Emojis (💼😊✨🎓) → Lucide Briefcase/Smile/Sparkles/GraduationCap |
| `src/components/planner/PostReviewModal.tsx` | Content-Type-Emojis → Lucide FileText/BookOpen/Film/Layers |
| `src/components/planner/WeekView.tsx` | getContentTypeIcon() Emojis → Lucide Icons, Smart-Hint-Emojis → Lucide Icons, `CreditCard as Edit` → `PenLine` |
| `src/components/planner/PlannerHeader.tsx` | Goal-Emojis (📢❤️🎯💰🚀🤝) → Lucide Megaphone/Heart/Target/DollarSign/Rocket/Users |
| `src/components/planner/ContentGenerationAnimation.tsx` | Platform-Emojis + Goal-Emojis → Lucide Icons |
| `src/components/planner/ContentPlanner.tsx` | 🚀 aus Notification-Message entfernt |
| `src/components/chat/SmartActionPanel.tsx` | Audience-Emojis (🏢👥🎨🚀) → Lucide Building2/Users/Palette/Rocket, Goal-Emojis → Lucide Icons, TikTok 🎵 → Music2 |

### Was ausdrücklich NICHT geändert wurde

- Keine Produktlogik (n8n Webhooks, Supabase, Polling, Publishing, Status-Transitions)
- Keine Chat-Service/Session-Logik
- Keine Routing-Änderungen
- Keine Drag & Drop-Logik
- Keine neuen Dateien erstellt
- Keine Sidebar-Struktur geändert (nur Icon-Imports korrigiert)
- **Feedback-Rating-Emojis bewusst beibehalten** (HelpPage: 😞😐🙂😊🤩) — funktionale Bewertungs-UI
- **ToolHub GlassIcons nicht geändert** — bleibt separates Arbeitspaket (AP-10)
- **Platform Custom SVGs in Dashboard/Profile** nicht geändert — Brand-Logos der Plattformen sind dort korrekt

### Bekannte offene Punkte

| Punkt | Status | Empfehlung |
|-------|--------|------------|
| ToolHub GlassIcons nutzen generische HSL-Gradienten | Offen | AP-10 — separates Arbeitspaket |
| ContentSlotEditor verbleibende Ad-hoc-Werte (einige rounded/shadow) | Offen | AP-12 (Final Polish) |
| Insights `size={N}` Props statt `className` | Niedrig | Bei Gelegenheit vereinheitlichen |
| Wizard Visual-Variante kein Glass/Blobs | Offen | Bei Bedarf analog zum Theme-Wizard |
| Wizard Step4Summary Emoji 📝 | Niedrig | Bei nächster Wizard-Arbeit |
| Visual QA im Browser | Empfohlen | ContentSlotEditor und SmartActionPanel prüfen |

---

## AP-09 + AP-10 — Umgesetzt ✓

**Stand:** 2026-03-19
**Kontext:** Verbleibende Module-Polish + ToolHub-Überarbeitung.

### AP-09: Vision, Media, Insights, Profile — Abschluss ✓

Die Module waren durch den Corrective Design Pass bereits zu 85-98% migriert. Verbleibende Reste wurden jetzt gefixt:

**`src/components/media/MediaUploadModal.tsx`:**
- `border-gray-300` → `border-[rgba(73,183,227,0.18)]`

**`src/components/media/PostSelectionModal.tsx`:**
- `border-gray-300` → `border-[rgba(73,183,227,0.18)]`

**`src/components/media/MediaPage.tsx`:**
- `hover:bg-[#6b5ce0]` (Off-Brand) → `hover:opacity-90` (2 Stellen)

**`src/components/profile/ProfilePage.tsx`:**
- Toggle-Switch `border-gray-300` → `border-[rgba(73,183,227,0.18)]`
- Session-Dot `bg-gray-300` → `bg-[rgba(73,183,227,0.25)]`

**`src/components/insights/InsightsPage.tsx`:**
- Filter-Border `#E0E0E0` → `rgba(73,183,227,0.18)`

**`src/components/insights/InsightsTopPosts.tsx`:**
- Format-Label Emoji-Fallback `📄` → Text `'Post'`

### AP-10: ToolHub Überarbeitung ✓

#### 1. GlassIcons — Brand-konforme Gradienten (`src/components/ui/glass-icons.tsx`)

**Alle HSL-Gradienten durch Brand-Farbsystem ersetzt:**
- `blue`: HSL(223°) → `#49B7E3 → #3A9BC7` (Vektrus Blue)
- `purple`: HSL(283°) → `#7C6CF2 → #6B5CE0` (AI Violet)
- `indigo`: HSL(253°) → `#6366F1 → #5558D9`
- `orange`: HSL(43°) → `#F4BE9D → #E8A889` (Brand Pending)
- `green`: HSL(123°) → `#49D69E → #3BC088` (Brand Success)
- `teal`: HSL(180°) → `#49B7E3 → #42A5CC` (Vektrus Blue Variante)
- `rose`: HSL(330°) → `#E8A0D6 → #D48FC4` (Pulse Gradient Pink)
- `mint`: HSL(160°) → `#B4E8E5 → #9DD9D5` (Brand Mint)
- `red` entfernt (nicht im Brand-System)

**3D-Effekt dezent zurückgenommen:**
- Rotation: 15° → 12° (default), 25° → 18° (hover) — ruhiger, weniger spielerisch
- Z-Translate hover: 2em → 1.5em — subtiler
- Translate3d: -0.5em → -0.4em — weniger dramatisch

**Tokens statt Hardcodes:**
- `rounded-[1.25em]` → `rounded-[var(--vektrus-radius-lg)]`
- `hsla(223, 10%, 10%, 0.15)` Shadow → `var(--vektrus-shadow-card)`
- `hsla(0,0%,100%,0.15)` → `rgba(255,255,255,0.18)`
- `0.1em hsla inset` → `1px rgba(255,255,255,0.3) inset`
- `backdrop-blur-[0.75em]` → `backdrop-blur-[12px]`
- Label `text-base` → `text-sm` (ruhiger)

#### 2. QuickStartGuide — Brand-Farben (`src/components/toolhub/QuickStartGuide.tsx`)

- `#34D399` → `#3BC088` (Brand Success Darker)
- `#4D9DE0` (2x) → `#3A9BC7` / `#49B7E3` (Vektrus Blue)
- `#F59E0B` → AI Violet für Insights (passt semantisch)

#### 3. HowItWorks — Brand-Farben (`src/components/toolhub/HowItWorks.tsx`)

- Step 3 `#4D9DE0` → `#49B7E3` (Vektrus Blue)
- Step 4 `#34D399` → `#7C6CF2` (AI Violet — Daten/Optimierung)

#### 4. TipsCarousel — Brand-Farben (`src/components/toolhub/TipsCarousel.tsx`)

- `#34D399` → `#49D69E` (Brand Success)
- `#4D9DE0` → `#49B7E3` (Vektrus Blue)
- `#A855F7` → `var(--vektrus-ai-violet)` (Brand AI Violet)
- `#F59E0B` → `#D4864A` (Brand Pending Text)
- `#6366F1` → `var(--vektrus-ai-violet)` (Brand AI Violet)
- Lightbulb-Icons: `#F59E0B` → `#F4BE9D` (Brand Warm)

#### 5. RoadmapSection — Brand-Farben (`src/components/toolhub/RoadmapSection.tsx`)

- Tool-Badge-Farben: Alle Non-Brand-Farben durch Brand-Palette ersetzt
- "In Arbeit" Status: `#F59E0B` → `#F4BE9D` / `#D4864A`
- "Geplant" Dot: `bg-gray-300` → `bg-[rgba(73,183,227,0.25)]`

#### 6. FeedbackSection — Brand-Farben (`src/components/toolhub/FeedbackSection.tsx`)

- `#F59E0B` (Orange) → `#D4864A` / `#F4BE9D` (Brand Warning/Pending)

### Geänderte Dateien

| Datei | AP | Art der Änderung |
|-------|-----|------------------|
| `src/components/media/MediaUploadModal.tsx` | 09 | border-gray → Brand |
| `src/components/media/PostSelectionModal.tsx` | 09 | border-gray → Brand |
| `src/components/media/MediaPage.tsx` | 09 | Off-Brand Hover → opacity |
| `src/components/profile/ProfilePage.tsx` | 09 | gray-300 → Brand (2 Stellen) |
| `src/components/insights/InsightsPage.tsx` | 09 | #E0E0E0 → Brand Border |
| `src/components/insights/InsightsTopPosts.tsx` | 09 | Emoji-Fallback → Text |
| `src/components/ui/glass-icons.tsx` | 10 | HSL → Brand-Gradienten, 3D dezenter, Tokens |
| `src/components/toolhub/QuickStartGuide.tsx` | 10 | Non-Brand → Brand-Farben |
| `src/components/toolhub/HowItWorks.tsx` | 10 | Non-Brand → Brand-Farben |
| `src/components/toolhub/TipsCarousel.tsx` | 10 | 5 Non-Brand-Farben → Brand + Lightbulb-Farbe |
| `src/components/toolhub/RoadmapSection.tsx` | 10 | Non-Brand + gray → Brand |
| `src/components/toolhub/FeedbackSection.tsx` | 10 | #F59E0B → Brand Pending |

### Was ausdrücklich NICHT geändert wurde

- Keine Produktlogik (Webhooks, Supabase, Polling, Publishing)
- Keine Routing-Änderungen
- Keine ToolHub-Sektionsstruktur geändert
- Keine neuen Dateien erstellt
- Keine Vision/Media-Generierungslogik
- Keine Insights-Datenlogik
- Keine Profile-Account-Verbindungslogik

---

## AP-11 + AP-12 — Umgesetzt ✓

**Stand:** 2026-03-19
**Kontext:** Empty States + Final Polish & Consistency Review — Abschluss des Rollout-Plans.

### AP-11: Empty States ✓

**Wiederverwendbare EmptyState-Komponente erstellt:**
- `src/components/ui/EmptyState.tsx` (NEU)
- Props: `icon`, `headline`, `description`, `action` (optional mit Label/onClick/variant), `compact`
- Varianten: primary, secondary, ai
- Konsistente Typografie (font-manrope Headline), Brand-Farben, Token-Radius

**ActivityTimeline Empty State verbessert:**
- Vorher: Nur ein Text-String ohne Icon oder Struktur
- Jetzt: Icon-Container (Clock) + Headline + Beschreibung, konsistent mit anderen Empty States

**Bestehende Empty States sind bereits gut:**
- Pulse: Zap-Icon, gute Copy, CTA ✓
- Vision: VideoIcon, Beta-Hinweis, CTA ✓
- Media: Dual-CTA (Upload + KI), premium ✓
- Insights: Klare Erwartungen, Refresh-Info ✓
- ReviewModal: Sparkles, klare Fehlermeldung ✓

### AP-12: Final Polish & Consistency Review ✓

#### 1. Off-Brand-Farben eliminiert

**`src/components/planner/ContentGenerationAnimation.tsx`:**
- `#C0A6F8` → `#7C6CF2` / `var(--vektrus-ai-violet)` (3 Stellen: Step-Color, Header-Gradient, Progress-Bar)
- Emoji 🤖 → entfernt (Sparkles-Icon bereits vorhanden im Gradient-Circle)

**`src/components/planner/ContentSlotEditor.tsx`:**
- KI-Badge `bg-[#C0A6F8] text-[#4C3D99]` → `bg-[rgba(124,108,242,0.15)] text-[var(--vektrus-ai-violet)]`
- "Mehr anzeigen" `text-[#4C3D99] hover:text-[#A084F5]` → `text-[var(--vektrus-ai-violet)] hover:opacity-80`

**`src/components/planner/WeekView.tsx`:**
- AI-Suggestion Text `text-[#4C3D99]` → `text-[var(--vektrus-ai-violet)]`

**Status nach Cleanup:** Keine `#C0A6F8`, `#4C3D99`, `#A084F5` mehr in aktiv genutzten Komponenten. (`ToolHub.tsx` ist ungenutzt/alt.)

#### 2. Inline Keyframes zentralisiert

Alle verbleibenden Inline-`<style>` Blöcke nach `src/index.css` verschoben:

- `@keyframes design-shimmer` (aus DesignStatusBadge.tsx)
- `@keyframes pulse-dot` (aus DesignStatusBadge.tsx + GenerationProgressBanner.tsx)
- `@keyframes vektrusTourSlideUp` (aus OnboardingTour.tsx)

**Keine Inline-Keyframes mehr in .tsx-Dateien.**

#### 3. Sichtbarste gray-* Reste gefixt

- WeekPreview: `bg-gray-300` → `bg-[rgba(73,183,227,0.25)]`
- OnboardingChecklist: `border-gray-300` → `border-[rgba(73,183,227,0.18)]`

#### Bekannte verbleibende gray-* (bewusst belassen)

Folgende `gray-*` Stellen wurden bewusst nicht geändert, da sie funktionale Zustände in weniger sichtbaren Bereichen darstellen:
- Auth-Formulare (disabled-State `bg-gray-300` für Buttons)
- ContentplanScheduler (cancel-Button `border-gray-300`)
- ContentSlotEditor (dashed borders, Media-Overlay-Hintergründe `bg-gray-900`)
- MonthView (leere Kalender-Dots)
- ReviewModal (Divider-Linie)

Diese könnten bei einer dedizierten Auth-Überarbeitung oder in einem späteren Micro-Polish adressiert werden.

### Geänderte Dateien

| Datei | AP | Art der Änderung |
|-------|-----|------------------|
| `src/components/ui/EmptyState.tsx` | 11 | NEU: Wiederverwendbare EmptyState-Komponente |
| `src/components/dashboard/ActivityTimeline.tsx` | 11 | Empty State mit Icon/Headline/Description |
| `src/components/planner/ContentGenerationAnimation.tsx` | 12 | #C0A6F8 → AI Violet, 🤖 entfernt |
| `src/components/planner/ContentSlotEditor.tsx` | 12 | #C0A6F8/#4C3D99/#A084F5 → AI Violet Tokens |
| `src/components/planner/WeekView.tsx` | 12 | #4C3D99 → AI Violet Token |
| `src/components/planner/wizard/DesignStatusBadge.tsx` | 12 | Inline Keyframes → index.css |
| `src/components/planner/wizard/GenerationProgressBanner.tsx` | 12 | Inline Keyframes → index.css |
| `src/components/OnboardingTour/OnboardingTour.tsx` | 12 | Inline Keyframes → index.css |
| `src/index.css` | 12 | 3 Keyframes hinzugefügt |
| `src/components/dashboard/WeekPreview.tsx` | 12 | bg-gray-300 → Brand |
| `src/components/dashboard/OnboardingChecklist.tsx` | 12 | border-gray-300 → Brand |

---

## Rollout-Plan — Vollständig abgeschlossen ✓

| AP | Status | Beschreibung |
|-----|--------|-------------|
| AP-01 | ✓ | Globale Design-Foundations |
| AP-02 | ✓ | Sidebar & Navigation |
| AP-03 | ✓ | AI-State-System |
| AP-04 | ✓ | Dashboard Polish |
| AP-05 | ✓ | Pulse Module Polish |
| AP-06 | ✓ | Chat Module Polish |
| AP-07 | ✓ | Content Planner Polish |
| AP-08 | ✓ | Brand Studio Polish |
| AP-09 | ✓ | Vision, Media, Insights, Profile Polish |
| AP-10 | ✓ | ToolHub Überarbeitung |
| AP-11 | ✓ | Empty States & In-App-Kommunikation |
| AP-12 | ✓ | Final Polish & Consistency Review |
| Corrective Pass | ✓ | Multi-Layer-Shadows, Border-Tokens, Radius, Gray-Cleanup |
| AI State Layer | ✓ | Glass, Blobs, Gradient-Borders, Typing Dots |
| Icon Pass | ✓ | Emojis → Lucide, Falsche Aliase, Icon-Regelwerk |

**Empfehlung:** Visual QA im Browser, besonders für GlassIcons, AI-Bubbles im Chat und die neuen Lucide-Icons in ContentSlotEditor/SmartActionPanel.

---

## Finaler QA Mini-Fix-Pass — Umgesetzt ✓

**Stand:** 2026-03-19
**Kontext:** Letzter, eng begrenzter Fix-Chat auf Basis der finalen QA (`app-frontend-final-qa.md`). Nur kritische und hohe Findings adressiert.

### Behobene QA-Findings

| Finding | Titel | Status |
|---------|-------|--------|
| K1 | ReviewModal Emojis | ✓ 14 Emojis → Lucide-Icons (Smartphone, MessageCircle, Drama, Link, LayoutGrid, PenLine, AlertTriangle) |
| K2 | ReviewModal undefinierte State-Variable | ✓ `setShowAiImageModal(true)` → `fileInputRef.current?.click()` + AI Violet Styling |
| K3 | Media AI-Badge Kontrast | ✓ `bg-[var(--vektrus-ai-violet)]` → `bg-[var(--vektrus-ai-violet)]/15` auf Badges (4 Stellen in 3 Dateien). Buttons `text-[var(--vektrus-ai-violet)]` → `text-white` (2 Stellen) |
| H1 | VektrusLoadingBubble Gradient | ✓ Solider Blau→Violet-Gradient → `glass-ai-dark border-gradient-ai ai-active`. Icons: `text-white` → `text-[var(--vektrus-ai-violet)]`. ShiningText: Weiß-Gradient → Anthrazit→Violet-Gradient |
| H2 | Planner Kalender-Gradients | ✓ `bg-gradient-to-br from-[#B6EBF7]/30 via-...` → `bg-[#E6F6FB]` (heute), `bg-gradient-to-br from-gray-50 to-...` → `bg-white hover:bg-[#F9FAFB]` (andere Tage) |
| H3 | AI Violet auf Nicht-AI-Metriken | ✓ ProfilePage "Generierte Posts" `text-[var(--vektrus-ai-violet)]` → `text-[#49B7E3]` |
| H3+ | AiRecommendations Kontrast-Bugs | ✓ Button `text-[var(--vektrus-ai-violet)]` → `text-white`. Sparkles-Icon in Violet-Container `text-violet` → `text-white` |
| H4 | Dashboard Inline-JS Hover | ✓ DashKpiCards: `onMouseEnter/Leave` → `shadow-subtle hover:shadow-elevated hover:-translate-y-0.5`. DashTopPosts: inline JS → `hover:bg-[#F4FCFE]` |
| M4 | PlannerHeader Emojis | ✓ `🔒` → Inline SVG Lock-Icon. `✓ Nur aktive` → `Nur aktive` |
| M6 | ChatContainer Emojis | ✓ `🔧` und `✅` aus Markdown-Strings entfernt |

### Geänderte Dateien

| Datei | Art der Änderung |
|-------|------------------|
| `src/components/planner/wizard/ReviewModal.tsx` | 14 Emojis → Lucide, setShowAiImageModal Bug-Fix, 6 neue Lucide-Imports |
| `src/components/media/MediaPage.tsx` | AI-Badge bg /15, Button text-white (4 Stellen) |
| `src/components/media/MediaDetailSidebar.tsx` | AI-Badge bg /15 |
| `src/components/media/PostSelectionModal.tsx` | AI-Badge bg /15 |
| `src/components/chat/VektrusLoadingBubble.tsx` | glass-ai-dark + border-gradient-ai, Violet Icons, ShiningText dunkle Farben |
| `src/components/planner/WeekView.tsx` | Kalender-Gradients → flache Farben |
| `src/components/profile/ProfilePage.tsx` | AI Violet → Vektrus Blue auf Metrik |
| `src/components/insights/AiRecommendations.tsx` | Button text-white, Sparkles text-white |
| `src/components/dashboard/DashKpiCards.tsx` | Inline-JS Hover → Tailwind CSS |
| `src/components/dashboard/DashTopPosts.tsx` | Inline-JS Hover → Tailwind CSS |
| `src/components/planner/PlannerHeader.tsx` | 🔒 → SVG Lock, ✓ entfernt |
| `src/components/chat/ChatContainer.tsx` | 🔧 und ✅ aus Markdown entfernt |

### Was ausdrücklich NICHT geändert wurde

- Keine Produktlogik (Webhooks, Supabase, Polling, Publishing, Status-Transitions, Drag & Drop)
- Keine Kalender-Service-Logik
- Keine Chat-Service/Session-Logik
- Keine Routing-Änderungen
- Keine Token-System-Erweiterungen
- Keine Glass-Konsolidierung
- Keine neuen Dateien erstellt
- Keine Vision/Profile/Insights global umgebaut
- SmartActionPanel Emojis bewusst beibehalten
- ToolHub Glass-Icons nicht verändert

### Was bewusst offen bleibt

| Punkt | Priorität | Empfehlung |
|-------|-----------|------------|
| Token-Adoption global (~50%) | Nach Launch | Schrittweise über künftige Arbeit |
| Glass-System 4 Varianten | Nach Launch | Dokumentation oder Konsolidierung |
| Border-/Radius-Naming in Tailwind | Nach Launch | Konsolidierung vk-* vs Defaults |
| Focus-States global | Nach Launch | Accessibility-Sprint |
| ContentSlotEditor Ad-hoc-Werte | Nach Launch | Bei nächster Editor-Arbeit |
| SmartActionPanel Emojis | Bewusst offen | Funktionale Identifikatoren, kein Handlungsbedarf |

### Empfehlung

**Ein finaler visueller Smoke-Check im Browser wird empfohlen**, besonders für:
1. VektrusLoadingBubble — neue glass-ai-dark Oberfläche auf Chat-Hintergrund prüfen
2. ReviewModal — Lucide-Icons an allen Story-/Carousel-/Text-Only-Stellen prüfen
3. Media AI-Badges — Kontrast auf Bildhintergründen prüfen
4. DashKpiCards — Hover-Transitions mit neuen Tailwind-Klassen prüfen
5. WeekView Kalender-Tage — flache Farben auf verschiedenen Bildschirmhellenwerten prüfen

---

## Popup / Overlay System Pass — Umgesetzt ✓

**Stand:** 2026-03-19
**Kontext:** Gezielter System-Pass für alle Popups, Modals, Overlays und Create-/Edit-Flows außerhalb von Pulse-Hauptflows. Durchgeführt nach abgeschlossenem AP-01–AP-12 Rollout inkl. Corrective Design Pass, AI State Layer, Icon Pass und Mini-Fix-Chat.

### Warum dieser Pass nötig war

Nach dem großen Rollout waren die Popups/Modals/Overlays noch nicht durchgehend auf dem gleichen Qualitätsniveau wie der Rest der App:
- **AiImageGenerationModal**: 100% Inline-Styles, Emojis statt Icons, kein Token-System
- **VisionVideoPreview**: Broken CSS (Typo in bg-Klasse), Tailwind-Default-Farben
- **BrandNudgeModal**: Konfligierende inline/className Styles
- **Mehrere Modals**: Fehlende shadow-modal, font-manrope, backdrop-blur-sm
- **ReviewModal**: Tailwind-Default-Farben (gray-400, blue-50, blue-600, green-600) in Footer und Content Score
- **Toast**: shadow-lg statt shadow-elevated
- **Badge-Farben**: Tailwind-Defaults (green-100, amber-100, orange-100) statt Brand-Semantik

### Definiertes Popup/Overlay-System

| Element | Standard |
|---------|----------|
| Backdrop | `bg-black/50 backdrop-blur-sm` |
| Container | `bg-white rounded-[var(--vektrus-radius-lg)] shadow-modal` |
| Header | `px-6 pt-5 pb-4 border-b border-[rgba(73,183,227,0.10)]` + font-manrope |
| Footer | `px-6 py-4 border-t border-[rgba(73,183,227,0.10)]` |
| Close-Button | `p-2 text-[#7A7A7A] hover:text-[#111111] hover:bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)]` |
| Primary CTA | `bg-[#49B7E3] text-white rounded-[10px] shadow-card` |
| AI CTA | `bg-[var(--vektrus-ai-violet)] text-white rounded-[10px] shadow-card` |
| Secondary | `border border-[rgba(73,183,227,0.18)] text-[#7A7A7A] rounded-[10px]` |
| Inputs | `border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] focus:border-[#49B7E3]` |
| Glass/AI-Layer | Nur bei AI-Processing-Overlays (BrandProcessing, GeneratingOverlay) |
| Lightbox | `bg-black/80` oder `bg-black/90` |
| Confirm-Dialog | `shadow-elevated max-w-sm` |

### Geänderte Dateien

| Datei | Art der Änderung |
|-------|------------------|
| `src/components/planner/AiImageGenerationModal.tsx` | **Komplette Neuschreibung der Styles**: Alle Inline-Styles → Tailwind + Brand-Tokens. Emojis (📱✏️🎨📦) → Lucide-Icons (Palette, Package). onMouseEnter/Leave → Tailwind hover:. Hardcodierte Farben → Brand-Palette. AI-CTA in AI Violet. font-manrope auf Heading. shadow-modal auf Container. backdrop-blur-sm auf Backdrop. Confirm-Dialog und Lightbox konsistent. QuickTagPill, CollapsibleSection, FileUploadArea, ActionBtn alle auf Tailwind. |
| `src/components/vision/VisionVideoPreview.tsx` | Broken CSS Fix (`bg-[rgba(124,108,242,0.06)]0` → `bg-[#49B7E3]`). Model-Badge-Farben von Tailwind-Defaults (green-100, blue-100, orange-100) → Brand-Semantik. Demo-Badge amber → Brand-Palette. Buttons auf Brand-CTAs. |
| `src/components/vision/VisionCreatorWizard.tsx` | Badge-Farben von Tailwind-Defaults → Brand-Semantik. font-manrope auf alle Step-Headings. |
| `src/components/planner/wizard/BrandNudgeModal.tsx` | **Komplette Bereinigung**: Inline-Styles entfernt. Konfligierende border-radius/className eliminiert. SVG-Icon → Lucide Sparkles. Alle Buttons auf Brand-CTA-System. font-manrope auf Heading. backdrop-blur-sm. shadow-modal. |
| `src/components/media/MediaUploadModal.tsx` | shadow-modal auf Container. backdrop-blur-sm. font-manrope auf Heading. "Dateien auswählen"-CTA: bg-[#B6EBF7] → bg-[#49B7E3]. Upload-CTA: hover:scale-105 entfernt. Alle Buttons auf rounded-[10px]. |
| `src/components/media/PostSelectionModal.tsx` | shadow-modal auf Container. backdrop-blur-sm. font-manrope auf Heading. hover:scale-[1.02] entfernt. CTA: bg-[#B6EBF7] → bg-[#49B7E3]. Alle Buttons auf rounded-[10px]. |
| `src/components/brand/result/ReferenceDesigns.tsx` | rounded-2xl → Token. Inline boxShadow → shadow-card. Lightbox-Bild Token-Radius. |
| `src/components/planner/wizard/ReviewModal.tsx` | Footer-Buttons: gradient from-blue-500 → solid bg-[#49B7E3]. "Als Entwurf speichern": border-blue-200/text-blue-600 → Brand-Border/Color. Navigation-Buttons: gray-300/gray-400 → Brand-Farben. Content Score: green-600/blue-600/amber-600/red-500 → Brand-Semantik. Hashtag-Area: blue-50/blue-700 → Brand-Tints. Char-Count: gray-400 → #7A7A7A. Focus-States: blue-400 → #49B7E3. Placeholder: gray-400/gray-300 → #B0B0B0. Divider-Borders: gray-300 → Brand-Border. |
| `src/components/ui/toast.tsx` | shadow-lg → shadow-elevated |

### Was bewusst NICHT verändert wurde

- Keine Produktlogik: Alle onChange, onSubmit, fetch, supabase, polling, n8n-Webhook-Aufrufe sind 1:1 erhalten
- Kein Chat-Redesign (out of scope)
- Keine Sidebar/Navigation
- GeneratingOverlay, BrandProcessing — bereits auf Premium-Niveau (AP-03)
- SpotlightOverlay (Onboarding) — spezielle SVG-Technik
- ReviewModal Phone-Frame dark colors (#1a1a1a, #2a2a2a) — korrekt für Dark-Preview
- Amber-Farben für Story-Badges — semantisch sinnvoll
- ContentSlotEditor — wurde bereits in AP-07 an den wichtigsten Stellen migriert

### Was nach diesem Pass noch offen bleibt

| Thema | Status | Empfehlung |
|-------|--------|------------|
| Chat-Design-Pass | Offen | Eigener dedizierter Chat (VektrusLoadingBubble calm, Loading-Dots, SmartActionPanel Emojis) |
| ContentSlotEditor verbleibende Tokens | Offen | Bei Bedarf in eigenem Pass |
| ReviewModal verbleibende amber-Styles (Story) | Bewusst beibehalten | Semantisch korrekt |
| Einheitlicher EmptyState-Component | Offen (nice-to-have) | Systemische Verbesserung |
| Focus-States systematisch | Offen (nice-to-have) | Accessibility-Pass |

### Empfehlung für nächsten Chat

Ein **Chat-Design-Pass** wäre der nächste sinnvolle Schritt, um die letzten verbleibenden Calm-Tech-Inkonsistenzen zu adressieren (VektrusLoadingBubble, LoadingMessage Bounce-Dots, SmartActionPanel Emojis). Dieser sollte als eigener fokussierter Chat durchgeführt werden.

---

## Chat Intelligent Canvas Redesign — Umgesetzt ✓

**Stand:** 2026-03-19
**Kontext:** Gezielter, größerer Redesign-Pass nur für den Chat. Transformation von Consumer-Messenger-Look zu "Intelligent Canvas" B2B-Arbeitsbereich.

### Warum dieses Redesign nötig war

Der Chat wirkte nach den bisherigen Passes noch zu stark wie ein Consumer-Messenger (WhatsApp/iMessage):
- Volle Bildschirmbreite für den Nachrichtenverlauf
- Dunkle KI-Bubbles (glass-ai-dark) mit inversem Text
- Kein fokussierter Arbeitsbereich-Charakter
- Fehlende Z-Achsen-Hierarchie zwischen KI-Antwort und konkreten Aktionen
- Smart Prompt Chips ohne Glass-Charakter
- AI Action Buttons ohne Premium-Gradient-Branding

### Was geändert wurde

#### 1. `src/styles/ai-layer.css` — 5 neue CSS-Klassen

- **`.chat-stream-wrapper`**: Zentrierter Stream (max-width: 850px, margin: 0 auto) — verwandelt den Chat von Full-Width-Messenger zu fokussiertem Canvas
- **`.chat-ai-card`**: Bright Frosted Glass (rgba(255,255,255,0.85), blur(16px), border rgba(255,255,255,0.8), Multi-Layer-Shadow) — ersetzt die dunkle glass-ai-dark
- **`.chat-sub-card`**: Massives Weiß (bg: #fff, border: #E5E7EB, radius: 12px, padding: 16px) — für konkrete Aktionen innerhalb/unterhalb der Glass-Card
- **`.chat-ai-action-btn`**: Weißer Button mit permanentem Pulse-Gradient-Border (1.5px) + Glow-Hover — für "In Contentplan übernehmen" und AI-Aktionen
- **`.chat-smart-chip`**: Soft Glass (rgba(255,255,255,0.72), blur(8px), subtiler Border) mit translateY(-2px) Hover — für Input-Suggestions

#### 2. `src/components/chat/ChatContainer.tsx` — Layout-Zentrierung

- **Messages Area**: `px-6 py-4` entfernt, stattdessen `chat-stream-wrapper px-4 py-8` für zentrierten Stream mit großzügigem Padding
- **Message Spacing**: `space-y-4` → `space-y-6` (mehr Breathing Room zwischen Messages)
- **Input Area**: `bg-white border-t ... p-6` → `border-t border-[rgba(73,183,227,0.10)] py-5` + `chat-stream-wrapper px-4` (kein harter weißer Hintergrund, zentriert)
- **Header Icon**: `bg-gradient-to-br from-[#49B7E3] to-[var(--vektrus-ai-violet)]` → `pulse-gradient-icon` (voller Pulse Gradient)
- **Init Icon**: Gleiche Pulse-Gradient-Icon-Änderung

#### 3. `src/components/chat/ChatBubble.tsx` — Message-Redesign

**User Message:**
- Max-width: `80%` → `70%` (fokussierter)
- Background: `bg-[#B6EBF7]` (helles Blau) → `bg-white` mit `border border-[rgba(73,183,227,0.12)]` (ruhig, flach, hochwertig)
- Shadow: `shadow-card` → `shadow-subtle`
- Radius: `rounded-br-md` → `rounded-br-[8px]` (konsistent mit AI)

**AI Message:**
- Max-width: `80%` → `85%`
- Bubble: `glass-ai-dark border-gradient-ai ai-active shadow-card` → `chat-ai-card` (Bright Frosted Glass statt dunkler Glass)
- Avatar: `bg-gradient-to-br from-[#49B7E3] to-[var(--vektrus-ai-violet)]` → `pulse-gradient-icon` (voller 4-Farben Pulse Gradient)

**Content Action Buttons (In Contentplan / Bild erstellen):**
- Umhüllt in `chat-sub-card` (weiße Sub-Card auf Glass-Ebene)
- "In Contentplan": `bg-[#49B7E3]/8 text-[#49B7E3] border-[#49B7E3]/15` → `chat-ai-action-btn text-[#111111]` (weiß mit Pulse-Gradient-Border)
- "Bild erstellen": `bg-[rgba(124,108,242,0.06)] border-[rgba(124,108,242,0.2)]` → `chat-ai-action-btn text-[var(--vektrus-ai-violet)]`

**Response Actions (Wochenplan, Anpassen, etc.):**
- Umhüllt in `chat-sub-card`
- `hover:scale-[1.03]` entfernt (zu physical)
- Secondary: `bg-[#F4FCFE]` → `bg-white` mit `hover:border-[#49B7E3]/30`

#### 4. `src/components/chat/InputBar.tsx` — Smart Prompt Chips

- Suggestion Buttons: `bg-white border border-[rgba(73,183,227,0.18)] ... hover:border-[#49B7E3] hover:bg-[#F4FCFE] transition-all` → `chat-smart-chip` (Soft Glass + translateY Hover)

#### 5. `src/components/chat/VektrusLoadingBubble.tsx` — Loading State

- Avatar: `bg-gradient-to-br from-[#49B7E3] to-[var(--vektrus-ai-violet)] rounded-[var(--vektrus-radius-md)] shadow-md` → `pulse-gradient-icon rounded-[var(--vektrus-radius-sm)] shadow-card`
- Bubble: `glass-ai-dark border-gradient-ai ai-active shadow-card` → `chat-ai-card` (konsistent mit Antwort-State)

### Z-Achsen-Logik nach Redesign

| Ebene | Element | Styling |
|-------|---------|---------|
| Ebene 0 (Base) | Mint White Hintergrund, User Messages | Flach, weiß, subtil |
| Ebene 1 (Glass) | AI Response Cards, Loading Bubble | Bright Frosted Glass (chat-ai-card) |
| Ebene 2 (Solid) | Sub-Cards (Aktionen, Quick Replies) | Massives Weiß (chat-sub-card) |
| Akzent | AI Action Buttons | Pulse Gradient Border (chat-ai-action-btn) |
| Akzent | Smart Prompt Chips | Soft Glass (chat-smart-chip) |

### Was ausdrücklich NICHT geändert wurde

- Keine Chat-Logik (useChatCompletion, ChatService, real-time subscriptions, message handling)
- Keine Supabase-Integration (externalSupabase, media_files, Channels)
- Kein State-Management (messages, isTyping, currentThreadId, etc.)
- Keine Props/Callbacks (onActionClick, onRetry, onSendMessage, etc.)
- Keine Streaming-Logik (useAnimatedText, isAnimating)
- Kein SmartActionPanel-Inhalt (Audience/Goal/Platform-Selektion bleibt unverändert)
- Keine Sidebar/Navigation
- Keine anderen Module
- Keine neuen Dateien erstellt

### Geänderte Dateien

| Datei | Art der Änderung |
|-------|------------------|
| `src/styles/ai-layer.css` | 5 neue CSS-Klassen (chat-stream-wrapper, chat-ai-card, chat-sub-card, chat-ai-action-btn, chat-smart-chip) |
| `src/components/chat/DemoChatContainer.tsx` | Layout-Zentrierung (chat-stream-wrapper), Pulse-Gradient-Icons, Input-Area Canvas-Feel, Empty-State-Icon |
| `src/components/chat/ChatContainer.tsx` | Layout-Zentrierung (chat-stream-wrapper), Pulse-Gradient-Icons, Input-Area Canvas-Feel (Legacy-Variante) |
| `src/components/chat/ChatBubble.tsx` | AI → Bright Frosted Glass, User → Weiß, Sub-Cards, AI-Action-Buttons, Pulse-Avatar |
| `src/components/chat/EnhancedInputBar.tsx` | Category-Buttons → Soft Glass (chat-smart-chip), Input subtilerer Border/Shadow |
| `src/components/chat/InputBar.tsx` | Smart Prompt Chips → Soft Glass (Legacy-Variante) |
| `src/components/chat/VektrusLoadingBubble.tsx` | Chat-AI-Card + Pulse-Avatar (konsistent mit Antwort-State) |

**Hinweis:** Die tatsächliche Chat-Seite nutzt `DemoChatContainer.tsx` + `EnhancedInputBar.tsx` (Route: `/chat` → `Chat.tsx` → `DemoChatContainer`). `ChatContainer.tsx` + `InputBar.tsx` sind eine ältere Variante, die ebenfalls aktualisiert wurde.

### Bekannte offene Punkte

| Punkt | Status | Empfehlung |
|-------|--------|------------|
| LoadingMessage (Bild-Generierung) Bounce-Dots sind 3-farbig | Offen | Kleine Polish-Aufgabe (Dots vereinheitlichen) |
| SmartActionPanel Side-Panel nicht zentriert mit Stream | Bewusst so | Panel ist ein separater Kontext-Bereich, nicht Teil des Streams |
| Chat Header nicht zentriert mit Stream | Bewusst so | Header ist eine globale Leiste, Zentrierung nur im Stream |
| ChatContainer Setup/Confirmation-Emojis (🔧, ✅) | Bekannt | Minimal, da nur in Edge-Cases sichtbar |

---

## Chat Corrective Pass — Umgesetzt ✓

**Stand:** 2026-03-19
**Kontext:** Gezielter Corrective Pass nach dem initialen Intelligent-Canvas-Redesign.

### Was korrigiert wurde

**1. Empty State** (DemoChatContainer.tsx)
- Icon: `w-20 h-20 rounded-lg shadow-card` → `w-14 h-14 rounded-full shadow-subtle`
- Sparkles: `w-10 h-10` → `w-6 h-6`
- Wirkung: ruhig, fokussiert, nicht plakativ

**2. Input Bar & Smart Prompts** (EnhancedInputBar.tsx)
- Spacing: `space-y-3` (12px) → `space-y-5` (20px) — mehr Breathing Room
- Input Surface: `border-[rgba(73,183,227,0.18)] shadow-subtle` → `border-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.05)]` — schwebt über Canvas

**3. AI Message Layout** (ChatBubble.tsx + VektrusLoadingBubble.tsx)
- Struktur: Avatar von "Header innerhalb der Card" → flex-row (gap-3, items-start) mit Avatar LINKS neben der Card
- "VEKTRUS AI" Label entfernt — nur noch das Gradient-Icon links
- Avatar: `w-9 h-9 rounded-[10px]` mit `pulse-gradient-icon`
- Beide Komponenten (ChatBubble + VektrusLoadingBubble) konsistent
- flex-1 min-w-0 Wrapper um Card + Actions für korrekte Breitenberechnung

**4. AI Action Buttons** (ai-layer.css)
- Resting: `border: 1px solid #E5E7EB` (zarter grauer Rand, kein Gradient)
- Hover: Gradient-Border faded ein (opacity 0→1) + dezenter Pulse-Gradient-Tint als Background + Glow-Shadow
- Response-Actions: `bg-[#49B7E3] text-white` (System-Blau) → `chat-ai-action-btn` (KI-Gradient-Hover)
- Kein Standard-Blau mehr auf KI-Aktionen

### Geänderte Dateien

| Datei | Art der Änderung |
|-------|------------------|
| `src/styles/ai-layer.css` | `.chat-ai-action-btn` komplett neu: resting gray border → hover gradient border + tint + glow |
| `src/components/chat/ChatBubble.tsx` | Avatar-Layout: flex-row statt interner Header. Response-Actions: chat-ai-action-btn statt System-Blau |
| `src/components/chat/VektrusLoadingBubble.tsx` | Gleiches flex-row Layout, Label entfernt |
| `src/components/chat/DemoChatContainer.tsx` | Empty State Icon kleiner/runder |
| `src/components/chat/EnhancedInputBar.tsx` | Spacing erhöht, Input-Surface schwebend |

### Entspricht das Chat-Redesign jetzt dem Intelligent-Canvas-Modell?

**Ja, deutlich besser.** Die 4 kritischen Probleme (Avatar-Position, Glass-Wahrnehmung, Button-Hover, Spacing) sind behoben. Das Zusammenspiel von Avatar-links + Glass-Card-rechts + Gradient-Hover auf Actions ergibt eine kohärente KI-Workspace-Optik.

### Was ggf. noch als Final-Polish offen bleibt

| Punkt | Status |
|-------|--------|
| Glass-Effekt hängt davon ab, was hinter der Card liegt — auf solidem Mint White ist der Blur subtil | Bewusst so — funktioniert besser mit gemischten Hintergründen |
| LoadingMessage (Bild-Generierung) Bounce-Dots 3-farbig | Offen — kleiner Polish |
| Content-Action-Buttons ("In Contentplan", "Bild erstellen") haben ebenfalls den neuen Hover | Korrekt — gleiche Klasse |

### Empfehlung

Das Chat Intelligent Canvas Redesign ist abgeschlossen. Der Chat wirkt jetzt wie ein fokussierter B2B-Arbeitsbereich statt Consumer-Messenger. Ein **kurzer Visual QA Pass im Browser** wird empfohlen, um:
1. Die Bright Frosted Glass-Cards gegen den Mint White Hintergrund zu prüfen
2. Die Pulse-Gradient-Border auf den AI Action Buttons im Live-UI zu verifizieren
3. Die Smart Prompt Chips-Hover-Animation (translateY) zu testen
4. Das Zusammenspiel von zentriertem Stream und SmartActionPanel-Sidebar zu prüfen

Danach ist der Chat als "Intelligent Canvas" produktionsreif.

---

## Chat-Corrective-Pass — 2026-03-19 ✓

### Was gemacht wurde

Harter UI-Corrective-Pass für den gesamten Chat-Bereich (DemoChatContainer-Pfad). Vier konkrete Probleme behoben:

#### 1. AI Action Buttons — Gradient-Border fix

**Problem:** `overflow: hidden` auf `.chat-ai-action-btn` schnitt das `::before` Pseudo-Element (Pulse Gradient Border) ab. Hover zeigte keinen sichtbaren Gradient.

**Fix in `src/styles/ai-layer.css`:**
- `overflow: hidden` → `overflow: visible`
- Standard-Border: `#E5E7EB` → `rgba(124,108,242,0.12)` (neutraler KI-Akzent statt system-grau)
- `::before` padding: 1.5px → 2px (dickerer Gradient-Rand)
- Hover: stärkerer Violet-Glow (`box-shadow`), `translateY(-1px)` Lift
- Button erhält `backdrop-filter: blur(8px)` für Glass-Konsistenz

**Status:** Sichtbar korrekt. Gradient-Border erscheint auf Hover.

#### 2. Glassmorphism sichtbar verstärkt

**Problem:** Glass-Effekte waren auf dem fast-weißen `#F4FCFE` Hintergrund praktisch unsichtbar.

**Fix in `src/styles/ai-layer.css`:**
- `.chat-ai-card`: Opacity 0.72 → 0.62, weiße Border (`rgba(255,255,255,0.7)`), innerer Glow-Shadow, blau-getönte Ambient-Shadow
- `.chat-smart-chip`: Stärkere innere Shadows, weiße Border, violetter Hover-Akzent
- Neue Klasse `.chat-input-glass`: Glass-Input mit Blur + Focus-State
- Neue Klasse `.chat-canvas-bg`: Subtile Radial-Gradients (Blau + Violett) als Chat-Hintergrund, damit Glass-Flächen sichtbar werden

**Fix in `src/components/chat/DemoChatContainer.tsx`:**
- Chat-Messages-Bereich: `bg-[#F4FCFE]` → `chat-canvas-bg`
- Header: `bg-white` → `bg-white/70 backdrop-blur-md`
- Input-Area: flat → `bg-white/40 backdrop-blur-md`

**Fix in `src/components/chat/EnhancedInputBar.tsx`:**
- Input-Container: `bg-white border-gray-200/80` → `chat-input-glass`

**Status:** Sichtbar korrekt. Glass-Flächen heben sich vom Hintergrund ab.

#### 3. Linke Chat-Übersicht auf neues CI

**Problem:** Flacher `bg-gradient-to-b` Look, `border-l-4` auf aktiven Items, system-blauer "Neuer Chat" Button.

**Fix in `src/styles/ai-layer.css`:**
- Neue Klasse `.chat-sidebar-glass`: Glass-Gradient + Backdrop-Blur + weiße Border-Right
- Neue Klassen `.chat-sidebar-item` / `.chat-sidebar-item.active`: Glass-Hover und -Active States

**Fix in `src/components/chat/DemoChatContainer.tsx`:**
- Sidebar-Container: → `chat-sidebar-glass`
- Session-Items: → `chat-sidebar-item` / `.active`
- "Neuer Chat" Button: → Glass-Button (`bg-white/70 backdrop-blur-sm border-white/60`)
- Empty-State für Sessions: Icon + Text statt nur Text

**Status:** Sichtbar korrekt. Sidebar fühlt sich modern und markenkonform an.

#### 4. Empty State & Layout poliert

**Fix in `src/components/chat/DemoChatContainer.tsx`:**
- Icon: `w-12 h-12 rounded-full` → `w-10 h-10 rounded-[var(--vektrus-radius-sm)]` (kleiner, ruhiger)
- Heading: `text-3xl font-bold` → `text-2xl font-semibold tracking-tight` (hochwertiger)
- Subtext: `text-[15px] max-w-md` → `text-sm max-w-sm` (kompakter)

### Geänderte Dateien

1. `src/styles/ai-layer.css` — AI Action Button fix, Glass-Stärkung, neue CSS-Klassen
2. `src/components/chat/DemoChatContainer.tsx` — Sidebar, Canvas-BG, Header, Empty State, Input-Area
3. `src/components/chat/EnhancedInputBar.tsx` — Input auf Glass-Klasse

### Was jetzt sichtbar korrekt ist

- AI Action Buttons zeigen Pulse Gradient Border auf Hover (kein system-blau mehr)
- Glass-Effekt ist auf allen Chat-Flächen sichtbar wahrnehmbar
- Linke Chat-Übersicht ist markenkonform im neuen CI
- Empty State ist ruhiger und hochwertiger
- Input-Feld ist klar als Glass-Fläche vom Hintergrund abgesetzt
- Chat wirkt insgesamt als "Intelligent Canvas" statt Consumer-Messenger

### Was ggf. noch als Final-Polish offen bleibt

- EnhancedInputBar Kategorie-Buttons: aktiver Zustand ist noch `bg-[#49B7E3]` solid — könnte auf Glass-Active umgestellt werden
- VektrusLoadingBubble: nicht geändert (kein Fokus in diesem Pass)

---

## Vollständige Dokumentation

- [Audit](./app-frontend-audit.md)
- [Rollout-Plan](./app-frontend-rollout-plan.md)
- [Finaler QA-Audit](./app-frontend-final-qa.md)
- Dieses Handoff-Dokument
