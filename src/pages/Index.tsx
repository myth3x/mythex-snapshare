import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Upload, Search, Share2, Zap, Shield, Rocket } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[image:var(--gradient-bg)]">
      <header className="container mx-auto px-4 py-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Camera className="h-10 w-10 text-primary animate-glow" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              myth3x.pics
            </h1>
          </div>
          {!user && (
            <Button onClick={() => navigate('/auth')} className="bg-[image:var(--gradient-primary)] hover:scale-105 transition-transform">
              Acces privat
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center space-y-8 mb-16 animate-fade-in">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="bg-[image:var(--gradient-fire)] bg-clip-text text-transparent">
              Hosting privat
            </span>
            <span className="block text-foreground mt-2">ultra-securizat</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Salut myth3x, aici sunt toate pozele tale. Pentru a le vedea trebuie să te loghezi în platformă.
          </p>
        </div>

        {user ? (
          <div className="max-w-4xl mx-auto mb-16">
            <ImageUpload />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="relative overflow-hidden group hover:scale-105 transition-all duration-300 animate-slide-in bg-[image:var(--gradient-card)] border-primary/20">
              <CardHeader>
                <Zap className="h-12 w-12 text-primary mb-4 animate-float" />
                <CardTitle className="text-xl">Upload instant</CardTitle>
                <CardDescription className="text-base">
                  Drag & drop direct în browser sau integrare automată cu ShareX
                </CardDescription>
              </CardHeader>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </Card>

            <Card className="relative overflow-hidden group hover:scale-105 transition-all duration-300 animate-slide-in bg-[image:var(--gradient-card)] border-primary/20" style={{animationDelay: '0.2s'}}>
              <CardHeader>
                <Shield className="h-12 w-12 text-accent mb-4 animate-float" style={{animationDelay: '1s'}} />
                <CardTitle className="text-xl">Securitate maximă</CardTitle>
                <CardDescription className="text-base">
                  Acces privat cu autentificare și control complet asupra vizibilității
                </CardDescription>
              </CardHeader>
              <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </Card>

            <Card className="relative overflow-hidden group hover:scale-105 transition-all duration-300 animate-slide-in bg-[image:var(--gradient-card)] border-primary/20" style={{animationDelay: '0.4s'}}>
              <CardHeader>
                <Rocket className="h-12 w-12 text-primary-glow mb-4 animate-float" style={{animationDelay: '2s'}} />
                <CardTitle className="text-xl">Linkuri custom</CardTitle>
                <CardDescription className="text-base">
                  Generare automată de linkuri scurte myth3x.pics/xyz123
                </CardDescription>
              </CardHeader>
              <div className="absolute inset-0 bg-gradient-to-r from-primary-glow/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </Card>
          </div>
        )}

        {!user && (
          <Card className="relative overflow-hidden bg-[image:var(--gradient-primary)] border-none shadow-[var(--shadow-elegant)] animate-glow">
            <CardContent className="p-12 text-center">
              <h3 className="text-3xl font-bold mb-4 text-primary-foreground">Acces exclusiv</h3>
              <p className="text-primary-foreground/90 mb-8 text-lg">
                Platformă privată cu acces restricționat. Solicită acces pentru hosting securizat.
              </p>
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')} 
                variant="secondary"
                className="bg-background/90 text-foreground hover:bg-background hover:scale-105 transition-all duration-300 px-8 py-3"
              >
                Solicită acces
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <footer className="container mx-auto px-4 py-8 border-t border-primary/20 animate-fade-in">
        <div className="text-center text-muted-foreground">
          <p>&copy; 2025 myth3x.pics - Private screenshot hosting platform</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
