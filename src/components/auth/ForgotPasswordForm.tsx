import React, { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../ui/toast';

interface ForgotPasswordFormProps {
  onBack: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuth();
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      addToast({
        type: 'error',
        title: 'Fehler',
        description: 'Bitte gib deine E-Mail-Adresse ein.',
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        addToast({
          type: 'error',
          title: 'Fehler beim Zurücksetzen',
          description: error.message,
        });
        return;
      }

      setSent(true);
      addToast({
        type: 'success',
        title: 'E-Mail gesendet',
        description: 'Überprüfe dein Postfach für weitere Anweisungen.',
      });
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

  if (sent) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-[#B6EBF7] rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-[#49B7E3]" />
          </div>
          <h1 className="text-2xl font-bold text-[#111111] mb-2">E-Mail gesendet</h1>
          <p className="text-[#7A7A7A]">
            Wir haben dir eine E-Mail mit Anweisungen zum Zurücksetzen deines Passworts gesendet.
          </p>
        </div>

        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-[#49B7E3] hover:text-[#49B7E3]/80 transition-colors mx-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Zurück zur Anmeldung</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-[#111111] mb-2">Passwort zurücksetzen</h1>
        <p className="text-[#7A7A7A]">
          Gib deine E-Mail-Adresse ein und wir senden dir einen Link zum Zurücksetzen.
        </p>
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
              onChange={(e) => setEmail(e.target.value)}
              placeholder="deine@email.com"
              className="w-full pl-10 pr-4 py-3 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] focus:outline-none focus:ring-2 focus:ring-[#B6EBF7] focus:border-transparent transition-all"
              disabled={loading}
            />
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
          {loading ? 'E-Mail wird gesendet...' : 'Passwort zurücksetzen'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-[#7A7A7A] hover:text-[#111111] transition-colors mx-auto"
          disabled={loading}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Zurück zur Anmeldung</span>
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;