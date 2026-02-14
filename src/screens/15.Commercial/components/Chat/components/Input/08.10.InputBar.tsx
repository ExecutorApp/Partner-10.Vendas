// ========================================
// Componente InputBar
// Barra de input completa do chat com gravacao de audio
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, {                           //......React core
  useState,                               //......Hook de estado
  useCallback,                            //......Hook de callback
  useRef,                                 //......Hook de ref
  useEffect,                              //......Hook de efeito
  useImperativeHandle,                    //......Hook de ref imperativa
  forwardRef,                             //......Forward ref
  memo,                                   //......Memoizacao
} from 'react';                           //......Biblioteca React
import {                                  //......Componentes RN
  View,                                   //......Container basico
  Text,                                   //......Texto
  TextInput,                              //......Input texto
  StyleSheet,                             //......Estilos
  TouchableOpacity,                       //......Toque
  Keyboard,                               //......Teclado
  Animated,                               //......Animacoes
  Alert,                                  //......Alertas
  Platform,                               //......Plataforma
} from 'react-native';                    //......Biblioteca RN
import Svg, {                             //......SVG core
  Path,                                   //......Path SVG
  Rect,                                   //......Retangulo SVG
} from 'react-native-svg';                //......Biblioteca SVG
import { Audio } from 'expo-av';          //......Audio Expo

// ========================================
// Imports de Componentes
// ========================================
import TranscriptionModal from '../Modals/08.20.TranscriptionModal';

// ========================================
// Imports de Servicos
// ========================================
import aiService from '../../../../services/aiService';

// ========================================
// Imports de Tipos
// ========================================
import { ReplyInfo } from '../../types/08.types.whatsapp';

// ========================================
// Tipos e Interfaces
// ========================================

// Estado possivel do componente de audio
type AudioState = 'idle' | 'recording' | 'paused' | 'playing';

// Tipo do ref exposto pelo InputBar
export interface InputBarRef {
  insertText: (text: string) => void;     //......Insere texto no input
}

// Interface de Props
interface InputBarProps {
  onSendMessage: (text: string) => void;  //......Handler enviar texto
  onVoiceStart?: () => void;              //......Handler iniciar voz
  onVoiceEnd?: () => void;                //......Handler finalizar voz
  onEmojiPress?: () => void;              //......Handler emoji
  onAttachPress: () => void;              //......Handler anexo
  replyingTo?: ReplyInfo | null;          //......Respondendo a
  onCancelReply?: () => void;             //......Handler cancelar reply
  disabled?: boolean;                     //......Desabilitado
  placeholder?: string;                   //......Placeholder
  onSendAudio?: (                         //......Handler enviar audio
    durationSec: number,                  //......Duracao em segundos
    uri?: string | null                   //......URI do arquivo
  ) => void;
}

// Resultado do hook de niveis de microfone
type LevelsResult = {
  levels: number[];                       //......Niveis de frequencia
  elapsedMs: number;                      //......Tempo decorrido
  amplitude: number;                      //......Amplitude RMS
};

// ========================================
// Constantes de Configuracao
// ========================================

// Alturas das barras de onda de audio (padrao base)
const WAVE_HEIGHTS = [
  3, 3.5, 4, 3, 10, 8, 9, 18, 18, 14,
  11, 8, 18, 14, 10, 7, 11, 15, 18, 14,
  11, 14, 18, 14, 10, 7, 6, 4, 4, 4,
  11, 14, 18, 14, 10, 7, 11, 15,
];

// Quantidade de barras para captacao em tempo real
const LIVE_BAR_COUNT = 38;

// Altura minima e maxima das barras de gravacao
const MIN_BAR_HEIGHT = 3;
const MAX_BAR_HEIGHT = 18;

// Constantes para altura do input multiline
const MIN_INPUT_HEIGHT = 40;                //......Altura minima do input
const LINE_HEIGHT = 20;                     //......Altura de cada linha
const MAX_LINES = 5;                        //......Maximo de linhas visiveis
const MAX_INPUT_HEIGHT = MIN_INPUT_HEIGHT + (LINE_HEIGHT * (MAX_LINES - 1));

// ========================================
// Hook: useWebMicrophoneLevels
// Captura niveis de audio via WebAudio API
// ========================================
function useWebMicrophoneLevels(
  running: boolean,                       //......Ativo ou nao
  barCount = 40,                          //......Quantidade de barras
  sessionId: number = 0                   //......ID da sessao
): LevelsResult {
  // Estados do hook
  const [levels, setLevels] = useState<number[]>(Array(barCount).fill(0));
  const [elapsedMs, setElapsedMs] = useState(0);
  const [amplitude, setAmplitude] = useState(0);

  // Refs para controle
  const startRef = useRef<number>(0);
  const accRef = useRef<number>(0);
  const streamRef = useRef<any>(null);
  const audioCtxRef = useRef<any>(null);
  const analyserRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const amplitudeRef = useRef<number>(0);

  // Efeito principal
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    let cancelled = false;

    // Inicia captura de audio
    const start = async () => {
      try {
        const stream = await (navigator as any).mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const AC: any = (window as any).AudioContext || (window as any).webkitAudioContext;
        const ctx = new AC();
        audioCtxRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        analyserRef.current = analyser;
        source.connect(analyser);

        const bufFreq = new Uint8Array(analyser.frequencyBinCount);
        const bufTime = new Uint8Array(analyser.fftSize);
        startRef.current = Date.now();

        // Loop de atualizacao
        const loop = () => {
          if (cancelled) return;

          analyser.getByteFrequencyData(bufFreq);
          const step = Math.max(1, Math.floor(bufFreq.length / barCount));
          const vals: number[] = [];
          for (let i = 0; i < barCount; i++) {
            const idx = i * step;
            vals.push((bufFreq[idx] ?? 0) / 255);
          }
          setLevels(vals);

          analyser.getByteTimeDomainData(bufTime);
          let sum = 0;
          for (let i = 0; i < bufTime.length; i++) {
            const v = bufTime[i] - 128;
            sum += v * v;
          }
          const rms = Math.sqrt(sum / bufTime.length) / 128;
          const prev = amplitudeRef.current;
          const smooth = prev * 0.8 + rms * 0.2;
          amplitudeRef.current = Math.max(0, Math.min(1, smooth));
          setAmplitude(amplitudeRef.current);

          const now = Date.now();
          setElapsedMs(accRef.current + (startRef.current ? (now - startRef.current) : 0));
          rafRef.current = requestAnimationFrame(loop);
        };

        rafRef.current = requestAnimationFrame(loop);
      } catch (err) {
        console.warn('[useWebMicrophoneLevels] getUserMedia falhou', err);
      }
    };

    // Para captura de audio
    const stop = () => {
      if (startRef.current) {
        try { accRef.current += Date.now() - startRef.current; } catch {}
      }
      startRef.current = 0;
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      if (analyserRef.current) analyserRef.current.disconnect();
      analyserRef.current = null;
      if (audioCtxRef.current) {
        try { audioCtxRef.current.close(); } catch {}
        audioCtxRef.current = null;
      }
      if (streamRef.current) {
        try { streamRef.current.getTracks().forEach((t: any) => t.stop()); } catch {}
        streamRef.current = null;
      }
    };

    if (running) start();
    else stop();

    return () => { cancelled = true; stop(); };
  }, [running, barCount, sessionId]);

  // Reset ao mudar sessao
  useEffect(() => {
    accRef.current = 0;
    startRef.current = 0;
    setElapsedMs(0);
  }, [sessionId]);

  return { levels, elapsedMs, amplitude };
}

// ========================================
// Icones SVG Memoizados
// ========================================

// Icone de microfone (botao principal no input)
const MicIcon = memo(() => (
  <Svg width={40} height={40} viewBox="0 0 40 40" fill="none">
    <Rect width={40} height={40} rx={6} fill="#1777CF" />
    <Path
      d="M18.3672 21.5474H20.7345C22.2121 21.5474 23.4143 20.3453 23.4143 18.8676V12.9298C23.4143 11.4522 22.2121 10.25 20.7345 10.25H18.3672C16.8895 10.25 15.6873 11.4522 15.6873 12.9298V18.8677C15.6874 20.3452 16.8895 21.5474 18.3672 21.5474ZM16.3124 12.9298C16.3124 11.7968 17.2341 10.875 18.3672 10.875H20.7345C21.8675 10.875 22.7893 11.7968 22.7893 12.9298V18.8677C22.7893 20.0007 21.8675 20.9225 20.7345 20.9225H18.3672C17.2342 20.9225 16.3124 20.0007 16.3124 18.8677V12.9298ZM25.3516 19.0237V19.311C25.3516 21.561 23.5211 23.3915 21.271 23.3915H19.8633V27.8281H25.0391C25.1219 27.8281 25.2014 27.861 25.26 27.9197C25.3186 27.9783 25.3516 28.0577 25.3516 28.1406C25.3516 28.2235 25.3186 28.303 25.26 28.3616C25.2014 28.4202 25.1219 28.4531 25.0391 28.4531H14.0625C13.9796 28.4531 13.9001 28.4202 13.8415 28.3616C13.7829 28.303 13.75 28.2235 13.75 28.1406C13.75 28.0577 13.7829 27.9783 13.8415 27.9197C13.9001 27.861 13.9796 27.8281 14.0625 27.8281H19.2383V23.3916H17.8306C15.5805 23.3916 13.75 21.5611 13.75 19.311V19.0238C13.75 18.9409 13.7829 18.8614 13.8415 18.8028C13.9001 18.7442 13.9796 18.7113 14.0625 18.7113C14.1454 18.7113 14.2249 18.7442 14.2835 18.8028C14.3421 18.8614 14.375 18.9409 14.375 19.0238V19.311C14.375 21.2164 15.9252 22.7666 17.8306 22.7666H21.271C23.1764 22.7666 24.7266 21.2164 24.7266 19.311V19.0238C24.7266 18.9409 24.7595 18.8614 24.8181 18.8028C24.8767 18.7442 24.9562 18.7112 25.039 18.7112C25.1219 18.7112 25.2014 18.7441 25.26 18.8028C25.3186 18.8614 25.3516 18.9408 25.3516 19.0237Z"
      fill="white"
      stroke="white"
      strokeWidth={0.5}
    />
  </Svg>
));

// Icone de microfone pequeno (usado no estado pausado)
const MicSmallIcon = memo(() => (
  <Svg width={13} height={19} viewBox="0 0 13 19" fill="none">
    <Path
      d="M4.86715 11.5474H7.23445C8.71207 11.5474 9.91426 10.3453 9.91426 8.86762V2.9298C9.91426 1.45215 8.71207 0.25 7.23445 0.25H4.86715C3.38949 0.25 2.18734 1.45215 2.18734 2.9298V8.86766C2.18738 10.3452 3.38953 11.5474 4.86715 11.5474ZM2.81238 2.9298C2.81238 1.7968 3.73414 0.875 4.86719 0.875H7.23449C8.3675 0.875 9.2893 1.7968 9.2893 2.9298V8.86766C9.2893 10.0007 8.3675 10.9225 7.23449 10.9225H4.86719C3.73418 10.9225 2.81238 10.0007 2.81238 8.86766V2.9298ZM11.8516 9.02371V9.31098C11.8516 11.561 10.0211 13.3915 7.77102 13.3915H6.36328V17.8281H11.5391C11.6219 17.8281 11.7014 17.861 11.76 17.9197C11.8186 17.9783 11.8516 18.0577 11.8516 18.1406C11.8516 18.2235 11.8186 18.303 11.76 18.3616C11.7014 18.4202 11.6219 18.4531 11.5391 18.4531H0.5625C0.47962 18.4531 0.400134 18.4202 0.341529 18.3616C0.282924 18.303 0.25 18.2235 0.25 18.1406C0.25 18.0577 0.282924 17.9783 0.341529 17.9197C0.400134 17.861 0.47962 17.8281 0.5625 17.8281H5.73828V13.3916H4.33055C2.08051 13.3916 0.25 11.5611 0.25 9.31102V9.02375C0.25 8.94087 0.282924 8.86138 0.341529 8.80278C0.400134 8.74417 0.47962 8.71125 0.5625 8.71125C0.64538 8.71125 0.724866 8.74417 0.783471 8.80278C0.842076 8.86138 0.875 8.94087 0.875 9.02375V9.31102C0.875 11.2164 2.42516 12.7666 4.33055 12.7666H7.77102C9.67641 12.7666 11.2266 11.2164 11.2266 9.31102V9.02375C11.2266 8.94087 11.2595 8.86138 11.3181 8.80277C11.3767 8.74416 11.4562 8.71124 11.539 8.71123C11.6219 8.71123 11.7014 8.74414 11.76 8.80275C11.8186 8.86135 11.8516 8.94083 11.8516 9.02371Z"
      fill="#3A3F51"
      stroke="#3A3F51"
      strokeWidth={0.5}
    />
  </Svg>
));

// Icone de enviar mensagem (botao azul com seta)
const SendBtnIcon = memo(() => (
  <Svg width={40} height={40} viewBox="0 0 40 40" fill="none">
    <Rect width={40} height={40} rx={6} fill="#1777CF" />
    <Path
      d="M27.4876 18.9668L13.9647 12.3624C13.7993 12.2791 13.6153 12.241 13.4309 12.2518C13.2464 12.2626 13.068 12.322 12.9133 12.424C12.7047 12.5572 12.534 12.7429 12.4178 12.9628C12.3016 13.1828 12.244 13.4295 12.2505 13.6787V26.849C12.2454 27.0914 12.3006 27.3312 12.4111 27.5464C12.5215 27.7616 12.6838 27.9453 12.8828 28.0806C13.0557 28.1922 13.2567 28.251 13.4619 28.25C13.6251 28.2483 13.7861 28.2116 13.9342 28.1422L27.4876 21.5378C27.7226 21.4191 27.9191 21.2351 28.0541 21.0073C28.1891 20.7796 28.2569 20.5177 28.2495 20.2523C28.2569 19.987 28.1891 19.725 28.0541 19.4973C27.9191 19.2696 27.7226 19.0855 27.4876 18.9668ZM27.1306 20.845C27.1359 20.845 27.1376 20.8523 27.1328 20.8546L13.6371 27.4418C13.589 27.4717 13.5336 27.4876 13.4771 27.4876C13.4206 27.4876 13.3652 27.4717 13.3171 27.4418C13.2194 27.3785 13.1399 27.2905 13.0864 27.1865C13.0329 27.0825 13.0074 26.9661 13.0124 26.849V13.6787C13.008 13.5682 13.0308 13.4584 13.0786 13.359C13.1265 13.2597 13.1979 13.1738 13.2866 13.1091C13.3186 13.0866 13.3544 13.0708 13.392 13.0623C13.4376 13.0521 13.4849 13.0479 13.5317 13.0476C13.5818 13.0472 13.6294 13.0663 13.6744 13.0883L26.8021 19.507C27.0099 19.6086 27.2353 19.712 27.3429 19.9169C27.3971 20.0202 27.4255 20.1354 27.4255 20.2523C27.4255 20.3693 27.3971 20.4845 27.3429 20.5878C27.2912 20.6863 27.2174 20.7711 27.1276 20.8357C27.1236 20.8386 27.1256 20.845 27.1306 20.845Z"
      fill="#FCFCFC"
      stroke="#FCFCFC"
      strokeWidth={0.5}
    />
  </Svg>
));

// Icone de play (reproduzir audio)
const PlayIcon = memo(() => (
  <Svg width={12} height={14} viewBox="0 0 12 14" fill="none">
    <Path
      d="M8.41016 7L2.3457 10.6172V3.38184L8.41016 7Z"
      fill="#3A3F51"
      stroke="#3A3F51"
      strokeWidth={4.69182}
    />
  </Svg>
));

// Icone de pause (pausar audio)
const PauseIcon = memo(() => (
  <Svg width={9} height={12} viewBox="0 0 9 12" fill="none">
    <Path
      d="M0 1.13364C0 0.507549 0.662619 0 1.48 0C2.29738 0 2.96 0.507549 2.96 1.13364V10.2388C2.96 10.8649 2.29738 11.3724 1.48 11.3724C0.662619 11.3724 0 10.8649 0 10.2388V1.13364Z"
      fill="#3A3F51"
    />
    <Path
      d="M5.92001 1.13364C5.92001 0.507549 6.58263 0 7.40001 0C8.21739 0 8.88001 0.507549 8.88001 1.13364V10.2388C8.88001 10.8649 8.21739 11.3724 7.40001 11.3724C6.58263 11.3724 5.92001 10.8649 5.92001 10.2388V1.13364Z"
      fill="#3A3F51"
    />
  </Svg>
));

// Icone de lixeira (deletar gravacao)
const TrashIcon = memo(() => (
  <Svg width={13} height={15} viewBox="0 0 13 15" fill="none">
    <Path
      d="M5.2 6.13636C5.53334 6.13636 5.80808 6.39957 5.84563 6.73867L5.85 6.81818V10.9091C5.85 11.2856 5.55899 11.5909 5.2 11.5909C4.86666 11.5909 4.59192 11.3277 4.55437 10.9886L4.55 10.9091V6.81818C4.55 6.44162 4.84101 6.13636 5.2 6.13636Z"
      fill="#3A3F51"
    />
    <Path
      d="M8.44563 6.73867C8.40808 6.39957 8.13334 6.13636 7.8 6.13636C7.44101 6.13636 7.15 6.44162 7.15 6.81818V10.9091L7.15437 10.9886C7.19192 11.3277 7.46666 11.5909 7.8 11.5909C8.15899 11.5909 8.45 11.2856 8.45 10.9091V6.81818L8.44563 6.73867Z"
      fill="#3A3F51"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7.8 0C8.83849 0 9.68738 0.851536 9.74669 1.92527L9.75 2.04545V2.72727H12.35C12.709 2.72727 13 3.03253 13 3.40909C13 3.75875 12.7491 4.04694 12.4258 4.08632L12.35 4.09091H11.7V12.9545C11.7 14.0439 10.8882 14.9343 9.86458 14.9965L9.75 15H3.25C2.21151 15 1.36262 14.1485 1.30331 13.0747L1.3 12.9545V4.09091H0.65C0.291015 4.09091 0 3.78565 0 3.40909C0 3.05943 0.250926 2.77125 0.574196 2.73186L0.65 2.72727H3.25V2.04545C3.25 0.956127 4.0618 0.0656858 5.08542 0.00347229L5.2 0H7.8ZM2.6 4.09091V12.9545C2.6 13.3042 2.85093 13.5924 3.1742 13.6318L3.25 13.6364H9.75C10.0833 13.6364 10.3581 13.3732 10.3956 13.0341L10.4 12.9545V4.09091H2.6ZM8.45 2.72727H4.55V2.04545L4.55437 1.96594C4.59192 1.62685 4.86666 1.36364 5.2 1.36364H7.8L7.8758 1.36822C8.19907 1.40761 8.45 1.69579 8.45 2.04545V2.72727Z"
      fill="#3A3F51"
    />
  </Svg>
));

// Icone de REC (gravando) - Bolinha vermelha
const RecIcon = memo(() => (
  <Svg width={12} height={12} viewBox="0 0 12 12" fill="none">
    <Path
      d="M6.14321 0.00538225C2.83348 -0.139593 0.0635569 2.66417 0.000852033 5.99859C-0.0482214 8.46043 2.02377 12 5.89239 12C9.33298 12 11.8439 9.53816 11.9938 6.00406C12.1383 2.62587 9.72556 0.161299 6.14321 0.00538225Z"
      fill="#C1253A"
    />
  </Svg>
));

// Icone de mais (anexar arquivos)
const PlusBtn = memo(() => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 5V19M5 12H19"
      stroke="#7D8592"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
));

// Icone de fechar (X) pequeno para o circulo
const CloseIcon = memo(() => (
  <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6L18 18"
      stroke="#7D8592"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
));

// Icone de limpar texto (X) slim para o input
const ClearTextIcon = memo(() => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6L18 18"
      stroke="#91929E"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
));

// Icone de transcricao (documento com texto - azul fino)
const TranscribeIcon = memo(() => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
      stroke="#1777CF"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M14 2V8H20"
      stroke="#1777CF"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8 13H16"
      stroke="#1777CF"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8 17H16"
      stroke="#1777CF"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
));

// ========================================
// Componente Principal InputBar
// ========================================
const InputBar = forwardRef<InputBarRef, InputBarProps>(({
  onSendMessage,                          //......Handler enviar
  onAttachPress,                          //......Handler anexo
  replyingTo,                             //......Reply info
  onCancelReply,                          //......Handler cancelar
  disabled = false,                       //......Padrao habilitado
  placeholder = 'Digite sua mensagem...', //......Placeholder padrao
  onSendAudio,                            //......Handler enviar audio
}, ref) => {
  // ========================================
  // Estados do Texto
  // ========================================
  const [text, setText] = useState('');             //......Texto digitado
  const [inputHeight, setInputHeight] = useState(MIN_INPUT_HEIGHT);
  const inputRef = useRef<TextInput>(null);

  // ========================================
  // Ref imperativa para insercao de texto externo
  // ========================================
  useImperativeHandle(ref, () => ({
    insertText: (t: string) => setText(prev => prev + t),
  }));

  // ========================================
  // Estados de Gravacao de Audio
  // ========================================
  const [audioState, setAudioState] = useState<AudioState>('idle');
  const [recTime, setRecTime] = useState(0);
  const [playProgress, setPlayProgress] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState(0);

  // ========================================
  // Estados de Transcricao
  // ========================================
  const [showTranscriptionModal, setShowTranscriptionModal] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionText, setTranscriptionText] = useState('');
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);

  // Hook para captura de niveis de audio em tempo real (web)
  const isRecording = audioState === 'recording';
  const { levels, amplitude } = useWebMicrophoneLevels(isRecording, LIVE_BAR_COUNT, sessionId);

  // ========================================
  // Refs para Controle de Gravacao
  // ========================================
  const recRef = useRef<NodeJS.Timeout | null>(null);
  const playRef = useRef<NodeJS.Timeout | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const recDotAnim = useRef(new Animated.Value(1)).current;

  // ========================================
  // Verificar se tem texto
  // ========================================
  const hasText = text.trim().length > 0;

  // ========================================
  // Renderiza nome do remetente com ~pushName em preto
  // ========================================
  const renderSenderName = (name: string) => {
    const tildeIdx = name.indexOf(' ~');
    if (tildeIdx === -1) return name;
    return (
      <>
        {name.substring(0, tildeIdx + 1)}
        <Text style={styles.replyPushName}>{name.substring(tildeIdx + 1)}</Text>
      </>
    );
  };

  // ========================================
  // Efeito de Inicializacao e Limpeza
  // ========================================
  useEffect(() => {
    const init = async () => {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        setHasPermission(status === 'granted');
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });
      } catch {
        setHasPermission(false);
      }
    };
    init();
    return () => {
      if (recRef.current) clearInterval(recRef.current);
      if (playRef.current) clearInterval(playRef.current);
      if (recordingRef.current) recordingRef.current.stopAndUnloadAsync();
      if (soundRef.current) soundRef.current.unloadAsync();
    };
  }, []);

  // ========================================
  // Animacao do Ponto Vermelho
  // ========================================
  useEffect(() => {
    if (audioState === 'recording') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(recDotAnim, { toValue: 0.3, duration: 500, useNativeDriver: true }),
          Animated.timing(recDotAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      recDotAnim.stopAnimation();
      recDotAnim.setValue(1);
    }
  }, [audioState]);

  // ========================================
  // Formata Tempo em mm:ss
  // ========================================
  const fmt = useCallback((s: number) => {
    const minutes = Math.floor(s / 60);
    const seconds = s % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // ========================================
  // Handler de Enviar Texto
  // ========================================
  const handleSend = useCallback(() => {
    if (!hasText || disabled) return;     //......Validacao

    onSendMessage(text.trim());           //......Chama callback
    setText('');                          //......Limpa input
    setInputHeight(MIN_INPUT_HEIGHT);     //......Reseta altura
    Keyboard.dismiss();                   //......Fecha teclado
  }, [text, hasText, disabled, onSendMessage]);

  // ========================================
  // Handler de Cancelar Reply
  // ========================================
  const handleCancelReply = useCallback(() => {
    onCancelReply?.();                    //......Chama callback
  }, [onCancelReply]);

  // ========================================
  // Handler de Mudanca de Tamanho do Conteudo
  // So aumenta quando realmente quebra linha
  // ========================================
  const handleContentSizeChange = useCallback((event: any) => {
    const contentHeight = event.nativeEvent.contentSize.height;
    const PADDING_VERTICAL = 20;                              //......Padding vertical total (10 + 10)
    const textHeight = contentHeight - PADDING_VERTICAL;      //......Altura real do texto
    const numLines = Math.max(1, Math.round(textHeight / LINE_HEIGHT));

    if (numLines <= 1) {
      setInputHeight(MIN_INPUT_HEIGHT);                       //......1 linha = 40px
    } else {
      const extraLines = Math.min(numLines - 1, MAX_LINES - 1);
      const newHeight = MIN_INPUT_HEIGHT + (extraLines * LINE_HEIGHT);
      setInputHeight(Math.min(newHeight, MAX_INPUT_HEIGHT));  //......Limita altura maxima
    }
  }, []);

  // ========================================
  // Inicia Gravacao
  // ========================================
  const startRecording = async () => {
    if (!hasPermission) {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        setHasPermission(status === 'granted');
        if (status !== 'granted') return;
      } catch {
        return;
      }
    }
    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
      }
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        isMeteringEnabled: true,
      });
      await recording.startAsync();
      recordingRef.current = recording;
      setAudioState('recording');
      setRecTime(0);
      setPlayProgress(0);
      setSessionId((prev) => prev + 1);
      recRef.current = setInterval(() => setRecTime((p) => p + 1), 1000);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível iniciar a gravação.');
    }
  };

  // ========================================
  // Pausa Gravacao
  // ========================================
  const pauseRecording = async () => {
    try {
      if (recordingRef.current) {
        await recordingRef.current.pauseAsync();
        const uri = recordingRef.current.getURI();
        if (uri) setRecordedUri(uri);
      }
      setAudioState('paused');
      if (recRef.current) {
        clearInterval(recRef.current);
        recRef.current = null;
      }
      setPlayProgress(0);
    } catch {}
  };

  // ========================================
  // Retoma Gravacao
  // ========================================
  const resumeRecording = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      if (recordingRef.current) {
        await recordingRef.current.startAsync();
      }
      setAudioState('recording');
      setPlayProgress(0);
      recRef.current = setInterval(() => setRecTime((p) => p + 1), 1000);
    } catch {}
  };

  // ========================================
  // Reproducao Previa do Audio Gravado
  // ========================================
  const playPreview = async () => {
    try {
      if (audioState === 'playing') {
        if (soundRef.current) {
          soundRef.current.setOnPlaybackStatusUpdate(null);
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        }
        if (playRef.current) {
          clearInterval(playRef.current);
          playRef.current = null;
        }
        setAudioState('paused');
        setPlayProgress(0);
        return;
      }

      let uri = recordedUri;
      if (!uri && recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        uri = recordingRef.current.getURI() || null;
        if (uri) setRecordedUri(uri);
      }
      if (!uri) return;

      if (soundRef.current) {
        soundRef.current.setOnPlaybackStatusUpdate(null);
        await soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }

      const { sound, status } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false, isLooping: false }
      );
      soundRef.current = sound;

      const durationMs = (status as any)?.durationMillis ?? 0;
      const totalBars = LIVE_BAR_COUNT;

      let hasFinished = false;

      // Finaliza reproducao
      const finishPlayback = async () => {
        if (hasFinished) return;
        hasFinished = true;

        if (playRef.current) {
          clearInterval(playRef.current);
          playRef.current = null;
        }

        if (soundRef.current) {
          soundRef.current.setOnPlaybackStatusUpdate(null);
          await soundRef.current.stopAsync().catch(() => {});
          await soundRef.current.unloadAsync().catch(() => {});
          soundRef.current = null;
        }

        setAudioState('paused');
        setPlayProgress(0);
      };

      sound.setOnPlaybackStatusUpdate((playbackStatus) => {
        if (!playbackStatus.isLoaded) return;
        if (playbackStatus.didJustFinish && !hasFinished) {
          finishPlayback();
        }
      });

      await sound.playAsync();
      setAudioState('playing');
      setPlayProgress(0);

      const stepMs = durationMs > 0 ? Math.max(50, durationMs / totalBars) : 100;

      playRef.current = setInterval(() => {
        if (hasFinished) {
          if (playRef.current) {
            clearInterval(playRef.current);
            playRef.current = null;
          }
          return;
        }
        setPlayProgress((p) => {
          if (p >= totalBars - 1) {
            return p;
          }
          return p + 1;
        });
      }, stepMs);
    } catch (error) {
      console.warn('Erro ao reproduzir prévia:', error);
      setAudioState('paused');
      setPlayProgress(0);
    }
  };

  // ========================================
  // Envia Audio
  // ========================================
  const sendAudio = async () => {
    try {
      let uri: string | null = recordedUri;
      if (recordingRef.current) {
        try {
          await recordingRef.current.stopAndUnloadAsync();
        } catch {}
        uri = recordingRef.current.getURI();
      }
      if (recTime > 0 && onSendAudio) {
        onSendAudio(recTime, uri);
      }
      resetAudioState();
    } catch {
      resetAudioState();
    }
  };

  // ========================================
  // Deleta Audio Gravado
  // ========================================
  const deleteAudio = async () => {
    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
      }
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }
    } catch {}
    resetAudioState();
  };

  // ========================================
  // Reseta Estado do Audio
  // ========================================
  const resetAudioState = () => {
    setAudioState('idle');
    setRecTime(0);
    setPlayProgress(0);
    setRecordedUri(null);
    recordingRef.current = null;
    soundRef.current = null;
    if (recRef.current) {
      clearInterval(recRef.current);
      recRef.current = null;
    }
    if (playRef.current) {
      clearInterval(playRef.current);
      playRef.current = null;
    }
  };

  // ========================================
  // Abre Modal de Transcricao
  // ========================================
  const openTranscription = async () => {
    // Reseta estados
    setTranscriptionText('');
    setTranscriptionError(null);
    setIsTranscribing(true);
    setShowTranscriptionModal(true);

    try {
      // Obtem URI do audio gravado
      let uri = recordedUri;
      if (!uri && recordingRef.current) {
        // Para gravacao para obter URI
        await recordingRef.current.stopAndUnloadAsync();
        uri = recordingRef.current.getURI();
        if (uri) setRecordedUri(uri);
      }

      if (!uri) {
        setTranscriptionError('Nenhum áudio gravado para transcrever.');
        setIsTranscribing(false);
        return;
      }

      // Chama servico de transcricao
      const response = await aiService.transcribeAudio(uri, 'audio.m4a');

      // Atualiza texto transcrito
      setTranscriptionText(response.text || '');
      setIsTranscribing(false);
    } catch (error) {
      console.error('[InputBar] Erro na transcricao:', error);
      setTranscriptionError(
        error instanceof Error
          ? error.message
          : 'Erro ao transcrever áudio. Tente novamente.'
      );
      setIsTranscribing(false);
    }
  };

  // ========================================
  // Fecha Modal de Transcricao
  // ========================================
  const closeTranscription = () => {
    setShowTranscriptionModal(false);
    setTranscriptionText('');
    setTranscriptionError(null);
    setIsTranscribing(false);
  };

  // ========================================
  // Envia Texto da Transcricao
  // ========================================
  const sendTranscriptionText = (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Fecha modal
    closeTranscription();

    // Deleta o audio gravado
    deleteAudio();

    // Envia texto como mensagem
    onSendMessage(textToSend.trim());
  };

  // ========================================
  // Cancela Transcricao e Volta
  // ========================================
  const cancelTranscription = () => {
    closeTranscription();
    // Mantem o audio gravado para o usuario decidir
  };

  // ========================================
  // Calcula alturas das barras baseado nos niveis
  // ========================================
  const getLiveBarHeights = useCallback((): number[] => {
    if (audioState === 'recording' && levels.length > 0) {
      return levels.map((lvl) => {
        const clamped = Math.max(0, Math.min(1, lvl));
        const shaped = Math.pow(clamped, 0.7);
        return Math.round(MIN_BAR_HEIGHT + shaped * (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT));
      });
    }
    if (audioState === 'recording' && amplitude > 0) {
      const factor = 0.35 + Math.max(0, Math.min(1, amplitude)) * 0.65;
      return WAVE_HEIGHTS.map((h) => Math.round(MIN_BAR_HEIGHT + (h / 18) * (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT) * factor));
    }
    return WAVE_HEIGHTS.map((h) => Math.max(MIN_BAR_HEIGHT, Math.round(h * 0.55)));
  }, [audioState, levels, amplitude]);

  // ========================================
  // Renderiza Ondas de Gravacao
  // ========================================
  const renderRecordingWaveform = () => {
    const showProgressDot = audioState === 'paused' || audioState === 'playing';
    const barHeights = getLiveBarHeights();

    return (
      <View style={styles.recWaveContainer}>
        {/* Ponto de Progresso */}
        {showProgressDot && (
          <View
            style={[
              styles.progressDotWrapper,
              { left: Math.min(91, Math.max(0, Math.round((playProgress / LIVE_BAR_COUNT) * 94))) },
            ]}
          >
            <View style={styles.progressDot} />
          </View>
        )}
        {/* Barras de Onda */}
        {barHeights.map((height, index) => {
          let barColor: string;
          if (audioState === 'recording') {
            barColor = '#7D8592';
          } else if (audioState === 'playing') {
            barColor = index <= playProgress ? '#7D8592' : 'rgba(125,133,146,0.5)';
          } else {
            barColor = 'rgba(125,133,146,0.6)';
          }
          return (
            <View
              key={index}
              style={[
                styles.recWaveBar,
                {
                  height: Math.max(MIN_BAR_HEIGHT, height),
                  backgroundColor: barColor,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  // ========================================
  // Render: Estado Gravando
  // ========================================
  if (audioState === 'recording') {
    return (
      <View style={styles.container}>
        {/* Reply Preview */}
        {replyingTo && (
          <View style={styles.replyContainer}>
            <View style={styles.replyBar} />
            <View style={styles.replyContent}>
              <Text style={styles.replySenderName} numberOfLines={1}>
                {renderSenderName(replyingTo.senderName)}
              </Text>
              <Text style={styles.replyPreviewText} numberOfLines={1}>
                {replyingTo.content || 'Mensagem'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.replyClose}
              onPress={handleCancelReply}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <CloseIcon />
            </TouchableOpacity>
          </View>
        )}
        {/* Area de Gravacao */}
        <View style={styles.audioInputContainer}>
          <View style={styles.audioInputBox}>
            {/* Botao Lixeira */}
            <TouchableOpacity style={styles.audioIconBtn} onPress={deleteAudio}>
              <TrashIcon />
            </TouchableOpacity>
            {/* Bolinha Vermelha */}
            <Animated.View style={{ opacity: recDotAnim }}>
              <RecIcon />
            </Animated.View>
            {/* Tempo de Gravacao */}
            <Text style={styles.recTimeText}>{fmt(recTime)}</Text>
            {/* Ondas de Audio */}
            {renderRecordingWaveform()}
            {/* Botao Pausar */}
            <TouchableOpacity style={styles.audioIconBtn} onPress={pauseRecording}>
              <PauseIcon />
            </TouchableOpacity>
          </View>
          {/* Botao Enviar */}
          <TouchableOpacity style={styles.actBtn} onPress={sendAudio}>
            <SendBtnIcon />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ========================================
  // Render: Estado Pausado ou Reproduzindo
  // ========================================
  if (audioState === 'paused' || audioState === 'playing') {
    return (
      <View style={styles.containerWithFloating}>
        {/* Botao Flutuante de Transcricao (FORA do container de input) */}
        <TouchableOpacity
          style={styles.transcribeFloatingBtn}
          onPress={openTranscription}
          activeOpacity={0.8}
        >
          <TranscribeIcon />
        </TouchableOpacity>

        {/* Container Principal */}
        <View style={styles.container}>
          {/* Reply Preview */}
          {replyingTo && (
            <View style={styles.replyContainer}>
              <View style={styles.replyBar} />
              <View style={styles.replyContent}>
                <Text style={styles.replySenderName} numberOfLines={1}>
                  {renderSenderName(replyingTo.senderName)}
                </Text>
                <Text style={styles.replyPreviewText} numberOfLines={1}>
                  {replyingTo.content || 'Mensagem'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.replyClose}
                onPress={handleCancelReply}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <CloseIcon />
              </TouchableOpacity>
            </View>
          )}
          {/* Area de Preview */}
          <View style={styles.audioInputContainer}>
            <View style={styles.audioInputBox}>
              {/* Botao Lixeira */}
              <TouchableOpacity style={styles.audioIconBtn} onPress={deleteAudio}>
                <TrashIcon />
              </TouchableOpacity>
              {/* Botao Play/Pause */}
              <TouchableOpacity style={styles.audioIconBtn} onPress={playPreview}>
                {audioState === 'playing' ? <PauseIcon /> : <PlayIcon />}
              </TouchableOpacity>
              {/* Ondas de Audio */}
              {renderRecordingWaveform()}
              {/* Tempo Gravado */}
              <Text style={styles.recTimeText}>{fmt(recTime)}</Text>
              {/* Botao Continuar Gravacao */}
              <TouchableOpacity style={styles.audioIconBtn} onPress={resumeRecording}>
                <MicSmallIcon />
              </TouchableOpacity>
            </View>
            {/* Botao Enviar */}
            <TouchableOpacity style={styles.actBtn} onPress={sendAudio}>
              <SendBtnIcon />
            </TouchableOpacity>
          </View>
        </View>

        {/* Modal de Transcricao */}
        <TranscriptionModal
          visible={showTranscriptionModal}
          onClose={closeTranscription}
          onSend={sendTranscriptionText}
          onCancel={cancelTranscription}
          isLoading={isTranscribing}
          initialText={transcriptionText}
          error={transcriptionError}
        />
      </View>
    );
  }

  // ========================================
  // Render: Estado Idle (Campo de Texto)
  // ========================================
  return (
    <View style={styles.container}>
      {/* Reply Preview */}
      {replyingTo && (
        <View style={styles.replyContainer}>
          <View style={styles.replyBar} />
          <View style={styles.replyContent}>
            <Text style={styles.replySenderName} numberOfLines={1}>
              {renderSenderName(replyingTo.senderName)}
            </Text>
            <Text style={styles.replyPreviewText} numberOfLines={1}>
              {replyingTo.content || 'Mensagem'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.replyClose}
            onPress={handleCancelReply}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <CloseIcon />
          </TouchableOpacity>
        </View>
      )}
      {/* Area do Input */}
      <View style={styles.inputRow}>
        {/* Container do Input */}
        <View style={styles.inputBox}>
          {/* Botao + (Anexar) */}
          <TouchableOpacity
            style={styles.attachBtn}
            onPress={onAttachPress}
            disabled={disabled}
          >
            <PlusBtn />
          </TouchableOpacity>
          {/* Campo de Texto */}
          <TextInput
            ref={inputRef}
            style={[styles.textInput, { height: inputHeight }]}
            placeholder={placeholder}
            placeholderTextColor="#91929E"
            value={text}
            onChangeText={setText}
            maxLength={1000}
            multiline={true}
            scrollEnabled={inputHeight >= MAX_INPUT_HEIGHT}
            onContentSizeChange={handleContentSizeChange}
            textAlignVertical="center"
            editable={!disabled}
          />
          {/* Botao Limpar Texto */}
          {hasText && (
            <TouchableOpacity
              style={styles.clearTextBtn}
              onPress={() => { setText(''); setInputHeight(MIN_INPUT_HEIGHT); }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <ClearTextIcon />
            </TouchableOpacity>
          )}
        </View>
        {/* Botao Enviar ou Microfone */}
        {hasText ? (
          <TouchableOpacity
            style={styles.actBtn}
            onPress={handleSend}
            disabled={disabled}
          >
            <SendBtnIcon />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.actBtn}
            onPress={startRecording}
            disabled={disabled}
          >
            <MicIcon />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

// ========================================
// Export Default
// ========================================
export default InputBar;

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container principal
  container: {
    backgroundColor: '#FCFCFC',           //......Cor de fundo
    borderTopWidth: 1,                    //......Borda superior
    borderTopColor: '#D8E0F0',            //......Cor da borda
    paddingBottom: 8,                     //......Padding inferior
  },

  // Container do reply (sem padding vertical para barra ocupar altura total)
  replyContainer: {
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    paddingLeft: 0,                       //......Sem margem esquerda
    paddingRight: 12,                     //......Padding direito
    backgroundColor: '#F4F4F4',           //......Cor de fundo
    borderBottomWidth: 1,                 //......Borda inferior
    borderBottomColor: '#D8E0F0',         //......Cor da borda
  },

  // Barra lateral reply (flush na borda esquerda, altura total)
  replyBar: {
    width: 4,                             //......Largura
    alignSelf: 'stretch',                 //......Estica altura total
    backgroundColor: '#1777CF',           //......Cor azul
    borderRadius: 0,                      //......Sem arredondamento
    marginRight: 10,                      //......Margem direita do texto
  },

  // Conteudo do reply (padding vertical aqui, nao no container)
  replyContent: {
    flex: 1,                              //......Ocupa espaco
    justifyContent: 'center',             //......Centraliza vertical
    paddingVertical: 8,                   //......Espacamento vertical
  },

  // Nome do remetente no reply
  replySenderName: {
    fontFamily: 'Inter_600SemiBold',      //......Fonte bold
    fontSize: 13,                         //......Tamanho fonte
    color: '#1777CF',                     //......Cor azul
    marginBottom: 2,                      //......Espaco inferior
  },

  // Nome do pushName (~nome) no reply
  replyPushName: {
    fontFamily: 'Inter_400Regular',       //......Fonte regular
    color: '#3A3F51',                     //......Cor preta padrao sistema
  },

  // Preview do conteudo no reply
  replyPreviewText: {
    fontFamily: 'Inter_400Regular',       //......Fonte regular
    fontSize: 13,                         //......Tamanho fonte
    color: '#7D8592',                     //......Cor cinza
  },

  // Botao fechar reply (circulo outline padrao WhatsApp)
  replyClose: {
    width: 22,                            //......Largura do circulo
    height: 22,                           //......Altura do circulo
    borderRadius: 11,                     //......Forma circular
    borderWidth: 1.5,                     //......Borda outline
    borderColor: '#7D8592',               //......Cor da borda cinza
    backgroundColor: 'transparent',       //......Sem fundo
    justifyContent: 'center',             //......Centraliza vertical
    alignItems: 'center',                 //......Centraliza horizontal
    alignSelf: 'center',                  //......Centraliza no container
  },

  // Linha do input
  inputRow: {
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'flex-end',               //......Alinha na base
    paddingHorizontal: 8,                 //......Padding horizontal
    paddingVertical: 8,                   //......Padding vertical
    gap: 7,                               //......Espaco entre
  },

  // Box do input
  inputBox: {
    flex: 1,                              //......Ocupa espaco
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'flex-end',               //......Alinha na base
    backgroundColor: '#F4F4F4',           //......Cor de fundo cinza
    borderRadius: 6,                      //......Bordas arredondadas
    paddingHorizontal: 10,                //......Padding horizontal
    minHeight: 40,                        //......Altura minima
    paddingVertical: 0,                   //......Sem padding vertical
  },

  // Botao de anexar
  attachBtn: {
    width: 30,                            //......Largura
    height: 40,                           //......Altura minima
    justifyContent: 'center',             //......Centraliza vertical
    alignItems: 'center',                 //......Centraliza horizontal
    alignSelf: 'flex-end',                //......Alinha na base
  },

  // Campo de texto
  textInput: {
    flex: 1,                              //......Ocupa espaco
    fontSize: 14,                         //......Tamanho fonte
    lineHeight: 20,                       //......Altura da linha
    color: '#3A3F51',                     //......Cor do texto
    paddingHorizontal: 8,                 //......Padding horizontal
    paddingTop: 10,                       //......Padding superior
    paddingBottom: 10,                    //......Padding inferior
    outlineStyle: 'none',                 //......Remove outline de foco
    borderWidth: 0,                       //......Remove borda
  } as any,

  // Botao de limpar texto (X)
  clearTextBtn: {
    width: 24,                            //......Largura do botao
    height: 40,                           //......Altura do botao
    justifyContent: 'center',             //......Centraliza vertical
    alignItems: 'center',                 //......Centraliza horizontal
    marginRight: 4,                       //......Margem direita
    alignSelf: 'flex-end',                //......Alinha na base
  },

  // Botao de acao
  actBtn: {
    width: 40,                            //......Largura
    height: 40,                           //......Altura
    justifyContent: 'center',             //......Centraliza vertical
    alignItems: 'center',                 //......Centraliza horizontal
  },

  // Container com botao flutuante
  containerWithFloating: {
    position: 'relative',                 //......Posicao relativa
  },

  // Botao flutuante de transcricao (fora do input)
  transcribeFloatingBtn: {
    position: 'absolute',                 //......Posicao absoluta
    bottom: 76,                           //......Distancia do fundo
    right: 8,                             //......Alinhado com botao enviar
    width: 40,                            //......Mesmo tamanho do enviar
    height: 40,                           //......Mesmo tamanho do enviar
    borderRadius: 6,                      //......Cantos levemente arredondados
    backgroundColor: '#FFFFFF',           //......Fundo branco
    borderWidth: 1,                       //......Borda fina
    borderColor: '#E8ECF4',               //......Borda cinza padrao
    justifyContent: 'center',             //......Centraliza vertical
    alignItems: 'center',                 //......Centraliza horizontal
    shadowColor: '#000',                  //......Cor sombra
    shadowOffset: { width: 0, height: 2 }, //....Offset sombra
    shadowOpacity: 0.15,                  //......Opacidade sombra
    shadowRadius: 3,                      //......Raio sombra
    elevation: 4,                         //......Elevacao Android
    zIndex: 100,                          //......Acima de tudo
  },

  // Container de gravacao de audio
  audioInputContainer: {
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    paddingHorizontal: 8,                 //......Padding horizontal
    paddingVertical: 8,                   //......Padding vertical
    gap: 7,                               //......Espaco entre
  },

  // Box de gravacao
  audioInputBox: {
    flex: 1,                              //......Ocupa espaco
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    backgroundColor: '#F4F4F4',           //......Cor de fundo
    borderRadius: 6,                      //......Bordas arredondadas
    paddingLeft: 10,                      //......Padding esquerdo
    paddingRight: 15,                     //......Padding direito
    height: 40,                           //......Altura
    gap: 15,                              //......Espaco entre
  },

  // Botao de icone do audio
  audioIconBtn: {
    width: 20,                            //......Largura
    height: 20,                           //......Altura
    justifyContent: 'center',             //......Centraliza vertical
    alignItems: 'center',                 //......Centraliza horizontal
  },

  // Texto do tempo de gravacao
  recTimeText: {
    fontSize: 14,                         //......Tamanho fonte
    color: '#3A3F51',                     //......Cor do texto
    minWidth: 40,                         //......Largura minima
  },

  // Container das ondas de gravacao
  recWaveContainer: {
    flex: 1,                              //......Ocupa espaco
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    height: 20,                           //......Altura
    gap: 2,                               //......Espaco entre barras
    position: 'relative',                 //......Posicao relativa
    overflow: 'visible',                  //......Overflow visivel
  },

  // Barra de onda
  recWaveBar: {
    width: 1.5,                           //......Largura
    borderRadius: 0.75,                   //......Bordas arredondadas
  },

  // Wrapper do ponto de progresso
  progressDotWrapper: {
    position: 'absolute',                 //......Posicao absoluta
    left: 0,                              //......Esquerda
    top: 0,                               //......Topo
    bottom: 0,                            //......Fundo
    justifyContent: 'center',             //......Centraliza vertical
    zIndex: 10,                           //......Z-index
  },

  // Ponto de progresso
  progressDot: {
    width: 9,                             //......Largura
    height: 9,                            //......Altura
    borderRadius: 4.5,                    //......Circular
    backgroundColor: '#1777CF',           //......Cor azul
  },
});
