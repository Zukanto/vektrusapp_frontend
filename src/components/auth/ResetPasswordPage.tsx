import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  useEffect(() => {
    // Supabase feuert PASSWORD_RECOVERY wenn der Token aus der URL gültig ist
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsValidSession(true);
      }
    });

    // Fallback: existierende Session prüfen
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsValidSession(true);
      } else {
        setTimeout(() => {
          setIsValidSession((prev) => prev === null ? false : prev);
        }, 2500);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const getPasswordStrength = (pw: string) => {
    if (pw.length === 0) return null;
    if (pw.length < 8) return { label: 'Zu kurz', color: '#FA7E70', width: '25%' };
    if (pw.length < 12 && !/[A-Z]/.test(pw)) return { label: 'Schwach', color: '#F4BE9D', width: '50%' };
    if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) return { label: 'Stark', color: '#49D69E', width: '100%' };
    return { label: 'Mittel', color: '#49B7E3', width: '75%' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Das Passwort muss mindestens 8 Zeichen lang sein.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Die Passwörter stimmen nicht überein.');
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(
        error.message.includes('same password')
          ? 'Das neue Passwort darf nicht mit dem alten übereinstimmen.'
          : 'Fehler beim Setzen des Passworts. Bitte fordere einen neuen Link an.'
      );
    } else {
      setIsSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    }

    setIsLoading(false);
  };

  // ── Laden ──
  if (isValidSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4FCFE]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#49B7E3] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#7A7A7A]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Link wird überprüft…
          </p>
        </div>
      </div>
    );
  }

  // ── Ungültiger Link ──
  if (isValidSession === false) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#F4FCFE]">
        <div className="w-full max-w-md bg-white rounded-[var(--vektrus-radius-lg)] p-8 text-center"
             style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
               style={{ backgroundColor: 'rgba(250,126,112,0.12)' }}>
            <Lock size={28} className="text-[#FA7E70]" />
          </div>
          <h2 className="text-xl font-bold mb-3 text-[#111111]"
              style={{ fontFamily: 'Manrope, sans-serif' }}>
            Link ungültig oder abgelaufen
          </h2>
          <p className="mb-6 text-sm text-[#7A7A7A]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Dieser Reset-Link ist nicht mehr gültig. Bitte fordere einen neuen an.
          </p>
          <button
            onClick={() => navigate('/forgot-password')}
            className="w-full py-3 rounded-[var(--vektrus-radius-sm)] text-sm font-semibold text-white"
            style={{ backgroundColor: '#49B7E3', fontFamily: 'Inter, sans-serif' }}
          >
            Neuen Link anfordern
          </button>
        </div>
      </div>
    );
  }

  // ── Erfolg ──
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#F4FCFE]">
        <div className="w-full max-w-md bg-white rounded-[var(--vektrus-radius-lg)] p-8 text-center"
             style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
               style={{ backgroundColor: 'rgba(73,214,158,0.12)' }}>
            <CheckCircle size={32} className="text-[#49D69E]" />
          </div>
          <h2 className="text-xl font-bold mb-3 text-[#111111]"
              style={{ fontFamily: 'Manrope, sans-serif' }}>
            Passwort erfolgreich gesetzt
          </h2>
          <p className="text-sm text-[#7A7A7A]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Du wirst automatisch zum Login weitergeleitet…
          </p>
        </div>
      </div>
    );
  }

  // ── Formular ──
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#F4FCFE]">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#49B7E3] mb-2"
              style={{ fontFamily: 'Manrope, sans-serif' }}>
            Vektrus
          </h1>
        </div>

        <div className="bg-white rounded-[var(--vektrus-radius-lg)] p-8"
             style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h2 className="text-xl font-bold mb-2 text-[#111111]"
              style={{ fontFamily: 'Manrope, sans-serif' }}>
            Neues Passwort setzen
          </h2>
          <p className="mb-6 text-sm text-[#7A7A7A]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Wähle ein sicheres Passwort mit mindestens 8 Zeichen.
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-[var(--vektrus-radius-sm)] text-sm text-[#FA7E70]"
                 style={{ backgroundColor: 'rgba(250,126,112,0.1)', fontFamily: 'Inter, sans-serif' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Neues Passwort */}
            <div>
              <label className="block text-sm font-medium mb-1.5 text-[#111111]"
                     style={{ fontFamily: 'Inter, sans-serif' }}>
                Neues Passwort
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A7A7A]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Mindestens 8 Zeichen"
                  className="w-full pl-10 pr-10 py-3 rounded-[var(--vektrus-radius-sm)] text-sm outline-none transition-all text-[#111111]"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    border: '1px solid #E0E0E0',
                    height: '46px',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#49B7E3')}
                  onBlur={(e) => (e.target.style.borderColor = '#E0E0E0')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A7A7A]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {strength && (
                <div className="mt-2">
                  <div className="h-1 rounded-full bg-[#F4FCFE] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: strength.width, backgroundColor: strength.color }}
                    />
                  </div>
                  <p className="text-xs mt-1" style={{ color: strength.color, fontFamily: 'Inter, sans-serif' }}>
                    {strength.label}
                  </p>
                </div>
              )}
            </div>

            {/* Bestätigen */}
            <div>
              <label className="block text-sm font-medium mb-1.5 text-[#111111]"
                     style={{ fontFamily: 'Inter, sans-serif' }}>
                Passwort bestätigen
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A7A7A]" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Passwort wiederholen"
                  className="w-full pl-10 pr-10 py-3 rounded-[var(--vektrus-radius-sm)] text-sm outline-none transition-all text-[#111111]"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    border: `1px solid ${confirmPassword && confirmPassword !== password ? '#FA7E70' : '#E0E0E0'}`,
                    height: '46px',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#49B7E3')}
                  onBlur={(e) => (e.target.style.borderColor = confirmPassword !== password ? '#FA7E70' : '#E0E0E0')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A7A7A]"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p className="text-xs mt-1 text-[#FA7E70]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Passwörter stimmen nicht überein
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !password || !confirmPassword}
              className="w-full py-3 rounded-[var(--vektrus-radius-sm)] text-sm font-semibold text-white transition-opacity"
              style={{
                fontFamily: 'Inter, sans-serif',
                backgroundColor: '#49B7E3',
                opacity: isLoading || !password || !confirmPassword ? 0.6 : 1,
                cursor: isLoading || !password || !confirmPassword ? 'not-allowed' : 'pointer',
              }}
            >
              {isLoading ? 'Wird gespeichert…' : 'Passwort speichern'}
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