import React from 'react';
import {
  AlertTriangle,
  Trophy,
  ArrowRight,
  Sparkles,
  Zap,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { BriefingData, DashboardData } from '../../hooks/useDashboardData';

/* ================================================================
   Insight types
   ================================================================ */

interface Insight {
  type: 'warning' | 'winner' | 'next-step';
  icon: React.FC<{ size?: number; strokeWidth?: number; className?: string }>;
  title: string;
  text: string;
  cta: { label: string; route: string };
}

/* ================================================================
   Derivation logic — builds up to 3 insights from existing data
   ================================================================ */

function deriveInsights(data: DashboardData): Insight[] {
  const { briefing, nextSteps } = data;
  const insights: Insight[] = [];

  /* ── 1. Warning / Gap ────────────────────────────────────────── */
  insights.push(deriveWarning(briefing, nextSteps));

  /* ── 2. Winner / Success ─────────────────────────────────────── */
  insights.push(deriveWinner(briefing));

  /* ── 3. Strategic Next Step ──────────────────────────────────── */
  insights.push(deriveNextStep(briefing, nextSteps));

  return insights;
}

function deriveWarning(
  briefing: BriefingData,
  _nextSteps: DashboardData['nextSteps'],
): Insight {
  // Status is "attention" → real warning, direct the user to see what happened
  if (briefing.status === 'attention') {
    return {
      type: 'warning',
      icon: AlertTriangle,
      title: 'Performance prüfen',
      text: 'Deine Werte zeigen Rückgänge. Sieh dir die Details an und passe deinen Plan an.',
      cta: { label: 'Analyse öffnen', route: '/insights' },
    };
  }

  // Reach trending down → get them to act
  if (briefing.kpis.reach.direction === 'down') {
    return {
      type: 'warning',
      icon: AlertTriangle,
      title: 'Reichweite sinkt',
      text: 'Deine Sichtbarkeit ist rückläufig. Neuer Content kann den Trend umkehren.',
      cta: { label: 'Content erstellen', route: '/pulse' },
    };
  }

  // No posts this week → clear gap
  if (briefing.kpis.posts.value === '0') {
    return {
      type: 'warning',
      icon: AlertTriangle,
      title: 'Noch keine Posts',
      text: 'Diese Woche ist dein Kalender leer. Regelmäßigkeit hält deine Reichweite stabil.',
      cta: { label: 'Woche füllen', route: '/pulse' },
    };
  }

  // Nothing wrong → reframe as a planning check-in (not a warning)
  return {
    type: 'warning',
    icon: Calendar,
    title: 'Nächste Woche planen',
    text: 'Dein Content läuft. Bereite jetzt die kommende Woche vor.',
    cta: { label: 'Planer öffnen', route: '/planner' },
  };
}

function deriveWinner(briefing: BriefingData): Insight {
  const bp = briefing.bestPlatform;

  // Best platform with ER data → actionable: create more content for that channel
  const erValue = bp.er ? bp.er.replace(/%$/, '') : '';
  if (bp.name !== '\u2013' && bp.er) {
    return {
      type: 'winner',
      icon: Trophy,
      title: `${bp.name}: ${erValue}% Engagement`,
      text: `Dein stärkster Kanal diese Woche. Setze hier weiter auf Content.`,
      cta: { label: 'Mehr Content planen', route: '/pulse' },
    };
  }

  // Engagement trending up → keep momentum
  if (briefing.kpis.engagement.direction === 'up') {
    return {
      type: 'winner',
      icon: Trophy,
      title: 'Engagement wächst',
      text: `Dein Engagement steigt${briefing.kpis.engagement.trend ? ` (${briefing.kpis.engagement.trend})` : ''}. Halte das Tempo.`,
      cta: { label: 'Nächste Posts planen', route: '/planner' },
    };
  }

  // No win to celebrate yet → honest framing, not fake positivity
  return {
    type: 'winner',
    icon: BarChart3,
    title: 'Daten sammeln',
    text: 'Veröffentliche regelmäßig, damit Vektrus deine beste Strategie erkennen kann.',
    cta: { label: 'Content erstellen', route: '/pulse' },
  };
}

function deriveNextStep(
  briefing: BriefingData,
  nextSteps: DashboardData['nextSteps'],
): Insight {
  // Empty state: no posts at all → strong onboarding prompt
  if (briefing.kpis.posts.value === '0' && briefing.kpis.reach.value === '\u2013') {
    return {
      type: 'next-step',
      icon: Sparkles,
      title: 'Ersten Content-Plan erstellen',
      text: 'Die KI erstellt dir einen kompletten Wochenplan in unter 5 Minuten.',
      cta: { label: 'Jetzt starten', route: '/pulse' },
    };
  }

  // Has posts but nothing planned → refill
  if (briefing.kpis.posts.value === '0') {
    return {
      type: 'next-step',
      icon: Zap,
      title: 'Neue Woche füllen',
      text: 'Dein Kalender ist leer. Lass Pulse die nächsten Posts generieren.',
      cta: { label: 'Pulse starten', route: '/pulse' },
    };
  }

  // Has pipeline → nudge to review
  const primary = nextSteps[0];
  if (primary && primary.route === '/pulse' && primary.description.includes('Pipeline')) {
    return {
      type: 'next-step',
      icon: Calendar,
      title: 'Entwürfe prüfen',
      text: primary.description.replace('Posts in der Pipeline', 'Entwürfe warten auf deine Freigabe.'),
      cta: { label: 'Planer öffnen', route: '/planner' },
    };
  }

  // Default: generate more content
  return {
    type: 'next-step',
    icon: Zap,
    title: 'Content nachfüllen',
    text: 'Halte deinen Content-Kalender gefüllt — Pulse macht es in wenigen Klicks.',
    cta: { label: 'Pulse starten', route: '/pulse' },
  };
}

/* ================================================================
   InsightCard component
   ================================================================ */

const accentMap = {
  warning: {
    iconBg: 'rgba(250,126,112,0.10)',
    iconColor: '#FA7E70',
  },
  winner: {
    iconBg: 'rgba(73,214,158,0.10)',
    iconColor: '#49D69E',
  },
  'next-step': {
    iconBg: 'rgba(124,108,242,0.08)',
    iconColor: 'var(--vektrus-ai-violet)',
  },
} as const;

interface InsightCardProps {
  insight: Insight;
  visible: boolean;
  delay: number;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight, visible, delay }) => {
  const navigate = useNavigate();
  const accent = accentMap[insight.type];
  const Icon = insight.icon;
  const isAi = insight.type === 'next-step';
  const isPulse = insight.cta.route === '/pulse';

  return (
    <div
      className="bg-white rounded-[var(--vektrus-radius-md)] p-5 flex flex-col shadow-subtle hover:shadow-card hover:-translate-y-px transition-all duration-200 border border-[var(--vektrus-border-subtle)]"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        transition: `opacity 300ms ease-out ${delay}ms, transform 300ms ease-out ${delay}ms, box-shadow 200ms ease-out`,
      }}
    >
      {/* Icon + Title */}
      <div className="flex items-center gap-2.5 mb-2">
        <div
          className="w-8 h-8 rounded-[var(--vektrus-radius-sm)] flex items-center justify-center flex-shrink-0"
          style={{ background: accent.iconBg }}
        >
          <Icon size={16} strokeWidth={2} style={{ color: accent.iconColor }} />
        </div>
        <h3 className="font-manrope font-semibold text-[14px] leading-snug text-[#111111]">
          {insight.title}
          {isAi && (
            <Sparkles
              size={13}
              className="inline-block ml-1.5 -mt-0.5"
              style={{ color: 'var(--vektrus-ai-violet)' }}
            />
          )}
        </h3>
      </div>

      {/* Body text */}
      <p className="text-[13px] leading-relaxed text-[#7A7A7A] mb-4 flex-1">
        {insight.text}
      </p>

      {/* CTA */}
      <button
        onClick={() => navigate(insight.cta.route)}
        className={`
          inline-flex items-center gap-1.5 text-[13px] font-semibold
          rounded-[var(--vektrus-radius-sm)] px-3.5 py-[7px] self-start
          ${isPulse
            ? 'chat-ai-action-btn text-[#111111]'
            : 'border border-[var(--vektrus-border-default)] text-[#111111] hover:border-[#49B7E3] hover:text-[#49B7E3] transition-all duration-150'
          }
        `}
      >
        {insight.cta.label}
        <ArrowRight size={13} strokeWidth={2.5} />
      </button>
    </div>
  );
};

/* ================================================================
   InsightRow — the full Layer 2 strip
   ================================================================ */

interface InsightRowProps {
  data: DashboardData;
  visible: boolean;
}

const InsightRow: React.FC<InsightRowProps> = ({ data, visible }) => {
  const insights = deriveInsights(data);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {insights.map((insight, i) => (
        <InsightCard
          key={insight.type}
          insight={insight}
          visible={visible}
          delay={100 + i * 120}
        />
      ))}
    </div>
  );
};

export default InsightRow;
