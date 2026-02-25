// React e React Native
import React from 'react';

// Bibliotecas externas
import Svg, { Path, Circle, Rect } from 'react-native-svg';

// Icone de saque (seta para cima com base)
// Representa acao de resgatar saldo
export const WithdrawIcon = ({ color = '#1777CF' }: { color?: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M12 19V5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M5 12L12 5L19 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M8 21H16" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

// Icone de carteira (wallet profissional)
// Representa saldo disponivel no card de destaque
export const WalletBalanceIcon = ({ color = '#FFFFFF' }: { color?: string }) => (
  <Svg width="24" height="24" viewBox="0 0 512 512" fill="none">
    <Path d="M502 254.347h-6v-136c0-21.266-16.683-38.703-37.648-39.925l-10.273-42.435c-3.111-12.847-16.094-20.769-28.938-17.657L170.07 78.627a7.985 7.985 0 0 0-2.07-.28H40c-22.056 0-40 17.944-40 40v336c0 22.056 17.944 40 40 40h416c22.056 0 40-17.944 40-40v-72h6c5.514 0 10-4.486 10-10v-108c0-5.514-4.486-10-10-10zm-22-136v.017a39.86 39.86 0 0 0-13.586-6.638l-3.994-16.5c10.125 2.815 17.58 12.111 17.58 23.121zm-440-24h65.136l-66.731 16.155c-.042.008-.082.021-.123.03l-.165.04c-.021.005-.042.013-.063.019-.23.057-.455.124-.677.2l-.117.043a8.133 8.133 0 0 0-.604.247l-.165.079a7.786 7.786 0 0 0-1.96 1.354 8.636 8.636 0 0 0-.53.547 8.001 8.001 0 0 0-1.693 3.1 7.157 7.157 0 0 0-.084.328 7.838 7.838 0 0 0-.087.404c-.026.138-.045.278-.064.417a7.774 7.774 0 0 0-.039.342 7.955 7.955 0 0 0-.025.49c-.002.066-.01.131-.01.198 0 .038.005.074.006.112.002.159.012.318.024.479.009.117.017.234.03.35.016.133.038.266.061.4.024.14.048.28.079.418.01.043.014.086.024.129.019.076.046.148.066.223.038.141.078.281.124.419.042.126.088.249.136.371a6.854 6.854 0 0 0 .342.76c.044.085.088.171.135.254.087.155.179.305.275.453l.121.182a7.861 7.861 0 0 0 .864 1.045c.037.038.074.076.113.113a7.864 7.864 0 0 0 1.201.97 8.424 8.424 0 0 0 .662.393c.178.094.36.181.545.262.049.021.098.043.148.063.197.082.397.154.601.22l.117.037c.223.068.448.126.677.174l.065.014a8.011 8.011 0 0 0 1.578.159h.027c.1 0 .198.004.298 0H416a8 8 0 0 0 0-16H107.065l315.84-76.46c4.273-1.037 8.589 1.6 9.623 5.872l17.089 70.59h-1.613a8 8 0 0 0 0 16H456c.805 0 1.601.042 2.386.119.31.058.625.096.943.117 11.663 1.626 20.671 11.66 20.671 23.764v.027a39.788 39.788 0 0 0-24-8.022H40c-13.234 0-24-10.767-24-24s10.767-24 24-24zm440 360c0 13.233-10.766 24-24 24H40c-13.234 0-24-10.767-24-24V150.325a39.788 39.788 0 0 0 24 8.022h416c13.233 0 24 10.767 24 24v72H363.002c-6.066 0-11.002 4.936-11.002 11.002v105.996c0 6.066 4.936 11.002 11.002 11.002H480v72zm16-88H368v-96h119.884c.039 0 .077.006.116.006s.077-.005.116-.006H496v96z" fill={color}/>
    <Path d="M432 310.347a8 8 0 0 0-8 8c0 4.411-3.589 8-8 8s-8-3.589-8-8 3.589-8 8-8a8 8 0 0 0 0-16c-13.234 0-24 10.767-24 24s10.766 24 24 24 24-10.767 24-24a8 8 0 0 0-8-8z" fill={color}/>
  </Svg>
);

// Icone de antecipacao (relogio com cifrao)
// Representa acao de antecipar recebiveis
export const AnticipateIcon = ({ color = '#1777CF' }: { color?: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2"/>
    <Path d="M12 7V12L15 15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M17 17L21 21" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Path d="M19 19V21H21" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

// Icone de check circular (radio selecionado)
// Usado nos cards de conta bancaria selecionada
export const CheckCircleIcon = ({ color = '#1777CF' }: { color?: string }) => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2"/>
    <Path d="M8 12L11 15L16 9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

// Icone de circulo vazio (radio nao selecionado)
// Usado nos cards de conta bancaria nao selecionada
export const EmptyCircleIcon = ({ color = '#D8E0F0' }: { color?: string }) => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2"/>
  </Svg>
);

// Icone de banco generico
// Usado nos cards de conta bancaria
export const BankIcon = ({ color = '#7D8592' }: { color?: string }) => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path d="M3 21H21" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Path d="M3 10H21" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Path d="M12 3L21 10H3L12 3Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Rect x="5" y="10" width="2" height="8" stroke={color} strokeWidth="1.5"/>
    <Rect x="11" y="10" width="2" height="8" stroke={color} strokeWidth="1.5"/>
    <Rect x="17" y="10" width="2" height="8" stroke={color} strokeWidth="1.5"/>
  </Svg>
);

// Icone de menu (3 linhas horizontais)
// Usado no botao de menu dos cards de conta
export const MenuIcon = ({ color }: { color: string }) => (
  <Svg width={16} height={13} viewBox="0 0 18 15" fill="none">
    <Path d="M0 1.25C0 0.558594 0.558594 0 1.25 0H16.25C16.9414 0 17.5 0.558594 17.5 1.25C17.5 1.94141 16.9414 2.5 16.25 2.5H1.25C0.558594 2.5 0 1.94141 0 1.25ZM0 7.5C0 6.80859 0.558594 6.25 1.25 6.25H16.25C16.9414 6.25 17.5 6.80859 17.5 7.5C17.5 8.19141 16.9414 8.75 16.25 8.75H1.25C0.558594 8.75 0 8.19141 0 7.5ZM17.5 13.75C17.5 14.4414 16.9414 15 16.25 15H1.25C0.558594 15 0 14.4414 0 13.75C0 13.0586 0.558594 12.5 1.25 12.5H16.25C16.9414 12.5 17.5 13.0586 17.5 13.75Z" fill={color} />
  </Svg>
);

// Icone de editar (lapis com documento)
// Usado na opcao de editar conta
export const EditIcon = ({ color }: { color: string }) => (
  <Svg width="16" height="16" viewBox="0 0 14 14" fill="none">
    <Path fillRule="evenodd" clipRule="evenodd" d="M9.83873 0.581039L4.16126 6.25851C4.03725 6.38252 3.96758 6.55072 3.96758 6.72609V9.37115C3.96758 9.73636 4.26364 10.0324 4.62885 10.0324H7.2739C7.44928 10.0324 7.61748 9.96275 7.74149 9.83873L13.419 4.16126C14.1937 3.38654 14.1937 2.13048 13.419 1.35576L12.6442 0.581039C11.8695 -0.19368 10.6135 -0.19368 9.83873 0.581039ZM12.4838 2.29093L12.5388 2.35322C12.7405 2.61263 12.7222 2.98772 12.4838 3.2261L6.99882 8.70989H5.29011V6.99986L10.7739 1.51621C11.0321 1.25797 11.4508 1.25797 11.7091 1.51621L12.4838 2.29093Z" fill={color}/>
    <Path d="M6.63302 1.43598C6.63302 1.07078 6.33696 0.774719 5.97175 0.774719H3.30632L3.1629 0.777774C1.4034 0.852868 0 2.30306 0 4.08104V10.6937L0.00305472 10.8371C0.0781494 12.5966 1.52834 14 3.30632 14H9.91896L10.0624 13.9969C11.8219 13.9218 13.2253 12.4717 13.2253 10.6937V7.44137L13.2208 7.36426C13.1826 7.03539 12.9031 6.78011 12.564 6.78011C12.1988 6.78011 11.9028 7.07617 11.9028 7.44137V10.6937L11.8994 10.8102C11.839 11.8516 10.9754 12.6775 9.91896 12.6775H3.30632L3.18976 12.6741C2.14839 12.6138 1.32253 11.7502 1.32253 10.6937V4.08104L1.3259 3.96448C1.38623 2.92311 2.24983 2.09725 3.30632 2.09725H5.97175L6.04887 2.0928C6.37774 2.0546 6.63302 1.7751 6.63302 1.43598Z" fill={color}/>
  </Svg>
);

// Icone de lixeira pequeno (menu de contexto)
// Usado na opcao de excluir conta
export const TrashIconSmall = ({ color }: { color: string }) => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <Path d="M3 6H5H21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M10 11V17" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M14 11V17" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

// Icone de lixeira grande (modal de confirmacao)
// Usado no modal padrao de confirmacao de exclusao
export const TrashIconLarge = () => (
  <Svg width="27" height="30" viewBox="0 0 27 30" fill="none">
    <Path d="M10.8 12.2727C11.4923 12.2727 12.0629 12.7991 12.1409 13.4773L12.15 13.6364V21.8182C12.15 22.5713 11.5456 23.1818 10.8 23.1818C10.1077 23.1818 9.53707 22.6554 9.45908 21.9772L9.45 21.8182V13.6364C9.45 12.8832 10.0544 12.2727 10.8 12.2727Z" fill="#EF4444"/>
    <Path d="M17.5409 13.4773C17.4629 12.7991 16.8923 12.2727 16.2 12.2727C15.4544 12.2727 14.85 12.8832 14.85 13.6364V21.8182L14.8591 21.9772C14.9371 22.6554 15.5077 23.1818 16.2 23.1818C16.9456 23.1818 17.55 22.5713 17.55 21.8182V13.6364L17.5409 13.4773Z" fill="#EF4444"/>
    <Path fillRule="evenodd" clipRule="evenodd" d="M16.2 0C18.3569 0 20.1199 1.70307 20.2431 3.85054L20.25 4.09091V5.45455H25.65C26.3956 5.45455 27 6.06507 27 6.81818C27 7.5175 26.4788 8.09387 25.8074 8.17264L25.65 8.18182H24.3V25.9091C24.3 28.0877 22.614 29.8686 20.488 29.9931L20.25 30H6.75C4.59313 30 2.83006 28.2969 2.70688 26.1495L2.7 25.9091V8.18182H1.35C0.604416 8.18182 0 7.5713 0 6.81818C0 6.11886 0.521154 5.54249 1.19256 5.46372L1.35 5.45455H6.75V4.09091C6.75 1.91225 8.43604 0.131372 10.562 0.00694458L10.8 0H16.2ZM5.4 8.18182V25.9091C5.4 26.6084 5.92115 27.1848 6.59256 27.2636L6.75 27.2727H20.25C20.9423 27.2727 21.5129 26.7463 21.5909 26.0681L21.6 25.9091V8.18182H5.4ZM17.55 5.45455H9.45V4.09091L9.45908 3.93188C9.53707 3.25369 10.1077 2.72727 10.8 2.72727H16.2L16.3574 2.73645C17.0288 2.81522 17.55 3.39159 17.55 4.09091V5.45455Z" fill="#EF4444"/>
  </Svg>
);

// Icone de mais (plus)
// Usado no botao de cadastrar nova conta
export const PlusIcon = ({ color }: { color: string }) => (
  <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <Path d="M12 5V19M5 12H19" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

// Icone de estado vazio (banco profissional grande)
// Usado quando nao ha contas cadastradas
export const EmptyAccountIcon = ({ color = '#B0B5BE' }: { color?: string }) => (
  <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2L22 9H2L12 2Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M2 9H22" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <Path d="M5 9V19M9.5 9V19M14.5 9V19M19 9V19" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <Path d="M2 19H22M2 22H22" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </Svg>
);

// Icone de seta para baixo (chevron)
export const ChevronDownIcon = ({ color = '#3A3F51' }: { color?: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M6 9L12 15L18 9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);
