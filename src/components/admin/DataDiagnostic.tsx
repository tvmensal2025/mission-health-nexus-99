
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, CheckCircle, XCircle, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TableInfo {
  name: string;
  description: string;
  fields: string[];
  hasData: boolean;
  count: number;
}

const DataDiagnostic: React.FC = () => {
  const [tablesInfo, setTablesInfo] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const checkAllTables = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    const results: TableInfo[] = [];

    try {
      // 1. Verificar profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', currentUser.id);

      results.push({
        name: 'profiles',
        description: 'Dados principais do perfil (Supabase padrão)',
        fields: ['full_name', 'email', 'gender', 'height', 'age', 'avatar_url'],
        hasData: profiles && profiles.length > 0,
        count: profiles?.length || 0
      });

      // 2. Verificar user_profiles
      const { data: userProfiles, error: userProfilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', currentUser.id);

      results.push({
        name: 'user_profiles',
        description: 'Dados complementares do perfil',
        fields: ['full_name', 'phone', 'birth_date', 'city', 'state', 'bio', 'goals', 'achievements'],
        hasData: userProfiles && userProfiles.length > 0,
        count: userProfiles?.length || 0
      });

      // 3. Verificar user_physical_data
      const { data: physicalData, error: physicalError } = await supabase
        .from('user_physical_data')
        .select('*')
        .eq('user_id', currentUser.id);

      results.push({
        name: 'user_physical_data',
        description: 'Dados físicos para cálculos',
        fields: ['altura_cm', 'idade', 'sexo', 'nivel_atividade'],
        hasData: physicalData && physicalData.length > 0,
        count: physicalData?.length || 0
      });

      // 4. Verificar weight_measurements
      const { data: measurements, error: measurementsError } = await supabase
        .from('weight_measurements')
        .select('*')
        .eq('user_id', currentUser.id);

      results.push({
        name: 'weight_measurements',
        description: 'Histórico de pesagens',
        fields: ['peso_kg', 'gordura_corporal_percent', 'massa_muscular_kg', 'agua_corporal_percent', 'osso_kg'],
        hasData: measurements && measurements.length > 0,
        count: measurements?.length || 0
      });

      setTablesInfo(results);
    } catch (error) {
      console.error('Erro ao verificar tabelas:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Diagnóstico de Dados - Onde está salvo cada informação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentUser ? (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm">
                  <strong>Usuário logado:</strong> {currentUser.email}
                </p>
                <p className="text-sm">
                  <strong>ID:</strong> {currentUser.id}
                </p>
              </div>
            ) : (
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600">Nenhum usuário logado</p>
              </div>
            )}

            <Button 
              onClick={checkAllTables} 
              disabled={loading || !currentUser}
              className="w-full"
            >
              {loading ? 'Verificando...' : 'Verificar Todas as Tabelas'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tablesInfo.map((table, index) => (
          <Card key={index} className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {table.hasData ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  {table.name}
                </span>
                <Badge variant={table.hasData ? "default" : "destructive"}>
                  {table.count} registros
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{table.description}</p>
              
              <div>
                <h4 className="font-semibold mb-2">Campos salvos:</h4>
                <div className="grid grid-cols-2 gap-1">
                  {table.fields.map((field, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {field}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Resumo */}
      {tablesInfo.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Resumo das Informações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Nome:</strong> Salvo em <Badge>profiles</Badge> e <Badge>user_profiles</Badge>
                </div>
                <div>
                  <strong>Telefone:</strong> Salvo em <Badge>user_profiles</Badge>
                </div>
                <div>
                  <strong>Altura:</strong> Salvo em <Badge>profiles</Badge> e <Badge>user_physical_data</Badge>
                </div>
                <div>
                  <strong>Gênero:</strong> Salvo em <Badge>profiles</Badge>
                </div>
                <div>
                  <strong>Cidade:</strong> Salvo em <Badge>user_profiles</Badge>
                </div>
                <div>
                  <strong>Data Nascimento:</strong> Salvo em <Badge>user_profiles</Badge>
                </div>
              </div>
              
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm">
                  <strong>Recomendação:</strong> Use o hook <code>useUnifiedUserData</code> para gerenciar todos os dados de forma unificada. 
                  Ele sincroniza automaticamente entre todas as tabelas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DataDiagnostic;
