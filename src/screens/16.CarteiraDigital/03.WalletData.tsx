// Tipos e dados da Carteira Digital
// Constantes, interfaces e funcoes utilitarias

// Interface de transacao
export interface Transaction {
  id: string; //...........Identificador unico
  clientName: string; //...Nome do cliente
  clientPhoto?: string; //..Uri da foto do cliente
  productName: string; //..Nome do produto
  installment: number; //..Parcela atual
  totalInstallments: number; //..Total de parcelas
  commissionValue: number; //....Valor da comissao
  date: string; //.........Data da transacao
  status: 'received' | 'pending' | 'overdue'; //..Status do pagamento
}

// Interface de parcela individual para o modal de pagamentos
export interface InstallmentDetail {
  number: number; //.......Numero da parcela
  total: number; //........Total de parcelas
  value: number; //........Valor da parcela
  status: 'paid' | 'pending' | 'overdue'; //..Status da parcela
  date: string; //.........Data da parcela
}

// Tipo de filtro de data
export type DateFilter = 'all' | 'today' | 'week' | 'month' | 'custom';

// Dados mock de transacoes
// Hoje = 2026-02-23, Ontem = 2026-02-22
export const MOCK_TRANSACTIONS: Transaction[] = [
  // Hoje - Recebidos
  { id: '1', clientName: 'João Silva', clientPhoto: 'https://randomuser.me/api/portraits/men/32.jpg', productName: 'Holding Patrimonial', installment: 3, totalInstallments: 10, commissionValue: 350, date: '2026-02-23', status: 'received' },
  { id: '2', clientName: 'Fernanda Costa', productName: 'Planejamento Tributário', installment: 2, totalInstallments: 6, commissionValue: 280, date: '2026-02-23', status: 'received' },
  { id: '3', clientName: 'Roberto Almeida', clientPhoto: 'https://randomuser.me/api/portraits/men/45.jpg', productName: 'Ativos Fundiários', installment: 4, totalInstallments: 8, commissionValue: 475, date: '2026-02-23', status: 'received' },
  // Hoje - Pendentes e atrasados
  { id: '4', clientName: 'Maria Souza', clientPhoto: 'https://randomuser.me/api/portraits/women/44.jpg', productName: 'Planejamento Tributário', installment: 1, totalInstallments: 6, commissionValue: 280, date: '2026-02-23', status: 'pending' },
  { id: '5', clientName: 'Lucas Mendes', productName: 'Holding Patrimonial', installment: 5, totalInstallments: 12, commissionValue: 390, date: '2026-02-23', status: 'pending' },
  { id: '6', clientName: 'Camila Rodrigues', clientPhoto: 'https://randomuser.me/api/portraits/women/68.jpg', productName: 'Ativos Fundiários', installment: 3, totalInstallments: 10, commissionValue: 315, date: '2026-02-23', status: 'overdue' },
  // Ontem - Recebidos
  { id: '7', clientName: 'Carlos Oliveira', productName: 'Ativos Fundiários', installment: 5, totalInstallments: 12, commissionValue: 525, date: '2026-02-22', status: 'received' },
  { id: '8', clientName: 'Patrícia Ferreira', clientPhoto: 'https://randomuser.me/api/portraits/women/33.jpg', productName: 'Holding Patrimonial', installment: 7, totalInstallments: 10, commissionValue: 350, date: '2026-02-22', status: 'received' },
  { id: '9', clientName: 'Marcos Pereira', productName: 'Planejamento Tributário', installment: 3, totalInstallments: 8, commissionValue: 245, date: '2026-02-22', status: 'received' },
  // Ontem - Pendentes e atrasados
  { id: '10', clientName: 'Ana Santos', productName: 'Holding Patrimonial', installment: 2, totalInstallments: 8, commissionValue: 420, date: '2026-02-22', status: 'overdue' },
  { id: '11', clientName: 'Felipe Barbosa', productName: 'Ativos Fundiários', installment: 1, totalInstallments: 6, commissionValue: 310, date: '2026-02-22', status: 'pending' },
  { id: '12', clientName: 'Juliana Lima', clientPhoto: 'https://randomuser.me/api/portraits/women/41.jpg', productName: 'Planejamento Tributário', installment: 4, totalInstallments: 10, commissionValue: 275, date: '2026-02-22', status: 'pending' },
  // 21 de fevereiro - Recebidos
  { id: '13', clientName: 'Pedro Lima', clientPhoto: 'https://randomuser.me/api/portraits/men/36.jpg', productName: 'Planejamento Tributário', installment: 7, totalInstallments: 10, commissionValue: 332.50, date: '2026-02-21', status: 'received' },
  { id: '14', clientName: 'Beatriz Martins', productName: 'Holding Patrimonial', installment: 6, totalInstallments: 12, commissionValue: 380, date: '2026-02-21', status: 'received' },
  { id: '15', clientName: 'Gabriel Nunes', clientPhoto: 'https://randomuser.me/api/portraits/men/41.jpg', productName: 'Ativos Fundiários', installment: 2, totalInstallments: 8, commissionValue: 290, date: '2026-02-21', status: 'received' },
  // 21 de fevereiro - Pendentes e atrasados
  { id: '16', clientName: 'Isabela Carvalho', clientPhoto: 'https://randomuser.me/api/portraits/women/29.jpg', productName: 'Holding Patrimonial', installment: 3, totalInstallments: 10, commissionValue: 345, date: '2026-02-21', status: 'pending' },
  { id: '17', clientName: 'Rafael Gomes', productName: 'Planejamento Tributário', installment: 2, totalInstallments: 6, commissionValue: 260, date: '2026-02-21', status: 'overdue' },
  { id: '18', clientName: 'Amanda Dias', clientPhoto: 'https://randomuser.me/api/portraits/women/52.jpg', productName: 'Ativos Fundiários', installment: 1, totalInstallments: 4, commissionValue: 210, date: '2026-02-21', status: 'pending' },
  // 20 de fevereiro - Recebidos
  { id: '19', clientName: 'Thiago Ribeiro', productName: 'Ativos Fundiários', installment: 1, totalInstallments: 4, commissionValue: 210, date: '2026-02-20', status: 'received' },
  { id: '20', clientName: 'Carolina Teixeira', clientPhoto: 'https://randomuser.me/api/portraits/women/17.jpg', productName: 'Holding Patrimonial', installment: 8, totalInstallments: 12, commissionValue: 350, date: '2026-02-20', status: 'received' },
  { id: '21', clientName: 'Daniel Moreira', clientPhoto: 'https://randomuser.me/api/portraits/men/18.jpg', productName: 'Planejamento Tributário', installment: 5, totalInstallments: 10, commissionValue: 332.50, date: '2026-02-20', status: 'received' },
  // 20 de fevereiro - Pendentes e atrasados
  { id: '22', clientName: 'Larissa Souza', productName: 'Holding Patrimonial', installment: 4, totalInstallments: 8, commissionValue: 420, date: '2026-02-20', status: 'pending' },
  { id: '23', clientName: 'Gustavo Santos', productName: 'Ativos Fundiários', installment: 6, totalInstallments: 12, commissionValue: 525, date: '2026-02-20', status: 'overdue' },
  { id: '24', clientName: 'Vanessa Oliveira', clientPhoto: 'https://randomuser.me/api/portraits/women/63.jpg', productName: 'Planejamento Tributário', installment: 2, totalInstallments: 6, commissionValue: 280, date: '2026-02-20', status: 'pending' },
];

// Lista de produtos disponiveis para filtro
export const PRODUCT_LIST = ['Holding Patrimonial', 'Planejamento Tributário', 'Ativos Fundiários'];

// Labels dos filtros de data
export const DATE_FILTER_LABELS: Record<DateFilter, string> = {
  all: 'Todos', //........Sem filtro
  today: 'Hoje', //.......Apenas hoje
  week: 'Esta semana', //..Semana atual
  month: 'Este mês', //...Mes atual
  custom: 'Período', //...Personalizado
};

// Formata valor em reais
export const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); //..Formata para BRL
};

// Formata data no formato DD/MM/AAAA
export const formatShortDate = (d: Date): string => {
  const dd = String(d.getDate()).padStart(2, '0'); //..Dia com zero
  const mm = String(d.getMonth() + 1).padStart(2, '0'); //..Mes com zero
  const yyyy = d.getFullYear(); //..Ano completo
  return `${dd}/${mm}/${yyyy}`; //..Formato brasileiro
};

// Agrupa transacoes por data
export const groupByDate = (transactions: Transaction[]): Record<string, Transaction[]> => {
  const today = '2026-02-23'; //...Data atual
  const yesterday = '2026-02-22'; //..Data de ontem
  const groups: Record<string, Transaction[]> = {}; //..Objeto de grupos

  transactions.forEach(t => {
    let label = t.date; //..Label padrao
    if (t.date === today) label = 'Hoje'; //..Grupo hoje
    else if (t.date === yesterday) label = 'Ontem'; //..Grupo ontem
    else label = new Date(t.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }); //..Data formatada

    if (!groups[label]) groups[label] = []; //..Cria grupo se nao existe
    groups[label].push(t); //..Adiciona ao grupo
  });

  return groups; //..Retorna grupos
};

// Verifica se a data corresponde ao filtro
export const matchesDateFilter = (dateStr: string, filter: DateFilter, startDate: Date | null, endDate: Date | null): boolean => {
  if (filter === 'all') return true; //..Sem filtro
  const date = new Date(dateStr + 'T12:00:00'); //..Data da transacao
  const today = new Date('2026-02-23T12:00:00'); //..Data atual

  if (filter === 'today') return dateStr === '2026-02-23'; //..Apenas hoje
  if (filter === 'week') {
    const weekStart = new Date(today); //..Inicio da semana
    weekStart.setDate(today.getDate() - today.getDay()); //..Domingo
    return date >= weekStart && date <= today; //..Dentro da semana
  }
  if (filter === 'month') {
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear(); //..Mesmo mes
  }
  if (filter === 'custom' && startDate && endDate) {
    const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0); //..Inicio do dia
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59); //..Fim do dia
    return date >= start && date <= end; //..Dentro do periodo
  }
  return true; //..Fallback sem filtro
};

// Cor do indicador de status no avatar
export const getStatusColor = (status: Transaction['status']): string => {
  if (status === 'received') return '#22C55E'; //..Verde para recebido
  if (status === 'pending') return '#F59E0B'; //...Amarelo para pendente
  return '#EF4444'; //..Vermelho para atrasado
};

// Gera lista de todas as parcelas de um cliente
// Parcelas anteriores sao marcadas como pagas, a atual reflete o status real
export const getClientInstallments = (transaction: Transaction): InstallmentDetail[] => {
  const installments: InstallmentDetail[] = []; //..Array de parcelas
  const baseDate = new Date(transaction.date + 'T12:00:00'); //..Data base da transacao

  for (let i = 1; i <= transaction.totalInstallments; i++) {
    const installmentDate = new Date(baseDate); //..Copia a data base
    installmentDate.setMonth(baseDate.getMonth() + (i - transaction.installment)); //..Calcula mes da parcela
    const dateStr = installmentDate.toISOString().split('T')[0]; //..Formata para YYYY-MM-DD

    // Define o status da parcela
    let status: InstallmentDetail['status'];
    if (i < transaction.installment) {
      status = 'paid'; //..Parcelas anteriores foram pagas
    } else if (i === transaction.installment) {
      status = transaction.status === 'received' ? 'paid' : transaction.status; //..Parcela atual reflete status real
    } else {
      status = 'pending'; //..Parcelas futuras sao pendentes
    }

    installments.push({ number: i, total: transaction.totalInstallments, value: transaction.commissionValue, status, date: dateStr });
  }

  return installments; //..Retorna lista completa
};
