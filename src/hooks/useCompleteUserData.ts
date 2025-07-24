import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CompleteUserMeasurement {
  // Dados pessoais básicos
  full_name?: string;
  phone?: string;
  birth_date?: string;
  city?: string;
  state?: string;
  
  // Dados físicos básicos
  altura_cm: number;
  idade: number;
  sexo: string;
  nivel_atividade?: string;
  
  // Medições corporais completas
  peso_kg: number;
  gordura_corporal_percent?: number;
  gordura_visceral?: number;
  massa_muscular_kg?: number;
  agua_corporal_percent?: number;
  osso_kg?: number;
  metabolismo_basal_kcal?: number;
  idade_metabolica?: number;
  
  // Medidas corporais
  circunferencia_abdominal_cm?: number;
  circunferencia_braco_cm?: number;
  circunferencia_perna_cm?: number;
  
  // Metadados
  device_type?: string;
  notes?: string;
}

export const useCompleteUserData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Salvar dados completos do usuário em TODAS as tabelas
  const saveCompleteUserData = async (userData: CompleteUserMeasurement) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      console.log('🔄 Iniciando salvamento completo dos dados do usuário:', userData);

      // 1. SALVAR/ATUALIZAR PERFIL DO USUÁRIO (user_profiles)
      const profileData = {
        user_id: user.id,
        full_name: userData.full_name,
        phone: userData.phone,
        birth_date: userData.birth_date,
        city: userData.city,
        state: userData.state
      };

      console.log('💾 Salvando dados do perfil:', profileData);
      
      const { data: profileResult, error: profileError } = await supabase
        .from('user_profiles')
        .upsert(profileData)
        .select()
        .single();

      if (profileError) {
        console.error('❌ Erro ao salvar perfil:', profileError);
        throw new Error(`Erro no perfil: ${profileError.message}`);
      }
      
      console.log('✅ Perfil salvo com sucesso:', profileResult);

      // 2. SALVAR/ATUALIZAR DADOS FÍSICOS (user_physical_data)
      const physicalData = {
        user_id: user.id,
        altura_cm: userData.altura_cm,
        idade: userData.idade,
        sexo: userData.sexo,
        nivel_atividade: userData.nivel_atividade || 'moderado'
      };

      console.log('💾 Salvando dados físicos:', physicalData);
      
      const { data: physicalResult, error: physicalError } = await supabase
        .from('user_physical_data')
        .upsert(physicalData)
        .select()
        .single();

      if (physicalError) {
        console.error('❌ Erro ao salvar dados físicos:', physicalError);
        throw new Error(`Erro nos dados físicos: ${physicalError.message}`);
      }
      
      console.log('✅ Dados físicos salvos com sucesso:', physicalResult);

      // 3. SALVAR MEDIÇÃO COMPLETA (weight_measurements)
      const measurementData = {
        user_id: user.id,
        peso_kg: userData.peso_kg,
        gordura_corporal_percent: userData.gordura_corporal_percent,
        gordura_visceral: userData.gordura_visceral,
        massa_muscular_kg: userData.massa_muscular_kg,
        agua_corporal_percent: userData.agua_corporal_percent,
        osso_kg: userData.osso_kg,
        metabolismo_basal_kcal: userData.metabolismo_basal_kcal,
        idade_metabolica: userData.idade_metabolica,
        circunferencia_abdominal_cm: userData.circunferencia_abdominal_cm,
        circunferencia_braco_cm: userData.circunferencia_braco_cm,
        circunferencia_perna_cm: userData.circunferencia_perna_cm,
        device_type: userData.device_type || 'manual',
        notes: userData.notes,
        measurement_date: new Date().toISOString()
      };

      console.log('💾 Salvando medição completa:', measurementData);
      
      const { data: measurementResult, error: measurementError } = await supabase
        .from('weight_measurements')
        .insert(measurementData)
        .select()
        .single();

      if (measurementError) {
        console.error('❌ Erro ao salvar medição:', measurementError);
        throw new Error(`Erro na medição: ${measurementError.message}`);
      }
      
      console.log('✅ Medição salva com sucesso:', measurementResult);

      // 4. VERIFICAR SE EXISTE REGISTRO EM profiles E CRIAR/ATUALIZAR
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const profilesData = {
        user_id: user.id,
        email: user.email || '',
        full_name: userData.full_name || existingProfile?.full_name,
        updated_at: new Date().toISOString()
      };

      console.log('💾 Salvando/atualizando profiles:', profilesData);

      const { error: profilesError } = await supabase
        .from('profiles')
        .upsert(profilesData);

      if (profilesError) {
        console.warn('⚠️ Aviso ao salvar profiles:', profilesError);
      } else {
        console.log('✅ Profiles atualizado com sucesso');
      }

      // Sucesso - mostrar toast detalhado
      const riskMessages = {
        'baixo_peso': 'Seu IMC indica baixo peso. Considere consultar um profissional.',
        'normal': 'Parabéns! Seu IMC está dentro do ideal.',
        'sobrepeso': 'Seu IMC indica sobrepeso. Continue se cuidando!',
        'obesidade_grau1': 'Seu IMC indica obesidade grau I. Busque orientação profissional.',
        'obesidade_grau2': 'Seu IMC indica obesidade grau II. Recomendamos acompanhamento médico.',
        'obesidade_grau3': 'Seu IMC indica obesidade grau III. Procure acompanhamento médico urgente.'
      };

      toast({
        title: "🎉 Dados salvos completamente!",
        description: `Peso: ${measurementResult.peso_kg}kg | IMC: ${measurementResult.imc?.toFixed(1)} | ${riskMessages[measurementResult.risco_metabolico as keyof typeof riskMessages] || 'Todos os dados foram salvos com sucesso!'}`,
      });

      console.log('🎉 SALVAMENTO COMPLETO REALIZADO COM SUCESSO!');

      return {
        profile: profileResult,
        physical: physicalResult,
        measurement: measurementResult
      };

    } catch (err: any) {
      console.error('💥 ERRO COMPLETO no salvamento:', err);
      setError(err.message);
      toast({
        title: "❌ Erro no salvamento",
        description: `Falha ao salvar dados: ${err.message}`,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Buscar dados completos do usuário de todas as tabelas
  const fetchCompleteUserData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      console.log('🔍 Buscando dados completos do usuário:', user.id);

      // Buscar dados em paralelo
      const [profileData, physicalData, measurementsData] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('user_physical_data').select('*').eq('user_id', user.id).single(),
        supabase.from('weight_measurements').select('*').eq('user_id', user.id).order('measurement_date', { ascending: false }).limit(1).single()
      ]);

      const completeData = {
        profile: profileData.data,
        physical: physicalData.data,
        latestMeasurement: measurementsData.data
      };

      console.log('📊 Dados completos encontrados:', completeData);
      return completeData;

    } catch (err: any) {
      console.error('❌ Erro ao buscar dados completos:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    saveCompleteUserData,
    fetchCompleteUserData
  };
};