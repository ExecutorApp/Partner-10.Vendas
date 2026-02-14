// ========================================
// Hook useVoicePlayer
// Gerencia reproducao de audio TTS com ondas
// ========================================

// ========================================
// Imports React
// ========================================
import {
  useState, //............................Hook de estado
  useCallback, //..........................Hook de callback
  useRef, //..............................Hook de referencia
  useEffect, //...........................Hook de efeito
} from 'react'; //........................Biblioteca React

// ========================================
// Imports Expo
// ========================================
import { Audio } from 'expo-av'; //.......Biblioteca de audio

// ========================================
// Imports Utilitarios
// ========================================
import {
  formatDuration, //......................Formatar duracao
  generateRandomHeights, //...............Gerar alturas
  interpolateHeights, //.................Interpolar alturas
  getNextSpeed, //........................Proxima velocidade
  PLAYBACK_SPEEDS, //.....................Velocidades disponiveis
} from '../utils/audioUtils'; //..........Utilitarios de audio

// ========================================
// Interface de Retorno do Hook
// ========================================
export interface UseVoicePlayerReturn {
  isPlaying: boolean; //.................Se esta tocando
  isLoading: boolean; //.................Se esta carregando
  progress: number; //....................Progresso (0-1)
  duration: number; //....................Duracao em ms
  currentTime: number; //.................Tempo atual em ms
  speed: number; //........................Velocidade atual
  waveHeights: number[]; //...............Alturas das ondas
  formattedTime: string; //...............Tempo formatado
  formattedDuration: string; //.........Duracao formatada
  play: (uri: string) => Promise<void>; //..Tocar
  pause: () => Promise<void>; //.........Pausar
  resume: () => Promise<void>; //.........Continuar
  stop: () => Promise<void>; //..........Parar
  seek: (position: number) => Promise<void>; //..Buscar
  setSpeed: (speed: number) => void; //...Definir velocidade
  toggleSpeed: () => void; //..............Alternar velocidade
}

// ========================================
// Constantes
// ========================================
const BAR_COUNT = 40; //...................Numero de barras
const UPDATE_INTERVAL = 100; //............Intervalo de update em ms

// ========================================
// Hook useVoicePlayer
// ========================================
export const useVoicePlayer = (
  onComplete?: () => void, //.............Callback ao completar
): UseVoicePlayerReturn => {
  // ========================================
  // Estados
  // ========================================
  const [isPlaying, setIsPlaying] = useState(false); //..Estado tocando
  const [isLoading, setIsLoading] = useState(false); //..Estado carregando
  const [progress, setProgress] = useState(0); //.......Progresso
  const [duration, setDuration] = useState(0); //.......Duracao
  const [currentTime, setCurrentTime] = useState(0); //..Tempo atual
  const [speed, setSpeedState] = useState(1.0); //......Velocidade
  const [waveHeights, setWaveHeights] = useState<number[]>( //..Ondas
    () => Array(BAR_COUNT).fill(0.1), //...............Alturas iniciais
  );

  // ========================================
  // Refs
  // ========================================
  const soundRef = useRef<Audio.Sound | null>(null); //..Referencia do som
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null); //..Intervalo
  const currentUriRef = useRef<string | null>(null); //..URI atual

  // ========================================
  // Funcao: Limpar recursos
  // ========================================
  const cleanup = useCallback(async () => {
    if (updateIntervalRef.current) { //.....Se tem intervalo
      clearInterval(updateIntervalRef.current); //..Limpar
      updateIntervalRef.current = null; //..Resetar ref
    }

    if (soundRef.current) { //..............Se tem som
      try {
        await soundRef.current.unloadAsync(); //..Descarregar
      } catch (error) { //..................Ignorar erros
        // Ignorar erros de unload
      }
      soundRef.current = null; //...........Resetar ref
    }

    currentUriRef.current = null; //........Resetar URI
  }, []);

  // ========================================
  // Funcao: Atualizar status
  // ========================================
  const updateStatus = useCallback(async () => {
    if (!soundRef.current) return; //........Se nao tem som

    try {
      const status = await soundRef.current.getStatusAsync(); //..Obter status

      if (status.isLoaded) { //.............Se carregado
        const currentMs = status.positionMillis || 0; //..Posicao atual
        const totalMs = status.durationMillis || 0; //...Duracao total

        setCurrentTime(currentMs); //......Atualizar tempo
        setDuration(totalMs); //...........Atualizar duracao
        setProgress(totalMs > 0 ? currentMs / totalMs : 0); //..Progresso

        if (status.isPlaying) { //..........Se tocando
          const newHeights = generateRandomHeights(BAR_COUNT, 0.3, 1.0);
          setWaveHeights(prev => interpolateHeights(prev, newHeights, 0.4));
        }

        if (status.didJustFinish) { //......Se terminou
          setIsPlaying(false); //..........Parar
          setProgress(1); //................Progresso 100%
          setWaveHeights(Array(BAR_COUNT).fill(0.1)); //..Resetar ondas
          onComplete?.(); //................Chamar callback
        }
      }
    } catch (error) { //....................Ignorar erros
      // Ignorar erros de status
    }
  }, [onComplete]);

  // ========================================
  // Funcao: Iniciar intervalo de update
  // ========================================
  const startUpdateInterval = useCallback(() => {
    if (updateIntervalRef.current) { //......Se ja tem intervalo
      clearInterval(updateIntervalRef.current); //..Limpar
    }

    updateIntervalRef.current = setInterval(updateStatus, UPDATE_INTERVAL);
  }, [updateStatus]);

  // ========================================
  // Funcao: Tocar audio
  // ========================================
  const play = useCallback(async (uri: string) => {
    try {
      setIsLoading(true); //................Iniciar loading

      // Limpar som anterior se URI diferente
      if (currentUriRef.current !== uri) { //..Se URI diferente
        await cleanup(); //................Limpar recursos
      }

      // Configurar modo de audio
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true, //......Tocar no silencioso
        staysActiveInBackground: false, //..Nao tocar em background
      });

      // Criar novo som
      const { sound } = await Audio.Sound.createAsync(
        { uri }, //........................URI do audio
        {
          shouldPlay: true, //.............Tocar automaticamente
          rate: speed, //...................Velocidade
          progressUpdateIntervalMillis: UPDATE_INTERVAL, //..Intervalo
        },
      );

      soundRef.current = sound; //..........Salvar referencia
      currentUriRef.current = uri; //.......Salvar URI

      setIsPlaying(true); //................Atualizar estado
      setProgress(0); //....................Resetar progresso
      startUpdateInterval(); //.............Iniciar updates

    } catch (error) { //....................Em caso de erro
      console.error('Erro ao tocar audio:', error); //..Log
      setIsPlaying(false); //...............Resetar estado
    } finally {
      setIsLoading(false); //...............Finalizar loading
    }
  }, [cleanup, speed, startUpdateInterval]);

  // ========================================
  // Funcao: Pausar audio
  // ========================================
  const pause = useCallback(async () => {
    if (!soundRef.current) return; //........Se nao tem som

    try {
      await soundRef.current.pauseAsync(); //..Pausar
      setIsPlaying(false); //...............Atualizar estado
      setWaveHeights(Array(BAR_COUNT).fill(0.1)); //..Resetar ondas
    } catch (error) { //....................Em caso de erro
      console.error('Erro ao pausar:', error); //..Log
    }
  }, []);

  // ========================================
  // Funcao: Continuar audio
  // ========================================
  const resume = useCallback(async () => {
    if (!soundRef.current) return; //........Se nao tem som

    try {
      await soundRef.current.playAsync(); //..Continuar
      setIsPlaying(true); //................Atualizar estado
    } catch (error) { //....................Em caso de erro
      console.error('Erro ao continuar:', error); //..Log
    }
  }, []);

  // ========================================
  // Funcao: Parar audio
  // ========================================
  const stop = useCallback(async () => {
    await cleanup(); //....................Limpar recursos
    setIsPlaying(false); //................Resetar estado
    setProgress(0); //.....................Resetar progresso
    setCurrentTime(0); //..................Resetar tempo
    setWaveHeights(Array(BAR_COUNT).fill(0.1)); //..Resetar ondas
  }, [cleanup]);

  // ========================================
  // Funcao: Buscar posicao
  // ========================================
  const seek = useCallback(async (position: number) => {
    if (!soundRef.current || duration <= 0) return; //..Validar

    try {
      const positionMs = position * duration; //..Calcular posicao em ms
      await soundRef.current.setPositionAsync(positionMs); //..Buscar
      setProgress(position); //............Atualizar progresso
      setCurrentTime(positionMs); //.......Atualizar tempo
    } catch (error) { //....................Em caso de erro
      console.error('Erro ao buscar:', error); //..Log
    }
  }, [duration]);

  // ========================================
  // Funcao: Definir velocidade
  // ========================================
  const setSpeed = useCallback(async (newSpeed: number) => {
    setSpeedState(newSpeed); //.............Atualizar estado

    if (soundRef.current) { //.............Se tem som
      try {
        await soundRef.current.setRateAsync(newSpeed, true); //..Definir
      } catch (error) { //.................Em caso de erro
        console.error('Erro ao definir velocidade:', error); //..Log
      }
    }
  }, []);

  // ========================================
  // Funcao: Alternar velocidade
  // ========================================
  const toggleSpeed = useCallback(() => {
    const nextSpeed = getNextSpeed(speed); //..Proxima velocidade
    setSpeed(nextSpeed); //................Definir
  }, [speed, setSpeed]);

  // ========================================
  // Efeito: Cleanup ao desmontar
  // ========================================
  useEffect(() => {
    return () => {
      cleanup(); //........................Limpar ao desmontar
    };
  }, [cleanup]);

  // ========================================
  // Retorno do Hook
  // ========================================
  return {
    isPlaying, //..........................Se tocando
    isLoading, //..........................Se carregando
    progress, //...........................Progresso
    duration, //...........................Duracao
    currentTime, //.......................Tempo atual
    speed, //.............................Velocidade
    waveHeights, //.......................Alturas das ondas
    formattedTime: formatDuration(currentTime), //..Tempo formatado
    formattedDuration: formatDuration(duration), //..Duracao formatada
    play, //.............................Tocar
    pause, //............................Pausar
    resume, //............................Continuar
    stop, //..............................Parar
    seek, //..............................Buscar
    setSpeed, //..........................Definir velocidade
    toggleSpeed, //........................Alternar velocidade
  };
};

// ========================================
// Export Default
// ========================================
export default useVoicePlayer;
