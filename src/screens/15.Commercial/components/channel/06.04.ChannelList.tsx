// ========================================
// Componente ChannelList
// Lista de entradas de canais
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, {                       //......React core
  useCallback,                        //......Hook de callback
} from 'react';                       //......Biblioteca React
import {                              //......Componentes RN
  View,                               //......Container basico
  Text,                               //......Texto
  FlatList,                           //......Lista otimizada
  StyleSheet,                         //......Estilos
  ListRenderItem,                     //......Tipo renderizador
  RefreshControl,                     //......Controle de refresh
} from 'react-native';                //......Biblioteca RN

// ========================================
// Imports de Tipos
// ========================================
import { ChannelEntry } from '../../types/commercial.types';

// ========================================
// Imports de Componentes
// ========================================
import ChannelEntryCard from './06.01.ChannelEntryCard';

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
};

// ========================================
// Interface de Props
// ========================================
interface ChannelListProps {
  entries: ChannelEntry[];            //......Lista de entradas
  leadNames?: Record<string, string>; //......Mapa de nomes
  onEntryPress?: (entry: ChannelEntry) => void;
  onEntryEdit?: (entry: ChannelEntry) => void;
  isLoading?: boolean;                //......Estado de loading
  onRefresh?: () => void;             //......Callback de refresh
}

// ========================================
// Componente EmptyState
// ========================================
const EmptyState: React.FC = () => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyTitle}>Nenhuma entrada encontrada</Text>
    <Text style={styles.emptyText}>
      As entradas de leads aparecerao aqui quando houver registros.
    </Text>
  </View>
);

// ========================================
// Componente ChannelList
// ========================================
const ChannelList: React.FC<ChannelListProps> = ({
  entries,                            //......Lista de entradas
  leadNames = {},                     //......Mapa de nomes
  onEntryPress,                       //......Callback press
  onEntryEdit,                        //......Callback edit
  isLoading = false,                  //......Estado de loading
  onRefresh,                          //......Callback de refresh
}) => {
  // ========================================
  // Render Item
  // ========================================
  const renderItem: ListRenderItem<ChannelEntry> = useCallback(({ item }) => (
    <ChannelEntryCard
      entry={item}
      leadName={leadNames[item.leadId]}
      onPress={() => onEntryPress?.(item)}
      onEdit={() => onEntryEdit?.(item)}
    />
  ), [leadNames, onEntryPress, onEntryEdit]);

  // ========================================
  // Key Extractor
  // ========================================
  const keyExtractor = useCallback((item: ChannelEntry) => item.id, []);

  // ========================================
  // Separador
  // ========================================
  const ItemSeparator = useCallback(() => (
    <View style={styles.separator} />
  ), []);

  // ========================================
  // Render
  // ========================================
  return (
    <FlatList
      data={entries}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ItemSeparatorComponent={ItemSeparator}
      ListEmptyComponent={EmptyState}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        ) : undefined
      }
    />
  );
};

// ========================================
// Export Default
// ========================================
export default ChannelList;

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Conteudo da lista
  listContent: {
    flexGrow: 1,                      //......Crescer
    paddingVertical: 8,               //......Espaco vertical
  },

  // Separador
  separator: {
    height: 12,                       //......Altura
  },

  // Estado vazio
  emptyState: {
    flex: 1,                          //......Ocupar espaco
    alignItems: 'center',             //......Centralizar horizontal
    justifyContent: 'center',         //......Centralizar vertical
    paddingVertical: 60,              //......Espaco vertical
    paddingHorizontal: 20,            //......Espaco horizontal
  },

  // Titulo estado vazio
  emptyTitle: {
    fontSize: 16,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.textPrimary,        //......Cor primaria
    marginBottom: 8,                  //......Margem inferior
    textAlign: 'center',              //......Centralizado
  },

  // Texto estado vazio
  emptyText: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
    textAlign: 'center',              //......Centralizado
    lineHeight: 20,                   //......Altura linha
  },
});
