// ========================================
// Componente CreateColumnModal
// Arquivo 01 - Modal para criar coluna
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, {                       //......React core
  useState,                           //......Hook de estado
  useCallback,                        //......Hook de callback
  useMemo,                            //......Hook de memorizacao
} from 'react';                       //......Biblioteca React
import {                              //......Componentes RN
  View,                               //......Container basico
  Text,                               //......Texto
  TouchableOpacity,                   //......Botao tocavel
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
// Imports de Tipos
// ========================================
import {                              //......Tipos do commercial
  KanbanPhase,                        //......Interface de fase
} from '../../types/commercial.types'; //......Arquivo de tipos

// ========================================
// Imports de Estilos
// ========================================
import {
  styles,
  COLORS,
  COLUMN_COLORS,
} from './02.08.02.CreateColumnModalStyles';

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

// Icone de Dropdown
const DropdownIcon = ({ color = COLORS.textSecondary }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 10l5 5 5-5z"
      fill={color}
    />
  </Svg>
);

// ========================================
// Interface de Props
// ========================================
interface CreateColumnModalProps {
  visible: boolean;                   //......Visibilidade do modal
  phases: KanbanPhase[];              //......Lista de fases
  selectedPhaseId?: string;           //......Fase pre-selecionada
  onClose: () => void;                //......Callback fechar
  onCreate: (name: string, color: string, phaseId: string) => void;
}

// ========================================
// Componente CreateColumnModal
// ========================================
const CreateColumnModal: React.FC<CreateColumnModalProps> = ({
  visible,                            //......Visibilidade do modal
  phases,                             //......Lista de fases
  selectedPhaseId,                    //......Fase pre-selecionada
  onClose,                            //......Callback fechar
  onCreate,                           //......Callback criar
}) => {
  // ========================================
  // Estados
  // ========================================
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLUMN_COLORS[0]);
  const [phaseId, setPhaseId] = useState(selectedPhaseId || '');
  const [showPhaseDropdown, setShowPhaseDropdown] = useState(false);
  const [error, setError] = useState('');

  // ========================================
  // Memos
  // ========================================

  // Fase selecionada
  const selectedPhase = useMemo(() => {
    return phases.find(p => p.id === phaseId);
  }, [phases, phaseId]);

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

  // Handler de selecao de fase
  const handlePhaseSelect = useCallback((id: string) => {
    setPhaseId(id);                    //......Atualizar fase
    setShowPhaseDropdown(false);       //......Fechar dropdown
    setError('');                      //......Limpar erro
  }, []);

  // Handler de toggle dropdown
  const handleToggleDropdown = useCallback(() => {
    setShowPhaseDropdown(prev => !prev);
  }, []);

  // Handler de criar coluna
  const handleCreate = useCallback(() => {
    // Validar nome
    if (!name.trim()) {
      setError('Digite um nome para a coluna');
      return;
    }

    // Validar fase
    if (!phaseId) {
      setError('Selecione uma fase para a coluna');
      return;
    }

    // Chamar callback
    onCreate(name.trim(), selectedColor, phaseId);

    // Limpar estados
    setName('');                       //......Limpar nome
    setSelectedColor(COLUMN_COLORS[0]); //....Resetar cor
    setPhaseId(selectedPhaseId || ''); //......Resetar fase
    setError('');                      //......Limpar erro
  }, [name, selectedColor, phaseId, selectedPhaseId, onCreate]);

  // Handler de fechar
  const handleClose = useCallback(() => {
    setName('');                       //......Limpar nome
    setSelectedColor(COLUMN_COLORS[0]); //....Resetar cor
    setPhaseId(selectedPhaseId || ''); //......Resetar fase
    setShowPhaseDropdown(false);       //......Fechar dropdown
    setError('');                      //......Limpar erro
    onClose();                         //......Chamar callback
  }, [selectedPhaseId, onClose]);

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
              <Text style={styles.title}>Nova Coluna</Text>
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
              {/* Seletor de Fase */}
              <View style={[styles.field, { zIndex: 10 }]}>
                <Text style={styles.label}>Fase</Text>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={handleToggleDropdown}
                  activeOpacity={0.7}
                >
                  {selectedPhase ? (
                    <View style={styles.dropdownValue}>
                      <View
                        style={[
                          styles.phaseColorDot,
                          { backgroundColor: selectedPhase.color },
                        ]}
                      />
                      <Text style={styles.dropdownText}>
                        {selectedPhase.name}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.dropdownPlaceholder}>
                      Selecione uma fase
                    </Text>
                  )}
                  <DropdownIcon color={COLORS.textSecondary} />
                </TouchableOpacity>

                {/* Dropdown de Fases */}
                {showPhaseDropdown && (
                  <View style={styles.dropdownList}>
                    {phases.map((phase) => (
                      <TouchableOpacity
                        key={phase.id}
                        style={[
                          styles.dropdownItem,
                          phase.id === phaseId && styles.dropdownItemActive,
                        ]}
                        onPress={() => handlePhaseSelect(phase.id)}
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            styles.phaseColorDot,
                            { backgroundColor: phase.color },
                          ]}
                        />
                        <Text
                          style={[
                            styles.dropdownItemText,
                            phase.id === phaseId && styles.dropdownItemTextActive,
                          ]}
                        >
                          {phase.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Campo Nome */}
              <View style={styles.field}>
                <Text style={styles.label}>Nome da coluna</Text>
                <TextInput
                  style={[
                    styles.input,
                    error && !name.trim() ? styles.inputError : null,
                  ]}
                  value={name}
                  onChangeText={handleNameChange}
                  placeholder="Ex: Primeiro contato, Em análise, Proposta enviada"
                  placeholderTextColor={COLORS.textSecondary}
                  maxLength={50}
                />
              </View>

              {/* Seletor de Cor */}
              <View style={styles.field}>
                <Text style={styles.label}>Cor da coluna</Text>
                <View style={styles.colorsGrid}>
                  {COLUMN_COLORS.map((color) => (
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
                    {name || 'Nome da coluna'}
                  </Text>
                </View>
              </View>

              {/* Mensagem de Erro */}
              {error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : null}
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
                <Text style={styles.createButtonText}>Criar Coluna</Text>
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
export default CreateColumnModal;
