import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WeightMeasurement {
  id: string;
  peso_kg: number;
  gordura_corporal_percent?: number;
  gordura_visceral?: number;
  massa_muscular_kg?: number;
  agua_corporal_percent?: number;
  osso_kg?: number;
  metabolismo_basal_kcal?: number;
  idade_metabolica?: number;
  risco_metabolico?: string;
  imc?: number;
  circunferencia_abdominal_cm?: number;
  circunferencia_braco_cm?: number;
  circunferencia_perna_cm?: number;
  device_type: string;
  notes?: string;
  measurement_date: string;
  created_at: string;
}

export interface UserPhysicalData {
  id: string;
  altura_cm: number;
  idade: number;
  sexo: string;
  nivel_atividade: string;
  created_at: string;
  updated_at: string;
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
  tendencia?: string;
  observacoes?: string;
}

export const useWeightMeasurement = () => {
  const [measurements, setMeasurements] = useState<WeightMeasurement[]>([]);
  const [physicalData, setPhysicalData] = useState<UserPhysicalData | null>(null);
  const [weeklyAnalyses, setWeeklyAnalyses] = useState<WeeklyAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Buscar dados físicos do usuário
  const fetchPhysicalData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_physical_data')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setPhysicalData(data);
    } catch (err) {
      console.error('Error fetching physical data:', err);
      setError(err.message);
    }
  };

  // Salvar dados físicos do usuário
  const savePhysicalData = async (data: Omit<UserPhysicalData, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: result, error } = await supabase
        .from('user_physical_data')
        .upsert({
          user_id: user.id,
          ...data
        })
        .select()
        .single();

      if (error) throw error;
      
      setPhysicalData(result);
      toast({
        title: "Dados salvos!",
        description: "Seus dados físicos foram salvos com sucesso.",
      });
      return result;
    } catch (err) {
      setError(err.message);
      toast({
        title: "Erro",
        description: "Erro ao salvar dados físicos: " + err.message,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Salvar nova pesagem
  const saveMeasurement = async (measurement: Omit<WeightMeasurement, 'id' | 'measurement_date' | 'created_at'>) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Verificar se dados físicos existem
      if (!physicalData) {
        throw new Error('Você precisa cadastrar seus dados físicos primeiro (altura, idade, sexo)');
      }

      const { data, error } = await supabase
        .from('weight_measurements')
        .insert({
          user_id: user.id,
          ...measurement,
          measurement_date: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      
      // Atualizar lista de pesagens
      setMeasurements(prev => [data, ...prev]);
      
      // Buscar análises semanais atualizadas
      await fetchWeeklyAnalysis();
      
      const riskMessages = {
        'baixo_peso': 'Seu IMC indica baixo peso. Considere consultar um profissional.',
        'normal': 'Parabéns! Seu IMC está dentro do ideal.',
        'sobrepeso': 'Seu IMC indica sobrepeso. Continue se cuidando!',
        'obesidade_grau1': 'Seu IMC indica obesidade grau I. Busque orientação profissional.',
        'obesidade_grau2': 'Seu IMC indica obesidade grau II. Recomendamos acompanhamento médico.',
        'obesidade_grau3': 'Seu IMC indica obesidade grau III. Procure acompanhamento médico urgente.'
      };

      toast({
        title: "Pesagem salva!",
        description: `Peso: ${data.peso_kg}kg | IMC: ${data.imc?.toFixed(1)} | ${riskMessages[data.risco_metabolico] || 'Pesagem registrada com sucesso'}`,
      });

      return data;
    } catch (err) {
      setError(err.message);
      toast({
        title: "Erro",
        description: err.message,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Buscar histórico de pesagens
  const fetchMeasurements = async (limit = 30) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('weight_measurements')
        .select('*')
        .eq('user_id', user.id)
        .order('measurement_date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setMeasurements(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Buscar análise semanal
  const fetchWeeklyAnalysis = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('weekly_analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('semana_inicio', { ascending: false })
        .limit(8);

      if (error) throw error;
      setWeeklyAnalyses(data || []);
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    }
  };

  // Calcular estatísticas
  const getStats = () => {
    if (measurements.length === 0) return null;

    const latest = measurements[0];
    const previous = measurements[1];
    
    return {
      currentWeight: latest.peso_kg,
      currentIMC: latest.imc,
      weightChange: previous ? latest.peso_kg - previous.peso_kg : 0,
      trend: previous 
        ? latest.peso_kg > previous.peso_kg 
          ? 'increasing' 
          : latest.peso_kg < previous.peso_kg 
            ? 'decreasing' 
            : 'stable'
        : 'stable',
      riskLevel: latest.risco_metabolico,
      totalMeasurements: measurements.length
    };
  };

  useEffect(() => {
    fetchPhysicalData();
    fetchMeasurements();
    fetchWeeklyAnalysis();
  }, []);

  return {
    measurements,
    physicalData,
    weeklyAnalyses,
    loading,
    error,
    stats: getStats(),
    saveMeasurement,
    savePhysicalData,
    fetchMeasurements,
    fetchWeeklyAnalysis,
    fetchPhysicalData
  };
};