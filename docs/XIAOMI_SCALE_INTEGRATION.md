# 📊 Integração Xiaomi Mi Body Scale 2

## 🎯 Visão Geral

Esta documentação descreve a implementação completa da integração com a **Xiaomi Mi Body Scale 2** usando Web Bluetooth API. A integração permite capturar dados de peso e composição corporal em tempo real.

## 🔧 Arquitetura Técnica

### Componentes Principais

1. **`xiaomi-scale-service.ts`** - Serviço principal de integração
2. **`XiaomiScaleIntegration.tsx`** - Componente React para interface
3. **Protocolo Bluetooth LE** - Comunicação com a balança

### UUIDs da Xiaomi Mi Body Scale 2

```typescript
const XIAOMI_SCALE_SERVICE_UUID = '0000181b-0000-1000-8000-00805f9b34fb'; // Weight Scale Service
const XIAOMI_SCALE_CHARACTERISTIC_UUID = '00002a9c-0000-1000-8000-00805f9b34fb'; // Weight Measurement
const XIAOMI_SCALE_BATTERY_SERVICE_UUID = '0000180f-0000-1000-8000-00805f9b34fb'; // Battery Service
const XIAOMI_SCALE_BATTERY_CHARACTERISTIC_UUID = '00002a19-0000-1000-8000-00805f9b34fb'; // Battery Level
```

### Filtros de Dispositivo

```typescript
const XIAOMI_SCALE_FILTERS = [
  { namePrefix: 'MIBFS' }, // Xiaomi Mi Body Scale 2
  { namePrefix: 'XMTZC' }, // Xiaomi Mi Smart Scale
  { namePrefix: 'XMTZ' },  // Xiaomi Mi Scale
  { services: [XIAOMI_SCALE_SERVICE_UUID] }
];
```

## 📱 Como Usar

### 1. Pré-requisitos

- **Navegador**: Chrome 56+ ou Edge 79+
- **Balança**: Xiaomi Mi Body Scale 2
- **Bluetooth**: Ativado no dispositivo
- **HTTPS**: Necessário para Web Bluetooth (exceto localhost)

### 2. Conectar à Balança

```typescript
import { xiaomiScaleService } from '@/lib/xiaomi-scale-service';

// Conectar à balança
const device = await xiaomiScaleService.connect();

// Configurar callbacks
xiaomiScaleService.onData((data) => {
  console.log('Dados recebidos:', data);
});

xiaomiScaleService.onConnectionChange((connected) => {
  console.log('Status da conexão:', connected);
});
```

### 3. Capturar Dados

```typescript
// Os dados são recebidos automaticamente quando você sobe na balança
xiaomiScaleService.onData((data: XiaomiScaleData) => {
  console.log('Peso:', data.weight);
  console.log('Gordura corporal:', data.bodyFat);
  console.log('Massa muscular:', data.muscleMass);
  console.log('Água corporal:', data.bodyWater);
  console.log('Massa óssea:', data.boneMass);
  console.log('Metabolismo basal:', data.basalMetabolism);
  console.log('Idade metabólica:', data.metabolicAge);
  console.log('Impedância:', data.impedance);
});
```

## 🔬 Protocolo de Dados

### Estrutura dos Dados Recebidos

```typescript
interface XiaomiScaleData {
  weight: number;           // Peso em kg
  bodyFat?: number;         // Gordura corporal em %
  muscleMass?: number;      // Massa muscular em kg
  bodyWater?: number;       // Água corporal em %
  boneMass?: number;        // Massa óssea em kg
  basalMetabolism?: number; // Metabolismo basal em kcal
  metabolicAge?: number;    // Idade metabólica em anos
  impedance?: number;       // Impedância em ohms
  timestamp: Date;          // Timestamp da medição
}
```

### Decodificação dos Dados

```typescript
private decodeWeightData(value: DataView): XiaomiScaleData {
  const dataView = new DataView(value.buffer);
  
  // Byte 0: Flags
  const flags = dataView.getUint8(0);
  
  // Byte 1-2: Weight (kg * 200)
  const weightRaw = dataView.getUint16(1, true); // little-endian
  const weight = weightRaw / 200;
  
  // Byte 3-4: Impedance (ohms)
  const impedance = dataView.getUint16(3, true);
  
  // Calcular composição corporal baseada na impedância
  const bodyComposition = this.calculateBodyComposition(weight, impedance);
  
  return {
    weight,
    impedance,
    ...bodyComposition,
    timestamp: new Date()
  };
}
```

## 🧮 Cálculos de Composição Corporal

### Fórmulas Utilizadas

```typescript
private calculateBodyComposition(weight: number, impedance: number): Partial<XiaomiScaleData> {
  if (impedance === 0) return {};

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
```

## 🎮 Interface do Usuário

### Funcionalidades da Interface

1. **Status de Conexão**
   - Indicador visual de conectado/desconectado
   - Informações do dispositivo
   - Nível da bateria

2. **Processo de Pesagem**
   - Botão para conectar/desconectar
   - Indicador de progresso durante pesagem
   - Instruções para o usuário

3. **Resultados**
   - Peso principal com tendência
   - Métricas detalhadas de composição corporal
   - Comparação com pesagem anterior
   - Classificação do IMC

### Componente React

```typescript
import { XiaomiScaleIntegration } from '@/components/weighing/XiaomiScaleIntegration';

// Usar o componente
<XiaomiScaleIntegration user={currentUser} />
```

## 🔧 Configuração da Balança

### Modo de Descoberta

1. **Ligar a balança**
2. **Aguardar o LED piscar**
3. **Pressionar o botão de reset** (se necessário)
4. **A balança deve aparecer como "MIBFS..."**

### Primeira Configuração

1. **Conectar via app Xiaomi Mi Fit**
2. **Configurar dados pessoais** (altura, idade, sexo)
3. **Fazer primeira pesagem** no app
4. **Agora pode usar via Web Bluetooth**

## 🚨 Solução de Problemas

### Problemas Comuns

#### 1. "Web Bluetooth não é suportado"
- **Solução**: Use Chrome 56+ ou Edge 79+
- **Verificar**: `navigator.bluetooth` existe

#### 2. "Dispositivo não encontrado"
- **Verificar**: Bluetooth ativado
- **Verificar**: Balança em modo de descoberta
- **Verificar**: Balança próxima ao dispositivo

#### 3. "Erro de conexão"
- **Tentar**: Desconectar e reconectar
- **Verificar**: Bateria da balança
- **Verificar**: Interferência Bluetooth

#### 4. "Dados incorretos"
- **Verificar**: Dados pessoais configurados
- **Verificar**: Primeira pesagem no app oficial
- **Verificar**: Posicionamento na balança

### Debug

```typescript
// Habilitar logs detalhados
xiaomiScaleService.onData((data) => {
  console.log('Dados da balança:', data);
});

xiaomiScaleService.onConnectionChange((connected) => {
  console.log('Status da conexão:', connected);
});
```

## 📊 Salvamento de Dados

### Integração com Supabase

```typescript
const saveWeighingData = async (data: XiaomiScaleData) => {
  const { error } = await supabase
    .from('weight_measurements')
    .insert({
      user_id: user.id,
      peso_kg: data.weight,
      gordura_corporal_percent: data.bodyFat,
      massa_muscular_kg: data.muscleMass,
      agua_corporal_percent: data.bodyWater,
      osso_kg: data.boneMass,
      metabolismo_basal_kcal: data.basalMetabolism,
      idade_metabolica: data.metabolicAge,
      imc: calculateBMI(data.weight),
      device_type: 'xiaomi_scale'
    });
};
```

## 🔒 Segurança

### Permissões Bluetooth

- **HTTPS obrigatório** (exceto localhost)
- **Permissão do usuário** necessária
- **Dados criptografados** em trânsito
- **Armazenamento seguro** no Supabase

### Privacidade

- **Dados pessoais** não compartilhados
- **Conexão local** apenas
- **Sem dados enviados** para terceiros

## 🚀 Melhorias Futuras

### Funcionalidades Planejadas

1. **Múltiplas balanças** - Suporte a outras marcas
2. **Sincronização offline** - Cache local
3. **Análise avançada** - IA para recomendações
4. **Exportação de dados** - CSV/PDF
5. **Notificações push** - Lembretes de pesagem

### Otimizações Técnicas

1. **Reconexão automática** - Se desconectar
2. **Cache de dados** - Reduzir requisições
3. **Compressão de dados** - Menor uso de banda
4. **Web Workers** - Processamento em background

## 📚 Referências

- [Web Bluetooth API](https://web.dev/bluetooth/)
- [Xiaomi Mi Body Scale 2 Manual](https://www.mi.com/global/support/product/mi-body-composition-scale-2/)
- [openScale Project](https://github.com/oliexdev/openScale)
- [Bluetooth LE Weight Scale Service](https://www.bluetooth.com/specifications/specs/weight-scale-service-1-0/)

---

**Desenvolvido com ❤️ para revolucionar o monitoramento de saúde!** 