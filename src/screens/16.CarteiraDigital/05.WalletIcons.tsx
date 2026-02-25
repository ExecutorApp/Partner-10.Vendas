// React e React Native
import React from 'react';

// Bibliotecas externas
import Svg, { Path, Circle } from 'react-native-svg';

// Icone de carteira com cor dinamica
export const WalletCardIcon = ({ color }: { color: string }) => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path d="M21 4H3C1.89543 4 1 4.89543 1 6V18C1 19.1046 1.89543 20 3 20H21C22.1046 20 23 19.1046 23 18V6C23 4.89543 22.1046 4 21 4Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M1 10H23" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Circle cx="18" cy="15" r="1.5" fill={color}/>
  </Svg>
);

// Icone de olho aberto com cor dinamica
export const EyeOpenIcon = ({ color }: { color: string }) => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

// Icone de olho fechado com cor dinamica
export const EyeClosedIcon = ({ color }: { color: string }) => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Path d="M17.94 17.94C16.23 19.24 14.18 20 12 20C5 20 1 12 1 12C2.24 9.68 3.97 7.65 6.06 6.06M9.9 4.24C10.59 4.08 11.29 4 12 4C19 4 23 12 23 12C22.39 13.13 21.67 14.18 20.86 15.14M14.12 14.12C13.56 14.72 12.8 15.07 12 15.07C11.2 15.07 10.44 14.72 9.88 14.12C9.32 13.52 9 12.72 9 11.88C9 11.04 9.32 10.24 9.88 9.64" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M1 1L23 23" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

// Icone de menu do header (tres linhas profissionais)
// Mesmo SVG utilizado no componente Header do sistema
export const HeaderMenuIcon = ({ color }: { color: string }) => (
  <Svg width="16" height="13" viewBox="0 0 18 15" fill="none">
    <Path d="M0 1.25C0 0.558594 0.558594 0 1.25 0H16.25C16.9414 0 17.5 0.558594 17.5 1.25C17.5 1.94141 16.9414 2.5 16.25 2.5H1.25C0.558594 2.5 0 1.94141 0 1.25ZM0 7.5C0 6.80859 0.558594 6.25 1.25 6.25H16.25C16.9414 6.25 17.5 6.80859 17.5 7.5C17.5 8.19141 16.9414 8.75 16.25 8.75H1.25C0.558594 8.75 0 8.19141 0 7.5ZM17.5 13.75C17.5 14.4414 16.9414 15 16.25 15H1.25C0.558594 15 0 14.4414 0 13.75C0 13.0586 0.558594 12.5 1.25 12.5H16.25C16.9414 12.5 17.5 13.0586 17.5 13.75Z" fill={color}/>
  </Svg>
);

// Icone de pesquisa
export const SearchIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="8" stroke="#7D8592" strokeWidth="2"/>
    <Path d="M21 21L16.65 16.65" stroke="#7D8592" strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

// Icone de filtro
export const FilterIcon = ({ color = '#7D8592' }: { color?: string }) => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Path d="M22 3H2L10 12.46V19L14 21V12.46L22 3Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

// Icone de teste (grid de layouts)
export const DesignTestIcon = ({ active }: { active?: boolean }) => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path d="M3 3H10V10H3V3Z" stroke={active ? '#1777CF' : '#3A3F51'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M14 3H21V10H14V3Z" stroke={active ? '#1777CF' : '#3A3F51'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M3 14H10V21H3V14Z" stroke={active ? '#1777CF' : '#3A3F51'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M14 14H21V21H14V14Z" stroke={active ? '#1777CF' : '#3A3F51'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);
