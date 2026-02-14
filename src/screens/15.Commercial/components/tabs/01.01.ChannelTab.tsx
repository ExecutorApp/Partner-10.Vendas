// ========================================
// Componente ChannelTab
// Tab do canal de entrada
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React from 'react';            //......React core
import {                              //......Componentes RN
  View,                               //......Container basico
  StyleSheet,                         //......Estilos
} from 'react-native';                //......Biblioteca RN

// ========================================
// Imports de Componentes
// ========================================
import ChannelOverview from '../channel/06.05.ChannelOverview';

// ========================================
// Constantes de Cores
// ========================================
const COLORS = {
  background: '#F4F4F4',              //......Fundo cinza
};

// ========================================
// Componente ChannelTab
// ========================================
const ChannelTab: React.FC = () => {
  // ========================================
  // Render
  // ========================================
  return (
    <View style={styles.container}>
      <ChannelOverview />
    </View>
  );
};

// ========================================
// Export Default
// ========================================
export default ChannelTab;

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1,                          //......Ocupar todo espaco
    backgroundColor: COLORS.background, //....Fundo cinza
  },
});
