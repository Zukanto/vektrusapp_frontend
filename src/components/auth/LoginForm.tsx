import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, CircleAlert as AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../ui/toast';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToSignup?: () => void;
  onForgotPassword?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToSignup, onForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { signIn } = useAuth();
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setFormError(null);

    if (!email || !password) {
      setFormError('Bitte fülle alle Felder aus.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        const msg = error.message === 'Invalid login credentials'
          ? 'E-Mail oder Passwort ist falsch. Bitte überprüfe deine Eingaben.'
          : error.message;
        setFormError(msg);
        return;
      }

      addToast({
        type: 'success',
        title: 'Erfolgreich angemeldet',
        description: 'Willkommen zurück bei Vektrus!',
      });

      onSuccess?.();
    } catch {
      setFormError('Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es später erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#111111] mb-2">Willkommen zurück</h1>
        <p className="text-[#7A7A7A]">Melde dich in deinem Vektrus-Konto an</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="text-sm font-medium text-[#7A7A7A] block mb-2">
            E-Mail Adresse
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#7A7A7A]" />
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setFormError(null); }}
              placeholder="deine@email.com"
              className="w-full pl-10 pr-4 py-3 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] focus:outline-none focus:ring-2 focus:ring-[#49B7E3] focus:border-[#49B7E3] transition-all"
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-[#7A7A7A] block mb-2">
            Passwort
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#7A7A7A]" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setFormError(null); }}
              placeholder="Dein Passwort"
              className="w-full pl-10 pr-12 py-3 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] focus:outline-none focus:ring-2 focus:ring-[#49B7E3] focus:border-[#49B7E3] transition-all"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#7A7A7A] hover:text-[#111111] transition-colors"
              disabled={loading}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 text-[#49B7E3] border-gray-300 rounded-[var(--vektrus-radius-sm)] focus:ring-[#49B7E3]"
            />
            <span className="text-sm text-[#7A7A7A]">Angemeldet bleiben</span>
          </label>
          
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-[#49B7E3] hover:text-[#49B7E3]/80 transition-colors"
            disabled={loading}
          >
            Passwort vergessen?
          </button>
        </div>

        {formError && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-[var(--vektrus-radius-md)] bg-[#FFF5F5] border border-[#FFCCC9]">
            <AlertCircle className="w-4 h-4 text-[#FA7E70] mt-0.5 flex-shrink-0" />
            <p className="text-sm text-[#FA7E70]">{formError}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 rounded-[var(--vektrus-radius-md)] font-medium transition-all duration-200 ${
            loading
              ? 'bg-gray-300 text-[#7A7A7A] cursor-not-allowed'
              : 'bg-[#B6EBF7] hover:bg-[#49B7E3] text-[#111111] hover:scale-[1.02] hover:shadow-lg'
          }`}
        >
          {loading ? 'Anmeldung läuft...' : 'Anmelden'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-[#7A7A7A]">
          Noch kein Konto?{' '}
          <button
            onClick={onSwitchToSignup}
            className="text-[#49B7E3] hover:text-[#49B7E3]/80 font-medium transition-colors"
            disabled={loading}
          >
            Jetzt registrieren
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;