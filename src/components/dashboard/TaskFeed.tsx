import React from 'react';
import {
  CheckCircle2,
  Link2,
  Palette,
  ArrowRight,
  CheckCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { TaskItem } from '../../hooks/useDashboardData';

/* ── Task-type config ──────────────────────────────────────────── */

const taskConfig: Record<TaskItem['type'], {
  icon: React.FC<{ size?: number; strokeWidth?: number; className?: string }>;
  iconColor: string;
  iconBg: string;
}> = {
  approval: {
    icon: CheckCircle2,
    iconColor: '#49B7E3',
    iconBg: 'rgba(182,235,247,0.20)',
  },
  connection: {
    icon: Link2,
    iconColor: '#FA7E70',
    iconBg: 'rgba(250,126,112,0.10)',
  },
  brand: {
    icon: Palette,
    iconColor: '#F4BE9D',
    iconBg: 'rgba(244,190,157,0.12)',
  },
};

const urgencyDot: Record<TaskItem['urgency'], string> = {
  high: '#FA7E70',
  medium: '#F4BE9D',
  low: 'transparent',
};

/* ── Single task row ───────────────────────────────────────────── */

interface TaskRowProps {
  task: TaskItem;
  visible: boolean;
  delay: number;
}

const TaskRow: React.FC<TaskRowProps> = ({ task, visible, delay }) => {
  const navigate = useNavigate();
  const cfg = taskConfig[task.type];
  const Icon = cfg.icon;

  return (
    <div
      className="flex items-center gap-3 py-3 cursor-pointer group"
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity 250ms ease-out ${delay}ms`,
      }}
      onClick={() => navigate(task.cta.route)}
    >
      {/* Urgency dot */}
      <div className="w-2 flex-shrink-0 flex justify-center">
        {task.urgency !== 'low' && (
          <div
            className="w-[6px] h-[6px] rounded-full"
            style={{ background: urgencyDot[task.urgency] }}
          />
        )}
      </div>

      {/* Icon */}
      <div
        className="w-8 h-8 rounded-[var(--vektrus-radius-sm)] flex items-center justify-center flex-shrink-0"
        style={{ background: cfg.iconBg }}
      >
        <Icon size={15} strokeWidth={2} style={{ color: cfg.iconColor }} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-[#111111] group-hover:text-[#49B7E3] transition-colors truncate">
          {task.title}
        </div>
        <div className="text-[12px] text-[#7A7A7A] truncate">
          {task.detail}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={(e) => { e.stopPropagation(); navigate(task.cta.route); }}
        className="flex-shrink-0 inline-flex items-center gap-1 text-[12px] font-semibold text-[#49B7E3] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
      >
        {task.cta.label}
        <ArrowRight size={12} strokeWidth={2.5} />
      </button>
    </div>
  );
};

/* ── Empty state ───────────────────────────────────────────────── */

const TaskFeedEmpty: React.FC = () => (
  <div className="flex items-center gap-3 py-6 justify-center">
    <div className="w-9 h-9 bg-[rgba(73,214,158,0.10)] rounded-[var(--vektrus-radius-sm)] flex items-center justify-center">
      <CheckCheck size={18} className="text-[#49D69E]" />
    </div>
    <div>
      <p className="text-[13px] font-medium text-[#111111]">Alles erledigt</p>
      <p className="text-[12px] text-[#7A7A7A]">Keine offenen Aufgaben. Dein Account läuft.</p>
    </div>
  </div>
);

/* ── Main component ────────────────────────────────────────────── */

interface TaskFeedProps {
  tasks: TaskItem[];
  visible: boolean;
}

const TaskFeed: React.FC<TaskFeedProps> = ({ tasks, visible }) => {
  return (
    <div
      className="bg-white rounded-[var(--vektrus-radius-lg)] p-6 shadow-subtle"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 300ms ease-out 150ms, transform 300ms ease-out 150ms',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-manrope font-semibold text-[15px] text-[#111111]">
          Aufgaben
        </h3>
        {tasks.length > 0 && (
          <span className="text-[12px] text-[#7A7A7A]">
            {tasks.length} offen
          </span>
        )}
      </div>

      {tasks.length === 0 ? (
        <TaskFeedEmpty />
      ) : (
        <div className="divide-y divide-[var(--vektrus-border-subtle)]">
          {tasks.map((task, i) => (
            <TaskRow
              key={`${task.type}-${task.platform || i}`}
              task={task}
              visible={visible}
              delay={200 + i * 60}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskFeed;
