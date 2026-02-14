// ========================================
// Hook useContacts
// Busca contatos da agenda e do WhatsApp
// Com cache e otimizacoes de performance
// ========================================

// ========================================
// Imports React
// ========================================
import {                                  //......React hooks
  useState,                               //......Hook de estado
  useEffect,                              //......Hook de efeito
  useCallback,                            //......Hook de callback
  useRef,                                 //......Hook de referencia
  useMemo,                                //......Hook de memo
} from 'react';                           //......Biblioteca React
import {                                  //......React Native
  Platform,                               //......Plataforma
} from 'react-native';                    //......Biblioteca RN
import AsyncStorage from '@react-native-async-storage/async-storage';

// ========================================
// Imports de Servicos
// ========================================
import { evolutionService } from '../../../services/evolutionService';

// ========================================
// Constantes
// ========================================
const LOG_PREFIX = '[useContacts]';       //......Prefixo de log
const CACHE_KEY_WHATSAPP = '@contacts_whatsapp';
const CACHE_KEY_PHONE = '@contacts_phone';
const CACHE_TTL = 5 * 60 * 1000;          //......5 minutos em ms
const CONTACTS_PER_PAGE = 50;             //......Contatos por pagina

// ========================================
// Interface de Contato Unificado
// ========================================
export interface UnifiedContact {
  id: string;                             //......ID unico
  name: string;                           //......Nome do contato
  phone: string;                          //......Telefone
  photo?: string;                         //......Foto opcional
  source: 'phone' | 'whatsapp';           //......Origem do contato
}

// ========================================
// Interface de Contato da Agenda
// ========================================
interface PhoneContact {
  id: string;                             //......ID do contato
  name: string;                           //......Nome
  firstName?: string;                     //......Primeiro nome
  lastName?: string;                      //......Sobrenome
  phoneNumbers?: Array<{                  //......Array de telefones
    number: string;                       //......Numero
    label?: string;                       //......Label (mobile, home, etc)
  }>;
  image?: {                               //......Imagem
    uri: string;                          //......URI da imagem
  };
}

// ========================================
// Interface de Contato do WhatsApp
// ========================================
interface WhatsAppContact {
  id?: string;                            //......ID do contato
  remoteJid?: string;                     //......JID remoto
  pushName?: string;                      //......Nome push
  profilePictureUrl?: string;             //......URL da foto
  owner?: string;                         //......Dono
}

// ========================================
// Interface de Cache
// ========================================
interface CacheData {
  contacts: UnifiedContact[];             //......Contatos em cache
  timestamp: number;                      //......Timestamp do cache
}

// ========================================
// Interface de Retorno do Hook
// ========================================
interface UseContactsReturn {
  phoneContacts: UnifiedContact[];        //......Contatos da agenda
  whatsappContacts: UnifiedContact[];     //......Contatos do WhatsApp
  allContacts: UnifiedContact[];          //......Todos os contatos
  isLoadingPhone: boolean;                //......Loading agenda
  isLoadingWhatsApp: boolean;             //......Loading WhatsApp
  errorPhone: string | null;              //......Erro agenda
  errorWhatsApp: string | null;           //......Erro WhatsApp
  refreshPhoneContacts: () => Promise<void>;
  refreshWhatsAppContacts: () => Promise<void>;
  refreshAll: () => Promise<void>;        //......Atualiza todos
  loadMoreWhatsApp: () => Promise<void>;  //......Carrega mais WhatsApp
  hasMoreWhatsApp: boolean;               //......Se tem mais WhatsApp
}

// ========================================
// Funcao para formatar telefone
// ========================================
const formatPhoneNumber = (phone: string): string => {
  // Remove tudo que nao for numero
  const numbers = phone.replace(/\D/g, '');

  // Se comecar com 55, remove (codigo Brasil)
  if (numbers.startsWith('55') && numbers.length > 11) {
    return numbers.substring(2);
  }

  return numbers;
};

// ========================================
// Funcao para extrair telefone do JID
// ========================================
const extractPhoneFromJid = (jid: string): string => {
  // JID formato: 5511999887766@s.whatsapp.net
  const phone = jid?.split('@')[0] || '';
  return formatPhoneNumber(phone);
};

// ========================================
// Funcao para carregar cache
// ========================================
const loadCache = async (key: string): Promise<CacheData | null> => {
  try {
    const cached = await AsyncStorage.getItem(key);
    if (cached) {
      const data: CacheData = JSON.parse(cached);
      // Verifica se cache ainda e valido
      if (Date.now() - data.timestamp < CACHE_TTL) {
        console.log(`${LOG_PREFIX} Cache valido para ${key}`);
        return data;
      }
      console.log(`${LOG_PREFIX} Cache expirado para ${key}`);
    }
  } catch (error) {
    console.error(`${LOG_PREFIX} Erro ao carregar cache:`, error);
  }
  return null;
};

// ========================================
// Funcao para salvar cache
// ========================================
const saveCache = async (key: string, contacts: UnifiedContact[]): Promise<void> => {
  try {
    const data: CacheData = {
      contacts,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(data));
    console.log(`${LOG_PREFIX} Cache salvo para ${key}`);
  } catch (error) {
    console.error(`${LOG_PREFIX} Erro ao salvar cache:`, error);
  }
};

// ========================================
// Hook Principal useContacts
// ========================================
export const useContacts = (instanceName?: string): UseContactsReturn => {
  // ========================================
  // Estados
  // ========================================
  const [phoneContacts, setPhoneContacts] = useState<UnifiedContact[]>([]);
  const [whatsappContacts, setWhatsappContacts] = useState<UnifiedContact[]>([]);
  const [isLoadingPhone, setIsLoadingPhone] = useState(false);
  const [isLoadingWhatsApp, setIsLoadingWhatsApp] = useState(false);
  const [errorPhone, setErrorPhone] = useState<string | null>(null);
  const [errorWhatsApp, setErrorWhatsApp] = useState<string | null>(null);
  const [hasMoreWhatsApp, setHasMoreWhatsApp] = useState(true);

  // ========================================
  // Refs para paginacao
  // ========================================
  const whatsappOffsetRef = useRef(0);
  const isLoadingMoreRef = useRef(false);

  // ========================================
  // Buscar Contatos da Agenda (Mobile)
  // ========================================
  const fetchPhoneContacts = useCallback(async () => {
    // Apenas em dispositivos moveis
    if (Platform.OS === 'web') {
      console.log(`${LOG_PREFIX} Agenda nao disponivel na Web`);
      setPhoneContacts([]);               //......Vazio na web
      return;
    }

    // Tenta carregar do cache primeiro
    const cached = await loadCache(CACHE_KEY_PHONE);
    if (cached) {
      setPhoneContacts(cached.contacts);
      return;
    }

    setIsLoadingPhone(true);              //......Inicia loading
    setErrorPhone(null);                  //......Limpa erro

    try {
      // Import dinamico do expo-contacts
      const Contacts = await import('expo-contacts');

      // Solicita permissao
      const { status } = await Contacts.requestPermissionsAsync();

      if (status !== 'granted') {
        console.log(`${LOG_PREFIX} Permissao de contatos negada`);
        setErrorPhone('Permissão negada para acessar contatos');
        setPhoneContacts([]);
        return;
      }

      // Busca contatos
      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.Name,           //......Nome
          Contacts.Fields.PhoneNumbers,   //......Telefones
          Contacts.Fields.Image,          //......Imagem
        ],
      });

      console.log(`${LOG_PREFIX} Contatos da agenda encontrados:`, data.length);

      // Mapeia para formato unificado
      const unified: UnifiedContact[] = [];

      data.forEach((contact: PhoneContact) => {
        // Pula se nao tem telefone
        if (!contact.phoneNumbers || contact.phoneNumbers.length === 0) {
          return;
        }

        // Adiciona apenas o primeiro telefone valido
        for (const phoneNumber of contact.phoneNumbers) {
          const formattedPhone = formatPhoneNumber(phoneNumber.number);

          // Pula se telefone invalido
          if (formattedPhone.length < 10) {
            continue;
          }

          unified.push({
            id: `phone_${contact.id}`,
            name: contact.name || contact.firstName || 'Sem nome',
            phone: formattedPhone,
            photo: contact.image?.uri,
            source: 'phone',
          });
          break;                          //......Apenas primeiro telefone valido
        }
      });

      // Ordena por nome
      unified.sort((a, b) => a.name.localeCompare(b.name));

      console.log(`${LOG_PREFIX} Contatos da agenda processados:`, unified.length);
      setPhoneContacts(unified);          //......Define contatos

      // Salva no cache
      await saveCache(CACHE_KEY_PHONE, unified);

    } catch (error: any) {
      console.error(`${LOG_PREFIX} Erro ao buscar contatos da agenda:`, error);
      setErrorPhone(error?.message || 'Erro ao buscar contatos');
      setPhoneContacts([]);
    } finally {
      setIsLoadingPhone(false);           //......Finaliza loading
    }
  }, []);

  // ========================================
  // Buscar Contatos do WhatsApp (Evolution)
  // ========================================
  const fetchWhatsAppContacts = useCallback(async (reset: boolean = true) => {
    // Precisa de instanceName
    if (!instanceName) {
      console.log(`${LOG_PREFIX} instanceName nao fornecido`);
      setWhatsappContacts([]);            //......Vazio sem instance
      return;
    }

    // Se nao resetar e ja esta carregando, ignora
    if (!reset && isLoadingMoreRef.current) {
      return;
    }

    // Tenta carregar do cache primeiro (apenas no reset)
    if (reset) {
      const cached = await loadCache(`${CACHE_KEY_WHATSAPP}_${instanceName}`);
      if (cached) {
        setWhatsappContacts(cached.contacts);
        setHasMoreWhatsApp(cached.contacts.length >= CONTACTS_PER_PAGE);
        whatsappOffsetRef.current = cached.contacts.length;
        return;
      }
      whatsappOffsetRef.current = 0;
    }

    if (reset) {
      setIsLoadingWhatsApp(true);         //......Inicia loading
    }
    isLoadingMoreRef.current = true;
    setErrorWhatsApp(null);               //......Limpa erro

    try {
      console.log(`${LOG_PREFIX} Buscando contatos do WhatsApp... offset:`, whatsappOffsetRef.current);

      // Busca contatos via Evolution API com paginacao
      const contacts = await evolutionService.fetchContacts(
        instanceName,
        CONTACTS_PER_PAGE,
        whatsappOffsetRef.current
      );

      console.log(`${LOG_PREFIX} Contatos do WhatsApp encontrados:`, contacts.length);

      // Mapeia para formato unificado
      const unified: UnifiedContact[] = contacts
        .filter((contact: WhatsAppContact) => {
          // Filtra grupos (contem @g.us)
          const jid = contact.remoteJid || contact.id || '';
          return !jid.includes('@g.us');
        })
        .map((contact: WhatsAppContact, index: number) => {
          const jid = contact.remoteJid || contact.id || '';
          const phone = extractPhoneFromJid(jid);

          return {
            id: `whatsapp_${jid}_${whatsappOffsetRef.current + index}`,
            name: contact.pushName || phone || 'Sem nome',
            phone: phone,
            photo: contact.profilePictureUrl,
            source: 'whatsapp' as const,
          };
        })
        .filter((contact: UnifiedContact) => contact.phone.length >= 10);

      // Ordena por nome
      unified.sort((a, b) => a.name.localeCompare(b.name));

      console.log(`${LOG_PREFIX} Contatos do WhatsApp processados:`, unified.length);

      // Atualiza estado
      if (reset) {
        setWhatsappContacts(unified);
        // Salva no cache
        await saveCache(`${CACHE_KEY_WHATSAPP}_${instanceName}`, unified);
      } else {
        setWhatsappContacts(prev => {
          const newList = [...prev, ...unified];
          // Salva no cache
          saveCache(`${CACHE_KEY_WHATSAPP}_${instanceName}`, newList);
          return newList;
        });
      }

      // Atualiza paginacao
      whatsappOffsetRef.current += contacts.length;
      setHasMoreWhatsApp(contacts.length >= CONTACTS_PER_PAGE);

    } catch (error: any) {
      console.error(`${LOG_PREFIX} Erro ao buscar contatos do WhatsApp:`, error);
      setErrorWhatsApp(error?.message || 'Erro ao buscar contatos');
      if (reset) {
        setWhatsappContacts([]);
      }
    } finally {
      setIsLoadingWhatsApp(false);        //......Finaliza loading
      isLoadingMoreRef.current = false;
    }
  }, [instanceName]);

  // ========================================
  // Carregar Mais WhatsApp
  // ========================================
  const loadMoreWhatsApp = useCallback(async () => {
    if (!hasMoreWhatsApp || isLoadingMoreRef.current) {
      return;
    }
    await fetchWhatsAppContacts(false);
  }, [hasMoreWhatsApp, fetchWhatsAppContacts]);

  // ========================================
  // Atualizar Todos os Contatos
  // ========================================
  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchPhoneContacts(),               //......Busca agenda
      fetchWhatsAppContacts(true),        //......Busca WhatsApp
    ]);
  }, [fetchPhoneContacts, fetchWhatsAppContacts]);

  // ========================================
  // Combinar Todos os Contatos (Memo)
  // ========================================
  const allContacts = useMemo(() => {
    return [...whatsappContacts, ...phoneContacts];
  }, [whatsappContacts, phoneContacts]);

  // ========================================
  // Efeito: Buscar contatos ao montar
  // ========================================
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // ========================================
  // Retorno do Hook
  // ========================================
  return {
    phoneContacts,                        //......Contatos da agenda
    whatsappContacts,                     //......Contatos do WhatsApp
    allContacts,                          //......Todos os contatos
    isLoadingPhone,                       //......Loading agenda
    isLoadingWhatsApp,                    //......Loading WhatsApp
    errorPhone,                           //......Erro agenda
    errorWhatsApp,                        //......Erro WhatsApp
    refreshPhoneContacts: fetchPhoneContacts,
    refreshWhatsAppContacts: () => fetchWhatsAppContacts(true),
    refreshAll,                           //......Atualiza todos
    loadMoreWhatsApp,                     //......Carrega mais WhatsApp
    hasMoreWhatsApp,                      //......Se tem mais WhatsApp
  };
};

// ========================================
// Export Default
// ========================================
export default useContacts;
