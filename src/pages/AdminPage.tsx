import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  LogOut, 
  Users, 
  BookOpen, 
  FileText,
  Settings,
  BarChart3,
  Shield,
  TrendingUp,
  Award,
  Calendar,
  Scale,
  Monitor,
  HelpCircle,
  Database,
  CreditCard
} from "lucide-react";
import AdminDashboard from "@/components/admin/AdminDashboard";
import UserManagement from "@/components/admin/UserManagement";
import WeighingMonitoring from "@/components/admin/WeighingMonitoring";
import AdvancedReports from "@/components/admin/AdvancedReports";
import { CourseManagement } from "@/components/admin/CourseManagement";
import IntegrationManagementPanel from "@/components/admin/PaymentManagementPanel";
import SessionManagement from "@/components/admin/SessionManagement";
import SystemStatus from "@/components/SystemStatus";

const AdminPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    activeSessions: 0,
    completedMissions: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (!session) {
        navigate("/auth");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (!session) {
          navigate("/auth");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      // Fetch total users count
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch total courses count
      const { count: coursesCount } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true });

      // Fetch today's completed missions
      const today = new Date().toISOString().split('T')[0];
      const { count: missionsCount } = await supabase
        .from('user_missions')
        .select('*', { count: 'exact', head: true })
        .eq('is_completed', true)
        .eq('date_assigned', today);

      setStats({
        totalUsers: usersCount || 0,
        totalCourses: coursesCount || 0,
        activeSessions: 12, // Mock data
        completedMissions: missionsCount || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const menuItems = [
    { id: 'dashboard', icon: BarChart3, label: 'Dashboard Admin', color: 'text-primary', description: 'Visão geral completa do sistema' },
    { id: 'users', icon: Users, label: 'Gestão de Usuários', color: 'text-blue-500', description: 'Gerenciar todos os usuários' },
    { id: 'weighings', icon: Scale, label: 'Monitoramento de Pesagens', color: 'text-purple-500', description: 'Acompanhar todas as pesagens' },
    { id: 'reports', icon: TrendingUp, label: 'Análises e Relatórios', color: 'text-green-500', description: 'Relatórios avançados e insights' },
    { id: 'courses', icon: BookOpen, label: 'Gestão de Cursos', color: 'text-orange-500', description: 'Gerenciar cursos e conteúdo' },
    { id: 'payments', icon: CreditCard, label: 'Gestão de Pagamentos', color: 'text-emerald-500', description: 'Gestão Asaas e assinaturas' },
    { id: 'sessions', icon: FileText, label: 'Gestão de Sessões', color: 'text-cyan-500', description: 'Criar e enviar sessões personalizadas' },
    { id: 'devices', icon: Monitor, label: 'Gestão de Dispositivos', color: 'text-indigo-500', description: 'Dispositivos conectados' },
    { id: 'settings', icon: Settings, label: 'Configurações do Sistema', color: 'text-red-500', description: 'Configurações gerais' },
    { id: 'security', icon: Shield, label: 'Segurança e Auditoria', color: 'text-yellow-500', description: 'Logs e segurança' },
    { id: 'support', icon: HelpCircle, label: 'Suporte e Ajuda', color: 'text-pink-500', description: 'Central de suporte' },
    { id: 'backup', icon: Database, label: 'Backup e Manutenção', color: 'text-gray-500', description: 'Backup e manutenção' },
    { id: 'system', icon: Database, label: 'Status do Sistema', color: 'text-blue-500', description: 'Verificar funcionamento' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Carregando painel administrativo...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Administrador";

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'users':
        return <UserManagement />;
      case 'weighings':
        return <WeighingMonitoring />;
      case 'reports':
        return <AdvancedReports />;
      case 'courses':
        return <CourseManagement />;
      case 'payments':
        return <IntegrationManagementPanel />;
      case 'sessions':
        return <SessionManagement />;
      case 'devices':
        return <div className="text-center py-8 text-muted-foreground">Gestão de Dispositivos em desenvolvimento...</div>;
      case 'settings':
        return <div className="text-center py-8 text-muted-foreground">Configurações do Sistema em desenvolvimento...</div>;
      case 'security':
        return <div className="text-center py-8 text-muted-foreground">Segurança e Auditoria em desenvolvimento...</div>;
      case 'support':
        return <div className="text-center py-8 text-muted-foreground">Suporte e Ajuda em desenvolvimento...</div>;
      case 'backup':
        return <div className="text-center py-8 text-muted-foreground">Backup e Manutenção em desenvolvimento...</div>;
      case 'system':
        return <SystemStatus />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/20 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-red-500" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Painel Administrativo Completo</h1>
              <Badge variant="destructive" className="text-xs">Modo Admin Ativo</Badge>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-80 border-r border-border/20 bg-card/30 backdrop-blur-sm min-h-screen">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4 text-foreground">Menu Administrativo</h2>
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left ${
                      isActive 
                        ? 'bg-primary text-primary-foreground shadow-lg' 
                        : 'hover:bg-muted/70 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-primary-foreground' : item.color}`} />
                    <div className="flex-1">
                      <div className={`font-medium text-sm ${isActive ? 'text-primary-foreground' : 'text-foreground'}`}>{item.label}</div>
                      <div className={`text-xs ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{item.description}</div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
          {/* Quick Actions in Sidebar */}
          <div className="p-4 border-t border-border/20 mt-4">
            <h3 className="text-sm font-semibold mb-3 text-foreground">Ações Rápidas</h3>
            <div className="space-y-2">
              <Button onClick={() => navigate("/dashboard")} variant="outline" size="sm" className="w-full justify-start">
                <Heart className="h-4 w-4 mr-2" />
                Voltar ao Dashboard
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <TrendingUp className="h-4 w-4 mr-2" />
                Gerar Relatório
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Database className="h-4 w-4 mr-2" />
                Backup Agora
              </Button>
            </div>
          </div>
        </aside>
        {/* Main Content */}
        <main className="flex-1 p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminPage;