// ========================================
// Gerenciador de Instancias Evolution
// Multi-vendedor com WhatsApp
// ========================================

// ========================================
// Imports
// ========================================
import evolutionService from './evolutionService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ========================================
// Constantes
// ========================================
const STORAGE_KEY = '@evolution_instances';      //......Chave do storage

// ========================================
// Interface de Instancia
// ========================================
interface InstanceData {
  userId: string;                                //......ID do usuario
  instanceName: string;                          //......Nome da instancia
  token: string;                                 //......Token da instancia
  createdAt: string;                             //......Data de criacao
  active: boolean;                               //......Se esta ativa
  phoneNumber?: string;                          //......Numero conectado
}

// ========================================
// Interface de QR Code
// ========================================
interface QRCodeResponse {
  qrcode?: {                                     //......Dados do QR
    base64: string;                              //......Base64 do QR
  };
  error?: string;                                //......Erro se houver
}

// ========================================
// Gerenciador de Instancias
// ========================================
export const instanceManager = {
  // ========================================
  // Obter Nome Padronizado da Instancia
  // ========================================
  getInstanceName(userId: string): string {
    return `partners_${userId}`;                 //......Nome padrao
  },

  // ========================================
  // Obter Instancia do Vendedor
  // ========================================
  async getInstance(userId: string): Promise<string | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (!data) {
        // Retorna o nome padronizado mesmo sem dados
        return this.getInstanceName(userId);
      }

      const instances: InstanceData[] = JSON.parse(data);
      const instance = instances.find(
        (i) => i.userId === userId && i.active
      );

      // Se encontrou, retorna o nome; senao, retorna padrao
      return instance?.instanceName || this.getInstanceName(userId);
    } catch (error) {
      console.error('[InstanceManager] Erro ao obter instancia:', error);
      return this.getInstanceName(userId);       //......Retorna padrao em erro
    }
  },

  // ========================================
  // Obter Dados Completos da Instancia
  // ========================================
  async getInstanceData(userId: string): Promise<InstanceData | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (!data) return null;                    //......Sem dados

      const instances: InstanceData[] = JSON.parse(data);
      const instance = instances.find(
        (i) => i.userId === userId
      );

      return instance || null;                   //......Retorna dados ou null
    } catch (error) {
      console.error('[InstanceManager] Erro ao obter dados:', error);
      return null;                               //......Retorna null em erro
    }
  },

  // ========================================
  // Criar Nova Instancia para Vendedor
  // ========================================
  async createInstance(
    userId: string,
    userName: string,
    usePairingCode: boolean = false
  ): Promise<InstanceData> {
    try {
      const instanceName = `partners_${userId}`;

      console.log('[InstanceManager] Criando instancia:', instanceName);
      console.log('[InstanceManager] usePairingCode:', usePairingCode);

      // Criar via Evolution API
      const response = await evolutionService.createInstance(
        instanceName,
        usePairingCode
      );

      if (response.error) {
        throw new Error(response.error);         //......Lanca erro da API
      }

      // Criar dados da instancia
      const instanceData: InstanceData = {
        userId: userId,                          //......ID do usuario
        instanceName: instanceName,              //......Nome da instancia
        token: response.hash?.apikey || '',      //......Token da API
        createdAt: new Date().toISOString(),     //......Data de criacao
        active: false,                           //......Inativa ate conectar
      };

      // Salvar no storage
      await this.saveInstance(instanceData);

      console.log('[InstanceManager] Instancia criada:', instanceName);
      return instanceData;                       //......Retorna dados
    } catch (error) {
      console.error('[InstanceManager] Erro ao criar instancia:', error);
      throw error;                               //......Propaga erro
    }
  },

  // ========================================
  // Salvar Instancia no Storage
  // ========================================
  async saveInstance(instanceData: InstanceData): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      const instances: InstanceData[] = data ? JSON.parse(data) : [];

      // Verificar se ja existe
      const existingIndex = instances.findIndex(
        (i) => i.userId === instanceData.userId
      );

      if (existingIndex >= 0) {
        instances[existingIndex] = instanceData; //......Atualiza existente
      } else {
        instances.push(instanceData);            //......Adiciona nova
      }

      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(instances)
      );
    } catch (error) {
      console.error('[InstanceManager] Erro ao salvar:', error);
      throw error;                               //......Propaga erro
    }
  },

  // ========================================
  // Conectar WhatsApp (Obter QR Code)
  // ========================================
  async connectInstance(userId: string): Promise<QRCodeResponse> {
    try {
      let instanceName = await this.getInstance(userId);

      // Se nao tem instancia, criar uma
      if (!instanceName) {
        const newInstance = await this.createInstance(userId, 'Vendedor');
        instanceName = newInstance.instanceName;
      }

      // Obter QR Code
      const qrCode = await evolutionService.connectInstance(instanceName);

      console.log('[InstanceManager] QR Code gerado para:', instanceName);
      return qrCode;                             //......Retorna QR Code
    } catch (error) {
      console.error('[InstanceManager] Erro ao conectar:', error);
      throw error;                               //......Propaga erro
    }
  },

  // ========================================
  // Verificar se Esta Conectado
  // ========================================
  async isConnected(userId: string): Promise<boolean> {
    try {
      const instanceName = await this.getInstance(userId);

      if (!instanceName) return false;           //......Sem instancia

      const status = await evolutionService.getConnectionStatus(instanceName);
      console.log('[InstanceManager] Status da conexao:', JSON.stringify(status, null, 2));

      // Verificar diferentes formatos de resposta
      const connected =
        status.state === 'open' ||
        status.instance?.state === 'open' ||
        status.instance?.connectionStatus === 'open';

      console.log('[InstanceManager] Conectado:', connected);

      // Atualizar status no storage
      if (connected) {
        await this.setInstanceActive(userId, true);
      }

      return connected;                          //......Retorna status
    } catch (error) {
      console.error('[InstanceManager] Erro ao verificar conexao:', error);
      return false;                              //......Retorna false em erro
    }
  },

  // ========================================
  // Definir Instancia como Ativa/Inativa
  // ========================================
  async setInstanceActive(
    userId: string,
    active: boolean
  ): Promise<void> {
    try {
      const instanceData = await this.getInstanceData(userId);

      if (instanceData) {
        instanceData.active = active;
        await this.saveInstance(instanceData);
      }
    } catch (error) {
      console.error('[InstanceManager] Erro ao atualizar status:', error);
    }
  },

  // ========================================
  // Desconectar WhatsApp
  // ========================================
  async disconnect(userId: string): Promise<void> {
    try {
      const instanceName = await this.getInstance(userId);

      if (!instanceName) {
        throw new Error('Instancia nao encontrada');
      }

      // Desconectar via API
      await evolutionService.logoutInstance(instanceName);

      // Marcar como inativa
      await this.setInstanceActive(userId, false);

      console.log('[InstanceManager] Desconectado:', instanceName);
    } catch (error) {
      console.error('[InstanceManager] Erro ao desconectar:', error);
      throw error;                               //......Propaga erro
    }
  },

  // ========================================
  // Remover Instancia
  // ========================================
  async removeInstance(userId: string): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (!data) return;                         //......Sem dados

      const instances: InstanceData[] = JSON.parse(data);
      const filtered = instances.filter((i) => i.userId !== userId);

      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(filtered)
      );

      console.log('[InstanceManager] Instancia removida para:', userId);
    } catch (error) {
      console.error('[InstanceManager] Erro ao remover:', error);
      throw error;                               //......Propaga erro
    }
  },

  // ========================================
  // Listar Todas as Instancias
  // ========================================
  async listInstances(): Promise<InstanceData[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (!data) return [];                      //......Sem dados

      return JSON.parse(data);                   //......Retorna array
    } catch (error) {
      console.error('[InstanceManager] Erro ao listar:', error);
      return [];                                 //......Retorna vazio em erro
    }
  },

  // ========================================
  // Verificar Status da Conexao em Tempo Real
  // ========================================
  async checkConnectionLoop(
    userId: string,
    onConnected: () => void,
    onDisconnected: () => void,
    intervalMs: number = 3000,
    timeoutMs: number = 120000
  ): Promise<() => void> {
    let elapsed = 0;                             //......Tempo decorrido

    const interval = setInterval(async () => {
      elapsed += intervalMs;

      const connected = await this.isConnected(userId);

      if (connected) {
        clearInterval(interval);                 //......Para o loop
        onConnected();                           //......Callback conectado
      } else if (elapsed >= timeoutMs) {
        clearInterval(interval);                 //......Para o loop
        onDisconnected();                        //......Callback desconectado
      }
    }, intervalMs);

    // Retorna funcao para cancelar
    return () => clearInterval(interval);
  },
};

// ========================================
// Export Default
// ========================================
export default instanceManager;
