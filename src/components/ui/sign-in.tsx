import React, { useState } from 'react';
import { Eye, EyeOff, Zap, TrendingUp, Shield, Clock } from 'lucide-react';

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z" />
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z" />
    </svg>
);

export interface CompanyFact {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface SignInPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  companyFacts?: CompanyFact[];
  onSignIn?: (event: React.FormEvent<HTMLFormElement>) => void;
  onGoogleSignIn?: () => void;
  onResetPassword?: () => void;
  isLoading?: boolean;
}

const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.18)] bg-white/80 backdrop-blur-sm transition-colors focus-within:border-[#B6EBF7] focus-within:bg-[#B6EBF7]/5 focus-within:shadow-sm">
    {children}
  </div>
);

const DEFAULT_FACTS: CompanyFact[] = [
  {
    icon: <Zap className="w-5 h-5 text-[#49D69E]" />,
    title: "KI-gesteuerte Strategien",
    description: "Automatisierte Content-Planung mit intelligenten Empfehlungen"
  },
  {
    icon: <TrendingUp className="w-5 h-5 text-[#49B7E3]" />,
    title: "Messbare Ergebnisse",
    description: "Durchschnittlich 3x mehr Reichweite in den ersten 90 Tagen"
  },
  {
    icon: <Shield className="w-5 h-5 text-[#49D69E]" />,
    title: "DSGVO-konform",
    description: "Hosting in Deutschland, volle Datensicherheit garantiert"
  },
  {
    icon: <Clock className="w-5 h-5 text-[#49B7E3]" />,
    title: "10+ Stunden gespart pro Woche",
    description: "Weniger manuelle Arbeit durch smarte Automatisierung"
  }
];

export const SignInPage: React.FC<SignInPageProps> = ({
  title = (
    <span className="font-bold text-[#111111] tracking-tight">
      Willkommen bei <span className="text-[#49B7E3]">Vektrus</span>
    </span>
  ),
  description = "Melde dich an und starte deine intelligente Social Media Strategie",
  heroImageSrc,
  companyFacts = DEFAULT_FACTS,
  onSignIn,
  onGoogleSignIn,
  onResetPassword,
  isLoading = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F4FCFE] w-full">
      <section className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            <div className="animate-in fade-in-0 duration-300 flex items-center justify-center mb-4">
              <img
                src="https://res.cloudinary.com/dcgwtngml/image/upload/v1756214658/vektrus_H21_kjgkdv.png"
                alt="Vektrus Logo"
                className="h-10 w-auto"
              />
            </div>

            <h1 className="animate-element animate-delay-100 text-3xl md:text-4xl font-bold leading-tight text-center">{title}</h1>
            <p className="animate-element animate-delay-200 text-[#7A7A7A] text-center">{description}</p>

            <form className="space-y-5" onSubmit={onSignIn}>
              <div className="animate-element animate-delay-300">
                <label className="text-sm font-medium text-[#7A7A7A] block mb-2">E-Mail Adresse</label>
                <GlassInputWrapper>
                  <input
                    name="email"
                    type="email"
                    placeholder="Deine E-Mail Adresse eingeben"
                    className="w-full bg-transparent text-sm p-4 rounded-[var(--vektrus-radius-md)] focus:outline-none text-[#111111] placeholder-[#7A7A7A]"
                    disabled={isLoading}
                  />
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-400">
                <label className="text-sm font-medium text-[#7A7A7A] block mb-2">Passwort</label>
                <GlassInputWrapper>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Dein Passwort eingeben"
                      className="w-full bg-transparent text-sm p-4 pr-12 rounded-[var(--vektrus-radius-md)] focus:outline-none text-[#111111] placeholder-[#7A7A7A]"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center"
                    >
                      {showPassword ?
                        <EyeOff className="w-5 h-5 text-[#7A7A7A] hover:text-[#111111] transition-colors" /> :
                        <Eye className="w-5 h-5 text-[#7A7A7A] hover:text-[#111111] transition-colors" />
                      }
                    </button>
                  </div>
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-500 flex items-center justify-between text-sm">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    className="custom-checkbox"
                  />
                  <span className="text-[#111111]">Angemeldet bleiben</span>
                </label>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); onResetPassword?.(); }}
                  className="hover:underline text-[#49B7E3] transition-colors font-medium"
                >
                  Passwort vergessen?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`animate-element animate-delay-600 w-full rounded-[var(--vektrus-radius-md)] py-4 font-medium transition-all duration-200 ${
                  isLoading
                    ? 'bg-gray-300 text-[#7A7A7A] cursor-not-allowed'
                    : 'bg-[#B6EBF7] text-[#111111] hover:bg-[#49B7E3] hover:scale-[1.02] hover:shadow-lg hover:shadow-[#B6EBF7]/30'
                }`}
              >
                {isLoading ? 'Anmeldung läuft...' : 'Anmelden'}
              </button>
            </form>

            <div className="animate-element animate-delay-700 relative flex items-center justify-center">
              <span className="w-full border-t border-[rgba(73,183,227,0.18)]"></span>
              <span className="px-4 text-sm text-[#7A7A7A] bg-[#F4FCFE] absolute">Oder weiter mit</span>
            </div>

            <button
              onClick={onGoogleSignIn}
              disabled={isLoading}
              className="animate-element animate-delay-800 w-full flex items-center justify-center gap-3 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] py-4 hover:bg-white hover:shadow-sm transition-all duration-200 bg-white/50"
            >
                <GoogleIcon />
                <span className="text-[#111111] font-medium">Mit Google fortfahren</span>
            </button>

            <p className="animate-element animate-delay-900 text-center text-sm text-[#7A7A7A]">
              Powered by Vektrus AI
            </p>
          </div>
        </div>
      </section>

      {heroImageSrc && (
        <section className="hidden md:flex flex-1 relative p-6">
          <div className="animate-slide-right animate-delay-300 absolute inset-6 rounded-[var(--vektrus-radius-lg)] overflow-hidden shadow-modal">
            <img
              src={heroImageSrc}
              alt="Vektrus Platform"
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="grid grid-cols-2 gap-3">
                {companyFacts.map((fact, index) => (
                  <div
                    key={index}
                    className={`animate-testimonial animate-delay-${1000 + index * 200} rounded-[var(--vektrus-radius-md)] bg-white/10 backdrop-blur-xl border border-white/20 p-4 transition-all duration-300 hover:bg-white/20`}
                  >
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div className="flex-shrink-0 w-8 h-8 rounded-[var(--vektrus-radius-sm)] bg-white/15 flex items-center justify-center">
                        {fact.icon}
                      </div>
                      <span className="font-semibold text-white text-sm leading-tight">{fact.title}</span>
                    </div>
                    <p className="text-white/75 text-xs leading-relaxed pl-[42px]">{fact.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};