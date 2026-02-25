// React e React Native
import { useState, useCallback, useMemo } from 'react';

// Tipos e dados de antecipacao
import { Receivable, MOCK_RECEIVABLES, ANTICIPATION_RATE, calculateGrossAmount, calculateTotalDiscount, calculateNetAmount, calculateAverageTerm } from './18.AnticipateData';

// Tipos e dados do resgate (reutilizados para conta destino)
import { TransferMethod, PixKeyType, NewAccountFormData, SavedBankAccount, INITIAL_NEW_ACCOUNT, BRAZIL_BANKS, validatePixKey, validateDocument, getBankShortName } from './11.WithdrawData';

// Hook de gerenciamento do formulario de antecipacao
// Encapsula selecao de recebiveis, simulador e conta destino
const useAnticipateForm = () => {
  // Lista de recebiveis disponiveis
  const receivables = MOCK_RECEIVABLES; //..Dados mock

  // Estado da selecao de recebiveis
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set()); //..IDs selecionados

  // Estado da lista de contas salvas
  const [savedAccounts, setSavedAccounts] = useState<SavedBankAccount[]>([]); //..Contas salvas (vazio inicial)

  // Estado da conta destino
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null); //..Conta selecionada
  const [showNewForm, setShowNewForm] = useState(false); //..Exibir formulario nova conta

  // Estado do formulario de nova conta
  const [transferMethod, setTransferMethod] = useState<TransferMethod>('pix'); //..Metodo de transferencia
  const [newAccountData, setNewAccountData] = useState<NewAccountFormData>(INITIAL_NEW_ACCOUNT); //..Dados do formulario

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
      bankName: newAccountData.nickname || getBankShortName(bankInfo?.name || '') || 'Conta Pix', //..Nome curto da conta
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

    // Atualiza lista de contas
    setSavedAccounts(prev => {
      let updated = [...prev]; //..Copia lista
      if (newAccount.isDefault) {
        updated = updated.map(a => ({ ...a, isDefault: false })); //..Desmarca todas
      }
      return [...updated, newAccount]; //..Adiciona nova conta
    });

    // Seleciona nova conta e fecha formulario
    setSelectedAccountId(newId); //..............Seleciona nova
    setShowNewForm(false); //....................Fecha modal
    setNewAccountData(INITIAL_NEW_ACCOUNT); //..Reseta formulario
    setTransferMethod('pix'); //................Reseta metodo

    return newId; //..Retorna ID da nova conta
  }, [newAccountData]);

  // Handler de atualizar conta existente
  // Recebe ID da conta e dados atualizados de todas as abas
  const handleUpdateAccount = useCallback((id: string, updatedData: NewAccountFormData) => {
    const bankInfo = BRAZIL_BANKS.find(b => b.code === updatedData.bankCode); //..Busca banco

    setSavedAccounts(prev => prev.map(account => {
      // Desmarca padrao das outras contas se nova e padrao
      if (account.id !== id) {
        if (updatedData.isDefault) return { ...account, isDefault: false }; //..Desmarca
        return account; //..Sem alteracao
      }

      // Atualiza conta com todos os campos
      return {
        ...account, //..............................Preserva campos base
        bankName: updatedData.nickname || getBankShortName(bankInfo?.name || '') || account.bankName, //..Nome curto
        bankCode: updatedData.bankCode || account.bankCode, //..Codigo banco
        agency: updatedData.agency || account.agency, //........Agencia
        account: updatedData.account || account.account, //......Conta
        accountType: updatedData.accountType, //................Tipo conta
        pixKeyType: updatedData.pixKeyType, //..................Tipo chave Pix
        pixKey: updatedData.pixKey, //..........................Valor chave Pix
        document: updatedData.document || account.document, //..CPF ou CNPJ
        isDefault: updatedData.isDefault, //....................Conta principal
      };
    }));
  }, []);

  // Handler de excluir conta salva
  const handleDeleteAccount = useCallback((id: string) => {
    setSavedAccounts(prev => prev.filter(a => a.id !== id)); //..Remove conta
    if (selectedAccountId === id) setSelectedAccountId(null); //..Desmarca se era a selecionada
  }, [selectedAccountId]);

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
