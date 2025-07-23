import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAsaasPayments } from './useAsaasPayments';
import { useToast } from './use-toast';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval_type: string;
  interval_count: number;
  features: string[];
  is_active: boolean;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  asaas_customer_id: string;
  status: 'pending' | 'active' | 'canceled' | 'expired';
  current_period_start: string;
  current_period_end: string;
  trial_start?: string;
  trial_end?: string;
  canceled_at?: string;
  plan?: SubscriptionPlan;
}

export interface SubscriptionInvoice {
  id: string;
  subscription_id: string;
  asaas_payment_id: string;
  amount: number;
  due_date: string;
  paid_date?: string;
  status: 'pending' | 'paid' | 'overdue' | 'canceled';
  payment_method?: string;
  invoice_url?: string;
  bank_slip_url?: string;
  pix_qr_code?: string;
}

export const useSubscription = () => {
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptionInvoices, setSubscriptionInvoices] = useState<SubscriptionInvoice[]>([]);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { createCustomer, createPayment } = useAsaasPayments();
  const { toast } = useToast();

  // Verificar se usuário tem acesso a conteúdo específico
  const checkContentAccess = async (contentType: string, contentId: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .rpc('user_has_content_access', {
          user_uuid: user.id,
          content_type_param: contentType,
          content_id_param: contentId
        });

      if (error) {
        console.error('Erro ao verificar acesso:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Erro ao verificar acesso ao conteúdo:', error);
      return false;
    }
  };

  // Verificar se tem assinatura ativa
  const checkActiveSubscription = async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .rpc('user_has_active_subscription', {
          user_uuid: user.id
        });

      if (error) {
        console.error('Erro ao verificar assinatura:', error);
        return false;
      }

      const isActive = data || false;
      setHasActiveSubscription(isActive);
      return isActive;
    } catch (error) {
      console.error('Erro ao verificar assinatura ativa:', error);
      return false;
    }
  };

  // Carregar planos disponíveis
  const loadAvailablePlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;
      setAvailablePlans(data || []);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar planos de assinatura",
        variant: "destructive"
      });
    }
  };

  // Carregar assinatura atual do usuário
  const loadCurrentSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setCurrentSubscription(data || null);
    } catch (error) {
      console.error('Erro ao carregar assinatura atual:', error);
    }
  };

  // Carregar faturas do usuário
  const loadSubscriptionInvoices = async () => {
    try {
      if (!currentSubscription) return;

      const { data, error } = await supabase
        .from('subscription_invoices')
        .select('*')
        .eq('subscription_id', currentSubscription.id)
        .order('due_date', { ascending: false });

      if (error) throw error;
      setSubscriptionInvoices(data || []);
    } catch (error) {
      console.error('Erro ao carregar faturas:', error);
    }
  };

  // Criar assinatura
  const createSubscription = async (planId: string) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Buscar dados do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Perfil do usuário não encontrado');

      // Buscar plano
      const { data: plan } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (!plan) throw new Error('Plano não encontrado');

      // Criar cliente no Asaas se não existir
      let asaasCustomerId = profile.asaas_customer_id;
      if (!asaasCustomerId) {
        const customerData = {
          name: profile.full_name || user.email?.split('@')[0] || 'Cliente',
          email: user.email || '',
          cpfCnpj: profile.cpf || '00000000000',
          phone: profile.phone || '',
        };
        
        const asaasCustomer = await createCustomer(customerData);
        asaasCustomerId = asaasCustomer.id;

        // Atualizar perfil com ID do cliente Asaas
        await supabase
          .from('profiles')
          .update({ asaas_customer_id: asaasCustomerId })
          .eq('user_id', user.id);
      }

      // Criar assinatura no banco
      const subscriptionData = {
        user_id: user.id,
        plan_id: planId,
        asaas_customer_id: asaasCustomerId,
        status: 'pending',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 dias
      };

      const { data: subscription, error } = await supabase
        .from('user_subscriptions')
        .insert(subscriptionData)
        .select()
        .single();

      if (error) throw error;

      // Criar primeira cobrança
      await createInitialInvoice(subscription.id, plan, asaasCustomerId);

      setCurrentSubscription(subscription);
      await checkActiveSubscription();

      toast({
        title: "Sucesso!",
        description: "Assinatura criada com sucesso. Efetue o pagamento para ativar."
      });

      return subscription;
    } catch (error) {
      console.error('Erro ao criar assinatura:', error);
      toast({
        title: "Erro",
        description: "Falha ao criar assinatura",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Criar primeira fatura
  const createInitialInvoice = async (subscriptionId: string, plan: SubscriptionPlan, customerId: string) => {
    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7); // Vencimento em 7 dias

      // Criar cobrança no Asaas
      const paymentData = {
        customer: customerId,
        description: `Assinatura ${plan.name} - Plataforma dos Sonhos`,
        value: plan.price,
        dueDate: dueDate.toISOString().split('T')[0],
        billingType: 'BOLETO' as const // Permitindo múltiplos métodos via Asaas
      };

      const asaasPayment = await createPayment(paymentData);

      // Salvar fatura no banco
      const invoiceData = {
        subscription_id: subscriptionId,
        asaas_payment_id: asaasPayment.id,
        amount: plan.price,
        due_date: dueDate.toISOString().split('T')[0],
        status: 'pending' as const,
        invoice_url: asaasPayment.invoiceUrl,
        bank_slip_url: asaasPayment.bankSlipUrl
      };

      await supabase
        .from('subscription_invoices')
        .insert(invoiceData);

      return asaasPayment;
    } catch (error) {
      console.error('Erro ao criar fatura inicial:', error);
      throw error;
    }
  };

  // Cancelar assinatura
  const cancelSubscription = async () => {
    try {
      if (!currentSubscription) return;

      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          status: 'canceled',
          canceled_at: new Date().toISOString()
        })
        .eq('id', currentSubscription.id);

      if (error) throw error;

      await loadCurrentSubscription();
      await checkActiveSubscription();

      toast({
        title: "Assinatura Cancelada",
        description: "Sua assinatura foi cancelada com sucesso"
      });
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      toast({
        title: "Erro",
        description: "Falha ao cancelar assinatura",
        variant: "destructive"
      });
    }
  };

  // Processar webhook de pagamento
  const processPaymentWebhook = async (paymentId: string, status: string) => {
    try {
      // Atualizar status da fatura
      const { data: invoice, error: invoiceError } = await supabase
        .from('subscription_invoices')
        .update({
          status: status === 'RECEIVED' ? 'paid' : status.toLowerCase(),
          paid_date: status === 'RECEIVED' ? new Date().toISOString() : null
        })
        .eq('asaas_payment_id', paymentId)
        .select('subscription_id')
        .single();

      if (invoiceError) throw invoiceError;

      // Se pagamento confirmado, ativar assinatura
      if (status === 'RECEIVED' && invoice) {
        await supabase
          .from('user_subscriptions')
          .update({ status: 'active' })
          .eq('id', invoice.subscription_id);

        await checkActiveSubscription();
      }
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
    }
  };

  useEffect(() => {
    loadAvailablePlans();
    loadCurrentSubscription();
    checkActiveSubscription();
  }, []);

  useEffect(() => {
    if (currentSubscription) {
      loadSubscriptionInvoices();
    }
  }, [currentSubscription]);

  return {
    // Estados
    currentSubscription,
    availablePlans,
    subscriptionInvoices,
    hasActiveSubscription,
    loading,

    // Funções
    checkContentAccess,
    checkActiveSubscription,
    createSubscription,
    cancelSubscription,
    processPaymentWebhook,
    loadCurrentSubscription,
    loadAvailablePlans
  };
}; 