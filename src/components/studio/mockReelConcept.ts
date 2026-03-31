import type { ReelContent } from '../../services/reelService';

export const mockReelConcept: ReelContent = {
  type: 'reel',
  format: 'talking_head',
  title: 'Warum 90 % aller Küchen falsch geplant werden',
  hook: {
    text: 'Die meisten Küchen sehen gut aus — aber funktionieren nicht.',
    type: 'widerspruch',
    delivery: 'gesprochen',
  },
  scenes: [
    {
      nr: 1,
      action:
        'Du stehst in einer fertigen Küche und zeigst direkt in die Kamera. Du sagst den Hook-Satz mit ruhiger Überzeugung.',
      duration_seconds: 4,
      camera: 'frontal_selfie',
      tip: 'Blickkontakt halten, nicht lächeln — der Satz soll provozieren.',
      text_overlay: 'Die meisten Küchen funktionieren NICHT.',
    },
    {
      nr: 2,
      action:
        'Zeige das "Arbeitsdreieck" — Herd, Spüle, Kühlschrank. Erkläre, warum 80 % der Küchen das falsch haben und was das im Alltag bedeutet.',
      duration_seconds: 8,
      camera: 'frontal_selfie',
      tip: 'Nutze Handgesten, um das Dreieck zu zeigen. Sprich langsam und klar.',
      text_overlay: '→ Herd – Spüle – Kühlschrank',
    },
    {
      nr: 3,
      action:
        'Zeige ein konkretes Vorher/Nachher-Beispiel aus einem echten Projekt. Wische visuell von der alten zur neuen Planung.',
      duration_seconds: 6,
      camera: 'detail_nahaufnahme',
      tip: 'Falls möglich, nutze echte Planungsbilder oder eine 3D-Ansicht.',
      text_overlay: null,
    },
    {
      nr: 4,
      action:
        'Call-to-Action: "Schreib mir KÜCHE in die Kommentare und ich checke deine Planung kostenlos."',
      duration_seconds: 4,
      camera: 'frontal_selfie',
      tip: 'Lächle hier — der CTA soll einladend wirken, nicht fordernd.',
      text_overlay: 'Schreib KÜCHE → kostenloser Check',
    },
  ],
  total_duration_seconds: 22,
  voiceover_script:
    'Die meisten Küchen sehen gut aus — aber funktionieren nicht. Der Grund: Das Arbeitsdreieck stimmt nicht. Herd, Spüle und Kühlschrank müssen in der richtigen Distanz zueinander stehen, sonst läufst du jeden Tag Hunderte Meter extra. Hier ein echtes Beispiel aus meiner Werkstatt — vorher und nachher. Der Unterschied? Nur 20 Zentimeter Verschiebung, aber komplett anderes Kochgefühl. Willst du wissen, ob deine Küche richtig geplant ist? Schreib mir KÜCHE in die Kommentare.',
  audio_suggestion: {
    type: 'ambient',
    note: 'Ruhiger, moderner Lo-Fi Beat. Kein Vocal-Track — lenkt vom Gesprochenen ab.',
  },
  caption:
    '90 % aller Küchen haben das gleiche Problem: Das Arbeitsdreieck stimmt nicht. 🔺 Herd, Spüle, Kühlschrank — wenn die Abstände nicht passen, wird Kochen zur Laufstrecke. Ich zeig dir, worauf es wirklich ankommt. 👇',
  hashtags: [
    '#küche',
    '#küchenplanung',
    '#küchenbauer',
    '#arbeitsdreieck',
    '#küchendesign',
    '#handwerk',
    '#vorher_nachher',
  ],
  why_it_works:
    'Der Hook nutzt den Widerspruch zwischen Ästhetik und Funktion — ein Pattern, das sofort Neugier erzeugt. Das Arbeitsdreieck ist ein Fachbegriff, der Autorität signalisiert, aber einfach genug ist, damit ihn jeder versteht. Der CTA am Ende gibt dem Zuschauer eine niedrigschwellige Handlungsoption.',
  difficulty: 'einfach',
  estimated_effort: '30–45 Min',
  needs_face: true,
  content_type: 'reel',
  reasoning:
    'Talking-Head-Format passt perfekt für Expertenwissen im Handwerk. Die Kombination aus provokativem Hook und konkretem Fachwissen positioniert den Küchenbauer als Autorität.',
};
