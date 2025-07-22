import OpenAI from 'openai';
import { config } from './config';
import { useState } from 'react';

// Cliente OpenAI configurado
export const openai = new OpenAI({
  apiKey: config.openai.apiKey,
  baseURL: config.openai.baseURL || 'https://api.openai.com/v1',
});

// Tipos para as mensagens
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Configuração do agente GPT
export class GPTAgent {
  private messages: ChatMessage[] = [];
  private model: string;
  private maxTokens: number;
  private temperature: number;

  constructor(
    model: string = 'gpt-3.5-turbo',
    maxTokens: number = 1000,
    temperature: number = 0.7
  ) {
    this.model = model;
    this.maxTokens = maxTokens;
    this.temperature = temperature;
  }

  // Adicionar mensagem ao histórico
  addMessage(role: 'system' | 'user' | 'assistant', content: string) {
    this.messages.push({ role, content });
  }

  // Limpar histórico
  clearHistory() {
    this.messages = [];
  }

  // Enviar mensagem para o GPT
  async sendMessage(message: string): Promise<ChatResponse> {
    try {
      // Adicionar mensagem do usuário
      this.addMessage('user', message);

      // Fazer chamada para a API
      const completion = await openai.chat.completions.create({
        model: this.model,
        messages: this.messages,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
      });

      const response = completion.choices[0]?.message?.content || 'Desculpe, não consegui gerar uma resposta.';
      
      // Adicionar resposta do assistente ao histórico
      this.addMessage('assistant', response);

      return {
        content: response,
        usage: completion.usage,
      };
    } catch (error) {
      console.error('Erro na chamada da API OpenAI:', error);
      throw new Error('Falha na comunicação com o GPT');
    }
  }

  // Configurar contexto do sistema
  setSystemPrompt(prompt: string) {
    // Remover prompts de sistema anteriores
    this.messages = this.messages.filter(msg => msg.role !== 'system');
    // Adicionar novo prompt de sistema
    this.addMessage('system', prompt);
  }

  // Obter histórico de mensagens
  getHistory(): ChatMessage[] {
    return [...this.messages];
  }

  // Configurar parâmetros
  setParameters(model?: string, maxTokens?: number, temperature?: number) {
    if (model) this.model = model;
    if (maxTokens) this.maxTokens = maxTokens;
    if (temperature) this.temperature = temperature;
  }
}

// Instância padrão do agente
export const gptAgent = new GPTAgent();

// Funções utilitárias para diferentes tipos de uso
export const healthAssistant = new GPTAgent('gpt-3.5-turbo', 1500, 0.8);
healthAssistant.setSystemPrompt(`
Você é um assistente especializado em saúde e bem-estar. 
Ajude os usuários com:
- Dicas de nutrição e exercícios
- Análise de dados de peso e composição corporal
- Motivação para metas de saúde
- Explicações sobre IMC e saúde metabólica
- Receitas saudáveis e planos de treino
Sempre seja encorajador e baseado em evidências científicas.
`);

export const codingAssistant = new GPTAgent('gpt-3.5-turbo', 2000, 0.3);
codingAssistant.setSystemPrompt(`
Você é um assistente de programação especializado em React, TypeScript e desenvolvimento web.
Ajude com:
- Debugging de código
- Refatoração e otimização
- Explicações de conceitos técnicos
- Sugestões de arquitetura
- Integração de APIs
Sempre forneça código limpo e bem documentado.
`);

// Hook para usar o GPT no React
export const useGPTAgent = (agent: GPTAgent = gptAgent) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (message: string): Promise<ChatResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await agent.sendMessage(message);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendMessage,
    isLoading,
    error,
    history: agent.getHistory(),
    clearHistory: () => agent.clearHistory(),
  };
}; 