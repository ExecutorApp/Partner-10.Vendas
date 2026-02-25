// React e React Native
import { useState, useCallback, useMemo, useEffect } from 'react';

// Tipos e dados de antecipacao
import { Receivable, MOCK_RECEIVABLES, ANTICIPATION_RATE, calculateGrossAmount, calculateTotalDiscount, calculateNetAmount, calculateAverageTerm } from './18.AnticipateData';

// Tipos e dados do resgate (reutilizados para conta destino)
import { TransferMethod, PixKeyType, NewAccountFormData, SavedBankAccount, INITIAL_NEW_ACCOUNT, BRAZIL_BANKS, validatePixKey, validateDocument } from './11.WithdrawData';

// Contexto compartilhado de contas
import { useSharedAccounts } from './34.SharedAccountsContext';

// Hook de gerenciamento do formulario de antecipacao
// Encapsula selecao de recebiveis, simulador e conta destino
const useAnticipateForm = (anticipatedIds: Set<string> = new Set()) => {
  // Lista de recebiveis disponiveis (filtra recebiveis ja antecipados)
  const receivables = useMemo(() =>
    MOCK_RECEIVABLES.filter(r => !anticipatedIds.has(r.id)),
    [anticipatedIds]
  ); //..Dados filtrados

  // Estado da selecao de recebiveis
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set()); //..IDs selecionados

  // Contas salvas compartilhadas entre telas
  const { savedAccounts, addAccount, updateAccount: contextUpdateAccount, deleteAccount: contextDeleteAccount } = useSharedAccounts();

  // Estado da conta destino
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null); //..Conta selecionada
  const [showNewForm, setShowNewForm] = useState(false); //..Exibir formulario nova conta

  // Estado do formulario de nova conta
  const [transferMethod, setTransferMethod] = useState<TransferMethod>('pix'); //..Metodo de transferencia
  const [newAccountData, setNewAccountData] = useState<NewAccountFormData>(INITIAL_NEW_ACCOUNT); //..Dados do formulario

  // Limpa selecao de IDs que nao existem mais nos recebiveis
  useEffect(() => {
    setSelectedIds(prev => {
      const validIds = new Set<string>();
      prev.forEach(id => { if (receivables.some(r => r.id === id)) validIds.add(id); });
      return validIds.size === prev.size ? prev : validIds; //..So atualiza se mudou
    });
  }, [receivables]);

  // Handler de selecionar/deselecionar recebivel individual
  const handleToggleReceivable = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev); //..Copia set
      if (next.has(id)) next.delete(id); //..Remove se ja tem
      else next.add(id); //..Adiciona se nao tem
      return next; //..Retorna atualizado
    });
  }, []);

  // Handler de selecionar todas
  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(receivables.map(r => r.id))); //..Seleciona todos os IDs
  }, [receivables]);

  // Handler de desmarcar todas
  const handleDeselectAll = useCallback(() => {
    setSelectedIds(new Set()); //..Limpa selecao
  }, []);

  // Computed: todas selecionadas
  const isAllSelected = selectedIds.size === receivables.length && receivables.length > 0; //..Booleano

  // Computed: tem selecao
  const hasSelection = selectedIds.size > 0; //..Booleano

  // Recebiveis selecionados (filtrados)
  const selectedReceivables = useMemo(() => {
    return receivables.filter(r => selectedIds.has(r.id)); //..Filtra selecionados
  }, [receivables, selectedIds]);

  // Computed: valores do simulador
  const grossAmount = useMemo(() => calculateGrossAmount(selectedReceivables), [selectedReceivables]); //..Soma bruta
  const totalDiscount = useMemo(() => calculateTotalDiscount(selectedReceivables, ANTICIPATION_RATE), [selectedReceivables]); //..Desconto total
  const netAmount = useMemo(() => calculateNetAmount(selectedReceivables, ANTICIPATION_RATE), [selectedReceivables]); //..Valor liquido
  const averageTerm = useMemo(() => calculateAverageTerm(selectedReceivables), [selectedReceivables]); //..Prazo medio

  // Handler de selecionar conta salva
  const handleSelectAccount = useCallback((id: string) => {
    setSelectedAccountId(id); //..Define conta
    setShowNewForm(false); //......Esconde formulario
  }, []);

  // Handler de alternar formulario de nova conta
  const handleToggleNewForm = useCallback(() => {
    setShowNewForm(prev => !prev); //..Alterna visibilidade
    setSelectedAccountId(null); //......Desmarca conta salva
  }, []);

  // Handler de trocar metodo de transferencia
  const handleTransferMethodChange = useCallback((method: TransferMethod) => {
    setTransferMethod(method); //..Define metodo
  }, []);

  // Handler de atualizar campo do formulario
  const handleNewAccountChange = useCallback((field: keyof NewAccountFormData, value: string | boolean | PixKeyType) => {
    setNewAccountData(prev => ({ ...prev, [field]: value })); //..Atualiza campo
  }, []);

  // Handler de confirmar cadastro de nova conta
  // Salva TODOS os campos de todas as abas (Pix, Transferencia, Extras)
  const handleConfirmNewAccount = useCallback((): string => {
    const newId = Date.now().toString(); //..Identificador unico
    const bankInfo = BRAZIL_BANKS.find(b => b.code === newAccountData.bankCode); //..Busca banco

    // Monta nova conta salva com todos os campos
    const newAccount: SavedBankAccount = {
      id: newId, //..................................Identificador unico
      bankName: newAccountData.nickname || bankInfo?.name || (newAccountData.pixKey ? 'Pix' : 'Banco'), //..Nome do banco ou Pix
      bankCode: newAccountData.bankCode, //..........Codigo do banco
      holderName: '', //.............................Titular vazio
      agency: newAccountData.agency, //..............Agencia
      account: newAccountData.account, //............Conta
      accountType: newAccountData.accountType, //....Tipo da conta
      pixKeyType: newAccountData.pixKeyType, //......Tipo chave Pix
      pixKey: newAccountData.pixKey, //..............Valor chave Pix
      document: newAccountData.document, //..........CPF ou CNPJ
      isDefault: newAccountData.isDefault, //.......Conta principal
    };

    // Adiciona ao contexto compartilhado
    addAccount(newAccount);

    // Seleciona nova conta e fecha formulario
    setSelectedAccountId(newId); //..............Seleciona nova
    setShowNewForm(false); //....................Fecha modal
    setNewAccountData(INITIAL_NEW_ACCOUNT); //..Reseta formulario
    setTransferMethod('pix'); //................Reseta metodo

    return newId; //..Retorna ID da nova conta
  }, [newAccountData, addAccount]);

  // Handler de atualizar conta existente
  // Delega ao contexto compartilhado
  const handleUpdateAccount = useCallback((id: string, updatedData: NewAccountFormData) => {
    contextUpdateAccount(id, updatedData);
  }, [contextUpdateAccount]);

  // Handler de excluir conta salva
  // Delega ao contexto compartilhado
  const handleDeleteAccount = useCallback((id: string) => {
    contextDeleteAccount(id);
    if (selectedAccountId === id) setSelectedAccountId(null); //..Desmarca se era a selecionada
  }, [selectedAccountId, contextDeleteAccount]);

  // Validacao do formulario de nova conta via Pix
  const isPixFormValid = transferMethod === 'pix'
    && newAccountData.pixKey.length > 3
    && !validatePixKey(newAccountData.pixKey, newAccountData.pixKeyType); //..Pix preenchido e valido

  // Validacao do formulario de nova conta via transferencia
  const isTransferFormValid = transferMethod === 'transfer'
    && newAccountData.bankCode !== ''
    && newAccountData.agency.length >= 3
    && newAccountData.account.length >= 4
    && newAccountData.document.length >= 11
    && !validateDocument(newAccountData.document); //..Campos preenchidos e validos

  // Nova conta valida
  const isNewAccountValid = showNewForm && (isPixFormValid || isTransferFormValid); //..Formulario ok

  // Formulario completo valido
  const isFormValid = hasSelection && (selectedAccountId !== null || isNewAccountValid); //..Tudo preenchido

  return {
    receivables,
    selectedIds,
    handleToggleReceivable,
    handleSelectAll,
    handleDeselectAll,
    isAllSelected,
    hasSelection,
    grossAmount,
    totalDiscount,
    netAmount,
    averageTerm,
    savedAccounts,
    selectedAccountId,
    handleSelectAccount,
    showNewForm,
    handleToggleNewForm,
    transferMethod,
    handleTransferMethodChange,
    newAccountData,
    handleNewAccountChange,
    handleConfirmNewAccount,
    handleUpdateAccount,
    handleDeleteAccount,
    isFormValid,
  };
};

// Export padrao
export default useAnticipateForm;
