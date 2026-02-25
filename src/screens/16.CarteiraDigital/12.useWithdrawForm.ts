// React e React Native
import { useState, useCallback } from 'react';

// Tipos e dados
import { TransferMethod, PixKeyType, NewAccountFormData, SavedBankAccount, INITIAL_NEW_ACCOUNT, MIN_WITHDRAW_AMOUNT, MOCK_SAVED_ACCOUNTS, BRAZIL_BANKS, formatCurrencyInput, validatePixKey, validateDocument } from './11.WithdrawData';

// Hook de gerenciamento do formulario de resgate
// Encapsula valor, conta destino, validacoes e formulario de nova conta
const useWithdrawForm = (availableBalance: number) => {
  // Estado do valor de resgate
  const [rawInput, setRawInput] = useState(''); //..Input bruto do usuario
  const [amount, setAmount] = useState(0); //..........Valor em reais

  // Estado da lista de contas salvas
  const [savedAccounts, setSavedAccounts] = useState<SavedBankAccount[]>([]); //..Contas salvas (vazio inicial)

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
      bankName: bankInfo?.name || 'Banco', //..Nome do banco
      bankCode: newAccountData.bankCode, //......Codigo do banco
      holderName: '', //...........................Titular vazio
      agency: newAccountData.agency, //............Agencia
      account: newAccountData.account, //..........Conta
      accountType: newAccountData.accountType, //..Tipo da conta
      document: newAccountData.document, //........CPF ou CNPJ
      isDefault: newAccountData.isDefault, //.......Conta principal
    };

    // Adiciona dados Pix se metodo for Pix
    if (transferMethod === 'pix') {
      newAccount.pixKeyType = newAccountData.pixKeyType; //..Tipo chave Pix
      newAccount.pixKey = newAccountData.pixKey; //..........Valor chave Pix
      newAccount.bankName = newAccountData.nickname || 'Conta Pix'; //..Nome ou apelido
    }

    // Usa apelido como nome se informado
    if (newAccountData.nickname) {
      newAccount.bankName = newAccountData.nickname; //..Apelido da conta
    }

    // Atualiza lista de contas
    setSavedAccounts(prev => {
      let updated = [...prev]; //..Copia lista

      // Se nova conta e padrao, desmarca as outras
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
  }, [newAccountData, transferMethod]);

  // Handler de excluir conta salva
  const handleDeleteAccount = useCallback((id: string) => {
    setSavedAccounts(prev => prev.filter(a => a.id !== id)); //..Remove conta
    if (selectedAccountId === id) setSelectedAccountId(null); //..Desmarca se era a selecionada
  }, [selectedAccountId]);

  // Erro de validacao do valor
  const valueError = amount > 0 && amount < MIN_WITHDRAW_AMOUNT
    ? 'belowMinimum' as const
    : amount > availableBalance
      ? 'aboveBalance' as const
      : null; //..Sem erro

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
    handleDeleteAccount,
    valueError,
    isFormValid,
  };
};

// Export padrao
export default useWithdrawForm;
