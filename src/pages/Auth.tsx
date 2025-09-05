import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Flame, Lock } from 'lucide-react';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await signIn(email, password);
    
    if (error) {
      setError(error.message);
      toast({
        title: "Acces refuzat",
        description: "Credențiale incorecte sau cont neautorizat",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Acces acordat",
        description: "Bun venit în platformă!",
      });
      navigate('/dashboard');
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const username = formData.get('username') as string;

    if (password.length < 6) {
      setError('Parola trebuie să aibă cel puțin 6 caractere');
      setIsLoading(false);
      return;
    }

    const { error } = await signUp(email, password, username);
    
    if (error) {
      setError(error.message);
      toast({
        title: "Eroare la înregistrare",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Cont creat cu succes",
        description: "Verifică-ți emailul pentru a activa contul.",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[image:var(--gradient-bg)] p-4">
      <Card className="w-full max-w-md bg-[image:var(--gradient-card)] border-primary/20 shadow-[var(--shadow-elegant)]">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 relative">
            <Flame className="h-16 w-16 text-primary animate-glow" />
          </div>
          <CardTitle className="text-3xl font-bold bg-[image:var(--gradient-fire)] bg-clip-text text-transparent">
            myth3x.pics
          </CardTitle>
          <CardDescription className="text-lg">
            Acces privat la platformă
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="signin-email" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Email autorizat
              </Label>
              <Input
                id="signin-email"
                name="email"
                type="email"
                required
                placeholder="email@authorized.com"
                className="bg-background/80"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signin-password">Parolă</Label>
              <Input
                id="signin-password"
                name="password"
                type="password"
                required
                placeholder="Parola de acces"
                className="bg-background/80"
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button 
              type="submit" 
              className="w-full bg-[image:var(--gradient-fire)] hover:scale-105 transition-transform" 
              disabled={isLoading}
            >
              {isLoading ? 'Se verifică accesul...' : 'Accesează platforma'}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Doar utilizatorii autorizați au acces la această platformă privată
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;