import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

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

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
