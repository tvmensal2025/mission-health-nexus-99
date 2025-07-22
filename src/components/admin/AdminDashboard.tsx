import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Scale, 
  TrendingUp, 
  Activity,
  Heart,
  Target,
  Calendar,
  AlertTriangle,
  Smartphone
} from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  activeUsers7Days: number;
  activeUsers30Days: number;
  weighingsToday: number;
  weighingsWeek: number;
  weighingsMonth: number;
  averageWeight: number;
  averageIMC: number;
  connectedDevices: number;
  criticalAlerts: number;
}

export const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers7Days: 0,
    activeUsers30Days: 0,
    weighingsToday: 0,
    weighingsWeek: 0,
    weighingsMonth: 0,
    averageWeight: 0,
    averageIMC: 0,
    connectedDevices: 0,
    criticalAlerts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Total de usuários
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Pesagens hoje
      const today = new Date().toISOString().split('T')[0];
      const { count: weighingsToday } = await supabase
        .from('weight_measurements')
        .select('*', { count: 'exact', head: true })
        .gte('measurement_date', today);

      // Pesagens esta semana
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { count: weighingsWeek } = await supabase
        .from('weight_measurements')
        .select('*', { count: 'exact', head: true })
        .gte('measurement_date', weekAgo.toISOString());

      // Pesagens este mês
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const { count: weighingsMonth } = await supabase
        .from('weight_measurements')
        .select('*', { count: 'exact', head: true })
        .gte('measurement_date', monthAgo.toISOString());

      // Peso médio
      const { data: avgWeightData } = await supabase
        .from('weight_measurements')
        .select('peso_kg')
        .not('peso_kg', 'is', null);

      const averageWeight = avgWeightData?.length 
        ? avgWeightData.reduce((sum, item) => sum + (item.peso_kg || 0), 0) / avgWeightData.length
        : 0;

      // IMC médio
      const { data: avgIMCData } = await supabase
        .from('weight_measurements')
        .select('imc')
        .not('imc', 'is', null);

      const averageIMC = avgIMCData?.length 
        ? avgIMCData.reduce((sum, item) => sum + (item.imc || 0), 0) / avgIMCData.length
        : 0;

      // Usuários ativos últimos 7 dias
      const { count: activeUsers7Days } = await supabase
        .from('weight_measurements')
        .select('user_id', { count: 'exact', head: true })
        .gte('measurement_date', weekAgo.toISOString());

      // Usuários ativos últimos 30 dias
      const { count: activeUsers30Days } = await supabase
        .from('weight_measurements')
        .select('user_id', { count: 'exact', head: true })
        .gte('measurement_date', monthAgo.toISOString());

      setStats({
        totalUsers: totalUsers || 0,
        activeUsers7Days: activeUsers7Days || 0,
        activeUsers30Days: activeUsers30Days || 0,
        weighingsToday: weighingsToday || 0,
        weighingsWeek: weighingsWeek || 0,
        weighingsMonth: weighingsMonth || 0,
        averageWeight: Math.round(averageWeight * 10) / 10,
        averageIMC: Math.round(averageIMC * 10) / 10,
        connectedDevices: 23, // Mock data
        criticalAlerts: 3 // Mock data
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total de Usuários",
      value: stats.totalUsers,
      change: "+12%",
      trend: "up",
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/20"
    },
    {
      title: "Usuários Ativos (7 dias)",
      value: stats.activeUsers7Days,
      change: "+8%",
      trend: "up",
      icon: Activity,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950/20"
    },
    {
      title: "Pesagens Hoje",
      value: stats.weighingsToday,
      change: "+15%",
      trend: "up",
      icon: Scale,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/20"
    },
    {
      title: "Pesagens Semana",
      value: stats.weighingsWeek,
      change: "+22%",
      trend: "up",
      icon: Calendar,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950/20"
    },
    {
      title: "Peso Médio",
      value: `${stats.averageWeight} kg`,
      change: "-1.2kg",
      trend: "down",
      icon: Heart,
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-950/20"
    },
    {
      title: "IMC Médio",
      value: stats.averageIMC,
      change: "Normal",
      trend: "stable",
      icon: Target,
      color: "text-cyan-500",
      bgColor: "bg-cyan-50 dark:bg-cyan-950/20"
    },
    {
      title: "Dispositivos Conectados",
      value: stats.connectedDevices,
      change: "+3",
      trend: "up",
      icon: Smartphone,
      color: "text-indigo-500",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/20"
    },
    {
      title: "Alertas Críticos",
      value: stats.criticalAlerts,
      change: "Atenção",
      trend: "warning",
      icon: AlertTriangle,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/20"
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Dashboard Admin
          </h1>
          <p className="text-muted-foreground">Visão geral completa do sistema</p>
        </div>
        <Badge variant="outline" className="bg-green-50 border-green-200 text-green-800 dark:bg-green-950/20">
          Sistema Online
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={stat.title} 
              className="health-card hover:scale-105 transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp 
                    className={`h-3 w-3 ${
                      stat.trend === 'up' ? 'text-green-500' : 
                      stat.trend === 'down' ? 'text-red-500' : 
                      stat.trend === 'warning' ? 'text-yellow-500' :
                      'text-gray-500'
                    }`} 
                  />
                  <span className={`text-xs ${
                    stat.trend === 'up' ? 'text-green-600' : 
                    stat.trend === 'down' ? 'text-red-600' : 
                    stat.trend === 'warning' ? 'text-yellow-600' :
                    'text-gray-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tendência Geral */}
      <Card className="health-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Tendência Geral do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">📈</div>
              <div className="text-sm font-medium text-green-800 dark:text-green-200">Crescimento</div>
              <div className="text-xs text-green-600">+22% de engajamento</div>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">⚖️</div>
              <div className="text-sm font-medium text-blue-800 dark:text-blue-200">Estável</div>
              <div className="text-xs text-blue-600">Peso médio mantido</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">🎯</div>
              <div className="text-sm font-medium text-purple-800 dark:text-purple-200">Metas</div>
              <div className="text-xs text-purple-600">78% de sucesso</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};