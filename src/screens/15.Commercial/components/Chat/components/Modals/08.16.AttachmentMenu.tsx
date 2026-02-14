// ========================================
// Componente AttachmentMenu
// Painel de opcoes de anexos estilo WhatsApp
// Aparece inline acima do input
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, {                           //......React core
  useCallback,                            //......Hook de callback
  memo,                                   //......Memoizacao
} from 'react';                           //......Biblioteca React
import {                                  //......Componentes RN
  View,                                   //......Container basico
  Text,                                   //......Texto
  StyleSheet,                             //......Estilos
  TouchableOpacity,                       //......Toque com opacidade
} from 'react-native';                    //......Biblioteca RN
import Svg, {                             //......SVG core
  Path,                                   //......Path SVG
  Rect,                                   //......Retangulo SVG
} from 'react-native-svg';                //......Biblioteca SVG

// ========================================
// Interface de Props
// ========================================
interface AttachmentMenuProps {
  visible: boolean;                       //......Visibilidade
  onClose: () => void;                    //......Handler fechar
  onSelectCamera: () => void;             //......Handler camera
  onSelectGallery: () => void;            //......Handler galeria
  onSelectDocument: () => void;           //......Handler documento
  onSelectContact: () => void;            //......Handler contato
  onSelectLocation: () => void;           //......Handler localizacao
  onSelectEmoji?: () => void;             //......Handler emoji
  onSelectVideoNote?: () => void;         //......Handler video note
}

// ========================================
// Icone de Fotos (EXATO do Figma)
// ========================================
const PhotosIcon = memo(() => (
  <Svg width={40} height={40} viewBox="0 0 40 40" fill="none">
    <Rect
      x={0.4}                             //......Posicao X
      y={0.4}                             //......Posicao Y
      width={39.2}                        //......Largura
      height={39.2}                       //......Altura
      rx={9.6}                            //......Raio borda
      fill="#1777CF"                      //......Cor preenchimento
    />
    <Rect
      x={0.4}                             //......Posicao X
      y={0.4}                             //......Posicao Y
      width={39.2}                        //......Largura
      height={39.2}                       //......Altura
      rx={9.6}                            //......Raio borda
      stroke="#FCFCFC"                    //......Cor borda
      strokeWidth={0.8}                   //......Largura borda
    />
    <Path
      d="M15.4467 25.3182C14.8267 25.317 14.2227 25.115 13.7197 24.7406C13.2167 24.3662 12.8399 23.8382 12.6423 23.231L12.6146 23.1369C12.5259 22.8501 12.4797 22.5511 12.4776 22.25V16.6716L10.5569 23.2973C10.4393 23.7687 10.5055 24.269 10.7412 24.6906C10.977 25.1121 11.3634 25.4212 11.8173 25.5514L24.06 28.9395C24.2128 28.9804 24.3656 29 24.516 29C25.3046 29 26.0251 28.4592 26.227 27.6623L26.9403 25.3182H15.4467ZM17.6239 16.7273C18.4972 16.7273 19.2074 15.9934 19.2074 15.0909C19.2074 14.1885 18.4972 13.4545 17.6239 13.4545C16.7506 13.4545 16.0405 14.1885 16.0405 15.0909C16.0405 15.9934 16.7506 16.7273 17.6239 16.7273Z"
      fill="#FCFCFC"                      //......Cor preenchimento
    />
    <Path
      d="M27.5207 11H15.6446C15.1198 11.0006 14.6167 11.2164 14.2457 11.5998C13.8746 11.9833 13.6659 12.5032 13.6652 13.0455V22.0455C13.6652 23.1729 14.5536 24.0909 15.6446 24.0909H27.5207C28.6117 24.0909 29.5 23.1729 29.5 22.0455V13.0455C29.5 11.918 28.6117 11 27.5207 11ZM15.6446 12.6364H27.5207C27.6256 12.6364 27.7263 12.6795 27.8006 12.7562C27.8748 12.8329 27.9165 12.937 27.9165 13.0455V18.8537L25.4154 15.8379C25.2832 15.6809 25.1201 15.5549 24.937 15.4681C24.754 15.3813 24.5551 15.3359 24.3537 15.3347C24.1516 15.3358 23.9522 15.3826 23.7695 15.4718C23.5867 15.561 23.4251 15.6904 23.2959 15.851L20.3554 19.4985L19.3974 18.5109C19.1369 18.2421 18.7838 18.0911 18.4157 18.0911C18.0475 18.0911 17.6944 18.2421 17.4339 18.5109L15.2487 20.7683V13.0455C15.2487 12.937 15.2904 12.8329 15.3647 12.7562C15.4389 12.6795 15.5396 12.6364 15.6446 12.6364Z"
      fill="#FCFCFC"                      //......Cor preenchimento
    />
  </Svg>
));

// ========================================
// Icone de Camera (EXATO do Figma)
// ========================================
const CameraIcon = memo(() => (
  <Svg width={40} height={40} viewBox="0 0 40 40" fill="none">
    <Rect
      x={0.4}                             //......Posicao X
      y={0.4}                             //......Posicao Y
      width={39.2}                        //......Largura
      height={39.2}                       //......Altura
      rx={9.6}                            //......Raio borda
      fill="#1777CF"                      //......Cor preenchimento
    />
    <Rect
      x={0.4}                             //......Posicao X
      y={0.4}                             //......Posicao Y
      width={39.2}                        //......Largura
      height={39.2}                       //......Altura
      rx={9.6}                            //......Raio borda
      stroke="#FCFCFC"                    //......Cor borda
      strokeWidth={0.8}                   //......Largura borda
    />
    <Path
      d="M29 14.7429H25.535C25.3704 14.7428 25.2083 14.7056 25.0631 14.6346C24.918 14.5635 24.7943 14.4608 24.703 14.3355L23.5935 12.8142C23.4109 12.5637 23.1634 12.3584 22.8731 12.2163C22.5829 12.0743 22.2587 12 21.9295 12H18.0705C17.7413 12 17.4171 12.0743 17.1269 12.2163C16.8366 12.3584 16.5891 12.5637 16.4065 12.8142L15.297 14.3355C15.2057 14.4608 15.082 14.5635 14.9369 14.6346C14.7917 14.7056 14.6296 14.7428 14.465 14.7429H14V14.2857C14 14.1645 13.9473 14.0482 13.8536 13.9625C13.7598 13.8767 13.6326 13.8286 13.5 13.8286H12C11.8674 13.8286 11.7402 13.8767 11.6464 13.9625C11.5527 14.0482 11.5 14.1645 11.5 14.2857V14.7429H11C10.4696 14.7429 9.96086 14.9355 9.58579 15.2784C9.21071 15.6214 9 16.0865 9 16.5714V26.1714C9 26.6564 9.21071 27.1215 9.58579 27.4644C9.96086 27.8073 10.4696 28 11 28H29C29.5304 28 30.0391 27.8073 30.4142 27.4644C30.7893 27.1215 31 26.6564 31 26.1714V16.5714C31 16.0865 30.7893 15.6214 30.4142 15.2784C30.0391 14.9355 29.5304 14.7429 29 14.7429ZM20 26.1714C18.8628 26.1714 17.7511 25.8631 16.8055 25.2854C15.8599 24.7078 15.1229 23.8867 14.6877 22.9261C14.2525 21.9655 14.1386 20.9085 14.3605 19.8887C14.5823 18.8689 15.13 17.9321 15.9341 17.1969C16.7383 16.4617 17.7628 15.961 18.8782 15.7582C19.9936 15.5553 21.1498 15.6594 22.2004 16.0573C23.2511 16.4552 24.1491 17.129 24.781 17.9936C25.4128 18.8581 25.75 19.8745 25.75 20.9143C25.75 22.3086 25.1442 23.6457 24.0659 24.6316C22.9875 25.6176 21.525 26.1714 20 26.1714Z"
      fill="#FCFCFC"                      //......Cor preenchimento
    />
    <Path
      d="M20 17.4857C19.2583 17.4857 18.5333 17.6868 17.9166 18.0635C17.2999 18.4403 16.8193 18.9757 16.5355 19.6022C16.2516 20.2287 16.1774 20.9181 16.3221 21.5832C16.4667 22.2482 16.8239 22.8592 17.3483 23.3387C17.8728 23.8181 18.541 24.1447 19.2684 24.277C19.9958 24.4093 20.7498 24.3414 21.4351 24.0819C22.1203 23.8224 22.706 23.3829 23.118 22.8191C23.5301 22.2553 23.75 21.5924 23.75 20.9143C23.75 20.005 23.3549 19.1329 22.6517 18.4899C21.9484 17.8469 20.9946 17.4857 20 17.4857ZM20 22.9714C19.4035 22.9708 18.8316 22.7539 18.4097 22.3682C17.9879 21.9826 17.7507 21.4597 17.75 20.9143C17.75 20.793 17.8027 20.6768 17.8964 20.591C17.9902 20.5053 18.1174 20.4571 18.25 20.4571C18.3826 20.4571 18.5098 20.5053 18.6036 20.591C18.6973 20.6768 18.75 20.793 18.75 20.9143C18.75 21.2174 18.8817 21.5081 19.1161 21.7224C19.3505 21.9367 19.6685 22.0571 20 22.0571C20.1326 22.0571 20.2598 22.1053 20.3536 22.191C20.4473 22.2768 20.5 22.393 20.5 22.5143C20.5 22.6355 20.4473 22.7518 20.3536 22.8375C20.2598 22.9233 20.1326 22.9714 20 22.9714Z"
      fill="#FCFCFC"                      //......Cor preenchimento
    />
  </Svg>
));

// ========================================
// Icone de Localizacao (EXATO do Figma)
// ========================================
const LocationIcon = memo(() => (
  <Svg width={40} height={40} viewBox="0 0 40 40" fill="none">
    <Rect
      x={0.4}                             //......Posicao X
      y={0.4}                             //......Posicao Y
      width={39.2}                        //......Largura
      height={39.2}                       //......Altura
      rx={9.6}                            //......Raio borda
      fill="#1777CF"                      //......Cor preenchimento
    />
    <Rect
      x={0.4}                             //......Posicao X
      y={0.4}                             //......Posicao Y
      width={39.2}                        //......Largura
      height={39.2}                       //......Altura
      rx={9.6}                            //......Raio borda
      stroke="#FCFCFC"                    //......Cor borda
      strokeWidth={0.8}                   //......Largura borda
    />
    <Path
      d="M20.0001 10C16.0061 10 12.7568 13.2493 12.7568 17.2432C12.7568 22.1998 19.2388 29.4763 19.5148 29.7836C19.774 30.0723 20.2266 30.0718 20.4854 29.7836C20.7613 29.4763 27.2433 22.1998 27.2433 17.2432C27.2432 13.2493 23.994 10 20.0001 10ZM20.0001 20.8875C17.9906 20.8875 16.3559 19.2527 16.3559 17.2432C16.3559 15.2338 17.9907 13.599 20.0001 13.599C22.0095 13.599 23.6443 15.2338 23.6443 17.2432C23.6443 19.2527 22.0095 20.8875 20.0001 20.8875Z"
      fill="#FCFCFC"                      //......Cor preenchimento
    />
  </Svg>
));

// ========================================
// Icone de Contato (EXATO do Figma)
// ========================================
const ContactIcon = memo(() => (
  <Svg width={40} height={40} viewBox="0 0 40 40" fill="none">
    <Rect
      x={0.4}                             //......Posicao X
      y={0.4}                             //......Posicao Y
      width={39.2}                        //......Largura
      height={39.2}                       //......Altura
      rx={9.6}                            //......Raio borda
      fill="#1777CF"                      //......Cor preenchimento
    />
    <Rect
      x={0.4}                             //......Posicao X
      y={0.4}                             //......Posicao Y
      width={39.2}                        //......Largura
      height={39.2}                       //......Altura
      rx={9.6}                            //......Raio borda
      stroke="#FCFCFC"                    //......Cor borda
      strokeWidth={0.8}                   //......Largura borda
    />
    <Path
      d="M9.5 30C9.5 25.8095 12.9364 22.381 17.1364 22.381C21.3364 22.381 24.7727 25.8095 24.7727 30H9.5ZM17.1364 21.4286C13.9864 21.4286 11.4091 18.8571 11.4091 15.7143C11.4091 12.5714 13.9864 10 17.1364 10C20.2864 10 22.8636 12.5714 22.8636 15.7143C22.8636 18.8571 20.2864 21.4286 17.1364 21.4286ZM26.6818 25.2381H30.5V27.1429H26.6818V25.2381ZM23.8182 20.4762H30.5V22.381H23.8182V20.4762ZM25.7273 15.7143H30.5V17.619H25.7273V15.7143Z"
      fill="#FCFCFC"                      //......Cor preenchimento
    />
  </Svg>
));

// ========================================
// Icone de Documento (EXATO do Figma)
// ========================================
const DocumentIcon = memo(() => (
  <Svg width={40} height={40} viewBox="0 0 40 40" fill="none">
    <Rect
      x={0.4}                             //......Posicao X
      y={0.4}                             //......Posicao Y
      width={39.2}                        //......Largura
      height={39.2}                       //......Altura
      rx={9.6}                            //......Raio borda
      fill="#1777CF"                      //......Cor preenchimento
    />
    <Rect
      x={0.4}                             //......Posicao X
      y={0.4}                             //......Posicao Y
      width={39.2}                        //......Largura
      height={39.2}                       //......Altura
      rx={9.6}                            //......Raio borda
      stroke="#FCFCFC"                    //......Cor borda
      strokeWidth={0.8}                   //......Largura borda
    />
    <Path
      fillRule="evenodd"                  //......Regra preenchimento
      clipRule="evenodd"                  //......Regra corte
      d="M22.7115 11.9091L26.0984 15.3252H22.7115V11.9091ZM26.2339 29C26.6562 29 27 28.6535 27 28.2276V16.611H22.0742C21.722 16.611 21.4368 16.3232 21.4368 15.9682V11H13.7657C13.3433 11 13 11.3465 13 11.7724V28.2276C13 28.6535 13.3434 29 13.7657 29H26.2339Z"
      fill="#FCFCFC"                      //......Cor preenchimento
    />
  </Svg>
));

// ========================================
// Icone de Emoji (EXATO do Figma)
// ========================================
const EmojiIcon = memo(() => (
  <Svg width={40} height={40} viewBox="0 0 40 40" fill="none">
    <Rect
      x={0.4}                             //......Posicao X
      y={0.4}                             //......Posicao Y
      width={39.2}                        //......Largura
      height={39.2}                       //......Altura
      rx={9.6}                            //......Raio borda
      fill="#1777CF"                      //......Cor preenchimento
    />
    <Rect
      x={0.4}                             //......Posicao X
      y={0.4}                             //......Posicao Y
      width={39.2}                        //......Largura
      height={39.2}                       //......Altura
      rx={9.6}                            //......Raio borda
      stroke="#FCFCFC"                    //......Cor borda
      strokeWidth={0.8}                   //......Largura borda
    />
    <Path
      fillRule="evenodd"                  //......Regra preenchimento
      clipRule="evenodd"                  //......Regra corte
      d="M20 10C14.486 10 10 14.4869 10 20C10 25.515 14.486 30 20 30C25.514 30 30 25.515 30 20C30 14.4869 25.514 10 20 10ZM25.0669 23.6172C24.5228 24.4674 23.7735 25.167 22.8881 25.6516C22.0026 26.1362 21.0094 26.3902 20 26.3902C18.9906 26.3902 17.9974 26.1362 17.112 25.6516C16.2265 25.167 15.4772 24.4674 14.9331 23.6172C14.8477 23.4777 14.8203 23.3103 14.8569 23.1509C14.8935 22.9915 14.9911 22.8528 15.1288 22.7645C15.2665 22.6763 15.4333 22.6455 15.5934 22.6788C15.7535 22.7121 15.8942 22.8069 15.9853 22.9428C16.4165 23.6162 17.0103 24.1704 17.7119 24.5542C18.4134 24.938 19.2003 25.1392 20 25.1392C20.7997 25.1392 21.5866 24.938 22.2881 24.5542C22.9897 24.1704 23.5835 23.6162 24.0147 22.9428C24.1057 22.8067 24.2464 22.7117 24.4066 22.6782C24.5669 22.6447 24.7338 22.6755 24.8717 22.7638C25.0095 22.8522 25.1071 22.991 25.1437 23.1506C25.1802 23.3102 25.1526 23.4777 25.0669 23.6172ZM15.0375 17.1863C15.0375 16.7978 15.1918 16.4252 15.4665 16.1505C15.7413 15.8758 16.1138 15.7215 16.5023 15.7215H16.5026C16.7923 15.7215 17.0755 15.8074 17.3164 15.9684C17.5573 16.1293 17.745 16.3581 17.8559 16.6258C17.9668 16.8934 17.9958 17.188 17.9393 17.4721C17.8828 17.7563 17.7432 18.0173 17.5384 18.2221C17.3335 18.427 17.0725 18.5665 16.7884 18.623C16.5042 18.6795 16.2097 18.6505 15.942 18.5397C15.6743 18.4288 15.4456 18.241 15.2846 18.0002C15.1236 17.7593 15.0377 17.476 15.0377 17.1863H15.0375ZM22.0328 17.1863C22.0328 16.7978 22.1871 16.4252 22.4619 16.1505C22.7366 15.8758 23.1092 15.7215 23.4977 15.7215H23.4979C23.7876 15.7215 24.0709 15.8074 24.3118 15.9684C24.5526 16.1293 24.7404 16.3581 24.8513 16.6258C24.9621 16.8934 24.9911 17.188 24.9346 17.4721C24.8781 17.7563 24.7386 18.0173 24.5337 18.2221C24.3289 18.427 24.0679 18.5665 23.7837 18.623C23.4996 18.6795 23.205 18.6505 22.9374 18.5397C22.6697 18.4288 22.4409 18.241 22.28 18.0002C22.119 17.7593 22.0331 17.476 22.0331 17.1863H22.0328Z"
      fill="#FCFCFC"                      //......Cor preenchimento
    />
  </Svg>
));

// ========================================
// Icone de Video Note (Circulo de Video)
// ========================================
const VideoNoteIcon = memo(() => (
  <Svg width={40} height={40} viewBox="0 0 40 40" fill="none">
    <Rect
      x={0.4}                             //......Posicao X
      y={0.4}                             //......Posicao Y
      width={39.2}                        //......Largura
      height={39.2}                       //......Altura
      rx={9.6}                            //......Raio borda
      fill="#1777CF"                      //......Cor preenchimento
    />
    <Rect
      x={0.4}                             //......Posicao X
      y={0.4}                             //......Posicao Y
      width={39.2}                        //......Largura
      height={39.2}                       //......Altura
      rx={9.6}                            //......Raio borda
      stroke="#FCFCFC"                    //......Cor borda
      strokeWidth={0.8}                   //......Largura borda
    />
    <Path
      d="M20 10C14.477 10 10 14.477 10 20C10 25.523 14.477 30 20 30C25.523 30 30 25.523 30 20C30 14.477 25.523 10 20 10ZM20 28C15.589 28 12 24.411 12 20C12 15.589 15.589 12 20 12C24.411 12 28 15.589 28 20C28 24.411 24.411 28 20 28Z"
      fill="#FCFCFC"                      //......Cor preenchimento
    />
    <Path
      d="M17 15.5V24.5L25 20L17 15.5Z"
      fill="#FCFCFC"                      //......Cor preenchimento
    />
  </Svg>
));

// ========================================
// Componente Principal AttachmentMenu
// ========================================
const AttachmentMenu: React.FC<AttachmentMenuProps> = ({
  visible,                                //......Visibilidade
  onClose,                                //......Handler fechar
  onSelectCamera,                         //......Handler camera
  onSelectGallery,                        //......Handler galeria
  onSelectDocument,                       //......Handler documento
  onSelectContact,                        //......Handler contato
  onSelectLocation,                       //......Handler localizacao
  onSelectEmoji,                          //......Handler emoji
  onSelectVideoNote,                      //......Handler video note
}) => {
  // ========================================
  // Handlers de Selecao
  // ========================================
  const handlePhotos = useCallback(() => {
    onSelectGallery();                    //......Chama callback
    onClose();                            //......Fecha menu
  }, [onSelectGallery, onClose]);

  const handleCamera = useCallback(() => {
    console.log('📷 [AttachmentMenu] Botão câmera clicado');
    console.log('📷 [AttachmentMenu] Chamando onSelectCamera()...');
    onSelectCamera();                     //......Chama callback
    console.log('📷 [AttachmentMenu] Chamando onClose()...');
    onClose();                            //......Fecha menu
    console.log('📷 [AttachmentMenu] handleCamera concluído');
  }, [onSelectCamera, onClose]);

  const handleLocation = useCallback(() => {
    onSelectLocation();                   //......Chama callback
    onClose();                            //......Fecha menu
  }, [onSelectLocation, onClose]);

  const handleContact = useCallback(() => {
    onSelectContact();                    //......Chama callback
    onClose();                            //......Fecha menu
  }, [onSelectContact, onClose]);

  const handleDocument = useCallback(() => {
    onSelectDocument();                   //......Chama callback
    onClose();                            //......Fecha menu
  }, [onSelectDocument, onClose]);

  const handleEmoji = useCallback(() => {
    onSelectEmoji?.();                    //......Chama callback
    onClose();                            //......Fecha menu
  }, [onSelectEmoji, onClose]);

  const handleVideoNote = useCallback(() => {
    onSelectVideoNote?.();                //......Chama callback
    onClose();                            //......Fecha menu
  }, [onSelectVideoNote, onClose]);

  // ========================================
  // Se nao visivel, nao renderiza
  // ========================================
  if (!visible) return null;

  // ========================================
  // Render Principal
  // ========================================
  return (
    <View style={styles.container}>
      {/* Grid de Opcoes com FlexWrap */}
      <View style={styles.optionsGrid}>
        {/* Fotos */}
        <TouchableOpacity
          style={styles.optionItem}
          onPress={handlePhotos}
          activeOpacity={0.7}
        >
          <PhotosIcon />
          <Text style={styles.optionLabel}>Fotos</Text>
        </TouchableOpacity>

        {/* Camera */}
        <TouchableOpacity
          style={styles.optionItem}
          onPress={handleCamera}
          activeOpacity={0.7}
        >
          <CameraIcon />
          <Text style={styles.optionLabel}>Câmera</Text>
        </TouchableOpacity>

        {/* Localizacao */}
        <TouchableOpacity
          style={styles.optionItem}
          onPress={handleLocation}
          activeOpacity={0.7}
        >
          <LocationIcon />
          <Text style={styles.optionLabel}>Localização</Text>
        </TouchableOpacity>

        {/* Contato */}
        <TouchableOpacity
          style={styles.optionItem}
          onPress={handleContact}
          activeOpacity={0.7}
        >
          <ContactIcon />
          <Text style={styles.optionLabel}>Contato</Text>
        </TouchableOpacity>

        {/* Documento */}
        <TouchableOpacity
          style={styles.optionItem}
          onPress={handleDocument}
          activeOpacity={0.7}
        >
          <DocumentIcon />
          <Text style={styles.optionLabel}>Documento</Text>
        </TouchableOpacity>

        {/* Emojis */}
        <TouchableOpacity
          style={styles.optionItem}
          onPress={handleEmoji}
          activeOpacity={0.7}
        >
          <EmojiIcon />
          <Text style={styles.optionLabel}>Emojis</Text>
        </TouchableOpacity>

        {/* Video Note */}
        <TouchableOpacity
          style={styles.optionItem}
          onPress={handleVideoNote}
          activeOpacity={0.7}
        >
          <VideoNoteIcon />
          <Text style={styles.optionLabel}>Video Note</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ========================================
// Export Default
// ========================================
export default AttachmentMenu;

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container principal (inline, abaixo do input)
  container: {
    backgroundColor: '#F4F4F4',           //......Cor de fundo zinc-100
    borderRadius: 8,                      //......Bordas arredondadas
    marginHorizontal: 10,                 //......Margem horizontal
    marginTop: 0,                         //......Margem superior
    marginBottom: 10,                     //......Margem inferior
    paddingHorizontal: 10,                //......Padding horizontal
    paddingVertical: 14,                  //......Padding vertical
  },

  // Grid de opcoes com flexWrap
  // Bloco centralizado no modal, itens alinhados a esquerda
  optionsGrid: {
    flexDirection: 'row',                 //......Layout horizontal
    flexWrap: 'wrap',                     //......Permite quebra de linha
    justifyContent: 'flex-start',         //......Itens alinhados esquerda
    alignItems: 'flex-start',             //......Alinha topo
    alignSelf: 'center',                  //......Centraliza bloco no container
    width: 316,                           //......Largura fixa (4x64 + 3x20)
    gap: 20,                              //......Espaco entre itens
  },

  // Item de opcao
  optionItem: {
    width: 64,                            //......Largura fixa
    alignItems: 'center',                 //......Centraliza horizontalmente
    gap: 5,                               //......Espaco entre icone e label
  },

  // Label da opcao
  optionLabel: {
    fontFamily: 'Inter_400Regular',       //......Fonte regular
    fontSize: 12,                         //......Tamanho fonte
    color: '#3A3F51',                     //......Cor texto cinza escuro
    textAlign: 'center',                  //......Alinhamento centro
  },
});
