import React, { useState } from 'react';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useProgressData } from '../hooks/useProgressData';
import { LineChart, BarChart, AreaChart } from './ui/chart';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from './ui/skeleton';
import TestDataGenerator from './TestDataGenerator';
import { 
  Trophy, 
  Star, 
  Zap, 
  Target, 
  TrendingUp, 
  Award,
  Crown,
  Flame,
  Zap as SparklesIcon,
  Heart,
  Activity,
  Scale,
  Droplets
} from 'lucide-react';
import { ResponsiveContainer, AreaChart as RechartsAreaChart, Area, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface Achievement {
  id: string;
  title: string;
  description: string;
  points: number;
  progress: number;
  unlocked: boolean;
  icon: React.ComponentType<{ className?: string }>;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  color: string;
  animation?: string;
}

const MyProgress: React.FC = () => {
  console.log('MyProgress component rendering...'); // Debug log
  
  const [activeTab, setActiveTab] = useState('overview');
  const [hoveredAchievement, setHoveredAchievement] = useState<string | null>(null);
  
  // Dados de teste para verificar se o componente renderiza
  const testData = {
    loading: false,
    error: null,
    data: {
      weightHistory: [
        { date: '2024-01-01', value: 75.5 },
        { date: '2024-01-02', value: 75.2 },
        { date: '2024-01-03', value: 74.8 },
        { date: '2024-01-04', value: 74.9 },
        { date: '2024-01-05', value: 74.4 },
        { date: '2024-01-06', value: 74.0 },
        { date: '2024-01-07', value: 73.8 }
      ],
      bodyComposition: [
        { date: '2024-01-01', fat: 20.5, muscle: 35.2 },
        { date: '2024-01-02', fat: 20.3, muscle: 35.4 },
        { date: '2024-01-03', fat: 20.1, muscle: 35.6 },
        { date: '2024-01-04', fat: 20.0, muscle: 35.8 },
        { date: '2024-01-05', fat: 19.8, muscle: 36.0 },
        { date: '2024-01-06', fat: 19.6, muscle: 36.2 },
        { date: '2024-01-07', fat: 19.4, muscle: 36.4 }
      ],
      bmiHistory: [
        { date: '2024-01-01', value: 24.7 },
        { date: '2024-01-02', value: 24.6 },
        { date: '2024-01-03', value: 24.4 },
        { date: '2024-01-04', value: 24.5 },
        { date: '2024-01-05', value: 24.3 },
        { date: '2024-01-06', value: 24.2 },
        { date: '2024-01-07', value: 24.1 }
      ]
    },
    currentWeight: 73.8,
    weightTrend: -1.7,
    bmi: 24.1,
    bodyFat: { value: 19.4, trend: -1.1 },
    muscleMass: { value: 36.4, trend: 1.2 },
    measurementDays: 30,
    metabolicAge: { value: 28, trend: -2 },
    recentActivity: 7,
    weightGoal: 70,
    predictions: {
      goalDate: '2024-03-15',
      confidence: 85,
      nextMilestone: { value: 73.0, date: '2024-01-15' },
      recommendations: [
        'Mantenha a consistência nas medições',
        'Continue com os exercícios de força',
        'Mantenha-se hidratado',
        'Priorize o sono para melhor recuperação'
      ],
      riskFactors: [
        'Taxa de perda muito rápida',
        'Dados insuficientes para análise precisa'
      ]
    }
  };

  const { 
    data, 
    loading, 
    error,
    currentWeight,
    weightTrend,
    bmi,
    bodyFat,
    muscleMass,
    measurementDays,
    metabolicAge,
    recentActivity,
    weightGoal,
    predictions
  } = useProgressData();

  console.log('Progress data:', { 
    loading, 
    error, 
    data, 
    currentWeight, 
    measurementDays 
  }); // Debug log

  // Animações avançadas
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.1 
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 300,
        damping: 20
      }
    },
    hover: {
      scale: 1.02,
      y: -5,
      transition: { duration: 0.2 }
    }
  };

  const scoreVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: { 
        type: "spring", 
        stiffness: 200,
        damping: 15
      }
    }
  };

  // Cálculo do Score de Evolução Melhorado com Ajuste Automático
  const calculateEvolutionScore = () => {
    let score = 50; // Base neutra
    let factors = 0; // Contador de fatores considerados

    // Progresso do peso (30%) - apenas se há dados de peso
    if (currentWeight && weightGoal) {
      factors++;
      const isOverweight = currentWeight > weightGoal;
      const weightTrendIsPositive = weightTrend < 0; // Perdendo peso

      if (isOverweight && weightTrendIsPositive) score += 15;
      else if (!isOverweight && !weightTrendIsPositive) score += 15;
      else score -= 10;
    }

    // Composição corporal (25%) - apenas se há dados de composição
    if (bodyFat?.trend !== undefined) {
      factors++;
      if (bodyFat.trend < 0) score += 12; // Redução de gordura
      if (bodyFat.trend > 0) score -= 5; // Aumento de gordura
    }

    if (muscleMass?.trend !== undefined) {
      factors++;
      if (muscleMass.trend > 0) score += 13; // Ganho de músculo
      if (muscleMass.trend < 0) score -= 5; // Perda de músculo
    }

    // Consistência (20%) - sempre disponível
    factors++;
    const consistencyScore = Math.min(20, (measurementDays / 30) * 20);
    score += consistencyScore;

    // Saúde metabólica (15%) - apenas se há dados metabólicos
    if (metabolicAge?.trend !== undefined) {
      factors++;
      if (metabolicAge.trend < 0) score += 15;
    }

    // Motivação (10%) - sempre disponível
    factors++;
    score += Math.min(10, (recentActivity / 7) * 10);

    // Ajustar score baseado no número de fatores considerados
    if (factors > 0) {
      score = Math.max(0, Math.min(100, score));
    } else {
      score = 0; // Se não há dados, score é 0
    }

    return score;
  };

  // Gradiente dinâmico baseado no score
  const getScoreGradient = (score: number) => {
    if (score >= 80) return "from-green-500 to-emerald-600";
    if (score >= 60) return "from-yellow-500 to-orange-500";
    if (score >= 40) return "from-orange-500 to-red-500";
    return "from-gray-500 to-gray-600";
  };

  // Sistema de conquistas expandido com cálculo automático
  const achievements: Achievement[] = [
    {
      id: 'first-measurement',
      title: 'Primeira Medição',
      description: 'Realizou sua primeira pesagem',
      points: 10,
      progress: measurementDays > 0 ? 100 : 0,
      unlocked: measurementDays > 0,
      icon: Scale,
      rarity: 'common',
      color: 'text-blue-500'
    },
    {
      id: 'consistent-week',
      title: 'Semana Consistente',
      description: '7 dias consecutivos de medição',
      points: 25,
      progress: Math.min(100, (recentActivity / 7) * 100),
      unlocked: recentActivity >= 7,
      icon: Flame,
      rarity: 'rare',
      color: 'text-orange-500'
    },
    {
      id: 'weight-loss',
      title: 'Transformação',
      description: 'Perdeu 2kg ou mais',
      points: 50,
      progress: weightTrend <= -2 ? 100 : Math.min(100, Math.abs(weightTrend / 2) * 100),
      unlocked: weightTrend <= -2,
      icon: Zap,
      rarity: 'epic',
      color: 'text-purple-500'
    },
    {
      id: 'habit-master',
      title: 'Mestre dos Hábitos',
      description: '30 dias de hábitos consistentes',
      points: 100,
      progress: Math.min(100, (measurementDays / 30) * 100),
      unlocked: measurementDays >= 30,
      icon: Crown,
      rarity: 'legendary',
      color: 'text-yellow-500'
    },
    {
      id: 'better-metabolism',
      title: 'Metabolismo Melhor',
      description: 'Redução da idade metabólica',
      points: 75,
      progress: metabolicAge?.trend < 0 ? 100 : 0,
      unlocked: metabolicAge?.trend < 0,
      icon: Heart,
      rarity: 'epic',
      color: 'text-red-500'
    },
    {
      id: 'hydration-master',
      title: 'Mestre da Hidratação',
      description: 'Manteve hidratação por 7 dias',
      points: 30,
      progress: Math.min(100, (recentActivity / 7) * 100),
      unlocked: recentActivity >= 7,
      icon: Droplets,
      rarity: 'rare',
      color: 'text-cyan-500'
    },
    {
      id: 'streak-14',
      title: 'Foguete',
      description: '14 dias consecutivos',
      points: 60,
      progress: Math.min(100, (measurementDays / 14) * 100),
      unlocked: measurementDays >= 14,
      icon: TrendingUp,
      rarity: 'epic',
      color: 'text-green-500'
    },
    {
      id: 'perfect-week',
      title: 'Semana Perfeita',
      description: '7 dias com todas as metas atingidas',
      points: 80,
      progress: Math.min(100, (recentActivity / 7) * 100),
      unlocked: recentActivity >= 7,
      icon: Star,
      rarity: 'legendary',
      color: 'text-yellow-400'
    },
    // Conquistas baseadas em dados de composição corporal
    {
      id: 'body-composition',
      title: 'Composição Corporal',
      description: 'Mediu gordura corporal e massa muscular',
      points: 20,
      progress: (bodyFat?.value !== undefined && muscleMass?.value !== undefined) ? 100 : 0,
      unlocked: (bodyFat?.value !== undefined && muscleMass?.value !== undefined),
      icon: Activity,
      rarity: 'rare',
      color: 'text-green-500'
    },
    {
      id: 'fat-loss',
      title: 'Redução de Gordura',
      description: 'Reduziu gordura corporal em 1%',
      points: 40,
      progress: bodyFat?.trend < 0 ? Math.min(100, Math.abs(bodyFat.trend) * 100) : 0,
      unlocked: bodyFat?.trend <= -1,
      icon: TrendingUp,
      rarity: 'epic',
      color: 'text-orange-500'
    },
    {
      id: 'muscle-gain',
      title: 'Ganho Muscular',
      description: 'Aumentou massa muscular em 1kg',
      points: 45,
      progress: muscleMass?.trend > 0 ? Math.min(100, muscleMass.trend * 100) : 0,
      unlocked: muscleMass?.trend >= 1,
      icon: Zap,
      rarity: 'epic',
      color: 'text-purple-500'
    },
    // Conquistas baseadas em IMC
    {
      id: 'healthy-bmi',
      title: 'IMC Saudável',
      description: 'Manteve IMC entre 18.5 e 24.9',
      points: 35,
      progress: (bmi && bmi >= 18.5 && bmi <= 24.9) ? 100 : 0,
      unlocked: (bmi && bmi >= 18.5 && bmi <= 24.9),
      icon: Target,
      rarity: 'rare',
      color: 'text-green-500'
    },
    {
      id: 'bmi-improvement',
      title: 'Melhoria do IMC',
      description: 'Reduziu IMC em 1 ponto',
      points: 55,
      progress: bmi ? Math.min(100, Math.max(0, (30 - bmi) * 10)) : 0,
      unlocked: bmi && bmi < 25,
      icon: TrendingUp,
      rarity: 'epic',
      color: 'text-blue-500'
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50';
      case 'rare': return 'border-blue-300 bg-blue-50';
      case 'epic': return 'border-purple-300 bg-purple-50';
      case 'legendary': return 'border-yellow-300 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'common': return { text: 'Comum', color: 'bg-gray-500' };
      case 'rare': return { text: 'Raro', color: 'bg-blue-500' };
      case 'epic': return { text: 'Épico', color: 'bg-purple-500' };
      case 'legendary': return { text: 'Lendário', color: 'bg-yellow-500' };
      default: return { text: 'Comum', color: 'bg-gray-500' };
    }
  };

  if (loading) {
    console.log('Loading state...'); // Debug log
    return <ProgressSkeleton />;
  }

  if (error) {
    console.log('Error state:', error); // Debug log
    return (
      <Card className="p-6">
        <div className="text-red-500">
          Erro ao carregar dados de progresso. Por favor, tente novamente.
        </div>
      </Card>
    );
  }

  // Usar dados de teste se não houver dados reais
  const displayData = data || testData.data;
  const displayCurrentWeight = currentWeight || testData.currentWeight;
  const displayWeightTrend = weightTrend || testData.weightTrend;
  const displayBmi = bmi || testData.bmi;
  const displayBodyFat = bodyFat || testData.bodyFat;
  const displayMuscleMass = muscleMass || testData.muscleMass;
  const displayMeasurementDays = measurementDays || testData.measurementDays;
  const displayMetabolicAge = metabolicAge || testData.metabolicAge;
  const displayRecentActivity = recentActivity || testData.recentActivity;
  const displayWeightGoal = weightGoal || testData.weightGoal;
  const displayPredictions = predictions || testData.predictions;

  if (!displayData || !displayCurrentWeight) {
    console.log('No data state - showing TestDataGenerator'); // Debug log
    return <TestDataGenerator />;
  }

  const evolutionScore = calculateEvolutionScore();
  console.log('Evolution score:', evolutionScore); // Debug log
  console.log('Available data:', { 
    currentWeight, 
    weightGoal, 
    bodyFat: bodyFat?.value, 
    muscleMass: muscleMass?.value, 
    bmi, 
    measurementDays, 
    recentActivity 
  }); // Debug log para mostrar dados disponíveis

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="graphs">Gráficos</TabsTrigger>
          <TabsTrigger value="achievements">Conquistas</TabsTrigger>
          <TabsTrigger value="predictions">Previsões</TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="overview" key="overview">
            <OverviewTab 
              score={evolutionScore}
              currentWeight={displayCurrentWeight}
              weightTrend={displayWeightTrend}
              bmi={displayBmi}
              bodyFat={displayBodyFat}
              muscleMass={displayMuscleMass}
              measurementDays={displayMeasurementDays}
              getScoreGradient={getScoreGradient}
              cardVariants={cardVariants}
              scoreVariants={scoreVariants}
            />
          </TabsContent>

          <TabsContent value="graphs" key="graphs">
            <GraphsTab 
              weightData={displayData?.weightHistory}
              bodyCompositionData={displayData?.bodyComposition}
              bmiData={displayData?.bmiHistory}
              cardVariants={cardVariants}
            />
          </TabsContent>

          <TabsContent value="achievements" key="achievements">
            <AchievementsTab 
              achievements={achievements}
              getRarityColor={getRarityColor}
              getRarityBadge={getRarityBadge}
              hoveredAchievement={hoveredAchievement}
              setHoveredAchievement={setHoveredAchievement}
              cardVariants={cardVariants}
            />
          </TabsContent>

          <TabsContent value="predictions" key="predictions">
            <PredictionsTab predictions={displayPredictions} cardVariants={cardVariants} />
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </motion.div>
  );
};

// Componente de Métrica Melhorado com Ajuste Automático
const MetricCard: React.FC<{
  title: string;
  value?: number;
  trend?: number;
  unit?: string;
  reference?: string;
  icon?: React.ComponentType<{ className?: string }>;
  cardVariants: any;
  available?: boolean;
}> = ({ title, value, trend, unit, reference, icon: Icon, cardVariants, available = true }) => {
  const getTrendColor = (trend?: number) => {
    if (!trend) return 'text-gray-500';
    return trend < 0 ? 'text-green-500' : 'text-red-500';
  };

  const getTrendIcon = (trend?: number) => {
    if (!trend) return null;
    return trend < 0 ? '↓' : '↑';
  };

  // Se não há dados disponíveis, mostrar card desabilitado
  if (!available) {
    return (
      <motion.div variants={cardVariants} whileHover="hover">
        <Card className="p-6 transition-all duration-300 opacity-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">{title}</h3>
            {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
          </div>
          
          <div className="flex items-end gap-2 mb-2">
            <div className="text-3xl font-bold text-muted-foreground">
              --
              {unit && <span className="text-lg ml-1">{unit}</span>}
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">Dados não disponíveis</p>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div variants={cardVariants} whileHover="hover">
      <Card className="p-6 transition-all duration-300 hover:shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
        </div>
        
        <div className="flex items-end gap-2 mb-2">
          <div className="text-3xl font-bold">
            {value?.toFixed(1)}
            {unit && <span className="text-lg ml-1">{unit}</span>}
          </div>
          {trend !== undefined && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`${getTrendColor(trend)} text-lg font-medium`}
            >
              {getTrendIcon(trend)} {Math.abs(trend).toFixed(1)}
            </motion.div>
          )}
        </div>
        
        {reference && (
          <p className="text-sm text-muted-foreground">{reference}</p>
        )}
      </Card>
    </motion.div>
  );
};

// Componente de Visão Geral Melhorado com Ajuste Automático
const OverviewTab: React.FC<{
  score: number;
  currentWeight?: number;
  weightTrend?: number;
  bmi?: number;
  bodyFat?: { value: number; trend: number };
  muscleMass?: { value: number; trend: number };
  measurementDays: number;
  getScoreGradient: (score: number) => string;
  cardVariants: any;
  scoreVariants: any;
}> = ({ score, currentWeight, weightTrend, bmi, bodyFat, muscleMass, measurementDays, getScoreGradient, cardVariants, scoreVariants }) => {
  // Determinar automaticamente quais métricas mostrar
  const hasWeightData = currentWeight !== undefined && currentWeight !== null;
  const hasBmiData = bmi !== undefined && bmi !== null;
  const hasBodyFatData = bodyFat?.value !== undefined && bodyFat.value !== null;
  const hasMuscleData = muscleMass?.value !== undefined && muscleMass.value !== null;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <motion.div
        variants={cardVariants}
        whileHover="hover"
        className="col-span-full"
      >
        <Card className={`p-6 bg-gradient-to-r ${getScoreGradient(score)} text-white`}>
          <motion.div
            variants={scoreVariants}
            className="text-center"
          >
            <h3 className="text-2xl font-bold mb-2">Score de Evolução</h3>
            <div className="text-6xl font-bold mb-4">{score}%</div>
            <Progress value={score} className="mt-4 bg-white/20" />
            <div className="mt-4 flex justify-center gap-2">
              {score >= 80 && <SparklesIcon className="h-5 w-5 text-yellow-300" />}
              {score >= 60 && <Star className="h-5 w-5 text-yellow-300" />}
              {score >= 40 && <TrendingUp className="h-5 w-5 text-white" />}
            </div>
          </motion.div>
        </Card>
      </motion.div>

      <MetricCard
        title="Peso Atual"
        value={currentWeight}
        trend={weightTrend}
        unit="kg"
        icon={Scale}
        cardVariants={cardVariants}
        available={hasWeightData}
      />

      <MetricCard
        title="IMC"
        value={bmi}
        trend={bmi ? bmi - 25 : undefined}
        reference="Meta: 25"
        icon={Target}
        cardVariants={cardVariants}
        available={hasBmiData}
      />

      <MetricCard
        title="Gordura Corporal"
        value={bodyFat?.value}
        trend={bodyFat?.trend}
        unit="%"
        icon={Activity}
        cardVariants={cardVariants}
        available={hasBodyFatData}
      />

      <MetricCard
        title="Massa Muscular"
        value={muscleMass?.value}
        trend={muscleMass?.trend}
        unit="kg"
        icon={TrendingUp}
        cardVariants={cardVariants}
        available={hasMuscleData}
      />

      <motion.div
        variants={cardVariants}
        whileHover="hover"
      >
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-2">Dias de Acompanhamento</h3>
          <div className="text-3xl font-bold">{measurementDays}</div>
          <div className="mt-2 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span className="text-sm text-muted-foreground">
              {measurementDays >= 30 ? 'Mestre!' : `${30 - measurementDays} dias para o próximo marco`}
            </span>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

// Componente de Gráficos Interativos com Ajuste Automático
const GraphsTab: React.FC<{
  weightData?: { date: string; value: number }[];
  bodyCompositionData?: { date: string; fat: number; muscle: number }[];
  bmiData?: { date: string; value: number }[];
  cardVariants: any;
}> = ({ weightData, bodyCompositionData, bmiData, cardVariants }) => {
  const [activeChart, setActiveChart] = useState('weight');

  // Determinar automaticamente quais gráficos mostrar baseado nos dados disponíveis
  const availableCharts = [];
  if (weightData && weightData.length > 0) availableCharts.push('weight');
  if (bodyCompositionData && bodyCompositionData.some(d => d.fat || d.muscle)) availableCharts.push('composition');
  if (bmiData && bmiData.length > 0) availableCharts.push('bmi');

  // Se não há dados, mostrar mensagem
  if (availableCharts.length === 0) {
    return (
      <motion.div variants={cardVariants} whileHover="hover">
        <Card className="p-6">
          <div className="text-center">
            <Scale className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum Dado Disponível</h3>
            <p className="text-muted-foreground">
              Registre suas primeiras medições para ver os gráficos de evolução.
            </p>
          </div>
        </Card>
      </motion.div>
    );
  }

  // Ajustar gráfico ativo automaticamente se o atual não está disponível
  if (!availableCharts.includes(activeChart)) {
    setActiveChart(availableCharts[0]);
  }

  return (
    <div className="space-y-6">
      {/* Botões de seleção automáticos */}
      {availableCharts.length > 1 && (
        <div className="flex gap-2 mb-6">
          {availableCharts.includes('weight') && (
            <Button
              variant={activeChart === 'weight' ? 'default' : 'outline'}
              onClick={() => setActiveChart('weight')}
              className="flex items-center gap-2"
            >
              <Scale className="h-4 w-4" />
              Peso
            </Button>
          )}
          {availableCharts.includes('composition') && (
            <Button
              variant={activeChart === 'composition' ? 'default' : 'outline'}
              onClick={() => setActiveChart('composition')}
              className="flex items-center gap-2"
            >
              <Activity className="h-4 w-4" />
              Composição
            </Button>
          )}
          {availableCharts.includes('bmi') && (
            <Button
              variant={activeChart === 'bmi' ? 'default' : 'outline'}
              onClick={() => setActiveChart('bmi')}
              className="flex items-center gap-2"
            >
              <Target className="h-4 w-4" />
              IMC
            </Button>
          )}
        </div>
      )}

      <AnimatePresence mode="wait">
        {activeChart === 'weight' && weightData && (
          <motion.div
            key="weight"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div variants={cardVariants} whileHover="hover">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Evolução do Peso</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsAreaChart data={weightData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    />
                    <YAxis 
                      domain={['dataMin - 1', 'dataMax + 1']}
                      tickFormatter={(value) => `${value}kg`}
                    />
                    <Tooltip 
                      labelFormatter={(label) => `Data: ${new Date(label).toLocaleDateString('pt-BR')}`}
                      formatter={(value, name) => [`${value}kg`, 'Peso']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary) / 0.2)" 
                      strokeWidth={2}
                    />
                  </RechartsAreaChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {activeChart === 'composition' && bodyCompositionData && (
          <motion.div
            key="composition"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div variants={cardVariants} whileHover="hover">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Composição Corporal</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={bodyCompositionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(label) => `Data: ${new Date(label).toLocaleDateString('pt-BR')}`}
                    />
                    <Legend />
                    {bodyCompositionData.some(d => d.fat) && (
                      <Line 
                        type="monotone" 
                        dataKey="fat" 
                        stroke="#ff7300" 
                        strokeWidth={2}
                        name="Gordura Corporal (%)"
                        dot={{ fill: '#ff7300', strokeWidth: 2, r: 4 }}
                      />
                    )}
                    {bodyCompositionData.some(d => d.muscle) && (
                      <Line 
                        type="monotone" 
                        dataKey="muscle" 
                        stroke="#00ff00" 
                        strokeWidth={2}
                        name="Massa Muscular (kg)"
                        dot={{ fill: '#00ff00', strokeWidth: 2, r: 4 }}
                      />
                    )}
                  </RechartsLineChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {activeChart === 'bmi' && bmiData && (
          <motion.div
            key="bmi"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div variants={cardVariants} whileHover="hover">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">IMC</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsAreaChart data={bmiData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    />
                    <YAxis domain={[18, 35]} />
                    <Tooltip 
                      labelFormatter={(label) => `Data: ${new Date(label).toLocaleDateString('pt-BR')}`}
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
                      dataKey="value" 
                      stroke="hsl(var(--secondary))" 
                      fill="url(#imcGradient)" 
                      strokeWidth={2}
                    />
                  </RechartsAreaChart>
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
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Componente de Conquistas Expandido
const AchievementsTab: React.FC<{
  achievements: Achievement[];
  getRarityColor: (rarity: string) => string;
  getRarityBadge: (rarity: string) => { text: string; color: string };
  hoveredAchievement: string | null;
  setHoveredAchievement: (id: string | null) => void;
  cardVariants: any;
}> = ({ achievements, getRarityColor, getRarityBadge, hoveredAchievement, setHoveredAchievement, cardVariants }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {achievements.map((achievement) => {
        const Icon = achievement.icon;
        const rarityBadge = getRarityBadge(achievement.rarity);
        
        return (
          <motion.div
            key={achievement.id}
            variants={cardVariants}
            whileHover="hover"
            onHoverStart={() => setHoveredAchievement(achievement.id)}
            onHoverEnd={() => setHoveredAchievement(null)}
            className="relative"
          >
            <Card className={`p-4 border-2 transition-all duration-300 ${
              hoveredAchievement === achievement.id 
                ? 'scale-105 shadow-lg' 
                : ''
            } ${getRarityColor(achievement.rarity)}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${achievement.color} bg-opacity-20`}>
                    <Icon className={`h-5 w-5 ${achievement.color}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{achievement.title}</h3>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                </div>
                <Badge className={`${rarityBadge.color} text-white`}>
                  {rarityBadge.text}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{achievement.points} pontos</span>
                  <span>{achievement.progress.toFixed(0)}%</span>
                </div>
                <Progress value={achievement.progress} className="h-2" />
                
                {achievement.unlocked && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-2 text-green-600 text-sm"
                  >
                    <SparklesIcon className="h-4 w-4" />
                    <span>Desbloqueado!</span>
                  </motion.div>
                )}
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

// Componente de Previsões Melhorado com Ajuste Automático
const PredictionsTab: React.FC<{
  predictions?: {
    goalDate?: string;
    confidence: number;
    nextMilestone?: { value: number; date: string };
    recommendations: string[];
    riskFactors: string[];
  };
  cardVariants: any;
}> = ({ predictions, cardVariants }) => {
  // Se não há previsões, mostrar mensagem informativa
  if (!predictions) {
    return (
      <motion.div variants={cardVariants} whileHover="hover">
        <Card className="p-6">
          <div className="text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Previsões Indisponíveis</h3>
            <p className="text-muted-foreground">
              Configure uma meta de peso para ver previsões inteligentes.
            </p>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="grid gap-6">
      <motion.div variants={cardVariants} whileHover="hover">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Previsões Inteligentes</h3>
          
          {predictions.goalDate && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <h4 className="font-medium text-blue-800">Data Estimada para Meta</h4>
              <p className="text-2xl font-bold text-blue-900">
                {new Date(predictions.goalDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-blue-600">
                Nível de confiança: {predictions.confidence}%
              </p>
            </div>
          )}

          {predictions.nextMilestone && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
              <h4 className="font-medium text-green-800">Próximo Marco</h4>
              <p className="text-xl font-bold text-green-900">
                {predictions.nextMilestone.value}kg em {new Date(predictions.nextMilestone.date).toLocaleDateString()}
              </p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 text-green-700">Recomendações</h4>
              <ul className="space-y-2">
                {predictions.recommendations.map((rec, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-2 text-sm"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <span>{rec}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-3 text-red-700">Fatores de Risco</h4>
              <ul className="space-y-2">
                {predictions.riskFactors.map((risk, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-2 text-sm text-red-600"
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                    <span>{risk}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

// Componente de Skeleton Loading Melhorado
const ProgressSkeleton: React.FC = () => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="p-6">
          <Skeleton className="h-4 w-1/2 mb-4" />
          <Skeleton className="h-8 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </Card>
      ))}
    </div>
  );
};

export default MyProgress; 