// ========================================
// Componente DocumentMessage
// Mensagem de documento/arquivo
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, {                           //......React core
  useCallback,                            //......Hook de callback
} from 'react';                           //......Biblioteca React
import {                                  //......Componentes RN
  View,                                   //......Container basico
  Text,                                   //......Texto
  StyleSheet,                             //......Estilos
  Pressable,                              //......Toque
} from 'react-native';                    //......Biblioteca RN
import Svg, {                             //......SVG core
  Path,                                   //......Path SVG
  Rect,                                   //......Retangulo SVG
} from 'react-native-svg';                //......Biblioteca SVG

// ========================================
// Imports de Cores
// ========================================
import { ChatColors } from '../../styles/08.ChatColors';

// ========================================
// Imports de Tipos
// ========================================
import { DocumentContent } from '../../types/08.types.whatsapp';

// ========================================
// Imports de Funcoes
// ========================================
import { formatFileSize } from '../../data/08.mockMessages';

// ========================================
// Interface de Props
// ========================================
interface DocumentMessageProps {
  content: DocumentContent;               //......Conteudo do documento
  isOutgoing: boolean;                    //......Se e enviada
  onPress?: () => void;                   //......Handler press
}

// ========================================
// Mapeamento de Extensoes para Cores
// ========================================
const FILE_TYPE_COLORS: Record<string, string> = {
  pdf: '#EF4444',                         //......Vermelho PDF
  doc: '#2563EB',                         //......Azul Word
  docx: '#2563EB',                        //......Azul Word
  xls: '#22C55E',                         //......Verde Excel
  xlsx: '#22C55E',                        //......Verde Excel
  ppt: '#F59E0B',                         //......Laranja PPT
  pptx: '#F59E0B',                        //......Laranja PPT
  txt: '#7D8592',                         //......Cinza TXT
  zip: '#8B5CF6',                         //......Roxo ZIP
  rar: '#8B5CF6',                         //......Roxo RAR
  default: '#1777CF',                     //......Azul padrao
};

// ========================================
// Componente Icone de Documento
// ========================================
const DocumentIcon: React.FC<{
  color: string;                          //......Cor
  size: number;                           //......Tamanho
}> = ({ color, size }) => (
  <Svg                                    //......SVG container
    width={size}                          //......Largura
    height={size}                         //......Altura
    viewBox="0 0 24 24"                   //......ViewBox
    fill="none"                           //......Sem preenchimento
  >
    {/* Corpo do documento */}
    <Path                                 //......Documento
      d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
      stroke={color}                      //......Cor
      strokeWidth={1.5}                   //......Espessura
      strokeLinecap="round"               //......Ponta arredondada
      strokeLinejoin="round"              //......Junção arredondada
    />
    {/* Dobra */}
    <Path                                 //......Dobra do canto
      d="M14 2V8H20"                      //......Desenho
      stroke={color}                      //......Cor
      strokeWidth={1.5}                   //......Espessura
      strokeLinecap="round"               //......Ponta arredondada
      strokeLinejoin="round"              //......Junção arredondada
    />
    {/* Linha 1 */}
    <Path                                 //......Linha texto
      d="M16 13H8"                        //......Desenho
      stroke={color}                      //......Cor
      strokeWidth={1.5}                   //......Espessura
      strokeLinecap="round"               //......Ponta arredondada
    />
    {/* Linha 2 */}
    <Path                                 //......Linha texto
      d="M16 17H8"                        //......Desenho
      stroke={color}                      //......Cor
      strokeWidth={1.5}                   //......Espessura
      strokeLinecap="round"               //......Ponta arredondada
    />
    {/* Linha 3 */}
    <Path                                 //......Linha texto
      d="M10 9H8"                         //......Desenho
      stroke={color}                      //......Cor
      strokeWidth={1.5}                   //......Espessura
      strokeLinecap="round"               //......Ponta arredondada
    />
  </Svg>
);

// ========================================
// Componente Icone de Download
// ========================================
const DownloadIcon: React.FC<{
  color: string;                          //......Cor
  size: number;                           //......Tamanho
}> = ({ color, size }) => (
  <Svg                                    //......SVG container
    width={size}                          //......Largura
    height={size}                         //......Altura
    viewBox="0 0 24 24"                   //......ViewBox
    fill="none"                           //......Sem preenchimento
  >
    <Path                                 //......Seta para baixo
      d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
      stroke={color}                      //......Cor
      strokeWidth={1.5}                   //......Espessura
      strokeLinecap="round"               //......Ponta arredondada
      strokeLinejoin="round"              //......Junção arredondada
    />
    <Path                                 //......Linha vertical
      d="M7 10L12 15L17 10"               //......Seta
      stroke={color}                      //......Cor
      strokeWidth={1.5}                   //......Espessura
      strokeLinecap="round"               //......Ponta arredondada
      strokeLinejoin="round"              //......Junção arredondada
    />
    <Path                                 //......Linha vertical
      d="M12 15V3"                        //......Desenho
      stroke={color}                      //......Cor
      strokeWidth={1.5}                   //......Espessura
      strokeLinecap="round"               //......Ponta arredondada
      strokeLinejoin="round"              //......Junção arredondada
    />
  </Svg>
);

// ========================================
// Componente Principal DocumentMessage
// ========================================
const DocumentMessage: React.FC<DocumentMessageProps> = ({
  content,                                //......Conteudo
  isOutgoing,                             //......Direcao
  onPress,                                //......Handler
}) => {
  // ========================================
  // Obter extensao do arquivo
  // ========================================
  const getExtension = useCallback((): string => {
    const parts = content.fileName.split('.');
    return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
  }, [content.fileName]);

  // ========================================
  // Obter cor do tipo
  // ========================================
  const getTypeColor = useCallback((): string => {
    const ext = getExtension();           //......Extensao
    return FILE_TYPE_COLORS[ext] || FILE_TYPE_COLORS.default;
  }, [getExtension]);

  // ========================================
  // Formatar nome do arquivo
  // ========================================
  const formatFileName = useCallback((): string => {
    const name = content.fileName;        //......Nome completo
    if (name.length > 25) {
      const ext = getExtension();         //......Extensao
      const baseName = name.slice(0, 20); //......Base truncada
      return `${baseName}...${ext ? `.${ext}` : ''}`;
    }
    return name;                          //......Nome completo
  }, [content.fileName, getExtension]);

  // ========================================
  // Cores baseadas na direcao
  // ========================================
  const iconColor = isOutgoing ? ChatColors.white : getTypeColor();
  const textColor = isOutgoing ? ChatColors.outgoingText : ChatColors.incomingText;
  const subTextColor = isOutgoing ? 'rgba(255,255,255,0.7)' : ChatColors.timestamp;

  // ========================================
  // Render Principal
  // ========================================
  return (
    <Pressable
      style={[
        styles.container,                 //......Estilo base
        isOutgoing ? styles.containerOutgoing : styles.containerIncoming,
      ]}
      onPress={onPress}                   //......Handler
    >
      {/* Icone do Documento */}
      <View
        style={[
          styles.iconContainer,           //......Estilo icone
          {
            backgroundColor: isOutgoing
              ? 'rgba(255,255,255,0.2)'
              : `${getTypeColor()}15`,
          },
        ]}
      >
        <DocumentIcon
          color={iconColor}               //......Cor
          size={28}                       //......Tamanho
        />
      </View>

      {/* Info do Arquivo */}
      <View style={styles.infoContainer}>
        {/* Nome */}
        <Text
          style={[
            styles.fileName,              //......Estilo nome
            { color: textColor },         //......Cor dinamica
          ]}
          numberOfLines={1}               //......Uma linha
        >
          {formatFileName()}
        </Text>

        {/* Tamanho e Tipo */}
        <Text
          style={[
            styles.fileInfo,              //......Estilo info
            { color: subTextColor },      //......Cor dinamica
          ]}
        >
          {formatFileSize(content.fileSize)} • {getExtension().toUpperCase() || 'FILE'}
        </Text>
      </View>

      {/* Botao Download */}
      <View style={styles.downloadButton}>
        <DownloadIcon
          color={iconColor}               //......Cor
          size={20}                       //......Tamanho
        />
      </View>
    </Pressable>
  );
};

// ========================================
// Export Default
// ========================================
export default DocumentMessage;

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container principal
  container: {
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    padding: 8,                           //......Padding
    borderRadius: 8,                      //......Bordas arredondadas
    minWidth: 220,                        //......Largura minima
    gap: 12,                              //......Espaco entre
  },

  // Container incoming
  containerIncoming: {
    backgroundColor: 'rgba(0,0,0,0.03)',  //......Fundo sutil
  },

  // Container outgoing
  containerOutgoing: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  // Container do icone
  iconContainer: {
    width: 48,                            //......Largura
    height: 48,                           //......Altura
    borderRadius: 8,                      //......Bordas arredondadas
    justifyContent: 'center',             //......Centraliza vertical
    alignItems: 'center',                 //......Centraliza horizontal
  },

  // Container das infos
  infoContainer: {
    flex: 1,                              //......Ocupa espaco
    gap: 2,                               //......Espaco entre
  },

  // Nome do arquivo
  fileName: {
    fontFamily: 'Inter_500Medium',        //......Fonte media
    fontSize: 14,                         //......Tamanho fonte
  },

  // Info do arquivo
  fileInfo: {
    fontFamily: 'Inter_400Regular',       //......Fonte regular
    fontSize: 12,                         //......Tamanho fonte
  },

  // Botao download
  downloadButton: {
    width: 36,                            //......Largura
    height: 36,                           //......Altura
    justifyContent: 'center',             //......Centraliza vertical
    alignItems: 'center',                 //......Centraliza horizontal
  },
});
