// ========================================
// Tela de Preview Multiplo
// Preview de multiplas fotos/videos selecionados
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, { useState, useCallback, useRef } from 'react';
import { View, Text, Image, Pressable, FlatList, StyleSheet, StatusBar, Dimensions, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Video, ResizeMode } from 'expo-av';
import Svg, { Path } from 'react-native-svg';

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
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const THUMBNAIL_SIZE = 64; //.. Tamanho do thumbnail
const THUMBNAIL_GAP = 8; //.... Espaco entre thumbnails

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
  MultiPreviewScreen: {
    assets: GalleryAsset[];
    leadId: string;
    leadName: string;
    leadPhone: string;
  };
  LeadChatScreen: any;
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'MultiPreviewScreen'>;
type MultiPreviewRouteProp = RouteProp<RootStackParamList, 'MultiPreviewScreen'>;

// ========================================
// Icones
// ========================================
const CloseIcon: React.FC = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Path d={CameraIcons.close} fill={CameraColors.textWhite} />
  </Svg>
);

const SendIcon: React.FC = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill={CameraColors.textWhite} />
  </Svg>
);

const TrashIcon: React.FC = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill={CameraColors.textWhite} />
  </Svg>
);

// ========================================
// Componente de Thumbnail
// ========================================
const PreviewThumbnail: React.FC<{
  asset: GalleryAsset;
  isActive: boolean;
  onPress: () => void;
}> = ({ asset, isActive, onPress }) => (
  <Pressable
    style={[styles.thumbnail, isActive && styles.thumbnailActive]}
    onPress={onPress}
  >
    <Image source={{ uri: asset.uri }} style={styles.thumbnailImage} resizeMode="cover" />
    {asset.mediaType === 'video' && (
      <View style={styles.videoIndicator}>
        <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
          <Path d="M8 5v14l11-7z" fill={CameraColors.textWhite} />
        </Svg>
      </View>
    )}
  </Pressable>
);

// ========================================
// Componente Principal MultiPreviewScreen
// ========================================
const MultiPreviewScreen: React.FC = () => {
  // ========================================
  // Navegacao e Rota
  // ========================================
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<MultiPreviewRouteProp>();
  const insets = useSafeAreaInsets();

  // ========================================
  // Parametros da Rota
  // ========================================
  const { assets: initialAssets, leadId, leadName, leadPhone } = route.params;

  // ========================================
  // Estados
  // ========================================
  const [assets, setAssets] = useState<GalleryAsset[]>(initialAssets);
  const [activeIndex, setActiveIndex] = useState(0);
  const [caption, setCaption] = useState('');
  const [isSending, setIsSending] = useState(false);

  // ========================================
  // Refs
  // ========================================
  const mainListRef = useRef<FlatList>(null);

  // ========================================
  // Asset Atual
  // ========================================
  const currentAsset = assets[activeIndex];

  // ========================================
  // Handler de Fechar
  // ========================================
  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // ========================================
  // Handler de Remover
  // ========================================
  const handleRemove = useCallback(() => {
    if (assets.length <= 1) {
      navigation.goBack();
      return;
    }

    const newAssets = assets.filter((_, i) => i !== activeIndex);
    const newIndex = activeIndex >= newAssets.length ? newAssets.length - 1 : activeIndex;
    setAssets(newAssets);
    setActiveIndex(newIndex);
  }, [assets, activeIndex, navigation]);

  // ========================================
  // Handler de Selecionar Thumbnail
  // ========================================
  const handleSelectThumbnail = useCallback((index: number) => {
    setActiveIndex(index);
    mainListRef.current?.scrollToIndex({ index, animated: true });
  }, []);

  // ========================================
  // Handler de Mudanca de Pagina
  // ========================================
  const handleViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }, []);

  // ========================================
  // Handler de Enviar
  // ========================================
  const handleSend = useCallback(async () => {
    if (isSending) return;
    setIsSending(true);

    try {
      // Navegar para o chat com multiplos itens pendentes
      navigation.dispatch(
        CommonActions.navigate({
          name: 'LeadChatScreen',
          params: {
            leadId,
            leadName,
            leadPhone,
            pendingMultiMedia: assets.map(asset => ({
              uri: asset.uri,
              width: asset.width,
              height: asset.height,
              mediaType: asset.mediaType,
              duration: asset.duration,
              caption: caption.trim() || undefined,
            })),
          },
        })
      );
    } catch (error) {
      console.error('[MultiPreviewScreen] Erro ao enviar:', error);
      setIsSending(false);
    }
  }, [isSending, navigation, assets, caption, leadId, leadName, leadPhone]);

  // ========================================
  // Render Item Principal
  // ========================================
  const renderMainItem = useCallback(({ item }: { item: GalleryAsset }) => (
    <View style={styles.mainItem}>
      {item.mediaType === 'photo' ? (
        <Image source={{ uri: item.uri }} style={styles.mainImage} resizeMode="contain" />
      ) : (
        <Video
          source={{ uri: item.uri }}
          style={styles.mainVideo}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={false}
          isLooping={false}
          useNativeControls
        />
      )}
    </View>
  ), []);

  // ========================================
  // Render Thumbnail
  // ========================================
  const renderThumbnail = useCallback(({ item, index }: { item: GalleryAsset; index: number }) => (
    <PreviewThumbnail
      asset={item}
      isActive={index === activeIndex}
      onPress={() => handleSelectThumbnail(index)}
    />
  ), [activeIndex, handleSelectThumbnail]);

  // ========================================
  // Viewability Config
  // ========================================
  const viewabilityConfig = { itemVisiblePercentThreshold: 50 };

  // ========================================
  // Render Principal
  // ========================================
  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <SafeAreaView style={styles.header}>
        <Pressable style={styles.headerButton} onPress={handleClose} hitSlop={12}>
          <CloseIcon />
        </Pressable>
        <Text style={styles.headerTitle}>{activeIndex + 1} / {assets.length}</Text>
        <Pressable style={styles.headerButton} onPress={handleRemove} hitSlop={12}>
          <TrashIcon />
        </Pressable>
      </SafeAreaView>

      {/* Preview Principal */}
      <FlatList
        ref={mainListRef}
        data={assets}
        renderItem={renderMainItem}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        style={styles.mainList}
      />

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
        {/* Thumbnails */}
        {assets.length > 1 && (
          <FlatList
            data={assets}
            renderItem={renderThumbnail}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailList}
          />
        )}

        {/* Input e Botao Enviar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Adicione uma legenda..."
            placeholderTextColor={CameraColors.textSecondary}
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={500}
          />
          <Pressable style={styles.sendButton} onPress={handleSend} disabled={isSending}>
            <SendIcon />
          </Pressable>
        </View>

        {/* Nome do Destinatario */}
        <Text style={styles.recipientText}>Para: {leadName}</Text>
      </View>
    </KeyboardAvoidingView>
  );
};

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1, //......................... Ocupa toda a tela
    backgroundColor: CameraColors.cameraBackground, // Fundo escuro
  },

  // Header
  header: {
    flexDirection: 'row', //......... Layout horizontal
    justifyContent: 'space-between', // Espacamento
    alignItems: 'center', //......... Centraliza vertical
    paddingHorizontal: 16, //........ Padding horizontal
    paddingTop: 8, //................ Padding superior
  },

  // Botao do header
  headerButton: {
    width: 44, //.................... Largura
    height: 44, //................... Altura
    borderRadius: CameraStyles.borderRadiusButton, // Borda
    backgroundColor: CameraColors.overlayLight, //.. Fundo
    justifyContent: 'center', //..... Centraliza horizontal
    alignItems: 'center', //......... Centraliza vertical
  },

  // Titulo do header
  headerTitle: {
    fontSize: 16, //................ Tamanho fonte
    fontWeight: '600', //........... Peso fonte
    color: CameraColors.textWhite, // Cor branca
  },

  // Lista principal
  mainList: {
    flex: 1, //.. Ocupa espaco disponivel
  },

  // Item principal
  mainItem: {
    width: SCREEN_WIDTH, //.. Largura da tela
    flex: 1, //.............. Ocupa altura disponivel
    justifyContent: 'center', // Centraliza vertical
    alignItems: 'center', //.. Centraliza horizontal
  },

  // Imagem principal
  mainImage: {
    width: '100%', //.. Largura total
    height: '100%', //. Altura total
  },

  // Video principal
  mainVideo: {
    width: '100%', //.. Largura total
    height: '100%', //. Altura total
  },

  // Footer
  footer: {
    backgroundColor: CameraColors.overlayDark, // Fundo escuro
    paddingTop: 12, //......................... Padding superior
  },

  // Lista de thumbnails
  thumbnailList: {
    paddingHorizontal: 16, //.. Padding horizontal
    marginBottom: 12, //....... Margem inferior
    gap: THUMBNAIL_GAP, //..... Espaco entre itens
  },

  // Thumbnail
  thumbnail: {
    width: THUMBNAIL_SIZE, //.......... Largura
    height: THUMBNAIL_SIZE, //......... Altura
    borderRadius: 8, //................ Borda arredondada
    overflow: 'hidden', //............. Esconde overflow
    borderWidth: 2, //................. Largura borda
    borderColor: 'transparent', //..... Borda transparente
  },

  // Thumbnail ativo
  thumbnailActive: {
    borderColor: CameraColors.primary, // Borda azul
  },

  // Imagem do thumbnail
  thumbnailImage: {
    width: '100%', //.. Largura total
    height: '100%', //. Altura total
  },

  // Indicador de video no thumbnail
  videoIndicator: {
    position: 'absolute', //................ Posicao absoluta
    bottom: 2, //........................... Distancia do fundo
    left: 2, //............................. Distancia da esquerda
    backgroundColor: 'rgba(0,0,0,0.5)', //.. Fundo semi-transparente
    borderRadius: 4, //..................... Borda arredondada
    padding: 2, //.......................... Padding
  },

  // Container do input
  inputContainer: {
    flexDirection: 'row', //.......... Layout horizontal
    alignItems: 'flex-end', //........ Alinha na base
    paddingHorizontal: 16, //......... Padding horizontal
    gap: 12, //....................... Espaco entre elementos
  },

  // Input de legenda
  input: {
    flex: 1, //.......................... Ocupa espaco
    backgroundColor: CameraColors.overlayLight, // Fundo
    borderRadius: 20, //................. Borda arredondada
    paddingHorizontal: 16, //............ Padding horizontal
    paddingVertical: 10, //.............. Padding vertical
    color: CameraColors.textWhite, //.... Cor do texto
    fontSize: 15, //..................... Tamanho fonte
    maxHeight: 100, //................... Altura maxima
  },

  // Botao enviar
  sendButton: {
    width: 48, //........................ Largura
    height: 48, //....................... Altura
    borderRadius: 24, //................. Circular
    backgroundColor: CameraColors.primary, // Fundo azul
    justifyContent: 'center', //......... Centraliza horizontal
    alignItems: 'center', //............. Centraliza vertical
  },

  // Texto do destinatario
  recipientText: {
    fontSize: 12, //.................. Tamanho fonte
    color: CameraColors.textSecondary, // Cor cinza
    textAlign: 'center', //........... Centraliza texto
    marginTop: 8, //.................. Margem superior
    marginBottom: 4, //............... Margem inferior
  },
});

// ========================================
// Export
// ========================================
export default MultiPreviewScreen;
