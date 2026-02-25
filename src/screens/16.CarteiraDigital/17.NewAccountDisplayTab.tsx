// React e React Native
import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, PanResponder, LayoutAnimation, UIManager, Platform, StyleSheet } from 'react-native';

// Bibliotecas externas
import Svg, { Circle } from 'react-native-svg';

// Tipos e dados
import { NewAccountFormData, PIX_KEY_LABELS, BRAZIL_BANKS } from './11.WithdrawData';
import { DisplayField, DISPLAY_FIELD_LABELS } from './14.WithdrawEditAccountModal';

// Habilita LayoutAnimation no Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Interface do componente
interface NewAccountDisplayTabProps {
  newAccountData: NewAccountFormData; //......Dados do formulario
  selectedFields: DisplayField[]; //..........Campos selecionados (ordenados)
  onFieldsChange: (fields: DisplayField[]) => void; //..Callback campos
  onDragStateChange?: (isDragging: boolean) => void; //..Callback arraste
}

// Maximo de campos selecionaveis para exibicao
const MAX_SELECTED_FIELDS = 2;

// Altura aproximada de cada card (padding + label + valor + margem)
const CARD_HEIGHT = 68;

// Placeholder para campos nao preenchidos
export const EMPTY_PLACEHOLDER = '-----';

// Todos os campos disponiveis para exibicao no cadastro de nova conta
const ALL_NEW_ACCOUNT_FIELDS: DisplayField[] = ['bankName', 'pixKeyType', 'pixKey', 'agency', 'account', 'accountType', 'document', 'nickname'];

// Retorna valor do campo para exibicao a partir do formulario
export const getFormDisplayValue = (data: NewAccountFormData, field: DisplayField): string => {
  if (field === 'bankName') {
    const bank = BRAZIL_BANKS.find(b => b.code === data.bankCode); //..Busca banco
    return bank?.name || EMPTY_PLACEHOLDER; //..Nome ou placeholder
  }
  if (field === 'agency') return data.agency ? `Ag ${data.agency}` : EMPTY_PLACEHOLDER; //..Agencia formatada
  if (field === 'account') return data.account ? `Cc ${data.account}` : EMPTY_PLACEHOLDER; //..Conta formatada
  if (field === 'accountType') return data.accountType === 'corrente' ? 'Conta Corrente' : 'Conta Poupança'; //..Tipo
  if (field === 'pixKeyType') return PIX_KEY_LABELS[data.pixKeyType]; //..Tipo chave
  if (field === 'pixKey') return data.pixKey || EMPTY_PLACEHOLDER; //..Chave pix
  if (field === 'document') return data.document || EMPTY_PLACEHOLDER; //..CPF ou CNPJ
  if (field === 'nickname') return data.nickname || EMPTY_PLACEHOLDER; //..Apelido da conta
  if (field === 'holderName') return EMPTY_PLACEHOLDER; //..Titular nao disponivel
  return ''; //..Vazio fallback
};

// Icone de radio button (circulo com preenchimento)
const RadioIcon = ({ selected }: { selected: boolean }) => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={selected ? '#1777CF' : '#D8E0F0'} strokeWidth="2" fill="none"/>
    {selected && <Circle cx="12" cy="12" r="5" fill="#1777CF"/>}
  </Svg>
);

// Icone de arrastar (6 pontos em grade 2x3)
const DragHandleIcon = ({ color }: { color: string }) => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <Circle cx="9" cy="5" r="1.5" fill={color}/>
    <Circle cx="15" cy="5" r="1.5" fill={color}/>
    <Circle cx="9" cy="12" r="1.5" fill={color}/>
    <Circle cx="15" cy="12" r="1.5" fill={color}/>
    <Circle cx="9" cy="19" r="1.5" fill={color}/>
    <Circle cx="15" cy="19" r="1.5" fill={color}/>
  </Svg>
);

// Componente da aba de exibicao no card
// Permite selecionar ate 2 campos com drag-to-reorder
const NewAccountDisplayTab: React.FC<NewAccountDisplayTabProps> = ({
  newAccountData, selectedFields, onFieldsChange, onDragStateChange,
}) => {
  // Ordem dos campos na lista
  const [fieldOrder, setFieldOrder] = useState<DisplayField[]>([...ALL_NEW_ACCOUNT_FIELDS]); //..Ordem atual

  // Campo sendo arrastado
  const [draggingField, setDraggingField] = useState<DisplayField | null>(null); //..Campo ativo

  // Indice alvo onde o card sera solto
  const [targetIndex, setTargetIndex] = useState<number>(-1); //..Posicao destino

  // Valor animado do deslocamento vertical
  const dragY = useRef(new Animated.Value(0)).current; //..Offset Y animado

  // Ref do indice alvo para PanResponder
  const targetIndexRef = useRef<number>(-1); //..Ref posicao destino

  // Refs para acesso atualizado dentro de callbacks
  const fieldOrderRef = useRef(fieldOrder); //..........Ref ordem
  const selectedFieldsRef = useRef(selectedFields); //..Ref selecionados
  const onFieldsChangeRef = useRef(onFieldsChange); //..Ref callback
  fieldOrderRef.current = fieldOrder; //..Sincroniza
  selectedFieldsRef.current = selectedFields; //..Sincroniza
  onFieldsChangeRef.current = onFieldsChange; //..Sincroniza

  // Handler de toggle de campo (radio com max 2)
  // Ordena campos selecionados conforme posicao visual na lista
  const handleToggleField = (field: DisplayField) => {
    const isSelected = selectedFields.includes(field); //..Verifica selecao
    if (isSelected) {
      onFieldsChange(selectedFields.filter(f => f !== field)); //..Desmarca
    } else if (selectedFields.length < MAX_SELECTED_FIELDS) {
      const newSelected = [...selectedFields, field]; //..Adiciona campo
      const ordered = fieldOrder.filter(f => newSelected.includes(f)); //..Ordena por posicao visual
      onFieldsChange(ordered); //..Atualiza respeitando ordem da tela
    }
  };

  // Handler de reordenacao por arraste
  const performReorder = (field: DisplayField, steps: number) => {
    const order = fieldOrderRef.current; //..Ordem atual
    const fromIdx = order.indexOf(field); //..Posicao origem
    const toIdx = Math.max(0, Math.min(order.length - 1, fromIdx + steps)); //..Posicao destino
    if (fromIdx === toIdx) return; //..Sem mudanca
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); //..Anima transicao
    const updated = [...order]; //..Copia
    const [moved] = updated.splice(fromIdx, 1); //..Remove origem
    updated.splice(toIdx, 0, moved); //..Insere destino
    setFieldOrder(updated); //..Atualiza ordem
    const selected = selectedFieldsRef.current; //..Selecionados atuais
    const reordered = updated.filter(f => selected.includes(f)); //..Nova ordem
    onFieldsChangeRef.current(reordered); //..Atualiza pai
  };

  // PanResponders por campo (usam refs para dados atuais)
  const panResponders = useRef<Record<string, ReturnType<typeof PanResponder.create>>>({});
  ALL_NEW_ACCOUNT_FIELDS.forEach((field) => {
    if (!panResponders.current[field]) {
      panResponders.current[field] = PanResponder.create({
        onStartShouldSetPanResponder: () => true, //..Captura toque
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 2, //..Captura movimento
        onShouldBlockNativeResponder: () => true, //..Bloqueia gestos nativos
        onPanResponderGrant: () => {
          setDraggingField(field); //..Inicia arraste
          onDragStateChange?.(true); //..Notifica pai
          const idx = fieldOrderRef.current.indexOf(field); //..Indice atual
          targetIndexRef.current = idx; //..Alvo inicial
          setTargetIndex(idx); //..Atualiza estado
        },
        onPanResponderMove: (_, gesture) => {
          dragY.setValue(gesture.dy); //..Acompanha dedo
          const currentOrder = fieldOrderRef.current; //..Ordem atual
          const fromIdx = currentOrder.indexOf(field); //..Origem
          const steps = Math.round(gesture.dy / CARD_HEIGHT); //..Passos
          const newTarget = Math.max(0, Math.min(currentOrder.length - 1, fromIdx + steps)); //..Destino
          if (newTarget !== targetIndexRef.current) {
            targetIndexRef.current = newTarget; //..Atualiza ref
            setTargetIndex(newTarget); //..Atualiza visual
          }
        },
        onPanResponderRelease: (_, gesture) => {
          const steps = Math.round(gesture.dy / CARD_HEIGHT); //..Calcula posicoes
          setDraggingField(null); //..Finaliza arraste
          onDragStateChange?.(false); //..Notifica pai
          setTargetIndex(-1); //..Reseta indicador
          targetIndexRef.current = -1; //..Reseta ref
          if (steps !== 0) {
            dragY.setValue(0); //..Reseta offset
            performReorder(field, steps); //..Reordena
          } else {
            Animated.spring(dragY, { toValue: 0, useNativeDriver: false }).start(); //..Retorna suave
          }
        },
        onPanResponderTerminate: () => {
          setDraggingField(null); //..Cancela arraste
          onDragStateChange?.(false); //..Notifica pai
          setTargetIndex(-1); //..Reseta indicador
          targetIndexRef.current = -1; //..Reseta ref
          Animated.spring(dragY, { toValue: 0, useNativeDriver: false }).start(); //..Retorna suave
        },
      });
    }
  });

  // Calcula posicao do indicador de soltar
  const fromIdx = draggingField ? fieldOrder.indexOf(draggingField) : -1; //..Indice origem
  const insertionSlot = draggingField === null || targetIndex === fromIdx || targetIndex < 0
    ? -1 //..Sem indicador
    : targetIndex > fromIdx ? targetIndex + 1 : targetIndex; //..Slot de insercao

  return (
    <View>
      {/* Contador de campos selecionados */}
      <View style={styles.counterRow}>
        <Text style={styles.counterHint}>Selecione até {MAX_SELECTED_FIELDS} campos</Text>
        <View style={styles.counterBadge}>
          <Text style={styles.counterText}>
            {String(selectedFields.length).padStart(2, '0')}/{String(MAX_SELECTED_FIELDS).padStart(2, '0')}
          </Text>
        </View>
      </View>

      {/* Cards de campos com drag-to-reorder e indicador de posicao */}
      {fieldOrder.map((field, index) => {
        const isSelected = selectedFields.includes(field); //..Verifica selecao
        const isDragging = draggingField === field; //..........Verifica arraste
        const pr = panResponders.current[field]; //............PanResponder do campo
        const showIndicatorBefore = insertionSlot === index; //..Indicador antes
        const value = getFormDisplayValue(newAccountData, field); //..Valor do campo
        const isEmpty = value === EMPTY_PLACEHOLDER; //..........Verifica vazio

        return (
          <React.Fragment key={field}>
            {/* Indicador de soltar (linha azul) */}
            {showIndicatorBefore && <View style={styles.dropIndicator}><View style={styles.dropIndicatorDot} /><View style={styles.dropIndicatorLine} /></View>}

            <Animated.View
              style={[
                styles.fieldCard,
                isSelected && styles.fieldCardActive,
                isDragging && styles.fieldCardDragging,
                isDragging && { transform: [{ translateY: dragY }] },
              ]}
            >
              {/* Icone de arrastar (esquerda) */}
              <View {...(pr ? pr.panHandlers : {})} style={styles.dragHandle}>
                <DragHandleIcon color={isSelected ? '#1777CF' : '#A0A5AE'} />
              </View>

              {/* Label e valor do campo (centro) */}
              <TouchableOpacity style={styles.fieldTitleArea} onPress={() => handleToggleField(field)} activeOpacity={0.7}>
                <Text style={styles.fieldLabel}>{DISPLAY_FIELD_LABELS[field]}</Text>
                <Text style={[styles.fieldName, isSelected && styles.fieldNameActive, isEmpty && styles.fieldNameEmpty]}>
                  {value}
                </Text>
              </TouchableOpacity>

              {/* Radio button (direita) */}
              <TouchableOpacity onPress={() => handleToggleField(field)} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <RadioIcon selected={isSelected} />
              </TouchableOpacity>
            </Animated.View>
          </React.Fragment>
        );
      })}
      {/* Indicador de soltar no final da lista */}
      {insertionSlot === fieldOrder.length && <View style={styles.dropIndicator}><View style={styles.dropIndicatorDot} /><View style={styles.dropIndicatorLine} /></View>}
    </View>
  );
};

// Estilos da aba de exibicao
const styles = StyleSheet.create({
  // Linha do contador
  counterRow: {
    flexDirection: 'row', //..Layout horizontal
    alignItems: 'center', //..Alinha vertical
    justifyContent: 'space-between', //..Espaco entre elementos
    marginBottom: 14, //.....Espaco inferior
  },
  // Texto auxiliar do contador
  counterHint: {
    fontSize: 13, //...............Tamanho da fonte
    fontFamily: 'Inter_400Regular', //..Fonte regular
    color: '#91929E', //............Cor terciaria
    marginLeft: 5, //..............Respiro esquerdo
  },
  // Badge do contador
  counterBadge: {
    backgroundColor: 'rgba(23,119,207,0.03)', //..Fundo azul 3% opacidade
    borderRadius: 6, //............Arredondamento
    paddingHorizontal: 10, //......Espaco lateral
    paddingVertical: 4, //........Espaco vertical
  },
  // Texto do contador
  counterText: {
    fontSize: 13, //...............Tamanho da fonte
    fontFamily: 'Inter_700Bold', //..Fonte bold
    color: '#1777CF', //............Cor accent
  },

  // === Cards de campos arrastáveis ===

  // Card de campo avulso
  fieldCard: {
    flexDirection: 'row', //......Layout horizontal
    alignItems: 'center', //......Alinha vertical
    gap: 14, //....................Espaco entre elementos
    backgroundColor: '#FCFCFC', //..Fundo branco
    borderRadius: 12, //..........Arredondamento
    borderWidth: 1, //............Borda fina
    borderColor: '#D0D5DE', //....Cor da borda visivel
    paddingHorizontal: 14, //.....Espaco lateral
    paddingVertical: 14, //.......Espaco vertical
    marginBottom: 8, //...........Espaco inferior
  },
  // Card de campo selecionado
  fieldCardActive: {
    borderColor: 'rgba(23,119,207,0.4)', //..Borda azul sutil
    backgroundColor: 'rgba(23,119,207,0.03)', //..Fundo azul sutil
  },
  // Card sendo arrastado (elevado com sombra)
  fieldCardDragging: {
    zIndex: 100, //................Acima dos outros
    elevation: 8, //...............Sombra Android
    shadowColor: '#000', //.........Cor da sombra
    shadowOffset: { width: 0, height: 4 }, //..Deslocamento sombra
    shadowOpacity: 0.15, //.........Opacidade sombra
    shadowRadius: 8, //............Raio da sombra
    opacity: 0.92, //..............Leve transparencia
  },
  // Area do icone de arrastar
  dragHandle: {
    width: 28, //..............Largura da area de toque
    height: 28, //.............Altura da area de toque
    justifyContent: 'center', //..Centraliza vertical
    alignItems: 'center', //......Centraliza horizontal
  },
  // Area do titulo do campo (expansivel)
  fieldTitleArea: {
    flex: 1, //..Ocupa espaco disponivel
    gap: 2, //...Espaco entre label e valor
  },
  // Label pequeno do campo
  fieldLabel: {
    fontSize: 11, //...............Tamanho da fonte
    fontFamily: 'Inter_500Medium', //..Fonte medium
    color: '#91929E', //............Cor terciaria
  },
  // Nome do campo
  fieldName: {
    fontSize: 14, //...............Tamanho da fonte
    fontFamily: 'Inter_500Medium', //..Fonte medium
    color: '#3A3F51', //............Cor do texto
  },
  // Nome do campo ativo
  fieldNameActive: {
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
    color: '#1777CF', //..............Cor accent
  },
  // Nome do campo vazio (placeholder cinza medio)
  fieldNameEmpty: {
    color: '#91929E', //..Cor cinza medio
  },

  // === Indicador de soltar ===

  // Container do indicador (linha com ponto)
  dropIndicator: {
    flexDirection: 'row', //..Layout horizontal
    alignItems: 'center', //..Alinha vertical
    height: 12, //..............Altura do espaco
    marginVertical: 2, //.......Respiro vertical
  },
  // Ponto azul do indicador (extrema esquerda)
  dropIndicatorDot: {
    width: 6, //...............Largura do ponto
    height: 6, //..............Altura do ponto
    borderRadius: 3, //........Circular
    backgroundColor: '#1777CF', //..Cor azul
  },
  // Linha azul do indicador
  dropIndicatorLine: {
    flex: 1, //................Ocupa espaco restante
    height: 2, //..............Espessura da linha
    backgroundColor: '#1777CF', //..Cor azul
    borderRadius: 1, //........Arredondamento
  },
});

// Export padrao
export default NewAccountDisplayTab;
