import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale, User, BarChart3, Calendar } from 'lucide-react';
import PhysicalDataForm from './PhysicalDataForm';
import WeightMeasurementForm from './WeightMeasurementForm';
import WeightHistoryCharts from './WeightHistoryCharts';
import WeeklyAnalysis from './WeeklyAnalysis';

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

      <Tabs defaultValue="measurement" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="measurement" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Nova Pesagem
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
        </TabsList>

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
      </Tabs>
    </div>
  );
};

export default CompleteWeighingSystem;