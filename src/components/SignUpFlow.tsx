import React, { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useToast } from './ui/toast';
import { useAuth } from '../hooks/useAuth';

interface SignUpFlowProps {
  onComplete: (data: { email: string; password: string }) => void;
  onBack: () => void;
}

const SignUpFlow: React.FC<SignUpFlowProps> = ({ onComplete, onBack }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();
  const { signUp, signIn } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'E-Mail ist erforderlich';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Ungültige E-Mail-Adresse';
    }

    if (!formData.password) {
      newErrors.password = 'Passwort ist erforderlich';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Passwort muss mindestens 8 Zeichen haben';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwörter stimmen nicht überein';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // Auth-User + users-Row + Team erstellen (Profildaten folgen im Onboarding)
      const result = await signUp(formData.email, formData.password, '', '', '', '');

      if (result.error) {
        throw result.error;
      }

      // Auto-Login nach erfolgreicher Registrierung
      await signIn(formData.email, formData.password);

      addToast({
        type: 'success',
        title: 'Willkommen bei Vektrus!',
        description: 'Dein Konto wurde erfolgreich erstellt.',
        duration: 4000,
      });

      // Weiterleitung zum Onboarding
      window.location.href = '/onboarding';
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Registrierung fehlgeschlagen',
        description: error.message || 'Bitte versuche es später erneut.',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBase =
    'w-full h-12 rounded-[10px] bg-white px-4 text-[14px] text-[var(--vektrus-anthrazit)] placeholder:text-[var(--vektrus-gray)]/60 transition-all duration-150 focus:outline-none focus:border-[var(--vektrus-blue)] focus:ring-2 focus:ring-[rgba(73,183,227,0.15)]';

  return (
    <div className="min-h-screen bg-[var(--vektrus-mint)] flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="/vektrus-logo.svg"
            alt="Vektrus"
            className="h-8 mx-auto"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-[0_4px_40px_rgba(73,183,227,0.08)] p-8 sm:p-10">
          <div className="text-center mb-8">
            <h2 className="font-manrope font-bold text-[28px] text-[var(--vektrus-anthrazit)] mb-2">Konto erstellen</h2>
            <p className="text-[15px] text-[var(--vektrus-gray)]">Registriere dich und starte mit Vektrus</p>
          </div>

          <div className="space-y-5">
            {/* E-Mail */}
            <div>
              <label className="text-[13px] font-medium text-[var(--vektrus-anthrazit)] block mb-1.5">E-Mail-Adresse</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="deine@email.com"
                autoComplete="email"
                className={`${inputBase} border ${errors.email ? 'border-[#FA7E70]' : 'border-[#E5E7EB]'}`}
              />
              {errors.email && <p className="text-[#FA7E70] text-[13px] mt-1">{errors.email}</p>}
            </div>

            {/* Passwort */}
            <div>
              <label className="text-[13px] font-medium text-[var(--vektrus-anthrazit)] block mb-1.5">Passwort</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  placeholder="Mindestens 8 Zeichen"
                  autoComplete="new-password"
                  className={`${inputBase} border pr-11 ${errors.password ? 'border-[#FA7E70]' : 'border-[#E5E7EB]'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--vektrus-gray)] hover:text-[var(--vektrus-anthrazit)] transition-colors"
                >
                  {showPassword ?
                    <EyeOff className="w-[18px] h-[18px]" /> :
                    <Eye className="w-[18px] h-[18px]" />
                  }
                </button>
              </div>
              {errors.password && <p className="text-[#FA7E70] text-[13px] mt-1">{errors.password}</p>}
            </div>

            {/* Passwort bestätigen */}
            <div>
              <label className="text-[13px] font-medium text-[var(--vektrus-anthrazit)] block mb-1.5">Passwort bestätigen</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  placeholder="Passwort wiederholen"
                  autoComplete="new-password"
                  className={`${inputBase} border pr-11 ${errors.confirmPassword ? 'border-[#FA7E70]' : 'border-[#E5E7EB]'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--vektrus-gray)] hover:text-[var(--vektrus-anthrazit)] transition-colors"
                >
                  {showConfirmPassword ?
                    <EyeOff className="w-[18px] h-[18px]" /> :
                    <Eye className="w-[18px] h-[18px]" />
                  }
                </button>
              </div>
              {errors.confirmPassword && <p className="text-[#FA7E70] text-[13px] mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full mt-8 py-3 rounded-xl font-semibold text-white transition-colors duration-150 ${
              isSubmitting
                ? 'bg-[var(--vektrus-blue)]/60 cursor-not-allowed'
                : 'bg-[var(--vektrus-blue)] hover:bg-[#3a9fd1]'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Konto wird erstellt…
              </span>
            ) : (
              'Konto erstellen'
            )}
          </button>

          {/* Login-Link */}
          <p className="text-center text-[14px] text-[var(--vektrus-gray)] mt-6">
            Bereits ein Konto?{' '}
            <button
              onClick={onBack}
              className="text-[var(--vektrus-blue)] font-medium hover:underline transition-colors"
            >
              Jetzt anmelden
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpFlow;
