// ========================================
// Componente DateDivider
// Divisor de data entre mensagens
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React from 'react';                //......React core
import {                                  //......Componentes RN
  View,                                   //......Container basico
  Text,                                   //......Texto
  StyleSheet,                             //......Estilos
} from 'react-native';                    //......Biblioteca RN

// ========================================
// Imports de Cores
// ========================================
import { ChatColors } from '../../styles/08.ChatColors';

// ========================================
// Imports de Funcoes
// ========================================
import { formatMessageDate } from '../../data/08.mockMessages';

// ========================================
// Interface de Props
// ========================================
interface DateDividerProps {
  date: Date;                             //......Data a exibir
  showLine?: boolean;                     //......Mostrar linhas
}

// ========================================
// Componente Principal DateDivider
// ========================================
const DateDivider: React.FC<DateDividerProps> = ({
  date,                                   //......Data
  showLine = false,                       //......Linha opcional
}) => {
  // ========================================
  // Formatar Data
  // ========================================
  const formattedDate = formatMessageDate(date);

  // ========================================
  // Render com Linhas
  // ========================================
  if (showLine) {
    return (
      <View style={styles.containerWithLine}>
        {/* Linha Esquerda */}
        <View style={styles.line} />

        {/* Texto da Data */}
        <View style={styles.dateBadge}>
          <Text style={styles.dateText}>
            {formattedDate}
          </Text>
        </View>

        {/* Linha Direita */}
        <View style={styles.line} />
      </View>
    );
  }

  // ========================================
  // Render Simples (Estilo WhatsApp)
  // ========================================
  return (
    <View style={styles.container}>
      {/* Badge da Data */}
      <View style={styles.dateBadge}>
        <Text style={styles.dateText}>
          {formattedDate}
        </Text>
      </View>
    </View>
  );
};

// ========================================
// Export Default
// ========================================
export default DateDivider;

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container simples
  container: {
    alignItems: 'center',                 //......Centraliza horizontal
    justifyContent: 'center',             //......Centraliza vertical
    paddingVertical: 16,                  //......Espaco vertical
  },

  // Container com linhas
  containerWithLine: {
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    justifyContent: 'center',             //......Centraliza horizontal
    paddingVertical: 16,                  //......Espaco vertical
    paddingHorizontal: 20,                //......Espaco horizontal
  },

  // Linha lateral
  line: {
    flex: 1,                              //......Ocupa espaco
    height: 1,                            //......Altura da linha
    backgroundColor: ChatColors.divider,  //......Cor da linha
  },

  // Badge da data
  dateBadge: {
    backgroundColor: '#FFFFFF',           //......Fundo branco
    paddingHorizontal: 12,                //......Espaco horizontal
    paddingVertical: 6,                   //......Espaco vertical
    borderRadius: 8,                      //......Bordas arredondadas
    marginHorizontal: 12,                 //......Margem lateral
    shadowColor: '#000',                  //......Cor da sombra
    shadowOffset: {                       //......Offset da sombra
      width: 0,                           //......Offset X
      height: 1,                          //......Offset Y
    },
    shadowOpacity: 0.08,                  //......Opacidade sombra
    shadowRadius: 2,                      //......Raio sombra
    elevation: 1,                         //......Elevacao Android
  },

  // Texto da data
  dateText: {
    fontFamily: 'Inter_500Medium',        //......Fonte media
    fontSize: 12,                         //......Tamanho fonte
    color: '#7D8592',                     //......Cor cinza escuro
    textAlign: 'center',                  //......Alinhamento centro
  },
});
