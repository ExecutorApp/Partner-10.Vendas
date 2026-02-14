// ========================================
// Componente TextInputModal
// Modal para input de texto no editor de fotos
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, { memo, useState, useCallback, useRef, useEffect } from 'react';
import { View, TextInput, Pressable, Text, StyleSheet, Modal, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import Svg, { Path } from 'react-native-svg';

// ========================================
// Imports de Constantes
// ========================================
import { EditorColors } from '../../utils/editorConstants';

// ========================================
// Constantes de Fontes Disponiveis
// ========================================
const AVAILABLE_FONTS = [
  { name: 'Arial', label: 'Arial' },
  { name: 'Georgia', label: 'Georgia' },
  { name: 'Times New Roman', label: 'Times' },
  { name: 'Courier New', label: 'Courier' },
  { name: 'Verdana', label: 'Verdana' },
  { name: 'Impact', label: 'Impact' },
  { name: 'Comic Sans MS', label: 'Comic' },
  { name: 'Trebuchet MS', label: 'Trebuchet' },
];

// ========================================
// Tipos
// ========================================
interface TextInputModalProps {
  visible: boolean;                         //......Modal visivel
  initialText?: string;                     //......Texto inicial
  onConfirm: (text: string, fontFamily: string, uppercase: boolean) => void;  //......Callback confirmar
  onCancel: () => void;                     //......Callback cancelar
}

// ========================================
// Componente Principal TextInputModal
// ========================================
const TextInputModal: React.FC<TextInputModalProps> = memo(({
  visible,
  initialText = '',
  onConfirm,
  onCancel,
}) => {
  // ========================================
  // Estado Local
  // ========================================
  const [text, setText] = useState(initialText);
  const [selectedFont, setSelectedFont] = useState('Arial');
  const [isUppercase, setIsUppercase] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);

  // ========================================
  // Focar input quando abrir
  // ========================================
  useEffect(() => {
    if (visible) {
      setText(initialText);
      setSelectedFont('Arial');
      setIsUppercase(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [visible, initialText]);

  // ========================================
  // Handlers
  // ========================================
  const handleConfirm = useCallback(() => {
    if (text.trim()) {
      onConfirm(text.trim(), selectedFont, isUppercase);
    }
  }, [text, selectedFont, isUppercase, onConfirm]);

  const handleCancel = useCallback(() => {
    setText('');
    setSelectedFont('Arial');
    setIsUppercase(false);
    onCancel();
  }, [onCancel]);

  const handleClearText = useCallback(() => {
    setText('');
    inputRef.current?.focus();
  }, []);

  const handleToggleCase = useCallback(() => {
    setIsUppercase(prev => !prev);
  }, []);

  const handleSelectFont = useCallback((fontName: string) => {
    setSelectedFont(fontName);
  }, []);

  // ========================================
  // Texto para Preview
  // ========================================
  const displayText = isUppercase ? text.toUpperCase() : text;

  // ========================================
  // Render
  // ========================================
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={styles.backdrop} onPress={handleCancel} />

        <View style={styles.container}>
          {/* Titulo */}
          <Text style={styles.title}>Adicionar Texto</Text>

          {/* Divisoria 1 - Abaixo do titulo */}
          <View style={styles.divider} />

          {/* Toggle Maiuscula/Minuscula */}
          <View style={styles.caseToggleContainer}>
            <Pressable
              style={[styles.caseButton, !isUppercase && styles.caseButtonActive]}
              onPress={() => setIsUppercase(false)}
            >
              <Text style={[styles.caseButtonText, !isUppercase && styles.caseButtonTextActive]}>
                Aa
              </Text>
            </Pressable>
            <Pressable
              style={[styles.caseButton, isUppercase && styles.caseButtonActive]}
              onPress={() => setIsUppercase(true)}
            >
              <Text style={[styles.caseButtonText, isUppercase && styles.caseButtonTextActive]}>
                AA
              </Text>
            </Pressable>
          </View>

          {/* Divisoria 2 - Entre toggle e carrossel */}
          <View style={styles.divider} />

          {/* Carrossel de Fontes */}
          <View style={styles.fontCarouselContainer}>
            <ScrollView
              ref={scrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.fontCarouselContent}
            >
              {AVAILABLE_FONTS.map((font) => (
                <Pressable
                  key={font.name}
                  style={[
                    styles.fontButton,
                    selectedFont === font.name && styles.fontButtonActive,
                  ]}
                  onPress={() => handleSelectFont(font.name)}
                >
                  <Text
                    style={[
                      styles.fontButtonText,
                      { fontFamily: font.name },
                      selectedFont === font.name && styles.fontButtonTextActive,
                    ]}
                  >
                    {font.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Divisoria 3 - Abaixo do carrossel */}
          <View style={styles.dividerLarge} />

          {/* Input com botao limpar */}
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={[styles.input, { fontFamily: selectedFont }]}
              value={displayText}
              onChangeText={(newText) => setText(isUppercase ? newText.toLowerCase() : newText)}
              placeholder="Digite seu texto..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              multiline
              maxLength={200}
              autoFocus
            />

            {/* Botao limpar (X) - aparece quando tem texto */}
            {text.length > 0 && (
              <Pressable style={styles.clearButton} onPress={handleClearText}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                    fill="rgba(255,255,255,0.6)"
                  />
                </Svg>
              </Pressable>
            )}
          </View>

          {/* Contador */}
          <Text style={styles.counter}>{text.length}/200</Text>

          {/* Botoes na parte inferior */}
          <View style={styles.buttonContainer}>
            <Pressable style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </Pressable>

            <Pressable
              style={[styles.confirmButton, !text.trim() && styles.buttonDisabled]}
              onPress={handleConfirm}
              disabled={!text.trim()}
            >
              <Text style={[styles.buttonText, !text.trim() && styles.buttonTextDisabled]}>
                Adicionar
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
});

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Overlay
  overlay: {
    flex: 1,                                //......Ocupa tudo
    justifyContent: 'center',               //......Centraliza vertical
    alignItems: 'center',                   //......Centraliza horizontal
  },

  // Backdrop
  backdrop: {
    ...StyleSheet.absoluteFillObject,       //......Preenche tudo
    backgroundColor: 'rgba(0,0,0,0.8)',     //......Fundo escuro
  },

  // Container principal
  container: {
    width: '90%',                           //......Largura 90%
    maxWidth: 400,                          //......Largura maxima
    backgroundColor: 'rgba(30,30,30,0.95)', //......Fundo escuro
    borderRadius: 16,                       //......Bordas arredondadas
    padding: 16,                            //......Padding
    zIndex: 10,                             //......Camada superior
  },

  // Titulo
  title: {
    fontSize: 16,                           //......Tamanho
    fontWeight: '600',                      //......Peso
    color: '#FFFFFF',                       //......Cor branca
    textAlign: 'center',                    //......Centralizado
  },

  // Divisoria padrao
  divider: {
    height: 1,                              //......Altura da linha
    backgroundColor: 'rgba(255,255,255,0.03)', //......Cor quase transparente
    marginVertical: 12,                     //......Margem vertical
  },

  // Divisoria com mais espaco
  dividerLarge: {
    height: 1,                              //......Altura da linha
    backgroundColor: 'rgba(255,255,255,0.03)', //......Cor quase transparente
    marginTop: 12,                          //......Margem superior
    marginBottom: 16,                       //......Margem inferior maior
  },

  // Container do toggle de case
  caseToggleContainer: {
    flexDirection: 'row',                   //......Layout horizontal
    justifyContent: 'flex-start',           //......Alinha esquerda
    gap: 8,                                 //......Espaco entre botoes
  },

  // Botao de case (Aa / AA)
  caseButton: {
    paddingHorizontal: 20,                  //......Padding horizontal
    borderRadius: 8,                        //......Bordas arredondadas
    backgroundColor: 'rgba(0,0,0,0.3)',     //......Fundo escuro
    minWidth: 60,                           //......Largura minima
    height: 36,                             //......Altura fixa
    alignItems: 'center',                   //......Centraliza texto
    justifyContent: 'center',               //......Centraliza vertical
  },

  // Botao de case ativo
  caseButtonActive: {
    backgroundColor: 'rgba(23,119,207,0.6)', //......Fundo azul
  },

  // Texto do botao de case
  caseButtonText: {
    fontSize: 16,                           //......Tamanho
    fontWeight: '600',                      //......Peso
    color: 'rgba(255,255,255,0.6)',         //......Cor cinza
  },

  // Texto do botao de case ativo
  caseButtonTextActive: {
    color: '#FFFFFF',                       //......Cor branca
  },

  // Container do carrossel de fontes
  fontCarouselContainer: {
    height: 36,                             //......Altura igual ao toggle
  },

  // Conteudo do carrossel
  fontCarouselContent: {
    gap: 8,                                 //......Espaco entre itens
    alignItems: 'center',                   //......Centraliza vertical
  },

  // Botao de fonte
  fontButton: {
    paddingHorizontal: 16,                  //......Padding horizontal
    paddingVertical: 8,                     //......Padding vertical
    borderRadius: 8,                        //......Bordas arredondadas
    backgroundColor: 'rgba(0,0,0,0.3)',     //......Fundo escuro
    alignItems: 'center',                   //......Centraliza texto
    justifyContent: 'center',               //......Centraliza vertical
    height: 36,                             //......Altura igual ao toggle
  },

  // Botao de fonte ativo
  fontButtonActive: {
    backgroundColor: 'rgba(23,119,207,0.6)', //......Fundo azul
  },

  // Texto do botao de fonte
  fontButtonText: {
    fontSize: 14,                           //......Tamanho
    color: 'rgba(255,255,255,0.6)',         //......Cor cinza
  },

  // Texto do botao de fonte ativo
  fontButtonTextActive: {
    color: '#FFFFFF',                       //......Cor branca
  },

  // Container do input
  inputContainer: {
    minHeight: 100,                         //......Altura minima
    backgroundColor: 'rgba(0,0,0,0.3)',     //......Fundo escuro
    borderRadius: 12,                       //......Bordas arredondadas
    padding: 12,                            //......Padding
    position: 'relative',                   //......Para posicionar botao X
  },

  // Input
  input: {
    fontSize: 18,                           //......Tamanho padrao
    color: '#FFFFFF',                       //......Cor branca
    textAlignVertical: 'top',               //......Alinha topo
    minHeight: 80,                          //......Altura minima
    paddingRight: 30,                       //......Espaco para botao X
    // @ts-ignore - propriedade web para remover borda de foco
    outlineStyle: 'none',                   //......Remove borda de foco
  },

  // Botao limpar texto (X)
  clearButton: {
    position: 'absolute',                   //......Posicao absoluta
    top: 12,                                //......Distancia do topo
    right: 12,                              //......Distancia da direita
    width: 24,                              //......Largura
    height: 24,                             //......Altura
    borderRadius: 12,                       //......Circular
    backgroundColor: 'rgba(255,255,255,0.1)', //......Fundo sutil
    justifyContent: 'center',               //......Centraliza vertical
    alignItems: 'center',                   //......Centraliza horizontal
  },

  // Contador
  counter: {
    fontSize: 12,                           //......Tamanho pequeno
    color: 'rgba(255,255,255,0.5)',         //......Cor cinza
    textAlign: 'right',                     //......Alinha direita
    marginTop: 8,                           //......Margem superior
  },

  // Container dos botoes
  buttonContainer: {
    flexDirection: 'row',                   //......Layout horizontal
    justifyContent: 'space-between',        //......Espacar botoes
    marginTop: 20,                          //......Margem superior
    gap: 12,                                //......Espaco entre botoes
  },

  // Botao cancelar (cinza)
  cancelButton: {
    flex: 1,                                //......Ocupa espaco igual
    paddingVertical: 14,                    //......Padding vertical
    backgroundColor: 'rgba(128,128,128,0.6)', //......Cinza
    borderRadius: 8,                        //......Bordas arredondadas
    alignItems: 'center',                   //......Centraliza texto
  },

  // Texto do botao cancelar
  cancelButtonText: {
    fontSize: 16,                           //......Tamanho
    fontWeight: '600',                      //......Peso
    color: '#FFFFFF',                       //......Cor branca
  },

  // Botao confirmar (azul)
  confirmButton: {
    flex: 1,                                //......Ocupa espaco igual
    paddingVertical: 14,                    //......Padding vertical
    backgroundColor: EditorColors.buttonActive, //......Azul
    borderRadius: 8,                        //......Bordas arredondadas
    alignItems: 'center',                   //......Centraliza texto
  },

  // Botao desabilitado
  buttonDisabled: {
    opacity: 0.5,                           //......Opacidade reduzida
  },

  // Texto do botao
  buttonText: {
    fontSize: 16,                           //......Tamanho
    fontWeight: '600',                      //......Peso
    color: '#FFFFFF',                       //......Cor branca
  },

  // Texto do botao desabilitado
  buttonTextDisabled: {
    color: 'rgba(255,255,255,0.5)',         //......Cor cinza
  },
});

// ========================================
// Export
// ========================================
export default TextInputModal;
