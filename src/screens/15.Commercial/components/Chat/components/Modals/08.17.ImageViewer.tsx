// ========================================
// Componente ImageViewer
// Visualizador de imagem fullscreen
// Com barras toggle ao tocar na imagem
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, {                           //......React core
  useState,                               //......Hook de estado
  useCallback,                            //......Hook de callback
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
  Dimensions,                             //......Dimensoes
  ActivityIndicator,                      //......Loading
  StatusBar,                              //......Status bar
  Platform,                               //......Plataforma
  TextInput,                              //......Campo de texto
  Animated,                               //......Animacoes
  Keyboard,                               //......Teclado
  TouchableOpacity,                       //......Toque com opacity
  ScrollView,                             //......Scroll
  KeyboardAvoidingView,                   //......Evita teclado
} from 'react-native';                    //......Biblioteca RN
import Svg, {                             //......SVG core
  Path,                                   //......Path SVG
  Rect,                                   //......Rect SVG
  Circle,                                 //......Circulo SVG
} from 'react-native-svg';                //......Biblioteca SVG

// ========================================
// Imports de Tipos
// ========================================
import { MessageKey } from '../../types/08.types.whatsapp';

// ========================================
// Imports de Servicos
// ========================================
import { evolutionService } from '../../../../services/evolutionService';
import { mediaStorageService } from '../../../../services/mediaStorageService';

// ========================================
// Imports de Cores
// ========================================
import { ChatColors } from '../../styles/08.ChatColors';

// ========================================
// Imports de Componentes
// ========================================
import EmojiPicker from './08.15.EmojiPicker';

// ========================================
// Constantes
// ========================================
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BAR_BACKGROUND = '#F4F4F5';         //......Cor de fundo das barras (zinc-100)
const ICON_COLOR = '#3A3F51';             //......Cor dos icones
const BORDER_COLOR = '#D8E0F0';           //......Cor das bordas
const INPUT_HEIGHT = 56;                  //......Altura do input bar
const MIN_INPUT_HEIGHT = 40;              //......Altura minima do input multiline
const MAX_INPUT_HEIGHT = 100;             //......Altura maxima do input (5 linhas)
const LINE_HEIGHT = 20;                   //......Altura de cada linha de texto
const MAX_LINES = 5;                      //......Maximo de linhas visiveis

// ========================================
// Interface de Props
// ========================================
interface ImageViewerProps {
  visible: boolean;                       //......Visibilidade
  imageUrl: string;                       //......URL da imagem
  caption?: string;                       //......Legenda opcional
  senderName?: string;                    //......Nome do remetente
  timestamp?: Date;                       //......Data/hora
  instanceName?: string;                  //......Nome da instancia Evolution
  remoteJid?: string;                     //......Telefone do destinatario
  messageKey?: MessageKey;                //......Chave para download de midia
  currentReaction?: string;               //......Reacao atual na imagem
  leadName?: string;                      //......Nome do lead (para reply preview)
  leadPhone?: string;                     //......Telefone do lead (para reply preview)
  leadPushName?: string;                  //......PushName do lead (para reply preview)
  isOutgoing?: boolean;                   //......Se a imagem foi enviada por mim
  onClose: () => void;                    //......Handler fechar
  onDownload?: () => void;                //......Handler download
  onShare?: () => void;                   //......Handler compartilhar
  onReply?: (text?: string) => void;      //......Handler responder (com texto)
  onDelete?: () => void;                  //......Handler excluir
  onSendReply?: (text: string) => Promise<void>;
  onReaction?: (emoji: string | null, previousEmoji?: string) => void;
}

// ========================================
// Icone de Voltar (Seta) - Tamanho padrao 35x35
// ========================================
const BackIcon: React.FC = () => (
  <Svg width={35} height={35} viewBox="0 0 35 35" fill="none">
    <Rect
      width={35}
      height={35}
      rx={8}
      fill="#FCFCFC"
    />
    <Rect
      x={0.5}
      y={0.5}
      width={34}
      height={34}
      rx={7.5}
      stroke="#EDF2F6"
    />
    <Path
      d="M19 24L12 17.5M12 17.5L19 11M12 17.5L24 17.5"
      stroke={ICON_COLOR}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ========================================
// Icone de Fechar (X) - Com fundo
// ========================================
const CloseIcon: React.FC = () => (
  <Svg width={35} height={35} viewBox="0 0 35 35" fill="none">
    <Rect
      width={35}
      height={35}
      rx={8}
      fill="#FCFCFC"
    />
    <Rect
      x={0.5}
      y={0.5}
      width={34}
      height={34}
      rx={7.5}
      stroke="#EDF2F6"
    />
    <Path
      d="M23.655 11.7479C23.2959 11.4179 22.7339 11.4173 22.374 11.7466L17.5 16.2065L12.626 11.7466C12.2661 11.4173 11.7041 11.4179 11.345 11.7479L11.2916 11.797C10.9022 12.1549 10.9029 12.757 11.2931 13.114L16.0863 17.5L11.2931 21.886C10.9029 22.243 10.9022 22.8451 11.2916 23.203L11.345 23.2521C11.7041 23.5821 12.2661 23.5827 12.626 23.2534L17.5 18.7935L22.374 23.2534C22.7339 23.5827 23.2959 23.5821 23.655 23.2521L23.7084 23.203C24.0978 22.8451 24.0971 22.243 23.7069 21.886L18.9137 17.5L23.7069 13.114C24.0971 12.757 24.0978 12.1549 23.7084 11.797L23.655 11.7479Z"
      fill={ICON_COLOR}
    />
  </Svg>
);

// ========================================
// Icone de Fechar Simples (X) - Sem fundo
// ========================================
const CloseIconSimple: React.FC = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
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
// Icone de Download
// ========================================
const DownloadIcon: React.FC = () => (
  <Svg width={38} height={28} viewBox="0 0 38 28" fill="none">
    <Rect
      x={0.4}
      y={0.4}
      width={37.2}
      height={27.2}
      rx={5.6}
      stroke={BORDER_COLOR}
      strokeWidth={0.8}
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.9031 21.0979V17.8371C11.9031 17.3123 11.4771 16.8861 10.9523 16.8861C10.427 16.8861 10 17.3113 10 17.8371V21.1434C10 22.1678 10.8332 23 11.8573 23H26.1442C27.1678 23 28 22.1668 28 21.1434V17.8371C28 17.3123 27.574 16.8861 27.0492 16.8861C26.5245 16.8861 26.0985 17.3124 26.0985 17.8371V21.0979H11.9031ZM18.05 15.1445V5.95112C18.05 5.42623 18.4758 5 19.0008 5C19.5257 5 19.9515 5.42623 19.9515 5.95112V15.1446L22.891 12.2048C23.2621 11.8337 23.865 11.8338 24.2363 12.2046C24.6075 12.5755 24.6074 13.1789 24.2364 13.5499L19.6735 18.1129C19.495 18.2915 19.2532 18.3916 19.0008 18.3916C18.7483 18.3916 18.5066 18.2915 18.328 18.1129L13.7651 13.5498C13.3943 13.179 13.3945 12.5763 13.7647 12.2051C14.1355 11.8333 14.7394 11.8335 15.1106 12.2047L18.05 15.1445Z"
      fill={ICON_COLOR}
    />
  </Svg>
);

// ========================================
// Icone de Compartilhar
// ========================================
const ShareIcon: React.FC = () => (
  <Svg width={43} height={30} viewBox="0 0 43 30" fill="none">
    <Rect
      x={0.4}
      y={0.4}
      width={42.2}
      height={29.2}
      rx={5.6}
      stroke={BORDER_COLOR}
      strokeWidth={0.8}
    />
    <Path
      d="M10.7667 24.9993C10.7082 24.9993 10.6492 24.9926 10.5907 24.9791C10.4226 24.9391 10.2729 24.8434 10.1657 24.7075C10.0586 24.5716 10.0002 24.4034 10 24.2301C10 17.2403 10.8813 11.427 21.5 11.1626V5.76912C21.5 5.61957 21.5435 5.47326 21.6251 5.34811C21.7067 5.22296 21.8229 5.12439 21.9594 5.06446C22.096 5.00453 22.247 4.98585 22.394 5.01069C22.541 5.03553 22.6776 5.10282 22.787 5.20433L32.7537 14.4348C32.9109 14.5796 33 14.7848 33 14.9996C33 15.2144 32.9109 15.4196 32.7537 15.5646L22.787 24.7951C22.6777 24.897 22.5411 24.9645 22.3939 24.9894C22.2468 25.0142 22.0956 24.9953 21.959 24.9349C21.8226 24.8748 21.7065 24.7762 21.6249 24.6511C21.5434 24.5259 21.5 24.3796 21.5 24.2301V18.8547C14.2159 19.0297 12.8719 21.7257 11.4524 24.5741C11.3888 24.7019 11.2909 24.8094 11.1698 24.8845C11.0487 24.9596 10.9091 24.9994 10.7667 24.9993ZM22.2667 17.3072C22.6904 17.3072 23.0333 17.6513 23.0333 18.0764V22.473L31.1029 14.9996L23.0333 7.52618V11.9228C23.0333 12.348 22.6904 12.692 22.2667 12.692C13.7973 12.692 11.9736 15.9784 11.615 21.2277C13.2029 19.0876 15.9095 17.3072 22.2667 17.3072Z"
      fill={ICON_COLOR}
    />
  </Svg>
);

// ========================================
// Icone de Responder
// ========================================
const ReplyIcon: React.FC = () => (
  <Svg width={24} height={20} viewBox="0 0 24 20" fill="none">
    <Path
      d="M10.0004 5.00365V0.752138C10.0013 0.604446 9.95837 0.459812 9.87711 0.336474C9.79585 0.213135 9.67989 0.116614 9.54385 0.0590801C9.40782 0.00154609 9.25778 -0.0144249 9.11268 0.0131808C8.96758 0.0407865 8.83389 0.110733 8.72849 0.214201L0.22876 8.46325C0.156417 8.53293 0.098871 8.61648 0.0595649 8.70891C0.0202589 8.80134 0 8.90075 0 9.00118C0 9.10162 0.0202589 9.20103 0.0595649 9.29346C0.098871 9.38589 0.156417 9.46944 0.22876 9.53912L8.72849 17.7882C8.94548 17.9981 9.26747 18.0571 9.54246 17.9411C9.67811 17.8835 9.79384 17.7873 9.87527 17.6645C9.95669 17.5417 10.0002 17.3976 10.0004 17.2502V13.0007H11.4184C16.0543 13.0007 20.3281 15.5204 22.571 19.572L22.592 19.61C22.672 19.7561 22.7983 19.8715 22.9511 19.9379C23.1039 20.0042 23.2744 20.0179 23.4358 19.9766C23.5972 19.9354 23.7403 19.8415 23.8424 19.71C23.9446 19.5784 24 19.4166 24 19.25C24 11.4769 17.7432 5.13763 10.0004 5.00365Z"
      fill={ICON_COLOR}
    />
  </Svg>
);

// ========================================
// Icone de Excluir (Lixeira)
// ========================================
const DeleteIcon: React.FC = () => (
  <Svg width={36} height={28} viewBox="0 0 36 28" fill="none">
    <Rect
      x={0.4}
      y={0.4}
      width={35.2}
      height={27.2}
      rx={5.6}
      stroke={BORDER_COLOR}
      strokeWidth={0.8}
    />
    <Path
      d="M16.4 12.3636C16.8103 12.3636 17.1484 12.6795 17.1946 13.0864L17.2 13.1818V18.0909C17.2 18.5428 16.8418 18.9091 16.4 18.9091C15.9897 18.9091 15.6516 18.5932 15.6054 18.1863L15.6 18.0909V13.1818C15.6 12.7299 15.9582 12.3636 16.4 12.3636Z"
      fill={ICON_COLOR}
    />
    <Path
      d="M20.3946 13.0864C20.3484 12.6795 20.0103 12.3636 19.6 12.3636C19.1582 12.3636 18.8 12.7299 18.8 13.1818V18.0909L18.8054 18.1863C18.8516 18.5932 19.1897 18.9091 19.6 18.9091C20.0418 18.9091 20.4 18.5428 20.4 18.0909V13.1818L20.3946 13.0864Z"
      fill={ICON_COLOR}
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M19.6 5C20.8781 5 21.9229 6.02184 21.9959 7.31032L22 7.45455V8.27273H25.2C25.6418 8.27273 26 8.63904 26 9.09091C26 9.5105 25.6912 9.85632 25.2933 9.90359L25.2 9.90909H24.4V20.5455C24.4 21.8526 23.4009 22.9212 22.141 22.9958L22 23H14C12.7219 23 11.6771 21.9782 11.6041 20.6897L11.6 20.5455V9.90909H10.8C10.3582 9.90909 10 9.54278 10 9.09091C10 8.67132 10.3088 8.32549 10.7067 8.27823L10.8 8.27273H14V7.45455C14 6.14735 14.9991 5.07882 16.259 5.00417L16.4 5H19.6ZM13.2 9.90909V20.5455C13.2 20.965 13.5088 21.3109 13.9067 21.3581L14 21.3636H22C22.4103 21.3636 22.7484 21.0478 22.7946 20.6409L22.8 20.5455V9.90909H13.2ZM20.4 8.27273H15.6V7.45455L15.6054 7.35913C15.6516 6.95221 15.9897 6.63636 16.4 6.63636H19.6L19.6933 6.64187C20.0912 6.68913 20.4 7.03495 20.4 7.45455V8.27273Z"
      fill={ICON_COLOR}
    />
  </Svg>
);

// ========================================
// Icone de Confirmacao (Check)
// ========================================
const CheckIcon: React.FC = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={10} fill="#22C55E" />
    <Path
      d="M8 12L11 15L16 9"
      stroke="white"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ========================================
// Icone de Emoji (carinha feliz)
// ========================================
const EmojiIcon: React.FC = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Circle
      cx={12}
      cy={12}
      r={10}
      stroke="#7D8592"
      strokeWidth={1.5}
    />
    <Circle cx={8} cy={10} r={1.5} fill="#7D8592" />
    <Circle cx={16} cy={10} r={1.5} fill="#7D8592" />
    <Path
      d="M8 14C8.5 15.5 10 17 12 17C14 17 15.5 15.5 16 14"
      stroke="#7D8592"
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);

// ========================================
// Icone de Reagir (carinha com estrela)
// ========================================
const ReactIcon: React.FC = () => (
  <Svg width={44} height={30} viewBox="0 0 44 30" fill="none">
    <Rect
      x={0.4}
      y={0.4}
      width={43.2}
      height={29.2}
      rx={5.6}
      stroke={BORDER_COLOR}
      strokeWidth={0.8}
    />
    <Path
      d="M19.8661 25C24.1365 25 27.8557 22.2616 29.2041 18.2407L29.9728 19.6649C30.0401 19.7908 30.1721 19.8695 30.3145 19.8695C30.4568 19.8695 30.5862 19.7908 30.6561 19.6649L31.7664 17.6059L33.7981 16.4807C33.9224 16.4125 34 16.2787 34 16.1344C34 15.9902 33.9224 15.859 33.7981 15.7882L31.7664 14.663L30.6561 12.6039C30.5888 12.478 30.4568 12.3993 30.3145 12.3993C30.1721 12.3993 30.0427 12.478 29.9728 12.6039L29.5924 13.3069C28.8004 8.55934 24.7473 5 19.8661 5C14.4258 5 10 9.48787 10 15.0013C10 20.5148 14.4258 25 19.8661 25ZM30.3119 13.6111L31.1375 15.1403C31.1737 15.2059 31.2255 15.261 31.2928 15.2977L32.8017 16.1344L31.2928 16.9711C31.2281 17.0079 31.1737 17.0603 31.1375 17.1285L30.3119 18.6577L29.4862 17.1285C29.45 17.063 29.3983 17.0079 29.331 16.9711L27.8221 16.1344L29.331 15.2977C29.3957 15.261 29.45 15.2085 29.4862 15.1403L30.3119 13.6111ZM19.8661 5.78689C24.7214 5.78689 28.6891 9.60852 28.9453 14.5082L28.8625 14.663L26.8308 15.7882C26.7066 15.8564 26.6289 15.9902 26.6289 16.1344C26.6289 16.2787 26.7066 16.4098 26.8308 16.4807L28.6244 17.4748C27.5374 21.459 23.9786 24.2157 19.8661 24.2157C14.8554 24.2157 10.7764 20.0846 10.7764 15.0039C10.7764 9.92066 14.8528 5.78689 19.8661 5.78689Z"
      fill={ICON_COLOR}
    />
    <Path
      d="M21.6907 12.4675C21.7839 12.3993 23.989 10.8125 26.5772 12.4833C26.6419 12.5252 26.7143 12.5436 26.7842 12.5436C26.9136 12.5436 27.0379 12.478 27.1129 12.3626C27.2268 12.179 27.175 11.9351 26.9939 11.8197C23.9476 9.85508 21.2585 11.8144 21.2326 11.8354C21.0592 11.9639 21.023 12.2105 21.1498 12.3836C21.2766 12.5593 21.5199 12.5961 21.6907 12.4675ZM18.0595 12.4833C18.1242 12.5252 18.1967 12.5436 18.2666 12.5436C18.396 12.5436 18.5202 12.478 18.5953 12.3626C18.7092 12.179 18.6574 11.9351 18.4762 11.8197C15.43 9.85508 12.7409 11.8144 12.715 11.8354C12.5416 11.9639 12.5053 12.2105 12.6322 12.3862C12.759 12.562 13.0023 12.5987 13.1757 12.4702C13.1964 12.4518 15.4558 10.8046 18.0595 12.4833ZM15.9295 15.7384C15.6448 15.7384 15.3704 15.859 15.1763 16.0715C14.9977 16.2656 14.8994 16.5174 14.8994 16.7823V17.3384C14.8994 17.8525 14.9796 18.3561 15.1271 18.8413C15.1323 18.8702 15.1427 18.899 15.1556 18.9279C15.1867 19.0197 15.2126 19.1115 15.2488 19.2033C16.0071 21.1285 17.8162 22.3718 19.8635 22.3718C20.6787 22.3718 21.4448 22.1672 22.1229 21.8157C22.154 21.8052 22.1851 21.7895 22.2135 21.7711C23.3161 21.1679 24.1676 20.1528 24.5713 18.9305C24.5817 18.9095 24.5895 18.8859 24.5946 18.8623C24.7447 18.3823 24.8276 17.8708 24.8276 17.3384V16.7823C24.8276 16.2079 24.3669 15.7384 23.7975 15.7384H15.9295ZM15.6784 16.7823C15.6784 16.7167 15.7017 16.6564 15.7457 16.6066C15.7949 16.5541 15.8596 16.5252 15.9295 16.5252H17.4979V18.3666H15.8052C15.7224 18.0308 15.6758 17.6898 15.6758 17.3384V16.7823H15.6784ZM18.2743 16.5252H21.6105V18.3666H18.2743V16.5252ZM16.0796 19.1534H17.4979V20.8452C16.8949 20.4282 16.4031 19.8485 16.0796 19.1534ZM18.2743 21.2675V19.1534H21.6105V21.1915C21.0773 21.4407 20.4898 21.5823 19.8661 21.5823C19.307 21.5823 18.7687 21.4721 18.2743 21.2675ZM22.3869 20.7193V19.1534H23.6474C23.3549 19.7725 22.9227 20.3102 22.3869 20.7193ZM24.0537 16.7823V17.3384C24.0537 17.6925 24.0045 18.0361 23.9243 18.3666H22.3869V16.5252H23.8027C23.9424 16.5252 24.0537 16.6407 24.0537 16.7823Z"
      fill={ICON_COLOR}
    />
  </Svg>
);

// ========================================
// Icone de Mais (+) para modal de emojis
// ========================================
const PlusIcon: React.FC = () => (
  <Svg width={28} height={28} viewBox="0 0 28 28" fill="none">
    <Circle
      cx={14}
      cy={14}
      r={12}
      stroke="#9CA3AF"
      strokeWidth={1.5}
    />
    <Path
      d="M14 9V19M9 14H19"
      stroke="#9CA3AF"
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

// ========================================
// Icone de Emoji Picker (carinha com +)
// ========================================
const EmojiPickerIcon: React.FC = () => (
  <Svg width={28} height={28} viewBox="0 0 28 28" fill="none">
    <Circle
      cx={14}
      cy={14}
      r={12}
      stroke="#9CA3AF"
      strokeWidth={1.5}
    />
    <Circle cx={10} cy={12} r={1.5} fill="#9CA3AF" />
    <Circle cx={18} cy={12} r={1.5} fill="#9CA3AF" />
    <Path
      d="M9 17C9.5 18.5 11 20 14 20C17 20 18.5 18.5 19 17"
      stroke="#9CA3AF"
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);

// ========================================
// Icone de Microfone
// ========================================
const MicIcon: React.FC = () => (
  <Svg width={40} height={40} viewBox="0 0 40 40" fill="none">
    <Rect width={40} height={40} rx={6} fill="#1777CF" />
    <Path
      d="M18.3672 21.5474H20.7345C22.2121 21.5474 23.4143 20.3453 23.4143 18.8676V12.9298C23.4143 11.4522 22.2121 10.25 20.7345 10.25H18.3672C16.8895 10.25 15.6873 11.4522 15.6873 12.9298V18.8677C15.6874 20.3452 16.8895 21.5474 18.3672 21.5474ZM16.3124 12.9298C16.3124 11.7968 17.2341 10.875 18.3672 10.875H20.7345C21.8675 10.875 22.7893 11.7968 22.7893 12.9298V18.8677C22.7893 20.0007 21.8675 20.9225 20.7345 20.9225H18.3672C17.2342 20.9225 16.3124 20.0007 16.3124 18.8677V12.9298ZM25.3516 19.0237V19.311C25.3516 21.561 23.5211 23.3915 21.271 23.3915H19.8633V27.8281H25.0391C25.1219 27.8281 25.2014 27.861 25.26 27.9197C25.3186 27.9783 25.3516 28.0577 25.3516 28.1406C25.3516 28.2235 25.3186 28.303 25.26 28.3616C25.2014 28.4202 25.1219 28.4531 25.0391 28.4531H14.0625C13.9796 28.4531 13.9001 28.4202 13.8415 28.3616C13.7829 28.303 13.75 28.2235 13.75 28.1406C13.75 28.0577 13.7829 27.9783 13.8415 27.9197C13.9001 27.861 13.9796 27.8281 14.0625 27.8281H19.2383V23.3916H17.8306C15.5805 23.3916 13.75 21.5611 13.75 19.311V19.0238C13.75 18.9409 13.7829 18.8614 13.8415 18.8028C13.9001 18.7442 13.9796 18.7113 14.0625 18.7113C14.1454 18.7113 14.2249 18.7442 14.2835 18.8028C14.3421 18.8614 14.375 18.9409 14.375 19.0238V19.311C14.375 21.2164 15.9252 22.7666 17.8306 22.7666H21.271C23.1764 22.7666 24.7266 21.2164 24.7266 19.311V19.0238C24.7266 18.9409 24.7595 18.8614 24.8181 18.8028C24.8767 18.7442 24.9562 18.7112 25.039 18.7112C25.1219 18.7112 25.2014 18.7441 25.26 18.8028C25.3186 18.8614 25.3516 18.9408 25.3516 19.0237Z"
      fill="white"
      stroke="white"
      strokeWidth={0.5}
    />
  </Svg>
);

// ========================================
// Icone de Enviar
// ========================================
const SendIcon: React.FC = () => (
  <Svg width={40} height={40} viewBox="0 0 40 40" fill="none">
    <Rect width={40} height={40} rx={6} fill="#1777CF" />
    <Path
      d="M27.4876 18.9668L13.9647 12.3624C13.7993 12.2791 13.6153 12.241 13.4309 12.2518C13.2464 12.2626 13.068 12.322 12.9133 12.424C12.7047 12.5572 12.534 12.7429 12.4178 12.9628C12.3016 13.1828 12.244 13.4295 12.2505 13.6787V26.849C12.2454 27.0914 12.3006 27.3312 12.4111 27.5464C12.5215 27.7616 12.6838 27.9453 12.8828 28.0806C13.0557 28.1922 13.2567 28.251 13.4619 28.25C13.6251 28.2483 13.7861 28.2116 13.9342 28.1422L27.4876 21.5378C27.7226 21.4191 27.9191 21.2351 28.0541 21.0073C28.1891 20.7796 28.2569 20.5177 28.2495 20.2523C28.2569 19.987 28.1891 19.725 28.0541 19.4973C27.9191 19.2696 27.7226 19.0855 27.4876 18.9668ZM27.1306 20.845C27.1359 20.845 27.1376 20.8523 27.1328 20.8546L13.6371 27.4418C13.589 27.4717 13.5336 27.4876 13.4771 27.4876C13.4206 27.4876 13.3652 27.4717 13.3171 27.4418C13.2194 27.3785 13.1399 27.2905 13.0864 27.1865C13.0329 27.0825 13.0074 26.9661 13.0124 26.849V13.6787C13.008 13.5682 13.0308 13.4584 13.0786 13.359C13.1265 13.2597 13.1979 13.1738 13.2866 13.1091C13.3186 13.0866 13.3544 13.0708 13.392 13.0623C13.4376 13.0521 13.4849 13.0479 13.5317 13.0476C13.5818 13.0472 13.6294 13.0663 13.6744 13.0883L26.8021 19.507C27.0099 19.6086 27.2353 19.712 27.3429 19.9169C27.3971 20.0202 27.4255 20.1354 27.4255 20.2523C27.4255 20.3693 27.3971 20.4845 27.3429 20.5878C27.2912 20.6863 27.2174 20.7711 27.1276 20.8357C27.1236 20.8386 27.1256 20.845 27.1306 20.845Z"
      fill="#FCFCFC"
      stroke="#FCFCFC"
      strokeWidth={0.5}
    />
  </Svg>
);

// ========================================
// Icone de Camera Oficial WhatsApp (para reply preview)
// ========================================
const CameraReplyIcon: React.FC = () => (
  <Svg width={16} height={16} viewBox="0 0 48 48" fill="none">
    <Path
      d="M42 12h-6.93a2 2 0 0 1-1.664-.891l-2.219-3.328A4 4 0 0 0 27.859 6h-7.718a4 4 0 0 0-3.328 1.781l-2.219 3.328A2 2 0 0 1 12.93 12H12v-1a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v1H6a4 4 0 0 0-4 4v21a4 4 0 0 0 4 4h36a4 4 0 0 0 4-4V16a4 4 0 0 0-4-4zM24 37a11.5 11.5 0 1 1 11.5-11.5A11.5 11.5 0 0 1 24 37z"
      fill="#7D8592"
    />
    <Path
      d="M24 18a7.5 7.5 0 1 0 7.5 7.5A7.5 7.5 0 0 0 24 18zm0 12a4.505 4.505 0 0 1-4.5-4.5 1 1 0 0 1 2 0A2.5 2.5 0 0 0 24 28a1 1 0 0 1 0 2z"
      fill="#7D8592"
    />
  </Svg>
);

// ========================================
// Icone de Enviar para Reply Modal
// ========================================
const SendBtnIcon: React.FC = () => (
  <Svg width={40} height={40} viewBox="0 0 40 40" fill="none">
    <Rect width={40} height={40} rx={6} fill="#1777CF" />
    <Path
      d="M27.4876 18.9668L13.9647 12.3624C13.7993 12.2791 13.6153 12.241 13.4309 12.2518C13.2464 12.2626 13.068 12.322 12.9133 12.424C12.7047 12.5572 12.534 12.7429 12.4178 12.9628C12.3016 13.1828 12.244 13.4295 12.2505 13.6787V26.849C12.2454 27.0914 12.3006 27.3312 12.4111 27.5464C12.5215 27.7616 12.6838 27.9453 12.8828 28.0806C13.0557 28.1922 13.2567 28.251 13.4619 28.25C13.6251 28.2483 13.7861 28.2116 13.9342 28.1422L27.4876 21.5378C27.7226 21.4191 27.9191 21.2351 28.0541 21.0073C28.1891 20.7796 28.2569 20.5177 28.2495 20.2523C28.2569 19.987 28.1891 19.725 28.0541 19.4973C27.9191 19.2696 27.7226 19.0855 27.4876 18.9668ZM27.1306 20.845C27.1359 20.845 27.1376 20.8523 27.1328 20.8546L13.6371 27.4418C13.589 27.4717 13.5336 27.4876 13.4771 27.4876C13.4206 27.4876 13.3652 27.4717 13.3171 27.4418C13.2194 27.3785 13.1399 27.2905 13.0864 27.1865C13.0329 27.0825 13.0074 26.9661 13.0124 26.849V13.6787C13.008 13.5682 13.0308 13.4584 13.0786 13.359C13.1265 13.2597 13.1979 13.1738 13.2866 13.1091C13.3186 13.0866 13.3544 13.0708 13.392 13.0623C13.4376 13.0521 13.4849 13.0479 13.5317 13.0476C13.5818 13.0472 13.6294 13.0663 13.6744 13.0883L26.8021 19.507C27.0099 19.6086 27.2353 19.712 27.3429 19.9169C27.3971 20.0202 27.4255 20.1354 27.4255 20.2523C27.4255 20.3693 27.3971 20.4845 27.3429 20.5878C27.2912 20.6863 27.2174 20.7711 27.1276 20.8357C27.1236 20.8386 27.1256 20.845 27.1306 20.845Z"
      fill="#FCFCFC"
      stroke="#FCFCFC"
      strokeWidth={0.5}
    />
  </Svg>
);

// ========================================
// Icone de Limpar Texto (X) para input
// ========================================
const ClearTextIcon: React.FC = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6L18 18"
      stroke="#91929E"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ========================================
// Lista de Emojis Populares (8 por linha, 6 linhas = 48 emojis)
// ========================================
const QUICK_EMOJIS = [
  // Linha 1 - Carinhas felizes
  '😀', '😊', '😄', '😁', '🥰', '😍', '🤩', '😘',
  // Linha 2 - Carinhas expressivas
  '😂', '🤣', '😅', '😉', '😋', '😎', '🤗', '🤭',
  // Linha 3 - Carinhas neutras/tristes
  '🙂', '😐', '🤔', '😏', '😢', '😭', '😤', '😡',
  // Linha 4 - Gestos
  '👍', '👎', '👏', '🙌', '🤝', '👋', '✌️', '🤞',
  // Linha 5 - Coracoes e amor
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '💕',
  // Linha 6 - Objetos e simbolos
  '🔥', '💯', '✨', '🎉', '⭐', '💪', '🙏', '🎁',
];

// ========================================
// Lista de Emojis de Reacao Rapida (1 linha, 6 emojis + mais)
// ========================================
const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

// ========================================
// Componente Principal ImageViewer
// ========================================
const ImageViewer: React.FC<ImageViewerProps> = ({
  visible,                                //......Visibilidade
  imageUrl,                               //......URL da imagem
  caption,                                //......Legenda
  senderName,                             //......Nome remetente
  timestamp,                              //......Data/hora
  instanceName,                           //......Nome da instancia
  remoteJid,                              //......Telefone destinatario
  messageKey,                             //......Chave para download de midia
  currentReaction,                        //......Reacao atual
  leadName,                               //......Nome do lead
  leadPhone,                              //......Telefone do lead
  leadPushName,                           //......PushName do lead
  isOutgoing,                             //......Se a imagem foi enviada por mim
  onClose,                                //......Handler fechar
  onDownload,                             //......Handler download
  onShare,                                //......Handler compartilhar
  onReply,                                //......Handler responder
  onDelete,                               //......Handler excluir
  onSendReply,                            //......Handler enviar resposta
  onReaction,                             //......Handler reacao
}) => {
  // ========================================
  // Estados
  // ========================================
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(null);
  const [triedEvolutionApi, setTriedEvolutionApi] = useState(false);
  const [showBars, setShowBars] = useState(true);
  const [replyMode, setReplyMode] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [inputHeight, setInputHeight] = useState(MIN_INPUT_HEIGHT);

  // Estados para Reacoes
  const [showQuickReactions, setShowQuickReactions] = useState(false);
  const [showReactionModal, setShowReactionModal] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);

  // ========================================
  // Refs para Animacao
  // ========================================
  const slideAnim = useRef(new Animated.Value(INPUT_HEIGHT + 50)).current;
  const deleteModalAnim = useRef(new Animated.Value(300)).current;
  const reactionModalAnim = useRef(new Animated.Value(300)).current;
  const replyModalAnim = useRef(new Animated.Value(300)).current;
  const replyInputRef = useRef<TextInput>(null);

  // ========================================
  // Sincronizar reacao com prop
  // ========================================
  useEffect(() => {
    setSelectedReaction(currentReaction || null);
  }, [currentReaction]);

  // ========================================
  // Reset estados ao abrir/fechar
  // ========================================
  useEffect(() => {
    if (visible) {
      setIsLoading(true);                 //......Reset loading
      setHasError(false);                 //......Reset erro
      setLocalImageUrl(null);             //......Reset URL local
      setTriedEvolutionApi(false);        //......Reset flag Evolution API
      setShowBars(true);                  //......Mostra barras inicialmente
      setReplyMode(false);                //......Reset modo resposta
      setShowConfirmation(false);         //......Reset confirmacao
      setReplyText('');                   //......Limpa texto ao fechar
      setShowEmojiPicker(false);          //......Fecha emoji picker
      setShowDeleteConfirm(false);        //......Fecha modal de exclusao
      setShowQuickReactions(false);       //......Fecha reacoes rapidas
      setShowReactionModal(false);        //......Fecha modal de reacoes
      setShowReplyInput(false);           //......Fecha modal de reply
      setInputHeight(MIN_INPUT_HEIGHT);   //......Reset altura input
      slideAnim.setValue(INPUT_HEIGHT + 50);
      deleteModalAnim.setValue(300);      //......Reset animacao modal
      reactionModalAnim.setValue(300);    //......Reset animacao reacoes
      replyModalAnim.setValue(300);       //......Reset animacao reply
      setSelectedReaction(currentReaction || null);
    }
  }, [visible, currentReaction]);

  // ========================================
  // Animacao do Input
  // ========================================
  useEffect(() => {
    if (replyMode) {
      // Slide up - mostra input
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 10,
      }).start();
    } else {
      // Slide down - esconde input
      Animated.timing(slideAnim, {
        toValue: INPUT_HEIGHT + 50,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [replyMode]);

  // ========================================
  // Handler de Load
  // ========================================
  const handleLoad = useCallback(() => {
    setIsLoading(false);                  //......Remove loading
  }, []);

  // ========================================
  // Handler de Erro
  // Tenta baixar via Evolution API quando URL expira
  // ========================================
  const handleError = useCallback(async () => {
    // Se ja tentou Evolution API ou nao tem dados necessarios
    if (triedEvolutionApi || !instanceName || !messageKey) {
      setIsLoading(false);                //......Remove loading
      setHasError(true);                  //......Marca erro definitivo
      return;
    }

    // Tenta baixar via Evolution API (backend)
    setTriedEvolutionApi(true);           //......Marca que tentou
    console.log('[ImageViewer] URL expirada, tentando Evolution API...');

    try {
      const result = await evolutionService.getBase64FromMediaMessage(
        instanceName,
        messageKey
      );

      if (result && result.base64) {
        // Monta data URI
        const dataUri = `data:${result.mimeType};base64,${result.base64}`;
        console.log('[ImageViewer] Midia baixada via Evolution API!');

        // Salva no cache local para uso futuro
        if (imageUrl) {
          await mediaStorageService.saveMedia(imageUrl, dataUri, result.mimeType);
        }

        // Usa a imagem baixada
        setLocalImageUrl(dataUri);        //......Define URL local
        setIsLoading(true);               //......Mostra loading novamente
        return;
      }
    } catch (error) {
      console.error('[ImageViewer] Erro ao baixar via Evolution API:', error);
    }

    // Fallback: erro definitivo
    setIsLoading(false);                  //......Remove loading
    setHasError(true);                    //......Marca erro
  }, [triedEvolutionApi, instanceName, messageKey, imageUrl]);

  // ========================================
  // Handler de Clique na Imagem
  // ========================================
  const handleImagePress = useCallback(() => {
    // Fecha emoji picker se estiver aberto
    if (showEmojiPicker) {
      setShowEmojiPicker(false);          //......Fecha emoji picker
      return;
    }

    // Fecha reacoes rapidas se estiver aberto
    if (showQuickReactions) {
      setShowQuickReactions(false);       //......Fecha reacoes rapidas
      return;
    }

    if (replyMode) {
      // Se estiver em modo resposta, fecha o input
      setReplyMode(false);                //......Esconde input
      Keyboard.dismiss();                 //......Fecha teclado
    } else {
      // Toggle das barras
      setShowBars((prev) => !prev);       //......Alterna visibilidade
    }
  }, [replyMode, showEmojiPicker, showQuickReactions]);

  // ========================================
  // Handler de Voltar - Sempre fecha o viewer
  // ========================================
  const handleBack = useCallback(() => {
    onClose();                            //......Fecha modal
  }, [onClose]);

  // ========================================
  // Handler de Entrar no Modo Resposta
  // ========================================
  const handleEnterReplyMode = useCallback(() => {
    setReplyMode(true);                   //......Ativa modo resposta
    setShowBars(true);                    //......Garante barras visiveis
  }, []);

  // ========================================
  // Handler de Enviar Mensagem
  // ========================================
  const handleSendMessage = useCallback(async () => {
    if (!replyText.trim() || isSending) return;

    setIsSending(true);                   //......Marca enviando
    Keyboard.dismiss();                   //......Fecha teclado

    try {
      if (onSendReply) {
        await onSendReply(replyText.trim());
      }

      setReplyText('');                   //......Limpa texto apos enviar
      setReplyMode(false);                //......Sai do modo resposta
      setShowConfirmation(true);          //......Mostra confirmacao

      // Esconde confirmacao apos 2.5 segundos
      setTimeout(() => {
        setShowConfirmation(false);       //......Esconde confirmacao
      }, 2500);

    } catch (error) {
      console.error('[ImageViewer] Erro ao enviar resposta:', error);
    } finally {
      setIsSending(false);                //......Finaliza envio
    }
  }, [replyText, isSending, onSendReply]);

  // ========================================
  // Handler de Toggle Emoji Picker
  // ========================================
  const handleToggleEmojiPicker = useCallback(() => {
    setShowEmojiPicker((prev) => !prev);  //......Toggle picker
    Keyboard.dismiss();                   //......Fecha teclado
  }, []);

  // ========================================
  // Handler de Selecionar Emoji
  // ========================================
  const handleSelectEmoji = useCallback((emoji: string) => {
    setReplyText((prev) => prev + emoji); //......Adiciona emoji
  }, []);

  // ========================================
  // Handler de Abrir Modal de Exclusao
  // ========================================
  const handleOpenDeleteConfirm = useCallback(() => {
    setShowDeleteConfirm(true);           //......Mostra modal
    // Anima entrada do modal
    Animated.spring(deleteModalAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  }, []);

  // ========================================
  // Handler de Fechar Modal de Exclusao
  // ========================================
  const handleCloseDeleteConfirm = useCallback(() => {
    // Anima saida do modal
    Animated.timing(deleteModalAnim, {
      toValue: 300,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowDeleteConfirm(false);        //......Esconde modal
    });
  }, []);

  // ========================================
  // Handler de Confirmar Exclusao
  // ========================================
  const handleConfirmDelete = useCallback(() => {
    handleCloseDeleteConfirm();           //......Fecha modal
    if (onDelete) {
      onDelete();                         //......Executa exclusao
    }
  }, [onDelete, handleCloseDeleteConfirm]);

  // ========================================
  // Handler de Abrir Reacoes Rapidas
  // ========================================
  const handleOpenQuickReactions = useCallback(() => {
    setShowQuickReactions(true);          //......Mostra reacoes rapidas
  }, []);

  // ========================================
  // Handler de Fechar Reacoes Rapidas
  // ========================================
  const handleCloseQuickReactions = useCallback(() => {
    setShowQuickReactions(false);         //......Fecha reacoes rapidas
  }, []);

  // ========================================
  // Handler de Abrir Modal de Reacoes (Unificado)
  // ========================================
  const handleOpenReactionModal = useCallback(() => {
    setShowQuickReactions(false);         //......Fecha rapidas
    setShowReactionModal(true);           //......Abre modal unificado
    // Anima entrada do modal
    Animated.spring(reactionModalAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  }, []);

  // ========================================
  // Handler de Fechar Modal de Reacoes
  // ========================================
  const handleCloseReactionModal = useCallback(() => {
    // Anima saida do modal
    Animated.timing(reactionModalAnim, {
      toValue: 300,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowReactionModal(false);        //......Fecha modal
    });
  }, []);

  // ========================================
  // Handler de Selecionar Reacao (das rapidas)
  // ========================================
  const handleSelectReaction = useCallback((emoji: string) => {
    console.group('[🔴 REACTION_DEBUG] 1. Seleção de Reação'); //......Grupo de logs
    console.log('[🔴 REACTION_DEBUG] 1.1 Emoji selecionado:', emoji); //......Emoji escolhido
    console.log('[🔴 REACTION_DEBUG] 1.2 Reação atual:', currentReaction); //......Reacao antes
    console.log('[🔴 REACTION_DEBUG] 1.3 Callback onReaction existe:', !!onReaction); //......Valida callback
    console.groupEnd(); //......Fecha grupo
    setSelectedReaction(emoji);           //......Define reacao
    setShowQuickReactions(false);         //......Fecha rapidas
    if (onReaction) {
      onReaction(emoji);                  //......Callback
    }
  }, [onReaction, currentReaction]);


  // ========================================
  // Handler de Toggle Reacao (do modal info - toggle se mesmo, muda se diferente)
  // NAO fecha o modal - usuario pode continuar escolhendo
  // ========================================
  const handleToggleReaction = useCallback((emoji: string) => {
    console.group('[🔴 REACTION_DEBUG] 1. Toggle de Reação'); //......Grupo de logs
    console.log('[🔴 REACTION_DEBUG] 1.1 Emoji clicado:', emoji); //......Emoji escolhido
    console.log('[🔴 REACTION_DEBUG] 1.2 Reação atual:', selectedReaction); //......Reacao antes
    console.log('[🔴 REACTION_DEBUG] 1.3 Ação:', emoji === selectedReaction ? 'REMOVER' : 'ADICIONAR'); //......Tipo de acao
    console.groupEnd(); //......Fecha grupo
    if (emoji === selectedReaction) {
      // Se clicar no mesmo emoji, remove a reacao (mas nao fecha)
      setSelectedReaction(null);          //......Remove reacao
      if (onReaction) {
        onReaction(null, selectedReaction); //......Callback com emoji anterior
      }
    } else {
      // Se clicar em outro emoji, muda a reacao (mas nao fecha)
      setSelectedReaction(emoji);         //......Define nova reacao
      if (onReaction) {
        onReaction(emoji);                //......Callback
      }
    }
  }, [selectedReaction, onReaction]);

  // ========================================
  // Formatar telefone no padrao brasileiro
  // ========================================
  const formatPhoneDisplay = useCallback((phone: string): string => {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');          //......Remove nao numericos
    if (digits.length === 13 && digits.startsWith('55')) {
      const ddd = digits.substring(2, 4);             //......DDD
      const part1 = digits.substring(4, 9);           //......Primeira parte
      const part2 = digits.substring(9);              //......Segunda parte
      return `+55 ${ddd} ${part1}-${part2}`;          //......Formato final
    }
    if (digits.length === 12 && digits.startsWith('55')) {
      const ddd = digits.substring(2, 4);             //......DDD
      const part1 = digits.substring(4, 8);           //......Primeira parte
      const part2 = digits.substring(8);              //......Segunda parte
      return `+55 ${ddd} ${part1}-${part2}`;          //......Formato final
    }
    return phone;                                     //......Retorna original
  }, []);

  // ========================================
  // Renderiza nome do remetente da imagem
  // Se isOutgoing (eu enviei), mostra "Voce"
  // Se incoming (lead enviou), mostra nome/telefone do lead
  // ========================================
  const renderLeadName = useCallback(() => {
    // Se a imagem foi enviada por mim, mostra "Voce"
    if (isOutgoing) {
      return <Text style={styles.replyPreviewName}>Você</Text>;
    }
    // Se lead tem nome salvo, mostra o nome
    const isNameSaved = leadName && !/^[\d\s\+\-\(\)]+$/.test(leadName.trim());
    if (isNameSaved) {
      return <Text style={styles.replyPreviewName}>{leadName}</Text>;
    }
    // Se tem telefone e pushName, mostra no formato: telefone ~pushName
    const hasPushName = leadPushName && leadPushName !== 'Contato';
    if (leadPhone && hasPushName) {
      const formattedPhone = formatPhoneDisplay(leadPhone);
      return (
        <Text style={styles.replyPreviewName}>
          {formattedPhone}
          <Text style={styles.replyPreviewPushName}> ~{leadPushName}</Text>
        </Text>
      );
    }
    // Se so tem telefone, mostra formatado
    if (leadPhone) {
      return <Text style={styles.replyPreviewName}>{formatPhoneDisplay(leadPhone)}</Text>;
    }
    // Fallback
    return <Text style={styles.replyPreviewName}>Contato</Text>;
  }, [isOutgoing, leadName, leadPhone, leadPushName, formatPhoneDisplay]);

  // ========================================
  // Handler de Abrir Modal de Resposta
  // ========================================
  const handleOpenReplyInput = useCallback(() => {
    setShowReplyInput(true);                          //......Mostra modal
    Animated.spring(replyModalAnim, {
      toValue: 0,                                     //......Posicao final
      useNativeDriver: true,                          //......Driver nativo
      tension: 100,                                   //......Tensao spring
      friction: 10,                                   //......Friccao spring
    }).start(() => {
      setTimeout(() => {
        replyInputRef.current?.focus();               //......Foca no input
      }, 100);
    });
  }, [replyModalAnim]);

  // ========================================
  // Handler de Fechar Modal de Resposta
  // ========================================
  const handleCloseReplyInput = useCallback(() => {
    Animated.timing(replyModalAnim, {
      toValue: 300,                                   //......Posicao final
      duration: 200,                                  //......Duracao
      useNativeDriver: true,                          //......Driver nativo
    }).start(() => {
      setShowReplyInput(false);                       //......Esconde modal
      setReplyText('');                               //......Limpa texto
      setInputHeight(MIN_INPUT_HEIGHT);               //......Reset altura
    });
  }, [replyModalAnim]);

  // ========================================
  // Handler de Mudanca de Tamanho do Input
  // ========================================
  const handleContentSizeChange = useCallback((event: any) => {
    const contentHeight = event.nativeEvent.contentSize.height;
    const PADDING_VERTICAL = 20;                      //......Padding vertical
    const textHeight = contentHeight - PADDING_VERTICAL;
    const numLines = Math.max(1, Math.round(textHeight / LINE_HEIGHT));
    if (numLines <= 1) {
      setInputHeight(MIN_INPUT_HEIGHT);               //......1 linha = 40px
    } else {
      const extraLines = Math.min(numLines - 1, MAX_LINES - 1);
      const newHeight = MIN_INPUT_HEIGHT + (extraLines * LINE_HEIGHT);
      setInputHeight(Math.min(newHeight, MAX_INPUT_HEIGHT));
    }
  }, []);

  // ========================================
  // Handler de Enviar Resposta do Modal
  // ========================================
  const handleSendReply = useCallback(() => {
    const trimmedText = replyText.trim();
    if (!trimmedText) return;                         //......Nao envia vazio
    Animated.timing(replyModalAnim, {
      toValue: 300,                                   //......Posicao final
      duration: 200,                                  //......Duracao
      useNativeDriver: true,                          //......Driver nativo
    }).start(() => {
      setShowReplyInput(false);                       //......Esconde modal
      setReplyText('');                               //......Limpa texto
      onReply?.(trimmedText);                         //......Callback com texto
    });
  }, [replyText, replyModalAnim, onReply]);

  // ========================================
  // Verifica se tem texto para enviar
  // ========================================
  const hasText = replyText.trim().length > 0;

  // ========================================
  // Render Principal
  // ========================================
  return (
    <Modal
      visible={visible}                   //......Visibilidade
      transparent                         //......Fundo transparente
      animationType="fade"                //......Animacao fade
      onRequestClose={onClose}            //......Handler fechar
      statusBarTranslucent                //......Status bar translucida
    >
      <StatusBar backgroundColor="black" barStyle="light-content" />

      <View style={styles.container}>
        {/* Header - Visivel apenas quando showBars = true */}
        {showBars && (
          <View style={styles.header}>
            {/* Botao Voltar - Sempre fecha o viewer */}
            <Pressable
              style={styles.backButton}   //......Estilo botao
              onPress={handleBack}        //......Handler voltar
              hitSlop={12}                //......Area de toque
            >
              <BackIcon />
            </Pressable>

            {/* Botao Fechar (X) - Sempre fecha o viewer */}
            <Pressable
              style={styles.closeButton}  //......Estilo botao
              onPress={onClose}           //......Handler fechar
              hitSlop={8}                 //......Area de toque
            >
              <CloseIcon />
            </Pressable>
          </View>
        )}

        {/* Area da Imagem - Clicavel para toggle/fechar input */}
        <Pressable
          style={styles.imageContainer}
          onPress={handleImagePress}      //......Toggle ou fecha input
        >
          {/* Loading */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={ChatColors.white} />
            </View>
          )}

          {/* Erro */}
          {hasError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                Erro ao carregar imagem
              </Text>
            </View>
          ) : (
            <Image
              source={{ uri: localImageUrl || imageUrl }}
              style={styles.image}        //......Estilo
              resizeMode="contain"        //......Modo resize
              onLoad={handleLoad}         //......Handler load
              onError={handleError}       //......Handler erro
            />
          )}
        </Pressable>

        {/* Footer - Visivel apenas quando showBars = true e nao em replyMode */}
        {showBars && !replyMode && (
          <View style={styles.footer}>
            {/* Botao Download */}
            <Pressable
              style={styles.footerButton}
              onPress={onDownload}         //......Handler download
              hitSlop={8}                  //......Area de toque
            >
              <DownloadIcon />
            </Pressable>

            {/* Botao Reagir */}
            <Pressable
              style={styles.footerButton}
              onPress={handleOpenQuickReactions}
              hitSlop={8}                  //......Area de toque
            >
              <ReactIcon />
            </Pressable>

            {/* Botao Compartilhar */}
            <Pressable
              style={styles.footerButton}
              onPress={onShare}            //......Handler compartilhar
              hitSlop={8}                  //......Area de toque
            >
              <ShareIcon />
            </Pressable>

            {/* Botao Responder */}
            <Pressable
              style={styles.replyButton}
              onPress={handleOpenReplyInput}
              hitSlop={8}                  //......Area de toque
            >
              <ReplyIcon />
              <Text style={styles.replyText}>Responder</Text>
            </Pressable>

            {/* Botao Excluir */}
            <Pressable
              style={styles.footerButton}
              onPress={handleOpenDeleteConfirm}
              hitSlop={8}                  //......Area de toque
            >
              <DeleteIcon />
            </Pressable>
          </View>
        )}

        {/* Modal de Reacoes Rapidas - 1 linha acima do footer */}
        {showQuickReactions && showBars && !replyMode && (
          <View style={styles.quickReactionsContainer}>
            <View style={styles.quickReactionsBar}>
              {/* Emojis de reacao rapida */}
              {REACTION_EMOJIS.map((emoji, index) => (
                <TouchableOpacity
                  key={`reaction-${index}`}
                  style={[
                    styles.quickReactionBtn,
                    selectedReaction === emoji && styles.quickReactionBtnSelected,
                  ]}
                  onPress={() => handleSelectReaction(emoji)}
                >
                  <Text style={styles.quickReactionText}>{emoji}</Text>
                </TouchableOpacity>
              ))}

              {/* Botao Mais (+) */}
              <TouchableOpacity
                style={styles.quickReactionBtn}
                onPress={handleOpenReactionModal}
              >
                <PlusIcon />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Indicador de Reacao na Imagem - Visivel apenas quando showBars = true */}
        {showBars && selectedReaction && !showQuickReactions && !showReactionModal && (
          <Pressable
            style={styles.reactionIndicator}
            onPress={handleOpenReactionModal}
          >
            <Text style={styles.reactionIndicatorText}>{selectedReaction}</Text>
          </Pressable>
        )}

        {/* Input Bar Animado - Sobe de baixo para cima */}
        <Animated.View
          style={[
            styles.inputBarContainer,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.inputRow}>
            {/* Container do Input */}
            <View style={styles.inputBox}>
              {/* Botao Emoji */}
              <TouchableOpacity
                style={styles.emojiButton}
                onPress={handleToggleEmojiPicker}
              >
                <EmojiIcon />
              </TouchableOpacity>

              {/* Campo de Texto */}
              <TextInput
                style={styles.textInput}
                placeholder="Digite sua mensagem..."
                placeholderTextColor="#91929E"
                value={replyText}
                onChangeText={setReplyText}
                maxLength={1000}
                returnKeyType="send"
                onSubmitEditing={handleSendMessage}
                multiline={false}
                editable={!isSending}
              />
            </View>

            {/* Botao Enviar ou Microfone */}
            {hasText ? (
              <TouchableOpacity
                style={styles.actBtn}
                onPress={handleSendMessage}
                disabled={isSending}
              >
                {isSending ? (
                  <ActivityIndicator size="small" color="#1777CF" />
                ) : (
                  <SendIcon />
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.actBtn}>
                <MicIcon />
              </TouchableOpacity>
            )}
          </View>

          {/* Grid de Emojis - Aparece ABAIXO do input */}
          {showEmojiPicker && (
            <View style={styles.emojiPickerContainer}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.emojiScrollView}
                contentContainerStyle={styles.emojiGridContent}
              >
                <View style={styles.emojiGrid}>
                  {QUICK_EMOJIS.map((emoji, index) => (
                    <TouchableOpacity
                      key={`emoji-${index}`}
                      style={styles.emojiBtn}
                      onPress={() => handleSelectEmoji(emoji)}
                    >
                      <Text style={styles.emojiText}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
        </Animated.View>

        {/* Toast de Confirmacao */}
        {showConfirmation && (
          <View style={styles.confirmationToast}>
            <CheckIcon />
            <Text style={styles.confirmationText}>Mensagem enviada</Text>
          </View>
        )}

        {/* Modal de Confirmacao de Exclusao */}
        {showDeleteConfirm && (
          <View style={styles.deleteModalOverlay}>
            {/* Overlay - fecha ao tocar */}
            <Pressable
              style={styles.deleteModalBackdrop}
              onPress={handleCloseDeleteConfirm}
            />

            {/* Container do Modal */}
            <Animated.View
              style={[
                styles.deleteModalContainer,
                { transform: [{ translateY: deleteModalAnim }] },
              ]}
            >
              {/* Header do Modal */}
              <View style={styles.deleteModalHeader}>
                <Text style={styles.deleteModalTitle}>
                  Deseja apagar a mensagem?
                </Text>
                <Pressable
                  style={styles.deleteModalCloseBtn}
                  onPress={handleCloseDeleteConfirm}
                  hitSlop={8}
                >
                  <CloseIconSimple />
                </Pressable>
              </View>

              {/* Botao Apagar */}
              <Pressable
                style={styles.deleteModalButton}
                onPress={handleConfirmDelete}
              >
                <Text style={styles.deleteModalButtonText}>
                  Apagar para mim
                </Text>
              </Pressable>
            </Animated.View>
          </View>
        )}

        {/* Modal de Input para Resposta - Estilo WhatsApp */}
        {showReplyInput && (
          <KeyboardAvoidingView
            style={styles.replyModalOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            {/* Backdrop - fecha ao tocar */}
            <Pressable style={styles.replyModalBackdrop} onPress={handleCloseReplyInput} />

            {/* Container do Input */}
            <Animated.View
              style={[
                styles.replyModalContainer,
                { transform: [{ translateY: replyModalAnim }] },
              ]}
            >
              {/* Reply Preview Bar - Igual WhatsApp */}
              <View style={styles.replyPreviewContainer}>
                {/* Barra azul vertical */}
                <View style={styles.replyPreviewBar} />

                {/* Conteudo do preview */}
                <View style={styles.replyPreviewContent}>
                  {/* Nome do lead: telefone em azul + ~pushName em preto */}
                  <View style={styles.replyPreviewNameRow}>
                    {renderLeadName()}
                  </View>
                  {/* Tipo de midia */}
                  <View style={styles.replyPreviewMediaType}>
                    <CameraReplyIcon />
                    <Text style={styles.replyPreviewMediaText}>Foto</Text>
                  </View>
                </View>

                {/* Thumbnail da imagem */}
                <View style={styles.replyPreviewThumbnail}>
                  {(localImageUrl || imageUrl) ? (
                    <Image
                      source={{ uri: localImageUrl || imageUrl }}
                      style={styles.replyPreviewImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.replyPreviewPlaceholder}>
                      <CameraReplyIcon />
                    </View>
                  )}
                </View>
              </View>

              {/* Area do Input */}
              <View style={styles.replyInputRow}>
                {/* Container do Input */}
                <View style={styles.replyInputBox}>
                  {/* Campo de Texto */}
                  <TextInput
                    ref={replyInputRef}
                    style={[styles.replyTextInput, { height: inputHeight, paddingRight: replyText.length > 0 ? 32 : 12 }]}
                    placeholder="Digite sua mensagem..."
                    placeholderTextColor="#91929E"
                    value={replyText}
                    onChangeText={setReplyText}
                    maxLength={1000}
                    multiline={true}
                    scrollEnabled={inputHeight >= MAX_INPUT_HEIGHT}
                    onContentSizeChange={handleContentSizeChange}
                    textAlignVertical="center"
                    autoFocus
                  />
                  {/* Botao Limpar Texto - Visivel apenas com texto */}
                  {replyText.length > 0 && (
                    <TouchableOpacity
                      style={styles.clearTextBtn}
                      onPress={() => {
                        setReplyText('');
                        setInputHeight(MIN_INPUT_HEIGHT);
                      }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <ClearTextIcon />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Botao Enviar */}
                <TouchableOpacity
                  style={styles.replyActBtn}
                  onPress={handleSendReply}
                  disabled={!replyText.trim()}
                >
                  <SendBtnIcon />
                </TouchableOpacity>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        )}

        {/* EmojiPicker para Reacoes - Modal Unificado */}
        {showReactionModal && (
          <View style={styles.emojiPickerOverlay}>
            {/* Overlay - fecha ao tocar */}
            <Pressable
              style={styles.emojiPickerBackdrop}
              onPress={handleCloseReactionModal}
            />
            {/* EmojiPicker na parte inferior */}
            <View style={styles.emojiPickerWrapper}>
              <EmojiPicker
                visible={showReactionModal}
                onClose={handleCloseReactionModal}
                onSelect={handleToggleReaction}
                selectedEmoji={selectedReaction}
              />
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

// ========================================
// Export Default
// ========================================
export default ImageViewer;

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1,                              //......Ocupa tudo
    backgroundColor: '#000000',           //......Fundo preto
  },

  // Header - 15px das bordas
  header: {
    position: 'absolute',                 //......Posicao absoluta
    top: 0,                               //......Topo
    left: 0,                              //......Esquerda
    right: 0,                             //......Direita
    zIndex: 100,                          //......Acima da imagem
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    justifyContent: 'space-between',      //......Distribui nas pontas
    paddingHorizontal: 15,                //......15px das bordas
    paddingVertical: 10,                  //......Padding vertical
    paddingTop: Platform.OS === 'ios' ? 50 : 10,
    backgroundColor: BAR_BACKGROUND,      //......Cor de fundo
  },

  // Botao de voltar (mesmo tamanho do X)
  backButton: {
    justifyContent: 'center',             //......Centraliza vertical
    alignItems: 'center',                 //......Centraliza horizontal
  },

  // Botao de fechar
  closeButton: {
    justifyContent: 'center',             //......Centraliza vertical
    alignItems: 'center',                 //......Centraliza horizontal
  },

  // Container da imagem
  imageContainer: {
    flex: 1,                              //......Ocupa espaco
    justifyContent: 'center',             //......Centraliza vertical
    alignItems: 'center',                 //......Centraliza horizontal
  },

  // Loading container
  loadingContainer: {
    position: 'absolute',                 //......Posicao absoluta
    justifyContent: 'center',             //......Centraliza vertical
    alignItems: 'center',                 //......Centraliza horizontal
  },

  // Erro container
  errorContainer: {
    justifyContent: 'center',             //......Centraliza vertical
    alignItems: 'center',                 //......Centraliza horizontal
    padding: 20,                          //......Padding
  },

  // Texto de erro
  errorText: {
    fontFamily: 'Inter_400Regular',       //......Fonte regular
    fontSize: 16,                         //......Tamanho fonte
    color: 'rgba(255,255,255,0.7)',       //......Cor clara
    textAlign: 'center',                  //......Alinhamento centro
  },

  // Imagem
  image: {
    width: SCREEN_WIDTH,                  //......Largura total
    height: SCREEN_HEIGHT,                //......Altura total
  },

  // Footer - distribuido com 15px das bordas
  footer: {
    position: 'absolute',                 //......Posicao absoluta
    bottom: 0,                            //......Fundo
    left: 0,                              //......Esquerda
    right: 0,                             //......Direita
    zIndex: 100,                          //......Acima da imagem
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    justifyContent: 'space-between',      //......Distribui igualmente
    paddingHorizontal: 15,                //......15px das bordas
    paddingVertical: 8,                   //......Padding vertical
    paddingBottom: Platform.OS === 'ios' ? 30 : 8,
    backgroundColor: BAR_BACKGROUND,      //......Cor de fundo
  },

  // Botao do footer
  footerButton: {
    justifyContent: 'center',             //......Centraliza vertical
    alignItems: 'center',                 //......Centraliza horizontal
  },

  // Botao de responder (com texto)
  replyButton: {
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    justifyContent: 'center',             //......Centraliza horizontal
    paddingHorizontal: 10,                //......Padding horizontal
    paddingVertical: 5,                   //......Padding vertical
    borderRadius: 8,                      //......Borda arredondada
    borderWidth: 0.5,                     //......Espessura borda
    borderColor: BORDER_COLOR,            //......Cor da borda
    gap: 10,                              //......Espaco entre icone e texto
  },

  // Texto do botao responder
  replyText: {
    fontFamily: 'Inter_400Regular',       //......Fonte regular
    fontSize: 14,                         //......Tamanho fonte
    color: '#374151',                     //......Cor do texto (gray-700)
  },

  // Container do Input Bar Animado
  inputBarContainer: {
    position: 'absolute',                 //......Posicao absoluta
    bottom: 0,                            //......Fixo no fundo
    left: 0,                              //......Esquerda
    right: 0,                             //......Direita
    zIndex: 200,                          //......Acima de tudo
    backgroundColor: '#FCFCFC',           //......Cor de fundo
    borderTopWidth: 1,                    //......Borda superior
    borderTopColor: '#D8E0F0',            //......Cor da borda
    paddingBottom: Platform.OS === 'ios' ? 30 : 8,
  },

  // Container do Emoji Picker - Abaixo do input
  emojiPickerContainer: {
    backgroundColor: '#F4F4F4',           //......Fundo cinza claro
    borderTopWidth: 1,                    //......Borda superior
    borderTopColor: '#E5E7EB',            //......Cor da borda
  },

  // ScrollView dos Emojis - 4 linhas visiveis (44px * 4 = 176px)
  emojiScrollView: {
    maxHeight: 180,                       //......Altura maxima (4 linhas)
  },

  // Conteudo do Grid de Emojis
  emojiGridContent: {
    paddingVertical: 8,                   //......Padding vertical
    paddingHorizontal: 4,                 //......Padding horizontal
  },

  // Grid de Emojis - 8 colunas
  emojiGrid: {
    flexDirection: 'row',                 //......Layout horizontal
    flexWrap: 'wrap',                     //......Quebra linha
    justifyContent: 'flex-start',         //......Alinha esquerda
  },

  // Botao de Emoji Individual - 12.5% da largura (8 colunas)
  emojiBtn: {
    width: '12.5%',                       //......1/8 da largura
    aspectRatio: 1,                       //......Quadrado
    justifyContent: 'center',             //......Centraliza vertical
    alignItems: 'center',                 //......Centraliza horizontal
  },

  // Texto do Emoji
  emojiText: {
    fontSize: 28,                         //......Tamanho do emoji
  },

  // Linha do input
  inputRow: {
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    paddingHorizontal: 8,                 //......Padding horizontal
    paddingVertical: 8,                   //......Padding vertical
    gap: 7,                               //......Espaco entre
  },

  // Box do input
  inputBox: {
    flex: 1,                              //......Ocupa espaco
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    backgroundColor: '#F4F4F4',           //......Cor de fundo cinza
    borderRadius: 6,                      //......Bordas arredondadas
    paddingHorizontal: 10,                //......Padding horizontal
    height: 40,                           //......Altura
  },

  // Botao de emoji
  emojiButton: {
    width: 30,                            //......Largura
    height: 40,                           //......Altura
    justifyContent: 'center',             //......Centraliza vertical
    alignItems: 'center',                 //......Centraliza horizontal
  },

  // Campo de texto
  textInput: {
    flex: 1,                              //......Ocupa espaco
    fontSize: 14,                         //......Tamanho fonte
    color: '#3A3F51',                     //......Cor do texto
    paddingHorizontal: 8,                 //......Padding horizontal
    height: 40,                           //......Altura
    outlineStyle: 'none',                 //......Remove outline de foco
    borderWidth: 0,                       //......Remove borda
  } as any,

  // Botao de acao
  actBtn: {
    width: 40,                            //......Largura
    height: 40,                           //......Altura
    justifyContent: 'center',             //......Centraliza vertical
    alignItems: 'center',                 //......Centraliza horizontal
  },

  // Toast de Confirmacao
  confirmationToast: {
    position: 'absolute',                 //......Posicao absoluta
    bottom: 100,                          //......Distancia do fundo
    alignSelf: 'center',                  //......Centraliza horizontal
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 16,                //......Padding horizontal
    paddingVertical: 10,                  //......Padding vertical
    borderRadius: 24,                     //......Arredondamento
    gap: 8,                               //......Espaco entre elementos
  },

  // Texto da Confirmacao
  confirmationText: {
    fontFamily: 'Inter_500Medium',        //......Fonte media
    fontSize: 14,                         //......Tamanho fonte
    color: '#FFFFFF',                     //......Cor branca
  },

  // Overlay do Modal de Exclusao
  deleteModalOverlay: {
    position: 'absolute',                 //......Posicao absoluta
    top: 0,                               //......Topo
    left: 0,                              //......Esquerda
    right: 0,                             //......Direita
    bottom: 0,                            //......Fundo
    zIndex: 300,                          //......Acima de tudo
    justifyContent: 'flex-end',           //......Alinha no fundo
  },

  // Backdrop do Modal (area escura)
  deleteModalBackdrop: {
    position: 'absolute',                 //......Posicao absoluta
    top: 0,                               //......Topo
    left: 0,                              //......Esquerda
    right: 0,                             //......Direita
    bottom: 0,                            //......Fundo
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  // Container do Modal de Exclusao
  deleteModalContainer: {
    backgroundColor: '#FFFFFF',           //......Fundo branco
    borderTopLeftRadius: 16,              //......Arredondamento TL
    borderTopRightRadius: 16,             //......Arredondamento TR
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },

  // Header do Modal de Exclusao
  deleteModalHeader: {
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    justifyContent: 'center',             //......Centraliza titulo
    paddingHorizontal: 16,                //......Padding horizontal
    paddingVertical: 16,                  //......Padding vertical
    borderBottomWidth: 1,                 //......Borda inferior
    borderBottomColor: '#E5E7EB',         //......Cor da borda
    position: 'relative',                 //......Para posicionar o X
  },

  // Titulo do Modal de Exclusao
  deleteModalTitle: {
    fontFamily: 'Inter_500Medium',        //......Fonte media
    fontSize: 16,                         //......Tamanho fonte
    color: '#1F2937',                     //......Cor escura (gray-800)
    textAlign: 'center',                  //......Centraliza texto
  },

  // Botao Fechar do Modal
  deleteModalCloseBtn: {
    position: 'absolute',                 //......Posicao absoluta
    right: 16,                            //......Alinha direita
    padding: 4,                           //......Padding
  },

  // Botao de Apagar
  deleteModalButton: {
    marginHorizontal: 16,                 //......Margem horizontal
    marginTop: 12,                        //......Margem superior
    paddingVertical: 14,                  //......Padding vertical
    paddingHorizontal: 16,                //......Padding horizontal
    alignItems: 'flex-start',             //......Alinha texto esquerda
    borderRadius: 8,                      //......Bordas arredondadas
    backgroundColor: '#F3F4F6',           //......Fundo cinza claro
  },

  // Texto do Botao Apagar
  deleteModalButtonText: {
    fontFamily: 'Inter_500Medium',        //......Fonte media
    fontSize: 15,                         //......Tamanho fonte
    color: '#1777CF',                     //......Cor azul do sistema
  },

  // Container das Reacoes Rapidas - Largura maxima com 10px de margem
  quickReactionsContainer: {
    position: 'absolute',                 //......Posicao absoluta
    bottom: Platform.OS === 'ios' ? 85 : 55,
    left: 10,                             //......10px margem esquerda
    right: 10,                            //......10px margem direita
    zIndex: 150,                          //......Acima do footer
  },

  // Barra de Reacoes Rapidas - Fundo branco com bordas arredondadas
  quickReactionsBar: {
    flexDirection: 'row',                 //......Layout horizontal
    backgroundColor: '#FFFFFF',           //......Fundo branco
    borderRadius: 12,                     //......Bordas levemente arredondadas
    paddingHorizontal: 12,                //......Padding horizontal
    paddingVertical: 12,                  //......Padding vertical
    justifyContent: 'space-between',      //......Distribui igualmente
    shadowColor: '#000',                  //......Cor sombra
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,                  //......Opacidade sombra
    shadowRadius: 8,                      //......Raio sombra
    elevation: 4,                         //......Elevacao Android
    borderWidth: 1,                       //......Borda
    borderColor: '#E5E7EB',               //......Cor da borda cinza claro
  },

  // Botao de Reacao Rapida
  quickReactionBtn: {
    flex: 1,                              //......Ocupa espaco igual
    aspectRatio: 1,                       //......Quadrado
    maxWidth: 48,                         //......Largura maxima
    justifyContent: 'center',             //......Centraliza vertical
    alignItems: 'center',                 //......Centraliza horizontal
    borderRadius: 8,                      //......Bordas arredondadas
  },

  // Botao de Reacao Rapida Selecionado
  quickReactionBtnSelected: {
    backgroundColor: 'rgba(23, 119, 207, 0.15)',
  },

  // Texto do Emoji Rapido
  quickReactionText: {
    fontSize: 28,                         //......Tamanho do emoji
  },

  // Indicador de Reacao na Imagem - Quadrado com bordas arredondadas
  reactionIndicator: {
    position: 'absolute',                 //......Posicao absoluta
    bottom: Platform.OS === 'ios' ? 100 : 70,
    left: 24,                             //......Margem esquerda
    zIndex: 50,                           //......Abaixo dos modais
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,                      //......Bordas levemente arredondadas
    paddingHorizontal: 10,                //......Padding horizontal maior
    paddingVertical: 8,                   //......Padding vertical maior
    shadowColor: '#000',                  //......Cor sombra
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,                  //......Opacidade sombra
    shadowRadius: 4,                      //......Raio sombra
    elevation: 4,                         //......Elevacao Android
  },

  // Texto do Indicador de Reacao - 10px maior
  reactionIndicatorText: {
    fontSize: 30,                         //......Tamanho emoji maior
  },

  // Overlay do EmojiPicker
  emojiPickerOverlay: {
    position: 'absolute',                 //......Posicao absoluta
    top: 0,                               //......Topo
    left: 0,                              //......Esquerda
    right: 0,                             //......Direita
    bottom: 0,                            //......Fundo
    zIndex: 500,                          //......Acima de tudo
    justifyContent: 'flex-end',           //......Alinha no fundo
  },

  // Backdrop do EmojiPicker
  emojiPickerBackdrop: {
    position: 'absolute',                 //......Posicao absoluta
    top: 0,                               //......Topo
    left: 0,                              //......Esquerda
    right: 0,                             //......Direita
    bottom: 0,                            //......Fundo
    backgroundColor: 'rgba(0, 0, 0, 0.5)', //....Fundo escurecido
  },

  // Wrapper do EmojiPicker
  emojiPickerWrapper: {
    width: '100%',                        //......Largura total
    backgroundColor: '#FFFFFF',           //......Fundo branco
    borderTopLeftRadius: 16,              //......Borda superior esquerda
    borderTopRightRadius: 16,             //......Borda superior direita
    overflow: 'hidden',                   //......Esconde overflow
  },

  // ========================================
  // Estilos do Modal de Resposta - Estilo WhatsApp
  // ========================================

  // Overlay do Modal de Resposta
  replyModalOverlay: {
    position: 'absolute',                 //......Posicao absoluta
    top: 0,                               //......Topo
    left: 0,                              //......Esquerda
    right: 0,                             //......Direita
    bottom: 0,                            //......Fundo
    zIndex: 400,                          //......Acima de tudo
    justifyContent: 'flex-end',           //......Alinha no fundo
  },

  // Backdrop do Modal de Resposta
  replyModalBackdrop: {
    position: 'absolute',                 //......Posicao absoluta
    top: 0,                               //......Topo
    left: 0,                              //......Esquerda
    right: 0,                             //......Direita
    bottom: 0,                            //......Fundo
    backgroundColor: 'rgba(0, 0, 0, 0.5)', //....Fundo escurecido
  },

  // Container do Modal de Resposta
  replyModalContainer: {
    backgroundColor: '#FCFCFC',           //......Fundo igual InputBar
    borderTopWidth: 1,                    //......Borda superior
    borderTopColor: '#D8E0F0',            //......Cor da borda
    paddingBottom: Platform.OS === 'ios' ? 8 : 8,
  },

  // Container do Reply Preview - 20px mais alto
  replyPreviewContainer: {
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    paddingLeft: 0,                       //......Sem margem esquerda
    paddingRight: 12,                     //......Padding direito
    backgroundColor: '#F4F4F4',           //......Cor de fundo
    borderBottomWidth: 1,                 //......Borda inferior
    borderBottomColor: '#D8E0F0',         //......Cor da borda
    minHeight: 70,                        //......Altura minima aumentada
  },

  // Barra azul vertical
  replyPreviewBar: {
    width: 4,                             //......Largura
    alignSelf: 'stretch',                 //......Altura total do container
    backgroundColor: '#1777CF',           //......Cor azul
    borderRadius: 0,                      //......Sem arredondamento
    marginRight: 10,                      //......Margem direita do texto
  },

  // Conteudo do preview
  replyPreviewContent: {
    flex: 1,                              //......Ocupa espaco
    justifyContent: 'center',             //......Centraliza vertical
    paddingVertical: 12,                  //......Espacamento vertical maior
  },

  // Row do nome do lead
  replyPreviewNameRow: {
    flexDirection: 'row',                 //......Layout horizontal
    flexWrap: 'wrap',                     //......Permite quebra
    marginBottom: 2,                      //......Espaco inferior
  },

  // Nome do lead (telefone em azul)
  replyPreviewName: {
    fontFamily: 'Inter_600SemiBold',      //......Fonte bold
    fontSize: 13,                         //......Tamanho fonte
    color: '#1777CF',                     //......Cor azul
  },

  // PushName em preto
  replyPreviewPushName: {
    fontFamily: 'Inter_400Regular',       //......Fonte regular
    color: '#3A3F51',                     //......Cor preta padrao sistema
  },

  // Container do tipo de midia
  replyPreviewMediaType: {
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    gap: 4,                               //......Espaco entre icone e texto
  },

  // Texto do tipo de midia
  replyPreviewMediaText: {
    fontFamily: 'Inter_400Regular',       //......Fonte regular
    fontSize: 13,                         //......Tamanho fonte
    color: '#7D8592',                     //......Cor cinza
  },

  // Container do thumbnail
  replyPreviewThumbnail: {
    width: 54,                            //......Largura aumentada
    height: 54,                           //......Altura aumentada
    borderRadius: 6,                      //......Bordas arredondadas
    overflow: 'hidden',                   //......Esconde overflow
    marginLeft: 10,                       //......Margem esquerda
    backgroundColor: '#E5E7EB',           //......Fundo cinza
  },

  // Imagem do thumbnail
  replyPreviewImage: {
    width: '100%',                        //......Largura total
    height: '100%',                       //......Altura total
  },

  // Placeholder quando nao tem thumbnail
  replyPreviewPlaceholder: {
    width: '100%',                        //......Largura total
    height: '100%',                       //......Altura total
    justifyContent: 'center',             //......Centraliza vertical
    alignItems: 'center',                 //......Centraliza horizontal
    backgroundColor: '#E5E7EB',           //......Fundo cinza
  },

  // Linha do input
  replyInputRow: {
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'flex-end',               //......Alinha na base
    paddingHorizontal: 8,                 //......Padding horizontal
    paddingVertical: 8,                   //......Padding vertical
    gap: 7,                               //......Espaco entre
  },

  // Box do input
  replyInputBox: {
    flex: 1,                              //......Ocupa espaco
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'flex-end',               //......Alinha na base
    backgroundColor: '#F4F4F4',           //......Cor de fundo cinza
    borderRadius: 6,                      //......Bordas arredondadas
    paddingHorizontal: 10,                //......Padding horizontal
    minHeight: 40,                        //......Altura minima
    paddingVertical: 0,                   //......Sem padding vertical
  },

  // Campo de texto
  replyTextInput: {
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
    position: 'absolute',                 //......Posicao absoluta
    right: 5,                             //......5px da borda direita
    top: 0,                               //......Alinha topo
    bottom: 0,                            //......Alinha base
    width: 24,                            //......Largura do botao
    justifyContent: 'center',             //......Centraliza vertical
    alignItems: 'center',                 //......Centraliza horizontal
  },

  // Botao de acao
  replyActBtn: {
    width: 40,                            //......Largura
    height: 40,                           //......Altura
    justifyContent: 'center',             //......Centraliza vertical
    alignItems: 'center',                 //......Centraliza horizontal
  },
});
