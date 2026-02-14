// ========================================
// Componente WebGalleryCarousel
// Carrossel de galeria com imagens estaticas
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, { useCallback, memo } from 'react';
import { View, Image, Pressable, ScrollView, StyleSheet, Platform } from 'react-native';

// ========================================
// Imports de Constantes
// ========================================
import { CameraStyles } from '../utils/cameraConstants';

// ========================================
// Constantes
// ========================================
const THUMBNAIL_SIZE = 76;                //......Tamanho do thumbnail
const THUMBNAIL_GAP = 4;                  //......Espaco entre thumbnails
const THUMBNAIL_RADIUS = 4;               //......Borda levemente arredondada

// ========================================
// Array de Imagens da Galeria
// ========================================
const GALLERY_IMAGES = [
  { id: '1', source: require('../../../../../../../assets/gallery/img01.jpeg') },
  { id: '2', source: require('../../../../../../../assets/gallery/img02.jpeg') },
  { id: '3', source: require('../../../../../../../assets/gallery/img03.jpeg') },
  { id: '4', source: require('../../../../../../../assets/gallery/img04.jpg') },
  { id: '5', source: require('../../../../../../../assets/gallery/img05.jpg') },
  { id: '6', source: require('../../../../../../../assets/gallery/img06.jpg') },
  { id: '7', source: require('../../../../../../../assets/gallery/img07.jpg') },
  { id: '8', source: require('../../../../../../../assets/gallery/img08.jpg') },
  { id: '9', source: require('../../../../../../../assets/gallery/img09.png') },
  { id: '10', source: require('../../../../../../../assets/gallery/img10.png') },
  { id: '11', source: require('../../../../../../../assets/gallery/img11.png') },
  { id: '12', source: require('../../../../../../../assets/gallery/img12.png') },
  { id: '13', source: require('../../../../../../../assets/gallery/img13.png') },
  { id: '14', source: require('../../../../../../../assets/gallery/img14.png') },
  { id: '15', source: require('../../../../../../../assets/gallery/img15.webp') },
];

// ========================================
// Tipos
// ========================================
interface WebGalleryCarouselProps {
  onSelectImage: (uri: string, width: number, height: number) => void;
  onOpenFilePicker: () => void;
}

// ========================================
// Componente de Thumbnail
// ========================================
const PhotoThumbnail: React.FC<{
  source: any;
  onPress: () => void;
}> = memo(({ source, onPress }) => (
  <Pressable style={styles.thumbnail} onPress={onPress}>
    <Image
      source={source}
      style={styles.thumbnailImage}
      resizeMode="cover"
    />
  </Pressable>
));

// ========================================
// Componente Principal WebGalleryCarousel
// ========================================
const WebGalleryCarousel: React.FC<WebGalleryCarouselProps> = memo(({ onSelectImage }) => {
  // ========================================
  // Handler de Selecao de Imagem
  // ========================================
  const handleSelectImage = useCallback((source: any) => {
    console.log('📷 [WebGalleryCarousel] Imagem selecionada');

    // Para web, require retorna URI string diretamente
    // Para React Native, precisamos resolver o asset
    let uri: string;

    if (Platform.OS === 'web') {
      // Na web, source ja e a URI
      uri = typeof source === 'string' ? source : source.uri || source;
    } else {
      // No mobile, precisamos resolver
      const resolved = Image.resolveAssetSource(source);
      uri = resolved.uri;
    }

    console.log('📷 [WebGalleryCarousel] URI resolvida:', uri?.substring(0, 50));

    // Obter dimensoes da imagem
    if (Platform.OS === 'web') {
      // Na web, usar Image nativo do browser
      const img = new window.Image();
      img.onload = () => {
        console.log('📷 [WebGalleryCarousel] Dimensoes:', img.width, img.height);
        onSelectImage(uri, img.width, img.height);
      };
      img.onerror = () => {
        console.error('📷 [WebGalleryCarousel] Erro ao carregar imagem');
        // Fallback: enviar sem dimensoes
        onSelectImage(uri, 0, 0);
      };
      img.src = uri;
    } else {
      // No mobile, usar Image.getSize
      Image.getSize(
        uri,
        (width, height) => {
          console.log('📷 [WebGalleryCarousel] Dimensoes:', width, height);
          onSelectImage(uri, width, height);
        },
        (error) => {
          console.error('📷 [WebGalleryCarousel] Erro ao obter dimensoes:', error);
          onSelectImage(uri, 0, 0);
        }
      );
    }
  }, [onSelectImage]);

  // ========================================
  // Render: Nao Web
  // ========================================
  if (Platform.OS !== 'web') {
    return null;
  }

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
        {GALLERY_IMAGES.map((image) => (
          <PhotoThumbnail
            key={image.id}
            source={image.source}
            onPress={() => handleSelectImage(image.source)}
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
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    paddingHorizontal: 16,                //......Padding horizontal
  },

  // Conteudo do scroll
  scrollContent: {
    alignItems: 'center',                 //......Centraliza vertical
    paddingVertical: 8,                   //......Padding vertical
  },

  // Thumbnail
  thumbnail: {
    width: THUMBNAIL_SIZE,                //......Largura 56px
    height: THUMBNAIL_SIZE,               //......Altura 56px
    borderRadius: THUMBNAIL_RADIUS,       //......Borda 8px
    marginRight: THUMBNAIL_GAP,           //......Gap 8px
    overflow: 'hidden',                   //......Esconde overflow
  },

  // Imagem do thumbnail
  thumbnailImage: {
    width: '100%',                        //......Largura total
    height: '100%',                       //......Altura total
  },
});

// ========================================
// Export
// ========================================
export default WebGalleryCarousel;
