// ========================================
// Utilitarios do Chat
// Funcoes auxiliares para mensagens
// ========================================

// ========================================
// Funcao para gerar ID unico
// ========================================
export const generateMessageId = (): string => {
  return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// ========================================
// Funcao para formatar data
// ========================================
export const formatMessageDate = (date: Date): string => {
  const today = new Date();           //......Data atual
  const yesterday = new Date(today);  //......Ontem
  yesterday.setDate(yesterday.getDate() - 1);

  // Verifica se e hoje
  if (date.toDateString() === today.toDateString()) {
    return 'Hoje';                    //......Retorna Hoje
  }

  // Verifica se e ontem
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Ontem';                   //......Retorna Ontem
  }

  // Retorna data formatada
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',                   //......Dia com 2 digitos
    month: '2-digit',                 //......Mes com 2 digitos
    year: 'numeric',                  //......Ano completo
  });
};

// ========================================
// Funcao para formatar hora
// ========================================
export const formatMessageTime = (date: Date): string => {
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',                  //......Hora com 2 digitos
    minute: '2-digit',                //......Minuto com 2 digitos
  });
};

// ========================================
// Funcao para formatar tamanho de arquivo
// ========================================
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';      //......Zero bytes

  const k = 1024;                     //......Fator de conversao
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

// ========================================
// Funcao para formatar duracao de audio
// ========================================
export const formatAudioDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
