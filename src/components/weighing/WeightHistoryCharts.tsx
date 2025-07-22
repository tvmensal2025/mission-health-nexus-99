import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Scale, TrendingUp, Activity, Droplets } from 'lucide-react';
import { useWeightMeasurement } from '@/hooks/useWeightMeasurement';
import { Badge } from '@/components/ui/badge';

const WeightHistoryCharts: React.FC = () => {
  const { measurements, loading, stats } = useWeightMeasurement();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (measurements.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center">
            <Scale className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma Pesagem Registrada</h3>
            <p className="text-muted-foreground">
              Registre sua primeira pesagem para ver os gráficos de evolução.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = measurements
    .slice()
    .reverse()
    .map(m => ({
      date: new Date(m.measurement_date).toLocaleDateString('pt-BR'),
      peso: m.peso_kg,
      gordura_corporal: m.gordura_corporal_percent,
      massa_muscular: m.massa_muscular_kg,
      agua_corporal: m.agua_corporal_percent,
      imc: m.imc
    }));

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'baixo_peso': return 'text-blue-500';
      case 'normal': return 'text-green-500';
      case 'sobrepeso': return 'text-yellow-500';
      case 'obesidade_grau1': return 'text-orange-500';
      case 'obesidade_grau2': return 'text-red-500';
      case 'obesidade_grau3': return 'text-red-700';
      default: return 'text-muted-foreground';
    }
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case 'baixo_peso': return 'Baixo Peso';
      case 'normal': return 'Normal';
      case 'sobrepeso': return 'Sobrepeso';
      case 'obesidade_grau1': return 'Obesidade Grau I';
      case 'obesidade_grau2': return 'Obesidade Grau II';
      case 'obesidade_grau3': return 'Obesidade Grau III';
      default: return 'N/A';
    }
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas Resumo */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Peso Atual</p>
                  <p className="text-2xl font-bold">{stats.currentWeight}kg</p>
                  {stats.weightChange !== 0 && (
                    <p className={`text-sm ${stats.weightChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {stats.weightChange > 0 ? '+' : ''}{stats.weightChange.toFixed(1)}kg
                    </p>
                  )}
                </div>
                <Scale className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">IMC Atual</p>
                  <p className="text-2xl font-bold">{stats.currentIMC?.toFixed(1)}</p>
                  <Badge variant="secondary" className={getRiskColor(stats.riskLevel)}>
                    {getRiskLabel(stats.riskLevel)}
                  </Badge>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tendência</p>
                  <p className="text-2xl font-bold">
                    {stats.trend === 'increasing' ? '📈' : 
                     stats.trend === 'decreasing' ? '📉' : '➡️'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {stats.trend === 'increasing' ? 'Aumentando' :
                     stats.trend === 'decreasing' ? 'Diminuindo' : 'Estável'}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Pesagens</p>
                  <p className="text-2xl font-bold">{stats.totalMeasurements}</p>
                  <p className="text-sm text-muted-foreground">registradas</p>
                </div>
                <Droplets className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráfico de Peso */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Evolução do Peso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                labelFormatter={(label) => `Data: ${label}`}
                formatter={(value, name) => [`${value}kg`, 'Peso']}
              />
              <Area 
                type="monotone" 
                dataKey="peso" 
                stroke="hsl(var(--primary))" 
                fill="hsl(var(--primary) / 0.2)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Composição Corporal */}
      {chartData.some(d => d.gordura_corporal || d.massa_muscular || d.agua_corporal) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Composição Corporal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                {chartData.some(d => d.gordura_corporal) && (
                  <Line 
                    type="monotone" 
                    dataKey="gordura_corporal" 
                    stroke="#ff7300" 
                    strokeWidth={2}
                    name="Gordura Corporal (%)"
                  />
                )}
                {chartData.some(d => d.massa_muscular) && (
                  <Line 
                    type="monotone" 
                    dataKey="massa_muscular" 
                    stroke="#00ff00" 
                    strokeWidth={2}
                    name="Massa Muscular (kg)"
                  />
                )}
                {chartData.some(d => d.agua_corporal) && (
                  <Line 
                    type="monotone" 
                    dataKey="agua_corporal" 
                    stroke="#0080ff" 
                    strokeWidth={2}
                    name="Água Corporal (%)"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Gráfico de IMC */}
      {chartData.some(d => d.imc) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Evolução do IMC
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[18, 35]} />
                <Tooltip 
                  labelFormatter={(label) => `Data: ${label}`}
                  formatter={(value, name) => [typeof value === 'number' ? value.toFixed(1) : value, 'IMC']}
                />
                {/* Linhas de referência do IMC */}
                <defs>
                  <linearGradient id="imcGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity={0.8} />
                    <stop offset="25%" stopColor="hsl(var(--warning))" stopOpacity={0.6} />
                    <stop offset="50%" stopColor="hsl(var(--success))" stopOpacity={0.4} />
                    <stop offset="75%" stopColor="hsl(var(--warning))" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="imc" 
                  stroke="hsl(var(--secondary))" 
                  fill="url(#imcGradient)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-4 text-xs">
              <div className="text-center p-2 bg-blue-50 dark:bg-blue-950 rounded">
                <p className="font-semibold text-blue-700 dark:text-blue-300">&lt; 18.5</p>
                <p className="text-blue-600 dark:text-blue-400">Baixo Peso</p>
              </div>
              <div className="text-center p-2 bg-green-50 dark:bg-green-950 rounded">
                <p className="font-semibold text-green-700 dark:text-green-300">18.5 - 24.9</p>
                <p className="text-green-600 dark:text-green-400">Normal</p>
              </div>
              <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-950 rounded">
                <p className="font-semibold text-yellow-700 dark:text-yellow-300">25 - 29.9</p>
                <p className="text-yellow-600 dark:text-yellow-400">Sobrepeso</p>
              </div>
              <div className="text-center p-2 bg-orange-50 dark:bg-orange-950 rounded">
                <p className="font-semibold text-orange-700 dark:text-orange-300">30 - 34.9</p>
                <p className="text-orange-600 dark:text-orange-400">Obesidade I</p>
              </div>
              <div className="text-center p-2 bg-red-50 dark:bg-red-950 rounded">
                <p className="font-semibold text-red-700 dark:text-red-300">&gt; 35</p>
                <p className="text-red-600 dark:text-red-400">Obesidade II/III</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WeightHistoryCharts;