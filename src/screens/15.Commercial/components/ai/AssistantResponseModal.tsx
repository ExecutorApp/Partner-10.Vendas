// ========================================
// Componente AssistantResponseModal
// Modal responsivo lateral/bottom-up
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, {                       //......React core
  useEffect,                          //......Hook de efeito
  useRef,                             //......Hook de referencia
  useCallback,                        //......Hook de callback
  useMemo,                            //......Hook de memorizacao
} from 'react';                       //......Biblioteca React
import {                              //......Componentes RN
  View,                               //......Container basico
  Text,                               //......Texto
  TouchableOpacity,                   //......Botao tocavel
  StyleSheet,                         //......Estilos
  Modal,                              //......Modal
  Animated,                           //......Animacoes
  Dimensions,                         //......Dimensoes
  ScrollView,                         //......Scroll
  TouchableWithoutFeedback,           //......Toque sem feedback
  useWindowDimensions,                //......Hook dimensoes
} from 'react-native';                //......Biblioteca RN
import Svg, {                         //......Componentes SVG
  Path,                               //......Path do SVG
} from 'react-native-svg';            //......Biblioteca SVG

// ========================================
// Imports de Componentes
// ========================================
import VoicePlayer from './VoicePlayer';

// ========================================
// Constantes de Cores
// ========================================
const COLORS = {
  primary: '#1777CF',                 //......Azul principal
  background: '#FCFCFC',              //......Fundo branco
  backgroundAlt: '#F4F4F4',           //......Fundo cinza
  textPrimary: '#3A3F51',             //......Texto principal
  textSecondary: '#7D8592',           //......Texto secundario
  border: '#D8E0F0',                  //......Borda
  white: '#FFFFFF',                   //......Branco
  overlay: 'rgba(0,0,0,0.5)',         //......Overlay escuro
  danger: '#EF4444',                  //......Vermelho
  success: '#22C55E',                 //......Verde
};

// ========================================
// Constantes de Layout
// ========================================
const DESKTOP_BREAKPOINT = 768;       //......Breakpoint desktop
const DESKTOP_MODAL_WIDTH = 0.4;      //......40% da tela
const MOBILE_MODAL_HEIGHT = 0.7;      //......70% da tela
const ANIMATION_DURATION = 300;       //......Duracao animacao

// ========================================
// Icones SVG
// ========================================

// Icone Fechar
const CloseIcon = ({ color = COLORS.textSecondary }: { color?: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
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

// ========================================
// Tipos
// ========================================
export interface AIResponse {
  message: string;                    //......Mensagem da IA
  audioUrl?: string;                  //......URL do audio TTS
  suggestions?: AISuggestion[];       //......Sugestoes de acao
  contextId?: string;                 //......Id do contexto
  requiresConfirmation?: boolean;     //......Requer confirmacao
}

export interface AISuggestion {
  id: string;                         //......Id da sugestao
  label: string;                      //......Label da sugestao
  action: string;                     //......Acao a executar
  params?: Record<string, unknown>;   //......Parametros
}

// ========================================
// Interface de Props
// ========================================
interface AssistantResponseModalProps {
  visible: boolean;                   //......Se visivel
  onClose: () => void;                //......Callback fechar
  response: AIResponse | null;        //......Resposta da IA
  onConfirm?: () => void;             //......Callback confirmar
  onReject?: () => void;              //......Callback rejeitar
  onSuggestionSelect?: (suggestion: AISuggestion) => void;
}

// ========================================
// Componente AssistantResponseModal
// ========================================
const AssistantResponseModal: React.FC<AssistantResponseModalProps> = ({
  visible,                            //......Se visivel
  onClose,                            //......Callback fechar
  response,                           //......Resposta
  onConfirm,                          //......Callback confirmar
  onReject,                           //......Callback rejeitar
  onSuggestionSelect,                 //......Callback sugestao
}) => {
  // ========================================
  // Dimensoes da Tela
  // ========================================
  const { width, height } = useWindowDimensions();
  const isDesktop = width > DESKTOP_BREAKPOINT;

  // ========================================
  // Refs de Animacao
  // ========================================
  const slideAnim = useRef(new Animated.Value(isDesktop ? width : height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // ========================================
  // Memos de Layout
  // ========================================
  const modalStyle = useMemo(() => {
    if (isDesktop) {
      return {
        width: width * DESKTOP_MODAL_WIDTH,
        height: '100%' as const,
        right: 0,                     //......Alinhado direita
        top: 0,                       //......Alinhado topo
        transform: [{ translateX: slideAnim }],
      };
    }
    return {
      width: '100%' as const,
      height: height * MOBILE_MODAL_HEIGHT,
      bottom: 0,                      //......Alinhado base
      left: 0,                        //......Alinhado esquerda
      transform: [{ translateY: slideAnim }],
    };
  }, [isDesktop, width, height, slideAnim]);

  // ========================================
  // Efeito: Animacao de entrada/saida
  // ========================================
  useEffect(() => {
    if (visible) {
      // Resetar posicao inicial
      slideAnim.setValue(isDesktop ? width * DESKTOP_MODAL_WIDTH : height * MOBILE_MODAL_HEIGHT);

      // Animar entrada
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,                 //......Posicao final
          duration: ANIMATION_DURATION,
          useNativeDriver: true,      //......Usar driver nativo
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,                 //......Opacidade final
          duration: ANIMATION_DURATION,
          useNativeDriver: true,      //......Usar driver nativo
        }),
      ]).start();
    } else {
      // Animar saida
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: isDesktop ? width * DESKTOP_MODAL_WIDTH : height * MOBILE_MODAL_HEIGHT,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,      //......Usar driver nativo
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,                 //......Opacidade final
          duration: ANIMATION_DURATION,
          useNativeDriver: true,      //......Usar driver nativo
        }),
      ]).start();
    }
  }, [visible, isDesktop, width, height, slideAnim, fadeAnim]);

  // ========================================
  // Handler: Fechar modal
  // ========================================
  const handleClose = useCallback(() => {
    onClose();                        //......Chamar callback
  }, [onClose]);

  // ========================================
  // Handler: Selecionar sugestao
  // ========================================
  const handleSuggestionPress = useCallback((suggestion: AISuggestion) => {
    onSuggestionSelect?.(suggestion); //......Chamar callback
    onClose();                        //......Fechar modal
  }, [onSuggestionSelect, onClose]);

  // ========================================
  // Handler: Confirmar
  // ========================================
  const handleConfirm = useCallback(() => {
    onConfirm?.();                    //......Chamar callback
    onClose();                        //......Fechar modal
  }, [onConfirm, onClose]);

  // ========================================
  // Handler: Rejeitar
  // ========================================
  const handleReject = useCallback(() => {
    onReject?.();                     //......Chamar callback
    onClose();                        //......Fechar modal
  }, [onReject, onClose]);

  // ========================================
  // Render: Sugestoes
  // ========================================
  const renderSuggestions = useCallback(() => {
    if (!response?.suggestions?.length) return null;

    return (
      <View style={styles.suggestionsContainer}>
        <Text style={styles.suggestionsTitle}>Sugestoes</Text>
        <View style={styles.suggestionsList}>
          {response.suggestions.map(suggestion => (
            <TouchableOpacity
              key={suggestion.id}
              style={styles.suggestionChip}
              onPress={() => handleSuggestionPress(suggestion)}
              activeOpacity={0.7}
            >
              <Text style={styles.suggestionText}>
                {suggestion.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }, [response?.suggestions, handleSuggestionPress]);

  // ========================================
  // Render: Botoes de Confirmacao
  // ========================================
  const renderConfirmationButtons = useCallback(() => {
    if (!response?.requiresConfirmation) return null;

    return (
      <View style={styles.confirmationContainer}>
        <TouchableOpacity
          style={[styles.confirmButton, styles.rejectButton]}
          onPress={handleReject}
          activeOpacity={0.7}
        >
          <Text style={styles.rejectButtonText}>Rejeitar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.confirmButton, styles.acceptButton]}
          onPress={handleConfirm}
          activeOpacity={0.7}
        >
          <CheckIcon color={COLORS.white} />
          <Text style={styles.acceptButtonText}>Confirmar</Text>
        </TouchableOpacity>
      </View>
    );
  }, [response?.requiresConfirmation, handleConfirm, handleReject]);

  // ========================================
  // Se nao visivel ou sem resposta
  // ========================================
  if (!visible || !response) return null;

  // ========================================
  // Render
  // ========================================
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      {/* Overlay */}
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View
          style={[
            styles.overlay,
            { opacity: fadeAnim },
          ]}
        />
      </TouchableWithoutFeedback>

      {/* Modal Container */}
      <Animated.View
        style={[
          styles.modalContainer,
          isDesktop ? styles.modalDesktop : styles.modalMobile,
          modalStyle,
        ]}
      >
        {/* Drag Handle (Mobile) */}
        {!isDesktop && (
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>
        )}

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Assistente IA</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <CloseIcon color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Conteudo */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Voice Player */}
          {response.audioUrl && (
            <View style={styles.voicePlayerContainer}>
              <VoicePlayer
                uri={response.audioUrl}
                autoPlay={true}
                showSpeedControl={true}
                size="medium"
              />
            </View>
          )}

          {/* Mensagem */}
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>
              {response.message}
            </Text>
          </View>

          {/* Sugestoes */}
          {renderSuggestions()}
        </ScrollView>

        {/* Botoes de Confirmacao */}
        {renderConfirmationButtons()}
      </Animated.View>
    </Modal>
  );
};

// ========================================
// Export Default
// ========================================
export default AssistantResponseModal;

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Overlay
  overlay: {
    ...StyleSheet.absoluteFillObject, //......Preencher tudo
    backgroundColor: COLORS.overlay,  //......Fundo escuro
  },

  // Container do modal
  modalContainer: {
    position: 'absolute',             //......Posicao absoluta
    backgroundColor: COLORS.background, //....Fundo branco
  },

  // Modal desktop
  modalDesktop: {
    borderTopLeftRadius: 16,          //......Arredondamento
    borderBottomLeftRadius: 16,       //......Arredondamento
    shadowColor: '#000',              //......Cor sombra
    shadowOffset: {
      width: -2,                      //......Offset X
      height: 0,                      //......Offset Y
    },
    shadowOpacity: 0.1,               //......Opacidade sombra
    shadowRadius: 10,                 //......Raio sombra
    elevation: 10,                    //......Elevacao Android
  },

  // Modal mobile
  modalMobile: {
    borderTopLeftRadius: 20,          //......Arredondamento
    borderTopRightRadius: 20,         //......Arredondamento
    shadowColor: '#000',              //......Cor sombra
    shadowOffset: {
      width: 0,                       //......Offset X
      height: -2,                     //......Offset Y
    },
    shadowOpacity: 0.1,               //......Opacidade sombra
    shadowRadius: 10,                 //......Raio sombra
    elevation: 10,                    //......Elevacao Android
  },

  // Container do drag handle
  dragHandleContainer: {
    alignItems: 'center',             //......Centralizar
    paddingVertical: 10,              //......Espaco vertical
  },

  // Drag handle
  dragHandle: {
    width: 40,                        //......Largura
    height: 4,                        //......Altura
    backgroundColor: COLORS.border,   //......Cor cinza
    borderRadius: 2,                  //......Arredondamento
  },

  // Header
  header: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    justifyContent: 'space-between',  //......Espaco entre
    paddingHorizontal: 16,            //......Espaco horizontal
    paddingVertical: 12,              //......Espaco vertical
    borderBottomWidth: 1,             //......Borda inferior
    borderBottomColor: COLORS.border, //......Cor da borda
  },

  // Titulo do header
  headerTitle: {
    fontSize: 18,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.textPrimary,        //......Cor texto
  },

  // Botao fechar
  closeButton: {
    padding: 4,                       //......Espaco interno
  },

  // Conteudo
  content: {
    flex: 1,                          //......Ocupar espaco
  },

  // Container do conteudo
  contentContainer: {
    padding: 16,                      //......Espaco interno
  },

  // Container do VoicePlayer
  voicePlayerContainer: {
    marginBottom: 16,                 //......Margem inferior
  },

  // Container da mensagem
  messageContainer: {
    backgroundColor: COLORS.backgroundAlt, //..Fundo cinza
    borderRadius: 12,                 //......Arredondamento
    padding: 16,                      //......Espaco interno
    marginBottom: 16,                 //......Margem inferior
  },

  // Texto da mensagem
  messageText: {
    fontSize: 15,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textPrimary,        //......Cor texto
    lineHeight: 22,                   //......Altura linha
  },

  // Container de sugestoes
  suggestionsContainer: {
    marginBottom: 16,                 //......Margem inferior
  },

  // Titulo sugestoes
  suggestionsTitle: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.textSecondary,      //......Cor secundaria
    marginBottom: 8,                  //......Margem inferior
  },

  // Lista de sugestoes
  suggestionsList: {
    flexDirection: 'row',             //......Layout horizontal
    flexWrap: 'wrap',                 //......Quebrar linha
    gap: 8,                           //......Espaco entre
  },

  // Chip de sugestao
  suggestionChip: {
    backgroundColor: COLORS.backgroundAlt, //..Fundo cinza
    borderWidth: 1,                   //......Largura borda
    borderColor: COLORS.primary,      //......Cor azul
    borderRadius: 20,                 //......Arredondamento
    paddingHorizontal: 14,            //......Espaco horizontal
    paddingVertical: 8,               //......Espaco vertical
  },

  // Texto da sugestao
  suggestionText: {
    fontSize: 13,                     //......Tamanho fonte
    fontFamily: 'Inter_500Medium',    //......Fonte Inter Medium
    color: COLORS.primary,            //......Cor azul
  },

  // Container de confirmacao
  confirmationContainer: {
    flexDirection: 'row',             //......Layout horizontal
    gap: 12,                          //......Espaco entre
    padding: 16,                      //......Espaco interno
    borderTopWidth: 1,                //......Borda superior
    borderTopColor: COLORS.border,    //......Cor da borda
  },

  // Botao de confirmacao
  confirmButton: {
    flex: 1,                          //......Ocupar espaco igual
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    justifyContent: 'center',         //......Centralizar horizontal
    paddingVertical: 12,              //......Espaco vertical
    borderRadius: 10,                 //......Arredondamento
    gap: 6,                           //......Espaco entre
  },

  // Botao rejeitar
  rejectButton: {
    backgroundColor: COLORS.backgroundAlt, //..Fundo cinza
    borderWidth: 1,                   //......Largura borda
    borderColor: COLORS.border,       //......Cor borda
  },

  // Texto botao rejeitar
  rejectButtonText: {
    fontSize: 15,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.textSecondary,      //......Cor secundaria
  },

  // Botao aceitar
  acceptButton: {
    backgroundColor: COLORS.success,  //......Fundo verde
  },

  // Texto botao aceitar
  acceptButtonText: {
    fontSize: 15,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.white,              //......Cor branca
  },
});
