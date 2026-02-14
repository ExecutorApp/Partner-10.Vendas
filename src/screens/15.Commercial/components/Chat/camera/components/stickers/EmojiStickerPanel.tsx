// ========================================
// Componente EmojiStickerPanel
// Modal FULLSCREEN com abas de Emojis e Figurinhas Locais
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, { memo, useState, useCallback, useRef, useEffect, startTransition, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, StyleSheet, Platform, Dimensions, Modal, Image, Animated, PanResponder } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

// ========================================
// Imports de Dados de Emojis
// ========================================
import data from '@emoji-mart/data';
import EMOJI_KEYWORDS_PT from '../../../components/Modals/08.15.EmojiKeywordsPT';

// ========================================
// Imports de Figurinhas Locais
// ========================================
import { LOCAL_STICKER_PACKS, LocalSticker, LocalStickerPack, findStickerById } from './localStickerPacks';

// ========================================
// Constantes de Layout
// ========================================
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = 56; //......Altura do header
const FOOTER_HEIGHT = 80; //......Altura do footer unificado
const EMOJIS_PER_ROW = 8; //.....Emojis por linha
const STICKERS_PER_ROW = 4; //...Stickers por linha
const HORIZONTAL_PADDING = 16; //...Padding horizontal
const GRID_WIDTH = SCREEN_WIDTH - HORIZONTAL_PADDING * 2;
const EMOJI_SIZE = GRID_WIDTH / EMOJIS_PER_ROW; //...Tamanho do emoji
const STICKER_SIZE = GRID_WIDTH / STICKERS_PER_ROW; //...Tamanho do sticker
const FOOTER_CARD_SIZE = 56; //....Tamanho do card no footer
const FOOTER_ICON_SIZE = 32; //....Tamanho do icone no card
const DEBOUNCE_MS = 300; //......Debounce da busca
const RECENT_EMOJIS_KEY = 'editor_recent_emojis'; //...Chave localStorage emojis
const RECENT_STICKERS_KEY = 'editor_recent_stickers'; //...Chave localStorage stickers
const MAX_RECENT_EMOJIS = 32; //...Maximo de recentes emojis
const MAX_RECENT_STICKERS = 20; //...Maximo de recentes stickers
const SWIPE_THRESHOLD = 100; //...Threshold para fechar com swipe

// ========================================
// Funcao Helper: Resolver URL de Imagem
// Funciona em web e nativo (Image.resolveAssetSource nao existe em web)
// ========================================
const resolveImageSource = (source: any): string => {
  if (typeof source === 'string') {
    return source;
  }
  if (typeof source === 'object' && source !== null) {
    if (source.uri) return source.uri;
    if (source.default) return source.default;
  }
  return String(source);
};

// ========================================
// Cores do Sistema
// ========================================
const COLORS = {
  background: '#1a1a1a', //......Fundo unificado
  surface: '#1a1a1a', //.........Superficie escura
  surfaceLight: '#2a2a2a', //....Superficie clara
  border: 'rgba(255,255,255,0.15)', //...Borda
  borderActive: '#1777CF', //....Borda ativa
  textPrimary: '#FFFFFF', //.....Texto primario
  textSecondary: '#888888', //...Texto secundario
  primary: '#1777CF', //.........Azul principal
  placeholder: '#666666', //.....Placeholder
  cardBg: '#252525', //..........Fundo do card
};

// ========================================
// Mapeamento de Categorias de Emojis
// ========================================
const CATEGORY_ICONS: Record<string, string> = {
  frequent: '🕐',
  people: '😀',
  nature: '🐶',
  foods: '🍔',
  activity: '⚽',
  places: '✈️',
  objects: '💡',
  symbols: '💯',
  flags: '🏳️',
};

const CATEGORY_NAMES: Record<string, string> = {
  frequent: 'Recentes',
  people: 'Carinhas e Pessoas',
  nature: 'Animais e Natureza',
  foods: 'Comida e Bebida',
  activity: 'Atividades',
  places: 'Viagens e Lugares',
  objects: 'Objetos',
  symbols: 'Simbolos',
  flags: 'Bandeiras',
};

// ========================================
// Tipos
// ========================================
interface EmojiStickerPanelProps {
  visible: boolean;
  onSelectEmoji: (emoji: string) => void;
  onSelectSticker: (stickerUrl: string) => void;
  onClose: () => void;
}

interface ProcessedEmoji {
  id: string;
  native: string;
  skins: { unified: string; native: string }[];
  hasSkinTones: boolean;
}

interface ProcessedCategory {
  id: string;
  name: string;
  emojis: ProcessedEmoji[];
}

type TabType = 'emojis' | 'stickers';

// ========================================
// Pre-processamento de Emojis
// ========================================
const processEmojiData = () => {
  const emojiData = data as any;
  const cats = emojiData.categories || [];
  const emojis = emojiData.emojis || {};

  const processed: ProcessedCategory[] = [];
  const all: ProcessedEmoji[] = [];
  const index = new Map<string, Set<string>>();
  const map = new Map<string, ProcessedEmoji>();

  cats.forEach((cat: any) => {
    if (!cat.emojis || cat.emojis.length === 0) return;

    const categoryEmojis: ProcessedEmoji[] = [];

    cat.emojis.forEach((emojiId: string) => {
      const emoji = emojis[emojiId];
      if (emoji && emoji.skins && emoji.skins[0]) {
        const skins = emoji.skins.map((skin: any) => ({
          unified: skin.unified,
          native: skin.native,
        }));

        const processedEmoji: ProcessedEmoji = {
          id: emojiId,
          native: emoji.skins[0].native,
          skins: skins,
          hasSkinTones: skins.length > 1,
        };

        categoryEmojis.push(processedEmoji);
        all.push(processedEmoji);
        map.set(emojiId, processedEmoji);

        const keywords = EMOJI_KEYWORDS_PT[emojiId];
        if (keywords) {
          keywords.forEach((kw: string) => {
            const kwLower = kw.toLowerCase();
            if (!index.has(kwLower)) {
              index.set(kwLower, new Set());
            }
            index.get(kwLower)!.add(emojiId);
          });
        }

        const idLower = emojiId.toLowerCase();
        if (!index.has(idLower)) {
          index.set(idLower, new Set());
        }
        index.get(idLower)!.add(emojiId);
      }
    });

    if (categoryEmojis.length > 0) {
      processed.push({
        id: cat.id,
        name: CATEGORY_NAMES[cat.id] || cat.id,
        emojis: categoryEmojis,
      });
    }
  });

  return { categories: processed, allEmojis: all, searchIndex: index, emojiMap: map };
};

const PRELOADED_DATA = processEmojiData();

// ========================================
// Funcoes de Emojis Recentes
// ========================================
const getRecentEmojis = (): string[] => {
  try {
    const stored = localStorage.getItem(RECENT_EMOJIS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveRecentEmoji = (emojiId: string): void => {
  try {
    const recents = getRecentEmojis();
    const filtered = recents.filter((id) => id !== emojiId);
    filtered.unshift(emojiId);
    const limited = filtered.slice(0, MAX_RECENT_EMOJIS);
    localStorage.setItem(RECENT_EMOJIS_KEY, JSON.stringify(limited));
  } catch {}
};

const getRecentEmojisAsProcessed = (): ProcessedEmoji[] => {
  const recentIds = getRecentEmojis();
  const processed: ProcessedEmoji[] = [];
  recentIds.forEach((id) => {
    const emoji = PRELOADED_DATA.emojiMap.get(id);
    if (emoji) processed.push(emoji);
  });
  return processed;
};

// ========================================
// Funcoes de Stickers Recentes
// ========================================
const getRecentStickerIds = (): string[] => {
  try {
    const stored = localStorage.getItem(RECENT_STICKERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveRecentSticker = (stickerId: string): void => {
  try {
    const recents = getRecentStickerIds();
    const filtered = recents.filter((id) => id !== stickerId);
    filtered.unshift(stickerId);
    const limited = filtered.slice(0, MAX_RECENT_STICKERS);
    localStorage.setItem(RECENT_STICKERS_KEY, JSON.stringify(limited));
  } catch {}
};

const getRecentStickersAsLocal = (): LocalSticker[] => {
  const recentIds = getRecentStickerIds();
  const stickers: LocalSticker[] = [];
  recentIds.forEach((id) => {
    const sticker = findStickerById(id);
    if (sticker) stickers.push(sticker);
  });
  return stickers;
};

// ========================================
// Icone de Busca
// ========================================
const SearchIcon = memo(() => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Circle cx={11} cy={11} r={7} stroke={COLORS.textSecondary} strokeWidth={1.5} />
    <Path d="M20 20l-4-4" stroke={COLORS.textSecondary} strokeWidth={1.5} strokeLinecap="round" />
  </Svg>
));

// ========================================
// Icone Limpar
// ========================================
const ClearIcon = memo(() => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6l12 12" stroke={COLORS.textSecondary} strokeWidth={1.5} strokeLinecap="round" />
  </Svg>
));

// ========================================
// Componente de Botao de Emoji
// ========================================
const EmojiButton = memo(({ emoji, onPress }: { emoji: ProcessedEmoji; onPress: (emoji: ProcessedEmoji) => void }) => (
  <Pressable style={styles.emojiButton} onPress={() => onPress(emoji)}>
    <Text style={styles.emojiText}>{emoji.native}</Text>
  </Pressable>
));

// ========================================
// Componente de Botao de Sticker Local
// ========================================
const LocalStickerButton = memo(({ sticker, onPress }: { sticker: LocalSticker; onPress: (sticker: LocalSticker) => void }) => {
  const stickerSize = STICKER_SIZE - 8;

  return (
    <Pressable style={styles.stickerButton} onPress={() => onPress(sticker)}>
      <Image source={sticker.source} style={{ width: stickerSize, height: stickerSize }} resizeMode="contain" />
    </Pressable>
  );
});

// ========================================
// Componente de Toggle Segmentado (Header)
// ========================================
const SegmentedToggle = memo(({ activeTab, onTabChange }: { activeTab: TabType; onTabChange: (tab: TabType) => void }) => (
  <View style={styles.segmentedContainer}>
    <Pressable
      style={[styles.segmentedButton, activeTab === 'emojis' && styles.segmentedButtonActive]}
      onPress={() => onTabChange('emojis')}
    >
      <Text style={styles.segmentedIcon}>😀</Text>
      <Text style={[styles.segmentedLabel, activeTab === 'emojis' && styles.segmentedLabelActive]}>Emojis</Text>
    </Pressable>
    <Pressable
      style={[styles.segmentedButton, activeTab === 'stickers' && styles.segmentedButtonActive]}
      onPress={() => onTabChange('stickers')}
    >
      <Text style={styles.segmentedIcon}>🎭</Text>
      <Text style={[styles.segmentedLabel, activeTab === 'stickers' && styles.segmentedLabelActive]}>Figurinhas</Text>
    </Pressable>
  </View>
));

// ========================================
// Componente de Card Unificado do Footer
// ========================================
const FooterCard = memo(({ icon, isImage, isActive, onPress }: { icon: any; isImage?: boolean; isActive: boolean; onPress: () => void }) => (
  <Pressable style={styles.footerCard} onPress={onPress}>
    <View style={[styles.footerCardInner, isActive && styles.footerCardInnerActive]}>
      {isImage ? (
        <Image source={icon} style={styles.footerCardIcon} resizeMode="contain" />
      ) : (
        <Text style={styles.footerCardEmoji}>{icon}</Text>
      )}
    </View>
  </Pressable>
));

// ========================================
// Popup de Skin Tones
// ========================================
const SkinTonePopup = memo(({ emoji, position, onSelect, onClose }: { emoji: ProcessedEmoji; position: { x: number; y: number }; onSelect: (native: string) => void; onClose: () => void }) => {
  const popupWidth = emoji.skins.length * 44 + 16;
  const adjustedX = Math.max(8, Math.min(position.x - popupWidth / 2, SCREEN_WIDTH - popupWidth - 8));
  const adjustedY = position.y - 64;

  return (
    <>
      <Pressable style={styles.skinToneOverlay} onPress={onClose} />
      <View style={[styles.skinTonePopup, { left: adjustedX, top: adjustedY }]}>
        <View style={styles.skinToneContainer}>
          {emoji.skins.map((skin) => (
            <Pressable
              key={skin.unified}
              style={styles.skinToneButton}
              onPress={() => { onSelect(skin.native); onClose(); }}
            >
              <Text style={styles.skinToneEmoji}>{skin.native}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </>
  );
});

// ========================================
// Componente Principal
// ========================================
const EmojiStickerPanel: React.FC<EmojiStickerPanelProps> = memo(({
  visible,
  onSelectEmoji,
  onSelectSticker,
  onClose,
}) => {
  // ========================================
  // Estados Gerais
  // ========================================
  const [activeTab, setActiveTab] = useState<TabType>('emojis');
  const [searchText, setSearchText] = useState('');
  const [recentEmojis, setRecentEmojis] = useState<ProcessedEmoji[]>([]);

  // ========================================
  // Estados de Emojis
  // ========================================
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [searchResultsEmoji, setSearchResultsEmoji] = useState<ProcessedEmoji[]>([]);
  const [skinTonePopup, setSkinTonePopup] = useState<{ visible: boolean; emoji: ProcessedEmoji | null; position: { x: number; y: number } }>({ visible: false, emoji: null, position: { x: 0, y: 0 } });

  // ========================================
  // Estados de Stickers Locais
  // ========================================
  const [activePackIndex, setActivePackIndex] = useState(0); //...Indice do pack ativo (-1 = recentes)
  const [recentStickers, setRecentStickers] = useState<LocalSticker[]>([]);

  // ========================================
  // Refs
  // ========================================
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);

  // ========================================
  // Animacao para Swipe Down
  // ========================================
  const translateY = useRef(new Animated.Value(0)).current;

  // ========================================
  // PanResponder para Swipe Down
  // ========================================
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false, //...Nao captura no inicio
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 15 && Math.abs(gestureState.dx) < 30; //...So captura swipe para baixo
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy); //...Move junto com o dedo
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > SWIPE_THRESHOLD) {
          // Swipe suficiente para fechar
          Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT, //...Anima para fora da tela
            duration: 200, //.........Duracao da animacao
            useNativeDriver: true, //...Usar driver nativo
          }).start(() => {
            translateY.setValue(0); //...Reseta posicao
            onClose(); //...............Fecha o modal
          });
        } else {
          // Swipe insuficiente, volta para posicao original
          Animated.spring(translateY, {
            toValue: 0, //...............Volta para origem
            useNativeDriver: true, //...Usar driver nativo
            tension: 100, //.............Tensao da mola
            friction: 10, //.............Friccao da mola
          }).start();
        }
      },
    })
  ).current;

  // ========================================
  // Resetar animacao quando modal abre
  // ========================================
  useEffect(() => {
    if (visible) {
      translateY.setValue(0);
    }
  }, [visible, translateY]);

  // ========================================
  // Dados Pre-processados
  // ========================================
  const categories = PRELOADED_DATA.categories;
  const searchIndex = PRELOADED_DATA.searchIndex;
  const emojiMap = PRELOADED_DATA.emojiMap;

  // ========================================
  // Carregar Dados Iniciais
  // ========================================
  useEffect(() => {
    if (visible) {
      setRecentEmojis(getRecentEmojisAsProcessed());
      setRecentStickers(getRecentStickersAsLocal());
    }
  }, [visible]);

  // ========================================
  // Packs Filtrados (busca por nome do pack)
  // ========================================
  const filteredPacks = useMemo(() => {
    if (!searchText.trim()) return LOCAL_STICKER_PACKS;
    const term = searchText.toLowerCase().trim();
    return LOCAL_STICKER_PACKS.filter((pack) => pack.name.toLowerCase().includes(term));
  }, [searchText]);

  // ========================================
  // Stickers Atuais para Exibir
  // ========================================
  const currentStickers = useMemo((): LocalSticker[] => {
    if (searchText.trim()) {
      return filteredPacks.flatMap((pack) => pack.stickers);
    }
    if (activePackIndex === -1) {
      return recentStickers;
    }
    return LOCAL_STICKER_PACKS[activePackIndex]?.stickers || [];
  }, [searchText, filteredPacks, activePackIndex, recentStickers]);

  // ========================================
  // Nome do Pack Atual
  // ========================================
  const currentPackName = useMemo((): string => {
    if (searchText.trim()) {
      return `Resultados para "${searchText}"`;
    }
    if (activePackIndex === -1) {
      return 'Recentes';
    }
    return LOCAL_STICKER_PACKS[activePackIndex]?.name || 'Figurinhas';
  }, [searchText, activePackIndex]);

  // ========================================
  // Debounce da Busca de Emojis
  // ========================================
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!searchText.trim()) {
      setSearchResultsEmoji([]);
      return;
    }

    if (activeTab === 'emojis') {
      debounceRef.current = setTimeout(() => {
        startTransition(() => {
          const results = performEmojiSearch(searchText);
          setSearchResultsEmoji(results);
        });
      }, DEBOUNCE_MS);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchText, activeTab]);

  // ========================================
  // Funcao de Busca de Emojis
  // ========================================
  const performEmojiSearch = useCallback((term: string): ProcessedEmoji[] => {
    if (!term.trim()) return [];

    const termLower = term.toLowerCase().trim();
    const matchedIds = new Set<string>();

    searchIndex.forEach((emojiIds, keyword) => {
      if (keyword.includes(termLower)) {
        emojiIds.forEach((id) => matchedIds.add(id));
      }
    });

    const results: ProcessedEmoji[] = [];
    matchedIds.forEach((id) => {
      const emoji = emojiMap.get(id);
      if (emoji) results.push(emoji);
    });

    return results;
  }, [searchIndex, emojiMap]);

  // ========================================
  // Handler: Limpar Busca
  // ========================================
  const handleClearSearch = useCallback(() => {
    setSearchText('');
    setSearchResultsEmoji([]);
  }, []);

  // ========================================
  // Handler: Selecionar Emoji
  // ========================================
  const handleEmojiPress = useCallback((emoji: ProcessedEmoji) => {
    console.log('🎨 [EmojiStickerPanel] handleEmojiPress CHAMADO');
    console.log('🎨 [EmojiStickerPanel] Emoji:', emoji.native);
    if (emoji.hasSkinTones) {
      setSkinTonePopup({
        visible: true,
        emoji: emoji,
        position: { x: SCREEN_WIDTH / 2, y: 200 },
      });
    } else {
      saveRecentEmoji(emoji.id);
      setRecentEmojis(getRecentEmojisAsProcessed());
      console.log('🎨 [EmojiStickerPanel] Chamando onSelectEmoji...');
      onSelectEmoji(emoji.native);
      console.log('🎨 [EmojiStickerPanel] Chamando onClose...');
      onClose(); //...Fecha o modal apos selecionar
    }
  }, [onSelectEmoji, onClose]);

  // ========================================
  // Handler: Selecionar Skin Tone
  // ========================================
  const handleSkinToneSelect = useCallback((native: string) => {
    if (skinTonePopup.emoji) {
      saveRecentEmoji(skinTonePopup.emoji.id);
      setRecentEmojis(getRecentEmojisAsProcessed());
    }
    onSelectEmoji(native);
    setSkinTonePopup({ visible: false, emoji: null, position: { x: 0, y: 0 } });
    onClose(); //...Fecha o modal apos selecionar
  }, [onSelectEmoji, skinTonePopup.emoji, onClose]);

  // ========================================
  // Handler: Fechar Skin Tone Popup
  // ========================================
  const handleCloseSkinTone = useCallback(() => {
    setSkinTonePopup({ visible: false, emoji: null, position: { x: 0, y: 0 } });
  }, []);

  // ========================================
  // Handler: Selecionar Sticker Local
  // ========================================
  const handleStickerPress = useCallback((sticker: LocalSticker) => {
    console.log('🎨 [EmojiStickerPanel] handleStickerPress CHAMADO');
    console.log('🎨 [EmojiStickerPanel] Sticker ID:', sticker.id);
    saveRecentSticker(sticker.id);
    setRecentStickers(getRecentStickersAsLocal());

    // Resolver URL da imagem para passar ao canvas (funciona em web e nativo)
    const stickerUrl = resolveImageSource(sticker.source);
    console.log('🎨 [EmojiStickerPanel] Sticker URL:', stickerUrl);
    console.log('🎨 [EmojiStickerPanel] Chamando onSelectSticker...');
    onSelectSticker(stickerUrl);
    console.log('🎨 [EmojiStickerPanel] Chamando onClose...');
    onClose(); //...Fecha o modal apos selecionar
  }, [onSelectSticker, onClose]);

  // ========================================
  // Handler: Mudar Categoria de Emoji
  // ========================================
  const handleCategoryPress = useCallback((index: number) => {
    setActiveCategoryIndex(index);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, []);

  // ========================================
  // Handler: Mudar Pack de Sticker
  // ========================================
  const handlePackPress = useCallback((index: number) => {
    setActivePackIndex(index);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, []);

  // ========================================
  // Handler: Mudar Tab
  // ========================================
  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
    setSearchText('');
    setSearchResultsEmoji([]);
  }, []);

  // ========================================
  // Render: Apenas Web
  // ========================================
  if (Platform.OS !== 'web') return null;

  // ========================================
  // Dados Atuais
  // ========================================
  const categoriesWithRecents: ProcessedCategory[] = recentEmojis.length > 0
    ? [{ id: 'frequent', name: 'Recentes', emojis: recentEmojis }, ...categories]
    : categories;
  const currentCategory = categoriesWithRecents[activeCategoryIndex];
  const isSearchingEmoji = activeTab === 'emojis' && searchText.trim().length > 0;
  const isSearchingSticker = activeTab === 'stickers' && searchText.trim().length > 0;
  const hasRecentStickers = recentStickers.length > 0;

  // ========================================
  // Render Principal
  // ========================================
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View
        style={[styles.container, { transform: [{ translateY }] }]}
        {...panResponder.panHandlers}
      >
        {/* ======================================== */}
        {/* Indicador de Arraste (Handle) */}
        {/* ======================================== */}
        <View style={styles.handleContainer}>
          <View style={styles.handleBar} />
        </View>

        {/* ======================================== */}
        {/* HEADER com Toggle Segmentado */}
        {/* ======================================== */}
        <View style={styles.header}>
          <SegmentedToggle activeTab={activeTab} onTabChange={handleTabChange} />
        </View>

        {/* ======================================== */}
        {/* BARRA DE BUSCA */}
        {/* ======================================== */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <View style={styles.searchIconWrapper}>
              <SearchIcon />
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder={activeTab === 'emojis' ? 'Buscar emoji...' : 'Buscar figurinha...'}
              placeholderTextColor={COLORS.placeholder}
              value={searchText}
              onChangeText={setSearchText}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchText.length > 0 && (
              <Pressable style={styles.clearButton} onPress={handleClearSearch}>
                <ClearIcon />
              </Pressable>
            )}
          </View>
        </View>

        {/* ======================================== */}
        {/* CONTEUDO: ABA EMOJIS */}
        {/* ======================================== */}
        {activeTab === 'emojis' && (
          <View style={styles.contentContainer}>
            {!isSearchingEmoji && (
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>{currentCategory?.name || 'Emojis'}</Text>
              </View>
            )}

            <ScrollView
              ref={scrollRef}
              style={styles.gridScroll}
              contentContainerStyle={styles.gridContent}
              showsVerticalScrollIndicator={false}
            >
              {isSearchingEmoji ? (
                searchResultsEmoji.length > 0 ? (
                  <View style={styles.emojiGrid}>
                    {searchResultsEmoji.map((emoji) => (
                      <EmojiButton key={emoji.id} emoji={emoji} onPress={handleEmojiPress} />
                    ))}
                  </View>
                ) : (
                  <View style={styles.noResults}>
                    <Text style={styles.noResultsText}>Nenhum emoji encontrado</Text>
                  </View>
                )
              ) : (
                <View style={styles.emojiGrid}>
                  {currentCategory?.emojis.map((emoji) => (
                    <EmojiButton key={emoji.id} emoji={emoji} onPress={handleEmojiPress} />
                  ))}
                </View>
              )}
            </ScrollView>

            {/* Footer Unificado de Categorias */}
            {!isSearchingEmoji && (
              <View style={styles.footerBar}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.footerBarContent}>
                  {categoriesWithRecents.map((cat, index) => (
                    <FooterCard
                      key={cat.id}
                      icon={CATEGORY_ICONS[cat.id] || '❓'}
                      isActive={activeCategoryIndex === index}
                      onPress={() => handleCategoryPress(index)}
                    />
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}

        {/* ======================================== */}
        {/* CONTEUDO: ABA FIGURINHAS LOCAIS */}
        {/* ======================================== */}
        {activeTab === 'stickers' && (
          <View style={styles.contentContainer}>
            {/* Titulo */}
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>{currentPackName}</Text>
            </View>

            {/* Grid de Stickers */}
            <ScrollView
              ref={scrollRef}
              style={styles.gridScroll}
              contentContainerStyle={styles.gridContent}
              showsVerticalScrollIndicator={false}
            >
              {currentStickers.length > 0 ? (
                <View style={styles.stickerGrid}>
                  {currentStickers.map((sticker) => (
                    <LocalStickerButton key={sticker.id} sticker={sticker} onPress={handleStickerPress} />
                  ))}
                </View>
              ) : (
                <View style={styles.noResults}>
                  <Text style={styles.noResultsText}>
                    {isSearchingSticker ? 'Nenhuma figurinha encontrada' : 'Nenhuma figurinha recente'}
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Footer Unificado de Packs */}
            {!isSearchingSticker && (
              <View style={styles.footerBar}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.footerBarContent}
                >
                  {/* Botao Recentes */}
                  {hasRecentStickers && (
                    <FooterCard
                      icon="🕐"
                      isActive={activePackIndex === -1}
                      onPress={() => handlePackPress(-1)}
                    />
                  )}
                  {/* Cards dos Packs */}
                  {LOCAL_STICKER_PACKS.map((pack, index) => (
                    <FooterCard
                      key={pack.id}
                      icon={pack.icon}
                      isImage
                      isActive={activePackIndex === index}
                      onPress={() => handlePackPress(index)}
                    />
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}

        {/* Popup de Skin Tones */}
        {skinTonePopup.visible && skinTonePopup.emoji && (
          <SkinTonePopup
            emoji={skinTonePopup.emoji}
            position={skinTonePopup.position}
            onSelect={handleSkinToneSelect}
            onClose={handleCloseSkinTone}
          />
        )}
      </Animated.View>
    </Modal>
  );
});

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container FULLSCREEN
  container: {
    flex: 1, //.................Ocupa toda a tela
    backgroundColor: COLORS.background, //...Cor unificada
  },

  // Indicador de Arraste (Handle)
  handleContainer: {
    alignItems: 'center', //........Centraliza horizontalmente
    paddingTop: 12, //..............Espaco superior
    paddingBottom: 4, //............Espaco inferior
    backgroundColor: COLORS.surface, //...Cor de fundo
  },

  handleBar: {
    width: 36, //...................Largura do handle
    height: 4, //....................Altura do handle
    backgroundColor: 'rgba(255,255,255,0.4)', //...Cor branca translucida
    borderRadius: 2, //..............Borda arredondada
  },

  // Header com Toggle Segmentado
  header: {
    paddingTop: 10, //..................Margem superior
    paddingBottom: 10, //...............Margem inferior
    flexDirection: 'row', //............Layout horizontal
    alignItems: 'center', //.............Centraliza verticalmente
    justifyContent: 'center', //........Centraliza conteudo
    paddingHorizontal: 16, //...........Padding horizontal
    backgroundColor: COLORS.surface, //...Cor de fundo
    borderBottomWidth: 1, //............Borda inferior
    borderBottomColor: COLORS.border, //...Cor da borda
  },

  // Toggle Segmentado
  segmentedContainer: {
    flexDirection: 'row', //..............Layout horizontal
    backgroundColor: COLORS.surfaceLight, //...Fundo do container
    borderRadius: 12, //...................Borda arredondada
    padding: 4, //..........................Padding interno
    borderWidth: 1, //......................Borda externa
    borderColor: COLORS.border, //..........Cor da borda
  },

  segmentedButton: {
    flexDirection: 'row', //......Layout horizontal
    alignItems: 'center', //......Centraliza vertical
    paddingHorizontal: 16, //.....Padding horizontal
    paddingVertical: 8, //........Padding vertical
    borderRadius: 8, //...........Borda arredondada
    backgroundColor: 'transparent', //...Transparente por padrao
  },

  segmentedButtonActive: {
    backgroundColor: COLORS.primary, //...Fundo azul quando ativo
  },

  segmentedIcon: {
    fontSize: 16, //....Tamanho do icone
    marginRight: 6, //...Espaco a direita
  },

  segmentedLabel: {
    fontSize: 14, //............Tamanho da fonte
    color: COLORS.textSecondary, //...Cor secundaria
    fontWeight: '600', //........Peso semi-bold
  },

  segmentedLabelActive: {
    color: COLORS.textPrimary, //...Cor branca quando ativo
  },

  // Busca
  searchContainer: {
    paddingHorizontal: 16, //...........Padding horizontal
    paddingVertical: 12, //.............Padding vertical
    backgroundColor: COLORS.surface, //...Cor de fundo
  },

  searchInputWrapper: {
    flexDirection: 'row', //.................Layout horizontal
    alignItems: 'center', //.................Centraliza vertical
    backgroundColor: COLORS.surfaceLight, //...Cor de fundo clara
    borderRadius: 12, //.....................Borda arredondada
    paddingHorizontal: 14, //................Padding horizontal
    height: 40, //...........................Altura fixa
  },

  searchIconWrapper: {
    marginRight: 10, //...Espaco a direita
  },

  searchInput: {
    flex: 1, //..................Ocupa espaco restante
    fontSize: 15, //.............Tamanho da fonte
    color: COLORS.textPrimary, //...Cor do texto
    paddingVertical: 0, //........Sem padding vertical
  },

  clearButton: {
    padding: 4, //......Padding interno
    marginLeft: 4, //...Margem esquerda
  },

  // Conteudo
  contentContainer: {
    flex: 1, //...Ocupa espaco restante
  },

  sectionTitleContainer: {
    paddingHorizontal: 16, //...Padding horizontal
    paddingTop: 12, //..........Padding superior
    paddingBottom: 8, //.........Padding inferior
  },

  sectionTitle: {
    fontSize: 14, //..................Tamanho da fonte
    fontWeight: '600', //.............Peso semi-bold
    color: COLORS.textSecondary, //...Cor secundaria
    textTransform: 'uppercase', //....Maiusculas
    letterSpacing: 0.5, //............Espacamento de letras
  },

  // Grid Scroll
  gridScroll: {
    flex: 1, //...Ocupa espaco restante
  },

  gridContent: {
    paddingHorizontal: HORIZONTAL_PADDING, //...Padding horizontal
    paddingBottom: 16, //........................Padding inferior
  },

  // Grid de Emojis
  emojiGrid: {
    flexDirection: 'row', //...Layout horizontal
    flexWrap: 'wrap', //.......Quebra linha
  },

  emojiButton: {
    width: EMOJI_SIZE, //...........Largura do botao
    height: EMOJI_SIZE, //..........Altura do botao
    justifyContent: 'center', //...Centraliza horizontal
    alignItems: 'center', //.......Centraliza vertical
  },

  emojiText: {
    fontSize: 28, //...Tamanho do emoji
  },

  // Grid de Stickers
  stickerGrid: {
    flexDirection: 'row', //...Layout horizontal
    flexWrap: 'wrap', //.......Quebra linha
  },

  stickerButton: {
    width: STICKER_SIZE, //...........Largura do botao
    height: STICKER_SIZE, //..........Altura do botao
    justifyContent: 'center', //.....Centraliza horizontal
    alignItems: 'center', //.........Centraliza vertical
    padding: 4, //....................Padding interno
  },

  // Sem Resultados
  noResults: {
    flex: 1, //...................Ocupa espaco restante
    justifyContent: 'center', //...Centraliza vertical
    alignItems: 'center', //.......Centraliza horizontal
    paddingVertical: 60, //.........Padding vertical
  },

  noResultsText: {
    fontSize: 15, //..................Tamanho da fonte
    color: COLORS.textSecondary, //...Cor secundaria
  },

  // Footer Unificado (Emojis e Figurinhas)
  footerBar: {
    height: FOOTER_HEIGHT, //...............Altura unificada
    borderTopWidth: 1, //...................Borda superior
    borderTopColor: COLORS.border, //.......Cor da borda
    backgroundColor: COLORS.surface, //.....Cor de fundo
    justifyContent: 'center', //.............Centraliza conteudo
  },

  footerBarContent: {
    paddingHorizontal: 12, //...Padding horizontal
    alignItems: 'center', //....Centraliza vertical
    gap: 10, //.................Espaco entre cards
  },

  // Card Unificado do Footer
  footerCard: {
    width: FOOTER_CARD_SIZE, //...Largura do card
    height: FOOTER_CARD_SIZE, //...Altura do card
    borderRadius: 14, //...........Borda arredondada
    padding: 3, //..................Padding interno
  },

  footerCardInner: {
    flex: 1, //...........................Ocupa todo o espaco
    borderRadius: 12, //...................Borda arredondada interna
    backgroundColor: COLORS.cardBg, //.....Cor de fundo
    borderWidth: 2, //.....................Largura da borda
    borderColor: COLORS.border, //.........Cor da borda
    justifyContent: 'center', //...........Centraliza horizontal
    alignItems: 'center', //.................Centraliza vertical
  },

  footerCardInnerActive: {
    borderColor: COLORS.borderActive, //...Borda azul
    backgroundColor: 'rgba(23,119,207,0.15)', //...Fundo azul transparente
  },

  footerCardIcon: {
    width: FOOTER_ICON_SIZE, //...Largura do icone
    height: FOOTER_ICON_SIZE, //...Altura do icone
  },

  footerCardEmoji: {
    fontSize: 28, //...Tamanho do emoji
  },

  // Skin Tone Popup
  skinToneOverlay: {
    position: 'absolute', //...Posicao absoluta
    top: 0, //..................Topo
    left: 0, //.................Esquerda
    right: 0, //................Direita
    bottom: 0, //...............Base
    backgroundColor: 'transparent', //...Transparente
    zIndex: 200, //.............Camada superior
  },

  skinTonePopup: {
    position: 'absolute', //...........Posicao absoluta
    backgroundColor: '#374151', //.....Cor de fundo
    borderRadius: 12, //...............Borda arredondada
    paddingHorizontal: 8, //...........Padding horizontal
    paddingVertical: 8, //.............Padding vertical
    zIndex: 201, //...................Camada mais superior
    shadowColor: '#000', //............Cor da sombra
    shadowOffset: { width: 0, height: 4 }, //...Offset da sombra
    shadowOpacity: 0.3, //.............Opacidade da sombra
    shadowRadius: 8, //................Raio da sombra
    elevation: 10, //...................Elevacao Android
  },

  skinToneContainer: {
    flexDirection: 'row', //...Layout horizontal
    alignItems: 'center', //...Centraliza vertical
  },

  skinToneButton: {
    width: 40, //..................Largura do botao
    height: 40, //.................Altura do botao
    justifyContent: 'center', //...Centraliza horizontal
    alignItems: 'center', //.......Centraliza vertical
    borderRadius: 8, //.............Borda arredondada
  },

  skinToneEmoji: {
    fontSize: 26, //...Tamanho do emoji
  },
});

// ========================================
// Export
// ========================================
export default EmojiStickerPanel;
