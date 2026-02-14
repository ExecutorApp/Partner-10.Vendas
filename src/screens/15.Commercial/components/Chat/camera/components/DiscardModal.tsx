// ========================================
// Componente DiscardModal
// Modal de confirmacao para descartar foto
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, { memo } from 'react';
import { View, Text, Modal, Pressable, StyleSheet } from 'react-native';

// ========================================
// Imports de Constantes
// ========================================
import { CameraColors } from '../utils/cameraConstants';

// ========================================
// Constantes Locais
// ========================================
const PRIMARY_COLOR = '#1777CF';      //......Azul primario
const DANGER_COLOR = '#EF4444';       //......Vermelho de alerta

// ========================================
// Interface de Props
// ========================================
interface DiscardModalProps {
  visible: boolean;                   //......Visibilidade do modal
  onCancel: () => void;               //......Handler cancelar
  onDiscard: () => void;              //......Handler descartar
}

// ========================================
// Componente Principal DiscardModal
// ========================================
const DiscardModal: React.FC<DiscardModalProps> = memo(({
  visible,                            //......Visibilidade
  onCancel,                           //......Handler cancelar
  onDiscard,                          //......Handler descartar
}) => {
  // ========================================
  // Render Principal
  // ========================================
  return (
    <Modal
      visible={visible}               //......Controla visibilidade
      transparent                     //......Fundo transparente
      animationType="fade"            //......Animacao fade
      onRequestClose={onCancel}       //......Botao voltar Android
    >
      {/* Overlay escuro */}
      <View style={styles.overlay}>
        {/* Card centralizado */}
        <View style={styles.card}>
          {/* Titulo */}
          <Text style={styles.title}>
            Descartar foto?
          </Text>

          {/* Subtitulo */}
          <Text style={styles.subtitle}>
            Suas alterações serão perdidas.
          </Text>

          {/* Container dos botoes */}
          <View style={styles.buttonsContainer}>
            {/* Botao Cancelar */}
            <Pressable
              style={styles.cancelButton}
              onPress={onCancel}
              hitSlop={8}
            >
              <Text style={styles.cancelText}>
                Cancelar
              </Text>
            </Pressable>

            {/* Botao Descartar */}
            <Pressable
              style={styles.discardButton}
              onPress={onDiscard}
              hitSlop={8}
            >
              <Text style={styles.discardText}>
                Descartar
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
});

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Overlay escuro
  overlay: {
    flex: 1,                          //......Ocupa tela toda
    backgroundColor: 'rgba(0,0,0,0.5)',  //......Fundo semi-transparente
    justifyContent: 'center',         //......Centraliza vertical
    alignItems: 'center',             //......Centraliza horizontal
  },

  // Card do modal
  card: {
    backgroundColor: '#FFFFFF',       //......Fundo branco
    borderRadius: 16,                 //......Cantos arredondados
    paddingVertical: 24,              //......Padding vertical
    paddingHorizontal: 24,            //......Padding horizontal
    width: '80%',                     //......Largura 80% da tela
    maxWidth: 320,                    //......Largura maxima
    alignItems: 'center',             //......Centraliza conteudo
  },

  // Titulo
  title: {
    fontSize: 18,                     //......Tamanho fonte
    fontWeight: '600',                //......Semi-bold
    color: CameraColors.textPrimary,  //......Preto
    marginBottom: 8,                  //......Margem inferior
    textAlign: 'center',              //......Centraliza texto
  },

  // Subtitulo
  subtitle: {
    fontSize: 14,                     //......Tamanho fonte
    color: CameraColors.textSecondary,  //......Cinza
    marginBottom: 24,                 //......Margem inferior
    textAlign: 'center',              //......Centraliza texto
  },

  // Container dos botoes
  buttonsContainer: {
    flexDirection: 'row',             //......Layout horizontal
    justifyContent: 'center',         //......Centraliza botoes
    gap: 16,                          //......Espaco entre botoes
    width: '100%',                    //......Largura total
  },

  // Botao Cancelar
  cancelButton: {
    flex: 1,                          //......Ocupa espaco igual
    paddingVertical: 12,              //......Padding vertical
    paddingHorizontal: 16,            //......Padding horizontal
    borderRadius: 8,                  //......Cantos arredondados
    backgroundColor: '#F3F4F6',       //......Fundo cinza claro
    alignItems: 'center',             //......Centraliza texto
  },

  // Texto do botao Cancelar
  cancelText: {
    fontSize: 15,                     //......Tamanho fonte
    fontWeight: '600',                //......Semi-bold
    color: PRIMARY_COLOR,             //......Azul
  },

  // Botao Descartar
  discardButton: {
    flex: 1,                          //......Ocupa espaco igual
    paddingVertical: 12,              //......Padding vertical
    paddingHorizontal: 16,            //......Padding horizontal
    borderRadius: 8,                  //......Cantos arredondados
    backgroundColor: '#FEE2E2',       //......Fundo vermelho claro
    alignItems: 'center',             //......Centraliza texto
  },

  // Texto do botao Descartar
  discardText: {
    fontSize: 15,                     //......Tamanho fonte
    fontWeight: '600',                //......Semi-bold
    color: DANGER_COLOR,              //......Vermelho
  },
});

// ========================================
// Export
// ========================================
export default DiscardModal;
