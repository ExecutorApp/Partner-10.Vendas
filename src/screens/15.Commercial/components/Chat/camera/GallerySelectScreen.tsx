// ========================================
// Tela de Selecao de Galeria
// Permite selecionar multiplas fotos/videos
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, { useState, useEffect, useCallback, memo } from 'react';
import { View, Text, Image, Pressable, FlatList, StyleSheet, StatusBar, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as MediaLibrary from 'expo-media-library';
import Svg, { Path, Circle } from 'react-native-svg';

// ========================================
// Imports de Navegacao
// ========================================
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// ========================================
// Imports de Constantes
// ========================================
import { CameraColors, CameraStyles, CameraIcons } from './utils/cameraConstants';

// ========================================
// Constantes
// ========================================
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NUM_COLUMNS = 3; //....................... Numero de colunas
const ITEM_GAP = 2; //.......................... Espaco entre itens
const ITEM_SIZE = (SCREEN_WIDTH - (NUM_COLUMNS + 1) * ITEM_GAP) / NUM_COLUMNS;
const MAX_SELECTION = 10; //.................... Maximo de itens selecionados
const ITEMS_PER_PAGE = 50; //................... Itens por pagina

// ========================================
// Tipo do Asset
// ========================================
interface GalleryAsset {
  id: string; //........... ID unico
  uri: string; //.......... URI da midia
  width: number; //........ Largura
  height: number; //....... Altura
  mediaType: 'photo' | 'video'; // Tipo de midia
  duration?: number; //.... Duracao (se video)
}

// ========================================
// Tipo de Navegacao
// ========================================
type RootStackParamList = {
  GallerySelectScreen: {
    leadId: string;
    leadName: string;
    leadPhone: string;
    mediaType?: 'photo' | 'video' | 'all';
  };
  MultiPreviewScreen: {
    assets: GalleryAsset[];
    leadId: string;
    leadName: string;
    leadPhone: string;
  };
  LeadChatScreen: any;
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'GallerySelectScreen'>;
type GallerySelectRouteProp = RouteProp<RootStackParamList, 'GallerySelectScreen'>;

// ========================================
// Icones
// ========================================
const CloseIcon: React.FC = memo(() => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Path d={CameraIcons.close} fill={CameraColors.textPrimary} />
  </Svg>
));

const CheckIcon: React.FC<{ selected: boolean; index?: number }> = memo(({ selected, index }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Circle
      cx={12}
      cy={12}
      r={10}
      fill={selected ? CameraColors.primary : 'transparent'}
      stroke={selected ? CameraColors.primary : CameraColors.textWhite}
      strokeWidth={2}
    />
    {selected && index !== undefined && (
      <Text
        style={{
          position: 'absolute',
          color: CameraColors.textWhite,
          fontSize: 12,
          fontWeight: '600',
        }}
      >
        {index + 1}
      </Text>
    )}
    {selected && index === undefined && (
      <Path d="M9 12l2 2 4-4" stroke={CameraColors.textWhite} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    )}
  </Svg>
));

const VideoIcon: React.FC = memo(() => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M8 5v14l11-7z" fill={CameraColors.textWhite} />
  </Svg>
));

// ========================================
// Formatar duracao
// ========================================
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60); //.. Minutos
  const secs = Math.floor(seconds % 60); //.. Segundos
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// ========================================
// Componente de Item da Galeria
// ========================================
const GalleryItem: React.FC<{
  asset: GalleryAsset;
  selected: boolean;
  selectionIndex: number;
  onPress: () => void;
  onLongPress: () => void;
}> = memo(({ asset, selected, selectionIndex, onPress, onLongPress }) => (
  <Pressable
    style={[styles.item, selected && styles.itemSelected]}
    onPress={onPress}
    onLongPress={onLongPress}
  >
    <Image source={{ uri: asset.uri }} style={styles.itemImage} resizeMode="cover" />

    {/* Badge de Video */}
    {asset.mediaType === 'video' && (
      <View style={styles.videoBadge}>
        <VideoIcon />
        {asset.duration !== undefined && (
          <Text style={styles.videoDuration}>{formatDuration(asset.duration)}</Text>
        )}
      </View>
    )}

    {/* Checkbox de Selecao */}
    <View style={styles.checkboxContainer}>
      {selected ? (
        <View style={styles.checkboxSelected}>
          <Text style={styles.checkboxNumber}>{selectionIndex + 1}</Text>
        </View>
      ) : (
        <View style={styles.checkboxEmpty} />
      )}
    </View>

    {/* Overlay quando selecionado */}
    {selected && <View style={styles.selectedOverlay} />}
  </Pressable>
));

// ========================================
// Componente Principal GallerySelectScreen
// ========================================
const GallerySelectScreen: React.FC = () => {
  // ========================================
  // Navegacao e Rota
  // ========================================
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<GallerySelectRouteProp>();
  const insets = useSafeAreaInsets();

  // ========================================
  // Parametros da Rota
  // ========================================
  const { leadId, leadName, leadPhone, mediaType = 'all' } = route.params;

  // ========================================
  // Estados
  // ========================================
  const [assets, setAssets] = useState<GalleryAsset[]>([]); //....... Lista de midias
  const [selectedIds, setSelectedIds] = useState<string[]>([]); //... IDs selecionados
  const [loading, setLoading] = useState(true); //................... Carregando
  const [hasMore, setHasMore] = useState(true); //................... Tem mais itens
  const [endCursor, setEndCursor] = useState<string | undefined>(); // Cursor

  // ========================================
  // Carregar Midias
  // ========================================
  const loadAssets = useCallback(async (cursor?: string) => {
    try {
      const mediaTypes = mediaType === 'photo'
        ? MediaLibrary.MediaType.photo
        : mediaType === 'video'
          ? MediaLibrary.MediaType.video
          : [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video];

      const { assets: mediaAssets, hasNextPage, endCursor: newCursor } = await MediaLibrary.getAssetsAsync({
        first: ITEMS_PER_PAGE,
        after: cursor,
        mediaType: mediaTypes,
        sortBy: [MediaLibrary.SortBy.creationTime],
      });

      const galleryAssets: GalleryAsset[] = mediaAssets.map(asset => ({
        id: asset.id,
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        mediaType: asset.mediaType === 'video' ? 'video' : 'photo',
        duration: asset.duration,
      }));

      if (cursor) {
        setAssets(prev => [...prev, ...galleryAssets]);
      } else {
        setAssets(galleryAssets);
      }

      setHasMore(hasNextPage);
      setEndCursor(newCursor);
    } catch (error) {
      console.error('[GallerySelectScreen] Erro ao carregar:', error);
    } finally {
      setLoading(false);
    }
  }, [mediaType]);

  // ========================================
  // Efeito Inicial
  // ========================================
  useEffect(() => {
    const init = async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        loadAssets();
      } else {
        setLoading(false);
      }
    };
    init();
  }, [loadAssets]);

  // ========================================
  // Handler de Fechar
  // ========================================
  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // ========================================
  // Handler de Selecao
  // ========================================
  const handleSelect = useCallback((asset: GalleryAsset) => {
    setSelectedIds(prev => {
      const isSelected = prev.includes(asset.id);
      if (isSelected) {
        return prev.filter(id => id !== asset.id);
      } else if (prev.length < MAX_SELECTION) {
        return [...prev, asset.id];
      }
      return prev;
    });
  }, []);

  // ========================================
  // Handler de Enviar
  // ========================================
  const handleSend = useCallback(() => {
    const selectedAssets = assets.filter(a => selectedIds.includes(a.id));

    if (selectedAssets.length === 1) {
      // Enviar unico item diretamente
      const asset = selectedAssets[0];
      if (asset.mediaType === 'photo') {
        navigation.dispatch(
          CommonActions.navigate({
            name: 'LeadChatScreen',
            params: {
              leadId,
              leadName,
              leadPhone,
              pendingPhoto: {
                uri: asset.uri,
                width: asset.width,
                height: asset.height,
              },
            },
          })
        );
      } else {
        navigation.dispatch(
          CommonActions.navigate({
            name: 'LeadChatScreen',
            params: {
              leadId,
              leadName,
              leadPhone,
              pendingVideo: {
                uri: asset.uri,
                duration: (asset.duration || 0) * 1000,
              },
            },
          })
        );
      }
    } else {
      // Multiplos itens - navegar para preview
      navigation.navigate('MultiPreviewScreen', {
        assets: selectedAssets,
        leadId,
        leadName,
        leadPhone,
      });
    }
  }, [navigation, assets, selectedIds, leadId, leadName, leadPhone]);

  // ========================================
  // Handler de Carregar Mais
  // ========================================
  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore && endCursor) {
      loadAssets(endCursor);
    }
  }, [loading, hasMore, endCursor, loadAssets]);

  // ========================================
  // Render Item
  // ========================================
  const renderItem = useCallback(({ item }: { item: GalleryAsset }) => {
    const selectionIndex = selectedIds.indexOf(item.id);
    return (
      <GalleryItem
        asset={item}
        selected={selectionIndex !== -1}
        selectionIndex={selectionIndex}
        onPress={() => handleSelect(item)}
        onLongPress={() => handleSelect(item)}
      />
    );
  }, [selectedIds, handleSelect]);

  // ========================================
  // KeyExtractor
  // ========================================
  const keyExtractor = useCallback((item: GalleryAsset) => item.id, []);

  // ========================================
  // Render Loading
  // ========================================
  if (loading && assets.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color={CameraColors.primary} />
      </View>
    );
  }

  // ========================================
  // Render Principal
  // ========================================
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.header}>
        <Pressable style={styles.closeButton} onPress={handleClose} hitSlop={12}>
          <CloseIcon />
        </Pressable>
        <Text style={styles.headerTitle}>
          {selectedIds.length > 0 ? `${selectedIds.length} selecionado${selectedIds.length > 1 ? 's' : ''}` : 'Selecionar'}
        </Text>
        <View style={styles.headerSpacer} />
      </SafeAreaView>

      {/* Grid de Midias */}
      <FlatList
        data={assets}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={styles.gridContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={hasMore ? <ActivityIndicator style={styles.loader} color={CameraColors.primary} /> : null}
      />

      {/* Footer com Botao Enviar */}
      {selectedIds.length > 0 && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <Pressable style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendButtonText}>
              Enviar {selectedIds.length} {selectedIds.length === 1 ? 'item' : 'itens'}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1, //......................... Ocupa toda a tela
    backgroundColor: CameraColors.headerBackground, // Fundo branco
  },

  // Header
  header: {
    flexDirection: 'row', //......... Layout horizontal
    alignItems: 'center', //......... Centraliza vertical
    paddingHorizontal: 16, //........ Padding horizontal
    paddingVertical: 12, //.......... Padding vertical
    borderBottomWidth: 1, //......... Borda inferior
    borderBottomColor: '#E8ECF4', //.. Cor da borda
  },

  // Botao fechar
  closeButton: {
    width: 44, //................. Largura
    height: 44, //................ Altura
    justifyContent: 'center', //.. Centraliza horizontal
    alignItems: 'center', //...... Centraliza vertical
  },

  // Titulo do header
  headerTitle: {
    flex: 1, //..................... Ocupa espaco
    fontSize: 18, //................ Tamanho fonte
    fontWeight: '600', //........... Peso fonte
    color: CameraColors.textPrimary, // Cor preta
    textAlign: 'center', //......... Centraliza texto
  },

  // Espacador do header
  headerSpacer: {
    width: 44, //.. Largura igual ao botao
  },

  // Conteudo do grid
  gridContent: {
    paddingTop: ITEM_GAP, //.. Padding superior
  },

  // Item do grid
  item: {
    width: ITEM_SIZE, //.......... Largura calculada
    height: ITEM_SIZE, //......... Altura igual a largura
    marginLeft: ITEM_GAP, //...... Margem esquerda
    marginBottom: ITEM_GAP, //.... Margem inferior
  },

  // Item selecionado
  itemSelected: {
    opacity: 1, //.. Mantem opacidade
  },

  // Imagem do item
  itemImage: {
    width: '100%', //.. Largura total
    height: '100%', //. Altura total
  },

  // Badge de video
  videoBadge: {
    position: 'absolute', //........ Posicao absoluta
    bottom: 4, //................... Distancia do fundo
    left: 4, //..................... Distancia da esquerda
    flexDirection: 'row', //........ Layout horizontal
    alignItems: 'center', //........ Centraliza vertical
    gap: 2, //...................... Espaco entre icone e texto
  },

  // Duracao do video
  videoDuration: {
    fontSize: 11, //................ Tamanho fonte
    color: CameraColors.textWhite, // Cor branca
    fontWeight: '500', //........... Peso fonte
    textShadowColor: 'rgba(0,0,0,0.5)', // Sombra
    textShadowOffset: { width: 0, height: 1 }, // Offset sombra
    textShadowRadius: 2, //......... Raio sombra
  },

  // Container do checkbox
  checkboxContainer: {
    position: 'absolute', //.. Posicao absoluta
    top: 6, //............... Distancia do topo
    right: 6, //............. Distancia da direita
  },

  // Checkbox vazio
  checkboxEmpty: {
    width: 22, //..................... Largura
    height: 22, //.................... Altura
    borderRadius: 11, //.............. Circular
    borderWidth: 2, //................ Largura borda
    borderColor: CameraColors.textWhite, // Cor branca
    backgroundColor: 'rgba(0,0,0,0.2)', // Fundo semi-transparente
  },

  // Checkbox selecionado
  checkboxSelected: {
    width: 22, //........................ Largura
    height: 22, //....................... Altura
    borderRadius: 11, //................. Circular
    backgroundColor: CameraColors.primary, // Fundo azul
    justifyContent: 'center', //......... Centraliza horizontal
    alignItems: 'center', //............. Centraliza vertical
  },

  // Numero do checkbox
  checkboxNumber: {
    fontSize: 12, //................ Tamanho fonte
    fontWeight: '600', //........... Peso fonte
    color: CameraColors.textWhite, // Cor branca
  },

  // Overlay de selecao
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject, //. Preenche o container
    backgroundColor: 'rgba(23,119,207,0.2)', // Azul semi-transparente
  },

  // Loader de paginacao
  loader: {
    marginVertical: 20, //.. Margem vertical
  },

  // Footer
  footer: {
    paddingHorizontal: 16, //............. Padding horizontal
    paddingTop: 12, //.................... Padding superior
    backgroundColor: CameraColors.headerBackground, // Fundo branco
    borderTopWidth: 1, //................. Borda superior
    borderTopColor: '#E8ECF4', //......... Cor da borda
  },

  // Botao enviar
  sendButton: {
    backgroundColor: CameraColors.primary, // Fundo azul
    borderRadius: 8, //.................... Borda arredondada
    paddingVertical: 14, //................ Padding vertical
    alignItems: 'center', //............... Centraliza horizontal
  },

  // Texto do botao enviar
  sendButtonText: {
    fontSize: 16, //................ Tamanho fonte
    fontWeight: '600', //........... Peso fonte
    color: CameraColors.textWhite, // Cor branca
  },
});

// ========================================
// Export
// ========================================
export default GallerySelectScreen;
