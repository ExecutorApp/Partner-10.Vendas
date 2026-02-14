// ========================================
// Modal de Camera para Web
// Interface completa com webcam, galeria e controles
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Pressable, Text, StyleSheet, Modal, Platform, useWindowDimensions } from 'react-native';
import Svg, { Path, Defs, ClipPath, Rect, G, Circle } from 'react-native-svg';

// ========================================
// Imports de Constantes
// ========================================
import { CameraColors, CameraStyles, CameraIcons } from './utils/cameraConstants';

// ========================================
// Imports de Componentes
// ========================================
import WebGalleryCarousel from './components/WebGalleryCarousel';

// ========================================
// Tipos
// ========================================
export interface WebCapturedMedia {
  uri: string;                              //......URI do arquivo
  width: number;                            //......Largura em pixels
  height: number;                           //......Altura em pixels
  type?: 'photo' | 'video';                //......Tipo de midia
  duration?: number;                        //......Duracao em ms (videos)
  thumbnail?: string;                       //......Thumbnail URI (videos)
  fileSize?: number;                        //......Tamanho em bytes (videos)
}

interface WebCameraModalProps {
  visible: boolean;                         //......Modal visivel
  onClose: () => void;                      //......Callback fechar
  onCapture: (media: WebCapturedMedia) => void;  //......Callback captura
}

type FlashModeType = 'auto' | 'on' | 'off';
type ZoomLevelType = '0.5x' | '1x' | '2x';
type CameraModeType = 'video' | 'photo' | 'videoNote';

// ========================================
// Constantes de Cores
// ========================================
const CONTROL_BG = '#303030';                //......Fundo chumbo solido (padrao do sistema)
const CONTROL_BG_LIGHT = 'rgba(255,255,255,0.15)';  //......Fundo claro para videoNote
const ACTIVE_TAB_COLOR = '#53BDEB';         //......Azul claro aba ativa
const INACTIVE_TAB_COLOR = '#FFFFFF';       //......Branco aba inativa
const FOOTER_BG = '#000000';                //......Fundo preto footer
const RECORDING_RED = '#FF3B30';            //......Vermelho gravacao

// ========================================
// Constantes Video Note
// ========================================
const VIDEO_NOTE_MAX_DURATION = 60;         //......Duracao maxima 60s
const PROGRESS_STROKE_WIDTH = 4;            //......Espessura do progresso

// ========================================
// Icone Fechar
// ========================================
const CloseIcon: React.FC = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d={CameraIcons.close} fill={CameraColors.textWhite} />
  </Svg>
);

// ========================================
// Icone Flash (raio com linha diagonal)
// Coordenadas ajustadas: Y - 280.067
// ========================================
const FlashIcon: React.FC<{ mode: FlashModeType }> = ({ mode }) => {
  const color = mode === 'on' ? CameraColors.flashYellow : CameraColors.textWhite;

  // Todos os modos usam o novo icone (raio com linha diagonal)
  return (
    <Svg width={24} height={24} viewBox="0 0 16.933 16.933" fill="none">
      <Path
        d="m6.98 1.058-.072.147-1.388 2.772 5.365 5.599 2.909-3.49H8.968l3.44-5.028zm-4.409.61-.38.367 2.825 2.949-2.005 4.012h4.043l-2.016 6.803.457.246 4.707-5.65 4.158 4.34.383-.366-4.2-4.383.001-.002-5.276-5.505v.002z"
        fill={color}
      />
    </Svg>
  );
};

// ========================================
// Icone Flip Camera (setas circulares)
// ========================================
const FlipIcon: React.FC = () => (
  <Svg width={24} height={24} viewBox="0 0 512 512" fill="none">
    <Path
      d="M260.22 48.45a206.36 206.36 0 0 0-163.77 80l-11-8.28a10 10 0 0 0-15.77 5.9l-11.77 54.69a10 10 0 0 0 14.54 10.89l49.16-26.57a10 10 0 0 0 1.25-16.8l-10.4-7.79a186.48 186.48 0 0 1 147.76-72c100.2 0 182.3 79 187.31 178a10 10 0 0 0 10 9.58 10 10 0 0 0 10-10.42C462.06 136 371.17 48.45 260.22 48.45zM439.55 320.35l-49.16 26.57a10 10 0 0 0-1.25 16.8l10.4 7.79a186.46 186.46 0 0 1-147.76 72c-100.2 0-182.3-79-187.31-178a10 10 0 0 0-10-9.58 10 10 0 0 0-10 10.42c5.47 109.65 96.36 197.2 207.31 197.2a206.36 206.36 0 0 0 163.77-80l11.05 8.28a10 10 0 0 0 15.77-5.9l11.72-54.65a10 10 0 0 0-14.54-10.93z"
      fill={CameraColors.textWhite}
      stroke={CameraColors.textWhite}
      strokeWidth={15}
    />
  </Svg>
);

// ========================================
// Icone Galeria (foto paisagem com cantos 8px)
// ========================================
const GalleryIcon: React.FC = () => (
  <Svg width={24} height={18} viewBox="0 0 68 52" fill="none">
    <Defs>
      <ClipPath id="galleryClip">
        <Rect x="0" y="0" width="67.375" height="51.385" rx="8" ry="8" />
      </ClipPath>
    </Defs>
    <G clipPath="url(#galleryClip)">
      <Path d="M4.1875 17.1035H63.1875V44.1035H4.1875V17.1035Z" fill="#000000" />
      <Path d="M15.1875 20.6924C13.6052 20.6924 12.0585 20.2232 10.7429 19.3441C9.42734 18.4651 8.40197 17.2157 7.79647 15.7539C7.19097 14.292 7.03254 12.6835 7.34122 11.1317C7.6499 9.57981 8.41183 8.15435 9.53065 7.03553C10.6495 5.91671 12.0749 5.15479 13.6268 4.8461C15.1786 4.53742 16.7872 4.69585 18.249 5.30135C19.7108 5.90685 20.9602 6.93223 21.8393 8.24782C22.7183 9.56342 23.1875 11.1101 23.1875 12.6924C23.184 14.813 22.34 16.8458 20.8405 18.3453C19.3409 19.8449 17.3081 20.6889 15.1875 20.6924Z" fill="#000000" />
      <Path d="M5.03989 0H62.3351C63.6715 0.00161328 64.9527 0.540182 65.8975 1.49753C66.8424 2.45489 67.3737 3.75283 67.375 5.10656V46.2784C67.3737 47.6321 66.8424 48.9301 65.8975 49.8874C64.9527 50.8448 63.6715 51.3833 62.3351 51.3849H5.03989C3.70351 51.3833 2.42234 50.8448 1.47749 49.8874C0.532633 48.9301 0.00127362 47.6321 0 46.2784V5.10656C0.00127362 3.75283 0.532633 2.45489 1.47749 1.49753C2.42234 0.540182 3.70351 0.00161328 5.03989 0ZM15.1558 5.3625C13.6821 5.3625 12.2415 5.80517 11.0162 6.63452C9.79093 7.46388 8.83593 8.64267 8.27198 10.0218C7.70804 11.401 7.56048 12.9186 7.84798 14.3827C8.13547 15.8468 8.84511 17.1917 9.88715 18.2473C10.9292 19.3028 12.2568 20.0217 13.7022 20.3129C15.1475 20.6041 16.6456 20.4547 18.0071 19.8834C19.3686 19.3121 20.5323 18.3447 21.351 17.1035C22.1697 15.8623 22.6067 14.403 22.6067 12.9102C22.6032 10.9106 21.8174 8.99394 20.4215 7.58011C19.0256 6.16629 17.1333 5.3706 15.1594 5.36737L15.1558 5.3625ZM6.60395 41.3583C6.68834 41.5932 6.842 41.7961 7.04409 41.9396C7.24618 42.083 7.48692 42.16 7.73369 42.1602H58.1723C58.3847 42.1598 58.5932 42.1024 58.7766 41.9939C58.9601 41.8854 59.1119 41.7296 59.2166 41.5424C59.3213 41.3552 59.3753 41.1433 59.373 40.9281C59.3706 40.713 59.3121 40.5023 59.2034 40.3175L46.3492 18.6164C46.247 18.4441 46.1043 18.3001 45.9339 18.1971C45.7634 18.0942 45.5705 18.0356 45.3722 18.0265C45.1742 18.0197 44.9774 18.0615 44.7988 18.1482C44.6201 18.235 44.4647 18.3643 44.346 18.525L35.4802 30.8027L27.9005 23.5658C27.6858 23.3605 27.4041 23.2424 27.1091 23.2339C26.8141 23.2253 26.5262 23.327 26.3003 23.5194L6.95887 40.0128C6.77015 40.1738 6.63487 40.3898 6.57138 40.6313C6.5079 40.8729 6.51926 41.1284 6.60395 41.3632V41.3583Z" fill={CameraColors.textWhite} />
    </G>
  </Svg>
);

// ========================================
// Componente Progresso Circular Video Note
// ========================================
interface CircularProgressProps {
  progress: number;                         //......Progresso 0-1
  size: number;                             //......Tamanho do circulo
  strokeWidth: number;                      //......Espessura do traço
}

const CircularProgress: React.FC<CircularProgressProps> = ({ progress, size, strokeWidth }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <Svg width={size} height={size} style={{ position: 'absolute' }}>
      {/* Fundo cinza */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="rgba(255,255,255,0.2)"
        strokeWidth={strokeWidth}
        fill="transparent"
      />
      {/* Progresso vermelho */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={RECORDING_RED}
        strokeWidth={strokeWidth}
        fill="transparent"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </Svg>
  );
};

// ========================================
// Componente Principal WebCameraModal
// ========================================
const WebCameraModal: React.FC<WebCameraModalProps> = ({
  visible,
  onClose,
  onCapture,
}) => {
  console.log('📷 [WebCameraModal] Componente montando, visible:', visible);

  // ========================================
  // Dimensoes da Tela
  // ========================================
  const { width: screenWidth } = useWindowDimensions();
  const videoNoteCircleSize = screenWidth - 40;  //......20px margem cada lado

  // ========================================
  // Estados da Camera
  // ========================================
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isCapturing, setIsCapturing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ========================================
  // Estados dos Controles
  // ========================================
  const [flashMode, setFlashMode] = useState<FlashModeType>('auto');
  const [zoomLevel, setZoomLevel] = useState<ZoomLevelType>('1x');
  const [activeMode, setActiveMode] = useState<CameraModeType>('photo');

  // ========================================
  // Estados de Gravacao
  // ========================================
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  // ========================================
  // Refs
  // ========================================
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Refs para gravacao de video (MediaRecorder)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingStartTimeRef = useRef<number>(0);
  const recordingCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);

  // ========================================
  // Formatar Tempo de Gravacao
  // ========================================
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // ========================================
  // Iniciar Stream da Webcam
  // ========================================
  const startCamera = useCallback(async () => {
    console.log('📷 [WebCameraModal] Iniciando camera, facingMode:', facingMode);
    if (Platform.OS !== 'web') return;

    if (streamRef.current) {
      console.log('📷 [WebCameraModal] Parando stream anterior...');
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    try {
      console.log('📷 [WebCameraModal] Solicitando getUserMedia...');
      // Solicitar video + audio (audio necessario para gravacao de video)
      // Se audio falhar, tentar apenas video (fallback para modo foto)
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: true,
        });
      } catch (audioErr) {
        console.warn('📷 [WebCameraModal] Audio negado, tentando apenas video:', audioErr);
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
      }

      console.log('📷 [WebCameraModal] Stream obtido:', stream);
      streamRef.current = stream;
      setHasPermission(true);
      setErrorMessage(null);

      if (videoRef.current) {
        console.log('📷 [WebCameraModal] Atribuindo stream ao video element');
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(err => {
          console.error('📷 [WebCameraModal] Erro ao iniciar playback:', err);
        });
      }
    } catch (err: any) {
      console.error('📷 [WebCameraModal] Erro ao acessar webcam:', err);
      setHasPermission(false);
      if (err.name === 'NotAllowedError') {
        setErrorMessage('Permissao de camera negada. Por favor, permita o acesso a camera nas configuracoes do navegador.');
      } else if (err.name === 'NotFoundError') {
        setErrorMessage('Nenhuma camera encontrada. Conecte uma webcam e tente novamente.');
      } else {
        setErrorMessage('Erro ao acessar a camera: ' + err.message);
      }
    }
  }, [facingMode]);

  // ========================================
  // Parar Stream
  // ========================================
  const stopCamera = useCallback(() => {
    console.log('📷 [WebCameraModal] Parando camera...');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        console.log('📷 [WebCameraModal] Parando track:', track.kind);
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    // Parar timer se estiver gravando
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // Limpar recursos do MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    recordingCanvasRef.current = null;
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(t => t.stop());
      audioStreamRef.current = null;
    }
    recordedChunksRef.current = [];
    setIsRecording(false);
    setRecordingTime(0);
  }, []);

  // ========================================
  // Efeito: Iniciar/Parar camera
  // ========================================
  useEffect(() => {
    if (visible && Platform.OS === 'web') {
      console.log('📷 [WebCameraModal] Modal visivel, iniciando camera...');
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [visible, startCamera, stopCamera]);

  // ========================================
  // Efeito: Reiniciar camera ao trocar facingMode
  // ========================================
  useEffect(() => {
    if (visible && hasPermission && Platform.OS === 'web') {
      console.log('📷 [WebCameraModal] facingMode mudou, reiniciando camera');
      startCamera();
    }
  }, [facingMode, visible, hasPermission, startCamera]);

  // ========================================
  // Handler: Fechar Modal
  // ========================================
  const handleClose = useCallback(() => {
    console.log('📷 [WebCameraModal] Fechando modal...');
    stopCamera();
    onClose();
  }, [stopCamera, onClose]);

  // ========================================
  // Handler: Toggle Flash
  // ========================================
  const handleToggleFlash = useCallback(() => {
    console.log('📷 [WebCameraModal] Alternando flash...');
    setFlashMode(prev => {
      if (prev === 'auto') return 'on';
      if (prev === 'on') return 'off';
      return 'auto';
    });
  }, []);

  // ========================================
  // Handler: Toggle Zoom
  // ========================================
  const handleToggleZoom = useCallback(() => {
    console.log('📷 [WebCameraModal] Alternando zoom...');
    setZoomLevel(prev => {
      if (prev === '0.5x') return '1x';
      if (prev === '1x') return '2x';
      return '0.5x';
    });
  }, []);

  // ========================================
  // Handler: Trocar Camera
  // ========================================
  const handleFlipCamera = useCallback(() => {
    console.log('📷 [WebCameraModal] Trocando camera...');
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }, []);

  // ========================================
  // Handler: Abrir File Picker
  // ========================================
  const handleOpenFilePicker = useCallback(() => {
    console.log('📷 [WebCameraModal] Abrindo file picker...');
    fileInputRef.current?.click();
  }, []);

  // ========================================
  // Handler: Selecao de Arquivo
  // ========================================
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    console.log('📷 [WebCameraModal] Arquivo selecionado:', files[0].name);

    const file = files[0];
    const uri = URL.createObjectURL(file);

    // Obter dimensoes via Image
    const img = new window.Image();
    img.onload = () => {
      console.log('📷 [WebCameraModal] Dimensoes da imagem:', img.width, img.height);
      stopCamera();
      onCapture({ uri, width: img.width, height: img.height });
    };
    img.onerror = () => {
      console.error('📷 [WebCameraModal] Erro ao carregar imagem');
    };
    img.src = uri;

    // Limpar input para permitir selecionar o mesmo arquivo novamente
    e.target.value = '';
  }, [stopCamera, onCapture]);

  // ========================================
  // Handler: Selecionar do Carrossel
  // ========================================
  const handleSelectFromGallery = useCallback((uri: string, width: number, height: number) => {
    console.log('📷 [WebCameraModal] Imagem selecionada do carrossel:', { uri, width, height });
    stopCamera();
    onCapture({ uri, width, height });
  }, [stopCamera, onCapture]);

  // ========================================
  // Handler: Parar Gravacao de Video
  // ========================================
  const stopRecording = useCallback(() => {
    console.log('📷 [WebCameraModal] Parando gravacao...');
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const durationMs = Date.now() - recordingStartTimeRef.current;

    // Parar animacao do canvas
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    recordingCanvasRef.current = null;

    // Liberar stream de audio separado
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(t => t.stop());
      audioStreamRef.current = null;
    }

    if (mediaRecorderRef.current) {
      const recorder = mediaRecorderRef.current;
      mediaRecorderRef.current = null;
      recorder.onstop = async () => {
        try {
          const blob = new Blob(recordedChunksRef.current, { type: recorder.mimeType || 'video/mp4' });
          const videoUrl = URL.createObjectURL(blob);
          const fileSize = blob.size;
          recordedChunksRef.current = [];

          // Gerar thumbnail do primeiro frame
          let thumbnail: string | undefined;
          let videoWidth = 1920;
          let videoHeight = 1080;
          try {
            const vid = document.createElement('video');
            vid.src = videoUrl;
            vid.currentTime = 0.1;
            await new Promise<void>((resolve) => {
              vid.addEventListener('seeked', () => resolve(), { once: true });
              vid.addEventListener('error', () => resolve(), { once: true });
              setTimeout(() => resolve(), 3000);
            });
            if (vid.videoWidth > 0 && vid.videoHeight > 0) {
              videoWidth = vid.videoWidth;
              videoHeight = vid.videoHeight;
            }
            const thumbCanvas = document.createElement('canvas');
            thumbCanvas.width = videoWidth;
            thumbCanvas.height = videoHeight;
            const ctx = thumbCanvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(vid, 0, 0, videoWidth, videoHeight);
              thumbnail = thumbCanvas.toDataURL('image/jpeg', 0.85);
            }
          } catch (thumbErr) {
            console.warn('📷 [WebCameraModal] Falha ao gerar thumbnail:', thumbErr);
          }

          console.log('📷 [WebCameraModal] Video gravado:', { uri: videoUrl, durationMs, fileSize, videoWidth, videoHeight });

          // Parar camera e enviar video para o editor
          stopCamera();
          onCapture({
            uri: videoUrl,
            width: videoWidth,
            height: videoHeight,
            type: 'video',
            duration: durationMs,
            thumbnail,
            fileSize,
          });
        } catch (err) {
          console.error('📷 [WebCameraModal] Erro ao processar video:', err);
          setIsRecording(false);
          setRecordingTime(0);
        }
      };
      if (recorder.state !== 'inactive') {
        recorder.stop();
      }
    }

    setIsRecording(false);
    setRecordingTime(0);
  }, [stopCamera, onCapture]);

  // ========================================
  // Handler: Iniciar Gravacao de Video
  // ========================================
  const startRecording = useCallback(async () => {
    if (!videoRef.current || isRecording) return;
    console.log('📷 [WebCameraModal] Iniciando gravacao...');

    setIsRecording(true);
    setRecordingTime(0);
    recordingStartTimeRef.current = Date.now();

    // Timer visual
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        const newTime = prev + 1;
        if (activeMode === 'videoNote' && newTime >= VIDEO_NOTE_MAX_DURATION) {
          // Parar automaticamente no limite do video note
          stopRecording();
          return prev;
        }
        return newTime;
      });
    }, 1000);

    // Usar Canvas + MediaRecorder para gravar exatamente o que aparece na tela
    try {
      const videoEl = videoRef.current;
      const rawStream = streamRef.current;
      if (!videoEl || !rawStream) {
        console.error('📷 [WebCameraModal] Video element ou stream nao encontrado');
        return;
      }

      recordedChunksRef.current = [];

      // Calcular crop para simular object-fit: cover
      const displayRect = videoEl.getBoundingClientRect();
      const displayW = displayRect.width;
      const displayH = displayRect.height;
      const natW = videoEl.videoWidth;
      const natH = videoEl.videoHeight;

      const displayAspect = displayW / displayH;
      const videoAspect = natW / natH;

      let sx: number, sy: number, sw: number, sh: number;
      if (videoAspect > displayAspect) {
        sh = natH;
        sw = natH * displayAspect;
        sx = (natW - sw) / 2;
        sy = 0;
      } else {
        sw = natW;
        sh = natW / displayAspect;
        sx = 0;
        sy = (natH - sh) / 2;
      }

      // Canvas com resolucao da area visivel
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(sw);
      canvas.height = Math.round(sh);
      const ctx = canvas.getContext('2d');
      recordingCanvasRef.current = canvas;

      // Se camera frontal, espelhar o canvas
      const isFront = facingMode === 'user';

      // Loop de desenho: copia frames do video com crop para o canvas
      const drawFrame = () => {
        if (ctx && recordingCanvasRef.current) {
          if (isFront) {
            ctx.save();
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
          }
          ctx.drawImage(videoEl, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
          if (isFront) {
            ctx.restore();
          }
          animFrameRef.current = requestAnimationFrame(drawFrame);
        }
      };
      drawFrame();

      // Stream do canvas (30fps) + audio
      const canvasStream = (canvas as any).captureStream(30) as MediaStream;

      // Obter audio: primeiro do stream da camera, depois separadamente
      let audioTracks = rawStream.getAudioTracks();
      if (audioTracks.length === 0) {
        try {
          console.log('📷 [WebCameraModal] Camera stream sem audio, solicitando separadamente...');
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          audioStreamRef.current = audioStream;
          audioTracks = audioStream.getAudioTracks();
          console.log('📷 [WebCameraModal] Audio obtido separadamente:', audioTracks.length, 'tracks');
        } catch (audioErr) {
          console.warn('📷 [WebCameraModal] Nao foi possivel obter audio:', audioErr);
        }
      }
      for (const track of audioTracks) {
        canvasStream.addTrack(track);
      }

      // Tentar diferentes mimeTypes (MP4 primeiro para compatibilidade com WhatsApp)
      const mimeTypes = [
        'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
        'video/mp4;codecs=avc1',
        'video/mp4',
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=vp9,opus',
        'video/webm',
      ];
      let mimeType = '';
      for (const mt of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mt)) {
          mimeType = mt;
          break;
        }
      }
      const recorder = new MediaRecorder(canvasStream, mimeType ? { mimeType } : undefined);
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };
      recorder.start(100);
      mediaRecorderRef.current = recorder;
      console.log('📷 [WebCameraModal] MediaRecorder iniciado:', mimeType, `crop: ${Math.round(sw)}x${Math.round(sh)} de ${natW}x${natH}`);
    } catch (err) {
      console.error('📷 [WebCameraModal] Erro ao iniciar MediaRecorder:', err);
    }
  }, [isRecording, activeMode, facingMode, stopRecording]);

  // ========================================
  // Handler: Capturar Foto/Video
  // ========================================
  const handleCapture = useCallback(async () => {
    // Se modo video, toggle gravacao
    if (activeMode === 'video' || activeMode === 'videoNote') {
      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
      return;
    }

    // Modo foto
    console.log('📷 [WebCameraModal] Capturando foto...');
    if (!videoRef.current || !canvasRef.current || isCapturing) {
      console.log('📷 [WebCameraModal] Captura bloqueada:', { video: !!videoRef.current, canvas: !!canvasRef.current, isCapturing });
      return;
    }

    setIsCapturing(true);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Contexto 2D nao disponivel');
      }

      const width = video.videoWidth || 1280;
      const height = video.videoHeight || 720;
      console.log('📷 [WebCameraModal] Dimensoes do video:', { width, height });
      console.log('📷 [WebCameraModal] FacingMode:', facingMode);

      canvas.width = width;
      canvas.height = height;

      if (facingMode === 'user') {
        context.translate(width, 0);
        context.scale(-1, 1);
      }

      context.drawImage(video, 0, 0, width, height);

      if (facingMode === 'user') {
        context.setTransform(1, 0, 0, 1, 0, 0);
      }

      console.log('📷 [WebCameraModal] Convertendo para blob...');
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error('📷 [WebCameraModal] Erro: blob nulo');
            setIsCapturing(false);
            return;
          }

          const uri = URL.createObjectURL(blob);
          console.log('📷 [WebCameraModal] Foto capturada:', { uri, width, height });

          stopCamera();
          onCapture({ uri, width, height, type: 'photo' });
          setIsCapturing(false);
        },
        'image/jpeg',
        0.85
      );
    } catch (err) {
      console.error('📷 [WebCameraModal] Erro ao capturar:', err);
      setIsCapturing(false);
    }
  }, [isCapturing, stopCamera, onCapture, facingMode, activeMode, isRecording, stopRecording, startRecording]);

  // ========================================
  // Handler: Mudar Modo
  // ========================================
  const handleModeChange = useCallback((mode: CameraModeType) => {
    console.log('📷 [WebCameraModal] Mudando modo para:', mode);
    // Parar gravacao se estiver gravando
    if (isRecording) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      recordingCanvasRef.current = null;
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(t => t.stop());
        audioStreamRef.current = null;
      }
      recordedChunksRef.current = [];
      setIsRecording(false);
      setRecordingTime(0);
    }
    setActiveMode(mode);
  }, [isRecording]);

  // ========================================
  // Verificar se modo e video
  // ========================================
  const isVideoMode = activeMode === 'video' || activeMode === 'videoNote';

  // ========================================
  // Render: Nao Web
  // ========================================
  if (Platform.OS !== 'web') {
    return null;
  }

  // ========================================
  // Render: Modal
  // ========================================
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Modo Video Note: Fundo preto */}
        {activeMode === 'videoNote' && (
          <View style={styles.videoNoteContainer} />
        )}

        {/* Progresso circular ao redor do video - so no videoNote gravando */}
        {activeMode === 'videoNote' && isRecording && (
          <View style={[styles.videoNoteProgress, { width: videoNoteCircleSize + PROGRESS_STROKE_WIDTH * 2, height: videoNoteCircleSize + PROGRESS_STROKE_WIDTH * 2, marginLeft: -(videoNoteCircleSize + PROGRESS_STROKE_WIDTH * 2) / 2, marginTop: -(videoNoteCircleSize + PROGRESS_STROKE_WIDTH * 2) / 2 }]}>
            <CircularProgress
              progress={recordingTime / VIDEO_NOTE_MAX_DURATION}
              size={videoNoteCircleSize + PROGRESS_STROKE_WIDTH * 2}
              strokeWidth={PROGRESS_STROKE_WIDTH}
            />
          </View>
        )}

        {/* Video Element - SEMPRE presente, estilos condicionais */}
        <video
          ref={videoRef as any}
          style={activeMode === 'videoNote' ? {
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: videoNoteCircleSize,
            height: videoNoteCircleSize,
            borderRadius: videoNoteCircleSize / 2,
            objectFit: 'cover',
            transform: `translate(-50%, -50%) ${facingMode === 'user' ? 'scaleX(-1)' : ''}`,
            zIndex: 1,
          } as any : {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
          } as any}
          autoPlay
          playsInline
          muted
        />

        {/* Canvas Oculto para Captura */}
        <canvas
          ref={canvasRef as any}
          style={{
            position: 'absolute',
            top: -9999,
            left: -9999,
            visibility: 'hidden',
          } as any}
        />

        {/* Input File Oculto */}
        <input
          ref={fileInputRef as any}
          type="file"
          accept="image/*"
          style={{ display: 'none' } as any}
          onChange={handleFileSelect as any}
        />

        {/* Overlay de Erro */}
        {errorMessage && (
          <View style={styles.errorOverlay}>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <Pressable style={styles.retryButton} onPress={startCamera}>
              <Text style={styles.retryButtonText}>Tentar Novamente</Text>
            </Pressable>
          </View>
        )}

        {/* Loading */}
        {hasPermission === null && !errorMessage && (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingText}>Iniciando camera...</Text>
          </View>
        )}

        {/* Header: Timer centralizado quando gravando, X + Timer + Flash quando nao */}
        <View style={[styles.header, isRecording && styles.headerRecording]}>
          {isRecording ? (
            <View style={[styles.timerContainer, styles.timerContainerRecording]}>
              <Text style={styles.timerText}>{formatTime(recordingTime)}</Text>
            </View>
          ) : (
            <>
              {/* Botao Fechar */}
              <Pressable style={[styles.headerButton, activeMode === 'videoNote' && styles.headerButtonLight]} onPress={handleClose}>
                <CloseIcon />
              </Pressable>

              {/* Timer - aparece nos modos video e videoNote */}
              {(activeMode === 'video' || activeMode === 'videoNote') && (
                <View style={[styles.timerContainer, activeMode === 'videoNote' && styles.timerContainerLight]}>
                  <Text style={styles.timerText}>{formatTime(recordingTime)}</Text>
                </View>
              )}

              {/* Flash */}
              <Pressable style={[styles.headerButton, activeMode === 'videoNote' && styles.headerButtonLight]} onPress={handleToggleFlash}>
                <FlashIcon mode={flashMode} />
              </Pressable>
            </>
          )}
        </View>

        {/* Carrossel de Galeria - esconde no modo videoNote e durante gravacao */}
        {hasPermission && activeMode !== 'videoNote' && !isRecording && (
          <View style={styles.galleryContainer}>
            <WebGalleryCarousel
              onSelectImage={handleSelectFromGallery}
              onOpenFilePicker={handleOpenFilePicker}
            />
          </View>
        )}

        {/* Controles Principais */}
        {hasPermission && (
          <View style={[styles.controls, isRecording && styles.controlsRecording]}>
            {isRecording ? (
              <>
                {/* Gravando: Flash + Stop + Flip */}
                <Pressable style={[styles.controlButton, activeMode === 'videoNote' && styles.controlButtonLight]} onPress={handleToggleFlash}>
                  <FlashIcon mode={flashMode} />
                </Pressable>

                <Pressable
                  style={styles.captureButton}
                  onPress={handleCapture}
                >
                  <View style={styles.captureButtonInnerRecording} />
                </Pressable>

                <Pressable style={[styles.controlButton, activeMode === 'videoNote' && styles.controlButtonLight]} onPress={handleFlipCamera}>
                  <FlipIcon />
                </Pressable>
              </>
            ) : (
              <>
                {/* Normal: Galeria + Flash + Captura + Zoom + Flip */}
                {activeMode !== 'videoNote' ? (
                  <Pressable style={styles.controlButton} onPress={handleOpenFilePicker}>
                    <GalleryIcon />
                  </Pressable>
                ) : (
                  <View style={styles.controlButtonSpacer} />
                )}

                <Pressable style={[styles.controlButton, activeMode === 'videoNote' && styles.controlButtonLight]} onPress={handleToggleFlash}>
                  <FlashIcon mode={flashMode} />
                </Pressable>

                <Pressable
                  style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
                  onPress={handleCapture}
                  disabled={isCapturing}
                >
                  <View style={[
                    styles.captureButtonInner,
                    isVideoMode && styles.captureButtonInnerVideo,
                  ]} />
                </Pressable>

                <Pressable style={[styles.controlButton, activeMode === 'videoNote' && styles.controlButtonLight]} onPress={handleToggleZoom}>
                  <Text style={styles.zoomText}>{zoomLevel}</Text>
                </Pressable>

                <Pressable style={[styles.controlButton, activeMode === 'videoNote' && styles.controlButtonLight]} onPress={handleFlipCamera}>
                  <FlipIcon />
                </Pressable>
              </>
            )}
          </View>
        )}

        {/* Footer: Abas de Modo (oculto durante gravacao) */}
        {hasPermission && !isRecording && (
          <View style={styles.footer}>
            <Pressable onPress={() => handleModeChange('video')}>
              <Text style={[styles.modeText, activeMode === 'video' && styles.modeTextActive]}>
                VÍDEO
              </Text>
            </Pressable>
            <Pressable onPress={() => handleModeChange('photo')}>
              <Text style={[styles.modeText, activeMode === 'photo' && styles.modeTextActive]}>
                FOTO
              </Text>
            </Pressable>
            <Pressable onPress={() => handleModeChange('videoNote')}>
              <Text style={[styles.modeText, activeMode === 'videoNote' && styles.modeTextActive]}>
                RECADO DE VÍDEO
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </Modal>
  );
};

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1,                                //......Ocupa tela toda
    backgroundColor: CameraColors.cameraBackground,  //......Fundo preto
  },

  // Container Video Note (fundo preto com preview circular)
  videoNoteContainer: {
    flex: 1,                                //......Ocupa tela toda
    backgroundColor: '#000000',             //......Fundo 100% preto
    justifyContent: 'center',               //......Centraliza vertical
    alignItems: 'center',                   //......Centraliza horizontal
  },

  // Preview circular do Video Note (tamanho dinamico via inline style)
  videoNotePreview: {
    justifyContent: 'center',               //......Centraliza vertical
    alignItems: 'center',                   //......Centraliza horizontal
  },

  // Progresso circular do Video Note (posicao absoluta centralizada)
  videoNoteProgress: {
    position: 'absolute',                   //......Posicao absoluta
    top: '50%',                             //......Centro vertical
    left: '50%',                            //......Centro horizontal
    zIndex: 2,                              //......Acima do video
  },

  // Header
  header: {
    position: 'absolute',                   //......Posicao absoluta
    top: 20,                                //......10px do topo (nao cola na borda)
    left: 16,                               //......Esquerda
    right: 16,                              //......Direita
    flexDirection: 'row',                   //......Layout horizontal
    justifyContent: 'space-between',        //......Espaco entre
    alignItems: 'center',                   //......Centraliza vertical
    zIndex: 10,                             //......Camada superior
  },

  // Botao do header
  headerButton: {
    width: 40,                              //......Largura
    height: 40,                             //......Altura
    borderRadius: 20,                       //......Circular
    backgroundColor: CONTROL_BG,            //......Fundo preto opaco
    justifyContent: 'center',               //......Centraliza vertical
    alignItems: 'center',                   //......Centraliza horizontal
  },

  // Botao do header - modo videoNote (fundo claro)
  headerButtonLight: {
    backgroundColor: CONTROL_BG_LIGHT,      //......Fundo claro
  },

  // Header quando gravando (timer centralizado)
  headerRecording: {
    justifyContent: 'center',               //......Centraliza timer
  },

  // Container do timer
  timerContainer: {
    height: 40,                             //......Altura compacta
    backgroundColor: CONTROL_BG,            //......Fundo preto opaco
    borderRadius: 8,                        //......Cantos levemente arredondados
    paddingHorizontal: 16,                  //......Padding horizontal
    justifyContent: 'center',               //......Centraliza vertical
    alignItems: 'center',                   //......Centraliza horizontal
  },

  // Container do timer - modo videoNote (fundo claro)
  timerContainerLight: {
    backgroundColor: CONTROL_BG_LIGHT,      //......Fundo claro
  },

  // Container do timer - gravando (fundo vermelho)
  timerContainerRecording: {
    backgroundColor: RECORDING_RED,         //......Vermelho quando gravando
  },

  // Texto do timer
  timerText: {
    fontSize: 14,                           //......Tamanho fonte
    fontWeight: '700',                      //......Bold
    color: CameraColors.textWhite,          //......Branco
    fontFamily: 'monospace',                //......Monospace
  },

  // Container da galeria
  galleryContainer: {
    position: 'absolute',                   //......Posicao absoluta
    bottom: 200,                            //......Acima dos controles (+10px)
    left: 0,                                //......Esquerda
    right: 0,                               //......Direita
    height: 72,                             //......Altura 56px + padding
    zIndex: 5,                              //......Camada
  },

  // Controles
  controls: {
    position: 'absolute',                   //......Posicao absoluta
    bottom: 100,                            //......Embaixo
    left: 0,                                //......Esquerda
    right: 0,                               //......Direita
    flexDirection: 'row',                   //......Layout horizontal
    justifyContent: 'space-evenly',         //......Espaco uniforme
    alignItems: 'center',                   //......Centraliza vertical
    paddingHorizontal: 20,                  //......Padding horizontal
    zIndex: 5,                              //......Camada
  },

  // Controles quando gravando (compacto, centralizado)
  controlsRecording: {
    justifyContent: 'center',               //......Centraliza controles
    gap: 28,                                //......Espaco entre botoes
  },

  // Botao de controle
  controlButton: {
    width: 44,                              //......Largura
    height: 44,                             //......Altura
    borderRadius: 22,                       //......Circular
    backgroundColor: CONTROL_BG,            //......Fundo preto opaco
    justifyContent: 'center',               //......Centraliza vertical
    alignItems: 'center',                   //......Centraliza horizontal
  },

  // Botao de controle - modo videoNote (fundo claro)
  controlButtonLight: {
    backgroundColor: CONTROL_BG_LIGHT,      //......Fundo claro
  },

  // Spacer para manter posicao (substitui galeria no videoNote)
  controlButtonSpacer: {
    width: 44,                              //......Mesma largura do botao
    height: 44,                             //......Mesma altura do botao
  },

  // Botao de captura
  captureButton: {
    width: 72,                              //......Largura
    height: 72,                             //......Altura
    borderRadius: 36,                       //......Circular
    borderWidth: 4,                         //......Borda
    borderColor: CameraColors.textWhite,    //......Borda branca
    backgroundColor: 'transparent',         //......Fundo transparente
    justifyContent: 'center',               //......Centraliza vertical
    alignItems: 'center',                   //......Centraliza horizontal
  },

  // Botao captura desabilitado
  captureButtonDisabled: {
    opacity: 0.5,                           //......Opacidade reduzida
  },

  // Interior do botao - modo foto
  captureButtonInner: {
    width: 60,                              //......Largura
    height: 60,                             //......Altura
    borderRadius: 30,                       //......Circular
    backgroundColor: CameraColors.textWhite,  //......Branco
  },

  // Interior do botao - modo video
  captureButtonInnerVideo: {
    backgroundColor: RECORDING_RED,         //......Vermelho
  },

  // Interior do botao - gravando
  captureButtonInnerRecording: {
    width: 28,                              //......Largura menor
    height: 28,                             //......Altura menor
    borderRadius: 6,                        //......Quadrado arredondado
    backgroundColor: RECORDING_RED,         //......Vermelho
  },

  // Texto do zoom
  zoomText: {
    fontSize: 13,                           //......Tamanho fonte
    fontWeight: '700',                      //......Bold
    color: ACTIVE_TAB_COLOR,                //......Azul
  },

  // Footer com abas
  footer: {
    position: 'absolute',                   //......Posicao absoluta
    bottom: 0,                              //......Embaixo
    left: 0,                                //......Esquerda
    right: 0,                               //......Direita
    flexDirection: 'row',                   //......Layout horizontal
    justifyContent: 'center',               //......Centraliza
    alignItems: 'center',                   //......Centraliza vertical
    gap: 24,                                //......Espaco entre abas
    paddingVertical: 20,                    //......Padding vertical
    paddingBottom: 40,                      //......Padding inferior extra
    backgroundColor: FOOTER_BG,             //......Fundo branco
    zIndex: 5,                              //......Camada
  },

  // Texto da aba
  modeText: {
    fontSize: 12,                           //......Tamanho fonte
    fontWeight: '700',                      //......Bold
    color: INACTIVE_TAB_COLOR,              //......Branco
    letterSpacing: 1,                       //......Espacamento
    textTransform: 'uppercase',             //......Maiusculas
  },

  // Texto da aba ativa
  modeTextActive: {
    color: ACTIVE_TAB_COLOR,                //......Azul
  },

  // Overlay de erro
  errorOverlay: {
    position: 'absolute',                   //......Posicao absoluta
    top: 0,                                 //......Topo
    left: 0,                                //......Esquerda
    right: 0,                               //......Direita
    bottom: 0,                              //......Embaixo
    backgroundColor: CameraColors.cameraBackground,  //......Fundo preto
    justifyContent: 'center',               //......Centraliza vertical
    alignItems: 'center',                   //......Centraliza horizontal
    padding: 24,                            //......Padding
    zIndex: 20,                             //......Camada superior
  },

  // Texto de erro
  errorText: {
    fontSize: 16,                           //......Tamanho fonte
    color: CameraColors.textWhite,          //......Cor branca
    textAlign: 'center',                    //......Centralizado
    marginBottom: 24,                       //......Margem inferior
    lineHeight: 24,                         //......Altura linha
  },

  // Botao retry
  retryButton: {
    paddingHorizontal: 24,                  //......Padding horizontal
    paddingVertical: 12,                    //......Padding vertical
    borderRadius: CameraStyles.borderRadiusButton,  //......Borda
    backgroundColor: CameraColors.primary,  //......Cor azul
  },

  // Texto botao retry
  retryButtonText: {
    fontSize: 16,                           //......Tamanho fonte
    color: CameraColors.textWhite,          //......Cor branca
    fontWeight: '600',                      //......Peso fonte
  },

  // Overlay de loading
  loadingOverlay: {
    position: 'absolute',                   //......Posicao absoluta
    top: 0,                                 //......Topo
    left: 0,                                //......Esquerda
    right: 0,                               //......Direita
    bottom: 0,                              //......Embaixo
    backgroundColor: CameraColors.cameraBackground,  //......Fundo preto
    justifyContent: 'center',               //......Centraliza vertical
    alignItems: 'center',                   //......Centraliza horizontal
    zIndex: 15,                             //......Camada
  },

  // Texto loading
  loadingText: {
    fontSize: 16,                           //......Tamanho fonte
    color: CameraColors.textWhite,          //......Cor branca
  },
});

// ========================================
// Export
// ========================================
export default WebCameraModal;
