// ========================================
// Componente VoiceRecorder
// Gravador de audio com ondas animadas
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, {                       //......React core
  useState,                           //......Hook de estado
  useCallback,                        //......Hook de callback
  useRef,                             //......Hook de referencia
  useEffect,                          //......Hook de efeito
} from 'react';                       //......Biblioteca React
import {                              //......Componentes RN
  View,                               //......Container basico
  Text,                               //......Texto
  TouchableOpacity,                   //......Botao tocavel
  StyleSheet,                         //......Estilos
  ActivityIndicator,                  //......Indicador loading
  Alert,                              //......Alerta
} from 'react-native';                //......Biblioteca RN
import Svg, {                         //......Componentes SVG
  Path,                               //......Path do SVG
} from 'react-native-svg';            //......Biblioteca SVG
import { Audio } from 'expo-av';      //......Biblioteca de audio

// ========================================
// Imports de Services
// ========================================
import aiService from '../../services/aiService';

// ========================================
// Imports de Utilitarios
// ========================================
import {
  formatDuration,                     //......Formatar duracao
  generateRandomHeights,              //......Gerar alturas
  interpolateHeights,                 //......Interpolar alturas
} from '../../utils/audioUtils';

// ========================================
// Constantes de Cores
// ========================================
const COLORS = {
  primary: '#1777CF',                 //......Azul principal
  danger: '#EF4444',                  //......Vermelho
  background: '#F4F4F4',              //......Fundo cinza
  backgroundLight: '#FCFCFC',         //......Fundo branco
  waveActive: '#EF4444',              //......Onda gravando
  waveInactive: '#D8E0F0',            //......Onda inativa
  textPrimary: '#3A3F51',             //......Texto principal
  textSecondary: '#7D8592',           //......Texto secundario
  white: '#FFFFFF',                   //......Branco
  success: '#22C55E',                 //......Verde sucesso
};

// ========================================
// Icones SVG
// ========================================

// Icone Microfone
const MicIcon = ({ color = COLORS.white }: { color?: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"
      fill={color}
    />
  </Svg>
);

// Icone Parar
const StopIcon = ({ color = COLORS.white }: { color?: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 6h12v12H6z"
      fill={color}
    />
  </Svg>
);

// Icone Check
const CheckIcon = ({ color = COLORS.white }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
      fill={color}
    />
  </Svg>
);

// Icone Fechar
const CloseIcon = ({ color = COLORS.white }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
      fill={color}
    />
  </Svg>
);

// ========================================
// Interface de Props
// ========================================
interface VoiceRecorderProps {
  onRecordComplete: (uri: string, duration: number) => void;
  onTranscription?: (text: string) => void;
  maxDuration?: number;               //......Duracao maxima em segundos
}

// ========================================
// Constantes
// ========================================
const BAR_COUNT = 40;                 //......Numero de barras
const UPDATE_INTERVAL = 100;          //......Intervalo de update em ms
const DEFAULT_MAX_DURATION = 60;      //......Duracao maxima padrao

// ========================================
// Componente VoiceRecorder
// ========================================
const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordComplete,                   //......Callback gravacao completa
  onTranscription,                    //......Callback transcricao
  maxDuration = DEFAULT_MAX_DURATION, //......Duracao maxima
}) => {
  // ========================================
  // Estados
  // ========================================
  const [isRecording, setIsRecording] = useState(false); //..Gravando
  const [isPaused, setIsPaused] = useState(false); //........Pausado
  const [isTranscribing, setIsTranscribing] = useState(false); //..Transcrevendo
  const [duration, setDuration] = useState(0); //...........Duracao
  const [waveHeights, setWaveHeights] = useState<number[]>(
    () => Array(BAR_COUNT).fill(0.1),
  );
  const [recordedUri, setRecordedUri] = useState<string | null>(null);

  // ========================================
  // Refs
  // ========================================
  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const waveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ========================================
  // Funcao: Limpar recursos
  // ========================================
  const cleanup = useCallback(() => {
    if (timerRef.current) {           //......Se tem timer
      clearInterval(timerRef.current); //....Limpar
      timerRef.current = null;        //......Resetar
    }
    if (waveIntervalRef.current) {    //......Se tem intervalo
      clearInterval(waveIntervalRef.current); //..Limpar
      waveIntervalRef.current = null; //......Resetar
    }
  }, []);

  // ========================================
  // Funcao: Solicitar permissao
  // ========================================
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {                 //......Se nao concedida
        Alert.alert(
          'Permissao necessaria',
          'Precisamos de acesso ao microfone para gravar audio.',
        );
        return false;                 //......Retornar falso
      }
      return true;                    //......Retornar verdadeiro
    } catch (error) {                 //......Em caso de erro
      console.error('Erro ao solicitar permissao:', error);
      return false;                   //......Retornar falso
    }
  }, []);

  // ========================================
  // Funcao: Iniciar gravacao
  // ========================================
  const startRecording = useCallback(async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;       //......Se nao tem permissao

    try {
      // Configurar modo de audio
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,     //......Permitir gravacao iOS
        playsInSilentModeIOS: true,   //......Tocar no silencioso
      });

      // Criar gravacao
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      await recording.startAsync();   //......Iniciar

      recordingRef.current = recording; //....Salvar referencia
      setIsRecording(true);           //......Atualizar estado
      setIsPaused(false);             //......Nao pausado
      setDuration(0);                 //......Resetar duracao
      setRecordedUri(null);           //......Limpar URI

      // Timer de duracao
      timerRef.current = setInterval(() => {
        setDuration(prev => {
          if (prev >= maxDuration) {  //......Se atingiu maximo
            stopRecording();          //......Parar
            return prev;              //......Manter valor
          }
          return prev + 1;            //......Incrementar
        });
      }, 1000);

      // Animacao de ondas
      waveIntervalRef.current = setInterval(() => {
        const newHeights = generateRandomHeights(BAR_COUNT, 0.3, 1.0);
        setWaveHeights(prev => interpolateHeights(prev, newHeights, 0.5));
      }, UPDATE_INTERVAL);

    } catch (error) {                 //......Em caso de erro
      console.error('Erro ao iniciar gravacao:', error);
      Alert.alert('Erro', 'Nao foi possivel iniciar a gravacao.');
    }
  }, [maxDuration, requestPermission]);

  // ========================================
  // Funcao: Parar gravacao
  // ========================================
  const stopRecording = useCallback(async () => {
    cleanup();                        //......Limpar recursos

    if (!recordingRef.current) return; //....Se nao tem gravacao

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;    //......Limpar referencia

      setIsRecording(false);          //......Atualizar estado
      setWaveHeights(Array(BAR_COUNT).fill(0.1)); //..Resetar ondas

      if (uri) {                      //......Se tem URI
        setRecordedUri(uri);          //......Salvar URI
      }
    } catch (error) {                 //......Em caso de erro
      console.error('Erro ao parar gravacao:', error);
      setIsRecording(false);          //......Resetar estado
    }
  }, [cleanup]);

  // ========================================
  // Funcao: Cancelar gravacao
  // ========================================
  const cancelRecording = useCallback(async () => {
    cleanup();                        //......Limpar recursos

    if (recordingRef.current) {       //......Se tem gravacao
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch (error) {               //......Ignorar erros
        // Ignorar
      }
      recordingRef.current = null;    //......Limpar referencia
    }

    setIsRecording(false);            //......Resetar estado
    setRecordedUri(null);             //......Limpar URI
    setDuration(0);                   //......Resetar duracao
    setWaveHeights(Array(BAR_COUNT).fill(0.1)); //..Resetar ondas
  }, [cleanup]);

  // ========================================
  // Funcao: Confirmar gravacao
  // ========================================
  const confirmRecording = useCallback(async () => {
    if (!recordedUri) return;         //......Se nao tem URI

    setIsTranscribing(true);          //......Iniciar transcricao

    try {
      // Enviar para transcricao
      const result = await aiService.transcribeAudio(recordedUri);

      if (result.text) {              //......Se tem texto
        onTranscription?.(result.text); //...Callback
      }

      onRecordComplete(recordedUri, duration * 1000); //..Callback completo
      setRecordedUri(null);           //......Limpar URI
      setDuration(0);                 //......Resetar duracao

    } catch (error) {                 //......Em caso de erro
      console.error('Erro ao transcrever:', error);
      Alert.alert('Erro', 'Nao foi possivel transcrever o audio.');
    } finally {
      setIsTranscribing(false);       //......Finalizar transcricao
    }
  }, [recordedUri, duration, onRecordComplete, onTranscription]);

  // ========================================
  // Efeito: Cleanup ao desmontar
  // ========================================
  useEffect(() => {
    return () => {
      cleanup();                      //......Limpar ao desmontar
      if (recordingRef.current) {     //......Se tem gravacao
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, [cleanup]);

  // ========================================
  // Render: Barras de Onda
  // ========================================
  const renderWaveBars = useCallback(() => {
    return waveHeights.map((height, index) => {
      const barHeight = height * 32;  //......Altura calculada
      const isActive = isRecording;   //......Se gravando

      return (
        <View
          key={index}
          style={[
            styles.waveBar,
            {
              height: Math.max(barHeight, 2),
              backgroundColor: isActive ? COLORS.waveActive : COLORS.waveInactive,
            },
          ]}
        />
      );
    });
  }, [waveHeights, isRecording]);

  // ========================================
  // Render: Estado gravado
  // ========================================
  if (recordedUri) {
    return (
      <View style={styles.container}>
        {/* Info da gravacao */}
        <View style={styles.recordedInfo}>
          <Text style={styles.recordedText}>
            Audio gravado
          </Text>
          <Text style={styles.recordedDuration}>
            {formatDuration(duration * 1000)}
          </Text>
        </View>

        {/* Botoes de acao */}
        <View style={styles.actionButtons}>
          {/* Cancelar */}
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={cancelRecording}
            disabled={isTranscribing}
            activeOpacity={0.7}
          >
            <CloseIcon color={COLORS.white} />
          </TouchableOpacity>

          {/* Confirmar */}
          <TouchableOpacity
            style={[styles.actionButton, styles.confirmButton]}
            onPress={confirmRecording}
            disabled={isTranscribing}
            activeOpacity={0.7}
          >
            {isTranscribing ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <CheckIcon color={COLORS.white} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ========================================
  // Render: Estado inicial/gravando
  // ========================================
  return (
    <View style={styles.container}>
      {/* Ondas de audio */}
      {isRecording && (
        <View style={styles.waveContainer}>
          <View style={styles.waveBars}>
            {renderWaveBars()}
          </View>
          <Text style={styles.durationText}>
            {formatDuration(duration * 1000)}
          </Text>
        </View>
      )}

      {/* Instrucao */}
      {!isRecording && (
        <Text style={styles.instructionText}>
          Toque para gravar
        </Text>
      )}

      {/* Botao principal */}
      <TouchableOpacity
        style={[
          styles.recordButton,
          isRecording && styles.recordButtonActive,
        ]}
        onPress={isRecording ? stopRecording : startRecording}
        activeOpacity={0.7}
      >
        {isRecording ? (
          <StopIcon color={COLORS.white} />
        ) : (
          <MicIcon color={COLORS.white} />
        )}
      </TouchableOpacity>

      {/* Botao cancelar durante gravacao */}
      {isRecording && (
        <TouchableOpacity
          style={styles.cancelRecordingButton}
          onPress={cancelRecording}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelRecordingText}>
            Cancelar
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ========================================
// Export Default
// ========================================
export default VoiceRecorder;

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container principal
  container: {
    alignItems: 'center',             //......Centralizar horizontal
    padding: 16,                      //......Espaco interno
  },

  // Container das ondas
  waveContainer: {
    alignItems: 'center',             //......Centralizar
    marginBottom: 16,                 //......Margem inferior
  },

  // Barras de onda
  waveBars: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    justifyContent: 'center',         //......Centralizar horizontal
    height: 40,                       //......Altura fixa
  },

  // Barra individual
  waveBar: {
    width: 3,                         //......Largura
    marginHorizontal: 1,              //......Margem horizontal
    borderRadius: 2,                  //......Arredondamento
  },

  // Texto de duracao
  durationText: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.danger,             //......Cor vermelha
    marginTop: 8,                     //......Margem superior
  },

  // Texto de instrucao
  instructionText: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
    marginBottom: 16,                 //......Margem inferior
  },

  // Botao de gravacao
  recordButton: {
    width: 64,                        //......Largura
    height: 64,                       //......Altura
    borderRadius: 32,                 //......Arredondamento
    backgroundColor: COLORS.danger,   //......Fundo vermelho
    justifyContent: 'center',         //......Centralizar vertical
    alignItems: 'center',             //......Centralizar horizontal
  },

  // Botao gravando
  recordButtonActive: {
    backgroundColor: COLORS.danger,   //......Fundo vermelho
  },

  // Botao cancelar gravacao
  cancelRecordingButton: {
    marginTop: 12,                    //......Margem superior
    paddingHorizontal: 16,            //......Espaco horizontal
    paddingVertical: 8,               //......Espaco vertical
  },

  // Texto cancelar gravacao
  cancelRecordingText: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
  },

  // Info gravado
  recordedInfo: {
    alignItems: 'center',             //......Centralizar
    marginBottom: 16,                 //......Margem inferior
  },

  // Texto gravado
  recordedText: {
    fontSize: 16,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.textPrimary,        //......Cor primaria
  },

  // Duracao gravada
  recordedDuration: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
    marginTop: 4,                     //......Margem superior
  },

  // Botoes de acao
  actionButtons: {
    flexDirection: 'row',             //......Layout horizontal
    gap: 16,                          //......Espaco entre
  },

  // Botao de acao
  actionButton: {
    width: 48,                        //......Largura
    height: 48,                       //......Altura
    borderRadius: 24,                 //......Arredondamento
    justifyContent: 'center',         //......Centralizar vertical
    alignItems: 'center',             //......Centralizar horizontal
  },

  // Botao cancelar
  cancelButton: {
    backgroundColor: COLORS.textSecondary, //..Fundo cinza
  },

  // Botao confirmar
  confirmButton: {
    backgroundColor: COLORS.success,  //......Fundo verde
  },
});
