// ========================================
// Tipos do Modulo Commercial
// Kanban, Canal de Entrada e Dashboard
// ========================================

// ========================================
// Tipos: Canal de Entrada
// ========================================

// Tipo de canal de entrada do lead
export type ChannelType =
  | 'social_media'    //.......................Rede social
  | 'landing_page'    //.......................Landing page
  | 'referral'        //.......................Indicacao
  | 'direct'          //.......................Contato direto
  | 'other';          //.......................Outros canais

// Tipo de plataforma de rede social
export type SocialMediaPlatform =
  | 'instagram'       //.......................Instagram
  | 'facebook'        //.......................Facebook
  | 'linkedin'        //.......................LinkedIn
  | 'whatsapp'        //.......................WhatsApp
  | 'tiktok'          //.......................TikTok
  | 'twitter';        //.......................Twitter

// Interface de detalhes do canal
export interface ChannelDetails {
  platform?: SocialMediaPlatform;     //......Plataforma de rede social
  landingPageName?: string;           //......Nome da landing page
  referralSource?: string;            //......Fonte da indicacao
  utmSource?: string;                 //......Parametro utm_source
  utmMedium?: string;                 //......Parametro utm_medium
  utmCampaign?: string;               //......Parametro utm_campaign
}

// Interface de entrada do canal
export interface ChannelEntry {
  id: string;                         //......Identificador unico
  leadId: string;                     //......Id do lead associado
  channelType: ChannelType;           //......Tipo do canal
  channelDetails: ChannelDetails;     //......Detalhes do canal
  entryDate: Date;                    //......Data de entrada
  entryTime: string;                  //......Hora de entrada
  firstInteraction: string;           //......Primeira interacao
  ipAddress?: string;                 //......Endereco IP opcional
  device?: string;                    //......Dispositivo opcional
  createdAt: Date;                    //......Data de criacao
  createdBy: string;                  //......Criado por
}

// Interface de canal para listagem
export interface Channel {
  id: string;                         //......Identificador unico
  type: ChannelType;                  //......Tipo do canal
  name: string;                       //......Nome do canal
  icon: string;                       //......Icone do canal
  color: string;                      //......Cor do canal
  leadsCount: number;                 //......Quantidade de leads
  conversionRate: number;             //......Taxa de conversao
}

// ========================================
// Tipos: Kanban (Fases > Colunas > Cards)
// ========================================

// Tipo de status do lead
export type LeadStatus =
  | 'hot'             //.......................Lead quente
  | 'warm'            //.......................Lead morno
  | 'cold'            //.......................Lead frio
  | 'lost'            //.......................Lead perdido
  | 'won';            //.......................Lead convertido

// Interface de fase do Kanban
export interface KanbanPhase {
  id: string;                         //......Identificador unico
  name: string;                       //......Nome da fase
  order: number;                      //......Ordem de exibicao
  color: string;                      //......Cor da fase
  columns: KanbanColumn[];            //......Colunas da fase
  createdAt: Date;                    //......Data de criacao
  createdBy: string;                  //......Criado por
}

// Interface de coluna do Kanban
export interface KanbanColumn {
  id: string;                         //......Identificador unico
  phaseId: string;                    //......Id da fase pai
  name: string;                       //......Nome da coluna
  status: string;                     //......Status da coluna
  color: string;                      //......Cor da coluna
  order: number;                      //......Ordem de exibicao
  cards: KanbanCard[];                //......Cards da coluna
  createdAt: Date;                    //......Data de criacao
  createdBy: string;                  //......Criado por
}

// Interface de card do Kanban
export interface KanbanCard {
  id: string;                         //......Identificador unico
  leadId: string;                     //......Id do lead
  leadName: string;                   //......Nome do lead
  leadPhone?: string;                 //......Telefone do lead
  leadPhoto?: string;                 //......Foto do lead
  columnId: string;                   //......Id da coluna atual
  phaseId: string;                    //......Id da fase atual
  status: LeadStatus;                 //......Status do lead
  value: number;                      //......Valor estimado
  enteredAt: Date;                    //......Data de entrada
  movedBy: string;                    //......Movido por
  lastInteraction: Date;              //......Ultima interacao
  nextAction?: string;                //......Proxima acao
  nextActionDate?: Date;              //......Data da proxima acao
  history: CardHistory[];             //......Historico de movimentacoes
  notes: string[];                    //......Anotacoes
  tags: string[];                     //......Tags
  aiAutomation: boolean;              //......IA automatica ativa
  phoneNumber?: string;               //......Numero WhatsApp
  isWhatsAppContact?: boolean;        //......Flag de contato WhatsApp
  whatsAppJid?: string;               //......JID do WhatsApp
}

// Interface de historico do card
export interface CardHistory {
  id: string;                         //......Identificador unico
  cardId: string;                     //......Id do card
  fromColumn?: string;                //......Coluna de origem
  toColumn: string;                   //......Coluna de destino
  fromPhase?: string;                 //......Fase de origem
  toPhase?: string;                   //......Fase de destino
  movedBy: string;                    //......Movido por
  movedAt: Date;                      //......Data da movimentacao
  reason?: string;                    //......Motivo da movimentacao
}

// ========================================
// Tipos: Dashboard
// ========================================

// Tipo de formato de metrica
export type MetricFormat =
  | 'number'          //.......................Numero inteiro
  | 'currency'        //.......................Valor monetario
  | 'percentage';     //.......................Porcentagem

// Tipo de tendencia da metrica
export type MetricTrend =
  | 'up'              //.......................Subindo
  | 'down'            //.......................Descendo
  | 'stable';         //.......................Estavel

// Interface de metrica do dashboard
export interface DashboardMetric {
  id: string;                         //......Identificador unico
  title: string;                      //......Titulo da metrica
  value: number;                      //......Valor atual
  previousValue?: number;             //......Valor anterior
  format: MetricFormat;               //......Formato de exibicao
  trend: MetricTrend;                 //......Tendencia
  percentChange?: number;             //......Variacao percentual
}

// Interface de periodo do dashboard
export interface DashboardPeriod {
  label: string;                      //......Label do periodo
  startDate: Date;                    //......Data de inicio
  endDate: Date;                      //......Data de fim
}

// Interface de dados do funil
export interface FunnelData {
  phaseId: string;                    //......Id da fase
  phaseName: string;                  //......Nome da fase
  leadsCount: number;                 //......Quantidade de leads
  conversionRate: number;             //......Taxa de conversao
  averageTime: number;                //......Tempo medio em dias
}

// Interface de performance do corretor
export interface BrokerPerformance {
  brokerId: string;                   //......Id do corretor
  brokerName: string;                 //......Nome do corretor
  brokerPhoto?: string;               //......Foto do corretor
  totalLeads: number;                 //......Total de leads
  inProgress: number;                 //......Em andamento
  converted: number;                  //......Convertidos
  conversionRate: number;             //......Taxa de conversao
  averageClosingTime: number;         //......Tempo medio de fechamento
}

// Interface de dados da timeline
export interface TimelineData {
  date: Date;                         //......Data do ponto
  newLeads: number;                   //......Novos leads
  convertedLeads: number;             //......Leads convertidos
}

// ========================================
// Tipos: Filtros e Ordenacao
// ========================================

// Tipo de filtro de periodo
export type PeriodFilter =
  | 'today'           //.......................Hoje
  | 'week'            //.......................Esta semana
  | 'month'           //.......................Este mes
  | 'quarter'         //.......................Este trimestre
  | 'year'            //.......................Este ano
  | 'custom';         //.......................Periodo customizado

// Interface de filtros do dashboard
export interface DashboardFilters {
  period: PeriodFilter;               //......Filtro de periodo
  customStartDate?: Date;             //......Data inicio customizada
  customEndDate?: Date;               //......Data fim customizada
  brokerId?: string;                  //......Filtro por corretor
  phaseId?: string;                   //......Filtro por fase
  channelType?: ChannelType;          //......Filtro por canal
}

// ========================================
// Tipos: Exportacao e Relatorios
// ========================================

// Tipo de formato de exportacao
export type ExportFormat =
  | 'pdf'             //.......................Arquivo PDF
  | 'excel';          //.......................Arquivo Excel

// Interface de configuracao de relatorio
export interface ReportConfig {
  title: string;                      //......Titulo do relatorio
  filters: DashboardFilters;          //......Filtros aplicados
  includeCharts: boolean;             //......Incluir graficos
  includeTables: boolean;             //......Incluir tabelas
  exportFormat: ExportFormat;         //......Formato de exportacao
}
