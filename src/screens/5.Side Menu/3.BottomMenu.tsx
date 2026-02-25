// React e React Native
import React, { useEffect, useMemo, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';

// Bibliotecas externas
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Svg, { Path } from 'react-native-svg';

// Tipos e constantes
import { RootStackParamList, ScreenNames } from '../../types/navigation';
import { Layout } from '../../constants/theme';

// Tipo das chaves do menu inferior
type MenuKey = 'Products' | 'Clients' | 'Sales' | 'Schedule' | 'Wallet';

// Props do componente de menu inferior
interface BottomMenuProps {
  activeScreen?: string; //..Pode receber nome do menu ou da rota
  currentScreen?: string; //..Compatibilidade com uso existente
  fixedOnWeb?: boolean; //....Controla se o menu e fixo ou relativo no web
}

// Menu inferior com 5 icones de navegacao
// Produtos, Clientes, Vendas (central), Agenda e Carteira Digital
const BottomMenu: React.FC<BottomMenuProps> = ({ activeScreen = 'Products', currentScreen, fixedOnWeb = true }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>(); //..Hook de navegacao
  const route = useRoute<any>(); //..Rota atual

  // Mapa de rotas para chaves do menu
  const screenMap: Record<string, MenuKey> = {
    ProductListScreen: 'Products', //..Tela de produtos
    PresentationScreen: 'Products', //..Tela de apresentacao
    ClientsScreen: 'Clients', //........Tela de clientes
    SalesScreen: 'Sales', //............Tela de vendas
    ScheduleScreen: 'Schedule', //......Tela de agenda
    WalletHome: 'Wallet', //............Tela de carteira digital
  };

  // Resolve qual aba esta ativa com base na rota ou prop
  const resolveActive = (): MenuKey => {
    const input = (currentScreen ?? activeScreen ?? route?.name ?? 'Products') as string; //..Input de referencia
    if ((['Products', 'Clients', 'Sales', 'Schedule', 'Wallet'] as string[]).includes(input)) {
      return input as MenuKey; //..Retorna direto se ja for chave valida
    }
    const mapped = screenMap[input]; //..Mapeia rota para chave
    return mapped ?? 'Products'; //....Fallback para produtos
  };

  // Estado da aba ativa
  const initialActive = useMemo(() => resolveActive(), [activeScreen, currentScreen, route?.name]); //..Calculo inicial
  const [activeMenu, setActiveMenu] = useState<MenuKey>(initialActive); //..Estado local

  // Sincroniza quando a referencia externa muda
  useEffect(() => {
    setActiveMenu(initialActive); //..Atualiza aba ativa
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialActive]);

  // Handler de navegacao entre telas
  const handleNavigation = (screen: string) => {
    const menuKey = screen as MenuKey; //..Converte para chave
    setActiveMenu(menuKey); //...........Atualiza estado ativo
    switch (screen) {
      case 'Products':
        // navigation.navigate('ProductListScreen');
        break;
      case 'Clients':
        // navigation.navigate('ClientsScreen');
        break;
      case 'Sales':
        navigation.navigate(ScreenNames.SalesHome); //..Navega para vendas
        break;
      case 'Schedule':
        navigation.navigate(ScreenNames.Schedule); //..Navega para agenda
        break;
      case 'Wallet':
        navigation.navigate(ScreenNames.WalletHome); //..Navega para carteira digital
        break;
      default:
        break;
    }
  };

  // Retorna a cor do icone com base no estado ativo
  const getIconColor = (screen: MenuKey) => {
    return activeMenu === screen ? '#1777CF' : '#3A3F51'; //..Azul se ativo, cinza se inativo
  };

  // Estilo condicional para web (fixo ou relativo)
  const containerStyle = [
    styles.bottomNavigation,
    Platform.OS === 'web' ? ({ position: (fixedOnWeb ? ('fixed' as any) : 'relative') } as any) : null,
  ];

  return (
    <View
      style={containerStyle}
      pointerEvents="box-none"
      accessibilityRole={Platform.OS === 'web' ? 'tablist' : undefined}
      accessibilityLabel="Menu inferior"
    >
      {/* Area decorativa superior com curva */}
      <View style={styles.bottomNavCurve} pointerEvents="none" />
      <View style={styles.bottomNavContent} pointerEvents="box-none">
        <View style={styles.bottomNavSide}>
          {/* Icone Produtos */}
          <TouchableOpacity onPress={() => handleNavigation('Products')}>
            <Svg width="22" height="18" viewBox="0 0 23 19" fill="none" style={styles.bottomNavIcon}>
              <Path d="M20.6131 2.87535H18.6511H16.7814H15.5365V1.57037C15.5365 0.761286 14.8722 0.100098 14.0496 0.100098H8.14597C7.32773 0.100098 6.65906 0.756936 6.65906 1.57037V2.87535H5.41411H3.54449H1.58688C0.764243 2.87535 0.0999756 3.53219 0.0999756 4.34128V16.6298C0.0999756 17.4389 0.764243 18.1001 1.58688 18.1001H3.54889H5.41851H16.7814H18.6511H20.6131C21.4313 18.1001 22.1 17.4433 22.1 16.6298V4.34128C22.0956 3.53219 21.4313 2.87535 20.6131 2.87535ZM7.10338 3.74534H15.0966H16.3415V17.2301H5.85403V3.74534H7.10338ZM7.54329 1.57037C7.54329 1.23978 7.81603 0.970083 8.15037 0.970083H14.054C14.3883 0.970083 14.6611 1.23978 14.6611 1.57037V2.87535H7.54329V1.57037ZM0.9798 16.6298V4.34128C0.9798 4.01068 1.25255 3.74099 1.58688 3.74099L5.41411 3.74534V10.7183V17.2301L1.58688 17.2258C1.25255 17.2301 0.9798 16.9604 0.9798 16.6298ZM5.41411 17.2301V10.7183V3.74534H4.9742V17.2301H5.41411ZM17.2214 17.2301V3.74534H16.7814V17.2301H17.2214ZM21.2158 16.6298C21.2158 16.9604 20.943 17.2301 20.6087 17.2301H16.7814V3.74534H20.6087C20.943 3.74534 21.2158 4.01503 21.2158 4.34563V16.6298Z" fill={getIconColor('Products')}/>
              <Path d="M5.41411 3.74534L1.58688 3.74099C1.25255 3.74099 0.9798 4.01068 0.9798 4.34128V16.6298C0.9798 16.9604 1.25255 17.2301 1.58688 17.2258L5.41411 17.2301M5.41411 3.74534H4.9742V17.2301H5.41411M5.41411 3.74534V10.7183V17.2301M16.7814 3.74534H17.2214V17.2301H16.7814M16.7814 3.74534V17.2301M16.7814 3.74534H20.6087C20.943 3.74534 21.2158 4.01503 21.2158 4.34563V16.6298C21.2158 16.9604 20.943 17.2301 20.6087 17.2301H16.7814M20.6131 2.87535H18.6511H16.7814H15.5365V1.57037C15.5365 0.761286 14.8722 0.100098 14.0496 0.100098H8.14597C7.32773 0.100098 6.65906 0.756936 6.65906 1.57037V2.87535H5.41411H3.54449H1.58688C0.764243 2.87535 0.0999756 3.53219 0.0999756 4.34128V16.6298C0.0999756 17.4389 0.764243 18.1001 1.58688 18.1001H3.54889H5.41851H16.7814H18.6511H20.6131C21.4313 18.1001 22.1 17.4433 22.1 16.6298V4.34128C22.0956 3.53219 21.4313 2.87535 20.6131 2.87535ZM7.10338 3.74534H15.0966H16.3415V17.2301H5.85403V3.74534H7.10338ZM7.54329 1.57037C7.54329 1.23978 7.81603 0.970083 8.15037 0.970083H14.054C14.3883 0.970083 14.6611 1.23978 14.6611 1.57037V2.87535H7.54329V1.57037Z" stroke={getIconColor('Products')} strokeWidth="0.2"/>
            </Svg>
          </TouchableOpacity>

          {/* Icone Clientes */}
          <TouchableOpacity onPress={() => handleNavigation('Clients')}>
            <Svg width="19" height="18" viewBox="0 0 19 18" fill="none" style={styles.bottomNavIcon}>
              <Path fillRule="evenodd" clipRule="evenodd" d="M9.25378 0C6.69974 0 4.62689 2.01269 4.62689 4.49118C4.62689 6.97031 6.69974 8.98236 9.25378 8.98236C11.8072 8.98236 13.8807 6.97031 13.8807 4.49118C13.8807 2.01269 11.8072 0 9.25378 0ZM9.25378 1.28319C11.0774 1.28319 12.5587 2.72101 12.5587 4.49118C12.5587 6.26199 11.0774 7.69916 9.25378 7.69916C7.42947 7.69916 5.94886 6.26199 5.94886 4.49118C5.94886 2.72101 7.42947 1.28319 9.25378 1.28319Z" fill={getIconColor('Clients')}/>
              <Path fillRule="evenodd" clipRule="evenodd" d="M1.32197 16.6815H9.53668C9.90155 16.6815 10.1977 16.969 10.1977 17.3231C10.1977 17.6773 9.90155 17.9647 9.53668 17.9647H0.660985C0.29546 17.9647 0 17.6779 0 17.3231C0 17.3231 0 16.7944 0 16.0399C0 12.8512 2.66311 10.2655 5.94886 10.2655H9.53668C9.90155 10.2655 10.1977 10.553 10.1977 10.9071C10.1977 11.2613 9.90155 11.5487 9.53668 11.5487H5.94886C3.39349 11.5487 1.32197 13.5595 1.32197 16.0399V16.6815Z" fill={getIconColor('Clients')}/>
              <Path fillRule="evenodd" clipRule="evenodd" d="M12.8416 11.5949H18.339C18.7039 11.5949 19 11.3075 19 10.9533C19 10.5992 18.7039 10.3117 18.339 10.3117H12.8416C12.4767 10.3117 12.1806 10.5992 12.1806 10.9533C12.1806 11.3075 12.4767 11.5949 12.8416 11.5949Z" fill={getIconColor('Clients')}/>
              <Path fillRule="evenodd" clipRule="evenodd" d="M12.8416 14.7978H18.339C18.7039 14.7978 19 14.5097 19 14.1562C19 13.802 18.7039 13.5146 18.339 13.5146H12.8416C12.4767 13.5146 12.1806 13.802 12.1806 14.1562C12.1806 14.5097 12.4767 14.7978 12.8416 14.7978Z" fill={getIconColor('Clients')}/>
              <Path fillRule="evenodd" clipRule="evenodd" d="M12.8416 18H18.339C18.7039 18 19 17.7126 19 17.3584C19 17.0042 18.7039 16.7168 18.339 16.7168H12.8416C12.4767 16.7168 12.1806 17.0042 12.1806 17.3584C12.1806 17.7126 12.4767 18 12.8416 18Z" fill={getIconColor('Clients')}/>
            </Svg>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomNavSide}>
          {/* Icone Agenda */}
          <TouchableOpacity onPress={() => handleNavigation('Schedule')}>
            <Svg width="22" height="19" viewBox="0 0 22 19" fill="none" style={styles.bottomNavIcon}>
              <Path d="M4.42116 15.9286V18.5H21.5V1.78571H4.42116V5.64285M4.42116 5.64285H21.5C21.5 12.7143 17.5788 15.9286 17.5788 15.9286H0.5C0.5 15.9286 4.42116 12.7143 4.42116 5.64285ZM8.38589 0.5V3.07143M17.5788 0.5V3.07143M12.9606 0.5V3.07143" stroke={getIconColor('Schedule')} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
          </TouchableOpacity>

          {/* Icone Carteira Digital */}
          <TouchableOpacity onPress={() => handleNavigation('Wallet')}>
            <Svg width="20" height="18" viewBox="0 0 512 512" fill="none" style={styles.bottomNavIcon}>
              <Path d="M448 160V64C448 46.4 434.4 32 416 32H64C28.8 32 0 57.6 0 96V416C0 451.2 28.8 480 64 480H448C465.6 480 480 465.6 480 448V192C480 174.4 465.6 160 448 160ZM64 64H416V160H64C46.4 160 32 145.6 32 128C32 110.4 46.4 96 64 96V64ZM448 448H64C46.4 448 32 433.6 32 416V188.8C41.6 188.8 54.4 192 64 192H448V448Z" fill={getIconColor('Wallet')}/>
              <Path d="M400 288C386.7 288 376 298.7 376 312C376 325.3 386.7 336 400 336C413.3 336 424 325.3 424 312C424 298.7 413.3 288 400 288Z" fill={getIconColor('Wallet')}/>
            </Svg>
          </TouchableOpacity>
        </View>

        {/* Botao central hexagonal de vendas */}
        <TouchableOpacity
          style={styles.centerButton}
          onPress={() => handleNavigation('Sales')}
        >
          <View style={{position: 'relative', justifyContent: 'center', alignItems: 'center'}}>
            <Svg width="52" height="59" viewBox="0 0 52 59" fill="none">
              <Path d="M22.9807 0.803828C24.8371 -0.267969 27.1243 -0.267969 28.9807 0.803828L48.9615 12.3397C50.8179 13.4115 51.9615 15.3923 51.9615 17.5359V40.6077C51.9615 42.7513 50.8179 44.732 48.9615 45.8038L28.9807 57.3397C27.1243 58.4115 24.8371 58.4115 22.9807 57.3397L2.99995 45.8038C1.14354 44.732 -4.95911e-05 42.7513 -4.95911e-05 40.6077V17.5359C-4.95911e-05 15.3923 1.14354 13.4115 2.99995 12.3397L22.9807 0.803828Z" fill="#1777CF"/>
            </Svg>
            <Svg width="22" height="22" viewBox="0 0 18 18" fill="none" style={{position: 'absolute'}}>
              <Path d="M9 0C4.02944 0 0 4.02944 0 9C0 13.9706 4.02944 18 9 18C13.9706 18 18 13.9706 18 9C18 4.02944 13.9706 0 9 0ZM10.0407 13.5997V14.5461H8.0231V13.6053C6.37812 13.3053 5.3591 12.2231 5.3591 10.5849H7.94088C7.94088 11.196 8.44038 11.5013 8.99928 11.5013C9.5234 11.5013 10.0229 11.2345 10.0229 10.7686C10.0229 10.2028 9.32206 10.0388 8.46288 9.82645C7.15097 9.50044 5.48057 9.0954 5.48057 7.03645C5.48057 5.57035 6.38928 4.61909 7.93238 4.34315V3.45395H9.94997V4.3524C11.4836 4.65156 12.3481 5.66219 12.3481 7.16652L9.84118 7.17217C9.84118 6.64204 9.41695 6.38309 8.89859 6.38309C8.44823 6.38309 8.01824 6.56845 8.01824 6.95909C8.01824 7.4767 8.69782 7.64636 9.55847 7.86456C10.8954 8.20973 12.6411 8.64756 12.6411 10.7187C12.641 12.3358 11.5968 13.3114 10.0407 13.5997Z" fill="#FCFCFC"/>
            </Svg>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Estilos do menu inferior
const styles = StyleSheet.create({
  // Container principal do menu inferior
  bottomNavigation: {
    backgroundColor: '#fcfcfc', //..Fundo branco
    height: Layout.bottomMenuHeight, //..Altura padrao do menu
    width: '100%', //................Largura total
    position: 'absolute', //.........Posicao absoluta
    left: 0, //......................Alinhado a esquerda
    right: 0, //.....................Alinhado a direita
    bottom: 0, //...................Fixo na base
    zIndex: 1000, //................Acima de tudo
    elevation: 1000, //..............Elevacao android
  },

  // Curva decorativa superior
  bottomNavCurve: {
    height: 30, //..................Altura da curva
    backgroundColor: '#f4f4f4', //..Fundo cinza claro
    borderTopLeftRadius: 20, //.....Arredondamento esquerdo
    borderTopRightRadius: 20, //....Arredondamento direito
  },

  // Conteudo dos icones do menu
  bottomNavContent: {
    flexDirection: 'row', //........Layout horizontal
    alignItems: 'flex-end', //......Alinha na base
    justifyContent: 'center', //....Centraliza horizontal
    paddingHorizontal: 27, //......Espaco lateral
    paddingTop: 15, //..............Espaco superior
    gap: 88, //.....................Espaco entre grupos
    position: 'relative', //........Referencia para botao central
  },

  // Grupo lateral de icones
  bottomNavSide: {
    flexDirection: 'row', //........Layout horizontal
    alignItems: 'flex-end', //......Alinha na base
    justifyContent: 'space-between', //..Distribui igualmente
    width: 130, //..................Largura do grupo
  },

  // Icone individual do menu
  bottomNavIcon: {
    width: 50, //..Largura do icone
    height: 25, //..Altura do icone
  },

  // Botao central hexagonal de vendas
  centerButton: {
    position: 'absolute', //..Posicao absoluta
    top: -23, //..............Eleva acima do menu
    left: '50%', //...........Centraliza horizontal
    marginLeft: -30, //......Ajuste de offset
    width: 60, //.............Largura do botao
    height: 60, //............Altura do botao
    justifyContent: 'center', //..Centraliza vertical
    alignItems: 'center', //......Centraliza horizontal
  },
});

export default BottomMenu;
