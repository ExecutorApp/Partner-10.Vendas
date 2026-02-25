import React from 'react';
import { View, Text, TouchableOpacity, StatusBar, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface HeaderProps {
  title: string;
  notificationCount: number;
  onMenuPress: () => void;
  showBackButton?: boolean;
  onBackPress?: () => void;
  showAgendaIcons?: boolean;
  onCalendarWeekPress?: () => void;
  calendarWeekActive?: boolean;
  onCalendarMonthPress?: () => void;
  calendarMonthActive?: boolean;
  extraActions?: React.ReactNode;
  hideActions?: boolean;
  backButtonColor?: string;
}

const Header: React.FC<HeaderProps> = ({ title, notificationCount, onMenuPress, showBackButton = false, onBackPress, showAgendaIcons = false, onCalendarWeekPress, calendarWeekActive = false, onCalendarMonthPress, calendarMonthActive = false, extraActions, hideActions = false, backButtonColor = '#3A3F51' }) => {
  return (
    <View style={styles.header}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.statusBar}>
        <Text style={[styles.statusTime, styles.statusTimeHidden]}>9:41</Text>
        <View style={styles.statusIcons}>
        </View>
      </View>
      
      <View style={styles.headerContent}>
        {showBackButton && (
          <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <Path d="M19 12H5M12 19L5 12L12 5" stroke={backButtonColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
          </TouchableOpacity>
        )}
        
        <View style={[styles.titleContainer, showBackButton && styles.titleWithBack]}>
          <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
        </View>
        
        <View style={[styles.headerActions, showAgendaIcons && styles.headerActionsWide, extraActions ? styles.headerActionsWithExtra : null]}>
          {/* Icones adicionais: exibidos somente quando showAgendaIcons=true */}
          {showAgendaIcons && (
            <>
              <TouchableOpacity style={styles.calendarIconWrapper} onPress={onCalendarWeekPress} activeOpacity={0.7}>
                <Svg width={26} height={27} viewBox="0 0 26 27" fill="none">
                  <Path d="M24.2849 2.80841C24.2849 2.5376 24.0132 2.26673 23.7414 2.26673H18.5784V0.641781C18.5784 0.316781 18.361 0.100098 18.0349 0.100098C17.7088 0.100098 17.4914 0.316781 17.4914 0.641781V6.6001C17.4914 6.9251 17.7088 7.14178 18.0349 7.14178C18.361 7.14178 18.5784 6.9251 18.5784 6.6001V5.08341C19.2305 5.3001 19.6654 5.89591 19.6654 6.6001C19.6654 7.52097 18.9588 8.22515 18.0349 8.22515C17.111 8.22515 16.4044 7.52097 16.4044 6.6001C16.4044 6.22091 16.5674 5.84178 16.7848 5.51673C17.0022 5.30005 16.9479 4.97505 16.7305 4.75841C16.5131 4.54173 16.187 4.59591 15.9697 4.81255C15.5349 5.3001 15.3175 5.95005 15.3175 6.60005C15.3175 8.11673 16.5131 9.30836 18.0349 9.30836C19.5566 9.30836 20.7522 8.11673 20.7522 6.60005C20.7522 5.30005 19.8283 4.21668 18.5784 3.94586V3.3501H23.1979L23.4696 9.8501H1.73053L2.00225 3.3501H5.53489C5.86098 3.3501 6.07839 3.13341 6.07839 2.80841C6.07839 2.48341 5.86103 2.26673 5.53489 2.26673H1.45881C1.18709 2.26673 0.915314 2.48341 0.915314 2.80841L0.100098 23.1209C0.100098 24.746 1.45881 26.1001 3.08924 26.1001H22.111C22.9262 26.1001 23.6327 25.7751 24.2305 25.2334C24.774 24.6917 25.1001 23.9334 25.1001 23.1209L24.2849 2.80841ZM23.4697 24.4751C23.0892 24.8543 22.6544 25.0168 22.111 25.0168H3.08924C2.05667 25.0168 1.18709 24.1501 1.18709 23.121L1.67627 10.9335H23.524L24.0132 23.121C24.0132 23.6085 23.7957 24.096 23.4697 24.4751Z" fill={calendarWeekActive ? '#1777CF' : '#3A3F51'}/>
                  <Path d="M7.16533 7.14178C7.49141 7.14178 7.70882 6.92515 7.70882 6.6001V5.08341C8.36094 5.3001 8.79581 5.89591 8.79581 6.6001C8.79581 7.52097 8.08927 8.22515 7.16533 8.22515C6.24138 8.22515 5.53484 7.52091 5.53484 6.6001C5.53484 6.22091 5.69789 5.84178 5.91529 5.51673C6.1327 5.30005 6.07834 4.97505 5.86098 4.75841C5.64357 4.54173 5.31749 4.59591 5.10013 4.81255C4.66536 5.3001 4.44796 5.95005 4.44796 6.60005C4.44796 8.11673 5.64357 9.30836 7.16533 9.30836C8.68708 9.30836 9.8827 8.11673 9.8827 6.60005C9.8827 5.30005 8.95881 4.21668 7.70882 3.94586V3.3501H16.4045C16.7306 3.3501 16.948 3.13341 16.948 2.80841C16.948 2.48341 16.7306 2.26673 16.4045 2.26673H7.70882V0.641781C7.70882 0.316781 7.49141 0.100098 7.16533 0.100098C6.83924 0.100098 6.62183 0.316781 6.62183 0.641781V6.6001C6.62183 6.9251 6.83919 7.14178 7.16533 7.14178ZM15.3175 13.6417H9.8827C9.55661 13.6417 9.3392 13.8584 9.3392 14.1834C9.3392 14.5084 9.55656 14.7251 9.8827 14.7251H14.3392L9.99133 21.496C9.82828 21.7668 9.8826 22.0918 10.1544 22.2543C10.2631 22.3084 10.3717 22.3626 10.4261 22.3626C10.5891 22.3626 10.8065 22.2543 10.8609 22.0918L15.7522 14.5085C15.8609 14.346 15.8609 14.1293 15.7522 13.9668C15.6979 13.7501 15.5349 13.6417 15.3175 13.6417Z" fill={calendarWeekActive ? '#1777CF' : '#3A3F51'}/>
                </Svg>
              </TouchableOpacity>

              <TouchableOpacity style={styles.agendaIconWrapper} onPress={onCalendarMonthPress} activeOpacity={0.7}>
                <Svg width={27} height={27} viewBox="0 0 27 27" fill="none">
                  <Path d="M0.600098 10.8942H25.6001M6.8501 3.54127V0.600098M19.3501 3.54127V0.600098M3.7251 25.6001H22.4751C24.201 25.6001 25.6001 24.2833 25.6001 22.6589V6.48245C25.6001 4.85808 24.201 3.54127 22.4751 3.54127H3.7251C1.99921 3.54127 0.600098 4.85808 0.600098 6.48245V22.6589C0.600098 24.2833 1.99921 25.6001 3.7251 25.6001Z" stroke={calendarMonthActive ? '#1777CF' : '#3A3F51'} strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
              </TouchableOpacity>
            </>
          )}

          {extraActions}
          {!hideActions && (
              <View style={styles.notificationContainer}>
                <View style={styles.bellIcon}>
                  <Svg width={22} height={26} viewBox="0 0 22 26" fill="none">
                    <Path d="M14.3895 20.1344V21.0575C14.3895 22.0368 14.0067 22.976 13.3254 23.6685C12.644 24.361 11.7198 24.75 10.7562 24.75C9.79263 24.75 8.86849 24.361 8.18711 23.6685C7.50574 22.976 7.12295 22.0368 7.12295 21.0575V20.1344M20.5025 18.2563C19.0446 16.4429 18.0154 15.5198 18.0154 10.5206C18.0154 5.94251 15.715 4.31149 13.8218 3.51934C13.5703 3.41434 13.3335 3.17317 13.2569 2.91066C12.9248 1.76196 11.9938 0.75 10.7562 0.75C9.51858 0.75 8.58699 1.76254 8.25829 2.91182C8.18165 3.17721 7.94492 3.41434 7.69343 3.51934C5.79788 4.31264 3.49982 5.9379 3.49982 10.5206C3.49699 15.5198 2.46775 16.4429 1.00989 18.2563C0.405857 19.0075 0.934954 20.1354 1.99144 20.1354H19.5266C20.5774 20.1354 21.1031 19.004 20.5025 18.2563Z" stroke="#3A3F51" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
                  </Svg>
                </View>
                {notificationCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <View style={styles.badgeCircle}>
                      <Text style={styles.badgeText}>{notificationCount}</Text>
                    </View>
                  </View>
                )}
              </View>
          )}
          <TouchableOpacity
            style={styles.menuIcon}
            onPress={onMenuPress}
          >
            <Svg width={20} height={17} viewBox="0 0 18 15" fill="none">
              <Path d="M0 1.25C0 0.558594 0.558594 0 1.25 0H16.25C16.9414 0 17.5 0.558594 17.5 1.25C17.5 1.94141 16.9414 2.5 16.25 2.5H1.25C0.558594 2.5 0 1.94141 0 1.25ZM0 7.5C0 6.80859 0.558594 6.25 1.25 6.25H16.25C16.9414 6.25 17.5 6.80859 17.5 7.5C17.5 8.19141 16.9414 8.75 16.25 8.75H1.25C0.558594 8.75 0 8.19141 0 7.5ZM17.5 13.75C17.5 14.4414 16.9414 15 16.25 15H1.25C0.558594 15 0 14.4414 0 13.75C0 13.0586 0.558594 12.5 1.25 12.5H16.25C16.9414 12.5 17.5 13.0586 17.5 13.75Z" fill="#3A3F51" />
            </Svg>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Container Principal do Header
  header: {
    backgroundColor: '#FFFFFF', //..Fundo branco padrao
    paddingTop: 1, //...............Espaco superior
    paddingBottom: 1, //............Espaco inferior
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  statusTime: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#000',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusTimeHidden: {
    opacity: 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 5,
  },
  titleContainer: {
    paddingLeft: 21,
    paddingRight: 126,
  },
  titleWithBack: {
    paddingLeft: 0,
    paddingRight: 0,
    flex: 1,
  },
  backButton: {
    paddingLeft: 16,
    paddingRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: '#3a3f51',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    // Espaçamento horizontal uniforme entre todos os ícones
    gap: 20,
    paddingRight: 0,
    width: 86,
  },
  headerActionsWide: {
    width: 180,
  },
  headerActionsWithExtra: {
    width: 126,
  },
  calendarIconWrapper: {
    width: 26,
    height: 27,
    // Espaçamento controlado pelo contêiner através de gap
    justifyContent: 'center',
    alignItems: 'center',
  },
  agendaIconWrapper: {
    width: 27,
    height: 27,
    // Espaçamento controlado pelo contêiner através de gap
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContainer: {
    position: 'relative',
    // Removido deslocamento negativo para espaçamento uniforme
    width: 28,
    height: 28,
  },
  bellIcon: {
    position: 'absolute',
    top: 4,
    left: 0,
    width: 22,
    height: 26,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    left: 10,
  },
  badgeCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#1777cf',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#fcfcfc',
    textAlign: 'center',
  },
  menuIcon: {
    // Espaçamento controlado pelo contêiner através de gap
    width: 18,
    height: 31,
    paddingTop: 10,
    marginRight: 15,
  },
});

export default Header;