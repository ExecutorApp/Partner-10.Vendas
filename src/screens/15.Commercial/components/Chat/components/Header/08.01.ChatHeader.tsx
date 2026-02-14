// ========================================
// Componente ChatHeader
// Header do chat com info do lead
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, { useState } from 'react';  //......React core + estado
import {                                  //......Componentes RN
  View,                                   //......Container basico
  Text,                                   //......Texto
  StyleSheet,                             //......Estilos
  Pressable,                              //......Toque
  Image,                                  //......Imagem
} from 'react-native';                    //......Biblioteca RN
import Svg, {                             //......SVG core
  Path,                                   //......Path SVG
} from 'react-native-svg';                //......Biblioteca SVG

// ========================================
// Imports de Cores e Temas
// ========================================
import { ChatColors } from '../../styles/08.ChatColors';
import { useTheme } from '../../styles/themes/ThemeContext';

// ========================================
// Imports de Tipos
// ========================================
import { ChatInfo } from '../../types/08.types.whatsapp';

// ========================================
// Import do Contexto da Lola
// ========================================
import { useLolaAvatar } from '../../../../contexts/LolaAvatarContext';

// ========================================
// Interface de Props
// ========================================
interface ChatHeaderProps {
  chatInfo: ChatInfo;                     //......Info do chat
  activeScreen?: 'lead' | 'lola';         //......Tela ativa
  onBackPress: () => void;                //......Handler voltar
  onProfilePress?: () => void;            //......Handler perfil
  onMenuPress?: () => void;               //......Handler menu
}

// ========================================
// Icone de Voltar
// ========================================
const BackIcon: React.FC<{ color: string; size: number }> = ({
  color,                                  //......Cor
  size,                                   //......Tamanho
}) => (
  <Svg                                    //......SVG container
    width={size}                          //......Largura
    height={size}                         //......Altura
    viewBox="0 0 24 24"                   //......ViewBox
    fill="none"                           //......Sem preenchimento
  >
    <Path                                 //......Seta voltar
      d="M15 18L9 12L15 6"                //......Desenho seta
      stroke={color}                      //......Cor da linha
      strokeWidth={2}                     //......Espessura
      strokeLinecap="round"               //......Ponta arredondada
      strokeLinejoin="round"              //......Junção arredondada
    />
  </Svg>
);

// ========================================
// Icone de Menu (3 pontos)
// ========================================
const MenuIcon: React.FC<{ color: string; size: number }> = ({
  color,                                  //......Cor
  size,                                   //......Tamanho
}) => (
  <Svg                                    //......SVG container
    width={size}                          //......Largura
    height={size}                         //......Altura
    viewBox="0 0 24 24"                   //......ViewBox
    fill="none"                           //......Sem preenchimento
  >
    <Path                                 //......Ponto 1
      d="M12 5V5.01"                      //......Desenho ponto
      stroke={color}                      //......Cor da linha
      strokeWidth={3}                     //......Espessura
      strokeLinecap="round"               //......Ponta arredondada
    />
    <Path                                 //......Ponto 2
      d="M12 12V12.01"                    //......Desenho ponto
      stroke={color}                      //......Cor da linha
      strokeWidth={3}                     //......Espessura
      strokeLinecap="round"               //......Ponta arredondada
    />
    <Path                                 //......Ponto 3
      d="M12 19V19.01"                    //......Desenho ponto
      stroke={color}                      //......Cor da linha
      strokeWidth={3}                     //......Espessura
      strokeLinecap="round"               //......Ponta arredondada
    />
  </Svg>
);

// ========================================
// Icone de Avatar Padrao (fallback)
// ========================================
const DefaultAvatarIcon: React.FC<{ size: number }> = ({ size }) => (
  <Svg
    width={size}                          //......Largura
    height={size}                         //......Altura
    viewBox="0 0 24 24"                   //......ViewBox
    fill="none"                           //......Sem preenchimento
  >
    <Path
      d="M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM9 14a5 5 0 0 0-5 5v3h16v-3a5 5 0 0 0-5-5z"
      fill="#9E9E9E"                      //......Cor cinza escuro
    />
  </Svg>
);

// ========================================
// Componente Avatar
// ========================================
const Avatar: React.FC<{
  photo?: string;                         //......URL da foto
  isOnline: boolean;                      //......Se esta online
}> = ({ photo, isOnline }) => {
  const [imgError, setImgError] = useState(false); //......Erro ao carregar foto
  const showPhoto = photo && !imgError;   //......Mostrar foto se URL valida

  return (
    <View style={styles.avatarContainer}>
      {/* Imagem ou Avatar Padrao (fallback se URL expirou/404) */}
      {showPhoto ? (
        <Image                            //......Foto do lead
          source={{ uri: photo }}         //......URL
          style={styles.avatarImage}      //......Estilo
          onError={() => setImgError(true)} //......Fallback se 404/expirada
        />
      ) : (
        <View style={styles.avatarFallback}>
          <DefaultAvatarIcon size={26} />
        </View>
      )}

      {/* Indicador Online */}
      {isOnline && (
        <View style={styles.onlineIndicator} />
      )}
    </View>
  );
};

// ========================================
// Componente Principal ChatHeader
// ========================================
const ChatHeader: React.FC<ChatHeaderProps> = ({
  chatInfo,                               //......Info do chat
  activeScreen = 'lead',                  //......Tela ativa (padrao: lead)
  onBackPress,                            //......Handler voltar
  onProfilePress,                         //......Handler perfil
  onMenuPress,                            //......Handler menu
}) => {
  // ========================================
  // Contexto do Tema
  // ========================================
  const { colors } = useTheme();

  // ========================================
  // Contexto da Lola
  // ========================================
  const { state: lolaState, handleTap: handleLolaExpand } = useLolaAvatar();

  // ========================================
  // Avatar da Lola visivel apenas no estado header (em ambas as telas)
  // ========================================
  const showLolaInHeader = lolaState === 'header';

  // ========================================
  // Verificar se esta na tela da Lola
  // ========================================
  const isLolaScreen = activeScreen === 'lola';

  // ========================================
  // Formatar Status
  // ========================================
  const getStatusText = (): string => {
    // Se estiver na tela da Lola, mostra status fixo
    if (isLolaScreen) {
      return 'Assistente Pessoal';        //......Status Lola
    }

    if (chatInfo.isTyping) {
      return 'digitando...';              //......Digitando
    }
    if (chatInfo.isOnline) {
      return 'online';                    //......Online
    }
    if (chatInfo.lastSeen) {
      const lastSeenDate = new Date(chatInfo.lastSeen);
      const now = new Date();
      const diffMs = now.getTime() - lastSeenDate.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) {
        return 'visto agora';             //......Agora
      }
      if (diffMins < 60) {
        return `visto há ${diffMins} min`; //......Minutos
      }
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) {
        return `visto há ${diffHours}h`;  //......Horas
      }
      return `visto ${lastSeenDate.toLocaleDateString('pt-BR')}`;
    }
    return '';                            //......Vazio
  };

  // ========================================
  // Render Principal
  // ========================================
  return (
    <View style={[
      styles.container,                   //......Estilo base
      styles.containerWithShadow,         //......Sombra padrao
      { backgroundColor: colors.headerBackground },
    ]}>
      {/* Botao Voltar */}
      <Pressable
        style={styles.backButton}         //......Estilo botao
        onPress={onBackPress}             //......Handler
        hitSlop={12}                      //......Area de toque
      >
        <BackIcon
          color={colors.headerIcon}       //......Cor dinamica
          size={24}                        //......Tamanho
        />
      </Pressable>

      {/* Area do Perfil */}
      <Pressable
        style={styles.profileArea}        //......Estilo area
        onPress={onProfilePress}          //......Handler
      >
        {/* Avatar - Lola ou Lead */}
        {isLolaScreen ? (
          <View style={styles.lolaAvatarContainer}>
            <Image
              source={require('../../../../../../assets/lola-visemes/lola-rest.png')}
              style={styles.lolaAvatarImage}
            />
          </View>
        ) : (
          <Avatar
            photo={chatInfo.leadPhoto}    //......Foto
            isOnline={chatInfo.isOnline}  //......Online
          />
        )}

        {/* Info do Lead ou Lola */}
        <View style={styles.infoContainer}>
          {/* Nome */}
          <Text
            style={[
              styles.nameText,            //......Estilo nome
              { color: colors.headerText },
            ]}
            numberOfLines={1}             //......Uma linha
          >
            {isLolaScreen ? 'Lola' : chatInfo.leadName}
          </Text>

          {/* Status */}
          <Text
            style={[
              styles.statusText,          //......Estilo status
              { color: 'rgba(31,44,52,0.6)' },
              chatInfo.isTyping && !isLolaScreen && styles.typingText,
            ]}
            numberOfLines={1}             //......Uma linha
          >
            {getStatusText()}
          </Text>
        </View>
      </Pressable>

      {/* Botao IA (Lola) - Foto circular */}
      {/* Visivel apenas quando Lola esta no estado header */}
      {showLolaInHeader && (
        <Pressable
          style={styles.aiButton}         //......Estilo botao
          onPress={handleLolaExpand}      //......Expande avatar flutuante
          hitSlop={8}                     //......Area de toque
        >
          <Image
            source={require('../../../../../../assets/lola-visemes/lola-rest.png')}
            style={styles.aiAvatar}       //......Estilo avatar
          />
        </Pressable>
      )}

      {/* Botao Menu */}
      <Pressable
        style={styles.menuButton}         //......Estilo botao
        onPress={onMenuPress}             //......Handler
        hitSlop={12}                      //......Area de toque
      >
        <MenuIcon
          color={colors.headerIcon}       //......Cor dinamica
          size={24}                        //......Tamanho
        />
      </Pressable>
    </View>
  );
};

// ========================================
// Export Default
// ========================================
export default ChatHeader;

// ========================================
// Estilos
// ========================================

// ========================================
// AJUSTE MANUAL DA ALTURA DO HEADER AZUL
// Modifique os valores abaixo para alterar a altura
// ========================================
const HEADER_PADDING_TOP = 15;            //......Padding superior (era 12, aumentado 3px)
const HEADER_PADDING_BOTTOM = 15;         //......Padding inferior

const styles = StyleSheet.create({
  // Container principal
  container: {
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    paddingTop: HEADER_PADDING_TOP,       //......Padding superior (ajuste acima)
    paddingBottom: HEADER_PADDING_BOTTOM, //......Padding inferior (ajuste acima)
    paddingHorizontal: 8,                 //......Padding horizontal
    overflow: 'visible',                  //......Permite elementos filhos sairem do container
    zIndex: 10,                           //......Garante que header fique acima
  },

  // Container com sombra suave (Tema 3)
  // Sombra estilo WhatsApp para separacao visual do conteudo
  containerWithShadow: {
    shadowColor: '#000',                  //......Cor da sombra
    shadowOffset: { width: 0, height: 2 },//......Offset vertical
    shadowOpacity: 0.12,                  //......Opacidade suave
    shadowRadius: 3,                      //......Raio da sombra
    elevation: 3,                         //......Elevacao Android
  },

  // Botao voltar
  backButton: {
    width: 40,                            //......Largura
    height: 40,                           //......Altura
    justifyContent: 'center',             //......Centraliza vertical
    alignItems: 'center',                 //......Centraliza horizontal
  },

  // Area do perfil
  profileArea: {
    flex: 1,                              //......Ocupa espaco
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    paddingHorizontal: 4,                 //......Padding horizontal
  },

  // Container do avatar
  avatarContainer: {
    width: 44,                            //......Largura
    height: 44,                           //......Altura
    position: 'relative',                 //......Posicao relativa
  },

  // Imagem do avatar (quadrado com bordas arredondadas)
  avatarImage: {
    width: 44,                            //......Largura
    height: 44,                           //......Altura
    borderRadius: 8,                      //......Bordas levemente arredondadas
  },

  // Container do avatar da Lola (mesmo padrao do lead)
  lolaAvatarContainer: {
    width: 44,                            //......Largura (igual ao lead)
    height: 44,                           //......Altura (igual ao lead)
    borderRadius: 8,                      //......Bordas arredondadas (igual ao lead)
    borderWidth: 0.5,                     //......Borda ultra fina
    borderColor: '#D0D0D0',               //......Borda cinza claro
    backgroundColor: '#FFFFFF',           //......Fundo branco clean
    overflow: 'hidden',                   //......Esconde overflow
    position: 'relative',                 //......Posicao relativa
  },

  // Imagem do avatar da Lola (apenas rosto, ajustado no container)
  lolaAvatarImage: {
    width: 55,                            //......Largura reduzida para mostrar cabeca completa
    height: 75,                           //......Altura reduzida para mostrar cabeca completa
    marginTop: -5,                        //......Ajuste vertical para centralizar rosto
    marginLeft: -6,                       //......Ajuste horizontal para centralizar rosto
  },

  // Fallback do avatar (quando nao tem foto)
  avatarFallback: {
    width: 44,                            //......Largura
    height: 44,                           //......Altura
    borderRadius: 8,                      //......Bordas arredondadas
    backgroundColor: '#F0F0F0',           //......Fundo cinza muito claro
    borderWidth: 0.5,                     //......Borda ultra fina
    borderColor: '#D0D0D0',               //......Borda cinza claro
    justifyContent: 'center',             //......Centraliza vertical
    alignItems: 'center',                 //......Centraliza horizontal
  },

  // Indicador online
  onlineIndicator: {
    position: 'absolute',                 //......Posicao absoluta
    bottom: 0,                            //......Alinha embaixo
    right: 0,                             //......Alinha direita
    width: 14,                            //......Largura
    height: 14,                           //......Altura
    borderRadius: 7,                      //......Circular
    backgroundColor: ChatColors.online,   //......Verde
    borderWidth: 2,                       //......Borda
    borderColor: ChatColors.headerBackground,
  },

  // Container das infos
  infoContainer: {
    flex: 1,                              //......Ocupa espaco
    marginLeft: 12,                       //......Margem esquerda
  },

  // Texto do nome
  nameText: {
    fontFamily: 'Inter_600SemiBold',      //......Fonte bold
    fontSize: 16,                         //......Tamanho fonte
    color: ChatColors.headerText,         //......Cor branca
  },

  // Texto do status
  statusText: {
    fontFamily: 'Inter_400Regular',       //......Fonte regular
    fontSize: 13,                         //......Tamanho fonte
    color: 'rgba(255,255,255,0.7)',       //......Cor clara
    marginTop: 2,                         //......Margem superior
  },

  // Texto digitando
  typingText: {
    color: ChatColors.white,              //......Cor branca
    fontFamily: 'Inter_500Medium',        //......Fonte media
  },

  // ========================================
  // CONFIGURACAO DO AVATAR DA IA (LOLA)
  // Ajuste os valores abaixo para posicionar
  // ========================================

  // Container do botao IA (Lola)
  aiButton: {
    position: 'relative',                 //......Posicao relativa
    width: 60,                            //......Largura do container
    height: '100%',                       //......Altura do header
    justifyContent: 'center',             //......Centraliza vertical
    alignItems: 'center',                 //......Centraliza horizontal
    overflow: 'visible',                  //......NAO CORTA a imagem
    zIndex: 100,                          //......Acima de tudo
  },

  // Avatar da IA (foto da Lola) - AJUSTE AQUI
  aiAvatar: {
    position: 'absolute',                 //......Posicao absoluta (sai do fluxo)
    width: 45,                            //......TAMANHO: Largura da imagem
    height: 65,                           //......TAMANHO: Altura da imagem
    bottom: -15,                          //......VERTICAL: Negativo = desce, Positivo = sobe
    right: 10,                            //......HORIZONTAL: Negativo = direita, Positivo = esquerda
    zIndex: 999,                          //......CAMADA: Acima de todos elementos
  },

  // Botao menu
  menuButton: {
    width: 40,                            //......Largura
    height: 40,                           //......Altura
    justifyContent: 'center',             //......Centraliza vertical
    alignItems: 'center',                 //......Centraliza horizontal
  },
});
