// ========================================
// Componente DashboardTab
// Tab do dashboard com metricas
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
import DashboardOverview from '../dashboard/05.01.DashboardOverview';

// ========================================
// Constantes de Cores
// ========================================
const COLORS = {
  background: '#F4F4F4',              //......Fundo cinza
};

// ========================================
// Componente DashboardTab
// ========================================
const DashboardTab: React.FC = () => {
  // ========================================
  // Render
  // ========================================
  return (
    <View style={styles.container}>
      <DashboardOverview />
    </View>
  );
};

// ========================================
// Export Default
// ========================================
export default DashboardTab;

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
