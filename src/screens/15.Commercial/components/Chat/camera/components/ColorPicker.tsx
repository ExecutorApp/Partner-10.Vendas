// ========================================
// Componente ColorPicker
// Paleta de cores vertical para desenho
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, { memo, useCallback } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';

// ========================================
// Imports de Constantes
// ========================================
import { DrawingColors } from '../utils/editorConstants';

// ========================================
// Tipos
// ========================================
interface ColorPickerProps {
  selectedColor: string;                    //......Cor selecionada
  onColorChange: (color: string) => void;   //......Handler de mudanca
}

// ========================================
// Constantes
// ========================================
const COLOR_SIZE = 28;                      //......Tamanho do circulo
const COLOR_GAP = 8;                        //......Espaco entre cores
const SELECTED_BORDER = 3;                  //......Borda da cor selecionada

// ========================================
// Componente de Cor Individual
// ========================================
const ColorButton: React.FC<{
  color: string;
  isSelected: boolean;
  onPress: () => void;
}> = memo(({ color, isSelected, onPress }) => (
  <Pressable
    style={[
      styles.colorButton,
      { backgroundColor: color },
      isSelected && styles.colorButtonSelected,
      color === '#FFFFFF' && styles.colorButtonWhite,
    ]}
    onPress={onPress}
  />
));

// ========================================
// Componente Principal ColorPicker
// ========================================
const ColorPicker: React.FC<ColorPickerProps> = memo(({
  selectedColor,
  onColorChange,
}) => {
  // ========================================
  // Handler de Selecao
  // ========================================
  const handleColorPress = useCallback((color: string) => {
    onColorChange(color);
  }, [onColorChange]);

  // ========================================
  // Render Principal
  // ========================================
  return (
    <View style={styles.container}>
      {DrawingColors.map((color) => (
        <ColorButton
          key={color}
          color={color}
          isSelected={selectedColor === color}
          onPress={() => handleColorPress(color)}
        />
      ))}
    </View>
  );
});

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container principal
  container: {
    position: 'absolute',                   //......Posicao absoluta
    right: 16,                              //......Direita
    top: '50%',                             //......Centro vertical
    transform: [{ translateY: -150 }],      //......Ajuste para centralizar
    backgroundColor: 'rgba(0,0,0,0.5)',     //......Fundo semi-transparente
    borderRadius: 20,                       //......Arredondado
    paddingVertical: 12,                    //......Padding vertical
    paddingHorizontal: 8,                   //......Padding horizontal
    gap: COLOR_GAP,                         //......Espaco entre cores
    zIndex: 20,                             //......Camada superior
  },

  // Botao de cor
  colorButton: {
    width: COLOR_SIZE,                      //......Largura
    height: COLOR_SIZE,                     //......Altura
    borderRadius: COLOR_SIZE / 2,           //......Circular
    borderWidth: 2,                         //......Borda
    borderColor: 'transparent',             //......Borda transparente
  },

  // Cor selecionada
  colorButtonSelected: {
    borderColor: '#FFFFFF',                 //......Borda branca
    borderWidth: SELECTED_BORDER,           //......Borda mais grossa
    transform: [{ scale: 1.1 }],            //......Ligeiramente maior
  },

  // Cor branca (borda visivel)
  colorButtonWhite: {
    borderColor: 'rgba(0,0,0,0.2)',         //......Borda escura sutil
  },
});

// ========================================
// Export
// ========================================
export default ColorPicker;
