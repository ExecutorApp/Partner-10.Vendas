import { StyleSheet, PixelRatio } from 'react-native';

export const Colors = {
  // Cores principais
  primary: '#021632',
  background: '#FCFCFC',
  
  // Cor de destaque (Botões de ações)
  accent: '#1777CF',
  
  // Cores de texto
  textPrimary: '#3A3F51',
  textSecondary: '#7D8592',
  textPlaceholder: '#91929E',
  
  // Estados
  hover: '#1777CF', // Opacidade 80% será aplicada via StyleSheet
  active: '#1777CF',
  border: '#D8E0F0', 
  
  // Cores específicas do Figma
  logoText: '#111B31',
  subtitle: '#4B4B4B',
};

export const Typography = {
  // Família de fontes
  fontFamily: {
    inter: 'Inter_400Regular',
    interBold: 'Inter_700Bold',
    interSemiBold: 'Inter_600SemiBold',
    interMedium: 'Inter_500Medium',
    dmSans: 'DMSans_400Regular',
    dmSansBold: 'DMSans_700Bold',
    comfortaa: 'Comfortaa_400Regular',
  },
  
  // Escala tipográfica
  fontSize: {
    h1: 40,      // 2.5rem - Títulos principais
    h2: 32,      // 2rem - Subtítulos e seções
    h3: 24,      // 1.5rem - Títulos de bloco
    h4: 20,      // 1.25rem - Cabeçalhos menores
    body: 16,    // 1rem - Texto padrão
    small: 14,   // 0.875rem - Textos secundários
    caption: 12, // 0.75rem - Mensagens e rótulos
    
    // Tamanhos específicos do Figma
    logoTitle: 64,
    logoSubtitle: 12,
  },
  
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  
  // Espaçamentos específicos do Figma
  logoGap: 25,
  logoPadding: 61,
  containerPadding: 10,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  circle: 99,
};

export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
};

export const Layout = {
  // Dimensões específicas do Figma
  logoSize: 160,
  topBarHeight: 36,
  screenWidth: 417,
  screenHeight: 812,
  // Altura do menu inferior fixo (curva + conteúdo + botão central)
  bottomMenuHeight: 110,
  
  // Touch targets mínimos
  minTouchTarget: 44,
};

export const Borders = {
  width: (px?: number) => {
    const scale = PixelRatio.get();
    const requested = typeof px === 'number' && px >= 0 ? px / scale : StyleSheet.hairlineWidth;
    return requested;
  },
};
