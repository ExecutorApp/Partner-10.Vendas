// ========================================
// Componente DrawingOptionsPanel - Parte 1
// Componentes auxiliares do painel de opcoes
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, { memo } from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

// ========================================
// Imports de Tipos
// ========================================
import { ShapeType, BlurType } from '../../types/editorTypes';

// ========================================
// Imports de Constantes
// ========================================
import { EditorColors, SubtypeIcons } from '../../utils/editorConstants';

// ========================================
// Constantes Locais
// ========================================
export const PANEL_WIDTH = 52;              //......Largura do painel
export const BUTTON_SIZE = 36;              //......Tamanho do botao
export const COLOR_SIZE = 24;               //......Tamanho do circulo de cor
export const ICON_SIZE = 18;                //......Tamanho do icone

// ========================================
// Componente de Botao de Acao
// ========================================
interface ActionButtonProps {
  iconPath: string;                         //......Path do icone
  onPress: () => void;                      //......Handler de clique
  disabled?: boolean;                       //......Desabilitado
  color?: string;                           //......Cor do icone
  viewBox?: string;                         //......ViewBox customizado
}

export const ActionButton: React.FC<ActionButtonProps> = memo(({
  iconPath,
  onPress,
  disabled = false,
  color = EditorColors.buttonIcon,
  viewBox = '0 0 24 24',
}) => (
  <Pressable
    style={styles.actionButton}
    onPress={onPress}
    disabled={disabled}
  >
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox={viewBox} fill="none">
      <Path d={iconPath} fill={color} />
    </Svg>
  </Pressable>
));

// ========================================
// Componente de Cor
// ========================================
interface ColorButtonProps {
  color: string;                            //......Cor
  isSelected: boolean;                      //......Se esta selecionado
  onPress: () => void;                      //......Handler de clique
}

export const ColorButton: React.FC<ColorButtonProps> = memo(({
  color,
  isSelected,
  onPress,
}) => (
  <Pressable
    style={[
      styles.colorButton,
      { backgroundColor: color },
      isSelected && styles.colorButtonSelected,
      color === '#FFFFFF' && styles.colorButtonWhite,
      color === '#000000' && styles.colorButtonBlack,
    ]}
    onPress={onPress}
  />
));

// ========================================
// Componente de Espessura
// ========================================
interface StrokeButtonProps {
  width: number;                            //......Espessura
  isSelected: boolean;                      //......Se esta selecionado
  onPress: () => void;                      //......Handler de clique
}

export const StrokeButton: React.FC<StrokeButtonProps> = memo(({
  width,
  isSelected,
  onPress,
}) => {
  const lineHeight = Math.min(6, Math.max(2, width / 3));

  return (
    <Pressable
      style={[styles.strokeButton, isSelected && styles.strokeButtonSelected]}
      onPress={onPress}
    >
      <View
        style={[
          styles.strokeLine,
          { height: lineHeight },
          isSelected && styles.strokeLineSelected,
        ]}
      />
    </Pressable>
  );
});

// ========================================
// Componente de Subtipo (forma, seta, etc)
// ========================================
interface SubtypeButtonProps {
  iconPath: string;                         //......Path do icone
  isSelected: boolean;                      //......Se esta selecionado
  onPress: () => void;                      //......Handler de clique
}

export const SubtypeButton: React.FC<SubtypeButtonProps> = memo(({
  iconPath,
  isSelected,
  onPress,
}) => (
  <Pressable
    style={[styles.subtypeButton, isSelected && styles.subtypeButtonSelected]}
    onPress={onPress}
  >
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d={iconPath}
        fill={isSelected ? '#FFFFFF' : EditorColors.buttonIcon}
      />
    </Svg>
  </Pressable>
));

// ========================================
// Separador
// ========================================
export const Separator: React.FC = memo(() => (
  <View style={styles.separator} />
));

// ========================================
// Opcoes de Formas
// ========================================
interface ShapeOptionsViewProps {
  shapeType: ShapeType;
  filled: boolean;
  onShapeTypeChange: (type: ShapeType) => void;
  onFilledChange: (filled: boolean) => void;
}

export const ShapeOptionsView: React.FC<ShapeOptionsViewProps> = memo(({
  shapeType,
  filled,
  onShapeTypeChange,
  onFilledChange,
}) => (
  <>
    {/* Tipos de forma em coluna */}
    <SubtypeButton
      iconPath={SubtypeIcons.circle}
      isSelected={shapeType === 'circle'}
      onPress={() => onShapeTypeChange('circle')}
    />
    <SubtypeButton
      iconPath={SubtypeIcons.rectangle}
      isSelected={shapeType === 'rectangle'}
      onPress={() => onShapeTypeChange('rectangle')}
    />

    <Separator />

    {/* Preenchimento em coluna */}
    <SubtypeButton
      iconPath={SubtypeIcons.outline}
      isSelected={!filled}
      onPress={() => onFilledChange(false)}
    />
    <SubtypeButton
      iconPath={SubtypeIcons.filled}
      isSelected={filled}
      onPress={() => onFilledChange(true)}
    />
  </>
));

// ========================================
// Opcoes de Setas (sem subtipos - sempre seta simples)
// ========================================
export const ArrowOptionsView: React.FC = memo(() => null);

// ========================================
// Opcoes de Blur
// ========================================
interface BlurOptionsViewProps {
  blurType: BlurType;
  onBlurTypeChange: (type: BlurType) => void;
}

export const BlurOptionsView: React.FC<BlurOptionsViewProps> = memo(({
  blurType,
  onBlurTypeChange,
}) => (
  <>
    <SubtypeButton
      iconPath={SubtypeIcons.blurMode}
      isSelected={blurType === 'blur'}
      onPress={() => onBlurTypeChange('blur')}
    />
    <SubtypeButton
      iconPath={SubtypeIcons.pixelateMode}
      isSelected={blurType === 'pixelate'}
      onPress={() => onBlurTypeChange('pixelate')}
    />
  </>
));

// ========================================
// Opcoes de Texto
// ========================================
interface TextOptionsViewProps {
  bold: boolean;                              //......Negrito ativo
  onIncreaseFontSize: () => void;             //......Handler aumentar fonte
  onDecreaseFontSize: () => void;             //......Handler diminuir fonte
  onBoldChange: (bold: boolean) => void;      //......Handler negrito
  onAddText: () => void;                      //......Handler adicionar texto
}

export const TextOptionsView: React.FC<TextOptionsViewProps> = memo(({
  bold,
  onIncreaseFontSize,
  onDecreaseFontSize,
  onBoldChange,
  onAddText,
}) => (
  <>
    {/* Botao adicionar texto */}
    <Pressable style={styles.addTextButton} onPress={onAddText}>
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path d={SubtypeIcons.addText} fill={EditorColors.buttonIcon} />
      </Svg>
      <Text style={styles.addTextLabel}>Texto</Text>
    </Pressable>

    <Separator />

    {/* Aumentar fonte */}
    <Pressable style={styles.fontSizeControlButton} onPress={onIncreaseFontSize}>
      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
        <Path d={SubtypeIcons.fontIncrease} fill={EditorColors.buttonIcon} />
      </Svg>
    </Pressable>

    {/* Diminuir fonte */}
    <Pressable style={styles.fontSizeControlButton} onPress={onDecreaseFontSize}>
      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
        <Path d={SubtypeIcons.fontDecrease} fill={EditorColors.buttonIcon} />
      </Svg>
    </Pressable>

    <Separator />

    {/* Toggle negrito */}
    <Pressable
      style={[styles.toggleButton, bold && styles.toggleButtonSelected]}
      onPress={() => onBoldChange(!bold)}
    >
      <Text style={[styles.boldLabel, bold && styles.boldLabelSelected]}>B</Text>
    </Pressable>
  </>
));

// ========================================
// Estilos Exportados
// ========================================
export const styles = StyleSheet.create({
  // Container principal
  container: {
    width: PANEL_WIDTH,                     //......Largura fixa
    marginRight: 8,                         //......Margem direita
    backgroundColor: 'transparent',         //......Fundo transparente
    paddingVertical: 0,                     //......Sem padding vertical
  },

  // Conteudo do scroll
  scrollContent: {
    alignItems: 'center',                   //......Centraliza horizontal
    paddingHorizontal: 8,                   //......Padding horizontal
    paddingTop: 10,                         //......Espaco superior
    gap: 6,                                 //......Espaco entre itens
  },

  // Botao de acao
  actionButton: {
    width: BUTTON_SIZE,                     //......Largura
    height: BUTTON_SIZE,                    //......Altura
    borderRadius: BUTTON_SIZE / 2,          //......Circular
    backgroundColor: 'rgba(0,0,0,0.5)',     //......Fundo escuro semitransparente
    justifyContent: 'center',               //......Centraliza vertical
    alignItems: 'center',                   //......Centraliza horizontal
  },

  // Separador
  separator: {
    width: 24,                              //......Largura
    height: 1,                              //......Altura
    backgroundColor: 'rgba(255,255,255,0.3)',  //......Cor clara
    marginVertical: 4,                      //......Margem vertical
  },

  // Coluna de subtipos
  subtypeRow: {
    flexDirection: 'column',                //......Layout vertical
    gap: 4,                                 //......Espaco entre
    alignItems: 'center',                   //......Centraliza horizontal
  },

  // Botao de subtipo
  subtypeButton: {
    width: BUTTON_SIZE,                     //......Largura igual ao botao
    height: 28,                             //......Altura
    borderRadius: 6,                        //......Bordas arredondadas
    backgroundColor: 'rgba(0,0,0,0.5)',     //......Fundo escuro semitransparente
    justifyContent: 'center',               //......Centraliza vertical
    alignItems: 'center',                   //......Centraliza horizontal
  },

  // Subtipo selecionado
  subtypeButtonSelected: {
    backgroundColor: 'rgba(23,119,207,0.6)',  //......Fundo azul mais forte
  },

  // Botao de espessura
  strokeButton: {
    width: BUTTON_SIZE,                     //......Largura
    height: 24,                             //......Altura
    borderRadius: 4,                        //......Bordas arredondadas
    backgroundColor: 'rgba(0,0,0,0.5)',     //......Fundo escuro semitransparente
    justifyContent: 'center',               //......Centraliza vertical
    alignItems: 'center',                   //......Centraliza horizontal
  },

  // Espessura selecionada
  strokeButtonSelected: {
    backgroundColor: 'rgba(23,119,207,0.6)',  //......Fundo azul mais forte
  },

  // Linha de espessura
  strokeLine: {
    width: 20,                              //......Largura
    backgroundColor: EditorColors.buttonIcon,  //......Cor branca
    borderRadius: 2,                        //......Bordas arredondadas
  },

  // Linha selecionada
  strokeLineSelected: {
    backgroundColor: '#FFFFFF',                  //......Cor branca
  },

  // Botao de cor
  colorButton: {
    width: COLOR_SIZE,                      //......Largura
    height: COLOR_SIZE,                     //......Altura
    borderRadius: COLOR_SIZE / 2,           //......Circular
    borderWidth: 2,                         //......Borda
    borderColor: 'transparent',             //......Borda transparente
    marginVertical: 3,                      //......Espaco extra entre cores
  },

  // Cor selecionada
  colorButtonSelected: {
    borderColor: '#FFFFFF',                 //......Borda branca
    transform: [{ scale: 1.15 }],           //......Ligeiramente maior
  },

  // Cor branca (borda visivel)
  colorButtonWhite: {
    borderColor: 'rgba(0,0,0,0.3)',         //......Borda escura sutil
  },

  // Cor preta (borda branca fina)
  colorButtonBlack: {
    borderColor: 'rgba(255,255,255,0.5)',   //......Borda branca sutil
  },

  // Botao adicionar texto
  addTextButton: {
    width: BUTTON_SIZE,                     //......Largura
    height: 44,                             //......Altura maior
    borderRadius: 8,                        //......Bordas arredondadas
    backgroundColor: 'rgba(23,119,207,0.6)',  //......Fundo azul
    justifyContent: 'center',               //......Centraliza vertical
    alignItems: 'center',                   //......Centraliza horizontal
    gap: 2,                                 //......Espaco entre icone e texto
  },

  // Label adicionar texto
  addTextLabel: {
    fontSize: 9,                            //......Tamanho pequeno
    color: EditorColors.buttonIcon,         //......Cor branca
    fontWeight: '500',                      //......Peso medio
  },

  // Botao controle de fonte (+/-)
  fontSizeControlButton: {
    width: BUTTON_SIZE,                     //......Largura
    height: BUTTON_SIZE,                    //......Altura
    borderRadius: BUTTON_SIZE / 2,          //......Circular
    backgroundColor: 'rgba(0,0,0,0.5)',     //......Fundo escuro semitransparente
    justifyContent: 'center',               //......Centraliza vertical
    alignItems: 'center',                   //......Centraliza horizontal
  },

  // Botao tamanho fonte
  fontSizeButton: {
    width: BUTTON_SIZE,                     //......Largura
    height: 24,                             //......Altura
    borderRadius: 4,                        //......Bordas arredondadas
    backgroundColor: 'rgba(0,0,0,0.5)',     //......Fundo escuro semitransparente
    justifyContent: 'center',               //......Centraliza vertical
    alignItems: 'center',                   //......Centraliza horizontal
  },

  // Tamanho fonte selecionado
  fontSizeButtonSelected: {
    backgroundColor: 'rgba(23,119,207,0.6)',  //......Fundo azul mais forte
  },

  // Label tamanho fonte
  fontSizeLabel: {
    color: EditorColors.buttonIcon,         //......Cor branca
    fontWeight: '500',                      //......Peso medio
  },

  // Label tamanho fonte selecionado
  fontSizeLabelSelected: {
    color: '#FFFFFF',                       //......Cor branca
  },

  // Botao toggle (negrito)
  toggleButton: {
    width: BUTTON_SIZE,                     //......Largura
    height: BUTTON_SIZE,                    //......Altura
    borderRadius: 4,                        //......Bordas arredondadas
    backgroundColor: 'rgba(0,0,0,0.5)',     //......Fundo escuro semitransparente
    justifyContent: 'center',               //......Centraliza vertical
    alignItems: 'center',                   //......Centraliza horizontal
  },

  // Toggle selecionado
  toggleButtonSelected: {
    backgroundColor: 'rgba(23,119,207,0.6)',  //......Fundo azul mais forte
  },

  // Label negrito
  boldLabel: {
    fontSize: 16,                           //......Tamanho
    color: EditorColors.buttonIcon,         //......Cor branca
    fontWeight: '700',                      //......Peso bold
  },

  // Label negrito selecionado
  boldLabelSelected: {
    color: '#FFFFFF',                       //......Cor branca
  },
});
