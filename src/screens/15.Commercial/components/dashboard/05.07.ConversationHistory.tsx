// ========================================
// Componente ConversationHistory
// Historico de conversas com a IA
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
  FlatList,                           //......Lista otimizada
  TextInput,                          //......Campo de texto
  ListRenderItem,                     //......Tipo renderizador
} from 'react-native';                //......Biblioteca RN
import Svg, {                         //......Componentes SVG
  Path,                               //......Path do SVG
  Circle,                             //......Circulo SVG
} from 'react-native-svg';            //......Biblioteca SVG

// ========================================
// Imports de Tipos
// ========================================
import { AIMessage } from '../../types/ai.types';

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

// Icone de usuario
const UserIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle
      cx={12}                         //......Centro X
      cy={8}                          //......Centro Y
      r={4}                           //......Raio
      fill={COLORS.textSecondary}     //......Cor preenchimento
    />
    <Path
      d="M4 20c0-4 4-6 8-6s8 2 8 6"   //......Corpo
      fill={COLORS.textSecondary}     //......Cor preenchimento
    />
  </Svg>
);

// Icone de IA
const AIIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle
      cx={12}                         //......Centro X
      cy={12}                         //......Centro Y
      r={10}                          //......Raio
      fill={COLORS.primary}           //......Cor azul
    />
    <Path
      d="M8 12h8M12 8v8"              //......Cruz
      stroke="#FFFFFF"                //......Cor branca
      strokeWidth={2}                 //......Espessura
      strokeLinecap="round"           //......Ponta arredondada
    />
  </Svg>
);

// ========================================
// Interface de Props
// ========================================
interface ConversationHistoryProps {
  messages?: AIMessage[];             //......Mensagens do historico
  onConversationPress?: (id: string) => void;
  maxItems?: number;                  //......Maximo de items
  showSearch?: boolean;               //......Mostrar busca
  title?: string;                     //......Titulo
}

// ========================================
// Componente ConversationItem
// ========================================
interface ConversationItemProps {
  message: AIMessage;                 //......Dados da mensagem
  onPress?: () => void;               //......Callback ao clicar
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  message,                            //......Dados da mensagem
  onPress,                            //......Callback ao clicar
}) => {
  // ========================================
  // Formatar Data
  // ========================================
  const formattedDate = useMemo(() => {
    const date = new Date(message.timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return `Hoje ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } else if (days === 1) {
      return 'Ontem';                 //......Ontem
    } else if (days < 7) {
      return `${days} dias atras`;    //......Dias atras
    } else {
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }
  }, [message.timestamp]);

  // ========================================
  // Truncar Texto
  // ========================================
  const truncatedContent = useMemo(() => {
    const maxLength = 80;             //......Limite de caracteres
    if (message.content.length <= maxLength) {
      return message.content;         //......Retornar completo
    }
    return `${message.content.substring(0, maxLength)}...`;
  }, [message.content]);

  // ========================================
  // Render
  // ========================================
  return (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View style={[
        styles.avatar,
        message.isFromAI && styles.avatarAI,
      ]}>
        {message.isFromAI ? <AIIcon /> : <UserIcon />}
      </View>

      {/* Conteudo */}
      <View style={styles.itemContent}>
        {/* Header */}
        <View style={styles.itemHeader}>
          <Text style={styles.itemSender}>
            {message.isFromAI ? 'Assistente IA' : 'Voce'}
          </Text>
          <Text style={styles.itemDate}>{formattedDate}</Text>
        </View>

        {/* Mensagem */}
        <Text style={styles.itemMessage} numberOfLines={2}>
          {truncatedContent}
        </Text>

        {/* Badges */}
        <View style={styles.badgesContainer}>
          {message.isFromAI && (
            <View style={styles.badgeAI}>
              <Text style={styles.badgeText}>IA</Text>
            </View>
          )}
          {message.audioUri && (
            <View style={styles.badgeAudio}>
              <Text style={styles.badgeText}>Audio</Text>
            </View>
          )}
          {message.confirmed && (
            <View style={styles.badgeConfirmed}>
              <Text style={styles.badgeTextConfirmed}>Confirmado</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ========================================
// Componente ConversationHistory
// ========================================
const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  messages = [],                      //......Mensagens do historico
  onConversationPress,                //......Callback ao clicar
  maxItems = 10,                      //......Maximo de items
  showSearch = true,                  //......Mostrar busca
  title = 'Historico de Conversas',   //......Titulo padrao
}) => {
  // ========================================
  // Estados
  // ========================================
  const [searchText, setSearchText] = useState('');

  // ========================================
  // Mensagens Filtradas
  // ========================================
  const filteredMessages = useMemo(() => {
    let result = [...messages];       //......Copiar array

    // Filtrar por busca
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      result = result.filter(msg =>
        msg.content.toLowerCase().includes(search)
      );
    }

    // Ordenar por data (mais recente primeiro)
    result.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Limitar quantidade
    return result.slice(0, maxItems); //......Limitar items
  }, [messages, searchText, maxItems]);

  // ========================================
  // Handler de Clique
  // ========================================
  const handleItemPress = useCallback((id: string) => {
    onConversationPress?.(id);        //......Chamar callback
  }, [onConversationPress]);

  // ========================================
  // Render Item
  // ========================================
  const renderItem: ListRenderItem<AIMessage> = useCallback(({ item }) => (
    <ConversationItem
      message={item}
      onPress={() => handleItemPress(item.id)}
    />
  ), [handleItemPress]);

  // ========================================
  // Key Extractor
  // ========================================
  const keyExtractor = useCallback((item: AIMessage) => item.id, []);

  // ========================================
  // Separador
  // ========================================
  const ItemSeparator = useCallback(() => (
    <View style={styles.separator} />
  ), []);

  // ========================================
  // Empty State
  // ========================================
  const EmptyComponent = useCallback(() => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>
        {searchText
          ? 'Nenhuma conversa encontrada'
          : 'Nenhuma conversa ainda'}
      </Text>
    </View>
  ), [searchText]);

  // ========================================
  // Render
  // ========================================
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>
          {filteredMessages.length} conversa{filteredMessages.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Busca */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <SearchIcon />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar conversas..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      )}

      {/* Lista */}
      <FlatList
        data={filteredMessages}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={ItemSeparator}
        ListEmptyComponent={EmptyComponent}
        scrollEnabled={false}
        style={styles.list}
      />

      {/* Ver Todos */}
      {messages.length > maxItems && (
        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>
            Ver todas ({messages.length})
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ========================================
// Export Default
// ========================================
export default ConversationHistory;

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
  },

  // Header
  header: {
    flexDirection: 'row',             //......Layout horizontal
    justifyContent: 'space-between',  //......Espaco entre
    alignItems: 'center',             //......Centralizar vertical
    marginBottom: 16,                 //......Margem inferior
  },

  // Titulo
  title: {
    fontSize: 16,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.textPrimary,        //......Cor primaria
  },

  // Subtitulo
  subtitle: {
    fontSize: 12,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
  },

  // Container de busca
  searchContainer: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    backgroundColor: COLORS.backgroundAlt, //..Fundo cinza
    borderRadius: 8,                  //......Arredondamento
    paddingHorizontal: 12,            //......Espaco horizontal
    paddingVertical: 8,               //......Espaco vertical
    marginBottom: 16,                 //......Margem inferior
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

  // Lista
  list: {
    maxHeight: 400,                   //......Altura maxima
  },

  // Container do item
  itemContainer: {
    flexDirection: 'row',             //......Layout horizontal
    gap: 12,                          //......Espaco entre
    paddingVertical: 12,              //......Espaco vertical
  },

  // Avatar
  avatar: {
    width: 40,                        //......Largura
    height: 40,                       //......Altura
    borderRadius: 20,                 //......Arredondamento
    backgroundColor: COLORS.backgroundAlt, //..Fundo cinza
    justifyContent: 'center',         //......Centralizar vertical
    alignItems: 'center',             //......Centralizar horizontal
  },

  // Avatar IA
  avatarAI: {
    backgroundColor: COLORS.primary + '20', //..Fundo azul claro
  },

  // Conteudo do item
  itemContent: {
    flex: 1,                          //......Ocupar espaco
    gap: 4,                           //......Espaco entre
  },

  // Header do item
  itemHeader: {
    flexDirection: 'row',             //......Layout horizontal
    justifyContent: 'space-between',  //......Espaco entre
    alignItems: 'center',             //......Centralizar vertical
  },

  // Sender do item
  itemSender: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_500Medium',    //......Fonte Inter Medium
    color: COLORS.textPrimary,        //......Cor primaria
  },

  // Data do item
  itemDate: {
    fontSize: 11,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
  },

  // Mensagem do item
  itemMessage: {
    fontSize: 13,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
    lineHeight: 18,                   //......Altura linha
  },

  // Container de badges
  badgesContainer: {
    flexDirection: 'row',             //......Layout horizontal
    gap: 6,                           //......Espaco entre
    marginTop: 4,                     //......Margem superior
  },

  // Badge IA
  badgeAI: {
    backgroundColor: COLORS.primary,  //......Fundo azul
    paddingHorizontal: 6,             //......Espaco horizontal
    paddingVertical: 2,               //......Espaco vertical
    borderRadius: 4,                  //......Arredondamento
  },

  // Badge Audio
  badgeAudio: {
    backgroundColor: COLORS.textSecondary, //..Fundo cinza
    paddingHorizontal: 6,             //......Espaco horizontal
    paddingVertical: 2,               //......Espaco vertical
    borderRadius: 4,                  //......Arredondamento
  },

  // Badge Confirmado
  badgeConfirmed: {
    backgroundColor: COLORS.success + '20', //..Fundo verde claro
    paddingHorizontal: 6,             //......Espaco horizontal
    paddingVertical: 2,               //......Espaco vertical
    borderRadius: 4,                  //......Arredondamento
  },

  // Texto badge
  badgeText: {
    fontSize: 10,                     //......Tamanho fonte
    fontFamily: 'Inter_500Medium',    //......Fonte Inter Medium
    color: '#FFFFFF',                 //......Cor branca
  },

  // Texto badge confirmado
  badgeTextConfirmed: {
    fontSize: 10,                     //......Tamanho fonte
    fontFamily: 'Inter_500Medium',    //......Fonte Inter Medium
    color: COLORS.success,            //......Cor verde
  },

  // Separador
  separator: {
    height: 1,                        //......Altura
    backgroundColor: COLORS.border,   //......Cor da borda
  },

  // Estado vazio
  emptyState: {
    alignItems: 'center',             //......Centralizar horizontal
    justifyContent: 'center',         //......Centralizar vertical
    paddingVertical: 40,              //......Espaco vertical
  },

  // Texto estado vazio
  emptyText: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
  },

  // Botao ver todos
  viewAllButton: {
    alignItems: 'center',             //......Centralizar horizontal
    paddingVertical: 12,              //......Espaco vertical
    marginTop: 8,                     //......Margem superior
    borderTopWidth: 1,                //......Borda superior
    borderTopColor: COLORS.border,    //......Cor da borda
  },

  // Texto ver todos
  viewAllText: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_500Medium',    //......Fonte Inter Medium
    color: COLORS.primary,            //......Cor primaria
  },
});
