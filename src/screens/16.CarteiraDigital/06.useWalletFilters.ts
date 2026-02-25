// React e React Native
import { useState } from 'react';

// Tipos e dados
import { DateFilter, DATE_FILTER_LABELS, formatShortDate } from './03.WalletData';

// Hook de gerenciamento de filtros da carteira
// Encapsula estados e handlers de filtro de data
const useWalletFilters = () => {
  // Estados do filtro de data
  const [showFilterModal, setShowFilterModal] = useState(false); //..Modal de filtro visivel
  const [dateFilter, setDateFilter] = useState<DateFilter>('all'); //..Filtro ativo
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null); //..Data inicio
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null); //..Data fim
  const [showDatePicker, setShowDatePicker] = useState(false); //..Modal de selecao de data
  const [datePickerTarget, setDatePickerTarget] = useState<'start' | 'end'>('start'); //..Alvo do picker

  // Handler de selecao de filtro rapido
  const handleFilterSelect = (filter: DateFilter) => {
    setDateFilter(filter); //..Define filtro
    setCustomStartDate(null); //..Zera data inicio
    setCustomEndDate(null); //....Zera data fim
    if (filter !== 'custom') setShowFilterModal(false); //..Fecha modal se nao for custom
  };

  // Handler de selecao de data no picker
  const handleDateSelect = (date: Date) => {
    if (datePickerTarget === 'start') {
      setCustomStartDate(date); //..Define data inicio
    } else {
      setCustomEndDate(date); //..Define data fim
    }
    setShowDatePicker(false); //..Fecha picker
    setShowFilterModal(true); //..Reabre modal de filtro
  };

  // Handler de aplicar periodo personalizado
  const handleApplyCustom = () => {
    setDateFilter('custom'); //..Define filtro custom
    setShowFilterModal(false); //..Fecha modal ao aplicar
  };

  // Handler de abrir modal de filtro
  const handleOpenFilterModal = () => {
    setShowFilterModal(true); //..Abre modal
  };

  // Handler de fechar modal de filtro zerando datas
  const handleCloseFilterModal = () => {
    setShowFilterModal(false); //..Fecha modal
    setCustomStartDate(null); //..Zera data inicio
    setCustomEndDate(null); //....Zera data fim
  };

  // Handler de abrir picker de data inicio
  const handleStartDatePress = () => {
    setShowFilterModal(false); //..Fecha modal de filtro
    setDatePickerTarget('start'); //..Define alvo inicio
    setShowDatePicker(true); //..Abre picker
  };

  // Handler de abrir picker de data fim
  const handleEndDatePress = () => {
    setShowFilterModal(false); //..Fecha modal de filtro
    setDatePickerTarget('end'); //..Define alvo fim
    setShowDatePicker(true); //..Abre picker
  };

  // Handler de fechar picker reabrir modal
  const handleCloseDatePicker = () => {
    setShowDatePicker(false); //..Fecha picker
    setShowFilterModal(true); //..Reabre modal de filtro
  };

  // Filtro de data ativo
  const isFilterActive = dateFilter !== 'all'; //..Verifica se tem filtro ativo

  // Label do chip de filtro
  const filterChipLabel = dateFilter === 'custom' && customStartDate && customEndDate
    ? `${formatShortDate(customStartDate)} - ${formatShortDate(customEndDate)}`
    : DATE_FILTER_LABELS[dateFilter]; //..Label dinamica

  // Botao aplicar desabilitado quando nao tem ambas as datas
  const isApplyDisabled = !customStartDate || !customEndDate; //..Validacao

  // Data selecionada no picker
  const selectedPickerDate = datePickerTarget === 'start' ? customStartDate : customEndDate; //..Data conforme alvo

  // Data minima no picker
  const minPickerDate = datePickerTarget === 'end' ? customStartDate : null; //..Minima conforme alvo

  // Titulo do picker
  const pickerTitle = datePickerTarget === 'start' ? 'Data inicial' : 'Data final'; //..Titulo conforme alvo

  return {
    showFilterModal,
    dateFilter,
    customStartDate,
    customEndDate,
    showDatePicker,
    handleFilterSelect,
    handleDateSelect,
    handleApplyCustom,
    handleOpenFilterModal,
    handleCloseFilterModal,
    handleStartDatePress,
    handleEndDatePress,
    handleCloseDatePicker,
    isFilterActive,
    filterChipLabel,
    isApplyDisabled,
    selectedPickerDate,
    minPickerDate,
    pickerTitle,
  };
};

// Export padrao
export default useWalletFilters;
