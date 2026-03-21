import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, User, Building, ChevronDown, CreditCard, FileText } from 'lucide-react';
import { createCheckoutSession } from '../services/stripe';
import { useToast } from './ui/toast';
import { products } from '../stripe-config';
import { useAuth } from '../hooks/useAuth';

interface SignUpData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  companyName: string;
  role: string;
  paymentMethod: 'invoice' | 'stripe' | '';
  billingInfo?: {
    companyName: string;
    street: string;
    postalCode: string;
    city: string;
    country: string;
    vatId: string;
    billingEmail: string;
  };
}

interface SignUpFlowProps {
  onComplete: (data: SignUpData) => void;
  onBack: () => void;
}

const SignUpFlow: React.FC<SignUpFlowProps> = ({ onComplete, onBack }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { addToast } = useToast();
  const { signUp, signIn, createFullAccount } = useAuth();
  const [formData, setFormData] = useState<SignUpData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    companyName: '',
    role: '',
    paymentMethod: '',
    billingInfo: {
      companyName: '',
      street: '',
      postalCode: '',
      city: '',
      country: '',
      vatId: '',
      billingEmail: ''
    }
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // TEMPORARY: Payment step hidden — re-enable by setting to false
  const HIDE_PAYMENT_STEP = true;

  const totalSteps = HIDE_PAYMENT_STEP ? 3 : 4;

  const roles = [
    'Founder',
    'Marketer',
    'Creator',
    'Social Media Manager',
    'Other'
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
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
    }

    if (step === 2) {
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'Vorname ist erforderlich';
      }
      if (!formData.companyName.trim()) {
        newErrors.companyName = 'Unternehmen/Marke ist erforderlich';
      }
      if (!formData.role) {
        newErrors.role = 'Rolle ist erforderlich';
      }
    }

    if (step === 3) {
      if (!formData.paymentMethod) {
        newErrors.paymentMethod = 'Zahlungsmethode ist erforderlich';
      }
      
      if (formData.paymentMethod === 'invoice') {
        if (!formData.billingInfo?.companyName.trim()) {
          newErrors.companyName = 'Firmenname ist erforderlich';
        }
        if (!formData.billingInfo?.street.trim()) {
          newErrors.street = 'Straße und Hausnummer sind erforderlich';
        }
        if (!formData.billingInfo?.postalCode.trim()) {
          newErrors.postalCode = 'PLZ ist erforderlich';
        }
        if (!formData.billingInfo?.city.trim()) {
          newErrors.city = 'Ort ist erforderlich';
        }
        if (!formData.billingInfo?.country.trim()) {
          newErrors.country = 'Land ist erforderlich';
        }
        if (!formData.billingInfo?.billingEmail.trim()) {
          newErrors.billingEmail = 'Rechnungs-E-Mail ist erforderlich';
        } else if (!/\S+@\S+\.\S+/.test(formData.billingInfo.billingEmail)) {
          newErrors.billingEmail = 'Ungültige E-Mail-Adresse';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (HIDE_PAYMENT_STEP) {
        // Steps: 1 → 2 → 4 (skip 3)
        if (currentStep === 1) setCurrentStep(2);
        else if (currentStep === 2) setCurrentStep(4);
        else if (currentStep === 4) handleCompleteSignup();
      } else {
        if (currentStep < 4) {
          setCurrentStep(currentStep + 1);
        } else {
          handleCompleteSignup();
        }
      }
    }
  };

  const handleBack = () => {
    if (HIDE_PAYMENT_STEP) {
      if (currentStep === 4) setCurrentStep(2);
      else if (currentStep === 2) setCurrentStep(1);
      else onBack();
    } else {
      if (currentStep > 1) setCurrentStep(currentStep - 1);
      else onBack();
    }
  };

  const updateFormData = (field: keyof SignUpData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCompleteSignup = async () => {
  if (!HIDE_PAYMENT_STEP && formData.paymentMethod === 'stripe') {
    await handleStripeCheckout();
  } else {
    // Invoice payment (or no payment step) - nutze createFullAccount für ALLE Daten
    try {
      const { success, error } = await createFullAccount(formData);
      
      if (success && !error) {
        // Auto-Login nach erfolgreicher Registrierung
        await signIn(formData.email, formData.password);
        // Weiterleitung zum Dashboard
        window.location.href = '/toolhub';
      } else {
        throw error;
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Registrierung fehlgeschlagen',
        description: error.message || 'Bitte versuche es später erneut.',
        duration: 5000
      });
    }
  }
};  

const handleStripeCheckout = async () => {
  setIsProcessingPayment(true);
  
  try {
    // Erst ALLE Daten mit createFullAccount speichern
    const { success, error } = await createFullAccount(formData);
    
    if (!success || error) {
      throw error || new Error('Account-Erstellung fehlgeschlagen');
    }
    
    // Get the Vektrus product
    const vektrusProduct = products[0]; // Vektrus AI (Monatlich)
    
    if (!vektrusProduct) {
      throw new Error('Produkt nicht gefunden');
    }

    // Create checkout session
    const { url } = await createCheckoutSession({
      priceId: vektrusProduct.priceId,
      mode: 'subscription',
      successUrl: `${window.location.origin}/success?signup=true&user=${encodeURIComponent(formData.firstName)}`,
      cancelUrl: `${window.location.origin}/signup?step=4`,
      metadata: {
        userId: formData.email, // Für später, um User zu identifizieren
        companyName: formData.companyName
      }
    });

    if (url) {
      // Store signup data in localStorage for after payment
      localStorage.setItem('vektrus_signup_data', JSON.stringify(formData));
      
      addToast({
        type: 'info',
        title: 'Weiterleitung zu Stripe',
        description: 'Du wirst zur sicheren Zahlungsseite weitergeleitet...',
        duration: 3000
      });

      // Redirect to Stripe Checkout
      setTimeout(() => {
        window.location.href = url;
      }, 1000);
    }
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    addToast({
      type: 'error',
      title: 'Fehler bei der Zahlung',
      description: error.message || 'Bitte versuche es später erneut.',
      duration: 5000
    });
    setIsProcessingPayment(false);
  }
};

  const displayStep = HIDE_PAYMENT_STEP
    ? currentStep === 4 ? 3 : currentStep
    : currentStep;

  const renderProgressBar = () => (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-[#7A7A7A]">Schritt {displayStep} von {totalSteps}</span>
        <span className="text-sm font-medium text-[#7A7A7A]">{Math.round((displayStep / totalSteps) * 100)}%</span>
      </div>
      <div className="w-full bg-[#B6EBF7]/20 rounded-full h-2">
        <div
          className="bg-[#49B7E3] h-2 rounded-full transition-all duration-500"
          style={{ width: `${(displayStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#111111] mb-2">Konto erstellen</h2>
        <p className="text-[#7A7A7A]">Erstelle dein Vektrus-Konto in wenigen Schritten</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-[#7A7A7A] block mb-2">E-Mail Adresse *</label>
          <div className="relative">
            <input
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData('email', e.target.value)}
              placeholder="deine@email.com"
              className={`w-full p-4 border rounded-[var(--vektrus-radius-md)] focus:outline-none focus:ring-2 focus:ring-[#B4E8E5] focus:border-transparent transition-all ${
                errors.email ? 'border-[#FA7E70]' : 'border-[#B4E8E5]'
              }`}
            />
          </div>
          {errors.email && <p className="text-[#FA7E70] text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-[#7A7A7A] block mb-2">Passwort *</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => updateFormData('password', e.target.value)}
              placeholder="Mindestens 8 Zeichen"
              className={`w-full p-4 pr-12 border rounded-[var(--vektrus-radius-md)] focus:outline-none focus:ring-2 focus:ring-[#B4E8E5] focus:border-transparent transition-all ${
                errors.password ? 'border-[#FA7E70]' : 'border-[#B4E8E5]'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              {showPassword ? 
                <EyeOff className="w-5 h-5 text-[#7A7A7A]" /> : 
                <Eye className="w-5 h-5 text-[#7A7A7A]" />
              }
            </button>
          </div>
          {errors.password && <p className="text-[#FA7E70] text-sm mt-1">{errors.password}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-[#7A7A7A] block mb-2">Passwort bestätigen *</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => updateFormData('confirmPassword', e.target.value)}
              placeholder="Passwort wiederholen"
              className={`w-full p-4 pr-12 border rounded-[var(--vektrus-radius-md)] focus:outline-none focus:ring-2 focus:ring-[#B4E8E5] focus:border-transparent transition-all ${
                errors.confirmPassword ? 'border-[#FA7E70]' : 'border-[#B4E8E5]'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              {showConfirmPassword ? 
                <EyeOff className="w-5 h-5 text-[#7A7A7A]" /> : 
                <Eye className="w-5 h-5 text-[#7A7A7A]" />
              }
            </button>
          </div>
          {errors.confirmPassword && <p className="text-[#FA7E70] text-sm mt-1">{errors.confirmPassword}</p>}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#111111] mb-2">Profil einrichten</h2>
        <p className="text-[#7A7A7A]">Erzähle uns etwas über dich und dein Unternehmen</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-[#7A7A7A] block mb-2">Vorname *</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#B4E8E5]" />
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => updateFormData('firstName', e.target.value)}
              placeholder="Dein Vorname"
              className={`w-full p-4 pl-12 border rounded-[var(--vektrus-radius-md)] focus:outline-none focus:ring-2 focus:ring-[#B4E8E5] focus:border-transparent transition-all ${
                errors.firstName ? 'border-[#FA7E70]' : 'border-[#B4E8E5]'
              }`}
            />
          </div>
          {errors.firstName && <p className="text-[#FA7E70] text-sm mt-1">{errors.firstName}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-[#7A7A7A] block mb-2">Unternehmen/Marke *</label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#B4E8E5]" />
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => updateFormData('companyName', e.target.value)}
              placeholder="Dein Unternehmen"
              className={`w-full p-4 pl-12 border rounded-[var(--vektrus-radius-md)] focus:outline-none focus:ring-2 focus:ring-[#B4E8E5] focus:border-transparent transition-all ${
                errors.companyName ? 'border-[#FA7E70]' : 'border-[#B4E8E5]'
              }`}
            />
          </div>
          {errors.companyName && <p className="text-[#FA7E70] text-sm mt-1">{errors.companyName}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-[#7A7A7A] block mb-2">Rolle *</label>
          <div className="relative">
            <select
              value={formData.role}
              onChange={(e) => updateFormData('role', e.target.value)}
              className={`w-full p-4 border rounded-[var(--vektrus-radius-md)] focus:outline-none focus:ring-2 focus:ring-[#B4E8E5] focus:border-transparent transition-all appearance-none bg-white ${
                errors.role ? 'border-[#FA7E70]' : 'border-[#B4E8E5]'
              }`}
            >
              <option value="">Wähle deine Rolle</option>
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#7A7A7A] pointer-events-none" />
          </div>
          {errors.role && <p className="text-[#FA7E70] text-sm mt-1">{errors.role}</p>}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#111111] mb-2">Zahlungsmethode wählen</h2>
        <p className="text-[#7A7A7A]">Wähle, wie du für deinen Vektrus Plan bezahlen möchtest</p>
        <div className="mt-4 p-4 bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] border border-[#B6EBF7]">
          <p className="text-sm font-medium text-[#111111]">
            <span className="text-2xl font-bold text-[#49B7E3]">€99</span>/Monat • Jederzeit kündbar
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Invoice Option */}
        <div
          onClick={() => updateFormData('paymentMethod', 'invoice')}
          className={`p-6 border-2 rounded-[var(--vektrus-radius-md)] cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
            formData.paymentMethod === 'invoice'
              ? 'border-[#49B7E3] bg-[#B6EBF7]/20'
              : 'border-[rgba(73,183,227,0.18)] hover:border-[#B6EBF7]'
          }`}
        >
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-[var(--vektrus-radius-sm)] flex items-center justify-center ${
              formData.paymentMethod === 'invoice' ? 'bg-[#49B7E3] text-white' : 'bg-[#F4FCFE] text-[#7A7A7A]'
            }`}>
              <FileText className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[#111111]">Rechnung</h3>
              <p className="text-sm text-[#7A7A7A]">Bezahlung per Überweisung nach Rechnungsstellung</p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 ${
              formData.paymentMethod === 'invoice' 
                ? 'border-[#49B7E3] bg-[#49B7E3]' 
                : 'border-gray-300'
            }`}>
              {formData.paymentMethod === 'invoice' && (
                <Check className="w-3 h-3 text-white m-0.5" />
              )}
            </div>
          </div>
        </div>

        {/* Stripe Option */}
        <div
          onClick={() => updateFormData('paymentMethod', 'stripe')}
          className={`p-6 border-2 rounded-[var(--vektrus-radius-md)] cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
            formData.paymentMethod === 'stripe'
              ? 'border-[#49B7E3] bg-[#B6EBF7]/20'
              : 'border-[rgba(73,183,227,0.18)] hover:border-[#B6EBF7]'
          }`}
        >
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-[var(--vektrus-radius-sm)] flex items-center justify-center ${
              formData.paymentMethod === 'stripe' ? 'bg-[#49B7E3] text-white' : 'bg-[#F4FCFE] text-[#7A7A7A]'
            }`}>
              <CreditCard className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[#111111]">Kreditkarte</h3>
              <p className="text-sm text-[#7A7A7A]">Sichere Zahlung über Stripe</p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 ${
              formData.paymentMethod === 'stripe' 
                ? 'border-[#49B7E3] bg-[#49B7E3]' 
                : 'border-gray-300'
            }`}>
              {formData.paymentMethod === 'stripe' && (
                <Check className="w-3 h-3 text-white m-0.5" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Form */}
      {formData.paymentMethod === 'invoice' && (
        <div className="mt-6 p-6 bg-[#F4FCFE] rounded-[var(--vektrus-radius-md)] space-y-4">
          <h4 className="font-semibold text-[#111111] mb-4">Rechnungsinformationen</h4>
          
          <div>
            <label className="text-sm font-medium text-[#7A7A7A] block mb-2">Firmenname *</label>
            <input
              type="text"
              value={formData.billingInfo?.companyName || ''}
              onChange={(e) => updateFormData('billingInfo', {
                ...formData.billingInfo!,
                companyName: e.target.value
              })}
              placeholder="Dein Firmenname"
              className={`w-full p-3 border rounded-[var(--vektrus-radius-sm)] focus:outline-none focus:ring-2 focus:ring-[#B4E8E5] focus:border-transparent transition-all ${
                errors.companyName ? 'border-[#FA7E70]' : 'border-[#B6EBF7]'
              }`}
            />
            {errors.companyName && <p className="text-[#FA7E70] text-sm mt-1">{errors.companyName}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-[#7A7A7A] block mb-2">Straße + Hausnummer *</label>
            <input
              type="text"
              value={formData.billingInfo?.street || ''}
              onChange={(e) => updateFormData('billingInfo', {
                ...formData.billingInfo!,
                street: e.target.value
              })}
              placeholder="Musterstraße 123"
              className={`w-full p-3 border rounded-[var(--vektrus-radius-sm)] focus:outline-none focus:ring-2 focus:ring-[#B4E8E5] focus:border-transparent transition-all ${
                errors.street ? 'border-[#FA7E70]' : 'border-[#B6EBF7]'
              }`}
            />
            {errors.street && <p className="text-[#FA7E70] text-sm mt-1">{errors.street}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[#7A7A7A] block mb-2">PLZ *</label>
              <input
                type="text"
                value={formData.billingInfo?.postalCode || ''}
                onChange={(e) => updateFormData('billingInfo', {
                  ...formData.billingInfo!,
                  postalCode: e.target.value
                })}
                placeholder="12345"
                className={`w-full p-3 border rounded-[var(--vektrus-radius-sm)] focus:outline-none focus:ring-2 focus:ring-[#B4E8E5] focus:border-transparent transition-all ${
                  errors.postalCode ? 'border-[#FA7E70]' : 'border-[#B6EBF7]'
                }`}
              />
              {errors.postalCode && <p className="text-[#FA7E70] text-sm mt-1">{errors.postalCode}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-[#7A7A7A] block mb-2">Ort *</label>
              <input
                type="text"
                value={formData.billingInfo?.city || ''}
                onChange={(e) => updateFormData('billingInfo', {
                  ...formData.billingInfo!,
                  city: e.target.value
                })}
                placeholder="Berlin"
                className={`w-full p-3 border rounded-[var(--vektrus-radius-sm)] focus:outline-none focus:ring-2 focus:ring-[#B4E8E5] focus:border-transparent transition-all ${
                  errors.city ? 'border-[#FA7E70]' : 'border-[#B6EBF7]'
                }`}
              />
              {errors.city && <p className="text-[#FA7E70] text-sm mt-1">{errors.city}</p>}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[#7A7A7A] block mb-2">Land *</label>
            <input
              type="text"
              value={formData.billingInfo?.country || ''}
              onChange={(e) => updateFormData('billingInfo', {
                ...formData.billingInfo!,
                country: e.target.value
              })}
              placeholder="Deutschland"
              className={`w-full p-3 border rounded-[var(--vektrus-radius-sm)] focus:outline-none focus:ring-2 focus:ring-[#B4E8E5] focus:border-transparent transition-all ${
                errors.country ? 'border-[#FA7E70]' : 'border-[#B6EBF7]'
              }`}
            />
            {errors.country && <p className="text-[#FA7E70] text-sm mt-1">{errors.country}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-[#7A7A7A] block mb-2">USt-IdNr. (optional)</label>
            <input
              type="text"
              value={formData.billingInfo?.vatId || ''}
              onChange={(e) => updateFormData('billingInfo', {
                ...formData.billingInfo!,
                vatId: e.target.value
              })}
              placeholder="DE123456789"
              className="w-full p-3 border border-[#B6EBF7] rounded-[var(--vektrus-radius-sm)] focus:outline-none focus:ring-2 focus:ring-[#B4E8E5] focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[#7A7A7A] block mb-2">Rechnungs-E-Mail *</label>
            <input
              type="email"
              value={formData.billingInfo?.billingEmail || ''}
              onChange={(e) => updateFormData('billingInfo', {
                ...formData.billingInfo!,
                billingEmail: e.target.value
              })}
              placeholder="rechnung@firma.de"
              className={`w-full p-3 border rounded-[var(--vektrus-radius-sm)] focus:outline-none focus:ring-2 focus:ring-[#B4E8E5] focus:border-transparent transition-all ${
                errors.billingEmail ? 'border-[#FA7E70]' : 'border-[#B6EBF7]'
              }`}
            />
            {errors.billingEmail && <p className="text-[#FA7E70] text-sm mt-1">{errors.billingEmail}</p>}
          </div>
        </div>
      )}

      {errors.paymentMethod && <p className="text-[#FA7E70] text-sm mt-1">{errors.paymentMethod}</p>}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#111111] mb-2">Fast geschafft!</h2>
        <p className="text-[#7A7A7A]">Überprüfe deine Angaben und starte mit Vektrus</p>
      </div>

      <div className="bg-white rounded-[var(--vektrus-radius-md)] p-6 border border-[#B6EBF7] space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[#7A7A7A]">E-Mail:</span>
          <span className="font-medium text-[#111111]">{formData.email}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#7A7A7A]">Name:</span>
          <span className="font-medium text-[#111111]">{formData.firstName}</span>
        </div>
        {formData.companyName && (
          <div className="flex items-center justify-between">
            <span className="text-[#7A7A7A]">Unternehmen:</span>
            <span className="font-medium text-[#111111]">{formData.companyName}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-[#7A7A7A]">Rolle:</span>
          <span className="font-medium text-[#111111]">{formData.role}</span>
        </div>
        {!HIDE_PAYMENT_STEP && (
          <div className="flex items-center justify-between">
            <span className="text-[#7A7A7A]">Zahlungsmethode:</span>
            <span className="font-medium text-[#111111]">
              {formData.paymentMethod === 'invoice' ? 'Rechnung' : 'Kreditkarte'}
            </span>
          </div>
        )}
      </div>

      <div className="bg-[#F4FCFE] rounded-[var(--vektrus-radius-md)] p-6 border border-[#B6EBF7]">
        <h3 className="font-semibold text-[#111111] mb-2">Was passiert als naechstes?</h3>
        <ul className="text-sm text-[#7A7A7A] space-y-1">
          <li>- Zugang zu deinem personalisierten Dashboard</li>
          <li>- AI-gestützte Content-Empfehlungen</li>
          <li>- Intelligente Planungstools</li>
          <li>- Detaillierte Performance-Insights</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4FCFE] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {renderProgressBar()}
        
        <div className="bg-white rounded-[var(--vektrus-radius-md)] p-8 shadow-lg border border-[rgba(73,183,227,0.18)]">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[rgba(73,183,227,0.10)]">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 text-[#7A7A7A] hover:text-[#111111] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Zurück</span>
            </button>

            <button
              onClick={handleNext}
              disabled={(!HIDE_PAYMENT_STEP && currentStep === 3 && !formData.paymentMethod) || isProcessingPayment}
              className={`flex items-center space-x-2 px-6 py-3 rounded-[var(--vektrus-radius-md)] font-medium transition-all duration-200 hover:shadow-lg hover:shadow-[#B4E8E5]/30 ${
                (!HIDE_PAYMENT_STEP && currentStep === 3 && !formData.paymentMethod) || isProcessingPayment
                  ? 'bg-gray-300 text-[#7A7A7A] cursor-not-allowed'
                  : 'bg-[#B6EBF7] hover:bg-[#49B7E3] hover:scale-105 text-[#111111]'
              }`}
            >
              {isProcessingPayment ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#111111] border-t-transparent rounded-full animate-spin" />
                  <span>Weiterleitung...</span>
                </>
              ) : (
                <span>
                  {!HIDE_PAYMENT_STEP && currentStep === 3 && formData.paymentMethod === 'stripe' ? 'Zur Zahlung' :
                   currentStep === 4 ? 'Setup abschließen' : 'Weiter'}
                </span>
              )}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpFlow;