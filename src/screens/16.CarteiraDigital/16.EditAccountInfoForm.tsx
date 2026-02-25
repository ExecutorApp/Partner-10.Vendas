// React e React Native
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';

// Bibliotecas externas
import Svg, { Path } from 'react-native-svg';

// Tipos e dados
import { SavedBankAccount, EditAccountFormData, PixKeyType, PIX_KEY_LABELS, PIX_KEY_OPTIONS, PIX_PLACEHOLDERS, PIX_KEYBOARDS, BRAZIL_BANKS, createEditFormFromAccount, maskAgency, maskAccount, maskDocument, maskPixKey } from './11.WithdrawData';

// Componentes
import BankSelectorModal from './15.BankSelectorModal';

// Interface do componente
interface EditAccountInfoFormProps {
  account: SavedBankAccount; //..Conta sendo editada
}

// Icone de chevron para dropdown
const ChevronDownIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <Path d="M6 9L12 15L18 9" stroke="#7D8592" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Icone X slim para limpar campo
const ClearIcon = () => (
  <Svg width="12" height="12" viewBox="0 0 24 24" fill="none">
    <Path d="M6 6L18 18M18 6L6 18" stroke="#91929E" strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

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

// Formulario completo de informacoes da conta bancaria
// Blocos: Dados bancarios, Chave Pix, Dados do titular, Salvamento
const EditAccountInfoForm: React.FC<EditAccountInfoFormProps> = ({ account }) => {
  // Estado do formulario
  const [form, setForm] = useState<EditAccountFormData>(() => createEditFormFromAccount(account)); //..Dados iniciais

  // Estado dos modais
  const [showBankModal, setShowBankModal] = useState(false); //..........Modal seletor banco
  const [showPixTypeModal, setShowPixTypeModal] = useState(false); //...Modal tipo Pix
  const [showAccountTypeModal, setShowAccountTypeModal] = useState(false); //..Modal tipo conta

  // Reseta formulario ao trocar conta
  useEffect(() => {
    setForm(createEditFormFromAccount(account)); //..Reinicializa
  }, [account.id]);

  // Handler generico de campo
  const updateField = (field: keyof EditAccountFormData, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value })); //..Atualiza campo
  };

  // Handler de selecao de banco
  const handleBankSelect = (code: string, name: string) => {
    setForm(prev => ({ ...prev, bankCode: code, bankName: name })); //..Define banco
    setShowBankModal(false); //..Fecha modal
  };

  // Handler de selecao de tipo Pix
  const handlePixTypeSelect = (type: PixKeyType) => {
    setForm(prev => ({ ...prev, pixKeyType: type, pixKey: '' })); //..Define tipo e limpa chave
    setShowPixTypeModal(false); //..Fecha modal
  };

  // Nome do banco selecionado para exibicao
  const bankDisplay = BRAZIL_BANKS.find(b => b.code === form.bankCode); //..Busca banco
  const bankLabel = bankDisplay ? `${bankDisplay.code} - ${bankDisplay.name}` : ''; //..Label formatada

  return (
    <View style={styles.container}>
      {/* ====== BLOCO 1: Dados bancarios ====== */}
      <Text style={styles.sectionTitle}>Dados bancários</Text>

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
          value={form.agency}
          onChangeText={(t) => updateField('agency', maskAgency(t))}
          keyboardType="numeric"
          maxLength={6}
          underlineColorAndroid="transparent"
        />
        {form.agency ? (
          <TouchableOpacity style={styles.clearButton} onPress={() => updateField('agency', '')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <ClearIcon />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Campo 3: Numero da conta */}
      <Text style={styles.fieldLabel}>Número da conta</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.textInput}
          placeholder="00000000-0"
          placeholderTextColor="#91929E"
          value={form.account}
          onChangeText={(t) => updateField('account', maskAccount(t))}
          keyboardType="numeric"
          maxLength={15}
          underlineColorAndroid="transparent"
        />
        {form.account ? (
          <TouchableOpacity style={styles.clearButton} onPress={() => updateField('account', '')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <ClearIcon />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Campo 4: Tipo de conta (dropdown) */}
      <Text style={styles.fieldLabel}>Tipo de conta</Text>
      <TouchableOpacity style={styles.dropdown} onPress={() => setShowAccountTypeModal(true)} activeOpacity={0.7}>
        <Text style={styles.dropdownText}>{ACCOUNT_TYPE_LABELS[form.accountType]}</Text>
        <ChevronDownIcon />
      </TouchableOpacity>

      {/* Divisoria entre blocos */}
      <View style={styles.sectionDivider} />

      {/* ====== BLOCO 2: Chave Pix ====== */}
      <Text style={styles.sectionTitle}>Chave Pix</Text>

      {/* Campo 5: Tipo de chave Pix (dropdown simples) */}
      <Text style={styles.fieldLabel}>Tipo de chave</Text>
      <TouchableOpacity style={styles.dropdown} onPress={() => setShowPixTypeModal(true)} activeOpacity={0.7}>
        <Text style={styles.dropdownText}>{PIX_KEY_LABELS[form.pixKeyType]}</Text>
        <ChevronDownIcon />
      </TouchableOpacity>

      {/* Campo 6: Chave Pix (dinamico conforme tipo) */}
      <Text style={styles.fieldLabel}>Chave Pix</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.textInput}
          placeholder={PIX_PLACEHOLDERS[form.pixKeyType]}
          placeholderTextColor="#91929E"
          value={form.pixKey}
          onChangeText={(t) => updateField('pixKey', maskPixKey(t, form.pixKeyType))}
          keyboardType={PIX_KEYBOARDS[form.pixKeyType]}
          autoCapitalize="none"
          underlineColorAndroid="transparent"
        />
        {form.pixKey ? (
          <TouchableOpacity style={styles.clearButton} onPress={() => updateField('pixKey', '')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <ClearIcon />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Divisoria entre blocos */}
      <View style={styles.sectionDivider} />

      {/* ====== BLOCO 3: Dados do titular ====== */}
      <Text style={styles.sectionTitle}>Dados do titular</Text>

      {/* Campo 7: Nome completo */}
      <Text style={styles.fieldLabel}>Nome completo do titular</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.textInput}
          placeholder="Nome como aparece na conta"
          placeholderTextColor="#91929E"
          value={form.holderName}
          onChangeText={(t) => updateField('holderName', t)}
          autoCapitalize="words"
          underlineColorAndroid="transparent"
        />
        {form.holderName ? (
          <TouchableOpacity style={styles.clearButton} onPress={() => updateField('holderName', '')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <ClearIcon />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Campo 8: CPF ou CNPJ */}
      <Text style={styles.fieldLabel}>CPF ou CNPJ do titular</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.textInput}
          placeholder="000.000.000-00"
          placeholderTextColor="#91929E"
          value={form.document}
          onChangeText={(t) => updateField('document', maskDocument(t))}
          keyboardType="numeric"
          maxLength={18}
          underlineColorAndroid="transparent"
        />
        {form.document ? (
          <TouchableOpacity style={styles.clearButton} onPress={() => updateField('document', '')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <ClearIcon />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Divisoria entre blocos */}
      <View style={styles.sectionDivider} />

      {/* ====== BLOCO 4: Salvamento ====== */}

      {/* Campo 9: Checkbox salvar conta */}
      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => updateField('saveAccount', !form.saveAccount)}
        activeOpacity={0.7}
      >
        <CheckboxIcon checked={form.saveAccount} />
        <Text style={styles.checkboxLabel}>Salvar esta conta para próximos resgates</Text>
      </TouchableOpacity>

      {/* Campo 10: Apelido da conta (condicional) */}
      {form.saveAccount && (
        <>
          <Text style={styles.fieldLabel}>Apelido da conta</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Ex: Minha conta Nubank"
              placeholderTextColor="#91929E"
              value={form.nickname}
              onChangeText={(t) => updateField('nickname', t.slice(0, 30))}
              underlineColorAndroid="transparent"
            />
            {form.nickname ? (
              <TouchableOpacity style={styles.clearButton} onPress={() => updateField('nickname', '')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <ClearIcon />
              </TouchableOpacity>
            ) : null}
          </View>
          <Text style={styles.helperText}>Máximo 30 caracteres ({form.nickname.length}/30)</Text>
        </>
      )}

      {/* Modal seletor de banco */}
      <BankSelectorModal
        visible={showBankModal}
        selectedCode={form.bankCode}
        onSelect={handleBankSelect}
        onClose={() => setShowBankModal(false)}
      />

      {/* Modal dropdown tipo Pix */}
      <Modal visible={showPixTypeModal} transparent animationType="fade" onRequestClose={() => setShowPixTypeModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowPixTypeModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tipo de chave Pix</Text>
            {PIX_KEY_OPTIONS.map((option, index) => (
              <React.Fragment key={option.value}>
                {index > 0 && <View style={styles.modalDivider} />}
                <TouchableOpacity
                  style={[styles.modalOption, form.pixKeyType === option.value && styles.modalOptionActive]}
                  onPress={() => handlePixTypeSelect(option.value)}
                >
                  <Text style={[styles.modalOptionText, form.pixKeyType === option.value && styles.modalOptionTextActive]}>
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
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowAccountTypeModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tipo de conta</Text>
            {ACCOUNT_TYPE_OPTIONS.map((option, index) => (
              <React.Fragment key={option.value}>
                {index > 0 && <View style={styles.modalDivider} />}
                <TouchableOpacity
                  style={[styles.modalOption, form.accountType === option.value && styles.modalOptionActive]}
                  onPress={() => { updateField('accountType', option.value); setShowAccountTypeModal(false); }}
                >
                  <Text style={[styles.modalOptionText, form.accountType === option.value && styles.modalOptionTextActive]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// Estilos do formulario de edicao
const styles = StyleSheet.create({
  // Container principal
  container: {
    gap: 8, //..Espaco entre elementos
  },

  // === Titulos de secao ===

  // Titulo de bloco
  sectionTitle: {
    fontSize: 15, //...............Tamanho da fonte
    fontFamily: 'Inter_700Bold', //..Fonte bold
    color: '#3A3F51', //............Cor do texto
    marginTop: 4, //...............Espaco superior
    marginBottom: 2, //............Espaco inferior
    marginLeft: 5, //..............Respiro esquerdo
  },
  // Divisoria horizontal entre blocos
  sectionDivider: {
    height: 1, //..............Espessura fina
    backgroundColor: '#E8EDF5', //..Cor cinza sutil
    marginTop: 12, //..............Espaco superior
    marginBottom: 4, //............Espaco inferior
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
  // Texto auxiliar (contador caracteres)
  helperText: {
    fontSize: 11, //...............Tamanho da fonte
    fontFamily: 'Inter_400Regular', //..Fonte regular
    color: '#91929E', //............Cor terciaria
    marginLeft: 5, //..............Respiro esquerdo
    marginTop: 2, //...............Espaco superior
  },

  // === Modal dropdown reutilizavel ===

  // Overlay do modal
  modalOverlay: {
    flex: 1, //.................Ocupa toda a tela
    backgroundColor: 'rgba(0,0,0,0.4)', //..Fundo escuro
    justifyContent: 'center', //..Centraliza
    paddingHorizontal: 32, //....Margem lateral
  },
  // Conteudo do modal
  modalContent: {
    backgroundColor: '#FCFCFC', //..Fundo branco
    borderRadius: 16, //..........Arredondamento
    padding: 20, //...............Espaco interno
  },
  // Titulo do modal
  modalTitle: {
    fontSize: 16, //...............Tamanho da fonte
    fontFamily: 'Inter_700Bold', //..Fonte bold
    color: '#3A3F51', //............Cor do texto
    marginBottom: 12, //..........Espaco inferior
  },
  // Divisoria entre opcoes do modal
  modalDivider: {
    height: 1, //..............Espessura fina
    backgroundColor: '#E8EDF5', //..Cor cinza sutil
    marginHorizontal: 4, //....Respiro lateral
  },
  // Opcao do modal
  modalOption: {
    paddingVertical: 12, //......Espaco vertical
    paddingHorizontal: 8, //....Espaco lateral
    borderRadius: 8, //..........Arredondamento
  },
  // Opcao ativa do modal
  modalOptionActive: {
    backgroundColor: '#F0F7FF', //..Fundo azul sutil
  },
  // Texto da opcao
  modalOptionText: {
    fontSize: 14, //...............Tamanho da fonte
    fontFamily: 'Inter_500Medium', //..Fonte medium
    color: '#3A3F51', //............Cor do texto
  },
  // Texto opcao ativa
  modalOptionTextActive: {
    color: '#1777CF', //..............Cor accent
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
  },
});

// Export padrao
export default EditAccountInfoForm;
