import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale, User, BarChart3, Calendar, Edit3, Bug, Wrench, Search } from 'lucide-react';
import PhysicalDataForm from './PhysicalDataForm';
import WeightMeasurementForm from './WeightMeasurementForm';
import SimpleWeightForm from './SimpleWeightForm';
import WeightHistoryCharts from './WeightHistoryCharts';
import WeeklyAnalysis from './WeeklyAnalysis';
import DebugData from '../DebugData';
import DebugDataVerification from '../DebugDataVerification';
import { XiaomiScaleTroubleshooter } from '../XiaomiScaleTroubleshooter';
import { XiaomiScaleAdjuster } from '../XiaomiScaleAdjuster';
import { XiaomiScaleConnection } from '../XiaomiScaleConnection';
import { XiaomiScaleFlow } from '../XiaomiScaleFlow';

const CompleteWeighingSystem: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Scale className="h-8 w-8 text-primary" />
          Sistema Completo de Pesagem
        </h1>
        <p className="text-muted-foreground">
          Registre suas pesagens, acompanhe sua evolução e analise sua composição corporal
        </p>
      </div>

      <Tabs defaultValue="simple" className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="simple" className="flex items-center gap-2">
            <Edit3 className="h-4 w-4" />
            Pesagem Simples
          </TabsTrigger>
          <TabsTrigger value="measurement" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Pesagem Completa
          </TabsTrigger>
          <TabsTrigger value="physical" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Dados Físicos
          </TabsTrigger>
          <TabsTrigger value="charts" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Gráficos
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Análise Semanal
          </TabsTrigger>
          <TabsTrigger value="xiaomi-tools" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Balança Xiaomi
          </TabsTrigger>
          <TabsTrigger value="debug" className="flex items-center gap-2">
            <Bug className="h-4 w-4" />
            Debug
          </TabsTrigger>
          <TabsTrigger value="verification" className="flex items-center gap-2">
            <Bug className="h-4 w-4" />
            Verificação
          </TabsTrigger>
        </TabsList>

        <TabsContent value="simple" className="space-y-6">
          <SimpleWeightForm />
        </TabsContent>

        <TabsContent value="measurement" className="space-y-6">
          <WeightMeasurementForm />
        </TabsContent>

        <TabsContent value="physical" className="space-y-6">
          <PhysicalDataForm />
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          <WeightHistoryCharts />
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <WeeklyAnalysis />
        </TabsContent>

        <TabsContent value="xiaomi-tools" className="space-y-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  🎯 Balança Xiaomi Mi Body Scale 2
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Conecte sua balança Xiaomi para pesagem automática e análise de composição corporal
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <XiaomiScaleFlow />
                  <XiaomiScaleConnection />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <XiaomiScaleTroubleshooter />
                  <XiaomiScaleAdjuster />
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">💡 Como usar:</h4>
                  <div className="space-y-1 text-sm text-blue-700">
                    <p>1. <strong>Faça Sua Pesagem:</strong> Fluxo completo com calibração e medição</p>
                    <p>2. <strong>Conectar Balança:</strong> Conexão manual para controle avançado</p>
                    <p>3. <strong>Diagnosticar Problemas:</strong> Use o diagnóstico se houver problemas</p>
                    <p>4. <strong>Ajustar Balança:</strong> Use o ajuste automático se necessário</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="debug" className="space-y-6">
          <DebugData />
        </TabsContent>

        <TabsContent value="verification" className="space-y-6">
          <DebugDataVerification />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompleteWeighingSystem;