// React e React Native
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Modal, StyleSheet } from 'react-native';

// Bibliotecas externas
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

// Tipos e dados
import { SavedBankAccount, TransferMethod, PixKeyType, NewAccountFormData, INITIAL_NEW_ACCOUNT, PIX_KEY_LABELS, PIX_KEY_OPTIONS, PIX_PLACEHOLDERS, PIX_KEYBOARDS, BRAZIL_BANKS, maskAgency, maskAccount, maskDocument, maskPixKey, validatePixKey, validateDocument } from './11.WithdrawData';

// Componentes
import BankSelectorModal from './15.BankSelectorModal';
import NewAccountDisplayTab, { getFormDisplayValue, EMPTY_PLACEHOLDER } from './17.NewAccountDisplayTab';
import { BankIcon } from './08.WalletMenuIcons';

// Tipo de campo avulso para exibicao no card
export type DisplayField = 'bankName' | 'agency' | 'account' | 'accountType' | 'pixKeyType' | 'pixKey' | 'holderName' | 'document' | 'nickname';

// Labels dos campos avulsos
export const DISPLAY_FIELD_LABELS: Record<DisplayField, string> = {
  bankName: 'Nome do banco', //............Label banco
  agency: 'Agência', //....................Label agencia
  account: 'Conta', //.......................Label conta
  accountType: 'Tipo de conta', //..........Label tipo conta
  pixKeyType: 'Tipo de chave Pix', //.......Label tipo pix
  pixKey: 'Número da chave Pix', //........Label pix
  holderName: 'Nome do titular', //........Label titular
  document: 'CPF/CNPJ do titular', //......Label documento
  nickname: 'Apelido da conta', //..........Label apelido
};

// Retorna valor do campo para exibicao (sem mascaras, 100% visivel)
export const getDisplayValue = (account: SavedBankAccount, field: DisplayField): string => {
  if (field === 'bankName') return account.bankName; //..Nome do banco
  if (field === 'agency') return `Ag ${account.agency}`; //..Agencia formatada
  if (field === 'account') return `Cc ${account.account}`; //..Conta formatada
  if (field === 'accountType') return account.accountType === 'corrente' ? 'Conta Corrente' : 'Conta Poupança'; //..Tipo conta
  if (field === 'pixKeyType') return account.pixKeyType ? PIX_KEY_LABELS[account.pixKeyType] : '—'; //..Tipo chave
  if (field === 'pixKey') return account.pixKey || '—'; //..Chave pix
  if (field === 'holderName') return account.holderName; //..Nome titular
  if (field === 'document') return account.document || '—'; //..CPF ou CNPJ
  if (field === 'nickname') return account.bankName || '—'; //..Apelido da conta
  return ''; //..Vazio fallback
};

// Converte conta salva em dados do formulario
const accountToFormData = (account: SavedBankAccount): NewAccountFormData => ({
  pixKeyType: account.pixKeyType || 'cpf', //..Tipo chave Pix
  pixKey: account.pixKey || '', //..............Chave Pix
  bankCode: account.bankCode, //................Codigo do banco
  agency: account.agency, //....................Agencia
  account: account.account, //..................Conta
  accountType: account.accountType, //..........Tipo da conta
  document: account.document || '', //..........CPF ou CNPJ
  saveAccount: true, //........................Ja salva
  nickname: '', //.............................Apelido vazio
  isDefault: account.isDefault, //..............Conta padrao
});

// Interface do componente
interface EditAccountModalProps {
  visible: boolean; //..................Visibilidade do modal
  account: SavedBankAccount | null; //..Conta sendo editada
  selectedFields: DisplayField[]; //....Campos selecionados (ordenados)
  onFieldsChange: (fields: DisplayField[]) => void; //..Callback campos
  onSave: (formData: NewAccountFormData) => void; //..Callback salvar dados
  onClose: () => void; //...............Callback fechar
}

// Tipo da aba ativa no modal
type FormTab = 'pix' | 'transfer' | 'extras' | 'display';

// Labels dos tipos de conta
const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  corrente: 'Conta Corrente', //..Label corrente
  poupanca: 'Conta Poupança', //..Label poupanca
};

// Opcoes de tipo de conta para dropdown
const ACCOUNT_TYPE_OPTIONS = [
  { value: 'corrente', label: 'Conta Corrente' }, //..Opcao corrente
  { value: 'poupanca', label: 'Conta Poupança' }, //..Opcao poupanca
];

// Icone X para fechar o modal
const CloseIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path d="M6 6L18 18M18 6L6 18" stroke="#3A3F51" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

// Icone X slim para limpar campo
const ClearIcon = () => (
  <Svg width="12" height="12" viewBox="0 0 24 24" fill="none">
    <Path d="M6 6L18 18M18 6L6 18" stroke="#91929E" strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

// Icone de checkbox com cantos arredondados e tamanho maior
const CheckboxIcon = ({ checked }: { checked: boolean }) => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    {checked ? (
      <>
        <Path d="M3 7C3 4.79086 4.79086 3 7 3H17C19.2091 3 21 4.79086 21 7V17C21 19.2091 19.2091 21 17 21H7C4.79086 21 3 19.2091 3 17V7Z" fill="#1777CF" />
        <Path d="M8 12L11 15L16 9" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ) : (
      <Path d="M3 7C3 4.79086 4.79086 3 7 3H17C19.2091 3 21 4.79086 21 7V17C21 19.2091 19.2091 21 17 21H7C4.79086 21 3 19.2091 3 17V7Z" stroke="#D8E0F0" strokeWidth="2" />
    )}
  </Svg>
);

// Icone de chevron para dropdown
const ChevronDownIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <Path d="M6 9L12 15L18 9" stroke="#7D8592" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);


// Modal de edicao de conta bancaria
// Tela inteira com 4 abas: Pix, Transferencia, Extras e Exibicao (identico ao cadastro)
const EditAccountModal: React.FC<EditAccountModalProps> = ({
  visible, account, selectedFields, onFieldsChange, onSave, onClose,
}) => {
  // Estado interno do formulario (convertido da conta salva)
  const [formData, setFormData] = useState<NewAccountFormData>(() => account ? accountToFormData(account) : INITIAL_NEW_ACCOUNT); //..Dados do formulario

  // Metodo de transferencia (inferido da conta)
  const [transferMethod, setTransferMethod] = useState<TransferMethod>(() => account?.pixKeyType ? 'pix' : 'transfer'); //..Metodo atual

  // Aba ativa do modal
  const [activeTab, setActiveTab] = useState<FormTab>(() => account?.pixKeyType ? 'pix' : 'transfer'); //..Aba inicial

  // Estado dos modais de dropdown
  const [showPixTypeModal, setShowPixTypeModal] = useState(false); //........Modal tipo Pix
  const [showBankModal, setShowBankModal] = useState(false); //..............Modal seletor banco
  const [showAccountTypeModal, setShowAccountTypeModal] = useState(false); //..Modal tipo conta

  // Estado de arraste (desabilita scroll durante drag)
  const [isDragging, setIsDragging] = useState(false); //..Arraste ativo

  // Estado de campos tocados (onBlur ativa validacao strict)
  const [pixKeyTouched, setPixKeyTouched] = useState(false); //..Chave Pix perdeu foco
  const [documentTouched, setDocumentTouched] = useState(false); //..Documento perdeu foco

  // Reinicializa ao abrir com nova conta
  useEffect(() => {
    if (visible && account) {
      setFormData(accountToFormData(account)); //..Converte dados
      setTransferMethod(account.pixKeyType ? 'pix' : 'transfer'); //..Define metodo
      setActiveTab(account.pixKeyType ? 'pix' : 'transfer'); //..Define aba
      setPixKeyTouched(false); //..Reseta Pix
      setDocumentTouched(false); //..Reseta documento
    }
  }, [visible, account?.id]);

  // Inicializa campos de exibicao com padrao quando vazio
  useEffect(() => {
    if (visible && account && selectedFields.length === 0) {
      onFieldsChange(['bankName', 'pixKey']); //..Define padrao banco + chave pix
    }
  }, [visible, account?.id]);

  // Campos de exibicao efetivos (padrao imediato antes do useEffect propagar)
  const effectiveFields: DisplayField[] = selectedFields.length > 0 ? selectedFields : ['bankName', 'pixKey']; //..Fallback

  // Erros de validacao (strict quando campo ja perdeu foco)
  const pixKeyError = validatePixKey(formData.pixKey, formData.pixKeyType, pixKeyTouched); //..Erro chave Pix
  const documentError = validateDocument(formData.document, documentTouched); //..Erro documento

  // Label do tipo de chave Pix selecionada
  const selectedPixLabel = PIX_KEY_LABELS[formData.pixKeyType]; //..Label atual

  // Nome do banco selecionado para exibicao
  const bankDisplay = BRAZIL_BANKS.find(b => b.code === formData.bankCode); //..Busca banco
  const bankLabel = bankDisplay ? `${bankDisplay.code} - ${bankDisplay.name}` : ''; //..Label formatada

  // Handler de atualizar campo do formulario
  const handleFieldChange = (field: keyof NewAccountFormData, value: string | boolean | PixKeyType) => {
    setFormData(prev => ({ ...prev, [field]: value })); //..Atualiza campo
  };

  // Handler de selecao de banco
  const handleBankSelect = (code: string, _name: string) => {
    handleFieldChange('bankCode', code); //..Define banco
    setShowBankModal(false); //................Fecha modal
  };

  // Handler de troca de aba (sincroniza metodo de transferencia)
  const handleTabChange = (tab: FormTab) => {
    setActiveTab(tab); //..Define aba
    if (tab === 'pix') setTransferMethod('pix'); //..Sincroniza metodo
    if (tab === 'transfer') setTransferMethod('transfer'); //..Sincroniza metodo
  };

  if (!account) return null; //..Sem conta, nao renderiza

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header com titulo e botao fechar */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Editar conta</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <CloseIcon />
            </TouchableOpacity>
          </View>

          {/* Card de preview com degradê azul (identico ao modal de cadastro) */}
          <LinearGradient colors={['#0D3B73', '#1565B8', '#0D3B73']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.previewCard}>
            <View style={styles.previewIconBox}>
              <BankIcon color="#FFFFFF" />
            </View>
            <View style={styles.previewInfo}>
              <Text style={[styles.previewLine1, getFormDisplayValue(formData, effectiveFields[0]) === EMPTY_PLACEHOLDER && styles.previewLineEmpty]}>
                {getFormDisplayValue(formData, effectiveFields[0])}
              </Text>
              <Text style={[styles.previewLine2, (effectiveFields.length < 2 || getFormDisplayValue(formData, effectiveFields[1]) === EMPTY_PLACEHOLDER) && styles.previewLineEmpty]}>
                {effectiveFields.length >= 2 ? getFormDisplayValue(formData, effectiveFields[1]) : EMPTY_PLACEHOLDER}
              </Text>
            </View>
          </LinearGradient>

          {/* Toggle de 4 abas (auto-width) */}
          <View style={styles.tabToggle}>
            <TouchableOpacity
              style={[styles.tabSegment, styles.tabSegmentPix, activeTab === 'pix' && styles.tabSegmentActive]}
              onPress={() => handleTabChange('pix')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === 'pix' && styles.tabTextActive]}>Pix</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabSegment, activeTab === 'transfer' && styles.tabSegmentActive]}
              onPress={() => handleTabChange('transfer')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === 'transfer' && styles.tabTextActive]}>Transferência</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabSegment, activeTab === 'extras' && styles.tabSegmentActive]}
              onPress={() => handleTabChange('extras')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === 'extras' && styles.tabTextActive]}>Extras</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabSegment, activeTab === 'display' && styles.tabSegmentActive]}
              onPress={() => handleTabChange('display')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === 'display' && styles.tabTextActive]}>Exibição</Text>
            </TouchableOpacity>
          </View>

          {/* Conteudo rolavel do formulario */}
          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent} contentContainerStyle={styles.scrollInner} keyboardShouldPersistTaps="handled" scrollEnabled={!isDragging}>
            {/* === Aba Pix === */}
            {activeTab === 'pix' && (
              <>
                {/* Dropdown tipo de chave */}
                <Text style={styles.fieldLabel}>Tipo de chave</Text>
                <TouchableOpacity style={styles.dropdown} onPress={() => setShowPixTypeModal(true)} activeOpacity={0.7}>
                  <Text style={styles.dropdownText}>{selectedPixLabel}</Text>
                  <ChevronDownIcon />
                </TouchableOpacity>

                {/* Campo chave Pix */}
                <Text style={styles.fieldLabel}>Chave Pix</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.textInput, pixKeyError && styles.textInputError]}
                    placeholder={PIX_PLACEHOLDERS[formData.pixKeyType]}
                    placeholderTextColor="#91929E"
                    value={formData.pixKey}
                    onChangeText={(t) => handleFieldChange('pixKey', maskPixKey(t, formData.pixKeyType))}
                    onBlur={() => setPixKeyTouched(true)}
                    keyboardType={PIX_KEYBOARDS[formData.pixKeyType]}
                    autoCapitalize="none"
                    underlineColorAndroid="transparent"
                  />
                  {formData.pixKey ? (
                    <TouchableOpacity style={styles.clearButton} onPress={() => { handleFieldChange('pixKey', ''); setPixKeyTouched(false); }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <ClearIcon />
                    </TouchableOpacity>
                  ) : null}
                </View>
                {pixKeyError && (
                  <Text style={styles.errorText}>{pixKeyError}</Text>
                )}

                {/* Checkbox salvar conta */}
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => handleFieldChange('saveAccount', !formData.saveAccount)}
                  activeOpacity={0.7}
                >
                  <CheckboxIcon checked={formData.saveAccount} />
                  <Text style={styles.checkboxLabel}>Salvar esta conta para próximos resgates</Text>
                </TouchableOpacity>
              </>
            )}

            {/* === Aba Transferencia === */}
            {activeTab === 'transfer' && (
              <>
                {/* Campo 1: Banco (seletor com busca) */}
                <Text style={styles.fieldLabel}>Banco</Text>
                <TouchableOpacity style={styles.dropdown} onPress={() => setShowBankModal(true)} activeOpacity={0.7}>
                  <Text style={[styles.dropdownText, !bankLabel && styles.dropdownPlaceholder]}>
                    {bankLabel || 'Selecione o banco'}
                  </Text>
                  <ChevronDownIcon />
                </TouchableOpacity>

                {/* Campo 2: Agencia */}
                <Text style={styles.fieldLabel}>Agência</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="0000-0"
                    placeholderTextColor="#91929E"
                    value={formData.agency}
                    onChangeText={(t) => handleFieldChange('agency', maskAgency(t))}
                    keyboardType="numeric"
                    maxLength={6}
                    underlineColorAndroid="transparent"
                  />
                  {formData.agency ? (
                    <TouchableOpacity style={styles.clearButton} onPress={() => handleFieldChange('agency', '')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <ClearIcon />
                    </TouchableOpacity>
                  ) : null}
                </View>

                {/* Campo 3: Numero da conta */}
                <Text style={styles.fieldLabel}>Conta</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="00000000-0"
                    placeholderTextColor="#91929E"
                    value={formData.account}
                    onChangeText={(t) => handleFieldChange('account', maskAccount(t))}
                    keyboardType="numeric"
                    maxLength={15}
                    underlineColorAndroid="transparent"
                  />
                  {formData.account ? (
                    <TouchableOpacity style={styles.clearButton} onPress={() => handleFieldChange('account', '')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <ClearIcon />
                    </TouchableOpacity>
                  ) : null}
                </View>

                {/* Campo 4: Tipo de conta (dropdown) */}
                <Text style={styles.fieldLabel}>Tipo de conta</Text>
                <TouchableOpacity style={styles.dropdown} onPress={() => setShowAccountTypeModal(true)} activeOpacity={0.7}>
                  <Text style={styles.dropdownText}>{ACCOUNT_TYPE_LABELS[formData.accountType]}</Text>
                  <ChevronDownIcon />
                </TouchableOpacity>

                {/* Campo 5: CPF/CNPJ do titular */}
                <Text style={styles.fieldLabel}>CPF/CNPJ do titular</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.textInput, documentError && styles.textInputError]}
                    placeholder="000.000.000-00"
                    placeholderTextColor="#91929E"
                    value={formData.document}
                    onChangeText={(t) => handleFieldChange('document', maskDocument(t))}
                    onBlur={() => setDocumentTouched(true)}
                    keyboardType="numeric"
                    maxLength={18}
                    underlineColorAndroid="transparent"
                  />
                  {formData.document ? (
                    <TouchableOpacity style={styles.clearButton} onPress={() => { handleFieldChange('document', ''); setDocumentTouched(false); }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <ClearIcon />
                    </TouchableOpacity>
                  ) : null}
                </View>
                {documentError && (
                  <Text style={styles.errorText}>{documentError}</Text>
                )}

                {/* Checkbox salvar conta */}
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => handleFieldChange('saveAccount', !formData.saveAccount)}
                  activeOpacity={0.7}
                >
                  <CheckboxIcon checked={formData.saveAccount} />
                  <Text style={styles.checkboxLabel}>Salvar esta conta para próximos resgates</Text>
                </TouchableOpacity>
              </>
            )}

            {/* === Aba Extras === */}
            {activeTab === 'extras' && (
              <>
                {/* Secao: Apelido da conta */}
                <View style={styles.extrasCard}>
                  <Text style={styles.extrasCardTitle}>Apelido da conta</Text>
                  <Text style={styles.extrasCardDescription}>Dê um nome para identificar esta conta facilmente.</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Ex: Minha conta Nubank"
                      placeholderTextColor="#91929E"
                      value={formData.nickname}
                      onChangeText={(t) => handleFieldChange('nickname', t.slice(0, 30))}
                      underlineColorAndroid="transparent"
                    />
                    {formData.nickname ? (
                      <TouchableOpacity style={styles.clearButton} onPress={() => handleFieldChange('nickname', '')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <ClearIcon />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                  <Text style={styles.helperText}>Máximo 30 caracteres ({formData.nickname.length}/30)</Text>
                </View>

                {/* Secao: Conta principal */}
                <TouchableOpacity
                  style={[styles.extrasCard, styles.defaultCard, formData.isDefault && styles.defaultCardActive]}
                  onPress={() => handleFieldChange('isDefault', !formData.isDefault)}
                  activeOpacity={0.7}
                >
                  <View style={styles.defaultCardRow}>
                    <View style={styles.defaultCardInfo}>
                      <Text style={[styles.extrasCardTitle, formData.isDefault && styles.defaultCardTitleActive]}>Conta principal</Text>
                      <Text style={styles.extrasCardDescription}>Esta conta será selecionada automaticamente em futuros resgates.</Text>
                    </View>
                  </View>
                  <View style={[styles.toggleTrack, formData.isDefault && styles.toggleTrackActive]}>
                    <View style={[styles.toggleThumb, formData.isDefault && styles.toggleThumbActive]} />
                  </View>
                </TouchableOpacity>

                {/* Secao: Checkbox salvar conta */}
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => handleFieldChange('saveAccount', !formData.saveAccount)}
                  activeOpacity={0.7}
                >
                  <CheckboxIcon checked={formData.saveAccount} />
                  <Text style={styles.checkboxLabel}>Salvar esta conta para próximos resgates</Text>
                </TouchableOpacity>
              </>
            )}

            {/* === Aba Exibicao === */}
            {activeTab === 'display' && (
              <NewAccountDisplayTab
                newAccountData={formData}
                selectedFields={selectedFields}
                onFieldsChange={onFieldsChange}
                onDragStateChange={setIsDragging}
              />
            )}
          </ScrollView>

          {/* Botao confirmar fixo no rodape */}
          <TouchableOpacity style={styles.confirmButton} onPress={() => { onSave(formData); onClose(); }} activeOpacity={0.7}>
            <Text style={styles.confirmText}>Confirmar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal seletor de banco (com busca) */}
      <BankSelectorModal
        visible={showBankModal}
        selectedCode={formData.bankCode}
        onSelect={handleBankSelect}
        onClose={() => setShowBankModal(false)}
      />

      {/* Modal dropdown tipo Pix */}
      <Modal visible={showPixTypeModal} transparent animationType="fade" onRequestClose={() => setShowPixTypeModal(false)}>
        <TouchableOpacity style={styles.dropdownOverlay} activeOpacity={1} onPress={() => setShowPixTypeModal(false)}>
          <View style={styles.dropdownModal}>
            <Text style={styles.dropdownModalTitle}>Tipo de chave Pix</Text>
            {PIX_KEY_OPTIONS.map((option, index) => (
              <React.Fragment key={option.value}>
                {index > 0 && <View style={styles.modalDivider} />}
                <TouchableOpacity
                  style={[styles.dropdownOption, formData.pixKeyType === option.value && styles.dropdownOptionActive]}
                  onPress={() => { handleFieldChange('pixKeyType', option.value); handleFieldChange('pixKey', ''); setPixKeyTouched(false); setShowPixTypeModal(false); }}
                >
                  <Text style={[styles.dropdownOptionText, formData.pixKeyType === option.value && styles.dropdownOptionTextActive]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal dropdown tipo de conta */}
      <Modal visible={showAccountTypeModal} transparent animationType="fade" onRequestClose={() => setShowAccountTypeModal(false)}>
        <TouchableOpacity style={styles.dropdownOverlay} activeOpacity={1} onPress={() => setShowAccountTypeModal(false)}>
          <View style={styles.dropdownModal}>
            <Text style={styles.dropdownModalTitle}>Tipo de conta</Text>
            {ACCOUNT_TYPE_OPTIONS.map((option, index) => (
              <React.Fragment key={option.value}>
                {index > 0 && <View style={styles.modalDivider} />}
                <TouchableOpacity
                  style={[styles.dropdownOption, formData.accountType === option.value && styles.dropdownOptionActive]}
                  onPress={() => { handleFieldChange('accountType', option.value); setShowAccountTypeModal(false); }}
                >
                  <Text style={[styles.dropdownOptionText, formData.accountType === option.value && styles.dropdownOptionTextActive]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </Modal>
  );
};

// Estilos do modal de edicao de conta
const styles = StyleSheet.create({
  // Overlay do modal (tela inteira)
  modalOverlay: {
    flex: 1, //...............Ocupa toda a tela
    backgroundColor: '#FCFCFC', //..Fundo branco solido
  },
  // Conteudo do modal (altura total)
  modalContent: {
    flex: 1, //................Ocupa toda a tela
    paddingHorizontal: 24, //..Espaco lateral
    paddingTop: 16, //.........Espaco superior
    paddingBottom: 24, //.......Espaco inferior
  },
  // Header com titulo e botao fechar
  modalHeader: {
    flexDirection: 'row', //..........Layout horizontal
    alignItems: 'center', //..........Alinha vertical
    justifyContent: 'space-between', //..Espaco entre titulo e X
    marginBottom: 16, //..............Espaco inferior
  },
  // Titulo do modal
  modalTitle: {
    fontSize: 18, //...............Tamanho da fonte
    fontFamily: 'Inter_700Bold', //..Fonte bold
    color: '#3A3F51', //............Cor do texto
    marginLeft: 5, //..............Respiro esquerdo
  },
  // Botao fechar (X)
  closeButton: {
    width: 36, //..............Largura da area de toque
    height: 36, //.............Altura da area de toque
    borderRadius: 8, //........Cantos levemente arredondados
    backgroundColor: '#F4F4F4', //..Fundo cinza sutil
    justifyContent: 'center', //..Centraliza vertical
    alignItems: 'center', //......Centraliza horizontal
  },

  // === Card de preview com degradê ===

  // Container do preview (gradiente aplicado via LinearGradient)
  previewCard: {
    flexDirection: 'row', //..Layout horizontal
    alignItems: 'center', //..Alinha vertical
    gap: 12, //...............Espaco entre icone e texto
    borderRadius: 12, //......Arredondamento
    padding: 14, //...........Espaco interno
    marginBottom: 16, //.......Espaco inferior
    overflow: 'hidden', //.....Recorta gradiente no arredondamento
  },
  // Icone do banco no preview
  previewIconBox: {
    width: 40, //..............Largura fixa
    height: 40, //.............Altura fixa
    borderRadius: 10, //.......Arredondamento
    backgroundColor: 'rgba(255,255,255,0.15)', //..Fundo branco sutil
    justifyContent: 'center', //...Centraliza vertical
    alignItems: 'center', //......Centraliza horizontal
  },
  // Informacoes do preview
  previewInfo: {
    flex: 1, //..Ocupa espaco disponivel
  },
  // Linha 1 do preview (titulo branco)
  previewLine1: {
    fontSize: 15, //...............Tamanho da fonte
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
    color: '#FFFFFF', //............Cor branca
  },
  // Linha 2 do preview (subtitulo branco translucido)
  previewLine2: {
    fontSize: 12, //...............Tamanho da fonte
    fontFamily: 'Inter_500Medium', //..Fonte medium
    color: 'rgba(255,255,255,0.7)', //..Cor branca translucida
    marginTop: 2, //...............Espaco minimo
  },
  // Texto vazio do preview (placeholder branco translucido)
  previewLineEmpty: {
    color: 'rgba(255,255,255,0.4)', //..Cor branca sutil
  },

  // === Toggle de 4 abas (auto-width) ===

  // Container do toggle de abas
  tabToggle: {
    flexDirection: 'row', //..Layout horizontal
    backgroundColor: '#F4F4F4', //..Fundo cinza
    borderRadius: 12, //..........Arredondamento
    padding: 3, //................Espaco interno
    marginBottom: 16, //..........Espaco inferior
  },
  // Segmento da aba (largura baseada no conteudo)
  tabSegment: {
    flexGrow: 1, //.............Distribui espaco restante
    paddingVertical: 12, //....Espaco vertical padrao
    paddingHorizontal: 10, //..Espaco lateral padrao
    alignItems: 'center', //..Centraliza texto
    borderRadius: 10, //......Arredondamento
  },
  // Segmento Pix (padding maior para nao ficar pequeno)
  tabSegmentPix: {
    paddingHorizontal: 15, //..Espaco lateral maior
  },
  // Segmento ativo
  tabSegmentActive: {
    backgroundColor: '#1777CF', //..Fundo azul
  },
  // Texto do segmento
  tabText: {
    fontSize: 13, //.................Tamanho da fonte
    fontFamily: 'Inter_500Medium', //..Fonte medium
    color: '#7D8592', //..............Cor secundaria
  },
  // Texto segmento ativo
  tabTextActive: {
    color: '#FFFFFF', //..............Cor branca
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
  },

  // === Conteudo rolavel ===

  // ScrollView do formulario
  scrollContent: {
    flex: 1, //..Ocupa espaco disponivel
  },
  // Conteudo interno do scroll
  scrollInner: {
    gap: 8, //............Espaco entre campos
    paddingBottom: 48, //..Respiro inferior generoso
  },

  // === Labels e inputs ===

  // Label de campo
  fieldLabel: {
    fontSize: 12, //...............Tamanho da fonte
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
    color: '#7D8592', //............Cor secundaria
    marginBottom: 2, //............Proximo do campo abaixo
    marginLeft: 5, //..............Respiro esquerdo
    marginTop: 10, //..............Distante do campo acima
  },
  // Wrapper do input (posiciona botao X)
  inputWrapper: {
    position: 'relative', //..Referencia para posicao absoluta
  },
  // Input de texto
  textInput: {
    borderWidth: 1, //..............Borda
    borderColor: '#D8E0F0', //......Cor da borda
    borderRadius: 10, //............Arredondamento
    paddingHorizontal: 14, //......Espaco lateral
    paddingRight: 36, //...........Espaco para botao X
    paddingVertical: 11, //........Espaco vertical
    fontSize: 14, //...............Tamanho da fonte
    fontFamily: 'Inter_500Medium', //..Fonte medium
    color: '#3A3F51', //............Cor do texto
    outlineStyle: 'none', //........Remove borda de foco web
  },
  // Input com erro de validacao
  textInputError: {
    borderColor: '#E53935', //..Borda vermelha
  },
  // Texto de erro abaixo do input
  errorText: {
    fontSize: 12, //...............Tamanho da fonte
    fontFamily: 'Inter_500Medium', //..Fonte medium
    color: '#E53935', //............Cor vermelha
    marginTop: 4, //...............Espaco superior
    marginLeft: 5, //..............Respiro esquerdo
  },
  // Botao X para limpar campo
  clearButton: {
    position: 'absolute', //......Posicao absoluta
    right: 12, //..................Alinhado a direita
    top: 0, //.....................Topo do input
    bottom: 0, //..................Base do input
    justifyContent: 'center', //..Centraliza vertical
    alignItems: 'center', //......Centraliza horizontal
    width: 20, //..................Area de toque
  },

  // === Dropdown ===

  // Botao dropdown
  dropdown: {
    flexDirection: 'row', //......Layout horizontal
    justifyContent: 'space-between', //..Espaco entre
    alignItems: 'center', //......Alinha vertical
    borderWidth: 1, //............Borda
    borderColor: '#D8E0F0', //....Cor da borda
    borderRadius: 10, //..........Arredondamento
    paddingHorizontal: 14, //....Espaco lateral
    paddingVertical: 12, //......Espaco vertical
  },
  // Texto do dropdown
  dropdownText: {
    fontSize: 14, //...............Tamanho da fonte
    fontFamily: 'Inter_500Medium', //..Fonte medium
    color: '#3A3F51', //............Cor do texto
  },
  // Placeholder do dropdown
  dropdownPlaceholder: {
    color: '#91929E', //..Cor placeholder
  },

  // === Checkbox ===

  // Linha do checkbox
  checkboxRow: {
    flexDirection: 'row', //..Layout horizontal
    alignItems: 'center', //..Alinha vertical
    gap: 10, //...............Espaco entre check e texto
    marginTop: 12, //.........Espaco superior
  },
  // Label do checkbox
  checkboxLabel: {
    flex: 1, //....................Ocupa espaco disponivel
    fontSize: 13, //...............Tamanho da fonte
    fontFamily: 'Inter_400Regular', //..Fonte regular
    color: '#3A3F51', //............Cor do texto
  },

  // === Aba Extras ===

  // Card de secao extras
  extrasCard: {
    backgroundColor: '#FCFCFC', //..Fundo branco
    borderRadius: 12, //...........Arredondamento
    borderWidth: 1, //.............Borda fina
    borderColor: '#D8E0F0', //......Cor da borda cinza padrao
    padding: 16, //................Espaco interno
    gap: 8, //.....................Espaco entre elementos
  },
  // Titulo do card extras
  extrasCardTitle: {
    fontSize: 14, //...............Tamanho da fonte
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
    color: '#3A3F51', //............Cor do texto
  },
  // Descricao do card extras
  extrasCardDescription: {
    fontSize: 12, //...............Tamanho da fonte
    fontFamily: 'Inter_400Regular', //..Fonte regular
    color: '#91929E', //............Cor terciaria
    lineHeight: 18, //..............Altura da linha
  },
  // Texto auxiliar (contador caracteres)
  helperText: {
    fontSize: 11, //...............Tamanho da fonte
    fontFamily: 'Inter_400Regular', //..Fonte regular
    color: '#91929E', //............Cor terciaria
    marginLeft: 5, //..............Respiro esquerdo
  },

  // === Card conta principal ===

  // Card de conta principal (touchable)
  defaultCard: {
    gap: 12, //..Espaco entre elementos
  },
  // Card de conta principal ativo
  defaultCardActive: {
    borderColor: 'rgba(23,119,207,0.4)', //..Borda azul sutil
    backgroundColor: 'rgba(23,119,207,0.03)', //..Fundo azul sutil
  },
  // Linha do card conta principal (icone + textos)
  defaultCardRow: {
    flexDirection: 'row', //..Layout horizontal
    alignItems: 'flex-start', //..Alinha no topo
    gap: 12, //..................Espaco entre estrela e textos
  },
  // Textos do card conta principal
  defaultCardInfo: {
    flex: 1, //..Ocupa espaco disponivel
    gap: 4, //...Espaco entre titulo e descricao
  },
  // Titulo ativo do card conta principal
  defaultCardTitleActive: {
    color: '#1777CF', //..Cor accent
  },

  // === Toggle switch ===

  // Trilha do toggle
  toggleTrack: {
    width: 44, //..............Largura da trilha
    height: 24, //.............Altura da trilha
    borderRadius: 12, //.......Arredondamento total
    backgroundColor: '#D8E0F0', //..Cor inativa
    justifyContent: 'center', //..Centraliza vertical
    paddingHorizontal: 2, //......Espaco interno
    alignSelf: 'flex-end', //......Alinha a direita
  },
  // Trilha do toggle ativo
  toggleTrackActive: {
    backgroundColor: '#1777CF', //..Cor azul
  },
  // Bolinha do toggle
  toggleThumb: {
    width: 20, //..............Largura da bolinha
    height: 20, //.............Altura da bolinha
    borderRadius: 10, //.......Circular
    backgroundColor: '#FFFFFF', //..Cor branca
  },
  // Bolinha do toggle ativo
  toggleThumbActive: {
    alignSelf: 'flex-end', //..Alinha a direita
  },

  // === Botao confirmar fixo ===

  // Botao confirmar
  confirmButton: {
    backgroundColor: '#1777CF', //..Fundo azul
    borderRadius: 12, //...........Arredondamento
    paddingVertical: 14, //........Espaco vertical
    alignItems: 'center', //.......Centraliza
    marginTop: 16, //..............Espaco superior
  },
  // Texto do botao confirmar
  confirmText: {
    fontSize: 16, //...............Tamanho da fonte
    fontFamily: 'Inter_700Bold', //..Fonte bold
    color: '#FFFFFF', //............Cor branca
  },

  // === Modais de dropdown ===

  // Overlay do modal dropdown
  dropdownOverlay: {
    flex: 1, //.................Ocupa toda a tela
    backgroundColor: 'rgba(0,0,0,0.4)', //..Fundo escuro
    justifyContent: 'center', //..Centraliza
    paddingHorizontal: 32, //....Margem lateral
  },
  // Container do modal dropdown
  dropdownModal: {
    backgroundColor: '#FCFCFC', //..Fundo branco
    borderRadius: 16, //..........Arredondamento
    padding: 20, //...............Espaco interno
  },
  // Titulo do modal dropdown
  dropdownModalTitle: {
    fontSize: 16, //...............Tamanho da fonte
    fontFamily: 'Inter_700Bold', //..Fonte bold
    color: '#3A3F51', //............Cor do texto
    marginBottom: 12, //..........Espaco inferior
    marginLeft: 5, //..............Respiro esquerdo
  },
  // Divisoria entre opcoes do modal
  modalDivider: {
    height: 1, //..............Espessura fina
    backgroundColor: '#E8EDF5', //..Cor cinza sutil
    marginHorizontal: 4, //....Respiro lateral
  },
  // Opcao do modal dropdown
  dropdownOption: {
    paddingVertical: 12, //......Espaco vertical
    paddingHorizontal: 8, //....Espaco lateral
    borderRadius: 8, //..........Arredondamento
  },
  // Opcao ativa do modal dropdown
  dropdownOptionActive: {
    backgroundColor: '#F0F7FF', //..Fundo azul sutil
  },
  // Texto da opcao
  dropdownOptionText: {
    fontSize: 14, //...............Tamanho da fonte
    fontFamily: 'Inter_500Medium', //..Fonte medium
    color: '#3A3F51', //............Cor do texto
  },
  // Texto opcao ativa
  dropdownOptionTextActive: {
    color: '#1777CF', //..............Cor accent
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
  },
});

// Export padrao
export default EditAccountModal;
