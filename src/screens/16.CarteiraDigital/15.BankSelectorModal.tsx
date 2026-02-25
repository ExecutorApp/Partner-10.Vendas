// React e React Native
import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Modal, StyleSheet } from 'react-native';

// Bibliotecas externas
import Svg, { Path, Circle } from 'react-native-svg';

// Dados
import { BRAZIL_BANKS } from './11.WithdrawData';

// Interface do componente
interface BankSelectorModalProps {
  visible: boolean; //..........Visibilidade do modal
  selectedCode: string; //......Codigo do banco selecionado
  onSelect: (code: string, name: string) => void; //..Callback selecao
  onClose: () => void; //......Callback fechar
}

// Icone de lupa para barra de busca
const SearchIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="7" stroke="#91929E" strokeWidth="2" />
    <Path d="M16 16L21 21" stroke="#91929E" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

// Icone X para limpar busca
const ClearSearchIcon = () => (
  <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <Path d="M6 6L18 18M18 6L6 18" stroke="#91929E" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

// Modal de selecao de banco com barra de busca
// Filtra por nome ou codigo do banco em tempo real
const BankSelectorModal: React.FC<BankSelectorModalProps> = ({
  visible, selectedCode, onSelect, onClose,
}) => {
  // Estado da busca
  const [search, setSearch] = useState(''); //..Texto digitado

  // Lista filtrada conforme busca
  const filtered = useMemo(() => {
    if (!search.trim()) return BRAZIL_BANKS; //..Sem filtro
    const term = search.toLowerCase().trim(); //..Termo normalizado
    return BRAZIL_BANKS.filter(b =>
      b.name.toLowerCase().includes(term) || b.code.includes(term)
    ); //..Filtra por nome ou codigo
  }, [search]);

  // Limpa busca ao fechar
  const handleClose = () => {
    setSearch(''); //..Reseta busca
    onClose(); //......Fecha modal
  };

  // Seleciona banco e fecha
  const handleSelect = (code: string, name: string) => {
    setSearch(''); //............Reseta busca
    onSelect(code, name); //....Retorna selecao
  };

  // Renderiza item da lista
  const renderItem = ({ item }: { item: { code: string; name: string } }) => {
    const isSelected = item.code === selectedCode; //..Verifica selecao

    return (
      <TouchableOpacity
        style={[styles.bankItem, isSelected && styles.bankItemActive]}
        onPress={() => handleSelect(item.code, item.name)}
        activeOpacity={0.7}
      >
        {/* Codigo do banco */}
        <Text style={[styles.bankCode, isSelected && styles.bankTextActive]}>{item.code}</Text>
        {/* Separador */}
        <Text style={[styles.bankSeparator, isSelected && styles.bankTextActive]}>-</Text>
        {/* Nome do banco */}
        <Text style={[styles.bankName, isSelected && styles.bankTextActive]}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleClose}>
        <TouchableOpacity style={styles.content} activeOpacity={1} onPress={() => {}}>
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Titulo */}
          <Text style={styles.title}>Selecione o banco</Text>

          {/* Barra de busca */}
          <View style={styles.searchContainer}>
            <SearchIcon />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nome ou código"
              placeholderTextColor="#91929E"
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
              autoCorrect={false}
              underlineColorAndroid="transparent"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <ClearSearchIcon />
              </TouchableOpacity>
            )}
          </View>

          {/* Lista de bancos */}
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.code}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={styles.itemDivider} />}
            showsVerticalScrollIndicator={false}
            style={styles.list}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Nenhum banco encontrado</Text>
            }
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

// Estilos do modal de selecao de banco
const styles = StyleSheet.create({
  // Overlay escuro
  overlay: {
    flex: 1, //...............Ocupa toda a tela
    backgroundColor: 'rgba(0,0,0,0.4)', //..Fundo escuro
    justifyContent: 'flex-end', //..Alinha embaixo
  },
  // Conteudo do modal
  content: {
    backgroundColor: '#FCFCFC', //..Fundo branco
    borderTopLeftRadius: 20, //....Arredondamento superior esquerdo
    borderTopRightRadius: 20, //...Arredondamento superior direito
    paddingHorizontal: 24, //......Espaco lateral
    paddingTop: 12, //............Espaco superior
    paddingBottom: 24, //.........Espaco inferior
    height: '70%', //..............Altura do modal
  },
  // Handle bar de arraste
  handleBar: {
    width: 40, //..............Largura da barra
    height: 4, //.............Altura da barra
    backgroundColor: '#D8E0F0', //..Cor cinza
    borderRadius: 2, //........Arredondamento
    alignSelf: 'center', //....Centraliza horizontal
    marginBottom: 16, //........Espaco inferior
  },
  // Titulo do modal
  title: {
    fontSize: 18, //...............Tamanho da fonte
    fontFamily: 'Inter_700Bold', //..Fonte bold
    color: '#3A3F51', //............Cor do texto
    marginBottom: 16, //...........Espaco inferior
    marginLeft: 5, //..............Respiro esquerdo
  },

  // === Barra de busca ===

  // Container da barra de busca
  searchContainer: {
    flexDirection: 'row', //......Layout horizontal
    alignItems: 'center', //......Alinha vertical
    backgroundColor: '#FFFFFF', //..Fundo branco
    borderRadius: 10, //..........Arredondamento
    borderWidth: 1, //............Borda fina
    borderColor: '#D8E0F0', //....Cor cinza padrao
    paddingHorizontal: 12, //....Espaco lateral
    paddingVertical: 10, //......Espaco vertical
    marginBottom: 12, //.........Espaco inferior
    gap: 8, //....................Espaco entre elementos
  },
  // Input de busca
  searchInput: {
    flex: 1, //....................Ocupa espaco disponivel
    fontSize: 14, //...............Tamanho da fonte
    fontFamily: 'Inter_400Regular', //..Fonte regular
    color: '#3A3F51', //............Cor do texto
    padding: 0, //..................Remove padding nativo
    outlineStyle: 'none', //........Remove borda de foco web
  },

  // === Lista de bancos ===

  // Lista scrollavel
  list: {
    flex: 1, //..Ocupa espaco disponivel
  },
  // Item da lista
  bankItem: {
    flexDirection: 'row', //......Layout horizontal
    alignItems: 'center', //......Alinha vertical
    paddingVertical: 14, //......Espaco vertical
    paddingHorizontal: 8, //.....Espaco lateral
    borderRadius: 8, //..........Arredondamento
    gap: 8, //....................Espaco entre elementos
  },
  // Item selecionado
  bankItemActive: {
    backgroundColor: 'rgba(23,119,207,0.05)', //..Fundo azul sutil
  },
  // Codigo do banco
  bankCode: {
    fontSize: 14, //...............Tamanho da fonte
    fontFamily: 'Inter_500Medium', //..Fonte medium
    color: '#91929E', //............Cor terciaria
    width: 32, //..................Largura fixa
  },
  // Separador
  bankSeparator: {
    fontSize: 14, //...............Tamanho da fonte
    color: '#C4CAD4', //...........Cor separador
  },
  // Nome do banco
  bankName: {
    flex: 1, //....................Ocupa espaco disponivel
    fontSize: 14, //...............Tamanho da fonte
    fontFamily: 'Inter_500Medium', //..Fonte medium
    color: '#3A3F51', //............Cor do texto
  },
  // Texto do item selecionado
  bankTextActive: {
    color: '#1777CF', //..............Cor accent
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
  },
  // Divisoria entre itens da lista
  itemDivider: {
    height: 1, //..............Espessura fina
    backgroundColor: '#E8EDF5', //..Cor cinza sutil
    marginHorizontal: 4, //....Respiro lateral
  },
  // Texto lista vazia
  emptyText: {
    fontSize: 14, //...............Tamanho da fonte
    fontFamily: 'Inter_400Regular', //..Fonte regular
    color: '#91929E', //............Cor terciaria
    textAlign: 'center', //........Centraliza texto
    marginTop: 24, //..............Espaco superior
  },
});

// Export padrao
export default BankSelectorModal;
