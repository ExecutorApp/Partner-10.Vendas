// ========================================
// Servico de Sincronizacao Labial
// Processa audio com Rhubarb Lip Sync
// ========================================

import { exec } from 'child_process';            //......Executar comandos
import fs from 'fs';                              //......Sistema de arquivos
import path from 'path';                          //......Caminhos
import { promisify } from 'util';                 //......Promisify

// ========================================
// Promisify exec
// ========================================
const execAsync = promisify(exec);               //......Exec assincrono

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
export interface LipSyncResult {
  success: boolean;                               //......Sucesso
  lipSyncData: LipSyncCue[];                     //......Dados de sincronizacao
  duration: number;                               //......Duracao total
}

// ========================================
// Mapeamento Rhubarb -> Visemes
// ========================================
const VISEME_MAPPING: Record<string, string> = {
  'A': 'ai',                                      //......A, I aberto
  'B': 'mbp',                                     //......M, B, P fechado
  'C': 'e',                                       //......E
  'D': 'ai',                                      //......A, I alternativo
  'E': 'e',                                       //......E alternativo
  'F': 'fv',                                      //......F, V dentes
  'G': 'fv',                                      //......F, V alternativo
  'H': 'ltdn',                                    //......L, T, D, N lingua
  'X': 'rest',                                    //......Repouso neutro
};

// ========================================
// Servico de Lip Sync
// ========================================
export const lipSyncService = {
  // ========================================
  // Processar Audio
  // ========================================
  async processAudio(audioPath: string): Promise<LipSyncResult> {
    try {
      console.log('[LipSync] Processando audio:', audioPath);

      // Verificar se arquivo existe
      if (!fs.existsSync(audioPath)) {
        throw new Error('Arquivo de audio nao encontrado');
      }

      // Caminho do Rhubarb
      const rhubarbPath = process.env.RHUBARB_PATH || '/opt/rhubarb-lip-sync-1.13.0-linux/rhubarb';

      // Arquivo de saida
      const outputPath = audioPath.replace(/\.[^.]+$/, '.json');

      // Comando Rhubarb
      const command = `"${rhubarbPath}" -f json -o "${outputPath}" "${audioPath}"`;

      console.log('[LipSync] Executando Rhubarb...');

      // Executar comando
      await execAsync(command, { timeout: 60000 });

      // Verificar se arquivo de saida existe
      if (!fs.existsSync(outputPath)) {
        throw new Error('Rhubarb nao gerou arquivo de saida');
      }

      // Ler resultado
      const resultJson = fs.readFileSync(outputPath, 'utf8');
      const rhubarbResult = JSON.parse(resultJson);

      // Formatar dados
      const lipSyncData = this.formatRhubarbData(rhubarbResult);

      // Limpar arquivo temporario de saida
      fs.unlinkSync(outputPath);

      console.log('[LipSync] Sucesso!', lipSyncData.length, 'cues gerados');

      return {
        success: true,
        lipSyncData,
        duration: rhubarbResult.metadata?.duration || 0,
      };
    } catch (error) {
      console.error('[LipSync] Erro:', error);
      throw error;
    }
  },

  // ========================================
  // Formatar Dados do Rhubarb
  // ========================================
  formatRhubarbData(rhubarbResult: any): LipSyncCue[] {
    if (!rhubarbResult.mouthCues || !Array.isArray(rhubarbResult.mouthCues)) {
      return [];
    }

    return rhubarbResult.mouthCues.map((cue: any) => ({
      start: cue.start,                           //......Tempo inicio
      end: cue.end,                               //......Tempo fim
      viseme: this.mapViseme(cue.value),          //......Viseme mapeado
    }));
  },

  // ========================================
  // Mapear Viseme do Rhubarb
  // ========================================
  mapViseme(rhubarbViseme: string): string {
    return VISEME_MAPPING[rhubarbViseme] || 'rest';
  },
};

// ========================================
// Export Default
// ========================================
export default lipSyncService;
