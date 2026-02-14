// ========================================
// Utilitarios de Audio
// Funcoes auxiliares para manipulacao de audio
// ========================================

// ========================================
// Funcao: Formatar duracao em milisegundos
// ========================================
export const formatDuration = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000); //..Converter para segundos
  const minutes = Math.floor(totalSeconds / 60); //.Calcular minutos
  const seconds = totalSeconds % 60; //............Calcular segundos restantes
  const paddedMinutes = String(minutes).padStart(2, '0'); //..Adicionar zero
  const paddedSeconds = String(seconds).padStart(2, '0'); //..Adicionar zero
  return `${paddedMinutes}:${paddedSeconds}`; //...Retornar formato mm:ss
};

// ========================================
// Funcao: Formatar tempo em segundos
// ========================================
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60); //.......Calcular minutos
  const secs = Math.floor(seconds % 60); //.......Calcular segundos
  const paddedMins = String(mins).padStart(2, '0'); //..Adicionar zero
  const paddedSecs = String(secs).padStart(2, '0'); //..Adicionar zero
  return `${paddedMins}:${paddedSecs}`; //........Retornar formato mm:ss
};

// ========================================
// Funcao: Calcular alturas das barras de onda
// ========================================
export const calculateWaveHeights = (
  audioData: number[], //....................Dados do audio
  barCount: number = 40, //.................Numero de barras
): number[] => {
  const heights: number[] = []; //...........Array de alturas
  const chunkSize = Math.ceil(audioData.length / barCount); //..Tamanho do chunk

  for (let i = 0; i < barCount; i++) { //....Iterar por cada barra
    const start = i * chunkSize; //.........Indice inicial
    const end = Math.min(start + chunkSize, audioData.length); //..Indice final
    const chunk = audioData.slice(start, end); //..Pegar chunk

    if (chunk.length > 0) { //.............Se chunk tem dados
      const avg = chunk.reduce((a, b) => a + b, 0) / chunk.length; //..Media
      heights.push(normalizeVolume(avg)); //.Normalizar e adicionar
    } else { //............................Se chunk vazio
      heights.push(0.1); //................Altura minima
    }
  }

  return heights; //......................Retornar alturas
};

// ========================================
// Funcao: Normalizar volume
// ========================================
export const normalizeVolume = (level: number): number => {
  const minHeight = 0.1; //.................Altura minima
  const maxHeight = 1.0; //.................Altura maxima
  const normalized = Math.abs(level); //.....Valor absoluto
  const clamped = Math.min(Math.max(normalized, minHeight), maxHeight); //..Limitar
  return clamped; //.......................Retornar valor normalizado
};

// ========================================
// Funcao: Gerar alturas aleatorias para animacao
// ========================================
export const generateRandomHeights = (
  barCount: number = 40, //................Numero de barras
  minHeight: number = 0.2, //..............Altura minima
  maxHeight: number = 1.0, //..............Altura maxima
): number[] => {
  const heights: number[] = []; //.........Array de alturas

  for (let i = 0; i < barCount; i++) { //..Iterar por cada barra
    const random = Math.random(); //......Valor aleatorio
    const height = minHeight + random * (maxHeight - minHeight); //..Calcular
    heights.push(height); //..............Adicionar altura
  }

  return heights; //...................Retornar alturas
};

// ========================================
// Funcao: Interpolar alturas para animacao suave
// ========================================
export const interpolateHeights = (
  currentHeights: number[], //............Alturas atuais
  targetHeights: number[], //.............Alturas alvo
  factor: number = 0.3, //................Fator de interpolacao
): number[] => {
  return currentHeights.map((current, index) => {
    const target = targetHeights[index] || 0.1; //..Altura alvo
    const diff = target - current; //..............Diferenca
    return current + diff * factor; //............Interpolar
  });
};

// ========================================
// Funcao: Calcular progresso percentual
// ========================================
export const calculateProgress = (
  currentMs: number, //....................Posicao atual em ms
  totalMs: number, //......................Duracao total em ms
): number => {
  if (totalMs <= 0) return 0; //.........Se duracao invalida
  const progress = currentMs / totalMs; //.Calcular progresso
  return Math.min(Math.max(progress, 0), 1); //..Limitar entre 0 e 1
};

// ========================================
// Constantes de velocidade de reproducao
// ========================================
export const PLAYBACK_SPEEDS = [
  0.5, //................................Meio
  0.75, //...............................Tres quartos
  1.0, //................................Normal
  1.25, //...............................Um e quarto
  1.5, //................................Um e meio
  2.0, //................................Dobro
] as const; //...........................Constante imutavel

// ========================================
// Tipo para velocidade de reproducao
// ========================================
export type PlaybackSpeed = typeof PLAYBACK_SPEEDS[number];

// ========================================
// Funcao: Obter proxima velocidade
// ========================================
export const getNextSpeed = (currentSpeed: number): number => {
  const currentIndex = PLAYBACK_SPEEDS.indexOf(currentSpeed as PlaybackSpeed);
  const nextIndex = (currentIndex + 1) % PLAYBACK_SPEEDS.length; //..Proximo
  return PLAYBACK_SPEEDS[nextIndex]; //...Retornar proxima velocidade
};

// ========================================
// Funcao: Formatar velocidade para exibicao
// ========================================
export const formatSpeed = (speed: number): string => {
  return `${speed}x`; //.................Retornar com x
};
