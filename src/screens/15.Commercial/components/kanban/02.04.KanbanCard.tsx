// ========================================
// Componente KanbanCard
// Card individual do lead no Kanban
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
  Image,                              //......Imagem
  ScrollView,                         //......Scroll horizontal
} from 'react-native';                //......Biblioteca RN
import Svg, {                         //......Componentes SVG
  Path,                               //......Path do SVG
  G,                                  //......Grupo SVG
  ClipPath,                           //......Clip path
  Rect,                               //......Retangulo
  Defs,                               //......Definicoes
} from 'react-native-svg';            //......Biblioteca SVG

// ========================================
// Imports de Tipos
// ========================================
import {                              //......Tipos do commercial
  KanbanCard as KanbanCardType,       //......Interface de card
} from '../../types/commercial.types'; //......Arquivo de tipos

// ========================================
// Import da Imagem de Placeholder
// ========================================
const AvatarPlaceholder = require('../../../../../assets/AvatarPlaceholder02.png');

// ========================================
// Constantes de Cores
// ========================================
const COLORS = {
  primary: '#1777CF',                 //......Azul principal
  primaryLight: 'rgba(23, 119, 207, 0.05)', //..Azul claro 5%
  background: '#FFFFFF',              //......Fundo branco
  backgroundAlt: '#F4F4F4',           //......Fundo cinza
  backgroundCard: '#FAFAFA',          //......Fundo neutro
  textPrimary: '#3F4354',             //......Texto principal
  textSecondary: '#7D8592',           //......Texto secundario
  textMuted: '#A1A1AA',               //......Texto apagado
  border: '#D8E0F0',                  //......Borda padrao
  borderLight: '#E2E8F0',             //......Borda clara
  white: '#FFFFFF',                   //......Branco
};

// ========================================
// Icones SVG
// ========================================

// Icone de Relogio
const ClockIcon = () => (
  <Svg width={13} height={13} viewBox="0 0 13 13" fill="none">
    <Path
      d="M6.84596 3.18003C6.8113 2.88162 6.5577 2.65 6.25 2.65C5.91863 2.65 5.65 2.91863 5.65 3.25V6.4L5.65514 6.47849C5.68231 6.68484 5.81538 6.86476 6.00951 6.94969L8.40951 7.99969L8.47523 8.02404C8.76251 8.1119 9.07636 7.97239 9.19969 7.69049L9.22404 7.62477C9.3119 7.33749 9.17239 7.02364 8.89049 6.90031L6.85 6.0076V3.25L6.84596 3.18003Z"
      fill="#91929E"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6.25 0.25C2.93629 0.25 0.25 2.93629 0.25 6.25C0.25 9.56371 2.93629 12.25 6.25 12.25C9.56371 12.25 12.25 9.56371 12.25 6.25C12.25 2.93629 9.56371 0.25 6.25 0.25ZM6.25 1.45C8.90097 1.45 11.05 3.59903 11.05 6.25C11.05 8.90097 8.90097 11.05 6.25 11.05C3.59903 11.05 1.45 8.90097 1.45 6.25C1.45 3.59903 3.59903 1.45 6.25 1.45Z"
      fill="#91929E"
    />
  </Svg>
);

// Icone de Menu (3 pontos verticais)
const MenuDotsIcon = () => (
  <Svg width={4} height={18} viewBox="0 0 4 18" fill="none">
    <G clipPath="url(#clip0)">
      <Path
        d="M4 2C4 3.10457 3.10457 4 2 4C0.895431 4 0 3.10457 0 2C0 0.895431 0.895431 0 2 0C3.10457 0 4 0.895431 4 2Z"
        fill="#7D8592"
      />
      <Path
        d="M4 9C4 10.1046 3.10457 11 2 11C0.895431 11 0 10.1046 0 9C0 7.89543 0.895431 7 2 7C3.10457 7 4 7.89543 4 9Z"
        fill="#7D8592"
      />
      <Path
        d="M2 18C3.10457 18 4 17.1046 4 16C4 14.8954 3.10457 14 2 14C0.895431 14 0 14.8954 0 16C0 17.1046 0.895431 18 2 18Z"
        fill="#7D8592"
      />
    </G>
    <Defs>
      <ClipPath id="clip0">
        <Rect width={4} height={18} rx={2} fill="white" />
      </ClipPath>
    </Defs>
  </Svg>
);


// ========================================
// Interface de Props
// ========================================
interface KanbanCardProps {
  card: KanbanCardType;               //......Dados do card
  onPress: (card: KanbanCardType) => void; //..Callback info modal
  onChatPress?: (card: KanbanCardType) => void; //..Callback chat
  onLongPress?: (card: KanbanCardType) => void; //..Callback long press
  onMenuPress?: (card: KanbanCardType) => void; //..Callback menu
  isDragging?: boolean;               //......Se esta arrastando
}

// ========================================
// Funcoes Utilitarias
// ========================================

// Formatar data no padrao DD/MM/YY
const formatDate = (date: Date): string => {
  const d = new Date(date);           //......Criar objeto date
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear().toString().slice(-2);
  return `${day}/${month}/${year}`;   //......Retorna formatado
};

// Formatar horario no padrao HH:MM
const formatTime = (date: Date): string => {
  const d = new Date(date);           //......Criar objeto date
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;       //......Retorna formatado
};

// Formatar telefone no padrao (XX XXXXX-XXXX)
const formatPhone = (phone: string): string => {
  if (!phone) return '';              //......Retorna vazio
  let cleaned = phone.replace(/\D/g, '');

  // Remover codigo do pais (55) se existir
  if (cleaned.length === 13 && cleaned.startsWith('55')) {
    cleaned = cleaned.slice(2);       //......Remove 55 do inicio
  }

  // Formato com 11 digitos (DDD + 9 digitos)
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }

  // Formato com 10 digitos (DDD + 8 digitos)
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }

  return phone;                       //......Retorna original
};

// Obter nome do canal de entrada
const getChannelName = (card: KanbanCardType): string => {
  if (card.isWhatsAppContact) return 'WhatsApp';
  if (card.tags?.includes('instagram')) return 'Instagram';
  if (card.tags?.includes('facebook')) return 'Facebook';
  if (card.tags?.includes('linkedin')) return 'LinkedIn';
  if (card.tags?.includes('indicacao')) return 'Indicação';
  return 'Contato direto';            //......Padrao
};

// ========================================
// Componente KanbanCard (Memoizado)
// ========================================
const KanbanCardComponent: React.FC<KanbanCardProps> = ({
  card,                               //......Dados do card
  onPress,                            //......Callback info modal
  onChatPress,                        //......Callback chat
  onLongPress,                        //......Callback long press
  onMenuPress,                        //......Callback menu
  isDragging = false,                 //......Se esta arrastando
}) => {
  // ========================================
  // Memos
  // ========================================

  // Verificar se tem tags
  const hasTags = useMemo(() => (
    card.tags && card.tags.length > 0 && !card.tags.every(t => t === 'whatsapp')
  ), [card.tags]);

  // Filtrar tags para exibicao (excluir tag 'whatsapp')
  const displayTags = useMemo(() => (
    card.tags?.filter(t => t !== 'whatsapp') || []
  ), [card.tags]);

  // Data formatada
  const formattedDate = useMemo(() => (
    formatDate(card.enteredAt)
  ), [card.enteredAt]);

  // Horario formatado
  const formattedTime = useMemo(() => (
    formatTime(card.enteredAt)
  ), [card.enteredAt]);

  // Telefone formatado
  const formattedPhone = useMemo(() => (
    formatPhone(card.leadPhone || card.phoneNumber || '')
  ), [card.leadPhone, card.phoneNumber]);

  // Canal de entrada
  const channelName = useMemo(() => (
    getChannelName(card)
  ), [card]);

  // ========================================
  // Handlers
  // ========================================

  // Handler de press no container esquerdo (abre modal de info)
  const handleLeftPress = useCallback(() => {
    onPress(card);                    //......Abre modal info
  }, [card, onPress]);

  // Handler de press no container direito (abre chat)
  const handleRightPress = useCallback(() => {
    if (onChatPress) {
      onChatPress(card);              //......Abre chat
    }
  }, [card, onChatPress]);

  // Handler de long press
  const handleLongPress = useCallback(() => {
    if (onLongPress) {
      onLongPress(card);              //......Chamar callback
    }
  }, [card, onLongPress]);

  // Handler de menu press
  const handleMenuPress = useCallback(() => {
    if (onMenuPress) {
      onMenuPress(card);              //......Chamar callback
    }
  }, [card, onMenuPress]);

  // ========================================
  // Render
  // ========================================
  return (
    <View
      style={[
        styles.container,
        hasTags && styles.containerWithTags,
        isDragging && styles.containerDragging,
      ]}
    >
      {/* Container Esquerdo - Foto e Data/Hora */}
      <TouchableOpacity
        style={styles.leftContainer}
        onPress={handleLeftPress}
        onLongPress={handleLongPress}
        delayLongPress={200}
        activeOpacity={0.8}
      >
        <View style={styles.leftInner}>
          {/* Container da Foto */}
          <View style={styles.photoContainer}>
            {card.leadPhoto ? (
              <Image
                source={{ uri: card.leadPhoto }}
                style={styles.photo}
                resizeMode="cover"
              />
            ) : (
              <Image
                source={AvatarPlaceholder}
                style={styles.photo}
                resizeMode="cover"
              />
            )}
          </View>

          {/* Container Data e Hora */}
          <View style={styles.dateTimeContainer}>
            {/* Data */}
            <View style={styles.dateRow}>
              <Text style={styles.dateText}>{formattedDate}</Text>
            </View>

            {/* Separador */}
            <View style={styles.separatorSmall} />

            {/* Hora */}
            <View style={styles.timeRow}>
              <ClockIcon />
              <Text style={styles.timeText}>{formattedTime}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Container Direito - Informacoes */}
      <TouchableOpacity
        style={styles.rightContainer}
        onPress={handleRightPress}
        onLongPress={handleLongPress}
        delayLongPress={200}
        activeOpacity={0.8}
      >
        {/* Linha 1: Nome + Menu */}
        <View style={styles.nameRow}>
          <Text style={styles.nameText} numberOfLines={1}>
            {card.leadName}
          </Text>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={handleMenuPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MenuDotsIcon />
          </TouchableOpacity>
        </View>

        {/* Separador */}
        <View style={styles.separator} />

        {/* Linha 2: Telefone */}
        <View style={styles.infoRow}>
          <Text style={styles.infoText}>{formattedPhone || 'Sem telefone'}</Text>
        </View>

        {/* Separador */}
        <View style={styles.separator} />

        {/* Linha 3: Canal de Entrada */}
        <View style={styles.infoRow}>
          <Text style={styles.infoText}>{channelName}</Text>
        </View>

        {/* Separador */}
        <View style={styles.separator} />

        {/* Linha 4: Tags */}
        {displayTags.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tagsScroll}
            contentContainerStyle={styles.tagsContent}
          >
            {displayTags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.noTagsContainer}>
            <Text style={styles.noTagsText}>Nenhuma tag...</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

// ========================================
// Funcao de Comparacao para Memoizacao
// ========================================
const arePropsEqual = (
  prevProps: KanbanCardProps,         //......Props anteriores
  nextProps: KanbanCardProps,         //......Props novas
): boolean => {
  // Comparar ID do card
  if (prevProps.card.id !== nextProps.card.id) return false;

  // Comparar ultima mensagem
  if (prevProps.card.lastMessage !== nextProps.card.lastMessage) return false;

  // Comparar nome do lead
  if (prevProps.card.leadName !== nextProps.card.leadName) return false;

  // Comparar foto do lead
  if (prevProps.card.leadPhoto !== nextProps.card.leadPhoto) return false;

  // Comparar status de arraste
  if (prevProps.isDragging !== nextProps.isDragging) return false;

  // Comparar coluna
  if (prevProps.card.columnId !== nextProps.card.columnId) return false;

  // Comparar tags (shallow)
  const prevTags = prevProps.card.tags || [];
  const nextTags = nextProps.card.tags || [];
  if (prevTags.length !== nextTags.length) return false;

  // Props iguais, nao precisa re-render
  return true;
};

// ========================================
// Componente Memoizado
// ========================================
const KanbanCard = React.memo(KanbanCardComponent, arePropsEqual);

// ========================================
// Export Default
// ========================================
export default KanbanCard;

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container principal
  container: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centraliza vertical
    paddingLeft: 5,                   //......Padding esquerdo
    paddingRight: 10,                 //......Padding direito
    paddingVertical: 5,               //......Padding vertical
    backgroundColor: COLORS.white,    //......Fundo branco
    borderRadius: 8,                  //......Arredondamento
    borderWidth: 0.6,                 //......Largura borda
    borderColor: COLORS.borderLight,  //......Cor borda clara
    marginBottom: 10,                 //......Margem inferior
    gap: 12,                          //......Espaco entre containers
  },

  // Container com tags (destaque azul)
  containerWithTags: {
    backgroundColor: COLORS.primaryLight, //..Fundo azul claro
    borderColor: COLORS.primary,      //......Borda azul
  },

  // Container arrastando
  containerDragging: {
    opacity: 0.9,                     //......Opacidade reduzida
    transform: [{ scale: 1.02 }],     //......Escala maior
  },

  // Container esquerdo
  leftContainer: {
    width: 80,                        //......Largura fixa
    alignSelf: 'stretch',             //......Altura total
    borderRadius: 8,                  //......Arredondamento
    overflow: 'hidden',               //......Esconder overflow
  },

  // Inner do container esquerdo
  leftInner: {
    flex: 1,                          //......Ocupa espaco
    padding: 5,                       //......Padding interno
    backgroundColor: COLORS.backgroundAlt, //..Fundo cinza
    borderRadius: 8,                  //......Arredondamento
    borderWidth: 0.5,                 //......Largura borda
    borderColor: COLORS.borderLight,  //......Cor borda
    gap: 5,                           //......Espaco entre itens
  },

  // Container da foto
  photoContainer: {
    flex: 1,                          //......Ocupa espaco
    borderRadius: 6,                  //......Arredondamento
    overflow: 'hidden',               //......Esconder overflow
    backgroundColor: COLORS.backgroundCard, //..Fundo neutro
  },

  // Foto do lead
  photo: {
    width: '100%',                    //......Largura total
    height: '100%',                   //......Altura total
  },

  // Container data e hora
  dateTimeContainer: {
    height: 56,                       //......Altura fixa
    backgroundColor: COLORS.backgroundCard, //..Fundo neutro
    borderRadius: 8,                  //......Arredondamento
    justifyContent: 'center',         //......Centraliza vertical
    alignItems: 'center',             //......Centraliza horizontal
  },

  // Linha da data
  dateRow: {
    paddingVertical: 5,               //......Padding vertical
    alignItems: 'center',             //......Centraliza horizontal
  },

  // Texto da data
  dateText: {
    fontSize: 12,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte regular
    color: COLORS.textPrimary,        //......Cor texto
    textAlign: 'center',              //......Centraliza texto
  },

  // Separador pequeno
  separatorSmall: {
    width: '80%',                     //......Largura 80%
    height: 0.5,                      //......Altura fina
    backgroundColor: COLORS.borderLight, //...Cor borda
  },

  // Linha do horario
  timeRow: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centraliza vertical
    justifyContent: 'center',         //......Centraliza horizontal
    paddingVertical: 5,               //......Padding vertical
    gap: 5,                           //......Espaco entre itens
  },

  // Texto do horario
  timeText: {
    fontSize: 12,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte regular
    color: COLORS.textMuted,          //......Cor apagada
    textAlign: 'center',              //......Centraliza texto
  },

  // Container direito
  rightContainer: {
    flex: 1,                          //......Ocupa espaco
    paddingVertical: 5,               //......Padding vertical
    gap: 10,                          //......Espaco entre itens
  },

  // Linha do nome
  nameRow: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centraliza vertical
    justifyContent: 'space-between',  //......Espaco entre
  },

  // Texto do nome
  nameText: {
    flex: 1,                          //......Ocupa espaco
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_500Medium',    //......Fonte media
    color: COLORS.textPrimary,        //......Cor texto
  },

  // Botao de menu
  menuButton: {
    padding: 4,                       //......Padding
  },

  // Separador
  separator: {
    height: 0.5,                      //......Altura fina
    backgroundColor: COLORS.border,   //......Cor borda
  },

  // Linha de informacao
  infoRow: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centraliza vertical
  },

  // Texto de informacao
  infoText: {
    flex: 1,                          //......Ocupa espaco
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte regular
    color: COLORS.textPrimary,        //......Cor texto
  },

  // Scroll de tags
  tagsScroll: {
    flexGrow: 0,                      //......Nao cresce
  },

  // Conteudo das tags
  tagsContent: {
    flexDirection: 'row',             //......Layout horizontal
    gap: 8,                           //......Espaco entre tags
  },

  // Tag individual
  tag: {
    paddingHorizontal: 8,             //......Padding horizontal
    paddingVertical: 5,               //......Padding vertical
    backgroundColor: COLORS.primary,  //......Fundo azul
    borderRadius: 4,                  //......Arredondamento
  },

  // Texto da tag
  tagText: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte regular
    color: COLORS.white,              //......Cor branca
    textAlign: 'center',              //......Centraliza texto
  },

  // Container sem tags
  noTagsContainer: {
    paddingVertical: 5,               //......Padding vertical
  },

  // Texto sem tags
  noTagsText: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte regular
    color: COLORS.textMuted,          //......Cor apagada
  },
});
