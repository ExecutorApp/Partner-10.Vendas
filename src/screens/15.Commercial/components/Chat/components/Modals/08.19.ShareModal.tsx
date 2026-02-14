// ========================================
// Componente ShareModal
// Modal para compartilhar/encaminhar imagem
// Layout similar ao WhatsApp oficial
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, {                           //......React core
  useState,                               //......Hook de estado
  useCallback,                            //......Hook de callback
  useMemo,                                //......Hook de memo
  useEffect,                              //......Hook de efeito
  useRef,                                 //......Hook de referencia
} from 'react';                           //......Biblioteca React
import {                                  //......Componentes RN
  View,                                   //......Container basico
  Text,                                   //......Texto
  Image,                                  //......Imagem
  Modal,                                  //......Modal nativo
  StyleSheet,                             //......Estilos
  Pressable,                              //......Toque
  FlatList,                               //......Lista
  TextInput,                              //......Input
  Dimensions,                             //......Dimensoes
  Platform,                               //......Plataforma
  ActivityIndicator,                      //......Loading
} from 'react-native';                    //......Biblioteca RN
import Svg, {                             //......SVG core
  Path,                                   //......Path SVG
  Circle,                                 //......Circle SVG
} from 'react-native-svg';                //......Biblioteca SVG

// ========================================
// Imports de Hooks
// ========================================
import {                                  //......Hook de contatos
  useContacts,                            //......Hook principal
  UnifiedContact,                         //......Tipo unificado
} from '../../hooks/08.useContacts';      //......Arquivo do hook

// ========================================
// Imports de Cores
// ========================================
import { ChatColors } from '../../styles/08.ChatColors';

// ========================================
// Constantes
// ========================================
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ICON_COLOR = '#3A3F51';             //......Cor dos icones
const PRIMARY_COLOR = '#1777CF';          //......Cor primaria azul
const BORDER_COLOR = '#E5E7EB';           //......Cor das bordas

// ========================================
// Constantes de Performance
// ========================================
const DEBOUNCE_DELAY = 300;               //......Delay do debounce em ms
const ITEM_HEIGHT = 73;                   //......Altura de cada item (padding 12 + avatar 48 + padding 12 + border 1)
const INITIAL_NUM_TO_RENDER = 15;         //......Itens iniciais renderizados
const MAX_TO_RENDER_PER_BATCH = 10;       //......Itens por batch
const WINDOW_SIZE = 5;                    //......Tamanho da janela

// ========================================
// Tipo de Aba
// ========================================
type TabType = 'whatsapp' | 'phone' | 'all';

// ========================================
// Interface de Props
// ========================================
interface ShareModalProps {
  visible: boolean;                       //......Visibilidade
  imageUrl?: string;                      //......URL da imagem (preview)
  instanceName?: string;                  //......Nome da instancia Evolution
  onClose: () => void;                    //......Handler fechar
  onForward: (contactIds: string[], message: string) => void;
}

// ========================================
// Icone de Enviar
// ========================================
const SendIcon: React.FC = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
      stroke="#FFFFFF"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ========================================
// Icone de Busca
// ========================================
const SearchIcon: React.FC = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle
      cx={11}
      cy={11}
      r={8}
      stroke="#9CA3AF"
      strokeWidth={2}
    />
    <Path
      d="M21 21L16.65 16.65"
      stroke="#9CA3AF"
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

// ========================================
// Icone de Limpar (X slim)
// ========================================
const ClearIcon: React.FC = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6L18 18"
      stroke="#9CA3AF"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ========================================
// Icone de Check (para checkbox selecionado)
// ========================================
const CheckIcon: React.FC = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 6L9 17L4 12"
      stroke="#FFFFFF"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ========================================
// Componente Checkbox (circulo ou quadrado com check)
// Nao selecionado: circulo slim
// Selecionado: quadrado azul com check branco
// ========================================
const Checkbox: React.FC<{ selected: boolean }> = ({ selected }) => {
  // Selecionado: quadrado azul com check
  if (selected) {
    return (
      <View style={styles.checkboxSelected}>
        <CheckIcon />
      </View>
    );
  }

  // Nao selecionado: circulo slim
  return (
    <View style={styles.checkboxOuter} />
  );
};

// ========================================
// Componente Indicador Online (bolinha verde)
// Aparece apenas para contatos do WhatsApp
// ========================================
const OnlineIndicator: React.FC<{ isWhatsApp: boolean }> = ({ isWhatsApp }) => {
  // Nao mostra para contatos da agenda
  if (!isWhatsApp) return null;

  return (
    <View style={styles.onlineIndicator} />
  );
};

// ========================================
// Funcao para formatar numero com 2 digitos
// ========================================
const formatTwoDigits = (num: number): string => {
  return num.toString().padStart(2, '0');
};

// ========================================
// Funcao para formatar telefone (XX XXXXX-XXXX)
// ========================================
const formatPhoneDisplay = (phone: string): string => {
  // Remove tudo que nao for numero
  const numbers = phone.replace(/\D/g, '');

  // Formato brasileiro: XX XXXXX-XXXX (11 digitos)
  if (numbers.length === 11) {
    return `${numbers.slice(0, 2)} ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  }

  // Formato brasileiro: XX XXXX-XXXX (10 digitos)
  if (numbers.length === 10) {
    return `${numbers.slice(0, 2)} ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  }

  // Se tiver codigo do pais (55): 55 XX XXXXX-XXXX
  if (numbers.length === 13 && numbers.startsWith('55')) {
    return `${numbers.slice(2, 4)} ${numbers.slice(4, 9)}-${numbers.slice(9)}`;
  }

  // Se tiver codigo do pais (55): 55 XX XXXX-XXXX
  if (numbers.length === 12 && numbers.startsWith('55')) {
    return `${numbers.slice(2, 4)} ${numbers.slice(4, 8)}-${numbers.slice(8)}`;
  }

  // Retorna como esta se nao encaixar
  return phone;
};

// ========================================
// Funcao para gerar iniciais do nome
// Pula caracteres especiais na segunda palavra
// ========================================
const getInitials = (name: string): string => {
  // Separa palavras
  const words = name.trim().split(/\s+/);

  // Se nao tem palavras, retorna ??
  if (words.length === 0 || !words[0]) {
    return '??';
  }

  // Primeira letra da primeira palavra
  let firstInitial = '';
  for (const char of words[0]) {
    if (/[a-zA-Z]/.test(char)) {
      firstInitial = char.toUpperCase();
      break;
    }
  }

  // Se nao encontrou letra na primeira palavra
  if (!firstInitial) {
    firstInitial = words[0][0]?.toUpperCase() || '?';
  }

  // Se so tem uma palavra, retorna a primeira letra duplicada ou so uma
  if (words.length === 1) {
    return firstInitial + firstInitial;
  }

  // Segunda inicial - pula caracteres especiais
  let secondInitial = '';
  for (let i = 1; i < words.length; i++) {
    for (const char of words[i]) {
      if (/[a-zA-Z]/.test(char)) {
        secondInitial = char.toUpperCase();
        break;
      }
    }
    if (secondInitial) break;
  }

  // Se nao encontrou letra na segunda palavra
  if (!secondInitial) {
    secondInitial = firstInitial;
  }

  return firstInitial + secondInitial;
};

// ========================================
// Componente Item de Contato (Memoizado)
// ========================================
const ContactItem: React.FC<{
  contact: UnifiedContact;
  selected: boolean;
  onPress: () => void;
}> = React.memo(({ contact, selected, onPress }) => {
  // Estado de loading da imagem
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Gera iniciais do nome usando a nova funcao
  const initials = getInitials(contact.name);

  // Handler de carregamento da imagem
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  // Handler de erro da imagem
  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  // Verifica se deve mostrar imagem
  const showImage = contact.photo && !imageError;

  return (
    <Pressable
      style={styles.contactItem}
      onPress={onPress}
    >
      {/* Avatar - todos azuis */}
      <View style={styles.contactAvatar}>
        {showImage ? (
          <>
            {/* Placeholder enquanto carrega */}
            {!imageLoaded && (
              <View style={[styles.contactAvatarPlaceholder, styles.avatarLoading]}>
                <Text style={styles.contactAvatarInitials}>
                  {initials}
                </Text>
              </View>
            )}
            {/* Imagem com cache */}
            <Image
              source={{
                uri: contact.photo,
                cache: 'force-cache',
              }}
              style={[
                styles.contactAvatarImage,
                !imageLoaded && styles.imageHidden,
              ]}
              onLoad={handleImageLoad}
              onError={handleImageError}
              progressiveRenderingEnabled={true}
            />
          </>
        ) : (
          <View style={styles.contactAvatarPlaceholder}>
            <Text style={styles.contactAvatarInitials}>
              {initials}
            </Text>
          </View>
        )}
        {/* Indicador online - apenas WhatsApp */}
        <OnlineIndicator isWhatsApp={contact.source === 'whatsapp'} />
      </View>

      {/* Info */}
      <View style={styles.contactInfo}>
        <Text style={styles.contactName} numberOfLines={1}>
          {contact.name}
        </Text>
        <Text style={styles.contactPhone} numberOfLines={1}>
          {formatPhoneDisplay(contact.phone)}
        </Text>
      </View>

      {/* Checkbox */}
      <Checkbox selected={selected} />
    </Pressable>
  );
});

// ========================================
// Componente Principal ShareModal
// ========================================
const ShareModal: React.FC<ShareModalProps> = ({
  visible,                                //......Visibilidade
  imageUrl,                               //......URL da imagem
  instanceName,                           //......Nome da instancia
  onClose,                                //......Handler fechar
  onForward,                              //......Handler encaminhar
}) => {
  // ========================================
  // Hook de Contatos
  // ========================================
  const {
    phoneContacts,                        //......Contatos da agenda
    whatsappContacts,                     //......Contatos do WhatsApp
    allContacts,                          //......Todos os contatos
    isLoadingPhone,                       //......Loading agenda
    isLoadingWhatsApp,                    //......Loading WhatsApp
    errorPhone,                           //......Erro agenda
    errorWhatsApp,                        //......Erro WhatsApp
    refreshAll,                           //......Atualiza todos
  } = useContacts(instanceName);

  // ========================================
  // Estados
  // ========================================
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('whatsapp');
  const [inputHeight, setInputHeight] = useState(40);

  // ========================================
  // Refs
  // ========================================
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ========================================
  // Constantes de Altura do Input
  // ========================================
  const MIN_INPUT_HEIGHT = 40;            //......Altura minima (2 linhas)
  const MAX_INPUT_HEIGHT = 100;           //......Altura maxima (5 linhas)

  // ========================================
  // Handler de Mudanca de Tamanho do Input
  // ========================================
  const handleContentSizeChange = useCallback((event: any) => {
    const contentHeight = event.nativeEvent.contentSize.height;
    // Limita entre min e max
    const newHeight = Math.min(Math.max(contentHeight, MIN_INPUT_HEIGHT), MAX_INPUT_HEIGHT);
    setInputHeight(newHeight);
  }, []);

  // ========================================
  // Efeito: Atualizar contatos quando modal abre
  // ========================================
  useEffect(() => {
    if (visible) {
      refreshAll();                       //......Busca contatos ao abrir
    }
  }, [visible, refreshAll]);

  // ========================================
  // Efeito: Debounce da Busca
  // ========================================
  useEffect(() => {
    // Limpa timeout anterior
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Se query vazia, atualiza imediatamente
    if (searchQuery === '') {
      setDebouncedSearch('');
      return;
    }

    // Configura novo timeout
    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, DEBOUNCE_DELAY);

    // Cleanup
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // ========================================
  // Contatos da Aba Ativa
  // ========================================
  const tabContacts = useMemo(() => {
    switch (activeTab) {
      case 'whatsapp':
        return whatsappContacts;
      case 'phone':
        return phoneContacts;
      case 'all':
      default:
        return allContacts;
    }
  }, [activeTab, whatsappContacts, phoneContacts, allContacts]);

  // ========================================
  // Filtrar Contatos pela Busca (com Debounce)
  // ========================================
  const filteredContacts = useMemo(() => {
    // Usa debouncedSearch para filtrar
    if (!debouncedSearch.trim()) {
      return tabContacts;
    }

    const query = debouncedSearch.toLowerCase();
    return tabContacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(query) ||
        contact.phone.includes(query)
    );
  }, [debouncedSearch, tabContacts]);

  // ========================================
  // Loading Geral
  // ========================================
  const isLoadingContacts = isLoadingPhone || isLoadingWhatsApp;

  // ========================================
  // Toggle Selecao de Contato
  // ========================================
  const handleToggleContact = useCallback((contactId: string) => {
    setSelectedContacts((prev) => {
      if (prev.includes(contactId)) {
        return prev.filter((id) => id !== contactId);
      }
      return [...prev, contactId];
    });
  }, []);

  // ========================================
  // Handler de Encaminhar
  // ========================================
  const handleForward = useCallback(async () => {
    if (selectedContacts.length === 0) return;

    setIsLoading(true);

    try {
      // Chama callback de encaminhamento
      await onForward(selectedContacts, message);

      // Limpa timeout de debounce
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Limpa estados
      setSelectedContacts([]);
      setMessage('');
      setSearchQuery('');
      setDebouncedSearch('');
      setInputHeight(MIN_INPUT_HEIGHT);

      // Fecha modal
      onClose();
    } catch (error) {
      console.error('[ShareModal] Erro ao encaminhar:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedContacts, message, onForward, onClose]);

  // ========================================
  // Handler de Fechar
  // ========================================
  const handleClose = useCallback(() => {
    // Limpa timeout de debounce
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Limpa estados
    setSelectedContacts([]);
    setMessage('');
    setSearchQuery('');
    setDebouncedSearch('');
    setActiveTab('whatsapp');
    setInputHeight(MIN_INPUT_HEIGHT);

    // Fecha modal
    onClose();
  }, [onClose]);

  // ========================================
  // Render Item da Lista
  // ========================================
  const renderContactItem = useCallback(
    ({ item }: { item: UnifiedContact }) => (
      <ContactItem
        contact={item}
        selected={selectedContacts.includes(item.id)}
        onPress={() => handleToggleContact(item.id)}
      />
    ),
    [selectedContacts, handleToggleContact]
  );

  // ========================================
  // Key Extractor
  // ========================================
  const keyExtractor = useCallback((item: UnifiedContact) => item.id, []);

  // ========================================
  // Get Item Layout (Otimizacao)
  // ========================================
  const getItemLayout = useCallback((
    _data: ArrayLike<UnifiedContact> | null | undefined,
    index: number
  ) => ({
    length: ITEM_HEIGHT,                  //......Altura do item
    offset: ITEM_HEIGHT * index,          //......Offset baseado no index
    index,                                //......Index do item
  }), []);

  // ========================================
  // Render Lista Vazia / Loading / Erro
  // ========================================
  const renderListEmpty = useCallback(() => {
    // Loading
    if (isLoadingContacts) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          <Text style={styles.loadingText}>
            Carregando contatos...
          </Text>
        </View>
      );
    }

    // Erro
    const error = activeTab === 'whatsapp' ? errorWhatsApp : errorPhone;
    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>
            {error}
          </Text>
          <Pressable
            style={styles.retryButton}
            onPress={refreshAll}
          >
            <Text style={styles.retryButtonText}>
              Tentar novamente
            </Text>
          </Pressable>
        </View>
      );
    }

    // Vazio
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {searchQuery
            ? 'Nenhum contato encontrado'
            : activeTab === 'whatsapp'
              ? 'Nenhum contato do WhatsApp'
              : activeTab === 'phone'
                ? 'Nenhum contato da agenda'
                : 'Nenhum contato disponível'}
        </Text>
      </View>
    );
  }, [isLoadingContacts, activeTab, errorWhatsApp, errorPhone, searchQuery, refreshAll]);

  // ========================================
  // Render Principal
  // ========================================
  return (
    <Modal
      visible={visible}                   //......Visibilidade
      transparent                         //......Fundo transparente
      animationType="slide"               //......Animacao slide
      onRequestClose={handleClose}        //......Handler fechar
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            {/* Titulo alinhado a esquerda */}
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>
                Encaminhar para
              </Text>

              {/* Contador de selecionados - apenas digitos */}
              {selectedContacts.length > 0 && (
                <Text style={styles.selectedCount}>
                  {formatTwoDigits(selectedContacts.length)}
                </Text>
              )}
            </View>

            {/* Botao Cancelar a direita */}
            <Pressable
              style={styles.cancelButton}
              onPress={handleClose}
              hitSlop={12}
            >
              <Text style={styles.cancelButtonText}>
                Cancelar
              </Text>
            </Pressable>
          </View>

          {/* Abas de Filtro */}
          <View style={styles.tabsContainer}>
            {/* Aba WhatsApp */}
            <Pressable
              style={[
                styles.tab,
                activeTab === 'whatsapp' && styles.tabActive,
              ]}
              onPress={() => setActiveTab('whatsapp')}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'whatsapp' && styles.tabTextActive,
              ]}>
                WhatsApp ({formatTwoDigits(whatsappContacts.length)})
              </Text>
            </Pressable>

            {/* Aba Agenda */}
            <Pressable
              style={[
                styles.tab,
                activeTab === 'phone' && styles.tabActive,
              ]}
              onPress={() => setActiveTab('phone')}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'phone' && styles.tabTextActive,
              ]}>
                Agenda ({formatTwoDigits(phoneContacts.length)})
              </Text>
            </Pressable>

            {/* Aba Todos */}
            <Pressable
              style={[
                styles.tab,
                activeTab === 'all' && styles.tabActive,
              ]}
              onPress={() => setActiveTab('all')}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'all' && styles.tabTextActive,
              ]}>
                Todos ({formatTwoDigits(allContacts.length)})
              </Text>
            </Pressable>
          </View>

          {/* Campo de Busca */}
          <View style={styles.searchContainer}>
            <SearchIcon />
            <TextInput
              style={styles.searchInput}
              placeholder="Pesquisar contatos..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {/* Botao limpar - aparece quando tem texto */}
            {searchQuery.length > 0 && (
              <Pressable
                style={styles.clearButton}
                onPress={() => setSearchQuery('')}
                hitSlop={8}
              >
                <ClearIcon />
              </Pressable>
            )}
          </View>

          {/* Preview da Imagem (se houver) */}
          {imageUrl && (
            <View style={styles.previewContainer}>
              <Image
                source={{ uri: imageUrl }}
                style={styles.previewImage}
                resizeMode="cover"
              />
            </View>
          )}

          {/* Lista de Contatos (Otimizada) */}
          <FlatList
            data={filteredContacts}
            renderItem={renderContactItem}
            keyExtractor={keyExtractor}
            style={styles.contactList}
            contentContainerStyle={styles.contactListContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderListEmpty}
            getItemLayout={getItemLayout}
            initialNumToRender={INITIAL_NUM_TO_RENDER}
            maxToRenderPerBatch={MAX_TO_RENDER_PER_BATCH}
            windowSize={WINDOW_SIZE}
            removeClippedSubviews={true}
            updateCellsBatchingPeriod={50}
          />

          {/* Footer com Input e Botao empilhados */}
          <View style={styles.footer}>
            {/* Campo de Mensagem - largura total com altura dinamica */}
            <View style={styles.messageInputContainer}>
              <TextInput
                style={[
                  styles.messageInput,
                  { height: inputHeight },
                ]}
                placeholder="Adicionar mensagem..."
                placeholderTextColor="#9CA3AF"
                value={message}
                onChangeText={setMessage}
                multiline
                maxLength={500}
                scrollEnabled={inputHeight >= MAX_INPUT_HEIGHT}
                onContentSizeChange={handleContentSizeChange}
              />
              {/* Botao limpar - aparece quando tem texto */}
              {message.length > 0 && (
                <Pressable
                  style={styles.clearButtonMessage}
                  onPress={() => {
                    setMessage('');
                    setInputHeight(MIN_INPUT_HEIGHT);
                  }}
                  hitSlop={8}
                >
                  <ClearIcon />
                </Pressable>
              )}
            </View>

            {/* Botao Encaminhar - largura total abaixo */}
            <Pressable
              style={[
                styles.shareButton,
                selectedContacts.length === 0 && styles.shareButtonDisabled,
              ]}
              onPress={handleForward}
              disabled={selectedContacts.length === 0 || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <SendIcon />
                  <Text style={styles.shareButtonText}>
                    Encaminhar
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ========================================
// Export Default
// ========================================
export default ShareModal;

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Overlay escuro
  overlay: {
    flex: 1,                              //......Ocupa tudo
    backgroundColor: 'rgba(0,0,0,0.5)',   //......Fundo semi-transparente
    justifyContent: 'flex-end',           //......Alinha embaixo
  },

  // Container do modal - ocupa 90% da tela
  container: {
    backgroundColor: '#FFFFFF',           //......Fundo branco
    borderTopLeftRadius: 20,              //......Borda superior esquerda
    borderTopRightRadius: 20,             //......Borda superior direita
    height: '90%',                        //......Altura 90% da tela
  },

  // Header
  header: {
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    justifyContent: 'space-between',      //......Distribui nas pontas
    paddingHorizontal: 16,                //......Padding horizontal
    paddingVertical: 16,                  //......Padding vertical
    borderBottomWidth: 1,                 //......Borda inferior
    borderBottomColor: BORDER_COLOR,      //......Cor da borda
  },

  // Lado esquerdo do header (titulo + contador)
  headerLeft: {
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    gap: 12,                              //......Espaco entre titulo e contador
  },

  // Titulo do header
  headerTitle: {
    fontFamily: 'Inter_600SemiBold',      //......Fonte bold
    fontSize: 18,                         //......Tamanho fonte
    color: ICON_COLOR,                    //......Cor do texto
  },

  // Contador de selecionados - mesmo tamanho do titulo
  selectedCount: {
    fontFamily: 'Inter_600SemiBold',      //......Fonte bold
    fontSize: 18,                         //......Tamanho fonte igual titulo
    color: PRIMARY_COLOR,                 //......Cor azul
  },

  // Botao cancelar
  cancelButton: {
    paddingHorizontal: 12,                //......Padding horizontal
    paddingVertical: 8,                   //......Padding vertical
  },

  // Texto do botao cancelar
  cancelButtonText: {
    fontFamily: 'Inter_500Medium',        //......Fonte medium
    fontSize: 15,                         //......Tamanho fonte
    color: PRIMARY_COLOR,                 //......Cor azul
  },

  // Container das abas
  tabsContainer: {
    flexDirection: 'row',                 //......Layout horizontal
    paddingHorizontal: 16,                //......Padding horizontal
    paddingVertical: 8,                   //......Padding vertical
    gap: 8,                               //......Espaco entre abas
  },

  // Aba individual
  tab: {
    flex: 1,                              //......Ocupa espaco igual
    paddingVertical: 8,                   //......Padding vertical
    paddingHorizontal: 12,                //......Padding horizontal
    borderRadius: 8,                      //......Borda arredondada
    backgroundColor: '#F3F4F6',           //......Fundo cinza
    alignItems: 'center',                 //......Centraliza texto
  },

  // Aba ativa
  tabActive: {
    backgroundColor: PRIMARY_COLOR,       //......Fundo azul
  },

  // Texto da aba
  tabText: {
    fontFamily: 'Inter_500Medium',        //......Fonte medium
    fontSize: 12,                         //......Tamanho fonte
    color: '#6B7280',                     //......Cor cinza
  },

  // Texto da aba ativa
  tabTextActive: {
    color: '#FFFFFF',                     //......Cor branca
  },

  // Container de busca
  searchContainer: {
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    backgroundColor: '#F3F4F6',           //......Fundo cinza claro
    marginHorizontal: 16,                 //......Margem horizontal
    marginVertical: 8,                    //......Margem vertical
    paddingHorizontal: 12,                //......Padding horizontal
    borderRadius: 10,                     //......Borda arredondada
    height: 44,                           //......Altura
  },

  // Input de busca
  searchInput: {
    flex: 1,                              //......Ocupa espaco
    fontFamily: 'Inter_400Regular',       //......Fonte regular
    fontSize: 15,                         //......Tamanho fonte
    color: ICON_COLOR,                    //......Cor do texto
    marginLeft: 10,                       //......Margem esquerda
    paddingVertical: 0,                   //......Remove padding vertical
    outlineStyle: 'none' as any,          //......Remove borda de foco (web)
  },

  // Botao de limpar no campo de busca
  clearButton: {
    marginLeft: 8,                        //......Margem esquerda
    padding: 4,                           //......Padding interno
  },

  // Container do preview
  previewContainer: {
    marginHorizontal: 16,                 //......Margem horizontal
    marginBottom: 8,                      //......Margem inferior
    borderRadius: 8,                      //......Borda arredondada
    overflow: 'hidden',                   //......Corta overflow
  },

  // Imagem do preview
  previewImage: {
    width: '100%',                        //......Largura total
    height: 80,                           //......Altura fixa
  },

  // Lista de contatos
  contactList: {
    flex: 1,                              //......Ocupa espaco
  },

  // Conteudo da lista
  contactListContent: {
    paddingHorizontal: 16,                //......Padding horizontal
    flexGrow: 1,                          //......Permite crescer
  },

  // Item de contato
  contactItem: {
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    paddingVertical: 12,                  //......Padding vertical
    borderBottomWidth: 1,                 //......Borda inferior
    borderBottomColor: '#F3F4F6',         //......Cor da borda
  },

  // Avatar do contato - quadrado com cantos arredondados
  contactAvatar: {
    width: 48,                            //......Largura
    height: 48,                           //......Altura
    borderRadius: 8,                      //......Cantos levemente arredondados
    overflow: 'visible',                  //......Permite badge aparecer
    position: 'relative',                 //......Posicao relativa
  },

  // Imagem do avatar
  contactAvatarImage: {
    width: 48,                            //......Largura
    height: 48,                           //......Altura
    borderRadius: 8,                      //......Cantos levemente arredondados
    position: 'absolute',                 //......Sobrepoe placeholder
    top: 0,                               //......Posicao topo
    left: 0,                              //......Posicao esquerda
  },

  // Imagem escondida enquanto carrega
  imageHidden: {
    opacity: 0,                           //......Invisivel enquanto carrega
  },

  // Avatar carregando
  avatarLoading: {
    position: 'absolute',                 //......Sobrepoe
    top: 0,                               //......Posicao topo
    left: 0,                              //......Posicao esquerda
    zIndex: 1,                            //......Acima da imagem
  },

  // Placeholder do avatar - quadrado com cantos arredondados, azul
  contactAvatarPlaceholder: {
    width: 48,                            //......Largura
    height: 48,                           //......Altura
    borderRadius: 8,                      //......Cantos levemente arredondados
    justifyContent: 'center',             //......Centraliza vertical
    alignItems: 'center',                 //......Centraliza horizontal
    backgroundColor: PRIMARY_COLOR,       //......Fundo azul padrao
  },

  // Indicador online - bolinha verde para WhatsApp
  onlineIndicator: {
    position: 'absolute',                 //......Posicao absoluta
    bottom: -2,                           //......Posicao inferior
    right: -2,                            //......Posicao direita
    width: 12,                            //......Largura pequena
    height: 12,                           //......Altura pequena
    borderRadius: 6,                      //......Circular
    backgroundColor: '#25D366',           //......Verde WhatsApp
    borderWidth: 2,                       //......Borda
    borderColor: '#FFFFFF',               //......Borda branca
  },

  // Iniciais do avatar
  contactAvatarInitials: {
    fontFamily: 'Inter_600SemiBold',      //......Fonte bold
    fontSize: 16,                         //......Tamanho fonte
    color: '#FFFFFF',                     //......Cor branca
  },

  // Info do contato
  contactInfo: {
    flex: 1,                              //......Ocupa espaco
    marginLeft: 12,                       //......Margem esquerda
  },

  // Nome do contato
  contactName: {
    fontFamily: 'Inter_500Medium',        //......Fonte medium
    fontSize: 15,                         //......Tamanho fonte
    color: ICON_COLOR,                    //......Cor do texto
    marginBottom: 2,                      //......Margem inferior
  },

  // Telefone do contato
  contactPhone: {
    fontFamily: 'Inter_400Regular',       //......Fonte regular
    fontSize: 13,                         //......Tamanho fonte
    color: '#6B7280',                     //......Cor cinza
  },

  // Checkbox nao selecionado - circulo slim
  checkboxOuter: {
    width: 22,                            //......Largura
    height: 22,                           //......Altura
    borderRadius: 11,                     //......Circular
    borderWidth: 2,                       //......Espessura borda
    borderColor: '#D1D5DB',               //......Cor da borda cinza
  },

  // Checkbox selecionado - quadrado azul com check
  checkboxSelected: {
    width: 22,                            //......Largura
    height: 22,                           //......Altura
    borderRadius: 4,                      //......Cantos levemente arredondados
    backgroundColor: PRIMARY_COLOR,       //......Fundo azul do sistema
    justifyContent: 'center',             //......Centraliza vertical
    alignItems: 'center',                 //......Centraliza horizontal
  },

  // Container vazio
  emptyContainer: {
    flex: 1,                              //......Ocupa espaco
    paddingVertical: 40,                  //......Padding vertical
    alignItems: 'center',                 //......Centraliza horizontal
    justifyContent: 'center',             //......Centraliza vertical
  },

  // Texto vazio
  emptyText: {
    fontFamily: 'Inter_400Regular',       //......Fonte regular
    fontSize: 15,                         //......Tamanho fonte
    color: '#9CA3AF',                     //......Cor cinza
    textAlign: 'center',                  //......Centraliza texto
  },

  // Texto de loading
  loadingText: {
    fontFamily: 'Inter_400Regular',       //......Fonte regular
    fontSize: 14,                         //......Tamanho fonte
    color: '#6B7280',                     //......Cor cinza
    marginTop: 12,                        //......Margem superior
  },

  // Texto de erro
  errorText: {
    fontFamily: 'Inter_400Regular',       //......Fonte regular
    fontSize: 14,                         //......Tamanho fonte
    color: '#EF4444',                     //......Cor vermelha
    textAlign: 'center',                  //......Centraliza texto
    marginBottom: 12,                     //......Margem inferior
  },

  // Botao tentar novamente
  retryButton: {
    paddingHorizontal: 16,                //......Padding horizontal
    paddingVertical: 8,                   //......Padding vertical
    backgroundColor: PRIMARY_COLOR,       //......Fundo azul
    borderRadius: 8,                      //......Borda arredondada
  },

  // Texto do botao tentar novamente
  retryButtonText: {
    fontFamily: 'Inter_500Medium',        //......Fonte medium
    fontSize: 14,                         //......Tamanho fonte
    color: '#FFFFFF',                     //......Cor branca
  },

  // Footer - layout vertical
  footer: {
    flexDirection: 'column',              //......Layout vertical
    paddingHorizontal: 16,                //......Padding horizontal
    paddingVertical: 12,                  //......Padding vertical
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    borderTopWidth: 1,                    //......Borda superior
    borderTopColor: BORDER_COLOR,         //......Cor da borda
    gap: 12,                              //......Espaco entre elementos
  },

  // Container do input de mensagem - altura dinamica 2-5 linhas
  messageInputContainer: {
    width: '100%',                        //......Largura total
    backgroundColor: '#F3F4F6',           //......Fundo cinza claro
    borderRadius: 12,                     //......Cantos levemente arredondados
    paddingLeft: 16,                      //......Padding esquerdo
    paddingRight: 5,                      //......Padding direito menor para X
    paddingVertical: 12,                  //......Padding vertical
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'flex-start',             //......Alinha no topo
  },

  // Input de mensagem - altura dinamica de 2 a 5 linhas
  messageInput: {
    flex: 1,                              //......Ocupa espaco disponivel
    fontFamily: 'Inter_400Regular',       //......Fonte regular
    fontSize: 15,                         //......Tamanho fonte
    color: ICON_COLOR,                    //......Cor do texto
    paddingVertical: 0,                   //......Remove padding vertical
    outlineStyle: 'none' as any,          //......Remove borda de foco (web)
    textAlignVertical: 'top',             //......Texto alinhado no topo
  },

  // Botao de limpar no campo de mensagem
  clearButtonMessage: {
    marginLeft: 4,                        //......Margem esquerda minima
    padding: 4,                           //......Padding interno
    marginTop: 0,                         //......Alinhado no topo
  },

  // Botao de encaminhar - largura total, mais quadrado
  shareButton: {
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    justifyContent: 'center',             //......Centraliza horizontal
    backgroundColor: PRIMARY_COLOR,       //......Fundo azul
    width: '100%',                        //......Largura total
    paddingVertical: 14,                  //......Padding vertical
    borderRadius: 10,                     //......Cantos levemente arredondados
    gap: 10,                              //......Espaco entre icone e texto
  },

  // Botao desabilitado
  shareButtonDisabled: {
    backgroundColor: '#D1D5DB',           //......Fundo cinza
  },

  // Texto do botao
  shareButtonText: {
    fontFamily: 'Inter_600SemiBold',      //......Fonte bold
    fontSize: 15,                         //......Tamanho fonte
    color: '#FFFFFF',                     //......Cor branca
  },
});
