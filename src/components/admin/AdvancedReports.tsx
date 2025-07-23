import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown, 
  Users,
  Activity,
  Calendar,
  Target,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ReportData {
  totalUsers: number;
  totalMeasurements: number;
  averageWeight: number;
  weightTrend: 'up' | 'down' | 'stable';
  activeUsers: number;
  dataQuality: number;
  recentActivity: number;
  topUsers: Array<{
    user_id: string;
  measurements: number;
    averageWeight: number;
    lastActivity: string;
  }>;
}

const AdvancedReports: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData>({
    totalUsers: 0,
    totalMeasurements: 0,
    averageWeight: 0,
    weightTrend: 'stable',
    activeUsers: 0,
    dataQuality: 0,
    recentActivity: 0,
    topUsers: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Buscar medições
      const { data: measurements, error: measurementsError } = await supabase
        .from('weight_measurements')
        .select('user_id, measurement_date, peso_kg, gordura_corporal_percent')
        .order('measurement_date', { ascending: false });

      if (measurementsError) {
        console.error('Error fetching measurements:', measurementsError);
        return;
      }

      // Buscar dados físicos
      const { data: physicalData, error: physicalError } = await supabase
        .from('user_physical_data')
        .select('user_id');

      if (physicalError) {
        console.error('Error fetching physical data:', physicalError);
        return;
      }

      // Calcular estatísticas
      const uniqueUsers = new Set(measurements?.map(m => m.user_id) || []);
      const totalUsers = uniqueUsers.size;
      const totalMeasurements = measurements?.length || 0;

      // Peso médio
      const validWeights = measurements?.filter(m => m.peso_kg).map(m => m.peso_kg) || [];
      const averageWeight = validWeights.length > 0 
        ? validWeights.reduce((a, b) => a + b, 0) / validWeights.length 
        : 0;

      // Tendência de peso
      const sortedMeasurements = measurements?.sort((a, b) => 
        new Date(a.measurement_date).getTime() - new Date(b.measurement_date).getTime()
      ) || [];
      
      let weightTrend: 'up' | 'down' | 'stable' = 'stable';
      if (sortedMeasurements.length >= 2) {
        const firstWeight = sortedMeasurements[0]?.peso_kg || 0;
        const lastWeight = sortedMeasurements[sortedMeasurements.length - 1]?.peso_kg || 0;
        weightTrend = lastWeight > firstWeight ? 'up' : lastWeight < firstWeight ? 'down' : 'stable';
      }

      // Usuários ativos
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(selectedPeriod));
      const activeUsers = new Set(
        measurements?.filter(m => new Date(m.measurement_date) >= daysAgo)
          .map(m => m.user_id) || []
      ).size;

      // Qualidade dos dados
      const completeMeasurements = measurements?.filter(m => 
        m.peso_kg && m.gordura_corporal_percent
      ).length || 0;
      const dataQuality = totalMeasurements > 0 ? (completeMeasurements / totalMeasurements) * 100 : 0;

      // Atividade recente (últimos 7 dias)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentActivity = measurements?.filter(m => 
        new Date(m.measurement_date) >= sevenDaysAgo
      ).length || 0;

      // Top usuários
      const userStats = new Map<string, {
        measurements: number;
        weights: number[];
        lastActivity: string;
      }>();

      measurements?.forEach(measurement => {
        const userId = measurement.user_id;
        const existing = userStats.get(userId) || {
          measurements: 0,
          weights: [],
          lastActivity: ''
        };

        existing.measurements++;
        if (measurement.peso_kg) {
          existing.weights.push(measurement.peso_kg);
        }
        if (!existing.lastActivity || measurement.measurement_date > existing.lastActivity) {
          existing.lastActivity = measurement.measurement_date;
        }

        userStats.set(userId, existing);
      });

      const topUsers = Array.from(userStats.entries())
        .map(([userId, stats]) => ({
          user_id: userId,
          measurements: stats.measurements,
          averageWeight: stats.weights.length > 0 
            ? stats.weights.reduce((a, b) => a + b, 0) / stats.weights.length 
            : 0,
          lastActivity: stats.lastActivity
        }))
        .sort((a, b) => b.measurements - a.measurements)
        .slice(0, 5);

      setReportData({
        totalUsers,
        totalMeasurements,
        averageWeight: Math.round(averageWeight * 10) / 10,
        weightTrend,
        activeUsers,
        dataQuality: Math.round(dataQuality),
        recentActivity,
        topUsers
      });

    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const getTrendIcon = () => {
    switch (reportData.weightTrend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <BarChart3 className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTrendText = () => {
    switch (reportData.weightTrend) {
      case 'up': return 'Aumentando';
      case 'down': return 'Diminuindo';
      default: return 'Estável';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-4 w-4 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                <div className="h-3 bg-muted rounded w-32"></div>
          </CardContent>
        </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Relatórios Avançados</h1>
          <p className="text-muted-foreground">Análise detalhada do sistema</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={selectedPeriod === '7' ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod('7')}
          >
            7 dias
          </Button>
          <Button 
            variant={selectedPeriod === '30' ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod('30')}
          >
            30 dias
          </Button>
          <Button 
            variant={selectedPeriod === '90' ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod('90')}
          >
            90 dias
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Usuários registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Medições</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalMeasurements}</div>
            <p className="text-xs text-muted-foreground">
              Pesagens registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peso Médio</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{reportData.averageWeight}kg</div>
              {getTrendIcon()}
            </div>
            <p className="text-xs text-muted-foreground">
              Tendência: {getTrendText()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Últimos {selectedPeriod} dias
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Qualidade dos Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Medições Completas</span>
                <Badge variant={reportData.dataQuality >= 80 ? "default" : "destructive"}>
                  {reportData.dataQuality}%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Atividade Recente</span>
                <Badge variant="secondary">{reportData.recentActivity}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas e Recomendações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.dataQuality < 80 && (
                <div className="flex items-center gap-2 text-yellow-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">Baixa qualidade dos dados</span>
                </div>
              )}
              {reportData.recentActivity < 10 && (
                <div className="flex items-center gap-2 text-orange-600">
                  <Activity className="h-4 w-4" />
                  <span className="text-sm">Baixa atividade recente</span>
                </div>
              )}
              {reportData.weightTrend === 'up' && (
                <div className="flex items-center gap-2 text-red-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">Tendência de ganho de peso</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Users */}
      <Card>
        <CardHeader>
          <CardTitle>Top Usuários por Medições</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData.topUsers.map((user, index) => (
              <div key={user.user_id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                      </div>
                  <div>
                    <p className="font-medium">Usuário {user.user_id.slice(0, 8)}...</p>
                    <p className="text-xs text-muted-foreground">
                      {user.measurements} medições
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{Math.round(user.averageWeight * 10) / 10}kg</p>
                  <p className="text-xs text-muted-foreground">
                    Peso médio
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedReports;