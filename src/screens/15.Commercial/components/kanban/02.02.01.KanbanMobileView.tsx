// ========================================
// Componente KanbanMobileView
// Arquivo 01 - View mobile do Kanban
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, {                       //......React core
  useState,                           //......Hook de estado
  useMemo,                            //......Hook de memorizacao
  useCallback,                        //......Hook de callback
  useRef,                             //......Hook de referencia
  useEffect,                          //......Hook de efeito
} from 'react';                       //......Biblioteca React
import {                              //......Componentes RN
  View,                               //......Container basico
  Text,                               //......Texto
  TouchableOpacity,                   //......Botao tocavel
  FlatList,                           //......Lista otimizada
  ScrollView,                         //......Scroll view
  Animated,                           //......Animacoes
  PanResponder,                       //......Gestos de arraste
  Modal,                              //......Modal
  TextInput,                          //......Input de texto
  Platform,                           //......Plataforma
  useWindowDimensions,                //......Dimensoes da janela
} from 'react-native';                //......Biblioteca RN
import Svg, {                         //......Componentes SVG
  Path,                               //......Path do SVG
} from 'react-native-svg';            //......Biblioteca SVG

// ========================================
// Imports de Tipos
// ========================================
import {                              //......Tipos do commercial
  KanbanPhase,                        //......Interface de fase
  KanbanColumn as KanbanColumnType,   //......Interface de coluna
  KanbanCard as KanbanCardType,       //......Interface de card
} from '../../types/commercial.types'; //......Arquivo de tipos

// ========================================
// Imports de Componentes
// ========================================
import KanbanCard from './02.04.KanbanCard'; //..Componente card

// ========================================
// Imports de Estilos
// ========================================
import { styles, COLORS, SWIPE_THRESHOLD } from './02.02.02.KanbanMobileViewStyles';

// ========================================
// Icones SVG
// ========================================

// Icone de Seta Esquerda (slim)
const ChevronLeftIcon = ({ color = COLORS.primary }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18l-6-6 6-6"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Icone de Seta Direita (slim)
const ChevronRightIcon = ({ color = COLORS.primary }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 18l6-6-6-6"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Icone de Busca
const SearchIcon = ({ color = COLORS.textSecondary }: { color?: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ========================================
// Icone WhatsApp
// ========================================
const WhatsAppIcon = ({ size = 16, color = '#25D366' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path
      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
    />
  </Svg>
);

// ========================================
// Icone de Mais
// ========================================
const PlusIcon = ({ size = 14, color = '#FFFFFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
      fill={color}
    />
  </Svg>
);

// Icone de Fase (layers)
const PhaseIcon = ({ size = 20, color = '#3A3F51' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Icone de Coluna (columns)
const ColumnIcon = ({ size = 20, color = '#3A3F51' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 3H5a2 2 0 00-2 2v14a2 2 0 002 2h4M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Icone de Pessoa (user)
const UserIcon = ({ size = 20, color = '#3A3F51' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Icone de Fechar
const CloseIcon = ({ size = 24, color = '#3A3F51' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6l12 12"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ========================================
// Interface de Props
// ========================================
interface KanbanMobileViewProps {
  phases: KanbanPhase[];              //......Lista de fases
  columns: KanbanColumnType[];        //......Lista de colunas
  cards: KanbanCardType[];            //......Lista de cards
  onCardPress: (card: KanbanCardType) => void; //..Callback info modal
  onCardChatPress?: (card: KanbanCardType) => void; //..Callback chat
  onCardLongPress?: (card: KanbanCardType) => void; //..Callback long press
  onAddCard?: (columnId: string) => void; //..Callback adicionar card
  onAddPhase?: () => void;            //......Callback adicionar fase
  onAddColumn?: (phaseId?: string) => void; //..Callback adicionar coluna
  onAddLead?: () => void;             //......Callback adicionar lead
  isWhatsAppConnected?: boolean;      //......Status WhatsApp
  onWhatsAppPress?: () => void;       //......Callback WhatsApp
}

// ========================================
// Componente KanbanMobileView
// ========================================
const KanbanMobileView: React.FC<KanbanMobileViewProps> = ({
  phases,                             //......Lista de fases
  columns,                            //......Lista de colunas
  cards,                              //......Lista de cards
  onCardPress,                        //......Callback info modal
  onCardChatPress,                    //......Callback chat
  onCardLongPress,                    //......Callback long press
  onAddCard,                          //......Callback adicionar card
  onAddPhase,                         //......Callback adicionar fase
  onAddColumn,                        //......Callback adicionar coluna
  onAddLead,                          //......Callback adicionar lead
  isWhatsAppConnected = false,        //......Status WhatsApp
  onWhatsAppPress,                    //......Callback WhatsApp
}) => {
  // ========================================
  // Dimensoes da janela
  // ========================================
  const { height: windowHeight } = useWindowDimensions();

  // Calcula altura disponivel para area de cards
  // Header tabs (48) + actionsBar (56) + phaseSelector (48) + columnNav (48) + search (56) + margens (24)
  const HEADER_HEIGHT = Platform.OS === 'web' ? 280 : 240;
  const cardsAreaHeight = windowHeight - HEADER_HEIGHT;

  // ========================================
  // Constantes de Performance
  // ========================================
  const DEBOUNCE_DELAY = 300;           //......Delay debounce em ms
  const INITIAL_VISIBLE = 30;           //......Cards iniciais visiveis
  const LOAD_MORE_COUNT = 30;           //......Cards por lote
  const CARD_HEIGHT = 180;              //......Altura estimada do card
  const CARD_MARGIN = 10;               //......Margem entre cards
  const ITEM_HEIGHT = CARD_HEIGHT + CARD_MARGIN; //..Altura total do item

  // ========================================
  // Estados
  // ========================================
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>(
    phases[0]?.id || ''               //......Fase inicial
  );
  const [currentColumnIndex, setCurrentColumnIndex] = useState(0);
  const [showPhaseDropdown, setShowPhaseDropdown] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  // ========================================
  // Refs
  // ========================================
  const translateX = useRef(new Animated.Value(0)).current;
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ========================================
  // Efeito: Debounce da Busca
  // ========================================
  useEffect(() => {
    // Limpa timeout anterior
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Se query vazia, atualiza imediatamente
    if (searchQuery === '') {
      setDebouncedSearch('');
      setVisibleCount(INITIAL_VISIBLE);
      return;
    }

    // Configura novo timeout
    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setVisibleCount(INITIAL_VISIBLE);
    }, DEBOUNCE_DELAY);

    // Cleanup
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Efeito: Reset visibleCount quando muda coluna
  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE);
  }, [currentColumnIndex, selectedPhaseId]);

  // ========================================
  // Memos
  // ========================================

  // Fase selecionada
  const selectedPhase = useMemo(() => {
    return phases.find(p => p.id === selectedPhaseId);
  }, [phases, selectedPhaseId]);

  // Colunas da fase selecionada
  const phaseColumns = useMemo(() => {
    return columns.filter(c => c.phaseId === selectedPhaseId);
  }, [columns, selectedPhaseId]);

  // Coluna atual
  const currentColumn = useMemo(() => {
    return phaseColumns[currentColumnIndex];
  }, [phaseColumns, currentColumnIndex]);

  // Cards da coluna atual
  const columnCards = useMemo(() => {
    if (!currentColumn) return [];     //......Retornar vazio
    return cards.filter(c => c.columnId === currentColumn.id);
  }, [cards, currentColumn]);

  // Cards filtrados pela busca (usa debounce)
  const filteredCards = useMemo(() => {
    if (!debouncedSearch.trim()) return columnCards;
    const query = debouncedSearch.toLowerCase();
    return columnCards.filter(card => {
      const nameMatch = card.leadName?.toLowerCase().includes(query);
      const phoneMatch = card.leadPhone?.toLowerCase().includes(query);
      return nameMatch || phoneMatch;
    });
  }, [columnCards, debouncedSearch]);

  // Cards visiveis (limitados para performance)
  const visibleCards = useMemo(() => {
    return filteredCards.slice(0, visibleCount);
  }, [filteredCards, visibleCount]);

  // Se tem mais cards para carregar
  const hasMoreCards = useMemo(() => {
    return filteredCards.length > visibleCount;
  }, [filteredCards.length, visibleCount]);

  // Handler para carregar mais cards
  const handleLoadMore = useCallback(() => {
    setVisibleCount(prev => prev + LOAD_MORE_COUNT);
  }, []);

  // Funcao getItemLayout para FlatList (otimizacao de scroll)
  const getItemLayout = useCallback((
    _data: KanbanCardType[] | null | undefined,
    index: number,
  ) => ({
    length: ITEM_HEIGHT,              //......Altura do item
    offset: ITEM_HEIGHT * index,      //......Posicao do item
    index,                            //......Indice do item
  }), []);

  // Valor total da coluna
  const columnTotal = useMemo(() => {
    return columnCards.reduce((sum, card) => sum + card.value, 0);
  }, [columnCards]);

  // Valor formatado
  const formattedTotal = useMemo(() => {
    return columnTotal.toLocaleString('pt-BR', {
      style: 'currency',              //......Estilo moeda
      currency: 'BRL',                //......Moeda BRL
      minimumFractionDigits: 0,       //......Sem decimais
      maximumFractionDigits: 0,       //......Sem decimais
    });
  }, [columnTotal]);

  // Indice da fase atual
  const currentPhaseIndex = useMemo(() => {
    return phases.findIndex(p => p.id === selectedPhaseId);
  }, [phases, selectedPhaseId]);

  // Total de fases
  const totalPhases = useMemo(() => phases.length, [phases]);

  // Total de colunas na fase
  const totalColumns = useMemo(() => phaseColumns.length, [phaseColumns]);

  // Total de leads na fase atual
  const phaseLeadsCount = useMemo(() => {
    return cards.filter(c => c.phaseId === selectedPhaseId).length;
  }, [cards, selectedPhaseId]);

  // ========================================
  // Handlers
  // ========================================

  // Handler de selecionar fase
  const handleSelectPhase = useCallback((phaseId: string) => {
    setSelectedPhaseId(phaseId);       //......Atualizar fase
    setCurrentColumnIndex(0);          //......Resetar coluna
    setShowPhaseDropdown(false);       //......Fechar dropdown
  }, []);

  // Handler de fase anterior
  const handlePreviousPhase = useCallback(() => {
    if (currentPhaseIndex > 0) {
      const prevPhase = phases[currentPhaseIndex - 1];
      setSelectedPhaseId(prevPhase.id); //......Atualizar fase
      setCurrentColumnIndex(0);         //......Resetar coluna
    }
  }, [currentPhaseIndex, phases]);

  // Handler de proxima fase
  const handleNextPhase = useCallback(() => {
    if (currentPhaseIndex < phases.length - 1) {
      const nextPhase = phases[currentPhaseIndex + 1];
      setSelectedPhaseId(nextPhase.id); //......Atualizar fase
      setCurrentColumnIndex(0);         //......Resetar coluna
    }
  }, [currentPhaseIndex, phases]);

  // Handler de coluna anterior
  const handlePreviousColumn = useCallback(() => {
    if (currentColumnIndex > 0) {
      Animated.spring(translateX, {
        toValue: 0,                    //......Resetar posicao
        useNativeDriver: true,         //......Driver nativo
      }).start();
      setCurrentColumnIndex(prev => prev - 1);
    }
  }, [currentColumnIndex, translateX]);

  // Handler de proxima coluna
  const handleNextColumn = useCallback(() => {
    if (currentColumnIndex < phaseColumns.length - 1) {
      Animated.spring(translateX, {
        toValue: 0,                    //......Resetar posicao
        useNativeDriver: true,         //......Driver nativo
      }).start();
      setCurrentColumnIndex(prev => prev + 1);
    }
  }, [currentColumnIndex, phaseColumns.length, translateX]);

  // Handler de adicionar card
  const handleAddCard = useCallback(() => {
    if (onAddCard && currentColumn) {
      onAddCard(currentColumn.id);     //......Chamar callback
    }
  }, [onAddCard, currentColumn]);

  // Handler de toggle dropdown
  const handleToggleDropdown = useCallback(() => {
    setShowPhaseDropdown(prev => !prev);
  }, []);

  // ========================================
  // PanResponder para Swipe (Otimizado)
  // ========================================
  const panResponder = useMemo(() => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Capturar apenas gestos predominantemente horizontais
        const absDx = Math.abs(gestureState.dx);
        const absDy = Math.abs(gestureState.dy);
        const isHorizontalSwipe = absDx > absDy * 2;
        const hasMinimumMovement = absDx > 15;
        return isHorizontalSwipe && hasMinimumMovement;
      },
      onMoveShouldSetPanResponderCapture: () => false,
      onPanResponderGrant: () => {},
      onPanResponderMove: (_, gestureState) => {
        translateX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > SWIPE_THRESHOLD && currentColumnIndex > 0) {
          // Swipe para direita - coluna anterior
          handlePreviousColumn();      //......Ir para anterior
        } else if (gestureState.dx < -SWIPE_THRESHOLD && currentColumnIndex < phaseColumns.length - 1) {
          // Swipe para esquerda - proxima coluna
          handleNextColumn();          //......Ir para proxima
        } else {
          // Voltar para posicao original
          Animated.spring(translateX, {
            toValue: 0,                //......Posicao original
            useNativeDriver: true,     //......Driver nativo
          }).start();
        }
      },
      onPanResponderTerminate: () => {},
    });
  }, [currentColumnIndex, phaseColumns.length, handlePreviousColumn, handleNextColumn, translateX]);

  // ========================================
  // Handler de Adicionar Coluna
  // ========================================
  const handleAddColumn = useCallback(() => {
    if (onAddColumn) {
      onAddColumn(selectedPhaseId);    //......Passar fase atual
    }
    setShowActionsModal(false);        //......Fechar modal
  }, [onAddColumn, selectedPhaseId]);

  // ========================================
  // Handler de Adicionar Fase
  // ========================================
  const handleAddPhase = useCallback(() => {
    if (onAddPhase) {
      onAddPhase();                    //......Chamar callback
    }
    setShowActionsModal(false);        //......Fechar modal
  }, [onAddPhase]);

  // ========================================
  // Handler de Adicionar Lead
  // ========================================
  const handleAddLead = useCallback(() => {
    if (onAddLead) {
      onAddLead();                     //......Chamar callback
    }
    setShowActionsModal(false);        //......Fechar modal
  }, [onAddLead]);

  // ========================================
  // Render
  // ========================================
  return (
    <View style={styles.container}>
      {/* Barra de Acoes */}
      <View style={styles.actionsBar}>
        {/* Botao WhatsApp - Esquerda */}
        <TouchableOpacity
          style={styles.whatsappButton}
          onPress={onWhatsAppPress}
          activeOpacity={0.7}
        >
          <WhatsAppIcon size={18} color={isWhatsAppConnected ? '#25D366' : '#7D8592'} />
          <Text style={[
            styles.whatsappText,
            isWhatsAppConnected && styles.whatsappTextConnected,
          ]}>
            {isWhatsAppConnected ? 'WhatsApp Conectado' : 'Configurar WhatsApp'}
          </Text>
          {isWhatsAppConnected && (
            <View style={styles.statusDotConnected} />
          )}
        </TouchableOpacity>

        {/* Botao Adicionar - Direita */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowActionsModal(true)}
          activeOpacity={0.7}
        >
          <PlusIcon size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Seletor de Fase com Setas */}
      <View style={styles.phaseSelector}>
        {/* Seta Esquerda */}
        <TouchableOpacity
          style={styles.navArrowButton}
          onPress={handlePreviousPhase}
          activeOpacity={0.7}
        >
          <ChevronLeftIcon color={COLORS.primary} />
        </TouchableOpacity>

        {/* Container da Fase */}
        <TouchableOpacity
          style={styles.phaseSelectorButton}
          onPress={handleToggleDropdown}
          activeOpacity={0.7}
        >
          <Text style={styles.phaseSelectorText} numberOfLines={1}>
            {selectedPhase?.name || 'Selecione uma fase'}
          </Text>
          <Text style={styles.countText}>{phaseLeadsCount}</Text>
          <Text style={styles.positionTextLarge}>
            {String(currentPhaseIndex + 1).padStart(2, '0')}/{String(totalPhases).padStart(2, '0')}
          </Text>
        </TouchableOpacity>

        {/* Seta Direita */}
        <TouchableOpacity
          style={styles.navArrowButton}
          onPress={handleNextPhase}
          activeOpacity={0.7}
        >
          <ChevronRightIcon color={COLORS.primary} />
        </TouchableOpacity>

        {/* Dropdown de Fases */}
        {showPhaseDropdown && (
          <View style={styles.phaseDropdown}>
            {phases.map((phase) => (
              <TouchableOpacity
                key={phase.id}
                style={[
                  styles.phaseDropdownItem,
                  phase.id === selectedPhaseId && styles.phaseDropdownItemActive,
                ]}
                onPress={() => handleSelectPhase(phase.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.phaseColorDot,
                    { backgroundColor: phase.color },
                  ]}
                />
                <Text
                  style={[
                    styles.phaseDropdownText,
                    phase.id === selectedPhaseId && styles.phaseDropdownTextActive,
                  ]}
                >
                  {phase.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Navegacao de Colunas */}
      <View style={styles.columnNavigation}>
        {/* Botao Anterior */}
        <TouchableOpacity
          style={styles.navArrowButton}
          onPress={handlePreviousColumn}
          activeOpacity={0.7}
        >
          <ChevronLeftIcon color={COLORS.primary} />
        </TouchableOpacity>

        {/* Info da Coluna */}
        <View style={styles.columnInfo}>
          <Text style={styles.columnName} numberOfLines={1}>
            {currentColumn?.name || 'Selecione uma coluna'}
          </Text>
          <Text style={styles.countText}>
            {columnCards.length}
          </Text>
          <Text style={styles.positionTextLarge}>
            {String(currentColumnIndex + 1).padStart(2, '0')}/{String(totalColumns).padStart(2, '0')}
          </Text>
        </View>

        {/* Botao Proximo */}
        <TouchableOpacity
          style={styles.navArrowButton}
          onPress={handleNextColumn}
          activeOpacity={0.7}
        >
          <ChevronRightIcon color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Barra de Busca */}
      <View style={styles.searchContainer}>
        <SearchIcon color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nome ou WhatsApp..."
          placeholderTextColor={COLORS.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            activeOpacity={0.7}
          >
            <CloseIcon size={16} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Area de Cards - FlatList Unificado (Mobile e Web) */}
      <View
        style={[
          styles.cardsArea,
          Platform.OS === 'web' && {
            height: cardsAreaHeight,
            maxHeight: cardsAreaHeight,
          } as any,
        ]}
      >
        <FlatList
          data={visibleCards}
          keyExtractor={(item) => item.id}
          renderItem={({ item: card }) => (
            <KanbanCard
              card={card}
              onPress={onCardPress}
              onChatPress={onCardChatPress}
              onLongPress={onCardLongPress}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {debouncedSearch ? 'Nenhum resultado encontrado' : 'Nenhum lead nesta coluna'}
              </Text>
              <Text style={styles.emptySubtext}>
                {debouncedSearch ? 'Tente buscar por outro termo' : 'Deslize para navegar entre colunas'}
              </Text>
            </View>
          }
          ListFooterComponent={hasMoreCards ? (
            <TouchableOpacity
              style={{
                backgroundColor: COLORS.primary,
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderRadius: 8,
                alignItems: 'center',
                marginVertical: 16,
                marginHorizontal: 16,
              }}
              onPress={handleLoadMore}
              activeOpacity={0.7}
            >
              <Text style={{
                color: '#FFFFFF',
                fontFamily: 'Inter_500Medium',
                fontSize: 14,
              }}>
                Carregar mais ({filteredCards.length - visibleCount} restantes)
              </Text>
            </TouchableOpacity>
          ) : null}
          contentContainerStyle={styles.cardsListContent}
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={true}
          scrollEnabled={true}
          nestedScrollEnabled={true}
          getItemLayout={getItemLayout}
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          windowSize={Platform.OS === 'web' ? 10 : 5}
          removeClippedSubviews={Platform.OS !== 'web'}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
        />
      </View>

      {/* Modal de Acoes */}
      <Modal
        visible={showActionsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowActionsModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowActionsModal(false)}
        >
          <View style={styles.actionsModalContainer}>
            {/* Header do Modal */}
            <View style={styles.actionsModalHeader}>
              <Text style={styles.actionsModalTitle}>Adicionar</Text>
              <TouchableOpacity
                style={styles.actionsModalClose}
                onPress={() => setShowActionsModal(false)}
              >
                <CloseIcon size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Opcoes */}
            <View style={styles.actionsModalOptions}>
              {/* Criar Fase */}
              <TouchableOpacity
                style={styles.actionsModalOption}
                onPress={handleAddPhase}
                activeOpacity={0.7}
              >
                <View style={styles.actionsModalIconContainer}>
                  <PhaseIcon size={22} color={COLORS.primary} />
                </View>
                <View style={styles.actionsModalOptionText}>
                  <Text style={styles.actionsModalOptionTitle}>Nova Fase</Text>
                  <Text style={styles.actionsModalOptionDesc}>Criar nova fase no funil</Text>
                </View>
              </TouchableOpacity>

              {/* Criar Coluna */}
              <TouchableOpacity
                style={styles.actionsModalOption}
                onPress={handleAddColumn}
                activeOpacity={0.7}
              >
                <View style={styles.actionsModalIconContainer}>
                  <ColumnIcon size={22} color={COLORS.primary} />
                </View>
                <View style={styles.actionsModalOptionText}>
                  <Text style={styles.actionsModalOptionTitle}>Nova Coluna</Text>
                  <Text style={styles.actionsModalOptionDesc}>Adicionar coluna na fase atual</Text>
                </View>
              </TouchableOpacity>

              {/* Criar Lead */}
              <TouchableOpacity
                style={styles.actionsModalOption}
                onPress={handleAddLead}
                activeOpacity={0.7}
              >
                <View style={styles.actionsModalIconContainer}>
                  <UserIcon size={22} color={COLORS.primary} />
                </View>
                <View style={styles.actionsModalOptionText}>
                  <Text style={styles.actionsModalOptionTitle}>Novo Lead</Text>
                  <Text style={styles.actionsModalOptionDesc}>Cadastrar novo lead manualmente</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// ========================================
// Export Default
// ========================================
export default KanbanMobileView;
