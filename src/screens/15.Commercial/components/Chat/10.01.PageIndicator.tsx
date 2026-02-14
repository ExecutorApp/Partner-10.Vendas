// ========================================
// Componente: Indicador de Pagina
// Dois pontos para Lead e Lola
// ========================================

// ========================================
// Imports
// ========================================
import React from 'react';                //......React
import {
  View,                                   //......Container
  StyleSheet,                             //......Estilos
} from 'react-native';

// ========================================
// Tipos
// ========================================

// Props do componente
interface PageIndicatorProps {
  activePage: 'lead' | 'lola';            //......Pagina ativa
}

// ========================================
// Cores
// ========================================
const COLORS = {
  active: '#1777CF',                      //......Azul ativo
  inactive: '#E0E0E0',                    //......Cinza inativo
};

// ========================================
// Componente
// ========================================
const PageIndicator: React.FC<PageIndicatorProps> = ({ activePage }) => {
  return (
    <View style={styles.container}>
      {/* Ponto Lead */}
      <View
        style={[
          styles.dot,
          activePage === 'lead' ? styles.activeDot : styles.inactiveDot,
        ]}
      />

      {/* Ponto Lola */}
      <View
        style={[
          styles.dot,
          activePage === 'lola' ? styles.activeDot : styles.inactiveDot,
        ]}
      />
    </View>
  );
};

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container dos pontos
  container: {
    flexDirection: 'row',                 //......Layout horizontal
    justifyContent: 'center',             //......Centraliza
    alignItems: 'center',                 //......Alinha centro
    gap: 8,                               //......Espaco entre pontos
    paddingVertical: 8,                   //......Padding vertical
  },

  // Estilo base do ponto
  dot: {
    width: 8,                             //......Largura
    height: 8,                            //......Altura
    borderRadius: 4,                      //......Arredondamento
  },

  // Ponto ativo
  activeDot: {
    backgroundColor: COLORS.active,       //......Cor azul
  },

  // Ponto inativo
  inactiveDot: {
    backgroundColor: COLORS.inactive,     //......Cor cinza
  },
});

// ========================================
// Export
// ========================================
export default PageIndicator;
