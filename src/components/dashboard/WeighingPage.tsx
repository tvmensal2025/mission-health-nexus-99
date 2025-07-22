import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Scale, 
  Bluetooth, 
  Wifi, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Heart,
  Target,
  Info
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WeighingData {
  weight: number;
  body_fat?: number;
  muscle_mass?: number;
  body_water?: number;
  bone_mass?: number;
  basal_metabolism?: number;
  metabolic_age?: number;
}

interface BluetoothDevice {
  id: string;
  name: string;
  connected: boolean;
}

interface WeighingPageProps {
  user: User | null;
}

const WeighingPage = ({ user }: WeighingPageProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isWeighing, setIsWeighing] = useState(false);
  const [bluetoothSupported, setBluetoothSupported] = useState(false);
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [weighingData, setWeighingData] = useState<WeighingData | null>(null);
  const [lastWeighing, setLastWeighing] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkBluetoothSupport();
    if (user) {
      fetchProfile();
      fetchLastWeighing();
    }
  }, [user]);

  const checkBluetoothSupport = () => {
    if ('bluetooth' in navigator) {
      setBluetoothSupported(true);
    } else {
      setBluetoothSupported(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchLastWeighing = async () => {
    try {
      const { data, error } = await supabase
        .from('weighings')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching last weighing:', error);
      } else {
        setLastWeighing(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const scanForDevices = async () => {
    if (!bluetoothSupported) {
      toast({
        title: "Bluetooth não suportado",
        description: "Seu navegador não suporta Web Bluetooth API",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    
    try {
      // Simulate scanning for Xiaomi scales
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock devices for demonstration
      const mockDevices: BluetoothDevice[] = [
        { id: '1', name: 'Xiaomi Mi Body Scale 2', connected: false },
        { id: '2', name: 'Xiaomi Mi Body Scale Pro', connected: false },
      ];
      
      setDevices(mockDevices);
      
      toast({
        title: "Dispositivos encontrados",
        description: `${mockDevices.length} balança(s) encontrada(s)`,
      });
      
    } catch (error) {
      console.error('Error scanning for devices:', error);
      toast({
        title: "Erro na busca",
        description: "Não foi possível escanear dispositivos",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const connectToDevice = async (deviceId: string) => {
    try {
      // Simulate connection
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setDevices(prev => prev.map(device => 
        device.id === deviceId 
          ? { ...device, connected: true }
          : { ...device, connected: false }
      ));
      
      setIsConnected(true);
      
      toast({
        title: "Conectado com sucesso! 🎉",
        description: "Sua balança está pronta para uso",
      });
      
    } catch (error) {
      console.error('Error connecting to device:', error);
      toast({
        title: "Erro na conexão",
        description: "Não foi possível conectar com a balança",
        variant: "destructive",
      });
    }
  };

  const startWeighing = async () => {
    if (!isConnected) {
      toast({
        title: "Balança não conectada",
        description: "Conecte-se a uma balança primeiro",
        variant: "destructive",
      });
      return;
    }

    setIsWeighing(true);
    
    try {
      // Simulate weighing process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock weighing data
      const mockData: WeighingData = {
        weight: 75.2 + (Math.random() - 0.5) * 2, // Random weight around 75kg
        body_fat: 18.5 + (Math.random() - 0.5) * 2,
        muscle_mass: 35.2 + (Math.random() - 0.5) * 2,
        body_water: 58.5 + (Math.random() - 0.5) * 2,
        bone_mass: 3.2 + (Math.random() - 0.5) * 0.2,
        basal_metabolism: 1650 + Math.floor((Math.random() - 0.5) * 100),
        metabolic_age: 25 + Math.floor((Math.random() - 0.5) * 6),
      };
      
      setWeighingData(mockData);
      
      // Save to database
      await saveWeighingData(mockData);
      
      toast({
        title: "Pesagem concluída! 🎉",
        description: "Dados salvos com sucesso",
      });
      
    } catch (error) {
      console.error('Error during weighing:', error);
      toast({
        title: "Erro na pesagem",
        description: "Não foi possível capturar os dados",
        variant: "destructive",
      });
    } finally {
      setIsWeighing(false);
    }
  };

  const saveWeighingData = async (data: WeighingData) => {
    if (!user || !profile) return;

    const bmi = calculateBMI(data.weight);
    
    try {
      const { error } = await supabase
        .from('weighings')
        .insert({
          user_id: user.id,
          weight: data.weight,
          body_fat: data.body_fat,
          muscle_mass: data.muscle_mass,
          body_water: data.body_water,
          bone_mass: data.bone_mass,
          basal_metabolism: data.basal_metabolism,
          metabolic_age: data.metabolic_age,
          bmi: bmi,
          device_type: 'xiaomi_scale'
        });

      if (error) {
        console.error('Error saving weighing data:', error);
        throw error;
      }

      // Update profile with current weight
      await supabase
        .from('profiles')
        .update({ current_weight: data.weight })
        .eq('user_id', user.id);

      // Refresh data
      await fetchLastWeighing();
      await fetchProfile();
      
    } catch (error) {
      console.error('Error saving data:', error);
      throw error;
    }
  };

  const calculateBMI = (weight: number) => {
    if (!profile?.height) return null;
    const heightInMeters = profile.height / 100;
    return weight / (heightInMeters * heightInMeters);
  };

  const getWeightTrend = () => {
    if (!weighingData || !lastWeighing) return null;
    
    const difference = weighingData.weight - lastWeighing.weight;
    if (Math.abs(difference) < 0.1) return 'stable';
    return difference > 0 ? 'up' : 'down';
  };

  const getTrendIcon = () => {
    const trend = getWeightTrend();
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-green-500" />;
      case 'stable': return <Activity className="h-4 w-4 text-blue-500" />;
      default: return null;
    }
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
          Conecte sua balança inteligente e monitore sua evolução em tempo real
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
              {isConnected && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Xiaomi Mi Body Scale 2
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
                    <Wifi className="h-4 w-4 mr-2 animate-pulse" />
                    Escaneando...
                  </>
                ) : (
                  <>
                    <Bluetooth className="h-4 w-4 mr-2" />
                    Buscar Balança
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Available Devices */}
      {devices.length > 0 && (
        <Card className="health-card">
          <CardHeader>
            <CardTitle>Dispositivos Encontrados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {devices.map((device) => (
              <div 
                key={device.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Scale className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">{device.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {device.connected ? 'Conectado' : 'Disponível'}
                    </p>
                  </div>
                </div>
                
                {!device.connected ? (
                  <Button 
                    size="sm" 
                    onClick={() => connectToDevice(device.id)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Conectar
                  </Button>
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Weighing Process */}
      <Card className="health-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Processo de Pesagem
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConnected ? (
            <div className="text-center py-8">
              <Scale className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Conecte-se a uma balança para iniciar a pesagem
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {isWeighing && (
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
                  onClick={startWeighing}
                  disabled={isWeighing}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  {isWeighing ? (
                    <>
                      <Activity className="h-4 w-4 mr-2 animate-pulse" />
                      Pesando...
                    </>
                  ) : (
                    <>
                      <Scale className="h-4 w-4 mr-2" />
                      Iniciar Pesagem
                    </>
                  )}
                </Button>
                
                <Button variant="outline" size="icon">
                  <Info className="h-4 w-4" />
                </Button>
              </div>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Suba na balança descalço e mantenha-se imóvel até a pesagem completar.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {weighingData && (
        <Card className="health-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Resultados da Pesagem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main Weight Display */}
            <div className="text-center p-6 bg-gradient-primary rounded-xl text-white">
              <div className="flex items-center justify-center gap-2 mb-2">
                <h3 className="text-3xl font-bold">{weighingData.weight.toFixed(1)} kg</h3>
                {getTrendIcon()}
              </div>
              {profile?.height && (
                <p className="text-lg opacity-90">
                  IMC: {calculateBMI(weighingData.weight)?.toFixed(1)}
                  {calculateBMI(weighingData.weight) && (
                    <span className="ml-2 text-sm">
                      ({getBMIClassification(calculateBMI(weighingData.weight)!).text})
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Detailed Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Heart className="h-5 w-5 text-red-500 mx-auto mb-1" />
                <p className="text-sm text-muted-foreground">Gordura Corporal</p>
                <p className="font-bold">{weighingData.body_fat?.toFixed(1)}%</p>
              </div>
              
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Activity className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                <p className="text-sm text-muted-foreground">Massa Muscular</p>
                <p className="font-bold">{weighingData.muscle_mass?.toFixed(1)} kg</p>
              </div>
              
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Target className="h-5 w-5 text-cyan-500 mx-auto mb-1" />
                <p className="text-sm text-muted-foreground">Água Corporal</p>
                <p className="font-bold">{weighingData.body_water?.toFixed(1)}%</p>
              </div>
              
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Scale className="h-5 w-5 text-gray-500 mx-auto mb-1" />
                <p className="text-sm text-muted-foreground">Massa Óssea</p>
                <p className="font-bold">{weighingData.bone_mass?.toFixed(1)} kg</p>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Metabolismo Basal</p>
                <p className="text-2xl font-bold">{weighingData.basal_metabolism} kcal</p>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Idade Metabólica</p>
                <p className="text-2xl font-bold">{weighingData.metabolic_age} anos</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1">
                Ver Histórico
              </Button>
              <Button className="flex-1">
                Salvar e Continuar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
                <p className="font-medium">Faça a pesagem</p>
                <p className="text-sm text-muted-foreground">Suba na balança descalço e aguarde a captura dos dados</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeighingPage;