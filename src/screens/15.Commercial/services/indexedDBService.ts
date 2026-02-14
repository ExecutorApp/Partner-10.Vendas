// Servico IndexedDB para cache local de mensagens e leads
// Permite carregamento instantaneo e sincronizacao em background

// ========================================
// Import do servico de midia
// ========================================
import { mediaStorageService } from './mediaStorageService';

// Tipos
// Interface para mensagens armazenadas no cache
interface CachedMessage {
  id: string; //.......................... ID unico da mensagem
  leadPhone: string; //................... Telefone do lead (chave de busca)
  type: string; //........................ Tipo: text, audio, image, video
  direction: 'incoming' | 'outgoing'; //.. Direcao da mensagem
  content: any; //....................... Conteudo da mensagem
  timestamp: number; //................... Timestamp Unix em ms
  status: string; //...................... Status: sent, delivered, read
  rawData: any; //....................... Dados originais da API
  syncedAt: number; //.................... Quando foi sincronizado
}

// Interface para leads armazenados no cache
interface CachedLead {
  id: string; //.......................... ID unico do lead
  phone: string; //....................... Telefone do lead
  name: string; //........................ Nome do lead
  profilePicUrl?: string; //.............. URL da foto de perfil
  lastMessageAt: number; //............... Timestamp da ultima mensagem
  unreadCount: number; //................. Contador de nao lidas
  rawData: any; //....................... Dados originais da API
  syncedAt: number; //.................... Quando foi sincronizado
}

// Interface para metadados de cache
interface CacheMetadata {
  key: string; //......................... Chave unica (ex: messages_5511999)
  lastFetchAt: number; //................. Ultima busca
  lastMessageId?: string; //.............. ID da ultima mensagem (para delta)
  lastTimestamp?: number; //.............. Timestamp da ultima mensagem
  count: number; //....................... Quantidade de itens
  version: number; //..................... Versao do schema
}

// Interface para fila de sincronizacao offline
interface SyncQueueItem {
  id: string; //.......................... ID unico do item
  type: 'send_message' | 'send_media' | 'send_reaction'; // Tipo de operacao
  payload: any; //....................... Dados da operacao
  status: 'pending' | 'synced' | 'failed'; // Status atual
  attempts: number; //.................... Tentativas realizadas
  createdAt: number; //................... Quando foi criado
  lastAttemptAt?: number; //.............. Ultima tentativa
}

// Constantes
const DB_NAME = 'PartnerCommercialDB'; //... Nome do banco
const DB_VERSION = 1; //....................... Versao do schema
const STORE_MESSAGES = 'messages'; //.......... Store de mensagens
const STORE_LEADS = 'leads'; //................ Store de leads
const STORE_METADATA = 'cacheMetadata'; //...... Store de metadados
const STORE_SYNC_QUEUE = 'syncQueue'; //........ Store de fila offline

// Cache TTL em milissegundos
const CACHE_TTL_MESSAGES = 5 * 60 * 1000; //... 5 minutos para mensagens
const CACHE_TTL_LEADS = 10 * 60 * 1000; //..... 10 minutos para leads

// ========================================
// Funcao auxiliar para converter Uint8Array/Buffer para base64
// IndexedDB nao serializa bem arrays de bytes
// ========================================
const convertThumbnailToBase64 = (thumbnail: any): string | undefined => {
  if (!thumbnail) return undefined; //.............................. Sem thumbnail
  if (typeof thumbnail === 'string') return thumbnail; //........... Ja e string

  try {
    // ArrayBuffer direto
    if (thumbnail instanceof ArrayBuffer) {
      const bytes = new Uint8Array(thumbnail); //................... Converte para Uint8Array
      let binary = ''; //........................................... String binaria
      bytes.forEach(b => binary += String.fromCharCode(b)); //...... Concatena bytes
      return btoa(binary); //....................................... Retorna base64
    }

    // Uint8Array ou Buffer
    if (thumbnail instanceof Uint8Array || ArrayBuffer.isView(thumbnail)) {
      // Extrai buffer e cria novo Uint8Array
      const view = thumbnail as ArrayBufferView; //................. Cast para ArrayBufferView
      const bytes = new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
      let binary = ''; //........................................... String binaria
      bytes.forEach(b => binary += String.fromCharCode(b)); //...... Concatena bytes
      return btoa(binary); //....................................... Retorna base64
    }

    // Objeto Buffer do Node.js com campo data
    if (typeof thumbnail === 'object' && thumbnail.data && Array.isArray(thumbnail.data)) {
      const bytes = new Uint8Array(thumbnail.data); //.............. Converte array para Uint8Array
      let binary = ''; //........................................... String binaria
      bytes.forEach(b => binary += String.fromCharCode(b)); //...... Concatena bytes
      return btoa(binary); //....................................... Retorna base64
    }

    // Objeto desconhecido - tenta serializar
    console.warn('[IndexedDB] Thumbnail desconhecido, tentando serializar:', typeof thumbnail);
    return undefined;
  } catch (error) {
    console.error('[IndexedDB] Erro ao converter thumbnail para base64:', error);
    return undefined;
  }
};

// ========================================
// Funcao para processar rawData antes de salvar
// Converte thumbnails binarios para base64
// ========================================
const processRawDataForCache = (msg: any): any => {
  if (!msg || !msg.message) return msg; //.......................... Sem message, retorna original

  // Log CRITICO: verificar se key existe antes de processar
  const hasKey = !!msg.key;
  const keyId = msg.key?.id;
  if (msg.message?.videoMessage || msg.message?.imageMessage) {
    console.log('[IndexedDB] processRawDataForCache - MIDIA detectada:');
    console.log('[IndexedDB]   - msg.key existe:', hasKey);
    console.log('[IndexedDB]   - msg.key.id:', keyId);
    console.log('[IndexedDB]   - msg.key.remoteJid:', msg.key?.remoteJid);
  }

  // Cria copia profunda para nao alterar original
  const processed = JSON.parse(JSON.stringify(msg)); //............. Copia profunda

  // Verifica se key foi preservado na copia
  if (hasKey && !processed.key) {
    console.error('[IndexedDB] ERRO CRITICO: key foi perdido no JSON.stringify!');
  }

  // Processar videoMessage - verifica no ORIGINAL (binarios perdem-se no stringify)
  if (msg.message?.videoMessage?.jpegThumbnail) {
    const original = msg.message.videoMessage.jpegThumbnail; //...... Original (pode ser binario)
    const base64 = convertThumbnailToBase64(original); //............ Converte para base64
    if (base64) {
      if (!processed.message) processed.message = {}; //............. Garante estrutura
      if (!processed.message.videoMessage) processed.message.videoMessage = {};
      processed.message.videoMessage.jpegThumbnail = base64; //...... Salva como string
    }
  }

  // Processar imageMessage - verifica no ORIGINAL
  if (msg.message?.imageMessage?.jpegThumbnail) {
    const original = msg.message.imageMessage.jpegThumbnail; //...... Original
    const base64 = convertThumbnailToBase64(original); //............ Converte
    if (base64) {
      if (!processed.message) processed.message = {}; //............. Garante estrutura
      if (!processed.message.imageMessage) processed.message.imageMessage = {};
      processed.message.imageMessage.jpegThumbnail = base64; //...... Salva
    }
  }

  // Processar extendedTextMessage (link preview) - verifica no ORIGINAL
  if (msg.message?.extendedTextMessage?.jpegThumbnail) {
    const original = msg.message.extendedTextMessage.jpegThumbnail;
    const base64 = convertThumbnailToBase64(original);
    if (base64) {
      if (!processed.message) processed.message = {}; //............. Garante estrutura
      if (!processed.message.extendedTextMessage) processed.message.extendedTextMessage = {};
      processed.message.extendedTextMessage.jpegThumbnail = base64;
    }
  }

  return processed;
};

// Classe IndexedDBService
// Gerencia todas as operacoes de cache local
class IndexedDBService {
  private db: IDBDatabase | null = null; //.... Instancia do banco
  private dbPromise: Promise<IDBDatabase> | null = null; // Promise de conexao

  // Inicializa conexao com IndexedDB (publico para acesso externo)
  // Cria stores e indices se nao existirem
  public async init(): Promise<IDBDatabase> {
    if (this.db) return this.db; //............ Retorna se ja conectado
    if (this.dbPromise) return this.dbPromise; // Retorna promise em andamento

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION); //... Abre banco

      // Upgrade do banco (cria stores)
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result; //... Referencia

        // Store de mensagens
        if (!db.objectStoreNames.contains(STORE_MESSAGES)) {
          const messagesStore = db.createObjectStore(STORE_MESSAGES, { keyPath: 'id' });
          messagesStore.createIndex('leadPhone', 'leadPhone', { unique: false }); //........... Indice por telefone
          messagesStore.createIndex('timestamp', 'timestamp', { unique: false }); //........... Indice por data
          messagesStore.createIndex('leadPhone_timestamp', ['leadPhone', 'timestamp'], { unique: false }); // Indice composto
        }

        // Store de leads
        if (!db.objectStoreNames.contains(STORE_LEADS)) {
          const leadsStore = db.createObjectStore(STORE_LEADS, { keyPath: 'id' });
          leadsStore.createIndex('phone', 'phone', { unique: true }); //.............. Indice por telefone
          leadsStore.createIndex('lastMessageAt', 'lastMessageAt', { unique: false }); // Indice por ultima msg
        }

        // Store de metadados
        if (!db.objectStoreNames.contains(STORE_METADATA)) {
          db.createObjectStore(STORE_METADATA, { keyPath: 'key' }); //... Chave unica
        }

        // Store de fila offline
        if (!db.objectStoreNames.contains(STORE_SYNC_QUEUE)) {
          const syncStore = db.createObjectStore(STORE_SYNC_QUEUE, { keyPath: 'id' });
          syncStore.createIndex('status', 'status', { unique: false }); //... Indice por status
          syncStore.createIndex('createdAt', 'createdAt', { unique: false }); // Indice por data
        }
      };

      // Sucesso na conexao
      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result; //... Salva referencia
        resolve(this.db); //....................................... Resolve promise
      };

      // Erro na conexao
      request.onerror = (event) => {
        console.error('[IndexedDB] Erro ao abrir banco:', event); //... Log de erro
        reject(new Error('Falha ao abrir IndexedDB')); //.............. Rejeita promise
      };
    });

    return this.dbPromise; //... Retorna promise
  }

  // ==================== MENSAGENS ====================

  // Salva lista de mensagens no cache
  // Usado apos buscar da API
  async saveMessages(leadPhone: string, messages: any[]): Promise<void> {
    const db = await this.init(); //............................ Garante conexao
    const tx = db.transaction(STORE_MESSAGES, 'readwrite'); //.. Transacao
    const store = tx.objectStore(STORE_MESSAGES); //............ Store

    const now = Date.now(); //... Timestamp atual

    // Salva cada mensagem
    for (const msg of messages) {
      // Processa rawData para converter thumbnails binarios para base64
      const processedRawData = processRawDataForCache(msg); //.............. Processa thumbnails

      const cached: CachedMessage = {
        id: msg.key?.id || msg.id || `${leadPhone}_${msg.timestamp}`, //... ID unico (key.id tem prioridade)
        leadPhone: leadPhone, //............................................ Telefone
        type: msg.type || 'text', //........................................ Tipo
        direction: msg.fromMe ? 'outgoing' : 'incoming', //................. Direcao
        content: msg.content || msg.message, //............................. Conteudo
        timestamp: msg.timestamp || Date.now(), //.......................... Timestamp
        status: msg.status || 'sent', //.................................... Status
        rawData: processedRawData, //....................................... Dados processados
        syncedAt: now, //................................................... Sincronizado agora
      };
      store.put(cached); //... Upsert
    }

    // Atualiza metadados
    await this.updateMetadata(leadPhone, messages); //... Atualiza cache info

    // Atualiza cache rapido (localStorage) para proxima abertura
    this.saveFastCache(leadPhone, messages);

    // Download de midias em background (nao bloqueia)
    this.downloadMediaInBackground(leadPhone, messages);

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(); //... Sucesso
      tx.onerror = () => reject(tx.error); // Erro
    });
  }

  // ==================== DOWNLOAD DE MIDIA EM BACKGROUND ====================

  // Processa download de midias em background
  // Nao bloqueia o salvamento das mensagens
  private async downloadMediaInBackground(leadPhone: string, messages: any[]): Promise<void> {
    // Filtra apenas mensagens com midia
    const mediaMessages = messages.filter(msg => {
      const m = msg.message;
      return m?.videoMessage?.url || m?.imageMessage?.url || m?.audioMessage?.url || m?.pttMessage?.url;
    });

    if (mediaMessages.length === 0) return; //...... Sem midias para baixar

    console.log(`[IndexedDB] Iniciando download de ${mediaMessages.length} midias em background...`);

    // Processa cada midia em paralelo (maximo 3 por vez)
    const processInBatches = async (items: any[], batchSize: number) => {
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        await Promise.all(batch.map(msg => this.downloadAndUpdateMessage(leadPhone, msg)));
      }
    };

    try {
      await processInBatches(mediaMessages, 3); //... 3 downloads simultaneos
      console.log(`[IndexedDB] Download de midias concluido`);
    } catch (error) {
      console.error(`[IndexedDB] Erro no download de midias:`, error);
    }
  }

  // Baixa midia e atualiza mensagem no cache
  private async downloadAndUpdateMessage(leadPhone: string, msg: any): Promise<void> {
    try {
      const messageId = msg.id || msg.key?.id;
      const processed = await mediaStorageService.processMessageMedia(msg, leadPhone);

      // Se a midia foi baixada, atualiza no cache
      const hasLocalMedia = processed.message?.videoMessage?._localCached ||
                            processed.message?.imageMessage?._localCached ||
                            processed.message?.audioMessage?._localCached ||
                            processed.message?.pttMessage?._localCached;

      if (hasLocalMedia) {
        // Processa thumbnails tambem
        const processedRawData = processRawDataForCache(processed);

        // Atualiza no IndexedDB
        const db = await this.init();
        const tx = db.transaction(STORE_MESSAGES, 'readwrite');
        const store = tx.objectStore(STORE_MESSAGES);

        const cached: CachedMessage = {
          id: messageId || `${leadPhone}_${msg.messageTimestamp}`,
          leadPhone: leadPhone,
          type: msg.type || 'text',
          direction: msg.fromMe ? 'outgoing' : 'incoming',
          content: msg.content || msg.message,
          timestamp: msg.messageTimestamp || Date.now(),
          status: msg.status || 'sent',
          rawData: processedRawData, //............ Dados com URL local
          syncedAt: Date.now(),
        };

        store.put(cached);
        console.log(`[IndexedDB] Midia salva localmente: ${messageId}`);
      }
    } catch (error) {
      console.error(`[IndexedDB] Erro ao baixar midia:`, error);
    }
  }

  // ==================== CACHE RAPIDO (localStorage) ====================
  // localStorage e sincrono e muito mais rapido que IndexedDB
  // Armazena ultimas 50 mensagens por lead COM thumbnails completos

  private readonly FAST_CACHE_PREFIX = 'msg_fast_';
  private readonly FAST_CACHE_LIMIT = 50;
  private readonly FAST_CACHE_VERSION = 7; //.... Versao do cache (v7: remove fallback 320x240 dimensoes)

  // Construtor - limpa caches antigos na inicializacao
  constructor() {
    this.migrateOldCaches(); //.................. Migra caches sem versao
  }

  // Migra caches antigos (sem versao) para novo formato
  private migrateOldCaches(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.FAST_CACHE_PREFIX)) {
          const cached = localStorage.getItem(key);
          if (cached) {
            const parsed = JSON.parse(cached);
            // Se nao tem versao ou versao antiga, remove
            if (!parsed.v || parsed.v < this.FAST_CACHE_VERSION) {
              keysToRemove.push(key);
            }
          }
        }
      }
      // Remove caches antigos
      keysToRemove.forEach(k => localStorage.removeItem(k));
      if (keysToRemove.length > 0) {
        console.log(`[IndexedDB] Migrados ${keysToRemove.length} caches antigos para v${this.FAST_CACHE_VERSION}`);
      }
    } catch (e) {
      console.error('[IndexedDB] Erro ao migrar caches:', e);
    }
  }

  // Salva mensagens no cache rapido (localStorage)
  // IMPORTANTE: Manter thumbnails para exibicao instantanea de imagens/videos
  private saveFastCache(leadPhone: string, messages: any[]): void {
    try {
      const key = this.FAST_CACHE_PREFIX + leadPhone;
      // Pegar apenas as ultimas N mensagens (com thumbnails completos)
      const recentMessages = messages.slice(-this.FAST_CACHE_LIMIT);
      localStorage.setItem(key, JSON.stringify({
        v: this.FAST_CACHE_VERSION, //........... Versao do cache
        ts: Date.now(),
        data: recentMessages
      }));
    } catch (e) {
      // localStorage cheio - tentar com menos mensagens
      try {
        const key = this.FAST_CACHE_PREFIX + leadPhone;
        const reducedMessages = messages.slice(-20); //.... Reduz para 20 msgs
        localStorage.setItem(key, JSON.stringify({
          v: this.FAST_CACHE_VERSION,
          ts: Date.now(),
          data: reducedMessages
        }));
      } catch (e2) {
        // Ainda cheio - limpar caches antigos
        this.cleanOldFastCaches();
      }
    }
  }

  // Busca mensagens do cache rapido (instantaneo)
  private getFastCache(leadPhone: string): any[] | null {
    try {
      const key = this.FAST_CACHE_PREFIX + leadPhone;
      const cached = localStorage.getItem(key);
      if (!cached) return null;
      const parsed = JSON.parse(cached);
      // Verifica versao do cache (invalida caches antigos sem thumbnails)
      if (!parsed.v || parsed.v < this.FAST_CACHE_VERSION) {
        localStorage.removeItem(key); //.......... Remove cache antigo
        return null;
      }
      // Cache valido por 5 minutos
      if (Date.now() - parsed.ts > 5 * 60 * 1000) return null;
      return parsed.data;
    } catch {
      return null;
    }
  }

  // Limpa caches antigos quando localStorage enche
  private cleanOldFastCaches(): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.FAST_CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    // Remove metade dos caches (os mais antigos)
    keysToRemove.slice(0, Math.floor(keysToRemove.length / 2)).forEach(k => {
      localStorage.removeItem(k);
    });
  }

  // Busca mensagens do cache por telefone
  // OTIMIZADO: Tenta localStorage primeiro (instantaneo), depois IndexedDB
  async getMessages(leadPhone: string, limit: number = 100): Promise<any[]> {
    const perfStart = (window as any).__PERF_KANBAN_START || Date.now();
    console.log(`[PERF] IndexedDB.getMessages Start: ${Date.now() - perfStart}ms`);

    // FAST PATH: Tentar localStorage primeiro (sincrono, instantaneo)
    const fastCache = this.getFastCache(leadPhone);
    if (fastCache && fastCache.length > 0) {
      console.log(`[PERF] localStorage FAST HIT: ${Date.now() - perfStart}ms (${fastCache.length} msgs)`);
      // DEBUG: Log tipos de mensagens no cache
      const tipos = fastCache.reduce((acc: any, m: any) => {
        const tipo = m?.message?.videoMessage ? 'video' :
                     m?.message?.imageMessage ? 'image' :
                     m?.message?.audioMessage || m?.message?.pttMessage ? 'audio' :
                     m?.message?.conversation || m?.message?.extendedTextMessage ? 'text' : 'outro';
        acc[tipo] = (acc[tipo] || 0) + 1;
        return acc;
      }, {});
      console.log(`[DEBUG] Cache tipos:`, tipos);
      // Atualiza IndexedDB em background (nao bloqueia)
      this.getMessagesFromIndexedDB(leadPhone, limit).then(msgs => {
        if (msgs.length > 0) {
          this.saveFastCache(leadPhone, msgs);
        }
      });
      return fastCache;
    }

    // SLOW PATH: Buscar do IndexedDB
    console.log(`[PERF] localStorage MISS, buscando IndexedDB...`);
    const messages = await this.getMessagesFromIndexedDB(leadPhone, limit);

    // Salvar no cache rapido para proxima vez
    if (messages.length > 0) {
      this.saveFastCache(leadPhone, messages);
    }

    return messages;
  }

  // Busca mensagens do IndexedDB (lento, mas completo)
  private async getMessagesFromIndexedDB(leadPhone: string, limit: number): Promise<any[]> {
    const perfStart = (window as any).__PERF_KANBAN_START || Date.now();

    const initStart = performance.now();
    const db = await this.init();
    console.log(`[PERF] IndexedDB.init: ${Math.round(performance.now() - initStart)}ms`);

    const tx = db.transaction(STORE_MESSAGES, 'readonly');
    const store = tx.objectStore(STORE_MESSAGES);
    const index = store.index('leadPhone_timestamp');

    return new Promise((resolve, reject) => {
      const queryStart = performance.now();
      const messages: any[] = [];

      const range = IDBKeyRange.bound(
        [leadPhone, 0],
        [leadPhone, Date.now() + 86400000]
      );

      const cursorRequest = index.openCursor(range, 'prev');

      cursorRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;

        if (cursor && messages.length < limit) {
          messages.push(cursor.value);
          cursor.continue();
        } else {
          console.log(`[PERF] IndexedDB.cursor: ${Math.round(performance.now() - queryStart)}ms (${messages.length} msgs)`);
          messages.reverse();
          const rawMessages = messages.map(m => m.rawData);

          this.reprocessExternalMediaInBackground(leadPhone, rawMessages);

          resolve(rawMessages);
        }
      };

      cursorRequest.onerror = () => reject(cursorRequest.error);
    });
  }

  // ==================== REPROCESSAMENTO DE MIDIA ====================

  // Verifica mensagens com URLs externas e baixa novamente
  // Executado em background para nao bloquear carregamento
  private async reprocessExternalMediaInBackground(leadPhone: string, messages: any[]): Promise<void> {
    // Filtra mensagens com midia que tem URL externa (nao local)
    const mediaWithExternalUrl = messages.filter(msg => {
      const m = msg?.message;
      if (!m) return false;

      // Verifica cada tipo de midia
      const videoUrl = m.videoMessage?.url;
      const imageUrl = m.imageMessage?.url;
      const audioUrl = m.audioMessage?.url || m.pttMessage?.url;

      // URL externa = comeca com http e nao e data:
      const hasExternalVideo = videoUrl && videoUrl.startsWith('http');
      const hasExternalImage = imageUrl && imageUrl.startsWith('http');
      const hasExternalAudio = audioUrl && audioUrl.startsWith('http');

      return hasExternalVideo || hasExternalImage || hasExternalAudio;
    });

    if (mediaWithExternalUrl.length === 0) return; //.... Sem midias externas

    console.log(`[IndexedDB] Encontradas ${mediaWithExternalUrl.length} midias com URLs externas, reprocessando...`);

    // Processa em batches de 3
    const processInBatches = async (items: any[], batchSize: number) => {
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        await Promise.all(batch.map(msg => this.downloadAndUpdateMessage(leadPhone, msg)));
      }
    };

    try {
      await processInBatches(mediaWithExternalUrl, 3);
      console.log(`[IndexedDB] Reprocessamento de midias concluido`);
    } catch (error) {
      console.error(`[IndexedDB] Erro no reprocessamento:`, error);
    }
  }

  // Busca mensagens mais recentes que timestamp
  // Usado para delta sync
  async getMessagesSince(leadPhone: string, sinceTimestamp: number): Promise<any[]> {
    const db = await this.init(); //.............................. Garante conexao
    const tx = db.transaction(STORE_MESSAGES, 'readonly'); //.... Transacao
    const store = tx.objectStore(STORE_MESSAGES); //.............. Store
    const index = store.index('leadPhone_timestamp'); //.......... Indice composto

    return new Promise((resolve, reject) => {
      const range = IDBKeyRange.bound(
        [leadPhone, sinceTimestamp], //... Inicio: telefone + timestamp
        [leadPhone, Infinity], //......... Fim: telefone + infinito
        true, //.......................... Exclui inicio
        false //.......................... Inclui fim
      );

      const request = index.getAll(range); //... Busca no range

      request.onsuccess = () => {
        const messages = request.result || []; //... Resultado
        resolve(messages.map(m => m.rawData)); //... Retorna dados originais
      };

      request.onerror = () => reject(request.error); //... Erro
    });
  }

  // Conta mensagens de um lead
  async countMessages(leadPhone: string): Promise<number> {
    const db = await this.init(); //............................ Garante conexao
    const tx = db.transaction(STORE_MESSAGES, 'readonly'); //... Transacao
    const store = tx.objectStore(STORE_MESSAGES); //............ Store
    const index = store.index('leadPhone'); //.................. Indice

    return new Promise((resolve, reject) => {
      const request = index.count(leadPhone); //... Conta

      request.onsuccess = () => resolve(request.result); //... Resultado
      request.onerror = () => reject(request.error); //....... Erro
    });
  }

  // Limpa mensagens antigas (mais de 30 dias)
  async cleanOldMessages(daysOld: number = 30): Promise<number> {
    const db = await this.init(); //............................ Garante conexao
    const tx = db.transaction(STORE_MESSAGES, 'readwrite'); //.. Transacao
    const store = tx.objectStore(STORE_MESSAGES); //............ Store
    const index = store.index('timestamp'); //.................. Indice

    const cutoff = Date.now() - (daysOld * 24 * 60 * 60 * 1000); //... Limite
    let deleted = 0; //............................................... Contador

    return new Promise((resolve, reject) => {
      const range = IDBKeyRange.upperBound(cutoff); //... Range: antes do limite
      const request = index.openCursor(range); //........ Cursor

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result; //... Cursor atual

        if (cursor) {
          cursor.delete(); //......... Deleta registro
          deleted++; //............... Incrementa contador
          cursor.continue(); //....... Proximo
        } else {
          resolve(deleted); //........ Fim - retorna quantidade deletada
        }
      };

      request.onerror = () => reject(request.error); //... Erro
    });
  }

  // ==================== LEADS ====================

  // Salva lista de leads no cache
  async saveLeads(leads: any[]): Promise<void> {
    const db = await this.init(); //........................ Garante conexao
    const tx = db.transaction(STORE_LEADS, 'readwrite'); //. Transacao
    const store = tx.objectStore(STORE_LEADS); //........... Store

    const now = Date.now(); //... Timestamp atual

    // Salva cada lead
    for (const lead of leads) {
      const phone = lead.id?.replace('@s.whatsapp.net', '') || lead.phone || ''; //... Extrai telefone

      const cached: CachedLead = {
        id: lead.id || phone, //.................................... ID unico
        phone: phone, //............................................ Telefone
        name: lead.name || lead.pushName || phone, //............... Nome
        profilePicUrl: lead.profilePicUrl, //....................... Foto
        lastMessageAt: lead.lastMsgTimestamp || lead.lastMessageAt || 0, // Ultima msg
        unreadCount: lead.unreadCount || 0, //...................... Nao lidas
        rawData: lead, //........................................... Dados originais
        syncedAt: now, //........................................... Sincronizado agora
      };
      store.put(cached); //... Upsert
    }

    // Atualiza metadados de leads
    await this.updateLeadsMetadata(leads.length); //... Atualiza cache info

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(); //... Sucesso
      tx.onerror = () => reject(tx.error); // Erro
    });
  }

  // Busca todos os leads do cache
  // Retorna ordenado por ultima mensagem
  async getLeads(): Promise<any[]> {
    const db = await this.init(); //.......................... Garante conexao
    const tx = db.transaction(STORE_LEADS, 'readonly'); //... Transacao
    const store = tx.objectStore(STORE_LEADS); //............ Store

    return new Promise((resolve, reject) => {
      const request = store.getAll(); //... Busca todos

      request.onsuccess = () => {
        const leads = request.result || []; //..................... Resultado
        leads.sort((a, b) => b.lastMessageAt - a.lastMessageAt); // Ordena por ultima msg (desc)
        resolve(leads.map(l => l.rawData)); //..................... Retorna dados originais
      };

      request.onerror = () => reject(request.error); //... Erro
    });
  }

  // Busca lead por telefone
  async getLeadByPhone(phone: string): Promise<any | null> {
    const db = await this.init(); //.......................... Garante conexao
    const tx = db.transaction(STORE_LEADS, 'readonly'); //... Transacao
    const store = tx.objectStore(STORE_LEADS); //............ Store
    const index = store.index('phone'); //................... Indice

    return new Promise((resolve, reject) => {
      const request = index.get(phone); //... Busca por telefone

      request.onsuccess = () => {
        const lead = request.result; //.............. Resultado
        resolve(lead ? lead.rawData : null); //...... Retorna dados originais ou null
      };

      request.onerror = () => reject(request.error); //... Erro
    });
  }

  // Conta leads no cache
  async countLeads(): Promise<number> {
    const db = await this.init(); //.......................... Garante conexao
    const tx = db.transaction(STORE_LEADS, 'readonly'); //... Transacao
    const store = tx.objectStore(STORE_LEADS); //............ Store

    return new Promise((resolve, reject) => {
      const request = store.count(); //... Conta

      request.onsuccess = () => resolve(request.result); //... Resultado
      request.onerror = () => reject(request.error); //....... Erro
    });
  }

  // ==================== METADADOS ====================

  // Atualiza metadados de cache de mensagens
  private async updateMetadata(leadPhone: string, messages: any[]): Promise<void> {
    const db = await this.init(); //............................ Garante conexao
    const tx = db.transaction(STORE_METADATA, 'readwrite'); //.. Transacao
    const store = tx.objectStore(STORE_METADATA); //............ Store

    const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null; //... Ultima msg

    const metadata: CacheMetadata = {
      key: `messages_${leadPhone}`, //.......................... Chave unica
      lastFetchAt: Date.now(), //............................... Agora
      lastMessageId: lastMsg?.id || lastMsg?.key?.id, //........ ID ultima msg
      lastTimestamp: lastMsg?.timestamp || Date.now(), //....... Timestamp ultima msg
      count: messages.length, //................................ Quantidade
      version: DB_VERSION, //................................... Versao
    };

    store.put(metadata); //... Upsert
  }

  // Atualiza metadados de cache de leads
  private async updateLeadsMetadata(count: number): Promise<void> {
    const db = await this.init(); //............................ Garante conexao
    const tx = db.transaction(STORE_METADATA, 'readwrite'); //.. Transacao
    const store = tx.objectStore(STORE_METADATA); //............ Store

    const metadata: CacheMetadata = {
      key: 'leads_all', //............ Chave unica
      lastFetchAt: Date.now(), //..... Agora
      count: count, //................ Quantidade
      version: DB_VERSION, //......... Versao
    };

    store.put(metadata); //... Upsert
  }

  // Busca metadados de cache
  async getMetadata(key: string): Promise<CacheMetadata | null> {
    const db = await this.init(); //.............................. Garante conexao
    const tx = db.transaction(STORE_METADATA, 'readonly'); //.... Transacao
    const store = tx.objectStore(STORE_METADATA); //.............. Store

    return new Promise((resolve, reject) => {
      const request = store.get(key); //... Busca por chave

      request.onsuccess = () => resolve(request.result || null); //... Resultado
      request.onerror = () => reject(request.error); //............... Erro
    });
  }

  // Verifica se cache de mensagens esta valido
  async isMessagesCacheValid(leadPhone: string): Promise<boolean> {
    const metadata = await this.getMetadata(`messages_${leadPhone}`); //... Busca metadados

    if (!metadata) return false; //......................................... Sem cache

    const age = Date.now() - metadata.lastFetchAt; //... Idade do cache
    return age < CACHE_TTL_MESSAGES; //................. Valido se menor que TTL
  }

  // Verifica se cache de leads esta valido
  async isLeadsCacheValid(): Promise<boolean> {
    const metadata = await this.getMetadata('leads_all'); //... Busca metadados

    if (!metadata) return false; //............................ Sem cache

    const age = Date.now() - metadata.lastFetchAt; //... Idade do cache
    return age < CACHE_TTL_LEADS; //.................... Valido se menor que TTL
  }

  // Busca timestamp da ultima mensagem em cache
  async getLastMessageTimestamp(leadPhone: string): Promise<number | null> {
    const metadata = await this.getMetadata(`messages_${leadPhone}`); //... Busca metadados
    return metadata?.lastTimestamp || null; //............................ Retorna timestamp ou null
  }

  // ==================== FILA OFFLINE ====================

  // Adiciona item na fila de sincronizacao
  async addToSyncQueue(type: SyncQueueItem['type'], payload: any): Promise<string> {
    const db = await this.init(); //.............................. Garante conexao
    const tx = db.transaction(STORE_SYNC_QUEUE, 'readwrite'); //.. Transacao
    const store = tx.objectStore(STORE_SYNC_QUEUE); //............ Store

    const id = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`; //... ID unico

    const item: SyncQueueItem = {
      id: id, //....................... ID
      type: type, //................... Tipo
      payload: payload, //............. Dados
      status: 'pending', //............ Pendente
      attempts: 0, //.................. Zero tentativas
      createdAt: Date.now(), //........ Agora
    };

    store.add(item); //... Adiciona

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(id); //... Retorna ID
      tx.onerror = () => reject(tx.error); //. Erro
    });
  }

  // Busca itens pendentes da fila
  async getPendingSyncItems(): Promise<SyncQueueItem[]> {
    const db = await this.init(); //.............................. Garante conexao
    const tx = db.transaction(STORE_SYNC_QUEUE, 'readonly'); //... Transacao
    const store = tx.objectStore(STORE_SYNC_QUEUE); //............ Store
    const index = store.index('status'); //...................... Indice

    return new Promise((resolve, reject) => {
      const request = index.getAll('pending'); //... Busca pendentes

      request.onsuccess = () => resolve(request.result || []); //... Resultado
      request.onerror = () => reject(request.error); //............. Erro
    });
  }

  // Marca item como sincronizado
  async markSynced(id: string): Promise<void> {
    const db = await this.init(); //.............................. Garante conexao
    const tx = db.transaction(STORE_SYNC_QUEUE, 'readwrite'); //.. Transacao
    const store = tx.objectStore(STORE_SYNC_QUEUE); //............ Store

    return new Promise((resolve, reject) => {
      const request = store.get(id); //... Busca item

      request.onsuccess = () => {
        const item = request.result; //... Item
        if (item) {
          item.status = 'synced'; //........... Marca como sincronizado
          item.lastAttemptAt = Date.now(); //.. Atualiza timestamp
          store.put(item); //.................. Salva
        }
        resolve();
      };

      request.onerror = () => reject(request.error); //... Erro
    });
  }

  // Marca item como falha
  async markFailed(id: string): Promise<void> {
    const db = await this.init(); //.............................. Garante conexao
    const tx = db.transaction(STORE_SYNC_QUEUE, 'readwrite'); //.. Transacao
    const store = tx.objectStore(STORE_SYNC_QUEUE); //............ Store

    return new Promise((resolve, reject) => {
      const request = store.get(id); //... Busca item

      request.onsuccess = () => {
        const item = request.result; //... Item
        if (item) {
          item.attempts++; //........................... Incrementa tentativas
          item.lastAttemptAt = Date.now(); //........... Atualiza timestamp
          if (item.attempts >= 3) {
            item.status = 'failed'; //... Marca como falha apos 3 tentativas
          }
          store.put(item); //............ Salva
        }
        resolve();
      };

      request.onerror = () => reject(request.error); //... Erro
    });
  }

  // Limpa itens sincronizados antigos
  async cleanSyncedItems(): Promise<void> {
    const db = await this.init(); //.............................. Garante conexao
    const tx = db.transaction(STORE_SYNC_QUEUE, 'readwrite'); //.. Transacao
    const store = tx.objectStore(STORE_SYNC_QUEUE); //............ Store
    const index = store.index('status'); //...................... Indice

    return new Promise((resolve, reject) => {
      const request = index.openCursor('synced'); //... Cursor em sincronizados

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result; //... Cursor

        if (cursor) {
          cursor.delete(); //......... Deleta
          cursor.continue(); //....... Proximo
        } else {
          resolve(); //............... Fim
        }
      };

      request.onerror = () => reject(request.error); //... Erro
    });
  }

  // ==================== UTILIDADES ====================

  // Limpa todo o cache (reset)
  async clearAll(): Promise<void> {
    const db = await this.init(); //... Garante conexao

    const stores = [STORE_MESSAGES, STORE_LEADS, STORE_METADATA, STORE_SYNC_QUEUE]; //... Stores

    for (const storeName of stores) {
      const tx = db.transaction(storeName, 'readwrite'); //... Transacao
      const store = tx.objectStore(storeName); //............. Store
      store.clear(); //....................................... Limpa
    }
  }

  // Limpa cache de um lead especifico
  async clearLeadCache(leadPhone: string): Promise<void> {
    const db = await this.init(); //............................ Garante conexao
    const tx = db.transaction(STORE_MESSAGES, 'readwrite'); //.. Transacao
    const store = tx.objectStore(STORE_MESSAGES); //............ Store
    const index = store.index('leadPhone'); //.................. Indice

    return new Promise((resolve, reject) => {
      const request = index.openCursor(leadPhone); //... Cursor

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result; //... Cursor

        if (cursor) {
          cursor.delete(); //......... Deleta
          cursor.continue(); //....... Proximo
        } else {
          resolve(); //............... Fim
        }
      };

      request.onerror = () => reject(request.error); //... Erro
    });
  }

  // Retorna estatisticas do cache
  async getStats(): Promise<{ messages: number; leads: number; syncQueue: number }> {
    const [messages, leads, syncQueue] = await Promise.all([
      this.countMessagesTotal(), //... Total de mensagens
      this.countLeads(), //........... Total de leads
      this.countSyncQueue(), //....... Total na fila
    ]);

    return { messages, leads, syncQueue };
  }

  // Conta total de mensagens
  private async countMessagesTotal(): Promise<number> {
    const db = await this.init(); //............................ Garante conexao
    const tx = db.transaction(STORE_MESSAGES, 'readonly'); //... Transacao
    const store = tx.objectStore(STORE_MESSAGES); //............ Store

    return new Promise((resolve, reject) => {
      const request = store.count(); //... Conta

      request.onsuccess = () => resolve(request.result); //... Resultado
      request.onerror = () => reject(request.error); //....... Erro
    });
  }

  // Conta itens na fila de sync
  private async countSyncQueue(): Promise<number> {
    const db = await this.init(); //.............................. Garante conexao
    const tx = db.transaction(STORE_SYNC_QUEUE, 'readonly'); //... Transacao
    const store = tx.objectStore(STORE_SYNC_QUEUE); //............ Store

    return new Promise((resolve, reject) => {
      const request = store.count(); //... Conta

      request.onsuccess = () => resolve(request.result); //... Resultado
      request.onerror = () => reject(request.error); //....... Erro
    });
  }

  // ==================== LIMPEZA DE MIDIA ====================

  // Deleta mensagens de midia (video, imagem, audio) de um lead
  // Util para limpar midias com URLs expiradas
  async deleteMediaMessages(leadPhone: string): Promise<number> {
    const db = await this.init(); //.............................. Garante conexao
    const tx = db.transaction(STORE_MESSAGES, 'readwrite'); //.... Transacao
    const store = tx.objectStore(STORE_MESSAGES); //.............. Store
    const index = store.index('leadPhone'); //.................... Indice

    let deleted = 0;

    return new Promise((resolve, reject) => {
      const request = index.openCursor(leadPhone); //... Cursor no lead

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;

        if (cursor) {
          const msg = cursor.value as CachedMessage;
          const rawData = msg.rawData;

          // Verifica se e mensagem de midia com URL externa (nao local)
          const hasExternalMedia =
            (rawData?.message?.videoMessage?.url && !rawData.message.videoMessage.url.startsWith('data:')) ||
            (rawData?.message?.imageMessage?.url && !rawData.message.imageMessage.url.startsWith('data:')) ||
            (rawData?.message?.audioMessage?.url && !rawData.message.audioMessage.url.startsWith('data:')) ||
            (rawData?.message?.pttMessage?.url && !rawData.message.pttMessage.url.startsWith('data:'));

          if (hasExternalMedia) {
            cursor.delete(); //... Deleta mensagem
            deleted++;
          }

          cursor.continue(); //... Proxima mensagem
        } else {
          console.log(`[IndexedDB] ${deleted} mensagens de midia deletadas do lead ${leadPhone}`);
          resolve(deleted);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  // Deleta TODAS as mensagens de midia com URLs externas (nao locais)
  // Util para limpar todo o cache de midias antigas
  async deleteAllExternalMedia(): Promise<number> {
    const db = await this.init(); //.............................. Garante conexao
    const tx = db.transaction(STORE_MESSAGES, 'readwrite'); //.... Transacao
    const store = tx.objectStore(STORE_MESSAGES); //.............. Store

    let deleted = 0;

    return new Promise((resolve, reject) => {
      const request = store.openCursor(); //... Cursor em todas mensagens

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;

        if (cursor) {
          const msg = cursor.value as CachedMessage;
          const rawData = msg.rawData;

          // Verifica se e mensagem de midia com URL externa (nao local)
          const hasExternalMedia =
            (rawData?.message?.videoMessage?.url && !rawData.message.videoMessage.url.startsWith('data:')) ||
            (rawData?.message?.imageMessage?.url && !rawData.message.imageMessage.url.startsWith('data:')) ||
            (rawData?.message?.audioMessage?.url && !rawData.message.audioMessage.url.startsWith('data:')) ||
            (rawData?.message?.pttMessage?.url && !rawData.message.pttMessage.url.startsWith('data:'));

          if (hasExternalMedia) {
            cursor.delete(); //... Deleta mensagem
            deleted++;
          }

          cursor.continue(); //... Proxima mensagem
        } else {
          console.log(`[IndexedDB] ${deleted} mensagens de midia com URLs externas deletadas`);
          resolve(deleted);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }
}

// Exporta instancia singleton
export const indexedDBService = new IndexedDBService();

// Exporta tipos
export type { CachedMessage, CachedLead, CacheMetadata, SyncQueueItem };
