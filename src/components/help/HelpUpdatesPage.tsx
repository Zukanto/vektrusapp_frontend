import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight, ArrowLeft, Megaphone, Clock, ArrowRight,
  Construction, MessageSquareText,
} from 'lucide-react';
import {
  getRecentUpdates, inProgressItems,
  UPDATE_STATUS_CONFIG, type ProductUpdate,
} from './updatesData';

const UpdateCard: React.FC<{ update: ProductUpdate; onNavigate: (path: string) => void }> = ({ update, onNavigate }) => {
  const statusConf = UPDATE_STATUS_CONFIG[update.status];

  return (
    <div className="bg-white rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.18)] p-5 group">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusConf.className}`}>
            {statusConf.label}
          </span>
          <span className="text-xs text-[#7A7A7A]">{update.module}</span>
        </div>
        <span className="text-xs text-[#7A7A7A] flex items-center gap-1 flex-shrink-0">
          <Clock className="w-3 h-3" />
          {new Date(update.date).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>

      <h3 className="font-semibold text-[#111111] mb-1">{update.title}</h3>
      <p className="text-sm text-[#7A7A7A] leading-relaxed mb-2">{update.teaser}</p>

      {update.impact && (
        <p className="text-xs text-[#49B7E3] mb-2">{update.impact}</p>
      )}

      {update.linkTo && (
        <button
          onClick={() => onNavigate(update.linkTo!)}
          className="text-sm text-[#49B7E3] hover:text-[#49B7E3]/80 font-medium transition-colors flex items-center gap-1"
        >
          Mehr erfahren
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

const HelpUpdatesPage: React.FC = () => {
  const navigate = useNavigate();
  const updates = getRecentUpdates();

  return (
    <div className="h-full bg-[#F4FCFE] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[rgba(73,183,227,0.18)] p-6 lg:p-8 flex-shrink-0">
        <div className="max-w-[1000px] mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-[#7A7A7A] mb-4">
            <button
              onClick={() => navigate('/help')}
              className="hover:text-[#49B7E3] transition-colors"
            >
              Hilfe
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#111111] font-medium">Updates</span>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/help')}
              className="w-9 h-9 flex items-center justify-center rounded-[var(--vektrus-radius-sm)] border border-[rgba(73,183,227,0.18)] hover:border-[#B6EBF7] hover:bg-[#F4FCFE] transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-[#7A7A7A]" />
            </button>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-[#111111] font-manrope">
                Neu bei Vektrus
              </h1>
              <p className="text-sm text-[#7A7A7A]">
                Was sich in letzter Zeit bei Vektrus verändert hat.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-[1000px] mx-auto space-y-8">

          {/* Updates List */}
          <section>
            <h2 className="text-lg font-semibold text-[#111111] mb-4 flex items-center gap-2 font-manrope">
              <Megaphone className="w-5 h-5 text-[#49B7E3]" />
              Aktuelle Updates
            </h2>
            <div className="space-y-3">
              {updates.map(update => (
                <UpdateCard
                  key={update.id}
                  update={update}
                  onNavigate={(path) => navigate(path)}
                />
              ))}
            </div>
          </section>

          {/* In Progress */}
          <section>
            <h2 className="text-lg font-semibold text-[#111111] mb-2 flex items-center gap-2 font-manrope">
              <Construction className="w-5 h-5 text-[#7A7A7A]" />
              Gerade in Arbeit
            </h2>
            <p className="text-sm text-[#7A7A7A] mb-4">
              Woran wir aktuell arbeiten — eine Momentaufnahme, keine Zusage.
            </p>
            <div className="bg-white rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.18)] divide-y divide-[rgba(73,183,227,0.08)]">
              {inProgressItems.map((item, i) => (
                <div key={i} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-[#111111] text-sm">{item.title}</h3>
                      <p className="text-sm text-[#7A7A7A] mt-0.5 leading-relaxed">{item.description}</p>
                    </div>
                    <span className="text-xs text-[#7A7A7A] bg-[#F4FCFE] px-2 py-0.5 rounded flex-shrink-0">
                      {item.module}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Feedback Link */}
          <section className="bg-white rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.18)] p-6">
            <h2 className="text-lg font-semibold text-[#111111] mb-2 flex items-center gap-2 font-manrope">
              <MessageSquareText className="w-5 h-5 text-[#49B7E3]" />
              Feedback & Wünsche
            </h2>
            <p className="text-sm text-[#7A7A7A] mb-4">
              Du hast einen Verbesserungsvorschlag, einen Wunsch oder ein Problem entdeckt? Im Feedback-Bereich kannst du Tickets erstellen und für bestehende Vorschläge abstimmen.
            </p>
            <button
              onClick={() => navigate('/toolhub')}
              className="flex items-center gap-2 px-4 py-2.5 border border-[rgba(73,183,227,0.18)] hover:border-[#B6EBF7] hover:bg-[#F4FCFE] text-[#111111] rounded-[var(--vektrus-radius-sm)] font-medium transition-colors text-sm"
            >
              <Megaphone className="w-4 h-4 text-[#7A7A7A]" />
              Zum Feedback-Bereich
            </button>
          </section>

        </div>
      </div>
    </div>
  );
};

export default HelpUpdatesPage;
