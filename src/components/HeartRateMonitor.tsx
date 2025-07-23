import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Heart, 
  Activity, 
  Bluetooth, 
  Play, 
  Pause, 
  Square,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  Zap
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface HeartRateData {
  timestamp: number;
  heartRate: number;
  rrInterval?: number;
  heartRateVariability?: number;
}

interface HeartRateZone {
  name: string;
  min: number;
  max: number;
  color: string;
}

interface DeviceInfo {
  name: string;
  id: string;
  type: 'polar_h10' | 'bluetooth_hr' | 'manual';
  connected: boolean;
  batteryLevel?: number;
}

const HeartRateMonitor: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentHeartRate, setCurrentHeartRate] = useState<number | null>(null);
  const [heartRateData, setHeartRateData] = useState<HeartRateData[]>([]);
  const [device, setDevice] = useState<DeviceInfo | null>(null);
  const [zones, setZones] = useState<HeartRateZone[]>([]);
  const [sessionType, setSessionType] = useState<'rest' | 'exercise' | 'activity'>('exercise');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const deviceRef = useRef<BluetoothDevice | null>(null);
  const characteristicRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null);
  const sessionStartTime = useRef<number | null>(null);
  const { toast } = useToast();

  // Calcular zonas de frequência cardíaca baseado na idade
  useEffect(() => {
    const calculateHeartRateZones = () => {
      const age = 30; // TODO: Buscar idade real do usuário
      const maxHR = 220 - age;
      const restingHR = 60; // TODO: Calcular FC de repouso média
      
      const zones: HeartRateZone[] = [
        {
          name: 'Recuperação',
          min: restingHR + Math.round((maxHR - restingHR) * 0.5),
          max: restingHR + Math.round((maxHR - restingHR) * 0.6),
          color: '#4CAF50'
        },
        {
          name: 'Base Aeróbica',
          min: restingHR + Math.round((maxHR - restingHR) * 0.6),
          max: restingHR + Math.round((maxHR - restingHR) * 0.7),
          color: '#2196F3'
        },
        {
          name: 'Aeróbico',
          min: restingHR + Math.round((maxHR - restingHR) * 0.7),
          max: restingHR + Math.round((maxHR - restingHR) * 0.8),
          color: '#FF9800'
        },
        {
          name: 'Limiar',
          min: restingHR + Math.round((maxHR - restingHR) * 0.8),
          max: restingHR + Math.round((maxHR - restingHR) * 0.9),
          color: '#FF5722'
        },
        {
          name: 'Neuromuscular',
          min: restingHR + Math.round((maxHR - restingHR) * 0.9),
          max: maxHR,
          color: '#F44336'
        }
      ];
      
      setZones(zones);
    };

    calculateHeartRateZones();
  }, []);

  // Conectar com dispositivo Bluetooth (Polar H10)
  const connectPolarH10 = async () => {
    if (!navigator.bluetooth) {
      setError('Bluetooth não é suportado neste navegador');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Solicitar dispositivo Polar H10
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ['heart_rate'] },
          { namePrefix: 'Polar H10' }
        ],
        optionalServices: ['heart_rate', 'battery_service']
      });

      deviceRef.current = device;
      
      const server = await device.gatt!.connect();
      const service = await server.getPrimaryService('heart_rate');
      const characteristic = await service.getCharacteristic('heart_rate_measurement');
      
      characteristicRef.current = characteristic;
      
      // Configurar notificações
      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', handleHeartRateChange);

      setDevice({
        name: device.name || 'Polar H10',
        id: device.id,
        type: 'polar_h10',
        connected: true
      });

      setIsConnected(true);
      
      toast({
        title: 'Conectado!',
        description: 'Polar H10 conectado com sucesso',
      });

    } catch (error: any) {
      console.error('Erro ao conectar:', error);
      setError('Erro ao conectar com o dispositivo: ' + error.message);
      toast({
        title: 'Erro de Conexão',
        description: 'Não foi possível conectar com o Polar H10',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Processar dados de frequência cardíaca
  const handleHeartRateChange = (event: Event) => {
    const target = event.target as unknown as BluetoothRemoteGATTCharacteristic;
    const value = target.value!;
    
    // Parse Heart Rate Measurement (BLE standard)
    const flags = value.getUint8(0);
    const is16Bit = flags & 0x01;
    const heartRate = is16Bit ? value.getUint16(1, true) : value.getUint8(1);
    
    // RR-Interval se disponível
    let rrInterval: number | undefined;
    if (flags & 0x10 && value.byteLength >= 4) {
      rrInterval = value.getUint16(is16Bit ? 3 : 2, true) / 1024 * 1000; // Convert to ms
    }

    const timestamp = Date.now();
    const newData: HeartRateData = {
      timestamp,
      heartRate,
      rrInterval,
    };

    setCurrentHeartRate(heartRate);
    
    if (isRecording) {
      setHeartRateData(prev => [...prev.slice(-59), newData]); // Keep last 60 readings
    }
  };

  // Iniciar gravação
  const startRecording = () => {
    if (!isConnected) {
      toast({
        title: 'Dispositivo não conectado',
        description: 'Conecte um dispositivo primeiro',
        variant: 'destructive',
      });
      return;
    }

    setIsRecording(true);
    sessionStartTime.current = Date.now();
    setHeartRateData([]);
    
    toast({
      title: 'Gravação iniciada',
      description: 'Monitoramento de frequência cardíaca ativo',
    });
  };

  // Parar gravação
  const stopRecording = () => {
    setIsRecording(false);
    
    if (heartRateData.length > 0) {
      saveHeartRateSession();
    }
  };

  // Salvar sessão no banco
  const saveHeartRateSession = async () => {
    if (heartRateData.length === 0) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const avgHeartRate = Math.round(
        heartRateData.reduce((sum, data) => sum + data.heartRate, 0) / heartRateData.length
      );
      const maxHeartRate = Math.max(...heartRateData.map(data => data.heartRate));
      const minHeartRate = Math.min(...heartRateData.map(data => data.heartRate));
      const duration = sessionStartTime.current ? 
        Math.round((Date.now() - sessionStartTime.current) / 1000 / 60) : 0;

      // Salvar dados individuais de FC
      for (const data of heartRateData) {
        await supabase.from('heart_rate_data').insert({
          user_id: user.id,
          heart_rate_bpm: data.heartRate,
          heart_rate_variability: data.rrInterval,
          device_type: device?.type || 'bluetooth_hr',
          device_model: device?.name || 'Unknown',
          activity_type: sessionType,
          recorded_at: new Date(data.timestamp).toISOString()
        });
      }

      // Salvar sessão de exercício
      await supabase.from('exercise_sessions').insert({
        user_id: user.id,
        exercise_type: sessionType,
        duration_minutes: duration,
        avg_heart_rate: avgHeartRate,
        max_heart_rate: maxHeartRate,
        min_heart_rate: minHeartRate,
        device_type: device?.type || 'bluetooth_hr',
        started_at: new Date(sessionStartTime.current!).toISOString(),
        ended_at: new Date().toISOString()
      });

      toast({
        title: 'Sessão salva!',
        description: `${duration} minutos de monitoramento salvo com sucesso`,
      });

    } catch (error) {
      console.error('Erro ao salvar sessão:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar dados da sessão',
        variant: 'destructive',
      });
    }
  };

  // Desconectar dispositivo
  const disconnect = () => {
    try {
      if (deviceRef.current?.gatt) {
        deviceRef.current.gatt.disconnect();
      }
    } catch (error) {
      console.log('Erro ao desconectar:', error);
    }
    
    setIsConnected(false);
    setIsRecording(false);
    setCurrentHeartRate(null);
    setDevice(null);
    setHeartRateData([]);
    
    toast({
      title: 'Desconectado',
      description: 'Dispositivo desconectado',
    });
  };

  // Determinar zona atual
  const getCurrentZone = () => {
    if (!currentHeartRate) return null;
    return zones.find(zone => currentHeartRate >= zone.min && currentHeartRate <= zone.max);
  };

  const currentZone = getCurrentZone();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500" />
            Monitor Cardíaco
          </h2>
          <p className="text-muted-foreground">
            Monitoramento em tempo real via Polar H10 e outros dispositivos
          </p>
        </div>
      </div>

      {/* Status da Conexão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bluetooth className="h-5 w-5" />
            Status da Conexão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isConnected ? (
                <>
                  <Wifi className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">{device?.name}</p>
                    <p className="text-sm text-muted-foreground">Conectado via Bluetooth</p>
                  </div>
                </>
              ) : (
                <>
                  <WifiOff className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-muted-foreground">Nenhum dispositivo conectado</p>
                    <p className="text-sm text-muted-foreground">Conecte um monitor cardíaco</p>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex gap-2">
              {!isConnected ? (
                <Button onClick={connectPolarH10} disabled={loading}>
                  <Bluetooth className="h-4 w-4 mr-2" />
                  {loading ? 'Conectando...' : 'Conectar Polar H10'}
                </Button>
              ) : (
                <Button variant="outline" onClick={disconnect}>
                  Desconectar
                </Button>
              )}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Frequência Cardíaca Atual */}
      {isConnected && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                FC Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-red-600">
                {currentHeartRate || '--'}
                <span className="text-lg text-muted-foreground ml-2">bpm</span>
              </div>
              {currentZone && (
                <Badge style={{ backgroundColor: currentZone.color, color: 'white' }} className="mt-2">
                  {currentZone.name}
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Tipo de Atividade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={sessionType} onValueChange={(value: any) => setSessionType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rest">Repouso</SelectItem>
                  <SelectItem value="exercise">Exercício</SelectItem>
                  <SelectItem value="activity">Atividade Geral</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Gravação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {!isRecording ? (
                  <Button onClick={startRecording} className="flex-1">
                    <Play className="h-4 w-4 mr-2" />
                    Iniciar
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => setIsRecording(false)} className="flex-1">
                      <Pause className="h-4 w-4 mr-2" />
                      Pausar
                    </Button>
                    <Button variant="destructive" onClick={stopRecording}>
                      <Square className="h-4 w-4 mr-2" />
                      Parar
                    </Button>
                  </>
                )}
              </div>
              {isRecording && (
                <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Gravando... {heartRateData.length} leituras
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráfico em Tempo Real */}
      {isConnected && heartRateData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Frequência Cardíaca em Tempo Real</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={heartRateData.map((data, index) => ({
                  time: index,
                  heartRate: data.heartRate
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={['dataMin - 10', 'dataMax + 10']} />
                  <Tooltip 
                    formatter={(value: any) => [`${value} bpm`, 'FC']}
                    labelFormatter={(label) => `Tempo: ${label}s`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="heartRate" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    dot={false}
                  />
                  
                  {/* Linhas das zonas */}
                  {zones.map((zone, index) => (
                    <Line
                      key={`zone-${index}`}
                      type="monotone"
                      dataKey={() => zone.min}
                      stroke={zone.color}
                      strokeDasharray="5 5"
                      strokeWidth={1}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legenda das Zonas */}
            <div className="flex flex-wrap gap-2 mt-4">
              {zones.map((zone, index) => (
                <Badge 
                  key={index} 
                  style={{ backgroundColor: zone.color, color: 'white' }}
                  variant="secondary"
                >
                  {zone.name}: {zone.min}-{zone.max} bpm
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações de Compatibilidade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Compatibilidade e Requisitos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <p><strong>Polar H10:</strong> Monitor de frequência cardíaca com Bluetooth mais preciso do mercado</p>
            <p><strong>Navegadores:</strong> Chrome 56+, Edge 79+, Opera 43+ (Web Bluetooth API)</p>
            <p><strong>Dispositivos:</strong> Android 6.0+, Windows 10+, macOS 10.15+, Linux com BlueZ</p>
            <p><strong>Alcance:</strong> Até 10 metros do dispositivo conectado</p>
            <p><strong>Bateria:</strong> Autonomia de ~400 horas com pilha CR2025</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HeartRateMonitor; 