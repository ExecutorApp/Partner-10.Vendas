// ========================================
// Componente ContextInput
// Arquivo 01 - Interface de entrada de contexto
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
  TextInput,                          //......Input de texto
  TouchableOpacity,                   //......Botao tocavel
  ActivityIndicator,                  //......Indicador loading
  ScrollView,                         //......Scroll
  Alert,                              //......Alerta
} from 'react-native';                //......Biblioteca RN
import Svg, {                         //......Componentes SVG
  Path,                               //......Path do SVG
} from 'react-native-svg';            //......Biblioteca SVG
import * as DocumentPicker from 'expo-document-picker';

// ========================================
// Imports de Componentes
// ========================================
import VoiceRecorder from './VoiceRecorder';

// ========================================
// Imports de Utilitarios
// ========================================
import {
  ContextPayload,                     //......Tipo payload
  buildTextContext,                   //......Construir texto
  buildAudioContext,                  //......Construir audio
  buildFileContext,                   //......Construir arquivo
  validateContext,                    //......Validar contexto
} from '../../utils/contextBuilder';

// ========================================
// Imports de Estilos
// ========================================
import { styles, COLORS } from './ContextInput02';

// ========================================
// Icones SVG
// ========================================

// Icone Texto
const TextIcon = ({ color = COLORS.textSecondary }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M2.5 4v3h5v12h3V7h5V4h-13zm19 5h-9v3h3v7h3v-7h3V9z"
      fill={color}
    />
  </Svg>
);

// Icone Arquivo
const FileIcon = ({ color = COLORS.textSecondary }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"
      fill={color}
    />
  </Svg>
);

// Icone Microfone
const MicIcon = ({ color = COLORS.textSecondary }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"
      fill={color}
    />
  </Svg>
);

// Icone Fechar
const CloseIcon = ({ color = COLORS.textSecondary }: { color?: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
      fill={color}
    />
  </Svg>
);

// ========================================
// Tipos
// ========================================
type TabType = 'text' | 'file' | 'audio';

// ========================================
// Interface de Props
// ========================================
interface ContextInputProps {
  onSubmit: (context: ContextPayload) => void;
  leadId?: string;                    //......Id do lead
  onCancel?: () => void;              //......Callback cancelar
}

// ========================================
// Componente ContextInput
// ========================================
const ContextInput: React.FC<ContextInputProps> = ({
  onSubmit,                           //......Callback envio
  leadId,                             //......Id do lead
  onCancel,                           //......Callback cancelar
}) => {
  // ========================================
  // Estados
  // ========================================
  const [activeTab, setActiveTab] = useState<TabType>('text');
  const [textContent, setTextContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    name: string;
    size?: number;
    mimeType?: string;
  } | null>(null);
  const [audioData, setAudioData] = useState<{
    uri: string;
    duration: number;
    transcription?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ========================================
  // Memos
  // ========================================
  const canSubmit = useMemo(() => {
    if (isLoading) return false;      //......Se carregando
    switch (activeTab) {
      case 'text':
        return textContent.trim().length > 0;
      case 'file':
        return selectedFile !== null;
      case 'audio':
        return audioData !== null;
      default:
        return false;
    }
  }, [activeTab, textContent, selectedFile, audioData, isLoading]);

  // ========================================
  // Handler: Selecionar arquivo
  // ========================================
  const handleSelectFile = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/*', 'application/pdf', 'application/json'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedFile({
          uri: asset.uri,             //......URI do arquivo
          name: asset.name,           //......Nome do arquivo
          size: asset.size,           //......Tamanho
          mimeType: asset.mimeType,   //......Tipo MIME
        });
      }
    } catch (error) {                 //......Em caso de erro
      console.error('Erro ao selecionar arquivo:', error);
      Alert.alert('Erro', 'Nao foi possivel selecionar o arquivo.');
    }
  }, []);

  // ========================================
  // Handler: Remover arquivo
  // ========================================
  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);            //......Limpar arquivo
  }, []);

  // ========================================
  // Handler: Gravacao completa
  // ========================================
  const handleRecordComplete = useCallback((
    uri: string,
    duration: number,
  ) => {
    setAudioData({
      uri,                            //......URI do audio
      duration,                       //......Duracao
    });
  }, []);

  // ========================================
  // Handler: Transcricao recebida
  // ========================================
  const handleTranscription = useCallback((text: string) => {
    setAudioData(prev => prev ? { ...prev, transcription: text } : null);
  }, []);

  // ========================================
  // Handler: Remover audio
  // ========================================
  const handleRemoveAudio = useCallback(() => {
    setAudioData(null);               //......Limpar audio
  }, []);

  // ========================================
  // Handler: Enviar contexto
  // ========================================
  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;           //......Se nao pode enviar

    setIsLoading(true);               //......Iniciar loading

    try {
      let context: ContextPayload;

      switch (activeTab) {
        case 'text':
          context = buildTextContext(textContent, leadId);
          break;

        case 'file':
          if (!selectedFile) throw new Error('Arquivo nao selecionado');
          context = buildFileContext(
            selectedFile.uri,
            selectedFile.name,
            `Arquivo: ${selectedFile.name}`,
            selectedFile.size,
            selectedFile.mimeType,
          );
          break;

        case 'audio':
          if (!audioData) throw new Error('Audio nao gravado');
          context = buildAudioContext(
            audioData.uri,
            audioData.transcription || '',
            audioData.duration,
          );
          break;

        default:
          throw new Error('Tab invalida');
      }

      // Validar contexto
      const validation = validateContext(context);
      if (!validation.valid) {
        Alert.alert('Erro', validation.error || 'Contexto invalido');
        return;
      }

      // Enviar
      onSubmit(context);

      // Limpar estados
      setTextContent('');
      setSelectedFile(null);
      setAudioData(null);

    } catch (error) {                 //......Em caso de erro
      console.error('Erro ao enviar contexto:', error);
      Alert.alert('Erro', 'Nao foi possivel enviar o contexto.');
    } finally {
      setIsLoading(false);            //......Finalizar loading
    }
  }, [canSubmit, activeTab, textContent, selectedFile, audioData, leadId, onSubmit]);

  // ========================================
  // Render: Tabs
  // ========================================
  const renderTabs = useCallback(() => {
    const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
      { key: 'text', label: 'Texto', icon: <TextIcon /> },
      { key: 'file', label: 'Arquivo', icon: <FileIcon /> },
      { key: 'audio', label: 'Audio', icon: <MicIcon /> },
    ];

    return (
      <View style={styles.tabsContainer}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.key;
          const iconColor = isActive ? COLORS.primary : COLORS.textSecondary;

          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              {React.cloneElement(
                tab.icon as React.ReactElement<{ color: string }>,
                { color: iconColor },
              )}
              <Text style={[
                styles.tabLabel,
                isActive && styles.tabLabelActive,
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }, [activeTab]);

  // ========================================
  // Render: Conteudo do Tab
  // ========================================
  const renderTabContent = useCallback(() => {
    switch (activeTab) {
      case 'text':
        return (
          <View style={styles.contentContainer}>
            <TextInput
              style={styles.textInput}
              value={textContent}
              onChangeText={setTextContent}
              placeholder="Digite o contexto para a IA..."
              placeholderTextColor={COLORS.textSecondary}
              multiline={true}
              textAlignVertical="top"
              maxLength={5000}
            />
            <Text style={styles.charCount}>
              {textContent.length}/5000
            </Text>
          </View>
        );

      case 'file':
        return (
          <View style={styles.contentContainer}>
            {selectedFile ? (
              <View style={styles.filePreview}>
                <View style={styles.fileInfo}>
                  <FileIcon color={COLORS.primary} />
                  <View style={styles.fileDetails}>
                    <Text style={styles.fileName} numberOfLines={1}>
                      {selectedFile.name}
                    </Text>
                    {selectedFile.size && (
                      <Text style={styles.fileSize}>
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={handleRemoveFile}
                  activeOpacity={0.7}
                >
                  <CloseIcon color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.selectFileButton}
                onPress={handleSelectFile}
                activeOpacity={0.7}
              >
                <FileIcon color={COLORS.primary} />
                <Text style={styles.selectFileText}>
                  Selecionar arquivo
                </Text>
                <Text style={styles.selectFileHint}>
                  Texto, PDF ou JSON
                </Text>
              </TouchableOpacity>
            )}
          </View>
        );

      case 'audio':
        return (
          <View style={styles.contentContainer}>
            {audioData ? (
              <View style={styles.audioPreview}>
                <View style={styles.audioInfo}>
                  <MicIcon color={COLORS.primary} />
                  <View style={styles.audioDetails}>
                    <Text style={styles.audioLabel}>
                      Audio gravado
                    </Text>
                    {audioData.transcription && (
                      <Text style={styles.transcriptionText} numberOfLines={2}>
                        {audioData.transcription}
                      </Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={handleRemoveAudio}
                  activeOpacity={0.7}
                >
                  <CloseIcon color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
            ) : (
              <VoiceRecorder
                onRecordComplete={handleRecordComplete}
                onTranscription={handleTranscription}
                maxDuration={60}
              />
            )}
          </View>
        );

      default:
        return null;
    }
  }, [
    activeTab,
    textContent,
    selectedFile,
    audioData,
    handleSelectFile,
    handleRemoveFile,
    handleRecordComplete,
    handleTranscription,
    handleRemoveAudio,
  ]);

  // ========================================
  // Render
  // ========================================
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Adicionar Contexto</Text>
        {onCancel && (
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onCancel}
            activeOpacity={0.7}
          >
            <CloseIcon color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      {renderTabs()}

      {/* Conteudo */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderTabContent()}
      </ScrollView>

      {/* Botao Enviar */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          !canSubmit && styles.submitButtonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={!canSubmit}
        activeOpacity={0.7}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
          <Text style={styles.submitButtonText}>
            Enviar Contexto
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

// ========================================
// Export Default
// ========================================
export default ContextInput;
