import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database, Bug, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface VerificationResult {
  table: string;
  exists: boolean;
  hasData: boolean;
  error?: string;
  count?: number;
}

const DebugDataVerification: React.FC = () => {
  const [results, setResults] = useState<VerificationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [testUser, setTestUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setTestUser(user);
  };

  const runVerification = async () => {
    setLoading(true);
    const verificationResults: VerificationResult[] = [];

    try {
      // 1. Verificar se o usuário está autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive",
        });
        return;
      }

      // 2. Verificar weight_measurements
      try {
        const { data: measurements, error } = await supabase
          .from('weight_measurements')
          .select('*')
          .eq('user_id', user.id)
          .limit(1);

        verificationResults.push({
          table: 'weight_measurements',
          exists: true,
          hasData: measurements && measurements.length > 0,
          count: measurements?.length || 0,
          error: error?.message
        });
      } catch (err: any) {
        verificationResults.push({
          table: 'weight_measurements',
          exists: false,
          hasData: false,
          error: err.message
        });
      }

      // 3. Verificar user_physical_data
      try {
        const { data: physicalData, error } = await supabase
          .from('user_physical_data')
          .select('*')
          .eq('user_id', user.id)
          .single();

        verificationResults.push({
          table: 'user_physical_data',
          exists: true,
          hasData: !!physicalData,
          count: physicalData ? 1 : 0,
          error: error?.message
        });
      } catch (err: any) {
        verificationResults.push({
          table: 'user_physical_data',
          exists: false,
          hasData: false,
          error: err.message
        });
      }

      // 4. Verificar user_profiles
      try {
        const { data: profiles, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        verificationResults.push({
          table: 'user_profiles',
          exists: true,
          hasData: !!profiles,
          count: profiles ? 1 : 0,
          error: error?.message
        });
      } catch (err: any) {
        verificationResults.push({
          table: 'user_profiles',
          exists: false,
          hasData: false,
          error: err.message
        });
      }

      // 5. Verificar weekly_analyses
      try {
        const { data: analyses, error } = await supabase
          .from('weekly_analyses')
          .select('*')
          .eq('user_id', user.id)
          .limit(1);

        verificationResults.push({
          table: 'weekly_analyses',
          exists: true,
          hasData: analyses && analyses.length > 0,
          count: analyses?.length || 0,
          error: error?.message
        });
      } catch (err: any) {
        verificationResults.push({
          table: 'weekly_analyses',
          exists: false,
          hasData: false,
          error: err.message
        });
      }

      setResults(verificationResults);

      // Verificar se há problemas críticos
      const criticalIssues = verificationResults.filter(r => !r.exists || r.error);
      if (criticalIssues.length > 0) {
        toast({
          title: "Problemas encontrados",
          description: `${criticalIssues.length} problemas críticos detectados`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Verificação concluída",
          description: "Todas as tabelas estão funcionando corretamente",
        });
      }

    } catch (error) {
      console.error('Erro na verificação:', error);
      toast({
        title: "Erro na verificação",
        description: "Erro ao executar verificação",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testSaveMeasurement = async () => {
    if (!testUser) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Primeiro, garantir que temos dados físicos
      const { data: physicalData, error: physicalError } = await supabase
        .from('user_physical_data')
        .select('*')
        .eq('user_id', testUser.id)
        .single();

      if (physicalError || !physicalData) {
        // Criar dados físicos de teste
        const { error: createPhysicalError } = await supabase
          .from('user_physical_data')
          .insert({
            user_id: testUser.id,
            altura_cm: 170,
            idade: 30,
            sexo: 'masculino',
            nivel_atividade: 'moderado'
          });

        if (createPhysicalError) {
          throw new Error(`Erro ao criar dados físicos: ${createPhysicalError.message}`);
        }
      }

      // Agora testar salvamento de medição
      const testMeasurement = {
        user_id: testUser.id,
        peso_kg: 75.5,
        gordura_corporal_percent: 15.2,
        massa_muscular_kg: 55.3,
        agua_corporal_percent: 58.7,
        device_type: 'manual',
        notes: 'Teste de verificação'
      };

      const { data: savedMeasurement, error: saveError } = await supabase
        .from('weight_measurements')
        .insert(testMeasurement)
        .select()
        .single();

      if (saveError) {
        throw new Error(`Erro ao salvar medição: ${saveError.message}`);
      }

      toast({
        title: "Teste de salvamento",
        description: `Medição salva com sucesso! Peso: ${savedMeasurement.peso_kg}kg`,
      });

      // Executar verificação novamente
      await runVerification();

    } catch (error: any) {
      console.error('Erro no teste de salvamento:', error);
      toast({
        title: "Erro no teste",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (result: VerificationResult) => {
    if (result.error) return <XCircle className="h-4 w-4 text-red-500" />;
    if (result.hasData) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusBadge = (result: VerificationResult) => {
    if (result.error) return <Badge variant="destructive">Erro</Badge>;
    if (result.hasData) return <Badge variant="default">OK</Badge>;
    return <Badge variant="secondary">Vazio</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Verificação de Dados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {testUser ? (
            <Alert>
              <AlertDescription>
                Usuário autenticado: <strong>{testUser.email}</strong>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertDescription>
                Nenhum usuário autenticado
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={runVerification} 
              disabled={loading}
              variant="outline"
            >
              {loading ? 'Verificando...' : 'Verificar Tabelas'}
            </Button>
            
            <Button 
              onClick={testSaveMeasurement} 
              disabled={loading || !testUser}
              variant="outline"
            >
              {loading ? 'Testando...' : 'Testar Salvamento'}
            </Button>
          </div>

          {results.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Resultados da Verificação:</h3>
              {results.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result)}
                    <span className="font-medium">{result.table}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(result)}
                    {result.count !== undefined && (
                      <span className="text-sm text-muted-foreground">
                        {result.count} registros
                      </span>
                    )}
                  </div>
                  {result.error && (
                    <div className="text-xs text-red-500 mt-1">
                      {result.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DebugDataVerification; 