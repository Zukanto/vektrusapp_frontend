// Help system data model and content for Vektrus App
// All content is TypeScript-based, no Supabase dependency.

export interface HelpStep {
  title: string;
  description: string;
  note?: string;
}

export interface HelpSection {
  type: 'intro' | 'prerequisites' | 'steps' | 'tips' | 'pitfalls';
  title: string;
  content?: string;
  steps?: HelpStep[];
  items?: string[];
}

export interface HelpArticle {
  slug: string;
  title: string;
  categorySlug: string;
  summary: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  sections: HelpSection[];
  relatedArticles: string[];
  updatedAt: string;
}

export interface HelpCategory {
  slug: string;
  title: string;
  description: string;
  iconName: string;
  articles: HelpArticle[];
}

// ─── Artikel-Content ────────────────────────────────────────────────────────

const ersteSchritteArticles: HelpArticle[] = [
  {
    slug: 'konto-einrichten',
    title: 'Wie du dein Vektrus-Konto einrichtest',
    categorySlug: 'erste-schritte',
    summary: 'Erstelle dein Konto und mache die ersten Einstellungen, um Vektrus sofort nutzen zu können.',
    tags: ['konto', 'registrierung', 'setup', 'start'],
    difficulty: 'beginner',
    relatedArticles: ['profil-vervollstaendigen', 'social-account-verbinden'],
    updatedAt: '2026-03-20',
    sections: [
      {
        type: 'intro',
        title: 'Was du hier lernst',
        content: 'In diesem Artikel erfährst du, wie du dein Vektrus-Konto erstellst, dich zum ersten Mal anmeldest und die wichtigsten Grundeinstellungen vornimmst.'
      },
      {
        type: 'steps',
        title: 'Schritt für Schritt',
        steps: [
          {
            title: 'Registrierung starten',
            description: 'Öffne die Vektrus-App und klicke auf „Konto erstellen". Gib deine E-Mail-Adresse und ein sicheres Passwort ein.',
          },
          {
            title: 'E-Mail bestätigen',
            description: 'Du erhältst eine Bestätigungs-E-Mail. Klicke auf den Link, um dein Konto zu aktivieren.',
            note: 'Prüfe auch deinen Spam-Ordner, falls die E-Mail nicht ankommt.'
          },
          {
            title: 'Erstanmeldung',
            description: 'Melde dich mit deinen Zugangsdaten an. Du landest im Tool Hub, der dir einen Überblick über alle Vektrus-Funktionen gibt.',
          },
          {
            title: 'Grundeinstellungen vornehmen',
            description: 'Öffne die Einstellungen über dein Profilbild in der Sidebar und hinterlege deinen Unternehmensnamen, deine Branche und deine Zeitzone.',
          }
        ]
      },
      {
        type: 'tips',
        title: 'Tipps & Best Practices',
        items: [
          'Verwende eine E-Mail-Adresse, auf die du langfristig Zugriff hast — darüber wird auch die Passwort-Wiederherstellung abgewickelt.',
          'Richte dein Unternehmensprofil direkt nach der Registrierung ein. Je vollständiger dein Profil, desto besser kann Vektrus Inhalte auf dein Unternehmen zuschneiden.',
        ]
      },
      {
        type: 'pitfalls',
        title: 'Häufige Fehler',
        items: [
          'Bestätigungs-E-Mail nicht angeklickt — ohne Aktivierung kannst du dich nicht anmelden.',
          'Unternehmensprofil leer gelassen — die KI kann dann nicht personalisiert arbeiten.',
        ]
      }
    ]
  },
  {
    slug: 'profil-vervollstaendigen',
    title: 'Wie du dein Unternehmensprofil vervollständigst',
    categorySlug: 'erste-schritte',
    summary: 'Ein vollständiges Profil hilft der KI, Inhalte passgenau für dein Unternehmen zu erstellen.',
    tags: ['profil', 'unternehmen', 'setup', 'ki-profil'],
    difficulty: 'beginner',
    relatedArticles: ['konto-einrichten', 'brand-studio-einrichten', 'social-account-verbinden'],
    updatedAt: '2026-03-20',
    sections: [
      {
        type: 'intro',
        title: 'Was du hier lernst',
        content: 'Du erfährst, welche Profildaten Vektrus nutzt, wo du sie eingibst und warum ein vollständiges Profil entscheidend für die Qualität deiner KI-generierten Inhalte ist.'
      },
      {
        type: 'prerequisites',
        title: 'Voraussetzungen',
        items: [
          'Du hast ein aktives Vektrus-Konto.',
        ]
      },
      {
        type: 'steps',
        title: 'Schritt für Schritt',
        steps: [
          {
            title: 'Profil öffnen',
            description: 'Klicke in der Sidebar auf dein Profilbild, um die Einstellungen zu öffnen.',
          },
          {
            title: 'Unternehmensdaten eingeben',
            description: 'Fülle die Felder für Unternehmensname, Branche, Standort und eine kurze Beschreibung aus. Diese Daten fließen in dein KI-Profil ein.',
          },
          {
            title: 'KI-Profil prüfen',
            description: 'Unter „KI-Profil" siehst du, wie Vektrus dein Unternehmen versteht — inklusive Brand Voice, Zielgruppe und Kernbotschaften. Du kannst diese Werte jederzeit anpassen.',
          },
          {
            title: 'Speichern',
            description: 'Klicke auf „Speichern", um deine Änderungen zu übernehmen. Dein Profil wird sofort für alle zukünftigen Generierungen berücksichtigt.',
          }
        ]
      },
      {
        type: 'tips',
        title: 'Tipps & Best Practices',
        items: [
          'Je detaillierter deine Unternehmensbeschreibung, desto besser werden die generierten Inhalte.',
          'Aktualisiere dein Profil, wenn sich deine Positionierung, Zielgruppe oder dein Angebot ändert.',
          'Nutze das Brand Studio zusätzlich, um visuelle Markenrichtlinien zu hinterlegen.',
        ]
      }
    ]
  },
  {
    slug: 'social-account-verbinden',
    title: 'Wie du deinen ersten Social-Media-Account verbindest',
    categorySlug: 'erste-schritte',
    summary: 'Verbinde deine Social-Media-Konten, um Inhalte direkt aus Vektrus zu veröffentlichen.',
    tags: ['social', 'instagram', 'linkedin', 'verbinden', 'accounts'],
    difficulty: 'beginner',
    relatedArticles: ['konto-einrichten', 'instagram-verbinden', 'linkedin-verbinden'],
    updatedAt: '2026-03-20',
    sections: [
      {
        type: 'intro',
        title: 'Was du hier lernst',
        content: 'Hier erfährst du, wie du Social-Media-Plattformen wie Instagram, LinkedIn oder Facebook mit Vektrus verknüpfst, damit du Inhalte direkt veröffentlichen kannst.'
      },
      {
        type: 'prerequisites',
        title: 'Voraussetzungen',
        items: [
          'Du hast ein aktives Vektrus-Konto.',
          'Du hast einen aktiven Account auf der Plattform, die du verbinden möchtest.',
          'Für Instagram: Du benötigst einen Business- oder Creator-Account (kein privater Account).',
        ]
      },
      {
        type: 'steps',
        title: 'Schritt für Schritt',
        steps: [
          {
            title: 'Konten-Bereich öffnen',
            description: 'Gehe zu Einstellungen → Social-Konten. Dort siehst du alle verfügbaren Plattformen.',
          },
          {
            title: 'Plattform auswählen',
            description: 'Klicke bei der gewünschten Plattform auf „Verbinden". Du wirst zur Plattform weitergeleitet.',
          },
          {
            title: 'Zugriff autorisieren',
            description: 'Melde dich auf der Plattform an und erteile Vektrus die nötigen Berechtigungen. Vektrus benötigt Zugriff zum Veröffentlichen und Lesen von Statistiken.',
          },
          {
            title: 'Verbindung bestätigen',
            description: 'Nach erfolgreicher Autorisierung wirst du zurück zu Vektrus geleitet. Der verbundene Account erscheint in der Kontenübersicht.',
          }
        ]
      },
      {
        type: 'pitfalls',
        title: 'Häufige Fehler',
        items: [
          'Instagram mit privatem Account verbinden — nur Business- oder Creator-Accounts werden unterstützt.',
          'Popup-Blocker aktiv — die Autorisierung öffnet ein neues Fenster. Stelle sicher, dass Popups erlaubt sind.',
          'Falsche Facebook-Seite ausgewählt — prüfe, dass du die richtige Seite mit deinem Facebook-Business-Konto verknüpfst.',
        ]
      },
      {
        type: 'tips',
        title: 'Tipps & Best Practices',
        items: [
          'Verbinde alle Plattformen, auf denen du aktiv bist. So kannst du Inhalte plattformübergreifend planen und veröffentlichen.',
          'Prüfe regelmäßig in den Einstellungen, ob deine Verbindungen noch aktiv sind — Token können nach längerer Inaktivität ablaufen.',
        ]
      }
    ]
  },
];

const pulseArticles: HelpArticle[] = [
  {
    slug: 'erste-woche-mit-pulse',
    title: 'Wie du deinen ersten Wochenplan mit Pulse erstellst',
    categorySlug: 'pulse',
    summary: 'Nutze Pulse Standard, um in wenigen Minuten einen kompletten Wochenplan mit personalisierten Social-Media-Posts zu generieren.',
    tags: ['pulse', 'wochenplan', 'generierung', 'wizard', 'start'],
    difficulty: 'beginner',
    relatedArticles: ['pulse-visual', 'pulse-auto', 'pulse-ergebnisse-pruefen'],
    updatedAt: '2026-03-20',
    sections: [
      {
        type: 'intro',
        title: 'Was du hier lernst',
        content: 'Du erfährst, wie du Pulse Standard nutzt, um über den Wizard einen kompletten Wochenplan mit personalisierten Posts zu generieren — inklusive Texten, Hashtags und optionalen Bildern.'
      },
      {
        type: 'prerequisites',
        title: 'Voraussetzungen',
        items: [
          'Dein Unternehmensprofil ist ausgefüllt.',
          'Mindestens ein Social-Media-Account ist verbunden.',
        ]
      },
      {
        type: 'steps',
        title: 'Schritt für Schritt',
        steps: [
          {
            title: 'Pulse öffnen',
            description: 'Navigiere über die Sidebar zu „Pulse". Wähle den Modus „Pulse Standard" aus.',
          },
          {
            title: 'Wizard durchlaufen',
            description: 'Der Wizard führt dich durch mehrere Schritte: Ziel wählen (z. B. Engagement oder Reichweite), Plattformen auswählen, Posting-Frequenz festlegen, Tonalität bestimmen und Thema definieren.',
          },
          {
            title: 'Optionale Bildgenerierung',
            description: 'Du kannst die automatische Bildgenerierung aktivieren. Pulse erstellt dann zu jedem Post ein passendes Bild — in Standard- oder Premium-Qualität.',
            note: 'Premium-Bilder nutzen dein Brand-Profil aus dem Brand Studio für markenkonforme Designs.'
          },
          {
            title: 'Generierung starten',
            description: 'Prüfe die Zusammenfassung und klicke auf „Generierung starten". Pulse erstellt deinen Wochenplan in etwa 3–5 Minuten.',
          },
          {
            title: 'Ergebnisse prüfen',
            description: 'Nach Abschluss der Generierung findest du deine neuen Posts im Content Planner. Dort kannst du sie prüfen, anpassen und zur Veröffentlichung freigeben.',
          }
        ]
      },
      {
        type: 'tips',
        title: 'Tipps & Best Practices',
        items: [
          'Nutze im Wizard den optionalen Anlass (Schritt 8), um Content auf ein bestimmtes Thema auszurichten — z. B. einen Produktlaunch oder ein Event.',
          'Je vollständiger dein Unternehmensprofil und KI-Profil, desto besser passen die generierten Inhalte zu deiner Marke.',
          'Generiere zuerst ohne Bilder, um den Content schnell zu prüfen. Bilder kannst du später einzeln nachgenerieren.',
        ]
      }
    ]
  },
  {
    slug: 'pulse-visual',
    title: 'Wie du Pulse Visual für bildbasierte Posts nutzt',
    categorySlug: 'pulse',
    summary: 'Lade eigene Fotos hoch und lass Pulse automatisch passende Texte und markenkonforme Designs dazu erstellen.',
    tags: ['pulse', 'visual', 'bilder', 'design', 'brand'],
    difficulty: 'intermediate',
    relatedArticles: ['erste-woche-mit-pulse', 'brand-studio-einrichten', 'brand-analyse'],
    updatedAt: '2026-03-20',
    sections: [
      {
        type: 'intro',
        title: 'Was du hier lernst',
        content: 'Pulse Visual nimmt deine eigenen Fotos als Ausgangspunkt und erstellt dazu passende Texte und — bei vorhandenem Brand-Profil — automatisch Designs in deinem Markenstil.'
      },
      {
        type: 'prerequisites',
        title: 'Voraussetzungen',
        items: [
          'Dein Unternehmensprofil ist ausgefüllt.',
          'Mindestens ein Social-Media-Account ist verbunden.',
          'Für automatische Designs: Ein Brand-Profil im Brand Studio mit Referenz-Designs.',
        ]
      },
      {
        type: 'steps',
        title: 'Schritt für Schritt',
        steps: [
          {
            title: 'Pulse Visual starten',
            description: 'Navigiere zu Pulse und wähle den Modus „Pulse Visual".',
          },
          {
            title: 'Bilder hochladen',
            description: 'Lade bis zu 10 eigene Bilder hoch — z. B. Produktfotos, Event-Bilder oder Team-Aufnahmen.',
          },
          {
            title: 'Einstellungen wählen',
            description: 'Wähle Plattformen, Zeitraum und Tonalität. Pro Bild wird ein Post pro gewählter Plattform erstellt.',
          },
          {
            title: 'Generierung starten',
            description: 'Pulse analysiert jedes Bild einzeln und erstellt passende Texte, die das Bild ergänzen — nicht beschreiben. Bei vorhandenem Brand-Profil werden automatisch Designs im Markenstil generiert.',
          },
          {
            title: 'Ergebnisse im Planner',
            description: 'Die fertigen Posts erscheinen im Content Planner. Prüfe Texte und Designs und passe sie bei Bedarf an.',
          }
        ]
      },
      {
        type: 'tips',
        title: 'Tipps & Best Practices',
        items: [
          'Verwende hochauflösende Bilder für die besten Design-Ergebnisse.',
          'Richte zuerst dein Brand-Profil im Brand Studio ein, damit Pulse Visual Designs in deinem Markenstil erstellen kann.',
          'Die generierten Texte beschreiben bewusst nicht das Bild, sondern erzählen eine Geschichte oder geben Kontext — so funktionieren sie als Social-Media-Caption neben dem Foto.',
        ]
      }
    ]
  },
  {
    slug: 'pulse-auto',
    title: 'Wie du Pulse Auto für eine ganze Woche nutzt',
    categorySlug: 'pulse',
    summary: 'Mit Pulse Auto generierst du einen kompletten Wochenplan mit nur einem Klick — ideal für wiederkehrende Content-Planung.',
    tags: ['pulse', 'auto', 'ein-klick', 'wochenplan', 'automatisierung'],
    difficulty: 'intermediate',
    relatedArticles: ['erste-woche-mit-pulse', 'posting-frequenz', 'beitraege-genehmigen'],
    updatedAt: '2026-03-20',
    sections: [
      {
        type: 'intro',
        title: 'Was du hier lernst',
        content: 'Pulse Auto ist der schnellste Weg, eine komplette Woche mit Social-Media-Content zu füllen. Ein Klick reicht — Pulse nutzt dein Profil, deine bisherige Performance und deine Markendaten, um automatisch einen optimierten Wochenplan zu erstellen.'
      },
      {
        type: 'prerequisites',
        title: 'Voraussetzungen',
        items: [
          'Dein Unternehmensprofil und KI-Profil sind vollständig.',
          'Mindestens ein Social-Media-Account ist verbunden.',
          'Idealerweise: Bisherige Posts im System, damit Pulse aus deiner Performance lernen kann.',
        ]
      },
      {
        type: 'steps',
        title: 'Schritt für Schritt',
        steps: [
          {
            title: 'Pulse Auto starten',
            description: 'Navigiere zu Pulse und wähle „Pulse Auto / Ein-Klick-Woche".',
          },
          {
            title: 'Generierung abwarten',
            description: 'Pulse erstellt automatisch einen optimierten Wochenplan basierend auf deinem Profil, deiner Branche und deiner bisherigen Performance. Das dauert etwa 3–5 Minuten.',
          },
          {
            title: 'Ergebnisse prüfen',
            description: 'Die generierten Posts erscheinen im Content Planner. Prüfe den Wochenplan und nimm bei Bedarf Anpassungen vor.',
          },
          {
            title: 'Freigeben und planen',
            description: 'Genehmige die Posts, die dir gefallen, und plane sie für die automatische Veröffentlichung ein.',
          }
        ]
      },
      {
        type: 'tips',
        title: 'Tipps & Best Practices',
        items: [
          'Pulse Auto eignet sich besonders gut, wenn du jede Woche Content brauchst und nicht jedes Mal den Wizard durchlaufen möchtest.',
          'Die Qualität von Pulse Auto steigt mit der Menge an Daten, die Vektrus über dein Unternehmen hat — pflege dein Profil und KI-Profil regelmäßig.',
          'Nutze den Content Planner, um einzelne Posts nach der Generierung anzupassen.',
        ]
      }
    ]
  },
  {
    slug: 'pulse-ergebnisse-pruefen',
    title: 'Wie du Pulse-Ergebnisse im Planner prüfst und anpasst',
    categorySlug: 'pulse',
    summary: 'Nach der Generierung findest du deine Posts im Content Planner. Hier erfährst du, wie du sie prüfst, bearbeitest und freigibst.',
    tags: ['pulse', 'planner', 'prüfen', 'bearbeiten', 'freigabe'],
    difficulty: 'beginner',
    relatedArticles: ['erste-woche-mit-pulse', 'beitraege-bearbeiten', 'beitraege-genehmigen'],
    updatedAt: '2026-03-20',
    sections: [
      {
        type: 'intro',
        title: 'Was du hier lernst',
        content: 'Nachdem Pulse deine Posts generiert hat, landen sie als Entwürfe im Content Planner. Hier erfährst du, wie du die Ergebnisse durchgehst, Texte anpasst und Posts zur Veröffentlichung freigibst.'
      },
      {
        type: 'steps',
        title: 'Schritt für Schritt',
        steps: [
          {
            title: 'Content Planner öffnen',
            description: 'Navigiere zum Content Planner. Die neuen Posts von Pulse erscheinen als Entwürfe in der Kalenderansicht.',
          },
          {
            title: 'Post anklicken',
            description: 'Klicke auf einen Post, um die Detailansicht zu öffnen. Dort siehst du den generierten Text, Hashtags, das Bild und die geplante Veröffentlichungszeit.',
          },
          {
            title: 'Text anpassen',
            description: 'Bearbeite den Text direkt im Editor. Du kannst auch Hashtags anpassen, die Plattform wechseln oder ein anderes Bild zuweisen.',
            note: 'Nutze „KI Umschreiben", um den Text mit spezifischem Feedback neu generieren zu lassen — z. B. „Mach den Text lockerer".'
          },
          {
            title: 'Post freigeben',
            description: 'Wenn du zufrieden bist, ändere den Status auf „Genehmigt". Genehmigte Posts können dann zeitgesteuert veröffentlicht werden.',
          }
        ]
      },
      {
        type: 'tips',
        title: 'Tipps & Best Practices',
        items: [
          'Nutze die „Alle genehmigen"-Funktion, wenn du mit dem Gesamtergebnis zufrieden bist und nicht jeden Post einzeln freigeben möchtest.',
          'Die „KI Umschreiben"-Funktion ist ideal, um Feinschliff vorzunehmen, ohne den Text komplett neu zu schreiben.',
        ]
      }
    ]
  },
];

const plannerArticles: HelpArticle[] = [
  {
    slug: 'beitraege-bearbeiten',
    title: 'Wie du Beiträge im Planner bearbeitest und planst',
    categorySlug: 'content-planner',
    summary: 'Bearbeite Texte, Bilder und Zeitpläne deiner Posts direkt im Content Planner.',
    tags: ['planner', 'bearbeiten', 'posts', 'text', 'zeitplan'],
    difficulty: 'beginner',
    relatedArticles: ['beitraege-genehmigen', 'drag-and-drop', 'manueller-beitrag'],
    updatedAt: '2026-03-20',
    sections: [
      {
        type: 'intro',
        title: 'Was du hier lernst',
        content: 'Der Content Planner zeigt alle deine Social-Media-Posts in einer Kalenderansicht. Hier erfährst du, wie du einzelne Beiträge öffnest, Texte bearbeitest, Bilder austauschst und den Zeitplan anpasst.'
      },
      {
        type: 'steps',
        title: 'Schritt für Schritt',
        steps: [
          {
            title: 'Post im Kalender finden',
            description: 'Navigiere zum Content Planner. In der Wochen- oder Monatsansicht siehst du alle geplanten Posts als Karten auf den jeweiligen Tagen.',
          },
          {
            title: 'Post öffnen',
            description: 'Klicke auf eine Post-Karte, um den Editor zu öffnen. Dort siehst du alle Details: Text, Hashtags, Plattform, Veröffentlichungszeit und Bild.',
          },
          {
            title: 'Text bearbeiten',
            description: 'Bearbeite den Caption-Text direkt im Textfeld. Änderungen werden gespeichert, sobald du den Editor verlässt.',
          },
          {
            title: 'Bild oder Video zuweisen',
            description: 'Klicke auf den Medienbereich, um ein anderes Bild hochzuladen oder aus der Mediathek auszuwählen.',
          },
          {
            title: 'Zeitplan anpassen',
            description: 'Ändere Datum und Uhrzeit der Veröffentlichung über die Zeitplan-Felder im Editor.',
          }
        ]
      },
      {
        type: 'tips',
        title: 'Tipps & Best Practices',
        items: [
          'Nutze die Plattform-Filter im Planner, um nur Posts für eine bestimmte Plattform anzuzeigen.',
          'Die Wochenansicht eignet sich gut für die tägliche Planung, die Monatsansicht für den Gesamtüberblick.',
        ]
      }
    ]
  },
  {
    slug: 'beitraege-genehmigen',
    title: 'Wie du Beiträge genehmigst und veröffentlichst',
    categorySlug: 'content-planner',
    summary: 'Erfahre den Freigabe-Workflow von Entwurf bis Veröffentlichung.',
    tags: ['planner', 'genehmigen', 'veröffentlichen', 'status', 'workflow'],
    difficulty: 'beginner',
    relatedArticles: ['beitraege-bearbeiten', 'pulse-ergebnisse-pruefen'],
    updatedAt: '2026-03-20',
    sections: [
      {
        type: 'intro',
        title: 'Was du hier lernst',
        content: 'Jeder Post in Vektrus durchläuft einen Status-Workflow: Entwurf → Genehmigt → Geplant → Veröffentlicht. Hier erfährst du, wie du Posts prüfst, freigibst und veröffentlichst.'
      },
      {
        type: 'steps',
        title: 'Schritt für Schritt',
        steps: [
          {
            title: 'Entwürfe prüfen',
            description: 'Neue Posts (von Pulse oder manuell erstellt) haben den Status „Entwurf". Öffne sie im Planner und prüfe Text, Bild und Timing.',
          },
          {
            title: 'Post genehmigen',
            description: 'Wenn du zufrieden bist, ändere den Status auf „Genehmigt". Damit signalisierst du, dass der Post bereit zur Veröffentlichung ist.',
          },
          {
            title: 'Veröffentlichung planen',
            description: 'Genehmigte Posts mit einer geplanten Veröffentlichungszeit werden automatisch zum eingestellten Zeitpunkt veröffentlicht.',
          },
          {
            title: 'Sofort veröffentlichen',
            description: 'Alternativ kannst du einen genehmigten Post auch sofort veröffentlichen, indem du die „Sofort veröffentlichen"-Option wählst.',
          }
        ]
      },
      {
        type: 'pitfalls',
        title: 'Häufige Fehler',
        items: [
          'Post geplant, aber kein Social-Media-Account verbunden — der Post kann dann nicht veröffentlicht werden.',
          'Veröffentlichungszeit in der Vergangenheit — stelle sicher, dass das Datum in der Zukunft liegt.',
        ]
      },
      {
        type: 'tips',
        title: 'Tipps & Best Practices',
        items: [
          'Nutze „Alle genehmigen", um mehrere Entwürfe auf einmal freizugeben.',
          'Prüfe die Veröffentlichungszeiten in der Wochenansicht — so siehst du auf einen Blick, ob dein Content gut über die Woche verteilt ist.',
        ]
      }
    ]
  },
  {
    slug: 'drag-and-drop',
    title: 'Wie du Beiträge per Drag & Drop verschiebst',
    categorySlug: 'content-planner',
    summary: 'Verschiebe Posts im Kalender einfach per Drag & Drop auf einen anderen Tag.',
    tags: ['planner', 'drag-and-drop', 'verschieben', 'kalender'],
    difficulty: 'beginner',
    relatedArticles: ['beitraege-bearbeiten', 'beitraege-genehmigen'],
    updatedAt: '2026-03-20',
    sections: [
      {
        type: 'intro',
        title: 'Was du hier lernst',
        content: 'Du kannst Posts im Content Planner per Drag & Drop zwischen Tagen verschieben. Das Veröffentlichungsdatum wird automatisch angepasst.'
      },
      {
        type: 'steps',
        title: 'Schritt für Schritt',
        steps: [
          {
            title: 'Post greifen',
            description: 'Halte einen Post in der Kalenderansicht gedrückt und ziehe ihn auf den gewünschten Tag.',
          },
          {
            title: 'Ablegen',
            description: 'Lass den Post auf dem Zieltag los. Das Veröffentlichungsdatum wird automatisch auf den neuen Tag gesetzt.',
          }
        ]
      },
      {
        type: 'tips',
        title: 'Tipps & Best Practices',
        items: [
          'Drag & Drop funktioniert in der Wochenansicht am besten.',
          'Die Uhrzeit der Veröffentlichung bleibt beim Verschieben erhalten — nur das Datum ändert sich.',
        ]
      }
    ]
  },
  {
    slug: 'manueller-beitrag',
    title: 'Wie du manuell einen Beitrag im Planner erstellst',
    categorySlug: 'content-planner',
    summary: 'Erstelle eigene Posts direkt im Content Planner — ohne Pulse.',
    tags: ['planner', 'manuell', 'erstellen', 'post', 'beitrag'],
    difficulty: 'beginner',
    relatedArticles: ['beitraege-bearbeiten', 'beitraege-genehmigen', 'medien-hochladen'],
    updatedAt: '2026-03-20',
    sections: [
      {
        type: 'intro',
        title: 'Was du hier lernst',
        content: 'Neben der automatischen Generierung über Pulse kannst du Posts auch manuell im Content Planner erstellen. Manuell erstellte Posts durchlaufen denselben Status-Workflow wie generierte Posts.'
      },
      {
        type: 'steps',
        title: 'Schritt für Schritt',
        steps: [
          {
            title: 'Neuen Post anlegen',
            description: 'Klicke im Kalender auf das „+"-Symbol an einem leeren Tag oder nutze den „Neuer Post"-Button.',
          },
          {
            title: 'Text eingeben',
            description: 'Gib deinen Caption-Text und Hashtags ein.',
          },
          {
            title: 'Plattform und Zeitpunkt wählen',
            description: 'Wähle die Zielplattform und setze Datum und Uhrzeit für die Veröffentlichung.',
          },
          {
            title: 'Medien hinzufügen',
            description: 'Lade ein Bild oder Video hoch, oder wähle eines aus der Mediathek.',
          },
          {
            title: 'Speichern',
            description: 'Speichere den Post. Er erscheint als Entwurf im Kalender und kann dann genehmigt und veröffentlicht werden.',
          }
        ]
      },
      {
        type: 'tips',
        title: 'Tipps & Best Practices',
        items: [
          'Manuelle Posts eignen sich gut für spontane Inhalte, aktuelle Anlässe oder Inhalte, die du nicht per KI generieren möchtest.',
          'Du kannst den „KI Umschreiben"-Button nutzen, um auch manuell geschriebene Texte von der KI verbessern zu lassen.',
        ]
      }
    ]
  },
];

const dashboardArticles: HelpArticle[] = [
  {
    slug: 'dashboard-verstehen',
    title: 'Wie du dein Dashboard liest und verstehst',
    categorySlug: 'dashboard-insights',
    summary: 'Dein Dashboard gibt dir einen schnellen Überblick über deine wichtigsten KPIs und Aktivitäten.',
    tags: ['dashboard', 'kpis', 'überblick', 'performance'],
    difficulty: 'beginner',
    relatedArticles: ['ki-empfehlungen', 'posting-frequenz'],
    updatedAt: '2026-03-20',
    sections: [
      {
        type: 'intro',
        title: 'Was du hier lernst',
        content: 'Das Dashboard zeigt dir auf einen Blick, wie deine Social-Media-Aktivitäten laufen — inklusive KPIs, Aktivitäts-Timeline, KI-Empfehlungen und Aktionsmöglichkeiten.'
      },
      {
        type: 'steps',
        title: 'Bereiche im Dashboard',
        steps: [
          {
            title: 'Briefing-Card',
            description: 'Die Briefing-Card oben zeigt dir die wichtigsten Zahlen: Anzahl geplanter und veröffentlichter Posts, offene Entwürfe und dein Engagement im Vergleich zur Vorwoche.',
          },
          {
            title: 'KPI-Übersicht',
            description: 'Die KPI-Karten zeigen Kernmetriken wie Reichweite, Engagement-Rate und Follower-Entwicklung.',
          },
          {
            title: 'Aktivitäts-Timeline',
            description: 'Die Timeline zeigt deine letzten Aktionen: generierte Posts, Veröffentlichungen und System-Events.',
          },
          {
            title: 'KI-Empfehlungen',
            description: 'Vektrus analysiert deine Daten und gibt dir datenbasierte Empfehlungen zur Optimierung deiner Strategie.',
          }
        ]
      },
      {
        type: 'tips',
        title: 'Tipps & Best Practices',
        items: [
          'Schau regelmäßig auf dein Dashboard, um Trends frühzeitig zu erkennen.',
          'Die KI-Empfehlungen basieren auf deiner echten Performance — nimm sie als Orientierung für deine nächsten Schritte.',
        ]
      }
    ]
  },
  {
    slug: 'ki-empfehlungen',
    title: 'Wie du KI-Empfehlungen für bessere Performance nutzt',
    categorySlug: 'dashboard-insights',
    summary: 'Vektrus analysiert deine Performance und gibt dir konkrete, datenbasierte Empfehlungen.',
    tags: ['insights', 'ki', 'empfehlungen', 'performance', 'optimierung'],
    difficulty: 'intermediate',
    relatedArticles: ['dashboard-verstehen', 'posting-frequenz'],
    updatedAt: '2026-03-20',
    sections: [
      {
        type: 'intro',
        title: 'Was du hier lernst',
        content: 'Vektrus Insights analysiert deine historischen Daten und gibt dir konkrete Empfehlungen: beste Posting-Zeiten, erfolgreiche Formate, optimale Hashtags und Content-Strategien.'
      },
      {
        type: 'steps',
        title: 'So nutzt du die Empfehlungen',
        steps: [
          {
            title: 'Insights öffnen',
            description: 'Navigiere über die Sidebar zu „Insights". Dort findest du eine Übersicht deiner Performance-Daten.',
          },
          {
            title: 'Top Posts analysieren',
            description: 'Sieh dir deine erfolgreichsten Posts an. Was haben sie gemeinsam? Welches Format, welche Uhrzeit, welches Thema?',
          },
          {
            title: 'Empfehlungen umsetzen',
            description: 'Die KI-Empfehlungen erscheinen als konkrete Handlungsvorschläge — z. B. „Poste häufiger am Mittwoch" oder „Nutze mehr Karussell-Posts".',
          },
          {
            title: 'Ergebnisse vergleichen',
            description: 'Vergleiche deine KPIs über Zeiträume hinweg, um zu sehen, ob die Empfehlungen wirken.',
          }
        ]
      },
      {
        type: 'tips',
        title: 'Tipps & Best Practices',
        items: [
          'Die Qualität der Empfehlungen steigt mit der Menge an Daten. Veröffentliche regelmäßig, damit Vektrus aussagekräftige Muster erkennen kann.',
          'Nicht jede Empfehlung muss sofort umgesetzt werden — priorisiere die Vorschläge, die zu deinen aktuellen Zielen passen.',
        ]
      }
    ]
  },
];

const brandStudioArticles: HelpArticle[] = [
  {
    slug: 'brand-studio-einrichten',
    title: 'Wie du dein Markenprofil im Brand Studio einrichtest',
    categorySlug: 'brand-studio',
    summary: 'Das Brand Studio analysiert deine bestehenden Designs und erstellt daraus ein Markenprofil für konsistente Content-Erstellung.',
    tags: ['brand', 'studio', 'markenprofil', 'ci', 'design'],
    difficulty: 'intermediate',
    relatedArticles: ['brand-analyse', 'ci-daten-anpassen', 'pulse-visual'],
    updatedAt: '2026-03-20',
    sections: [
      {
        type: 'intro',
        title: 'Was du hier lernst',
        content: 'Im Brand Studio hinterlegst du dein visuelles Markenprofil. Vektrus nutzt diese Informationen, um generierte Inhalte und Designs an deinen Markenstil anzupassen.'
      },
      {
        type: 'steps',
        title: 'Schritt für Schritt',
        steps: [
          {
            title: 'Brand Studio öffnen',
            description: 'Navigiere über die Sidebar zum „Brand Studio".',
          },
          {
            title: 'Referenz-Designs hochladen',
            description: 'Lade bis zu 10 bestehende Designs hoch — z. B. Social-Media-Posts, Flyer, Visitenkarten oder andere CI-Materialien. Die KI analysiert daraus deinen visuellen Stil.',
          },
          {
            title: 'Optional: Logo hochladen',
            description: 'Lade dein Logo separat hoch. Die Logo-Farben werden priorisiert und überschreiben die aus Designs extrahierten Farbwerte.',
          },
          {
            title: 'Analyse starten',
            description: 'Klicke auf „Analyse starten". Die KI analysiert deine Designs und erstellt ein vollständiges Markenprofil mit Farben, Typografie, Layout-Stil und visueller Identität.',
            note: 'Die Analyse dauert ca. 1–2 Minuten. Du wirst benachrichtigt, sobald sie abgeschlossen ist.'
          },
          {
            title: 'Ergebnis prüfen',
            description: 'Prüfe das erstellte Markenprofil. Du siehst extrahierte Farben, Schriftarten, Layout-Empfehlungen und eine Zusammenfassung deines Markenstils.',
          }
        ]
      },
      {
        type: 'tips',
        title: 'Tipps & Best Practices',
        items: [
          'Je mehr und je konsistentere Referenz-Designs du hochlädst, desto präziser wird das Markenprofil.',
          'Nutze Designs, die deinen aktuellen Stil repräsentieren — nicht veraltete Materialien.',
          'Nach der automatischen Analyse kannst du jederzeit manuelle Anpassungen vornehmen.',
        ]
      }
    ]
  },
  {
    slug: 'brand-analyse',
    title: 'Wie die automatische Brand-Analyse funktioniert',
    categorySlug: 'brand-studio',
    summary: 'Erfahre, was die KI aus deinen Referenz-Designs extrahiert und wie das Markenprofil aufgebaut ist.',
    tags: ['brand', 'analyse', 'ki', 'design-dna', 'farben', 'typografie'],
    difficulty: 'advanced',
    relatedArticles: ['brand-studio-einrichten', 'ci-daten-anpassen'],
    updatedAt: '2026-03-20',
    sections: [
      {
        type: 'intro',
        title: 'Was du hier lernst',
        content: 'Die automatische Brand-Analyse nimmt deine Referenz-Designs und extrahiert daraus ein strukturiertes Markenprofil — mit Farben, Typografie, Layout-Stil, visueller Identität und Tonalität. Hier erfährst du, was die KI genau analysiert und wie die Ergebnisse verwendet werden.'
      },
      {
        type: 'steps',
        title: 'Was die KI analysiert',
        steps: [
          {
            title: 'Farben',
            description: 'Primärfarbe, Sekundärfarbe, Akzentfarbe, Hintergrund und Textfarbe werden als exakte Hex-Codes extrahiert.',
          },
          {
            title: 'Typografie',
            description: 'Überschriften- und Fließtext-Stile, geschätzte Schriftarten und die Beschreibung der Text-Hierarchie.',
          },
          {
            title: 'Layout',
            description: 'Bevorzugte Komposition (zentral, asymmetrisch, grid-basiert), Whitespace-Level und typische Platzierung von Text, Bild und Logo.',
          },
          {
            title: 'Visueller Stil',
            description: 'Gesamtstimmung, Bildbehandlung, wiederkehrende Effekte (Schatten, Verläufe, Overlays) und Fotografie-Stil.',
          },
          {
            title: 'Design-DNA-Synthese',
            description: 'Alle Einzelanalysen werden zu einer konsolidierten „Design-DNA" zusammengeführt. Gemeinsamkeiten werden priorisiert, Ausreißer ignoriert.',
          }
        ]
      },
      {
        type: 'tips',
        title: 'Tipps & Best Practices',
        items: [
          'Lade mindestens 3–5 konsistente Designs hoch, damit die Synthese aussagekräftig ist.',
          'Wenn du ein Logo hochlädst, überschreiben die Logo-Farben die aus Designs extrahierten Werte — das ist beabsichtigt und sorgt für präzisere Ergebnisse.',
          'Das Markenprofil wird für Pulse Visual, Pulse Standard (Premium-Bilder) und zukünftige Design-Features verwendet.',
        ]
      }
    ]
  },
  {
    slug: 'ci-daten-anpassen',
    title: 'Wie du CI-Daten manuell ergänzt oder überschreibst',
    categorySlug: 'brand-studio',
    summary: 'Manuelle CI-Eingaben haben Vorrang vor automatisch extrahierten Werten.',
    tags: ['brand', 'ci', 'manuell', 'farben', 'fonts', 'anpassen'],
    difficulty: 'intermediate',
    relatedArticles: ['brand-studio-einrichten', 'brand-analyse'],
    updatedAt: '2026-03-20',
    sections: [
      {
        type: 'intro',
        title: 'Was du hier lernst',
        content: 'Die automatische Analyse erstellt ein Markenprofil aus deinen Designs. Du kannst diese Werte jederzeit manuell ergänzen oder überschreiben — z. B. exakte Markenfarben, Schriftarten oder Tonalitäts-Einstellungen. Manuelle Eingaben haben immer Vorrang.'
      },
      {
        type: 'steps',
        title: 'Schritt für Schritt',
        steps: [
          {
            title: 'Brand Studio öffnen',
            description: 'Gehe zum Brand Studio und öffne dein bestehendes Markenprofil.',
          },
          {
            title: 'Werte anpassen',
            description: 'Klicke auf die Bereiche, die du ändern möchtest: Farben, Schriftarten, Tonalität oder Slogan. Gib deine gewünschten Werte ein.',
          },
          {
            title: 'Speichern',
            description: 'Speichere deine Änderungen. Die manuellen Werte überschreiben ab sofort die automatisch extrahierten Werte für alle zukünftigen Generierungen.',
          }
        ]
      },
      {
        type: 'tips',
        title: 'Tipps & Best Practices',
        items: [
          'Nutze die manuelle Eingabe, wenn dein Brand-Handbuch exakte Hex-Codes für Farben oder spezifische Schriftarten vorschreibt.',
          'Du kannst die Tonalität unabhängig von den visuellen Werten anpassen — z. B. „Du-Ansprache" und „locker-professionell".',
          'Eine neue automatische Analyse überschreibt deine manuellen Werte nicht — sie werden getrennt gespeichert und priorisiert.',
        ]
      }
    ]
  },
];

const mediaArticles: HelpArticle[] = [
  {
    slug: 'medien-hochladen',
    title: 'Wie du Medien hochlädst und organisierst',
    categorySlug: 'media-vision',
    summary: 'Lade Bilder und Videos in die Mediathek hoch und organisiere sie mit Tags und Favoriten.',
    tags: ['media', 'mediathek', 'hochladen', 'bilder', 'videos', 'organisation'],
    difficulty: 'beginner',
    relatedArticles: ['ki-bilder-generieren', 'vision-projekt'],
    updatedAt: '2026-03-20',
    sections: [
      {
        type: 'intro',
        title: 'Was du hier lernst',
        content: 'Die Mediathek ist deine zentrale Anlaufstelle für alle Bilder und Videos. Hier lädst du Dateien hoch, organisierst sie mit Tags und Favoriten und greifst im Planner oder bei der Post-Erstellung darauf zu.'
      },
      {
        type: 'steps',
        title: 'Schritt für Schritt',
        steps: [
          {
            title: 'Mediathek öffnen',
            description: 'Navigiere über die Sidebar zu „Media".',
          },
          {
            title: 'Dateien hochladen',
            description: 'Klicke auf „Hochladen" und wähle Bilder oder Videos von deinem Gerät aus. Unterstützte Formate: JPG, PNG, GIF, MP4, MOV, WebM (Videos bis 100 MB).',
          },
          {
            title: 'Tags vergeben',
            description: 'Vergib Tags, um deine Medien zu kategorisieren — z. B. „produkt", „team", „event". Tags erleichtern das spätere Wiederfinden.',
          },
          {
            title: 'Favoriten markieren',
            description: 'Markiere häufig genutzte Medien als Favoriten, um sie schnell wiederzufinden.',
          }
        ]
      },
      {
        type: 'tips',
        title: 'Tipps & Best Practices',
        items: [
          'Verwende aussagekräftige Tags — du wirst sie beim Zuweisen von Medien zu Posts nutzen.',
          'KI-generierte Bilder werden automatisch als solche markiert.',
          'Du kannst Medien direkt im Content Planner beim Bearbeiten eines Posts aus der Mediathek auswählen.',
        ]
      }
    ]
  },
  {
    slug: 'ki-bilder-generieren',
    title: 'Wie du KI-Bilder in der Mediathek generierst',
    categorySlug: 'media-vision',
    summary: 'Erstelle mit der KI passende Bilder für deine Social-Media-Posts.',
    tags: ['media', 'ki', 'bilder', 'generierung', 'design'],
    difficulty: 'intermediate',
    relatedArticles: ['medien-hochladen', 'pulse-visual', 'brand-studio-einrichten'],
    updatedAt: '2026-03-20',
    sections: [
      {
        type: 'intro',
        title: 'Was du hier lernst',
        content: 'In der Mediathek kannst du mit der KI Bilder generieren — entweder aus einer Textbeschreibung oder basierend auf einem Inspirationsbild. Die generierten Bilder landen direkt in deiner Mediathek und können für Posts verwendet werden.'
      },
      {
        type: 'steps',
        title: 'Schritt für Schritt',
        steps: [
          {
            title: 'KI-Bildgenerierung öffnen',
            description: 'Gehe zur Mediathek und klicke auf „KI-Bild generieren".',
          },
          {
            title: 'Beschreibung eingeben',
            description: 'Beschreibe das gewünschte Bild — z. B. „Modernes Büro mit Team bei einer Besprechung, helle Farben, professionell".',
          },
          {
            title: 'Generierung starten',
            description: 'Klicke auf „Generieren". Das Bild wird in wenigen Sekunden erstellt und erscheint in deiner Mediathek.',
          }
        ]
      },
      {
        type: 'tips',
        title: 'Tipps & Best Practices',
        items: [
          'Je detaillierter deine Beschreibung, desto besser das Ergebnis.',
          'Nutze Pulse Visual für Bilder, die zu bestimmten Posts passen sollen — dort wird der Kontext automatisch berücksichtigt.',
          'KI-generierte Bilder werden in der Mediathek automatisch als „KI-generiert" markiert.',
        ]
      }
    ]
  },
  {
    slug: 'vision-projekt',
    title: 'Wie du ein Vision-Projekt erstellst',
    categorySlug: 'media-vision',
    summary: 'Nutze Vision, um visuelle Konzepte und Design-Ideen mit KI zu entwickeln.',
    tags: ['vision', 'projekt', 'design', 'ki', 'konzept'],
    difficulty: 'intermediate',
    relatedArticles: ['medien-hochladen', 'ki-bilder-generieren'],
    updatedAt: '2026-03-20',
    sections: [
      {
        type: 'intro',
        title: 'Was du hier lernst',
        content: 'Vision ist das Modul für visuelle Kreativprojekte. Erstelle Design-Konzepte, visuelle Ideen und KI-generierte Bildserien für deine Marke.'
      },
      {
        type: 'steps',
        title: 'Schritt für Schritt',
        steps: [
          {
            title: 'Vision öffnen',
            description: 'Navigiere über die Sidebar zu „Vision".',
          },
          {
            title: 'Neues Projekt anlegen',
            description: 'Klicke auf „Neues Projekt" und gib einen Titel und eine Beschreibung für dein visuelles Konzept ein.',
          },
          {
            title: 'Bilder generieren',
            description: 'Beschreibe deine visuelle Idee und lass die KI Bilder dazu erstellen. Du kannst mehrere Varianten generieren und vergleichen.',
          },
          {
            title: 'Ergebnisse verwenden',
            description: 'Speichere die besten Ergebnisse in deiner Mediathek oder verwende sie direkt für Posts.',
          }
        ]
      },
      {
        type: 'tips',
        title: 'Tipps & Best Practices',
        items: [
          'Vision eignet sich gut für die Entwicklung visueller Konzepte und Serien.',
          'Speichere gelungene Ergebnisse in der Mediathek, um sie später in Posts zu verwenden.',
        ]
      }
    ]
  },
];

const integrationenArticles: HelpArticle[] = [
  {
    slug: 'instagram-verbinden',
    title: 'Wie du Instagram mit Vektrus verbindest',
    categorySlug: 'integrationen',
    summary: 'Schritt-für-Schritt-Anleitung zur Verbindung deines Instagram Business-Accounts.',
    tags: ['instagram', 'verbinden', 'integration', 'social', 'business'],
    difficulty: 'beginner',
    relatedArticles: ['linkedin-verbinden', 'mehrere-plattformen', 'social-account-verbinden'],
    updatedAt: '2026-03-20',
    sections: [
      {
        type: 'intro',
        title: 'Was du hier lernst',
        content: 'Du erfährst, wie du deinen Instagram Business- oder Creator-Account mit Vektrus verknüpfst, damit du Posts direkt aus Vektrus veröffentlichen kannst.'
      },
      {
        type: 'prerequisites',
        title: 'Voraussetzungen',
        items: [
          'Du benötigst einen Instagram Business- oder Creator-Account (kein privater Account).',
          'Dein Instagram-Account muss mit einer Facebook-Seite verknüpft sein.',
        ]
      },
      {
        type: 'steps',
        title: 'Schritt für Schritt',
        steps: [
          {
            title: 'Konten-Bereich öffnen',
            description: 'Gehe zu Einstellungen → Social-Konten.',
          },
          {
            title: 'Instagram auswählen',
            description: 'Klicke bei Instagram auf „Verbinden".',
          },
          {
            title: 'Facebook-Anmeldung',
            description: 'Du wirst zu Facebook weitergeleitet (Instagram nutzt die Facebook/Meta-API). Melde dich an und wähle die Facebook-Seite, die mit deinem Instagram-Account verknüpft ist.',
          },
          {
            title: 'Berechtigungen erteilen',
            description: 'Erteile Vektrus die erforderlichen Berechtigungen zum Posten und Lesen von Insights.',
          },
          {
            title: 'Verbindung bestätigen',
            description: 'Nach erfolgreicher Autorisierung siehst du deinen Instagram-Account in der Kontenübersicht.',
          }
        ]
      },
      {
        type: 'pitfalls',
        title: 'Häufige Fehler',
        items: [
          'Privater Instagram-Account — wechsle in den Instagram-Einstellungen zu einem Business- oder Creator-Account.',
          'Keine Facebook-Seiten-Verknüpfung — verbinde deinen Instagram-Account zuerst in den Instagram-Einstellungen mit einer Facebook-Seite.',
          'Falsche Facebook-Seite ausgewählt — stelle sicher, dass die richtige Seite markiert ist.',
        ]
      }
    ]
  },
  {
    slug: 'linkedin-verbinden',
    title: 'Wie du LinkedIn mit Vektrus verbindest',
    categorySlug: 'integrationen',
    summary: 'Verbinde dein LinkedIn-Profil oder deine Unternehmensseite mit Vektrus.',
    tags: ['linkedin', 'verbinden', 'integration', 'social'],
    difficulty: 'beginner',
    relatedArticles: ['instagram-verbinden', 'mehrere-plattformen'],
    updatedAt: '2026-03-20',
    sections: [
      {
        type: 'intro',
        title: 'Was du hier lernst',
        content: 'Verbinde dein LinkedIn-Profil oder deine LinkedIn-Unternehmensseite mit Vektrus, um Posts direkt aus der Plattform zu veröffentlichen.'
      },
      {
        type: 'steps',
        title: 'Schritt für Schritt',
        steps: [
          {
            title: 'Konten-Bereich öffnen',
            description: 'Gehe zu Einstellungen → Social-Konten.',
          },
          {
            title: 'LinkedIn auswählen',
            description: 'Klicke bei LinkedIn auf „Verbinden".',
          },
          {
            title: 'LinkedIn-Anmeldung',
            description: 'Du wirst zu LinkedIn weitergeleitet. Melde dich an und erteile Vektrus die erforderlichen Berechtigungen.',
          },
          {
            title: 'Verbindung bestätigen',
            description: 'Nach erfolgreicher Autorisierung siehst du deinen LinkedIn-Account in der Kontenübersicht.',
          }
        ]
      },
      {
        type: 'tips',
        title: 'Tipps & Best Practices',
        items: [
          'Für Unternehmensseiten benötigst du Admin-Rechte auf der jeweiligen LinkedIn-Seite.',
          'LinkedIn erlaubt sowohl persönliche Profile als auch Unternehmensseiten — wähle das passende Konto.',
        ]
      }
    ]
  },
  {
    slug: 'mehrere-plattformen',
    title: 'Wie du mehrere Plattformen gleichzeitig verwaltest',
    categorySlug: 'integrationen',
    summary: 'Verwalte alle verbundenen Plattformen zentral und plane plattformübergreifend.',
    tags: ['plattformen', 'multi-platform', 'verwalten', 'überblick'],
    difficulty: 'intermediate',
    relatedArticles: ['instagram-verbinden', 'linkedin-verbinden', 'beitraege-bearbeiten'],
    updatedAt: '2026-03-20',
    sections: [
      {
        type: 'intro',
        title: 'Was du hier lernst',
        content: 'Wenn du mehrere Plattformen verbunden hast, kannst du in Vektrus plattformübergreifend planen und veröffentlichen. Hier erfährst du, wie du den Überblick behältst.'
      },
      {
        type: 'steps',
        title: 'So verwaltest du mehrere Plattformen',
        steps: [
          {
            title: 'Plattform-Filter nutzen',
            description: 'Im Content Planner kannst du Plattform-Filter setzen, um nur Posts für eine bestimmte Plattform anzuzeigen — z. B. nur Instagram oder nur LinkedIn.',
          },
          {
            title: 'Pulse für mehrere Plattformen nutzen',
            description: 'Im Pulse-Wizard wählst du alle gewünschten Plattformen aus. Pulse erstellt dann für jede Plattform optimierte Posts mit angepasstem Stil und Format.',
          },
          {
            title: 'Konten prüfen',
            description: 'Prüfe regelmäßig unter Einstellungen → Social-Konten, ob alle Verbindungen aktiv sind.',
          }
        ]
      },
      {
        type: 'tips',
        title: 'Tipps & Best Practices',
        items: [
          'Nicht jede Plattform braucht denselben Content. Nutze Pulse, um plattformspezifische Texte generieren zu lassen.',
          'Die Monatsansicht im Planner gibt dir den besten Überblick über deine plattformübergreifende Content-Verteilung.',
        ]
      }
    ]
  },
];

const kontoArticles: HelpArticle[] = [
  {
    slug: 'abo-verwalten',
    title: 'Wie du dein Abo verwaltest oder kündigst',
    categorySlug: 'konto',
    summary: 'Verwalte deinen Vektrus-Plan, ändere dein Abo oder kündige es.',
    tags: ['abo', 'plan', 'kündigung', 'billing', 'abrechnung'],
    difficulty: 'beginner',
    relatedArticles: ['passwort-aendern'],
    updatedAt: '2026-03-20',
    sections: [
      {
        type: 'intro',
        title: 'Was du hier lernst',
        content: 'Hier erfährst du, wie du deinen aktuellen Plan einsehen, dein Abo upgraden oder downgraden und bei Bedarf kündigen kannst.'
      },
      {
        type: 'steps',
        title: 'Schritt für Schritt',
        steps: [
          {
            title: 'Abrechnung öffnen',
            description: 'Gehe zu Einstellungen → Plan & Abrechnung. Dort siehst du deinen aktuellen Plan und deine Rechnungshistorie.',
          },
          {
            title: 'Plan ändern',
            description: 'Klicke auf „Plan ändern", um ein Upgrade oder Downgrade vorzunehmen. Änderungen werden zum nächsten Abrechnungszeitraum wirksam.',
          },
          {
            title: 'Abo kündigen',
            description: 'Klicke auf „Abo verwalten" → „Kündigen". Die Kündigung wird zum Ende der aktuellen Abrechnungsperiode wirksam. Du behältst bis dahin vollen Zugriff.',
          }
        ]
      },
      {
        type: 'tips',
        title: 'Tipps & Best Practices',
        items: [
          'Es gibt keine Mindestvertragslaufzeit — du kannst jederzeit kündigen.',
          'Nach einer Kündigung kannst du dein Abo jederzeit wieder aktivieren.',
        ]
      }
    ]
  },
  {
    slug: 'passwort-aendern',
    title: 'Wie du dein Passwort oder deine E-Mail änderst',
    categorySlug: 'konto',
    summary: 'Informationen zur Passwort- und E-Mail-Verwaltung in Vektrus.',
    tags: ['passwort', 'e-mail', 'sicherheit', 'konto', 'einstellungen'],
    difficulty: 'beginner',
    relatedArticles: ['abo-verwalten'],
    updatedAt: '2026-03-22',
    sections: [
      {
        type: 'intro',
        title: 'Was du hier lernst',
        content: 'Hier findest du Informationen zur Verwaltung deines Passworts und deiner E-Mail-Adresse.'
      },
      {
        type: 'steps',
        title: 'So gehst du vor',
        steps: [
          {
            title: 'Einstellungen öffnen',
            description: 'Gehe zu Einstellungen → Datenschutz & Sicherheit.',
          },
          {
            title: 'Passwort ändern',
            description: 'Die Passwortänderung direkt in den Einstellungen wird in einer kommenden Version verfügbar sein. Aktuell kannst du dein Passwort über die „Passwort vergessen"-Funktion auf der Login-Seite zurücksetzen.',
          },
          {
            title: 'Passwort zurücksetzen',
            description: 'Klicke auf der Login-Seite auf „Passwort vergessen". Du erhältst eine E-Mail mit einem Link zum Zurücksetzen deines Passworts.',
          }
        ]
      },
      {
        type: 'tips',
        title: 'Tipps & Best Practices',
        items: [
          'Nutze ein sicheres Passwort mit mindestens 8 Zeichen, Groß- und Kleinbuchstaben sowie Sonderzeichen.',
          'Prüfe deinen Spam-Ordner, falls die E-Mail zum Zurücksetzen nicht ankommt.',
        ]
      }
    ]
  },
];

const strategieArticles: HelpArticle[] = [
  {
    slug: 'posting-frequenz',
    title: 'Wie du die beste Posting-Frequenz für dein Unternehmen findest',
    categorySlug: 'strategie',
    summary: 'Finde heraus, wie oft du auf welcher Plattform posten solltest, um maximale Wirkung zu erzielen.',
    tags: ['strategie', 'frequenz', 'posting', 'best-practice', 'planung'],
    difficulty: 'intermediate',
    relatedArticles: ['ki-empfehlungen', 'chat-strategien', 'dashboard-verstehen'],
    updatedAt: '2026-03-20',
    sections: [
      {
        type: 'intro',
        title: 'Was du hier lernst',
        content: 'Die richtige Posting-Frequenz hängt von deiner Branche, deiner Zielgruppe und deinen Ressourcen ab. Hier erfährst du, wie du die passende Frequenz findest und Vektrus dafür nutzt.'
      },
      {
        type: 'steps',
        title: 'So findest du deine optimale Frequenz',
        steps: [
          {
            title: 'Plattform-Empfehlungen kennen',
            description: 'Instagram: 3–5 Posts pro Woche. LinkedIn: 2–3 Posts pro Woche. Facebook: 3–5 Posts pro Woche. TikTok: 3–7 Posts pro Woche. Diese Werte sind Richtwerte — deine optimale Frequenz kann abweichen.',
          },
          {
            title: 'Insights nutzen',
            description: 'Schau in deine Vektrus Insights: Welche Posting-Zeiten und -Frequenzen bringen die beste Performance? Die KI-Empfehlungen geben dir hier konkrete Hinweise.',
          },
          {
            title: 'Pulse entsprechend konfigurieren',
            description: 'Im Pulse-Wizard stellst du die Posting-Frequenz pro Plattform ein. Starte konservativ und steigere, wenn du siehst, dass dein Content gut performt.',
          },
          {
            title: 'Regelmäßig prüfen',
            description: 'Prüfe alle 2–4 Wochen in den Insights, ob die aktuelle Frequenz zu deiner Performance passt.',
          }
        ]
      },
      {
        type: 'tips',
        title: 'Tipps & Best Practices',
        items: [
          'Konsistenz ist wichtiger als Häufigkeit. Lieber 3 gute Posts pro Woche als 7 mittelmäßige.',
          'Nutze Pulse Auto, um eine konsistente Posting-Frequenz ohne manuellen Aufwand aufrechtzuerhalten.',
          'Beobachte, wie dein Engagement auf Frequenzänderungen reagiert.',
        ]
      }
    ]
  },
  {
    slug: 'chat-strategien',
    title: 'Wie du den Vektrus Chat für Content-Strategien nutzt',
    categorySlug: 'strategie',
    summary: 'Der Vektrus Chat ist dein KI-Assistent für Strategie-Fragen, Content-Ideen und Empfehlungen.',
    tags: ['chat', 'strategie', 'ki', 'ideen', 'empfehlungen', 'assistent'],
    difficulty: 'intermediate',
    relatedArticles: ['posting-frequenz', 'ki-empfehlungen'],
    updatedAt: '2026-03-20',
    sections: [
      {
        type: 'intro',
        title: 'Was du hier lernst',
        content: 'Der Vektrus Chat ist mehr als eine einfache Frage-Antwort-Funktion. Nutze ihn als strategischen Sparringspartner für Content-Ideen, Zielgruppen-Fragen und Strategie-Empfehlungen. Antworten können direkt als Grundlage für Posts übernommen werden.'
      },
      {
        type: 'steps',
        title: 'So nutzt du den Chat effektiv',
        steps: [
          {
            title: 'Chat öffnen',
            description: 'Navigiere über die Sidebar zum Vektrus Chat.',
          },
          {
            title: 'Fragen stellen',
            description: 'Stelle konkrete Fragen — z. B. „Welche Content-Themen passen zu meinem Unternehmen im März?" oder „Wie kann ich mein LinkedIn-Engagement steigern?".',
          },
          {
            title: 'Antworten als Grundlage übernehmen',
            description: 'Wenn der Chat eine sozial relevante Antwort gibt, kannst du sie über „Als Grundlage öffnen" direkt in den Content Planner übernehmen. Der Composer öffnet sich mit der Antwort als Ausgangsmaterial.',
          },
          {
            title: 'Posts aus dem Chat erstellen',
            description: 'Wenn der Chat einen konkreten Post-Vorschlag macht, kannst du ihn über „Als Post übernehmen" direkt in den Planner übertragen — inklusive Text und Hashtags.',
          }
        ]
      },
      {
        type: 'tips',
        title: 'Tipps & Best Practices',
        items: [
          'Je konkreter deine Frage, desto nützlicher die Antwort.',
          'Nutze den Chat für Brainstorming — er kennt dein Unternehmensprofil und kann darauf aufbauen.',
          'Du kannst im Chat auch nach Feedback zu bestehenden Texten fragen, z. B. „Wie kann ich diesen Text für LinkedIn verbessern?".',
        ]
      }
    ]
  },
];

// ─── Kategorien ─────────────────────────────────────────────────────────────

export const helpCategories: HelpCategory[] = [
  {
    slug: 'erste-schritte',
    title: 'Erste Schritte',
    description: 'Konto einrichten, Profil vervollständigen und erste Accounts verbinden.',
    iconName: 'Rocket',
    articles: ersteSchritteArticles,
  },
  {
    slug: 'pulse',
    title: 'Pulse',
    description: 'Content generieren mit Pulse Standard, Visual und Auto.',
    iconName: 'Zap',
    articles: pulseArticles,
  },
  {
    slug: 'content-planner',
    title: 'Content Planner',
    description: 'Beiträge bearbeiten, planen, genehmigen und veröffentlichen.',
    iconName: 'Calendar',
    articles: plannerArticles,
  },
  {
    slug: 'dashboard-insights',
    title: 'Dashboard & Insights',
    description: 'KPIs verstehen und KI-Empfehlungen für bessere Performance nutzen.',
    iconName: 'BarChart3',
    articles: dashboardArticles,
  },
  {
    slug: 'brand-studio',
    title: 'Brand Studio',
    description: 'Markenprofil einrichten, Brand-Analyse nutzen und CI-Daten verwalten.',
    iconName: 'Palette',
    articles: brandStudioArticles,
  },
  {
    slug: 'media-vision',
    title: 'Media & Vision',
    description: 'Mediathek verwalten, KI-Bilder generieren und Vision-Projekte erstellen.',
    iconName: 'Image',
    articles: mediaArticles,
  },
  {
    slug: 'integrationen',
    title: 'Integrationen & Social-Konten',
    description: 'Social-Media-Plattformen verbinden und plattformübergreifend arbeiten.',
    iconName: 'Link',
    articles: integrationenArticles,
  },
  {
    slug: 'konto',
    title: 'Konto, Plan & Abrechnung',
    description: 'Abo verwalten, Einstellungen ändern und Kontodaten aktualisieren.',
    iconName: 'CreditCard',
    articles: kontoArticles,
  },
  {
    slug: 'strategie',
    title: 'Strategie & Best Practices',
    description: 'Posting-Frequenz optimieren und den Chat als Strategieberater nutzen.',
    iconName: 'Lightbulb',
    articles: strategieArticles,
  },
];

// ─── Lookup-Helfer ──────────────────────────────────────────────────────────

export function getCategoryBySlug(slug: string): HelpCategory | undefined {
  return helpCategories.find(c => c.slug === slug);
}

export function getArticleBySlug(categorySlug: string, articleSlug: string): HelpArticle | undefined {
  const category = getCategoryBySlug(categorySlug);
  return category?.articles.find(a => a.slug === articleSlug);
}

export function getAllArticles(): HelpArticle[] {
  return helpCategories.flatMap(c => c.articles);
}

export function getPopularArticles(): HelpArticle[] {
  return [
    getArticleBySlug('erste-schritte', 'social-account-verbinden')!,
    getArticleBySlug('pulse', 'erste-woche-mit-pulse')!,
    getArticleBySlug('content-planner', 'beitraege-genehmigen')!,
    getArticleBySlug('brand-studio', 'brand-studio-einrichten')!,
    getArticleBySlug('strategie', 'chat-strategien')!,
    getArticleBySlug('integrationen', 'instagram-verbinden')!,
  ].filter(Boolean);
}

export function searchArticles(query: string): HelpArticle[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return getAllArticles().filter(article =>
    article.title.toLowerCase().includes(q) ||
    article.summary.toLowerCase().includes(q) ||
    article.tags.some(tag => tag.includes(q))
  );
}

export function getRelatedArticles(article: HelpArticle): HelpArticle[] {
  const all = getAllArticles();
  return article.relatedArticles
    .map(slug => all.find(a => a.slug === slug))
    .filter(Boolean) as HelpArticle[];
}
