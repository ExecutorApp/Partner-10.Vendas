// ========================================
// Componente GalleryCarousel
// Carrossel horizontal com fotos recentes
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, { useState, useEffect, useCallback, memo } from 'react';
import { View, Image, Pressable, FlatList, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import Svg, { Path } from 'react-native-svg';

// ========================================
// Imports de Constantes
// ========================================
import { CameraColors, CameraStyles, CameraIcons } from '../utils/cameraConstants';

// ========================================
// Constantes
// ========================================
const PHOTO_COUNT = 6;              //......Quantidade de fotos
const THUMBNAIL_SIZE = 60;          //......Tamanho do thumbnail
const THUMBNAIL_GAP = 8;            //......Espaco entre thumbnails

// ========================================
// Tipo do Asset
// ========================================
interface GalleryAsset {
  id: string;                       //......ID unico
  uri: string;                      //......URI da imagem
  width: number;                    //......Largura
  height: number;                   //......Altura
}

// ========================================
// Props do Componente
// ========================================
interface GalleryCarouselProps {
  onSelectPhoto: (asset: GalleryAsset) => void;  //......Handler de selecao
  onOpenGallery: () => void;                      //......Handler de abrir galeria completa
}

// ========================================
// Icone de Galeria
// ========================================
const GalleryIcon: React.FC = memo(() => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d={CameraIcons.gallery} fill={CameraColors.textWhite} />
  </Svg>
));

// ========================================
// Componente de Thumbnail
// ========================================
const PhotoThumbnail: React.FC<{ asset: GalleryAsset; onPress: () => void }> = memo(({ asset, onPress }) => (
  <Pressable
    style={styles.thumbnail}
    onPress={onPress}
  >
    <Image
      source={{ uri: asset.uri }}
      style={styles.thumbnailImage}
      resizeMode="cover"
    />
  </Pressable>
));

// ========================================
// Componente Principal GalleryCarousel
// ========================================
const GalleryCarousel: React.FC<GalleryCarouselProps> = memo(({ onSelectPhoto, onOpenGallery }) => {
  // ========================================
  // Estados
  // ========================================
  const [assets, setAssets] = useState<GalleryAsset[]>([]);     //......Fotos recentes
  const [loading, setLoading] = useState(true);                  //......Carregando
  const [hasPermission, setHasPermission] = useState(false);     //......Permissao

  // ========================================
  // Carregar Fotos Recentes
  // ========================================
  useEffect(() => {
    const loadPhotos = async () => {
      try {
        // Solicitar permissao
        const { status } = await MediaLibrary.requestPermissionsAsync();
        setHasPermission(status === 'granted');

        if (status !== 'granted') {
          setLoading(false);
          return;
        }

        // Buscar fotos recentes
        const { assets: mediaAssets } = await MediaLibrary.getAssetsAsync({
          first: PHOTO_COUNT,
          mediaType: MediaLibrary.MediaType.photo,
          sortBy: [MediaLibrary.SortBy.creationTime],
        });

        // Converter para formato local
        const galleryAssets: GalleryAsset[] = mediaAssets.map(asset => ({
          id: asset.id,
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
        }));

        setAssets(galleryAssets);
      } catch (error) {
        console.error('[GalleryCarousel] Erro ao carregar fotos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPhotos();
  }, []);

  // ========================================
  // Handler de Selecao de Foto
  // ========================================
  const handleSelectPhoto = useCallback((asset: GalleryAsset) => {
    onSelectPhoto(asset);
  }, [onSelectPhoto]);

  // ========================================
  // Render Item do FlatList
  // ========================================
  const renderItem = useCallback(({ item }: { item: GalleryAsset }) => (
    <PhotoThumbnail
      asset={item}
      onPress={() => handleSelectPhoto(item)}
    />
  ), [handleSelectPhoto]);

  // ========================================
  // KeyExtractor
  // ========================================
  const keyExtractor = useCallback((item: GalleryAsset) => item.id, []);

  // ========================================
  // Render de Loading
  // ========================================
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={CameraColors.textWhite} />
      </View>
    );
  }

  // ========================================
  // Render Sem Permissao ou Sem Fotos
  // ========================================
  if (!hasPermission || assets.length === 0) {
    return (
      <View style={styles.container}>
        {/* Botao de Galeria */}
        <Pressable
          style={styles.galleryButton}
          onPress={onOpenGallery}
        >
          <GalleryIcon />
        </Pressable>
      </View>
    );
  }

  // ========================================
  // Render Principal
  // ========================================
  return (
    <View style={styles.container}>
      {/* Botao de Galeria */}
      <Pressable
        style={styles.galleryButton}
        onPress={onOpenGallery}
      >
        <GalleryIcon />
      </Pressable>

      {/* Lista de Thumbnails */}
      <FlatList
        data={assets}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
});

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container principal
  container: {
    flexDirection: 'row',               //......Layout horizontal
    alignItems: 'center',               //......Centraliza vertical
    paddingHorizontal: 16,              //......Padding horizontal
    height: 80,                         //......Altura fixa
  },

  // Botao de galeria
  galleryButton: {
    width: THUMBNAIL_SIZE,              //......Largura igual ao thumbnail
    height: THUMBNAIL_SIZE,             //......Altura igual ao thumbnail
    borderRadius: CameraStyles.borderRadiusCard,  //......Bordas arredondadas
    backgroundColor: CameraColors.overlayLight,   //......Semi-transparente
    justifyContent: 'center',           //......Centraliza vertical
    alignItems: 'center',               //......Centraliza horizontal
    marginRight: THUMBNAIL_GAP,         //......Espaco a direita
  },

  // Conteudo da lista
  listContent: {
    alignItems: 'center',               //......Centraliza vertical
  },

  // Separador entre thumbnails
  separator: {
    width: THUMBNAIL_GAP,               //......Largura do espaco
  },

  // Container do thumbnail
  thumbnail: {
    width: THUMBNAIL_SIZE,              //......Largura
    height: THUMBNAIL_SIZE,             //......Altura
    borderRadius: CameraStyles.borderRadiusCard,  //......Bordas arredondadas
    overflow: 'hidden',                 //......Corta conteudo excedente
  },

  // Imagem do thumbnail
  thumbnailImage: {
    width: '100%',                      //......Largura total
    height: '100%',                     //......Altura total
  },
});

// ========================================
// Export
// ========================================
export default GalleryCarousel;
