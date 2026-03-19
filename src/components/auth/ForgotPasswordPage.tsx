import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    // Security: Immer dieselbe Meldung — keine Account-Enumeration möglich
    if (error && error.status !== 400) {
      setError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
    } else {
      setIsSubmitted(true);
    }

    setIsLoading(false);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#F4FCFE]">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-[var(--vektrus-radius-lg)] p-8 text-center"
               style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                 style={{ backgroundColor: 'rgba(73,214,158,0.12)' }}>
              <CheckCircle size={32} className="text-[#49D69E]" />
            </div>
            <h1 className="text-xl font-bold mb-3 text-[#111111]"
                style={{ fontFamily: 'Manrope, sans-serif' }}>
              E-Mail gesendet
            </h1>
            <p className="mb-2 text-sm text-[#7A7A7A]"
               style={{ fontFamily: 'Inter, sans-serif' }}>
              Falls ein Konto mit{' '}
              <strong className="text-[#111111]">{email}</strong>{' '}
              existiert, erhältst du in Kürze einen Reset-Link.
            </p>
            <p className="mb-6 text-sm text-[#7A7A7A]"
               style={{ fontFamily: 'Inter, sans-serif' }}>
              Der Link ist <strong>60 Minuten</strong> gültig. Prüfe auch deinen Spam-Ordner.
            </p>
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-[var(--vektrus-radius-sm)] text-sm font-medium text-[#49B7E3] border border-[#49B7E3] hover:bg-[#F4FCFE] transition-colors"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <ArrowLeft size={16} />
              Zurück zum Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#F4FCFE]">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#49B7E3] mb-2"
              style={{ fontFamily: 'Manrope, sans-serif' }}>
            Vektrus
          </h1>
          <p className="text-sm text-[#7A7A7A]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Social Media. Automatisiert. Für dich.
          </p>
        </div>

        <div className="bg-white rounded-[var(--vektrus-radius-lg)] p-8"
             style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h2 className="text-xl font-bold mb-2 text-[#111111]"
              style={{ fontFamily: 'Manrope, sans-serif' }}>
            Passwort vergessen?
          </h2>
          <p className="mb-6 text-sm text-[#7A7A7A]"
             style={{ fontFamily: 'Inter, sans-serif' }}>
            Gib deine E-Mail-Adresse ein. Wir senden dir einen Link zum Zurücksetzen.
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-[var(--vektrus-radius-sm)] text-sm text-[#FA7E70]"
                 style={{ backgroundColor: 'rgba(250,126,112,0.1)', fontFamily: 'Inter, sans-serif' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-[#111111]"
                     style={{ fontFamily: 'Inter, sans-serif' }}>
                E-Mail-Adresse
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A7A7A]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="deine@email.de"
                  className="w-full pl-10 pr-4 py-3 rounded-[var(--vektrus-radius-sm)] text-sm outline-none transition-all text-[#111111]"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    border: '1px solid #E0E0E0',
                    height: '46px',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#49B7E3')}
                  onBlur={(e) => (e.target.style.borderColor = '#E0E0E0')}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full py-3 rounded-[var(--vektrus-radius-sm)] text-sm font-semibold text-white transition-opacity"
              style={{
                fontFamily: 'Inter, sans-serif',
                backgroundColor: '#49B7E3',
                opacity: isLoading || !email ? 0.6 : 1,
                cursor: isLoading || !email ? 'not-allowed' : 'pointer',
              }}
            >
              {isLoading ? 'Wird gesendet…' : 'Reset-Link anfordern'}
            </button>
          </form>

          <div className="mt-5 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm text-[#7A7A7A] hover:text-[#49B7E3] transition-colors"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <ArrowLeft size={14} />
              Zurück zum Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}