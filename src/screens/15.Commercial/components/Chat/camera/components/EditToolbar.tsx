// ========================================
// Componente EditToolbar
// Barra de ferramentas do editor de fotos
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, { memo, useCallback } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Svg, { Path, Rect, G } from 'react-native-svg';

// ========================================
// Imports de Constantes
// ========================================
import { EditorColors, EditorStyles, EditorIcons, EditorMode, IconData } from '../utils/editorConstants';

// ========================================
// Tipos
// ========================================
interface EditToolbarProps {
  activeMode: EditorMode;                   //......Modo ativo
  isHD: boolean;                            //......HD ativado
  onModeChange: (mode: EditorMode) => void; //......Handler modo
  onToggleHD: () => void;                   //......Handler HD
  onClose: () => void;                      //......Handler fechar
  onOpenCropModal: () => void;              //......Handler abrir modal unificado crop
}

// ========================================
// Icone Fechar (X)
// ========================================
const CloseIcon: React.FC = memo(() => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d={EditorIcons.close} fill={EditorColors.buttonIcon} />
  </Svg>
));

// ========================================
// Icone HD (badge com texto)
// ========================================
const HDIcon: React.FC<{ active: boolean }> = memo(({ active }) => (
  <Svg width={28} height={20} viewBox="0 0 28 20" fill="none">
    <Rect
      x={1}
      y={1}
      width={26}
      height={18}
      rx={4}
      stroke={active ? EditorColors.hdActive : EditorColors.hdInactive}
      strokeWidth={2}
      fill="transparent"
    />
    <G>
      <Path
        d="M6 14V6h1.5v3.2h3V6H12v8h-1.5v-3.3h-3V14H6z"
        fill={active ? EditorColors.hdActive : EditorColors.hdInactive}
      />
      <Path
        d="M14 14V6h2.8c.9 0 1.6.1 2.1.4.5.2.9.6 1.2 1.1.3.5.4 1 .4 1.7v1.6c0 .7-.1 1.2-.4 1.7-.3.5-.7.8-1.2 1.1-.5.2-1.2.4-2.1.4H14zm1.5-1.3h1.3c.6 0 1-.1 1.3-.3.3-.2.5-.4.6-.7.1-.3.2-.7.2-1.2V9.2c0-.5-.1-.9-.2-1.2-.1-.3-.3-.5-.6-.7-.3-.2-.7-.3-1.3-.3h-1.3v5.7z"
        fill={active ? EditorColors.hdActive : EditorColors.hdInactive}
      />
    </G>
  </Svg>
));

// ========================================
// Icone Crop (moldura de recorte)
// ========================================
const CropIcon: React.FC<{ active: boolean }> = memo(({ active }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d={EditorIcons.crop}
      fill={active ? EditorColors.buttonActive : EditorColors.buttonIcon}
    />
  </Svg>
));

// ========================================
// Icone Emoji (carinha sorridente)
// ========================================
const EmojiIcon: React.FC<{ active: boolean }> = memo(({ active }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d={EditorIcons.emoji}
      fill={active ? EditorColors.buttonActive : EditorColors.buttonIcon}
    />
  </Svg>
));

// ========================================
// Icone Pincel (lapis com viewBox dinamico)
// ========================================
const PencilIcon: React.FC<{ active: boolean }> = memo(({ active }) => {
  const iconData: IconData = EditorIcons.pencil;
  const iconPath = typeof iconData === 'string' ? iconData : iconData.path;
  const iconViewBox = typeof iconData === 'string' ? '0 0 24 24' : iconData.viewBox;

  return (
    <Svg width={24} height={24} viewBox={iconViewBox} fill="none">
      <Path
        d={iconPath}
        fill={active ? EditorColors.buttonActive : EditorColors.buttonIcon}
      />
    </Svg>
  );
});

// ========================================
// Componente Principal EditToolbar
// ========================================
const EditToolbar: React.FC<EditToolbarProps> = memo(({
  activeMode,
  isHD,
  onModeChange,
  onToggleHD,
  onClose,
  onOpenCropModal,
}) => {
  console.log('🔴 [EDITOR_DEBUG] EditToolbar RENDER - activeMode:', activeMode, 'isHD:', isHD);

  // ========================================
  // Handlers
  // ========================================
  const handleToggleMode = useCallback((mode: EditorMode) => {
    if (activeMode === mode) {
      onModeChange('none');
    } else {
      onModeChange(mode);
    }
  }, [activeMode, onModeChange]);

  // ========================================
  // Render Principal
  // ========================================
  return (
    <View style={styles.container}>
      {/* Botao Fechar */}
      <Pressable style={styles.closeButton} onPress={onClose}>
        <CloseIcon />
      </Pressable>

      {/* Ferramentas */}
      <View style={styles.tools}>
        {/* HD */}
        <Pressable style={styles.toolButton} onPress={onToggleHD}>
          <HDIcon active={isHD} />
        </Pressable>

        {/* Crop - abre modal unificado */}
        <Pressable style={styles.toolButton} onPress={onOpenCropModal}>
          <CropIcon active={false} />
        </Pressable>

        {/* Emoji/Stickers */}
        <Pressable style={styles.toolButton} onPress={() => handleToggleMode('stickers')}>
          <EmojiIcon active={activeMode === 'stickers'} />
        </Pressable>

        {/* Pincel */}
        <Pressable style={styles.toolButton} onPress={() => handleToggleMode('drawing')}>
          <PencilIcon active={activeMode === 'drawing'} />
        </Pressable>
      </View>
    </View>
  );
});

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container principal
  container: {
    flexDirection: 'row',                   //......Layout horizontal
    alignItems: 'center',                   //......Centraliza vertical
    justifyContent: 'space-between',        //......Espaco entre
    paddingHorizontal: EditorStyles.headerPadding,  //......Padding lateral
    paddingTop: 40,                         //......Padding topo (safe area)
    paddingBottom: 12,                      //......Padding inferior
  },

  // Botao fechar
  closeButton: {
    width: EditorStyles.closeButtonSize,    //......Largura
    height: EditorStyles.closeButtonSize,   //......Altura
    borderRadius: EditorStyles.buttonRadius,  //......Circular
    backgroundColor: EditorColors.buttonBg, //......Fundo escuro
    justifyContent: 'center',               //......Centraliza vertical
    alignItems: 'center',                   //......Centraliza horizontal
  },

  // Container das ferramentas
  tools: {
    flexDirection: 'row',                   //......Layout horizontal
    alignItems: 'center',                   //......Centraliza vertical
    gap: EditorStyles.toolbarGap,           //......Espaco entre botoes
  },

  // Botao de ferramenta
  toolButton: {
    width: EditorStyles.toolbarButtonSize,  //......Largura
    height: EditorStyles.toolbarButtonSize, //......Altura
    borderRadius: EditorStyles.buttonRadius,  //......Circular
    backgroundColor: EditorColors.buttonBg, //......Fundo escuro
    justifyContent: 'center',               //......Centraliza vertical
    alignItems: 'center',                   //......Centraliza horizontal
  },
});

// ========================================
// Export
// ========================================
export default EditToolbar;
