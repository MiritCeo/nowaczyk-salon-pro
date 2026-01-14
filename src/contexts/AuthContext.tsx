import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/services/api';
import { Employee } from '@/types';

// ============================================
// TRYB TESTOWY - WYŁĄCZ LOGOWANIE
// ============================================
// Ustaw na true, aby pominąć logowanie (tylko do testów!)
const TEST_MODE_NO_AUTH = false; // ⚠️ ZMIEŃ NA false PO TESTOWANIU!

// Mock user dla trybu testowego
const MOCK_USER: Employee = {
  id: 1,
  name: 'Test User',
  email: 'test@nowaczyk.pl',
  role: 'admin',
  is_active: true,
  created_at: new Date().toISOString(),
};

// ============================================

interface AuthContextType {
  user: Employee | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Employee | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sprawdź token przy starcie
  useEffect(() => {
    // TRYB TESTOWY - automatycznie zaloguj mock usera
    if (TEST_MODE_NO_AUTH) {
      console.log('🧪 TRYB TESTOWY: Logowanie wyłączone - używam mock usera');
      setUser(MOCK_USER);
      setToken('test-token-bypass');
      setIsLoading(false);
      return;
    }

    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // TRYB TESTOWY - pomiń logowanie
    if (TEST_MODE_NO_AUTH) {
      console.log('🧪 TRYB TESTOWY: Login pominięty - używam mock usera');
      setUser(MOCK_USER);
      setToken('test-token-bypass');
      return;
    }

    try {
      console.log('🔵 AuthContext: Wysyłam request do API...');
      const response = await authAPI.login(email, password);
      console.log('✅ AuthContext: Otrzymano response:', response);
      console.log('✅ AuthContext: response.data:', response.data);
      
      const { user, token } = response.data;
      
      if (!user || !token) {
        console.error('❌ AuthContext: Brak user lub token w response:', { user, token });
        throw new Error('Nieprawidłowa odpowiedź z serwera');
      }
      
      console.log('✅ AuthContext: Zapisuję token i user...');
      setUser(user);
      setToken(token);
      
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      console.log('✅ AuthContext: Token i user zapisane w localStorage');
    } catch (error: any) {
      console.error('❌ AuthContext: Błąd logowania:', error);
      console.error('❌ AuthContext: Error response:', error.response);
      throw new Error(error.response?.data?.message || error.message || 'Błąd logowania');
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isLoading,
        isAuthenticated: TEST_MODE_NO_AUTH ? true : !!token, // W trybie testowym zawsze true
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
