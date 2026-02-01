import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Mail, AlertCircle, Sparkles, ShieldCheck, BarChart3 } from 'lucide-react';
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
        description: 'Witaj w panelu Garage 22',
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

  const handleFillDemo = () => {
    setEmail('michal@nowaczyk.pl');
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10">
        <div className="grid w-full gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Demo panelu zarządzania salonem
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-bold lg:text-4xl page-title">
                Nowoczesne rozliczenia i pełna kontrola nad wizytami
              </h1>
              <p className="text-muted-foreground text-base lg:text-lg">
                Poznaj system, który łączy kalendarz, klientów i płatności w jednym miejscu. 
                Sprawdź demo bez zobowiązań.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/70 p-4 shadow-card">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Bezpieczne dane</p>
                  <p className="text-sm text-muted-foreground">Uprawnienia i role dla zespołu.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/70 p-4 shadow-card">
                <BarChart3 className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Szybkie podsumowania</p>
                  <p className="text-sm text-muted-foreground">Kto zalega i ile jest do zapłaty.</p>
                </div>
              </div>
            </div>
          </div>

          <Card className="w-full max-w-md justify-self-center">
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">Zaloguj się do demo</CardTitle>
              <CardDescription>
                Użyj konta testowego poniżej
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
                <p className="font-semibold text-foreground">Dane demo</p>
                <p className="text-muted-foreground">Email: michal@nowaczyk.pl</p>
                <p className="text-muted-foreground">Hasło: password123</p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-3 w-full"
                  onClick={handleFillDemo}
                >
                  Uzupełnij dane demo
                </Button>
              </div>

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
                    placeholder="demo@garage22.app"
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
      </div>
    </div>
  );
}
