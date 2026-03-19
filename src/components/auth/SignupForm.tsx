import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Building2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../ui/toast';

interface SignupFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { addToast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.companyName) {
      addToast({
        type: 'error',
        title: 'Fehler',
        description: 'Bitte fülle alle Felder aus.',
      });
      return false;
    }

    if (formData.password.length < 8) {
      addToast({
        type: 'error',
        title: 'Passwort zu kurz',
        description: 'Das Passwort muss mindestens 8 Zeichen lang sein.',
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      addToast({
        type: 'error',
        title: 'Passwörter stimmen nicht überein',
        description: 'Bitte überprüfe deine Passwort-Eingabe.',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const { error } = await signUp(formData.email, formData.password, 'New User', formData.companyName);
      
      if (error) {
        addToast({
          type: 'error',
          title: 'Registrierung fehlgeschlagen',
          description: error.message === 'User already registered' 
            ? 'Ein Konto mit dieser E-Mail existiert bereits.' 
            : error.message,
        });
        return;
      }

      addToast({
        type: 'success',
        title: 'Konto erfolgreich erstellt',
        description: 'Willkommen bei Vektrus! Du bist jetzt angemeldet.',
      });

      onSuccess?.();
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Unerwarteter Fehler',
        description: 'Bitte versuche es später erneut.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#111111] mb-2">Konto erstellen</h1>
        <p className="text-[#7A7A7A]">Starte deine Reise mit Vektrus</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="text-sm font-medium text-[#7A7A7A] block mb-2">
            Unternehmensname
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#7A7A7A]" />
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Dein Unternehmen"
              className="w-full pl-10 pr-4 py-3 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] focus:outline-none focus:ring-2 focus:ring-[#B6EBF7] focus:border-transparent transition-all"
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-[#7A7A7A] block mb-2">
            E-Mail Adresse
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#7A7A7A]" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="deine@email.com"
              className="w-full pl-10 pr-4 py-3 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] focus:outline-none focus:ring-2 focus:ring-[#B6EBF7] focus:border-transparent transition-all"
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
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Mindestens 8 Zeichen"
              className="w-full pl-10 pr-12 py-3 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] focus:outline-none focus:ring-2 focus:ring-[#B6EBF7] focus:border-transparent transition-all"
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

        <div>
          <label className="text-sm font-medium text-[#7A7A7A] block mb-2">
            Passwort bestätigen
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#7A7A7A]" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Passwort wiederholen"
              className="w-full pl-10 pr-12 py-3 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] focus:outline-none focus:ring-2 focus:ring-[#B6EBF7] focus:border-transparent transition-all"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#7A7A7A] hover:text-[#111111] transition-colors"
              disabled={loading}
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 rounded-[var(--vektrus-radius-md)] font-medium transition-all duration-200 ${
            loading
              ? 'bg-gray-300 text-[#7A7A7A] cursor-not-allowed'
              : 'bg-[#B6EBF7] hover:bg-[#49B7E3] text-[#111111] hover:scale-[1.02] hover:shadow-lg'
          }`}
        >
          {loading ? 'Konto wird erstellt...' : 'Konto erstellen'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-[#7A7A7A]">
          Bereits ein Konto?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-[#49B7E3] hover:text-[#49B7E3]/80 font-medium transition-colors"
            disabled={loading}
          >
            Jetzt anmelden
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignupForm;