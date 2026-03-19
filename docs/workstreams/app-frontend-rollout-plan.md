# Vektrus App Frontend — Rollout-Plan

**Stand:** 2026-03-18
**Basis:** app-frontend-audit.md

---

## Arbeitspakete

---

### AP-01: Globale Design-Foundations

**Ziel:** Fehlende Design-Tokens und Basis-Infrastruktur bereitstellen, auf die alle weiteren Pakete aufbauen.

**Warum wichtig:** Ohne zentrale Tokens für Pulse Gradient, Glass-Layer, Shadow-System und Radius-System kann kein Modul konsistent verbessert werden. Jede Einzelverbesserung ohne Foundations führt zu neuen Inkonsistenzen.

**Typ:** Global

**Betroffene Bereiche / Dateien:**
- `src/index.css` — Body-Font korrigieren (Inter statt Manrope als Default)
- `src/styles/ai-layer.css` (NEU) — Pulse Gradient Token, Glass-CSS-Klassen, Glow-Blob-Animationen, AI-Border-Klassen
- `src/styles/module-colors.ts` — Fehlende Module (dashboard, toolhub, brand, help) ergänzen
- `src/styles/module-utilities.css` — CSS-Syntax-Fehler fixen (Zeile 243, 254)
- `tailwind.config.js` — Shadow-Tokens, Radius-Tokens, AI-Animationen ergänzen
- `src/components/ui/button.tsx` — AI-Action-Button-Variante hinzufügen

**Ausdrücklich out of scope:**
- Keine Modul-Seiten verändern
- Keine Produktlogik anfassen
- Keine bestehenden Farben oder Varianten entfernen
- Kein Refactor von ModuleWrapper oder Hooks

**Produktlogik-Risiko:** Sehr gering. Reine CSS/Token-Änderungen. Die Font-Umstellung von Manrope auf Inter als Body-Default kann Minor-Layout-Shifts verursachen (Manrope und Inter haben leicht unterschiedliche Metriken), die geprüft werden sollten.

**Priorität:** Kritisch — muss zuerst umgesetzt werden.

**Abhängigkeiten:** Keine. Ist Voraussetzung für alle anderen Pakete.

**Success Criteria:**
- [ ] Pulse Gradient als CSS-Custom-Property definiert
- [ ] Glass-Modal und Glass-Panel CSS-Klassen verfügbar und dokumentiert
- [ ] Glow-Blob-Keyframes definiert (6–8s Zyklus, ease-in-out)
- [ ] AI-Border-Gradient-Klasse verfügbar
- [ ] Body-Font = Inter/system-ui, Manrope nur explizit für Headlines
- [ ] Shadow-Tokens definiert (subtle, card, elevated, modal)
- [ ] Radius-Tokens definiert (sm=8, md=12, lg=16, xl=20)
- [ ] AI-Action-Button-Variante in button.tsx funktional
- [ ] Fehlende Module in module-colors.ts ergänzt
- [ ] CSS-Syntax-Fehler in module-utilities.css behoben
- [ ] Keine Regression in bestehenden Seiten

---

### AP-02: Sidebar & Navigation

**Ziel:** Sidebar-Farbzuordnung korrigieren, Logo-Verhalten im collapsed State verbessern, Navigation markenkonform machen.

**Warum wichtig:** Die Sidebar ist auf jeder Seite sichtbar. Fehlerhafte Farbzuordnungen (Dashboard/ToolHub/Brand nutzen Chat-Farbe) untergraben die Modul-Identität.

**Typ:** Global (betrifft alle Seiten)

**Betroffene Bereiche / Dateien:**
- `src/components/dashboard/VektrusSidebar.tsx` — Farbzuordnung korrigieren, Logo collapsed
- `src/styles/module-colors.ts` — Neue Module (sofern nicht in AP-01 erledigt)

**Ausdrücklich out of scope:**
- Keine strukturelle Änderung der Navigation (Reihenfolge, Gruppierung)
- Keine neuen Animationen
- Keine Sidebar-Redesign

**Produktlogik-Risiko:** Gering. Die Sidebar hat Cross-Modul-Events (`navigate-to-planner`, etc.) und PulseGeneration-Integration. Diese dürfen nicht verändert werden. Nur visuelle Korrekturen.

**Priorität:** Hoch

**Abhängigkeiten:** AP-01 (für neue module-colors Definitionen)

**Success Criteria:**
- [ ] Dashboard nutzt eigene Farbe oder Vektrus Blue statt Chat-Cyan
- [ ] ToolHub nutzt Vektrus Blue
- [ ] Brand Studio nutzt eigene Farbe (z.B. ein warmes Palette-Derivat)
- [ ] Logo im collapsed State zeigt Symbol-Only Variante
- [ ] Pulse-Indicator und Cross-Modul-Events funktionieren weiterhin

---

### AP-03: AI-State-System (Pulse Gradient, Glass, Blobs)

**Ziel:** Das in v2.5 definierte Z-Achsen-Modell als funktionierendes System implementieren und an den 2–3 wichtigsten Stellen live einsetzen.

**Warum wichtig:** Das AI State Layer ist das zentrale Differenzierungsmerkmal der Brand v2.5. Ohne dieses fehlt der App die „ruhige Intelligenz mit magischen Momenten".

**Typ:** Global (System) + modulare Erstanwendung

**Betroffene Bereiche / Dateien:**
- `src/styles/ai-layer.css` (aus AP-01) — hier werden die Klassen genutzt
- `src/components/brand/BrandProcessing.tsx` — Erste Anwendung: Glass-Panel + Gradient-Blobs um ai-orb
- `src/components/planner/wizard/GeneratingOverlay.tsx` — Zweite Anwendung: Pulse-Generierungs-Overlay
- Optional: `src/components/chat/VektrusLoadingBubble.tsx` — Dritte Anwendung

**Ausdrücklich out of scope:**
- Keine Glass-Effekte auf Sidebar, Kalender-Tage, Charts, Standard-Buttons
- Keine Änderung der Generierungslogik
- Keine neuen Processing-States einführen
- Kein Gradient auf Basis-Ebene (Dashboard, Planner-Kalender etc.)

**Produktlogik-Risiko:** Mittel. BrandProcessing hat Polling-Logik und State-Transitions. GeneratingOverlay interagiert mit PulseGeneration-Context. Rein visuelle Änderungen am Overlay, keine Logik-Änderungen.

**Priorität:** Kritisch

**Abhängigkeiten:** AP-01 (Tokens müssen definiert sein)

**Success Criteria:**
- [ ] BrandProcessing zeigt Glass-Panel mit animierten Gradient-Blobs bei aktiver Analyse
- [ ] Blobs bewegen sich langsam (6–8s), max 10% Opacity, professionell
- [ ] Pulse GeneratingOverlay nutzt Glass-Panel-Ästhetik
- [ ] Nach Completion verblasst der Glass-Layer sanft zurück zu Flat
- [ ] Schutzraum-Regeln werden eingehalten
- [ ] Performance: keine merklichen Framedrops durch blur/animation

---

### AP-04: Dashboard Polish

**Ziel:** Dashboard-Seite auf konsistente Tokens umstellen, inline Styles reduzieren, States vereinheitlichen.

**Warum wichtig:** Das Dashboard ist die erste Seite nach dem Login. Es setzt den Qualitätsstandard.

**Typ:** Modular

**Betroffene Bereiche / Dateien:**
- `src/components/dashboard/DashboardHome.tsx` — Inline Keyframe entfernen, Shadow/Radius Tokens nutzen
- `src/components/dashboard/BriefingCard.tsx` — Shadow Token, AI-Indikator prüfen
- `src/components/dashboard/ActionCards.tsx`
- `src/components/dashboard/ActivityTimeline.tsx`
- `src/components/dashboard/DashAiInsights.tsx` — AI Violet Nutzung prüfen

**Ausdrücklich out of scope:**
- Kein neues Dashboard-Layout
- Keine neuen KPI-Cards oder Widgets
- Keine Datenlogik-Änderungen (useDashboardData)
- Kein AI Glass Layer auf dem Dashboard (Schutzraum)

**Produktlogik-Risiko:** Gering. Dashboard zeigt Daten aus `useDashboardData`. Keine Schreiboperationen. Rein visuelle Anpassungen.

**Priorität:** Hoch

**Abhängigkeiten:** AP-01 (Shadow/Radius Tokens, Font-Fix)

**Success Criteria:**
- [ ] Keine Inline-Keyframes mehr
- [ ] Shadow und Radius nutzen definierte Tokens
- [ ] AI Violet nur wo KI-Aktivität tatsächlich relevant
- [ ] Loading State nutzt einheitliches Pattern
- [ ] Error State konsistent gestaltet
- [ ] Hover-States mit Tailwind statt inline JS

---

### AP-05: Pulse Module Polish

**Ziel:** PulsePage markenkonform machen, AI-Action-Buttons einsetzen, GeneratingOverlay mit AI-Layer aufwerten.

**Warum wichtig:** Pulse ist das Kernprodukt. Die Seite muss den höchsten Qualitätsstandard erfüllen.

**Typ:** Modular

**Betroffene Bereiche / Dateien:**
- `src/components/pulse/PulsePage.tsx` — Shadow/Radius Tokens, AI-Buttons
- `src/components/planner/wizard/WizardRoot.tsx` — Wizard-UI-Konsistenz
- `src/components/planner/wizard/GeneratingOverlay.tsx` — AI Glass Layer (aus AP-03)
- `src/components/planner/wizard/ReviewModal.tsx` — Konsistenz-Check
- `src/components/planner/wizard/PostResultsList.tsx`

**Ausdrücklich out of scope:**
- Keine Änderung der Wizard-Schritte oder deren Logik
- Keine Änderung der Pulse-Generierungs-Pipeline (n8n Webhook, Polling)
- Keine Änderung der Supabase-Queries
- Pulse Auto (Modus 3) ist nicht implementiert und nicht Scope

**Produktlogik-Risiko:** Mittel. PulsePage interagiert mit `usePulseGeneration`, Supabase-Queries, ReviewModal mit ContentSlot-Logik. Nur visuelle Änderungen, keine Logik.

**Priorität:** Hoch

**Abhängigkeiten:** AP-01, AP-03

**Success Criteria:**
- [ ] Mode-Selection-Cards nutzen konsistente Shadow/Radius Tokens
- [ ] „Starten"-Buttons nutzen AI-Action-Variante
- [ ] History-Liste nutzt konsistente Card-Tokens
- [ ] Empty State mit einheitlichem Pattern
- [ ] Loading Skeletons konsistent
- [ ] Beta-Hinweis visuell zum Brand passend

---

### AP-06: Chat Module Polish

**Ziel:** Chat-UI aufwerten, Loading Bubble professionalisieren, AI-States verbessern.

**Warum wichtig:** Chat ist ein hochfrequentes Feature und zentraler Interaktionspunkt mit der KI. Die Loading-Bubble und AI-Responses definieren das KI-Erlebnis.

**Typ:** Modular

**Betroffene Bereiche / Dateien:**
- `src/components/chat/VektrusLoadingBubble.tsx` — Emojis durch Icons ersetzen, Calm-Tech-Ästhetik
- `src/components/chat/ChatBubble.tsx` — Konsistenz-Check
- `src/components/chat/ChatContainer.tsx` — State-Handling prüfen
- `src/components/chat/EnhancedInputBar.tsx`

**Ausdrücklich out of scope:**
- Keine Änderung der Chat-Logik (vektrusChatService, chatSessionService)
- Keine Änderung des Markdown-Renderings
- Keine neuen Chat-Features
- Keine Änderung des Workflow-Action-Panels

**Produktlogik-Risiko:** Mittel. Chat hat Realtime-Streaming, Session-Management und Workflow-Integration. Nur visuelle Änderungen an der Bubble-Darstellung.

**Priorität:** Mittel

**Abhängigkeiten:** AP-01, optional AP-03

**Success Criteria:**
- [ ] Loading Bubble ohne Emojis, mit Lucide-Icons oder subtilen Symbolen
- [ ] Shimmer-Effekt nutzt Brand-Farben korrekt
- [ ] AI-Response-Avatar konsistent mit Brand
- [ ] Inline-Keyframes in zentrale Animationen überführt
- [ ] Insgesamt ruhigere, professionellere Ästhetik

---

### AP-07: Content Planner Polish

**Ziel:** Kalender-UI auf konsistente Tokens umstellen, Loading/Empty States vereinheitlichen.

**Warum wichtig:** Der Planner ist die zentrale Steuerungsebene für alle generierten Inhalte. Konsistenz und Klarheit sind hier besonders wichtig.

**Typ:** Modular

**Betroffene Bereiche / Dateien:**
- `src/components/planner/ContentPlanner.tsx`
- `src/components/planner/WeekView.tsx`
- `src/components/planner/MonthView.tsx`
- `src/components/planner/ContentSlotEditor.tsx`
- `src/components/planner/LoadingStates.tsx`
- `src/components/planner/AIRewritePanel.tsx`

**Ausdrücklich out of scope:**
- Keine Änderung der Drag & Drop Logik
- Keine Änderung der Supabase Realtime Subscriptions
- Keine Änderung der Social Posting Logik
- Kein AI Glass Layer auf Kalender-Tage (Schutzraum)
- ContentSlotEditor ist komplex (1756 Zeilen) — nur Token-Migration, kein Refactor

**Produktlogik-Risiko:** Hoch. Planner hat die komplexeste Logik: Supabase Subscriptions, Status-Workflows, Drag & Drop, Multi-Plattform-Publishing. Alle Änderungen müssen minimal-invasiv sein.

**Priorität:** Mittel

**Abhängigkeiten:** AP-01

**Success Criteria:**
- [ ] Loading States nutzen einheitliches Pattern
- [ ] Shadow/Radius Tokens konsistent
- [ ] Kalender-Tage bleiben flach (Schutzraum)
- [ ] AIRewritePanel bei aktiver Regeneration mit subtiler AI-Indikation
- [ ] Keine Regression in Status-Workflow, Publishing, Drag & Drop

---

### AP-08: Brand Studio Polish

**Ziel:** Brand Studio auf konsistente Tokens umstellen, Processing-Screen als AI-State-Showcase aufwerten.

**Warum wichtig:** Brand Studio ist die Brücke zwischen CI und KI. Der Processing-Screen ist der natürlichste Ort für das AI Glass Layer.

**Typ:** Modular

**Betroffene Bereiche / Dateien:**
- `src/components/brand/BrandAnalyzePage.tsx`
- `src/components/brand/BrandProcessing.tsx` — AI Glass Layer (primär in AP-03)
- `src/components/brand/BrandResult.tsx`
- `src/components/brand/BrandWizard.tsx`

**Ausdrücklich out of scope:**
- Keine Änderung des n8n-Webhook-Calls
- Keine Änderung der Polling-Logik
- Keine Änderung der brand_profiles Supabase-Struktur
- Kein Refactor der Result-Subkomponenten (ColorSection, FontPicker etc.)

**Produktlogik-Risiko:** Mittel. Webhook-Call, Polling, Status-Transitions. Nur visuelle Anpassungen.

**Priorität:** Mittel

**Abhängigkeiten:** AP-01, AP-03

**Success Criteria:**
- [ ] Processing-Screen nutzt Glass-Panel mit Gradient-Blobs
- [ ] Wizard-Schritte nutzen konsistente Tokens
- [ ] Result-Seite nutzt konsistente Card/Shadow Tokens
- [ ] Polling-Logik und Webhook-Call unverändert

---

### AP-09: Vision, Media, Insights, Profile Polish

**Ziel:** Restliche Module auf konsistente Tokens umstellen.

**Warum wichtig:** Gesamtkonsistenz. Diese Module sind weniger komplex, sollten aber den gleichen Qualitätsstandard haben.

**Typ:** Modular (Sammelpaket)

**Betroffene Bereiche / Dateien:**
- `src/components/vision/VisionPage.tsx`, `VisionCreatorWizard.tsx`, `VisionProjectList.tsx`
- `src/components/media/MediaPage.tsx`, `MediaDetailSidebar.tsx`, `MediaUploadModal.tsx`
- `src/components/insights/InsightsPage.tsx` und Subkomponenten
- `src/components/profile/ProfilePage.tsx`

**Ausdrücklich out of scope:**
- Keine neuen Features in diesen Modulen
- Keine Änderung der Vision-Generierungslogik
- Keine Änderung der Media-Upload-Logik
- Charts/Datenvisualisierung bleiben flach (Schutzraum)

**Produktlogik-Risiko:** Gering bis Mittel. Vision hat Webhook + Polling. Media hat Supabase Storage. Insights liest Daten. Profile hat Account-Verbindungslogik.

**Priorität:** Niedrig

**Abhängigkeiten:** AP-01

**Success Criteria:**
- [ ] Alle Module nutzen konsistente Shadow/Radius/Font Tokens
- [ ] Empty States einheitlich
- [ ] Loading States einheitlich
- [ ] Keine Regression in Modul-Logik

---

### AP-10: ToolHub Überarbeitung

**Ziel:** ToolHub als Einstiegspunkt markenkonform machen, GlassIcons durch Brand-konforme Alternative ersetzen.

**Warum wichtig:** ToolHub ist (aktuell) die Default-Landingpage nach Login. Die generischen HSL-GlassIcons unterwandern den Brand-Eindruck.

**Typ:** Modular

**Betroffene Bereiche / Dateien:**
- `src/components/toolhub/ToolHubPage.tsx`
- `src/components/toolhub/ToolGrid.tsx`
- `src/components/ui/glass-icons.tsx`
- `src/components/toolhub/ToolHubHeader.tsx`
- `src/components/toolhub/QuickStartGuide.tsx`

**Ausdrücklich out of scope:**
- Keine Änderung der Routing-Logik
- Roadmap und Feedback Sections sind sekundär

**Produktlogik-Risiko:** Gering. ToolHub hat keine komplexe Logik.

**Priorität:** Mittel

**Abhängigkeiten:** AP-01, AP-02 (damit Sidebar-Farben korrekt sind)

**Success Criteria:**
- [ ] Tool-Grid-Icons nutzen Brand-Farben statt generischer HSL-Gradienten
- [ ] 3D-Glass-Effekt entweder durch ruhigere Variante ersetzt oder deutlich zurückgenommen
- [ ] Header und QuickStart-Guide nutzen konsistente Tokens
- [ ] Calm-Tech-Grundcharakter gewahrt

---

### AP-11: Empty States & In-App-Kommunikation

**Ziel:** Einheitliches Empty-State-Pattern definieren und über alle Module ausrollen.

**Warum wichtig:** Leere Zustände sind häufig bei neuen Nutzern. Sie definieren den ersten Eindruck und beeinflussen ob Nutzer weiterklicken.

**Typ:** Global (Pattern-Definition) + modular (Ausrollen)

**Betroffene Bereiche / Dateien:**
- Neues Pattern/Component: `src/components/ui/EmptyState.tsx` (optional)
- Alle Module mit Empty States (Pulse, Vision, Media, Planner, Chat)

**Ausdrücklich out of scope:**
- Keine neuen CTA-Flows oder Onboarding-Logik
- Copy-Inhalte können verbessert werden, aber keine umfangreiche Copy-Überarbeitung

**Produktlogik-Risiko:** Gering. Empty States sind rein visuell.

**Priorität:** Mittel

**Abhängigkeiten:** AP-01

**Success Criteria:**
- [ ] Einheitliches Empty-State-Pattern (Icon + Headline + Beschreibung + optionaler CTA)
- [ ] Alle Module nutzen dieses Pattern
- [ ] Copy ist calm, hilfreich, product-mature (keine Hype-Sprache)
- [ ] Konsistente Typografie und Farben

---

### AP-12: Final Polish & Consistency Review

**Ziel:** Abschließender Konsistenz-Check über alle Module nach Abschluss der vorherigen Pakete.

**Warum wichtig:** Nach vielen Einzelverbesserungen muss geprüft werden, ob das Gesamtbild stimmt.

**Typ:** Global

**Betroffene Bereiche:** Alle Module

**Ausdrücklich out of scope:**
- Keine neuen Features
- Keine Architektur-Änderungen

**Produktlogik-Risiko:** Minimal.

**Priorität:** Niedrig (kommt zuletzt)

**Abhängigkeiten:** Alle vorherigen Pakete

**Success Criteria:**
- [ ] Kein Modul weicht visuell vom Token-System ab
- [ ] AI Violet Anteil < 10% pro Screen validiert
- [ ] Pulse Gradient nur auf AI-Momenten
- [ ] Schutzräume werden eingehalten
- [ ] Hover/Focus/Active States konsistent
- [ ] Responsive Verhalten geprüft

---

## Rollout-Reihenfolge

### Phase 1 — Foundations (1 Chat)
**Paket:** AP-01 (Globale Design-Foundations)
**Begründung:** Ohne Tokens kann nichts konsistent verbessert werden. Dieser Schritt ist risikoarm (nur CSS/Tokens) und ermöglicht alles Weitere.

### Phase 2 — AI State System + Sidebar (1–2 Chats)
**Pakete:** AP-03 (AI-State-System) + AP-02 (Sidebar)
**Begründung:** Das AI State System ist das wichtigste neue Brand-Feature. Sidebar-Fix ist klein und global sichtbar. Diese beiden Pakete können in einem Chat bearbeitet werden, wenn der Chat nicht zu lang wird. Alternativ splitten.

### Phase 3 — Dashboard + Pulse (1–2 Chats)
**Pakete:** AP-04 (Dashboard) + AP-05 (Pulse)
**Begründung:** Die zwei meistgenutzten Seiten. Dashboard als erste Seite nach Login, Pulse als Kernprodukt. Können zusammen bearbeitet werden, wenn der Scope kontrolliert bleibt.

### Phase 4 — Chat + Brand Studio (1–2 Chats)
**Pakete:** AP-06 (Chat) + AP-08 (Brand Studio)
**Begründung:** Beide nutzen AI-States und profitieren direkt von AP-03. Brand Studio Processing ist bereits Showcase-Kandidat aus AP-03, Rest wird hier finalisiert.

### Phase 5 — Planner (1 Chat, eigenständig)
**Paket:** AP-07 (Content Planner)
**Begründung:** Planner hat die höchste Produktlogik-Komplexität. Verdient einen eigenen, fokussierten Chat. Keine Mischung mit anderen Modulen.

### Phase 6 — Restliche Module (1–2 Chats)
**Pakete:** AP-09 (Vision/Media/Insights/Profile) + AP-10 (ToolHub)
**Begründung:** Weniger komplexe Module, können zusammengefasst werden.

### Phase 7 — Empty States + Final Polish (1 Chat)
**Pakete:** AP-11 (Empty States) + AP-12 (Final Polish)
**Begründung:** Abschlussphase. Empty States sind ein Querschnitts-Thema, das besser am Ende adressiert wird, wenn alle Module bereits konsistent sind.

---

## Hinweise zur Chat-Planung

### Nicht zusammen in einem Chat
- **AP-07 (Planner) nicht mit anderen Modulen mischen.** ContentSlotEditor allein hat 1756 Zeilen. Die Produktlogik-Dichte ist zu hoch für einen Mischchat.
- **AP-01 (Foundations) nicht mit Modul-Arbeit mischen.** Die Token-Definition muss sauber und isoliert erfolgen.

### Gut für getrennte Chats
- AP-01 allein (Foundations)
- AP-02 + AP-03 zusammen (Sidebar + AI State System)
- AP-04 + AP-05 zusammen (Dashboard + Pulse)
- AP-07 allein (Planner)
- AP-06 + AP-08 zusammen (Chat + Brand Studio)
- AP-09 + AP-10 zusammen (Rest-Module + ToolHub)
- AP-11 + AP-12 zusammen (Empty States + Final Polish)

### Geschätzte Anzahl Chats
**7 Chats** für die vollständige Umsetzung, bei diszipliniertem Scope pro Chat.
