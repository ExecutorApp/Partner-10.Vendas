// ========================================
// Componente TranscriptionModal
// Modal para exibir e editar transcricao de audio
// Com sistema de versoes para melhorar mensagem
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, {                           //......React core
  useState,                               //......Hook de estado
  useEffect,                              //......Hook de efeito
  useCallback,                            //......Hook de callback
  useRef,                                 //......Hook de ref
} from 'react';                           //......Biblioteca React
import {                                  //......Componentes RN
  View,                                   //......Container basico
  Text,                                   //......Texto
  TextInput,                              //......Input texto
  StyleSheet,                             //......Estilos
  Modal,                                  //......Modal
  Pressable,                              //......Toque
  ActivityIndicator,                      //......Loading
  KeyboardAvoidingView,                   //......Evita teclado
  Platform,                               //......Plataforma
  Animated,                               //......Animacoes
  ScrollView,                             //......Scroll
} from 'react-native';                    //......Biblioteca RN
import Svg, {                             //......SVG core
  Path,                                   //......Path SVG
} from 'react-native-svg';                //......Biblioteca SVG

// ========================================
// Imports de Servicos
// ========================================
import aiService from '../../../../services/aiService';

// ========================================
// Constantes
// ========================================
const TAB_WIDTH = 44;                     //......Largura de cada aba
const TAB_GAP = 8;                        //......Espaco entre abas

// ========================================
// Interface de Props
// ========================================
interface TranscriptionModalProps {
  visible: boolean;                       //......Visibilidade do modal
  onClose: () => void;                    //......Handler fechar
  onSend: (text: string) => void;         //......Handler enviar texto
  onCancel: () => void;                   //......Handler cancelar
  isLoading?: boolean;                    //......Estado de loading
  initialText?: string;                   //......Texto inicial
  error?: string | null;                  //......Mensagem de erro
}

// ========================================
// Icone de Fechar (X)
// ========================================
const CloseIcon: React.FC<{ color: string; size: number }> = ({
  color,                                  //......Cor do icone
  size,                                   //......Tamanho
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6L18 18"
      stroke={color}                       //......Cor do stroke
      strokeWidth={1.5}                    //......Espessura fina
      strokeLinecap="round"                //......Ponta arredondada
      strokeLinejoin="round"               //......Juncao arredondada
    />
  </Svg>
);

// ========================================
// Icone de Enviar
// ========================================
const SendIcon: React.FC<{ color: string; size: number }> = ({
  color,                                  //......Cor do icone
  size,                                   //......Tamanho
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 2L11 13"
      stroke={color}                       //......Cor do stroke
      strokeWidth={2}                      //......Espessura
      strokeLinecap="round"                //......Ponta arredondada
      strokeLinejoin="round"               //......Juncao arredondada
    />
    <Path
      d="M22 2L15 22L11 13L2 9L22 2Z"
      stroke={color}                       //......Cor do stroke
      strokeWidth={2}                      //......Espessura
      strokeLinecap="round"                //......Ponta arredondada
      strokeLinejoin="round"               //......Juncao arredondada
    />
  </Svg>
);

// ========================================
// Icone de Melhorar (Varinha Magica)
// ========================================
const ImproveIcon: React.FC<{ color: string; size: number }> = ({
  color,                                  //......Cor do icone
  size,                                   //......Tamanho
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3L14.5 8.5L20 9.27L16 13.14L16.9 19L12 16.27L7.1 19L8 13.14L4 9.27L9.5 8.5L12 3Z"
      stroke={color}                       //......Cor do stroke
      strokeWidth={1.5}                    //......Espessura fina
      strokeLinecap="round"                //......Ponta arredondada
      strokeLinejoin="round"               //......Juncao arredondada
    />
  </Svg>
);

// ========================================
// Funcao para formatar numero com 2 digitos
// ========================================
const formatVersion = (index: number): string => {
  return String(index).padStart(2, '0');  //......Adiciona zero a esquerda
};

// ========================================
// Componente Principal TranscriptionModal
// ========================================
const TranscriptionModal: React.FC<TranscriptionModalProps> = ({
  visible,                                //......Visibilidade
  onClose,                                //......Handler fechar
  onSend,                                 //......Handler enviar
  onCancel,                               //......Handler cancelar
  isLoading = false,                      //......Loading padrao false
  initialText = '',                       //......Texto inicial vazio
  error = null,                           //......Erro padrao null
}) => {
  // ========================================
  // Estados
  // ========================================
  const [versions, setVersions] = useState<string[]>([initialText]);
  const [activeVersion, setActiveVersion] = useState(0);
  const [isImproving, setIsImproving] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);

  // ========================================
  // Texto atual da versao ativa
  // ========================================
  const text = versions[activeVersion] || '';

  // ========================================
  // Atualiza versoes quando initialText muda
  // ========================================
  useEffect(() => {
    if (initialText && visible) {
      setVersions([initialText]);
      setActiveVersion(0);
    }
  }, [initialText, visible]);

  // ========================================
  // Reset ao fechar modal
  // ========================================
  useEffect(() => {
    if (!visible) {
      setVersions(['']);
      setActiveVersion(0);
      setIsImproving(false);
    }
  }, [visible]);

  // ========================================
  // Animacao de entrada
  // ========================================
  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,                       //......Opacidade final
        duration: 200,                    //......Duracao
        useNativeDriver: true,            //......Native driver
      }).start();

      // Foca no input apos abrir
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible, fadeAnim]);

  // ========================================
  // Handler de Atualizar Texto da Versao Ativa
  // ========================================
  const handleTextChange = useCallback((newText: string) => {
    setVersions(prev => {
      const updated = [...prev];
      updated[activeVersion] = newText;
      return updated;
    });
  }, [activeVersion]);

  // ========================================
  // Handler de Melhorar Mensagem
  // ========================================
  const handleImprove = useCallback(async () => {
    if (!text.trim() || isImproving) return;

    setIsImproving(true);

    try {
      // Chama API para melhorar a mensagem
      const response = await aiService.sendChatMessage([
        {
          role: 'user',
          content: `Melhore esta mensagem de forma profissional e amigável, mantendo o mesmo sentido. Retorne apenas a mensagem melhorada, sem explicações:\n\n"${text.trim()}"`,
        },
      ]);

      // Adiciona nova versao
      const improvedText = response.message || text;
      setVersions(prev => [...prev, improvedText]);
      setActiveVersion(prev => prev + 1);

      // Scroll para mostrar ultima aba
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (err) {
      console.error('[TranscriptionModal] Erro ao melhorar:', err);
    } finally {
      setIsImproving(false);
    }
  }, [text, isImproving]);

  // ========================================
  // Handler de Enviar
  // ========================================
  const handleSend = useCallback(() => {
    const trimmedText = text.trim();
    if (trimmedText.length === 0) return; //......Valida texto vazio

    onSend(trimmedText);                  //......Chama callback
  }, [text, onSend]);

  // ========================================
  // Handler de Cancelar
  // ========================================
  const handleCancel = useCallback(() => {
    setVersions(['']);
    setActiveVersion(0);
    onCancel();                           //......Chama callback
  }, [onCancel]);

  // ========================================
  // Handler de Fechar
  // ========================================
  const handleClose = useCallback(() => {
    setVersions(['']);
    setActiveVersion(0);
    onClose();                            //......Chama callback
  }, [onClose]);

  // ========================================
  // Verifica se pode enviar
  // ========================================
  const canSend = text.trim().length > 0 && !isLoading && !isImproving;
  const canImprove = text.trim().length > 0 && !isLoading && !isImproving;

  // ========================================
  // Render Principal
  // ========================================
  return (
    <Modal
      visible={visible}                   //......Visibilidade
      transparent                         //......Fundo transparente
      animationType="none"                //......Sem animacao padrao
      onRequestClose={handleClose}        //......Android back button
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Fundo escuro com toque para fechar */}
        <Pressable
          style={styles.backdrop}
          onPress={handleClose}
        />

        {/* Container do Modal */}
        <Animated.View
          style={[
            styles.modalContainer,
            { opacity: fadeAnim },
          ]}
        >
          {/* Header do Modal */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Transcrição</Text>
            <View style={styles.headerButtons}>
              {/* Botao Melhorar */}
              <Pressable
                style={[
                  styles.headerButton,
                  !canImprove && styles.headerButtonDisabled,
                ]}
                onPress={handleImprove}
                disabled={!canImprove}
                hitSlop={8}
              >
                {isImproving ? (
                  <ActivityIndicator size="small" color="#1777CF" />
                ) : (
                  <ImproveIcon color={canImprove ? '#1777CF' : '#91929E'} size={20} />
                )}
              </Pressable>
              {/* Botao Fechar */}
              <Pressable
                style={styles.headerButton}
                onPress={handleClose}
                hitSlop={8}
              >
                <CloseIcon color="#7D8592" size={20} />
              </Pressable>
            </View>
          </View>

          {/* Abas de Versoes */}
          {versions.length > 1 && (
            <View style={styles.tabsContainer}>
              {/* Botao Original (Fixo) */}
              <Pressable
                style={[
                  styles.tabOriginal,
                  activeVersion === 0 && styles.tabActive,
                ]}
                onPress={() => setActiveVersion(0)}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeVersion === 0 && styles.tabTextActive,
                  ]}
                >
                  Original
                </Text>
              </Pressable>

              {/* ScrollView das Versoes */}
              <ScrollView
                ref={scrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.versionsContent}
              >
                {versions.slice(1).map((_, index) => (
                  <Pressable
                    key={index + 1}
                    style={[
                      styles.tabVersion,
                      activeVersion === index + 1 && styles.tabActive,
                    ]}
                    onPress={() => setActiveVersion(index + 1)}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        activeVersion === index + 1 && styles.tabTextActive,
                      ]}
                    >
                      {formatVersion(index + 1)}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Conteudo do Modal */}
          <View style={styles.content}>
            {/* Estado de Loading */}
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator
                  size="large"
                  color="#1777CF"
                />
                <Text style={styles.loadingText}>
                  Transcrevendo áudio...
                </Text>
              </View>
            )}

            {/* Estado de Erro */}
            {error && !isLoading && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                  {error}
                </Text>
              </View>
            )}

            {/* Campo de Texto */}
            {!isLoading && (
              <TextInput
                ref={inputRef}
                style={styles.textInput}
                placeholder="Digite ou edite a mensagem..."
                placeholderTextColor="#91929E"
                value={text}
                onChangeText={handleTextChange}
                multiline
                maxLength={2000}
                editable={!isLoading && !isImproving}
                textAlignVertical="top"
              />
            )}
          </View>

          {/* Footer com Botoes */}
          <View style={styles.footer}>
            {/* Botao Cancelar */}
            <Pressable
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={isLoading || isImproving}
            >
              <Text style={styles.cancelButtonText}>
                Cancelar
              </Text>
            </Pressable>

            {/* Botao Enviar */}
            <Pressable
              style={[
                styles.sendButton,
                !canSend && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!canSend}
            >
              <SendIcon
                color={canSend ? '#FFFFFF' : '#91929E'}
                size={18}
              />
              <Text
                style={[
                  styles.sendButtonText,
                  !canSend && styles.sendButtonTextDisabled,
                ]}
              >
                Enviar
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ========================================
// Export Default
// ========================================
export default TranscriptionModal;

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Overlay do modal
  overlay: {
    flex: 1,                              //......Ocupa todo espaco
    justifyContent: 'flex-end',           //......Alinha na base
  },

  // Fundo escuro
  backdrop: {
    ...StyleSheet.absoluteFillObject,     //......Preenche tudo
    backgroundColor: 'rgba(0, 0, 0, 0.5)', //......Preto 50%
  },

  // Container do modal
  modalContainer: {
    backgroundColor: '#FFFFFF',           //......Fundo branco
    borderTopLeftRadius: 20,              //......Arredonda canto
    borderTopRightRadius: 20,             //......Arredonda canto
    paddingBottom: 20,                    //......Padding inferior
    maxHeight: '70%',                     //......Altura maxima
    minHeight: 550,                       //......Altura minima
  },

  // Header
  header: {
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    justifyContent: 'space-between',      //......Espacamento
    paddingHorizontal: 20,                //......Padding horizontal
    paddingVertical: 16,                  //......Padding vertical
    borderBottomWidth: 1,                 //......Borda inferior
    borderBottomColor: '#E8ECF4',         //......Cor da borda
  },

  // Titulo do header
  headerTitle: {
    fontFamily: 'Inter_600SemiBold',      //......Fonte bold
    fontSize: 18,                         //......Tamanho fonte
    color: '#3A3F51',                     //......Cor do texto
  },

  // Container dos botoes do header
  headerButtons: {
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    gap: 8,                               //......Espaco entre botoes
  },

  // Botao do header (X e Melhorar)
  headerButton: {
    width: 36,                            //......Largura
    height: 36,                           //......Altura
    borderRadius: 6,                      //......Cantos levemente arredondados
    backgroundColor: '#F4F4F4',           //......Fundo cinza
    justifyContent: 'center',             //......Centraliza vertical
    alignItems: 'center',                 //......Centraliza horizontal
  },

  // Botao do header desabilitado
  headerButtonDisabled: {
    opacity: 0.5,                         //......Opacidade reduzida
  },

  // Container das abas
  tabsContainer: {
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    paddingHorizontal: 16,                //......Padding horizontal
    paddingVertical: 8,                   //......Padding vertical
    borderBottomWidth: 1,                 //......Borda inferior
    borderBottomColor: '#E8ECF4',         //......Cor da borda
    gap: 8,                               //......Espaco entre elementos
  },

  // Aba Original (fixa)
  tabOriginal: {
    paddingHorizontal: 12,                //......Padding horizontal
    paddingVertical: 8,                   //......Padding vertical
    borderRadius: 6,                      //......Cantos levemente arredondados
    backgroundColor: '#FFFFFF',           //......Fundo branco
    borderWidth: 1,                       //......Borda fina
    borderColor: '#E8ECF4',               //......Borda cinza
  },

  // Conteudo das versoes (scroll)
  versionsContent: {
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    gap: TAB_GAP,                         //......Espaco entre abas
  },

  // Aba de versao (numerada)
  tabVersion: {
    width: TAB_WIDTH,                     //......Largura fixa
    paddingVertical: 8,                   //......Padding vertical
    borderRadius: 6,                      //......Cantos levemente arredondados
    backgroundColor: '#FFFFFF',           //......Fundo branco
    borderWidth: 1,                       //......Borda fina
    borderColor: '#E8ECF4',               //......Borda cinza
    justifyContent: 'center',             //......Centraliza vertical
    alignItems: 'center',                 //......Centraliza horizontal
  },

  // Aba ativa
  tabActive: {
    backgroundColor: '#1777CF',           //......Fundo azul
    borderColor: '#1777CF',               //......Borda azul
  },

  // Texto da aba
  tabText: {
    fontFamily: 'Inter_500Medium',        //......Fonte medium
    fontSize: 13,                         //......Tamanho fonte
    color: '#7D8592',                     //......Cor cinza
  },

  // Texto da aba ativa
  tabTextActive: {
    color: '#FFFFFF',                     //......Cor branca
  },

  // Conteudo
  content: {
    flex: 1,                              //......Ocupa espaco
    paddingHorizontal: 20,                //......Padding horizontal
    paddingVertical: 16,                  //......Padding vertical
    minHeight: 150,                       //......Altura minima
  },

  // Container de loading
  loadingContainer: {
    flex: 1,                              //......Ocupa espaco
    justifyContent: 'center',             //......Centraliza vertical
    alignItems: 'center',                 //......Centraliza horizontal
    gap: 12,                              //......Espaco entre
  },

  // Texto de loading
  loadingText: {
    fontFamily: 'Inter_400Regular',       //......Fonte regular
    fontSize: 14,                         //......Tamanho fonte
    color: '#7D8592',                     //......Cor cinza
  },

  // Container de erro
  errorContainer: {
    backgroundColor: '#FEE2E2',           //......Fundo vermelho claro
    borderRadius: 8,                      //......Bordas arredondadas
    padding: 12,                          //......Padding
    marginBottom: 12,                     //......Margem inferior
  },

  // Texto de erro
  errorText: {
    fontFamily: 'Inter_400Regular',       //......Fonte regular
    fontSize: 14,                         //......Tamanho fonte
    color: '#DC2626',                     //......Cor vermelha
    textAlign: 'center',                  //......Centraliza texto
  },

  // Campo de texto
  textInput: {
    flex: 1,                              //......Ocupa espaco
    fontFamily: 'Inter_400Regular',       //......Fonte regular
    fontSize: 16,                         //......Tamanho fonte
    color: '#3A3F51',                     //......Cor do texto
    backgroundColor: '#F4F4F4',           //......Fundo cinza
    borderRadius: 12,                     //......Bordas arredondadas
    padding: 16,                          //......Padding
    minHeight: 120,                       //......Altura minima
    outlineStyle: 'none',                 //......Remove outline
  } as any,

  // Footer
  footer: {
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    justifyContent: 'flex-end',           //......Alinha direita
    paddingHorizontal: 20,                //......Padding horizontal
    gap: 12,                              //......Espaco entre
  },

  // Botao cancelar
  cancelButton: {
    paddingHorizontal: 20,                //......Padding horizontal
    paddingVertical: 12,                  //......Padding vertical
    borderRadius: 8,                      //......Bordas arredondadas
    backgroundColor: '#F4F4F4',           //......Fundo cinza
  },

  // Texto do botao cancelar
  cancelButtonText: {
    fontFamily: 'Inter_500Medium',        //......Fonte medium
    fontSize: 14,                         //......Tamanho fonte
    color: '#7D8592',                     //......Cor cinza
  },

  // Botao enviar
  sendButton: {
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    paddingHorizontal: 20,                //......Padding horizontal
    paddingVertical: 12,                  //......Padding vertical
    borderRadius: 8,                      //......Bordas arredondadas
    backgroundColor: '#1777CF',           //......Fundo azul
    gap: 8,                               //......Espaco entre
  },

  // Botao enviar desabilitado
  sendButtonDisabled: {
    backgroundColor: '#E8ECF4',           //......Fundo cinza claro
  },

  // Texto do botao enviar
  sendButtonText: {
    fontFamily: 'Inter_500Medium',        //......Fonte medium
    fontSize: 14,                         //......Tamanho fonte
    color: '#FFFFFF',                     //......Cor branca
  },

  // Texto do botao enviar desabilitado
  sendButtonTextDisabled: {
    color: '#91929E',                     //......Cor cinza
  },
});
