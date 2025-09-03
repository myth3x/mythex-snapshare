import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Upload, Copy, ExternalLink, Calendar, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ro } from 'date-fns/locale';

interface Screenshot {
  id: string;
  filename: string;
  original_name: string;
  file_path: string;
  short_code: string;
  upload_date: string;
  view_count: number;
  file_size: number;
  mime_type: string;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  useEffect(() => {
    if (user) {
      loadScreenshots();
    }
  }, [user, selectedMonth]);

  const loadScreenshots = async () => {
    try {
      setLoading(true);
      const startDate = startOfMonth(selectedMonth);
      const endDate = endOfMonth(selectedMonth);

      const { data, error } = await supabase
        .from('screenshots')
        .select('*')
        .eq('user_id', user?.id)
        .gte('upload_date', startDate.toISOString())
        .lte('upload_date', endDate.toISOString())
        .order('upload_date', { ascending: false });

      if (error) {
        console.error('Error loading screenshots:', error);
        toast({
          title: "Eroare",
          description: "Nu s-au putut încărca screenshot-urile",
          variant: "destructive",
        });
      } else {
        setScreenshots(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = (shortCode: string) => {
    const link = `https://myth3x.pics/${shortCode}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copiat",
      description: `${link} a fost copiat în clipboard`,
    });
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const filteredScreenshots = screenshots.filter(screenshot =>
    screenshot.original_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    screenshot.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getImageUrl = (filePath: string) => {
    return supabase.storage.from('screenshots').getPublicUrl(filePath).data.publicUrl;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Se încarcă...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">myth3x.pics</h1>
              <Badge variant="secondary">{user?.email}</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
              <Button variant="ghost" onClick={handleSignOut}>
                Deconectare
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Caută screenshot-uri..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Input
                type="month"
                value={format(selectedMonth, 'yyyy-MM')}
                onChange={(e) => setSelectedMonth(new Date(e.target.value + '-01'))}
                className="w-auto"
              />
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            {filteredScreenshots.length} screenshot-uri în {format(selectedMonth, 'MMMM yyyy', { locale: ro })}
          </div>

          {filteredScreenshots.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <CardTitle className="mb-2">Nu sunt screenshot-uri</CardTitle>
                <CardDescription>
                  {searchTerm ? 'Nu s-au găsit rezultate pentru căutarea ta.' : 'Nu ai încărcat încă niciun screenshot în această lună.'}
                </CardDescription>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredScreenshots.map((screenshot) => (
                <Card key={screenshot.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    <img
                      src={getImageUrl(screenshot.file_path)}
                      alt={screenshot.original_name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base truncate">
                      {screenshot.original_name || screenshot.filename}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {format(new Date(screenshot.upload_date), 'dd MMM yyyy, HH:mm', { locale: ro })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatFileSize(screenshot.file_size)}</span>
                      <span>{screenshot.view_count} vizualizări</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => copyLink(screenshot.short_code)}
                        className="flex-1"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copiază link
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(`https://myth3x.pics/${screenshot.short_code}`, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
                      myth3x.pics/{screenshot.short_code}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;