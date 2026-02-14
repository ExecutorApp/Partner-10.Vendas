// ========================================
// Componente AISettingsModal
// Modal de configuracoes da IA
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
  Modal,                              //......Modal nativo
  ScrollView,                         //......Scroll
  Switch,                             //......Toggle switch
  useWindowDimensions,                //......Dimensoes
} from 'react-native';                //......Biblioteca RN
import Svg, {                         //......Componentes SVG
  Path,                               //......Path do SVG
} from 'react-native-svg';            //......Biblioteca SVG

// ========================================
// Imports de Tipos
// ========================================
import {
  AIFullSettings,                     //......Config completa
  AISettings,                         //......Config gerais
  AIAutoReplyRules,                   //......Regras automacao
  AINotifications,                    //......Notificacoes
} from '../../types/ai.types';

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
  overlay: 'rgba(0,0,0,0.5)',         //......Overlay escuro
};

// ========================================
// Constantes de Layout
// ========================================
const DESKTOP_BREAKPOINT = 768;       //......Breakpoint desktop

// ========================================
// Icones SVG
// ========================================

// Icone de fechar
const CloseIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6l12 12" stroke={COLORS.textSecondary} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

// Icone de IA
const AIIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 110 2h-1a7 7 0 01-7 7h-4a7 7 0 01-7-7H2a1 1 0 110-2h1a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2zm-4 9a1 1 0 100 2 1 1 0 000-2zm8 0a1 1 0 100 2 1 1 0 000-2zm-6 4a1 1 0 00-1 1v1a1 1 0 102 0v-1a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v1a1 1 0 102 0v-1a1 1 0 00-1-1z" fill={COLORS.primary} />
  </Svg>
);

// ========================================
// Interface de Props
// ========================================
interface AISettingsModalProps {
  visible: boolean;                   //......Visibilidade do modal
  settings: AIFullSettings;           //......Configuracoes atuais
  onClose: () => void;                //......Callback fechar
  onSave: (settings: AIFullSettings) => void;
}

// ========================================
// Configuracoes Padrao
// ========================================
const DEFAULT_SETTINGS: AIFullSettings = {
  settings: {
    responseFormat: 'audio',          //......Formato resposta
    autoSuggestions: true,            //......Sugestoes automaticas
    voiceEnabled: true,               //......Voz habilitada
    voiceSpeed: 1.0,                  //......Velocidade normal
    voiceName: 'pt-BR-Neural',        //......Voz neural
    contextAutoCapture: true,         //......Captura automatica
    notifyOnSuggestion: true,         //......Notificar sugestoes
  },
  autoReplyEnabled: false,            //......Resposta auto desativada
  autoReplyRules: {
    basicQuestionsOnly: true,         //......Apenas basicas
    maxMessagesPerDay: 10,            //......Maximo 10 por dia
    businessHoursOnly: true,          //......Apenas horario comercial
    requireHumanApproval: true,       //......Requer aprovacao
    blockedTopics: ['preco', 'desconto'],
  },
  notifications: {
    notifyOnAutoReply: true,          //......Notificar resposta
    notifyOnComplexQuestion: true,    //......Notificar complexa
    notifyOnNegativeSentiment: true,  //......Notificar negativo
    notifyOnHumanRequest: true,       //......Notificar humano
  },
};

// ========================================
// Componente SettingRow
// ========================================
interface SettingRowProps {
  label: string;                      //......Label
  description?: string;               //......Descricao
  value: boolean;                     //......Valor atual
  onChange: (value: boolean) => void; //......Callback mudanca
  disabled?: boolean;                 //......Desabilitado
}

const SettingRow: React.FC<SettingRowProps> = ({
  label,                              //......Label
  description,                        //......Descricao
  value,                              //......Valor atual
  onChange,                           //......Callback mudanca
  disabled = false,                   //......Desabilitado
}) => (
  <View style={styles.settingRow}>
    <View style={styles.settingInfo}>
      <Text style={[styles.settingLabel, disabled && styles.settingLabelDisabled]}>
        {label}
      </Text>
      {description && (
        <Text style={styles.settingDescription}>{description}</Text>
      )}
    </View>
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ false: COLORS.border, true: COLORS.primary + '50' }}
      thumbColor={value ? COLORS.primary : COLORS.backgroundAlt}
      disabled={disabled}
    />
  </View>
);

// ========================================
// Componente SectionHeader
// ========================================
const SectionHeader: React.FC<{ title: string; icon?: React.ReactNode }> = ({
  title,                              //......Titulo
  icon,                               //......Icone opcional
}) => (
  <View style={styles.sectionHeader}>
    {icon}
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

// ========================================
// Componente AISettingsModal
// ========================================
const AISettingsModal: React.FC<AISettingsModalProps> = ({
  visible,                            //......Visibilidade do modal
  settings: initialSettings,          //......Configuracoes iniciais
  onClose,                            //......Callback fechar
  onSave,                             //......Callback salvar
}) => {
  // ========================================
  // Dimensoes
  // ========================================
  const { width: screenWidth } = useWindowDimensions();
  const isDesktop = screenWidth > DESKTOP_BREAKPOINT;

  // ========================================
  // Estados
  // ========================================
  const [settings, setSettings] = useState<AIFullSettings>(
    initialSettings || DEFAULT_SETTINGS
  );

  // ========================================
  // Handlers Gerais
  // ========================================
  const updateSettings = useCallback((
    key: keyof AISettings,
    value: boolean | string | number
  ) => {
    setSettings(prev => ({
      ...prev,
      settings: { ...prev.settings, [key]: value },
    }));
  }, []);

  // ========================================
  // Handlers Auto Reply
  // ========================================
  const updateAutoReplyRules = useCallback((
    key: keyof AIAutoReplyRules,
    value: boolean | number | string[]
  ) => {
    setSettings(prev => ({
      ...prev,
      autoReplyRules: { ...prev.autoReplyRules, [key]: value },
    }));
  }, []);

  // ========================================
  // Handlers Notificacoes
  // ========================================
  const updateNotifications = useCallback((
    key: keyof AINotifications,
    value: boolean
  ) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value },
    }));
  }, []);

  // ========================================
  // Handler Salvar
  // ========================================
  const handleSave = useCallback(() => {
    onSave(settings);                 //......Salvar settings
    onClose();                        //......Fechar modal
  }, [settings, onSave, onClose]);

  // ========================================
  // Render
  // ========================================
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Background pressable */}
        <TouchableOpacity
          style={styles.overlayBackground}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Modal Content */}
        <View style={[
          styles.modalContainer,
          isDesktop ? styles.modalDesktop : styles.modalMobile,
        ]}>
          {/* Handle mobile */}
          {!isDesktop && <View style={styles.dragHandle} />}

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <AIIcon />
              <Text style={styles.headerTitle}>Configuracoes da IA</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <CloseIcon />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Secao: Geral */}
            <SectionHeader title="Configuracoes Gerais" />
            <View style={styles.section}>
              <SettingRow
                label="Sugestoes Automaticas"
                description="Receber sugestoes da IA baseadas no contexto"
                value={settings.settings.autoSuggestions}
                onChange={(v) => updateSettings('autoSuggestions', v)}
              />
              <SettingRow
                label="Respostas em Audio"
                description="IA responde com audio TTS"
                value={settings.settings.voiceEnabled}
                onChange={(v) => updateSettings('voiceEnabled', v)}
              />
              <SettingRow
                label="Captura Automatica"
                description="Capturar contexto automaticamente"
                value={settings.settings.contextAutoCapture}
                onChange={(v) => updateSettings('contextAutoCapture', v)}
              />
            </View>

            {/* Secao: Automacao */}
            <SectionHeader title="Automacao" />
            <View style={styles.section}>
              <SettingRow
                label="Resposta Automatica"
                description="IA responde leads automaticamente"
                value={settings.autoReplyEnabled}
                onChange={(v) => setSettings(prev => ({ ...prev, autoReplyEnabled: v }))}
              />
              <SettingRow
                label="Apenas Perguntas Basicas"
                description="Responder apenas FAQs simples"
                value={settings.autoReplyRules.basicQuestionsOnly}
                onChange={(v) => updateAutoReplyRules('basicQuestionsOnly', v)}
                disabled={!settings.autoReplyEnabled}
              />
              <SettingRow
                label="Horario Comercial"
                description="Apenas das 8h as 18h"
                value={settings.autoReplyRules.businessHoursOnly}
                onChange={(v) => updateAutoReplyRules('businessHoursOnly', v)}
                disabled={!settings.autoReplyEnabled}
              />
              <SettingRow
                label="Requer Aprovacao"
                description="Aprovar antes de enviar"
                value={settings.autoReplyRules.requireHumanApproval}
                onChange={(v) => updateAutoReplyRules('requireHumanApproval', v)}
                disabled={!settings.autoReplyEnabled}
              />
            </View>

            {/* Secao: Notificacoes */}
            <SectionHeader title="Notificacoes" />
            <View style={styles.section}>
              <SettingRow
                label="Resposta Automatica"
                description="Notificar quando IA responder"
                value={settings.notifications.notifyOnAutoReply}
                onChange={(v) => updateNotifications('notifyOnAutoReply', v)}
              />
              <SettingRow
                label="Pergunta Complexa"
                description="Notificar perguntas que precisam de humano"
                value={settings.notifications.notifyOnComplexQuestion}
                onChange={(v) => updateNotifications('notifyOnComplexQuestion', v)}
              />
              <SettingRow
                label="Sentimento Negativo"
                description="Notificar quando lead estiver insatisfeito"
                value={settings.notifications.notifyOnNegativeSentiment}
                onChange={(v) => updateNotifications('notifyOnNegativeSentiment', v)}
              />
              <SettingRow
                label="Pedido de Humano"
                description="Notificar quando lead pedir atendente"
                value={settings.notifications.notifyOnHumanRequest}
                onChange={(v) => updateNotifications('notifyOnHumanRequest', v)}
              />
            </View>

            {/* Espacador */}
            <View style={styles.bottomSpacer} />
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Salvar</Text>
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
export default AISettingsModal;

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Overlay
  overlay: {
    flex: 1,                          //......Ocupar tela
    justifyContent: 'flex-end',       //......Alinhar embaixo
  },

  // Background overlay
  overlayBackground: {
    ...StyleSheet.absoluteFillObject, //......Preencher tudo
    backgroundColor: COLORS.overlay,  //......Cor escura
  },

  // Container do modal
  modalContainer: {
    backgroundColor: COLORS.background, //....Fundo branco
    borderTopLeftRadius: 20,          //......Arredondamento
    borderTopRightRadius: 20,         //......Arredondamento
  },

  // Modal desktop
  modalDesktop: {
    position: 'absolute',             //......Posicao absoluta
    right: 0,                         //......Direita
    top: 0,                           //......Topo
    bottom: 0,                        //......Baixo
    width: '40%',                     //......40% da tela
    borderRadius: 0,                  //......Sem arredondamento
  },

  // Modal mobile
  modalMobile: {
    maxHeight: '90%',                 //......90% da altura
  },

  // Handle de arrastar
  dragHandle: {
    width: 40,                        //......Largura
    height: 4,                        //......Altura
    backgroundColor: COLORS.border,   //......Cor cinza
    borderRadius: 2,                  //......Arredondamento
    alignSelf: 'center',              //......Centralizar
    marginTop: 12,                    //......Margem superior
  },

  // Header
  header: {
    flexDirection: 'row',             //......Layout horizontal
    justifyContent: 'space-between',  //......Espaco entre
    alignItems: 'center',             //......Centralizar vertical
    padding: 20,                      //......Espaco interno
    borderBottomWidth: 1,             //......Borda inferior
    borderBottomColor: COLORS.border, //......Cor da borda
  },

  // Header esquerda
  headerLeft: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    gap: 12,                          //......Espaco entre
  },

  // Titulo do header
  headerTitle: {
    fontSize: 18,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.textPrimary,        //......Cor primaria
  },

  // Conteudo
  content: {
    flex: 1,                          //......Ocupar espaco
    padding: 20,                      //......Espaco interno
  },

  // Header da secao
  sectionHeader: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    gap: 8,                           //......Espaco entre
    marginTop: 16,                    //......Margem superior
    marginBottom: 12,                 //......Margem inferior
  },

  // Titulo da secao
  sectionTitle: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.textPrimary,        //......Cor primaria
    textTransform: 'uppercase',       //......Maiusculas
  },

  // Secao
  section: {
    backgroundColor: COLORS.backgroundAlt, //..Fundo cinza
    borderRadius: 12,                 //......Arredondamento
    padding: 4,                       //......Espaco interno
  },

  // Linha de setting
  settingRow: {
    flexDirection: 'row',             //......Layout horizontal
    justifyContent: 'space-between',  //......Espaco entre
    alignItems: 'center',             //......Centralizar vertical
    padding: 16,                      //......Espaco interno
    borderBottomWidth: 1,             //......Borda inferior
    borderBottomColor: COLORS.border, //......Cor da borda
  },

  // Info do setting
  settingInfo: {
    flex: 1,                          //......Ocupar espaco
    marginRight: 12,                  //......Margem direita
  },

  // Label do setting
  settingLabel: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_500Medium',    //......Fonte Inter Medium
    color: COLORS.textPrimary,        //......Cor primaria
  },

  // Label desabilitado
  settingLabelDisabled: {
    color: COLORS.textSecondary,      //......Cor secundaria
  },

  // Descricao do setting
  settingDescription: {
    fontSize: 12,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
    marginTop: 2,                     //......Margem superior
  },

  // Espacador inferior
  bottomSpacer: {
    height: 20,                       //......Altura
  },

  // Footer
  footer: {
    flexDirection: 'row',             //......Layout horizontal
    gap: 12,                          //......Espaco entre
    padding: 20,                      //......Espaco interno
    borderTopWidth: 1,                //......Borda superior
    borderTopColor: COLORS.border,    //......Cor da borda
  },

  // Botao cancelar
  cancelButton: {
    flex: 1,                          //......Ocupar espaco
    paddingVertical: 14,              //......Espaco vertical
    borderRadius: 8,                  //......Arredondamento
    borderWidth: 1,                   //......Largura borda
    borderColor: COLORS.border,       //......Cor borda
    alignItems: 'center',             //......Centralizar horizontal
  },

  // Texto cancelar
  cancelButtonText: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_500Medium',    //......Fonte Inter Medium
    color: COLORS.textPrimary,        //......Cor primaria
  },

  // Botao salvar
  saveButton: {
    flex: 1,                          //......Ocupar espaco
    paddingVertical: 14,              //......Espaco vertical
    borderRadius: 8,                  //......Arredondamento
    backgroundColor: COLORS.primary,  //......Fundo azul
    alignItems: 'center',             //......Centralizar horizontal
  },

  // Texto salvar
  saveButtonText: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: '#FFFFFF',                 //......Cor branca
  },
});
