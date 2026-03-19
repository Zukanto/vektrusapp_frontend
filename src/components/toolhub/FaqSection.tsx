import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQ_ITEMS = [
  {
    question: 'Wie starte ich meinen ersten Wochenplan?',
    answer: 'Gehe zu Vektrus Pulse, wähle deine Plattform(en), Posting-Frequenz und Zeitraum. Pulse erstellt automatisch einen kompletten Content-Plan mit Texten und Hashtags.',
  },
  {
    question: 'Was ist der Unterschied zwischen Chat und Pulse?',
    answer: 'Der Chat ist dein persönlicher KI-Berater für Fragen, Strategien und einzelne Post-Ideen. Pulse generiert automatisch einen kompletten Wochenplan mit mehreren Posts auf einmal.',
  },
  {
    question: 'Wie kann ich meine Ergebnisse verbessern?',
    answer: 'Fülle dein AI-Profil möglichst detailliert aus, besonders Brand Voice, Zielgruppe und Kernbotschaften. Je mehr Kontext die KI hat, desto besser die Ergebnisse.',
  },
  {
    question: 'Ist Vektrus DSGVO-konform?',
    answer: 'Ja. Alle Daten werden auf Servern in Deutschland (EU) gespeichert. Wir verarbeiten keine persönlichen Daten und alle Chatverläufe sind jederzeit löschbar.',
  },
  {
    question: 'Wie kann ich Feedback geben?',
    answer: 'Nutze den Feedback-Bereich weiter oben auf dieser Seite. Du kannst Probleme melden, Features wünschen und für bestehende Einträge voten.',
  },
];

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mb-12">
      <div className="flex items-center justify-center gap-2 mb-8">
        <HelpCircle className="w-5 h-5 text-[#49B7E3]" />
        <h2 className="text-2xl font-semibold text-[#111111]">Hilfe & FAQ</h2>
      </div>

      <div className="max-w-3xl mx-auto space-y-2">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={index} className="bg-white rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.10)] shadow-subtle overflow-hidden">
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#F4FCFE]/50 transition-colors"
              >
                <span className="font-medium text-sm text-[#111111] pr-4">{item.question}</span>
                <ChevronDown className={`w-4 h-4 text-[#7A7A7A] flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-5 pb-4">
                      <p className="text-sm text-[#7A7A7A] leading-relaxed">{item.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="max-w-3xl mx-auto mt-6 bg-[#F4FCFE] rounded-[var(--vektrus-radius-md)] border border-[#B6EBF7]/30 p-5 text-center">
        <p className="text-sm text-[#111111] font-medium mb-1">Du brauchst persönliche Hilfe?</p>
        <a
          href="mailto:support@vektrus.com"
          className="inline-flex items-center gap-2 text-sm text-[#49B7E3] hover:text-[#3AA0CC] font-medium transition-colors"
        >
          <Mail className="w-4 h-4" />
          support@vektrus.com
        </a>
      </div>
    </div>
  );
};
