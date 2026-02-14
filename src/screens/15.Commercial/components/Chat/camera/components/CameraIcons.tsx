// ========================================
// Componentes de Icones da Camera
// Icones SVG reutilizaveis
// ========================================

// ========================================
// Imports React
// ========================================
import React, { memo } from 'react';
import Svg, { Path } from 'react-native-svg';

// ========================================
// Imports de Constantes
// ========================================
import { CameraColors, CameraIcons } from '../utils/cameraConstants';

// ========================================
// Imports de Tipos
// ========================================
import { FlashMode } from 'expo-camera';

// ========================================
// Icone de Fechar
// ========================================
export const CloseIcon: React.FC = memo(() => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Path d={CameraIcons.close} fill={CameraColors.textWhite} />
  </Svg>
));

// ========================================
// Icone de Flash
// ========================================
export const FlashIcon: React.FC<{ mode: FlashMode }> = memo(({ mode }) => {
  const iconPath = mode === 'on'
    ? CameraIcons.flashOn                   //......Flash ligado
    : mode === 'off'
    ? CameraIcons.flashOff                  //......Flash desligado
    : CameraIcons.flashAuto;                //......Flash automatico

  const iconColor = mode === 'on'
    ? CameraColors.flashYellow              //......Amarelo quando ligado
    : CameraColors.textWhite;               //......Branco nos outros modos

  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Path d={iconPath} fill={iconColor} />
    </Svg>
  );
});

// ========================================
// Icone de Flip Camera
// ========================================
export const FlipIcon: React.FC = memo(() => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Path d={CameraIcons.flip} fill={CameraColors.textWhite} />
  </Svg>
));

// ========================================
// Icone de Galeria
// ========================================
export const GalleryIcon: React.FC = memo(() => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d={CameraIcons.gallery} fill={CameraColors.textWhite} />
  </Svg>
));
