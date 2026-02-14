// ========================================
// Componente CreatePhaseModal
// Modal para criar nova fase no funil
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
  Text,                               //......Texto
  TouchableOpacity,                   //......Botao tocavel
  StyleSheet,                         //......Estilos
  Modal,                              //......Modal nativo
  TextInput,                          //......Input de texto
  ScrollView,                         //......Scroll
  KeyboardAvoidingView,               //......Evitar teclado
  Platform,                           //......Plataforma
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
  danger: '#EF4444',                  //......Vermelho erro
  overlay: 'rgba(0, 0, 0, 0.5)',      //......Overlay escuro
};

// ========================================
// Cores Predefinidas para Fases
// ========================================
const PHASE_COLORS = [
  '#1777CF',                          //......Azul principal
  '#22C55E',                          //......Verde
  '#F59E0B',                          //......Amarelo
  '#EF4444',                          //......Vermelho
  '#8B5CF6',                          //......Roxo
  '#EC4899',                          //......Rosa
  '#06B6D4',                          //......Ciano
  '#84CC16',                          //......Lima
];

// ========================================
// Icones SVG
// ========================================

// Icone de Fechar
const CloseIcon = ({ color = COLORS.textSecondary }: { color?: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
      fill={color}
    />
  </Svg>
);

// Icone de Check
const CheckIcon = ({ color = COLORS.white }: { color?: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
      fill={color}
    />
  </Svg>
);

// ========================================
// Interface de Props
// ========================================
interface CreatePhaseModalProps {
  visible: boolean;                   //......Visibilidade do modal
  onClose: () => void;                //......Callback fechar
  onCreate: (name: string, color: string) => void; //..Callback criar
}

// ========================================
// Componente CreatePhaseModal
// ========================================
const CreatePhaseModal: React.FC<CreatePhaseModalProps> = ({
  visible,                            //......Visibilidade do modal
  onClose,                            //......Callback fechar
  onCreate,                           //......Callback criar
}) => {
  // ========================================
  // Estados
  // ========================================
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PHASE_COLORS[0]);
  const [error, setError] = useState('');

  // ========================================
  // Handlers
  // ========================================

  // Handler de mudanca de nome
  const handleNameChange = useCallback((text: string) => {
    setName(text);                     //......Atualizar nome
    setError('');                      //......Limpar erro
  }, []);

  // Handler de selecao de cor
  const handleColorSelect = useCallback((color: string) => {
    setSelectedColor(color);           //......Atualizar cor
  }, []);

  // Handler de criar fase
  const handleCreate = useCallback(() => {
    // Validar nome
    if (!name.trim()) {
      setError('Digite um nome para a fase');
      return;
    }

    // Chamar callback
    onCreate(name.trim(), selectedColor);

    // Limpar estados
    setName('');                       //......Limpar nome
    setSelectedColor(PHASE_COLORS[0]); //......Resetar cor
    setError('');                      //......Limpar erro
  }, [name, selectedColor, onCreate]);

  // Handler de fechar
  const handleClose = useCallback(() => {
    setName('');                       //......Limpar nome
    setSelectedColor(PHASE_COLORS[0]); //......Resetar cor
    setError('');                      //......Limpar erro
    onClose();                         //......Chamar callback
  }, [onClose]);

  // ========================================
  // Render
  // ========================================
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.overlay}>
          <View style={styles.container}>
            {/* Header do Modal */}
            <View style={styles.header}>
              <Text style={styles.title}>Nova Fase</Text>
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
              keyboardShouldPersistTaps="handled"
            >
              {/* Campo Nome */}
              <View style={styles.field}>
                <Text style={styles.label}>Nome da fase</Text>
                <TextInput
                  style={[
                    styles.input,
                    error ? styles.inputError : null,
                  ]}
                  value={name}
                  onChangeText={handleNameChange}
                  placeholder="Ex: Prospecção, Negociação, Fechamento"
                  placeholderTextColor={COLORS.textSecondary}
                  maxLength={50}
                  autoFocus={true}
                />
                {error ? (
                  <Text style={styles.errorText}>{error}</Text>
                ) : null}
              </View>

              {/* Seletor de Cor */}
              <View style={styles.field}>
                <Text style={styles.label}>Cor da fase</Text>
                <View style={styles.colorsGrid}>
                  {PHASE_COLORS.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        selectedColor === color && styles.colorOptionSelected,
                      ]}
                      onPress={() => handleColorSelect(color)}
                      activeOpacity={0.7}
                    >
                      {selectedColor === color && (
                        <CheckIcon color={COLORS.white} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Preview */}
              <View style={styles.field}>
                <Text style={styles.label}>Preview</Text>
                <View style={styles.previewContainer}>
                  <View
                    style={[
                      styles.previewIndicator,
                      { backgroundColor: selectedColor },
                    ]}
                  />
                  <Text style={styles.previewText}>
                    {name || 'Nome da fase'}
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* Footer com Botoes */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.createButton]}
                onPress={handleCreate}
                activeOpacity={0.7}
              >
                <Text style={styles.createButtonText}>Criar Fase</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ========================================
// Export Default
// ========================================
export default CreatePhaseModal;

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Evitar teclado
  keyboardAvoid: {
    flex: 1,                          //......Ocupar todo espaco
  },

  // Overlay do modal
  overlay: {
    flex: 1,                          //......Ocupar todo espaco
    backgroundColor: COLORS.overlay,  //......Fundo escuro
    justifyContent: 'center',         //......Centralizar vertical
    alignItems: 'center',             //......Centralizar horizontal
    padding: 20,                      //......Espaco interno
  },

  // Container do modal
  container: {
    backgroundColor: COLORS.white,    //......Fundo branco
    borderRadius: 16,                 //......Arredondamento
    width: '100%',                    //......Largura total
    maxWidth: 400,                    //......Largura maxima
    maxHeight: '80%',                 //......Altura maxima
  },

  // Header do modal
  header: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    justifyContent: 'space-between',  //......Espaco entre itens
    paddingHorizontal: 20,            //......Espaco horizontal
    paddingTop: 20,                   //......Espaco superior
    paddingBottom: 16,                //......Espaco inferior
    borderBottomWidth: 1,             //......Borda inferior
    borderBottomColor: COLORS.border, //......Cor da borda
  },

  // Titulo do modal
  title: {
    fontSize: 18,                     //......Tamanho fonte
    fontFamily: 'Inter_700Bold',      //......Fonte Inter Bold
    color: COLORS.textPrimary,        //......Cor texto
  },

  // Botao fechar
  closeButton: {
    width: 36,                        //......Largura
    height: 36,                       //......Altura
    justifyContent: 'center',         //......Centralizar vertical
    alignItems: 'center',             //......Centralizar horizontal
    borderRadius: 18,                 //......Arredondamento
    backgroundColor: COLORS.backgroundAlt, //..Fundo cinza
  },

  // Conteudo scrollavel
  content: {
    flex: 1,                          //......Ocupar espaco
  },

  // Container do conteudo
  contentContainer: {
    padding: 20,                      //......Espaco interno
  },

  // Campo de formulario
  field: {
    marginBottom: 20,                 //......Margem inferior
  },

  // Label do campo
  label: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.textPrimary,        //......Cor texto
    marginBottom: 8,                  //......Margem inferior
  },

  // Input de texto
  input: {
    backgroundColor: COLORS.backgroundAlt, //..Fundo cinza
    borderRadius: 10,                 //......Arredondamento
    paddingHorizontal: 16,            //......Espaco horizontal
    paddingVertical: 12,              //......Espaco vertical
    fontSize: 15,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textPrimary,        //......Cor texto
    borderWidth: 1,                   //......Largura borda
    borderColor: 'transparent',       //......Borda transparente
  },

  // Input com erro
  inputError: {
    borderColor: COLORS.danger,       //......Borda vermelha
  },

  // Texto de erro
  errorText: {
    fontSize: 12,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.danger,             //......Cor vermelha
    marginTop: 6,                     //......Margem superior
  },

  // Grid de cores
  colorsGrid: {
    flexDirection: 'row',             //......Layout horizontal
    flexWrap: 'wrap',                 //......Quebrar linha
    gap: 12,                          //......Espaco entre cores
  },

  // Opcao de cor
  colorOption: {
    width: 44,                        //......Largura
    height: 44,                       //......Altura
    borderRadius: 22,                 //......Arredondamento
    justifyContent: 'center',         //......Centralizar vertical
    alignItems: 'center',             //......Centralizar horizontal
  },

  // Cor selecionada
  colorOptionSelected: {
    borderWidth: 3,                   //......Largura borda
    borderColor: COLORS.white,        //......Borda branca
    shadowColor: '#000',              //......Cor da sombra
    shadowOffset: { width: 0, height: 2 }, //..Offset sombra
    shadowOpacity: 0.2,               //......Opacidade sombra
    shadowRadius: 4,                  //......Raio sombra
    elevation: 4,                     //......Elevacao Android
  },

  // Container de preview
  previewContainer: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    backgroundColor: COLORS.backgroundAlt, //..Fundo cinza
    padding: 16,                      //......Espaco interno
    borderRadius: 10,                 //......Arredondamento
    gap: 12,                          //......Espaco entre itens
  },

  // Indicador do preview
  previewIndicator: {
    width: 6,                         //......Largura
    height: 32,                       //......Altura
    borderRadius: 3,                  //......Arredondamento
  },

  // Texto do preview
  previewText: {
    fontSize: 16,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.textPrimary,        //......Cor texto
  },

  // Footer com botoes
  footer: {
    flexDirection: 'row',             //......Layout horizontal
    gap: 12,                          //......Espaco entre botoes
    padding: 20,                      //......Espaco interno
    borderTopWidth: 1,                //......Borda superior
    borderTopColor: COLORS.border,    //......Cor da borda
  },

  // Botao generico
  button: {
    flex: 1,                          //......Ocupar espaco igual
    paddingVertical: 14,              //......Espaco vertical
    borderRadius: 10,                 //......Arredondamento
    alignItems: 'center',             //......Centralizar horizontal
  },

  // Botao cancelar
  cancelButton: {
    backgroundColor: COLORS.backgroundAlt, //..Fundo cinza
  },

  // Texto do botao cancelar
  cancelButtonText: {
    fontSize: 15,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.textSecondary,      //......Cor secundaria
  },

  // Botao criar
  createButton: {
    backgroundColor: COLORS.primary,  //......Fundo azul
  },

  // Texto do botao criar
  createButtonText: {
    fontSize: 15,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.white,              //......Cor branca
  },
});
