// ========================================
// Componente DrawingCategoryBar
// Carrossel horizontal das 6 categorias de desenho
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, { memo, useCallback } from 'react';
import { View, ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

// ========================================
// Imports de Tipos
// ========================================
import { DrawingCategory, DrawingCategoryBarProps } from '../../types/editorTypes';

// ========================================
// Imports de Constantes
// ========================================
import { EditorColors, CategoryIcons, CategoryLabels, IconData } from '../../utils/editorConstants';

// ========================================
// Constantes Locais
// ========================================
const CATEGORY_ORDER: DrawingCategory[] = ['shape', 'arrow', 'highlighter', 'blur', 'freedraw', 'text'];
const BUTTON_SIZE = 56;                     //......Tamanho do botao
const ICON_SIZE = 20;                       //......Tamanho do icone

// ========================================
// Componente de Botao de Categoria
// ========================================
interface CategoryButtonProps {
  category: DrawingCategory;                //......Categoria
  isActive: boolean;                        //......Se esta ativo
  onPress: () => void;                      //......Handler de clique
}

const CategoryButton: React.FC<CategoryButtonProps> = memo(({
  category,
  isActive,
  onPress,
}) => {
  const iconData: IconData = CategoryIcons[category];
  const label = CategoryLabels[category];

  // Extrair path e viewBox do IconData
  const iconPath = typeof iconData === 'string' ? iconData : iconData.path;
  const iconViewBox = typeof iconData === 'string' ? '0 0 24 24' : iconData.viewBox;

  return (
    <Pressable
      style={[
        styles.categoryButton,
        isActive && styles.categoryButtonActive,
      ]}
      onPress={onPress}
    >
      <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
        <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox={iconViewBox} fill="none">
          <Path
            d={iconPath}
            fill={isActive ? EditorColors.buttonActive : EditorColors.buttonIcon}
          />
        </Svg>
      </View>
      <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>
        {label}
      </Text>
      {isActive && <View style={styles.activeIndicator} />}
    </Pressable>
  );
});

// ========================================
// Componente Principal DrawingCategoryBar
// ========================================
const DrawingCategoryBar: React.FC<DrawingCategoryBarProps> = memo(({
  activeCategory,
  onCategoryChange,
}) => {
  // ========================================
  // Handler de Selecao
  // ========================================
  const handleCategoryPress = useCallback((category: DrawingCategory) => {
    onCategoryChange(category);
  }, [onCategoryChange]);

  // ========================================
  // Render Principal
  // ========================================
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CATEGORY_ORDER.map((category) => (
          <CategoryButton
            key={category}
            category={category}
            isActive={activeCategory === category}
            onPress={() => handleCategoryPress(category)}
          />
        ))}
      </ScrollView>
    </View>
  );
});

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container principal
  container: {
    backgroundColor: 'rgba(0,0,0,0.6)',    //......Fundo semi-transparente
    paddingVertical: 8,                     //......Padding vertical
  },

  // Conteudo do scroll
  scrollContent: {
    flexGrow: 1,                            //......Expande para centralizar
    justifyContent: 'center',               //......Centraliza horizontal
    paddingHorizontal: 12,                  //......Padding horizontal
    gap: 4,                                 //......Espaco entre botoes
  },

  // Botao de categoria
  categoryButton: {
    width: BUTTON_SIZE,                     //......Largura
    alignItems: 'center',                   //......Centraliza horizontal
    paddingVertical: 4,                     //......Padding vertical
    paddingHorizontal: 4,                   //......Padding horizontal
  },

  // Botao ativo (sem background no botao inteiro)
  categoryButtonActive: {
    backgroundColor: 'transparent',         //......Sem fundo
  },

  // Container do icone
  iconContainer: {
    width: 36,                              //......Largura
    height: 36,                             //......Altura
    borderRadius: 18,                       //......Circular
    backgroundColor: 'rgba(255,255,255,0.1)',  //......Fundo claro
    justifyContent: 'center',               //......Centraliza vertical
    alignItems: 'center',                   //......Centraliza horizontal
    marginBottom: 4,                        //......Margem inferior
  },

  // Container do icone ativo (destaque azul APENAS no icone)
  iconContainerActive: {
    backgroundColor: 'rgba(23,119,207,0.35)',  //......Fundo azul mais visivel
    borderWidth: 2,                         //......Borda
    borderColor: EditorColors.buttonActive, //......Borda azul
  },

  // Label da categoria
  categoryLabel: {
    fontSize: 10,                           //......Tamanho pequeno
    color: 'rgba(255,255,255,0.7)',         //......Branco translucido
    textAlign: 'center',                    //......Centraliza texto
  },

  // Label ativo
  categoryLabelActive: {
    color: EditorColors.buttonActive,       //......Azul
    fontWeight: '600',                      //......Semi-bold
  },

  // Indicador de ativo
  activeIndicator: {
    position: 'absolute',                   //......Posicao absoluta
    bottom: 0,                              //......Embaixo
    left: 8,                                //......Esquerda
    right: 8,                               //......Direita
    height: 2,                              //......Altura
    backgroundColor: EditorColors.buttonActive,  //......Azul
    borderRadius: 1,                        //......Bordas arredondadas
  },
});

// ========================================
// Export
// ========================================
export default DrawingCategoryBar;
