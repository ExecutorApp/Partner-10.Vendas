// ========================================
// Componente VoicePlayer
// Player de audio TTS com ondas sonoras
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, {                       //......React core
  useEffect,                          //......Hook de efeito
  useCallback,                        //......Hook de callback
  useMemo,                            //......Hook de memorizacao
} from 'react';                       //......Biblioteca React
import {                              //......Componentes RN
  View,                               //......Container basico
  Text,                               //......Texto
  TouchableOpacity,                   //......Botao tocavel
  StyleSheet,                         //......Estilos
  ActivityIndicator,                  //......Indicador loading
  Animated,                           //......Animacoes
} from 'react-native';                //......Biblioteca RN
import Svg, {                         //......Componentes SVG
  Path,                               //......Path do SVG
} from 'react-native-svg';            //......Biblioteca SVG

// ========================================
// Imports de Hooks
// ========================================
import useVoicePlayer from '../../hooks/useVoicePlayer';

// ========================================
// Imports de Utilitarios
// ========================================
import { formatSpeed } from '../../utils/audioUtils';

// ========================================
// Constantes de Cores
// ========================================
const COLORS = {
  primary: '#1777CF',                 //......Azul principal
  background: '#F4F4F4',              //......Fundo cinza
  backgroundLight: '#FCFCFC',         //......Fundo branco
  waveActive: '#1777CF',              //......Onda ativa
  waveInactive: '#D8E0F0',            //......Onda inativa
  textPrimary: '#3A3F51',             //......Texto principal
  textSecondary: '#7D8592',           //......Texto secundario
  white: '#FFFFFF',                   //......Branco
};

// ========================================
// Icones SVG
// ========================================

// Icone Play
const PlayIcon = ({ color = COLORS.white }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8 5v14l11-7L8 5z"
      fill={color}
    />
  </Svg>
);

// Icone Pause
const PauseIcon = ({ color = COLORS.white }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"
      fill={color}
    />
  </Svg>
);

// ========================================
// Interface de Props
// ========================================
interface VoicePlayerProps {
  uri: string;                        //......URI do audio
  autoPlay?: boolean;                 //......Auto-play
  onComplete?: () => void;            //......Callback ao completar
  showSpeedControl?: boolean;         //......Mostrar controle velocidade
  size?: 'small' | 'medium' | 'large'; //....Tamanho do player
  color?: 'primary' | 'secondary';    //......Cor do player
}

// ========================================
// Constantes de Tamanho
// ========================================
const SIZES = {
  small: {
    barWidth: 2,                      //......Largura da barra
    barGap: 1,                        //......Espaco entre barras
    maxHeight: 24,                    //......Altura maxima
    buttonSize: 32,                   //......Tamanho do botao
    padding: 8,                       //......Padding
  },
  medium: {
    barWidth: 3,                      //......Largura da barra
    barGap: 2,                        //......Espaco entre barras
    maxHeight: 40,                    //......Altura maxima
    buttonSize: 44,                   //......Tamanho do botao
    padding: 12,                      //......Padding
  },
  large: {
    barWidth: 4,                      //......Largura da barra
    barGap: 2,                        //......Espaco entre barras
    maxHeight: 56,                    //......Altura maxima
    buttonSize: 56,                   //......Tamanho do botao
    padding: 16,                      //......Padding
  },
};

// ========================================
// Componente VoicePlayer
// ========================================
const VoicePlayer: React.FC<VoicePlayerProps> = ({
  uri,                                //......URI do audio
  autoPlay = false,                   //......Auto-play padrao false
  onComplete,                         //......Callback ao completar
  showSpeedControl = true,            //......Mostrar velocidade
  size = 'medium',                    //......Tamanho padrao
  color = 'primary',                  //......Cor padrao
}) => {
  // ========================================
  // Hook do Player
  // ========================================
  const {
    isPlaying,                        //......Se esta tocando
    isLoading,                        //......Se esta carregando
    progress,                         //......Progresso
    waveHeights,                      //......Alturas das ondas
    formattedTime,                    //......Tempo formatado
    formattedDuration,                //......Duracao formatada
    speed,                            //......Velocidade atual
    play,                             //......Funcao tocar
    pause,                            //......Funcao pausar
    resume,                           //......Funcao continuar
    toggleSpeed,                      //......Alternar velocidade
  } = useVoicePlayer(onComplete);     //......Callback completar

  // ========================================
  // Memos
  // ========================================
  const sizeConfig = useMemo(() => SIZES[size], [size]);

  const waveColor = useMemo(() => {
    return color === 'primary' ? COLORS.waveActive : COLORS.textSecondary;
  }, [color]);

  // ========================================
  // Efeito: Auto-play
  // ========================================
  useEffect(() => {
    if (autoPlay && uri) {            //......Se auto-play e tem URI
      play(uri);                      //......Tocar
    }
  }, [autoPlay, uri, play]);

  // ========================================
  // Handler: Toggle Play/Pause
  // ========================================
  const handleTogglePlay = useCallback(() => {
    if (isLoading) return;            //......Se carregando, ignorar

    if (isPlaying) {                  //......Se tocando
      pause();                        //......Pausar
    } else if (progress > 0 && progress < 1) { //..Se pausado
      resume();                       //......Continuar
    } else {                          //......Se parado
      play(uri);                      //......Tocar
    }
  }, [isPlaying, isLoading, progress, pause, resume, play, uri]);

  // ========================================
  // Handler: Velocidade
  // ========================================
  const handleSpeedPress = useCallback(() => {
    toggleSpeed();                    //......Alternar velocidade
  }, [toggleSpeed]);

  // ========================================
  // Render: Barras de Onda
  // ========================================
  const renderWaveBars = useCallback(() => {
    return waveHeights.map((height, index) => {
      const barHeight = height * sizeConfig.maxHeight; //..Altura calculada
      const isActive = (index / waveHeights.length) <= progress; //..Se ativa

      return (
        <View
          key={index}
          style={[
            styles.waveBar,
            {
              width: sizeConfig.barWidth, //..Largura
              height: Math.max(barHeight, 2), //..Altura minima 2
              marginHorizontal: sizeConfig.barGap / 2, //..Margem
              backgroundColor: isActive ? waveColor : COLORS.waveInactive,
            },
          ]}
        />
      );
    });
  }, [waveHeights, progress, sizeConfig, waveColor]);

  // ========================================
  // Render
  // ========================================
  return (
    <View style={[styles.container, { padding: sizeConfig.padding }]}>
      {/* Botao Play/Pause */}
      <TouchableOpacity
        style={[
          styles.playButton,
          {
            width: sizeConfig.buttonSize,
            height: sizeConfig.buttonSize,
            borderRadius: sizeConfig.buttonSize / 2,
          },
        ]}
        onPress={handleTogglePlay}
        disabled={isLoading}
        activeOpacity={0.7}
      >
        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={COLORS.white}
          />
        ) : isPlaying ? (
          <PauseIcon color={COLORS.white} />
        ) : (
          <PlayIcon color={COLORS.white} />
        )}
      </TouchableOpacity>

      {/* Container das Ondas */}
      <View style={styles.waveContainer}>
        {/* Barras de Onda */}
        <View style={[styles.waveBars, { height: sizeConfig.maxHeight }]}>
          {renderWaveBars()}
        </View>

        {/* Tempo */}
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>
            {formattedTime}
          </Text>
          <Text style={styles.timeSeparator}>/</Text>
          <Text style={styles.timeText}>
            {formattedDuration}
          </Text>
        </View>
      </View>

      {/* Controle de Velocidade */}
      {showSpeedControl && (
        <TouchableOpacity
          style={styles.speedButton}
          onPress={handleSpeedPress}
          activeOpacity={0.7}
        >
          <Text style={styles.speedText}>
            {formatSpeed(speed)}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ========================================
// Export Default
// ========================================
export default VoicePlayer;

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container principal
  container: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    backgroundColor: COLORS.background, //....Fundo cinza
    borderRadius: 12,                 //......Arredondamento
  },

  // Botao play/pause
  playButton: {
    backgroundColor: COLORS.primary,  //......Fundo azul
    justifyContent: 'center',         //......Centralizar vertical
    alignItems: 'center',             //......Centralizar horizontal
    marginRight: 12,                  //......Margem direita
  },

  // Container das ondas
  waveContainer: {
    flex: 1,                          //......Ocupar espaco
  },

  // Barras de onda
  waveBars: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    justifyContent: 'center',         //......Centralizar horizontal
  },

  // Barra individual
  waveBar: {
    borderRadius: 1,                  //......Arredondamento
  },

  // Container do tempo
  timeContainer: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    justifyContent: 'center',         //......Centralizar horizontal
    marginTop: 4,                     //......Margem superior
  },

  // Texto do tempo
  timeText: {
    fontSize: 11,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
  },

  // Separador de tempo
  timeSeparator: {
    fontSize: 11,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
    marginHorizontal: 2,              //......Margem horizontal
  },

  // Botao de velocidade
  speedButton: {
    paddingHorizontal: 8,             //......Espaco horizontal
    paddingVertical: 4,               //......Espaco vertical
    backgroundColor: COLORS.backgroundLight, //..Fundo branco
    borderRadius: 6,                  //......Arredondamento
    marginLeft: 8,                    //......Margem esquerda
  },

  // Texto da velocidade
  speedText: {
    fontSize: 12,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.primary,            //......Cor azul
  },
});
