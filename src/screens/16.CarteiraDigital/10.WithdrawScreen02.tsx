// React e React Native
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';

// Bibliotecas externas
import Lottie from 'lottie-react';

// Tipos e dados
import { SavedBankAccount, TransferMethod, PixKeyType, NewAccountFormData, PIX_KEY_LABELS } from './11.WithdrawData';

// Dados das animacoes Lottie
import bankAnimation from './assets/bank-empty.json';

// Componentes
import { BankIcon, MenuIcon, EditIcon, TrashIconSmall, TrashIconLarge, PlusIcon } from './08.WalletMenuIcons';
import WithdrawNewAccountForm from './13.WithdrawNewAccountForm';
import EditAccountModal, { DisplayField, getDisplayValue } from './14.WithdrawEditAccountModal';

// Interface do componente
interface WithdrawDestinationProps {
  savedAccounts: SavedBankAccount[]; //..Contas salvas
  selectedAccountId: string | null; //...Conta selecionada
  onSelectAccount: (id: string) => void; //..Callback selecao
  showNewForm: boolean; //...............Exibir formulario
  onToggleNewForm: () => void; //........Callback nova conta
  transferMethod: TransferMethod; //......Metodo de transferencia
  onTransferMethodChange: (method: TransferMethod) => void; //..Callback metodo
  newAccountData: NewAccountFormData; //..Dados do formulario
  onNewAccountChange: (field: keyof NewAccountFormData, value: string | boolean | PixKeyType) => void; //..Callback campo
  onConfirmNewAccount: () => string; //..Callback confirmar nova conta (retorna ID)
  onDeleteAccount: (id: string) => void; //..Callback excluir conta
  onUpdateAccount: (id: string, data: NewAccountFormData) => void; //..Callback atualizar conta
}

// Componente de secao de conta destino
// Renderiza botao nova conta, titulo, cards compactos e modal de edicao completo
const WithdrawDestination: React.FC<WithdrawDestinationProps> = ({
  savedAccounts, selectedAccountId, onSelectAccount, showNewForm, onToggleNewForm,
  transferMethod, onTransferMethodChange, newAccountData, onNewAccountChange, onConfirmNewAccount, onDeleteAccount, onUpdateAccount,
}) => {
  // Estados do componente
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null); //..................Card em edicao
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null); //................Conta a excluir
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null); //..............................Card com menu aberto
  const [visibleFields, setVisibleFields] = useState<Record<string, DisplayField[]>>({}); //..Campos por conta

  // Dados derivados das contas
  const editingAccount = savedAccounts.find(a => a.id === editingAccountId) || null; //...Conta em edicao
  const deletingAccount = savedAccounts.find(a => a.id === deletingAccountId) || null; //..Conta a excluir
  const menuAccount = savedAccounts.find(a => a.id === menuOpenId) || null; //............Conta do menu

  // Handler de abrir modal de edicao
  const handleOpenEdit = (accountId: string) => {
    setEditingAccountId(accountId); //..Abre modal
  };

  // Handler de fechar modal de edicao
  const handleCloseEdit = () => {
    setEditingAccountId(null); //..Fecha modal
  };

  // Handler de atualizar campos visiveis da conta
  const handleFieldsChange = (fields: DisplayField[]) => {
    if (!editingAccountId) return; //..Sem conta
    setVisibleFields(prev => ({ ...prev, [editingAccountId]: fields })); //..Atualiza mapa
  };

  // Handler de confirmar nova conta (cria conta e salva campos de exibicao)
  const handleConfirmNew = (displayFields: DisplayField[]) => {
    const newId = onConfirmNewAccount(); //..Cria conta e retorna ID
    if (displayFields.length > 0) {
      setVisibleFields(prev => ({ ...prev, [newId]: displayFields })); //..Salva campos de exibicao
    }
  };

  // Handler de confirmar exclusao da conta
  const handleConfirmDelete = () => {
    if (!deletingAccountId) return; //..Sem conta
    onDeleteAccount(deletingAccountId); //..Exclui conta
    setVisibleFields(prev => {
      const updated = { ...prev }; //..Copia mapa
      delete updated[deletingAccountId]; //..Remove campos
      return updated; //..Retorna atualizado
    });
    setDeletingAccountId(null); //..Fecha modal
  };

  // Handler de opcao editar no menu de contexto
  const handleMenuEdit = () => {
    if (!menuOpenId) return; //..Sem conta
    const id = menuOpenId; //....Salva referencia
    setMenuOpenId(null); //......Fecha menu
    handleOpenEdit(id); //.......Abre edicao
  };

  // Handler de salvar edicao da conta
  const handleSaveEdit = (formData: NewAccountFormData) => {
    if (!editingAccountId) return; //..Sem conta
    onUpdateAccount(editingAccountId, formData); //..Atualiza conta no hook
  };

  // Handler de opcao excluir no menu de contexto
  const handleMenuDelete = () => {
    if (!menuOpenId) return; //..Sem conta
    const id = menuOpenId; //....Salva referencia
    setMenuOpenId(null); //......Fecha menu
    setDeletingAccountId(id); //..Abre confirmacao
  };

  return (
    <View style={styles.container}>
      {/* Botao nova conta (alinhado a direita) */}
      <View style={styles.newAccountRow}>
        <TouchableOpacity style={styles.newAccountButton} onPress={onToggleNewForm} activeOpacity={0.7}>
          <PlusIcon color="#FFFFFF" />
          <Text style={styles.newAccountButtonText}>Cadastrar nova conta</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de cadastro de nova conta */}
      <WithdrawNewAccountForm
        visible={showNewForm}
        onClose={onToggleNewForm}
        onConfirm={handleConfirmNew}
        transferMethod={transferMethod}
        onTransferMethodChange={onTransferMethodChange}
        newAccountData={newAccountData}
        onNewAccountChange={onNewAccountChange}
      />

      {/* Divisor com "ou" */}
      <View style={styles.orDivider}>
        <View style={styles.orLine} />
        <Text style={styles.orText}>ou</Text>
        <View style={styles.orLine} />
      </View>

      {/* Titulo da secao */}
      <Text style={styles.sectionTitle}>Para onde enviar?</Text>

      {/* Estado vazio quando nao ha contas cadastradas */}
      {savedAccounts.length === 0 && (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBox}>
            <Lottie animationData={bankAnimation} loop={true} autoplay={true} style={styles.lottieIcon} />
          </View>
          <Text style={styles.emptyTitle}>Nenhuma conta cadastrada</Text>
          <Text style={styles.emptySubtitle}>Cadastre uma conta bancária para receber seus resgates</Text>
        </View>
      )}

      {/* Cards compactos de contas salvas (sempre 2 linhas) */}
      {savedAccounts.length > 0 && savedAccounts.map((account) => {
        const isSelected = selectedAccountId === account.id; //..Verifica selecao
        const fields = visibleFields[account.id] || []; //........Campos selecionados ordenados
        const defaultDetail = account.pixKeyType
          ? `Pix · ${PIX_KEY_LABELS[account.pixKeyType]}`
          : `${account.accountType === 'corrente' ? 'Conta Corrente' : 'Poupança'}`; //..Detalhe padrao

        // Linha 1: primeiro campo selecionado ou nome do banco
        const line1 = fields.length > 0 ? getDisplayValue(account, fields[0]) : account.bankName; //..Titulo
        // Linha 2: segundo campo selecionado ou detalhe padrao
        const line2 = fields.length >= 2 ? getDisplayValue(account, fields[1]) : defaultDetail; //..Subtitulo

        return (
          <TouchableOpacity
            key={account.id}
            style={[styles.accountCard, isSelected && styles.accountCardSelected]}
            onPress={() => onSelectAccount(account.id)}
            activeOpacity={0.7}
          >
            {/* Icone do banco */}
            <View style={[styles.bankIconBox, isSelected && styles.bankIconBoxSelected]}>
              <BankIcon color={isSelected ? '#1777CF' : '#7D8592'} />
            </View>

            {/* Informacoes compactas (sempre 2 linhas) */}
            <View style={styles.accountInfo}>
              <Text style={[styles.accountBankName, isSelected && styles.accountBankNameSelected]}>{line1}</Text>
              <Text style={styles.accountPix}>{line2}</Text>
            </View>

            {/* Badge padrao (a esquerda do botao menu) */}
            {account.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>Padrão</Text>
              </View>
            )}

            {/* Botao menu (3 linhas) */}
            <TouchableOpacity
              style={styles.menuIconBox}
              onPress={() => setMenuOpenId(account.id)}
              activeOpacity={0.6}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MenuIcon color="#3A3F51" />
            </TouchableOpacity>
          </TouchableOpacity>
        );
      })}

      {/* Modal de edicao completa da conta */}
      <EditAccountModal
        visible={editingAccountId !== null}
        account={editingAccount}
        selectedFields={editingAccountId ? (visibleFields[editingAccountId] || []) : []}
        onFieldsChange={handleFieldsChange}
        onSave={handleSaveEdit}
        onClose={handleCloseEdit}
      />

      {/* Modal menu de contexto (editar / excluir) */}
      <Modal visible={menuOpenId !== null} transparent animationType="fade" onRequestClose={() => setMenuOpenId(null)}>
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setMenuOpenId(null)}>
          <View style={styles.menuPopover}>
            {/* Titulo do menu com nome da conta */}
            {menuAccount && (
              <Text style={styles.menuTitle}>{menuAccount.bankName}</Text>
            )}

            {/* Opcao editar */}
            <TouchableOpacity style={styles.menuOption} onPress={handleMenuEdit} activeOpacity={0.6}>
              <View style={styles.menuOptionIconBox}>
                <EditIcon color="#3A3F51" />
              </View>
              <Text style={styles.menuOptionText}>Editar conta</Text>
            </TouchableOpacity>

            {/* Divisor entre opcoes */}
            <View style={styles.menuDivider} />

            {/* Opcao excluir */}
            <TouchableOpacity style={styles.menuOption} onPress={handleMenuDelete} activeOpacity={0.6}>
              <View style={[styles.menuOptionIconBox, styles.menuOptionIconDanger]}>
                <TrashIconSmall color="#E53935" />
              </View>
              <Text style={[styles.menuOptionText, styles.menuOptionTextDanger]}>Excluir conta</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal de confirmacao de exclusao (padrao do sistema) */}
      <Modal visible={deletingAccountId !== null} transparent animationType="fade" onRequestClose={() => setDeletingAccountId(null)}>
        <TouchableOpacity style={styles.deleteOverlay} activeOpacity={1} onPress={() => setDeletingAccountId(null)}>
          <View style={styles.deleteModal}>
            {/* Icone grande de lixeira */}
            <View style={styles.deleteIconBox}>
              <TrashIconLarge />
            </View>

            {/* Texto centralizado com mensagem e aviso */}
            <View style={styles.deleteTextBox}>
              <Text style={styles.deleteMessage}>
                Deseja realmente excluir a conta{deletingAccount ? ` (${deletingAccount.bankName})` : ''}?
              </Text>
              <Text style={styles.deleteWarning}>Esta ação não pode ser desfeita.</Text>
            </View>

            {/* Botoes cancelar e excluir */}
            <View style={styles.deleteButtons}>
              <TouchableOpacity style={styles.deleteCancelButton} onPress={() => setDeletingAccountId(null)} activeOpacity={0.7}>
                <Text style={styles.deleteCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteConfirmButton} onPress={handleConfirmDelete} activeOpacity={0.7}>
                <Text style={styles.deleteConfirmText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// Estilos do componente
const styles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1, //..Preenche espaco disponivel
    gap: 12, //..Espaco entre elementos
  },

  // === Botao nova conta ===
  // Linha do botao alinhado a direita
  newAccountRow: {
    flexDirection: 'row', //........Layout horizontal
    justifyContent: 'flex-end', //..Alinha conteudo a direita
  },
  // Botao nova conta
  newAccountButton: {
    flexDirection: 'row', //......Layout horizontal
    alignItems: 'center', //......Alinha vertical
    backgroundColor: '#1777CF', //..Fundo azul padrao
    borderRadius: 10, //..........Arredondamento leve
    paddingHorizontal: 14, //.....Espaco lateral
    paddingVertical: 14, //.......Espaco vertical aumentado
    gap: 6, //....................Espaco entre icone e texto
  },
  // Texto do botao nova conta
  newAccountButtonText: {
    fontSize: 13, //...............Tamanho da fonte
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
    color: '#FFFFFF', //...............Cor branca
  },

  // === Divisor ===
  // Divisor com "ou"
  orDivider: {
    flexDirection: 'row', //..Layout horizontal
    alignItems: 'center', //..Alinha vertical
    gap: 12, //...............Espaco entre elementos
    marginVertical: 2, //.....Espaco vertical
  },
  // Linha do divisor
  orLine: {
    flex: 1, //............Ocupa espaco disponivel
    height: StyleSheet.hairlineWidth, //..Linha ultrafina
    backgroundColor: '#D8E0F0', //........Cor da linha
  },
  // Texto "ou"
  orText: {
    fontSize: 12, //...............Tamanho da fonte
    fontFamily: 'Inter_500Medium', //..Fonte medium
    color: '#91929E', //............Cor terciaria
  },
  // Titulo da secao
  sectionTitle: {
    fontSize: 16, //...............Tamanho da fonte
    fontFamily: 'Inter_700Bold', //..Fonte bold
    color: '#3A3F51', //............Cor do texto
    marginBottom: 4, //............Espaco inferior
    marginLeft: 5, //..............Respiro esquerdo
  },

  // === Cards compactos de conta ===
  // Card de conta bancaria
  accountCard: {
    flexDirection: 'row', //......Layout horizontal
    alignItems: 'center', //......Alinha vertical
    backgroundColor: '#FCFCFC', //..Fundo branco
    borderRadius: 12, //..........Arredondamento
    borderWidth: 1, //............Borda fina
    borderColor: '#D8E0F0', //....Cor da borda
    paddingHorizontal: 14, //.....Espaco lateral
    paddingVertical: 12, //.......Espaco vertical
    gap: 12, //....................Espaco entre elementos
  },
  // Card de conta selecionado
  accountCardSelected: {
    borderColor: '#D8E0F0', //..Borda cinza padrao do sistema
    backgroundColor: 'rgba(23,119,207,0.03)', //..Fundo azul sutil
  },
  // Container do icone do banco
  bankIconBox: {
    width: 40, //..............Largura fixa
    height: 40, //.............Altura fixa
    borderRadius: 10, //.......Arredondamento
    backgroundColor: '#F4F4F4', //..Fundo cinza
    justifyContent: 'center', //...Centraliza vertical
    alignItems: 'center', //......Centraliza horizontal
  },
  // Container do icone selecionado
  bankIconBoxSelected: {
    backgroundColor: 'rgba(23,119,207,0.08)', //..Fundo azul sutil
  },
  // Informacoes da conta
  accountInfo: {
    flex: 1, //..Ocupa espaco disponivel
  },
  // Nome do banco
  accountBankName: {
    fontSize: 14, //...............Tamanho da fonte
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
    color: '#3A3F51', //............Cor do texto
  },
  // Nome do banco selecionado
  accountBankNameSelected: {
    color: '#1777CF', //..Cor accent
  },
  // Info do Pix
  accountPix: {
    fontSize: 12, //...............Tamanho da fonte
    fontFamily: 'Inter_500Medium', //..Fonte medium
    color: '#7D8592', //............Cor secundaria
    marginTop: 1, //...............Espaco minimo
  },
  // Container do botao menu (3 linhas)
  menuIconBox: {
    width: 32, //..............Largura fixa
    height: 32, //.............Altura fixa
    borderRadius: 8, //........Arredondamento leve
    backgroundColor: '#F4F4F4', //..Fundo cinza
    justifyContent: 'center', //...Centraliza vertical
    alignItems: 'center', //......Centraliza horizontal
  },
  // Badge conta padrao
  defaultBadge: {
    backgroundColor: 'rgba(23,119,207,0.08)', //..Azul sutil
    borderRadius: 4, //............Arredondamento
    paddingHorizontal: 6, //......Espaco lateral
    paddingVertical: 2, //........Espaco vertical
  },
  // Texto badge padrao
  defaultBadgeText: {
    fontSize: 10, //...............Tamanho da fonte
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
    color: '#1777CF', //............Cor accent
  },

  // === Estado vazio ===

  // Container do estado vazio (quando nao ha contas cadastradas)
  emptyContainer: {
    flex: 1, //.....................Preenche altura disponivel
    backgroundColor: '#FCFCFC', //..Fundo igual ao da tela
    borderWidth: 1, //..............Borda fina
    borderColor: '#D8E0F0', //......Cor da borda padrao
    borderRadius: 12, //............Arredondamento
    paddingHorizontal: 24, //.......Espaco lateral
    alignItems: 'center', //........Centraliza conteudo horizontal
    justifyContent: 'center', //....Centraliza conteudo vertical
    gap: 12, //.....................Espaco entre elementos
  },
  // Container do icone vazio
  emptyIconBox: {
    width: 80, //..............Largura fixa
    height: 80, //.............Altura fixa
    borderRadius: 14, //.......Arredondamento
    backgroundColor: '#F4F4F5', //..Fundo cinza sutil
    justifyContent: 'center', //...Centraliza vertical
    alignItems: 'center', //......Centraliza horizontal
    overflow: 'hidden', //........Recorta conteudo excedente
    marginBottom: 4, //............Espaco inferior extra
  },
  // Animacao Lottie do icone de banco
  lottieIcon: {
    width: 80, //..Largura da animacao
    height: 80, //..Altura da animacao
  },
  // Titulo do estado vazio
  emptyTitle: {
    fontSize: 15, //...............Tamanho da fonte
    fontFamily: 'Inter_700Bold', //..Fonte bold
    color: '#3A3F51', //............Cor do texto
    textAlign: 'center', //........Centralizado
  },
  // Subtitulo do estado vazio
  emptySubtitle: {
    fontSize: 13, //...............Tamanho da fonte
    fontFamily: 'Inter_400Regular', //..Fonte regular
    color: '#91929E', //............Cor terciaria
    textAlign: 'center', //........Centralizado
    lineHeight: 18, //..............Altura da linha
  },

  // === Menu de contexto (popover) ===
  // Overlay do menu de contexto
  menuOverlay: {
    flex: 1, //.................Ocupa toda a tela
    backgroundColor: 'rgba(0,0,0,0.35)', //..Fundo escuro sutil
    justifyContent: 'center', //..Centraliza vertical
    alignItems: 'center', //......Centraliza horizontal
    paddingHorizontal: 40, //.....Margem lateral
  },
  // Card do popover de menu
  menuPopover: {
    backgroundColor: '#FFFFFF', //..Fundo branco
    borderRadius: 14, //...........Arredondamento
    paddingVertical: 8, //..........Espaco vertical
    paddingHorizontal: 4, //.......Espaco lateral
    width: '100%', //..............Largura total
    shadowColor: '#000', //........Cor da sombra
    shadowOffset: { width: 0, height: 4 }, //..Offset da sombra
    shadowOpacity: 0.12, //.......Opacidade da sombra
    shadowRadius: 12, //..........Raio da sombra
    elevation: 8, //..............Elevacao Android
  },
  // Titulo do menu (nome da conta)
  menuTitle: {
    fontSize: 14, //...............Tamanho da fonte
    fontFamily: 'Inter_700Bold', //..Fonte bold
    color: '#3A3F51', //............Cor do texto
    paddingHorizontal: 14, //......Espaco lateral
    paddingTop: 8, //..............Espaco superior
    paddingBottom: 10, //.........Espaco inferior
  },
  // Opcao do menu
  menuOption: {
    flexDirection: 'row', //..Layout horizontal
    alignItems: 'center', //..Alinha vertical
    paddingVertical: 12, //...Espaco vertical
    paddingHorizontal: 14, //..Espaco lateral
    gap: 12, //................Espaco entre icone e texto
    borderRadius: 10, //.......Arredondamento
    marginHorizontal: 4, //...Margem lateral
  },
  // Container do icone na opcao do menu
  menuOptionIconBox: {
    width: 36, //..............Largura fixa
    height: 36, //.............Altura fixa
    borderRadius: 10, //.......Arredondamento
    backgroundColor: '#F4F4F4', //..Fundo cinza
    justifyContent: 'center', //...Centraliza vertical
    alignItems: 'center', //......Centraliza horizontal
  },
  // Container do icone de perigo (excluir)
  menuOptionIconDanger: {
    backgroundColor: 'rgba(229,57,53,0.08)', //..Fundo vermelho sutil
  },
  // Texto da opcao do menu
  menuOptionText: {
    fontSize: 15, //...............Tamanho da fonte
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
    color: '#3A3F51', //............Cor do texto
  },
  // Texto da opcao de perigo (excluir)
  menuOptionTextDanger: {
    color: '#E53935', //..Cor vermelha
  },
  // Divisor entre opcoes do menu
  menuDivider: {
    height: StyleSheet.hairlineWidth, //..Linha ultrafina
    backgroundColor: '#E8ECF0', //........Cor do divisor
    marginHorizontal: 14, //..............Margem lateral
  },

  // === Modal de confirmacao de exclusao (padrao do sistema) ===
  // Overlay do modal de exclusao
  deleteOverlay: {
    flex: 1, //.................Ocupa toda a tela
    backgroundColor: 'rgba(0,0,0,0.4)', //..Fundo escuro
    justifyContent: 'center', //..Centraliza vertical
    alignItems: 'center', //......Centraliza horizontal
    paddingHorizontal: 32, //....Margem lateral
  },
  // Container do modal de exclusao
  deleteModal: {
    width: 288, //................Largura fixa padrao
    backgroundColor: '#FAFAFA', //..Fundo neutro claro
    borderRadius: 16, //..........Arredondamento
    paddingTop: 28, //.............Espaco superior
    paddingBottom: 20, //..........Espaco inferior
    paddingHorizontal: 14, //......Espaco lateral
    alignItems: 'center', //.......Centraliza conteudo
    gap: 24, //....................Espaco entre secoes
  },
  // Container do icone de lixeira grande
  deleteIconBox: {
    width: 80, //..............Largura fixa
    height: 80, //.............Altura fixa
    borderRadius: 12, //.......Arredondamento
    backgroundColor: '#F4F4F5', //..Fundo cinza sutil
    justifyContent: 'center', //...Centraliza vertical
    alignItems: 'center', //......Centraliza horizontal
  },
  // Container dos textos do modal
  deleteTextBox: {
    alignItems: 'center', //..Centraliza textos
    gap: 6, //.................Espaco entre textos
  },
  // Mensagem principal do modal
  deleteMessage: {
    fontSize: 14, //...............Tamanho da fonte
    fontFamily: 'Inter_500Medium', //..Fonte medium
    color: '#3F3F46', //............Cor escura
    lineHeight: 20, //..............Altura da linha
    textAlign: 'center', //........Centralizado
  },
  // Texto de aviso (nao pode ser desfeita)
  deleteWarning: {
    fontSize: 14, //...............Tamanho da fonte
    fontFamily: 'Inter_500Medium', //..Fonte medium
    color: '#64748B', //............Cor cinza medio
    lineHeight: 20, //..............Altura da linha
    textAlign: 'center', //........Centralizado
  },
  // Container dos botoes do modal
  deleteButtons: {
    flexDirection: 'row', //..Layout horizontal
    gap: 10, //...............Espaco entre botoes
    alignSelf: 'stretch', //..Largura total
  },
  // Botao cancelar
  deleteCancelButton: {
    flex: 1, //....................Ocupa metade
    height: 40, //.................Altura fixa
    borderRadius: 10, //...........Arredondamento
    backgroundColor: '#F4F4F5', //..Fundo cinza sutil
    borderWidth: 0.5, //...........Borda fina
    borderColor: '#CBD5E1', //......Cor da borda
    justifyContent: 'center', //...Centraliza vertical
    alignItems: 'center', //.......Centraliza horizontal
  },
  // Texto do botao cancelar
  deleteCancelText: {
    fontSize: 14, //...............Tamanho da fonte
    fontFamily: 'Inter_700Bold', //..Fonte bold
    color: '#3F3F46', //............Cor escura
  },
  // Botao confirmar exclusao
  deleteConfirmButton: {
    flex: 1, //....................Ocupa metade
    height: 40, //.................Altura fixa
    borderRadius: 10, //...........Arredondamento
    backgroundColor: '#EF4444', //..Fundo vermelho
    justifyContent: 'center', //...Centraliza vertical
    alignItems: 'center', //.......Centraliza horizontal
  },
  // Texto do botao confirmar exclusao
  deleteConfirmText: {
    fontSize: 14, //...............Tamanho da fonte
    fontFamily: 'Inter_700Bold', //..Fonte bold
    color: '#FAFAFA', //............Cor branca
  },
});

// Export padrao
export default WithdrawDestination;
