import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  birthDate: string;
  city: string;
  state: string;
  avatarUrl: string;
  bio: string;
  goals: string[];
  achievements: string[];
}

export const useUserProfile = (user: User | null) => {
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: '',
    email: '',
    phone: '',
    birthDate: '',
    city: '',
    state: '',
    avatarUrl: '',
    bio: '',
    goals: [],
    achievements: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Carregar dados do perfil
  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Primeiro tentar buscar da tabela profiles (padrão do Supabase)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar perfil da tabela profiles:', error);
        
        // Se não encontrou na tabela profiles, tentar user_profiles
        const { data: userProfileData, error: userProfileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (userProfileError && userProfileError.code !== 'PGRST116') {
          console.error('Erro ao carregar perfil da tabela user_profiles:', userProfileError);
        } else if (userProfileData) {
          // Usar dados da tabela user_profiles
          setProfileData({
            fullName: userProfileData.full_name || user.user_metadata?.full_name || '',
            email: user.email || '',
          phone: userProfileData.phone || user.user_metadata?.phone || '',
          birthDate: userProfileData.birth_date || user.user_metadata?.birth_date || '',
          city: userProfileData.city || user.user_metadata?.city || '',
          state: userProfileData.state || user.user_metadata?.state || '',
          avatarUrl: userProfileData.avatar_url || user.user_metadata?.avatar_url || '',
          bio: userProfileData.bio || user.user_metadata?.bio || 'Transformando minha vida através da saúde e bem-estar.',
          goals: userProfileData.goals || user.user_metadata?.goals || ['Perder peso', 'Melhorar condicionamento', 'Adotar hábitos saudáveis'],
          achievements: userProfileData.achievements || user.user_metadata?.achievements || ['Primeira semana completa', 'Primeira pesagem registrada']
          });
          return;
        }
      }

      if (data) {
        // Usar dados da tabela profiles
        setProfileData({
          fullName: data.full_name || user.user_metadata?.full_name || '',
          email: user.email || '',
          phone: (data as any).phone || user.user_metadata?.phone || '',
          birthDate: (data as any).birth_date || user.user_metadata?.birth_date || '',
          city: (data as any).city || user.user_metadata?.city || '',
          state: (data as any).state || user.user_metadata?.state || '',
          avatarUrl: data.avatar_url || user.user_metadata?.avatar_url || '',
          bio: (data as any).bio || user.user_metadata?.bio || 'Transformando minha vida através da saúde e bem-estar.',
          goals: (data as any).goals || user.user_metadata?.goals || ['Perder peso', 'Melhorar condicionamento', 'Adotar hábitos saudáveis'],
          achievements: (data as any).achievements || user.user_metadata?.achievements || ['Primeira semana completa', 'Primeira pesagem registrada']
        });
      } else {
        // Dados padrão se não existir perfil
        setProfileData({
          fullName: user.user_metadata?.full_name || '',
          email: user.email || '',
          phone: user.user_metadata?.phone || '',
          birthDate: user.user_metadata?.birth_date || '',
          city: user.user_metadata?.city || '',
          state: user.user_metadata?.state || '',
          avatarUrl: user.user_metadata?.avatar_url || '',
          bio: user.user_metadata?.bio || 'Transformando minha vida através da saúde e bem-estar.',
          goals: user.user_metadata?.goals || ['Perder peso', 'Melhorar condicionamento', 'Adotar hábitos saudáveis'],
          achievements: user.user_metadata?.achievements || ['Primeira semana completa', 'Primeira pesagem registrada']
        });
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (newData: Partial<ProfileData>) => {
    if (!user) return;

    try {
      setSaving(true);
      
      const updatedData = { ...profileData, ...newData };
      
      // Atualizar no Supabase
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          full_name: updatedData.fullName,
          phone: updatedData.phone,
          birth_date: updatedData.birthDate,
          city: updatedData.city,
          state: updatedData.state,
          avatar_url: updatedData.avatarUrl,
          bio: updatedData.bio,
          goals: updatedData.goals,
          achievements: updatedData.achievements,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Erro ao salvar perfil:', error);
        throw error;
      }

      // Atualizar estado local
      setProfileData(updatedData);
      
      // Atualizar metadata do usuário
      await supabase.auth.updateUser({
        data: {
          full_name: updatedData.fullName,
          phone: updatedData.phone,
          birth_date: updatedData.birthDate,
          city: updatedData.city,
          state: updatedData.state,
          avatar_url: updatedData.avatarUrl,
          bio: updatedData.bio,
          goals: updatedData.goals,
          achievements: updatedData.achievements
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
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

      return publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error);
      throw error;
    }
  };

  return {
    profileData,
    loading,
    saving,
    updateProfile,
    uploadAvatar,
    loadProfile
  };
}; 