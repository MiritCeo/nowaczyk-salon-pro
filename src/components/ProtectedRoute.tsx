import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

// ============================================
// TRYB TESTOWY - WYŁĄCZ LOGOWANIE
// ============================================
const TEST_MODE_NO_AUTH = false; // ⚠️ ZMIEŃ NA false PO TESTOWANIU!
// ============================================

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  
  // TRYB TESTOWY - zawsze pozwól na dostęp
  if (TEST_MODE_NO_AUTH) {
    console.log('🧪 TRYB TESTOWY: ProtectedRoute pomija autoryzację');
    return <>{children}</>;
  }
  
  // Sprawdź również localStorage jako fallback (dla szybkiego sprawdzenia po logowaniu)
  const hasToken = typeof window !== 'undefined' && localStorage.getItem('auth_token');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Ładowanie...</p>
        </div>
      </div>
    );
  }

  // Użyj hasToken jako fallback jeśli isAuthenticated jeszcze się nie zaktualizował
  if (!isAuthenticated && !hasToken) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
