// ========================================
// Utilitarios de Feedback Haptico da Camera
// Vibracoes e toques tateis
// ========================================

// ========================================
// Imports
// ========================================
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// ========================================
// Verificar Suporte a Haptics
// ========================================
const isHapticsSupported = Platform.OS === 'ios' || Platform.OS === 'android';

// ========================================
// Haptic Light - Toque leve
// Usado para: tap em botoes, selecao
// ========================================
export const hapticLight = async (): Promise<void> => {
  if (!isHapticsSupported) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (error) {
    console.log('[Haptics] Light feedback error:', error);
  }
};

// ========================================
// Haptic Medium - Toque medio
// Usado para: flip camera, toggle flash
// ========================================
export const hapticMedium = async (): Promise<void> => {
  if (!isHapticsSupported) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch (error) {
    console.log('[Haptics] Medium feedback error:', error);
  }
};

// ========================================
// Haptic Heavy - Toque forte
// Usado para: captura de foto
// ========================================
export const hapticHeavy = async (): Promise<void> => {
  if (!isHapticsSupported) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch (error) {
    console.log('[Haptics] Heavy feedback error:', error);
  }
};

// ========================================
// Haptic Success - Notificacao de sucesso
// Usado para: foto capturada, video salvo
// ========================================
export const hapticSuccess = async (): Promise<void> => {
  if (!isHapticsSupported) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (error) {
    console.log('[Haptics] Success feedback error:', error);
  }
};

// ========================================
// Haptic Warning - Notificacao de aviso
// Usado para: limite de tempo, confirmacoes
// ========================================
export const hapticWarning = async (): Promise<void> => {
  if (!isHapticsSupported) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch (error) {
    console.log('[Haptics] Warning feedback error:', error);
  }
};

// ========================================
// Haptic Error - Notificacao de erro
// Usado para: erros, acoes bloqueadas
// ========================================
export const hapticError = async (): Promise<void> => {
  if (!isHapticsSupported) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch (error) {
    console.log('[Haptics] Error feedback error:', error);
  }
};

// ========================================
// Haptic Selection - Selecao
// Usado para: mudanca de selecao, picker
// ========================================
export const hapticSelection = async (): Promise<void> => {
  if (!isHapticsSupported) return;
  try {
    await Haptics.selectionAsync();
  } catch (error) {
    console.log('[Haptics] Selection feedback error:', error);
  }
};

// ========================================
// Haptic Recording Start - Inicio de gravacao
// Sequencia de vibracao para indicar gravacao
// ========================================
export const hapticRecordingStart = async (): Promise<void> => {
  if (!isHapticsSupported) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 100);
  } catch (error) {
    console.log('[Haptics] Recording start feedback error:', error);
  }
};

// ========================================
// Haptic Recording Stop - Fim de gravacao
// Vibracao de confirmacao
// ========================================
export const hapticRecordingStop = async (): Promise<void> => {
  if (!isHapticsSupported) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch (error) {
    console.log('[Haptics] Recording stop feedback error:', error);
  }
};

// ========================================
// Haptic Capture - Captura de foto
// Vibracao caracteristica de shutter
// ========================================
export const hapticCapture = async (): Promise<void> => {
  if (!isHapticsSupported) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 50);
  } catch (error) {
    console.log('[Haptics] Capture feedback error:', error);
  }
};

// ========================================
// Export Default
// ========================================
export default {
  hapticLight,
  hapticMedium,
  hapticHeavy,
  hapticSuccess,
  hapticWarning,
  hapticError,
  hapticSelection,
  hapticRecordingStart,
  hapticRecordingStop,
  hapticCapture,
};
