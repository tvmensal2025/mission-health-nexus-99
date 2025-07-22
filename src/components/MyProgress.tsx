import React, { useState } from 'react';
import { 
  TrendingUp, TrendingDown, Minus, Trophy, Target, 
  BarChart3, Calendar, Zap, Activity, Award,
  ArrowUpRight, ArrowDownRight, Clock, Target as TargetIcon
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useProgressData } from '@/hooks/useProgressData';
import ProgressCharts from './ProgressCharts';
import TestDataGenerator from './TestDataGenerator';
import { cn } from '@/lib/utils';

export default function MyProgress() {
  const [activeTab, setActiveTab] = useState('overview');
  const { 
    measurements, 
    physicalData, 
    goals, 
    weeklyAnalyses, 
    loading, 
    error,
    calculateMetrics,
    calculateEvolutionScore,
    generateAchievements
  } = useProgressData();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const metrics = calculateMetrics();
  const evolutionScore = calculateEvolutionScore();
  const achievements = generateAchievements();

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const formatWeight = (weight: number) => `${weight.toFixed(1)}kg`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatBMI = (bmi: number) => bmi.toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Meu Progresso</h1>
          <p className="text-muted-foreground">
            Acompanhe sua evolução e conquiste seus objetivos
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {measurements.length} medições
        </Badge>
      </div>

      {/* Gerador de Dados de Teste */}
      {measurements.length === 0 && (
        <TestDataGenerator />
      )}

      {/* Score de Evolução */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Score de Evolução
          </CardTitle>
          <CardDescription>
            Seu progresso geral baseado em múltiplos fatores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {evolutionScore.score}%
                  </span>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Zap className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Peso:</span>
                  <Badge variant="outline" className="text-xs">
                    {evolutionScore.breakdown.weightProgress > 0 ? '+' : ''}{evolutionScore.breakdown.weightProgress}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Composição:</span>
                  <Badge variant="outline" className="text-xs">
                    {evolutionScore.breakdown.bodyComposition > 0 ? '+' : ''}{evolutionScore.breakdown.bodyComposition}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Consistência:</span>
                  <Badge variant="outline" className="text-xs">
                    +{evolutionScore.breakdown.consistency}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Próximo marco</p>
              <p className="text-lg font-semibold">75%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="charts">Gráficos</TabsTrigger>
          <TabsTrigger value="achievements">Conquistas</TabsTrigger>
          <TabsTrigger value="predictions">Previsões</TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Peso Atual */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Peso Atual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {metrics ? formatWeight(metrics.currentWeight) : '--'}
                  </span>
                  {metrics && (
                    <div className="flex items-center gap-1">
                      {getTrendIcon(metrics.weightChange)}
                      <span className={cn("text-sm", getTrendColor(metrics.weightChange))}>
                        {Math.abs(metrics.weightChange).toFixed(1)}kg
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* IMC */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">IMC</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {metrics ? formatBMI(metrics.currentBMI) : '--'}
                  </span>
                  {metrics && (
                    <div className="flex items-center gap-1">
                      {getTrendIcon(metrics.bmiChange)}
                      <span className={cn("text-sm", getTrendColor(metrics.bmiChange))}>
                        {Math.abs(metrics.bmiChange).toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Gordura Corporal */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Gordura Corporal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {metrics ? formatPercentage(metrics.currentBodyFat) : '--'}
                  </span>
                  {metrics && (
                    <div className="flex items-center gap-1">
                      {getTrendIcon(-metrics.bodyFatChange)}
                      <span className={cn("text-sm", getTrendColor(-metrics.bodyFatChange))}>
                        {Math.abs(metrics.bodyFatChange).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Massa Muscular */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Massa Muscular</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {metrics ? formatWeight(metrics.currentMuscleMass) : '--'}
                  </span>
                  {metrics && (
                    <div className="flex items-center gap-1">
                      {getTrendIcon(metrics.muscleMassChange)}
                      <span className={cn("text-sm", getTrendColor(metrics.muscleMassChange))}>
                        {Math.abs(metrics.muscleMassChange).toFixed(1)}kg
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Métricas Adicionais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Dias de Acompanhamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold">{metrics?.trackingDays || 0}</span>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Idade Metabólica
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{metrics?.metabolicAge || '--'}</span>
                  {metrics && (
                    <div className="flex items-center gap-1">
                      {getTrendIcon(-metrics.metabolicAgeChange)}
                      <span className={cn("text-sm", getTrendColor(-metrics.metabolicAgeChange))}>
                        {Math.abs(metrics.metabolicAgeChange)} anos
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TargetIcon className="w-4 h-4" />
                  Meta de Peso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold">
                  {goals.length > 0 && goals[0].peso_meta_kg 
                    ? formatWeight(goals[0].peso_meta_kg) 
                    : '--'}
                </span>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Gráficos */}
        <TabsContent value="charts" className="space-y-4">
          <ProgressCharts measurements={measurements} />
        </TabsContent>

        {/* Conquistas */}
        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className={cn(
                "transition-all duration-300",
                achievement.isUnlocked 
                  ? "border-primary/50 bg-primary/5" 
                  : "border-muted/50"
              )}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{achievement.icon}</span>
                    <Badge variant={achievement.isUnlocked ? "default" : "secondary"}>
                      {achievement.points} pts
                    </Badge>
                  </div>
                  <CardTitle className="text-sm">{achievement.title}</CardTitle>
                  <CardDescription className="text-xs">
                    {achievement.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Progresso</span>
                      <span>{achievement.progress}/{achievement.maxProgress}</span>
                    </div>
                    <Progress 
                      value={(achievement.progress / achievement.maxProgress) * 100} 
                      className="h-2"
                    />
                    {achievement.isUnlocked && (
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <Trophy className="w-3 h-3" />
                        Conquistado!
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Previsões */}
        <TabsContent value="predictions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Previsão de Meta */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Previsão de Meta
                </CardTitle>
                <CardDescription>
                  Quando você atingirá sua meta de peso
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {goals.length > 0 && metrics ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Meta atual</span>
                      <span className="font-semibold">
                        {formatWeight(goals[0].peso_meta_kg || 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Peso atual</span>
                      <span className="font-semibold">
                        {formatWeight(metrics.currentWeight)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Diferença</span>
                      <span className={cn(
                        "font-semibold",
                        getTrendColor(metrics.currentWeight - (goals[0].peso_meta_kg || 0))
                      )}>
                        {formatWeight(Math.abs(metrics.currentWeight - (goals[0].peso_meta_kg || 0)))}
                      </span>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Data estimada</span>
                        <span className="font-semibold text-primary">15 de Dezembro</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-muted-foreground">Confiança</span>
                        <span className="font-semibold text-green-600">85%</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Configure uma meta para ver previsões
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Recomendações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Recomendações
                </CardTitle>
                <CardDescription>
                  Dicas personalizadas para otimizar seu progresso
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <ArrowUpRight className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Aumente a frequência de medições
                    </p>
                    <p className="text-xs text-blue-700">
                      Medir 3x por semana melhora a precisão do acompanhamento
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <ArrowUpRight className="w-4 h-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-900">
                      Mantenha a consistência
                    </p>
                    <p className="text-xs text-green-700">
                      Você está no caminho certo! Continue assim
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                  <ArrowDownRight className="w-4 h-4 text-orange-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-900">
                      Foque na hidratação
                    </p>
                    <p className="text-xs text-orange-700">
                      Beber mais água pode acelerar seus resultados
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 