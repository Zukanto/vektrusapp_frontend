import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider, useToast } from './components/ui/toast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { MediaInsertProvider } from './hooks/useMediaInsert';
import { PulseGenerationProvider, usePulseGeneration } from './hooks/usePulseGeneration';
import PulseCompletionToast from './components/planner/wizard/PulseCompletionToast';
import WizardRoot from './components/planner/wizard/WizardRoot';
import { OnboardingTour } from './components/OnboardingTour';
import SignUpFlow from './components/SignUpFlow';
import { CalendarService } from './services/calendarService';
import { ContentSlot } from './components/planner/types';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './components/LoginPage';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';
import ResetPasswordPage from './components/auth/ResetPasswordPage';
import LoggedOutPage from './components/auth/LoggedOutPage';
import Onboarding from './pages/Onboarding';

function PulseToastRenderer() {
  const pulse = usePulseGeneration();
  const navigateToModule = React.useRef<((m: string) => void) | null>(null);

  React.useEffect(() => {
    const handler = (e: CustomEvent) => {
      navigateToModule.current = e.detail;
    };
    window.addEventListener('register-module-navigate' as any, handler);
    return () => window.removeEventListener('register-module-navigate' as any, handler);
  }, []);

  if (!pulse.toastData) return null;

  const handleAction = () => {
    pulse.dismissToast();
    if (pulse.toastData?.variant === 'error') {
      pulse.reopenPopup();
    }
    navigateToModule.current?.('planner');
  };

  return (
    <PulseCompletionToast
      data={pulse.toastData}
      onDismiss={pulse.dismissToast}
      onAction={handleAction}
    />
  );
}

function PulseWizardPopup() {
  const pulse = usePulseGeneration();
  const { addToast } = useToast();
  const navigateToModule = React.useRef<((m: string) => void) | null>(null);

  React.useEffect(() => {
    const handler = (e: CustomEvent) => {
      navigateToModule.current = e.detail;
    };
    window.addEventListener('register-module-navigate' as any, handler);
    return () => window.removeEventListener('register-module-navigate' as any, handler);
  }, []);

  if (!pulse.popupOpen) return null;

  const combineDateTime = (date: Date, time?: string): Date => {
    const combined = new Date(date);
    if (time) {
      const [hours, minutes] = time.split(':').map(Number);
      combined.setHours(hours, minutes, 0, 0);
    }
    return combined;
  };

  const handleWizardComplete = async (generatedSlots: ContentSlot[]) => {
    try {
      let savedCount = 0;

      for (const slot of generatedSlots) {
        try {
          await CalendarService.createPost({
            platform: slot.platform,
            content: CalendarService.buildContentJsonb(slot),
            scheduled_date: combineDateTime(slot.date, slot.time),
            status: slot.status === 'planned' ? 'scheduled' : slot.status,
            content_type: slot.contentType,
          });
          savedCount++;
        } catch {
          // skip failed save
        }
      }

      if (savedCount > 0) {
        addToast({
          type: 'success',
          title: 'Content-Plan erstellt!',
          description: `${savedCount} Posts wurden automatisch geplant.`,
          duration: 4000,
        });
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Fehler',
        description: 'Posts konnten nicht gespeichert werden.',
        duration: 3000,
      });
    } finally {
      pulse.dismissPopup();
      pulse.reset();
      navigateToModule.current?.('planner');
    }
  };

  const handleClose = () => {
    pulse.dismissPopup();
    if (!pulse.isGenerating) {
      pulse.reset();
    }
  };

  return (
    <WizardRoot
      onComplete={handleWizardComplete}
      onClose={handleClose}
    />
  );
}

function RegisterPage() {
  const handleBack = () => {
    window.location.href = '/login';
  };

  return <SignUpFlow onComplete={() => {}} onBack={handleBack} />;
}

function LoginRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4FCFE] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#49B7E3] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#7A7A7A]">Lade Vektrus...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <LoginPage onLogin={() => {}} />;
}

function RegisterRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4FCFE] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#49B7E3] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#7A7A7A]">Lade Vektrus...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <RegisterPage />;
}

function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/logged-out" element={<LoggedOutPage />} />
        <Route path="/register" element={<RegisterRoute />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
      <PulseWizardPopup />
      <PulseToastRenderer />
      <OnboardingTour />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MediaInsertProvider>
          <ToastProvider>
            <PulseGenerationProvider>
              <AppRoutes />
            </PulseGenerationProvider>
          </ToastProvider>
        </MediaInsertProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
