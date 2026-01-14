import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Mail, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('🔵 LoginPage: Wywołuję login()...');
      await login(email, password);
      console.log('✅ LoginPage: Zalogowano pomyślnie!');
      console.log('🔵 LoginPage: Sprawdzam token w localStorage...');
      const token = localStorage.getItem('auth_token');
      console.log('🔵 LoginPage: Token w localStorage:', token ? 'TAK' : 'NIE');
      
      toast({
        title: 'Zalogowano pomyślnie',
        description: 'Witaj w panelu Nowaczyk Salon Pro',
      });
      
      // Użyj setTimeout aby dać czas na aktualizację state w AuthContext
      setTimeout(() => {
        console.log('🔵 LoginPage: Przekierowuję do /...');
        navigate('/', { replace: true });
        console.log('✅ LoginPage: navigate() wywołane');
      }, 100);
    } catch (err: any) {
      console.error('❌ Błąd logowania:', err);
      console.error('❌ Error message:', err.message);
      console.error('❌ Error response:', err.response);
      setError(err.message || 'Błąd logowania');
      toast({
        variant: 'destructive',
        title: 'Błąd logowania',
        description: err.message || 'Sprawdź email i hasło',
      });
    } finally {
      setIsLoading(false);
      console.log('🔵 Logowanie zakończone (finally)');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Nowaczyk Salon Pro</CardTitle>
          <CardDescription>
            Zaloguj się do panelu administracyjnego
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="michal@nowaczyk.pl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                Hasło
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="bg-input border-border"
              />
            </div>

            <Button
              type="submit"
              className="w-full gradient-brand shadow-button"
              disabled={isLoading}
            >
              {isLoading ? 'Logowanie...' : 'Zaloguj się'}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
