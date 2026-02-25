// Tipos e dados da tela de Conciliacao
// Interfaces, mock e helpers para reconciliacao de comissoes

// Tipos e dados
import { formatCurrency } from './03.WalletData';

// Tipo de status do pedido
export type OrderStatus = 'paid' | 'pending' | 'divergent';

// Tipo de status para exibicao de parcela no modal
// Pago, pendente (futuro) ou faltante (vencido e nao pago)
export type InstallmentDisplayStatus = 'paid' | 'pending' | 'missing';

// Interface de pedido de conciliacao
export interface ReconciliationOrder {
  id: string; //...............Identificador unico
  clientName: string; //.......Nome do cliente
  clientPhoto?: string; //.....Uri da foto do cliente
  productName: string; //......Nome do produto
  installment: number; //......Parcela atual
  totalInstallments: number; //..Total de parcelas
  commissionValue: number; //..Valor da comissao esperada
  receivedAmount: number; //...Valor efetivamente recebido
  date: string; //.............Data do pedido
  status: OrderStatus; //......Status do pedido
}

// Interface do resumo de conciliacao
export interface ReconciliationSummary {
  expectedCount: number; //....Quantidade de pagamentos esperados
  expectedValue: number; //....Valor total esperado
  receivedCount: number; //....Quantidade de pagamentos recebidos
  receivedValue: number; //....Valor total recebido
  missingCount: number; //.....Quantidade faltando
  missingValue: number; //.....Valor faltando
  hasMissing: boolean; //......Indica se ha pendencias
}

// Meses do ano em portugues
export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]; //..Nomes dos meses

// Dados mock de pedidos de conciliacao (ordem crescente por dia)
export const MOCK_ORDERS: ReconciliationOrder[] = [
  { id: 'R001', clientName: 'João Silva', productName: 'Holding Patrimonial', installment: 3, totalInstallments: 10, commissionValue: 350, receivedAmount: 350, date: '2026-02-01', status: 'paid' },
  { id: 'R002', clientName: 'Maria Souza', productName: 'Planejamento Tributário', installment: 1, totalInstallments: 6, commissionValue: 280, receivedAmount: 280, date: '2026-02-02', status: 'paid' },
  { id: 'R003', clientName: 'Carlos Oliveira', productName: 'Ativos Fundiários', installment: 5, totalInstallments: 12, commissionValue: 525, receivedAmount: 0, date: '2026-02-03', status: 'pending' },
  { id: 'R004', clientName: 'Ana Santos', productName: 'Holding Patrimonial', installment: 2, totalInstallments: 8, commissionValue: 420, receivedAmount: 200, date: '2026-02-04', status: 'divergent' },
  { id: 'R005', clientName: 'Pedro Lima', productName: 'Planejamento Tributário', installment: 7, totalInstallments: 10, commissionValue: 332.50, receivedAmount: 332.50, date: '2026-02-05', status: 'paid' },
  { id: 'R006', clientName: 'Fernanda Costa', productName: 'Ativos Fundiários', installment: 1, totalInstallments: 4, commissionValue: 210, receivedAmount: 0, date: '2026-02-06', status: 'pending' },
  { id: 'R007', clientName: 'Ricardo Mendes', productName: 'Holding Patrimonial', installment: 4, totalInstallments: 10, commissionValue: 350, receivedAmount: 350, date: '2026-02-07', status: 'paid' },
  { id: 'R008', clientName: 'Juliana Alves', productName: 'Planejamento Tributário', installment: 3, totalInstallments: 6, commissionValue: 280, receivedAmount: 150, date: '2026-02-08', status: 'divergent' },
  { id: 'R009', clientName: 'Bruno Ferreira', productName: 'Ativos Fundiários', installment: 2, totalInstallments: 8, commissionValue: 400, receivedAmount: 400, date: '2026-02-09', status: 'paid' },
  { id: 'R010', clientName: 'Camila Rodrigues', productName: 'Holding Patrimonial', installment: 1, totalInstallments: 12, commissionValue: 600, receivedAmount: 0, date: '2026-02-10', status: 'pending' },
  { id: 'R011', clientName: 'Lucas Martins', productName: 'Ativos Fundiários', installment: 6, totalInstallments: 12, commissionValue: 475, receivedAmount: 475, date: '2026-02-11', status: 'paid' },
  { id: 'R012', clientName: 'Tatiana Rocha', productName: 'Planejamento Tributário', installment: 2, totalInstallments: 8, commissionValue: 310, receivedAmount: 0, date: '2026-02-12', status: 'pending' },
  { id: 'R013', clientName: 'Rafael Nunes', productName: 'Holding Patrimonial', installment: 5, totalInstallments: 10, commissionValue: 380, receivedAmount: 380, date: '2026-02-13', status: 'paid' },
  { id: 'R014', clientName: 'Patrícia Dias', productName: 'Ativos Fundiários', installment: 3, totalInstallments: 6, commissionValue: 290, receivedAmount: 120, date: '2026-02-14', status: 'divergent' },
  { id: 'R015', clientName: 'Gustavo Pereira', productName: 'Planejamento Tributário', installment: 4, totalInstallments: 10, commissionValue: 445, receivedAmount: 445, date: '2026-02-15', status: 'paid' },
  { id: 'R016', clientName: 'Daniela Moreira', productName: 'Holding Patrimonial', installment: 1, totalInstallments: 4, commissionValue: 520, receivedAmount: 0, date: '2026-02-16', status: 'pending' },
  { id: 'R017', clientName: 'Marcos Ribeiro', productName: 'Ativos Fundiários', installment: 8, totalInstallments: 12, commissionValue: 360, receivedAmount: 360, date: '2026-02-17', status: 'paid' },
  { id: 'R018', clientName: 'Vanessa Campos', productName: 'Planejamento Tributário', installment: 2, totalInstallments: 6, commissionValue: 275, receivedAmount: 100, date: '2026-02-18', status: 'divergent' },
]; //..Dados de teste

// Filtra pedidos por mes e ano selecionados
export const getOrdersByMonth = (month: number, year: number): ReconciliationOrder[] => {
  return MOCK_ORDERS.filter((order) => {
    const parts = order.date.split('-'); //..Separa partes da data
    return parseInt(parts[1]) - 1 === month && parseInt(parts[0]) === year; //..Compara mes e ano
  });
};

// Calcula resumo de conciliacao a partir dos pedidos
export const calculateSummary = (orders: ReconciliationOrder[]): ReconciliationSummary => {
  const expectedCount = orders.length; //..Total de pagamentos esperados
  const expectedValue = orders.reduce((sum, o) => sum + o.commissionValue, 0); //..Soma total esperada
  const receivedCount = orders.filter(o => o.receivedAmount > 0).length; //..Pagamentos com valor recebido
  const receivedValue = orders.reduce((sum, o) => sum + o.receivedAmount, 0); //..Soma total recebida
  const missingCount = orders.filter(o => o.receivedAmount < o.commissionValue).length; //..Pagamentos faltando
  const missingValue = expectedValue - receivedValue; //..Diferenca total
  return {
    expectedCount, //....Quantidade esperada
    expectedValue, //....Valor esperado
    receivedCount, //....Quantidade recebida
    receivedValue, //....Valor recebido
    missingCount, //.....Quantidade faltando
    missingValue, //.....Valor faltando
    hasMissing: missingValue > 0, //..Indica se ha pendencias
  };
};

// Retorna o valor faltando de um pedido
export const getMissingAmount = (order: ReconciliationOrder): number => {
  return order.commissionValue - order.receivedAmount; //..Diferenca entre esperado e recebido
};

// Cor do status do pedido
export const getOrderStatusColor = (status: OrderStatus): string => {
  if (status === 'paid') return '#1B883C'; //......Verde para pago
  if (status === 'pending') return '#F59E0B'; //...Amarelo para pendente
  return '#EF4444'; //..Vermelho para divergente
};

// Label do status do pedido
export const getOrderStatusLabel = (status: OrderStatus): string => {
  if (status === 'paid') return 'Pago'; //........Label pago
  if (status === 'pending') return 'Pendente'; //..Label pendente
  return 'Divergente'; //..Label divergente
};

// Formata data curta DD/MM
export const formatShortDate = (dateStr: string): string => {
  const parts = dateStr.split('-'); //..Separa partes da data
  return `${parts[2]}/${parts[1]}`; //..Formato DD/MM
};

// Formata apenas o dia com dois digitos e prefixo
export const formatDayOnly = (dateStr: string): string => {
  const day = dateStr.split('-')[2]; //..Extrai o dia
  return `Dia ${day.padStart(2, '0')}`; //..Formato "Dia DD"
};

// Retorna todos os pedidos de um cliente pelo nome
export const getClientOrders = (clientName: string, orders: ReconciliationOrder[]): ReconciliationOrder[] => {
  return orders.filter((o) => o.clientName === clientName); //..Filtra por nome do cliente
};

// Interface de parcela completa para visualizacao no modal
// Representa cada parcela do plano incluindo passadas e futuras
export interface FullInstallment {
  installment: number; //......Numero da parcela
  totalInstallments: number; //..Total de parcelas
  commissionValue: number; //....Valor da comissao
  receivedAmount: number; //.....Valor recebido
  date: string; //...............Data da parcela
  status: InstallmentDisplayStatus; //..Status da parcela
  isCurrent: boolean; //.........Parcela do mes atual
}

// Calcula data de uma parcela com offset em meses a partir da data base
const getInstallmentDate = (baseDate: string, monthOffset: number): string => {
  const parts = baseDate.split('-'); //..Separa partes da data
  const year = parseInt(parts[0]); //....Ano base
  const month = parseInt(parts[1]) - 1; //..Mes base (0-indexed)
  const day = parseInt(parts[2]); //........Dia base
  const d = new Date(year, month + monthOffset, day); //..Nova data com offset
  const y = d.getFullYear().toString(); //..................Ano calculado
  const m = (d.getMonth() + 1).toString().padStart(2, '0'); //..Mes calculado
  const dd = d.getDate().toString().padStart(2, '0'); //........Dia calculado
  return `${y}-${m}-${dd}`; //..Formato YYYY-MM-DD
};

// Gera todas as parcelas de um pedido para exibicao completa
// Anteriores assumem pago, atual mapeia status real, posteriores pendente
export const generateAllInstallments = (order: ReconciliationOrder): FullInstallment[] => {
  const result: FullInstallment[] = []; //..Array de resultado
  for (let i = 1; i <= order.totalInstallments; i++) {
    const monthOffset = i - order.installment; //..Diferenca em meses da parcela atual
    const date = getInstallmentDate(order.date, monthOffset); //..Data calculada
    if (i === order.installment) {
      // Parcela atual — pago se recebido integral, faltante caso contrario
      const displayStatus: InstallmentDisplayStatus = order.status === 'paid' ? 'paid' : 'missing';
      result.push({ installment: i, totalInstallments: order.totalInstallments, commissionValue: order.commissionValue, receivedAmount: order.receivedAmount, date, status: displayStatus, isCurrent: true });
    } else if (i < order.installment) {
      // Parcela anterior — assume pago em meses passados
      result.push({ installment: i, totalInstallments: order.totalInstallments, commissionValue: order.commissionValue, receivedAmount: order.commissionValue, date, status: 'paid', isCurrent: false });
    } else {
      // Parcela futura — pendente, ainda nao venceu
      result.push({ installment: i, totalInstallments: order.totalInstallments, commissionValue: order.commissionValue, receivedAmount: 0, date, status: 'pending', isCurrent: false });
    }
  }
  return result; //..Retorna todas as parcelas
};

// Formata data completa DD/MM/AA com dois digitos
export const formatFullShortDate = (dateStr: string): string => {
  const parts = dateStr.split('-'); //..Separa partes da data
  return `${parts[2]}/${parts[1]}/${parts[0].slice(2)}`; //..Formato DD/MM/AA
};

// Re-exporta formatCurrency para uso externo
export { formatCurrency };
