// Componente LinkPreviewCard - Card de preview de link estilo WhatsApp

// React e React Native
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Image, StyleSheet, Pressable, Linking, ActivityIndicator } from 'react-native';

// Bibliotecas externas
import Svg, { Path, Rect, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

// Tipos
import { LinkPreview } from '../../types/08.types.whatsapp';

// Interface de Props
interface LinkPreviewCardProps {
  linkPreview: LinkPreview;              //......Dados do preview
  isOutgoing: boolean;                   //......Se e mensagem enviada
}

// Interface de metadados OG buscados
interface OgMetadata {
  title?: string;       //......Titulo OG
  description?: string; //......Descricao OG
  thumbnail?: string;   //......Imagem OG
  siteName?: string;    //......Nome do site
}

// URL do Worker de duracao (ex: https://ig-duration.SEU-USER.workers.dev)
const DURATION_WORKER_URL = 'https://ig-duration.controler01.workers.dev'; //...Worker Cloudflare

// Cache em memoria e constantes de storage
const ogCache = new Map<string, OgMetadata | null>(); //...Cache OG metadata
const durCache = new Map<string, number | null>();     //...Cache duracao video
const STORAGE_PREFIX = 'lp_';                          //...Prefixo localStorage
const CACHE_VERSION = 2;                               //...Versao do schema

// Funcao para extrair dominio da URL
const extractDomain = (url: string): string => {
  try { return new URL(url).hostname.replace('www.', ''); } //...Extrai e limpa hostname
  catch { return url; }                                     //...Fallback URL original
};

// Funcao para formatar segundos em MM:SS
const formatDuration = (s: number): string => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;

// Funcao para gerar chave curta para localStorage
const getCacheKey = (url: string): string => {
  let hash = 0;                                          //...Hash inicial
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);                      //...Codigo do caractere
    hash = ((hash << 5) - hash) + char;                  //...Calculo hash
    hash |= 0;                                           //...Converte para inteiro 32-bit
  }
  return `${STORAGE_PREFIX}${Math.abs(hash).toString(36)}`; //...Chave compacta
};

// Funcao para ler cache do localStorage
const readStorageCache = (url: string): OgMetadata | null | undefined => {
  try {
    const key = getCacheKey(url);                        //...Gera chave
    const stored = localStorage.getItem(key);            //...Busca no storage
    if (!stored) return undefined;                       //...Nao encontrado
    const parsed = JSON.parse(stored);                   //...Parseia JSON
    if (parsed.expiry && Date.now() > parsed.expiry) {
      localStorage.removeItem(key);                      //...Remove expirado
      return undefined;
    }
    if (!parsed._v || parsed._v < CACHE_VERSION) {
      localStorage.removeItem(key);                      //...Remove versao antiga
      return undefined;
    }
    return parsed.data as OgMetadata | null;             //...Retorna dados
  } catch {
    return undefined;                                    //...Erro de leitura
  }
};

// Funcao para salvar cache no localStorage
const writeStorageCache = (url: string, data: OgMetadata | null): void => {
  try {
    const key = getCacheKey(url);                        //...Gera chave
    const entry = {
      data,                                              //...Dados do preview
      expiry: Date.now() + (7 * 24 * 60 * 60 * 1000),   //...Expira em 7 dias
      _v: CACHE_VERSION,                                 //...Versao do schema
    };
    localStorage.setItem(key, JSON.stringify(entry));    //...Salva no storage
  } catch {
    // Ignora erros de storage cheio
  }
};

// Funcao para buscar duracao do reel via Worker
const fetchReelDuration = async (shortcode: string): Promise<number | null> => {
  // Cache em memoria
  if (durCache.has(shortcode)) return durCache.get(shortcode) || null; //...Retorna cache

  // Cache no localStorage
  const storKey = `dur2_${shortcode}`;                             //...Chave storage v2
  try {
    const stored = localStorage.getItem(storKey);                  //...Busca storage
    if (stored) {
      const val = Number(stored);                                  //...Converte numero
      if (val > 0) { durCache.set(shortcode, val); return val; }  //...Retorna se valido
    }
  } catch { /* Ignora erro de storage */ }

  // Worker nao configurado
  if (!DURATION_WORKER_URL) {
    durCache.set(shortcode, null);                                 //...Cache null
    return null;
  }

  // Busca duracao via Worker
  try {
    const res = await fetch(`${DURATION_WORKER_URL}?shortcode=${shortcode}`); //...Chama Worker
    if (!res.ok) { durCache.set(shortcode, null); return null; }              //...Erro HTTP
    const data = await res.json();                                             //...Parseia JSON
    const raw = data.duration ? Number(data.duration) : null;                    //...Valor bruto
    const dur = raw ? Math.floor(raw) + 1 : null;                               //...Duracao ajustada (+1s)
    durCache.set(shortcode, dur);                                              //...Salva memoria
    if (dur && dur > 0) {
      try { localStorage.setItem(storKey, String(dur)); } catch {}             //...Salva storage
    }
    return dur;
  } catch {
    durCache.set(shortcode, null);                                             //...Falha silenciosa
    return null;
  }
};

// Funcao para buscar via Microlink API
const fetchViaMicrolink = async (url: string): Promise<OgMetadata | null> => {
  const encoded = encodeURIComponent(url);                      //...Codifica URL
  const apiUrl = `https://api.microlink.io/?url=${encoded}`;    //...Endpoint Microlink
  const response = await fetch(apiUrl);                         //...Busca metadados

  if (!response.ok) return null;                                //...Verifica status

  const json = await response.json();                           //...Parseia resposta
  if (json.status !== 'success' || !json.data) return null;     //...Verifica sucesso

  const d = json.data;                                          //...Atalho para dados
  const result: OgMetadata = {
    title: d.title || undefined,                                //...Titulo
    description: d.description || undefined,                    //...Descricao
    thumbnail: d.image?.url || undefined,                       //...Imagem
    siteName: d.publisher || undefined,                         //...Publisher
  };

  // Suplemento Instagram: busca legenda via oEmbed quando descricao nao tem caption
  const descHasCaption = result.description && /\d{4}:\s*["'\u201C\u201D]/.test(result.description);
  if (url.includes('instagram.com') && !descHasCaption) {
    try {
      const oeUrl = `https://www.instagram.com/api/v1/oembed/?url=${encodeURIComponent(url)}`; //...URL oEmbed
      const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(oeUrl)}`;         //...Proxy CORS
      const oeRes = await fetch(proxy);                                                         //...Busca oEmbed
      if (oeRes.ok) {
        const oeData = JSON.parse((await oeRes.json()).contents || '{}');                        //...Parseia oEmbed
        if (oeData.title && oeData.title.length > 3 && result.description) {
          result.description = result.description + ': \u201C' + oeData.title + '\u201D';       //...Mescla caption
        } else if (oeData.title && oeData.title.length > 3) {
          result.description = oeData.title;                                                     //...Legenda do post
        }
        if (oeData.author_name && (!result.title || result.title === 'Instagram')) {
          result.title = `${oeData.author_name} on Instagram`;                                  //...Nome do autor
        }
      }
    } catch { /* Falha silenciosa no oEmbed */ }
  }

  return result;                                                //...Retorna metadados
};

// Funcao para buscar via allorigins (fallback HTML)
const fetchViaAllorigins = async (url: string): Promise<OgMetadata | null> => {
  const encoded = encodeURIComponent(url);                      //...Codifica URL
  const proxyUrl = `https://api.allorigins.win/get?url=${encoded}`; //...Proxy CORS
  const response = await fetch(proxyUrl);                       //...Busca via proxy

  if (!response.ok) return null;                                //...Verifica status

  const text = await response.text();                           //...Le como texto
  if (!text || text.length < 100) return null;                  //...Resposta vazia

  // Tenta parsear JSON do allorigins
  let html = '';
  try {
    const data = JSON.parse(text);                              //...Parseia JSON
    html = data.contents || '';                                 //...Extrai HTML
  } catch {
    return null;                                                //...JSON invalido
  }

  if (!html) return null;                                       //...HTML vazio

  // Extrai OG tags do HTML via regex
  const getOg = (prop: string): string | undefined => {
    const r1 = new RegExp(`<meta[^>]*property=["']${prop}["'][^>]*content=["']([^"']*)["']`, 'i');
    const r2 = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*property=["']${prop}["']`, 'i');
    const match = html.match(r1) || html.match(r2);            //...Tenta ambos
    return match ? match[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"') : undefined;
  };

  return {
    title: getOg('og:title'),        //...Titulo
    description: getOg('og:description'), //...Descricao
    thumbnail: getOg('og:image'),    //...Imagem
    siteName: getOg('og:site_name'), //...Nome do site
  };
};

// Funcao principal para buscar metadados OG
const fetchOgMetadata = async (url: string): Promise<OgMetadata | null> => {
  // Verifica cache em memoria
  if (ogCache.has(url)) return ogCache.get(url) || null; //...Cache memoria

  // Verifica cache no localStorage
  const stored = readStorageCache(url);                  //...Cache persistente
  if (stored !== undefined) {
    ogCache.set(url, stored);                            //...Sincroniza memoria
    return stored;
  }

  // Tenta Microlink primeiro (funciona com Instagram e maioria dos sites)
  try {
    const result = await fetchViaMicrolink(url); //...Busca via Microlink
    if (result && (result.title || result.thumbnail)) {
      ogCache.set(url, result);                  //...Salva memoria
      writeStorageCache(url, result);            //...Salva storage
      return result;
    }
  } catch { /* Microlink falhou */ }

  // Fallback: tenta allorigins para parsing HTML direto
  try {
    const result = await fetchViaAllorigins(url); //...Busca via proxy
    if (result && (result.title || result.thumbnail)) {
      ogCache.set(url, result);                   //...Salva memoria
      writeStorageCache(url, result);             //...Salva storage
      return result;
    }
  } catch { /* allorigins falhou */ }

  // Nenhum servico retornou dados
  ogCache.set(url, null);      //...Cache memoria
  writeStorageCache(url, null); //...Cache storage
  return null;
};

// Icone de link (corrente) em SVG
const LinkIcon: React.FC<{ color: string; size?: number }> = ({ color, size = 11 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
      stroke={color}
      strokeWidth={2.5}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
      stroke={color}
      strokeWidth={2.5}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Icone do Instagram com gradiente
const InstagramIcon: React.FC<{ size?: number }> = ({ size = 14 }) => {
  const gradId = useMemo(() => `ig_${Math.random().toString(36).slice(2, 8)}`, []);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <LinearGradient id={gradId} x1="0" y1="1" x2="1" y2="0">
          <Stop offset="0" stopColor="#FED373" />
          <Stop offset="0.3" stopColor="#F15245" />
          <Stop offset="0.6" stopColor="#D92E7F" />
          <Stop offset="0.9" stopColor="#9B36B7" />
          <Stop offset="1" stopColor="#515BD4" />
        </LinearGradient>
      </Defs>
      <Rect
        x={2} y={2}
        width={20} height={20}
        rx={6}
        fill={`url(#${gradId})`}
      />
      <Rect
        x={5.5} y={5.5}
        width={13} height={13}
        rx={3.5}
        stroke="white"
        strokeWidth={1.5}
        fill="none"
      />
      <Circle cx={12} cy={12} r={3.5} stroke="white" strokeWidth={1.5} fill="none" />
      <Circle cx={17.2} cy={6.8} r={1.2} fill="white" />
    </Svg>
  );
};

// Componente Principal LinkPreviewCard
const LinkPreviewCard: React.FC<LinkPreviewCardProps> = ({
  linkPreview,                           //......Dados do preview
  isOutgoing,                            //......Direcao
}) => {
  // Estados do componente
  const [imageError, setImageError] = useState(false);                          //...Erro da imagem
  const [isLoading, setIsLoading] = useState(false);                            //...Carregando metadados
  const [fetchedData, setFetchedData] = useState<OgMetadata | null>(null);      //...Dados buscados
  const [videoDuration, setVideoDuration] = useState<number | null>(null);      //...Duracao do video

  // Extrair dominio e detectar rede social
  const domain = extractDomain(linkPreview.url);           //...Dominio do link
  const isInstagram = domain.includes('instagram.com');    //...Detecta Instagram
  const isReel = /\/reel\//i.test(linkPreview.url);        //...Detecta reel na URL

  // Extrair shortcode do reel para buscar duracao
  const shortcode = isReel ? (linkPreview.url.match(/\/reel\/([A-Za-z0-9_-]+)/)?.[1] || '') : '';

  // Verificar se precisa buscar metadados
  const needsFetch = !linkPreview.title && !linkPreview.description && !linkPreview.thumbnail;

  // Buscar metadados OG quando necessario
  useEffect(() => {
    if (!needsFetch) return;              //...Nao precisa buscar

    // Verifica cache antes de setar loading
    if (ogCache.has(linkPreview.url)) {
      setFetchedData(ogCache.get(linkPreview.url) || null); //...Usa cache
      return;
    }

    let cancelled = false;                //...Flag de cancelamento
    setIsLoading(true);                   //...Inicia loading

    fetchOgMetadata(linkPreview.url).then((data) => {
      if (!cancelled) {                   //...Verifica cancelamento
        setFetchedData(data);             //...Salva dados
        setIsLoading(false);              //...Finaliza loading
      }
    });

    return () => { cancelled = true; };   //...Cleanup
  }, [linkPreview.url, needsFetch]);

  // Buscar duracao do reel via Worker (paralelo ao OG metadata)
  useEffect(() => {
    if (!shortcode) return;               //...Nao e reel

    // Verifica cache em memoria primeiro
    if (durCache.has(shortcode)) {
      setVideoDuration(durCache.get(shortcode) || null); //...Usa cache
      return;
    }

    let cancelled = false;                //...Flag de cancelamento
    fetchReelDuration(shortcode).then((dur) => {
      if (!cancelled) setVideoDuration(dur); //...Salva duracao
    });

    return () => { cancelled = true; };   //...Cleanup
  }, [shortcode]);

  // Mesclar dados da API com dados buscados
  const title = linkPreview.title || fetchedData?.title;                   //...Titulo final
  const description = linkPreview.description || fetchedData?.description; //...Descricao video
  const thumbnailUrl = linkPreview.thumbnail || fetchedData?.thumbnail;    //...Thumbnail final

  // Texto combinado para exibicao (nome no Instagram + legenda)
  const igCaptionRx = /\d{4}:\s*["'\u201C\u201D]*([\s\S]+)$/;
  const igName = isInstagram && title && title !== 'Instagram' ? title.replace(/\s*(\(.*|[•·].*|on\s+Instagram.*)$/i, '').trim() : '';
  const igRawMatch = isInstagram ? ((description || '').match(igCaptionRx)?.[1] || '') : '';
  const igCaption = igRawMatch ? igRawMatch.replace(/["'\u201C\u201D.\s]+$/, '').replace(/\n+/g, ' ').trim() : '';
  const displayTitle = igName ? `${igName} no Instagram:${igCaption ? ' ' + igCaption : ''}` : (title || '');

  // Verificar se tem conteudo para mostrar
  const hasThumbnail = !!thumbnailUrl && !imageError; //...Tem thumbnail valida
  const hasTitle = !!displayTitle;                    //...Tem titulo
  const hasContent = hasThumbnail || hasTitle;

  // Se nao tem conteudo e nao esta carregando, nao renderiza
  if (!hasContent && !isLoading) return null;

  // Handler para abrir URL
  const handlePress = () => {
    Linking.openURL(linkPreview.url); //...Abre no navegador
  };

  // Render Principal
  return (
    <Pressable
      style={[
        styles.container,                //......Container base
        isOutgoing ? styles.containerOutgoing : styles.containerIncoming,
      ]}
      onPress={handlePress}              //......Abre URL ao clicar
    >
      {/* Indicador de carregamento */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="small"
            color={isOutgoing ? '#FFFFFF' : '#7D8592'}
          />
        </View>
      )}

      {/* Thumbnail com botao play */}
      {hasThumbnail && !isLoading && (
        <View style={styles.thumbnailContainer}>
          <Image
            source={{ uri: thumbnailUrl }}
            style={styles.thumbnail}     //......Imagem de preview
            resizeMode="cover"           //......Cobre o container
            onError={() => setImageError(true)}
          />
          {/* Botao play overlay */}
          <View style={styles.playOverlay}>
            <View style={styles.playCircle}>
              <Svg width={9} height={9} viewBox="0 0 24 24">
                <Path d="M8 5v14l11-7z" fill="#FFFFFF" />
              </Svg>
            </View>
          </View>
          {/* Badge de duracao ou Reel no canto inferior esquerdo */}
          {isReel && (
            <View style={styles.durationBadge}>
              {videoDuration && videoDuration > 0 ? (
                <Text style={styles.durationText}>{formatDuration(videoDuration)}</Text>
              ) : (
                <>
                  <Svg width={10} height={10} viewBox="0 0 24 24">
                    <Rect x={2} y={3} width={20} height={18} rx={3} stroke="#FFFFFF" strokeWidth={2} fill="none" />
                    <Path d="M2 9h20M10 3v6M14 3v6" stroke="#FFFFFF" strokeWidth={1.5} strokeLinecap="round" />
                  </Svg>
                  <Text style={styles.durationText}>Reel</Text>
                </>
              )}
            </View>
          )}
        </View>
      )}

      {/* Area de texto abaixo da imagem */}
      {!isLoading && (
        <View style={[
          styles.textContainer,          //......Container texto
          isOutgoing ? styles.textContainerOutgoing : styles.textContainerIncoming,
        ]}>
          {/* Titulo */}
          {hasTitle && (
            <Text
              style={[
                styles.title,            //......Estilo titulo
                isOutgoing && styles.titleOutgoing,
              ]}
              numberOfLines={3}          //......Maximo 3 linhas
            >
              {displayTitle}
            </Text>
          )}

          {/* Footer: icone link + dominio + icone rede social */}
          <View style={styles.domainRow}>
            <View style={styles.domainLeft}>
              <LinkIcon color={isOutgoing ? '#FFFFFF' : '#91929E'} />
              <Text
                style={[
                  styles.domainText,     //......Texto dominio
                  isOutgoing && styles.domainTextOutgoing,
                ]}
                numberOfLines={1}        //......Uma linha
              >
                {domain}
              </Text>
            </View>
            {/* Icone da rede social */}
            {isInstagram && <InstagramIcon size={20} />}
          </View>
        </View>
      )}
    </Pressable>
  );
};

// Export default
export default LinkPreviewCard;

// Estilos do componente LinkPreviewCard
const styles = StyleSheet.create({
  // Container principal do card
  // Margens negativas compensam padding do bubble (8h, 6v) deixando 3px visiveis
  container: {
    width: 202,             //..........Largura fixa formato story
    borderRadius: 8,        //..........Bordas arredondadas
    overflow: 'hidden',     //..........Corta conteudo excedente
    marginBottom: 6,        //..........Espaco abaixo do card
    marginTop: -2,          //..........Sobe 3px no bubble (6 - 3 = 3px visivel)
    marginRight: -5,   //..........Expande 5px lateral (8 - 5 = 3px visivel)
    marginLeft: -4,   //..........Expande 5px lateral (8 - 5 = 3px visivel)
  },
  // Card em mensagem recebida
  containerIncoming: { backgroundColor: '#F0F0F0' }, //...Fundo cinza claro
  // Card em mensagem enviada
  containerOutgoing: { backgroundColor: 'transparent' }, //...Transparente sem segundo tom
  // Container de carregamento
  loadingContainer: {
    paddingVertical: 16,      //...Espaco vertical
    alignItems: 'center',     //...Centraliza horizontal
    justifyContent: 'center', //...Centraliza vertical
  },
  // Container da thumbnail (formato story, alto e fino)
  thumbnailContainer: {
    position: 'relative',      //...Posicao relativa para overlay
    height: 300,               //...Altura formato story
    overflow: 'hidden',        //...Corta conteudo nos cantos arredondados
  },
  // Thumbnail do link
  thumbnail: { width: '100%', height: '100%' }, //...Preenche container
  // Overlay do botao play (cobre a thumbnail)
  playOverlay: {
    position: 'absolute', //...Posicao absoluta
    top: 0,               //...Topo
    left: 0,              //...Esquerda
    right: 0,             //...Direita
    bottom: 0,            //...Base
    justifyContent: 'center', //...Centraliza vertical
    alignItems: 'center',     //...Centraliza horizontal
  },
  // Circulo do botao play (transparente, como WhatsApp oficial)
  playCircle: {
    width: 30,                              //...Largura do circulo
    height: 30,                             //...Altura do circulo
    borderRadius: 15,                       //...Circulo perfeito
    backgroundColor: 'transparent',         //...Sem fundo escuro
    justifyContent: 'center',              //...Centraliza icone vertical
    alignItems: 'center',                   //...Centraliza icone horizontal
  },
  // Container do conteudo textual (abaixo da imagem)
  textContainer: { paddingHorizontal: 10, paddingVertical: 8 }, //...Padding texto
  // Texto container mensagem recebida
  textContainerIncoming: { backgroundColor: '#E0E0E0' }, //...Cinza mais escuro
  // Texto container mensagem enviada (azul mais escuro)
  textContainerOutgoing: { backgroundColor: '#0E5FA8' }, //...Azul escuro
  // Titulo do link
  title: {
    fontFamily: 'Inter_500Medium', //...Fonte medium
    fontSize: 12.5,                //...Tamanho fonte compacto
    lineHeight: 16,                //...Altura linha
    color: '#3A3F51',              //...Cor escura
  },
  // Titulo em mensagem enviada
  titleOutgoing: { color: '#FCFCFC' }, //...Branco
  // Linha do dominio (footer do card)
  domainRow: {
    flexDirection: 'row',      //...Layout horizontal
    alignItems: 'center',      //...Centraliza vertical
    justifyContent: 'space-between', //...Espaco entre lados
    marginTop: 15,             //...Espaco de 15px abaixo do titulo
  },
  // Lado esquerdo do footer (icone + dominio)
  domainLeft: {
    flexDirection: 'row', //...Layout horizontal
    alignItems: 'center', //...Centraliza vertical
    gap: 4,               //...Espaco entre icone e texto
  },
  // Texto do dominio
  domainText: {
    fontFamily: 'Inter_400Regular', //...Fonte regular
    fontSize: 13,                   //...Tamanho fonte
    color: '#91929E',               //...Cor cinza clara
  },
  // Dominio em mensagem enviada
  domainTextOutgoing: { color: '#FFFFFF' }, //...Branco total
  // Badge de duracao ou Reel (canto inferior esquerdo da thumbnail)
  durationBadge: {
    position: 'absolute',           //...Posicao absoluta
    bottom: 6,                      //...Distancia da base
    left: 6,                        //...Distancia da esquerda
    flexDirection: 'row',           //...Layout horizontal
    alignItems: 'center',           //...Centraliza vertical
    backgroundColor: 'rgba(0,0,0,0.55)', //...Fundo escuro translucido
    borderRadius: 4,                //...Bordas arredondadas
    paddingHorizontal: 5,           //...Padding horizontal
    paddingVertical: 2,             //...Padding vertical
    gap: 3,                         //...Espaco entre icone e texto
  },
  // Texto do badge de duracao
  durationText: {
    fontFamily: 'Inter_500Medium', //...Fonte medium
    fontSize: 11,                  //...Tamanho fonte
    color: '#FFFFFF',              //...Cor branca
  },
});
