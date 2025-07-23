import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, UserSession, SessionFormData, SendSessionData } from '@/integrations/supabase/types';

export const useSessionManagement = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [userSessions, setUserSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar todas as sessões (admin)
  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Verificar se o usuário está autenticado (temporariamente desabilitado para teste)
      // const { data: { user } } = await supabase.auth.getUser();
      // if (!user) {
      //   setError('Usuário não autenticado');
      //   return;
      // }

      const { data, error: fetchError } = await supabase
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Erro do Supabase:', fetchError);
        console.error('Detalhes do erro:', {
          message: fetchError.message,
          details: fetchError.details,
          hint: fetchError.hint,
          code: fetchError.code
        });
        throw fetchError;
      }
      
      console.log('Sessões carregadas:', data);
      setSessions(data || []);
    } catch (err) {
      console.error('Erro ao buscar sessões:', err);
      setError('Erro ao carregar sessões');
    } finally {
      setLoading(false);
    }
  };

  // Buscar sessões do usuário
  const fetchUserSessions = async (userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('user_sessions')
        .select(`
          *,
          session:sessions(*)
        `)
        .eq('user_id', userId)
        .order('assigned_at', { ascending: false });

      if (fetchError) throw fetchError;
      setUserSessions(data || []);
    } catch (err) {
      console.error('Erro ao buscar sessões do usuário:', err);
      setError('Erro ao carregar sessões');
    } finally {
      setLoading(false);
    }
  };

  // Criar nova sessão
  const createSession = async (sessionData: SessionFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      // const { data: { user } } = await supabase.auth.getUser();
      // if (!user) throw new Error('Usuário não autenticado');

      const sessionToInsert = {
        ...sessionData,
        created_by: '00000000-0000-0000-0000-000000000000' // ID temporário para teste
      };

      console.log('Dados para inserção:', sessionToInsert);

      const { data, error: createError } = await supabase
        .from('sessions')
        .insert([sessionToInsert])
        .select()
        .single();

      if (createError) {
        console.error('Erro detalhado do Supabase:', createError);
        console.error('Dados enviados:', sessionData);
        throw createError;
      }
      
      setSessions(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Erro ao criar sessão:', err);
      setError('Erro ao criar sessão');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Enviar sessão para usuários
  const sendSession = async (sendData: SendSessionData) => {
    setLoading(true);
    setError(null);
    
    try {
      const sessionAssignments = sendData.userIds.map(userId => ({
        session_id: sendData.sessionId,
        user_id: userId,
        due_date: sendData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias por padrão
        status: 'assigned'
      }));

      const { error: sendError } = await supabase
        .from('user_sessions')
        .insert(sessionAssignments);

      if (sendError) throw sendError;
      
      return { success: true, count: sendData.userIds.length };
    } catch (err) {
      console.error('Erro ao enviar sessão:', err);
      setError('Erro ao enviar sessão');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar sessão
  const updateSession = async (sessionId: string, updates: Partial<Session>) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: updateError } = await supabase
        .from('sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();

      if (updateError) throw updateError;
      
      setSessions(prev => prev.map(s => s.id === sessionId ? data : s));
      return data;
    } catch (err) {
      console.error('Erro ao atualizar sessão:', err);
      setError('Erro ao atualizar sessão');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Deletar sessão
  const deleteSession = async (sessionId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error: deleteError } = await supabase
        .from('sessions')
        .update({ is_active: false })
        .eq('id', sessionId);

      if (deleteError) throw deleteError;
      
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (err) {
      console.error('Erro ao deletar sessão:', err);
      setError('Erro ao deletar sessão');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar status da sessão do usuário
  const updateUserSession = async (userSessionId: string, updates: Partial<UserSession>) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: updateError } = await supabase
        .from('user_sessions')
        .update(updates)
        .eq('id', userSessionId)
        .select(`
          *,
          session:sessions(*)
        `)
        .single();

      if (updateError) throw updateError;
      
      setUserSessions(prev => prev.map(us => us.id === userSessionId ? data : us));
      return data;
    } catch (err) {
      console.error('Erro ao atualizar sessão do usuário:', err);
      setError('Erro ao atualizar sessão');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Buscar usuários para enviar sessão
  const fetchUsersForSession = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .eq('role', 'user')
        .order('full_name');

      if (fetchError) throw fetchError;
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
      throw err;
    }
  };

  return {
    sessions,
    userSessions,
    loading,
    error,
    fetchSessions,
    fetchUserSessions,
    createSession,
    sendSession,
    updateSession,
    deleteSession,
    updateUserSession,
    fetchUsersForSession
  };
}; 