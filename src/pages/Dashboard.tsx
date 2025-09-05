import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Camera, Search, LogOut, Shield, Images, User, Copy, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import ImageUpload from '@/components/ImageUpload';
import AdminPanel from '@/components/AdminPanel';

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
  const { role, isAdmin, loading: roleLoading } = useUserRole();
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'images' | 'admin'>('images');
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadScreenshots();
    }
  }, [user]);

  const loadScreenshots = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('screenshots')
        .select('*')
        .eq('user_id', user?.id)
        .order('upload_date', { ascending: false });

      if (error) {
        console.error('Error loading screenshots:', error);
        toast({
          title: "Eroare",
          description: "Nu s-au putut încărca imaginile",
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

  // Group screenshots by month
  const groupedScreenshots = filteredScreenshots.reduce((acc: { month: string; screenshots: Screenshot[] }[], screenshot) => {
    const date = new Date(screenshot.upload_date);
    const monthYear = format(date, 'MMMM yyyy', { locale: ro });
    
    let group = acc.find(g => g.month === monthYear);
    if (!group) {
      group = { month: monthYear, screenshots: [] };
      acc.push(group);
    }
    group.screenshots.push(screenshot);
    return acc;
  }, []);

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[image:var(--gradient-bg)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Se încarcă...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[image:var(--gradient-bg)]">
      {/* Header */}
      <header className="border-b border-primary/20 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Camera className="h-10 w-10 text-primary animate-glow" />
                <div>
                  <h1 className="text-2xl font-bold bg-[image:var(--gradient-fire)] bg-clip-text text-transparent">
                    myth3x.pics
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Salut myth3x, aici sunt toate pozele tale
                  </p>
                </div>
              </div>
              {role && (
                <Badge variant={isAdmin ? "default" : "secondary"} className="animate-fade-in">
                  {isAdmin ? (
                    <>
                      <Shield className="h-3 w-3 mr-1" />
                      Administrator
                    </>
                  ) : (
                    <>
                      <User className="h-3 w-3 mr-1" />
                      Utilizator
                    </>
                  )}
                </Badge>
              )}
            </div>
            <Button onClick={handleSignOut} variant="outline" className="hover:scale-105 transition-transform">
              <LogOut className="h-4 w-4 mr-2" />
              Ieșire
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <p className="text-lg text-muted-foreground text-center">
            Pentru a le vedea trebuie să te loghezi în platformă
          </p>
        </div>

        {/* Navigation Tabs */}
        {isAdmin && (
          <div className="flex justify-center mb-8 animate-slide-in">
            <div className="bg-background/50 rounded-lg p-1 border border-primary/20">
              <Button
                variant={activeTab === 'images' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('images')}
                className="mr-2"
              >
                <Images className="h-4 w-4 mr-2" />
                Imagini
              </Button>
              <Button
                variant={activeTab === 'admin' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('admin')}
              >
                <Shield className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </div>
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === 'images' ? (
          <div className="space-y-8">
            {/* Upload Section */}
            <div className="max-w-4xl mx-auto">
              <ImageUpload />
            </div>

            {/* Search */}
            <Card className="max-w-md mx-auto animate-fade-in">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Caută pozele tale..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Screenshots */}
            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-8">
                {groupedScreenshots.length === 0 ? (
                  <Card className="max-w-md mx-auto animate-fade-in">
                    <CardContent className="p-8 text-center">
                      <Camera className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Nicio imagine încărcată</h3>
                      <p className="text-muted-foreground">
                        Încarcă prima ta imagine folosind zona de upload de mai sus.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  groupedScreenshots.map(({ month, screenshots: monthScreenshots }) => (
                    <Card key={month} className="animate-slide-in">
                      <CardHeader>
                        <CardTitle className="text-xl">{month}</CardTitle>
                        <CardDescription>
                          {monthScreenshots.length} {monthScreenshots.length === 1 ? 'imagine' : 'imagini'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {monthScreenshots.map((screenshot) => (
                            <Card key={screenshot.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
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
                                    Copy link
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
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        ) : (
          <AdminPanel />
        )}
      </main>
    </div>
  );
};

export default Dashboard;