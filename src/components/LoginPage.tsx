import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SignInPage } from './ui/sign-in';
import { useAuth } from '../hooks/useAuth';
import { useToast } from './ui/toast';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const { signIn } = useAuth();
  const { addToast } = useToast();

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await signIn(email, password);

    if (error) {
      addToast({
        type: 'error',
        title: 'Anmeldefehler',
        description: error.message || 'E-Mail oder Passwort falsch',
        duration: 4000
      });
      setIsLoading(false);
      return;
    }

    addToast({
      type: 'success',
      title: 'Willkommen zurück!',
      description: 'Du wurdest erfolgreich angemeldet.',
      duration: 3000
    });
  };

  const handleGoogleSignIn = () => {
    console.log("Google Sign In für Vektrus");
    alert("Google Anmeldung wird verarbeitet...");
  };

// NEU:
const navigate = useNavigate();
const handleResetPassword = () => {
  navigate('/forgot-password');
};

  return (
    <div className="bg-[#F4FCFE] text-[#111111] min-h-screen">
      <SignInPage
        heroImageSrc="https://res.cloudinary.com/dcgwtngml/image/upload/v1770988079/login_bild_z1e91p.png"
        onSignIn={handleSignIn}
        onGoogleSignIn={handleGoogleSignIn}
        onResetPassword={handleResetPassword}
        isLoading={isLoading}
      />
    </div>
  );
};

export default LoginPage;