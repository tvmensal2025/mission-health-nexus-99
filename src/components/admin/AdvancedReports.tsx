import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3,
  Download,
  TrendingUp,
  Users,
  Target,
  Award,
  Calendar,
  FileText
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface ReportStats {
  totalUsers: number;
  activeUsers: number;
  totalWeighings: number;
  averageWeightLoss: number;
  successRate: number;
  retentionRate: number;
}

interface WeightTrend {
  date: string;
  averageWeight: number;
  averageIMC: number;
  measurements: number;
}

interface DemographicData {
  ageGroup: string;
  count: number;
  averageWeightLoss: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const AdvancedReports = () => {
  const [stats, setStats] = useState<ReportStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalWeighings: 0,
    averageWeightLoss: 0,
    successRate: 0,
    retentionRate: 0
  });
  const [weightTrends, setWeightTrends] = useState<WeightTrend[]>([]);
  const [demographics, setDemographics] = useState<DemographicData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // Fetch basic stats
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: totalWeighings } = await supabase
        .from('weight_measurements')
        .select('*', { count: 'exact', head: true });

      // Fetch weight trends (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: weightData } = await supabase
        .from('weight_measurements')
        .select('peso_kg, imc, measurement_date')
        .gte('measurement_date', thirtyDaysAgo.toISOString())
        .order('measurement_date');

      // Process weight trends
      const trendsMap = new Map();
      weightData?.forEach(item => {
        const date = new Date(item.measurement_date).toISOString().split('T')[0];
        if (!trendsMap.has(date)) {
          trendsMap.set(date, { totalWeight: 0, totalIMC: 0, count: 0 });
        }
        const dayData = trendsMap.get(date);
        dayData.totalWeight += item.peso_kg || 0;
        dayData.totalIMC += item.imc || 0;
        dayData.count += 1;
      });

      const trends = Array.from(trendsMap.entries()).map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
        averageWeight: Math.round((data.totalWeight / data.count) * 10) / 10,
        averageIMC: Math.round((data.totalIMC / data.count) * 10) / 10,
        measurements: data.count
      }));

      // Fetch demographics data
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('age');

      const ageGroups = {
        '18-25': 0,
        '26-35': 0,
        '36-45': 0,
        '46-55': 0,
        '55+': 0
      };

      profilesData?.forEach(profile => {
        if (profile.age) {
          if (profile.age <= 25) ageGroups['18-25']++;
          else if (profile.age <= 35) ageGroups['26-35']++;
          else if (profile.age <= 45) ageGroups['36-45']++;
          else if (profile.age <= 55) ageGroups['46-55']++;
          else ageGroups['55+']++;
        }
      });

      const demographicsData = Object.entries(ageGroups).map(([ageGroup, count]) => ({
        ageGroup,
        count,
        averageWeightLoss: Math.random() * 5 + 1 // Mock data
      }));

      setStats({
        totalUsers: totalUsers || 0,
        activeUsers: Math.floor((totalUsers || 0) * 0.7), // Mock calculation
        totalWeighings: totalWeighings || 0,
        averageWeightLoss: 2.3, // Mock data
        successRate: 78, // Mock data
        retentionRate: 85 // Mock data
      });

      setWeightTrends(trends);
      setDemographics(demographicsData);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const reportSections = [
    {
      title: "Relatório de Progresso",
      description: "Usuários que mais emagreceram e evolução geral",
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      title: "Relatório Demográfico",
      description: "Análise por faixa etária, sexo e localização",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Relatório de Engajamento",
      description: "Frequência de uso e participação",
      icon: Target,
      color: "text-purple-600"
    },
    {
      title: "Relatório de Sucesso",
      description: "Metas atingidas e taxa de retenção",
      icon: Award,
      color: "text-yellow-600"
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Análises e Relatórios Avançados
          </h1>
          <p className="text-muted-foreground">Insights detalhados sobre o sistema e usuários</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Agendar Relatório
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
            <div className="text-sm text-muted-foreground">Total Usuários</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
            <div className="text-sm text-muted-foreground">Usuários Ativos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.totalWeighings}</div>
            <div className="text-sm text-muted-foreground">Total Pesagens</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.averageWeightLoss}kg</div>
            <div className="text-sm text-muted-foreground">Perda Média</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.successRate}%</div>
            <div className="text-sm text-muted-foreground">Taxa Sucesso</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-cyan-600">{stats.retentionRate}%</div>
            <div className="text-sm text-muted-foreground">Retenção</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Tendência de Peso (30 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weightTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="averageWeight" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Peso Médio (kg)"
                />
                <Line 
                  type="monotone" 
                  dataKey="averageIMC" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  name="IMC Médio"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Demographics Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Distribuição por Faixa Etária
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={demographics}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ ageGroup, count }) => `${ageGroup}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {demographics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Measurements Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            Volume de Pesagens por Dia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weightTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="measurements" fill="#8884d8" name="Número de Pesagens" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Report Sections */}
      <Card>
        <CardHeader>
          <CardTitle>Relatórios Disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportSections.map((section) => {
              const Icon = section.icon;
              return (
                <div key={section.title} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <Icon className={`h-6 w-6 ${section.color} mt-1`} />
                    <div className="flex-1">
                      <h3 className="font-semibold">{section.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{section.description}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4 mr-2" />
                          Gerar
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Baixar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Success Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950/20 rounded">
                <span className="text-sm font-medium">Maria Silva</span>
                <Badge className="bg-green-100 text-green-800">-8.5kg</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950/20 rounded">
                <span className="text-sm font-medium">João Santos</span>
                <Badge className="bg-green-100 text-green-800">-7.2kg</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950/20 rounded">
                <span className="text-sm font-medium">Ana Costa</span>
                <Badge className="bg-green-100 text-green-800">-6.8kg</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Metas Atingidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">78%</div>
              <p className="text-sm text-muted-foreground">dos usuários atingiram suas metas</p>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Engajamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Pesagens regulares</span>
                <span className="text-sm font-medium">85%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Uso de cursos</span>
                <span className="text-sm font-medium">72%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Participação em desafios</span>
                <span className="text-sm font-medium">68%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};