
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UnifiedUserData {
  // Dados pessoais
  full_name: string;
  email: string;
  phone: string;
  birth_date: string;
  gender: string;
  city: string;
  state: string;
  
  // Dados físicos
  height: number;
  age: number;
  
  // Outros
  avatar_url: string;
  bio: string;
  goals: string[];
  achievements: string[];
  
  // Dados físicos específicos
  sexo: string;
  nivel_atividade: string;
}

export const useUnifiedUserData = (user: User | null) => {
  const [userData, setUserData] = useState<UnifiedUserData>({
    full_name: '',
    email: '',
    phone: '',
    birth_date: '',
    gender: '',
    city: '',
    state: '',
    height: 0,
    age: 0,
    avatar_url: '',
    bio: '',
    goals: [],
    achievements: [],
    sexo: '',
    nivel_atividade: 'moderado'
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Carregar dados de todas as tabelas
  useEffect(() => {
    if (user) {
      loadAllUserData();
    }
  }, [user]);

  const loadAllUserData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // 1. Carregar dados do profiles (tabela principal)
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // 2. Carregar dados do user_profiles (tabela complementar)
      const { data: userProfilesData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // 3. Carregar dados físicos
      const { data: physicalData } = await supabase
        .from('user_physical_data')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Combinar todos os dados
      const combinedData: UnifiedUserData = {
        // Prioridade: profiles > user_profiles > metadata
        full_name: profilesData?.full_name || userProfilesData?.full_name || user.user_metadata?.full_name || '',
        email: user.email || profilesData?.email || '',
        phone: userProfilesData?.phone || user.user_metadata?.phone || '',
        birth_date: userProfilesData?.birth_date || user.user_metadata?.birth_date || '',
        gender: profilesData?.gender || user.user_metadata?.gender || '',
        city: userProfilesData?.city || user.user_metadata?.city || '',
        state: userProfilesData?.state || user.user_metadata?.state || '',
        
        // Dados físicos
        height: profilesData?.height || user.user_metadata?.height || physicalData?.altura_cm || 0,
        age: profilesData?.age || user.user_metadata?.age || physicalData?.idade || 0,
        
        // Outros
        avatar_url: profilesData?.avatar_url || userProfilesData?.avatar_url || user.user_metadata?.avatar_url || '',
        bio: userProfilesData?.bio || user.user_metadata?.bio || '',
        goals: userProfilesData?.goals || user.user_metadata?.goals || [],
        achievements: userProfilesData?.achievements || user.user_metadata?.achievements || [],
        
        // Dados físicos específicos
        sexo: physicalData?.sexo || (profilesData?.gender === 'male' ? 'masculino' : 'feminino'),
        nivel_atividade: physicalData?.nivel_atividade || 'moderado'
      };

      setUserData(combinedData);
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveAllUserData = async (newData: Partial<UnifiedUserData>) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };
    
    setSaving(true);
    try {
      const updatedData = { ...userData, ...newData };
      
      // 1. Salvar em profiles
      const { error: profilesError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: updatedData.full_name,
          email: updatedData.email,
          gender: updatedData.gender,
          height: updatedData.height,
          age: updatedData.age,
          avatar_url: updatedData.avatar_url,
          updated_at: new Date().toISOString()
        });

      if (profilesError) {
        console.error('Erro ao salvar em profiles:', profilesError);
      }

      // 2. Salvar em user_profiles
      const { error: userProfilesError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          full_name: updatedData.full_name,
          phone: updatedData.phone,
          birth_date: updatedData.birth_date,
          city: updatedData.city,
          state: updatedData.state,
          avatar_url: updatedData.avatar_url,
          bio: updatedData.bio,
          goals: updatedData.goals,
          achievements: updatedData.achievements,
          updated_at: new Date().toISOString()
        });

      if (userProfilesError) {
        console.error('Erro ao salvar em user_profiles:', userProfilesError);
      }

      // 3. Salvar dados físicos
      const { error: physicalError } = await supabase
        .from('user_physical_data')
        .upsert({
          user_id: user.id,
          altura_cm: updatedData.height,
          idade: updatedData.age,
          sexo: updatedData.sexo,
          nivel_atividade: updatedData.nivel_atividade,
          updated_at: new Date().toISOString()
        });

      if (physicalError) {
        console.error('Erro ao salvar dados físicos:', physicalError);
      }

      // 4. Atualizar metadata do usuário
      await supabase.auth.updateUser({
        data: {
          full_name: updatedData.full_name,
          phone: updatedData.phone,
          birth_date: updatedData.birth_date,
          gender: updatedData.gender,
          city: updatedData.city,
          state: updatedData.state,
          height: updatedData.height,
          age: updatedData.age,
          avatar_url: updatedData.avatar_url,
          bio: updatedData.bio,
          goals: updatedData.goals,
          achievements: updatedData.achievements
        }
      });

      setUserData(updatedData);
      return { success: true };
      
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      return { success: false, error };
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload para Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        throw uploadError;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Salvar URL do avatar
      await saveAllUserData({ avatar_url: publicUrl });

      return publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error);
      throw error;
    }
  };

  return {
    userData,
    loading,
    saving,
    saveAllUserData,
    uploadAvatar,
    loadAllUserData
  };
};
