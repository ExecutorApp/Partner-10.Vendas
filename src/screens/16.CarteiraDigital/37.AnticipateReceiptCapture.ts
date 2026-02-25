// Gerador de imagem de comprovante de antecipacao
// Cria HTML profissional, captura como PNG e compartilha/baixa
// Espelha 33.WithdrawReceiptCapture.ts adaptado para antecipacoes

// Bibliotecas externas
import { toBlob } from 'html-to-image';

// Tipos e dados
import { AnticipateHistoryItem } from './35.AnticipateHistoryModal';
import { formatCurrency } from './03.WalletData';

// Numero de teste para WhatsApp
const WHATSAPP_NUMBER = '5517992460986'; //..Numero de teste

// Formata data YYYY-MM-DD para DD/MM/YYYY (formato completo para comprovante)
const formatReceiptDate = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-'); //..Separa partes
  return `${day}/${month}/${year}`; //..Formato DD/MM/YYYY
};

// Gera timestamp atual formatado
const getTimestamp = (): string => {
  const now = new Date(); //..Data atual
  const d = String(now.getDate()).padStart(2, '0'); //..Dia
  const m = String(now.getMonth() + 1).padStart(2, '0'); //..Mes
  const y = now.getFullYear(); //..Ano
  const h = String(now.getHours()).padStart(2, '0'); //..Hora
  const min = String(now.getMinutes()).padStart(2, '0'); //..Minuto
  const s = String(now.getSeconds()).padStart(2, '0'); //..Segundo
  return `${d}/${m}/${y} ${h}:${min}:${s}`; //..Formato completo
};

// Gera ID de transacao ficticio baseado nos dados da antecipacao
export const generateAnticipateTransactionId = (item: AnticipateHistoryItem): string => {
  const hash = Math.abs(
    (item.bankName.length * 7919) +
    (item.amount * 1031) +
    (item.balanceBefore * 100)
  ).toString(36).toUpperCase(); //..Hash alfanumerico
  return `ANT-${item.date.substring(0, 4)}-${hash.padStart(6, '0')}`; //..Formato padrao
};

// Gera codigo de autenticacao ficticio
export const generateAnticipateAuthCode = (item: AnticipateHistoryItem): string => {
  const base = Math.abs(
    (item.bankName.length * 3571) +
    (item.amount * 2239) +
    (item.balanceBefore * 137)
  ); //..Valor base
  const hex = base.toString(16).toUpperCase().padStart(16, '0'); //..Hexadecimal
  return `${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}`; //..Formato agrupado
};

// Monta linha de dado do comprovante (label + valor)
const dataRow = (label: string, value: string): string => `
  <div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;">
    <span style="font-size:13px;color:#91929E;font-family:Inter,sans-serif;">${label}</span>
    <span style="font-size:13px;font-weight:500;color:#3A3F51;font-family:Inter,sans-serif;">${value}</span>
  </div>
`; //..Linha formatada

// Monta divisor horizontal
const divider = (): string => `
  <div style="height:1px;background:#E8ECF2;margin:12px 0;"></div>
`; //..Linha divisoria

// Monta HTML completo do comprovante de antecipacao
const buildAnticipateReceiptHTML = (item: AnticipateHistoryItem): string => {
  const txId = generateAnticipateTransactionId(item); //..Id da transacao
  const authCode = generateAnticipateAuthCode(item); //..Codigo de autenticacao
  const date = formatReceiptDate(item.date); //..Data formatada
  const grossAmount = formatCurrency(item.amount); //..Valor bruto
  const netAmount = formatCurrency(item.netAmount); //..Valor liquido
  const discount = formatCurrency(item.amount - item.netAmount); //..Desconto
  const balanceBefore = formatCurrency(item.balanceBefore); //..Saldo antes
  const balanceAfter = formatCurrency(item.balanceAfter); //..Saldo depois
  const timestamp = getTimestamp(); //..Timestamp atual

  return `
    <div style="width:400px;background:#FFFFFF;padding:32px 28px;font-family:Inter,Arial,Helvetica,sans-serif;box-sizing:border-box;">

      <!-- Barra accent azul no topo -->
      <div style="height:4px;background:linear-gradient(90deg,#0D3B73,#1777CF);border-radius:2px;margin-bottom:28px;"></div>

      <!-- Header com branding -->
      <div style="text-align:center;margin-bottom:24px;">
        <div style="font-size:22px;font-weight:700;color:#1777CF;letter-spacing:-0.5px;">Partners</div>
        <div style="font-size:11px;color:#91929E;margin-top:2px;">Gestão Financeira Inteligente</div>
      </div>

      <!-- Icone de confirmacao -->
      <div style="text-align:center;margin-bottom:8px;">
        <div style="display:inline-flex;width:52px;height:52px;border-radius:26px;background:rgba(27,136,60,0.1);align-items:center;justify-content:center;">
          <div style="width:32px;height:32px;border-radius:16px;background:#1B883C;display:flex;align-items:center;justify-content:center;">
            <span style="color:#FFFFFF;font-size:18px;line-height:1;">✓</span>
          </div>
        </div>
      </div>

      <!-- Titulo -->
      <div style="text-align:center;margin-bottom:4px;">
        <div style="font-size:16px;font-weight:700;color:#3A3F51;">Comprovante de Antecipação</div>
      </div>
      <div style="text-align:center;margin-bottom:20px;">
        <span style="font-size:11px;color:#B0B5BE;">#${txId}</span>
      </div>

      ${divider()}

      <!-- Dados da antecipacao -->
      <div style="padding:4px 0;">
        ${dataRow('Banco destino', item.bankName)}
        ${dataRow('Data da antecipação', date)}
        ${dataRow('Recebíveis antecipados', String(item.receivableCount))}
        ${dataRow('Valor bruto', grossAmount)}
        ${dataRow('Desconto', '- ' + discount)}
        ${dataRow('Saldo anterior', balanceBefore)}
        ${dataRow('Saldo atual', balanceAfter)}
      </div>

      ${divider()}

      <!-- Valor liquido em destaque -->
      <div style="background:#F0FDF4;border-radius:10px;padding:16px;text-align:center;margin:8px 0 16px;">
        <div style="font-size:11px;color:#91929E;margin-bottom:6px;">Valor líquido recebido</div>
        <div style="font-size:26px;font-weight:700;color:#1B883C;letter-spacing:-0.5px;">${netAmount}</div>
        <div style="margin-top:10px;">
          <span style="display:inline-block;background:rgba(27,136,60,0.15);border-radius:12px;padding:4px 14px;">
            <span style="font-size:12px;font-weight:600;color:#1B883C;">✓ Antecipação aprovada</span>
          </span>
        </div>
      </div>

      ${divider()}

      <!-- Autenticacao -->
      <div style="padding:4px 0;">
        ${dataRow('Autenticação', authCode)}
      </div>

      ${divider()}

      <!-- Rodape -->
      <div style="text-align:center;padding-top:8px;">
        <div style="font-size:10px;color:#B0B5BE;line-height:1.6;">
          Emitido em ${timestamp}<br/>
          Partners App · CNPJ 00.000.000/0001-00<br/>
          Este comprovante é válido como recibo de antecipação
        </div>
      </div>

    </div>
  `; //..HTML completo
};

// Captura o comprovante como Blob PNG
const captureReceiptBlob = async (item: AnticipateHistoryItem): Promise<Blob | null> => {
  const div = document.createElement('div'); //..Cria container temporario
  div.style.cssText = 'position:absolute;left:-9999px;top:0;'; //..Posiciona fora da tela
  div.innerHTML = buildAnticipateReceiptHTML(item); //..Insere HTML
  document.body.appendChild(div); //..Adiciona ao DOM

  try {
    const blob = await toBlob(div.firstElementChild as HTMLElement, {
      pixelRatio: 2, //..............Alta resolucao (retina)
      backgroundColor: '#FFFFFF', //..Fundo branco garantido
      cacheBust: true, //............Evita cache
    }); //..Captura como blob
    return blob; //..Retorna blob
  } catch (error) {
    console.error('Erro ao capturar comprovante de antecipação:', error); //..Log de erro
    return null; //..Retorna nulo em caso de erro
  } finally {
    document.body.removeChild(div); //..Remove container do DOM
  }
};

// Faz download da imagem PNG do comprovante
const fallbackDownload = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob); //..Gera url temporaria
  const link = document.createElement('a'); //..Cria link
  link.href = url; //..Define url
  link.download = fileName; //..Nome do arquivo
  document.body.appendChild(link); //..Adiciona ao DOM
  link.click(); //..Inicia download
  setTimeout(() => {
    URL.revokeObjectURL(url); //..Libera url
    link.remove(); //..Remove link
  }, 1000); //..Delay para garantir download
};

// Baixa o comprovante de antecipacao como imagem PNG
export const handleDownloadAnticipateReceipt = async (item: AnticipateHistoryItem): Promise<void> => {
  const blob = await captureReceiptBlob(item); //..Captura imagem
  if (!blob) return; //..Sem blob, nao faz nada

  const txId = generateAnticipateTransactionId(item); //..Id da transacao
  fallbackDownload(blob, `comprovante-antecipacao-${txId}.png`); //..Baixa como PNG
};

// Compartilha o comprovante de antecipacao via WhatsApp (Web Share API)
export const handleShareAnticipateWhatsApp = async (item: AnticipateHistoryItem): Promise<void> => {
  const blob = await captureReceiptBlob(item); //..Captura imagem
  if (!blob) return; //..Sem blob, nao faz nada

  const txId = generateAnticipateTransactionId(item); //..Id da transacao
  const fileName = `comprovante-antecipacao-${txId}.png`; //..Nome do arquivo

  // Cria File a partir do Blob
  const file = new File([blob], fileName, {
    type: 'image/png', //..Tipo PNG
    lastModified: Date.now(), //..Data atual
  }); //..Arquivo de imagem

  // Dados para compartilhamento
  const shareData = {
    files: [file], //..Arquivo de imagem
    title: 'Comprovante de Antecipação', //..Titulo
    text: 'Segue o comprovante de antecipação', //..Texto
  }; //..Dados formatados

  // Tenta Web Share API (abre sheet nativo com WhatsApp)
  if (navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData); //..Compartilha via sheet nativo
      return; //..Sucesso
    } catch (err: any) {
      if (err.name === 'AbortError') return; //..Cancelado pelo usuario
    }
  }

  // Fallback: baixa a imagem e abre WhatsApp com mensagem
  fallbackDownload(blob, fileName); //..Baixa a imagem
  const text = encodeURIComponent('Segue o comprovante de antecipação em anexo.'); //..Mensagem
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank'); //..Abre WhatsApp
};
