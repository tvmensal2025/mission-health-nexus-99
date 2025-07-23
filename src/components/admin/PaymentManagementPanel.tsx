import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Smartphone, 
  Activity, 
  Heart, 
  Wifi, 
  Key, 
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Bluetooth,
  Apple,
  Dumbbell
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface HealthIntegration {
  id: string;
  name: string;
  display_name: string;
  api_key?: string;
  client_id?: string;
  client_secret?: string;
  enabled: boolean;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

const IntegrationManagementPanel: React.FC = () => {
  const [integrations, setIntegrations] = useState<HealthIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('health_integrations')
        .select('*')
        .order('display_name');

      if (error) throw error;
      setIntegrations(data || []);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar integrações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateIntegration = async (integration: HealthIntegration) => {
    try {
      setSaving(integration.id);
      
      const { error } = await supabase
        .from('health_integrations')
        .update({
          api_key: integration.api_key,
          client_id: integration.client_id,
          client_secret: integration.client_secret,
          enabled: integration.enabled,
          config: integration.config
        })
        .eq('id', integration.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `${integration.display_name} atualizado com sucesso`,
      });

      fetchIntegrations();
    } catch (error) {
      console.error('Error updating integration:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar integração",
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const getIntegrationIcon = (name: string) => {
    switch (name) {
      case 'google_fit':
        return <Activity className="h-5 w-5 text-green-500" />;
      case 'polar_h10':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'apple_health':
        return <Apple className="h-5 w-5 text-gray-700" />;
      case 'fitbit':
        return <Activity className="h-5 w-5 text-blue-500" />;
      case 'samsung_health':
        return <Smartphone className="h-5 w-5 text-blue-600" />;
      case 'garmin_connect':
        return <Dumbbell className="h-5 w-5 text-blue-700" />;
      case 'withings':
        return <Activity className="h-5 w-5 text-teal-500" />;
      case 'oura_ring':
        return <Heart className="h-5 w-5 text-purple-500" />;
      case 'whoop':
        return <Activity className="h-5 w-5 text-yellow-500" />;
      case 'xiaomi_mi_fit':
        return <Bluetooth className="h-5 w-5 text-orange-500" />;
      default:
        return <Settings className="h-5 w-5 text-gray-500" />;
    }
  };

  const getIntegrationDescription = (name: string) => {
    const descriptions: Record<string, string> = {
      'google_fit': 'Sincroniza dados de atividade física, peso e frequência cardíaca do Google Fit',
      'polar_h10': 'Conecta via Bluetooth para monitoramento cardíaco em tempo real',
      'apple_health': 'Integração com Apple HealthKit para dados de saúde do iOS',
      'fitbit': 'Sincroniza dados de atividade, sono e frequência cardíaca do Fitbit',
      'samsung_health': 'Conecta com Samsung Health para dados de saúde e fitness',
      'garmin_connect': 'Sincroniza dados de atividades esportivas e métricas avançadas',
      'withings': 'Integração com balanças e dispositivos Withings (Nokia Health)',
      'oura_ring': 'Dados de sono, recuperação e atividade do Oura Ring',
      'whoop': 'Métricas de recuperação, strain e sono do WHOOP',
      'xiaomi_mi_fit': 'Conecta com dispositivos Xiaomi via Bluetooth'
    };
    return descriptions[name] || 'Integração de dispositivo de saúde';
  };

  const IntegrationCard = ({ integration }: { integration: HealthIntegration }) => {
    const [formData, setFormData] = useState(integration);

    const handleSave = () => {
      updateIntegration(formData);
    };

    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getIntegrationIcon(integration.name)}
              <div>
                <h3 className="text-lg font-semibold">{integration.display_name}</h3>
                <p className="text-sm text-muted-foreground">
                  {getIntegrationDescription(integration.name)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.enabled}
                onCheckedChange={(enabled) => setFormData({...formData, enabled})}
              />
              {formData.enabled ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Ativo
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <XCircle className="h-3 w-3 mr-1" />
                  Inativo
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Configurações específicas por tipo */}
          {integration.name === 'google_fit' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="google-client-id">Client ID do Google</Label>
                <Input
                  id="google-client-id"
                  placeholder="xxxx.apps.googleusercontent.com"
                  value={formData.client_id || ''}
                  onChange={(e) => setFormData({...formData, client_id: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="google-client-secret">Client Secret</Label>
                <Input
                  id="google-client-secret"
                  type="password"
                  placeholder="GOCSPX-xxxxx"
                  value={formData.client_secret || ''}
                  onChange={(e) => setFormData({...formData, client_secret: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="google-api-key">API Key (opcional)</Label>
                <Input
                  id="google-api-key"
                  type="password"
                  placeholder="AIzaSyxxxxxx"
                  value={formData.api_key || ''}
                  onChange={(e) => setFormData({...formData, api_key: e.target.value})}
                />
              </div>
            </>
          )}

          {integration.name === 'polar_h10' && (
            <>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Bluetooth className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Configuração Bluetooth</span>
                </div>
                <p className="text-sm text-blue-700">
                  O Polar H10 conecta via Bluetooth automaticamente. Certifique-se de que o dispositivo está pareado com o navegador.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Configurações Avançadas</Label>
                <Textarea
                  placeholder='{"real_time": true, "auto_connect": true, "zones_enabled": true}'
                  value={JSON.stringify(formData.config, null, 2)}
                  onChange={(e) => {
                    try {
                      const config = JSON.parse(e.target.value);
                      setFormData({...formData, config});
                    } catch {}
                  }}
                  rows={4}
                />
              </div>
            </>
          )}

          {['fitbit', 'withings', 'oura_ring', 'whoop'].includes(integration.name) && (
            <>
              <div className="space-y-2">
                <Label htmlFor={`${integration.name}-client-id`}>Client ID</Label>
                <Input
                  id={`${integration.name}-client-id`}
                  placeholder="Client ID da aplicação"
                  value={formData.client_id || ''}
                  onChange={(e) => setFormData({...formData, client_id: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${integration.name}-client-secret`}>Client Secret</Label>
                <Input
                  id={`${integration.name}-client-secret`}
                  type="password"
                  placeholder="Client Secret da aplicação"
                  value={formData.client_secret || ''}
                  onChange={(e) => setFormData({...formData, client_secret: e.target.value})}
                />
              </div>
            </>
          )}

          {integration.name === 'apple_health' && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Apple className="h-4 w-4 text-gray-700" />
                <span className="font-medium text-gray-800">Apple HealthKit</span>
              </div>
              <p className="text-sm text-gray-700">
                Funciona apenas em dispositivos iOS através do HealthKit. Configure as permissões no app mobile.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              onClick={handleSave}
              disabled={saving === integration.id}
              className="flex items-center gap-2"
            >
              {saving === integration.id ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Key className="h-4 w-4" />
              )}
              Salvar Configuração
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Integrações de Saúde</h2>
          <p className="text-muted-foreground">
            Configure APIs e dispositivos para sincronização automática de dados
          </p>
        </div>
        <Button onClick={fetchIntegrations} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </Button>
      </div>

      <Tabs defaultValue="fitness" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="fitness">Fitness & Atividade</TabsTrigger>
          <TabsTrigger value="heart">Frequência Cardíaca</TabsTrigger>
          <TabsTrigger value="weight">Peso & Composição</TabsTrigger>
          <TabsTrigger value="sleep">Sono & Recuperação</TabsTrigger>
        </TabsList>

        <TabsContent value="fitness" className="space-y-4">
          <div className="grid gap-6">
            {integrations
              .filter(i => ['google_fit', 'fitbit', 'samsung_health', 'garmin_connect', 'apple_health'].includes(i.name))
              .map(integration => (
                <IntegrationCard key={integration.id} integration={integration} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="heart" className="space-y-4">
          <div className="grid gap-6">
            {integrations
              .filter(i => ['polar_h10', 'whoop', 'fitbit'].includes(i.name))
              .map(integration => (
                <IntegrationCard key={integration.id} integration={integration} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="weight" className="space-y-4">
          <div className="grid gap-6">
            {integrations
              .filter(i => ['withings', 'xiaomi_mi_fit', 'google_fit'].includes(i.name))
              .map(integration => (
                <IntegrationCard key={integration.id} integration={integration} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="sleep" className="space-y-4">
          <div className="grid gap-6">
            {integrations
              .filter(i => ['oura_ring', 'whoop', 'fitbit', 'garmin_connect'].includes(i.name))
              .map(integration => (
                <IntegrationCard key={integration.id} integration={integration} />
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Alertas e Informações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Informações Importantes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <p><strong>Google Fit:</strong> Requer OAuth 2.0 configurado no Google Cloud Console</p>
            <p><strong>Polar H10:</strong> Conecta via Web Bluetooth API - compatível com Chrome 56+</p>
            <p><strong>Apple Health:</strong> Disponível apenas em apps iOS nativos com HealthKit</p>
            <p><strong>Dispositivos Bluetooth:</strong> Usuário deve autorizar conexão no navegador</p>
            <p><strong>Segurança:</strong> Todas as chaves API são criptografadas no banco de dados</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationManagementPanel; 