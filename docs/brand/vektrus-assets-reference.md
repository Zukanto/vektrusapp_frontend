# Vektrus Assets Reference (v2.5)

## Zweck

Diese Datei beschreibt, welche Markenassets im Projekt bevorzugt verwendet werden sollen und wie auf diese im Kontext des neuen „AI State Layer" zugegriffen wird. Sie dient als Leitfaden für die Strukturierung, Benennung und Verwendung aller Design- und UI-Assets.

---

## Logo-System

Es gibt drei zentrale Logoformen:

### 1. Combination Mark
Symbol + Wortmarke.  
Standardlogo für Website-Header, Präsentationen und Marketingmaterialien.

### 2. Wordmark Only
Nur der Schriftzug.  
Verwenden, wenn der Platz eng ist oder das Symbol zu klein werden würde.

### 3. Symbol Only
Nur das V-Symbol.  
Verwenden für Favicon, App-Icon, Social-Profilbilder oder kleine quadratische Flächen.

### Grundregeln für Logos
- Logo nicht verzerren, rotieren oder stauchen.
- Ausreichenden Schutzraum einhalten.
- Bevorzugt auf hellen, ruhigen Hintergründen einsetzen.
- Keine Neon- oder überladenen Hintergründe.
- Combination Mark als Standard bevorzugen.

### Typische Einsätze
- **Navbar / Header:** Combination Mark oder bei engem Raum Wordmark.
- **Favicon / App-Icon:** Symbol Only.
- **Footer:** meist Combination Mark oder Wordmark.
- **Social Avatar:** Symbol Only.

---

## Typografie-Assets

- **Manrope:** Für Headlines und markenprägende Flächen.
- **Inter:** Für Body/UI, falls im jeweiligen Asset-System noch genutzt.
- **Fallback:** Im Frontend möglichst saubere System-Fallback-Stacks hinterlegen (`system-ui`, `sans-serif`).

---

## Asset-Ordner (Struktur)

Typische Inhalte im Asset-System:

```text
/assets
  /logo
    /combination-mark
    /wordmark-only
    /symbol-only
  
  /colors
    palette-core.json
    palette-functional.json
    tokens-colors.css
  
  /typography
    /manrope-specimens
    /inter-fallback-stack
  
  /ui-components
    /buttons
      primary.css
      secondary.css
      ai-action.css (NEU)
      danger.css
    /cards
      standard.css
      glass-modal.css (NEU)
      glass-panel.css (NEU)
    /inputs
      default.css
      focus-states.css
  
  /ai-state-layer (NEU)
    /gradients
      vektrus-gradient-pulse-primary.css
      vektrus-pulse-gradient-token.json
    /glass-overlays
      vektrus-glass-modal-primary.svg
      vektrus-glass-panel-light.css
      vektrus-glass-bubble-chat.react.tsx
    /glow-blobs
      vektrus-glow-blob-single.svg
      vektrus-glow-blobs-double-animated.svg
      vektrus-glow-aura-pulse.css
      vektrus-glow-animation-keyframes.css
    /icons-ai
      vektrus-icon-pulse-24.svg
      vektrus-icon-ai-magic-24.svg
      vektrus-icon-think-24.svg
    /borders-ai
      vektrus-ai-borders.css
  
  /animations
    /ai-states
      vektrus-animation-thinking.css
      vektrus-animation-gradient-shift.css
      vektrus-animation-blob-float.lottie.json
      vektrus-animation-glass-shimmer.css
  
  /social-templates
  /presentations
  /icons
  /illustrations
```

---

## NEW: AI State Layer Assets

Das Pulse-Gradient- und Glassmorphic-System benötigt definierte, wiederverwendbare Assets:

### 1. Gradient-Token
- **Asset:** `vektrus-gradient-pulse-primary.css` oder `vektrus-pulse-gradient-token.json`
- **Definition:** `linear-gradient(135deg, #49B7E3 0%, #7C6CF2 33%, #E8A0D6 66%, #F4BE9D 100%)`
- **Einsatz:** 1px Rahmen um KI-Karten, Icon-Füllungen (KI-Icons), Border-Dekoration bei AI-Buttons, Glow-Hintergründe (sehr subtil).

### 2. Glassmorphic Overlay Components
- **Komponenten:** `vektrus-glass-modal-primary.svg`, `vektrus-glass-panel-light.css`, `vektrus-glass-bubble-chat.react.tsx`
- **Spezifikation:** `background: rgba(255, 255, 255, 0.8)`, `backdrop-filter: blur(12px)`, `box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08)`.

### 3. Glow & Blob-Hintergründe (für AI-Processing-States)
- **Komponenten:** `vektrus-glow-blob-single.svg` (Icon-Glow), `vektrus-glow-blobs-double-animated.svg` (Modal-Hintergrund), `vektrus-glow-aura-pulse.css` (Processing-Aura).
- **Animation:** Duration 6–8s, Easing `ease-in-out`, Opacity 0.05–0.15 (sehr subtil).

### 4. AI-Action Icons & Borders
- **Icon-Varianten:** `vektrus-icon-pulse-24.svg` (Mit Pulse generieren), `vektrus-icon-ai-magic-24.svg` (Generischer KI-Aktion-Indikator), `vektrus-icon-think-24.svg` (KI denkt).
- **Border-Styles:** `.ai-border-gradient` (1 px Pulse-Gradient Border), `.ai-border-glow` (Weicher äußerer Glow).

---

## Dateibenennung (Pattern)

Bevorzugtes Muster:
`vektrus-[category]-[component]-[variation]-[size].[ext]`

Beispiele:
- `vektrus-combination-primary-2x.png`
- `vektrus-icon-insights-24.svg`
- `vektrus-icon-pulse-24.svg`
- `vektrus-gradient-pulse-primary.css`
- `vektrus-glass-modal-primary.svg`
- `vektrus-glow-blob-single.svg`
- `vektrus-animation-thinking.css`
- `vektrus-linkedin-cover-1584x396.png`

---

## Implementierungs-Checkliste für Developer

Wenn die neuen AI-State-Assets implementiert werden, sollte folgendes gegeben sein:
- [ ] Pulse-Gradient als zentraler CSS-Token definiert.
- [ ] Glass-Overlay-CSS-Klassen bereitgestellt (`.glass-modal`, `.glass-panel`, `.glass-chat-bubble`).
- [ ] Glow-Blob SVGs als Hintergrund-Layer eingebunden (z.B. als `background-image` oder SVG-Filter).
- [ ] AI-Icons als Icon-Set verfügbar (Figma Symbol oder SVG-Sprite).
- [ ] Border-Gradient-CSS-Klassen für KI-Cards definiert.
- [ ] Animations-Keyframes zentral in Motion-Library ausgelagert.
- [ ] Alle neuen Assets in Figma als Components dokumentiert.

---

## Hinweise für die visuelle Nutzung

- Nutze primär die Combination Mark, wenn nichts anderes sinnvoller ist.
- Verwende Symbol Only nur dort, wo kompakte Darstellung nötig ist.
- Verwende keine Asset-Kombination, die die Markenruhe stört.
- Wenn mehrere Logovarianten vorhanden sind, bevorzuge die klarste, hellgrundtaugliche Standardversion.
- Nutze Farben und Typografie immer konsistent mit `vektrus-visual-rules.md` v2.5.
- **WICHTIG (AI Layer):** Nutze AI-State-Layer-Assets AUSSCHLIESSLICH für KI-Momente (Pulse, Chat, KI-Empfehlungen).
- **WICHTIG (Glass):** Glass-Overlays gehören nur auf schwebende Elemente (Modals, Panels), nie auf die Basis-App.
- **WICHTIG (Glow):** Glow-Blobs immer subtil (`opacity: 0.05–0.15`) und animiert, nie statisch.
- **WICHTIG (Gradient):** Pulse Gradient nur für Icons, 1px-Borders und Glows – nie als Vollflächen-Hintergrund.

---

## Wartung dieser Datei

Diese Datei sollte regelmäßig synchronisiert werden mit:
- `vektrus-visual-rules.md` (wenn neue Farben oder Regeln hinzukommen)
- `brand-summary.md` (wenn Markenpersönlichkeit sich verändert)
- Asset-System in Figma / Design-Tools
- Developer-Dokumentation / Design-System-Wiki