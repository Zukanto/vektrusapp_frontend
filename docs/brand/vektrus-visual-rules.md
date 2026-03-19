# Vektrus Visual Rules (v2.5 – AI State Evolution)

## Grundwirkung

Vektrus soll visuell wirken wie:

- modern
- ruhig
- premium
- systematisch
- klar
- vertrauenswürdig
- intelligent (durch subtile KI-Schichten)

Nicht wie:

- neon-lastig
- cyberpunkig
- verspielt-chaotisch
- aggressiv-techy
- dunkel und schwer

---

## Farbpalette

### Core Brand Colors

- Primary Light Blue: `#B6EBF7`
- Secondary Vektrus Blue: `#49B7E3`
- Background Base / Mint White: `#F4FCFE`
- Text Primary / Anthrazit: `#111111`
- Text Secondary / Grau: `#7A7A7A`

### Functional / AI Color

- AI Violet: `#7C6CF2`

Nur für aktive KI-Zustände.
Nie als dominierende Markenfarbe verwenden.
Maximal ca. 10 % visuelle Dominanz.

### NEW: Vektrus Pulse Gradient

**Definition:**  
`linear-gradient(135deg, #49B7E3 0%, #7C6CF2 33%, #E8A0D6 66%, #F4BE9D 100%)`

**Farbstationen:**
- Vektrus Blue (`#49B7E3`) → 0 %
- AI Violet (`#7C6CF2`) → 33 %
- Soft Pink (`#E8A0D6`) → 66 %
- Warm Peach (`#F4BE9D`) → 100 %

**Einsatzregeln:**
- Nur für KI-spezifische UI-Layer (Modal-Rahmen, Icons, Buttons, Glassmorphic-Container)
- Maximal 10–15 % der sichtbaren Fläche je Screen
- Nie als Vollflächen-Hintergrund der Basis-App
- Animiert sehr langsam (6–8 s Zyklus) bei KI-Processing-States

### Statusfarben

- Success: `#49D69E`
- Pending / Waiting: `#F4BE9D`
- Error: `#FA7E70`

## Farbhierarchie

Core Brand Colors > Pulse Gradient (AI-Momente) > Functional AI Color > Statusfarben

---

## Typografie

**Primärschrift:** Manrope

**Fallback:** Inter, system-ui

**Empfohlene Hierarchie:**

- H1: 40–56px, Weight 700
- H2: 26–34px, Weight 600
- H3: 20–24px, Weight 600
- Body: 16–18px, Weight 400
- Caption / Label: 12–14px

**Regeln:**

- maximal 2 Schriftschnitte pro Screen / Visual
- **KEINE Gradient-Typografie** (auch nicht mit Pulse Gradient)
- keine Outline-Schriften
- viel White Space
- klare Typohierarchie
- lange Texte mit ca. 16px / 1.5
- Zeilenlänge möglichst 60–80 Zeichen

---

## Layout & Grid

- max. Content Width: 1240px
- 12-Spalten-Grid als Orientierung
- 4px Spacing-System: 4 / 8 / 12 / 16 / 24 / 32 / 40 / 48
- Tablet unter 1024px
- Mobile unter 768px
- vertikale Abstände lieber großzügig

---

## Buttons

### Primary CTA

- Background: `#49B7E3`
- Text: `#FFFFFF`
- Radius: 10px
- Hover: dunkleres Blau
- Focus Ring: `#B6EBF7`

### Secondary CTA

- transparent
- Text und Border: `#49B7E3`
- Radius: 10px

### AI Action (Pulse-spezifisch)

- **NEW:** Hover-State mit Pulse Gradient-Border (1 px)
- Border/Text: `#7C6CF2` (default)
- Background: `#FFFFFF` oder transparent
- Radius: 10px
- nur für KI-Aktionen oder aktive AI-Zustände
- **Hover:** Subtiler Outer-Glow mit Pulse Gradient (10 px Blur, `rgba` mit ~0.3 Opacity)

### Danger

- Background: `#FA7E70`
- Text: `#FFFFFF`

---

## Cards & Container

### Standard Cards (Basis-Ebene)

- Background: `#FFFFFF` oder `#F4FCFE`
- Radius: 12–16px, bevorzugt weich
- Shadow: subtil
- Padding: 16–24px
- optional leichte Border in Blau mit geringer Opazität

### NEW: Glassmorphic Cards (AI-Ebene)

**Gilt AUSSCHLIESSLICH für:**
- Modal-Inhalte
- schwebende AI-Panels (Chat, Notifications)
- KI-spezifische Overlays

**Spezifikation:**
- Background: `rgba(255, 255, 255, 0.8)` (Frosted Glass Look, nicht transparent)
- `backdrop-filter: blur(12px);`
- Border: 1 px solid mit Pulse Gradient-Farbverlauf (optional, sehr subtil)
- Radius: 12–16px
- Shadow: `0 8px 32px rgba(0, 0, 0, 0.08)` (weich, vertrauenswürdig)
- Padding: 16–24px

**Animation (bei KI-Aktiv):**
- Subtiler Glow hinter dem Glass-Container
- Pulse Gradient als weicher Background-Blur (2–3 große, unscharfe Blobs)
- Movement: sehr langsam (6–8 s), beruhigend, nicht ablenkend

---

## Inputs

- Height: 44–48px
- Radius: 8–12px
- Border: hell, sauber, dezent
- Focus: Vektrus Blue + softer Focus Ring
- Placeholder nicht zu hell
- **NEW:** Bei AI-gesteuerten Inputs (z. B. "Pulse Wizard"-Felder) optional 1 px Pulse Gradient-Border im Focus-State

---

## Bildstil

- große weiche Gradients
- Light Blue und Vektrus Blue als Basis
- subtile Glas-/Refraction-Effekte erlaubt
- keine harten Kontraste
- kein Grain / Noise
- kein schwarzer Hintergrund
- keine dunkle Studio-Ästhetik
- **NEW:** Pulse Gradient-Farbblobs im Hintergrund von KI-Overlays sind erlaubt (sehr weich, ~5–10 % Opacity, unscharfer Blur)

---

## AI-Zustände & Animation

### Z-Achsen-Modell (WICHTIG)

**Ebene 0 (Basis):** Dashboard, Kalender, Tabellen, Standard-Navigation
- Flach, hell, keine Glass-Effekte
- 85–90 % des UI bleiben hier
- Primärfarben: Vektrus Blue, Mint White, Anthrazit

**Ebene 1 (AI/KI-Schicht):** Modal-Dialoge, schwebende Panels, KI-Aktionen
- Glassmorphic-Ebene mit subtilen Glass-Effekten
- Pulse Gradient für KI-Icons, Borders, Glows
- 10–15 % des UI hier (z. B. bei aktiver KI)

### Animation-Richtlinien

- **Idle-State (kein KI-Prozess):** 100 % Ebene 0, keine Gradient-Sichtbarkeit
- **KI-Processing (Pulse generiert, etc.):** Ebene 1 aktiviert sich, große unscharfe Gradient-Blobs bewegen sich langsam hinter Glass-Panel
- **After-Completion:** Ebene 1 verblasst sanft zurück zu Ebene 0
- Animationen ruhig, professionell, subtil
- keine überdrehten Bewegungen
- KI-Zustände eher als Scan, Glow oder Layer-Reveal
- wenn Prozess beendet ist, verschwindet Pulse Gradient wieder

---

## Schutzraum (Was NICHT mit Gradient/Glass behandelt wird)

**Folgende Bereiche bleiben komplett flach und unverändert:**

- Linke Sidebar / Navigation
- Content Planner Kalender (Die Tage selbst)
- Analytics-Charts und Datenvisualisierung
- Standard-Buttons für nicht-KI-Aktionen (z. B. „Speichern", „Abbrechen")
- Footer
- Settings / Administrativer Bereich

---

## Website-Anwendung

- Navigation: heller / weißer Hintergrund
- Hero: Verlauf von Light Blue zu Vektrus Blue möglich
- Feature Cards: weiß oder Mint White
- **NEW:** Bei Pulse-Features im Hero optional sehr subtile Gradient-Akzente (Icons, Subheadings)
- Footer: Anthrazit mit Soft Gray Text und Vektrus Blue Links
- CTAs primär in Vektrus Blue
- **AI-Feature-Sections:** Optional Gradient-Borders um Feature-Cards, aber nur wenn KI-Feature im Fokus

---

## Do's

- helle Hintergründe (85–90 % weiß/Mint White)
- klare Kontraste
- ruhige Premium-Ästhetik mit magischen KI-Akzenten
- klare Icons mit konsistenter Linienführung
- WCAG-AA-Kontraste beachten
- Pulse Gradient nur auf AI-Momente beschränken
- Glass-Effekte nur auf schwebende/überlagernde UI-Elemente
- Gradient-Animationen ruhig und langsam (6–8 s Zyklus)

## Don'ts

- AI Violet oder Pulse Gradient als Hauptfarbe
- zu viele Farben in einem Screen
- dunkle Neon-Optik
- zu viele Typestile
- **KEINE** Gradient-Schriften (auch nicht mit Pulse Gradient)
- unruhige oder laute Animationen
- Glassmorphic-Effekte auf Standard-Cards (nicht in der AI-Ebene)
- Pulse Gradient auf den Hauptarbeitsflächen (Kalender, Dashboard)
- Glass-Effekte in der Sidebar oder Navigation

---

## Zusammenfassung: Version 2.5 Update

Das neue "AI State Logic" Layer ist eine **Evolution, kein Bruch** des bestehenden Designs:

1. Die Basis-App (85–90 %) bleibt völlig unverändert flach und ruhig
2. KI-Momente bekommen eine neue Ebene mit Glass + Pulse Gradient (10–15 %)
3. Die Z-Achsen-Hierarchie (Flat + Glass) schafft logische Klarheit
4. Alle neuen Effekte sind subtil, vertrauenswürdig und professionell
5. Das Gesamtbild wirkt weiterhin "Calm Tech Premium", aber mit magischen KI-Akzenten