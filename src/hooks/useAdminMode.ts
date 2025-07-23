import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';

export const useAdminMode = (user: User | null) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminModeEnabled, setAdminModeEnabled] = useState(false);

  useEffect(() => {
    if (user) {
      // Verifica se é admin baseado no email ou metadata
      const adminEmails = ['admin@institutodossonhos.com.br'];
      const isAdminUser = adminEmails.includes(user.email || '') || 
                         user.user_metadata?.role === 'admin';
      setIsAdmin(isAdminUser);
    } else {
      setIsAdmin(false);
      setAdminModeEnabled(false);
    }
  }, [user]);

  const toggleAdminMode = () => {
    if (isAdmin) {
      setAdminModeEnabled(!adminModeEnabled);
    }
  };

  return {
    isAdmin,
    adminModeEnabled,
    toggleAdminMode
  };
}; 