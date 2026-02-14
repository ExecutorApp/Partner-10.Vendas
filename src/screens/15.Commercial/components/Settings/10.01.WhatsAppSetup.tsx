// ========================================
// Tela de Configuracao do WhatsApp
// Conectar/desconectar via Pairing Code
// ========================================

// ========================================
// Imports React
// ========================================
import React, {                                  //......React core
  useState,                                      //......Hook de estado
  useEffect,                                     //......Hook de efeito
  useCallback,                                   //......Hook de callback
  useRef,                                        //......Hook de referencia
} from 'react';

// ========================================
// Imports React Native
// ========================================
import {                                         //......Componentes RN
  View,                                          //......Container
  Text,                                          //......Texto
  StyleSheet,                                    //......Estilos
  TouchableOpacity,                              //......Botao tocavel
  ActivityIndicator,                             //......Loading
  Alert,                                         //......Alerta
  ScrollView,                                    //......Scroll
  FlatList,                                      //......Lista otimizada
  Dimensions,                                    //......Dimensoes
  TextInput,                                     //......Input de texto
  Linking,                                       //......Deep links
  Clipboard,                                     //......Copiar texto
  Platform,                                      //......Plataforma
  Image,                                         //......Imagem
} from 'react-native';
import Svg, { Path } from 'react-native-svg';    //......SVG

// ========================================
// Imports de Servicos
// ========================================
import instanceManager from '../../services/instanceManager';
import { evolutionService } from '../../services/evolutionService';

// ========================================
// Constantes
// ========================================
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ========================================
// Cores
// ========================================
const COLORS = {
  primary: '#1777CF',                            //......Azul principal
  success: '#22C55E',                            //......Verde sucesso
  danger: '#EF4444',                             //......Vermelho perigo
  warning: '#F59E0B',                            //......Amarelo alerta
  background: '#FCFCFC',                         //......Fundo branco
  backgroundAlt: '#F4F4F4',                      //......Fundo cinza
  textPrimary: '#3A3F51',                        //......Texto escuro
  textSecondary: '#7D8592',                      //......Texto cinza
  border: '#D8E0F0',                             //......Borda clara
  white: '#FFFFFF',                              //......Branco
  whatsapp: '#25D366',                           //......Verde WhatsApp
};

// ========================================
// Icone WhatsApp
// ========================================
const WhatsAppIcon = ({ size = 64, color = COLORS.whatsapp }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path
      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
    />
  </Svg>
);

// ========================================
// Icone de Check
// ========================================
const CheckIcon = ({ size = 64, color = COLORS.success }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
      fill={color}
    />
  </Svg>
);

// ========================================
// Icone de Copiar
// ========================================
const CopyIcon = ({ size = 20, color = COLORS.textSecondary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"
      fill={color}
    />
  </Svg>
);

// ========================================
// Interface de Props
// ========================================
interface WhatsAppSetupProps {
  userId: string;                                //......ID do usuario
  userName?: string;                             //......Nome do usuario
  onConnectionChange?: (connected: boolean) => void;
  onClose?: () => void;                          //......Callback de fechar
}

// ========================================
// Componente Principal
// ========================================
const WhatsAppSetup: React.FC<WhatsAppSetupProps> = ({
  userId,
  userName = 'Vendedor',
  onConnectionChange,
  onClose,
}) => {
  // ========================================
  // Estados
  // ========================================
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [connectionMode, setConnectionMode] = useState<'qrcode' | 'pairing'>('qrcode');
  const [chats, setChats] = useState<any[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ========================================
  // Limpar Intervals ao Desmontar
  // ========================================
  useEffect(() => {
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  // ========================================
  // Verificar Conexao ao Montar
  // ========================================
  useEffect(() => {
    checkConnection();
  }, [userId]);

  // ========================================
  // Buscar Chats quando Conectar
  // ========================================
  useEffect(() => {
    if (isConnected) {
      fetchChats();
    }
  }, [isConnected]);

  // ========================================
  // Buscar Lista de Chats
  // ========================================
  const fetchChats = async () => {
    try {
      setIsLoadingChats(true);                     //......Inicia loading
      const instanceName = `partners_${userId}`;
      console.log('[WhatsAppSetup] Buscando chats...');
      const result = await evolutionService.fetchChats(instanceName);
      console.log('[WhatsAppSetup] Chats encontrados:', result?.contacts?.length || 0);
      setChats(result?.contacts || []);            //......Atualiza lista de contacts
    } catch (error) {
      console.error('[WhatsAppSetup] Erro ao buscar chats:', error);
    } finally {
      setIsLoadingChats(false);                    //......Finaliza loading
    }
  };

  // ========================================
  // Verificar Status da Conexao
  // ========================================
  const checkConnection = async () => {
    try {
      setIsChecking(true);                       //......Inicia verificacao
      const connected = await instanceManager.isConnected(userId);
      setIsConnected(connected);                 //......Atualiza estado
      onConnectionChange?.(connected);           //......Notifica pai
    } catch (error) {
      console.error('[WhatsAppSetup] Erro ao verificar conexao:', error);
    } finally {
      setIsChecking(false);                      //......Finaliza verificacao
    }
  };

  // ========================================
  // Formatar Numero de Telefone
  // ========================================
  const formatPhoneNumber = (text: string) => {
    // Remove tudo que nao e numero
    const cleaned = text.replace(/\D/g, '');

    // Formata como (XX) XXXXX-XXXX
    if (cleaned.length <= 2) {
      return cleaned;
    } else if (cleaned.length <= 7) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    } else if (cleaned.length <= 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
  };

  // ========================================
  // Handler de Mudanca de Telefone
  // ========================================
  const handlePhoneChange = (text: string) => {
    setPhoneNumber(formatPhoneNumber(text));
  };

  // ========================================
  // Gerar QR Code
  // ========================================
  const handleGenerateQRCode = useCallback(async () => {
    console.log('========================================');
    console.log('[WhatsAppSetup] handleGenerateQRCode INICIADO');
    console.log('[WhatsAppSetup] userId:', userId);

    setIsLoading(true);
    setQrCodeBase64(null);
    setPairingCode(null);

    try {
      const instanceName = `partners_${userId}`;
      console.log('[WhatsAppSetup] instanceName:', instanceName);

      // Deletar instancia existente
      console.log('[WhatsAppSetup] Deletando instancia existente...');
      await evolutionService.deleteInstance(instanceName);

      // Criar nova instancia com QR Code
      console.log('[WhatsAppSetup] Criando nova instancia com QR Code...');
      const createResult = await evolutionService.createInstance(instanceName, false);
      console.log('[WhatsAppSetup] createResult:', JSON.stringify(createResult, null, 2));

      // Aguardar inicializacao
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Configurar settings para sincronizar historico completo
      console.log('[WhatsAppSetup] Configurando syncFullHistory...');
      await evolutionService.setSettings(instanceName, {
        syncFullHistory: true,                   //......Sincronizar historico
        readMessages: true,                      //......Marcar como lido
      });

      // Obter QR Code
      console.log('[WhatsAppSetup] Obtendo QR Code...');
      const qrResponse = await evolutionService.connectInstance(instanceName);
      console.log('[WhatsAppSetup] qrResponse:', JSON.stringify(qrResponse, null, 2));

      if (qrResponse.base64 || qrResponse.qrcode?.base64) {
        const base64 = qrResponse.base64 || qrResponse.qrcode?.base64 || '';
        console.log('[WhatsAppSetup] QR Code recebido');
        setQrCodeBase64(base64);
        setCountdown(60);

        // Iniciar countdown
        countdownIntervalRef.current = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownIntervalRef.current!);
              setQrCodeBase64(null);
              setIsLoading(false);
              return 60;
            }
            return prev - 1;
          });
        }, 1000);

        // Verificar conexao periodicamente
        checkIntervalRef.current = setInterval(async () => {
          console.log('[WhatsAppSetup] Verificando conexao...');
          const connected = await instanceManager.isConnected(userId);
          if (connected) {
            clearInterval(checkIntervalRef.current!);
            clearInterval(countdownIntervalRef.current!);
            setIsConnected(true);
            setQrCodeBase64(null);
            setIsLoading(false);
            onConnectionChange?.(true);
            Alert.alert('Sucesso', 'WhatsApp conectado com sucesso!');
          }
        }, 3000);

        // Timeout apos 60 segundos
        setTimeout(() => {
          if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          if (!isConnected) {
            setQrCodeBase64(null);
            setIsLoading(false);
          }
        }, 60000);

      } else {
        throw new Error(qrResponse.error || 'Falha ao gerar QR Code');
      }
    } catch (error: any) {
      console.error('[WhatsAppSetup] ERRO:', error);
      setIsLoading(false);
      Alert.alert('Erro', `Falha ao gerar QR Code: ${error?.message || 'Erro desconhecido'}`);
    }
  }, [userId, onConnectionChange, isConnected]);

  // ========================================
  // Gerar Pairing Code
  // ========================================
  const handleGenerateCode = useCallback(async () => {
    console.log('========================================');
    console.log('[WhatsAppSetup] handleGenerateCode INICIADO');
    console.log('[WhatsAppSetup] phoneNumber:', phoneNumber);
    console.log('[WhatsAppSetup] userId:', userId);

    // Validar numero
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    console.log('[WhatsAppSetup] cleanNumber:', cleanNumber);
    console.log('[WhatsAppSetup] cleanNumber.length:', cleanNumber.length);

    if (cleanNumber.length < 10 || cleanNumber.length > 11) {
      console.log('[WhatsAppSetup] ERRO: Numero invalido');
      Alert.alert('Erro', 'Digite um numero de telefone valido com DDD.');
      return;
    }

    console.log('[WhatsAppSetup] Numero valido, iniciando loading...');
    setIsLoading(true);
    setPairingCode(null);
    setQrCodeBase64(null);

    try {
      // Adicionar codigo do pais (55 Brasil)
      const fullNumber = cleanNumber.length === 11
        ? `55${cleanNumber}`
        : `55${cleanNumber}`;

      const instanceName = `partners_${userId}`;
      console.log('[WhatsAppSetup] fullNumber:', fullNumber);
      console.log('[WhatsAppSetup] instanceName:', instanceName);
      console.log('[WhatsAppSetup] Chamando evolutionService.connectWithPairingCode...');

      // Gerar codigo de pareamento
      const response = await evolutionService.connectWithPairingCode(
        instanceName,
        fullNumber
      );

      console.log('[WhatsAppSetup] Resposta da API:', JSON.stringify(response, null, 2));

      if (response.pairingCode || response.code) {
        const code = response.pairingCode || response.code || '';
        console.log('[WhatsAppSetup] Codigo recebido:', code);

        // Formatar codigo como XXXX-XXXX
        const formattedCode = code.length === 8
          ? `${code.slice(0, 4)}-${code.slice(4)}`
          : code;

        console.log('[WhatsAppSetup] Codigo formatado:', formattedCode);
        setPairingCode(formattedCode);
        setCountdown(60);

        // Iniciar countdown
        console.log('[WhatsAppSetup] Iniciando countdown...');
        countdownIntervalRef.current = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownIntervalRef.current!);
              setPairingCode(null);
              return 60;
            }
            return prev - 1;
          });
        }, 1000);

        // Iniciar verificacao de conexao
        console.log('[WhatsAppSetup] Iniciando verificacao de conexao...');
        checkIntervalRef.current = setInterval(async () => {
          console.log('[WhatsAppSetup] Verificando conexao...');
          const connected = await instanceManager.isConnected(userId);
          console.log('[WhatsAppSetup] Conectado:', connected);
          if (connected) {
            clearInterval(checkIntervalRef.current!);
            clearInterval(countdownIntervalRef.current!);
            setIsConnected(true);
            setPairingCode(null);
            setIsLoading(false);
            onConnectionChange?.(true);
            Alert.alert('Sucesso', 'WhatsApp conectado com sucesso!');
          }
        }, 3000);

        // Timeout apos 60 segundos
        setTimeout(() => {
          console.log('[WhatsAppSetup] Timeout de 60 segundos atingido');
          if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current);
          }
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
          }
          if (!isConnected) {
            console.log('[WhatsAppSetup] Nao conectado, resetando estado');
            setPairingCode(null);
            setIsLoading(false);
          }
        }, 60000);

      } else {
        console.log('[WhatsAppSetup] ERRO: Resposta sem codigo');
        console.log('[WhatsAppSetup] response.error:', response.error);
        throw new Error(response.error || 'Falha ao gerar codigo - resposta sem codigo');
      }
    } catch (error: any) {
      console.log('========================================');
      console.error('[WhatsAppSetup] ERRO CAPTURADO:', error);
      console.error('[WhatsAppSetup] error.message:', error?.message);
      console.error('[WhatsAppSetup] error.stack:', error?.stack);
      console.log('========================================');
      setIsLoading(false);
      Alert.alert(
        'Erro',
        `Falha ao gerar codigo: ${error?.message || 'Erro desconhecido'}`
      );
    }
  }, [userId, phoneNumber, onConnectionChange, isConnected]);

  // ========================================
  // Copiar Codigo
  // ========================================
  const handleCopyCode = () => {
    if (pairingCode) {
      Clipboard.setString(pairingCode.replace('-', ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ========================================
  // Abrir WhatsApp
  // ========================================
  const handleOpenWhatsApp = async () => {
    // Deep link para abrir WhatsApp
    const whatsappUrl = Platform.select({
      ios: 'whatsapp://',
      android: 'whatsapp://',
    });

    try {
      const supported = await Linking.canOpenURL(whatsappUrl!);
      if (supported) {
        await Linking.openURL(whatsappUrl!);
      } else {
        Alert.alert(
          'WhatsApp nao encontrado',
          'Instale o WhatsApp para continuar.'
        );
      }
    } catch (error) {
      console.error('[WhatsAppSetup] Erro ao abrir WhatsApp:', error);
    }
  };

  // ========================================
  // Desconectar WhatsApp
  // ========================================
  const handleDisconnect = useCallback(async () => {
    Alert.alert(
      'Desconectar WhatsApp',
      'Tem certeza? Voce precisara conectar novamente.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Desconectar',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await instanceManager.disconnect(userId);
              setIsConnected(false);
              setPhoneNumber('');
              onConnectionChange?.(false);
              Alert.alert('Sucesso', 'WhatsApp desconectado.');
            } catch (error) {
              console.error('[WhatsAppSetup] Erro ao desconectar:', error);
              Alert.alert('Erro', 'Falha ao desconectar.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  }, [userId, onConnectionChange]);

  // ========================================
  // Render: Loading Inicial
  // ========================================
  if (isChecking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Verificando conexao...</Text>
      </View>
    );
  }

  // ========================================
  // Render: Conectado
  // ========================================
  if (isConnected) {
    return (
      <View style={styles.scrollView}>
        {/* Header Status */}
        <View style={styles.connectedHeader}>
          <View style={styles.iconContainerSmall}>
            <CheckIcon size={40} color={COLORS.success} />
          </View>
          <View style={styles.connectedHeaderText}>
            <Text style={styles.connectedTitleSmall}>WhatsApp Conectado</Text>
            <View style={styles.statusBadgeSmall}>
              <View style={styles.statusDot} />
              <Text style={styles.statusTextSmall}>Online</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.disconnectButtonSmall}
            onPress={handleDisconnect}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.danger} />
            ) : (
              <Text style={styles.disconnectButtonTextSmall}>Desconectar</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Lista de Chats */}
        <View style={styles.chatsContainer}>
          <View style={styles.chatsHeader}>
            <Text style={styles.chatsTitle}>Conversas</Text>
            <TouchableOpacity onPress={fetchChats} style={styles.refreshButton}>
              <Text style={styles.refreshButtonText}>Atualizar</Text>
            </TouchableOpacity>
          </View>

          {isLoadingChats ? (
            <View style={styles.chatsLoading}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.chatsLoadingText}>Carregando conversas...</Text>
            </View>
          ) : chats.length === 0 ? (
            <View style={styles.chatsEmpty}>
              <WhatsAppIcon size={48} color={COLORS.textSecondary} />
              <Text style={styles.chatsEmptyTitle}>Nenhuma conversa</Text>
              <Text style={styles.chatsEmptyText}>
                Suas conversas do WhatsApp aparecerao aqui.
              </Text>
            </View>
          ) : (
            <FlatList
              data={chats}
              keyExtractor={(item, index) => item.id || index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.chatItem}>
                  {/* Avatar */}
                  <View style={styles.chatAvatar}>
                    <Text style={styles.chatAvatarText}>
                      {(item.pushName || item.id?.split('@')[0] || '?')[0]?.toUpperCase()}
                    </Text>
                  </View>
                  {/* Info */}
                  <View style={styles.chatInfo}>
                    <Text style={styles.chatName} numberOfLines={1}>
                      {item.pushName || item.id?.split('@')[0] || 'Sem nome'}
                    </Text>
                    <Text style={styles.chatLastMessage} numberOfLines={1}>
                      {item.id?.split('@')[0] || 'Contato WhatsApp'}
                    </Text>
                  </View>
                  {/* Indicador de grupo */}
                  {item.id?.includes('@g.us') && (
                    <View style={styles.groupBadge}>
                      <Text style={styles.groupBadgeText}>Grupo</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.chatsList}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* Botao Fechar */}
        {onClose && (
          <TouchableOpacity style={styles.closeButtonFixed} onPress={onClose}>
            <Text style={styles.closeButtonText}>Fechar</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // ========================================
  // Render: Desconectado
  // ========================================
  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        {/* Icone WhatsApp */}
        <View style={styles.iconContainer}>
          <WhatsAppIcon size={80} color={COLORS.whatsapp} />
        </View>

        {/* Titulo */}
        <Text style={styles.title}>Conectar WhatsApp</Text>

        {/* Subtitulo */}
        <Text style={styles.instructions}>
          Conecte seu WhatsApp para enviar e receber mensagens dos seus leads.
        </Text>

        {/* QR Code */}
        {qrCodeBase64 && (
          <View style={styles.codeContainer}>
            <Text style={styles.codeLabel}>Escaneie o QR Code:</Text>

            {/* Imagem QR Code */}
            <View style={styles.qrCodeBox}>
              <Image
                source={{ uri: qrCodeBase64 }}
                style={styles.qrCodeImage}
                resizeMode="contain"
              />
            </View>

            {/* Countdown */}
            <Text style={styles.countdownText}>
              QR Code expira em {countdown}s
            </Text>

            {/* Instrucoes QR Code */}
            <View style={styles.instructionsBox}>
              <Text style={styles.instructionTitle}>Como usar:</Text>

              <View style={styles.stepRow}>
                <Text style={styles.stepNumber}>1</Text>
                <Text style={styles.stepText}>Abra o WhatsApp no seu celular</Text>
              </View>

              <View style={styles.stepRow}>
                <Text style={styles.stepNumber}>2</Text>
                <Text style={styles.stepText}>
                  Va em Configuracoes → Aparelhos conectados
                </Text>
              </View>

              <View style={styles.stepRow}>
                <Text style={styles.stepNumber}>3</Text>
                <Text style={styles.stepText}>
                  Toque em "Conectar um aparelho"
                </Text>
              </View>

              <View style={styles.stepRow}>
                <Text style={styles.stepNumber}>4</Text>
                <Text style={styles.stepText}>
                  Escaneie o QR Code acima
                </Text>
              </View>
            </View>

            {/* Aguardando */}
            <View style={styles.waitingRow}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.waitingText}>Aguardando conexao...</Text>
            </View>
          </View>
        )}

        {/* Input de Telefone (modo pairing) */}
        {!qrCodeBase64 && !pairingCode && connectionMode === 'pairing' && (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Seu numero de WhatsApp</Text>
            <TextInput
              style={styles.phoneInput}
              placeholder="(11) 99999-9999"
              placeholderTextColor={COLORS.textSecondary}
              value={phoneNumber}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
              maxLength={16}
            />
          </View>
        )}

        {/* Codigo de Pareamento */}
        {pairingCode && (
          <View style={styles.codeContainer}>
            <Text style={styles.codeLabel}>Seu codigo de pareamento:</Text>

            {/* Codigo Grande */}
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{pairingCode}</Text>
            </View>

            {/* Botao Copiar */}
            <TouchableOpacity
              style={styles.copyButton}
              onPress={handleCopyCode}
            >
              <CopyIcon size={18} color={copied ? COLORS.success : COLORS.primary} />
              <Text style={[
                styles.copyButtonText,
                copied && { color: COLORS.success }
              ]}>
                {copied ? 'Copiado!' : 'Copiar codigo'}
              </Text>
            </TouchableOpacity>

            {/* Countdown */}
            <Text style={styles.countdownText}>
              Codigo expira em {countdown}s
            </Text>

            {/* Instrucoes */}
            <View style={styles.instructionsBox}>
              <Text style={styles.instructionTitle}>Como usar:</Text>

              <View style={styles.stepRow}>
                <Text style={styles.stepNumber}>1</Text>
                <Text style={styles.stepText}>Abra o WhatsApp no seu celular</Text>
              </View>

              <View style={styles.stepRow}>
                <Text style={styles.stepNumber}>2</Text>
                <Text style={styles.stepText}>
                  Va em Configuracoes → Aparelhos conectados
                </Text>
              </View>

              <View style={styles.stepRow}>
                <Text style={styles.stepNumber}>3</Text>
                <Text style={styles.stepText}>
                  Toque em "Conectar com numero de telefone"
                </Text>
              </View>

              <View style={styles.stepRow}>
                <Text style={styles.stepNumber}>4</Text>
                <Text style={styles.stepText}>
                  Digite o codigo acima
                </Text>
              </View>
            </View>

            {/* Botao Abrir WhatsApp */}
            <TouchableOpacity
              style={styles.openWhatsAppButton}
              onPress={handleOpenWhatsApp}
            >
              <WhatsAppIcon size={20} color={COLORS.white} />
              <Text style={styles.openWhatsAppText}>Abrir WhatsApp</Text>
            </TouchableOpacity>

            {/* Aguardando */}
            <View style={styles.waitingRow}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.waitingText}>Aguardando conexao...</Text>
            </View>
          </View>
        )}

        {/* Botao Gerar QR Code (modo padrao) */}
        {!qrCodeBase64 && !pairingCode && connectionMode === 'qrcode' && (
          <TouchableOpacity
            style={[
              styles.generateButton,
              isLoading && styles.buttonDisabled,
            ]}
            onPress={handleGenerateQRCode}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.generateButtonText}>Gerar QR Code</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Botao Gerar Codigo (modo pairing) */}
        {!qrCodeBase64 && !pairingCode && connectionMode === 'pairing' && (
          <TouchableOpacity
            style={[
              styles.generateButton,
              (!phoneNumber || isLoading) && styles.buttonDisabled,
            ]}
            onPress={handleGenerateCode}
            disabled={!phoneNumber || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.generateButtonText}>Gerar Codigo</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Alternar modo de conexao */}
        {!qrCodeBase64 && !pairingCode && (
          <TouchableOpacity
            style={styles.switchModeButton}
            onPress={() => setConnectionMode(
              connectionMode === 'qrcode' ? 'pairing' : 'qrcode'
            )}
          >
            <Text style={styles.switchModeText}>
              {connectionMode === 'qrcode'
                ? 'Usar codigo numerico'
                : 'Usar QR Code'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Botao Cancelar (QR Code) */}
        {qrCodeBase64 && (
          <TouchableOpacity
            style={styles.newCodeButton}
            onPress={() => {
              if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
              if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
              setQrCodeBase64(null);
              setIsLoading(false);
            }}
          >
            <Text style={styles.newCodeButtonText}>Cancelar</Text>
          </TouchableOpacity>
        )}

        {/* Botao Cancelar (Pairing Code) */}
        {pairingCode && (
          <TouchableOpacity
            style={styles.newCodeButton}
            onPress={() => {
              if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
              if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
              setPairingCode(null);
              setIsLoading(false);
            }}
          >
            <Text style={styles.newCodeButtonText}>Cancelar</Text>
          </TouchableOpacity>
        )}

        {/* Botao Fechar */}
        {onClose && !pairingCode && !qrCodeBase64 && (
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Fechar</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // ScrollView
  scrollView: {
    flex: 1,                                     //......Ocupa espaco
    backgroundColor: COLORS.background,          //......Fundo branco
  },

  // Conteudo do scroll
  scrollContent: {
    flexGrow: 1,                                 //......Cresce conforme conteudo
    paddingVertical: 24,                         //......Padding vertical
  },

  // Container principal
  container: {
    flex: 1,                                     //......Ocupa espaco
    alignItems: 'center',                        //......Centraliza horizontal
    paddingHorizontal: 24,                       //......Padding horizontal
  },

  // Container do icone
  iconContainer: {
    marginBottom: 24,                            //......Margem inferior
  },

  // Titulo
  title: {
    fontSize: 24,                                //......Tamanho fonte
    fontFamily: 'Inter_700Bold',                 //......Fonte bold
    color: COLORS.textPrimary,                   //......Cor escura
    marginBottom: 12,                            //......Margem inferior
    textAlign: 'center',                         //......Centraliza
  },

  // Instrucoes
  instructions: {
    fontSize: 15,                                //......Tamanho fonte
    fontFamily: 'Inter_400Regular',              //......Fonte regular
    color: COLORS.textSecondary,                 //......Cor cinza
    textAlign: 'center',                         //......Centraliza
    marginBottom: 24,                            //......Margem inferior
    paddingHorizontal: 16,                       //......Padding horizontal
  },

  // Container do input
  inputContainer: {
    width: '100%',                               //......Largura total
    marginBottom: 24,                            //......Margem inferior
  },

  // Label do input
  inputLabel: {
    fontSize: 14,                                //......Tamanho fonte
    fontFamily: 'Inter_500Medium',               //......Fonte media
    color: COLORS.textPrimary,                   //......Cor escura
    marginBottom: 8,                             //......Margem inferior
  },

  // Input de telefone
  phoneInput: {
    width: '100%',                               //......Largura total
    height: 52,                                  //......Altura
    backgroundColor: COLORS.white,               //......Fundo branco
    borderWidth: 1,                              //......Largura borda
    borderColor: COLORS.border,                  //......Cor da borda
    borderRadius: 12,                            //......Borda arredondada
    paddingHorizontal: 16,                       //......Padding horizontal
    fontSize: 18,                                //......Tamanho fonte
    fontFamily: 'Inter_500Medium',               //......Fonte media
    color: COLORS.textPrimary,                   //......Cor escura
  },

  // Container do codigo
  codeContainer: {
    width: '100%',                               //......Largura total
    alignItems: 'center',                        //......Centraliza
  },

  // Label do codigo
  codeLabel: {
    fontSize: 14,                                //......Tamanho fonte
    fontFamily: 'Inter_500Medium',               //......Fonte media
    color: COLORS.textSecondary,                 //......Cor cinza
    marginBottom: 12,                            //......Margem inferior
  },

  // Box do codigo
  codeBox: {
    backgroundColor: COLORS.primary,             //......Fundo azul
    paddingHorizontal: 32,                       //......Padding horizontal
    paddingVertical: 20,                         //......Padding vertical
    borderRadius: 16,                            //......Borda arredondada
    marginBottom: 16,                            //......Margem inferior
  },

  // Texto do codigo
  codeText: {
    fontSize: 32,                                //......Tamanho grande
    fontFamily: 'Inter_700Bold',                 //......Fonte bold
    color: COLORS.white,                         //......Cor branca
    letterSpacing: 4,                            //......Espacamento
  },

  // Box do QR Code
  qrCodeBox: {
    backgroundColor: COLORS.white,               //......Fundo branco
    padding: 16,                                 //......Padding
    borderRadius: 16,                            //......Borda arredondada
    marginBottom: 16,                            //......Margem inferior
    borderWidth: 1,                              //......Largura borda
    borderColor: COLORS.border,                  //......Cor da borda
  },

  // Imagem do QR Code
  qrCodeImage: {
    width: 220,                                  //......Largura
    height: 220,                                 //......Altura
  },

  // Botao alternar modo
  switchModeButton: {
    marginTop: 12,                               //......Margem superior
    paddingVertical: 8,                          //......Padding vertical
  },

  // Texto alternar modo
  switchModeText: {
    fontSize: 14,                                //......Tamanho fonte
    fontFamily: 'Inter_500Medium',               //......Fonte media
    color: COLORS.primary,                       //......Cor azul
    textDecorationLine: 'underline',             //......Sublinhado
  },

  // Botao copiar
  copyButton: {
    flexDirection: 'row',                        //......Layout horizontal
    alignItems: 'center',                        //......Centraliza vertical
    paddingVertical: 8,                          //......Padding vertical
    marginBottom: 8,                             //......Margem inferior
  },

  // Texto do botao copiar
  copyButtonText: {
    fontSize: 14,                                //......Tamanho fonte
    fontFamily: 'Inter_500Medium',               //......Fonte media
    color: COLORS.primary,                       //......Cor azul
    marginLeft: 6,                               //......Margem esquerda
  },

  // Texto countdown
  countdownText: {
    fontSize: 14,                                //......Tamanho fonte
    fontFamily: 'Inter_400Regular',              //......Fonte regular
    color: COLORS.warning,                       //......Cor amarela
    marginBottom: 20,                            //......Margem inferior
  },

  // Box de instrucoes
  instructionsBox: {
    width: '100%',                               //......Largura total
    backgroundColor: COLORS.backgroundAlt,       //......Fundo cinza
    borderRadius: 12,                            //......Borda arredondada
    padding: 16,                                 //......Padding
    marginBottom: 20,                            //......Margem inferior
  },

  // Titulo instrucao
  instructionTitle: {
    fontSize: 14,                                //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',             //......Fonte bold
    color: COLORS.textPrimary,                   //......Cor escura
    marginBottom: 12,                            //......Margem inferior
  },

  // Linha do passo
  stepRow: {
    flexDirection: 'row',                        //......Layout horizontal
    alignItems: 'flex-start',                    //......Alinha topo
    marginBottom: 10,                            //......Margem inferior
  },

  // Numero do passo
  stepNumber: {
    width: 24,                                   //......Largura
    height: 24,                                  //......Altura
    borderRadius: 12,                            //......Circular
    backgroundColor: COLORS.primary,             //......Fundo azul
    color: COLORS.white,                         //......Texto branco
    fontSize: 12,                                //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',             //......Fonte bold
    textAlign: 'center',                         //......Centraliza
    lineHeight: 24,                              //......Altura da linha
    marginRight: 10,                             //......Margem direita
  },

  // Texto do passo
  stepText: {
    flex: 1,                                     //......Ocupa espaco
    fontSize: 13,                                //......Tamanho fonte
    fontFamily: 'Inter_400Regular',              //......Fonte regular
    color: COLORS.textPrimary,                   //......Cor escura
    lineHeight: 20,                              //......Altura linha
  },

  // Botao abrir WhatsApp
  openWhatsAppButton: {
    flexDirection: 'row',                        //......Layout horizontal
    alignItems: 'center',                        //......Centraliza vertical
    justifyContent: 'center',                    //......Centraliza horizontal
    width: '100%',                               //......Largura total
    height: 48,                                  //......Altura
    backgroundColor: COLORS.whatsapp,            //......Fundo verde
    borderRadius: 24,                            //......Borda arredondada
    marginBottom: 16,                            //......Margem inferior
  },

  // Texto botao WhatsApp
  openWhatsAppText: {
    fontSize: 16,                                //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',             //......Fonte bold
    color: COLORS.white,                         //......Cor branca
    marginLeft: 8,                               //......Margem esquerda
  },

  // Linha aguardando
  waitingRow: {
    flexDirection: 'row',                        //......Layout horizontal
    alignItems: 'center',                        //......Centraliza vertical
    marginTop: 8,                                //......Margem superior
  },

  // Texto aguardando
  waitingText: {
    fontSize: 14,                                //......Tamanho fonte
    fontFamily: 'Inter_400Regular',              //......Fonte regular
    color: COLORS.textSecondary,                 //......Cor cinza
    marginLeft: 8,                               //......Margem esquerda
  },

  // Botao gerar codigo
  generateButton: {
    width: '100%',                               //......Largura total
    height: 52,                                  //......Altura
    backgroundColor: COLORS.primary,             //......Fundo azul
    borderRadius: 26,                            //......Borda arredondada
    justifyContent: 'center',                    //......Centraliza vertical
    alignItems: 'center',                        //......Centraliza horizontal
    marginBottom: 12,                            //......Margem inferior
  },

  // Texto botao gerar
  generateButtonText: {
    fontSize: 16,                                //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',             //......Fonte bold
    color: COLORS.white,                         //......Cor branca
  },

  // Botao novo codigo
  newCodeButton: {
    width: '100%',                               //......Largura total
    height: 48,                                  //......Altura
    backgroundColor: 'transparent',              //......Fundo transparente
    borderWidth: 1,                              //......Largura borda
    borderColor: COLORS.danger,                  //......Cor vermelha
    borderRadius: 24,                            //......Borda arredondada
    justifyContent: 'center',                    //......Centraliza vertical
    alignItems: 'center',                        //......Centraliza horizontal
    marginTop: 16,                               //......Margem superior
  },

  // Texto botao novo codigo
  newCodeButtonText: {
    fontSize: 16,                                //......Tamanho fonte
    fontFamily: 'Inter_500Medium',               //......Fonte media
    color: COLORS.danger,                        //......Cor vermelha
  },

  // Botao desabilitado
  buttonDisabled: {
    opacity: 0.5,                                //......Opacidade
  },

  // Texto de loading
  loadingText: {
    marginTop: 16,                               //......Margem superior
    fontSize: 16,                                //......Tamanho fonte
    fontFamily: 'Inter_400Regular',              //......Fonte regular
    color: COLORS.textSecondary,                 //......Cor cinza
  },

  // Titulo conectado
  connectedTitle: {
    fontSize: 24,                                //......Tamanho fonte
    fontFamily: 'Inter_700Bold',                 //......Fonte bold
    color: COLORS.success,                       //......Cor verde
    marginBottom: 12,                            //......Margem inferior
    textAlign: 'center',                         //......Centraliza
  },

  // Subtitulo conectado
  connectedSubtitle: {
    fontSize: 15,                                //......Tamanho fonte
    fontFamily: 'Inter_400Regular',              //......Fonte regular
    color: COLORS.textSecondary,                 //......Cor cinza
    textAlign: 'center',                         //......Centraliza
    marginBottom: 24,                            //......Margem inferior
    paddingHorizontal: 16,                       //......Padding horizontal
  },

  // Card de status
  statusCard: {
    width: '100%',                               //......Largura total
    backgroundColor: COLORS.backgroundAlt,       //......Fundo cinza
    borderRadius: 12,                            //......Borda arredondada
    padding: 16,                                 //......Padding
    marginBottom: 24,                            //......Margem inferior
  },

  // Linha de status
  statusRow: {
    flexDirection: 'row',                        //......Layout horizontal
    justifyContent: 'space-between',             //......Espaco entre
    alignItems: 'center',                        //......Centraliza vertical
  },

  // Label de status
  statusLabel: {
    fontSize: 14,                                //......Tamanho fonte
    fontFamily: 'Inter_500Medium',               //......Fonte media
    color: COLORS.textSecondary,                 //......Cor cinza
  },

  // Badge de status
  statusBadge: {
    flexDirection: 'row',                        //......Layout horizontal
    alignItems: 'center',                        //......Centraliza vertical
    backgroundColor: 'rgba(34, 197, 94, 0.1)',   //......Fundo verde claro
    paddingHorizontal: 12,                       //......Padding horizontal
    paddingVertical: 6,                          //......Padding vertical
    borderRadius: 16,                            //......Borda arredondada
  },

  // Ponto de status
  statusDot: {
    width: 8,                                    //......Largura
    height: 8,                                   //......Altura
    borderRadius: 4,                             //......Circular
    backgroundColor: COLORS.success,             //......Verde
    marginRight: 8,                              //......Margem direita
  },

  // Texto de status
  statusText: {
    fontSize: 14,                                //......Tamanho fonte
    fontFamily: 'Inter_500Medium',               //......Fonte media
    color: COLORS.success,                       //......Cor verde
  },

  // Botao desconectar
  disconnectButton: {
    width: '100%',                               //......Largura total
    height: 48,                                  //......Altura
    backgroundColor: COLORS.danger,              //......Fundo vermelho
    borderRadius: 24,                            //......Borda arredondada
    justifyContent: 'center',                    //......Centraliza vertical
    alignItems: 'center',                        //......Centraliza horizontal
    marginBottom: 12,                            //......Margem inferior
  },

  // Texto do botao desconectar
  disconnectButtonText: {
    fontSize: 16,                                //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',             //......Fonte bold
    color: COLORS.white,                         //......Cor branca
  },

  // Botao fechar
  closeButton: {
    width: '100%',                               //......Largura total
    height: 48,                                  //......Altura
    backgroundColor: 'transparent',              //......Fundo transparente
    justifyContent: 'center',                    //......Centraliza vertical
    alignItems: 'center',                        //......Centraliza horizontal
  },

  // Texto botao fechar
  closeButtonText: {
    fontSize: 16,                                //......Tamanho fonte
    fontFamily: 'Inter_500Medium',               //......Fonte media
    color: COLORS.textSecondary,                 //......Cor cinza
  },

  // Header conectado compacto
  connectedHeader: {
    flexDirection: 'row',                        //......Layout horizontal
    alignItems: 'center',                        //......Centraliza vertical
    padding: 16,                                 //......Padding
    backgroundColor: COLORS.white,               //......Fundo branco
    borderBottomWidth: 1,                        //......Borda inferior
    borderBottomColor: COLORS.border,            //......Cor da borda
  },

  // Icone pequeno
  iconContainerSmall: {
    marginRight: 12,                             //......Margem direita
  },

  // Texto header conectado
  connectedHeaderText: {
    flex: 1,                                     //......Ocupa espaco
  },

  // Titulo conectado pequeno
  connectedTitleSmall: {
    fontSize: 16,                                //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',             //......Fonte bold
    color: COLORS.textPrimary,                   //......Cor escura
    marginBottom: 4,                             //......Margem inferior
  },

  // Badge status pequeno
  statusBadgeSmall: {
    flexDirection: 'row',                        //......Layout horizontal
    alignItems: 'center',                        //......Centraliza vertical
  },

  // Texto status pequeno
  statusTextSmall: {
    fontSize: 12,                                //......Tamanho fonte
    fontFamily: 'Inter_400Regular',              //......Fonte regular
    color: COLORS.success,                       //......Cor verde
  },

  // Botao desconectar pequeno
  disconnectButtonSmall: {
    paddingHorizontal: 12,                       //......Padding horizontal
    paddingVertical: 6,                          //......Padding vertical
  },

  // Texto botao desconectar pequeno
  disconnectButtonTextSmall: {
    fontSize: 14,                                //......Tamanho fonte
    fontFamily: 'Inter_500Medium',               //......Fonte media
    color: COLORS.danger,                        //......Cor vermelha
  },

  // Container de chats
  chatsContainer: {
    flex: 1,                                     //......Ocupa espaco
    backgroundColor: COLORS.background,          //......Fundo branco
  },

  // Header de chats
  chatsHeader: {
    flexDirection: 'row',                        //......Layout horizontal
    justifyContent: 'space-between',             //......Espaco entre
    alignItems: 'center',                        //......Centraliza vertical
    paddingHorizontal: 16,                       //......Padding horizontal
    paddingVertical: 12,                         //......Padding vertical
  },

  // Titulo de chats
  chatsTitle: {
    fontSize: 18,                                //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',             //......Fonte bold
    color: COLORS.textPrimary,                   //......Cor escura
  },

  // Botao atualizar
  refreshButton: {
    paddingHorizontal: 12,                       //......Padding horizontal
    paddingVertical: 6,                          //......Padding vertical
    backgroundColor: COLORS.primary,             //......Fundo azul
    borderRadius: 12,                            //......Borda arredondada
  },

  // Texto botao atualizar
  refreshButtonText: {
    fontSize: 12,                                //......Tamanho fonte
    fontFamily: 'Inter_500Medium',               //......Fonte media
    color: COLORS.white,                         //......Cor branca
  },

  // Loading de chats
  chatsLoading: {
    flex: 1,                                     //......Ocupa espaco
    justifyContent: 'center',                    //......Centraliza vertical
    alignItems: 'center',                        //......Centraliza horizontal
    paddingVertical: 40,                         //......Padding vertical
  },

  // Texto loading chats
  chatsLoadingText: {
    marginTop: 12,                               //......Margem superior
    fontSize: 14,                                //......Tamanho fonte
    fontFamily: 'Inter_400Regular',              //......Fonte regular
    color: COLORS.textSecondary,                 //......Cor cinza
  },

  // Chats vazio
  chatsEmpty: {
    flex: 1,                                     //......Ocupa espaco
    justifyContent: 'center',                    //......Centraliza vertical
    alignItems: 'center',                        //......Centraliza horizontal
    paddingVertical: 40,                         //......Padding vertical
    paddingHorizontal: 24,                       //......Padding horizontal
  },

  // Titulo chats vazio
  chatsEmptyTitle: {
    marginTop: 16,                               //......Margem superior
    fontSize: 16,                                //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',             //......Fonte bold
    color: COLORS.textPrimary,                   //......Cor escura
  },

  // Texto chats vazio
  chatsEmptyText: {
    marginTop: 8,                                //......Margem superior
    fontSize: 14,                                //......Tamanho fonte
    fontFamily: 'Inter_400Regular',              //......Fonte regular
    color: COLORS.textSecondary,                 //......Cor cinza
    textAlign: 'center',                         //......Centraliza
  },

  // Lista de chats
  chatsList: {
    paddingHorizontal: 16,                       //......Padding horizontal
  },

  // Item de chat
  chatItem: {
    flexDirection: 'row',                        //......Layout horizontal
    alignItems: 'center',                        //......Centraliza vertical
    paddingVertical: 12,                         //......Padding vertical
    borderBottomWidth: 1,                        //......Borda inferior
    borderBottomColor: COLORS.border,            //......Cor da borda
  },

  // Avatar do chat
  chatAvatar: {
    width: 48,                                   //......Largura
    height: 48,                                  //......Altura
    borderRadius: 24,                            //......Circular
    backgroundColor: COLORS.primary,             //......Fundo azul
    justifyContent: 'center',                    //......Centraliza vertical
    alignItems: 'center',                        //......Centraliza horizontal
    marginRight: 12,                             //......Margem direita
  },

  // Texto avatar chat
  chatAvatarText: {
    fontSize: 18,                                //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',             //......Fonte bold
    color: COLORS.white,                         //......Cor branca
  },

  // Info do chat
  chatInfo: {
    flex: 1,                                     //......Ocupa espaco
  },

  // Nome do chat
  chatName: {
    fontSize: 15,                                //......Tamanho fonte
    fontFamily: 'Inter_500Medium',               //......Fonte media
    color: COLORS.textPrimary,                   //......Cor escura
    marginBottom: 4,                             //......Margem inferior
  },

  // Ultima mensagem
  chatLastMessage: {
    fontSize: 13,                                //......Tamanho fonte
    fontFamily: 'Inter_400Regular',              //......Fonte regular
    color: COLORS.textSecondary,                 //......Cor cinza
  },

  // Badge de grupo
  groupBadge: {
    paddingHorizontal: 8,                        //......Padding horizontal
    paddingVertical: 4,                          //......Padding vertical
    backgroundColor: COLORS.backgroundAlt,       //......Fundo cinza
    borderRadius: 8,                             //......Borda arredondada
  },

  // Texto badge grupo
  groupBadgeText: {
    fontSize: 10,                                //......Tamanho fonte
    fontFamily: 'Inter_500Medium',               //......Fonte media
    color: COLORS.textSecondary,                 //......Cor cinza
  },

  // Botao fechar fixo
  closeButtonFixed: {
    paddingVertical: 16,                         //......Padding vertical
    alignItems: 'center',                        //......Centraliza horizontal
    borderTopWidth: 1,                           //......Borda superior
    borderTopColor: COLORS.border,               //......Cor da borda
    backgroundColor: COLORS.white,               //......Fundo branco
  },
});

// ========================================
// Export
// ========================================
export default WhatsAppSetup;
