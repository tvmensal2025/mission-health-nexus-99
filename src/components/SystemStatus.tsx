import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Database, 
  Wifi, 
  Bluetooth,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SystemStatus {
  database: boolean;
  auth: boolean;
  bluetooth: boolean;
  tables: {
    user_physical_data: boolean;
    weight_measurements: boolean;
    weekly_analyses: boolean;
    health_integrations: boolean;
  };
  errors: string[];
}

const SystemStatus: React.FC = () => {
  const [status, setStatus] = useState<SystemStatus>({
    database: false,
    auth: false,
    bluetooth: false,
    tables: {
      user_physical_data: false,
      weight_measurements: false,
      weekly_analyses: false,
      health_integrations: false,
    },
    errors: []
  });
  const [loading, setLoading] = useState(true);

  const checkSystemStatus = async () => {
    setLoading(true);
    const errors: string[] = [];
    const newStatus = { ...status };

    try {
      // 1. Verificar conexão com banco
      const { data: { user } } = await supabase.auth.getUser();
      newStatus.auth = !!user;

      // 2. Verificar tabelas
      const tables = ['user_physical_data', 'weight_measurements', 'weekly_analyses', 'health_integrations'];
      
      for (const table of tables) {
        try {
          const { error } = await supabase
            .from(table)
            .select('count', { count: 'exact', head: true });
          
          if (error) {
            errors.push(`Erro na tabela ${table}: ${error.message}`);
            newStatus.tables[table as keyof typeof newStatus.tables] = false;
          } else {
            newStatus.tables[table as keyof typeof newStatus.tables] = true;
          }
        } catch (error: any) {
          errors.push(`Tabela ${table} não encontrada: ${error.message}`);
          newStatus.tables[table as keyof typeof newStatus.tables] = false;
        }
      }

      // 3. Verificar Bluetooth
      newStatus.bluetooth = !!navigator.bluetooth;

      // 4. Verificar conexão geral
      newStatus.database = newStatus.auth && Object.values(newStatus.tables).some(Boolean);

    } catch (error: any) {
      errors.push(`Erro geral: ${error.message}`);
    }

    setStatus({ ...newStatus, errors });
    setLoading(false);
  };

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const getStatusIcon = (isWorking: boolean) => {
    return isWorking ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (isWorking: boolean) => {
    return (
      <Badge variant={isWorking ? "default" : "destructive"}>
        {isWorking ? "Funcionando" : "Erro"}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Status do Sistema</h2>
          <p className="text-muted-foreground">
            Verificação completa do funcionamento da aplicação
          </p>
        </div>
        <Button onClick={checkSystemStatus} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Verificar
        </Button>
      </div>

      {/* Status Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Status Geral
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(status.database)}
                <span>Banco de Dados</span>
              </div>
              {getStatusBadge(status.database)}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(status.auth)}
                <span>Autenticação</span>
              </div>
              {getStatusBadge(status.auth)}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(status.bluetooth)}
                <span>Bluetooth</span>
              </div>
              {getStatusBadge(status.bluetooth)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status das Tabelas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Tabelas do Banco
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(status.tables).map(([table, isWorking]) => (
              <div key={table} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(isWorking)}
                  <span className="font-mono text-sm">{table}</span>
                </div>
                {getStatusBadge(isWorking)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Erros */}
      {status.errors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Erros Encontrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {status.errors.map((error, index) => (
                <div key={index} className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                  <XCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recomendações */}
      <Card>
        <CardHeader>
          <CardTitle>Recomendações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            {!status.database && (
              <p className="text-amber-600">
                <strong>Banco de Dados:</strong> Verifique a conexão com o Supabase e aplique as migrations.
              </p>
            )}
            
            {!status.auth && (
              <p className="text-amber-600">
                <strong>Autenticação:</strong> Verifique se o usuário está logado.
              </p>
            )}
            
            {!status.bluetooth && (
              <p className="text-amber-600">
                <strong>Bluetooth:</strong> Use Chrome 56+ para suporte ao Web Bluetooth API.
              </p>
            )}
            
            {Object.values(status.tables).some(table => !table) && (
              <p className="text-amber-600">
                <strong>Tabelas:</strong> Execute <code>npx supabase db push</code> para criar as tabelas.
              </p>
            )}
            
            {status.errors.length === 0 && status.database && (
              <p className="text-green-600">
                <strong>✅ Sistema funcionando perfeitamente!</strong>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemStatus; 