# Vektrus Content Planner — Produktbeschreibung

**Stand: März 2026**

---

## Was ist der Content Planner?

Der Content Planner ist die zentrale Schaltstelle für alle Social-Media-Inhalte innerhalb von Vektrus. Hier laufen alle generierten und manuell erstellten Posts zusammen — in einer visuellen Kalender-Ansicht, die dem Nutzer auf einen Blick zeigt, was wann auf welcher Plattform geplant ist.

Der Planner ist bewusst als Steuerungszentrale konzipiert: Der Nutzer generiert Content über Pulse oder den Chat, und verwaltet, kontrolliert und veröffentlicht ihn im Planner. Die Philosophie ist „Pulse-first" — die Plattform priorisiert automatisierte Generierung über manuelles Erstellen, aber der Planner gibt dem Nutzer dabei jederzeit die volle Kontrolle.

---

## Kernfunktionen

### Kalender-Ansicht

Der Planner zeigt alle Posts in einer übersichtlichen Kalenderansicht. Jeder Tag zeigt die geplanten Posts als kompakte Karten mit Vorschau-Thumbnail (Bild oder Video-Standbild), Plattform-Badge (Instagram, LinkedIn, Facebook, TikTok, Twitter/X), Post-Text-Vorschau und aktuellem Status.

Verfügbare Ansichten: Wochenübersicht und Monatsübersicht. Plattform-Filter erlauben es, nur Posts für eine bestimmte Plattform anzuzeigen — z.B. nur Instagram oder nur LinkedIn.

Leere Tage zeigen ein „+" Symbol, das direkt zum manuellen Erstellen oder zu Pulse führt. Wenn die Woche überwiegend leer ist, erscheint prominent der Hinweis „Woche füllen" mit einem direkten Link zu Pulse Auto.

### Post-Status-Workflow

Jeder Post durchläuft einen klar definierten Lebenszyklus:

- **Entwurf (draft):** Post wurde generiert oder manuell erstellt, wartet auf Prüfung
- **Genehmigt (approved):** Nutzer hat den Post geprüft und freigegeben
- **Geplant (scheduled):** Post ist für die automatische Veröffentlichung zu einem bestimmten Zeitpunkt eingeplant
- **Veröffentlicht (published):** Post wurde erfolgreich auf der Plattform gepostet

Der Status ist jederzeit am Post sichtbar und kann vom Nutzer geändert werden. Nicht überzeugende Posts können verworfen oder zur Neugeneration geschickt werden.

### Post-Aktionen

Für jeden einzelnen Post stehen folgende Aktionen zur Verfügung:

- **Genehmigen:** Post freigeben, damit er veröffentlicht werden kann
- **Bearbeiten:** Text, Hashtags, Veröffentlichungszeit und Plattform manuell anpassen
- **Neu generieren:** Post mit optionalem User-Feedback neu erstellen lassen — z.B. „Mach den Text lockerer" oder „Saison ist 25/26, nicht 23/24". Die KI generiert den Post dann mit dem Feedback als höchste Priorität neu
- **Löschen:** Post endgültig verwerfen
- **Alle genehmigen:** Alle offenen Entwürfe auf einmal freigeben

### Drag & Drop

Posts können per Drag & Drop zwischen Tagen im Kalender verschoben werden. Das geplante Veröffentlichungsdatum wird dabei automatisch angepasst.

### Manuelles Erstellen von Posts

Neben den automatisch generierten Inhalten können Nutzer auch manuell Posts im Planner erstellen:

- Text eingeben (Caption, Hashtags)
- Plattform wählen (Instagram, LinkedIn, Facebook, TikTok, Twitter/X)
- Datum und Uhrzeit festlegen
- Bild hochladen (aus lokalen Dateien, gespeichert in Supabase Storage)
- Video hochladen (MP4, MOV, WebM — bis 100 MB, z.B. für Instagram Reels)

Manuell erstellte Posts durchlaufen denselben Status-Workflow wie generierte Posts und können genauso veröffentlicht werden.

### Chat-Integration

Aus dem Vektrus Chat heraus können generierte Inhalte direkt in den Content Planner übernommen werden. Jede Chat-Nachricht mit Post-Vorschlag hat einen „In Contentplan übernehmen" Button, der ein Dropdown öffnet: Plattform wählen, Datum und Uhrzeit setzen, fertig. Der Post erscheint sofort im Kalender.

---

## Automatisches Veröffentlichen

Der Content Planner ist direkt mit der Posting-Engine von Vektrus verbunden. Genehmigte Posts können entweder sofort oder zeitgesteuert auf den verbundenen Social-Media-Kanälen veröffentlicht werden.

### Unterstützte Posting-Optionen

- **Sofort veröffentlichen:** Post wird unmittelbar an die Plattform gesendet
- **Zeitgesteuert planen:** Post wird automatisch zum eingestellten Datum und Uhrzeit veröffentlicht
- **Multi-Plattform:** Ein Post kann gleichzeitig auf mehreren Plattformen erscheinen (Cross-Posting)

### Unterstützte Plattformen & Formate

| Plattform | Text-Posts | Bild-Posts | Karussell-Posts | Video/Reels | Stories |
|-----------|:----------:|:----------:|:---------------:|:-----------:|:-------:|
| Instagram | ✅ | ✅ | ✅ | ✅ | ✅ |
| Facebook | ✅ | ✅ | ✅ | — | ✅ |
| LinkedIn | ✅ | ✅ | ✅ (als Dokument) | — | — |
| Twitter / X | ✅ | ✅ | — | — | — |
| TikTok | ✅ | — | — | ✅ | — |

### Account-Verbindung

Nutzer verbinden ihre Social-Media-Accounts einmalig per sicherem OAuth-Verfahren. Vektrus benötigt dabei niemals Login-Daten. Die Verbindung kann jederzeit getrennt und neu hergestellt werden.

---

## Unterstützte Content-Formate im Planner

Der Content Planner verarbeitet alle Formate, die Vektrus generieren kann:

- **Einzelbild-Post:** Ein Bild mit Text, optimiert für die jeweilige Plattform
- **Karussell-Post:** Mehrere Slides (2–10) mit zusammenhängendem Inhalt, Swipe-Indikatoren, CTA-Slide am Ende
- **Text-Only-Post:** Reiner Text ohne Bild, ideal für LinkedIn Thought Leadership oder Twitter/X
- **Video-Post / Reel:** Kurzvideo (z.B. von Vektrus Vision generiert oder vom Nutzer hochgeladen), optimiert für Instagram Reels und TikTok
- **Stories:** Hochformat-Content für Instagram Stories und Facebook Stories

Jedes Format wird im Kalender mit einem entsprechenden Badge angezeigt (📸 Bild, 🎬 Video/Reel, 📑 Karussell, ✏️ Text-Only, 📱 Story), damit der Nutzer auf einen Blick den Content-Mix der Woche sieht.

---

## Content-Quellen

Posts im Content Planner können aus verschiedenen Quellen stammen:

| Quelle | Beschreibung | Badge |
|--------|-------------|-------|
| **Pulse Standard** | Über den Wizard themenbasiert generiert | Pulse |
| **Pulse Visual** | Aus hochgeladenen Fotos generiert | 📸 Visual |
| **Pulse Auto** | Automatisch per Ein-Klick-Woche erstellt | ⚡ Auto |
| **Chat** | Aus dem KI-Chat übernommen | 💬 Chat |
| **Manuell** | Vom Nutzer direkt im Planner erstellt | ✏️ Manuell |

Die Quelle ist an jedem Post sichtbar, damit der Nutzer nachvollziehen kann, woher ein Inhalt stammt.

---

## Was den Content Planner besonders macht

### Pulse-Integration als Kern

Anders als bei reinen Scheduling-Tools wie Buffer oder Later ist der Content Planner nicht dafür gebaut, manuell erstellte Posts zu organisieren. Er ist das Gegenstück zu Pulse: Pulse generiert, der Planner verwaltet. Der typische Workflow ist: Pulse füllt die Woche automatisch → der Nutzer prüft im Planner → genehmigt oder passt an → Veröffentlichung läuft automatisch.

### Regeneration mit Kontext

Wenn ein Post nicht passt, muss der Nutzer ihn nicht manuell umschreiben. Stattdessen klickt er auf „Neu generieren" und kann optional Feedback mitgeben. Die KI generiert den Post dann neu — mit dem User-Feedback als höchste Priorität, aber weiterhin im Kontext des Unternehmensprofils, der Brand Voice und der Plattform-Anforderungen.

### Markendesign automatisch angewendet

Posts die über Pulse Visual oder den Bildgenerator erstellt werden, tragen automatisch das Corporate Design des Kunden: Markenfarben, Logo, Typografie und Layout aus dem Brand Studio. Der Nutzer sieht im Planner bereits die finale, designte Version — nicht nur Rohtext mit Platzhalter-Bild.

### Vollständiger Workflow ohne Plattformwechsel

Der gesamte Social-Media-Workflow findet innerhalb von Vektrus statt: Content generieren (Pulse/Chat) → Prüfen und anpassen (Planner) → Veröffentlichen (automatisch). Der Nutzer muss zu keinem Zeitpunkt die eigentlichen Social-Media-Apps öffnen, um Inhalte zu posten.

### Video-Support

Der Planner unterstützt Video-Content vollständig: Videos können hochgeladen (MP4, MOV, WebM bis 100 MB), im Planner mit Vorschau und Play-Icon angezeigt, und als Instagram Reels oder TikTok-Videos veröffentlicht werden. Von Vektrus Vision generierte Videos landen automatisch im Planner und können dort eingeplant werden.

---

## Zusammenfassung

Der Vektrus Content Planner ist mehr als ein Kalender — er ist die Brücke zwischen automatischer KI-Generierung und kontrollierter Veröffentlichung. Er gibt dem Nutzer die Sicherheit, dass nichts ohne seine Zustimmung online geht, während er gleichzeitig den Aufwand auf ein Minimum reduziert: Prüfen, genehmigen, fertig.

> **Kernbotschaft:** „Alle Posts auf einen Blick, per Drag & Drop anpassen und direkt veröffentlichen."
