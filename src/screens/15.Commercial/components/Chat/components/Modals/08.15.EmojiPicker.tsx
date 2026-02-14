// Componente EmojiPicker
// Painel com navegacao por categorias, busca, emojis nativos e seletor de tons de pele
// Performance: debounce na busca, indice invertido, pre-renderizacao total

// React e React Native
import React, { useState, useEffect, useRef, useCallback, memo, startTransition } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet, Platform, Dimensions } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

// Bibliotecas externas
import data from '@emoji-mart/data';

// Keywords em Portugues
import EMOJI_KEYWORDS_PT from './08.15.EmojiKeywordsPT';

// Constantes
const SCREEN_WIDTH = Dimensions.get('window').width; //......Largura da tela
const HORIZONTAL_PADDING = 10; //..............................Padding horizontal
const EMOJIS_PER_ROW = 8; //..................................Emojis por linha
const GRID_WIDTH = SCREEN_WIDTH - HORIZONTAL_PADDING * 2; //..Largura do grid
const EMOJI_BUTTON_SIZE = GRID_WIDTH / EMOJIS_PER_ROW; //.....Tamanho do botao calculado
const DEBOUNCE_MS = 150; //...................................Debounce da busca (ms)

// Alturas fixas dos containers (para manter altura total constante)
const SEARCH_HEIGHT = 63; //..................................Busca + divisoria (62 + 1)
const HEADER_HEIGHT = 57; //..................................Header + divisoria (56 + 1)
const SCROLL_HEIGHT = 280; //.................................Altura do scroll de emojis

// Cores do sistema
const COLORS = {
  primary: '#1777CF', //......Azul principal
  white: '#FFFFFF', //........Branco
  border: '#D8E0F0', //........Borda cinza
  textPrimary: '#1A1A1A', //...Texto primario
  textSecondary: '#6B7280', //..Texto secundario
  background: '#F5F7FA', //....Fundo
  placeholder: '#9CA3AF', //...Placeholder
  skinToneBg: '#374151', //....Fundo do popup skin tones
  skinToneSelected: '#1777CF', //...Borda do selecionado
};

// Mapeamento de nomes de categorias para portugues
const CATEGORY_NAMES: Record<string, string> = {
  frequent: 'Mais Usados', //......Mais usados
  people: 'Pessoas', //............Pessoas
  nature: 'Natureza', //...........Natureza
  foods: 'Comidas', //.............Comidas
  activity: 'Atividades', //.......Atividades
  places: 'Viagens', //............Viagens
  objects: 'Objetos', //...........Objetos
  symbols: 'Simbolos', //..........Simbolos
  flags: 'Bandeiras', //...........Bandeiras
};

// Mapeamento de icones para cada categoria
const CATEGORY_ICONS: Record<string, string> = {
  frequent: '⭐', //.......Estrela para mais usados
  people: '😀', //........Rosto feliz para pessoas
  nature: '🐶', //........Cachorro para natureza
  foods: '🍔', //.........Hamburguer para comidas
  activity: '⚽', //.......Bola para atividades
  places: '✈️', //........Aviao para viagens
  objects: '💡', //........Lampada para objetos
  symbols: '💯', //........100 para simbolos
  flags: '🏳️', //.........Bandeira
};

// ========================================
// Pre-processamento de dados (nivel de modulo)
// Executa no import, nao na primeira abertura
// ========================================
interface EmojiSkinData { unified: string; native: string; }
interface ProcessedEmojiData { id: string; native: string; skins: EmojiSkinData[]; hasSkinTones: boolean; }
interface ProcessedCategoryData { id: string; name: string; emojis: ProcessedEmojiData[]; }

const processEmojiData = () => {
  const emojiData = data as any;
  const cats = emojiData.categories || [];
  const emojis = emojiData.emojis || {};

  const processed: ProcessedCategoryData[] = [];
  const all: ProcessedEmojiData[] = [];
  const index = new Map<string, Set<string>>();
  const map = new Map<string, ProcessedEmojiData>();

  cats.forEach((cat: any) => {
    if (!cat.emojis || cat.emojis.length === 0) return;
    if (cat.id === 'flags') return;

    const categoryEmojis: ProcessedEmojiData[] = [];

    cat.emojis.forEach((emojiId: string) => {
      const emoji = emojis[emojiId];
      if (emoji && emoji.skins && emoji.skins[0]) {
        const skins: EmojiSkinData[] = emoji.skins.map((skin: any) => ({
          unified: skin.unified,
          native: skin.native,
        }));

        const processedEmoji: ProcessedEmojiData = {
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
          keywords.forEach((kw) => {
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

// Processar dados no momento do import (pre-cacheado)
const PRELOADED_DATA = processEmojiData();
const PRELOADED_EMOJI_BY_ID = new Map<string, ProcessedEmojiData>();
PRELOADED_DATA.allEmojis.forEach((emoji) => PRELOADED_EMOJI_BY_ID.set(emoji.id, emoji));

// Icone de Busca (memoizado)
const SearchIcon = memo(({ color = COLORS.textSecondary }: { color?: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Circle cx={11} cy={11} r={7} stroke={color} strokeWidth={1.5} />
    <Path d="M20 20l-4-4" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
  </Svg>
));

// Icone de Limpar (memoizado)
const ClearIcon = memo(({ color = COLORS.textSecondary }: { color?: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
));

// Icone de Seta Esquerda (memoizado)
const ChevronLeftIcon = memo(({ color = COLORS.primary }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18l-6-6 6-6" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
));

// Icone de Seta Direita (memoizado)
const ChevronRightIcon = memo(({ color = COLORS.primary }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
));

// Interface de Props
interface EmojiPickerProps {
  visible: boolean; //..............Visibilidade do painel
  onClose: () => void; //...........Handler fechar
  onSelect: (emoji: string) => void; //...Handler selecionar emoji
  selectedEmoji?: string | null; //...Emoji atualmente selecionado (para modo troca de reacao)
}

// Interface para skin do emoji
interface EmojiSkin {
  unified: string; //...Codigo unificado
  native: string; //....Caractere nativo
}

// Interface para emoji processado (com suporte a skin tones)
interface ProcessedEmoji {
  id: string; //......ID do emoji
  native: string; //..Caractere nativo (skin padrao)
  skins: EmojiSkin[]; //...Array de todas as skins (1 = sem variacao, 6 = com skin tones)
  hasSkinTones: boolean; //...Flag indicando se tem variacao de tons
}

// Interface para categoria processada
interface ProcessedCategory {
  id: string; //......ID da categoria
  name: string; //....Nome em portugues
  emojis: ProcessedEmoji[]; //...Emojis da categoria
}

// Interface para estado do popup de skin tones
interface SkinTonePopupState {
  visible: boolean; //......Visibilidade
  emoji: ProcessedEmoji | null; //...Emoji selecionado
  position: { x: number; y: number }; //...Posicao do popup
}

// Componente de botao de emoji memoizado
// Evita re-render desnecessario de cada emoji
interface EmojiButtonProps {
  native: string; //......Caractere nativo
  onPress: () => void; //.Handler de clique
}

const EmojiButton = memo(({ native, onPress }: EmojiButtonProps) => (
  <TouchableOpacity style={styles.emojiButton} onPress={onPress} activeOpacity={0.6}>
    <Text style={styles.emojiText}>{native}</Text>
  </TouchableOpacity>
));

// Componente de grid de categoria COMPLETAMENTE memoizado
// NAO recebe props que mudam - apenas emojis estaticos
interface StaticCategoryGridProps {
  emojis: ProcessedEmoji[]; //...Lista de emojis (estatica)
  categoryId: string; //..........ID da categoria para key
}

// Grid estatico - renderizado UMA VEZ e nunca mais
// Usa dataSet para React Native Web (converte para data-* no DOM)
const StaticCategoryGrid = memo(({ emojis, categoryId }: StaticCategoryGridProps) => (
  <View style={styles.categoryContainer}>
    <View style={styles.gridWrapper}>
      <View style={styles.emojiGrid}>
        {emojis.map((emoji) => (
          <View
            key={emoji.id}
            style={styles.emojiButton}
            dataSet={{ emoji: emoji.native, emojiId: emoji.id, hasSkins: emoji.hasSkinTones ? 'true' : 'false' }}
          >
            <Text style={styles.emojiText}>{emoji.native}</Text>
          </View>
        ))}
      </View>
    </View>
  </View>
), (prevProps, nextProps) => prevProps.categoryId === nextProps.categoryId);

// Componente de grid de resultados da busca memoizado
// Clique em emoji com skin tones abre popup, senao insere direto
interface SearchResultsGridProps {
  emojis: ProcessedEmoji[]; //...Lista de emojis encontrados
  onSelect: (emoji: string) => void; //...Handler de selecao
  onShowSkinTones: (emoji: ProcessedEmoji, event: any) => void; //...Handler skin tones
}

const SearchResultsGrid = memo(({ emojis, onSelect, onShowSkinTones }: SearchResultsGridProps) => (
  <View style={styles.categoryContainer}>
    <View style={styles.gridWrapper}>
      <View style={styles.emojiGrid}>
        {emojis.map((emoji) => (
          <TouchableOpacity
            key={emoji.id}
            style={styles.emojiButton}
            onPress={(e) => {
              // Se tem skin tones, abre popup. Senao, insere direto.
              if (emoji.hasSkinTones) {
                onShowSkinTones(emoji, e);
              } else {
                onSelect(emoji.native);
              }
            }}
            activeOpacity={0.6}
          >
            <Text style={styles.emojiText}>{emoji.native}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  </View>
));

// Componente SkinTonePicker - Popup flutuante com opcoes de tons de pele
interface SkinTonePickerProps {
  emoji: ProcessedEmoji; //...Emoji com variantes
  position: { x: number; y: number }; //...Posicao do popup
  onSelect: (native: string) => void; //...Handler de selecao
  onClose: () => void; //...Handler fechar
}

const SkinTonePicker = memo(({ emoji, position, onSelect, onClose }: SkinTonePickerProps) => {
  // Calcula largura do popup (6 emojis * tamanho)
  const skinButtonSize = 42; //...Tamanho do botao de skin
  const popupWidth = emoji.skins.length * skinButtonSize + 16; //...Largura total + padding
  const popupHeight = 56; //...Altura do popup

  // Ajusta posicao para centralizar sobre o emoji clicado
  const adjustedX = Math.max(8, Math.min(position.x - popupWidth / 2, SCREEN_WIDTH - popupWidth - 8));
  const adjustedY = position.y - popupHeight - 8; //...Acima do emoji

  return (
    <>
      {/* Overlay invisivel para fechar ao clicar fora */}
      <TouchableOpacity
        style={styles.skinToneOverlay}
        onPress={onClose}
        activeOpacity={1}
      />

      {/* Popup com opcoes de skin tones */}
      <View style={[styles.skinTonePopup, { left: adjustedX, top: adjustedY }]}>
        {/* Seta indicadora (triangulo apontando para baixo) */}
        <View style={[styles.skinToneArrow, { left: position.x - adjustedX - 6 }]} />

        {/* Container dos emojis */}
        <View style={styles.skinToneContainer}>
          {emoji.skins.map((skin, index) => (
            <TouchableOpacity
              key={skin.unified}
              style={[styles.skinToneButton, index === 0 && styles.skinToneButtonFirst]}
              onPress={() => {
                onSelect(skin.native);
                onClose();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.skinToneEmoji}>{skin.native}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </>
  );
});

// Componente Principal EmojiPicker
// Painel com navegacao por categorias - performance otimizada
const EmojiPicker: React.FC<EmojiPickerProps> = ({
  visible, //......Visibilidade
  onClose, //......Handler fechar
  onSelect, //......Handler selecionar
  selectedEmoji, //...Emoji selecionado (modo troca)
}) => {
  // ========================================
  // Estados
  // ========================================
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0); //...Indice atual
  const [mounted, setMounted] = useState(false); //........................Montado
  const [inputValue, setInputValue] = useState(''); //.....................Valor do input (sem debounce)
  const [debouncedTerm, setDebouncedTerm] = useState(''); //...............Termo com debounce
  const [searchResults, setSearchResults] = useState<ProcessedEmoji[]>([]); //...Resultados da busca
  const [skinTonePopup, setSkinTonePopup] = useState<SkinTonePopupState>({ visible: false, emoji: null, position: { x: 0, y: 0 } });

  // ========================================
  // Refs
  // ========================================
  const scrollRefs = useRef<(ScrollView | null)[]>([]); //...Refs para cada ScrollView
  const searchScrollRef = useRef<ScrollView | null>(null); //...Ref para scroll de busca
  const inputRef = useRef<TextInput | null>(null); //.........Ref para input de busca
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null); //...Timer do debounce
  const containerRef = useRef<View | null>(null); //...Ref do container principal
  const gridContainerRef = useRef<View | null>(null); //...Ref do container do grid
  const onSelectRef = useRef(onSelect); //...Ref estavel para onSelect

  // Manter onSelectRef atualizado
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  // ========================================
  // Usar dados pre-processados (cacheados no import)
  // ========================================
  const categories = PRELOADED_DATA.categories as ProcessedCategory[];
  const allEmojis = PRELOADED_DATA.allEmojis as ProcessedEmoji[];
  const searchIndex = PRELOADED_DATA.searchIndex;
  const emojiMap = PRELOADED_DATA.emojiMap as Map<string, ProcessedEmoji>;
  const emojiById = PRELOADED_EMOJI_BY_ID as Map<string, ProcessedEmoji>;

  // ========================================
  // Funcao de busca otimizada com indice invertido
  // ========================================
  const performSearch = useCallback((term: string): ProcessedEmoji[] => {
    if (!term.trim()) return [];

    const termLower = term.toLowerCase().trim();
    const matchedIds = new Set<string>();

    // Busca no indice invertido (muito mais rapido)
    searchIndex.forEach((emojiIds, keyword) => {
      if (keyword.includes(termLower)) {
        emojiIds.forEach((id) => matchedIds.add(id));
      }
    });

    // Converter IDs para emojis
    const results: ProcessedEmoji[] = [];
    matchedIds.forEach((id) => {
      const emoji = emojiById.get(id);
      if (emoji) results.push(emoji);
    });

    return results;
  }, [searchIndex, emojiById]);

  // Verifica se esta em modo de busca
  const isSearching = debouncedTerm.trim().length > 0;

  // Categoria atual e total
  const currentCategory = categories[currentCategoryIndex] || null;
  const totalCategories = categories.length;

  // ========================================
  // Debounce do termo de busca
  // ========================================
  useEffect(() => {
    // Limpar timer anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Se input vazio, atualiza imediatamente
    if (!inputValue.trim()) {
      setDebouncedTerm('');
      setSearchResults([]);
      return;
    }

    // Debounce: aguarda DEBOUNCE_MS antes de buscar
    debounceTimerRef.current = setTimeout(() => {
      // Usa startTransition para nao bloquear input
      startTransition(() => {
        setDebouncedTerm(inputValue);
        const results = performSearch(inputValue);
        setSearchResults(results);
      });
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inputValue, performSearch]);

  // ========================================
  // Monta o picker na primeira abertura
  // ========================================
  useEffect(() => {
    if (visible && !mounted) {
      setMounted(true);
    }
  }, [visible, mounted]);

  // ========================================
  // Limpar busca e popup quando fechar
  // ========================================
  useEffect(() => {
    if (!visible) {
      setInputValue('');
      setDebouncedTerm('');
      setSearchResults([]);
      setSkinTonePopup({ visible: false, emoji: null, position: { x: 0, y: 0 } });
    }
  }, [visible]);

  // ========================================
  // Resetar scroll da categoria atual quando mudar
  // ========================================
  useEffect(() => {
    const currentScrollRef = scrollRefs.current[currentCategoryIndex];
    if (currentScrollRef) {
      currentScrollRef.scrollTo({ y: 0, animated: false });
    }
    // Fechar popup de skin tones ao mudar categoria
    setSkinTonePopup({ visible: false, emoji: null, position: { x: 0, y: 0 } });
  }, [currentCategoryIndex]);

  // ========================================
  // Refs estaveis para uso no event listener (inicializadas com null)
  // Serao atualizadas apos handleShowSkinTones ser definido
  // ========================================
  const handleShowSkinTonesRef = useRef<((emoji: ProcessedEmoji, x: number, y: number) => void) | null>(null);
  const emojiMapRef = useRef<Map<string, ProcessedEmoji>>(emojiMap);

  // ========================================
  // Handlers de navegacao (estavel com useCallback)
  // ========================================
  const handlePreviousCategory = useCallback(() => {
    setCurrentCategoryIndex((prev) => prev === 0 ? totalCategories - 1 : prev - 1);
  }, [totalCategories]);

  const handleNextCategory = useCallback(() => {
    setCurrentCategoryIndex((prev) => prev === totalCategories - 1 ? 0 : prev + 1);
  }, [totalCategories]);

  // ========================================
  // Handler de selecao de emoji (estavel)
  // ========================================
  const handleEmojiSelect = useCallback((emoji: string) => {
    onSelect(emoji);
    setSkinTonePopup({ visible: false, emoji: null, position: { x: 0, y: 0 } });
  }, [onSelect]);

  // ========================================
  // Handler para mostrar popup de skin tones
  // ========================================
  const handleShowSkinTones = useCallback((emoji: ProcessedEmoji, x: number, y: number) => {
    setSkinTonePopup({
      visible: true,
      emoji: emoji,
      position: { x, y },
    });
  }, []);

  // ========================================
  // Handler para fechar popup de skin tones
  // ========================================
  const handleCloseSkinTones = useCallback(() => {
    setSkinTonePopup({ visible: false, emoji: null, position: { x: 0, y: 0 } });
  }, []);

  // ========================================
  // Handler para abrir skin tones na busca (clique simples)
  // ========================================
  const handleSearchSkinTones = useCallback((emoji: ProcessedEmoji, event: any) => {
    if (!emoji.hasSkinTones) return;

    // Obter posicao do toque (fallback para centro da tela se nao disponivel)
    const pageX = event?.nativeEvent?.pageX ?? SCREEN_WIDTH / 2;
    const pageY = event?.nativeEvent?.pageY ?? 200;
    handleShowSkinTones(emoji, pageX, pageY);
  }, [handleShowSkinTones]);

  // ========================================
  // Handler para limpar busca
  // ========================================
  const handleClearSearch = useCallback(() => {
    setInputValue('');
    setDebouncedTerm('');
    setSearchResults([]);
    inputRef.current?.focus();
  }, []);

  // ========================================
  // Handler de mudanca do input (sem debounce)
  // ========================================
  const handleInputChange = useCallback((text: string) => {
    setInputValue(text);
  }, []);

  // ========================================
  // Atualizar refs estaveis (apos handlers serem definidos)
  // ========================================
  useEffect(() => {
    handleShowSkinTonesRef.current = handleShowSkinTones;
  }, [handleShowSkinTones]);

  useEffect(() => {
    emojiMapRef.current = emojiMap;
  }, [emojiMap]);

  // ========================================
  // Event listener nativo para cliques no grid (Web)
  // Se emoji tem skin tones: abre popup. Se nao: insere direto.
  // ========================================
  useEffect(() => {
    if (Platform.OS !== 'web' || !visible || !mounted) return;

    const handleNativeClick = (e: MouseEvent) => {
      // Busca o elemento com data-emoji mais proximo
      let target = e.target as HTMLElement;
      let iterations = 0;

      while (target && iterations < 10) {
        if (target.dataset?.emoji) {
          const emojiNative = target.dataset.emoji;
          const emojiId = target.dataset.emojiId; //...ID do emoji (camelCase!)
          const hasSkins = target.dataset.hasSkins === 'true'; //...Tem skin tones (camelCase!)

          // Parar propagacao para evitar que overlay capture o clique
          e.stopPropagation();
          e.preventDefault();

          // Se tem skin tones, abre popup em vez de inserir
          if (hasSkins && emojiId) {
            const emoji = emojiMapRef.current.get(emojiId);
            if (emoji && handleShowSkinTonesRef.current) {
              // Obter posicao do elemento clicado RELATIVA ao container PRINCIPAL
              const rect = target.getBoundingClientRect();
              const mainContainer = containerRef.current as unknown as HTMLElement;
              const mainRect = mainContainer?.getBoundingClientRect() || { left: 0, top: 0 };

              // Calcular posicao relativa ao container principal
              const x = rect.left - mainRect.left + rect.width / 2;
              const y = rect.top - mainRect.top;
              handleShowSkinTonesRef.current(emoji, x, y);
              return;
            }
          }

          // Se nao tem skin tones, insere direto
          onSelectRef.current(emojiNative);
          return;
        }
        target = target.parentElement as HTMLElement;
        iterations++;
      }
    };

    // Aguardar DOM estar pronto e adicionar listener
    const timeoutId = setTimeout(() => {
      const gridElement = gridContainerRef.current as unknown as HTMLElement;
      if (gridElement) {
        gridElement.addEventListener('click', handleNativeClick);
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      const gridElement = gridContainerRef.current as unknown as HTMLElement;
      if (gridElement) {
        gridElement.removeEventListener('click', handleNativeClick);
      }
    };
  }, [visible, mounted]);

  // ========================================
  // Render condicional
  // ========================================
  if (!mounted) return null;
  if (!visible) return null;

  // Render do componente (Web)
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container} ref={containerRef}>
        {/* Header com emoji selecionado (apenas no modo troca de reacao) */}
        {selectedEmoji !== undefined && (
          <View style={styles.selectedEmojiHeader}>
            {/* Titulo e botao fechar */}
            <View style={styles.selectedEmojiTitleRow}>
              <Text style={styles.selectedEmojiTitle}>Alterar reação</Text>
              <TouchableOpacity style={styles.selectedEmojiCloseBtn} onPress={onClose} activeOpacity={0.7}>
                <Text style={styles.selectedEmojiCloseIcon}>×</Text>
              </TouchableOpacity>
            </View>

            {/* Conteudo centralizado */}
            <View style={styles.selectedEmojiContent}>
              <Text style={styles.selectedEmojiLabel}>Reação atual:</Text>
              {selectedEmoji ? (
                <TouchableOpacity
                  style={styles.selectedEmojiBox}
                  onPress={() => onSelect(selectedEmoji)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.selectedEmojiText}>{selectedEmoji}</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.selectedEmojiBoxEmpty}>
                  <Text style={styles.selectedEmojiPlaceholder}>?</Text>
                </View>
              )}
              <Text style={styles.selectedEmojiHint}>
                {selectedEmoji ? 'Toque no mesmo emoji para remover' : 'Selecione uma reação'}
              </Text>
            </View>
          </View>
        )}

        {/* Barra de Busca */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <View style={styles.searchIconWrapper}>
              <SearchIcon color={COLORS.textSecondary} />
            </View>
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              placeholder="Buscar emoji..."
              placeholderTextColor={COLORS.placeholder}
              value={inputValue}
              onChangeText={handleInputChange}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {inputValue.length > 0 && (
              <TouchableOpacity style={styles.clearButton} onPress={handleClearSearch} activeOpacity={0.7}>
                <ClearIcon color={COLORS.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Divisoria abaixo da busca */}
        <View style={styles.searchDivider} />

        {/* Header com nome da categoria e navegacao (oculto durante busca) */}
        {!isSearching && (
          <>
            <View style={styles.header}>
              {/* Icone e Nome da categoria */}
              <View style={styles.categoryTitleContainer}>
                <Text style={styles.categoryIcon}>
                  {CATEGORY_ICONS[currentCategory?.id || 'frequent']}
                </Text>
                <Text style={styles.categoryName}>
                  {currentCategory?.name || 'Emojis'}
                </Text>
              </View>

              {/* Navegacao */}
              <View style={styles.navigation}>
                {/* Seta Esquerda */}
                <TouchableOpacity style={styles.navArrowButton} onPress={handlePreviousCategory} activeOpacity={0.7}>
                  <ChevronLeftIcon color={COLORS.primary} />
                </TouchableOpacity>

                {/* Contador */}
                <View style={styles.counterContainer}>
                  <Text style={styles.counterText}>
                    {String(currentCategoryIndex + 1).padStart(2, '0')}/{String(totalCategories).padStart(2, '0')}
                  </Text>
                </View>

                {/* Seta Direita */}
                <TouchableOpacity style={styles.navArrowButton} onPress={handleNextCategory} activeOpacity={0.7}>
                  <ChevronRightIcon color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Divisoria */}
            <View style={styles.divider} />
          </>
        )}

        {/* Container de resultados da busca (altura expandida sem header) */}
        {isSearching && (
          <View style={styles.scrollContainerExpanded}>
            <ScrollView
              ref={searchScrollRef}
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {searchResults.length > 0 ? (
                <SearchResultsGrid
                  emojis={searchResults}
                  onSelect={handleEmojiSelect}
                  onShowSkinTones={handleSearchSkinTones}
                />
              ) : (
                <View style={styles.noResultsContainer}>
                  <Text style={styles.noResultsText}>
                    Nenhum emoji encontrado
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        )}

        {/* Container de todas as categorias - ESTATICO com CSS show/hide */}
        {!isSearching && (
          <View
            ref={gridContainerRef}
            style={styles.scrollContainer}
            dataSet={{ testid: 'emoji-grid-container' }}
          >
            {categories.map((category, index) => (
              <ScrollView
                key={category.id}
                ref={(ref) => { scrollRefs.current[index] = ref; }}
                style={[styles.scrollView, { display: index === currentCategoryIndex ? 'flex' : 'none' }]}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                <StaticCategoryGrid emojis={category.emojis} categoryId={category.id} />
              </ScrollView>
            ))}
          </View>
        )}

        {/* Popup de Skin Tones */}
        {skinTonePopup.visible && skinTonePopup.emoji && (
          <SkinTonePicker
            emoji={skinTonePopup.emoji}
            position={skinTonePopup.position}
            onSelect={handleEmojiSelect}
            onClose={handleCloseSkinTones}
          />
        )}
      </View>
    );
  }

  // Fallback para plataformas nativas
  return null;
};

// Estilos
const styles = StyleSheet.create({
  // Container principal
  container: {
    width: SCREEN_WIDTH, //...........Largura total
    maxWidth: '100%', //..............Limite maximo
    backgroundColor: COLORS.white, //.Fundo branco
    borderTopWidth: 1, //..............Borda superior
    borderTopColor: COLORS.border, //.Cor da borda
    position: 'relative', //..........Posicao relativa para popup
    zIndex: 20, //....................Acima do overlay
  },

  // Header com emoji selecionado (modo troca de reacao)
  selectedEmojiHeader: {
    backgroundColor: COLORS.white, //..Fundo branco
    borderBottomWidth: 1, //..........Borda inferior
    borderBottomColor: COLORS.border, //...Cor da borda
  },

  // Linha do titulo (Alterar reacao + X)
  selectedEmojiTitleRow: {
    flexDirection: 'row', //...........Layout horizontal
    alignItems: 'center', //...........Centraliza vertical
    justifyContent: 'center', //......Centraliza titulo
    paddingHorizontal: 16, //.........Padding lateral
    paddingTop: 16, //................Padding superior
    paddingBottom: 12, //.............Padding inferior
    borderBottomWidth: 1, //..........Borda inferior
    borderBottomColor: COLORS.border, //...Cor da borda
    position: 'relative', //..........Para posicionar X
  },

  // Titulo "Alterar reacao"
  selectedEmojiTitle: {
    fontSize: 18, //..................Tamanho fonte
    fontFamily: 'Inter_600SemiBold', //...Fonte bold
    color: COLORS.textPrimary, //.....Cor escura
  },

  // Botao fechar (X)
  selectedEmojiCloseBtn: {
    position: 'absolute', //..........Posicao absoluta
    right: 16, //....................Alinha direita
    top: 0, //.......................Alinha ao topo
    bottom: 0, //....................Alinha ao fundo
    width: 36, //....................Largura maior
    justifyContent: 'center', //......Centraliza vertical
    alignItems: 'center', //..........Centraliza horizontal
  },

  // Icone X
  selectedEmojiCloseIcon: {
    fontSize: 28, //..................Tamanho maior
    color: '#9CA3AF', //..............Cor cinza
    fontWeight: '300', //.............Peso leve
    marginTop: -2, //.................Ajuste fino vertical
  },

  // Conteudo centralizado (label + box + hint)
  selectedEmojiContent: {
    alignItems: 'center', //..........Centraliza horizontal
    paddingVertical: 16, //...........Padding vertical
  },

  // Label "Reacao atual:"
  selectedEmojiLabel: {
    fontSize: 12, //..................Tamanho fonte
    fontFamily: 'Inter_400Regular', //.Fonte regular
    color: '#6B7280', //..............Cor cinza
    marginBottom: 12, //..............Margem inferior
  },

  // Box do emoji selecionado
  selectedEmojiBox: {
    width: 88, //.....................Largura fixa
    height: 72, //....................Altura fixa
    justifyContent: 'center', //......Centraliza vertical
    alignItems: 'center', //..........Centraliza horizontal
    backgroundColor: 'rgba(23, 119, 207, 0.15)', //...Fundo azul claro
    borderRadius: 12, //..............Cantos arredondados
    borderWidth: 1, //................Borda fina
    borderColor: COLORS.primary, //...Cor azul da borda
  },

  // Box vazio (sem emoji selecionado)
  selectedEmojiBoxEmpty: {
    width: 88, //.....................Largura igual
    height: 72, //....................Altura igual
    justifyContent: 'center', //......Centraliza vertical
    alignItems: 'center', //..........Centraliza horizontal
    backgroundColor: '#F9FAFB', //....Fundo cinza muito claro
    borderRadius: 12, //..............Cantos arredondados
    borderWidth: 1, //................Borda fina
    borderColor: '#D1D5DB', //.........Cor cinza da borda
    borderStyle: 'dashed', //.........Borda tracejada
  },

  // Texto do emoji selecionado
  selectedEmojiText: {
    fontSize: 48, //..................Tamanho grande
  },

  // Placeholder (ponto de interrogacao)
  selectedEmojiPlaceholder: {
    fontSize: 48, //..................Tamanho igual ao emoji
    color: '#D1D5DB', //..............Cor cinza
  },

  // Hint para remover
  selectedEmojiHint: {
    fontSize: 12, //..................Tamanho fonte
    fontFamily: 'Inter_400Regular', //.Fonte regular
    color: COLORS.primary, //.........Cor azul
    marginTop: 12, //.................Margem superior
  },

  // Container da barra de busca
  searchContainer: {
    paddingHorizontal: 15, //..........Padding lateral
    paddingTop: 12, //................Padding superior
    paddingBottom: 10, //..............Padding inferior
    backgroundColor: COLORS.white, //..Fundo branco
  },

  // Wrapper do input de busca
  searchInputWrapper: {
    flexDirection: 'row', //...........Layout horizontal
    alignItems: 'center', //...........Centraliza vertical
    backgroundColor: COLORS.background, //...Fundo cinza claro
    borderRadius: 10, //...............Arredondamento
    paddingHorizontal: 12, //..........Padding lateral
    height: 40, //....................Altura fixa
  },

  // Wrapper do icone de busca
  searchIconWrapper: {
    marginRight: 8, //................Espaco direito
  },

  // Input de busca
  searchInput: {
    flex: 1, //......................Ocupa espaco disponivel
    fontSize: 15, //.................Tamanho fonte
    fontFamily: 'Inter_400Regular', //.Fonte regular
    color: COLORS.textPrimary, //.....Cor texto
    paddingVertical: 0, //............Sem padding vertical
    outlineStyle: 'none', //..........Remove outline web
  } as any,

  // Botao de limpar busca
  clearButton: {
    padding: 4, //....................Padding toque
    marginLeft: 4, //.................Espaco esquerdo
  },

  // Divisoria abaixo da busca
  searchDivider: {
    height: 1, //.....................Altura
    backgroundColor: COLORS.border, //...Cor da linha
    marginHorizontal: 15, //..........Margem lateral
  },

  // Header com nome e navegacao
  header: {
    flexDirection: 'row', //..........Layout horizontal
    alignItems: 'center', //..........Centraliza vertical
    justifyContent: 'space-between', //...Espacamento
    paddingHorizontal: 15, //.........Padding lateral do header (15px)
    paddingVertical: 12, //...........Padding vertical
    backgroundColor: COLORS.white, //.Fundo branco
  },

  // Container do titulo com icone
  categoryTitleContainer: {
    flexDirection: 'row', //..........Layout horizontal
    alignItems: 'center', //..........Centraliza vertical
    gap: 8, //.........................Espaco entre icone e texto
  },

  // Icone da categoria
  categoryIcon: {
    fontSize: 20, //..................Tamanho do icone
  },

  // Nome da categoria
  categoryName: {
    fontSize: 16, //..................Tamanho fonte
    fontFamily: 'Inter_600SemiBold', //...Fonte bold
    color: COLORS.textPrimary, //......Cor texto
    marginTop: 5, //..................Ajuste vertical
  },

  // Container de navegacao
  navigation: {
    flexDirection: 'row', //..........Layout horizontal
    alignItems: 'center', //..........Centraliza vertical
    gap: 4, //.........................Espaco entre itens
  },

  // Botao de seta
  navArrowButton: {
    width: 32, //.....................Largura fixa
    height: 32, //...................Altura fixa
    justifyContent: 'center', //......Centraliza vertical
    alignItems: 'center', //..........Centraliza horizontal
    backgroundColor: COLORS.white, //.Fundo branco
    borderRadius: 8, //...............Arredondamento
    borderWidth: 1, //................Largura borda
    borderColor: COLORS.border, //....Cor da borda
  },

  // Container do contador
  counterContainer: {
    height: 32, //....................Altura fixa
    paddingHorizontal: 12, //.........Padding horizontal
    justifyContent: 'center', //......Centraliza vertical
    alignItems: 'center', //..........Centraliza horizontal
    backgroundColor: COLORS.white, //.Fundo branco
    borderRadius: 8, //...............Arredondamento
    borderWidth: 1, //................Largura borda
    borderColor: COLORS.border, //....Cor da borda
  },

  // Texto do contador
  counterText: {
    fontSize: 14, //..................Tamanho fonte
    fontFamily: 'Inter_500Medium', //.Fonte media
    color: COLORS.textSecondary, //...Cor secundaria
  },

  // Divisoria
  divider: {
    height: 1, //.....................Altura
    backgroundColor: COLORS.border, //...Cor da linha
    marginRight: 15, //..........Margem lateral (15px)
    marginLeft: 18, //..........Margem lateral (15px)
  },

  // Container do scroll (altura normal com header)
  scrollContainer: {
    height: SCROLL_HEIGHT, //..........Altura fixa
    position: 'relative', //.........Posicao relativa
  },

  // Container do scroll expandido (sem header - busca ativa)
  scrollContainerExpanded: {
    height: SCROLL_HEIGHT + HEADER_HEIGHT, //...Altura expandida
    position: 'relative', //..................Posicao relativa
  },

  // ScrollView
  scrollView: {
    position: 'absolute', //..........Posicao absoluta (empilhadas)
    top: 0, //........................Topo
    left: 0, //......................Esquerda
    right: 0, //.....................Direita
    bottom: 0, //....................Baixo
  },

  // Conteudo do scroll
  scrollContent: {
    flexGrow: 1, //..................Cresce para preencher
    paddingHorizontal: HORIZONTAL_PADDING, //...Padding
    paddingVertical: 12, //..........Padding vertical
  },

  // Container de categoria (para show/hide)
  categoryContainer: {
    width: '100%', //................Largura total
  },

  // Wrapper do grid
  gridWrapper: {
    width: '100%', //................Largura total
  },

  // Grid de emojis
  emojiGrid: {
    flexDirection: 'row', //..........Layout horizontal
    flexWrap: 'wrap', //..............Quebra linha
    justifyContent: 'flex-start', //..Alinha a esquerda
    width: '100%', //..................Largura total
  },

  // Botao do emoji
  emojiButton: {
    width: EMOJI_BUTTON_SIZE, //......Largura calculada
    height: EMOJI_BUTTON_SIZE, //.....Altura calculada
    justifyContent: 'center', //......Centraliza vertical
    alignItems: 'center', //..........Centraliza horizontal
    cursor: 'pointer', //.............Cursor pointer (web)
  } as any,

  // Texto do emoji
  emojiText: {
    fontSize: 28, //..................Tamanho do emoji
    pointerEvents: 'none', //.........Nao intercepta cliques
  } as any,

  // Container sem resultados
  noResultsContainer: {
    flex: 1, //......................Ocupa espaco
    justifyContent: 'center', //......Centraliza vertical
    alignItems: 'center', //..........Centraliza horizontal
    paddingVertical: 40, //...........Padding vertical
  },

  // Texto sem resultados
  noResultsText: {
    fontSize: 14, //..................Tamanho fonte
    fontFamily: 'Inter_400Regular', //.Fonte regular
    color: COLORS.textSecondary, //....Cor secundaria
  },

  // ========================================
  // Estilos do Skin Tone Picker
  // ========================================

  // Overlay transparente para fechar popup
  skinToneOverlay: {
    position: 'absolute', //..........Posicao absoluta
    top: 0, //........................Topo
    left: 0, //......................Esquerda
    right: 0, //.....................Direita
    bottom: 0, //....................Baixo
    backgroundColor: 'transparent', //...Transparente
    zIndex: 100, //...................Acima de tudo
  } as any,

  // Popup flutuante com skin tones
  skinTonePopup: {
    position: 'absolute', //..........Posicao absoluta
    backgroundColor: COLORS.skinToneBg, //...Fundo escuro
    borderRadius: 12, //..............Arredondamento
    paddingHorizontal: 8, //..........Padding lateral
    paddingVertical: 8, //............Padding vertical
    zIndex: 101, //..................Acima do overlay
    shadowColor: '#000', //...........Cor sombra
    shadowOffset: { width: 0, height: 4 }, //...Offset sombra
    shadowOpacity: 0.3, //............Opacidade sombra
    shadowRadius: 8, //...............Raio sombra
    elevation: 10, //................Elevacao Android
  } as any,

  // Seta do popup (triangulo)
  skinToneArrow: {
    position: 'absolute', //..........Posicao absoluta
    bottom: -8, //...................Abaixo do popup
    width: 0, //.....................Sem largura
    height: 0, //....................Sem altura
    borderLeftWidth: 8, //............Borda esquerda
    borderRightWidth: 8, //...........Borda direita
    borderTopWidth: 8, //.............Borda superior
    borderLeftColor: 'transparent', //...Transparente
    borderRightColor: 'transparent', //..Transparente
    borderTopColor: COLORS.skinToneBg, //...Cor do popup
  } as any,

  // Container dos emojis no popup
  skinToneContainer: {
    flexDirection: 'row', //..........Layout horizontal
    alignItems: 'center', //..........Centraliza vertical
  },

  // Botao de skin tone
  skinToneButton: {
    width: 42, //....................Largura
    height: 42, //...................Altura
    justifyContent: 'center', //......Centraliza vertical
    alignItems: 'center', //..........Centraliza horizontal
    borderRadius: 8, //...............Arredondamento
  },

  // Primeiro botao (emoji padrao amarelo)
  skinToneButtonFirst: {
    borderRightWidth: 1, //...........Borda separadora
    borderRightColor: 'rgba(255,255,255,0.2)', //...Cor da borda
    marginRight: 4, //................Margem direita
    paddingRight: 4, //...............Padding direito
  },

  // Emoji no popup de skin tones
  skinToneEmoji: {
    fontSize: 28, //..................Tamanho do emoji
  },
});

// Export Default
export default EmojiPicker;
