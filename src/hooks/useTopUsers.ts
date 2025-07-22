import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TopUser {
  id: string;
  name: string;
  points: number;
  position: number;
  avatar_url?: string;
}

export const useTopUsers = (limit: number = 5) => {
  const [users, setUsers] = useState<TopUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar usuários com mais pontos baseado nas missões completadas
      const { data, error: fetchError } = await supabase
        .from('user_missions')
        .select(`
          user_id,
          is_completed,
          missions (
            points
          )
        `)
        .eq('is_completed', true)
        .order('completed_at', { ascending: false });

      // Buscar perfis dos usuários separadamente
      const userIds = [...new Set(data?.map(item => item.user_id) || [])];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      if (fetchError) throw fetchError;

      // Calcular pontos por usuário
      const userPoints = new Map<string, { points: number; name: string; avatar_url?: string }>();
      
      // Criar mapa de perfis para fácil acesso
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.user_id, profile);
      });
      
      data?.forEach(item => {
        const userId = item.user_id;
        const points = item.missions?.points || 0;
        const profile = profilesMap.get(userId);
        const name = profile?.full_name || 'Usuário';
        const avatar_url = profile?.avatar_url;

        if (userPoints.has(userId)) {
          userPoints.get(userId)!.points += points;
        } else {
          userPoints.set(userId, { points, name, avatar_url });
        }
      });

      // Converter para array e ordenar por pontos
      const topUsers = Array.from(userPoints.entries())
        .map(([id, data]) => ({
          id,
          name: data.name,
          points: data.points,
          position: 0, // Será definido depois
          avatar_url: data.avatar_url
        }))
        .sort((a, b) => b.points - a.points)
        .slice(0, limit)
        .map((user, index) => ({
          ...user,
          position: index + 1
        }));

      // Se não há usuários reais, usar dados mock
      if (topUsers.length === 0) {
        const mockUsers: TopUser[] = [
          { id: '1', name: "Maria Silva", points: 2850, position: 1 },
          { id: '2', name: "João Santos", points: 2720, position: 2 },
          { id: '3', name: "Ana Costa", points: 2650, position: 3 },
          { id: '4', name: "Pedro Lima", points: 2480, position: 4 },
          { id: '5', name: "Carla Mendes", points: 2350, position: 5 },
        ];
        setUsers(mockUsers);
      } else {
        setUsers(topUsers);
      }

    } catch (err) {
      console.error('Error fetching top users:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar usuários');
      
      // Fallback para dados mock em caso de erro
      const mockUsers: TopUser[] = [
        { id: '1', name: "Maria Silva", points: 2850, position: 1 },
        { id: '2', name: "João Santos", points: 2720, position: 2 },
        { id: '3', name: "Ana Costa", points: 2650, position: 3 },
        { id: '4', name: "Pedro Lima", points: 2480, position: 4 },
        { id: '5', name: "Carla Mendes", points: 2350, position: 5 },
      ];
      setUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopUsers();
  }, [limit]);

  return {
    users,
    loading,
    error,
    refetch: fetchTopUsers
  };
}; 