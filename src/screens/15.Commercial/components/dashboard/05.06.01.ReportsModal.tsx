// ========================================
// Componente ReportsModal
// Arquivo 01 - Modal de filtros e exportacao
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, {                       //......React core
  useCallback,                        //......Hook de callback
  useState,                           //......Hook de estado
} from 'react';                       //......Biblioteca React
import {                              //......Componentes RN
  View,                               //......Container basico
  Text,                               //......Texto
  TouchableOpacity,                   //......Botao tocavel
  Modal,                              //......Modal nativo
  ScrollView,                         //......Scroll
  useWindowDimensions,                //......Dimensoes
} from 'react-native';                //......Biblioteca RN
import Svg, {                         //......Componentes SVG
  Path,                               //......Path do SVG
} from 'react-native-svg';            //......Biblioteca SVG

// ========================================
// Imports de Tipos
// ========================================
import {
  DashboardFilters,                   //......Tipo filtros
  PeriodFilter,                       //......Tipo periodo
} from '../../types/commercial.types';

// ========================================
// Imports de Estilos
// ========================================
import { styles, COLORS, DESKTOP_BREAKPOINT } from './05.06.02.ReportsModalStyles';

// ========================================
// Icones SVG
// ========================================

// Icone de fechar
const CloseIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6l12 12"
      stroke={COLORS.textSecondary}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

// Icone de PDF
const PDFIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
      stroke={COLORS.danger}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M14 2v6h6M9 15h6M9 11h6" stroke={COLORS.danger} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

// Icone de Excel
const ExcelIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
      stroke={COLORS.success}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M14 2v6h6M8 13h2v4H8v-4zM14 13h2v4h-2v-4z" stroke={COLORS.success} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

// ========================================
// Opcoes de Periodo
// ========================================
const PERIOD_OPTIONS: { value: PeriodFilter; label: string }[] = [
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: 'Esta Semana' },
  { value: 'month', label: 'Este Mes' },
  { value: 'quarter', label: 'Este Trimestre' },
  { value: 'year', label: 'Este Ano' },
];

// ========================================
// Componentes Auxiliares
// ========================================

// Chip de Filtro
interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, selected, onPress }) => (
  <TouchableOpacity style={[styles.chip, selected && styles.chipSelected]} onPress={onPress}>
    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
  </TouchableOpacity>
);

// Botao de Exportacao
interface ExportButtonProps {
  format: 'pdf' | 'excel';
  onPress: () => void;
}

const ExportButton: React.FC<ExportButtonProps> = ({ format, onPress }) => (
  <TouchableOpacity
    style={[styles.exportButton, format === 'pdf' ? styles.exportButtonPDF : styles.exportButtonExcel]}
    onPress={onPress}
  >
    {format === 'pdf' ? <PDFIcon /> : <ExcelIcon />}
    <Text style={[styles.exportButtonText, format === 'pdf' ? styles.exportTextPDF : styles.exportTextExcel]}>
      {format === 'pdf' ? 'Exportar PDF' : 'Exportar Excel'}
    </Text>
  </TouchableOpacity>
);

// ========================================
// Interface de Props
// ========================================
interface ReportsModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: DashboardFilters) => void;
  onExport: (format: 'pdf' | 'excel') => void;
  currentFilters?: DashboardFilters;
}

// ========================================
// Componente ReportsModal
// ========================================
const ReportsModal: React.FC<ReportsModalProps> = ({
  visible,
  onClose,
  onApply,
  onExport,
  currentFilters,
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const isDesktop = screenWidth > DESKTOP_BREAKPOINT;

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>(currentFilters?.period || 'month');
  const [selectedBroker, setSelectedBroker] = useState<string | undefined>(currentFilters?.brokerId);
  const [selectedPhase, setSelectedPhase] = useState<string | undefined>(currentFilters?.phaseId);

  const handleClear = useCallback(() => {
    setSelectedPeriod('month');
    setSelectedBroker(undefined);
    setSelectedPhase(undefined);
  }, []);

  const handleApply = useCallback(() => {
    const filters: DashboardFilters = {
      period: selectedPeriod,
      brokerId: selectedBroker,
      phaseId: selectedPhase,
    };
    onApply(filters);
    onClose();
  }, [selectedPeriod, selectedBroker, selectedPhase, onApply, onClose]);

  const handleExport = useCallback((format: 'pdf' | 'excel') => {
    onExport(format);
  }, [onExport]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayBackground} activeOpacity={1} onPress={onClose} />
        <View style={[styles.modalContainer, isDesktop ? styles.modalDesktop : styles.modalMobile]}>
          {!isDesktop && <View style={styles.dragHandle} />}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filtros e Relatorios</Text>
            <TouchableOpacity onPress={onClose}><CloseIcon /></TouchableOpacity>
          </View>
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Periodo</Text>
              <View style={styles.chipsContainer}>
                {PERIOD_OPTIONS.map(option => (
                  <FilterChip key={option.value} label={option.label} selected={selectedPeriod === option.value} onPress={() => setSelectedPeriod(option.value)} />
                ))}
              </View>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Corretor</Text>
              <View style={styles.chipsContainer}>
                <FilterChip label="Todos" selected={!selectedBroker} onPress={() => setSelectedBroker(undefined)} />
                <FilterChip label="Carlos Silva" selected={selectedBroker === 'broker-1'} onPress={() => setSelectedBroker('broker-1')} />
                <FilterChip label="Ana Santos" selected={selectedBroker === 'broker-2'} onPress={() => setSelectedBroker('broker-2')} />
              </View>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Fase</Text>
              <View style={styles.chipsContainer}>
                <FilterChip label="Todas" selected={!selectedPhase} onPress={() => setSelectedPhase(undefined)} />
                <FilterChip label="Prospeccao" selected={selectedPhase === 'phase-1'} onPress={() => setSelectedPhase('phase-1')} />
                <FilterChip label="Qualificacao" selected={selectedPhase === 'phase-2'} onPress={() => setSelectedPhase('phase-2')} />
                <FilterChip label="Proposta" selected={selectedPhase === 'phase-3'} onPress={() => setSelectedPhase('phase-3')} />
              </View>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Exportar Relatorio</Text>
              <View style={styles.exportContainer}>
                <ExportButton format="pdf" onPress={() => handleExport('pdf')} />
                <ExportButton format="excel" onPress={() => handleExport('excel')} />
              </View>
            </View>
          </ScrollView>
          <View style={styles.footer}>
            <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
              <Text style={styles.clearButtonText}>Limpar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ========================================
// Export Default
// ========================================
export default ReportsModal;
