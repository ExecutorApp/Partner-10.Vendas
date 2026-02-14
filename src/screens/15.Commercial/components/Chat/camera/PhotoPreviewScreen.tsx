// ========================================
// Tela de Preview da Foto
// Mostra foto capturada com opcao de legenda
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Image, Pressable, StyleSheet, StatusBar, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

// ========================================
// Imports de Navegacao
// ========================================
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// ========================================
// Imports de Constantes
// ========================================
import { CameraColors, CameraStyles, CameraIcons } from './utils/cameraConstants';
import { ANIMATION_DURATION, createEnterAnimation } from './utils/cameraAnimations';
import { hapticLight, hapticSuccess } from './utils/cameraHaptics';

// ========================================
// Imports de Componentes
// ========================================
import CaptionInput from './components/CaptionInput';

// ========================================
// Tipo de Navegacao
// ========================================
type RootStackParamList = {
  CameraScreen: any;
  PhotoPreviewScreen: {
    photoUri: string;
    photoWidth: number;
    photoHeight: number;
    leadName: string;
    leadId: string;
    leadPhone: string;
  };
  PhotoEditScreen: {
    photoUri: string;
    photoWidth: number;
    photoHeight: number;
    leadName: string;
    leadId: string;
    leadPhone: string;
  };
  LeadChatScreen: any;
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'PhotoPreviewScreen'>;
type PhotoPreviewRouteProp = RouteProp<RootStackParamList, 'PhotoPreviewScreen'>;

// ========================================
// Icones
// ========================================
const CloseIcon: React.FC = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Path d={CameraIcons.close} fill={CameraColors.textWhite} />
  </Svg>
);

const EditIcon: React.FC = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill={CameraColors.textWhite} />
  </Svg>
);

// ========================================
// Componente Principal PhotoPreviewScreen
// ========================================
const PhotoPreviewScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PhotoPreviewRouteProp>();
  const insets = useSafeAreaInsets();
  const { photoUri, photoWidth, photoHeight, leadName, leadId, leadPhone } = route.params;

  // ========================================
  // Estados
  // ========================================
  const [caption, setCaption] = useState('');
  const [viewOnce, setViewOnce] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // ========================================
  // Animacoes de Entrada
  // ========================================
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const imageScale = useRef(new Animated.Value(1.05)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-20)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const footerTranslateY = useRef(new Animated.Value(30)).current;

  // ========================================
  // Executar Animacoes de Entrada
  // ========================================
  useEffect(() => {
    Animated.parallel([
      Animated.timing(imageOpacity, { toValue: 1, duration: ANIMATION_DURATION.normal, useNativeDriver: true }),
      Animated.timing(imageScale, { toValue: 1, duration: ANIMATION_DURATION.slow, useNativeDriver: true }),
    ]).start();
    Animated.stagger(100, [
      createEnterAnimation(headerOpacity, headerTranslateY, ANIMATION_DURATION.normal),
      createEnterAnimation(footerOpacity, footerTranslateY, ANIMATION_DURATION.normal),
    ]).start();
  }, [imageOpacity, imageScale, headerOpacity, headerTranslateY, footerOpacity, footerTranslateY]);

  // ========================================
  // Handler de Descartar
  // ========================================
  const handleDiscard = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // ========================================
  // Handler de Editar
  // ========================================
  const handleEdit = useCallback(() => {
    hapticLight();
    navigation.navigate('PhotoEditScreen' as any, {
      photoUri,
      photoWidth,
      photoHeight,
      leadName,
      leadId,
      leadPhone,
    });
  }, [navigation, photoUri, photoWidth, photoHeight, leadName, leadId, leadPhone]);

  // ========================================
  // Handler de Toggle View Once
  // ========================================
  const handleToggleViewOnce = useCallback(() => {
    hapticLight();
    setViewOnce(prev => !prev);
  }, []);

  // ========================================
  // Handler de Enviar
  // ========================================
  const handleSend = useCallback(async () => {
    if (isSending) return;
    hapticSuccess();
    setIsSending(true);

    try {
      navigation.dispatch(
        CommonActions.navigate({
          name: 'LeadChatScreen',
          params: {
            leadId,
            leadName,
            leadPhone,
            pendingPhoto: {
              uri: photoUri,
              width: photoWidth,
              height: photoHeight,
              caption: caption.trim() || undefined,
              viewOnce,
            },
          },
        })
      );
    } catch (error) {
      console.error('[PhotoPreviewScreen] Erro ao enviar:', error);
      setIsSending(false);
    }
  }, [isSending, navigation, leadId, leadName, leadPhone, photoUri, photoWidth, photoHeight, caption, viewOnce]);

  // ========================================
  // Render Principal
  // ========================================
  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Imagem de Preview */}
      <Animated.View style={[styles.imageContainer, { opacity: imageOpacity, transform: [{ scale: imageScale }] }]}>
        <Image key={photoUri} source={{ uri: photoUri }} style={styles.image} resizeMode="contain" />
      </Animated.View>

      {/* Header com Fechar e Editar */}
      <Animated.View style={[styles.headerAnimated, { opacity: headerOpacity, transform: [{ translateY: headerTranslateY }] }]}>
        <SafeAreaView style={styles.header}>
          <Pressable style={styles.headerButton} onPress={handleDiscard} hitSlop={12}>
            <CloseIcon />
          </Pressable>
          <View style={styles.headerSpacer} />
          <Pressable style={styles.headerButton} onPress={handleEdit} hitSlop={12}>
            <EditIcon />
          </Pressable>
        </SafeAreaView>
      </Animated.View>

      {/* Campo de Legenda + Enviar */}
      <Animated.View style={[styles.footer, { paddingBottom: insets.bottom, opacity: footerOpacity, transform: [{ translateY: footerTranslateY }] }]}>
        <CaptionInput
          value={caption}
          onChangeText={setCaption}
          onSend={handleSend}
          recipientName={leadName}
          viewOnce={viewOnce}
          onToggleViewOnce={handleToggleViewOnce}
          isSending={isSending}
          showCameraButton={false}
        />
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CameraColors.cameraBackground,
  },

  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  headerAnimated: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  headerButton: {
    width: 44,
    height: 44,
    borderRadius: CameraStyles.borderRadiusButton,
    backgroundColor: CameraColors.overlayLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerSpacer: {
    flex: 1,
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default PhotoPreviewScreen;
