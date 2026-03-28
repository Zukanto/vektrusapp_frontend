import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);

  const isOnboardingRoute = location.pathname === '/onboarding';

  useEffect(() => {
    if (!user || isOnboardingRoute) {
      setOnboardingChecked(true);
      return;
    }

    const checkOnboarding = async () => {
      const { data } = await supabase
        .from('users')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single();

      setOnboardingCompleted(data?.onboarding_completed === true);
      setOnboardingChecked(true);
    };

    checkOnboarding();
  }, [user, isOnboardingRoute]);

  if (loading || !onboardingChecked) {
    return (
      <div className="min-h-screen bg-[#F4FCFE] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#49B7E3] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#7A7A7A]">Lade Vektrus...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User eingeloggt aber Onboarding nicht fertig → ab zum Wizard
  if (!isOnboardingRoute && onboardingCompleted === false) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
