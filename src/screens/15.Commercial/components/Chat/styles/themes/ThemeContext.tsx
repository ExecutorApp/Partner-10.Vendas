// ========================================
// ThemeContext
// Contexto React para fornecer cores do chat
// ========================================

// ========================================
// Imports React
// ========================================
import React, { createContext, useContext, useMemo, ReactNode } from 'react';

// ========================================
// Imports de Cores
// ========================================
import { ThemeColors, ChatColors } from './ThemeColors';

// ========================================
// Interface do Contexto
// ========================================
interface ThemeContextType {
  colors: ThemeColors;                    //......Paleta de cores do chat
}

// ========================================
// Criar Contexto
// ========================================
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ========================================
// Interface Props do Provider
// ========================================
interface ThemeProviderProps {
  children: ReactNode;                    //......Componentes filhos
}

// ========================================
// ThemeProvider
// Componente que fornece o contexto de cores
// ========================================
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // ========================================
  // Valor do contexto
  // ========================================
  const value = useMemo(() => ({
    colors: ChatColors,                   //......Paleta unica de cores
  }), []);

  // ========================================
  // Render
  // ========================================
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// ========================================
// Hook useTheme
// Hook para acessar as cores do chat
// ========================================
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// ========================================
// Export Default
// ========================================
export default ThemeContext;
