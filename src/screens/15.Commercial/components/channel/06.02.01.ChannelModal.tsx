// ========================================
// Componente ChannelModal
// Arquivo 01 - Modal com detalhes do canal
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
  Modal,                              //......Modal nativo
  ScrollView,                         //......Scroll
  useWindowDimensions,                //......Dimensoes
} from 'react-native';                //......Biblioteca RN
import Svg, {                         //......Componentes SVG
  Path,                               //......Path do SVG
  Circle,                             //......Circulo SVG
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
// Imports de Estilos
// ========================================
import { styles, COLORS, DESKTOP_BREAKPOINT } from './06.02.02.ChannelModalStyles';

// ========================================
// Icones SVG
// ========================================

// Icone de fechar
const CloseIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6l12 12"
      stroke={COLORS.textSecondary}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

// Icone de editar
const EditIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
      stroke={COLORS.primary}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
      stroke={COLORS.primary}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Icone de timeline
const TimelineIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={3} fill={COLORS.primary} />
  </Svg>
);

// ========================================
// Funcoes Auxiliares
// ========================================

// Obter cor do canal
const getChannelColor = (type: ChannelType, platform?: SocialMediaPlatform): string => {
  if (type === 'social_media' && platform) {
    switch (platform) {
      case 'instagram': return COLORS.instagram;
      case 'facebook': return COLORS.facebook;
      case 'linkedin': return COLORS.linkedin;
      case 'whatsapp': return COLORS.whatsapp;
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

// Obter nome do canal
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
// Componentes Auxiliares
// ========================================

// Titulo de Secao
const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

// Linha de Info
interface InfoRowProps {
  label: string;
  value: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

// Timeline Item
interface TimelineItem {
  id: string;
  title: string;
  description: string;
  date: string;
  isActive?: boolean;
}

// Timeline
interface TimelineProps {
  items: TimelineItem[];
}

const Timeline: React.FC<TimelineProps> = ({ items }) => (
  <View style={styles.timeline}>
    {items.map((item, index) => (
      <View key={item.id} style={styles.timelineItem}>
        {index < items.length - 1 && <View style={styles.timelineLine} />}
        <View style={[
          styles.timelinePoint,
          item.isActive && styles.timelinePointActive,
        ]}>
          <TimelineIcon />
        </View>
        <View style={styles.timelineContent}>
          <Text style={styles.timelineTitle}>{item.title}</Text>
          <Text style={styles.timelineDescription}>{item.description}</Text>
          <Text style={styles.timelineDate}>{item.date}</Text>
        </View>
      </View>
    ))}
  </View>
);

// ========================================
// Interface de Props
// ========================================
interface ChannelModalProps {
  visible: boolean;
  entry: ChannelEntry | null;
  leadName?: string;
  onClose: () => void;
  onEdit?: () => void;
}

// ========================================
// Componente ChannelModal
// ========================================
const ChannelModal: React.FC<ChannelModalProps> = ({
  visible,
  entry,
  leadName,
  onClose,
  onEdit,
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const isDesktop = screenWidth > DESKTOP_BREAKPOINT;

  // Dados formatados
  const channelColor = useMemo(() => {
    if (!entry) return COLORS.primary;
    return getChannelColor(entry.channelType, entry.channelDetails.platform);
  }, [entry]);

  const channelName = useMemo(() => {
    if (!entry) return '';
    return getChannelName(entry.channelType, entry.channelDetails.platform);
  }, [entry]);

  const formattedDate = useMemo(() => {
    if (!entry) return '';
    const date = new Date(entry.entryDate);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  }, [entry]);

  // Timeline da Jornada
  const journeyTimeline = useMemo((): TimelineItem[] => {
    if (!entry) return [];
    return [
      { id: '1', title: 'Entrada no Sistema', description: `Via ${channelName}`, date: formattedDate, isActive: true },
      { id: '2', title: 'Primeira Interacao', description: entry.firstInteraction, date: `${formattedDate} ${entry.entryTime}`, isActive: false },
      { id: '3', title: 'Lead Qualificado', description: 'Aguardando qualificacao', date: '-', isActive: false },
    ];
  }, [entry, channelName, formattedDate]);

  const handleEdit = useCallback(() => {
    onEdit?.();
  }, [onEdit]);

  if (!entry) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayBackground} activeOpacity={1} onPress={onClose} />
        <View style={[styles.modalContainer, isDesktop ? styles.modalDesktop : styles.modalMobile]}>
          {!isDesktop && <View style={styles.dragHandle} />}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.headerBadge, { backgroundColor: channelColor + '20' }]}>
                <Text style={[styles.headerBadgeText, { color: channelColor }]}>{channelName}</Text>
              </View>
              {leadName && <Text style={styles.headerLeadName}>{leadName}</Text>}
            </View>
            <TouchableOpacity onPress={onClose}><CloseIcon /></TouchableOpacity>
          </View>
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <SectionTitle title="Informacoes do Canal" />
            <View style={styles.infoCard}>
              <InfoRow label="Tipo de Canal" value={channelName} />
              <InfoRow label="Data de Entrada" value={formattedDate} />
              <InfoRow label="Hora de Entrada" value={entry.entryTime} />
              <InfoRow label="Primeira Interacao" value={entry.firstInteraction} />
              {entry.device && <InfoRow label="Dispositivo" value={entry.device} />}
              {entry.ipAddress && <InfoRow label="Endereco IP" value={entry.ipAddress} />}
            </View>
            {(entry.channelDetails.utmSource || entry.channelDetails.utmMedium || entry.channelDetails.utmCampaign) && (
              <>
                <SectionTitle title="Detalhes da Campanha" />
                <View style={styles.infoCard}>
                  {entry.channelDetails.utmSource && <InfoRow label="UTM Source" value={entry.channelDetails.utmSource} />}
                  {entry.channelDetails.utmMedium && <InfoRow label="UTM Medium" value={entry.channelDetails.utmMedium} />}
                  {entry.channelDetails.utmCampaign && <InfoRow label="UTM Campaign" value={entry.channelDetails.utmCampaign} />}
                </View>
              </>
            )}
            {(entry.channelDetails.landingPageName || entry.channelDetails.referralSource) && (
              <>
                <SectionTitle title="Detalhes Especificos" />
                <View style={styles.infoCard}>
                  {entry.channelDetails.landingPageName && <InfoRow label="Landing Page" value={entry.channelDetails.landingPageName} />}
                  {entry.channelDetails.referralSource && <InfoRow label="Fonte da Indicacao" value={entry.channelDetails.referralSource} />}
                </View>
              </>
            )}
            <SectionTitle title="Jornada do Lead" />
            <Timeline items={journeyTimeline} />
            <View style={styles.bottomSpacer} />
          </ScrollView>
          <View style={styles.footer}>
            <TouchableOpacity style={styles.footerButton} onPress={onClose}>
              <Text style={styles.footerButtonText}>Fechar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.footerButton, styles.footerButtonPrimary]} onPress={handleEdit}>
              <EditIcon />
              <Text style={styles.footerButtonTextPrimary}>Editar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ========================================
// Export Default
// ========================================
export default ChannelModal;
