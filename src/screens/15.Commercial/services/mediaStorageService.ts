// ========================================
// Servico de Armazenamento de Midia Local
// Faz download e salva midias permanentemente no IndexedDB
// Substitui URLs temporarias do WhatsApp por dados locais
// ========================================

// ========================================
// Constantes
// ========================================
const DB_NAME = 'PartnerMediaDB'; //.............. Nome do banco de midia
const DB_VERSION = 1; //.......................... Versao do schema
const STORE_MEDIA = 'media'; //................... Store de arquivos
const LOG_PREFIX = '[MediaStorage]'; //........... Prefixo dos logs

// ========================================
// Interface de Midia Armazenada
// ========================================
interface StoredMedia {
  id: string; //................................. ID unico (hash da URL original)
  originalUrl: string; //........................ URL original do WhatsApp
  localData: string; //.......................... Dados em base64 (data URI)
  mimeType: string; //........................... Tipo MIME do arquivo
  size: number; //............................... Tamanho em bytes
  createdAt: number; //.......................... Timestamp de criacao
  messageId?: string; //......................... ID da mensagem associada
  leadPhone?: string; //......................... Telefone do lead
}

// ========================================
// Classe MediaStorageService
// ========================================
class MediaStorageService {
  private db: IDBDatabase | null = null; //...... Instancia do banco
  private dbPromise: Promise<IDBDatabase> | null = null;
  private downloadQueue: Map<string, Promise<string | null>> = new Map();

  // ========================================
  // Inicializa conexao com IndexedDB
  // ========================================
  private async init(): Promise<IDBDatabase> {
    if (this.db) return this.db; //.............. Retorna se ja conectado
    if (this.dbPromise) return this.dbPromise; //. Retorna promise em andamento

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(STORE_MEDIA)) {
          const store = db.createObjectStore(STORE_MEDIA, { keyPath: 'id' });
          store.createIndex('originalUrl', 'originalUrl', { unique: true });
          store.createIndex('messageId', 'messageId', { unique: false });
          store.createIndex('leadPhone', 'leadPhone', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        console.log(`${LOG_PREFIX} Banco de midia inicializado`);
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error(`${LOG_PREFIX} Erro ao abrir banco:`, event);
        reject(new Error('Falha ao abrir MediaDB'));
      };
    });

    return this.dbPromise;
  }

  // ========================================
  // Gera ID unico a partir da URL
  // ========================================
  private generateId(url: string): string {
    let hash = 0; //.............................. Hash inicial
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i); //.......... Codigo do caractere
      hash = ((hash << 5) - hash) + char; //...... Algoritmo de hash
      hash = hash & hash; //...................... Converte para 32bit
    }
    return `media_${Math.abs(hash).toString(36)}`; // Retorna ID
  }

  // ========================================
  // Detecta tipo MIME a partir do conteudo
  // ========================================
  private detectMimeType(arrayBuffer: ArrayBuffer): string {
    const bytes = new Uint8Array(arrayBuffer.slice(0, 12));

    // JPEG: FF D8 FF
    if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
      return 'image/jpeg';
    }

    // PNG: 89 50 4E 47
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
      return 'image/png';
    }

    // GIF: 47 49 46
    if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
      return 'image/gif';
    }

    // WebP: 52 49 46 46 ... 57 45 42 50
    if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
      if (bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
        return 'image/webp';
      }
    }

    // MP4: ... 66 74 79 70 (ftyp)
    if (bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) {
      return 'video/mp4';
    }

    // WebM: 1A 45 DF A3
    if (bytes[0] === 0x1A && bytes[1] === 0x45 && bytes[2] === 0xDF && bytes[3] === 0xA3) {
      return 'video/webm';
    }

    // OGG: 4F 67 67 53
    if (bytes[0] === 0x4F && bytes[1] === 0x67 && bytes[2] === 0x67 && bytes[3] === 0x53) {
      return 'audio/ogg';
    }

    // MP3: FF FB ou ID3
    if ((bytes[0] === 0xFF && bytes[1] === 0xFB) ||
        (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33)) {
      return 'audio/mpeg';
    }

    return 'application/octet-stream'; //........ Tipo desconhecido
  }

  // ========================================
  // Converte ArrayBuffer para base64 data URI
  // ========================================
  private arrayBufferToDataUri(buffer: ArrayBuffer, mimeType: string): string {
    const bytes = new Uint8Array(buffer); //...... Converte para Uint8Array
    let binary = ''; //........................... String binaria

    // Processa em chunks para evitar stack overflow em arquivos grandes
    const chunkSize = 32768; //................... 32KB por chunk
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }

    const base64 = btoa(binary); //............... Converte para base64
    return `data:${mimeType};base64,${base64}`; //. Retorna data URI
  }

  // ========================================
  // Faz download de midia da URL
  // ========================================
  private async downloadMedia(url: string): Promise<{ data: string; mimeType: string; size: number } | null> {
    try {
      console.log(`${LOG_PREFIX} Baixando midia:`, url.substring(0, 60) + '...');

      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        cache: 'force-cache', //.................. Usa cache se disponivel
      });

      if (!response.ok) {
        console.error(`${LOG_PREFIX} Erro HTTP:`, response.status);
        return null;
      }

      const arrayBuffer = await response.arrayBuffer();
      const size = arrayBuffer.byteLength;

      // Detecta tipo MIME do conteudo real
      const mimeType = this.detectMimeType(arrayBuffer);
      console.log(`${LOG_PREFIX} Tipo detectado: ${mimeType}, Tamanho: ${(size / 1024).toFixed(1)}KB`);

      // Converte para data URI
      const data = this.arrayBufferToDataUri(arrayBuffer, mimeType);

      return { data, mimeType, size };
    } catch (error) {
      console.error(`${LOG_PREFIX} Erro ao baixar midia:`, error);
      return null;
    }
  }

  // ========================================
  // Busca midia do cache local
  // ========================================
  async getMedia(originalUrl: string): Promise<string | null> {
    try {
      const db = await this.init();
      const tx = db.transaction(STORE_MEDIA, 'readonly');
      const store = tx.objectStore(STORE_MEDIA);
      const index = store.index('originalUrl');

      return new Promise((resolve, reject) => {
        const request = index.get(originalUrl);

        request.onsuccess = () => {
          const result = request.result as StoredMedia | undefined;
          if (result) {
            console.log(`${LOG_PREFIX} Cache HIT:`, originalUrl.substring(0, 40));
            resolve(result.localData);
          } else {
            resolve(null);
          }
        };

        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error(`${LOG_PREFIX} Erro ao buscar do cache:`, error);
      return null;
    }
  }

  // ========================================
  // Salva midia no cache local
  // ========================================
  private async saveMediaPrivate(stored: StoredMedia): Promise<void> {
    try {
      const db = await this.init();
      const tx = db.transaction(STORE_MEDIA, 'readwrite');
      const store = tx.objectStore(STORE_MEDIA);

      store.put(stored);

      return new Promise((resolve, reject) => {
        tx.oncomplete = () => {
          console.log(`${LOG_PREFIX} Midia salva:`, stored.id);
          resolve();
        };
        tx.onerror = () => reject(tx.error);
      });
    } catch (error) {
      console.error(`${LOG_PREFIX} Erro ao salvar midia:`, error);
    }
  }

  // ========================================
  // Obtem midia local ou faz download
  // Retorna data URI permanente
  // ========================================
  async getOrDownload(
    originalUrl: string,
    messageId?: string,
    leadPhone?: string
  ): Promise<string | null> {
    // Ignora URLs que ja sao data URI
    if (originalUrl.startsWith('data:')) {
      return originalUrl;
    }

    // Ignora URLs vazias ou invalidas
    if (!originalUrl || !originalUrl.startsWith('http')) {
      return null;
    }

    // Verifica se ja esta em cache
    const cached = await this.getMedia(originalUrl);
    if (cached) {
      return cached;
    }

    // Evita downloads duplicados da mesma URL
    if (this.downloadQueue.has(originalUrl)) {
      console.log(`${LOG_PREFIX} Download ja em andamento:`, originalUrl.substring(0, 40));
      return this.downloadQueue.get(originalUrl)!;
    }

    // Inicia download
    const downloadPromise = (async () => {
      const result = await this.downloadMedia(originalUrl);

      if (result) {
        const stored: StoredMedia = {
          id: this.generateId(originalUrl),
          originalUrl,
          localData: result.data,
          mimeType: result.mimeType,
          size: result.size,
          createdAt: Date.now(),
          messageId,
          leadPhone,
        };

        await this.saveMediaPrivate(stored);
        return result.data;
      }

      return null;
    })();

    // Adiciona na fila
    this.downloadQueue.set(originalUrl, downloadPromise);

    try {
      const result = await downloadPromise;
      return result;
    } finally {
      // Remove da fila apos completar
      this.downloadQueue.delete(originalUrl);
    }
  }

  // ========================================
  // Processa mensagem e baixa midias
  // Retorna mensagem com URLs locais
  // ========================================
  async processMessageMedia(msg: any, leadPhone?: string): Promise<any> {
    if (!msg?.message) return msg;

    const messageId = msg.id || msg.key?.id;

    // Processa videoMessage
    if (msg.message.videoMessage?.url) {
      const localUrl = await this.getOrDownload(
        msg.message.videoMessage.url,
        messageId,
        leadPhone
      );
      if (localUrl) {
        msg.message.videoMessage.url = localUrl;
        msg.message.videoMessage._localCached = true;
      }
    }

    // Processa imageMessage
    if (msg.message.imageMessage?.url) {
      const localUrl = await this.getOrDownload(
        msg.message.imageMessage.url,
        messageId,
        leadPhone
      );
      if (localUrl) {
        msg.message.imageMessage.url = localUrl;
        msg.message.imageMessage._localCached = true;
      }
    }

    // Processa audioMessage
    if (msg.message.audioMessage?.url) {
      const localUrl = await this.getOrDownload(
        msg.message.audioMessage.url,
        messageId,
        leadPhone
      );
      if (localUrl) {
        msg.message.audioMessage.url = localUrl;
        msg.message.audioMessage._localCached = true;
      }
    }

    // Processa pttMessage (audio de voz)
    if (msg.message.pttMessage?.url) {
      const localUrl = await this.getOrDownload(
        msg.message.pttMessage.url,
        messageId,
        leadPhone
      );
      if (localUrl) {
        msg.message.pttMessage.url = localUrl;
        msg.message.pttMessage._localCached = true;
      }
    }

    return msg;
  }

  // ========================================
  // Limpa midias antigas (mais de X dias)
  // ========================================
  async cleanOldMedia(daysOld: number = 30): Promise<number> {
    try {
      const db = await this.init();
      const tx = db.transaction(STORE_MEDIA, 'readwrite');
      const store = tx.objectStore(STORE_MEDIA);
      const index = store.index('createdAt');

      const cutoff = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
      let deleted = 0;

      return new Promise((resolve, reject) => {
        const range = IDBKeyRange.upperBound(cutoff);
        const request = index.openCursor(range);

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            cursor.delete();
            deleted++;
            cursor.continue();
          } else {
            console.log(`${LOG_PREFIX} Limpeza: ${deleted} midias antigas removidas`);
            resolve(deleted);
          }
        };

        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error(`${LOG_PREFIX} Erro na limpeza:`, error);
      return 0;
    }
  }

  // ========================================
  // Retorna estatisticas do cache de midia
  // ========================================
  async getStats(): Promise<{ count: number; totalSize: number }> {
    try {
      const db = await this.init();
      const tx = db.transaction(STORE_MEDIA, 'readonly');
      const store = tx.objectStore(STORE_MEDIA);

      return new Promise((resolve, reject) => {
        const request = store.getAll();

        request.onsuccess = () => {
          const items = request.result as StoredMedia[];
          const count = items.length;
          const totalSize = items.reduce((sum, item) => sum + item.size, 0);
          resolve({ count, totalSize });
        };

        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error(`${LOG_PREFIX} Erro ao obter stats:`, error);
      return { count: 0, totalSize: 0 };
    }
  }

  // ========================================
  // Salva midia baixada de URL externa
  // Usa URL original como chave para cache
  // ========================================
  async saveMedia(
    originalUrl: string,
    dataUri: string,
    mimeType: string,
    messageId?: string,
    leadPhone?: string
  ): Promise<void> {
    const id = this.generateId(originalUrl); //...... Gera ID da URL original
    const size = Math.round((dataUri.length * 3) / 4);

    const stored: StoredMedia = {
      id,                               //.......... ID unico
      originalUrl,                      //.......... URL original
      localData: dataUri,               //.......... Data URI completa
      mimeType,                         //.......... Tipo MIME
      size,                             //.......... Tamanho em bytes
      createdAt: Date.now(),            //.......... Timestamp
      messageId,                        //.......... ID da mensagem
      leadPhone,                        //.......... Telefone do lead
    };

    await this.saveMediaPrivate(stored);
    console.log(`${LOG_PREFIX} Midia salva: ${id} (${(size / 1024).toFixed(1)}KB)`);
  }

  // ========================================
  // Salva midia diretamente (sem download)
  // Usado para midias enviadas pelo usuario
  // ========================================
  async saveDirectMedia(
    base64Data: string,
    mimeType: string,
    messageId: string,
    leadPhone?: string
  ): Promise<string> {
    // Cria data URI completa
    const dataUri = base64Data.startsWith('data:')
      ? base64Data
      : `data:${mimeType};base64,${base64Data}`;

    // Calcula tamanho aproximado
    const size = Math.round((base64Data.length * 3) / 4); //.......... Tamanho base64 para bytes

    // Usa messageId como chave unica
    const id = `sent_${messageId}`; //................................ ID unico para midias enviadas

    const stored: StoredMedia = {
      id,                             //.............................. ID unico
      originalUrl: id,                //.............................. URL original (usa ID)
      localData: dataUri,             //.............................. Data URI completa
      mimeType,                       //.............................. Tipo MIME
      size,                           //.............................. Tamanho em bytes
      createdAt: Date.now(),          //.............................. Timestamp
      messageId,                      //.............................. ID da mensagem
      leadPhone,                      //.............................. Telefone do lead
    };

    await this.saveMediaPrivate(stored);
    console.log(`${LOG_PREFIX} Midia enviada salva: ${id} (${(size / 1024).toFixed(1)}KB)`);

    return dataUri;
  }

  // ========================================
  // Limpa todo o cache de midia
  // ========================================
  async clearAll(): Promise<void> {
    try {
      const db = await this.init();
      const tx = db.transaction(STORE_MEDIA, 'readwrite');
      const store = tx.objectStore(STORE_MEDIA);
      store.clear();
      console.log(`${LOG_PREFIX} Cache de midia limpo`);
    } catch (error) {
      console.error(`${LOG_PREFIX} Erro ao limpar cache:`, error);
    }
  }
}

// ========================================
// Exporta instancia singleton
// ========================================
export const mediaStorageService = new MediaStorageService();

// ========================================
// Funcoes globais de debug (console)
// ========================================
if (typeof window !== 'undefined') {
  (window as any).getMediaStats = async () => {
    const stats = await mediaStorageService.getStats();
    console.log('[MediaStorage] Estatisticas:', {
      arquivos: stats.count,
      tamanhoTotal: `${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`,
    });
    return stats;
  };

  (window as any).clearMediaCache = async () => {
    await mediaStorageService.clearAll();
    return 'Cache de midia limpo!';
  };

  (window as any).cleanOldMedia = async (days: number = 30) => {
    const deleted = await mediaStorageService.cleanOldMedia(days);
    return `${deleted} midias antigas removidas`;
  };

  console.log('[MediaStorage] Funcoes de debug:');
  console.log('  - window.getMediaStats()     : Mostra estatisticas');
  console.log('  - window.clearMediaCache()   : Limpa todo o cache');
  console.log('  - window.cleanOldMedia(30)   : Remove midias com mais de 30 dias');
}
