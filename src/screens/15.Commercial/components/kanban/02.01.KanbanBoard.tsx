// ========================================
// Componente KanbanBoard
// Board completo do Kanban para desktop
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, {                       //......React core
  useMemo,                            //......Hook de memorizacao
  useCallback,                        //......Hook de callback
  useState,                           //......Hook de estado
} from 'react';                       //......Biblioteca React
import {                              //......Componentes RN
  View,                               //......Container basico
  Text,                               //......Texto
  TouchableOpacity,                   //......Botao tocavel
  StyleSheet,                         //......Estilos
  ScrollView,                         //......Scroll
  Dimensions,                         //......Dimensoes
} from 'react-native';                //......Biblioteca RN
import Svg, {                         //......Componentes SVG
  Path,                               //......Path do SVG
} from 'react-native-svg';            //......Biblioteca SVG

// ========================================
// Imports de Contexto
// ========================================
import { useKanban } from '../../contexts/KanbanContext'; //..Contexto Kanban

// ========================================
// Imports de Tipos
// ========================================
import {                              //......Tipos do commercial
  KanbanCard as KanbanCardType,       //......Interface de card
  KanbanPhase,                        //......Interface de fase
} from '../../types/commercial.types'; //......Arquivo de tipos

// ========================================
// Imports de Componentes
// ========================================
import KanbanColumn from './02.03.KanbanColumn'; //..Componente coluna

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
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHASE_MIN_WIDTH = 320;          //......Largura minima da fase
const PHASE_HEADER_HEIGHT = 44;       //......Altura do header da fase

// ========================================
// Icones SVG
// ========================================

// Icone de Adicionar Fase
const AddPhaseIcon = ({ color = COLORS.primary }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
      fill={color}
    />
  </Svg>
);

// Icone de Expandir
const ExpandIcon = ({ color = COLORS.textSecondary }: { color?: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"
      fill={color}
    />
  </Svg>
);

// ========================================
// Interface de Props
// ========================================
interface KanbanBoardProps {
  onCardPress: (card: KanbanCardType) => void; //..Callback info modal
  onCardChatPress?: (card: KanbanCardType) => void; //..Callback chat
  onAddPhase?: () => void;            //......Callback adicionar fase
  onAddColumn?: (phaseId: string) => void; //..Callback adicionar coluna
}

// ========================================
// Componente PhaseSection
// ========================================
interface PhaseSectionProps {
  phase: KanbanPhase;                 //......Dados da fase
  cards: KanbanCardType[];            //......Todos os cards
  onCardPress: (card: KanbanCardType) => void; //..Callback info modal
  onCardChatPress?: (card: KanbanCardType) => void; //..Callback chat
  onAddColumn?: (phaseId: string) => void; //..Callback adicionar coluna
  isCollapsed: boolean;               //......Se esta colapsado
  onToggleCollapse: () => void;       //......Toggle colapsar
}

const PhaseSection: React.FC<PhaseSectionProps> = ({
  phase,                              //......Dados da fase
  cards,                              //......Todos os cards
  onCardPress,                        //......Callback info modal
  onCardChatPress,                    //......Callback chat
  onAddColumn,                        //......Callback adicionar coluna
  isCollapsed,                        //......Se esta colapsado
  onToggleCollapse,                   //......Toggle colapsar
}) => {
  // Filtrar cards da fase
  const phaseCards = useMemo(() => {
    return cards.filter(card => card.phaseId === phase.id);
  }, [cards, phase.id]);

  // Obter cards por coluna
  const getColumnCards = useCallback((columnId: string) => {
    return phaseCards.filter(card => card.columnId === columnId);
  }, [phaseCards]);

  // Estatisticas da fase
  const stats = useMemo(() => ({
    total: phaseCards.length,
    value: phaseCards.reduce((sum, card) => sum + card.value, 0),
  }), [phaseCards]);

  // Handler adicionar coluna
  const handleAddColumn = useCallback(() => {
    if (onAddColumn) {
      onAddColumn(phase.id);          //......Chamar callback
    }
  }, [onAddColumn, phase.id]);

  return (
    <View style={styles.phaseSection}>
      {/* Header da Fase */}
      <TouchableOpacity
        style={styles.phaseHeader}
        onPress={onToggleCollapse}
        activeOpacity={0.8}
      >
        {/* Indicador de Cor */}
        <View style={[styles.phaseColorBar, { backgroundColor: phase.color }]} />

        {/* Info da Fase */}
        <View style={styles.phaseInfo}>
          <Text style={styles.phaseName}>{phase.name}</Text>
          <Text style={styles.phaseStats}>
            {stats.total} leads | {stats.value.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              minimumFractionDigits: 0,
            })}
          </Text>
        </View>

        {/* Acoes */}
        <View style={styles.phaseActions}>
          <TouchableOpacity
            style={styles.addColumnButton}
            onPress={handleAddColumn}
            activeOpacity={0.7}
          >
            <Text style={styles.addColumnText}>+ Coluna</Text>
          </TouchableOpacity>

          <View style={[
            styles.expandIconContainer,
            isCollapsed && styles.expandIconRotated,
          ]}>
            <ExpandIcon color={COLORS.textSecondary} />
          </View>
        </View>
      </TouchableOpacity>

      {/* Colunas da Fase */}
      {!isCollapsed && (
        <ScrollView
          horizontal
          style={styles.columnsScroll}
          contentContainerStyle={styles.columnsContent}
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled={true}
        >
          {phase.columns.length === 0 ? (
            // Estado vazio
            <View style={styles.emptyPhase}>
              <Text style={styles.emptyPhaseText}>
                Nenhuma coluna nesta fase
              </Text>
              <TouchableOpacity
                style={styles.emptyAddButton}
                onPress={handleAddColumn}
                activeOpacity={0.7}
              >
                <Text style={styles.emptyAddText}>+ Adicionar coluna</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Colunas
            phase.columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                cards={getColumnCards(column.id)}
                onCardPress={onCardPress}
                onCardChatPress={onCardChatPress}
                showAddButton={false}
              />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
};

// ========================================
// Componente KanbanBoard
// ========================================
const KanbanBoard: React.FC<KanbanBoardProps> = ({
  onCardPress,                        //......Callback info modal
  onCardChatPress,                    //......Callback chat
  onAddPhase,                         //......Callback adicionar fase
  onAddColumn,                        //......Callback adicionar coluna
}) => {
  // ========================================
  // Contexto
  // ========================================
  const { phases, getColumnCards } = useKanban();

  // ========================================
  // Estado
  // ========================================

  // Fases colapsadas
  const [collapsedPhases, setCollapsedPhases] = useState<Set<string>>(new Set());

  // ========================================
  // Memos
  // ========================================

  // Todos os cards
  const allCards = useMemo(() => {
    const cards: KanbanCardType[] = [];
    phases.forEach(phase => {
      phase.columns.forEach(column => {
        cards.push(...getColumnCards(column.id));
      });
    });
    return cards;
  }, [phases, getColumnCards]);

  // ========================================
  // Handlers
  // ========================================

  // Toggle colapsar fase
  const handleToggleCollapse = useCallback((phaseId: string) => {
    setCollapsedPhases(prev => {
      const next = new Set(prev);
      if (next.has(phaseId)) {
        next.delete(phaseId);         //......Expandir
      } else {
        next.add(phaseId);            //......Colapsar
      }
      return next;
    });
  }, []);

  // Handler adicionar fase
  const handleAddPhase = useCallback(() => {
    if (onAddPhase) {
      onAddPhase();                   //......Chamar callback
    }
  }, [onAddPhase]);

  // ========================================
  // Render
  // ========================================
  return (
    <View style={styles.container}>
      {/* Header do Board */}
      <View style={styles.boardHeader}>
        <View style={styles.boardTitleContainer}>
          <Text style={styles.boardTitle}>Funil de Vendas</Text>
          <Text style={styles.boardSubtitle}>
            {allCards.length} leads | {phases.length} fases
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addPhaseButton}
          onPress={handleAddPhase}
          activeOpacity={0.7}
        >
          <AddPhaseIcon color={COLORS.white} />
          <Text style={styles.addPhaseText}>Nova Fase</Text>
        </TouchableOpacity>
      </View>

      {/* Fases */}
      <ScrollView
        style={styles.phasesScroll}
        contentContainerStyle={styles.phasesContent}
        showsVerticalScrollIndicator={false}
      >
        {phases.length === 0 ? (
          // Estado vazio
          <View style={styles.emptyBoard}>
            <Text style={styles.emptyBoardTitle}>
              Nenhuma fase criada
            </Text>
            <Text style={styles.emptyBoardText}>
              Crie sua primeira fase para começar a organizar seus leads
            </Text>
            <TouchableOpacity
              style={styles.emptyBoardButton}
              onPress={handleAddPhase}
              activeOpacity={0.7}
            >
              <AddPhaseIcon color={COLORS.white} />
              <Text style={styles.emptyBoardButtonText}>Criar Fase</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Fases
          phases.map((phase) => (
            <PhaseSection
              key={phase.id}
              phase={phase}
              cards={allCards}
              onCardPress={onCardPress}
              onCardChatPress={onCardChatPress}
              onAddColumn={onAddColumn}
              isCollapsed={collapsedPhases.has(phase.id)}
              onToggleCollapse={() => handleToggleCollapse(phase.id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

// ========================================
// Export Default
// ========================================
export default KanbanBoard;

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1,                          //......Ocupar espaco
    backgroundColor: COLORS.backgroundAlt, //..Fundo cinza
  },

  // Header do board
  boardHeader: {
    flexDirection: 'row',             //......Layout horizontal
    justifyContent: 'space-between',  //......Espaco entre
    alignItems: 'center',             //......Centralizar vertical
    paddingHorizontal: 16,            //......Espaco horizontal
    paddingVertical: 12,              //......Espaco vertical
    backgroundColor: COLORS.white,    //......Fundo branco
    borderBottomWidth: 1,             //......Borda inferior
    borderBottomColor: COLORS.border, //......Cor da borda
  },

  // Container do titulo
  boardTitleContainer: {
    flex: 1,                          //......Ocupar espaco
  },

  // Titulo do board
  boardTitle: {
    fontSize: 18,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.textPrimary,        //......Cor texto
  },

  // Subtitulo do board
  boardSubtitle: {
    fontSize: 12,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
    marginTop: 2,                     //......Margem superior
  },

  // Botao adicionar fase
  addPhaseButton: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    gap: 6,                           //......Espaco entre itens
    backgroundColor: COLORS.primary,  //......Fundo azul
    paddingHorizontal: 12,            //......Espaco horizontal
    paddingVertical: 8,               //......Espaco vertical
    borderRadius: 8,                  //......Arredondamento
  },

  // Texto adicionar fase
  addPhaseText: {
    fontSize: 13,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.white,              //......Cor branca
  },

  // Scroll das fases
  phasesScroll: {
    flex: 1,                          //......Ocupar espaco
  },

  // Conteudo das fases
  phasesContent: {
    padding: 16,                      //......Espaco interno
    gap: 16,                          //......Espaco entre fases
  },

  // Secao da fase
  phaseSection: {
    backgroundColor: COLORS.white,    //......Fundo branco
    borderRadius: 12,                 //......Arredondamento
    overflow: 'hidden',               //......Esconder overflow
    borderWidth: 1,                   //......Largura borda
    borderColor: COLORS.border,       //......Cor da borda
  },

  // Header da fase
  phaseHeader: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    height: PHASE_HEADER_HEIGHT,      //......Altura fixa
    paddingHorizontal: 12,            //......Espaco horizontal
    backgroundColor: COLORS.white,    //......Fundo branco
  },

  // Barra de cor da fase
  phaseColorBar: {
    width: 4,                         //......Largura
    height: 28,                       //......Altura
    borderRadius: 2,                  //......Arredondamento
    marginRight: 12,                  //......Margem direita
  },

  // Info da fase
  phaseInfo: {
    flex: 1,                          //......Ocupar espaco
  },

  // Nome da fase
  phaseName: {
    fontSize: 15,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.textPrimary,        //......Cor texto
  },

  // Stats da fase
  phaseStats: {
    fontSize: 11,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
    marginTop: 2,                     //......Margem superior
  },

  // Acoes da fase
  phaseActions: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    gap: 8,                           //......Espaco entre itens
  },

  // Botao adicionar coluna
  addColumnButton: {
    paddingHorizontal: 8,             //......Espaco horizontal
    paddingVertical: 4,               //......Espaco vertical
    borderRadius: 6,                  //......Arredondamento
    borderWidth: 1,                   //......Largura borda
    borderColor: COLORS.primary,      //......Cor da borda
  },

  // Texto adicionar coluna
  addColumnText: {
    fontSize: 11,                     //......Tamanho fonte
    fontFamily: 'Inter_500Medium',    //......Fonte Inter Medium
    color: COLORS.primary,            //......Cor azul
  },

  // Container icone expandir
  expandIconContainer: {
    width: 24,                        //......Largura
    height: 24,                       //......Altura
    justifyContent: 'center',         //......Centralizar vertical
    alignItems: 'center',             //......Centralizar horizontal
  },

  // Icone expandir rotacionado
  expandIconRotated: {
    transform: [{ rotate: '-90deg' }], //......Rotacao
  },

  // Scroll das colunas
  columnsScroll: {
    maxHeight: 520,                   //......Altura maxima
  },

  // Conteudo das colunas
  columnsContent: {
    padding: 12,                      //......Espaco interno
  },

  // Fase vazia
  emptyPhase: {
    padding: 24,                      //......Espaco interno
    alignItems: 'center',             //......Centralizar horizontal
  },

  // Texto fase vazia
  emptyPhaseText: {
    fontSize: 13,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
    marginBottom: 12,                 //......Margem inferior
  },

  // Botao adicionar vazio
  emptyAddButton: {
    paddingHorizontal: 12,            //......Espaco horizontal
    paddingVertical: 6,               //......Espaco vertical
    borderRadius: 6,                  //......Arredondamento
    backgroundColor: COLORS.primary,  //......Fundo azul
  },

  // Texto adicionar vazio
  emptyAddText: {
    fontSize: 12,                     //......Tamanho fonte
    fontFamily: 'Inter_500Medium',    //......Fonte Inter Medium
    color: COLORS.white,              //......Cor branca
  },

  // Board vazio
  emptyBoard: {
    flex: 1,                          //......Ocupar espaco
    justifyContent: 'center',         //......Centralizar vertical
    alignItems: 'center',             //......Centralizar horizontal
    padding: 24,                      //......Espaco interno
    minHeight: 300,                   //......Altura minima
  },

  // Titulo board vazio
  emptyBoardTitle: {
    fontSize: 18,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.textPrimary,        //......Cor texto
    marginBottom: 8,                  //......Margem inferior
  },

  // Texto board vazio
  emptyBoardText: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
    textAlign: 'center',              //......Centralizar texto
    marginBottom: 16,                 //......Margem inferior
  },

  // Botao board vazio
  emptyBoardButton: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    gap: 8,                           //......Espaco entre itens
    backgroundColor: COLORS.primary,  //......Fundo azul
    paddingHorizontal: 16,            //......Espaco horizontal
    paddingVertical: 10,              //......Espaco vertical
    borderRadius: 8,                  //......Arredondamento
  },

  // Texto botao board vazio
  emptyBoardButtonText: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.white,              //......Cor branca
  },
});
