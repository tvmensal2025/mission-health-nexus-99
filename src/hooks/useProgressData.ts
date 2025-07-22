import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface WeightMeasurement {
  id: string;
  peso_kg: number;
  gordura_corporal_percent?: number;
  massa_muscular_kg?: number;
  agua_corporal_percent?: number;
  osso_kg?: number;
  metabolismo_basal_kcal?: number;
  idade_metabolica?: number;
  imc?: number;
  circunferencia_abdominal_cm?: number;
  measurement_date: string;
  created_at: string;
}

export interface UserPhysicalData {
  id: string;
  altura_cm: number;
  idade: number;
  sexo: string;
  nivel_atividade: string;
}

export interface UserGoal {
  id: string;
  peso_meta_kg?: number;
  gordura_corporal_meta_percent?: number;
  imc_meta?: number;
  data_inicio: string;
  data_fim?: string;
  status: string;
}

export interface WeeklyAnalysis {
  id: string;
  semana_inicio: string;
  semana_fim: string;
  peso_inicial?: number;
  peso_final?: number;
  variacao_peso?: number;
  variacao_gordura_corporal?: number;
  variacao_massa_muscular?: number;
  media_imc?: number;
  tendencia: string;
  observacoes?: string;
}

export interface ProgressMetrics {
  currentWeight: number;
  weightChange: number;
  currentBMI: number;
  bmiChange: number;
  currentBodyFat: number;
  bodyFatChange: number;
  currentMuscleMass: number;
  muscleMassChange: number;
  trackingDays: number;
  metabolicAge: number;
  metabolicAgeChange: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  points: number;
  isUnlocked: boolean;
  progress: number;
  maxProgress: number;
  icon: string;
}

export interface EvolutionScore {
  score: number;
  breakdown: {
    weightProgress: number;
    bodyComposition: number;
    consistency: number;
    metabolicHealth: number;
    motivation: number;
  };
}

export const useProgressData = () => {
  const [measurements, setMeasurements] = useState<WeightMeasurement[]>([]);
  const [physicalData, setPhysicalData] = useState<UserPhysicalData | null>(null);
  const [goals, setGoals] = useState<UserGoal[]>([]);
  const [weeklyAnalyses, setWeeklyAnalyses] = useState<WeeklyAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar dados físicos do usuário
      const { data: physicalDataResult, error: physicalError } = await supabase
        .from('user_physical_data')
        .select('*')
        .single();

      if (physicalError && physicalError.code !== 'PGRST116') {
        throw physicalError;
      }

      // Buscar pesagens ordenadas por data
      const { data: measurementsResult, error: measurementsError } = await supabase
        .from('weight_measurements')
        .select('*')
        .order('measurement_date', { ascending: false });

      if (measurementsError) throw measurementsError;

      // Buscar metas do usuário
      const { data: goalsResult, error: goalsError } = await supabase
        .from('user_goals')
        .select('*')
        .eq('status', 'ativo')
        .order('created_at', { ascending: false });

      if (goalsError) throw goalsError;

      // Buscar análises semanais
      const { data: weeklyResult, error: weeklyError } = await supabase
        .from('weekly_analyses')
        .select('*')
        .order('semana_inicio', { ascending: false });

      if (weeklyError) throw weeklyError;

      setPhysicalData(physicalDataResult);
      setMeasurements(measurementsResult || []);
      setGoals(goalsResult || []);
      setWeeklyAnalyses(weeklyResult || []);

    } catch (err) {
      console.error('Error fetching progress data:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados de progresso');
    } finally {
      setLoading(false);
    }
  };

  // Calcular métricas de progresso
  const calculateMetrics = (): ProgressMetrics | null => {
    if (measurements.length === 0) return null;

    const latest = measurements[0];
    const previous = measurements[1];

    const currentWeight = latest.peso_kg;
    const weightChange = previous ? latest.peso_kg - previous.peso_kg : 0;
    
    const currentBMI = latest.imc || 0;
    const bmiChange = previous ? (latest.imc || 0) - (previous.imc || 0) : 0;
    
    const currentBodyFat = latest.gordura_corporal_percent || 0;
    const bodyFatChange = previous ? (latest.gordura_corporal_percent || 0) - (previous.gordura_corporal_percent || 0) : 0;
    
    const currentMuscleMass = latest.massa_muscular_kg || 0;
    const muscleMassChange = previous ? (latest.massa_muscular_kg || 0) - (previous.massa_muscular_kg || 0) : 0;
    
    const trackingDays = measurements.length;
    
    const metabolicAge = latest.idade_metabolica || 0;
    const metabolicAgeChange = previous ? (latest.idade_metabolica || 0) - (previous.idade_metabolica || 0) : 0;

    return {
      currentWeight,
      weightChange,
      currentBMI,
      bmiChange,
      currentBodyFat,
      bodyFatChange,
      currentMuscleMass,
      muscleMassChange,
      trackingDays,
      metabolicAge,
      metabolicAgeChange
    };
  };

  // Calcular score de evolução
  const calculateEvolutionScore = (): EvolutionScore => {
    const metrics = calculateMetrics();
    if (!metrics || !goals.length) {
      return {
        score: 50,
        breakdown: {
          weightProgress: 0,
          bodyComposition: 0,
          consistency: 0,
          metabolicHealth: 0,
          motivation: 0
        }
      };
    }

    const goal = goals[0];
    let score = 50; // Base neutra
    const breakdown = {
      weightProgress: 0,
      bodyComposition: 0,
      consistency: 0,
      metabolicHealth: 0,
      motivation: 0
    };

    // Progresso do peso (30%)
    if (goal.peso_meta_kg) {
      const isAboveTarget = metrics.currentWeight > goal.peso_meta_kg;
      if (isAboveTarget && metrics.weightChange < 0) {
        breakdown.weightProgress = 15;
      } else if (!isAboveTarget && metrics.weightChange > 0) {
        breakdown.weightProgress = 15;
      } else if (isAboveTarget && metrics.weightChange > 0) {
        breakdown.weightProgress = -10;
      } else if (!isAboveTarget && metrics.weightChange < 0) {
        breakdown.weightProgress = -10;
      }
    }

    // Composição corporal (25%)
    if (metrics.bodyFatChange < 0) {
      breakdown.bodyComposition += 12;
    }
    if (metrics.muscleMassChange > 0) {
      breakdown.bodyComposition += 13;
    }
    if (metrics.bodyFatChange > 0) {
      breakdown.bodyComposition -= 5;
    }
    if (metrics.muscleMassChange < 0) {
      breakdown.bodyComposition -= 5;
    }

    // Consistência (20%)
    const consistencyScore = Math.min(measurements.length * 2, 20);
    breakdown.consistency = consistencyScore;

    // Saúde metabólica (15%)
    if (metrics.metabolicAgeChange < 0) {
      breakdown.metabolicHealth = 15;
    }

    // Motivação (10%) - baseado na atividade recente
    const recentMeasurements = measurements.filter(m => {
      const measurementDate = new Date(m.measurement_date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return measurementDate >= weekAgo;
    });
    breakdown.motivation = Math.min(recentMeasurements.length * 2, 10);

    score += breakdown.weightProgress + breakdown.bodyComposition + 
             breakdown.consistency + breakdown.metabolicHealth + breakdown.motivation;

    return {
      score: Math.max(0, Math.min(100, score)),
      breakdown
    };
  };

  // Gerar conquistas
  const generateAchievements = (): Achievement[] => {
    const achievements: Achievement[] = [
      {
        id: 'first-measurement',
        title: 'Primeira Medição',
        description: 'Registrou sua primeira pesagem',
        points: 10,
        isUnlocked: measurements.length > 0,
        progress: measurements.length > 0 ? 1 : 0,
        maxProgress: 1,
        icon: '📊'
      },
      {
        id: 'consistent-week',
        title: 'Semana Consistente',
        description: '7 dias consecutivos de medição',
        points: 25,
        isUnlocked: false,
        progress: 0,
        maxProgress: 7,
        icon: '📅'
      },
      {
        id: 'weight-loss',
        title: 'Perda de Peso',
        description: 'Perdeu 2kg ou mais',
        points: 50,
        isUnlocked: false,
        progress: 0,
        maxProgress: 2,
        icon: '⚖️'
      },
      {
        id: 'habit-master',
        title: 'Mestre dos Hábitos',
        description: '30 dias de hábitos consistentes',
        points: 100,
        isUnlocked: false,
        progress: 0,
        maxProgress: 30,
        icon: '🏆'
      },
      {
        id: 'metabolic-improvement',
        title: 'Metabolismo Melhor',
        description: 'Reduziu a idade metabólica',
        points: 75,
        isUnlocked: false,
        progress: 0,
        maxProgress: 1,
        icon: '🔥'
      }
    ];

    // Calcular progresso das conquistas
    if (measurements.length > 0) {
      // Semana consistente
      const consecutiveDays = calculateConsecutiveDays();
      achievements[1].progress = Math.min(consecutiveDays, 7);
      achievements[1].isUnlocked = consecutiveDays >= 7;

      // Perda de peso
      const totalWeightLoss = calculateTotalWeightLoss();
      achievements[2].progress = Math.max(0, totalWeightLoss);
      achievements[2].isUnlocked = totalWeightLoss >= 2;

      // Mestre dos hábitos
      achievements[3].progress = Math.min(measurements.length, 30);
      achievements[3].isUnlocked = measurements.length >= 30;

      // Metabolismo melhor
      const metabolicImprovement = calculateMetabolicImprovement();
      achievements[4].progress = metabolicImprovement > 0 ? 1 : 0;
      achievements[4].isUnlocked = metabolicImprovement > 0;
    }

    return achievements;
  };

  // Funções auxiliares
  const calculateConsecutiveDays = (): number => {
    if (measurements.length === 0) return 0;
    
    const sortedMeasurements = [...measurements].sort((a, b) => 
      new Date(a.measurement_date).getTime() - new Date(b.measurement_date).getTime()
    );

    let consecutiveDays = 1;
    for (let i = 1; i < sortedMeasurements.length; i++) {
      const currentDate = new Date(sortedMeasurements[i].measurement_date);
      const previousDate = new Date(sortedMeasurements[i-1].measurement_date);
      const diffDays = (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (diffDays <= 1) {
        consecutiveDays++;
      } else {
        break;
      }
    }
    
    return consecutiveDays;
  };

  const calculateTotalWeightLoss = (): number => {
    if (measurements.length < 2) return 0;
    
    const sortedMeasurements = [...measurements].sort((a, b) => 
      new Date(a.measurement_date).getTime() - new Date(b.measurement_date).getTime()
    );
    
    const firstWeight = sortedMeasurements[0].peso_kg;
    const lastWeight = sortedMeasurements[sortedMeasurements.length - 1].peso_kg;
    
    return firstWeight - lastWeight;
  };

  const calculateMetabolicImprovement = (): number => {
    if (measurements.length < 2) return 0;
    
    const sortedMeasurements = [...measurements].sort((a, b) => 
      new Date(a.measurement_date).getTime() - new Date(b.measurement_date).getTime()
    );
    
    const firstMetabolicAge = sortedMeasurements[0].idade_metabolica || 0;
    const lastMetabolicAge = sortedMeasurements[sortedMeasurements.length - 1].idade_metabolica || 0;
    
    return firstMetabolicAge - lastMetabolicAge;
  };

  useEffect(() => {
    fetchProgressData();
  }, []);

  return {
    measurements,
    physicalData,
    goals,
    weeklyAnalyses,
    loading,
    error,
    refetch: fetchProgressData,
    calculateMetrics,
    calculateEvolutionScore,
    generateAchievements
  };
}; 