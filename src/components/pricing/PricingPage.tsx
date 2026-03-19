import React, { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { products } from '../../stripe-config';
import { createCheckoutSession } from '../../services/stripe';
import { useToast } from '../ui/toast';

const PricingPage: React.FC = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const { addToast } = useToast();

  const handleSubscribe = async (priceId: string) => {
    setLoading(priceId);

    try {
      const { url } = await createCheckoutSession({
        priceId,
        mode: 'subscription',
        successUrl: `${window.location.origin}/success`,
        cancelUrl: `${window.location.origin}/pricing`,
      });

      if (url) {
        window.location.href = url;
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Fehler beim Checkout',
        description: error.message || 'Bitte versuche es später erneut.',
      });
    } finally {
      setLoading(null);
    }
  };

  const features = [
    'Unbegrenzte KI-Empfehlungen',
    'Content-Kalender & Planung',
    'Performance Analytics',
    'Multi-Platform Management',
    'Automatische Hashtag-Vorschläge',
    'Trend-Analyse',
    'Community-Insights',
    'Priority Support'
  ];

  return (
    <div className="min-h-screen bg-[#F4FCFE] py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#111111] mb-4">
            Wähle deinen <span className="text-[#49B7E3]">Vektrus</span> Plan
          </h1>
          <p className="text-xl text-[#7A7A7A] max-w-2xl mx-auto">
            Starte deine intelligente Social Media Strategie und lass KI dein Wachstum beschleunigen.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-8 max-w-2xl mx-auto">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl p-8 border-2 border-[#B6EBF7] shadow-lg hover:shadow-xl transition-all duration-200 relative overflow-hidden"
            >
              {/* Popular Badge */}
              <div className="absolute top-0 right-0 bg-[#49D69E] text-white px-4 py-2 rounded-bl-[var(--vektrus-radius-md)] text-sm font-medium">
                Beliebt
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-[#111111] mb-2">{product.name}</h3>
                <p className="text-[#7A7A7A] mb-4">{product.description}</p>
                
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-bold text-[#111111]">€{product.price}</span>
                  <span className="text-[#7A7A7A]">/Monat</span>
                </div>
              </div>

              {/* Features */}
              <div className="mb-8">
                <h4 className="font-semibold text-[#111111] mb-4">Alles enthalten:</h4>
                <ul className="space-y-3">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-[#49D69E] flex-shrink-0" />
                      <span className="text-[#7A7A7A]">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => handleSubscribe(product.priceId)}
                disabled={loading === product.priceId}
                className={`w-full py-4 px-6 rounded-[var(--vektrus-radius-md)] font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                  loading === product.priceId
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#B6EBF7] hover:bg-[#49B7E3] text-[#111111] hover:scale-[1.02] hover:shadow-lg'
                }`}
              >
                {loading === product.priceId ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Weiterleitung...</span>
                  </>
                ) : (
                  <span>Jetzt starten</span>
                )}
              </button>

              <p className="text-xs text-[#7A7A7A] text-center mt-4">
                Jederzeit kündbar • Keine Einrichtungsgebühr
              </p>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-[#B6EBF7] rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl">🔒</span>
              </div>
              <h4 className="font-semibold text-[#111111] mb-2">Sicher & Datenschutz</h4>
              <p className="text-sm text-[#7A7A7A]">DSGVO-konform und höchste Sicherheitsstandards</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-[#B6EBF7] rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl">⚡</span>
              </div>
              <h4 className="font-semibold text-[#111111] mb-2">Sofort startklar</h4>
              <p className="text-sm text-[#7A7A7A]">Setup in unter 5 Minuten, keine technischen Kenntnisse nötig</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-[#B6EBF7] rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl">💬</span>
              </div>
              <h4 className="font-semibold text-[#111111] mb-2">Premium Support</h4>
              <p className="text-sm text-[#7A7A7A]">Persönlicher Support bei Fragen und Problemen</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;