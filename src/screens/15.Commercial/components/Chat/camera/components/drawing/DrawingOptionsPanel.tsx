// ========================================
// Componente DrawingOptionsPanel - Parte 2
// Painel vertical dinamico de opcoes por categoria
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, { memo, useCallback } from 'react';
import { View, ScrollView } from 'react-native';

// ========================================
// Imports de Tipos
// ========================================
import { DrawingOptionsPanelProps, ShapeType, BlurType } from '../../types/editorTypes';

// ========================================
// Constantes de Fonte
// ========================================
const MIN_FONT_SIZE = 12;                     //......Tamanho minimo da fonte
const MAX_FONT_SIZE = 72;                     //......Tamanho maximo da fonte
const FONT_SIZE_STEP = 4;                     //......Incremento de tamanho

// ========================================
// Imports de Constantes
// ========================================
import { EditorIcons, DrawingColors, StrokeWidths, HighlighterStrokeWidths, BlurStrokeWidths, SubtypeIcons } from '../../utils/editorConstants';

// ========================================
// Imports de Componentes Auxiliares
// ========================================
import { ActionButton, ColorButton, StrokeButton, Separator, ShapeOptionsView, BlurOptionsView, TextOptionsView, styles } from './DrawingOptionsPanel01';

// ========================================
// Componente Principal DrawingOptionsPanel
// ========================================
const DrawingOptionsPanel: React.FC<DrawingOptionsPanelProps> = memo(({
  activeCategory,
  options,
  selectedColor,
  selectedStrokeWidth,
  selectedElementId,
  canUndo,
  canClear,
  onOptionsChange,
  onColorChange,
  onStrokeWidthChange,
  onUndo,
  onDeleteSelected,
  onClearAll,
  onAddText,
}) => {
  // ========================================
  // Handlers de Opcoes
  // ========================================
  const handleShapeTypeChange = useCallback((type: ShapeType) => {
    onOptionsChange('shape', { ...options.shape, shapeType: type });
  }, [options.shape, onOptionsChange]);

  const handleFilledChange = useCallback((filled: boolean) => {
    onOptionsChange('shape', { ...options.shape, filled });
  }, [options.shape, onOptionsChange]);

  const handleBlurTypeChange = useCallback((type: BlurType) => {
    onOptionsChange('blur', { ...options.blur, blurType: type });
  }, [options.blur, onOptionsChange]);

  const handleIncreaseFontSize = useCallback(() => {
    const newSize = Math.min(options.text.fontSize + FONT_SIZE_STEP, MAX_FONT_SIZE);
    onOptionsChange('text', { ...options.text, fontSize: newSize });
  }, [options.text, onOptionsChange]);

  const handleDecreaseFontSize = useCallback(() => {
    const newSize = Math.max(options.text.fontSize - FONT_SIZE_STEP, MIN_FONT_SIZE);
    onOptionsChange('text', { ...options.text, fontSize: newSize });
  }, [options.text, onOptionsChange]);

  const handleBoldChange = useCallback((bold: boolean) => {
    onOptionsChange('text', { ...options.text, bold });
  }, [options.text, onOptionsChange]);

  const handleAddText = useCallback(() => {
    onAddText?.();
  }, [onAddText]);

  // ========================================
  // Obter espessuras da categoria
  // ========================================
  const getStrokeWidths = useCallback(() => {
    switch (activeCategory) {
      case 'highlighter':
        return HighlighterStrokeWidths;
      case 'blur':
        return BlurStrokeWidths;
      default:
        return StrokeWidths;
    }
  }, [activeCategory]);

  // ========================================
  // Verificar se mostra cores
  // ========================================
  const showColors = activeCategory !== 'blur';

  // ========================================
  // Render Principal
  // ========================================
  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Botoes de Acao */}
        <ActionButton
          iconPath={EditorIcons.undo}
          onPress={onUndo}
          disabled={!canUndo}
        />
        {activeCategory !== 'freedraw' && (
          <ActionButton
            iconPath={SubtypeIcons.trash}
            onPress={onDeleteSelected}
            disabled={!selectedElementId}
          />
        )}
        <ActionButton
          iconPath={SubtypeIcons.broom.path}
          onPress={onClearAll}
          disabled={!canClear}
          viewBox={SubtypeIcons.broom.viewBox}
        />

        {/* Separador antes das opcoes especificas (apenas se categoria tiver opcoes) */}
        {(activeCategory === 'shape' || activeCategory === 'blur' || activeCategory === 'text') && (
          <Separator />
        )}

        {/* Opcoes especificas da categoria */}
        {activeCategory === 'shape' && (
          <ShapeOptionsView
            shapeType={options.shape.shapeType}
            filled={options.shape.filled}
            onShapeTypeChange={handleShapeTypeChange}
            onFilledChange={handleFilledChange}
          />
        )}

        {/* Setas nao tem subtipos - sempre seta simples */}

        {activeCategory === 'blur' && (
          <BlurOptionsView
            blurType={options.blur.blurType}
            onBlurTypeChange={handleBlurTypeChange}
          />
        )}

        {activeCategory === 'text' && (
          <TextOptionsView
            bold={options.text.bold}
            onIncreaseFontSize={handleIncreaseFontSize}
            onDecreaseFontSize={handleDecreaseFontSize}
            onBoldChange={handleBoldChange}
            onAddText={handleAddText}
          />
        )}

        {/* Espessuras (todas as categorias exceto texto e blur) */}
        {activeCategory !== 'text' && activeCategory !== 'blur' && (
          <>
            <Separator />
            {getStrokeWidths().map((width) => (
              <StrokeButton
                key={width}
                width={width}
                isSelected={selectedStrokeWidth === width}
                onPress={() => onStrokeWidthChange(width)}
              />
            ))}
          </>
        )}

        {/* Paleta de cores */}
        {showColors && (
          <>
            <Separator />
            {DrawingColors.map((color) => (
              <ColorButton
                key={color}
                color={color}
                isSelected={selectedColor === color}
                onPress={() => onColorChange(color)}
              />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
});

// ========================================
// Export
// ========================================
export default DrawingOptionsPanel;
