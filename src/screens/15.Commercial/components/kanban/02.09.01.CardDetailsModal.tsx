// ========================================
// Componente CardDetailsModal
// Arquivo 01 - Modal com detalhes do lead
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
  Modal,                              //......Modal nativo
  ScrollView,                         //......Scroll
  Switch,                             //......Switch toggle
} from 'react-native';                //......Biblioteca RN
import Svg, {                         //......Componentes SVG
  Path,                               //......Path do SVG
  Circle,                             //......Circulo do SVG
} from 'react-native-svg';            //......Biblioteca SVG

// ========================================
// Imports de Tipos
// ========================================
import {                              //......Tipos do commercial
  KanbanCard as KanbanCardType,       //......Interface de card
} from '../../types/commercial.types'; //......Arquivo de tipos

// ========================================
// Imports de Estilos
// ========================================
import {
  styles,
  COLORS,
  STATUS_COLORS,
  STATUS_LABELS,
} from './02.09.02.CardDetailsModalStyles';

// ========================================
// Icones SVG
// ========================================

// Icone de Fechar
const CloseIcon = ({ color = COLORS.textSecondary }: { color?: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
      fill={color}
    />
  </Svg>
);

// Icone de Usuario
const UserIcon = ({ color = COLORS.textSecondary }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
      fill={color}
    />
  </Svg>
);

// Icone de Telefone
const PhoneIcon = ({ color = COLORS.textSecondary }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
      fill={color}
    />
  </Svg>
);

// Icone de Email
const EmailIcon = ({ color = COLORS.textSecondary }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
      fill={color}
    />
  </Svg>
);

// Icone de Calendario
const CalendarIcon = ({ color = COLORS.textSecondary }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"
      fill={color}
    />
  </Svg>
);

// Icone de IA
const AIIcon = ({ color = COLORS.primary }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 10.12h-6.78l2.74-2.82c-2.73-2.7-7.15-2.8-9.88-.1-2.73 2.71-2.73 7.08 0 9.79s7.15 2.71 9.88 0C18.32 15.65 19 14.08 19 12.1h2c0 1.98-.88 4.55-2.64 6.29-3.51 3.48-9.21 3.48-12.72 0-3.5-3.47-3.53-9.11-.02-12.58s9.14-3.47 12.65 0L21 3v7.12z"
      fill={color}
    />
  </Svg>
);

// Icone de Timeline
const TimelineIcon = ({ color = COLORS.textSecondary }: { color?: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="4" fill={color} />
  </Svg>
);

// ========================================
// Interface de Props
// ========================================
interface CardDetailsModalProps {
  visible: boolean;                   //......Visibilidade do modal
  card: KanbanCardType | null;        //......Dados do card
  onClose: () => void;                //......Callback fechar
  onToggleAI?: (cardId: string, enabled: boolean) => void; //..Toggle IA
  onMoveNext?: (cardId: string) => void; //..Mover para proxima
  onMovePrevious?: (cardId: string) => void; //..Mover para anterior
}

// ========================================
// Componente CardDetailsModal
// ========================================
const CardDetailsModal: React.FC<CardDetailsModalProps> = ({
  visible,                            //......Visibilidade do modal
  card,                               //......Dados do card
  onClose,                            //......Callback fechar
  onToggleAI,                         //......Toggle IA
  onMoveNext,                         //......Mover para proxima
  onMovePrevious,                     //......Mover para anterior
}) => {
  // ========================================
  // Estados
  // ========================================
  const [aiEnabled, setAiEnabled] = useState(card?.aiAutomation || false);

  // ========================================
  // Memos
  // ========================================

  // Valor formatado
  const formattedValue = useMemo(() => {
    if (!card) return '';              //......Retornar vazio
    return card.value.toLocaleString('pt-BR', {
      style: 'currency',              //......Estilo moeda
      currency: 'BRL',                //......Moeda BRL
    });
  }, [card]);

  // Data de criacao formatada
  const formattedDate = useMemo(() => {
    if (!card) return '';              //......Retornar vazio
    return new Date(card.enteredAt).toLocaleDateString('pt-BR', {
      day: '2-digit',                 //......Dia com 2 digitos
      month: 'short',                 //......Mes abreviado
      year: 'numeric',                //......Ano numerico
    });
  }, [card]);

  // Dias no funil
  const daysInFunnel = useMemo(() => {
    if (!card) return 0;               //......Retornar zero
    const now = new Date();            //......Data atual
    const created = new Date(card.enteredAt);
    const diff = now.getTime() - created.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }, [card]);

  // ========================================
  // Handlers
  // ========================================

  // Handler de toggle IA
  const handleToggleAI = useCallback((value: boolean) => {
    setAiEnabled(value);               //......Atualizar estado local
    if (onToggleAI && card) {
      onToggleAI(card.id, value);      //......Chamar callback
    }
  }, [onToggleAI, card]);

  // Handler de mover para proxima
  const handleMoveNext = useCallback(() => {
    if (onMoveNext && card) {
      onMoveNext(card.id);             //......Chamar callback
    }
  }, [onMoveNext, card]);

  // Handler de mover para anterior
  const handleMovePrevious = useCallback(() => {
    if (onMovePrevious && card) {
      onMovePrevious(card.id);         //......Chamar callback
    }
  }, [onMovePrevious, card]);

  // ========================================
  // Early Return
  // ========================================
  if (!card) return null;              //......Nao renderizar sem card

  // ========================================
  // Render
  // ========================================
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header do Modal */}
          <View style={styles.header}>
            <View style={styles.headerInfo}>
              <Text style={styles.title} numberOfLines={1}>
                {card.leadName}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: STATUS_COLORS[card.status] + '20' },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: STATUS_COLORS[card.status] },
                  ]}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: STATUS_COLORS[card.status] },
                  ]}
                >
                  {STATUS_LABELS[card.status]}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <CloseIcon color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Conteudo Scrollavel */}
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Secao de Valor */}
            <View style={styles.valueSection}>
              <Text style={styles.valueLabel}>Valor estimado</Text>
              <Text style={styles.valueText}>{formattedValue}</Text>
            </View>

            {/* Informacoes do Lead */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Informações</Text>

              {/* Nome */}
              <View style={styles.infoRow}>
                <UserIcon color={COLORS.textSecondary} />
                <Text style={styles.infoText}>{card.leadName}</Text>
              </View>

              {/* Telefone */}
              {card.phone && (
                <View style={styles.infoRow}>
                  <PhoneIcon color={COLORS.textSecondary} />
                  <Text style={styles.infoText}>{card.phone}</Text>
                </View>
              )}

              {/* Email */}
              {card.email && (
                <View style={styles.infoRow}>
                  <EmailIcon color={COLORS.textSecondary} />
                  <Text style={styles.infoText}>{card.email}</Text>
                </View>
              )}

              {/* Data de entrada */}
              <View style={styles.infoRow}>
                <CalendarIcon color={COLORS.textSecondary} />
                <Text style={styles.infoText}>
                  Entrada em {formattedDate} ({daysInFunnel} dias no funil)
                </Text>
              </View>
            </View>

            {/* Tags */}
            {card.tags && card.tags.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tags</Text>
                <View style={styles.tagsContainer}>
                  {card.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Notas */}
            {card.notes && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notas</Text>
                <View style={styles.notesBox}>
                  <Text style={styles.notesText}>{card.notes}</Text>
                </View>
              </View>
            )}

            {/* Historico */}
            {card.history && card.history.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Histórico</Text>
                <View style={styles.timeline}>
                  {card.history.map((item, index) => (
                    <View key={index} style={styles.timelineItem}>
                      <View style={styles.timelineLeft}>
                        <TimelineIcon color={COLORS.primary} />
                        {index < card.history!.length - 1 && (
                          <View style={styles.timelineLine} />
                        )}
                      </View>
                      <View style={styles.timelineContent}>
                        <Text style={styles.timelineAction}>
                          {item.action}
                        </Text>
                        <Text style={styles.timelineDate}>
                          {new Date(item.timestamp).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Toggle IA Automatica */}
            <View style={styles.section}>
              <View style={styles.aiToggleRow}>
                <View style={styles.aiToggleInfo}>
                  <AIIcon color={COLORS.primary} />
                  <View style={styles.aiToggleTextContainer}>
                    <Text style={styles.aiToggleTitle}>IA Automática</Text>
                    <Text style={styles.aiToggleSubtitle}>
                      Permitir sugestões automáticas da IA
                    </Text>
                  </View>
                </View>
                <Switch
                  value={aiEnabled}
                  onValueChange={handleToggleAI}
                  trackColor={{ false: COLORS.border, true: COLORS.primary }}
                  thumbColor={COLORS.white}
                />
              </View>
            </View>
          </ScrollView>

          {/* Botoes de Acao */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={handleMovePrevious}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>Fase anterior</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              onPress={handleMoveNext}
              activeOpacity={0.7}
            >
              <Text style={styles.primaryButtonText}>Próxima fase</Text>
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
export default CardDetailsModal;
