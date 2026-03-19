# Vektrus Pulse — Vollständige Produktbeschreibung

## Was ist Vektrus Pulse

Vektrus Pulse ist der automatische Content-Generator von Vektrus. Pulse erstellt auf Knopfdruck fertige Social-Media-Posts für eine ganze Woche — personalisiert auf dein Unternehmen, deine Marke und deine Zielgruppe. Jeder generierte Post basiert auf echtem Unternehmenswissen aus deiner individuellen KI-Datenbank, nicht auf generischen Templates.

## Das Problem, das Pulse löst

Jede Woche stehen Unternehmer und Marketing-Verantwortliche vor der gleichen Frage: Was poste ich wann auf welcher Plattform? Content-Kalender bleiben leer, Postings werden aufgeschoben, und am Ende wird entweder gar nichts gepostet oder etwas Halbherziges, das keine Ergebnisse bringt. Agenturen kosten tausende Euro im Monat. Scheduling-Tools wie Hootsuite oder Buffer helfen beim Planen und Veröffentlichen — aber sie schreiben keinen einzigen Text für dich. Generische KI-Tools wie ChatGPT kennen dein Unternehmen nicht und produzieren austauschbare Ergebnisse ohne Bezug zu deiner Marke, deiner Zielgruppe oder deiner bisherigen Performance.

Pulse schließt genau diese Lücke: Es generiert komplette, fertige Posts mit Texten, Hashtags, Emojis, Call-to-Actions und optional passenden Bildern in deinem Markenstil — alles basierend auf echten Daten deines Unternehmens.

## Die drei Modi von Pulse

### Modus 1 — Themenbasiert (Vektrus Pulse)

Der klassische Weg für maximale Kontrolle. Du konfigurierst im 9-Schritte-Wizard exakt was du willst:

**Schritt 1:** Hauptziel wählen (Engagement, Reichweite, Community, Leads).
**Schritt 2:** Plattformen auswählen (Instagram, LinkedIn, Facebook, TikTok, Twitter/X) mit individuellen Posting-Zeiten pro Plattform.
**Schritt 3:** Posting-Frequenz festlegen (z.B. 3 Posts pro Woche).
**Schritt 4:** Zeitraum definieren (Start- und Enddatum).
**Schritt 5:** Tonalität wählen (professionell, locker, inspirierend).
**Schritt 6:** Thema/Content-Fokus bestimmen (Produkte, Behind the Scenes, Educational).
**Schritt 7:** Sprache und Keywords festlegen (Deutsch/Englisch, verbotene Wörter, Pflicht-Keywords).
**Schritt 8:** Optional einen konkreten Anlass beschreiben — zum Beispiel "Wir launchen nächste Woche unser neues Produkt XY" — und Pulse richtet den gesamten Content darauf aus.
**Schritt 9:** Zusammenfassung prüfen und Generierung starten.

Optional kannst du die Bildgenerierung aktivieren. Pulse erstellt dann automatisch zu jedem Post ein passendes Bild — entweder fotorealistisch über OpenAI gpt-image-1.5 oder als markenkonformes Design über Nano Banana 2 via fal.ai, je nach gewählter Qualitätsstufe (Standard oder Premium).

**Was im Hintergrund passiert:** Pulse lädt dein Unternehmensprofil, dein KI-Profil (Brand Voice, Zielgruppe, Kernbotschaften) und dein Brand-Profil aus der Datenbank. Es berechnet eine Content-Matrix — also genau welche Posts für welche Plattform an welchem Tag zu welcher Uhrzeit erstellt werden müssen. Für jeden einzelnen Post durchsucht ein KI-Agent zwei Wissensquellen: die firmenspezifische Vektor-Datenbank (mit deinen Unternehmensinformationen, bisherigen Posts und deren Performance-Daten wie Likes, Reichweite, Engagement-Rate) und die globale Social-Media-Knowledge-Base (mit Best Practices, Plattform-Strategien und aktuellen Trends). Der Agent analysiert welche deiner bisherigen Posts am besten performt haben und erstellt darauf aufbauend neuen Content, der diese Erfolgsmuster aufgreift aber nicht kopiert. Wenn ein Brand-Profil vorhanden ist, hält sich der Agent strikt an die dort definierte Tonalität — Ansprache (Du/Sie), Formalitätsstufe, Headline-Stil, emotionaler Ton und Sprachmix. Jeder Post wird einzeln und individuell generiert.

Bei aktivierter Bildgenerierung durchläuft jedes Bild zusätzlich einen automatischen Quality-Check: GPT-4o-Vision prüft ob das generierte Bild professionell aussieht, ob eventueller Text lesbar ist, ob die Markenfarben stimmen und ob der visuelle Stil zum Brand passt. Bilder die den Check nicht bestehen, werden automatisch mit einem verbesserten Prompt neu generiert.

Wenn als Bildmodell "Premium" gewählt wird, nutzt Pulse den Nano Banana 2 Bildgenerator über fal.ai. Dieser erhält die im Brand Studio analysierten Design-Richtlinien (Prompt Guidelines) und erstellt Designs, die die extrahierten Markenfarben, Layout-Patterns und den visuellen Stil berücksichtigen. Der NB2-Prompt enthält dabei explizite Anweisungen zu Format (plattformspezifisches Seitenverhältnis), den Headline-Text aus dem generierten Post, die Brand-Farbpalette und Layout-Vorgaben aus der Design-DNA.

Das Ganze dauert etwa 3–5 Minuten für einen kompletten Wochenplan. Das Frontend bekommt sofort eine Bestätigung mit Pulse-ID und pollt dann den Status in der Datenbank.

### Modus 2 — Bildbasiert (Pulse Visual)

Du hast großartige Produktfotos, Event-Bilder oder Team-Aufnahmen — aber keine Idee was du dazu schreiben sollst. Pulse Visual löst genau das, und geht dabei einen entscheidenden Schritt weiter als nur Text zu generieren: Es erstellt automatisch professionelle Social-Media-Designs in deinem Markenstil, die dein Foto, passenden Text und deine Brand-Identität kombinieren.

Der Ablauf: Du lädst bis zu 10 Bilder hoch und wählst Plattformen, Zeitraum und Tonalität. Pro Bild wird ein Post pro Plattform erstellt.

**Phase 1 — Bildanalyse.** Jedes hochgeladene Bild wird einzeln von GPT-4o-Vision analysiert. Die KI erkennt: Was zeigt das Bild (Produkt, Person, Event, Ort)? Welche Farben, Stimmung, Beleuchtung und Perspektive hat es? In welchem Kontext wurde das Foto aufgenommen? Welche Emotionen vermittelt es? Welches Social-Media-Potenzial steckt darin? Sind Logos, Produkte oder Markennamen sichtbar? Die Analyse ist detailliert und auf Deutsch.

**Phase 2 — Post-Generierung.** Für jedes analysierte Bild erstellt der KI-Agent einen Post pro gewählter Plattform. Dabei gelten kritische Regeln: Der Post wird zusammen mit dem Bild veröffentlicht, deshalb beschreibt er NICHT was auf dem Bild zu sehen ist. Stattdessen gibt er Kontext, erzählt eine Geschichte, stellt eine Frage oder liefert einen Hook. Schlecht wäre: "Hier sehen Sie unser Produkt auf einem Tisch." Gut ist: "3 Monate Entwicklung. 47 Prototypen. Und jetzt liegt es endlich vor mir." Der Agent durchsucht auch hier beide Wissensquellen (firmenspezifisch und global) und berücksichtigt die Brand-Tonalität aus dem Brand-Profil — inklusive Ansprache (Du/Sie), Formalität, emotionalem Ton, Headline-Stil und Sprachmix.

**Phase 3 — Automatische Design-Generierung mit Brand-Stil-Transfer.** Hier kommt die Verbindung zum Brand Studio: Nachdem der Text generiert und in der Datenbank gespeichert ist, prüft der Workflow ob ein Brand-Profil mit Referenz-Designs existiert. Das Brand-Profil wird im Brand Studio erstellt — dort lädst du deine bestehenden Social-Media-Designs, Flyer, Visitenkarten oder andere CI-Materialien hoch, und der Vektrus Brand Analyze Workflow analysiert sie vollautomatisch.

**Wie die Brand-Analyse funktioniert (im Detail):** Der Brand Analyze Workflow nimmt bis zu 10 Referenz-Designs und optional ein Logo entgegen. Jedes Design wird einzeln von GPT-4o-Vision analysiert. Die KI extrahiert dabei ein strukturiertes Profil mit folgenden Dimensionen:

**Farben** — Primärfarbe, Sekundärfarbe, Akzentfarbe, Hintergrundfarbe, Textfarbe, jeweils als exakte Hex-Codes, plus eine Beschreibung der Farbstimmung.

**Typografie** — Überschriften-Stil (z.B. "bold sans-serif"), Fließtext-Stil, geschätzte Schriftarten (z.B. Montserrat, Inter, Playfair Display), Beschreibung der Text-Hierarchie.

**Layout** — Bevorzugte Komposition (zentral, asymmetrisch, grid-basiert), Whitespace-Level (wenig/mittel/viel), typische Platzierung von Text, Bild und Logo, bevorzugte Formate (quadratisch, Story, Carousel).

**Visueller Stil** — Gesamtstimmung (professionell, verspielt, minimalistisch, luxuriös), Bildbehandlung (Fotos, Illustrationen, Flat Design, 3D), wiederkehrende Effekte (Schatten, Verläufe, Overlays, Texturen), Fotografie-Stil (Studio, Lifestyle, UGC, Produktfoto).

**Markenelemente** — Logo-Position und -Nutzung, wiederkehrende Elemente (Rahmen, Icons, Linien, Badges), Signatur-Patterns die den Brand-Stil einzigartig machen.

**Tonalität aus dem visuellen Material** — Ansprache (Du/Sie) aus sichtbarem Text, Sprache (Deutsch/Englisch/gemischt), Formalitätsstufe, Headline-Stil (fragend, provokant, informativ, emotional), emotionaler Ton (energisch, ruhig, humorvoll, seriös, inspirierend). Wenn die Designs nicht genug Text enthalten, wird die Tonalität aus der Brand Voice im KI-Profil abgeleitet.

Nachdem alle Designs einzeln analysiert sind, werden die Ergebnisse in einem zweiten GPT-Aufruf zu einer konsolidierten "Design-DNA" synthetisiert. Dabei werden die Gemeinsamkeiten über alle Designs identifiziert, Ausreißer ignoriert, und ein einheitliches Profil erstellt. Wenn ein Logo hochgeladen wurde, wird es separat von GPT-4o-Vision analysiert und die Logo-Farben überschreiben die aus den Designs extrahierten Farben — weil Logo-Farben präziser sind.

Das Ergebnis wird als Brand-Profil in der Tabelle `brand_profiles` gespeichert. Es enthält unter anderem die Felder `colors` (JSONB mit Primary/Secondary/Accent/Background/Text), `fonts` (JSONB mit Heading/Body), `visual_style` (Text), `tonality` (JSONB mit formality/addressing/language_mix/headline_style/emotional_tone/description), `design_dna` (JSONB mit der vollen Analyse), `reference_images` (Array der analysierten Bilder mit ihren Einzel-Analysen), `style_summary` (lesbare Zusammenfassung auf Deutsch), und `prompt_guidelines` (ein Absatz auf Englisch, geschrieben als Anweisung für KI-Bildgeneratoren — beginnt mit "BRAND STYLE GUIDE: ..." und enthält alle wichtigen visuellen Regeln).

Manuelle CI-Daten (Farben, Fonts, Tonalität, Slogan) die der User im Brand Studio eingibt haben immer Vorrang vor den extrahierten Werten.

**Zurück zu Pulse Visual — der Design-Generierungsschritt:** Nachdem der Post-Text gespeichert ist, lädt der "Load Brand Reference" Node das Brand-Profil und prüft ob Referenz-Designs vorhanden sind. Wenn ja, wird die beste Referenz für die jeweilige Plattform ausgewählt (Instagram-Referenz für Instagram-Posts, falls vorhanden, sonst die erste verfügbare).

Dann baut der "Build NB2 Prompt" Node einen zweigeteilten Prompt:

Der **positive Prompt** enthält drei Blöcke: **FORMAT** (Seitenverhältnis und Auflösung passend zur Plattform — 4:5 für Instagram, 1:1 für LinkedIn, 9:16 für TikTok, 16:9 für Twitter), **CONTENT** (das hochgeladene Foto als zentrales Bildelement plus die Headline und den CTA-Text aus dem generierten Post, mit Anweisung zur Lesbarkeit und starkem Kontrast), und **STYLE** (Anweisung den Design-Stil der Referenz zu übernehmen — Layout-Struktur, Typografie-Stil, Farbbehandlung, dekorative Elemente — aber NUR den visuellen Stil, nicht den Inhalt der Referenz, plus die extrahierten Brand-Farben und Layout-Vorgaben aus der Design-DNA).

Der **negative Prompt** schützt aktiv vor häufigen Fehlern: Keine Sponsor-Logos, Partner-Logos oder Markennamen aus der Referenz kopieren. Keine Arena-Namen, Venue-Namen oder Ortstexte aus der Referenz übernehmen. Keine Sponsor-Leisten, Partner-Grids oder Werbe-Bereiche. Keine Statistiken, Scores oder Event-Daten. Der EINZIGE erlaubte Text ist die exakte Headline und der exakte Subtext — kein anderer Text, keine Labels, keine Watermarks. Das hochgeladene Foto darf nicht verzerrt, beschnitten, gefiltert oder verdeckt werden. Das Seitenverhältnis darf nicht abweichen. Kein unscharfer Text, keine unleserlichen Fonts.

Dieser Prompt wird an die Nano Banana 2 API via fal.ai gesendet — und zwar über den /edit-Endpoint, der sowohl das Referenz-Design (für den Stil-Transfer) als auch das hochgeladene User-Foto (als Hauptmotiv) als `image_urls` Array entgegennimmt. Das Ergebnis ist ein Design, das das Originalfoto des Users im visuellen Stil seiner bestehenden Marken-Designs präsentiert — mit passender Headline, passenden Farben und passendem Layout.

Das generierte Design wird in Supabase Storage hochgeladen und die öffentliche URL wird im Content-Record unter `design_image_url` gespeichert, zusammen mit Status-Feldern (`has_design: true`, `design_status: "success"`, `design_engine: "fal-ai/nano-banana-2"`).

Falls kein Brand-Profil vorhanden ist oder keine Referenz-Designs hochgeladen wurden, wird der Design-Schritt übersprungen und der Post enthält nur das Originalfoto plus den generierten Text — der User bekommt eine klare Meldung: "Kein Referenz-Design vorhanden. Lade im Brand Studio Beispiel-Designs hoch, um automatische Designs zu erhalten."

Falls die Design-Generierung fehlschlägt (Timeout, Download-Fehler, API-Fehler), wird der Post trotzdem gespeichert — mit dem Originalfoto und dem generierten Text, plus dem Fehler-Status und der Möglichkeit das Design über "Design neu generieren" im Frontend nachzuholen (über den separaten Design Regen Workflow).

### Modus 3 — Ein-Klick-Woche (Pulse Auto)

Ein einziger Klick, kein Wizard, kein Nachdenken. Pulse Auto analysiert selbstständig welche Posting-Slots in deiner aktuellen Woche noch frei sind, liest alle nötigen Informationen aus deinem Profil (Plattformen, Tonalität, Sprache, Zielgruppe, Brand Voice) und baut automatisch eine optimale Konfiguration. Der KI-Agent bestimmt sogar das Thema selbstständig — basierend auf dem was zuletzt gepostet wurde, um Wiederholungen zu vermeiden.

Du siehst eine Zusammenfassung: "3 Instagram Posts, 2 LinkedIn Posts, KW 12, Stil: Professional, Sprache: Deutsch". Dann bestätigst du — oder springst über "Anpassen" in den normalen Wizard mit vorausgefüllten Werten.

Technisch nutzt Pulse Auto den gleichen Generierungs-Engine wie Pulse Text, nur mit einer vorgeschalteten Analyse-Phase die den Wizard ersetzt. Das Frontend zeigt die Auto-Karte prominent über den beiden anderen Modi auf der Pulse-Seite.

## Was Pulse bei jedem einzelnen Post berücksichtigt

Für jeden Post fließen folgende Datenquellen ein:

**Unternehmensprofil** — Firmenname, Branche, Produkte, Services. Geladen aus der Supabase `users` Tabelle.

**KI-Profil** — Brand Voice, Zielgruppe, Kernbotschaften, Tonalitäts-Einstellungen. Geladen aus `user_ai_profiles`.

**Brand-Profil** — Primär-, Sekundär- und Akzentfarben, visueller Stil, Ansprache (Du/Sie), Formalitätsstufe, Sprachmix, Headline-Stil, emotionaler Ton, Slogan, Design-DNA mit Layout-Patterns, Typografie-Analyse und Prompt-Guidelines für Bildgeneratoren. Geladen aus `brand_profiles`, erstellt durch den Brand Analyze Workflow im Brand Studio.

**Performance-Daten** — Welche bisherigen Posts gut performt haben (Likes, Reichweite, Engagement-Rate, Kommentare), welche Formate, welche Hooks, welche Content-Typen. Aus der firmenspezifischen Vektor-Datenbank (`user_documents`).

**Social-Media-Best-Practices** — Optimale Post-Längen, Hashtag-Strategien, Content-Formate, aktuelle Trends, Plattform-spezifische Regeln. Aus der globalen Knowledge Base (`shared_knowledge`).

**Plattform-spezifische Regeln** — Instagram: max. 2.200 Zeichen, 5–30 Hashtags, Emojis und Line Breaks für Lesbarkeit, Storytelling-Hook → Problem → Lösung → CTA, Hashtags am Ende. LinkedIn: max. 3.000 Zeichen, 3–10 Hashtags, professioneller Ton mit Mehrwert und Thought Leadership, weniger Emojis, erste Zeile = Hook. TikTok: max. 2.200 Zeichen, 3–10 Hashtags, casual und authentisch, Hook in den ersten 3 Worten, Trending-Themen. Facebook: max. 63.206 Zeichen, 0–5 Hashtags, Community-orientiert, Fragen für Engagement, längere Posts erlaubt. Twitter/X: max. 280 Zeichen, 1–3 Hashtags, kurz und prägnant.

## Was Pulse pro Post ausgibt

Jeder generierte Post enthält: den vollständigen Post-Text (formatiert mit Emojis, Line Breaks und plattformgerechter Struktur), Hashtags (plattformspezifisch optimiert), einen Call-to-Action, Emoji-Vorschläge, einen Hook (die ersten Worte die Aufmerksamkeit erregen), den Content-Typ (educational, entertaining, promotional, behind the scenes), eine Engagement-Einschätzung (niedrig/mittel/hoch), und eine Begründung warum dieser Post gut performen sollte — mit konkretem Bezug auf die gefundenen Performance-Daten und angewandten Best Practices. Optional dazu: ein KI-generiertes fotorealistisches Bild oder ein markenkonformes Design im Stil der eigenen Brand-Identität.

## Plattformen

Instagram, LinkedIn, Facebook, TikTok, Twitter/X. Jede Plattform hat eigene Regeln für maximale Textlänge, Hashtag-Anzahl, optimale Posting-Zeiten, Tonalität und Content-Formate, die Pulse automatisch berücksichtigt. Die Default-Posting-Zeiten sind plattformspezifisch hinterlegt (Instagram: 09:00, 13:00, 19:00; LinkedIn: 08:00, 12:00, 17:00; TikTok: 20:00, 22:00; Facebook: 09:00, 14:00, 19:00; Twitter: 08:00, 12:00, 18:00), können aber vom User pro Plattform überschrieben werden.

## Nach der Generierung

Alle generierten Posts landen im Content Planner — einer Kalenderansicht. Dort kann jeder Post angesehen, bearbeitet, per Drag & Drop auf einen anderen Tag oder eine andere Uhrzeit verschoben, mit "Text neu generieren" (über den Text Regen Workflow) oder "Design neu generieren" (über den Design Regen Workflow) einzeln regeneriert werden, und direkt über Late API auf Instagram, LinkedIn und Facebook veröffentlicht werden. Der User behält immer die volle Kontrolle.

## Der Kreislauf: Brand Studio → Pulse → Content Planner → Veröffentlichung

Das System ist als Kreislauf gedacht: Im Brand Studio lädst du deine bestehenden Designs hoch. Die Brand-Analyse extrahiert daraus deine visuelle Identität. Pulse nutzt diese Identität bei jeder Content-Generierung — für die Texte (Tonalität, Ansprache) und für die Bilder (Farben, Layout, Stil). Die generierten Posts landen im Content Planner, wo du sie prüfst und veröffentlichst. Je mehr du postest und je mehr Performance-Daten gesammelt werden, desto besser werden die Empfehlungen der KI beim nächsten Pulse-Durchlauf. Das System lernt kontinuierlich mit.
