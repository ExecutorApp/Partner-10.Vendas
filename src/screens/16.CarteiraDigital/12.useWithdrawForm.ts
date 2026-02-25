// React e React Native
import { useState, useCallback } from 'react';

// Tipos e dados
import { TransferMethod, PixKeyType, NewAccountFormData, SavedBankAccount, INITIAL_NEW_ACCOUNT, MIN_WITHDRAW_AMOUNT, BRAZIL_BANKS, formatCurrencyInput, validatePixKey, validateDocument } from './11.WithdrawData';

// Contexto compartilhado de contas
import { useSharedAccounts } from './34.SharedAccountsContext';

// Hook de gerenciamento do formulario de resgate
// Encapsula valor, conta destino, validacoes e formulario de nova conta
const useWithdrawForm = (availableBalance: number) => {
  // Estado do valor de resgate
  const [rawInput, setRawInput] = useState(''); //..Input bruto do usuario
  const [amount, setAmount] = useState(0); //..........Valor em reais

  // Contas salvas compartilhadas entre telas
  const { savedAccounts, addAccount, updateAccount: contextUpdateAccount, deleteAccount: contextDeleteAccount } = useSharedAccounts();

  // Estado da conta destino
  const defaultAccount = savedAccounts.find(a => a.isDefault); //..Conta padrao
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(defaultAccount?.id ?? null); //..Conta selecionada
  const [showNewForm, setShowNewForm] = useState(false); //..Exibir formulario nova conta

  // Estado do formulario de nova conta
  const [transferMethod, setTransferMethod] = useState<TransferMethod>('pix'); //..Metodo de transferencia
  const [newAccountData, setNewAccountData] = useState<NewAccountFormData>(INITIAL_NEW_ACCOUNT); //..Dados do formulario

  // Handler de input monetario
  // Converte digitos em valor formatado em centavos
  const handleValueChange = useCallback((text: string) => {
    const digits = text.replace(/\D/g, ''); //..Remove nao digitos
    const value = parseInt(digits || '0', 10) / 100; //..Converte centavos
    setAmount(value); //..Atualiza valor
    setRawInput(value > 0 ? formatCurrencyInput(value) : ''); //..Atualiza display
  }, []);

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
  // Apenas alterna o metodo sem resetar dados (campos sao independentes)
  const handleTransferMethodChange = useCallback((method: TransferMethod) => {
    setTransferMethod(method); //..Define metodo
  }, []);

  // Handler de atualizar campo do formulario
  const handleNewAccountChange = useCallback((field: keyof NewAccountFormData, value: string | boolean | PixKeyType) => {
    setNewAccountData(prev => ({ ...prev, [field]: value })); //..Atualiza campo
  }, []);

  // Handler de confirmar cadastro de nova conta
  // Cria SavedBankAccount a partir dos dados do formulario e retorna o ID
  const handleConfirmNewAccount = useCallback((): string => {
    const newId = Date.now().toString(); //..Identificador unico
    const bankInfo = BRAZIL_BANKS.find(b => b.code === newAccountData.bankCode); //..Busca banco

    // Monta nova conta salva
    const newAccount: SavedBankAccount = {
      id: newId, //..Identificador unico
      bankName: bankInfo?.name || (newAccountData.pixKey ? 'Pix' : 'Banco'), //..Nome do banco ou Pix
      bankCode: newAccountData.bankCode, //......Codigo do banco
      holderName: '', //...........................Titular vazio
      agency: newAccountData.agency, //............Agencia
      account: newAccountData.account, //..........Conta
      accountType: newAccountData.accountType, //..Tipo da conta
      document: newAccountData.document, //........CPF ou CNPJ
      isDefault: newAccountData.isDefault, //.......Conta principal
    };

    // Adiciona dados Pix (sempre, pois ambas as abas sao obrigatorias)
    newAccount.pixKeyType = newAccountData.pixKeyType; //..Tipo chave Pix
    newAccount.pixKey = newAccountData.pixKey; //..........Valor chave Pix

    // Usa apelido como nome se informado (sobrescreve nome do banco)
    if (newAccountData.nickname) {
      newAccount.bankName = newAccountData.nickname; //..Apelido da conta
    }

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

  // Erro de validacao do valor
  const valueError = amount > 0 && amount < MIN_WITHDRAW_AMOUNT
    ? 'belowMinimum' as const
    : amount > availableBalance
      ? 'aboveBalance' as const
      : null; //..Sem erro

  // Validacao da aba Pix (sempre obrigatoria)
  const isPixFormValid = newAccountData.pixKey.length > 3
    && !validatePixKey(newAccountData.pixKey, newAccountData.pixKeyType); //..Pix preenchido e valido

  // Validacao da aba Transferencia (sempre obrigatoria)
  const isTransferFormValid = newAccountData.bankCode !== ''
    && newAccountData.agency.length >= 3
    && newAccountData.account.length >= 4
    && newAccountData.document.length >= 11
    && !validateDocument(newAccountData.document); //..Campos preenchidos e validos

  // Nova conta valida (ambas as abas devem estar preenchidas)
  const isNewAccountValid = showNewForm && isPixFormValid && isTransferFormValid; //..Formulario ok

  // Formulario completo valido
  const isFormValid = amount >= MIN_WITHDRAW_AMOUNT
    && amount <= availableBalance
    && !valueError
    && (selectedAccountId !== null || isNewAccountValid); //..Tudo preenchido

  return {
    rawInput,
    amount,
    handleValueChange,
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
    valueError,
    isFormValid,
  };
};

// Export padrao
export default useWithdrawForm;
