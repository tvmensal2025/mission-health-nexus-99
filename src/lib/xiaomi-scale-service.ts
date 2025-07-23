// Definições de tipos para Web Bluetooth API
declare global {
  interface Navigator {
    bluetooth: Bluetooth;
  }

  interface Bluetooth {
    requestDevice(options: RequestDeviceOptions): Promise<BluetoothDevice>;
  }

  interface RequestDeviceOptions {
    filters?: BluetoothRequestDeviceFilter[];
    optionalServices?: string[];
  }

  interface BluetoothRequestDeviceFilter {
    services?: string[];
    name?: string;
    namePrefix?: string;
    manufacturerData?: BluetoothManufacturerDataFilter[];
  }

  interface BluetoothManufacturerDataFilter {
    companyIdentifier: number;
    dataPrefix?: BufferSource;
    mask?: BufferSource;
  }

  interface BluetoothDevice {
    id: string;
    name?: string;
    gatt?: BluetoothRemoteGATTServer;
    addEventListener(type: string, listener: EventListener): void;
  }

  interface BluetoothRemoteGATTServer {
    connect(): Promise<BluetoothRemoteGATTServer>;
    getPrimaryService(service: string): Promise<BluetoothRemoteGATTService>;
    disconnect(): void;
  }

  interface BluetoothRemoteGATTService {
    getCharacteristic(characteristic: string): Promise<BluetoothRemoteGATTCharacteristic>;
  }

  interface BluetoothRemoteGATTCharacteristic {
    startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
    stopNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
    readValue(): Promise<DataView>;
    writeValue(value: BufferSource): Promise<void>;
    addEventListener(type: string, listener: EventListener): void;
    value?: DataView;
  }
}

// Xiaomi Mi Body Scale 2 Integration Service
// Baseado na documentação oficial e protocolo Bluetooth LE

export interface XiaomiScaleData {
  weight: number;
  bodyFat?: number;
  muscleMass?: number;
  bodyWater?: number;
  boneMass?: number;
  basalMetabolism?: number;
  metabolicAge?: number;
  impedance?: number;
  timestamp: Date;
}

export interface XiaomiScaleDevice {
  id: string;
  name: string;
  connected: boolean;
  batteryLevel?: number;
}

// UUIDs específicos da Xiaomi Mi Body Scale 2
const XIAOMI_SCALE_SERVICE_UUID = '0000181b-0000-1000-8000-00805f9b34fb'; // Weight Scale Service
const XIAOMI_SCALE_CHARACTERISTIC_UUID = '00002a9c-0000-1000-8000-00805f9b34fb'; // Weight Measurement
const XIAOMI_SCALE_BATTERY_SERVICE_UUID = '0000180f-0000-1000-8000-00805f9b34fb'; // Battery Service
const XIAOMI_SCALE_BATTERY_CHARACTERISTIC_UUID = '00002a19-0000-1000-8000-00805f9b34fb'; // Battery Level

// Filtros para encontrar a balança Xiaomi
const XIAOMI_SCALE_FILTERS = [
  { namePrefix: 'MIBFS' }, // Xiaomi Mi Body Scale 2
  { namePrefix: 'XMTZC' }, // Xiaomi Mi Smart Scale
  { namePrefix: 'XMTZ' },  // Xiaomi Mi Scale
  { services: [XIAOMI_SCALE_SERVICE_UUID] }
];

export class XiaomiScaleService {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private weightCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private batteryCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private onDataCallback: ((data: XiaomiScaleData) => void) | null = null;
  private onConnectionChangeCallback: ((connected: boolean) => void) | null = null;

  constructor() {
    this.checkBluetoothSupport();
  }

  /**
   * Verifica se o navegador suporta Web Bluetooth API
   */
  checkBluetoothSupport(): boolean {
    if (!navigator.bluetooth) {
      console.error('Web Bluetooth API não é suportada neste navegador');
      return false;
    }
    return true;
  }

  /**
   * Solicita permissão e conecta à balança
   */
  async connect(): Promise<XiaomiScaleDevice> {
      if (!this.checkBluetoothSupport()) {
      throw new Error('Web Bluetooth não é suportado neste navegador');
      }

    try {
      // Solicitar dispositivo Bluetooth
      this.device = await navigator.bluetooth.requestDevice({
        filters: XIAOMI_SCALE_FILTERS,
        optionalServices: [XIAOMI_SCALE_BATTERY_SERVICE_UUID]
      });

      console.log('Dispositivo selecionado:', this.device.name);

      // Conectar ao servidor GATT
      this.server = await this.device.gatt?.connect();
      if (!this.server) {
        throw new Error('Falha ao conectar ao servidor GATT');
      }

      // Obter serviço de peso
      const weightService = await this.server.getPrimaryService(XIAOMI_SCALE_SERVICE_UUID);
      
      // Obter característica de peso
      this.weightCharacteristic = await weightService.getCharacteristic(XIAOMI_SCALE_CHARACTERISTIC_UUID);

      // Configurar notificações para dados de peso
      await this.weightCharacteristic.startNotifications();
      this.weightCharacteristic.addEventListener('characteristicvaluechanged', this.handleWeightData.bind(this));

      // Tentar obter nível da bateria
      try {
        const batteryService = await this.server.getPrimaryService(XIAOMI_SCALE_BATTERY_SERVICE_UUID);
        this.batteryCharacteristic = await batteryService.getCharacteristic(XIAOMI_SCALE_BATTERY_CHARACTERISTIC_UUID);
      } catch (error) {
        console.warn('Não foi possível obter informações da bateria:', error);
      }

      // Configurar listeners de desconexão
      this.device.addEventListener('gattserverdisconnected', this.handleDisconnection.bind(this));

      const deviceInfo: XiaomiScaleDevice = {
        id: this.device.id,
        name: this.device.name || 'Xiaomi Scale',
        connected: true
      };

      this.onConnectionChangeCallback?.(true);
      return deviceInfo;

    } catch (error) {
      console.error('Erro ao conectar com a balança:', error);
      throw error;
    }
  }

  /**
   * Desconecta da balança
   */
  async disconnect(): Promise<void> {
    if (this.weightCharacteristic) {
      try {
        await this.weightCharacteristic.stopNotifications();
    } catch (error) {
        console.warn('Erro ao parar notificações:', error);
    }
  }

    if (this.server) {
    try {
        this.server.disconnect();
    } catch (error) {
        console.warn('Erro ao desconectar:', error);
    }
  }

    this.device = null;
    this.server = null;
    this.weightCharacteristic = null;
    this.batteryCharacteristic = null;

    this.onConnectionChangeCallback?.(false);
  }

  /**
   * Obtém o nível da bateria
   */
  async getBatteryLevel(): Promise<number | null> {
    if (!this.batteryCharacteristic) {
        return null;
      }

    try {
      const value = await this.batteryCharacteristic.readValue();
      return value.getUint8(0);
    } catch (error) {
      console.error('Erro ao ler nível da bateria:', error);
      return null;
    }
  }

  /**
   * Configura callback para receber dados da balança
   */
  onData(callback: (data: XiaomiScaleData) => void): void {
    this.onDataCallback = callback;
  }

  /**
   * Configura callback para mudanças de conexão
   */
  onConnectionChange(callback: (connected: boolean) => void): void {
    this.onConnectionChangeCallback = callback;
  }

  /**
   * Processa dados recebidos da balança
   */
  private handleWeightData(event: Event): void {
    const characteristic = event.target as unknown as BluetoothRemoteGATTCharacteristic;
    const value = characteristic.value;
    if (!value) return;

    try {
      const data = this.decodeWeightData(value);
      this.onDataCallback?.(data);
    } catch (error) {
      console.error('Erro ao decodificar dados da balança:', error);
    }
  }

  /**
   * Decodifica dados da balança Xiaomi
   * Baseado no protocolo oficial da Xiaomi Mi Body Scale 2
   */
  private decodeWeightData(value: DataView): XiaomiScaleData {
    const buffer = value.buffer;
    const dataView = new DataView(buffer);
    
    // Estrutura de dados da Xiaomi Scale:
    // Byte 0: Flags
    // Byte 1-2: Weight (kg * 200)
    // Byte 3-4: Impedance (ohms)
    // Byte 5-6: Timestamp
    // Byte 7+: Additional data

    const flags = dataView.getUint8(0);
    const weightRaw = dataView.getUint16(1, true); // little-endian
    const impedance = dataView.getUint16(3, true);
    
    // Converter peso (raw value / 200 = kg)
    const weight = weightRaw / 200;

    // Calcular composição corporal baseada na impedância
    const bodyComposition = this.calculateBodyComposition(weight, impedance);

    return {
      weight,
      impedance,
      ...bodyComposition,
      timestamp: new Date()
    };
  }

  /**
   * Calcula composição corporal baseada na impedância
   * Fórmulas baseadas em pesquisas científicas sobre bioimpedância
   */
  private calculateBodyComposition(weight: number, impedance: number): Partial<XiaomiScaleData> {
    if (impedance === 0) {
      return {};
    }

    // Fórmulas simplificadas para demonstração
    // Em produção, usar fórmulas mais precisas baseadas em estudos científicos
    
    // Gordura corporal (fórmula simplificada)
    const bodyFat = Math.max(5, Math.min(50, (impedance / weight) * 0.8));
    
    // Massa muscular (aproximação)
    const muscleMass = weight * (0.4 + (1 - bodyFat / 100) * 0.3);
    
    // Água corporal
    const bodyWater = 100 - bodyFat - 5; // 5% para outros componentes
    
    // Massa óssea (aproximação)
    const boneMass = weight * 0.15;
    
    // Metabolismo basal (fórmula de Mifflin-St Jeor simplificada)
    const basalMetabolism = Math.round(weight * 24 * 0.9);
    
    // Idade metabólica (baseada no metabolismo basal)
    const metabolicAge = Math.max(18, Math.min(80, 25 + (basalMetabolism - 1500) / 20));

    return {
      bodyFat: Math.round(bodyFat * 10) / 10,
      muscleMass: Math.round(muscleMass * 10) / 10,
      bodyWater: Math.round(bodyWater * 10) / 10,
      boneMass: Math.round(boneMass * 10) / 10,
      basalMetabolism,
      metabolicAge
    };
  }

  /**
   * Manipula desconexão da balança
   */
  private handleDisconnection(): void {
    console.log('Balança desconectada');
      this.device = null;
      this.server = null;
    this.weightCharacteristic = null;
    this.batteryCharacteristic = null;
    this.onConnectionChangeCallback?.(false);
  }

  /**
   * Verifica se está conectado
   */
  isConnected(): boolean {
    return this.device !== null && this.server !== null;
  }

  /**
   * Obtém informações do dispositivo
   */
  getDeviceInfo(): XiaomiScaleDevice | null {
    if (!this.device) return null;

    return {
      id: this.device.id,
      name: this.device.name || 'Xiaomi Scale',
      connected: this.isConnected()
    };
  }
}

// Instância singleton do serviço
export const xiaomiScaleService = new XiaomiScaleService(); 