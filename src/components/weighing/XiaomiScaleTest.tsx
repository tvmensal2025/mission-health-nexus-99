import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  Loader2,
  Wifi,
  Settings,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { xiaomiScaleService, XiaomiScaleData, AppBluetoothDevice } from '@/lib/xiaomi-scale-service';

interface XiaomiScaleTestProps {
  user: any;
}

export const XiaomiScaleTest: React.FC<XiaomiScaleTestProps> = ({ user }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [bluetoothSupported, setBluetoothSupported] = useState(false);
  const [devices, setDevices] = useState<AppBluetoothDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<AppBluetoothDevice | null>(null);
  const [scaleData, setScaleData] = useState<XiaomiScaleData | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [connectionStep, setConnectionStep] = useState<'idle' | 'scanning' | 'connecting' | 'measuring' | 'complete'>('idle');
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    checkBluetoothSupport();
    fetchUserProfile();
    setupDebugLogging();
  }, []);

  const setupDebugLogging = () => {
    // Interceptar logs do console para debug
    const originalLog = console.log;
    const originalError = console.error;
    
    console.log = (...args) => {
      originalLog(...args);
      setDebugLogs(prev => [...prev, `LOG: ${args.join(' ')}`]);
    };
    
    console.error = (...args) => {
      originalError(...args);
      setDebugLogs(prev => [...prev, `ERROR: ${args.join(' ')}`]);
    };
  };

  const checkBluetoothSupport = () => {
    const supported = 'bluetooth' in navigator;
    setBluetoothSupported(supported);
    addDebugLog(`Bluetooth suportado: ${supported}`);
  };

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        addDebugLog(`Erro ao buscar perfil: ${error.message}`);
      } else {
        setUserProfile(data);
        addDebugLog(`Perfil carregado: ${data?.height ? 'Altura configurada' : 'Altura não configurada'}`);
      }
    } catch (error) {
      addDebugLog(`Erro ao buscar perfil: ${error}`);
    }
  };

  const addDebugLog = (message: string) => {
    setDebugLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const scanForDevices = async () => {
    if (!bluetoothSupported) {
      toast({
        title: "Bluetooth não suportado",
        description: "Use Chrome ou Edge para conectar com a balança",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    setConnectionStep('scanning');
    addDebugLog('Iniciando busca por dispositivos...');
    
    try {
      const foundDevices = await xiaomiScaleService.scanForDevices();
      setDevices(foundDevices);
      addDebugLog(`Dispositivos encontrados: ${foundDevices.length}`);
      
      toast({
        title: "Dispositivos encontrados",
        description: `${foundDevices.length} balança(s) encontrada(s)`,
      });
      
    } catch (error) {
      addDebugLog(`Erro na busca: ${error}`);
      toast({
        title: "Erro na busca",
        description: "Não foi possível escanear dispositivos",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
      setConnectionStep('idle');
    }
  };

  const connectToDevice = async (device: AppBluetoothDevice) => {
    setSelectedDevice(device);
    setConnectionStep('connecting');
    addDebugLog(`Conectando ao dispositivo: ${device.name}`);
    
    try {
      await xiaomiScaleService.connectToDevice(device.id);
      
      // Configurar calculadora se perfil disponível
      if (userProfile?.height && userProfile?.age && userProfile?.gender) {
        const sex = userProfile.gender === 'male' ? 'male' : 'female';
        xiaomiScaleService.initializeCalculator(sex, userProfile.age, userProfile.height);
        addDebugLog('Calculadora inicializada com dados do perfil');
      } else {
        // Usar valores padrão
        xiaomiScaleService.initializeCalculator('male', 30, 170);
        addDebugLog('Calculadora inicializada com valores padrão');
      }

      // Configurar callback para dados
      xiaomiScaleService.onData((data) => {
        setScaleData(data);
        addDebugLog(`Dados recebidos: ${data.weight}kg`);
        setConnectionStep('complete');
        setIsMeasuring(false);
        
        toast({
          title: "Medição concluída! 🎉",
          description: `Peso: ${data.weight}kg`,
        });
      });

      setDevices(prev => prev.map(d => 
        d.id === device.id 
          ? { ...d, connected: true }
          : { ...d, connected: false }
      ));
      
      setIsConnected(true);
      addDebugLog('Dispositivo conectado com sucesso');
      
      toast({
        title: "Conectado com sucesso! 🎉",
        description: "Sua balança está pronta para uso",
      });
      
    } catch (error) {
      addDebugLog(`Erro na conexão: ${error}`);
      toast({
        title: "Erro na conexão",
        description: "Não foi possível conectar com a balança",
        variant: "destructive",
      });
      setConnectionStep('idle');
    }
  };

  const startMeasurement = async () => {
    if (!isConnected) {
      toast({
        title: "Balança não conectada",
        description: "Conecte-se a uma balança primeiro",
        variant: "destructive",
      });
      return;
    }

    setIsMeasuring(true);
    setConnectionStep('measuring');
    addDebugLog('Iniciando medição...');
    
    try {
      await xiaomiScaleService.startMeasurement();
      addDebugLog('Comando de medição enviado');
      
      toast({
        title: "Medição iniciada",
        description: "Suba na balança descalço e aguarde",
      });
      
    } catch (error) {
      addDebugLog(`Erro na medição: ${error}`);
      toast({
        title: "Erro na medição",
        description: "Não foi possível iniciar a medição",
        variant: "destructive",
      });
      setIsMeasuring(false);
      setConnectionStep('idle');
    }
  };

  const saveMeasurement = async () => {
    if (!scaleData || !user) return;

    try {
      const bmi = userProfile?.height ? 
        scaleData.weight / Math.pow(userProfile.height / 100, 2) : null;

      const { error } = await supabase
        .from('weighings')
        .insert({
          user_id: user.id,
          weight: scaleData.weight,
          body_fat: scaleData.body_fat,
          muscle_mass: scaleData.muscle_mass,
          body_water: scaleData.body_water,
          bone_mass: scaleData.bone_mass,
          basal_metabolism: scaleData.basal_metabolism,
          metabolic_age: scaleData.metabolic_age,
          bmi: bmi,
          device_type: 'xiaomi_mi_body_scale_2'
        });

      if (error) {
        addDebugLog(`Erro ao salvar: ${error.message}`);
        throw error;
      }

      addDebugLog('Medição salva com sucesso');
      
      // Atualizar perfil com peso atual
      await supabase
        .from('profiles')
        .update({ current_weight: scaleData.weight })
        .eq('user_id', user.id);

      toast({
        title: "Dados salvos! 🎉",
        description: "Sua medição foi registrada com sucesso",
      });
      
    } catch (error) {
      addDebugLog(`Erro ao salvar medição: ${error}`);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar os dados",
        variant: "destructive",
      });
    }
  };

  const resetConnection = () => {
    setIsConnected(false);
    setIsMeasuring(false);
    setSelectedDevice(null);
    setScaleData(null);
    setConnectionStep('idle');
    setDevices([]);
    addDebugLog('Conexão resetada');
  };

  const getBMIClassification = (bmi: number) => {
    if (bmi < 18.5) return { text: 'Abaixo do peso', color: 'text-blue-500' };
    if (bmi < 25) return { text: 'Peso normal', color: 'text-green-500' };
    if (bmi < 30) return { text: 'Sobrepeso', color: 'text-yellow-500' };
    return { text: 'Obesidade', color: 'text-red-500' };
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <Scale className="h-10 w-10 text-blue-600" />
          Teste Xiaomi Mi Body Scale 2
        </h1>
        <p className="text-muted-foreground text-lg">
          Teste de conexão e medição com sua balança Xiaomi
        </p>
      </div>

      {/* Bluetooth Support Check */}
      {!bluetoothSupported && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Seu navegador não suporta Web Bluetooth API. Para usar esta funcionalidade, 
            acesse através do Chrome ou Edge mais recente.
          </AlertDescription>
        </Alert>
      )}

      {/* Connection Status */}
      <Card className="health-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bluetooth className="h-5 w-5" />
            Status da Conexão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="font-medium">
                {isConnected ? 'Conectado' : 'Desconectado'}
              </span>
              {selectedDevice && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {selectedDevice.name}
                </Badge>
              )}
            </div>
            
            {!isConnected && (
              <Button 
                onClick={scanForDevices} 
                disabled={isScanning || !bluetoothSupported}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Escaneando...
                  </>
                ) : (
                  <>
                    <Wifi className="h-4 w-4 mr-2" />
                    Buscar Balança
                  </>
                )}
              </Button>
            )}

            {isConnected && (
              <Button 
                onClick={resetConnection}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Available Devices */}
      {devices.length > 0 && (
        <Card className="health-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Dispositivos Encontrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {devices.map((device) => (
                <div key={device.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Scale className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">{device.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {device.type === 'xiaomi_mi_body_scale_2' ? 'Balança Inteligente' : 'Balança Bluetooth'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {device.connected ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Conectado
                      </Badge>
                    ) : (
                      <Button
                        onClick={() => connectToDevice(device)}
                        size="sm"
                        disabled={isConnected}
                      >
                        Conectar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Measurement Process */}
      {isConnected && (
        <Card className="health-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Processo de Medição
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {connectionStep === 'measuring' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 animate-pulse" />
                  <span className="text-sm">Capturando dados...</span>
                </div>
                <Progress value={66} className="w-full" />
              </div>
            )}
            
            <div className="flex gap-3">
              <Button 
                onClick={startMeasurement}
                disabled={isMeasuring}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {isMeasuring ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Medindo...
                  </>
                ) : (
                  <>
                    <Scale className="h-4 w-4 mr-2" />
                    Iniciar Medição
                  </>
                )}
              </Button>
              
              <Button variant="outline" size="icon">
                <Info className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Measurement Results */}
      {scaleData && (
        <Card className="health-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Resultados da Medição
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Peso</span>
                  <span className="text-lg font-bold">{scaleData.weight} kg</span>
                </div>
                
                {userProfile?.height && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">IMC</span>
                    <span className="text-lg font-bold">
                      {(scaleData.weight / Math.pow(userProfile.height / 100, 2)).toFixed(1)}
                    </span>
                  </div>
                )}
                
                {scaleData.body_fat && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-1">
                      <Droplets className="h-3 w-3" />
                      Gordura Corporal
                    </span>
                    <span className="text-lg font-bold">{scaleData.body_fat.toFixed(1)}%</span>
                  </div>
                )}
                
                {scaleData.muscle_mass && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      Massa Muscular
                    </span>
                    <span className="text-lg font-bold">{scaleData.muscle_mass.toFixed(1)} kg</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                {scaleData.body_water && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-1">
                      <Droplets className="h-3 w-3" />
                      Água Corporal
                    </span>
                    <span className="text-lg font-bold">{scaleData.body_water.toFixed(1)}%</span>
                  </div>
                )}
                
                {scaleData.bone_mass && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-1">
                      <Bone className="h-3 w-3" />
                      Massa Óssea
                    </span>
                    <span className="text-lg font-bold">{scaleData.bone_mass.toFixed(1)} kg</span>
                  </div>
                )}
                
                {scaleData.basal_metabolism && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      Metabolismo Basal
                    </span>
                    <span className="text-lg font-bold">{scaleData.basal_metabolism} kcal</span>
                  </div>
                )}
                
                {scaleData.metabolic_age && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-1">
                      <Brain className="h-3 w-3" />
                      Idade Metabólica
                    </span>
                    <span className="text-lg font-bold">{scaleData.metabolic_age} anos</span>
                  </div>
                )}
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex gap-3">
              <Button 
                onClick={saveMeasurement}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Salvar Medição
              </Button>
              
              <Button 
                onClick={() => setScaleData(null)}
                variant="outline"
              >
                Nova Medição
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug Logs */}
      <Card className="health-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Logs de Debug
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {debugLogs.map((log, index) => (
              <div key={index} className="text-xs font-mono bg-muted p-2 rounded">
                {log}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="health-card">
        <CardHeader>
          <CardTitle>Como Usar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <p className="font-medium">Ative o Bluetooth</p>
                <p className="text-sm text-muted-foreground">Certifique-se de que o Bluetooth está ativado no seu dispositivo</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <p className="font-medium">Busque sua balança</p>
                <p className="text-sm text-muted-foreground">Clique em "Buscar Balança" e aguarde a detecção</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <p className="font-medium">Conecte-se</p>
                <p className="text-sm text-muted-foreground">Selecione sua balança Xiaomi na lista e conecte</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
              <div>
                <p className="font-medium">Faça a medição</p>
                <p className="text-sm text-muted-foreground">Suba na balança descalço e aguarde a captura dos dados</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 