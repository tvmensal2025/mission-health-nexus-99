import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database, Plus, Trash2 } from 'lucide-react';

export default function TestDataGenerator() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateTestData = async () => {
    setLoading(true);
    try {
      // Gerar dados físicos do usuário
      const { error: physicalError } = await supabase
        .from('user_physical_data')
        .upsert({
          altura_cm: 170,
          idade: 30,
          sexo: 'masculino',
          nivel_atividade: 'moderado'
        });

      if (physicalError) throw physicalError;

      // Gerar metas
      const { error: goalsError } = await supabase
        .from('user_goals')
        .upsert({
          peso_meta_kg: 75,
          gordura_corporal_meta_percent: 15,
          imc_meta: 22,
          status: 'ativo'
        });

      if (goalsError) throw goalsError;

      // Gerar pesagens de teste (últimos 30 dias)
      const testMeasurements = [];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      for (let i = 0; i < 30; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        // Simular progresso gradual
        const baseWeight = 85 - (i * 0.3); // Perda gradual de peso
        const baseBodyFat = 25 - (i * 0.2); // Redução gradual de gordura
        const baseMuscleMass = 60 + (i * 0.1); // Ganho gradual de músculo
        
        testMeasurements.push({
          peso_kg: baseWeight + (Math.random() - 0.5) * 0.5, // Variação aleatória
          gordura_corporal_percent: Math.max(10, baseBodyFat + (Math.random() - 0.5) * 1),
          massa_muscular_kg: baseMuscleMass + (Math.random() - 0.5) * 0.3,
          agua_corporal_percent: 55 + (Math.random() - 0.5) * 5,
          osso_kg: 3.2 + (Math.random() - 0.5) * 0.2,
          metabolismo_basal_kcal: 1800 + Math.floor(Math.random() * 200),
          idade_metabolica: Math.max(25, 35 - i * 0.3), // Melhoria gradual
          device_type: 'xiaomi_scale',
          measurement_date: date.toISOString(),
          notes: `Medição de teste ${i + 1}`
        });
      }

      // Inserir pesagens
      for (const measurement of testMeasurements) {
        const { error: measurementError } = await supabase
          .from('weight_measurements')
          .insert(measurement);

        if (measurementError) {
          console.error('Error inserting measurement:', measurementError);
        }
      }

      toast({
        title: "Dados de teste gerados!",
        description: "30 medições foram adicionadas ao seu perfil.",
      });

    } catch (error) {
      console.error('Error generating test data:', error);
      toast({
        title: "Erro ao gerar dados",
        description: "Não foi possível gerar os dados de teste.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const clearTestData = async () => {
    setLoading(true);
    try {
      // Limpar pesagens
      const { error: measurementsError } = await supabase
        .from('weight_measurements')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Deletar todos

      if (measurementsError) throw measurementsError;

      // Limpar metas
      const { error: goalsError } = await supabase
        .from('user_goals')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (goalsError) throw goalsError;

      // Limpar dados físicos
      const { error: physicalError } = await supabase
        .from('user_physical_data')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (physicalError) throw physicalError;

      toast({
        title: "Dados limpos!",
        description: "Todos os dados de teste foram removidos.",
      });

    } catch (error) {
      console.error('Error clearing test data:', error);
      toast({
        title: "Erro ao limpar dados",
        description: "Não foi possível limpar os dados de teste.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-dashed border-2 border-muted-foreground/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Gerador de Dados de Teste
        </CardTitle>
        <CardDescription>
          Gere dados de exemplo para testar o sistema de progresso
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button 
            onClick={generateTestData} 
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Gerar Dados de Teste
          </Button>
          
          <Button 
            onClick={clearTestData} 
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Limpar Dados
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground space-y-2">
          <p>• 30 medições de peso ao longo de 30 dias</p>
          <p>• Progresso simulado de perda de peso</p>
          <p>• Melhoria gradual da composição corporal</p>
          <p>• Redução da idade metabólica</p>
        </div>
        
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            Processando...
          </div>
        )}
      </CardContent>
    </Card>
  );
} 