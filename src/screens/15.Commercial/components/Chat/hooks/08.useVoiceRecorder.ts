// ========================================
// Hook useVoiceRecorder
// Gerenciamento de gravacao de audio
// ========================================

// ========================================
// Imports React
// ========================================
import {                                  //......Hooks React
  useState,                               //......Hook de estado
  useCallback,                            //......Hook de callback
  useRef,                                 //......Hook de ref
  useEffect,                              //......Hook de efeito
} from 'react';                           //......Biblioteca React

// ========================================
// Imports Expo
// ========================================
import { Audio } from 'expo-av';          //......Audio API

// ========================================
// Interface de Retorno
// ========================================
interface UseVoiceRecorderReturn {
  isRecording: boolean;                   //......Se esta gravando
  recordingDuration: number;              //......Duracao em segundos
  recordingUri: string | null;            //......URI do audio gravado
  permissionGranted: boolean;             //......Se tem permissao
  startRecording: () => Promise<void>;    //......Inicia gravacao
  stopRecording: () => Promise<void>;     //......Para gravacao
  cancelRecording: () => Promise<void>;   //......Cancela gravacao
  requestPermission: () => Promise<boolean>;
}

// ========================================
// Hook Principal useVoiceRecorder
// ========================================
export const useVoiceRecorder = (): UseVoiceRecorderReturn => {
  // ========================================
  // Estados
  // ========================================
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // ========================================
  // Refs
  // ========================================
  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ========================================
  // Limpar Timer
  // ========================================
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);    //......Limpa intervalo
      timerRef.current = null;            //......Reseta ref
    }
  }, []);

  // ========================================
  // Cleanup ao desmontar
  // ========================================
  useEffect(() => {
    return () => {
      clearTimer();                       //......Limpa timer
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
    };
  }, [clearTimer]);

  // ========================================
  // Solicitar Permissao
  // ========================================
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      setPermissionGranted(granted);      //......Atualiza estado
      return granted;                     //......Retorna resultado
    } catch (error) {
      console.error('Erro ao solicitar permissao:', error);
      return false;                       //......Retorna falso
    }
  }, []);

  // ========================================
  // Iniciar Gravacao
  // ========================================
  const startRecording = useCallback(async () => {
    try {
      // Verificar permissao
      if (!permissionGranted) {
        const granted = await requestPermission();
        if (!granted) return;             //......Aborta se sem permissao
      }

      // Configurar modo de audio
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,         //......Permite gravacao iOS
        playsInSilentModeIOS: true,       //......Toca em silencioso
      });

      // Criar gravacao
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;   //......Salva ref
      setIsRecording(true);               //......Marca gravando
      setRecordingDuration(0);            //......Reseta duracao
      setRecordingUri(null);              //......Limpa URI anterior

      // Iniciar timer
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Erro ao iniciar gravacao:', error);
    }
  }, [permissionGranted, requestPermission]);

  // ========================================
  // Parar Gravacao
  // ========================================
  const stopRecording = useCallback(async () => {
    try {
      clearTimer();                       //......Limpa timer

      if (!recordingRef.current) {
        return;                           //......Aborta se nao tem gravacao
      }

      // Parar gravacao
      await recordingRef.current.stopAndUnloadAsync();

      // Obter URI
      const uri = recordingRef.current.getURI();
      setRecordingUri(uri);               //......Salva URI

      // Resetar estado
      recordingRef.current = null;        //......Limpa ref
      setIsRecording(false);              //......Desmarca gravando

      // Restaurar modo de audio
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,        //......Desativa gravacao
      });
    } catch (error) {
      console.error('Erro ao parar gravacao:', error);
      setIsRecording(false);              //......Garante que desmarca
    }
  }, [clearTimer]);

  // ========================================
  // Cancelar Gravacao
  // ========================================
  const cancelRecording = useCallback(async () => {
    try {
      clearTimer();                       //......Limpa timer

      if (!recordingRef.current) {
        return;                           //......Aborta se nao tem gravacao
      }

      // Parar e descartar
      await recordingRef.current.stopAndUnloadAsync();

      // Resetar estado sem salvar URI
      recordingRef.current = null;        //......Limpa ref
      setIsRecording(false);              //......Desmarca gravando
      setRecordingDuration(0);            //......Reseta duracao
      setRecordingUri(null);              //......Nao salva URI

      // Restaurar modo de audio
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,        //......Desativa gravacao
      });
    } catch (error) {
      console.error('Erro ao cancelar gravacao:', error);
      setIsRecording(false);              //......Garante que desmarca
    }
  }, [clearTimer]);

  // ========================================
  // Retorno do Hook
  // ========================================
  return {
    isRecording,                          //......Se esta gravando
    recordingDuration,                    //......Duracao
    recordingUri,                         //......URI do audio
    permissionGranted,                    //......Se tem permissao
    startRecording,                       //......Inicia
    stopRecording,                        //......Para
    cancelRecording,                      //......Cancela
    requestPermission,                    //......Solicita permissao
  };
};

// ========================================
// Export Default
// ========================================
export default useVoiceRecorder;
