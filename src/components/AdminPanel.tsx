import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Users, Trash2, Shield } from 'lucide-react';

interface User {
  id: string;
  email: string;
  username?: string;
  created_at: string;
  role: 'admin' | 'user';
}

const AdminPanel = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', username: '' });
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      // Fetch all users with their roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          user_id,
          username,
          user_roles (
            role
          )
        `);

      if (profilesError) throw profilesError;

      const usersWithRoles = profiles?.map(profile => ({
        id: profile.user_id,
        email: 'Loading...',
        username: profile.username || 'N/A',
        created_at: new Date().toISOString(),
        role: (profile.user_roles && profile.user_roles.length > 0 
          ? (profile.user_roles[0] as any)?.role || 'user'
          : 'user') as 'admin' | 'user'
      })) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut încărca utilizatorii",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      // Create user using edge function (since admin API might not be available)
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: newUser.email,
          password: newUser.password,
          username: newUser.username
        }
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Utilizatorul ${newUser.email} a fost creat cu succes`,
      });

      setNewUser({ email: '', password: '', username: '' });
      fetchUsers(); // Refresh user list
    } catch (error: any) {
      toast({
        title: "Eroare",
        description: error.message || "Nu s-a putut crea utilizatorul",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Sigur vrei să ștergi acest utilizator?')) return;

    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;

      toast({
        title: "Success!",
        description: "Utilizatorul a fost șters",
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Eroare",
        description: "Nu s-a putut șterge utilizatorul",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-[image:var(--gradient-fire)] text-primary-foreground border-none shadow-[var(--shadow-elegant)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Shield className="h-6 w-6" />
            Panou Administrator
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Create User Form */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Creează utilizator nou
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Parolă temporară</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
            </div>
            <Button type="submit" disabled={creating} className="w-full">
              {creating ? 'Se creează...' : 'Creează utilizator'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card className="animate-slide-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Utilizatori ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div>
                  <div className="font-medium">{user.email}</div>
                  <div className="text-sm text-muted-foreground">
                    {user.username} • {user.role === 'admin' ? 'Administrator' : 'Utilizator'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {user.role === 'admin' && (
                    <Shield className="h-4 w-4 text-primary" />
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteUser(user.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <Alert>
                <AlertDescription>Nu există utilizatori înregistrați.</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;