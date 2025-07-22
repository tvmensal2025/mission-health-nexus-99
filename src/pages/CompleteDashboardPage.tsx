import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  LogOut, 
  Trophy, 
  Target, 
  Calendar, 
  Home,
  Activity,
  GraduationCap,
  FileText,
  Clipboard,
  Award,
  Settings,
  TrendingUp,
  CreditCard,
  Grid3X3,
  HelpCircle,
  Menu,
  X,
  Scale
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import DailyMissions from "@/components/dashboard/DailyMissions";
import CoursePlatformNetflix from "@/components/dashboard/CoursePlatformNetflix";
import WeighingPage from "@/components/dashboard/WeighingPage";
import { useToast } from "@/hooks/use-toast";

type DashboardSection = 
  | 'dashboard' 
  | 'missions' 
  | 'courses' 
  | 'sessions' 
  | 'ranking' 
  | 'assessments'
  | 'weekly'
  | 'weekly-assessment'
  | 'goals'
  | 'challenges'
  | 'diary'
  | 'saboteur-test'
  | 'progress'
  | 'analytics'
  | 'google-fit'
  | 'scale-test'
  | 'subscriptions'
  | 'apps'
  | 'help';

const CompleteDashboardPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<DashboardSection>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (!session) {
        navigate("/auth");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (!session) {
          navigate("/auth");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', color: 'text-primary' },
    { id: 'missions', icon: Activity, label: 'Missão do Dia', color: 'text-secondary' },
    { id: 'courses', icon: GraduationCap, label: 'Plataforma dos Sonhos', color: 'text-accent' },
    { id: 'sessions', icon: FileText, label: 'Sessões', color: 'text-muted-foreground' },
    { id: 'ranking', icon: Trophy, label: 'Ranking', color: 'text-yellow-500' },
    { id: 'assessments', icon: Clipboard, label: 'Avaliações', color: 'text-blue-500' },
    { id: 'weekly', icon: Calendar, label: '📊 Semanal', color: 'text-red-500', highlighted: true },
    { id: 'weekly-assessment', icon: Calendar, label: 'Avaliação Semanal', color: 'text-purple-500' },
    { id: 'goals', icon: Target, label: 'Minhas Metas', color: 'text-green-500' },
    { id: 'challenges', icon: Award, label: 'Desafios', color: 'text-orange-500' },
    { id: 'diary', icon: FileText, label: 'Diário de Saúde', color: 'text-pink-500' },
    { id: 'saboteur-test', icon: Settings, label: 'Teste de Sabotadores', color: 'text-gray-500' },
    { id: 'progress', icon: TrendingUp, label: 'Meu Progresso', color: 'text-cyan-500' },
    { id: 'analytics', icon: TrendingUp, label: 'Análise Avançada', color: 'text-indigo-500' },
    { id: 'google-fit', icon: Activity, label: 'Google Fit', color: 'text-green-600' },
    { id: 'scale-test', icon: Scale, label: 'Teste Xiaomi Mi Body Scale 2', color: 'text-blue-600' },
    { id: 'subscriptions', icon: CreditCard, label: 'Assinaturas', color: 'text-purple-600' },
    { id: 'apps', icon: Grid3X3, label: 'Apps', color: 'text-gray-600' },
    { id: 'help', icon: HelpCircle, label: 'Ajuda', color: 'text-blue-400' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardOverview user={user} />;
      case 'missions':
        return <DailyMissions user={user} />;
      case 'courses':
        return <CoursePlatformNetflix user={user} />;
      case 'scale-test':
        return <WeighingPage user={user} />;
      case 'sessions':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">Sessões Terapêuticas</h1>
            <Card className="health-card">
              <CardContent className="pt-6">
                <p className="text-muted-foreground">Funcionalidade em desenvolvimento...</p>
              </CardContent>
            </Card>
          </div>
        );
      case 'ranking':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4 flex items-center gap-2">
              <Trophy className="h-8 w-8 text-yellow-500" />
              Ranking de Usuários
            </h1>
            <Card className="health-card">
              <CardContent className="pt-6">
                <p className="text-muted-foreground">Sistema de ranking em desenvolvimento...</p>
              </CardContent>
            </Card>
          </div>
        );
      case 'weekly':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4 flex items-center gap-2">
              📊 <span className="text-red-500">Semanal</span>
              <Badge variant="destructive" className="ml-2">Destaque</Badge>
            </h1>
            <Card className="health-card">
              <CardContent className="pt-6">
                <p className="text-muted-foreground">Relatório semanal em desenvolvimento...</p>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4 capitalize">{activeSection.replace('-', ' ')}</h1>
            <Card className="health-card">
              <CardContent className="pt-6">
                <p className="text-muted-foreground">Esta funcionalidade está em desenvolvimento...</p>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border/20">
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-primary" />
          <h2 className="text-lg font-bold">Instituto dos Sonhos</h2>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeSection === item.id ? "secondary" : "ghost"}
                className={`w-full justify-start gap-3 h-12 ${
                  activeSection === item.id ? 'bg-muted font-medium' : ''
                } ${item.highlighted ? 'border border-red-500/30 bg-red-500/10' : ''}`}
                onClick={() => {
                  setActiveSection(item.id as DashboardSection);
                  setSidebarOpen(false);
                }}
              >
                <Icon className={`h-5 w-5 ${item.color}`} />
                <span className="text-left text-sm">{item.label}</span>
                {item.highlighted && (
                  <Badge variant="destructive" className="ml-auto text-xs">!</Badge>
                )}
              </Button>
            );
          })}
        </nav>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuário";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/20 bg-card/50 backdrop-blur-sm h-16 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {/* Mobile Menu Trigger */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold hidden sm:block">Instituto dos Sonhos</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">{userName}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>{user.email}</span>
              <Badge variant="secondary" className="text-xs">Online</Badge>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-80 border-r border-border/20 bg-card/30">
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default CompleteDashboardPage;