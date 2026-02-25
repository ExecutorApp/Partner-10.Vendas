// Tipos e dados da antecipacao de recebiveis
// Interfaces, mocks de parcelas futuras, constantes e helpers de calculo

// Utilitarios existentes
import { formatCurrency } from './03.WalletData';

// Interface de recebivel (parcela futura)
export interface Receivable {
  id: string; //...............Identificador unico
  clientName: string; //......Nome do cliente
  clientPhoto?: string; //....Uri da foto do cliente
  productName: string; //.....Nome do produto
  installment: number; //.....Parcela atual
  totalInstallments: number; //..Total de parcelas
  amount: number; //...........Valor bruto da parcela
  dueDate: string; //..........Data de vencimento (YYYY-MM-DD)
  daysUntilDue: number; //.....Dias ate o vencimento
}

// Taxa de antecipacao ao mes
export const ANTICIPATION_RATE = 0.035; //..3,5% a.m.

// Mensagens de validacao
export const ANTICIPATION_MESSAGES = {
  noSelection: 'Selecione pelo menos uma parcela para simular', //..Sem selecao
  noAccount: 'Selecione uma conta de destino', //..Sem conta
};

// Dados mock de recebiveis (parcelas futuras)
export const MOCK_RECEIVABLES: Receivable[] = [
  { id: 'r1', clientName: 'João Silva', clientPhoto: 'https://randomuser.me/api/portraits/men/32.jpg', productName: 'Holding Patrimonial', installment: 4, totalInstallments: 10, amount: 350.00, dueDate: '2026-03-15', daysUntilDue: 19 },
  { id: 'r2', clientName: 'João Silva', clientPhoto: 'https://randomuser.me/api/portraits/men/32.jpg', productName: 'Holding Patrimonial', installment: 5, totalInstallments: 10, amount: 350.00, dueDate: '2026-04-15', daysUntilDue: 50 },
  { id: 'r3', clientName: 'Maria Souza', productName: 'Planejamento Tributário', installment: 2, totalInstallments: 6, amount: 280.00, dueDate: '2026-03-10', daysUntilDue: 14 },
  { id: 'r4', clientName: 'Maria Souza', productName: 'Planejamento Tributário', installment: 3, totalInstallments: 6, amount: 280.00, dueDate: '2026-04-10', daysUntilDue: 45 },
  { id: 'r5', clientName: 'Carlos Oliveira', clientPhoto: 'https://randomuser.me/api/portraits/men/45.jpg', productName: 'Ativos Fundiários', installment: 6, totalInstallments: 12, amount: 525.00, dueDate: '2026-03-22', daysUntilDue: 26 },
  { id: 'r6', clientName: 'Carlos Oliveira', clientPhoto: 'https://randomuser.me/api/portraits/men/45.jpg', productName: 'Ativos Fundiários', installment: 7, totalInstallments: 12, amount: 525.00, dueDate: '2026-04-22', daysUntilDue: 57 },
  { id: 'r7', clientName: 'Ana Santos', clientPhoto: 'https://randomuser.me/api/portraits/women/44.jpg', productName: 'Holding Patrimonial', installment: 3, totalInstallments: 8, amount: 420.00, dueDate: '2026-03-18', daysUntilDue: 22 },
  { id: 'r8', clientName: 'Pedro Lima', productName: 'Planejamento Tributário', installment: 8, totalInstallments: 10, amount: 332.50, dueDate: '2026-03-25', daysUntilDue: 29 },
  { id: 'r9', clientName: 'Pedro Lima', productName: 'Planejamento Tributário', installment: 9, totalInstallments: 10, amount: 332.50, dueDate: '2026-04-25', daysUntilDue: 60 },
  { id: 'r10', clientName: 'Fernanda Costa', clientPhoto: 'https://randomuser.me/api/portraits/women/68.jpg', productName: 'Ativos Fundiários', installment: 2, totalInstallments: 4, amount: 210.00, dueDate: '2026-03-20', daysUntilDue: 24 },
];

// Total disponivel para antecipacao (soma de todos os mocks)
export const TOTAL_RECEIVABLE_AMOUNT = MOCK_RECEIVABLES.reduce((sum, r) => sum + r.amount, 0); //..Soma total

// Total de parcelas futuras
export const TOTAL_RECEIVABLE_COUNT = MOCK_RECEIVABLES.length; //..Quantidade de parcelas

// Calcula desconto proporcional ao prazo de uma parcela
// Formula: valor * (taxa_mensal / 30) * dias_ate_vencimento
export const calculateDiscount = (amount: number, daysUntilDue: number, rate: number): number => {
  const dailyRate = rate / 30; //..Taxa diaria
  return amount * dailyRate * daysUntilDue; //..Desconto proporcional
};

// Calcula valor liquido de um conjunto de recebiveis
export const calculateNetAmount = (receivables: Receivable[], rate: number): number => {
  const gross = receivables.reduce((sum, r) => sum + r.amount, 0); //..Soma bruta
  const discount = receivables.reduce((sum, r) => sum + calculateDiscount(r.amount, r.daysUntilDue, rate), 0); //..Soma descontos
  return gross - discount; //..Valor liquido
};

// Calcula soma bruta de um conjunto de recebiveis
export const calculateGrossAmount = (receivables: Receivable[]): number => {
  return receivables.reduce((sum, r) => sum + r.amount, 0); //..Soma bruta
};

// Calcula desconto total de um conjunto de recebiveis
export const calculateTotalDiscount = (receivables: Receivable[], rate: number): number => {
  return receivables.reduce((sum, r) => sum + calculateDiscount(r.amount, r.daysUntilDue, rate), 0); //..Soma descontos
};

// Calcula prazo medio ponderado em dias
export const calculateAverageTerm = (receivables: Receivable[]): number => {
  if (receivables.length === 0) return 0; //..Sem recebiveis
  const totalWeighted = receivables.reduce((sum, r) => sum + (r.amount * r.daysUntilDue), 0); //..Soma ponderada
  const totalAmount = receivables.reduce((sum, r) => sum + r.amount, 0); //..Soma valores
  return Math.round(totalWeighted / totalAmount); //..Prazo medio arredondado
};

// Formata data de vencimento (YYYY-MM-DD para DD/MM/AAAA)
export const formatDueDate = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-'); //..Separa componentes
  return `${day}/${month}/${year}`; //..Formato brasileiro
};

// Agrupa recebiveis por nome do cliente
// Retorna mapa de clientName para array de recebiveis
export const groupReceivablesByClient = (receivables: Receivable[]): Map<string, Receivable[]> => {
  const map = new Map<string, Receivable[]>(); //..Mapa vazio
  receivables.forEach(r => {
    const list = map.get(r.clientName) || []; //..Lista existente ou vazia
    list.push(r); //..Adiciona recebivel
    map.set(r.clientName, list); //..Atualiza mapa
  });
  return map; //..Retorna agrupado
};

// Status de uma parcela no historico completo
export type InstallmentStatus = 'paid' | 'pending' | 'overdue';

// Interface de parcela completa (todas as parcelas de um produto)
export interface FullInstallment {
  installment: number; //..........Numero da parcela
  totalInstallments: number; //....Total de parcelas
  productName: string; //..........Nome do produto
  amount: number; //...............Valor da parcela
  dueDate: string; //..............Data de vencimento
  status: InstallmentStatus; //...Status da parcela
}

// Agrupa recebiveis por nome do produto
export const groupReceivablesByProduct = (receivables: Receivable[]): Map<string, Receivable[]> => {
  const map = new Map<string, Receivable[]>(); //..Mapa vazio
  receivables.forEach(r => {
    const list = map.get(r.productName) || []; //..Lista existente ou vazia
    list.push(r); //..Adiciona recebivel
    map.set(r.productName, list); //..Atualiza mapa
  });
  return map; //..Retorna agrupado
};

// Gera todas as parcelas de um produto (pagas, a vencer, atrasadas)
// Calcula datas estimadas para parcelas sem dados no mock
export const generateProductInstallments = (productReceivables: Receivable[]): FullInstallment[] => {
  if (productReceivables.length === 0) return []; //..Sem dados

  // Ordena por numero da parcela
  const sorted = [...productReceivables].sort((a, b) => a.installment - b.installment); //..Ordenado
  const { productName, totalInstallments, amount } = sorted[0]; //..Dados base
  const receivableMap = new Map(sorted.map(r => [r.installment, r])); //..Mapa por parcela
  const firstPending = sorted[0].installment; //..Primeira parcela pendente
  const firstDate = new Date(sorted[0].dueDate + 'T00:00:00'); //..Data de referencia
  const today = new Date(); //..Data atual
  today.setHours(0, 0, 0, 0); //..Zera horas

  // Gera todas as parcelas de 1 ate totalInstallments
  const result: FullInstallment[] = [];
  for (let i = 1; i <= totalInstallments; i++) {
    const receivable = receivableMap.get(i); //..Busca recebivel

    // Calcula data estimada (mensal a partir da referencia)
    const estimatedDate = new Date(firstDate); //..Copia referencia
    estimatedDate.setMonth(estimatedDate.getMonth() + (i - firstPending)); //..Offset mensal
    const dueDate = receivable ? new Date(receivable.dueDate + 'T00:00:00') : estimatedDate; //..Data real ou estimada

    // Determina status da parcela
    let status: InstallmentStatus;
    if (i < firstPending) {
      status = 'paid'; //..Parcelas anteriores foram pagas
    } else if (dueDate < today) {
      status = 'overdue'; //..Vencida e nao paga
    } else {
      status = 'pending'; //..A vencer
    }

    // Formata data como YYYY-MM-DD
    const y = dueDate.getFullYear(); //..Ano
    const m = String(dueDate.getMonth() + 1).padStart(2, '0'); //..Mes
    const d = String(dueDate.getDate()).padStart(2, '0'); //..Dia

    result.push({
      installment: i, //..............Numero da parcela
      totalInstallments, //...........Total
      productName, //..................Produto
      amount: receivable?.amount ?? amount, //..Valor real ou estimado
      dueDate: `${y}-${m}-${d}`, //...Data formatada
      status, //......................Status
    });
  }

  return result; //..Retorna lista completa
};

// Re-exporta formatCurrency para uso externo
export { formatCurrency };
