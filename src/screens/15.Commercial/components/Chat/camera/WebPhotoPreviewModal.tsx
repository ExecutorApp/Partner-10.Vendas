// ========================================
// Modal de Preview de Foto para Web
// Mostra foto capturada com campo de legenda
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, { useState, useCallback } from 'react';
import { View, Image, Pressable, Text, TextInput, StyleSheet, Modal, Platform, KeyboardAvoidingView } from 'react-native';
import Svg, { Path } from 'react-native-svg';

// ========================================
// Imports de Constantes
// ========================================
import { CameraColors, CameraStyles, CameraIcons } from './utils/cameraConstants';

// ========================================
// Tipos
// ========================================
interface WebPhotoPreviewModalProps {
  visible: boolean;                         //......Modal visivel
  photoUri: string;                         //......URI da foto
  photoWidth: number;                       //......Largura da foto
  photoHeight: number;                      //......Altura da foto
  leadName: string;                         //......Nome do lead
  onClose: () => void;                      //......Callback fechar
  onSend: (caption: string) => void;        //......Callback enviar
}

// ========================================
// Icone Fechar
// ========================================
const CloseIcon: React.FC = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Path d={CameraIcons.close} fill={CameraColors.textWhite} />
  </Svg>
);

// ========================================
// Icone Enviar
// ========================================
const SendIcon: React.FC = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d={CameraIcons.send} fill={CameraColors.textWhite} />
  </Svg>
);

// ========================================
// Componente Principal WebPhotoPreviewModal
// ========================================
const WebPhotoPreviewModal: React.FC<WebPhotoPreviewModalProps> = ({
  visible,
  photoUri,
  photoWidth,
  photoHeight,
  leadName,
  onClose,
  onSend,
}) => {
  console.log('📷 [WebPhotoPreviewModal] Renderizando, visible:', visible);
  console.log('📷 [WebPhotoPreviewModal] Foto:', { photoUri: photoUri?.substring(0, 50), photoWidth, photoHeight });

  // ========================================
  // Estados
  // ========================================
  const [caption, setCaption] = useState('');
  const [isSending, setIsSending] = useState(false);

  // ========================================
  // Handler: Enviar Foto
  // ========================================
  const handleSend = useCallback(() => {
    if (isSending) return;
    console.log('📷 [WebPhotoPreviewModal] Enviando foto com legenda:', caption);
    setIsSending(true);
    onSend(caption.trim());
  }, [isSending, caption, onSend]);

  // ========================================
  // Handler: Descartar
  // ========================================
  const handleDiscard = useCallback(() => {
    console.log('📷 [WebPhotoPreviewModal] Descartando foto...');
    setCaption('');
    setIsSending(false);
    onClose();
  }, [onClose]);

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
      onRequestClose={handleDiscard}
    >
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        {/* Imagem de Preview */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: photoUri }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {/* Header com Fechar */}
        <View style={styles.header}>
          <Pressable style={styles.headerButton} onPress={handleDiscard}>
            <CloseIcon />
          </Pressable>
        </View>

        {/* Footer com Legenda e Enviar */}
        <View style={styles.footer}>
          {/* Container do Input */}
          <View style={styles.inputContainer}>
            {/* Campo de Texto */}
            <TextInput
              style={styles.input}
              value={caption}
              onChangeText={setCaption}
              placeholder="Adicione uma legenda..."
              placeholderTextColor={CameraColors.inputPlaceholder}
              multiline
              maxLength={1000}
            />

            {/* Botao Enviar */}
            <Pressable
              style={[styles.sendButton, isSending && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={isSending}
            >
              <SendIcon />
            </Pressable>
          </View>

          {/* Nome do Destinatario */}
          <Text style={styles.recipientText}>
            Para: {leadName}
          </Text>
        </View>
      </KeyboardAvoidingView>
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

  // Container da imagem
  imageContainer: {
    flex: 1,                                //......Ocupa espaco disponivel
    justifyContent: 'center',               //......Centraliza vertical
    alignItems: 'center',                   //......Centraliza horizontal
  },

  // Imagem
  image: {
    width: '100%',                          //......Largura total
    height: '100%',                         //......Altura total
  },

  // Header
  header: {
    position: 'absolute',                   //......Posicao absoluta
    top: 40,                                //......Topo
    left: 16,                               //......Esquerda
    right: 16,                              //......Direita
    flexDirection: 'row',                   //......Layout horizontal
    justifyContent: 'flex-start',           //......Alinha esquerda
    zIndex: 10,                             //......Camada superior
  },

  // Botao do header
  headerButton: {
    width: 44,                              //......Largura
    height: 44,                             //......Altura
    borderRadius: CameraStyles.borderRadiusButton,  //......Borda
    backgroundColor: CameraColors.overlayDark,      //......Fundo escuro
    justifyContent: 'center',               //......Centraliza vertical
    alignItems: 'center',                   //......Centraliza horizontal
  },

  // Footer
  footer: {
    position: 'absolute',                   //......Posicao absoluta
    bottom: 0,                              //......Embaixo
    left: 0,                                //......Esquerda
    right: 0,                               //......Direita
    paddingHorizontal: 16,                  //......Padding horizontal
    paddingVertical: 12,                    //......Padding vertical
    paddingBottom: 32,                      //......Padding inferior extra
    backgroundColor: CameraColors.cameraBackground,  //......Fundo preto
  },

  // Container do input
  inputContainer: {
    flexDirection: 'row',                   //......Layout horizontal
    alignItems: 'flex-end',                 //......Alinha embaixo
    backgroundColor: CameraColors.inputBackground,  //......Fundo cinza claro
    borderRadius: CameraStyles.borderRadiusInput,   //......Bordas arredondadas
    paddingHorizontal: 16,                  //......Padding horizontal
    paddingVertical: 8,                     //......Padding vertical
    gap: 12,                                //......Espaco entre elementos
  },

  // Campo de texto
  input: {
    flex: 1,                                //......Ocupa espaco disponivel
    fontSize: 16,                           //......Tamanho da fonte
    color: CameraColors.textPrimary,        //......Cor do texto
    maxHeight: 100,                         //......Altura maxima
    paddingVertical: 8,                     //......Padding vertical
  },

  // Botao enviar
  sendButton: {
    width: 44,                              //......Largura
    height: 44,                             //......Altura
    borderRadius: 22,                       //......Circular
    backgroundColor: CameraColors.primary,  //......Azul
    justifyContent: 'center',               //......Centraliza vertical
    alignItems: 'center',                   //......Centraliza horizontal
  },

  // Botao enviar desabilitado
  sendButtonDisabled: {
    opacity: 0.5,                           //......Opacidade reduzida
  },

  // Texto do destinatario
  recipientText: {
    fontSize: 12,                           //......Tamanho da fonte
    color: CameraColors.textSecondary,      //......Cinza
    marginTop: 8,                           //......Margem superior
    marginLeft: 4,                          //......Margem esquerda
  },
});

// ========================================
// Export
// ========================================
export default WebPhotoPreviewModal;
