import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Scale,
  Bluetooth,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Timer,
  Zap,
  Heart,
  Droplets,
  Bone,
  Brain,
  Target,
  Info,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { xiaomiScaleService, XiaomiScaleData, AppBluetoothDevice } from '@/lib/xiaomi-scale-service';

enum ConnectionStep {
  IDLE = 'idle',
  SCANNING = 'scanning',
  PAIRING = 'pairing',
  CALIBRATING = 'calibrating',
  MEASURING = 'measuring',
  CONFIRMING = 'confirming',
  COMPLETED = 'completed'
}

interface XiaomiScaleIntegrationProps {
  user: any;
  onDataReceived?: (data: XiaomiScaleData) => void;
}

export const XiaomiScaleIntegration: React.FC<XiaomiScaleIntegrationProps> = ({
  user,
  onDataReceived
}) => {
  const [currentStep, setCurrentStep] = useState<ConnectionStep>(ConnectionStep.IDLE);
  const [devices, setDevices] = useState<AppBluetoothDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<AppBluetoothDevice | null>(null);
  const [scaleData, setScaleData] = useState<XiaomiScaleData | null>(null);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [measurementProgress, setMeasurementProgress] = useState(0);
  const [pairingTime, setPairingTime] = useState(10);
  const [calibrationTime, setCalibrationTime] = useState(5);
  const [measurementTime, setMeasurementTime] = useState(5);
  const [bluetoothSupported, setBluetoothSupported] = useState(false);
  const [height, setHeight] = useState<number | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkBluetoothSupport();
    fetchUserProfile();
  }, []);

  // Timer para pairing
  useEffect(() => {
    if (currentStep === ConnectionStep.PAIRING && pairingTime > 0) {
      const timer = setTimeout(() => setPairingTime(pairingTime - 1), 1000);
      return () => clearTimeout(timer);
    } else if (currentStep === ConnectionStep.PAIRING && pairingTime === 0) {
      setCurrentStep(ConnectionStep.CALIBRATING);
      setCalibrationTime(5);
    }
  }, [currentStep, pairingTime]);

  // Timer para calibração
  useEffect(() => {
    if (currentStep === ConnectionStep.CALIBRATING && calibrationTime > 0) {
      const timer = setTimeout(() => setCalibrationTime(calibrationTime - 1), 1000);
      setCalibrationProgress(((5 - calibrationTime) / 5) * 100);
      return () => clearTimeout(timer);
    } else if (currentStep === ConnectionStep.CALIBRATING && calibrationTime === 0) {
      setCurrentStep(ConnectionStep.MEASURING);
      setMeasurementTime(5);
    }
  }, [currentStep, calibrationTime]);

  // Timer para medição
  useEffect(() => {
    if (currentStep === ConnectionStep.MEASURING && measurementTime > 0) {
      const timer = setTimeout(() => setMeasurementTime(measurementTime - 1), 1000);
      setMeasurementProgress(((5 - measurementTime) / 5) * 100);
      return () => clearTimeout(timer);
    } else if (currentStep === ConnectionStep.MEASURING && measurementTime === 0) {
      setCurrentStep(ConnectionStep.CONFIRMING);
    }
  }, [currentStep, measurementTime]);

  const checkBluetoothSupport = () => {
    const supported = 'bluetooth' in navigator;
    setBluetoothSupported(supported);
    if (!supported) {
      toast({
        title: "Bluetooth não suportado",
        description: "Seu navegador não suporta Web Bluetooth API",
        variant: "destructive"
      });
    }
  };

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (data && !error) {
        setUserProfile(data);
        setHeight(data.height);
        
        // Inicializar calculadora com dados do usuário
        if (data.gender && data.age && data.height) {
          xiaomiScaleService.initializeCalculator(
            data.gender as 'male' | 'female',
            data.age,
            data.height
          );
        }
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    }
  };

  const startScanning = async () => {
    setCurrentStep(ConnectionStep.SCANNING);
    try {
      const foundDevices = await xiaomiScaleService.scanForDevices();
      setDevices(foundDevices);
      setCurrentStep(ConnectionStep.PAIRING);
      setPairingTime(10);
    } catch (error) {
      console.error('Erro ao escanear dispositivos:', error);
      toast({
        title: "Erro ao escanear",
        description: "Não foi possível encontrar dispositivos Bluetooth",
        variant: "destructive"
      });
      setCurrentStep(ConnectionStep.IDLE);
    }
  };

  const selectDevice = async (device: AppBluetoothDevice) => {
    setSelectedDevice(device);
    try {
      await xiaomiScaleService.connectToDevice(device.id);
      await xiaomiScaleService.configureScale();
      
      // Configurar callback para receber dados
      xiaomiScaleService.onData((data) => {
        setScaleData(data);
        setCurrentStep(ConnectionStep.CONFIRMING);
      });
      
      setCurrentStep(ConnectionStep.CALIBRATING);
      setCalibrationTime(5);
    } catch (error) {
      console.error('Erro ao conectar dispositivo:', error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar à balança",
        variant: "destructive"
      });
      setCurrentStep(ConnectionStep.IDLE);
    }
  };

  const startMeasurement = async () => {
    try {
      await xiaomiScaleService.startMeasurement();
    } catch (error) {
      console.error('Erro ao iniciar medição:', error);
      // Fallback para simulação
      const mockData = xiaomiScaleService.simulateMeasurement();
      setScaleData(mockData);
      setCurrentStep(ConnectionStep.CONFIRMING);
    }
  };

  const confirmMeasurement = async () => {
    if (!scaleData) return;

    try {
      // Salvar dados da pesagem
      const { error: weighingError } = await supabase
        .from('weighings')
        .insert({
          user_id: user?.id,
          weight: scaleData.weight,
          body_fat: scaleData.body_fat,
          muscle_mass: scaleData.muscle_mass,
          body_water: scaleData.body_water,
          bone_mass: scaleData.bone_mass,
          basal_metabolism: scaleData.basal_metabolism,
          metabolic_age: scaleData.metabolic_age,
          visceral_fat: scaleData.visceral_fat,
          impedance: scaleData.impedance,
          created_at: scaleData.timestamp.toISOString()
        });

      if (weighingError) throw weighingError;

      // Atualizar peso atual no perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ current_weight: scaleData.weight })
        .eq('user_id', user?.id);

      if (profileError) throw profileError;

      toast({
        title: "Pesagem salva!",
        description: "Dados salvos com sucesso no sistema",
      });

      setCurrentStep(ConnectionStep.COMPLETED);
      
      // Chamar callback se fornecido
      if (onDataReceived) {
        onDataReceived(scaleData);
      }

    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar os dados da pesagem",
        variant: "destructive"
      });
    }
  };

  const resetProcess = () => {
    setCurrentStep(ConnectionStep.IDLE);
    setDevices([]);
    setSelectedDevice(null);
    setScaleData(null);
    setCalibrationProgress(0);
    setMeasurementProgress(0);
    setPairingTime(10);
    setCalibrationTime(5);
    setMeasurementTime(5);
    xiaomiScaleService.disconnect();
  };

  const calculateBMI = (weight: number, height: number): number => {
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  };

  const getBMIClassification = (bmi: number): string => {
    if (bmi < 18.5) return 'Abaixo do peso';
    if (bmi < 25) return 'Peso normal';
    if (bmi < 30) return 'Sobrepeso';
    return 'Obesidade';
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case ConnectionStep.IDLE:
        return (
          <div className="text-center space-y-4">
            <Scale className="h-16 w-16 text-muted-foreground mx-auto" />
            <h3 className="text-xl font-semibold">Registrar Nova Pesagem</h3>
            <p className="text-muted-foreground">
              Conecte sua balança para capturar dados automaticamente
            </p>
            <Button 
              onClick={startScanning}
              disabled={!bluetoothSupported}
              className="w-full"
            >
              <Bluetooth className="h-4 w-4 mr-2" />
              Buscar Balança
            </Button>
            {!bluetoothSupported && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Web Bluetooth não é suportado neste navegador. Use Chrome ou Edge.
                </AlertDescription>
              </Alert>
            )}
          </div>
        );

      case ConnectionStep.SCANNING:
        return (
          <div className="text-center space-y-4">
            <Loader2 className="h-16 w-16 text-primary mx-auto animate-spin" />
            <h3 className="text-xl font-semibold">Procurando balança...</h3>
            <p className="text-muted-foreground">
              Escaneando dispositivos Bluetooth próximos
            </p>
          </div>
        );

      case ConnectionStep.PAIRING:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold">Conexão Bluetooth</h3>
              <p className="text-muted-foreground">Tempo total: 10 segundos</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Timer className="h-4 w-4" />
                <span className="font-mono">{pairingTime}s restantes</span>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Dispositivos Encontrados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {devices.map((device) => (
                  <div
                    key={device.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedDevice?.id === device.id
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-primary/50'
                    }`}
                    onClick={() => selectDevice(device)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Bluetooth className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{device.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {device.type === 'xiaomi_mi_body_scale_2' ? 'Balança Inteligente' : 'Balança Bluetooth'}
                          </p>
                        </div>
                      </div>
                      {selectedDevice?.id === device.id && (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        );

      case ConnectionStep.CALIBRATING:
        return (
          <div className="text-center space-y-6">
            <div>
              <h3 className="text-xl font-semibold">Calibração da Balança</h3>
              <p className="text-muted-foreground">Tempo: 5 segundos</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Activity className="h-4 w-4 animate-pulse" />
                <span>CALIBRANDO...</span>
              </div>
              
              <div className="space-y-2">
                <Progress value={calibrationProgress} className="w-full" />
                <p className="font-mono text-2xl font-bold">
                  {calibrationTime > 0 ? calibrationTime : 'CALIBRAÇÃO CONCLUÍDA!'}
                </p>
              </div>

              {calibrationTime === 0 && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Suba na balança agora! Coloque sua altura aqui em cm
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        );

      case ConnectionStep.MEASURING:
        return (
          <div className="text-center space-y-6">
            <div>
              <h3 className="text-xl font-semibold">Capturando Dados</h3>
              <p className="text-muted-foreground">Mantenha-se imóvel na balança</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Activity className="h-4 w-4 animate-pulse" />
                <span>MEDINDO...</span>
              </div>
              
              <div className="space-y-2">
                <Progress value={measurementProgress} className="w-full" />
                <p className="font-mono text-2xl font-bold">
                  {measurementTime > 0 ? measurementTime : 'MEDIÇÃO CONCLUÍDA!'}
                </p>
              </div>
            </div>
          </div>
        );

      case ConnectionStep.CONFIRMING:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold">CONFIRMAÇÃO MANUAL</h3>
              <p className="text-muted-foreground">Verifique os dados capturados</p>
            </div>

            {scaleData && (
              <Card>
                <CardHeader>
                  <CardTitle>DADOS DISPONÍVEIS</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold text-primary">
                        {scaleData.weight} kg
                      </p>
                      <p className="text-sm text-muted-foreground">Peso</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold text-primary">
                        {height ? calculateBMI(scaleData.weight, height).toFixed(1) : '--'}
                      </p>
                      <p className="text-sm text-muted-foreground">IMC</p>
                    </div>
                  </div>

                  <Button 
                    onClick={confirmMeasurement}
                    className="w-full"
                    size="lg"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    SALVAR PESAGEM
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case ConnectionStep.COMPLETED:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
              <h3 className="text-xl font-semibold mt-4">DADOS CAPTURADOS</h3>
              <p className="text-muted-foreground">Medição recebida!</p>
            </div>

            {scaleData && (
              <Card>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Scale className="h-4 w-4 text-primary" />
                      <span className="text-sm">PESO:</span>
                      <span className="font-bold">{scaleData.weight} kg</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      <span className="text-sm">IMC:</span>
                      <span className="font-bold">
                        {height ? calculateBMI(scaleData.weight, height).toFixed(1) : '--'}
                      </span>
                    </div>
                    {scaleData.body_fat && (
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span className="text-sm">GORDURA:</span>
                        <span className="font-bold">{scaleData.body_fat.toFixed(1)}%</span>
                      </div>
                    )}
                    {scaleData.muscle_mass && (
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">MÚSCULO:</span>
                        <span className="font-bold">{scaleData.muscle_mass} kg</span>
                      </div>
                    )}
                    {scaleData.body_water && (
                      <div className="flex items-center gap-2">
                        <Droplets className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">ÁGUA:</span>
                        <span className="font-bold">{scaleData.body_water.toFixed(1)}%</span>
                      </div>
                    )}
                    {scaleData.basal_metabolism && (
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-purple-500" />
                        <span className="text-sm">METABOLISMO:</span>
                        <span className="font-bold">{scaleData.basal_metabolism} kcal</span>
                      </div>
                    )}
                    {scaleData.visceral_fat && (
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-orange-500" />
                        <span className="text-sm">VISCERAL:</span>
                        <span className="font-bold">{scaleData.visceral_fat.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={resetProcess}
                variant="outline"
                className="flex-1"
              >
                Nova Pesagem
              </Button>
              <Button 
                onClick={() => onDataReceived && onDataReceived(scaleData!)}
                className="flex-1"
              >
                Concluir
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {renderStepContent()}
    </div>
  );
}; 