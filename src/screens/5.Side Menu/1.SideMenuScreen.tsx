import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Svg, Path } from 'react-native-svg';
import { useModal } from '../../context/ModalContext';
import RegistrationStorage from '../../utils/registrationStorage';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, ScreenNames } from '../../types/navigation';

interface SideMenuScreenProps {
  isVisible: boolean;
  onClose: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

// Cores de estado
const ACTIVE_COLOR = '#1777CF';
const INACTIVE_COLOR = '#7D8592';

// Componentes SVG dos ícones com cor dinâmica
const DashboardIcon: React.FC<{ color?: string }> = ({ color = INACTIVE_COLOR }) => (
  <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <Path d="M2.66667 0C1.19391 0 0 1.19391 0 2.66667V4.44444C0 5.9172 1.19391 7.11111 2.66667 7.11111H4.44444C5.9172 7.11111 7.11111 5.9172 7.11111 4.44444V2.66667C7.11111 1.19391 5.9172 0 4.44444 0H2.66667Z" fill={color}/>
    <Path d="M11.5556 0C10.0828 0 8.88889 1.19391 8.88889 2.66667V4.44444C8.88889 5.9172 10.0828 7.11111 11.5556 7.11111H13.3333C14.8061 7.11111 16 5.9172 16 4.44444V2.66667C16 1.19391 14.8061 0 13.3333 0H11.5556Z" fill={color}/>
    <Path d="M0 11.5556C0 10.0828 1.19391 8.88889 2.66667 8.88889H4.44444C5.9172 8.88889 7.11111 10.0828 7.11111 11.5556V13.3333C7.11111 14.8061 5.9172 16 4.44444 16H2.66667C1.19391 16 0 14.8061 0 13.3333V11.5556Z" fill={color}/>
    <Path d="M11.5556 8.88889C10.0828 8.88889 8.88889 10.0828 8.88889 11.5556V13.3333C8.88889 14.8061 10.0828 16 11.5556 16H13.3333C14.8061 16 16 14.8061 16 13.3333V11.5556C16 10.0828 14.8061 8.88889 13.3333 8.88889H11.5556Z" fill={color}/>
  </Svg>
);

const ProdutosIcon: React.FC<{ color?: string }> = ({ color = INACTIVE_COLOR }) => (
  <Svg width="18" height="16" viewBox="0 0 18 16" fill="none">
    <Path d="M0.662897 3.35419C0.220942 3.81256 0 4.36119 0 4.99998V13.6666C0 14.3057 0.220942 14.8543 0.662897 15.3125C1.10489 15.771 1.63392 16 2.24999 16H2.89279V2.66658H2.24999C1.63378 2.66658 1.10478 2.89582 0.662897 3.35419Z" fill={color}/>
    <Path d="M12.8571 0.999959C12.8571 0.722158 12.7634 0.486097 12.5758 0.291629C12.3885 0.097161 12.1607 0 11.8929 0H6.10719C5.83938 0 5.61172 0.097161 5.42417 0.291629C5.23665 0.485987 5.14292 0.722122 5.14292 0.999959V2.66658H3.8572V16H14.1429V2.66658H12.8571V0.999959ZM11.5715 2.66658H6.42861V1.33329H11.5715V2.66658Z" fill={color}/>
    <Path d="M17.3371 3.35419C16.8951 2.89586 16.366 2.66658 15.75 2.66658H15.1071V16H15.75C16.3661 16 16.8951 15.771 17.3371 15.3125C17.779 14.8543 18 14.3056 18 13.6666V4.99998C18 4.36119 17.7789 3.81256 17.3371 3.35419Z" fill={color}/>
  </Svg>
);

const KeymansIcon: React.FC<{ color?: string }> = ({ color = INACTIVE_COLOR }) => (
  <Svg width="18" height="16" viewBox="0 0 18 16" fill="none">
    <Path d="M4.73036 7.25729C6.71398 7.25729 8.31443 5.63248 8.31443 3.62944C8.31443 1.62405 6.71473 0 4.73036 0C2.75602 0 1.15632 1.62405 1.15632 3.62944C1.15632 5.63168 2.75606 7.25729 4.73036 7.25729ZM7.6023 7.8477H1.86466C0.840406 7.8477 0 8.80224 0 9.97133V15.8121C0 15.8763 0.0301155 15.935 0.0363105 16H9.43218C9.43605 15.935 9.46617 15.8763 9.46617 15.8121V9.97133C9.46617 8.80224 8.62884 7.8477 7.6023 7.8477ZM18 3.87687C17.9961 1.74697 16.0767 0.0313281 13.7269 0.0368096C11.3663 0.0407301 9.4623 1.77049 9.46538 3.89488C9.46924 5.57295 10.6642 6.99262 12.3234 7.51492L12.3458 14.8678L13.7308 15.8779L15.1706 14.8591L15.1682 13.8834H14.5032L14.5001 12.9273H15.1667L15.1605 11.8702H14.4986L14.4955 10.9157H15.1605L15.1575 9.96036H14.4932L14.4908 9.00506L15.1582 9.00426L15.1474 7.5102C16.8089 6.98166 18 5.5565 18 3.87687ZM13.7292 1.69375C14.2583 1.69375 14.6924 2.13303 14.6924 2.66866C14.6963 3.21133 14.2622 3.64905 13.7315 3.64905C13.1978 3.64905 12.7668 3.21757 12.7668 2.67338C12.7637 2.13539 13.1955 1.69531 13.7292 1.69375Z" fill={color}/>
  </Svg>
);

const ClientesIcon: React.FC<{ color?: string }> = ({ color = INACTIVE_COLOR }) => (
  <Svg width="18" height="15" viewBox="0 0 18 15" fill="none">
    <Path fillRule="evenodd" clipRule="evenodd" d="M0 14.1667V13.5958C0 13.025 0.407455 12.36 0.911455 12.1092L5.54236 9.8075C6.21409 9.47417 6.37036 8.73417 5.886 8.14917L5.58982 7.79167C4.98764 7.065 4.5 5.70833 4.5 4.75833V3.33333C4.5 2.44928 4.8448 1.60143 5.45856 0.976311C6.07231 0.351189 6.90475 0 7.77273 0C8.64071 0 9.47314 0.351189 10.0869 0.976311C10.7007 1.60143 11.0455 2.44928 11.0455 3.33333V4.75833C11.0455 5.70833 10.5545 7.06917 9.95564 7.79333L9.66027 8.15C9.17755 8.7325 9.32809 9.47333 10.0031 9.80833L14.634 12.11C15.1372 12.36 15.5455 13.0208 15.5455 13.5958V14.1667C15.5455 14.3877 15.4593 14.5996 15.3058 14.7559C15.1524 14.9122 14.9443 15 14.7273 15H0.818182C0.601187 15 0.393079 14.9122 0.23964 14.7559C0.086201 14.5996 0 14.3877 0 14.1667ZM15.5455 9.58333H18V10.8333H15.5455V9.58333ZM13.9091 7.08333H18V8.33333H13.9091V7.08333ZM12.2727 4.58333H18V5.83333H12.2727V4.58333Z" fill={color}/>
  </Svg>
);

const AgendaIcon: React.FC<{ color?: string }> = ({ color = INACTIVE_COLOR }) => (
  <Svg width="18" height="16" viewBox="0 0 18 16" fill="none">
    <Path d="M0.52656 12.8H14.3084C14.432 12.8 14.5515 12.7562 14.6463 12.6765C14.7786 12.5644 17.7982 9.9374 17.9824 4.26666H3.18091C2.99749 9.41417 0.216574 11.8336 0.187674 11.8578C0.0182484 12.0026 -0.0440864 12.239 0.0321357 12.4495C0.107831 12.6594 0.305101 12.8 0.52656 12.8Z" fill={color}/>
    <Path d="M17.4726 1.06666H14.8358V0.533332C14.8358 0.234666 14.6037 0 14.3084 0C14.0131 0 13.781 0.234666 13.781 0.533332V1.06666H11.109V0.533332C11.109 0.234666 10.877 0 10.5817 0C10.2863 0 10.0543 0.234666 10.0543 0.533332V1.06666H7.41746V0.533332C7.41746 0.234666 7.18542 0 6.89009 0C6.59477 0 6.36272 0.234666 6.36272 0.533332V1.06666H3.72589C3.43056 1.06666 3.19852 1.30133 3.19852 1.6V3.19999H18V1.6C18 1.30133 17.7679 1.06666 17.4726 1.06666Z" fill={color}/>
    <Path d="M15.3235 13.4943C15.0371 13.7354 14.6777 13.8667 14.3084 13.8667H3.19855V15.4667C3.19855 15.7615 3.43443 16 3.72592 16H17.4726C17.7641 16 18 15.7615 18 15.4667V9.48816C16.9832 12.0109 15.5644 13.2904 15.3235 13.4943Z" fill={color}/>
  </Svg>
);

const VendasIcon: React.FC<{ color?: string }> = ({ color = INACTIVE_COLOR }) => (
  <Svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <Path d="M9 0C4.02944 0 0 4.02944 0 9C0 13.9706 4.02944 18 9 18C13.9706 18 18 13.9706 18 9C18 4.02944 13.9706 0 9 0ZM10.0407 13.5997V14.5461H8.0231V13.6053C6.37812 13.3053 5.3591 12.2231 5.3591 10.5849H7.94088C7.94088 11.196 8.44038 11.5013 8.99928 11.5013C9.5234 11.5013 10.0229 11.2345 10.0229 10.7686C10.0229 10.2028 9.32206 10.0388 8.46288 9.82645C7.15097 9.50044 5.48057 9.0954 5.48057 7.03645C5.48057 5.57035 6.38928 4.61909 7.93238 4.34315V3.45395H9.94997V4.3524C11.4836 4.65156 12.3481 5.66219 12.3481 7.16652L9.84118 7.17217C9.84118 6.64204 9.41695 6.38309 8.89859 6.38309C8.44823 6.38309 8.01824 6.56845 8.01824 6.95909C8.01824 7.4767 8.69782 7.64636 9.55847 7.86456C10.8954 8.20973 12.6411 8.64756 12.6411 10.7187C12.641 12.3358 11.5968 13.3114 10.0407 13.5997Z" fill={color}/>
  </Svg>
);

const ComissoesIcon: React.FC<{ color?: string }> = ({ color = INACTIVE_COLOR }) => (
  <Svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <Path fillRule="evenodd" clipRule="evenodd" d="M9 0C4.0326 0 0 4.0326 0 9C0 13.9674 4.0326 18 9 18C13.9674 18 18 13.9674 18 9C18 4.0326 13.9674 0 9 0ZM5.8242 13.1664L13.1664 5.8242C13.2757 5.71104 13.3362 5.55948 13.3348 5.40216C13.3334 5.24484 13.2703 5.09435 13.1591 4.98311C13.0478 4.87186 12.8974 4.80876 12.74 4.8074C12.5827 4.80603 12.4312 4.86651 12.318 4.9758L4.9758 12.318C4.86651 12.4312 4.80603 12.5827 4.8074 12.74C4.80876 12.8974 4.87186 13.0478 4.98311 13.1591C5.09435 13.2703 5.24484 13.3334 5.40216 13.3348C5.55948 13.3362 5.71104 13.2757 5.8242 13.1664ZM11.4546 9.1734C11.0984 9.17328 10.7502 9.2788 10.454 9.47661C10.1578 9.67441 9.92694 9.95562 9.79058 10.2847C9.65422 10.6137 9.61851 10.9758 9.68797 11.3251C9.75743 11.6745 9.92893 11.9954 10.1808 12.2472C10.4326 12.4991 10.7535 12.6706 11.1029 12.74C11.4522 12.8095 11.8143 12.7738 12.1433 12.6374C12.4724 12.5011 12.7536 12.2702 12.9514 11.974C13.1492 11.6778 13.2547 11.3296 13.2546 10.9734C13.2546 9.9804 12.4482 9.1734 11.4546 9.1734ZM11.4546 10.3734C11.6137 10.3734 11.7663 10.4366 11.8789 10.5491C11.9914 10.6617 12.0546 10.8143 12.0546 10.9734C12.0546 11.1325 11.9914 11.2851 11.8789 11.3977C11.7663 11.5102 11.6137 11.5734 11.4546 11.5734C11.2955 11.5734 11.1429 11.5102 11.0303 11.3977C10.9178 11.2851 10.8546 11.1325 10.8546 10.9734C10.8546 10.8143 10.9178 10.6617 11.0303 10.5491C11.1429 10.4366 11.2955 10.3734 11.4546 10.3734ZM6.6546 5.5734C6.29842 5.57328 5.95021 5.6788 5.65401 5.87661C5.35782 6.07441 5.12694 6.35562 4.99058 6.68466C4.85422 7.0137 4.81851 7.37579 4.88797 7.72513C4.95743 8.07447 5.12893 8.39536 5.38078 8.64722C5.63264 8.89907 5.95353 9.07057 6.30287 9.14003C6.65221 9.20949 7.0143 9.17378 7.34334 9.03742C7.67238 8.90106 7.95359 8.67019 8.15139 8.37399C8.3492 8.07779 8.45472 7.72958 8.4546 7.3734C8.4546 6.3804 7.6482 5.5734 6.6546 5.5734ZM6.6546 6.7734C6.81373 6.7734 6.96634 6.83661 7.07886 6.94914C7.19139 7.06166 7.2546 7.21427 7.2546 7.3734C7.2546 7.53253 7.19139 7.68514 7.07886 7.79766C6.96634 7.91019 6.81373 7.9734 6.6546 7.9734C6.49547 7.9734 6.34286 7.91019 6.23034 7.79766C6.11781 7.68514 6.0546 7.53253 6.0546 7.3734C6.0546 7.21427 6.11781 7.06166 6.23034 6.94914C6.34286 6.83661 6.49547 6.7734 6.6546 6.7734Z" fill={color}/>
  </Svg>
);

const TreinamentosIcon: React.FC<{ color?: string }> = ({ color = INACTIVE_COLOR }) => (
  <Svg width="18" height="16" viewBox="0 0 18 16" fill="none">
    <Path d="M16.8703 10.8185V5.21989L15.8156 5.57145V10.8185C15.1598 11.0393 14.686 11.6597 14.686 12.389V15.2132C14.686 15.5044 14.9221 15.7405 15.2133 15.7405H17.4727C17.7639 15.7405 18 15.5044 18 15.2132V12.389C18 11.6597 17.5262 11.0393 16.8703 10.8185Z" fill={color}/>
    <Path d="M8.4999 7.6766L3.38906 5.973V9.56478C3.38906 9.70466 3.44464 9.83878 3.54354 9.93768C5.00119 11.3952 6.93911 12.1978 9.00025 12.1978C11.0614 12.1978 12.9992 11.3952 14.4565 9.93761C14.5554 9.83871 14.6109 9.70459 14.6109 9.56478V5.973L9.50027 7.67657C9.15093 7.7929 8.79926 7.77634 8.4999 7.6766Z" fill={color}/>
    <Path d="M9 6.70306C9.05632 6.70306 9.11264 6.69402 9.16675 6.67599L17.6394 3.85178C17.8547 3.77999 18 3.57848 18 3.35151C18 3.12454 17.8548 2.92302 17.6394 2.85123L9.16675 0.0270264C9.05854 -0.00900879 8.94147 -0.00900879 8.83325 0.0270264L0.360598 2.85123C0.14523 2.92299 0 3.1245 0 3.35151C0 3.57851 0.14523 3.77999 0.360598 3.85178L8.83325 6.67599C8.88736 6.69402 8.94368 6.70306 9 6.70306Z" fill={color}/>
  </Svg>
);

const ConfiguracoesIcon: React.FC<{ color?: string }> = ({ color = INACTIVE_COLOR }) => (
  <Svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <Path d="M17.0123 7.0455L15.6022 6.86625C15.486 6.5085 15.3427 6.1635 15.1755 5.83575L16.0462 4.7145C16.3988 4.26075 16.3575 3.62025 15.9548 3.23025L14.7735 2.049C14.3798 1.6425 13.7392 1.602 13.2847 1.95375L12.165 2.8245C11.8372 2.65725 11.4923 2.514 11.1337 2.39775L10.9545 0.99C10.887 0.42525 10.4078 0 9.84 0H8.16C7.59225 0 7.113 0.42525 7.0455 0.98775L6.86625 2.39775C6.50775 2.514 6.16275 2.6565 5.835 2.8245L4.7145 1.95375C4.2615 1.602 3.621 1.6425 3.23025 2.04525L2.049 3.22575C1.6425 3.62025 1.60125 4.26075 1.95375 4.71525L2.8245 5.83575C2.6565 6.1635 2.514 6.5085 2.39775 6.86625L0.99 7.0455C0.42525 7.113 0 7.59225 0 8.16V9.84C0 10.4078 0.42525 10.887 0.98775 10.9545L2.39775 11.1337C2.514 11.4915 2.65725 11.8365 2.8245 12.1642L1.95375 13.2855C1.60125 13.7393 1.6425 14.3798 2.04525 14.7698L3.2265 15.951C3.621 16.3568 4.26075 16.3972 4.71525 16.0455L5.83575 15.1747C6.1635 15.3427 6.5085 15.486 6.86625 15.6015L7.0455 17.0085C7.113 17.5747 7.59225 18 8.16 18H9.84C10.4078 18 10.887 17.5748 10.9545 17.0123L11.1337 15.6022C11.4915 15.486 11.8365 15.3427 12.1642 15.1755L13.2855 16.0462C13.7393 16.3988 14.3798 16.3575 14.7698 15.9548L15.951 14.7735C16.3575 14.379 16.3988 13.7392 16.0462 13.2847L15.1755 12.1642C15.3435 11.8365 15.4867 11.4915 15.6022 11.1337L17.0093 10.9545C17.574 10.887 17.9993 10.4078 17.9993 9.84V8.16C18 7.59225 17.5748 7.113 17.0123 7.0455ZM9 12.75C6.93225 12.75 5.25 11.0677 5.25 9C5.25 6.93225 6.93225 5.25 9 5.25C11.0677 5.25 12.75 6.93225 12.75 9C12.75 11.0677 11.0677 12.75 9 12.75Z" fill={color}/>
  </Svg>
);

const CompromissosIcon: React.FC<{ color?: string }> = ({ color = INACTIVE_COLOR }) => (
  <Svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <Path
      d="M18 2.06255C18 0.924785 17.0752 0 15.9375 0H2.06255C0.924785 0 0 0.924785 0 2.06255V15.9375C0 17.0752 0.924785 18 2.06255 18H15.9375C17.0752 18 18 17.0752 18 15.9375V2.06255ZM13.5615 6.03232C13.8547 6.32552 13.8547 6.79943 13.5615 7.09277L8.68648 11.9677C8.54023 12.1139 8.34824 12.1875 8.15625 12.1875C7.96426 12.1875 7.77227 12.1139 7.62602 11.9677L5.18857 9.53023C4.89523 9.23702 4.89523 8.76298 5.18857 8.46977C5.48177 8.17643 5.95568 8.17643 6.24902 8.46977L8.15625 10.377L12.5011 6.03232C12.7943 5.73898 13.2682 5.73898 13.5615 6.03232Z"
      fill={color}
    />
  </Svg>
);

const ComercialIcon: React.FC<{ color?: string }> = ({ color = INACTIVE_COLOR }) => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"
      fill={color}
    />
  </Svg>
);

const SairIcon = () => (
  <Svg width="19" height="15" viewBox="0 0 19 15" fill="none">
    <Path d="M18.4434 7.75665L12.209 13.991C11.6523 14.5477 10.6875 14.158 10.6875 13.3602V9.79766H5.64062C5.14707 9.79766 4.75 9.40059 4.75 8.90704V5.34454C4.75 4.85098 5.14707 4.45391 5.64062 4.45391H10.6875V0.891414C10.6875 0.0972737 11.6486 -0.296086 12.209 0.260555L18.4434 6.49493C18.7885 6.84376 18.7885 7.40782 18.4434 7.75665ZM7.125 13.8055V12.3211C7.125 12.0762 6.92461 11.8758 6.67969 11.8758H3.5625C2.90566 11.8758 2.375 11.3451 2.375 10.6883V3.56329C2.375 2.90645 2.90566 2.37579 3.5625 2.37579H6.67969C6.92461 2.37579 7.125 2.1754 7.125 1.93048V0.446102C7.125 0.20118 6.92461 0.000789264 6.67969 0.000789264H3.5625C1.5957 0.000789264 0 1.59649 0 3.56329V10.6883C0 12.6551 1.5957 14.2508 3.5625 14.2508H6.67969C6.92461 14.2508 7.125 14.0504 7.125 13.8055Z" fill="#1777CF"/>
  </Svg>
);

const SideMenuScreen: React.FC<SideMenuScreenProps> = ({ isVisible, onClose }) => {
  const [slideAnim] = useState(new Animated.Value(-220));
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { openModal } = useModal();
  
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Mover antes de qualquer retorno condicional para manter a ordem dos Hooks
  const [activeItem, setActiveItem] = useState<string>('Clientes');
  const [profileName, setProfileName] = useState<string>('Linkon Henrique');
  const [profileWhatsapp, setProfileWhatsapp] = useState<string>('17 99246-0986');
  const [profilePhotoUri, setProfilePhotoUri] = useState<string | null>(null);

  React.useEffect(() => {
    if (isVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -220,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, slideAnim]);

  const handleOpenPersonal = () => {
    try {
      openModal('registrationDataPersonal');
    } finally {
      onClose();
    }
  };

  // Carregar nome, WhatsApp e foto salvos quando o menu abre
  React.useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await RegistrationStorage.getRegistrationData();
        if (data?.personal) {
          if (data.personal.name) setProfileName(data.personal.name);
          if (data.personal.whatsapp) setProfileWhatsapp(data.personal.whatsapp);
          setProfilePhotoUri(data.personal.photoUri ?? null);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do perfil:', error);
      }
    };
    if (isVisible) {
      loadProfile();
    }
  }, [isVisible]);

  if (!fontsLoaded) {
    return null;
  }
  const menuItems = [
    { icon: <DashboardIcon />, title: 'Dashboard', color: '#91929E' },
    { icon: <CompromissosIcon />, title: 'Compromissos', color: '#91929E' },
    { icon: <ComercialIcon />, title: 'Comercial', color: '#91929E' },
    { icon: <ProdutosIcon />, title: 'Produtos', color: '#91929E' },
    { icon: <KeymansIcon />, title: 'Keymans', color: '#7D8592' },
    { icon: <ClientesIcon />, title: 'Clientes', color: '#1777CF' },
    { icon: <AgendaIcon />, title: 'Agenda', color: '#91929E' },
    { icon: <VendasIcon />, title: 'Vendas', color: '#91929E' },
    { icon: <ComissoesIcon />, title: 'Comissões', color: '#91929E' },
    { icon: <TreinamentosIcon />, title: 'Treinamentos', color: '#91929E' },
    { icon: <ConfiguracoesIcon />, title: 'Configurações', color: '#91929E' },
  ];

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <Animated.View 
          style={[
            styles.menuContainer,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity activeOpacity={1} onPress={() => {}} style={styles.menuContent}>
            {/* Seção do usuário */}
            <View style={styles.userSection}>
              <TouchableOpacity style={styles.userInfo} activeOpacity={0.7} onPress={handleOpenPersonal}>
                <View style={styles.userAvatar}>
                  <Image
                    source={profilePhotoUri ? { uri: profilePhotoUri } : require('../../../assets/AvatarPlaceholder02.png')}
                    style={styles.userAvatarImage}
                    resizeMode="cover"
                  />
                </View>
                <View style={styles.userText}>
                  <Text style={styles.userName} numberOfLines={1} ellipsizeMode="tail">{profileName}</Text>
                  <Text style={styles.userPhone}>{profileWhatsapp}</Text>
                </View>
              </TouchableOpacity>
              
              {/* Divisor */}
              <View style={styles.divider} />
            </View>

            {/* Menu Items */}
        <View style={styles.menuItems}>
          {menuItems.map((item, index) => {
            const isActive = activeItem === item.title;
            const color = isActive ? ACTIVE_COLOR : INACTIVE_COLOR;
            const coloredIcon = React.cloneElement(item.icon as React.ReactElement<any>, { color });
            return (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() => {
                  setActiveItem(item.title);
                  if (item.title === 'Compromissos') {
                    navigation.navigate(ScreenNames.DailyCommitmentHome);
                    onClose();
                  }
                  if (item.title === 'Clientes') {
                    navigation.navigate(ScreenNames.CustomersHome);
                    onClose();
                  }
                  if (item.title === 'Keymans') {
                    navigation.navigate(ScreenNames.Keymans);
                    onClose();
                  }
                  if (item.title === 'Agenda') {
                    navigation.navigate(ScreenNames.Schedule);
                    onClose();
                  }
                  if (item.title === 'Vendas') {
                    navigation.navigate(ScreenNames.SalesHome);
                    onClose();
                  }
                  if (item.title === 'Comissões') {
                    navigation.navigate(ScreenNames.CommissionsHome);
                    onClose();
                  }
                  if (item.title === 'Treinamentos') {
                    navigation.navigate(ScreenNames.TrainingHome);
                    onClose();
                  }
                  if (item.title === 'Comercial') {
                    navigation.navigate(ScreenNames.CommercialHome);
                    onClose();
                  }
                }}
              >
                <View style={styles.menuIconWrapper}>{coloredIcon}</View>
                <Text style={[styles.menuItemText, { color }]}
                >
                  {item.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

            {/* Botão Sair */}
            <View style={styles.exitButtonContainer}>
              <TouchableOpacity style={styles.exitButton}>
                <SairIcon />
                <Text style={styles.exitButtonText}>Sair</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  menuContainer: {
    width: 240,
    height: '100%',
    backgroundColor: '#FCFCFC',
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuContent: {
    height: '100%',
    flexDirection: 'column',
  },
  userSection: {
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  userAvatar: {
    width: 65,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
    overflow: 'hidden',
    backgroundColor: '#F4F4F4',
    borderWidth: 1,
    borderColor: '#D8E0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarImage: {
    width: 65,
    height: 80,
    borderRadius: 8,
  },
  userText: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
  },
  userName: {
    fontSize: 16,
    color: '#3A3F51',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 5,
  },
  userPhone: {
    fontSize: 14,
    color: '#91929E',
    fontFamily: 'Inter_400Regular',
  },
  divider: {
    height: 0.1,
    backgroundColor: '#D8E0F0',
    width: '100%',
  },
  menuItems: {
    flex: 1,
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  menuIconWrapper: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    fontSize: 14,
    marginLeft: 12,
    fontFamily: 'Inter_500Medium',
    lineHeight: 18,
  },
  exitButtonContainer: {
    marginTop: 'auto',
    paddingBottom: 0,
  },
  exitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1777CF',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 31,
    height: 40,
  },
  exitButtonText: {
    fontSize: 16,
    color: '#1777CF',
    marginLeft: 8,
    fontFamily: 'Inter_700Bold',
  },
});

export default SideMenuScreen;
