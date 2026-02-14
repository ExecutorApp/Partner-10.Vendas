// ========================================
// Componente: Acoes Rapidas da Lola
// Botoes de acao abaixo do avatar
// ========================================

// ========================================
// Imports
// ========================================
import React from 'react';                //......React
import {
  View,                                   //......Container
  Text,                                   //......Texto
  TouchableOpacity,                       //......Botao tocavel
  StyleSheet,                             //......Estilos
} from 'react-native';

// ========================================
// Cores
// ========================================
const COLORS = {
  primary: '#1777CF',                     //......Azul primario
  white: '#FFFFFF',                       //......Branco
  text: '#333333',                        //......Texto escuro
  border: '#E8ECF4',                      //......Borda
  quickActionBg: 'rgba(255, 255, 255, 0.95)', //..Fundo acoes rapidas
};

// ========================================
// Interface de Props
// ========================================
interface LolaQuickActionsProps {
  onAskHelp?: () => void;                 //......Handler pedir ajuda
  onSendMessage?: () => void;             //......Handler enviar mensagem
  onViewSuggestions?: () => void;         //......Handler ver sugestoes
}

// ========================================
// Componente
// ========================================
const LolaQuickActions: React.FC<LolaQuickActionsProps> = ({
  onAskHelp,
  onSendMessage,
  onViewSuggestions,
}) => {
  return (
    <View style={styles.container}>
      {/* Botao: Pedir Ajuda */}
      <TouchableOpacity
        style={styles.button}
        onPress={onAskHelp}
      >
        <Text style={styles.buttonText}>Ajuda</Text>
      </TouchableOpacity>

      {/* Botao: Enviar Mensagem (Primario) */}
      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={onSendMessage}
      >
        <Text style={[styles.buttonText, styles.primaryText]}>Falar</Text>
      </TouchableOpacity>

      {/* Botao: Ver Sugestoes */}
      <TouchableOpacity
        style={styles.button}
        onPress={onViewSuggestions}
      >
        <Text style={styles.buttonText}>Sugestoes</Text>
      </TouchableOpacity>
    </View>
  );
};

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container
  container: {
    flexDirection: 'row',                 //......Layout horizontal
    justifyContent: 'center',             //......Centraliza
    alignItems: 'center',                 //......Centraliza
    marginTop: 16,                        //......Margem topo
    gap: 12,                              //......Espaco entre botoes
  },

  // Botao base
  button: {
    paddingHorizontal: 16,                //......Padding horizontal
    paddingVertical: 8,                   //......Padding vertical
    borderRadius: 20,                     //......Arredondamento
    backgroundColor: COLORS.quickActionBg, //....Fundo
    borderWidth: 1,                       //......Borda
    borderColor: COLORS.border,           //......Cor da borda
  },

  // Texto do botao
  buttonText: {
    fontSize: 12,                         //......Tamanho da fonte
    color: COLORS.text,                   //......Cor do texto
    fontWeight: '500',                    //......Peso da fonte
  },

  // Botao primario
  primaryButton: {
    backgroundColor: COLORS.primary,      //......Fundo azul
    borderColor: COLORS.primary,          //......Borda azul
  },

  // Texto primario
  primaryText: {
    color: COLORS.white,                  //......Cor branca
  },
});

// ========================================
// Export
// ========================================
export default LolaQuickActions;
