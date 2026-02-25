// Tipos e dados do resgate de saldo
// Interfaces, mocks de contas bancarias, constantes e helpers monetarios

// Utilitarios de mascara e validacao existentes
import { onlyDigits, maskCPF, maskWhatsApp, isValidCPF, isValidCNPJ, isValidEmail, validateWhatsApp } from '../../utils/validators';

// Tipo de metodo de transferencia
export type TransferMethod = 'pix' | 'transfer';

// Tipos de chave Pix disponiveis
export type PixKeyType = 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';

// Interface de conta bancaria salva
export interface SavedBankAccount {
  id: string; //..............Identificador unico
  bankName: string; //........Nome do banco
  bankCode: string; //........Codigo do banco
  holderName: string; //......Nome do titular
  agency: string; //.........Agencia
  account: string; //........Conta
  accountType: 'corrente' | 'poupanca'; //..Tipo da conta
  pixKeyType?: PixKeyType; //..Tipo da chave Pix
  pixKey?: string; //..........Chave Pix mascarada
  document?: string; //........CPF ou CNPJ do titular
  isDefault: boolean; //.......Conta padrao
}

// Interface do formulario de nova conta
export interface NewAccountFormData {
  pixKeyType: PixKeyType; //..Tipo chave Pix
  pixKey: string; //..........Valor da chave Pix
  bankCode: string; //........Codigo do banco
  agency: string; //.........Agencia
  account: string; //........Conta
  accountType: 'corrente' | 'poupanca'; //..Tipo da conta
  document: string; //.......CPF ou CNPJ
  saveAccount: boolean; //...Salvar para proximos resgates
  nickname: string; //........Apelido da conta
  isDefault: boolean; //......Definir como conta principal
}

// Interface do formulario de edicao de conta
export interface EditAccountFormData {
  bankCode: string; //........Codigo do banco
  bankName: string; //........Nome do banco
  agency: string; //.........Agencia formatada
  account: string; //........Conta formatada
  accountType: 'corrente' | 'poupanca'; //..Tipo da conta
  pixKeyType: PixKeyType; //..Tipo chave Pix
  pixKey: string; //..........Valor da chave Pix
  holderName: string; //......Nome do titular
  document: string; //.......CPF ou CNPJ formatado
  saveAccount: boolean; //...Salvar para proximos resgates
  nickname: string; //........Apelido da conta
}

// Estado inicial do formulario de nova conta
export const INITIAL_NEW_ACCOUNT: NewAccountFormData = {
  pixKeyType: 'cpf', //......Tipo padrao
  pixKey: '', //..............Vazio
  bankCode: '', //............Vazio
  agency: '', //.............Vazio
  account: '', //............Vazio
  accountType: 'corrente', //..Padrao corrente
  document: '', //...........Vazio
  saveAccount: true, //.......Marcado por padrao
  nickname: '', //............Vazio
  isDefault: false, //........Nao e padrao
};

// Cria formulario de edicao a partir de conta salva
export const createEditFormFromAccount = (account: SavedBankAccount): EditAccountFormData => ({
  bankCode: account.bankCode, //..........Codigo do banco
  bankName: account.bankName, //..........Nome do banco
  agency: account.agency, //..............Agencia
  account: account.account, //............Conta
  accountType: account.accountType, //....Tipo
  pixKeyType: account.pixKeyType || 'cpf', //..Tipo chave Pix
  pixKey: account.pixKey || '', //.........Chave Pix
  holderName: account.holderName, //.......Titular
  document: account.document || '', //.....CPF ou CNPJ
  saveAccount: true, //....................Marcado por padrao
  nickname: '', //..........................Vazio
});

// Contas bancarias salvas (mock)
export const MOCK_SAVED_ACCOUNTS: SavedBankAccount[] = [
  {
    id: '1', //..............Identificador
    bankName: 'Nubank', //...Nome do banco
    bankCode: '260', //......Codigo
    holderName: 'João Silva', //..Titular
    agency: '0001', //........Agencia
    account: '1234567-8', //..Conta
    accountType: 'corrente', //..Tipo
    pixKeyType: 'cpf', //......Tipo chave
    pixKey: '123.456.789-00', //..Chave Pix CPF
    document: '123.456.789-00', //..CPF do titular
    isDefault: true, //.........Conta padrao
  },
  {
    id: '2', //..............Identificador
    bankName: 'Bradesco', //..Nome do banco
    bankCode: '237', //......Codigo
    holderName: 'João Silva', //..Titular
    agency: '1234', //........Agencia
    account: '98765-4', //....Conta
    accountType: 'corrente', //..Tipo
    pixKeyType: 'email', //....Tipo chave
    pixKey: 'joao@email.com', //..Chave Pix email
    document: '123.456.789-00', //..CPF do titular
    isDefault: false, //........Nao padrao
  },
  {
    id: '3', //..............Identificador
    bankName: 'Itaú Unibanco', //..Nome do banco
    bankCode: '341', //......Codigo
    holderName: 'João Silva', //..Titular
    agency: '5678', //........Agencia
    account: '11223-3', //....Conta
    accountType: 'poupanca', //..Tipo
    document: '123.456.789-00', //..CPF do titular
    isDefault: false, //........Nao padrao
  },
];

// Constante de valor minimo de resgate
export const MIN_WITHDRAW_AMOUNT = 50; //..Valor minimo em reais

// Mensagens de validacao do valor
export const WITHDRAW_MESSAGES = {
  belowMinimum: 'Valor mínimo: R$ 50,00', //..Abaixo do minimo
  aboveBalance: 'Valor acima do saldo disponível', //..Acima do saldo
};

// Labels dos tipos de chave Pix
export const PIX_KEY_LABELS: Record<PixKeyType, string> = {
  cpf: 'CPF', //..............Label CPF
  cnpj: 'CNPJ', //............Label CNPJ
  email: 'E-mail', //..........Label email
  phone: 'Celular', //........Label celular
  random: 'Chave aleatória', //..Label aleatoria
};

// Placeholders por tipo de chave Pix
export const PIX_PLACEHOLDERS: Record<PixKeyType, string> = {
  cpf: '000.000.000-00', //....................Placeholder CPF
  cnpj: '00.000.000/0000-00', //...............Placeholder CNPJ
  email: 'seuemail@exemplo.com', //............Placeholder email
  phone: '(00) 00000-0000', //.................Placeholder celular
  random: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', //..Placeholder aleatoria
};

// Tipo de teclado por tipo de chave Pix
export const PIX_KEYBOARDS: Record<PixKeyType, 'numeric' | 'email-address' | 'default'> = {
  cpf: 'numeric', //..........Teclado numerico
  cnpj: 'numeric', //.........Teclado numerico
  email: 'email-address', //..Teclado com arroba
  phone: 'numeric', //........Teclado numerico
  random: 'default', //.......Teclado padrao
};

// Lista de tipos de chave Pix para dropdown
export const PIX_KEY_OPTIONS = Object.entries(PIX_KEY_LABELS).map(([value, label]) => ({
  value: value as PixKeyType, //..Valor tipado
  label, //....................Label exibida
}));

// Lista completa de bancos brasileiros para seletor
export const BRAZIL_BANKS: { code: string; name: string }[] = [
  { code: '001', name: 'Banco do Brasil' },
  { code: '003', name: 'Banco da Amazônia' },
  { code: '004', name: 'Banco do Nordeste' },
  { code: '021', name: 'Banestes' },
  { code: '025', name: 'Banco Alfa' },
  { code: '033', name: 'Santander' },
  { code: '037', name: 'Banco do Estado do Pará' },
  { code: '041', name: 'Banrisul' },
  { code: '047', name: 'Banco do Estado de Sergipe' },
  { code: '062', name: 'Hipercard' },
  { code: '065', name: 'Banco AndBank' },
  { code: '069', name: 'Banco Crefisa' },
  { code: '070', name: 'Banco de Brasília (BRB)' },
  { code: '074', name: 'Banco Safra' },
  { code: '077', name: 'Inter' },
  { code: '082', name: 'Banco Topázio' },
  { code: '084', name: 'Uniprime Norte do Paraná' },
  { code: '085', name: 'Cooperativa Central Ailos' },
  { code: '091', name: 'Unicred Central' },
  { code: '104', name: 'Caixa Econômica Federal' },
  { code: '121', name: 'Banco Agibank' },
  { code: '136', name: 'Unicred' },
  { code: '197', name: 'Stone Pagamentos' },
  { code: '208', name: 'Banco BTG Pactual' },
  { code: '212', name: 'Banco Original' },
  { code: '218', name: 'Banco BS2' },
  { code: '237', name: 'Bradesco' },
  { code: '246', name: 'Banco ABC Brasil' },
  { code: '254', name: 'Paraná Banco' },
  { code: '260', name: 'Nu Pagamentos (Nubank)' },
  { code: '290', name: 'PagSeguro' },
  { code: '318', name: 'Banco BMG' },
  { code: '323', name: 'Mercado Pago' },
  { code: '335', name: 'Banco Digio' },
  { code: '336', name: 'C6 Bank' },
  { code: '341', name: 'Itaú Unibanco' },
  { code: '364', name: 'Gerencianet (Efí)' },
  { code: '380', name: 'PicPay' },
  { code: '389', name: 'Banco Mercantil do Brasil' },
  { code: '403', name: 'Cora' },
  { code: '623', name: 'Banco Pan' },
  { code: '633', name: 'Banco Rendimento' },
  { code: '655', name: 'Banco Votorantim' },
  { code: '707', name: 'Banco Daycoval' },
  { code: '745', name: 'Banco Citibank' },
  { code: '746', name: 'Banco Modal' },
  { code: '748', name: 'Sicredi' },
  { code: '756', name: 'Sicoob' },
];

// Mascara de agencia bancaria (0000-0)
export const maskAgency = (text: string): string => {
  const d = onlyDigits(text).slice(0, 5); //..Limita 5 digitos
  if (d.length <= 4) return d; //..............Sem digito verificador
  return `${d.slice(0, 4)}-${d.slice(4)}`; //..Com digito verificador
};

// Mascara de numero da conta (ate 12 digitos + verificador)
export const maskAccount = (text: string): string => {
  const d = onlyDigits(text).slice(0, 13); //..Limita 13 digitos
  if (d.length <= 1) return d; //..............Digito unico
  return `${d.slice(0, -1)}-${d.slice(-1)}`; //..Separa verificador
};

// Mascara de CNPJ (00.000.000/0000-00)
export const maskCNPJ = (text: string): string => {
  const d = onlyDigits(text).slice(0, 14); //..Limita 14 digitos
  let out = d.slice(0, 2); //..................Primeiros 2
  if (d.length > 2) out += `.${d.slice(2, 5)}`; //..Segundo grupo
  if (d.length > 5) out += `.${d.slice(5, 8)}`; //..Terceiro grupo
  if (d.length > 8) out += `/${d.slice(8, 12)}`; //..Quarto grupo
  if (d.length > 12) out += `-${d.slice(12)}`; //..Digitos verificadores
  return out; //..Retorna formatado
};

// Mascara automatica CPF ou CNPJ (detecta pelo tamanho)
export const maskDocument = (text: string): string => {
  const d = onlyDigits(text); //..Apenas digitos
  if (d.length <= 11) return maskCPF(text); //..Aplica mascara CPF
  return maskCNPJ(text); //..Aplica mascara CNPJ
};

// Mascara de chave Pix conforme tipo selecionado
export const maskPixKey = (text: string, type: PixKeyType): string => {
  if (type === 'cpf') return maskCPF(text); //............CPF formatado
  if (type === 'cnpj') return maskCNPJ(text); //..........CNPJ formatado
  if (type === 'phone') return maskWhatsApp(text); //.....Celular formatado
  return text; //..Email e aleatoria sem mascara
};

// Converte string de input para numero (centavos para reais)
export const parseCurrencyInput = (text: string): number => {
  const digits = text.replace(/\D/g, ''); //..Remove nao digitos
  return parseInt(digits || '0', 10) / 100; //..Converte centavos
};

// Formata numero para exibicao no input
export const formatCurrencyInput = (value: number): string => {
  if (value === 0) return ''; //..Vazio se zero
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); //..Formato BRL
};

// Valida chave Pix conforme tipo selecionado
// strict=false: null enquanto digita | strict=true: erro se incompleto (onBlur)
export const validatePixKey = (key: string, type: PixKeyType, strict = false): string | null => {
  if (!key) return strict ? 'Campo obrigatório' : null; //..Vazio
  if (type === 'cpf') {
    if (onlyDigits(key).length < 11) return strict ? 'CPF incompleto' : null; //..Incompleto
    return isValidCPF(key) ? null : 'CPF inválido'; //..Valida algoritmo
  }
  if (type === 'cnpj') {
    if (onlyDigits(key).length < 14) return strict ? 'CNPJ incompleto' : null; //..Incompleto
    return isValidCNPJ(key) ? null : 'CNPJ inválido'; //..Valida algoritmo
  }
  if (type === 'email') {
    if (!key.includes('@')) return strict ? 'E-mail incompleto' : null; //..Incompleto
    return isValidEmail(key) ? null : 'E-mail inválido'; //..Valida formato
  }
  if (type === 'phone') {
    if (onlyDigits(key).length < 10) return strict ? 'Celular incompleto' : null; //..Incompleto
    return validateWhatsApp(key).valid ? null : 'Celular inválido'; //..Valida formato
  }
  if (type === 'random') {
    if (key.length < 32) return strict ? 'Chave incompleta' : null; //..Incompleto
    return /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(key) ? null : 'Chave aleatória inválida'; //..Valida UUID
  }
  return null; //..Tipo desconhecido
};

// Valida CPF ou CNPJ do documento
// strict=false: null enquanto digita | strict=true: erro se incompleto (onBlur)
export const validateDocument = (doc: string, strict = false): string | null => {
  if (!doc) return strict ? 'Campo obrigatório' : null; //..Vazio
  const digits = onlyDigits(doc); //..Apenas digitos
  if (digits.length <= 11) {
    if (digits.length < 11) return strict ? 'CPF incompleto' : null; //..Incompleto
    return isValidCPF(doc) ? null : 'CPF inválido'; //..Valida algoritmo
  }
  if (digits.length < 14) return strict ? 'CNPJ incompleto' : null; //..Incompleto
  return isValidCNPJ(doc) ? null : 'CNPJ inválido'; //..Valida algoritmo
};

// Extrai nome curto do banco (conteudo entre parenteses)
// Exemplo: "Nu Pagamentos (Nubank)" retorna "Nubank"
export const getBankShortName = (fullName: string): string => {
  const match = fullName.match(/\(([^)]+)\)/); //..Busca conteudo entre parenteses
  return match ? match[1] : fullName; //...........Retorna curto ou original
};

// Re-exporta utilitarios para uso externo
export { onlyDigits, maskCPF, maskWhatsApp };
