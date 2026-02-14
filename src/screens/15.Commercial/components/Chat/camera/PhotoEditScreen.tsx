// ========================================
// Tela de Edicao de Foto
// Crop, Rotate e ajustes basicos
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, { useState, useCallback, useRef } from 'react';
import { View, Image, Text, Pressable, StyleSheet, StatusBar, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImageManipulator from 'expo-image-manipulator';
import Svg, { Path } from 'react-native-svg';

// ========================================
// Imports de Navegacao
// ========================================
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// ========================================
// Imports de Constantes
// ========================================
import { CameraColors, CameraStyles, CameraIcons } from './utils/cameraConstants';

// ========================================
// Constantes
// ========================================
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CROP_RATIOS = [
  { label: 'Livre', value: null },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
];

// ========================================
// Tipo de Navegacao
// ========================================
type RootStackParamList = {
  PhotoEditScreen: {
    photoUri: string;
    photoWidth: number;
    photoHeight: number;
    leadName: string;
    leadId: string;
    leadPhone: string;
  };
  PhotoPreviewScreen: {
    photoUri: string;
    photoWidth: number;
    photoHeight: number;
    leadName: string;
    leadId: string;
    leadPhone: string;
  };
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'PhotoEditScreen'>;
type PhotoEditRouteProp = RouteProp<RootStackParamList, 'PhotoEditScreen'>;

// ========================================
// Icones
// ========================================
const CloseIcon: React.FC = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d={CameraIcons.close} fill={CameraColors.textWhite} />
  </Svg>
);

const CheckIcon: React.FC = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill={CameraColors.textWhite} />
  </Svg>
);

const RotateIcon: React.FC = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M7.11 8.53L5.7 7.11C4.8 8.27 4.24 9.61 4.07 11h2.02c.14-.87.49-1.72 1.02-2.47zM6.09 13H4.07c.17 1.39.72 2.73 1.62 3.89l1.41-1.42c-.52-.75-.87-1.59-1.01-2.47zm1.01 5.32c1.16.9 2.51 1.44 3.9 1.61V17.9c-.87-.15-1.71-.49-2.46-1.03L7.1 18.32zM13 4.07V1L8.45 5.55 13 10V6.09c2.84.48 5 2.94 5 5.91s-2.16 5.43-5 5.91v2.02c3.95-.49 7-3.85 7-7.93s-3.05-7.44-7-7.93z" fill={CameraColors.textWhite} />
  </Svg>
);

const CropIcon: React.FC = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M17 15h2V7c0-1.1-.9-2-2-2H9v2h8v8zM7 17V1H5v4H1v2h4v10c0 1.1.9 2 2 2h10v4h2v-4h4v-2H7z" fill={CameraColors.textWhite} />
  </Svg>
);

// ========================================
// Componente Principal PhotoEditScreen
// ========================================
const PhotoEditScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PhotoEditRouteProp>();
  const insets = useSafeAreaInsets();
  const { photoUri, photoWidth, photoHeight, leadName, leadId, leadPhone } = route.params;

  // ========================================
  // Estados
  // ========================================
  const [currentUri, setCurrentUri] = useState(photoUri);
  const [currentWidth, setCurrentWidth] = useState(photoWidth);
  const [currentHeight, setCurrentHeight] = useState(photoHeight);
  const [rotation, setRotation] = useState(0);
  const [selectedRatio, setSelectedRatio] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCropOptions, setShowCropOptions] = useState(false);

  // ========================================
  // Handler de Cancelar
  // ========================================
  const handleCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // ========================================
  // Handler de Rotacao
  // ========================================
  const handleRotate = useCallback(async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const newRotation = (rotation + 90) % 360;
      const result = await ImageManipulator.manipulateAsync(
        currentUri,
        [{ rotate: 90 }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );

      setCurrentUri(result.uri);
      setCurrentWidth(result.width);
      setCurrentHeight(result.height);
      setRotation(newRotation);
    } catch (error) {
      console.error('[PhotoEditScreen] Erro ao rotacionar:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, currentUri, rotation]);

  // ========================================
  // Handler de Crop
  // ========================================
  const handleCrop = useCallback(async (ratio: number | null) => {
    if (isProcessing) return;
    setSelectedRatio(ratio);
    setShowCropOptions(false);

    if (ratio === null) return; // Livre, sem crop

    setIsProcessing(true);

    try {
      // Calcular dimensoes do crop
      let cropWidth = currentWidth;
      let cropHeight = currentHeight;
      let originX = 0;
      let originY = 0;

      const currentRatio = currentWidth / currentHeight;

      if (currentRatio > ratio) {
        // Imagem mais larga que o ratio desejado
        cropWidth = currentHeight * ratio;
        originX = (currentWidth - cropWidth) / 2;
      } else {
        // Imagem mais alta que o ratio desejado
        cropHeight = currentWidth / ratio;
        originY = (currentHeight - cropHeight) / 2;
      }

      const result = await ImageManipulator.manipulateAsync(
        currentUri,
        [{ crop: { originX, originY, width: cropWidth, height: cropHeight } }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );

      setCurrentUri(result.uri);
      setCurrentWidth(result.width);
      setCurrentHeight(result.height);
    } catch (error) {
      console.error('[PhotoEditScreen] Erro ao cortar:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, currentUri, currentWidth, currentHeight]);

  // ========================================
  // Handler de Confirmar
  // ========================================
  const handleConfirm = useCallback(() => {
    navigation.navigate('PhotoPreviewScreen', {
      photoUri: currentUri,
      photoWidth: currentWidth,
      photoHeight: currentHeight,
      leadName,
      leadId,
      leadPhone,
    });
  }, [navigation, currentUri, currentWidth, currentHeight, leadName, leadId, leadPhone]);

  // ========================================
  // Calcular dimensoes da preview
  // ========================================
  const previewWidth = SCREEN_WIDTH - 32;
  const aspectRatio = currentWidth / currentHeight;
  const previewHeight = previewWidth / aspectRatio;

  // ========================================
  // Render Principal
  // ========================================
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <SafeAreaView style={styles.header}>
        <Pressable style={styles.headerButton} onPress={handleCancel} hitSlop={12}>
          <CloseIcon />
        </Pressable>
        <Text style={styles.headerTitle}>Editar</Text>
        <Pressable style={[styles.headerButton, styles.confirmButton]} onPress={handleConfirm} hitSlop={12} disabled={isProcessing}>
          <CheckIcon />
        </Pressable>
      </SafeAreaView>

      {/* Preview da Imagem */}
      <View style={styles.previewContainer}>
        {isProcessing && (
          <View style={styles.processingOverlay}>
            <ActivityIndicator size="large" color={CameraColors.primary} />
          </View>
        )}
        <Image
          source={{ uri: currentUri }}
          style={[styles.preview, { width: previewWidth, height: Math.min(previewHeight, 500) }]}
          resizeMode="contain"
        />
      </View>

      {/* Opcoes de Crop */}
      {showCropOptions && (
        <View style={styles.cropOptionsContainer}>
          {CROP_RATIOS.map((ratio) => (
            <Pressable
              key={ratio.label}
              style={[styles.cropOption, selectedRatio === ratio.value && styles.cropOptionSelected]}
              onPress={() => handleCrop(ratio.value)}
            >
              <Text style={[styles.cropOptionText, selectedRatio === ratio.value && styles.cropOptionTextSelected]}>
                {ratio.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Ferramentas de Edicao */}
      <View style={[styles.toolsContainer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable style={styles.toolButton} onPress={handleRotate} disabled={isProcessing}>
          <RotateIcon />
          <Text style={styles.toolLabel}>Girar</Text>
        </Pressable>

        <Pressable style={styles.toolButton} onPress={() => setShowCropOptions(!showCropOptions)} disabled={isProcessing}>
          <CropIcon />
          <Text style={styles.toolLabel}>Cortar</Text>
        </Pressable>
      </View>
    </View>
  );
};

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CameraColors.cameraBackground,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },

  headerButton: {
    width: 44,
    height: 44,
    borderRadius: CameraStyles.borderRadiusButton,
    backgroundColor: CameraColors.overlayLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  confirmButton: {
    backgroundColor: CameraColors.primary,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: CameraColors.textWhite,
  },

  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  preview: {
    borderRadius: 8,
  },

  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 10,
  },

  cropOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },

  cropOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: CameraColors.overlayLight,
  },

  cropOptionSelected: {
    backgroundColor: CameraColors.primary,
  },

  cropOptionText: {
    fontSize: 14,
    color: CameraColors.textWhite,
  },

  cropOptionTextSelected: {
    fontWeight: '600',
  },

  toolsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 16,
    gap: 48,
  },

  toolButton: {
    alignItems: 'center',
    gap: 8,
  },

  toolLabel: {
    fontSize: 12,
    color: CameraColors.textWhite,
  },
});

export default PhotoEditScreen;
