import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Upload, Search, Share2 } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Camera className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">myth3x.pics</h1>
          </div>
          <Button onClick={() => navigate('/auth')}>
            Conectează-te
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center space-y-8 mb-16">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
            Screenshot sharing
            <span className="text-primary block">simplificat</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Încarcă, organizează și partajează screenshot-urile tale cu linkuri personalizate. 
            Integrare perfectă cu ShareX și alte tools.
          </p>
          <div className="space-x-4">
            <Button size="lg" onClick={() => navigate('/auth')}>
              Începe acum
            </Button>
            <Button variant="outline" size="lg">
              Vezi demo
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <Upload className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Upload rapid</CardTitle>
              <CardDescription>
                Încarcă screenshot-urile direct din ShareX sau drag & drop în browser
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Search className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Organizare inteligentă</CardTitle>
              <CardDescription>
                Găsește-ți pozele rapid cu căutare avansată și organizare pe luni
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Share2 className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Partajare simplă</CardTitle>
              <CardDescription>
                Linkuri scurte personalizate gen myth3x.pics/abc123 pentru fiecare poză
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Gata să începi?</h3>
            <p className="text-muted-foreground mb-6">
              Creează-ți contul și configurează ShareX în câteva minute
            </p>
            <Button size="lg" onClick={() => navigate('/auth')}>
              Înregistrează-te gratuit
            </Button>
          </CardContent>
        </Card>
      </main>

      <footer className="container mx-auto px-4 py-8 border-t">
        <div className="text-center text-muted-foreground">
          <p>&copy; 2024 myth3x.pics - Screenshot sharing pentru profesioniști</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
