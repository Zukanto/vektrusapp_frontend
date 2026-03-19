import React, { useEffect } from 'react';
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SuccessPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect after 10 seconds
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleContinue = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F4FCFE] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Success Animation */}
        <div className="mb-8 relative">
          <div className="w-24 h-24 bg-[#49D69E] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          
          {/* Sparkles Animation */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
            <Sparkles className="w-6 h-6 text-[#49B7E3] animate-bounce" style={{ animationDelay: '0s' }} />
          </div>
          <div className="absolute top-4 right-1/4">
            <Sparkles className="w-4 h-4 text-[#B6EBF7] animate-bounce" style={{ animationDelay: '0.5s' }} />
          </div>
          <div className="absolute top-4 left-1/4">
            <Sparkles className="w-4 h-4 text-[#49D69E] animate-bounce" style={{ animationDelay: '1s' }} />
          </div>
        </div>

        {/* Success Message */}
        <div className="bg-white rounded-[var(--vektrus-radius-md)] p-8 shadow-lg border border-[rgba(73,183,227,0.18)] mb-6">
          <h1 className="text-3xl font-bold text-[#111111] mb-4">
            🎉 {signupData ? `Willkommen bei Vektrus, ${signupData.firstName}!` : 'Willkommen bei Vektrus!'}
          </h1>
          
          <p className="text-[#7A7A7A] mb-6 leading-relaxed">
            {signupData 
              ? 'Dein Konto wurde erfolgreich erstellt und deine Zahlung war erfolgreich. Du hast jetzt vollen Zugriff auf alle Vektrus AI Features!'
              : 'Deine Zahlung war erfolgreich und dein Konto ist jetzt aktiviert. Du hast vollen Zugriff auf alle Vektrus AI Features.'
            }
          </p>

          {/* What's Next */}
          <div className="bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] p-6 mb-6 border border-[#B6EBF7]">
            <h3 className="font-semibold text-[#111111] mb-3">Was passiert als nächstes?</h3>
            <ul className="text-sm text-[#7A7A7A] space-y-2 text-left">
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-[#49D69E] rounded-full"></span>
                <span>Zugang zu deinem personalisierten Dashboard</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-[#49D69E] rounded-full"></span>
                <span>AI-gestützte Content-Empfehlungen</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-[#49D69E] rounded-full"></span>
                <span>Intelligente Planungstools</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-[#49D69E] rounded-full"></span>
                <span>Detaillierte Performance-Insights</span>
              </li>
            </ul>
          </div>

          <button
            onClick={handleContinue}
            className="w-full bg-[#B6EBF7] hover:bg-[#49B7E3] text-[#111111] py-4 px-6 rounded-[var(--vektrus-radius-md)] font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-lg flex items-center justify-center space-x-2"
          >
            <span>Zum Dashboard</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Auto-redirect Notice */}
        <p className="text-sm text-[#7A7A7A]">
          Du wirst automatisch in 10 Sekunden weitergeleitet...
        </p>
      </div>
    </div>
  );
};

export default SuccessPage;