import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Scale, 
  Activity, 
  TrendingUp, 
  Calendar,
  BarChart3,
  Heart,
  Smartphone,
  Settings,
  Wifi
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AdminStats {
  totalUsers: number;
  totalMeasurements: number;
  activeUsers: number;
  averageMeasurementsPerUser: number;
  recentActivity: number;
  dataQuality: number;
}

interface IntegrationStats {
  totalIntegrations: number;
  activeIntegrations: number;
  syncedToday: number;
  errorCount: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalMeasurements: 0,
    activeUsers: 0,
    averageMeasurementsPerUser: 0,
    recentActivity: 0,
    dataQuality: 0
  });
  
  const [integrationStats, setIntegrationStats] = useState<IntegrationStats>({
    totalIntegrations: 0,
    activeIntegrations: 0,
    syncedToday: 0,
    errorCount: 0
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
    fetchIntegrationStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);

      // Buscar usuários da tabela profiles
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, email, created_at');

      if (usersError) {
        console.error('Error fetching users:', usersError);
        return;
      }

      // Buscar medições
      const { data: measurements, error: measurementsError } = await supabase
        .from('weight_measurements')
        .select('user_id, measurement_date, peso_kg, gordura_corporal_percent');

      if (measurementsError) {
        console.error('Error fetching measurements:', measurementsError);
        return;
      }

      // Calcular estatísticas
      const totalUsers = users?.length || 0;
      const totalMeasurements = measurements?.length || 0;
      
      // Usuários ativos (últimos 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const activeUsers = new Set(
        measurements?.filter(m => new Date(m.measurement_date) >= thirtyDaysAgo)
          .map(m => m.user_id) || []
      ).size;

      // Média de medições por usuário
      const averageMeasurementsPerUser = totalUsers > 0 ? totalMeasurements / totalUsers : 0;

      // Atividade recente (últimos 7 dias)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentActivity = measurements?.filter(m => 
        new Date(m.measurement_date) >= sevenDaysAgo
      ).length || 0;

      // Qualidade dos dados (% de medições com dados completos)
      const completeMeasurements = measurements?.filter(m => 
        m.peso_kg && m.gordura_corporal_percent
      ).length || 0;
      const dataQuality = totalMeasurements > 0 ? (completeMeasurements / totalMeasurements) * 100 : 0;

      setStats({
        totalUsers,
        totalMeasurements,
        activeUsers,
        averageMeasurementsPerUser: Math.round(averageMeasurementsPerUser * 100) / 100,
        recentActivity,
        dataQuality: Math.round(dataQuality * 100) / 100
      });

    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchIntegrationStats = async () => {
    try {
      // Buscar integrações
      const { data: integrations, error: integrationsError } = await supabase
        .from('health_integrations')
        .select('id, enabled');

      if (integrationsError) {
        console.error('Error fetching integrations:', integrationsError);
        return;
      }

      // Buscar logs de sincronização de hoje
      const today = new Date().toISOString().split('T')[0];
      const { data: syncLogs, error: syncError } = await supabase
        .from('device_sync_log')
        .select('sync_status, synced_at')
        .gte('synced_at', today);

      if (syncError) {
        console.error('Error fetching sync logs:', syncError);
        return;
      }

      const totalIntegrations = integrations?.length || 0;
      const activeIntegrations = integrations?.filter(i => i.enabled).length || 0;
      const syncedToday = syncLogs?.filter(log => log.sync_status === 'success').length || 0;
      const errorCount = syncLogs?.filter(log => log.sync_status === 'error').length || 0;

      setIntegrationStats({
        totalIntegrations,
        activeIntegrations,
        syncedToday,
        errorCount
      });

    } catch (error) {
      console.error('Error fetching integration stats:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard Administrativo</h2>
        <p className="text-muted-foreground">
          Visão geral da plataforma e estatísticas gerais
        </p>
      </div>

      {/* Estatísticas de Usuários */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Usuários cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Últimos 30 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Medições</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMeasurements}</div>
            <p className="text-xs text-muted-foreground">
              Pesagens registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atividade Recente</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentActivity}</div>
            <p className="text-xs text-muted-foreground">
              Últimos 7 dias
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas de Integrações */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Wifi className="h-5 w-5" />
          Integrações e Dispositivos
        </h3>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Integrações</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{integrationStats.totalIntegrations}</div>
              <p className="text-xs text-muted-foreground">
                Disponíveis na plataforma
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Integrações Ativas</CardTitle>
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{integrationStats.activeIntegrations}</div>
              <p className="text-xs text-muted-foreground">
                Configuradas e habilitadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sincronizações Hoje</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{integrationStats.syncedToday}</div>
              <p className="text-xs text-muted-foreground">
                Sincronizações bem-sucedidas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Erros de Sincronização</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{integrationStats.errorCount}</div>
              <p className="text-xs text-muted-foreground">
                Falhas nas últimas 24h
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Métricas de Qualidade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Métricas de Qualidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Qualidade dos Dados</span>
                <Badge variant={stats.dataQuality >= 80 ? "default" : "destructive"}>
                  {stats.dataQuality}%
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Percentual de medições com dados completos
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Média de Medições</span>
                <Badge variant="secondary">
                  {stats.averageMeasurementsPerUser}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Por usuário na plataforma
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Taxa de Atividade</span>
                <Badge variant={stats.activeUsers > stats.totalUsers * 0.3 ? "default" : "destructive"}>
                  {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Usuários ativos nos últimos 30 dias
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button onClick={fetchAdminStats} variant="outline">
              Atualizar Estatísticas
            </Button>
            <Button onClick={fetchIntegrationStats} variant="outline">
              Verificar Integrações
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;