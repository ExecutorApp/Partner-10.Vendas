// ========================================
// Componente ChatInput
// Input de texto com botao enviar
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, {                       //......React core
  useState,                           //......Hook de estado
  useCallback,                        //......Hook de callback
} from 'react';                       //......Biblioteca React
import {                              //......Componentes RN
  View,                               //......Container basico
  TextInput,                          //......Input de texto
  TouchableOpacity,                   //......Botao tocavel
  StyleSheet,                         //......Estilos
  ActivityIndicator,                  //......Indicador loading
} from 'react-native';                //......Biblioteca RN
import Svg, {                         //......Componentes SVG
  Path,                               //......Path do SVG
} from 'react-native-svg';            //......Biblioteca SVG

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
};

// ========================================
// Icones SVG
// ========================================

// Icone de Enviar
const SendIcon = ({ color = COLORS.white }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
      fill={color}
    />
  </Svg>
);

// ========================================
// Interface de Props
// ========================================
interface ChatInputProps {
  onSend: (text: string) => void;     //......Callback de envio
  isLoading?: boolean;                //......Estado de loading
  placeholder?: string;               //......Placeholder do input
  disabled?: boolean;                 //......Estado desabilitado
}

// ========================================
// Componente ChatInput
// ========================================
const ChatInput: React.FC<ChatInputProps> = ({
  onSend,                             //......Callback de envio
  isLoading = false,                  //......Estado de loading
  placeholder = 'Digite uma mensagem...', //..Placeholder padrao
  disabled = false,                   //......Estado desabilitado
}) => {
  // ========================================
  // Estados
  // ========================================
  const [text, setText] = useState('');

  // ========================================
  // Handlers
  // ========================================

  // Handler de mudanca de texto
  const handleChangeText = useCallback((value: string) => {
    setText(value);                    //......Atualizar estado
  }, []);

  // Handler de envio
  const handleSend = useCallback(() => {
    const trimmedText = text.trim();   //......Remover espacos
    if (trimmedText && !isLoading && !disabled) {
      onSend(trimmedText);             //......Chamar callback
      setText('');                     //......Limpar input
    }
  }, [text, isLoading, disabled, onSend]);

  // Verificar se pode enviar
  const canSend = text.trim().length > 0 && !isLoading && !disabled;

  // ========================================
  // Render
  // ========================================
  return (
    <View style={styles.container}>
      {/* Input de Texto */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textSecondary}
          multiline={true}
          maxLength={1000}
          editable={!isLoading && !disabled}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
      </View>

      {/* Botao Enviar */}
      <TouchableOpacity
        style={[
          styles.sendButton,
          !canSend && styles.sendButtonDisabled,
        ]}
        onPress={handleSend}
        disabled={!canSend}
        activeOpacity={0.7}
      >
        {isLoading ? (
          // Loading indicator
          <ActivityIndicator
            size="small"
            color={COLORS.white}
          />
        ) : (
          // Icone de enviar
          <SendIcon color={COLORS.white} />
        )}
      </TouchableOpacity>
    </View>
  );
};

// ========================================
// Export Default
// ========================================
export default ChatInput;

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container principal
  container: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'flex-end',           //......Alinhar na base
    paddingHorizontal: 16,            //......Espaco horizontal
    paddingVertical: 12,              //......Espaco vertical
    backgroundColor: COLORS.background, //....Fundo branco
    borderTopWidth: 1,                //......Borda superior
    borderTopColor: COLORS.border,    //......Cor da borda
  },

  // Container do input
  inputContainer: {
    flex: 1,                          //......Ocupar espaco
    backgroundColor: COLORS.backgroundAlt, //..Fundo cinza
    borderRadius: 20,                 //......Arredondamento
    paddingHorizontal: 16,            //......Espaco horizontal
    paddingVertical: 8,               //......Espaco vertical
    marginRight: 10,                  //......Margem direita
    minHeight: 40,                    //......Altura minima
    maxHeight: 100,                   //......Altura maxima
    justifyContent: 'center',         //......Centralizar vertical
  },

  // Input de texto
  input: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textPrimary,        //......Cor texto
    padding: 0,                       //......Sem padding interno
    margin: 0,                        //......Sem margem
    maxHeight: 80,                    //......Altura maxima do texto
  },

  // Botao enviar
  sendButton: {
    width: 44,                        //......Largura
    height: 44,                       //......Altura
    borderRadius: 22,                 //......Arredondamento
    backgroundColor: COLORS.primary,  //......Fundo azul
    justifyContent: 'center',         //......Centralizar vertical
    alignItems: 'center',             //......Centralizar horizontal
  },

  // Botao desabilitado
  sendButtonDisabled: {
    backgroundColor: COLORS.border,   //......Fundo cinza
  },
});
