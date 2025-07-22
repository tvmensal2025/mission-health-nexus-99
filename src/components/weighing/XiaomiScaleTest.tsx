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
  RefreshCw,
  X,
  AlertTriangle
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
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [scanTimeout, setScanTimeout] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkBluetoothSupport();
    fetchUserProfile();
    setupDebugLogging();
    
    // Cleanup timeout on unmount
    return () => {
      if (scanTimeout) {
        clearTimeout(scanTimeout);
      }
    };
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
    
    if (!supported) {
      setErrorMessage('Seu navegador não suporta Bluetooth. Use Chrome ou Edge.');
    }
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
    setErrorMessage('');
    addDebugLog('Iniciando busca por dispositivos...');
    
    // Timeout de 30 segundos para evitar travamento
    const timeout = setTimeout(() => {
      setIsScanning(false);
      setConnectionStep('idle');
      setErrorMessage('Timeout: A busca demorou muito. Tente novamente.');
      addDebugLog('Timeout na busca de dispositivos');
      toast({
        title: "Timeout na busca",
        description: "A busca demorou muito. Verifique se a balança está ligada e próxima.",
        variant: "destructive",
      });
    }, 30000);
    
    setScanTimeout(timeout);
    
    try {
      const foundDevices = await xiaomiScaleService.scanForDevices();
      
      // Clear timeout se sucesso
      if (scanTimeout) {
        clearTimeout(scanTimeout);
        setScanTimeout(null);
      }
      
      setDevices(foundDevices);
      addDebugLog(`Dispositivos encontrados: ${foundDevices.length}`);
      
      if (foundDevices.length === 0) {
        setErrorMessage('Nenhuma balança encontrada. Verifique se está ligada e próxima.');
        toast({
          title: "Nenhuma balança encontrada",
          description: "Verifique se a balança está ligada e próxima ao dispositivo",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Dispositivos encontrados",
          description: `${foundDevices.length} balança(s) encontrada(s)`,
        });
      }
      
    } catch (error: any) {
      // Clear timeout se erro
      if (scanTimeout) {
        clearTimeout(scanTimeout);
        setScanTimeout(null);
      }
      
      addDebugLog(`Erro na busca: ${error}`);
      
      let errorMsg = 'Erro desconhecido na busca';
      if (error.name === 'NotFoundError') {
        errorMsg = 'Nenhuma balança encontrada. Verifique se está ligada.';
      } else if (error.name === 'NotAllowedError') {
        errorMsg = 'Permissão de Bluetooth negada. Clique em "Permitir" no navegador.';
      } else if (error.name === 'NetworkError') {
        errorMsg = 'Erro de rede. Verifique a conexão Bluetooth.';
      } else if (error.name === 'InvalidStateError') {
        errorMsg = 'Bluetooth já está em uso. Tente novamente.';
      }
      
      setErrorMessage(errorMsg);
      toast({
        title: "Erro na busca",
        description: errorMsg,
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
    setErrorMessage('');
    addDebugLog(`Conectando ao dispositivo: ${device.name}`);
    
    // Timeout de 15 segundos para conexão
    const connectionTimeout = setTimeout(() => {
      setConnectionStep('idle');
      setErrorMessage('Timeout na conexão. Tente novamente.');
      addDebugLog('Timeout na conexão');
      toast({
        title: "Timeout na conexão",
        description: "A conexão demorou muito. Verifique se a balança está próxima.",
        variant: "destructive",
      });
    }, 15000);
    
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
      
    } catch (error: any) {
      addDebugLog(`Erro na conexão: ${error}`);
      
      let errorMsg = 'Erro desconhecido na conexão';
      if (error.name === 'NetworkError') {
        errorMsg = 'Erro de rede. Verifique se a balança está próxima.';
      } else if (error.name === 'InvalidStateError') {
        errorMsg = 'Dispositivo já conectado ou em uso.';
      } else if (error.message?.includes('GATT')) {
        errorMsg = 'Erro de comunicação com a balança. Tente novamente.';
      }
      
      setErrorMessage(errorMsg);
      toast({
        title: "Erro na conexão",
        description: errorMsg,
        variant: "destructive",
      });
      setConnectionStep('idle');
    } finally {
      clearTimeout(connectionTimeout);
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
    
    toast({
      title: "Medição iniciada",
      description: "Suba na balança descalço e fique parado",
    });

    try {
      await xiaomiScaleService.startMeasurement();
      addDebugLog('Medição iniciada com sucesso');
    } catch (error) {
      addDebugLog(`Erro ao iniciar medição: ${error}`);
      setIsMeasuring(false);
      setConnectionStep('idle');
      toast({
        title: "Erro na medição",
        description: "Não foi possível iniciar a medição",
        variant: "destructive",
      });
    }
  };

  const saveMeasurement = async () => {
    if (!scaleData) {
      toast({
        title: "Nenhum dado para salvar",
        description: "Faça uma medição primeiro",
        variant: "destructive",
      });
      return;
    }

    try {
              const { error } = await supabase
          .from('weight_measurements')
          .insert([
            {
              user_id: user?.id,
              peso_kg: scaleData.weight,
              gordura_corporal_percent: scaleData.body_fat,
              massa_muscular_kg: scaleData.muscle_mass,
              agua_corporal_percent: scaleData.body_water,
              osso_kg: scaleData.bone_mass,
              metabolismo_basal_kcal: scaleData.basal_metabolism,
              idade_metabolica: scaleData.metabolic_age,
              gordura_visceral: scaleData.visceral_fat,
              device_type: 'xiaomi_mi_body_scale_2',
              measurement_date: scaleData.timestamp.toISOString()
            }
          ]);

      if (error) {
        addDebugLog(`Erro ao salvar: ${error.message}`);
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar a medição",
          variant: "destructive",
        });
      } else {
        addDebugLog('Medição salva com sucesso');
        toast({
          title: "Medição salva! 🎉",
          description: "Seus dados foram salvos com sucesso",
        });
        
        // Reset para nova medição
        setScaleData(null);
        setConnectionStep('idle');
      }
    } catch (error) {
      addDebugLog(`Erro ao salvar: ${error}`);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a medição",
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
    setErrorMessage('');
    setDevices([]);
    addDebugLog('Conexão resetada');
  };

  const getBMIClassification = (bmi: number) => {
    if (bmi < 18.5) return { text: 'Abaixo do peso', color: 'text-blue-500' };
    if (bmi < 25) return { text: 'Peso normal', color: 'text-green-500' };
    if (bmi < 30) return { text: 'Sobrepeso', color: 'text-yellow-500' };
    return { text: 'Obesidade', color: 'text-red-500' };
  };

  const clearDebugLogs = () => {
    setDebugLogs([]);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teste Xiaomi Mi Body Scale 2</h1>
          <p className="text-muted-foreground">
            Conecte e teste sua balança Xiaomi
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowTroubleshooting(!showTroubleshooting)}
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Troubleshooting
        </Button>
      </div>

      {showTroubleshooting && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p><strong>Problemas de Pareamento:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Certifique-se de que a balança está ligada e próxima (1 metro)</li>
                <li>Pise na balança para ativar o Bluetooth</li>
                <li>Verifique se não há outros dispositivos conectados</li>
                <li>Use Chrome ou Edge (não Safari)</li>
                <li>Clique em "Permitir" quando o navegador solicitar</li>
                <li>Se travou, recarregue a página e tente novamente</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status e Controles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bluetooth className="w-5 h-5" />
              Status da Conexão
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Bluetooth:</span>
              <Badge variant={bluetoothSupported ? "default" : "destructive"}>
                {bluetoothSupported ? "Suportado" : "Não Suportado"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Conexão:</span>
              <Badge variant={isConnected ? "default" : "secondary"}>
                {isConnected ? "Conectado" : "Desconectado"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Medição:</span>
              <Badge variant={isMeasuring ? "default" : "secondary"}>
                {isMeasuring ? "Em Andamento" : "Parado"}
              </Badge>
            </div>

            <Separator />

            <div className="space-y-2">
              <Button
                onClick={scanForDevices}
                disabled={isScanning || !bluetoothSupported}
                className="w-full"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Procurando balança...
                  </>
                ) : (
                  <>
                    <Wifi className="w-4 h-4 mr-2" />
                    Buscar Balança
                  </>
                )}
              </Button>

              {devices.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Dispositivos encontrados:</p>
                  {devices.map((device) => (
                    <Button
                      key={device.id}
                      variant={device.connected ? "default" : "outline"}
                      onClick={() => connectToDevice(device)}
                      disabled={isConnected || connectionStep === 'connecting'}
                      className="w-full justify-start"
                    >
                      <Scale className="w-4 h-4 mr-2" />
                      {device.name}
                      {device.connected && <CheckCircle2 className="w-4 h-4 ml-auto" />}
                    </Button>
                  ))}
                </div>
              )}

              {isConnected && (
                <Button
                  onClick={startMeasurement}
                  disabled={isMeasuring}
                  className="w-full"
                >
                  {isMeasuring ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Medindo...
                    </>
                  ) : (
                    <>
                      <Activity className="w-4 h-4 mr-2" />
                      Iniciar Medição
                    </>
                  )}
                </Button>
              )}

              <Button
                onClick={resetConnection}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Resetar Conexão
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Dados da Medição */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5" />
              Dados da Medição
            </CardTitle>
          </CardHeader>
          <CardContent>
            {scaleData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {scaleData.weight} kg
                    </div>
                    <div className="text-sm text-blue-500">Peso</div>
                  </div>
                  
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {userProfile?.height ? ((scaleData.weight / Math.pow(userProfile.height / 100, 2)).toFixed(1)) : 'N/A'}
                    </div>
                    <div className="text-sm text-green-500">IMC</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <span>Gordura: {scaleData.body_fat?.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purple-500" />
                    <span>Músculo: {scaleData.muscle_mass?.toFixed(1)}kg</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span>Água: {scaleData.body_water?.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bone className="w-4 h-4 text-yellow-500" />
                    <span>Osso: {scaleData.bone_mass?.toFixed(1)}kg</span>
                  </div>
                </div>

                <Button
                  onClick={saveMeasurement}
                  className="w-full"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Salvar Medição
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Scale className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma medição realizada</p>
                <p className="text-sm">Conecte-se a uma balança e inicie uma medição</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Logs de Debug */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Logs de Debug
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={clearDebugLogs}
            >
              <X className="w-4 h-4" />
              Limpar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-64 overflow-y-auto font-mono text-sm">
            {debugLogs.length === 0 ? (
              <p className="text-gray-500">Nenhum log disponível</p>
            ) : (
              debugLogs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 