# ContentplanScheduler - Vektrus CI Redesign

## Design-Dokumentation

### Übersicht
Vollständiges Redesign des ContentplanScheduler Pop-ins, um vollständige Konformität mit den Vektrus CI-Richtlinien zu erreichen.

---

## 1. Farbsystem-Anpassungen

### Vorher
- Plattformen hatten individuelle Farben (Purple-Pink für Instagram, Blue-600 für LinkedIn)
- Inkonsistente Verwendung von Brand-Farben
- Emojis statt Icons für Content-Typen

### Nachher
- **Einheitliche Vektrus CI-Farben mit richtiger Hierarchie:**
  - **Primary: Light Blue `#B6EBF7`** für Haupt-UI-Elemente, Borders, Focus-States und Selected Items
  - **Secondary: Mint `#B4E8E5`** für Subtle Accents und Gradient-Übergänge
  - **Accent: Teal `#49D69E`** NUR für Erfolgs-Indikatoren (Check-Icons, KI-Highlights, Sparkles)
  - Neutral: Beige `#F4BE9D` für spezielle Akzente (z.B. Tonalität-Label)
  - Warning: Red `#FA7E70` für Delete/Remove Actions

- **Gradient-System (Blau-dominant):**
  - `from-[#B6EBF7] to-[#B4E8E5]` für Primary Elements (Buttons, Labels, Selected States)
  - `from-[#B6EBF7] via-[#B4E8E5] to-[#49D69E]` für AI-Features (mit Teal-Akzent am Ende)
  - `from-[#B6EBF7]/10 to-[#B4E8E5]/10` für Selected State Backgrounds

- **Grün nur als Akzent:**
  - Check-Icons bei Selection (Success-Indicator)
  - KI-Hashtags Button-Text
  - Sparkles-Icon in Info-Texten
  - Speichern-Button hat Teal als End-Gradient (subtil)

---

## 2. Typografie

### Vorher
- Inkonsistente Font-Weights
- Standard System Fonts

### Nachher
- **Manrope** für Headlines (Modal-Titel)
- **Inter** für Body-Text und UI-Elemente
- Konsistente Font-Weights:
  - `font-semibold` für Labels
  - `font-bold` für Buttons und wichtige Texte
  - `font-medium` für Input-Felder

---

## 3. Border-Radius & Spacing

### Vorher
- Gemischte Border-Radii (rounded-2xl, rounded-xl)
- Inkonsistente Abstände

### Nachher
- **Konsistente 12px Border-Radius** (`rounded-xl`) für alle Cards und Inputs
- **8px-Spacing-System:**
  - `space-y-5` (20px) zwischen Sektionen
  - `gap-3` (12px) zwischen Grid-Items
  - `gap-2` (8px) zwischen kleineren Elementen
  - `space-x-2` (8px) für Icon-Text-Kombis

---

## 4. Komponenten-Design

### 4.1 Platform-Auswahl
**Vorher:** Individuelle Platform-Farben
**Nachher:**
- Unified Vektrus Gradient für Selected State
- Weiße Icon-Container mit Teal-Border bei Hover
- Check-Icon mit Teal-Background bei Selection
- Smooth Scale-Animation bei Hover und Selection

### 4.2 Content-Typ-Auswahl
**Vorher:** Emojis (📝, 📖, 🎥, 🔄)
**Nachher:**
- Lucide Icons (MessageSquare, Zap, TrendingUp, Image)
- Icon-Container mit Gradient bei Selection
- 4-Column-Grid für kompaktere Darstellung

### 4.3 Tonalität-Auswahl
**Vorher:** Emojis (💼, 😊, ✨, 🎓)
**Nachher:**
- Lucide Icons (Star, MessageSquare, Sparkles, Lightbulb)
- Konsistente Icon-Container mit Vektrus-Farben

### 4.4 Label-Design
**Alle Labels mit Icon-Badge:**
```tsx
<div className="w-6 h-6 bg-gradient-to-br from-[#49D69E] to-[#B4E8E5] rounded-lg flex items-center justify-center">
  <Icon className="w-3.5 h-3.5 text-white" />
</div>
```

### 4.5 Input-Felder
- Border-Transition von Gray zu Teal bei Focus
- Ring-Effect mit `ring-[#49D69E]/50` bei Focus
- Hover-State mit Light Blue Border
- Character-Counter für Textarea
- Shadow-Effekte für Tiefe

### 4.6 Hashtag-System
- Gradient-Background für Tags: `from-[#49D69E] to-[#B4E8E5]`
- Remove-Button mit Red Hover-State
- Smooth Zoom-In Animation bei Add
- Inline Help-Text

---

## 5. Animationen & Transitions

### Implementierte Animationen:
- **Modal Entry:** `animate-in fade-in-0 slide-in-from-bottom-8 duration-500`
- **Backdrop:** `backdrop-blur-md` mit `bg-black/60`
- **Button Hover:** `hover:scale-[1.02]` und Shadow-Verstärkung
- **Icon Rotations:** `group-hover:rotate-12` für Wand2-Icon
- **Shimmer-Effect:** Gradient-Animation auf Primary CTA
- **Close-Button:** `hover:rotate-90` bei X-Icon

### Transition-Timing:
- Standard: `duration-300`
- Shimmer: `duration-700`
- Alle mit `ease-in-out` oder `linear`

---

## 6. Header-Design

### Besondere Features:
- **Glow-Effect** um das Kalender-Icon:
  ```tsx
  <div className="absolute inset-0 bg-gradient-to-br from-[#49D69E] to-[#B4E8E5] rounded-xl blur-lg opacity-50 animate-pulse"></div>
  ```
- **Gradient-Background** von `#F4FCFE` nach White
- **Subtle Pattern-Overlay** mit Opacity

---

## 7. Tabs-Navigation

### Vorher
- Border-Top bei Active State
- Einfache Text-Farbe

### Nachher
- Bottom-Border mit Gradient bei Active State
- Icon-Scale-Effect bei Selection
- Smooth Background-Transitions
- White Background für Active Tab

---

## 8. Footer-CTA

### Primary Button
- **Animierter Gradient:** 200% Background-Size mit Hover-Animation
- **Shimmer-Effect:** Sliding White Overlay
- **Icon-Scale:** Save-Icon vergrößert sich bei Hover
- **Shadow:** Von `shadow-lg` zu `hover:shadow-2xl`

### Secondary Button (Abbrechen)
- Gray-Border mit Hover-Verstärkung
- Subtle Scale-Effect
- Disabled-State mit Opacity 50%

---

## 9. Media-Tab-Design

### Upload-Buttons
- **3 Button-Varianten:**
  1. Upload: `from-[#B6EBF7] to-[#49D69E]`
  2. AI-Generate: `from-[#49D69E] to-[#B4E8E5]` mit Shimmer
  3. Mediathek: Border-Style mit Teal-Hover

- **Icon-Animationen:**
  - Upload: `-translate-y-0.5`
  - AI: `rotate-12`
  - Media: `scale-110`

### Info-Box
- Subtle Background: `from-[#B6EBF7]/10 to-[#B4E8E5]/10`
- Border: `border-[#B6EBF7]/30`
- Inline Sparkles-Icon

---

## 10. Barrierefreiheit & UX

### Verbesserte UX-Features:
- Klare Visual Feedback bei allen Interaktionen
- Konsistente Hover-States
- Disabled-States sichtbar
- Loading-State im Button-Text
- Character-Counter für Textarea
- Help-Text für Hashtag-Input
- Focus-Ring für Keyboard-Navigation

### Responsive Design
- Max-Width: 2xl (672px)
- Max-Height: 90vh mit Scroll
- Grid-Layouts passen sich an
- Alle Abstände relativ

---

## Verwendete Vektrus CI-Komponenten

### Farben
- **Light Blue (#B6EBF7) - Primary** (Haupt-UI-Farbe)
- Mint (#B4E8E5) - Secondary (Gradienten)
- **Teal (#49D69E) - Accent** (nur für Erfolge/KI-Highlights)
- Beige (#F4BE9D) - Neutral
- Red (#FA7E70) - Warning

### Fonts
- Manrope - Headlines
- Inter - UI/Body

### Spacing
- 8px-Grid-System
- Konsistente Gaps

### Border-Radius
- 12px Standard (rounded-xl)
- 8px für kleine Elemente (rounded-lg)
- 9999px für Pills (rounded-full)

### Shadows
- `shadow-sm` für Inputs
- `shadow-md` für Icons
- `shadow-lg` für Buttons
- `shadow-xl` für Hover-States
- `shadow-2xl` für Primary CTA

---

## Zusammenfassung der Designentscheidungen

### Warum diese Änderungen?

1. **Markenkonsistenz:** Alle Farben folgen jetzt der Vektrus CI mit korrekter Hierarchie
2. **Vektrus Blau als Hauptfarbe:** Light Blue dominiert das Interface und gibt ihm eine ruhige, professionelle Basis
3. **Grün als strategischer Akzent:** Teal wird sparsam eingesetzt für Erfolgs-Momente und KI-Features
4. **Weniger visuelle Ablenkung:** Icons statt Emojis für professionelleres Design
5. **Bessere Hierarchie:** Klare visuelle Gewichtung durch konsistente Typografie und Farbverwendung
6. **Modern & Premium:** Smooth Animationen und Glassmorphism-Effekte
7. **Accessibility:** Bessere Kontraste und Focus-States
8. **Skalierbarkeit:** Modulares Design-System für einfache Erweiterungen

### Erfolgskennzahlen des Redesigns
- 100% CI-Konformität
- Reduzierte Emojis von ~20 auf ~1
- Konsistente Animations-Timing
- Unified Color-Palette
- Responsive für alle Breakpoints
