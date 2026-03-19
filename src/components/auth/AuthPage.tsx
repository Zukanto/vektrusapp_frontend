import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import ForgotPasswordForm from './ForgotPasswordForm';

interface AuthPageProps {
  onSuccess: () => void;
}

type AuthMode = 'login' | 'signup' | 'forgot-password';

const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('login');

  return (
    <div className="min-h-screen bg-[#F4FCFE] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="animate-in fade-in-0 duration-300 flex items-center justify-center mb-4">
          <img
            src="https://res.cloudinary.com/dcgwtngml/image/upload/v1756214658/vektrus_H21_kjgkdv.png"
            alt="Vektrus Logo"
            className="h-10 w-auto"
          />
        </div>

        {/* Auth Form Container */}
        <div className="bg-white rounded-[var(--vektrus-radius-md)] p-8 shadow-elevated border border-[rgba(73,183,227,0.18)]">
          {mode === 'login' && (
            <LoginForm
              onSuccess={onSuccess}
              onSwitchToSignup={() => setMode('signup')}
              onForgotPassword={() => setMode('forgot-password')}
            />
          )}
          
          {mode === 'signup' && (
            <SignupForm
              onSuccess={onSuccess}
              onSwitchToLogin={() => setMode('login')}
            />
          )}
          
          {mode === 'forgot-password' && (
            <ForgotPasswordForm
              onBack={() => setMode('login')}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;