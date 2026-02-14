// ========================================
// Componente ChannelEntryCard
// Card expansivel do canal de entrada
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
  Animated,                           //......Animacoes
  LayoutAnimation,                    //......Animacao layout
  Platform,                           //......Plataforma
  UIManager,                          //......Gerenciador UI
} from 'react-native';                //......Biblioteca RN
import Svg, {                         //......Componentes SVG
  Path,                               //......Path do SVG
  Circle,                             //......Circulo SVG
  Rect,                               //......Retangulo SVG
} from 'react-native-svg';            //......Biblioteca SVG

// ========================================
// Imports de Tipos
// ========================================
import {
  ChannelEntry,                       //......Tipo entrada canal
  ChannelType,                        //......Tipo de canal
  SocialMediaPlatform,                //......Tipo plataforma
} from '../../types/commercial.types';

// ========================================
// Habilitar LayoutAnimation Android
// ========================================
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
  instagram: '#E4405F',               //......Rosa Instagram
  facebook: '#1877F2',                //......Azul Facebook
  linkedin: '#0A66C2',                //......Azul LinkedIn
  whatsapp: '#25D366',                //......Verde WhatsApp
  tiktok: '#000000',                  //......Preto TikTok
  twitter: '#1DA1F2',                 //......Azul Twitter
};

// ========================================
// Icones SVG por Canal
// ========================================

// Icone de Rede Social
const SocialMediaIcon = ({ color = COLORS.primary }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={2} />
    <Path d="M8 14s1.5 2 4 2 4-2 4-2" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Circle cx={9} cy={9} r={1.5} fill={color} />
    <Circle cx={15} cy={9} r={1.5} fill={color} />
  </Svg>
);

// Icone de Landing Page
const LandingPageIcon = ({ color = COLORS.primary }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Rect x={3} y={3} width={18} height={18} rx={2} stroke={color} strokeWidth={2} />
    <Path d="M3 9h18M9 21V9" stroke={color} strokeWidth={2} />
  </Svg>
);

// Icone de Indicacao
const ReferralIcon = ({ color = COLORS.primary }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx={9} cy={7} r={3} stroke={color} strokeWidth={2} />
    <Circle cx={17} cy={7} r={3} stroke={color} strokeWidth={2} />
    <Path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke={color} strokeWidth={2} />
    <Path d="M17 11a4 4 0 014 4v2" stroke={color} strokeWidth={2} />
  </Svg>
);

// Icone de Contato Direto
const DirectIcon = ({ color = COLORS.primary }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke={color} strokeWidth={2} />
  </Svg>
);

// Icone Outros
const OtherIcon = ({ color = COLORS.primary }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={2} />
    <Path d="M12 16v.01M12 12a2 2 0 10-2-2" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

// Icone de Seta
const ChevronIcon = ({ expanded }: { expanded: boolean }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d={expanded ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"}
      stroke={COLORS.textSecondary}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ========================================
// Interface de Props
// ========================================
interface ChannelEntryCardProps {
  entry: ChannelEntry;                //......Dados da entrada
  leadName?: string;                  //......Nome do lead
  onPress?: () => void;               //......Callback ao clicar
  onEdit?: () => void;                //......Callback editar
}

// ========================================
// Funcao para obter icone do canal
// ========================================
const getChannelIcon = (type: ChannelType) => {
  switch (type) {
    case 'social_media':
      return SocialMediaIcon;         //......Icone rede social
    case 'landing_page':
      return LandingPageIcon;         //......Icone landing page
    case 'referral':
      return ReferralIcon;            //......Icone indicacao
    case 'direct':
      return DirectIcon;              //......Icone direto
    default:
      return OtherIcon;               //......Icone outros
  }
};

// ========================================
// Funcao para obter cor do canal
// ========================================
const getChannelColor = (type: ChannelType, platform?: SocialMediaPlatform): string => {
  if (type === 'social_media' && platform) {
    switch (platform) {
      case 'instagram': return COLORS.instagram;
      case 'facebook': return COLORS.facebook;
      case 'linkedin': return COLORS.linkedin;
      case 'whatsapp': return COLORS.whatsapp;
      case 'tiktok': return COLORS.tiktok;
      case 'twitter': return COLORS.twitter;
      default: return COLORS.primary;
    }
  }
  switch (type) {
    case 'landing_page': return COLORS.success;
    case 'referral': return COLORS.warning;
    case 'direct': return COLORS.primary;
    default: return COLORS.textSecondary;
  }
};

// ========================================
// Funcao para obter nome do canal
// ========================================
const getChannelName = (type: ChannelType, platform?: SocialMediaPlatform): string => {
  if (type === 'social_media' && platform) {
    const names: Record<SocialMediaPlatform, string> = {
      instagram: 'Instagram',
      facebook: 'Facebook',
      linkedin: 'LinkedIn',
      whatsapp: 'WhatsApp',
      tiktok: 'TikTok',
      twitter: 'Twitter',
    };
    return names[platform] || 'Rede Social';
  }
  const names: Record<ChannelType, string> = {
    social_media: 'Rede Social',
    landing_page: 'Landing Page',
    referral: 'Indicacao',
    direct: 'Contato Direto',
    other: 'Outros',
  };
  return names[type] || 'Desconhecido';
};

// ========================================
// Componente ChannelEntryCard
// ========================================
const ChannelEntryCard: React.FC<ChannelEntryCardProps> = ({
  entry,                              //......Dados da entrada
  leadName,                           //......Nome do lead
  onPress,                            //......Callback ao clicar
  onEdit,                             //......Callback editar
}) => {
  // ========================================
  // Estados
  // ========================================
  const [isExpanded, setIsExpanded] = useState(false);

  // ========================================
  // Dados Formatados
  // ========================================
  const channelColor = useMemo(() =>
    getChannelColor(entry.channelType, entry.channelDetails.platform),
    [entry.channelType, entry.channelDetails.platform]
  );

  const channelName = useMemo(() =>
    getChannelName(entry.channelType, entry.channelDetails.platform),
    [entry.channelType, entry.channelDetails.platform]
  );

  const ChannelIcon = useMemo(() =>
    getChannelIcon(entry.channelType),
    [entry.channelType]
  );

  const formattedDate = useMemo(() => {
    const date = new Date(entry.entryDate);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  }, [entry.entryDate]);

  // ========================================
  // Handlers
  // ========================================
  const handleToggleExpand = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);       //......Alternar estado
  }, [isExpanded]);

  const handlePress = useCallback(() => {
    onPress?.();                      //......Chamar callback
  }, [onPress]);

  const handleEdit = useCallback(() => {
    onEdit?.();                       //......Chamar callback
  }, [onEdit]);

  // ========================================
  // Render
  // ========================================
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleToggleExpand}
      activeOpacity={0.8}
    >
      {/* Indicador de Cor */}
      <View style={[styles.colorIndicator, { backgroundColor: channelColor }]} />

      {/* Header do Card */}
      <View style={styles.header}>
        {/* Icone do Canal */}
        <View style={[styles.iconContainer, { backgroundColor: channelColor + '20' }]}>
          <ChannelIcon color={channelColor} />
        </View>

        {/* Info Principal */}
        <View style={styles.mainInfo}>
          <Text style={styles.channelName}>{channelName}</Text>
          {leadName && (
            <Text style={styles.leadName}>{leadName}</Text>
          )}
          <Text style={styles.entryDate}>
            {formattedDate} as {entry.entryTime}
          </Text>
        </View>

        {/* Chevron */}
        <ChevronIcon expanded={isExpanded} />
      </View>

      {/* Conteudo Expandido */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          {/* Divisor */}
          <View style={styles.divider} />

          {/* Detalhes */}
          <View style={styles.detailsGrid}>
            {/* Primeira Interacao */}
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Primeira Interacao</Text>
              <Text style={styles.detailValue}>{entry.firstInteraction}</Text>
            </View>

            {/* Landing Page */}
            {entry.channelDetails.landingPageName && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Landing Page</Text>
                <Text style={styles.detailValue}>{entry.channelDetails.landingPageName}</Text>
              </View>
            )}

            {/* Indicacao */}
            {entry.channelDetails.referralSource && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Fonte da Indicacao</Text>
                <Text style={styles.detailValue}>{entry.channelDetails.referralSource}</Text>
              </View>
            )}

            {/* UTM Source */}
            {entry.channelDetails.utmSource && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>UTM Source</Text>
                <Text style={styles.detailValue}>{entry.channelDetails.utmSource}</Text>
              </View>
            )}

            {/* UTM Campaign */}
            {entry.channelDetails.utmCampaign && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>UTM Campaign</Text>
                <Text style={styles.detailValue}>{entry.channelDetails.utmCampaign}</Text>
              </View>
            )}

            {/* Dispositivo */}
            {entry.device && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Dispositivo</Text>
                <Text style={styles.detailValue}>{entry.device}</Text>
              </View>
            )}
          </View>

          {/* Botoes de Acao */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handlePress}
            >
              <Text style={styles.actionButtonText}>Ver Detalhes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonPrimary]}
              onPress={handleEdit}
            >
              <Text style={styles.actionButtonTextPrimary}>Editar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

// ========================================
// Export Default
// ========================================
export default ChannelEntryCard;

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
    overflow: 'hidden',               //......Esconder overflow
  },

  // Indicador de cor
  colorIndicator: {
    position: 'absolute',             //......Posicao absoluta
    left: 0,                          //......Esquerda
    top: 0,                           //......Topo
    bottom: 0,                        //......Baixo
    width: 4,                         //......Largura
  },

  // Header
  header: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    padding: 16,                      //......Espaco interno
    paddingLeft: 20,                  //......Espaco esquerda
    gap: 12,                          //......Espaco entre
  },

  // Container do icone
  iconContainer: {
    width: 40,                        //......Largura
    height: 40,                       //......Altura
    borderRadius: 20,                 //......Arredondamento
    justifyContent: 'center',         //......Centralizar vertical
    alignItems: 'center',             //......Centralizar horizontal
  },

  // Info principal
  mainInfo: {
    flex: 1,                          //......Ocupar espaco
    gap: 2,                           //......Espaco entre
  },

  // Nome do canal
  channelName: {
    fontSize: 15,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.textPrimary,        //......Cor primaria
  },

  // Nome do lead
  leadName: {
    fontSize: 13,                     //......Tamanho fonte
    fontFamily: 'Inter_500Medium',    //......Fonte Inter Medium
    color: COLORS.textPrimary,        //......Cor primaria
  },

  // Data de entrada
  entryDate: {
    fontSize: 12,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
  },

  // Conteudo expandido
  expandedContent: {
    paddingHorizontal: 16,            //......Espaco horizontal
    paddingBottom: 16,                //......Espaco inferior
    paddingLeft: 20,                  //......Espaco esquerda
  },

  // Divisor
  divider: {
    height: 1,                        //......Altura
    backgroundColor: COLORS.border,   //......Cor da borda
    marginBottom: 16,                 //......Margem inferior
  },

  // Grid de detalhes
  detailsGrid: {
    gap: 12,                          //......Espaco entre
  },

  // Item de detalhe
  detailItem: {
    gap: 2,                           //......Espaco entre
  },

  // Label do detalhe
  detailLabel: {
    fontSize: 11,                     //......Tamanho fonte
    fontFamily: 'Inter_500Medium',    //......Fonte Inter Medium
    color: COLORS.textSecondary,      //......Cor secundaria
    textTransform: 'uppercase',       //......Maiusculas
  },

  // Valor do detalhe
  detailValue: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textPrimary,        //......Cor primaria
  },

  // Acoes
  actions: {
    flexDirection: 'row',             //......Layout horizontal
    gap: 12,                          //......Espaco entre
    marginTop: 16,                    //......Margem superior
  },

  // Botao de acao
  actionButton: {
    flex: 1,                          //......Ocupar espaco
    paddingVertical: 10,              //......Espaco vertical
    borderRadius: 8,                  //......Arredondamento
    borderWidth: 1,                   //......Largura borda
    borderColor: COLORS.border,       //......Cor borda
    alignItems: 'center',             //......Centralizar horizontal
  },

  // Botao primario
  actionButtonPrimary: {
    backgroundColor: COLORS.primary,  //......Fundo azul
    borderColor: COLORS.primary,      //......Borda azul
  },

  // Texto do botao
  actionButtonText: {
    fontSize: 13,                     //......Tamanho fonte
    fontFamily: 'Inter_500Medium',    //......Fonte Inter Medium
    color: COLORS.textPrimary,        //......Cor primaria
  },

  // Texto botao primario
  actionButtonTextPrimary: {
    fontSize: 13,                     //......Tamanho fonte
    fontFamily: 'Inter_500Medium',    //......Fonte Inter Medium
    color: '#FFFFFF',                 //......Cor branca
  },
});
