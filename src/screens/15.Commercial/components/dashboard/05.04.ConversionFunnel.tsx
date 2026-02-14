// ========================================
// Componente ConversionFunnel
// Funil de conversao visual
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, {                       //......React core
  useMemo,                            //......Hook de memorizacao
} from 'react';                       //......Biblioteca React
import {                              //......Componentes RN
  View,                               //......Container basico
  Text,                               //......Texto
  StyleSheet,                         //......Estilos
  useWindowDimensions,                //......Dimensoes
} from 'react-native';                //......Biblioteca RN
import Svg, {                         //......Componentes SVG
  Path,                               //......Path do SVG
  G,                                  //......Grupo SVG
} from 'react-native-svg';            //......Biblioteca SVG

// ========================================
// Imports de Tipos
// ========================================
import { FunnelData } from '../../types/commercial.types';

// ========================================
// Constantes de Cores
// ========================================
const COLORS = {
  primary: '#1777CF',                 //......Azul principal
  background: '#FCFCFC',              //......Fundo branco
  textPrimary: '#3A3F51',             //......Texto principal
  textSecondary: '#7D8592',           //......Texto secundario
  border: '#D8E0F0',                  //......Borda
  success: '#22C55E',                 //......Verde
};

// Cores do funil (progressivas)
const FUNNEL_COLORS = [
  '#E3F2FD',                          //......Azul claro
  '#90CAF9',                          //......Azul medio-claro
  '#42A5F5',                          //......Azul medio
  '#1E88E5',                          //......Azul medio-escuro
  '#1565C0',                          //......Azul escuro
];

// ========================================
// Constantes de Layout
// ========================================
const FUNNEL_HEIGHT = 200;            //......Altura do funil
const FUNNEL_PADDING = 16;            //......Padding do funil
const MIN_WIDTH_PERCENT = 0.3;        //......Largura minima

// ========================================
// Interface de Props
// ========================================
interface ConversionFunnelProps {
  data: FunnelData[];                 //......Dados do funil
  showPercentages?: boolean;          //......Mostrar porcentagens
  title?: string;                     //......Titulo do grafico
}

// ========================================
// Componente ConversionFunnel
// ========================================
const ConversionFunnel: React.FC<ConversionFunnelProps> = ({
  data,                               //......Dados do funil
  showPercentages = true,             //......Mostrar porcentagens
  title = 'Funil de Conversao',       //......Titulo padrao
}) => {
  // ========================================
  // Dimensoes
  // ========================================
  const { width: screenWidth } = useWindowDimensions();
  const funnelWidth = Math.min(screenWidth - 64, 400);

  // ========================================
  // Dados Normalizados
  // ========================================
  const normalizedData = useMemo(() => {
    if (data.length === 0) return [];

    const maxLeads = data[0]?.leadsCount || 1;

    return data.map((item, index) => {
      const widthPercent = Math.max(
        item.leadsCount / maxLeads,
        MIN_WIDTH_PERCENT,
      );
      const color = FUNNEL_COLORS[index % FUNNEL_COLORS.length];

      return {
        ...item,
        widthPercent,                 //......Porcentagem da largura
        color,                        //......Cor da secao
      };
    });
  }, [data]);

  // ========================================
  // Gerar Path do Funil
  // ========================================
  const funnelPaths = useMemo(() => {
    if (normalizedData.length === 0) return [];

    const sectionHeight = FUNNEL_HEIGHT / normalizedData.length;
    const paths: Array<{
      path: string;
      color: string;
      data: typeof normalizedData[0];
      y: number;
    }> = [];

    normalizedData.forEach((item, index) => {
      const topWidth = index === 0
        ? funnelWidth
        : normalizedData[index - 1].widthPercent * funnelWidth;
      const bottomWidth = item.widthPercent * funnelWidth;

      const topLeft = (funnelWidth - topWidth) / 2;
      const topRight = topLeft + topWidth;
      const bottomLeft = (funnelWidth - bottomWidth) / 2;
      const bottomRight = bottomLeft + bottomWidth;

      const y = index * sectionHeight;

      const path = `
        M ${topLeft} ${y}
        L ${topRight} ${y}
        L ${bottomRight} ${y + sectionHeight}
        L ${bottomLeft} ${y + sectionHeight}
        Z
      `;

      paths.push({
        path,                         //......Path SVG
        color: item.color,            //......Cor
        data: item,                   //......Dados
        y: y + sectionHeight / 2,     //......Centro Y
      });
    });

    return paths;
  }, [normalizedData, funnelWidth]);

  // ========================================
  // Total de Leads
  // ========================================
  const totalLeads = useMemo(() => {
    return data[0]?.leadsCount || 0;
  }, [data]);

  // ========================================
  // Empty State
  // ========================================
  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            Nenhum dado disponivel
          </Text>
        </View>
      </View>
    );
  }

  // ========================================
  // Render
  // ========================================
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>
          {totalLeads} leads no topo
        </Text>
      </View>

      {/* Funil SVG */}
      <View style={styles.funnelContainer}>
        <Svg
          width={funnelWidth}
          height={FUNNEL_HEIGHT}
          viewBox={`0 0 ${funnelWidth} ${FUNNEL_HEIGHT}`}
        >
          <G>
            {funnelPaths.map((section, index) => (
              <Path
                key={index}
                d={section.path}
                fill={section.color}
                stroke={COLORS.background}
                strokeWidth={2}
              />
            ))}
          </G>
        </Svg>

        {/* Labels sobre o funil */}
        <View style={[styles.labelsOverlay, { width: funnelWidth }]}>
          {normalizedData.map((item, index) => {
            const sectionHeight = FUNNEL_HEIGHT / normalizedData.length;
            const topY = index * sectionHeight;

            return (
              <View
                key={item.phaseId}
                style={[
                  styles.labelContainer,
                  {
                    top: topY,
                    height: sectionHeight,
                  },
                ]}
              >
                <Text style={styles.labelName} numberOfLines={1}>
                  {item.phaseName}
                </Text>
                <Text style={styles.labelCount}>
                  {item.leadsCount}
                </Text>
                {showPercentages && (
                  <Text style={styles.labelPercent}>
                    {item.conversionRate.toFixed(1)}%
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* Legenda Lateral */}
      <View style={styles.legend}>
        {normalizedData.map((item, index) => (
          <View key={item.phaseId} style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: item.color }]}
            />
            <View style={styles.legendInfo}>
              <Text style={styles.legendName}>{item.phaseName}</Text>
              <Text style={styles.legendStats}>
                {item.leadsCount} leads | {item.averageTime} dias
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

// ========================================
// Export Default
// ========================================
export default ConversionFunnel;

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container principal
  container: {
    backgroundColor: COLORS.background, //....Fundo branco
    borderRadius: 12,                 //......Arredondamento
    borderWidth: 1,                   //......Largura borda
    borderColor: COLORS.border,       //......Cor borda
    padding: 16,                      //......Espaco interno
  },

  // Header
  header: {
    flexDirection: 'row',             //......Layout horizontal
    justifyContent: 'space-between',  //......Espaco entre
    alignItems: 'center',             //......Centralizar vertical
    marginBottom: 16,                 //......Margem inferior
  },

  // Titulo
  title: {
    fontSize: 16,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.textPrimary,        //......Cor primaria
  },

  // Subtitulo
  subtitle: {
    fontSize: 12,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
  },

  // Container do funil
  funnelContainer: {
    alignItems: 'center',             //......Centralizar horizontal
    position: 'relative',             //......Posicao relativa
  },

  // Overlay de labels
  labelsOverlay: {
    position: 'absolute',             //......Posicao absoluta
    top: 0,                           //......Topo
    left: 0,                          //......Esquerda
    height: FUNNEL_HEIGHT,            //......Altura
  },

  // Container do label
  labelContainer: {
    position: 'absolute',             //......Posicao absoluta
    left: 0,                          //......Esquerda
    right: 0,                         //......Direita
    justifyContent: 'center',         //......Centralizar vertical
    alignItems: 'center',             //......Centralizar horizontal
    paddingHorizontal: 8,             //......Espaco horizontal
  },

  // Nome do label
  labelName: {
    fontSize: 12,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.textPrimary,        //......Cor primaria
    textAlign: 'center',              //......Alinhado centro
  },

  // Contagem do label
  labelCount: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_700Bold',      //......Fonte Inter Bold
    color: COLORS.textPrimary,        //......Cor primaria
  },

  // Porcentagem do label
  labelPercent: {
    fontSize: 10,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
  },

  // Legenda
  legend: {
    marginTop: 16,                    //......Margem superior
    paddingTop: 16,                   //......Espaco superior
    borderTopWidth: 1,                //......Borda superior
    borderTopColor: COLORS.border,    //......Cor da borda
    gap: 8,                           //......Espaco entre
  },

  // Item da legenda
  legendItem: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    gap: 12,                          //......Espaco entre
  },

  // Ponto da legenda
  legendDot: {
    width: 12,                        //......Largura
    height: 12,                       //......Altura
    borderRadius: 6,                  //......Arredondamento
  },

  // Info da legenda
  legendInfo: {
    flex: 1,                          //......Ocupar espaco
  },

  // Nome na legenda
  legendName: {
    fontSize: 13,                     //......Tamanho fonte
    fontFamily: 'Inter_500Medium',    //......Fonte Inter Medium
    color: COLORS.textPrimary,        //......Cor primaria
  },

  // Stats na legenda
  legendStats: {
    fontSize: 11,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
  },

  // Estado vazio
  emptyState: {
    alignItems: 'center',             //......Centralizar horizontal
    justifyContent: 'center',         //......Centralizar vertical
    paddingVertical: 40,              //......Espaco vertical
  },

  // Texto estado vazio
  emptyText: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
  },
});
