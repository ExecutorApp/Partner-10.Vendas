// ========================================
// Service de Lip Sync
// Cliente para API de sincronizacao labial
// ========================================

// ========================================
// Imports
// ========================================
import { Platform } from 'react-native';          //......Plataforma RN

// ========================================
// Constantes
// ========================================

// URL base da API
const API_BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:3001'                       //......Web local
  : 'http://10.0.2.2:3001';                       //......Android emulator

// ========================================
// Interface de Cue
// ========================================
export interface LipSyncCue {
  start: number;                                  //......Tempo inicio (segundos)
  end: number;                                    //......Tempo fim (segundos)
  viseme: string;                                 //......Nome do viseme
}

// ========================================
// Interface de Resultado
// ========================================
interface LipSyncResult {
  success: boolean;                               //......Sucesso
  lipSyncData: LipSyncCue[];                     //......Dados de sincronizacao
  duration: number;                               //......Duracao total
}

// ========================================
// Service de Lip Sync
// ========================================
export const lipSyncService = {
  // ========================================
  // Analisar Audio por URL
  // ========================================
  async analyzeLipSync(audioUrl: string): Promise<LipSyncCue[]> {
    try {
      console.log('[LipSyncService] Analisando audio:', audioUrl);

      // Fazer requisicao para API
      const response = await fetch(`${API_BASE_URL}/api/lipsync/analyze-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',      //......JSON
        },
        body: JSON.stringify({ audioUrl }),        //......Corpo da requisicao
      });

      // Verificar resposta
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao analisar lip sync');
      }

      // Parsear resultado
      const result: LipSyncResult = await response.json();

      if (!result.success) {
        throw new Error('Falha na analise de lip sync');
      }

      console.log(
        '[LipSyncService] Recebido',
        result.lipSyncData.length,
        'cues'
      );

      return result.lipSyncData;
    } catch (error) {
      console.error('[LipSyncService] Erro:', error);
      throw error;
    }
  },

  // ========================================
  // Analisar Audio por Arquivo
  // ========================================
  async analyzeLipSyncFile(audioUri: string): Promise<LipSyncCue[]> {
    try {
      console.log('[LipSyncService] Analisando arquivo:', audioUri);

      // Criar FormData
      const formData = new FormData();

      // Buscar arquivo
      const audioResponse = await fetch(audioUri);
      const audioBlob = await audioResponse.blob();

      // Adicionar ao FormData
      formData.append('audio', audioBlob, 'audio.mp3');

      // Fazer requisicao para API
      const response = await fetch(`${API_BASE_URL}/api/lipsync/analyze`, {
        method: 'POST',
        body: formData,
      });

      // Verificar resposta
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao analisar lip sync');
      }

      // Parsear resultado
      const result: LipSyncResult = await response.json();

      if (!result.success) {
        throw new Error('Falha na analise de lip sync');
      }

      console.log(
        '[LipSyncService] Recebido',
        result.lipSyncData.length,
        'cues'
      );

      return result.lipSyncData;
    } catch (error) {
      console.error('[LipSyncService] Erro:', error);
      throw error;
    }
  },

  // ========================================
  // Obter Viseme para Tempo Especifico
  // ========================================
  getVisemeAtTime(lipSyncData: LipSyncCue[], currentTime: number): string {
    // Buscar cue correspondente ao tempo atual
    const cue = lipSyncData.find(
      c => currentTime >= c.start && currentTime < c.end
    );

    // Retornar viseme ou 'rest' como padrao
    return cue ? cue.viseme : 'rest';
  },

  // ========================================
  // Verificar Saude do Servico
  // ========================================
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/lipsync/health`);
      const data = await response.json();
      return data.status === 'ok';
    } catch (error) {
      console.error('[LipSyncService] Health check falhou:', error);
      return false;
    }
  },
};

// ========================================
// Export Default
// ========================================
export default lipSyncService;
