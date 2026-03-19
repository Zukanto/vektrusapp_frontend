import React, { useState } from 'react';
import { Search, Play, CheckCircle, MessageCircle, Send, Star, ExternalLink, Book, Video, FileText, Users, Settings, BarChart3, Calendar, Lightbulb, ArrowRight, ChevronDown, ChevronRight, Mail, Phone, Clock, Sparkles, Compass, Target, Bot, ClipboardList, Flame, BookOpen, MessageSquare, PartyPopper } from 'lucide-react';
import { useToast } from '../ui/toast';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  helpful: number;
  tags: string[];
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  videoUrl?: string;
  action?: () => void;
}

interface ChangelogItem {
  id: string;
  version: string;
  date: Date;
  type: 'feature' | 'improvement' | 'bugfix';
  onModuleChange?: (module: string) => void;
  description: string;
  isNew: boolean;
}

interface HelpPageProps {
  onModuleChange?: (module: string) => void;
}

const HelpPage: React.FC<HelpPageProps> = ({ onModuleChange }) => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'onboarding' | 'faq' | 'support' | 'changelog'>('onboarding');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [supportForm, setSupportForm] = useState({
    subject: '',
    message: '',
    priority: 'medium'
  });
  const [feedbackRating, setFeedbackRating] = useState<number | null>(null);

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'toolhub',
      title: 'Tool Hub entdecken',
      description: 'Verschaffe dir einen Überblick über alle Vektrus-Tools',
      completed: true,
      action: () => onModuleChange?.('toolhub')
    },
    {
      id: 'profile',
      title: 'Profil vervollständigen',
      description: 'Füge deine Unternehmensdaten und Social Media Accounts hinzu',
      completed: true,
      action: () => onModuleChange?.('profile')
    },
    {
      id: 'accounts',
      title: 'Social Media Accounts verbinden',
      description: 'Verknüpfe Instagram, LinkedIn und andere Plattformen',
      completed: true,
      videoUrl: 'https://example.com/connect-accounts.mp4'
    },
    {
      id: 'first-plan',
      title: 'Ersten Contentplan erstellen',
      description: 'Nutze den KI-Wizard für deinen ersten Wochenplan',
      completed: false,
      videoUrl: 'https://example.com/create-plan.mp4',
      action: () => onModuleChange?.('planner')
    },
    {
      id: 'ai-chat',
      title: 'KI-Chat ausprobieren',
      description: 'Stelle der KI Fragen zu Content-Strategien',
      completed: false,
      action: () => onModuleChange?.('chat')
    },
    {
      id: 'insights',
      title: 'Performance analysieren',
      description: 'Verstehe deine Insights und optimiere deine Strategie',
      completed: false,
      action: () => onModuleChange?.('insights')
    }
  ];

  const faqItems: FAQItem[] = [
    {
      id: '1',
      category: 'Erste Schritte',
      question: 'Wie verbinde ich meinen Instagram Account?',
      answer: 'Gehe zu Profil → Konten → Instagram → "Verbinden" klicken. Du wirst zu Instagram weitergeleitet und kannst die Berechtigung erteilen. Nach erfolgreicher Verbindung siehst du deine Account-Daten in Vektrus.',
      helpful: 24,
      tags: ['instagram', 'verbinden', 'setup']
    },
    {
      id: '2',
      category: 'Contentplaner',
      question: 'Wie funktioniert der KI-Wizard im Contentplaner?',
      answer: 'Der KI-Wizard führt dich durch 6 Schritte: Ziel definieren, Plattformen wählen, Posting-Häufigkeit, Tonalität, Thema und Vorschau. Basierend auf deinen Eingaben generiert die KI einen kompletten Wochenplan mit optimierten Posts, Hashtags und Posting-Zeiten.',
      helpful: 31,
      tags: ['planer', 'ki', 'wizard', 'wochenplan']
    },
    {
      id: '3',
      category: 'KI-Features',
      question: 'Kann die KI auch Bilder für meine Posts erstellen?',
      answer: 'Ja! In der Mediathek findest du "KI-Bild generieren". Du kannst entweder eine Beschreibung eingeben oder ein Inspirationsbild hochladen. Die KI erstellt dann passende Visuals für deine Posts. Diese können direkt in den Contentplaner übernommen werden.',
      helpful: 18,
      tags: ['ki', 'bilder', 'generierung', 'media']
    },
    {
      id: '4',
      category: 'Performance',
      question: 'Wie interpretiere ich die Insights richtig?',
      answer: 'Die Insights zeigen dir: 1) Performance Overview (KPIs im Vergleich), 2) Top Posts (deine erfolgreichsten Inhalte), 3) Beste Posting-Zeiten (Heatmap), 4) Format-Vergleich (Reel vs. Post etc.), 5) KI-Empfehlungen für Optimierungen. Grüne Werte = gut, rote = Verbesserungspotenzial.',
      helpful: 27,
      tags: ['insights', 'performance', 'analyse', 'kpi']
    },
    {
      id: '5',
      category: 'Abrechnung',
      question: 'Kann ich mein Abo jederzeit kündigen?',
      answer: 'Ja, du kannst jederzeit kündigen. Gehe zu Profil → Abrechnung → "Abo verwalten". Die Kündigung wird zum Ende der aktuellen Abrechnungsperiode wirksam. Du behältst bis dahin vollen Zugriff auf alle Features.',
      helpful: 15,
      tags: ['abo', 'kündigung', 'billing']
    },
    {
      id: '6',
      category: 'Contentplaner',
      question: 'Wie kann ich Posts zwischen Plattformen kopieren?',
      answer: 'Rechtsklick auf einen Post im Wochenplaner → "Kopieren nach" → Zielplattform wählen. Die KI passt automatisch Hashtags, Tonalität und Format an die gewählte Plattform an. Du kannst danach noch manuell anpassen.',
      helpful: 22,
      tags: ['planer', 'kopieren', 'plattformen', 'cross-platform']
    },
    {
      id: '7',
      category: 'KI-Features',
      question: 'Wie genau sind die KI-Empfehlungen?',
      answer: 'Unsere KI analysiert deine historischen Daten, Branchentrends und Best Practices. Die Konfidenz-Scores zeigen die Zuverlässigkeit (70-95%). Empfehlungen mit >85% Konfidenz haben sich in Tests als sehr effektiv erwiesen.',
      helpful: 19,
      tags: ['ki', 'empfehlungen', 'genauigkeit', 'konfidenz']
    },
    {
      id: '8',
      category: 'Mediathek',
      question: 'Wie organisiere ich meine Medien am besten?',
      answer: 'Nutze Tags für bessere Organisation (z.B. "produkt", "team", "event"). Favorisiere wichtige Medien mit dem Stern. Die Suchfunktion durchsucht Namen, Tags und Verwendung. KI-generierte Bilder werden automatisch markiert.',
      helpful: 16,
      tags: ['mediathek', 'organisation', 'tags', 'suche']
    }
  ];

  const changelogItems: ChangelogItem[] = [
    {
      id: '1',
      version: '2.1.0',
      date: new Date('2024-01-20'),
      type: 'feature',
      title: 'Neue Insights-Seite',
      description: 'Umfassende Performance-Analysen mit KI-Empfehlungen, Heatmaps und Plattform-Vergleichen',
      isNew: true
    },
    {
      id: '2',
      version: '2.0.5',
      date: new Date('2024-01-18'),
      type: 'improvement',
      title: 'Verbesserte KI-Bildgenerierung',
      description: 'Neue Stil-Optionen und bessere Prompt-Verarbeitung für realistischere Ergebnisse',
      isNew: true
    },
    {
      id: '3',
      version: '2.0.4',
      date: new Date('2024-01-15'),
      type: 'feature',
      title: 'Cross-Platform Content-Kopierung',
      description: 'Posts können jetzt einfach zwischen Plattformen kopiert und automatisch angepasst werden',
      isNew: false
    },
    {
      id: '4',
      version: '2.0.3',
      date: new Date('2024-01-12'),
      type: 'bugfix',
      title: 'Mediathek Performance-Optimierung',
      description: 'Schnelleres Laden und bessere Darstellung großer Medienbibliotheken',
      isNew: false
    }
  ];

  const categories = ['all', 'Erste Schritte', 'Contentplaner', 'KI-Features', 'Performance', 'Mediathek', 'Abrechnung'];

  const filteredFAQs = faqItems.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supportForm.subject || !supportForm.message) {
      addToast({
        type: 'error',
        title: 'Fehler',
        description: 'Bitte fülle alle Felder aus.',
      });
      return;
    }

    // Simulate support ticket creation
    addToast({
      type: 'success',
      title: 'Support-Anfrage gesendet',
      description: 'Wir melden uns innerhalb von 24 Stunden bei dir.',
      duration: 4000
    });

    setSupportForm({ subject: '', message: '', priority: 'medium' });
  };

  const handleFeedbackSubmit = () => {
    if (feedbackRating === null) {
      addToast({
        type: 'error',
        title: 'Bewertung fehlt',
        description: 'Bitte wähle eine Bewertung aus.',
      });
      return;
    }

    addToast({
      type: 'success',
      title: 'Feedback gesendet',
      description: 'Vielen Dank für dein Feedback!',
      duration: 3000
    });

    setFeedbackRating(null);
  };

  const getChangelogIcon = (type: string) => {
    switch (type) {
      case 'feature':
        return <Sparkles className="w-4 h-4 text-[#49D69E]" />;
      case 'improvement':
        return <ArrowRight className="w-4 h-4 text-[#49B7E3]" />;
      case 'bugfix':
        return <Settings className="w-4 h-4 text-[#F4BE9D]" />;
      default:
        return <FileText className="w-4 h-4 text-[#7A7A7A]" />;
    }
  };

  const getChangelogColor = (type: string) => {
    switch (type) {
      case 'feature':
        return 'border-[#49D69E] bg-[#49D69E]/10';
      case 'improvement':
        return 'border-[#49B7E3] bg-[#49B7E3]/10';
      case 'bugfix':
        return 'border-[#F4BE9D] bg-[#F4BE9D]/10';
      default:
        return 'border-[rgba(73,183,227,0.18)] bg-[#F4FCFE]';
    }
  };

  const renderOnboardingTab = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#B6EBF7]/20 to-[rgba(124,108,242,0.08)] rounded-[var(--vektrus-radius-md)] p-8 border border-[#B6EBF7]">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#B6EBF7] rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7 text-[#49B7E3]" />
          </div>
          <h2 className="text-2xl font-bold text-[#111111] mb-3">
            Willkommen bei Vektrus!
          </h2>
          <p className="text-[#7A7A7A] max-w-2xl mx-auto leading-relaxed">
            Lass uns gemeinsam deine Social Media Strategie auf das nächste Level bringen. 
            Hier findest du alles, was du für den perfekten Start brauchst.
          </p>
        </div>
      </div>

      {/* Quick Start Guide */}
      <div className="bg-white rounded-[var(--vektrus-radius-md)] p-6 border border-[rgba(73,183,227,0.18)]">
        <h3 className="text-xl font-semibold text-[#111111] mb-6 flex items-center space-x-2">
          <Play className="w-5 h-5 text-[#49B7E3]" />
          <span>Schnellstart-Guide</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <Compass className="w-6 h-6 text-[#49B7E3]" />,
              title: 'Tool Hub entdecken',
              description: 'Alle Tools, Tipps und Roadmap auf einen Blick',
              action: 'Tool Hub öffnen',
              color: 'bg-[#B4E8E5]',
              moduleId: 'toolhub'
            },
            {
              icon: <Target className="w-6 h-6 text-[#49B7E3]" />,
              title: '5-Minuten Setup',
              description: 'Profil einrichten und erste Accounts verbinden',
              action: 'Setup starten',
              color: 'bg-[#B6EBF7]',
              moduleId: 'profile'
            },
            {
              icon: <Calendar className="w-6 h-6 text-white" />,
              title: 'Ersten Plan erstellen',
              description: 'Mit dem KI-Wizard zum perfekten Wochenplan',
              action: 'Plan erstellen',
              color: 'bg-[#49D69E]',
              moduleId: 'planner'
            },
            {
              icon: <Bot className="w-6 h-6 text-white" />,
              title: 'KI-Chat nutzen',
              description: 'Stelle Fragen und erhalte personalisierte Empfehlungen',
              action: 'Chat öffnen',
              color: 'bg-[#49B7E3]',
              moduleId: 'chat'
            }
          ].map((guide, index) => (
            <div key={index} className="text-center p-6 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] hover:shadow-md transition-all duration-200">
              <div className={`w-12 h-12 ${guide.color} rounded-[var(--vektrus-radius-sm)] flex items-center justify-center mx-auto mb-4`}>{guide.icon}</div>
              <h4 className="font-semibold text-[#111111] mb-2">{guide.title}</h4>
              <p className="text-sm text-[#7A7A7A] mb-4">{guide.description}</p>
              <button 
                onClick={() => onModuleChange?.(guide.moduleId)}
                className={`w-full py-2 px-4 ${guide.color} hover:opacity-90 text-[#111111] rounded-[var(--vektrus-radius-sm)] font-medium transition-all duration-200 hover:scale-105`}
              >
                {guide.action}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Checklist */}
      <div className="bg-white rounded-[var(--vektrus-radius-md)] p-6 border border-[rgba(73,183,227,0.18)]">
        <h3 className="text-xl font-semibold text-[#111111] mb-6 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-[#49B7E3]" />
          <span>Setup-Fortschritt</span>
        </h3>

        <div className="space-y-4">
          {onboardingSteps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center justify-between p-4 rounded-[var(--vektrus-radius-md)] border-2 transition-all duration-200 ${
                step.completed 
                  ? 'border-[#49D69E] bg-[#49D69E]/10' 
                  : 'border-[rgba(73,183,227,0.18)] hover:border-[#B6EBF7]'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step.completed ? 'bg-[#49D69E]' : 'bg-[#B6EBF7]/20'
                }`}>
                  {step.completed ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : (
                    <span className="text-sm font-bold text-[#7A7A7A]">{index + 1}</span>
                  )}
                </div>
                
                <div>
                  <h4 className={`font-medium ${step.completed ? 'text-[#111111] line-through' : 'text-[#111111]'}`}>
                    {step.title}
                  </h4>
                  <p className={`text-sm ${step.completed ? 'text-[#7A7A7A] line-through' : 'text-[#7A7A7A]'}`}>
                    {step.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {step.videoUrl && (
                  <button className="p-2 text-[#49B7E3] hover:text-[#49B7E3]/80 transition-colors" title="Video ansehen">
                    <Video className="w-4 h-4" />
                  </button>
                )}
                
                {!step.completed && step.action && (
                  <button
                    onClick={step.action}
                    className="px-4 py-2 bg-[#B6EBF7] hover:bg-[#49B7E3] text-[#111111] rounded-[var(--vektrus-radius-sm)] font-medium transition-colors text-sm"
                  >
                    Starten
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Progress Summary */}
        <div className="mt-6 p-4 bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] border border-[#B6EBF7]">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-[#111111] mb-1 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-[#49B7E3]" />
                Setup-Fortschritt: {onboardingSteps.filter(s => s.completed).length}/{onboardingSteps.length}
              </h4>
              <p className="text-sm text-[#7A7A7A]">
                {onboardingSteps.filter(s => s.completed).length === onboardingSteps.length 
                  ? 'Perfekt! Du bist bereit für Vektrus!' 
                  : 'Noch ein paar Schritte bis zum perfekten Setup'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-[#49B7E3]">
                {Math.round((onboardingSteps.filter(s => s.completed).length / onboardingSteps.length) * 100)}%
              </div>
              <div className="text-xs text-[#7A7A7A]">Abgeschlossen</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFAQTab = () => (
    <div className="space-y-6">
      {/* Search & Filter */}
      <div className="bg-white rounded-[var(--vektrus-radius-md)] p-6 border border-[rgba(73,183,227,0.18)]">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#7A7A7A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="FAQ durchsuchen..."
              className="w-full pl-10 pr-4 py-3 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] focus:outline-none focus:ring-2 focus:ring-[#B6EBF7]"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] focus:outline-none focus:ring-2 focus:ring-[#B6EBF7] bg-white"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'Alle Kategorien' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* FAQ Results */}
      <div className="bg-white rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.18)] overflow-hidden">
        {filteredFAQs.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredFAQs.map((faq) => (
              <div key={faq.id} className="p-6">
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="px-2 py-1 bg-[#B6EBF7] text-[#111111] rounded-[var(--vektrus-radius-sm)] text-xs font-medium">
                        {faq.category}
                      </span>
                      <div className="flex items-center space-x-1 text-xs text-[#7A7A7A]">
                        <Star className="w-3 h-3 text-[#F4BE9D]" />
                        <span>{faq.helpful} hilfreich</span>
                      </div>
                    </div>
                    <h4 className="font-medium text-[#111111] text-left">{faq.question}</h4>
                  </div>
                  <div className="ml-4">
                    {expandedFAQ === faq.id ? (
                      <ChevronDown className="w-5 h-5 text-[#7A7A7A]" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-[#7A7A7A]" />
                    )}
                  </div>
                </button>

                {expandedFAQ === faq.id && (
                  <div className="mt-4 pl-4 border-l-2 border-[#B6EBF7]">
                    <p className="text-[#7A7A7A] leading-relaxed mb-4">{faq.answer}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {faq.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-[#F4FCFE] text-[#7A7A7A] rounded-[var(--vektrus-radius-sm)] text-xs">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-[#7A7A7A]">War das hilfreich?</span>
                        <button className="p-1 text-[#49D69E] hover:bg-[#49D69E]/10 rounded-[var(--vektrus-radius-sm)] transition-colors">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Search className="w-12 h-12 text-[#7A7A7A] mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-[#111111] mb-2">Keine Ergebnisse gefunden</h3>
            <p className="text-[#7A7A7A] mb-4">
              Versuche andere Suchbegriffe oder wähle eine andere Kategorie.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="text-[#49B7E3] hover:text-[#49B7E3]/80 transition-colors"
            >
              Alle FAQs anzeigen
            </button>
          </div>
        )}
      </div>

      {/* Popular Articles */}
      <div className="bg-white rounded-[var(--vektrus-radius-md)] p-6 border border-[rgba(73,183,227,0.18)]">
        <h3 className="text-lg font-semibold text-[#111111] mb-4 flex items-center gap-2">
          <Flame className="w-5 h-5 text-[#FA7E70]" />
          <span>Beliebte Artikel</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqItems
            .sort((a, b) => b.helpful - a.helpful)
            .slice(0, 4)
            .map(faq => (
              <button
                key={faq.id}
                onClick={() => setExpandedFAQ(faq.id)}
                className="p-4 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-sm)] hover:border-[#B6EBF7] hover:bg-[#B6EBF7]/10 text-left transition-all duration-200 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-[#111111] mb-1 group-hover:text-[#49B7E3] transition-colors">
                      {faq.question}
                    </h4>
                    <p className="text-xs text-[#7A7A7A]">{faq.category}</p>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-[#F4BE9D]">
                    <Star className="w-3 h-3" />
                    <span>{faq.helpful}</span>
                  </div>
                </div>
              </button>
            ))}
        </div>
      </div>
    </div>
  );

  const renderSupportTab = () => (
    <div className="space-y-8">
      {/* Contact Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-[var(--vektrus-radius-md)] p-6 border border-[rgba(73,183,227,0.18)] text-center">
          <div className="w-12 h-12 bg-[#B6EBF7] rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-6 h-6 text-[#49B7E3]" />
          </div>
          <h3 className="font-semibold text-[#111111] mb-2">Live-Chat</h3>
          <p className="text-sm text-[#7A7A7A] mb-4">
            Sofortige Hilfe von unserem Support-Team
          </p>
          <button className="w-full py-2 px-4 bg-[#B6EBF7] hover:bg-[#49B7E3] text-[#111111] rounded-[var(--vektrus-radius-sm)] font-medium transition-colors">
            Chat starten
          </button>
          <p className="text-xs text-[#49D69E] mt-2">● Online</p>
        </div>

        <div className="bg-white rounded-[var(--vektrus-radius-md)] p-6 border border-[rgba(73,183,227,0.18)] text-center">
          <div className="w-12 h-12 bg-[#F4BE9D] rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-[#D97706]" />
          </div>
          <h3 className="font-semibold text-[#111111] mb-2">E-Mail Support</h3>
          <p className="text-sm text-[#7A7A7A] mb-4">
            Detaillierte Anfragen per E-Mail
          </p>
          <button className="w-full py-2 px-4 bg-[#F4BE9D] hover:bg-[#D97706] hover:text-white text-[#111111] rounded-[var(--vektrus-radius-sm)] font-medium transition-colors">
            E-Mail senden
          </button>
          <p className="text-xs text-[#7A7A7A] mt-2">
            <Clock className="w-3 h-3 inline mr-1" />
            ~24h Antwortzeit
          </p>
        </div>

        <div className="bg-white rounded-[var(--vektrus-radius-md)] p-6 border border-[rgba(73,183,227,0.18)] text-center">
          <div className="w-12 h-12 bg-[rgba(124,108,242,0.12)] rounded-full flex items-center justify-center mx-auto mb-4">
            <Book className="w-6 h-6 text-[var(--vektrus-ai-violet)]" />
          </div>
          <h3 className="font-semibold text-[#111111] mb-2">Wissensdatenbank</h3>
          <p className="text-sm text-[#7A7A7A] mb-4">
            Umfassende Anleitungen und Tutorials
          </p>
          <button
            onClick={() => setActiveTab('faq')}
            className="w-full py-2 px-4 bg-[rgba(124,108,242,0.12)] hover:bg-[rgba(124,108,242,0.2)] text-[var(--vektrus-ai-violet)] rounded-[var(--vektrus-radius-sm)] font-medium transition-colors"
          >
            FAQ durchsuchen
          </button>
        </div>
      </div>

      {/* Support Form */}
      <div className="bg-white rounded-[var(--vektrus-radius-md)] p-6 border border-[rgba(73,183,227,0.18)]">
        <h3 className="text-xl font-semibold text-[#111111] mb-6 flex items-center gap-2">
          <Send className="w-5 h-5 text-[#49B7E3]" />
          <span>Support-Anfrage senden</span>
        </h3>

        <form onSubmit={handleSupportSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[#111111] block mb-2">Betreff</label>
              <input
                type="text"
                value={supportForm.subject}
                onChange={(e) => setSupportForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Kurze Beschreibung des Problems"
                className="w-full p-3 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-sm)] focus:outline-none focus:ring-2 focus:ring-[#B6EBF7]"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-[#111111] block mb-2">Priorität</label>
              <select
                value={supportForm.priority}
                onChange={(e) => setSupportForm(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full p-3 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-sm)] focus:outline-none focus:ring-2 focus:ring-[#B6EBF7]"
              >
                <option value="low">Niedrig</option>
                <option value="medium">Normal</option>
                <option value="high">Hoch</option>
                <option value="urgent">Dringend</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[#111111] block mb-2">Nachricht</label>
            <textarea
              value={supportForm.message}
              onChange={(e) => setSupportForm(prev => ({ ...prev, message: e.target.value }))}
              rows={5}
              placeholder="Beschreibe dein Problem oder deine Frage so detailliert wie möglich..."
              className="w-full p-3 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-sm)] focus:outline-none focus:ring-2 focus:ring-[#B6EBF7] resize-none"
            />
          </div>

          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-3 bg-[#B6EBF7] hover:bg-[#49B7E3] text-[#111111] rounded-[var(--vektrus-radius-md)] font-medium transition-all duration-200 hover:scale-105"
          >
            <Send className="w-4 h-4" />
            <span>Anfrage senden</span>
          </button>
        </form>
      </div>

      {/* Feedback Section */}
      <div className="bg-white rounded-[var(--vektrus-radius-md)] p-6 border border-[rgba(73,183,227,0.18)]">
        <h3 className="text-xl font-semibold text-[#111111] mb-6 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#49B7E3]" />
          <span>Feedback geben</span>
        </h3>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-[#111111] mb-3">
              Wie zufrieden bist du mit Vektrus?
            </p>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  onClick={() => setFeedbackRating(rating)}
                  className={`w-12 h-12 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                    feedbackRating === rating
                      ? 'border-[#F4BE9D] bg-[#F4BE9D] text-[#111111]'
                      : 'border-[rgba(73,183,227,0.18)] hover:border-[#F4BE9D] text-[#7A7A7A]'
                  }`}
                >
                  <span className="text-lg">
                    {rating === 1 ? '😞' : rating === 2 ? '😐' : rating === 3 ? '🙂' : rating === 4 ? '😊' : '🤩'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleFeedbackSubmit}
            disabled={feedbackRating === null}
            className={`flex items-center space-x-2 px-4 py-2 rounded-[var(--vektrus-radius-sm)] font-medium transition-colors ${
              feedbackRating !== null
                ? 'bg-[#49D69E] hover:bg-[#49D69E]/90 text-white'
                : 'bg-[#B6EBF7]/20 text-[#7A7A7A] cursor-not-allowed'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Feedback senden</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderChangelogTab = () => (
    <div className="space-y-6">
      {/* Latest Updates Banner */}
      <div className="bg-gradient-to-r from-[#49D69E]/20 to-[#B6EBF7]/20 rounded-[var(--vektrus-radius-md)] p-6 border border-[#49D69E]">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-[#49D69E] rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#111111] mb-2">
              Neue Features verfügbar!
            </h2>
            <p className="text-[#7A7A7A]">
              Entdecke die neuesten Verbesserungen und Features in Vektrus
            </p>
          </div>
        </div>
      </div>

      {/* Changelog Items */}
      <div className="space-y-4">
        {changelogItems.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-[var(--vektrus-radius-md)] p-6 border-2 transition-all duration-200 hover:shadow-md ${getChangelogColor(item.type)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="flex-shrink-0">
                  {getChangelogIcon(item.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-[#111111]">{item.title}</h4>
                    {item.isNew && (
                      <span className="px-2 py-1 bg-[#49D69E] text-white text-xs font-medium rounded-full">
                        NEU
                      </span>
                    )}
                    <span className="px-2 py-1 bg-[#F4FCFE] text-[#7A7A7A] text-xs font-medium rounded">
                      v{item.version}
                    </span>
                  </div>
                  
                  <p className="text-[#7A7A7A] leading-relaxed mb-3">
                    {item.description}
                  </p>

                  <div className="flex items-center space-x-4 text-sm text-[#7A7A7A]">
                    <span>{item.date.toLocaleDateString('de-DE')}</span>
                    <span className="capitalize">
                      {item.type === 'feature' ? 'Neues Feature' :
                       item.type === 'improvement' ? 'Verbesserung' : 'Bugfix'}
                    </span>
                  </div>
                </div>
              </div>

              {item.type === 'feature' && (
                <button className="flex items-center space-x-2 px-4 py-2 bg-[#B6EBF7] hover:bg-[#49B7E3] text-[#111111] rounded-[var(--vektrus-radius-sm)] font-medium transition-colors text-sm">
                  <ExternalLink className="w-4 h-4" />
                  <span>Ausprobieren</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Version History */}
      <div className="bg-white rounded-[var(--vektrus-radius-md)] p-6 border border-[rgba(73,183,227,0.18)]">
        <h3 className="text-lg font-semibold text-[#111111] mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#49B7E3]" />
          <span>Vollständige Versionshistorie</span>
        </h3>
        
        <div className="space-y-3">
          {changelogItems.map((item, index) => (
            <div key={item.id} className="flex items-center justify-between p-3 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-sm)] hover:bg-[#F4FCFE] transition-colors">
              <div className="flex items-center space-x-3">
                {getChangelogIcon(item.type)}
                <div>
                  <span className="font-medium text-[#111111] text-sm">{item.title}</span>
                  <div className="text-xs text-[#7A7A7A]">
                    v{item.version} • {item.date.toLocaleDateString('de-DE')}
                  </div>
                </div>
              </div>
              
              <button className="text-[#49B7E3] hover:text-[#49B7E3]/80 transition-colors">
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'onboarding', label: 'Erste Schritte', icon: Play },
    { id: 'faq', label: 'FAQ', icon: Book },
    { id: 'support', label: 'Support', icon: MessageCircle },
    { id: 'changelog', label: 'Updates', icon: Sparkles }
  ];

  return (
    <div className="h-full bg-[#F4FCFE] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[rgba(73,183,227,0.18)] p-6 flex-shrink-0">
        <div className="max-w-[1240px] mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#111111] flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#B6EBF7] rounded-[var(--vektrus-radius-md)] flex items-center justify-center">
                  <span className="text-2xl">❓</span>
                </div>
                <span>Hilfe & Support</span>
              </h1>
              <p className="text-[#7A7A7A] mt-2">
                Alles was du brauchst, um das Beste aus Vektrus herauszuholen
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 bg-[#49D69E] hover:bg-[#49D69E]/90 text-white rounded-[var(--vektrus-radius-md)] font-medium transition-colors">
                <MessageCircle className="w-4 h-4" />
                <span>Live-Chat</span>
              </button>
              
              <button className="flex items-center space-x-2 px-4 py-2 border border-[rgba(73,183,227,0.18)] hover:border-[#B6EBF7] hover:bg-[#B6EBF7]/10 text-[#7A7A7A] hover:text-[#111111] rounded-[var(--vektrus-radius-md)] font-medium transition-colors">
                <Mail className="w-4 h-4" />
                <span>E-Mail</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-[rgba(73,183,227,0.18)] flex-shrink-0">
        <div className="max-w-[1240px] mx-auto">
          <nav className="flex space-x-8 px-6">
            {tabs.map(tab => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#49B7E3] text-[#49B7E3]'
                      : 'border-transparent text-[#7A7A7A] hover:text-[#111111]'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-[1240px] mx-auto">
          {activeTab === 'onboarding' && renderOnboardingTab()}
          {activeTab === 'faq' && renderFAQTab()}
          {activeTab === 'support' && renderSupportTab()}
          {activeTab === 'changelog' && renderChangelogTab()}
        </div>
      </div>
    </div>
  );
};

export default HelpPage;