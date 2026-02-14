// ========================================
// Componente CaptionInput
// Campo de legenda estilo WhatsApp
// Layout: Input com X para limpar (linha 1)
// Layout: Destinatario | Camera | ViewOnce | Enviar (linha 2)
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, { memo, useState, useCallback, useEffect, useRef } from 'react';
import { View, TextInput, Pressable, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, { Path } from 'react-native-svg';

// ========================================
// Imports de Constantes
// ========================================
import { CameraColors, CameraStyles, CameraIcons } from '../utils/cameraConstants';

// ========================================
// Imports de Componentes
// ========================================
import SendButton from './SendButton';

// ========================================
// Constantes de Altura Dinamica
// Mesma logica do InputBar do chat
// ========================================
const MIN_INPUT_HEIGHT = 45;              //......Altura minima (1 linha)
const LINE_HEIGHT = 20;                   //......Altura de cada linha de texto
const MAX_LINES = 5;                      //......Maximo de linhas visiveis
const MAX_INPUT_HEIGHT = MIN_INPUT_HEIGHT + (LINE_HEIGHT * (MAX_LINES - 1));
const PADDING_VERTICAL = 24;              //......Padding vertical total (12 top + 12 bottom)
const BUTTON_SIZE = 40;                   //......Tamanho dos botoes de acao

// ========================================
// Interface de Props
// ========================================
interface CaptionInputProps {
  value: string;                          //......Valor do input
  onChangeText: (text: string) => void;   //......Handler de mudanca
  onSend: () => void;                     //......Handler de envio
  recipientName: string;                  //......Nome do destinatario
  viewOnce?: boolean;                     //......View once ativo
  onToggleViewOnce?: () => void;          //......Toggle view once
  onOpenCamera?: () => void;              //......Abre camera para adicionar midia
  onSelectRecipients?: () => void;        //......Abre modal de destinatarios
  placeholder?: string;                   //......Placeholder customizado
  isSending?: boolean;                    //......Estado de envio
  showCameraButton?: boolean;             //......Mostrar botao camera
  onHeightChange?: (height: number) => void;  //......Callback de altura total
}

// ========================================
// Icone de Camera (para botao de acao)
// ========================================
const CameraIcon: React.FC = memo(() => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d={CameraIcons.camera} fill={CameraColors.textWhite} />
  </Svg>
));

// ========================================
// Icone de View Once
// Numero "1" bold - azul quando ativo, branco quando inativo
// ========================================
const ViewOnceIcon: React.FC<{ active: boolean }> = memo(({ active }) => (
  <View style={{ width: 24, height: 24, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{
      fontSize: 20,
      fontWeight: '900',
      color: active ? CameraColors.primary : CameraColors.textWhite,
      includeFontPadding: false,
      textAlignVertical: 'center',
    }}>
      1
    </Text>
  </View>
));

// ========================================
// Icone de Limpar (X slim)
// Aparece quando ha texto no input
// ========================================
const ClearIcon: React.FC = memo(() => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6l12 12"
      stroke={CameraColors.textSecondary}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
));

// ========================================
// Icone de Seta (indicador de selecao)
// ========================================
const ChevronIcon: React.FC = memo(() => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 10l5 5 5-5"
      stroke={CameraColors.textSecondary}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
));

// ========================================
// Componente Principal CaptionInput
// ========================================
const CaptionInput: React.FC<CaptionInputProps> = memo(({
  value,                                  //......Valor do input
  onChangeText,                           //......Handler de mudanca
  onSend,                                 //......Handler de envio
  recipientName,                          //......Nome do destinatario
  viewOnce = false,                       //......View once ativo
  onToggleViewOnce,                       //......Toggle view once
  onOpenCamera,                           //......Abre camera
  onSelectRecipients,                     //......Abre modal destinatarios
  placeholder = 'Adicione uma legenda...', //......Placeholder
  isSending = false,                      //......Estado de envio
  showCameraButton = true,                //......Mostrar botao camera
  onHeightChange,                         //......Callback altura total
}) => {
  // ========================================
  // Estados e Refs
  // ========================================
  const [inputHeight, setInputHeight] = useState(MIN_INPUT_HEIGHT);
  const inputRef = useRef<any>(null);
  const shadowRef = useRef<HTMLTextAreaElement | null>(null);
  const previousValueRef = useRef('');

  // ========================================
  // Cria elemento shadow para medicao (apenas web)
  // ========================================
  useEffect(() => {
    if (typeof document === 'undefined') return;

    console.log('[CaptionInput] Criando shadow element...');

    // Cria textarea invisivel para medir altura
    const shadow = document.createElement('textarea');
    shadow.style.cssText = `
      position: absolute;
      top: -9999px;
      left: -9999px;
      visibility: hidden;
      height: auto;
      min-height: 0;
      max-height: none;
      overflow: hidden;
      font-size: 15px;
      line-height: ${LINE_HEIGHT}px;
      padding-top: 12px;
      padding-bottom: 12px;
      padding-left: 0;
      padding-right: 0;
      border: none;
      box-sizing: border-box;
      white-space: pre-wrap;
      word-wrap: break-word;
    `;
    document.body.appendChild(shadow);
    shadowRef.current = shadow;

    console.log('[CaptionInput] Shadow element criado:', !!shadow);

    return () => {
      if (shadowRef.current) {
        document.body.removeChild(shadowRef.current);
        shadowRef.current = null;
      }
    };
  }, []);

  // ========================================
  // Funcao para calcular altura via elemento shadow
  // ========================================
  const calculateHeight = useCallback((text: string, width: number) => {
    if (!shadowRef.current) return MIN_INPUT_HEIGHT;

    // Configura largura igual ao input real
    shadowRef.current.style.width = `${width}px`;
    shadowRef.current.value = text;

    // Mede altura
    const scrollHeight = shadowRef.current.scrollHeight;

    console.log('[CaptionInput] shadow scrollHeight:', scrollHeight, 'width:', width, 'text:', text.length);

    // Calcula numero de linhas
    const textHeight = scrollHeight - PADDING_VERTICAL;
    const numLines = Math.max(1, Math.round(textHeight / LINE_HEIGHT));

    console.log('[CaptionInput] calculated numLines:', numLines);

    // Retorna altura
    if (numLines <= 1) {
      return MIN_INPUT_HEIGHT;
    } else {
      const extraLines = Math.min(numLines - 1, MAX_LINES - 1);
      const newHeight = MIN_INPUT_HEIGHT + (extraLines * LINE_HEIGHT);
      return Math.min(newHeight, MAX_INPUT_HEIGHT);
    }
  }, []);

  // ========================================
  // Handler de Mudanca de Tamanho do Conteudo
  // Para iOS/Android nativo
  // ========================================
  const handleContentSizeChange = useCallback((event: any) => {
    const contentHeight = event.nativeEvent.contentSize.height;
    const textHeight = contentHeight - PADDING_VERTICAL;
    const numLines = Math.max(1, Math.round(textHeight / LINE_HEIGHT));

    console.log('[CaptionInput] onContentSizeChange:', {
      contentHeight,
      textHeight,
      numLines,
    });

    if (numLines <= 1) {
      setInputHeight(MIN_INPUT_HEIGHT);
    } else {
      const extraLines = Math.min(numLines - 1, MAX_LINES - 1);
      const newHeight = MIN_INPUT_HEIGHT + (extraLines * LINE_HEIGHT);
      setInputHeight(Math.min(newHeight, MAX_INPUT_HEIGHT));
    }
  }, []);

  // ========================================
  // Efeito para recalcular altura quando texto muda (web)
  // Usa elemento shadow para medicao precisa
  // ========================================
  useEffect(() => {
    console.log('[CaptionInput] useEffect value changed:', {
      valueLength: value.length,
      previousLength: previousValueRef.current.length,
      currentHeight: inputHeight,
      hasShadow: !!shadowRef.current,
      hasInputRef: !!inputRef.current,
    });

    // Texto vazio - reseta imediatamente
    if (value === '') {
      console.log('[CaptionInput] Texto vazio - resetando para MIN_INPUT_HEIGHT');
      setInputHeight(MIN_INPUT_HEIGHT);
      previousValueRef.current = value;
      return;
    }

    // Texto diminuiu - precisa recalcular
    const textDecreased = value.length < previousValueRef.current.length;

    console.log('[CaptionInput] textDecreased:', textDecreased);

    if (textDecreased && inputRef.current && inputHeight > MIN_INPUT_HEIGHT) {
      console.log('[CaptionInput] Texto diminuiu e altura > MIN, forcando recalculo...');

      // Forca altura para 1px temporariamente para trigger onContentSizeChange
      setInputHeight(1);

      // Restaura no proximo frame - onContentSizeChange vai calcular corretamente
      requestAnimationFrame(() => {
        console.log('[CaptionInput] Aguardando onContentSizeChange recalcular...');
      });
    }

    previousValueRef.current = value;
  }, [value, calculateHeight, inputHeight]);

  // ========================================
  // Handler de Limpar Texto
  // ========================================
  const handleClear = useCallback(() => {
    onChangeText('');
  }, [onChangeText]);

  // ========================================
  // Handler de Layout do Container
  // Informa altura total ao componente pai
  // ========================================
  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    onHeightChange?.(height);
  }, [onHeightChange]);

  // ========================================
  // Verifica se ha texto para mostrar X
  // ========================================
  const hasText = value.length > 0;

  // ========================================
  // Render Principal
  // ========================================
  return (
    <View style={styles.container} onLayout={handleLayout}>
      {/* Linha 1: Campo de Input com X para limpar */}
      <View style={styles.inputRow}>
        <TextInput
          ref={inputRef}
          style={[styles.input, { height: inputHeight }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={CameraColors.inputPlaceholder}
          multiline={true}
          maxLength={1000}
          scrollEnabled={inputHeight >= MAX_INPUT_HEIGHT}
          onContentSizeChange={handleContentSizeChange}
          textAlignVertical="center"
        />

        {/* Botao X para limpar (aparece quando ha texto) */}
        {hasText && (
          <Pressable style={styles.clearButton} onPress={handleClear} hitSlop={8}>
            <ClearIcon />
          </Pressable>
        )}
      </View>

      {/* Linha 2: Destinatario + Acoes + Enviar */}
      <View style={styles.actionRow}>
        {/* Nome do Destinatario (esquerda) */}
        <Pressable
          style={styles.recipientButton}
          onPress={onSelectRecipients}
          disabled={!onSelectRecipients}
          hitSlop={8}
        >
          <Text style={styles.recipientText} numberOfLines={1}>
            {recipientName}
          </Text>
          {onSelectRecipients && <ChevronIcon />}
        </Pressable>

        {/* Botoes de Acao (Camera e ViewOnce) */}
        <View style={styles.actionButtons}>
          {/* Botao Camera */}
          {showCameraButton && onOpenCamera && (
            <Pressable style={styles.actionButton} onPress={onOpenCamera} hitSlop={4}>
              <CameraIcon />
            </Pressable>
          )}

          {/* Botao View Once */}
          {onToggleViewOnce && (
            <Pressable style={styles.actionButton} onPress={onToggleViewOnce} hitSlop={4}>
              <ViewOnceIcon active={viewOnce} />
            </Pressable>
          )}
        </View>

        {/* Botao Enviar (direita) */}
        <SendButton onPress={onSend} loading={isSending} size={BUTTON_SIZE} />
      </View>
    </View>
  );
});

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container principal - transparente para imagem aparecer atras
  container: {
    paddingHorizontal: 16,                //......Padding horizontal
    paddingVertical: 12,                  //......Padding vertical
    backgroundColor: 'transparent',       //......Sem fundo (imagem passa por tras)
    gap: 15,                              //......Espaco entre linhas
  },

  // Linha 1: Input com botao X
  inputRow: {
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'flex-end',               //......Alinha na base (X fica embaixo)
    backgroundColor: CameraColors.inputBackground,  //......Fundo cinza claro
    borderRadius: 8,                      //......Cantos levemente arredondados
    paddingHorizontal: 12,                //......Padding horizontal
    minHeight: 45,                        //......Altura minima do container
  },

  // Campo de texto - Altura Dinamica
  input: {
    flex: 1,                              //......Ocupa espaco disponivel
    fontSize: 15,                         //......Tamanho da fonte
    lineHeight: 20,                       //......Altura de cada linha (LINE_HEIGHT)
    color: CameraColors.textPrimary,      //......Cor do texto
    paddingHorizontal: 0,                 //......Sem padding horizontal
    paddingTop: 12,                       //......Padding superior
    paddingBottom: 12,                    //......Padding inferior
    minHeight: 45,                        //......Altura minima (MIN_INPUT_HEIGHT)
    outlineStyle: 'none',                 //......Remove outline (web)
    borderWidth: 0,                       //......Remove borda
  } as any,

  // Botao X para limpar texto
  // Fica fixo na parte inferior direita
  clearButton: {
    width: 24,                            //......Largura
    height: 45,                           //......Altura igual a 1 linha (MIN_INPUT_HEIGHT)
    justifyContent: 'center',             //......Centraliza vertical
    alignItems: 'center',                 //......Centraliza horizontal
    marginLeft: 8,                        //......Espaco do texto
  },

  // Linha 2: Acoes
  actionRow: {
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    gap: 10,                              //......Espaco entre elementos (AJUSTE AQUI)
  },

  // Botao do destinatario
  recipientButton: {
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    gap: 6,                               //......Espaco entre nome e seta
    flex: 1,                              //......Ocupa espaco disponivel
    backgroundColor: 'rgba(255,255,255,0.15)',  //......Fundo branco com opacidade
    paddingVertical: 10,                  //......Padding vertical
    paddingHorizontal: 12,                //......Padding horizontal
    borderRadius: 8,                      //......Cantos arredondados
    height: 40,                           //......Altura igual aos botoes (BUTTON_SIZE)
  },

  // Container dos botoes de acao (Camera e ViewOnce)
  actionButtons: {
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    gap: 10,                              //......Espaco entre botoes (AJUSTE AQUI)
  },

  // Botao de acao (Camera ou ViewOnce)
  actionButton: {
    width: 40,                            //......Largura igual ao botao enviar (BUTTON_SIZE)
    height: 40,                           //......Altura igual ao botao enviar (BUTTON_SIZE)
    borderRadius: 8,                      //......Cantos arredondados
    backgroundColor: 'rgba(255,255,255,0.15)',  //......Fundo branco com opacidade
    justifyContent: 'center',             //......Centraliza vertical
    alignItems: 'center',                 //......Centraliza horizontal
  },

  // Texto do destinatario
  recipientText: {
    fontSize: 14,                         //......Tamanho da fonte
    color: CameraColors.textWhite,        //......Texto branco
    flex: 1,                              //......Ocupa espaco disponivel
  },
});

// ========================================
// Export
// ========================================
export default CaptionInput;
