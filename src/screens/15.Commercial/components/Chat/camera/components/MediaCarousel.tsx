// ========================================
// Componente MediaCarousel
// Carrossel de miniaturas estilo WhatsApp
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, { memo, useCallback } from 'react';
import { View, Image, ScrollView, Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

// ========================================
// Imports de Constantes
// ========================================
import { CameraColors } from '../utils/cameraConstants';

// ========================================
// Imports de Tipos
// ========================================
import { MediaItem, MediaCarouselProps } from '../types/camera';

// ========================================
// Constantes
// ========================================
const THUMBNAIL_SIZE = 72;            //......Tamanho da miniatura
const THUMBNAIL_MARGIN = 4;           //......Margem entre miniaturas
const MAX_ITEMS_DEFAULT = 30;         //......Maximo de itens padrao

// ========================================
// Icone de Play (para videos)
// ========================================
const PlayIcon: React.FC = memo(() => (
  <View style={styles.playIconContainer}>
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8 5v14l11-7z"
        fill="#FFFFFF"
      />
    </Svg>
  </View>
));

// ========================================
// Icone de Lixeira (para item selecionado)
// Icone padrao do sistema em branco
// ========================================
const TrashIcon: React.FC = memo(() => (
  <Svg width={22} height={24} viewBox="0 0 27 30" fill="none">
    <Path
      d="M10.8 12.2727C11.4923 12.2727 12.0629 12.7991 12.1409 13.4773L12.15 13.6364V21.8182C12.15 22.5713 11.5456 23.1818 10.8 23.1818C10.1077 23.1818 9.53707 22.6554 9.45908 21.9772L9.45 21.8182V13.6364C9.45 12.8832 10.0544 12.2727 10.8 12.2727Z"
      fill="#FFFFFF"
    />
    <Path
      d="M17.5409 13.4773C17.4629 12.7991 16.8923 12.2727 16.2 12.2727C15.4544 12.2727 14.85 12.8832 14.85 13.6364V21.8182L14.8591 21.9772C14.9371 22.6554 15.5077 23.1818 16.2 23.1818C16.9456 23.1818 17.55 22.5713 17.55 21.8182V13.6364L17.5409 13.4773Z"
      fill="#FFFFFF"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M16.2 0C18.3569 0 20.1199 1.70307 20.2431 3.85054L20.25 4.09091V5.45455H25.65C26.3956 5.45455 27 6.06507 27 6.81818C27 7.5175 26.4788 8.09387 25.8074 8.17264L25.65 8.18182H24.3V25.9091C24.3 28.0877 22.614 29.8686 20.488 29.9931L20.25 30H6.75C4.59313 30 2.83006 28.2969 2.70688 26.1495L2.7 25.9091V8.18182H1.35C0.604416 8.18182 0 7.5713 0 6.81818C0 6.11886 0.521154 5.54249 1.19256 5.46372L1.35 5.45455H6.75V4.09091C6.75 1.91225 8.43604 0.131372 10.562 0.00694458L10.8 0H16.2ZM5.4 8.18182V25.9091C5.4 26.6084 5.92115 27.1848 6.59256 27.2636L6.75 27.2727H20.25C20.9423 27.2727 21.5129 26.7463 21.5909 26.0681L21.6 25.9091V8.18182H5.4ZM17.55 5.45455H9.45V4.09091L9.45908 3.93188C9.53707 3.25369 10.1077 2.72727 10.8 2.72727H16.2L16.3574 2.73645C17.0288 2.81522 17.55 3.39159 17.55 4.09091V5.45455Z"
      fill="#FFFFFF"
    />
  </Svg>
));

// ========================================
// Icone de Adicionar (+)
// ========================================
const AddIcon: React.FC = memo(() => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 5v14M5 12h14"
      stroke={CameraColors.textSecondary}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
));

// ========================================
// Componente ThumbnailItem
// Estilo WhatsApp: selecionado mostra lixeira
// ========================================
const ThumbnailItem: React.FC<{
  item: MediaItem;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  canRemove: boolean;
}> = memo(({
  item,
  isSelected,
  onSelect,
  onRemove,
  canRemove,
}) => {
  // Handler de clique na miniatura
  const handlePress = useCallback(() => {
    if (isSelected && canRemove) {
      onRemove();
    } else {
      onSelect();
    }
  }, [isSelected, canRemove, onRemove, onSelect]);

  return (
    <Pressable
      style={[
        styles.thumbnailContainer,
        isSelected && styles.thumbnailSelected,
      ]}
      onPress={handlePress}
    >
      {/* Imagem */}
      <Image
        source={{ uri: item.thumbnail || item.uri }}
        style={styles.thumbnailImage}
        resizeMode="cover"
      />

      {/* Badge de video (apenas se nao selecionado) */}
      {item.type === 'video' && !isSelected && <PlayIcon />}

      {/* Overlay de lixeira (apenas se selecionado e pode remover) */}
      {isSelected && canRemove && (
        <View style={styles.trashOverlay}>
          <TrashIcon />
        </View>
      )}
    </Pressable>
  );
});

// ========================================
// Componente AddMoreButton
// ========================================
const AddMoreButton: React.FC<{
  onPress: () => void;
}> = memo(({ onPress }) => (
  <Pressable style={styles.addButton} onPress={onPress}>
    <AddIcon />
  </Pressable>
));

// ========================================
// Componente Principal MediaCarousel
// ========================================
const MediaCarousel: React.FC<MediaCarouselProps> = memo(({
  items,                              //......Lista de midias
  selectedIndex,                      //......Indice selecionado
  onSelectItem,                       //......Seleciona item
  onRemoveItem,                       //......Remove item
  onAddMore,                          //......Adiciona mais midias
  maxItems = MAX_ITEMS_DEFAULT,       //......Maximo de itens
}) => {
  // ========================================
  // Calcular se pode adicionar mais
  // ========================================
  const canAddMore = items.length < maxItems;

  // ========================================
  // Calcular se pode remover (minimo 1 item)
  // ========================================
  const canRemove = items.length > 1;

  // ========================================
  // Render: Lista vazia ou 1 item (sem carrossel)
  // ========================================
  if (items.length <= 1) {
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
        {/* Miniaturas */}
        {items.map((item, index) => (
          <ThumbnailItem
            key={item.id}
            item={item}
            isSelected={index === selectedIndex}
            onSelect={() => onSelectItem(index)}
            onRemove={() => onRemoveItem(index)}
            canRemove={canRemove}
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
    paddingVertical: 12,              //......Padding vertical
  },

  // Conteudo do scroll
  scrollContent: {
    paddingHorizontal: 16,            //......Padding horizontal
    gap: THUMBNAIL_MARGIN * 2,        //......Espaco entre itens
    alignItems: 'center',             //......Centraliza vertical
  },

  // Container da miniatura
  thumbnailContainer: {
    width: THUMBNAIL_SIZE,            //......Largura
    height: THUMBNAIL_SIZE,           //......Altura
    borderRadius: 8,                  //......Cantos arredondados
    overflow: 'hidden',               //......Esconde overflow
    borderWidth: 2,                   //......Borda
    borderColor: 'transparent',       //......Borda transparente
  },

  // Miniatura selecionada
  thumbnailSelected: {
    borderColor: '#FFFFFF',             //......Borda branca
    borderWidth: 3,                     //......Borda mais grossa
  },

  // Imagem da miniatura
  thumbnailImage: {
    width: '100%',                    //......Largura total
    height: '100%',                   //......Altura total
  },

  // Container do icone play
  playIconContainer: {
    position: 'absolute',             //......Posicao absoluta
    top: 0,                           //......Topo
    left: 0,                          //......Esquerda
    right: 0,                         //......Direita
    bottom: 0,                        //......Fundo
    justifyContent: 'center',         //......Centraliza vertical
    alignItems: 'center',             //......Centraliza horizontal
    backgroundColor: 'rgba(0,0,0,0.3)',  //......Fundo escuro
  },

  // Overlay de lixeira (item selecionado)
  trashOverlay: {
    position: 'absolute',             //......Posicao absoluta
    top: 0,                           //......Topo
    left: 0,                          //......Esquerda
    right: 0,                         //......Direita
    bottom: 0,                        //......Fundo
    justifyContent: 'center',         //......Centraliza vertical
    alignItems: 'center',             //......Centraliza horizontal
    backgroundColor: 'rgba(0,0,0,0.5)',  //......Fundo escuro
  },

  // Botao de adicionar
  addButton: {
    width: THUMBNAIL_SIZE,            //......Largura
    height: THUMBNAIL_SIZE,           //......Altura
    borderRadius: 8,                  //......Cantos arredondados
    borderWidth: 2,                   //......Borda
    borderColor: CameraColors.textSecondary,  //......Borda cinza
    borderStyle: 'dashed',            //......Borda tracejada
    justifyContent: 'center',         //......Centraliza vertical
    alignItems: 'center',             //......Centraliza horizontal
  },
});

// ========================================
// Export
// ========================================
export default MediaCarousel;
