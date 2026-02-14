// ========================================
// Componente Sugestoes Rapidas
// Chips com perguntas frequentes para a Lola
// ========================================

// ========================================
// Imports
// ========================================
import React, {                                   //......React core
  useState,                                       //......Hook de estado
} from 'react';
import {                                          //......Componentes RN
  View,                                           //......Container
  Text,                                           //......Texto
  ScrollView,                                     //......Scroll
  Pressable,                                      //......Botao pressionavel
} from 'react-native';
import { suggestionStyles as styles } from './styles/09.AIAvatarStyles';

// ========================================
// Lista de Sugestoes Padrao
// ========================================
const DEFAULT_SUGGESTIONS = [
  'Como abordar este lead?',
  'Qual o próximo passo?',
  'Sugerir mensagem',
  'Analisar objeções',
  'Estratégia de fechamento',
];

// ========================================
// Interface de Props
// ========================================
interface QuickSuggestionsProps {
  onSelect: (text: string) => void;               //......Callback ao selecionar
  disabled?: boolean;                             //......Se esta desabilitado
  suggestions?: string[];                         //......Sugestoes customizadas
}

// ========================================
// Componente Principal
// ========================================
const QuickSuggestions: React.FC<QuickSuggestionsProps> = ({
  onSelect,
  disabled = false,
  suggestions = DEFAULT_SUGGESTIONS,
}) => {
  // ========================================
  // Estados
  // ========================================
  const [pressedIndex, setPressedIndex] = useState<number | null>(null);

  // ========================================
  // Handlers
  // ========================================
  const handlePressIn = (index: number) => {
    if (!disabled) {
      setPressedIndex(index);
    }
  };

  const handlePressOut = () => {
    setPressedIndex(null);
  };

  const handleSelect = (text: string) => {
    if (!disabled) {
      onSelect(text);
    }
  };

  // ========================================
  // Render
  // ========================================
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {suggestions.map((suggestion, index) => {
          const isPressed = pressedIndex === index;

          return (
            <Pressable
              key={index}
              style={[
                styles.chip,
                isPressed && styles.chipPressed,
              ]}
              onPressIn={() => handlePressIn(index)}
              onPressOut={handlePressOut}
              onPress={() => handleSelect(suggestion)}
              disabled={disabled}
            >
              <Text
                style={[
                  styles.chipText,
                  isPressed && styles.chipTextPressed,
                ]}
              >
                {suggestion}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

// ========================================
// Export
// ========================================
export default QuickSuggestions;
