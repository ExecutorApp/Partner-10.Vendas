// ========================================
// Componente StickerPanel
// Painel de selecao de stickers/emojis
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, { memo, useState, useCallback } from 'react';
import { View, Pressable, Text, ScrollView, StyleSheet, Animated } from 'react-native';

// ========================================
// Imports de Dados
// ========================================
import { STICKER_CATEGORIES, Sticker, StickerCategory } from './stickerData';

// ========================================
// Imports de Constantes
// ========================================
import { EditorColors } from '../../utils/editorConstants';

// ========================================
// Tipos
// ========================================
interface StickerPanelProps {
  visible: boolean;                        //......Painel visivel
  onSelectSticker: (sticker: Sticker) => void;  //......Callback selecao
  onClose: () => void;                     //......Callback fechar
}

// ========================================
// Componente CategoryTab
// Aba de categoria no header
// ========================================
interface CategoryTabProps {
  category: StickerCategory;               //......Dados da categoria
  isActive: boolean;                       //......Categoria ativa
  onPress: () => void;                     //......Handler clique
}

const CategoryTab: React.FC<CategoryTabProps> = memo(({ category, isActive, onPress }) => (
  <Pressable
    style={[styles.categoryTab, isActive && styles.categoryTabActive]}
    onPress={onPress}
  >
    <Text style={styles.categoryIcon}>{category.icon}</Text>
  </Pressable>
));

// ========================================
// Componente StickerButton
// Botao de sticker no grid
// ========================================
interface StickerButtonProps {
  sticker: Sticker;                        //......Dados do sticker
  onPress: () => void;                     //......Handler clique
}

const StickerButton: React.FC<StickerButtonProps> = memo(({ sticker, onPress }) => (
  <Pressable style={styles.stickerButton} onPress={onPress}>
    <Text style={styles.stickerEmoji}>{sticker.emoji}</Text>
  </Pressable>
));

// ========================================
// Componente Principal StickerPanel
// ========================================
const StickerPanel: React.FC<StickerPanelProps> = memo(({
  visible,
  onSelectSticker,
  onClose,
}) => {
  // ========================================
  // Estado Local
  // ========================================
  const [activeCategory, setActiveCategory] = useState<string>('smileys');

  // ========================================
  // Categoria Ativa
  // ========================================
  const currentCategory = STICKER_CATEGORIES.find(cat => cat.id === activeCategory) || STICKER_CATEGORIES[0];

  // ========================================
  // Handlers
  // ========================================
  const handleCategoryChange = useCallback((categoryId: string) => {
    setActiveCategory(categoryId);
  }, []);

  const handleStickerPress = useCallback((sticker: Sticker) => {
    onSelectSticker(sticker);
  }, [onSelectSticker]);

  // ========================================
  // Render: Nao Visivel
  // ========================================
  if (!visible) return null;

  // ========================================
  // Render Principal
  // ========================================
  return (
    <View style={styles.container}>
      {/* Handle de Arraste */}
      <View style={styles.handleContainer}>
        <View style={styles.handle} />
      </View>

      {/* Header com Categorias */}
      <View style={styles.headerContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        >
          {STICKER_CATEGORIES.map((category) => (
            <CategoryTab
              key={category.id}
              category={category}
              isActive={activeCategory === category.id}
              onPress={() => handleCategoryChange(category.id)}
            />
          ))}
        </ScrollView>

        {/* Botao Fechar */}
        <Pressable style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </Pressable>
      </View>

      {/* Titulo da Categoria */}
      <Text style={styles.categoryTitle}>{currentCategory.name}</Text>

      {/* Grid de Stickers */}
      <ScrollView
        style={styles.stickerGrid}
        contentContainerStyle={styles.stickerGridContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.stickerRow}>
          {currentCategory.stickers.map((sticker) => (
            <StickerButton
              key={sticker.id}
              sticker={sticker}
              onPress={() => handleStickerPress(sticker)}
            />
          ))}
        </View>
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
    position: 'absolute',                   //......Posicao absoluta
    bottom: 120,                            //......Acima do footer
    left: 0,                                //......Esquerda
    right: 0,                               //......Direita
    height: 320,                            //......Altura do painel
    backgroundColor: 'rgba(30,30,30,0.98)', //......Fundo escuro
    borderTopLeftRadius: 20,                //......Arredondamento superior esquerdo
    borderTopRightRadius: 20,               //......Arredondamento superior direito
    zIndex: 10,                             //......Camada superior
  },

  // Handle de arraste
  handleContainer: {
    alignItems: 'center',                   //......Centraliza horizontal
    paddingVertical: 10,                    //......Padding vertical
  },

  // Handle visual
  handle: {
    width: 40,                              //......Largura
    height: 4,                              //......Altura
    backgroundColor: 'rgba(255,255,255,0.3)', //......Cor cinza
    borderRadius: 2,                        //......Arredondamento
  },

  // Header com categorias
  headerContainer: {
    flexDirection: 'row',                   //......Layout horizontal
    alignItems: 'center',                   //......Centraliza vertical
    borderBottomWidth: 1,                   //......Borda inferior
    borderBottomColor: 'rgba(255,255,255,0.1)', //......Cor da borda
  },

  // Conteudo das categorias
  categoriesContent: {
    paddingHorizontal: 8,                   //......Padding horizontal
    paddingVertical: 8,                     //......Padding vertical
    gap: 4,                                 //......Espaco entre categorias
  },

  // Tab de categoria
  categoryTab: {
    width: 44,                              //......Largura
    height: 44,                             //......Altura
    borderRadius: 12,                       //......Arredondamento
    backgroundColor: 'transparent',         //......Fundo transparente
    justifyContent: 'center',               //......Centraliza vertical
    alignItems: 'center',                   //......Centraliza horizontal
  },

  // Tab de categoria ativa
  categoryTabActive: {
    backgroundColor: 'rgba(255,255,255,0.15)', //......Fundo destacado
  },

  // Icone da categoria
  categoryIcon: {
    fontSize: 24,                           //......Tamanho do emoji
  },

  // Botao fechar
  closeButton: {
    width: 36,                              //......Largura
    height: 36,                             //......Altura
    borderRadius: 18,                       //......Circular
    backgroundColor: 'rgba(255,255,255,0.1)', //......Fundo sutil
    justifyContent: 'center',               //......Centraliza vertical
    alignItems: 'center',                   //......Centraliza horizontal
    marginRight: 12,                        //......Margem direita
  },

  // Texto do botao fechar
  closeButtonText: {
    fontSize: 16,                           //......Tamanho
    color: 'rgba(255,255,255,0.7)',         //......Cor cinza
  },

  // Titulo da categoria
  categoryTitle: {
    fontSize: 13,                           //......Tamanho
    fontWeight: '600',                      //......Peso
    color: 'rgba(255,255,255,0.5)',         //......Cor cinza
    textTransform: 'uppercase',             //......Maiusculo
    letterSpacing: 1,                       //......Espacamento
    paddingHorizontal: 16,                  //......Padding horizontal
    paddingTop: 12,                         //......Padding superior
    paddingBottom: 8,                       //......Padding inferior
  },

  // Grid de stickers
  stickerGrid: {
    flex: 1,                                //......Ocupa espaco restante
  },

  // Conteudo do grid
  stickerGridContent: {
    paddingHorizontal: 8,                   //......Padding horizontal
    paddingBottom: 16,                      //......Padding inferior
  },

  // Linha de stickers
  stickerRow: {
    flexDirection: 'row',                   //......Layout horizontal
    flexWrap: 'wrap',                       //......Quebra linha
    justifyContent: 'flex-start',           //......Alinha esquerda
  },

  // Botao de sticker
  stickerButton: {
    width: '12.5%',                         //......8 por linha
    aspectRatio: 1,                         //......Quadrado
    justifyContent: 'center',               //......Centraliza vertical
    alignItems: 'center',                   //......Centraliza horizontal
  },

  // Emoji do sticker
  stickerEmoji: {
    fontSize: 28,                           //......Tamanho do emoji
  },
});

// ========================================
// Export
// ========================================
export default StickerPanel;
