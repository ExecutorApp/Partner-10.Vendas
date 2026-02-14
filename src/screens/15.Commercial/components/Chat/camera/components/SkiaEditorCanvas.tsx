// ========================================
// Componente SkiaEditorCanvas
// Canvas de desenho usando React Native Skia
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, { memo, useCallback, useRef, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Canvas, Path, Skia, useImage, Image as SkiaImage } from '@shopify/react-native-skia';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';

// ========================================
// Imports de Tipos
// ========================================
import { DrawPath } from '../hooks/useDrawingHistory';

// ========================================
// Tipos
// ========================================
interface SkiaEditorCanvasProps {
  imageUri: string;                         //......URI da imagem
  imageWidth: number;                       //......Largura original
  imageHeight: number;                      //......Altura original
  paths: DrawPath[];                        //......Paths para renderizar
  currentColor: string;                     //......Cor atual
  currentStrokeWidth: number;               //......Espessura atual
  isDrawingMode: boolean;                   //......Modo desenho ativo
  onPathComplete: (path: DrawPath) => void; //......Callback path completo
}

// ========================================
// Gerar ID Unico
// ========================================
const generateId = (): string => {
  return `path_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// ========================================
// Componente Principal SkiaEditorCanvas
// ========================================
const SkiaEditorCanvas: React.FC<SkiaEditorCanvasProps> = memo(({
  imageUri,
  imageWidth,
  imageHeight,
  paths,
  currentColor,
  currentStrokeWidth,
  isDrawingMode,
  onPathComplete,
}) => {
  console.log('🎨 [SkiaEditorCanvas] Render - isDrawingMode:', isDrawingMode, 'paths:', paths.length);

  // ========================================
  // Carregar Imagem
  // ========================================
  const image = useImage(imageUri);

  // ========================================
  // Estado do Path Atual
  // ========================================
  const [currentPoints, setCurrentPoints] = useState<Array<{ x: number; y: number }>>([]);
  const isDrawingRef = useRef(false);

  // ========================================
  // Converter Pontos para Skia Path
  // ========================================
  const pointsToSkiaPath = useCallback((points: Array<{ x: number; y: number }>) => {
    if (points.length < 2) return null;

    const path = Skia.Path.Make();
    path.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      path.lineTo(points[i].x, points[i].y);
    }

    return path;
  }, []);

  // ========================================
  // Gesture de Desenho (Pan)
  // ========================================
  const panGesture = Gesture.Pan()
    .enabled(isDrawingMode)
    .minDistance(0)
    .onBegin((e) => {
      if (!isDrawingMode) return;
      console.log('🎨 [SkiaEditorCanvas] Pan begin:', e.x, e.y);
      isDrawingRef.current = true;
      setCurrentPoints([{ x: e.x, y: e.y }]);
    })
    .onUpdate((e) => {
      if (!isDrawingMode || !isDrawingRef.current) return;
      setCurrentPoints(prev => [...prev, { x: e.x, y: e.y }]);
    })
    .onEnd((e) => {
      if (!isDrawingMode || !isDrawingRef.current) return;
      console.log('🎨 [SkiaEditorCanvas] Pan end - points:', currentPoints.length);
      isDrawingRef.current = false;

      // Salvar path se tiver pontos suficientes
      if (currentPoints.length >= 2) {
        const newPath: DrawPath = {
          id: generateId(),
          points: [...currentPoints, { x: e.x, y: e.y }],
          color: currentColor,
          strokeWidth: currentStrokeWidth,
        };
        onPathComplete(newPath);
      }

      setCurrentPoints([]);
    })
    .onFinalize(() => {
      isDrawingRef.current = false;
      setCurrentPoints([]);
    });

  // ========================================
  // Render Paths Salvos
  // ========================================
  const renderSavedPaths = useCallback(() => {
    return paths.map((pathData) => {
      const skiaPath = pointsToSkiaPath(pathData.points);
      if (!skiaPath) return null;

      return (
        <Path
          key={pathData.id}
          path={skiaPath}
          style="stroke"
          strokeWidth={pathData.strokeWidth}
          strokeCap="round"
          strokeJoin="round"
          color={pathData.color}
        />
      );
    });
  }, [paths, pointsToSkiaPath]);

  // ========================================
  // Render Path Atual (em desenho)
  // ========================================
  const renderCurrentPath = useCallback(() => {
    if (currentPoints.length < 2) return null;

    const skiaPath = pointsToSkiaPath(currentPoints);
    if (!skiaPath) return null;

    return (
      <Path
        path={skiaPath}
        style="stroke"
        strokeWidth={currentStrokeWidth}
        strokeCap="round"
        strokeJoin="round"
        color={currentColor}
      />
    );
  }, [currentPoints, currentColor, currentStrokeWidth, pointsToSkiaPath]);

  // ========================================
  // Render: Sem Imagem
  // ========================================
  if (!image) {
    console.log('🎨 [SkiaEditorCanvas] Image not loaded yet');
    return null;
  }

  // ========================================
  // Render Principal
  // ========================================
  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <View style={styles.canvasContainer}>
          <Canvas style={styles.canvas}>
            {/* Imagem de Fundo */}
            <SkiaImage
              image={image}
              x={0}
              y={0}
              width={imageWidth}
              height={imageHeight}
              fit="contain"
            />

            {/* Paths Salvos */}
            {renderSavedPaths()}

            {/* Path Atual em Desenho */}
            {renderCurrentPath()}
          </Canvas>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
});

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1,                                //......Ocupa tudo
  },

  // Container do canvas
  canvasContainer: {
    flex: 1,                                //......Ocupa tudo
  },

  // Canvas
  canvas: {
    flex: 1,                                //......Ocupa tudo
  },
});

// ========================================
// Export
// ========================================
export default SkiaEditorCanvas;
