// ========================================
// Componente KanbanColumn
// Coluna do Kanban com lista de cards
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, {                       //......React core
  useMemo,                            //......Hook de memorizacao
  useCallback,                        //......Hook de callback
} from 'react';                       //......Biblioteca React
import {                              //......Componentes RN
  View,                               //......Container basico
  Text,                               //......Texto
  TouchableOpacity,                   //......Botao tocavel
  StyleSheet,                         //......Estilos
  ScrollView,                         //......Scroll
} from 'react-native';                //......Biblioteca RN
import Svg, {                         //......Componentes SVG
  Path,                               //......Path do SVG
} from 'react-native-svg';            //......Biblioteca SVG

// ========================================
// Imports de Tipos
// ========================================
import {                              //......Tipos do commercial
  KanbanColumn as KanbanColumnType,   //......Interface de coluna
  KanbanCard as KanbanCardType,       //......Interface de card
} from '../../types/commercial.types'; //......Arquivo de tipos

// ========================================
// Imports de Componentes
// ========================================
import KanbanCard from './02.04.KanbanCard'; //..Componente card

// ========================================
// Constantes de Cores
// ========================================
const COLORS = {
  primary: '#1777CF',                 //......Azul principal
  background: '#FCFCFC',              //......Fundo branco
  backgroundAlt: '#F4F4F4',           //......Fundo cinza
  textPrimary: '#3A3F51',             //......Texto principal
  textSecondary: '#7D8592',           //......Texto secundario
  border: '#D8E0F0',                  //......Borda
  white: '#FFFFFF',                   //......Branco
};

// ========================================
// Constantes de Layout
// ========================================
const COLUMN_WIDTH = 300;             //......Largura da coluna
const HEADER_HEIGHT = 48;             //......Altura do header

// ========================================
// Icones SVG
// ========================================

// Icone de Adicionar
const AddIcon = ({ color = COLORS.primary }: { color?: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
      fill={color}
    />
  </Svg>
);

// Icone de Menu
const MenuIcon = ({ color = COLORS.textSecondary }: { color?: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
      fill={color}
    />
  </Svg>
);

// ========================================
// Interface de Props
// ========================================
interface KanbanColumnProps {
  column: KanbanColumnType;           //......Dados da coluna
  cards: KanbanCardType[];            //......Cards da coluna
  onCardPress: (card: KanbanCardType) => void; //..Callback info modal
  onCardChatPress?: (card: KanbanCardType) => void; //..Callback chat
  onCardLongPress?: (card: KanbanCardType) => void; //..Callback long press
  onAddCard?: () => void;             //......Callback adicionar card
  onColumnMenu?: () => void;          //......Callback menu coluna
  showAddButton?: boolean;            //......Mostrar botao adicionar
  isCompact?: boolean;                //......Modo compacto (mobile)
}

// ========================================
// Componente KanbanColumn
// ========================================
const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,                             //......Dados da coluna
  cards,                              //......Cards da coluna
  onCardPress,                        //......Callback info modal
  onCardChatPress,                    //......Callback chat
  onCardLongPress,                    //......Callback long press
  onAddCard,                          //......Callback adicionar card
  onColumnMenu,                       //......Callback menu coluna
  showAddButton = true,               //......Mostrar botao adicionar
  isCompact = false,                  //......Modo compacto
}) => {
  // ========================================
  // Memos
  // ========================================

  // Contagem de cards
  const cardsCount = useMemo(() => cards.length, [cards]);

  // Valor total dos cards
  const totalValue = useMemo(() => {
    return cards.reduce((sum, card) => sum + card.value, 0);
  }, [cards]);

  // Valor formatado
  const formattedTotal = useMemo(() => {
    return totalValue.toLocaleString('pt-BR', {
      style: 'currency',              //......Estilo moeda
      currency: 'BRL',                //......Moeda BRL
      minimumFractionDigits: 0,       //......Sem decimais
      maximumFractionDigits: 0,       //......Sem decimais
    });
  }, [totalValue]);

  // ========================================
  // Handlers
  // ========================================

  // Handler de adicionar card
  const handleAddCard = useCallback(() => {
    if (onAddCard) {
      onAddCard();                    //......Chamar callback
    }
  }, [onAddCard]);

  // Handler de menu
  const handleMenu = useCallback(() => {
    if (onColumnMenu) {
      onColumnMenu();                 //......Chamar callback
    }
  }, [onColumnMenu]);

  // ========================================
  // Render
  // ========================================
  return (
    <View style={[styles.container, isCompact && styles.containerCompact]}>
      {/* Header da Coluna */}
      <View style={styles.header}>
        {/* Indicador de Cor */}
        <View style={[styles.colorIndicator, { backgroundColor: column.color }]} />

        {/* Info da Coluna */}
        <View style={styles.headerInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.columnName} numberOfLines={1}>
              {column.name}
            </Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{cardsCount}</Text>
            </View>
          </View>
          <Text style={styles.totalText}>{formattedTotal}</Text>
        </View>

        {/* Acoes do Header */}
        <View style={styles.headerActions}>
          {showAddButton && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleAddCard}
              activeOpacity={0.7}
            >
              <AddIcon color={COLORS.primary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleMenu}
            activeOpacity={0.7}
          >
            <MenuIcon color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista de Cards */}
      <ScrollView
        style={styles.cardsList}
        contentContainerStyle={styles.cardsListContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {cards.length === 0 ? (
          // Estado vazio
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Nenhum lead</Text>
            <Text style={styles.emptySubtext}>
              Arraste um card para cá
            </Text>
          </View>
        ) : (
          // Lista de cards
          cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              onPress={onCardPress}
              onChatPress={onCardChatPress}
              onLongPress={onCardLongPress}
            />
          ))
        )}
      </ScrollView>

      {/* Area de Drop (visual) */}
      {cards.length === 0 && (
        <View style={styles.dropArea}>
          <Text style={styles.dropText}>Solte aqui</Text>
        </View>
      )}
    </View>
  );
};

// ========================================
// Export Default
// ========================================
export default KanbanColumn;

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container principal
  container: {
    width: COLUMN_WIDTH,              //......Largura fixa
    backgroundColor: COLORS.backgroundAlt, //..Fundo cinza
    borderRadius: 12,                 //......Arredondamento
    marginRight: 12,                  //......Margem direita
    overflow: 'hidden',               //......Esconder overflow
  },

  // Container compacto (mobile)
  containerCompact: {
    width: '100%',                    //......Largura total
    marginRight: 0,                   //......Sem margem
  },

  // Header da coluna
  header: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    height: HEADER_HEIGHT,            //......Altura fixa
    paddingHorizontal: 12,            //......Espaco horizontal
    backgroundColor: COLORS.white,    //......Fundo branco
    borderBottomWidth: 1,             //......Borda inferior
    borderBottomColor: COLORS.border, //......Cor da borda
  },

  // Indicador de cor
  colorIndicator: {
    width: 4,                         //......Largura
    height: 24,                       //......Altura
    borderRadius: 2,                  //......Arredondamento
    marginRight: 10,                  //......Margem direita
  },

  // Info do header
  headerInfo: {
    flex: 1,                          //......Ocupar espaco
  },

  // Linha do titulo
  titleRow: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    gap: 8,                           //......Espaco entre itens
  },

  // Nome da coluna
  columnName: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.textPrimary,        //......Cor texto
  },

  // Badge de contagem
  countBadge: {
    backgroundColor: COLORS.backgroundAlt, //..Fundo cinza
    paddingHorizontal: 6,             //......Espaco horizontal
    paddingVertical: 2,               //......Espaco vertical
    borderRadius: 10,                 //......Arredondamento
  },

  // Texto da contagem
  countText: {
    fontSize: 11,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.textSecondary,      //......Cor secundaria
  },

  // Texto do total
  totalText: {
    fontSize: 11,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
    marginTop: 2,                     //......Margem superior
  },

  // Acoes do header
  headerActions: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    gap: 4,                           //......Espaco entre itens
  },

  // Botao de icone
  iconButton: {
    width: 28,                        //......Largura
    height: 28,                       //......Altura
    justifyContent: 'center',         //......Centralizar vertical
    alignItems: 'center',             //......Centralizar horizontal
    borderRadius: 6,                  //......Arredondamento
  },

  // Lista de cards
  cardsList: {
    flex: 1,                          //......Ocupar espaco
    maxHeight: 500,                   //......Altura maxima
  },

  // Conteudo da lista
  cardsListContent: {
    padding: 10,                      //......Espaco interno
  },

  // Estado vazio
  emptyState: {
    paddingVertical: 40,              //......Espaco vertical
    alignItems: 'center',             //......Centralizar horizontal
  },

  // Texto vazio
  emptyText: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_500Medium',    //......Fonte Inter Medium
    color: COLORS.textSecondary,      //......Cor secundaria
  },

  // Subtexto vazio
  emptySubtext: {
    fontSize: 12,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
    marginTop: 4,                     //......Margem superior
    opacity: 0.7,                     //......Opacidade
  },

  // Area de drop
  dropArea: {
    position: 'absolute',             //......Posicao absoluta
    top: HEADER_HEIGHT,               //......Abaixo do header
    left: 10,                         //......Margem esquerda
    right: 10,                        //......Margem direita
    bottom: 10,                       //......Margem inferior
    borderWidth: 2,                   //......Largura borda
    borderColor: COLORS.primary,      //......Cor da borda
    borderStyle: 'dashed',            //......Borda tracejada
    borderRadius: 8,                  //......Arredondamento
    justifyContent: 'center',         //......Centralizar vertical
    alignItems: 'center',             //......Centralizar horizontal
    backgroundColor: 'rgba(23, 119, 207, 0.05)', //..Fundo azul claro
    opacity: 0,                       //......Invisivel por padrao
  },

  // Texto de drop
  dropText: {
    fontSize: 12,                     //......Tamanho fonte
    fontFamily: 'Inter_500Medium',    //......Fonte Inter Medium
    color: COLORS.primary,            //......Cor azul
  },
});
