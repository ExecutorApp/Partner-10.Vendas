// ========================================
// Componente MessageStatus
// Indicadores de status da mensagem (Padrao WhatsApp Oficial)
// 1 check cinza = enviado
// 2 checks cinza = entregue
// 2 checks azul = lido
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React from 'react';                //......React core
import {                                  //......Componentes RN
  View,                                   //......Container basico
  StyleSheet,                             //......Estilos
} from 'react-native';                    //......Biblioteca RN
import Svg, {                             //......SVG core
  Path,                                   //......Path SVG
} from 'react-native-svg';                //......Biblioteca SVG

// ========================================
// Imports de Cores
// ========================================
import { ChatColors } from '../../styles/08.ChatColors';

// ========================================
// Imports de Tipos
// ========================================
import { MessageStatus as StatusType } from '../../types/08.types.whatsapp';

// ========================================
// Interface de Props
// ========================================
interface MessageStatusProps {
  status: StatusType;                     //......Status da mensagem
  isOutgoing?: boolean;                   //......Se e mensagem enviada
  size?: number;                          //......Tamanho do icone
  iconColor?: string;                     //......Cor customizada do icone
}

// ========================================
// Componente SingleCheck - 1 check = Enviado (Padrao WhatsApp)
// ========================================
const SingleCheck: React.FC<{ color: string; size: number }> = ({
  color,                                  //......Cor do check
  size,                                   //......Tamanho
}) => {
  // Escala baseada no tamanho
  const scale = size / 11;                //......Escala proporcional
  const width = 13 * scale;               //......Largura escalada
  const height = 11 * scale;              //......Altura escalada

  return (
    <Svg
      width={width}                       //......Largura
      height={height}                     //......Altura
      viewBox="0 0 13 11"                 //......ViewBox original
      fill="none"                         //......Sem preenchimento
    >
      {/* Check com preenchimento */}
      <Path
        d="M12.1895 0.998047L4.24219 10.8887L0 6.64648L1.12695 5.51953L4.1123 8.50488L10.9473 0L12.1895 0.998047Z"
        fill={color}                      //......Preenchimento colorido
      />
    </Svg>
  );
};

// ========================================
// Componente DoubleCheck - 2 checks = Entregue/Lido (Padrao WhatsApp)
// ========================================
const DoubleCheck: React.FC<{ color: string; size: number }> = ({
  color,                                  //......Cor do check
  size,                                   //......Tamanho
}) => {
  // Escala baseada no tamanho
  const scale = size / 11;                //......Escala proporcional
  const width = 18 * scale;               //......Largura escalada
  const height = 11 * scale;              //......Altura escalada

  return (
    <Svg
      width={width}                       //......Largura
      height={height}                     //......Altura
      viewBox="0 0 18 11"                 //......ViewBox original WhatsApp
      fill="none"                         //......Sem preenchimento
    >
      {/* Primeiro check (esquerda) */}
      <Path
        d="M12.1895 0.998047L4.24219 10.8887L0 6.64648L1.12695 5.51953L4.1123 8.50488L10.9473 0L12.1895 0.998047Z"
        fill={color}                      //......Preenchimento colorido
      />
      {/* Segundo check (direita) */}
      <Path
        d="M17.1909 0.998047L9.24268 10.8887L7.17627 8.82227L8.18018 7.57227L9.11377 8.50488L15.9487 0L17.1909 0.998047Z"
        fill={color}                      //......Preenchimento colorido
      />
    </Svg>
  );
};

// ========================================
// Componente ClockIcon (Pending)
// ========================================
const ClockIcon: React.FC<{ color: string; size: number }> = ({
  color,                                  //......Cor do icone
  size,                                   //......Tamanho
}) => (
  <Svg
    width={size}                          //......Largura
    height={size}                         //......Altura
    viewBox="0 0 16 16"                   //......ViewBox
    fill="none"                           //......Sem preenchimento
  >
    <Path
      d="M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12Z"
      stroke={color}                      //......Cor da linha
      strokeWidth={1.5}                   //......Espessura
    />
    <Path
      d="M8 5v3l2 2"                      //......Ponteiros
      stroke={color}                      //......Cor da linha
      strokeWidth={1.5}                   //......Espessura
      strokeLinecap="round"               //......Ponta arredondada
      strokeLinejoin="round"              //......Juncao arredondada
    />
  </Svg>
);

// ========================================
// Componente ErrorDot (Failed) - Bolinha Vermelha
// ========================================
const ErrorDot: React.FC<{ size: number }> = ({
  size,                                   //......Tamanho
}) => {
  // Tamanho da bolinha proporcional
  const dotSize = Math.max(6, size * 0.5); //......Tamanho minimo 6px

  return (
    <View
      style={{
        width: dotSize,                   //......Largura
        height: dotSize,                  //......Altura
        borderRadius: dotSize / 2,        //......Circular
        backgroundColor: '#E53935',       //......Vermelho erro
      }}
    />
  );
};

// ========================================
// Componente Principal MessageStatus
// ========================================
const MessageStatus: React.FC<MessageStatusProps> = ({
  status,                                 //......Status da mensagem
  isOutgoing = true,                      //......Padrao enviada
  size = 14,                              //......Tamanho padrao
  iconColor,                              //......Cor customizada (opcional)
}) => {
  // ========================================
  // Determinar Cor do Icone (Padrao WhatsApp Oficial)
  // ========================================
  const getColor = (): string => {
    // Se tiver cor customizada, usa ela
    if (iconColor) return iconColor;

    // Cores por status (Padrao WhatsApp Oficial)
    switch (status) {
      case 'pending':                     //......Pendente (relogio)
        return ChatColors.checkSent;      //......Cinza #8696A0
      case 'sent':                        //......Enviado (1 check cinza)
        return ChatColors.checkSent;      //......Cinza #8696A0
      case 'delivered':                   //......Entregue (2 checks cinza)
        return ChatColors.checkDelivered; //......Cinza #8696A0
      case 'read':                        //......Lido (2 checks azuis)
        return ChatColors.checkRead;      //......Azul #53BDEB
      case 'failed':                      //......Falhou
        return ChatColors.error;          //......Vermelho
      default:                            //......Padrao
        return ChatColors.checkSent;      //......Cinza
    }
  };

  // ========================================
  // Renderizar Icone por Status
  // ========================================
  const renderIcon = () => {
    const color = getColor();             //......Cor calculada

    switch (status) {
      case 'pending':                     //......Pendente
        return (
          <ClockIcon
            color={color}
            size={size}
          />
        );

      case 'sent':                        //......Enviada (1 check)
        return (
          <SingleCheck
            color={color}
            size={size}
          />
        );

      case 'delivered':                   //......Entregue (2 checks)
        return (
          <DoubleCheck
            color={color}
            size={size}
          />
        );

      case 'read':                        //......Lida (2 checks azuis)
        return (
          <DoubleCheck
            color={color}
            size={size}
          />
        );

      case 'failed':                      //......Falhou
        return (
          <ErrorDot
            size={size}
          />
        );

      default:                            //......Padrao
        return null;
    }
  };

  // ========================================
  // Nao mostrar para incoming (padrao WhatsApp)
  // ========================================
  if (!isOutgoing) {
    return null;
  }

  // ========================================
  // Render Principal
  // ========================================
  return (
    <View style={styles.container}>
      {renderIcon()}
    </View>
  );
};

// ========================================
// Export Default
// ========================================
export default MessageStatus;

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container do status
  container: {
    marginLeft: 4,                        //......Margem esquerda
    justifyContent: 'center',             //......Centraliza vertical
    alignItems: 'center',                 //......Centraliza horizontal
  },
});
