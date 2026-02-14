// ========================================
// Componente ChannelFilters
// Filtros do canal de entrada
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, {                       //......React core
  useState,                           //......Hook de estado
  useCallback,                        //......Hook de callback
  useMemo,                            //......Hook de memorizacao
} from 'react';                       //......Biblioteca React
import {                              //......Componentes RN
  View,                               //......Container basico
  Text,                               //......Texto
  TouchableOpacity,                   //......Botao tocavel
  StyleSheet,                         //......Estilos
  TextInput,                          //......Campo de texto
  ScrollView,                         //......Scroll
} from 'react-native';                //......Biblioteca RN
import Svg, {                         //......Componentes SVG
  Path,                               //......Path do SVG
  Circle,                             //......Circulo SVG
} from 'react-native-svg';            //......Biblioteca SVG

// ========================================
// Imports de Tipos
// ========================================
import {
  ChannelType,                        //......Tipo de canal
  PeriodFilter,                       //......Tipo de periodo
} from '../../types/commercial.types';

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
  success: '#22C55E',                 //......Verde
  warning: '#F59E0B',                 //......Amarelo
  danger: '#EF4444',                  //......Vermelho
};

// ========================================
// Icones SVG
// ========================================

// Icone de busca
const SearchIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle
      cx={11}                         //......Centro X
      cy={11}                         //......Centro Y
      r={7}                           //......Raio
      stroke={COLORS.textSecondary}   //......Cor stroke
      strokeWidth={2}                 //......Espessura
    />
    <Path
      d="M21 21l-4-4"                 //......Linha diagonal
      stroke={COLORS.textSecondary}   //......Cor stroke
      strokeWidth={2}                 //......Espessura
      strokeLinecap="round"           //......Ponta arredondada
    />
  </Svg>
);

// Icone de limpar
const ClearIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6l12 12"
      stroke={COLORS.textSecondary}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

// ========================================
// Interface de Filtros
// ========================================
export interface ChannelFiltersState {
  searchText: string;                 //......Texto de busca
  channelType: ChannelType | null;    //......Tipo de canal
  period: PeriodFilter;               //......Periodo
}

// ========================================
// Interface de Props
// ========================================
interface ChannelFiltersProps {
  filters: ChannelFiltersState;       //......Filtros atuais
  onFiltersChange: (filters: ChannelFiltersState) => void;
  totalResults?: number;              //......Total de resultados
}

// ========================================
// Opcoes de Canal
// ========================================
const CHANNEL_OPTIONS: { value: ChannelType | null; label: string }[] = [
  { value: null, label: 'Todos' },
  { value: 'social_media', label: 'Redes Sociais' },
  { value: 'landing_page', label: 'Landing Pages' },
  { value: 'referral', label: 'Indicacoes' },
  { value: 'direct', label: 'Direto' },
  { value: 'other', label: 'Outros' },
];

// ========================================
// Opcoes de Periodo
// ========================================
const PERIOD_OPTIONS: { value: PeriodFilter; label: string }[] = [
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: '7 dias' },
  { value: 'month', label: '30 dias' },
  { value: 'quarter', label: '90 dias' },
  { value: 'year', label: 'Este ano' },
];

// ========================================
// Componente FilterChip
// ========================================
interface FilterChipProps {
  label: string;                      //......Label do chip
  selected: boolean;                  //......Se esta selecionado
  onPress: () => void;                //......Callback ao clicar
  color?: string;                     //......Cor opcional
}

const FilterChip: React.FC<FilterChipProps> = ({
  label,                              //......Label do chip
  selected,                           //......Se esta selecionado
  onPress,                            //......Callback ao clicar
  color,                              //......Cor opcional
}) => (
  <TouchableOpacity
    style={[
      styles.chip,
      selected && styles.chipSelected,
      selected && color && { backgroundColor: color },
    ]}
    onPress={onPress}
  >
    <Text
      style={[
        styles.chipText,
        selected && styles.chipTextSelected,
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

// ========================================
// Componente ChannelFilters
// ========================================
const ChannelFilters: React.FC<ChannelFiltersProps> = ({
  filters,                            //......Filtros atuais
  onFiltersChange,                    //......Callback de mudanca
  totalResults,                       //......Total de resultados
}) => {
  // ========================================
  // Handlers
  // ========================================

  // Handler de busca
  const handleSearchChange = useCallback((text: string) => {
    onFiltersChange({
      ...filters,                     //......Manter outros filtros
      searchText: text,               //......Atualizar busca
    });
  }, [filters, onFiltersChange]);

  // Handler de limpar busca
  const handleClearSearch = useCallback(() => {
    onFiltersChange({
      ...filters,                     //......Manter outros filtros
      searchText: '',                 //......Limpar busca
    });
  }, [filters, onFiltersChange]);

  // Handler de tipo de canal
  const handleChannelTypeChange = useCallback((type: ChannelType | null) => {
    onFiltersChange({
      ...filters,                     //......Manter outros filtros
      channelType: type,              //......Atualizar tipo
    });
  }, [filters, onFiltersChange]);

  // Handler de periodo
  const handlePeriodChange = useCallback((period: PeriodFilter) => {
    onFiltersChange({
      ...filters,                     //......Manter outros filtros
      period,                         //......Atualizar periodo
    });
  }, [filters, onFiltersChange]);

  // Handler de limpar tudo
  const handleClearAll = useCallback(() => {
    onFiltersChange({
      searchText: '',                 //......Limpar busca
      channelType: null,              //......Limpar tipo
      period: 'month',                //......Periodo padrao
    });
  }, [onFiltersChange]);

  // ========================================
  // Verificar se tem filtros ativos
  // ========================================
  const hasActiveFilters = useMemo(() => {
    return (
      filters.searchText.length > 0 ||
      filters.channelType !== null ||
      filters.period !== 'month'
    );
  }, [filters]);

  // ========================================
  // Render
  // ========================================
  return (
    <View style={styles.container}>
      {/* Campo de Busca */}
      <View style={styles.searchContainer}>
        <SearchIcon />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por lead ou canal..."
          placeholderTextColor={COLORS.textSecondary}
          value={filters.searchText}
          onChangeText={handleSearchChange}
        />
        {filters.searchText.length > 0 && (
          <TouchableOpacity onPress={handleClearSearch}>
            <ClearIcon />
          </TouchableOpacity>
        )}
      </View>

      {/* Filtros de Tipo de Canal */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Tipo de Canal</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chipsContainer}
        >
          {CHANNEL_OPTIONS.map(option => (
            <FilterChip
              key={option.value || 'all'}
              label={option.label}
              selected={filters.channelType === option.value}
              onPress={() => handleChannelTypeChange(option.value)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Filtros de Periodo */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Periodo</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chipsContainer}
        >
          {PERIOD_OPTIONS.map(option => (
            <FilterChip
              key={option.value}
              label={option.label}
              selected={filters.period === option.value}
              onPress={() => handlePeriodChange(option.value)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Footer com Resultados */}
      <View style={styles.footer}>
        <Text style={styles.resultsText}>
          {totalResults !== undefined
            ? `${totalResults} resultado${totalResults !== 1 ? 's' : ''}`
            : 'Carregando...'}
        </Text>
        {hasActiveFilters && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearAll}
          >
            <Text style={styles.clearButtonText}>Limpar filtros</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// ========================================
// Export Default
// ========================================
export default ChannelFilters;

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container principal
  container: {
    backgroundColor: COLORS.background, //....Fundo branco
    borderRadius: 12,                 //......Arredondamento
    borderWidth: 1,                   //......Largura borda
    borderColor: COLORS.border,       //......Cor borda
    padding: 16,                      //......Espaco interno
    gap: 16,                          //......Espaco entre
  },

  // Container de busca
  searchContainer: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    backgroundColor: COLORS.backgroundAlt, //..Fundo cinza
    borderRadius: 8,                  //......Arredondamento
    paddingHorizontal: 12,            //......Espaco horizontal
    paddingVertical: 10,              //......Espaco vertical
    gap: 8,                           //......Espaco entre
  },

  // Input de busca
  searchInput: {
    flex: 1,                          //......Ocupar espaco
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textPrimary,        //......Cor primaria
    padding: 0,                       //......Sem padding
  },

  // Secao de filtro
  filterSection: {
    gap: 8,                           //......Espaco entre
  },

  // Label do filtro
  filterLabel: {
    fontSize: 12,                     //......Tamanho fonte
    fontFamily: 'Inter_500Medium',    //......Fonte Inter Medium
    color: COLORS.textSecondary,      //......Cor secundaria
    textTransform: 'uppercase',       //......Maiusculas
  },

  // Scroll de chips
  chipsScroll: {
    marginHorizontal: -16,            //......Compensar padding
  },

  // Container de chips
  chipsContainer: {
    paddingHorizontal: 16,            //......Restaurar padding
    gap: 8,                           //......Espaco entre
  },

  // Chip
  chip: {
    paddingHorizontal: 14,            //......Espaco horizontal
    paddingVertical: 8,               //......Espaco vertical
    borderRadius: 16,                 //......Arredondamento
    backgroundColor: COLORS.backgroundAlt, //..Fundo cinza
    borderWidth: 1,                   //......Largura borda
    borderColor: COLORS.border,       //......Cor borda
  },

  // Chip selecionado
  chipSelected: {
    backgroundColor: COLORS.primary,  //......Fundo azul
    borderColor: COLORS.primary,      //......Borda azul
  },

  // Texto do chip
  chipText: {
    fontSize: 13,                     //......Tamanho fonte
    fontFamily: 'Inter_500Medium',    //......Fonte Inter Medium
    color: COLORS.textSecondary,      //......Cor secundaria
  },

  // Texto chip selecionado
  chipTextSelected: {
    color: '#FFFFFF',                 //......Cor branca
  },

  // Footer
  footer: {
    flexDirection: 'row',             //......Layout horizontal
    justifyContent: 'space-between',  //......Espaco entre
    alignItems: 'center',             //......Centralizar vertical
    paddingTop: 8,                    //......Espaco superior
    borderTopWidth: 1,                //......Borda superior
    borderTopColor: COLORS.border,    //......Cor da borda
  },

  // Texto de resultados
  resultsText: {
    fontSize: 13,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
  },

  // Botao limpar
  clearButton: {
    paddingHorizontal: 12,            //......Espaco horizontal
    paddingVertical: 6,               //......Espaco vertical
  },

  // Texto botao limpar
  clearButtonText: {
    fontSize: 13,                     //......Tamanho fonte
    fontFamily: 'Inter_500Medium',    //......Fonte Inter Medium
    color: COLORS.primary,            //......Cor primaria
  },
});
