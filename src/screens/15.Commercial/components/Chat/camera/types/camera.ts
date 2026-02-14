// ========================================
// Tipos da Camera
// Interfaces e types para o modulo de camera
// ========================================

import { CameraConfig } from '../utils/cameraConstants';

// ========================================
// Tipos de Flash
// ========================================
export type FlashMode = typeof CameraConfig.flashModes[number];  //......'auto' | 'on' | 'off'

// ========================================
// Tipos de Camera
// ========================================
export type CameraFacing = 'front' | 'back';  //......Frontal ou traseira

// ========================================
// Tipos de Modo
// ========================================
export type CameraMode = 'photo' | 'video' | 'videoNote';  //......Foto, video ou recado

// ========================================
// Interface de Foto Capturada
// ========================================
export interface CapturedPhoto {
  uri: string;                    //......URI do arquivo
  width: number;                  //......Largura em pixels
  height: number;                 //......Altura em pixels
  base64?: string;                //......Base64 opcional
}

// ========================================
// Interface de Video Gravado
// ========================================
export interface RecordedVideo {
  uri: string;                    //......URI do arquivo
  width?: number;                 //......Largura em pixels
  height?: number;                //......Altura em pixels
  duration?: number;              //......Duracao em segundos
  fileSize?: number;              //......Tamanho em bytes
}

// ========================================
// Props da CameraScreen
// ========================================
export interface CameraScreenProps {
  leadId: string;                 //......ID do lead
  leadName: string;               //......Nome do lead
  leadPhone: string;              //......Telefone do lead
  leadPhoto?: string;             //......Foto do lead
  initialMode?: CameraMode;       //......Modo inicial
  onSendPhoto?: (
    uri: string,                  //......URI da foto
    width: number,                //......Largura
    height: number,               //......Altura
    caption?: string              //......Legenda opcional
  ) => void;
  onSendVideo?: (
    uri: string,                  //......URI do video
    duration?: number,            //......Duracao
    caption?: string              //......Legenda opcional
  ) => void;
}

// ========================================
// Props da PhotoPreviewScreen
// ========================================
export interface PhotoPreviewScreenProps {
  photoUri: string;               //......URI da foto
  photoWidth: number;             //......Largura
  photoHeight: number;            //......Altura
  leadName: string;               //......Nome do destinatario
  onSend: (caption?: string) => void;  //......Callback de envio
  onDiscard: () => void;          //......Callback de descarte
}

// ========================================
// Props da VideoPreviewScreen
// ========================================
export interface VideoPreviewScreenProps {
  videoUri: string;               //......URI do video
  duration?: number;              //......Duracao em segundos
  fileSize?: number;              //......Tamanho em bytes
  leadName: string;               //......Nome do destinatario
  onSend: (caption?: string) => void;  //......Callback de envio
  onDiscard: () => void;          //......Callback de descarte
}

// ========================================
// Props do CaptionInput
// ========================================
export interface CaptionInputProps {
  value: string;                       //......Valor do input
  onChangeText: (text: string) => void;  //....Handler de mudanca
  onSend: () => void;                  //......Handler de envio
  recipientName: string;               //......Nome do destinatario
  viewOnce?: boolean;                  //......View once ativo
  onToggleViewOnce?: () => void;       //......Toggle view once
  onOpenCamera?: () => void;           //......Abre camera para adicionar midia
  onSelectRecipients?: () => void;     //......Abre modal de destinatarios
  placeholder?: string;                //......Placeholder customizado
  isSending?: boolean;                 //......Estado de envio
  showCameraButton?: boolean;          //......Mostrar botao camera
}

// ========================================
// Item de Midia (para carrossel)
// Inclui campos de edicao e transformacao individual
// ========================================
export interface MediaItem {
  id: string;                     //......ID unico
  uri: string;                    //......URI do arquivo
  type: 'photo' | 'video';        //......Tipo de midia
  width: number;                  //......Largura em pixels
  height: number;                 //......Altura em pixels
  caption?: string;               //......Legenda individual
  thumbnail?: string;             //......Thumbnail para videos
  duration?: number;              //......Duracao (apenas videos)
  elements?: any[];               //......Elementos de edicao (AnyDrawElement[])
  viewOnce?: boolean;             //......View once ativo
  rotation?: number;              //......Rotacao (0, 90, 180, 270)
  fineAngle?: number;             //......Ajuste fino de angulo (-45 a +45)
  flipH?: boolean;                //......Espelhado horizontal
  flipV?: boolean;                //......Espelhado vertical
  trimStart?: number;             //......Inicio do corte (ms)
  trimEnd?: number;               //......Fim do corte (ms)
  audioEnabled?: boolean;         //......Audio ativado
  fileSize?: number;              //......Tamanho do arquivo (bytes)
}

// ========================================
// Props do MediaCarousel
// ========================================
export interface MediaCarouselProps {
  items: MediaItem[];             //......Lista de midias
  selectedIndex: number;          //......Indice selecionado
  onSelectItem: (index: number) => void;  //......Seleciona item
  onRemoveItem: (index: number) => void;  //......Remove item
  onAddMore: () => void;          //......Adiciona mais midias
  maxItems?: number;              //......Maximo de itens (default 30)
}

// ========================================
// Estado da Camera
// ========================================
export interface CameraState {
  facing: CameraFacing;           //......Frontal ou traseira
  flash: FlashMode;               //......Modo de flash
  zoom: number;                   //......Nivel de zoom
  isRecording: boolean;           //......Gravando video
  recordingDuration: number;      //......Duracao da gravacao
  hasPermission: boolean | null;  //......Tem permissao
}

// ========================================
// Parametros de Navegacao
// ========================================
export type CameraStackParamList = {
  CameraScreen: CameraScreenProps;
  PhotoPreviewScreen: PhotoPreviewScreenProps;
  VideoPreviewScreen: VideoPreviewScreenProps;
};

// ========================================
// Configuracoes de Crop Nao-Destrutivo
// Coordenadas relativas (0-1) para independencia de resolucao
// ========================================
export interface CropSettings {
  cropRect: {                         //......Area de corte relativa
    x: number;                        //......0-1 posicao X relativa
    y: number;                        //......0-1 posicao Y relativa
    width: number;                    //......0-1 largura relativa
    height: number;                   //......0-1 altura relativa
  };
  rotation90: number;                 //......Rotacao em multiplos de 90 (0, 90, 180, 270)
  fineAngle: number;                  //......Ajuste fino -45 a +45 graus
  flipH: boolean;                     //......Espelhamento horizontal
  flipV: boolean;                     //......Espelhamento vertical
  aspectRatio: string | null;         //......'1:1', '4:3', '16:9', '9:16', null=livre
  imageScale: number;                 //......Escala aplicada (auto-zoom)
}

// ========================================
// Configuracoes Padrao de Crop (sem crop)
// ========================================
export const DEFAULT_CROP_SETTINGS: CropSettings = {
  cropRect: { x: 0, y: 0, width: 1, height: 1 },
  rotation90: 0,
  fineAngle: 0,
  flipH: false,
  flipV: false,
  aspectRatio: null,
  imageScale: 1,
};
