import React, { createRef } from 'react';
import { NavigationContainer, getStateFromPath as navigationGetStateFromPath, NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SplashScreen } from '../screens/0.SplashScreen/SplashScreen';
import { LoginScreen } from '../screens/1.Login/1. LoginScreen';
import { EnterpriseScreen } from '../screens/1.Login/2. EnterpriseScreen';
import ProductListScreen from '../screens/4.Products/1.ProductListScreen';
import PresentationScreen from '../screens/4.Products/3.PresentationScreen';
import TrainingScreen from '../screens/4.Products/4.TrainingScreen';
import VideoPlayerScreen from '../screens/4.Products/5.VideoPlayerScreen';
import { PersonalInfoScreen } from '../screens/2.Register/1. PersonalInfoScreen';
import { WhatsAppValidationScreen } from '../screens/2.Register/2. WhatsAppValidationScreen';
import { EmailValidationScreen } from '../screens/2.Register/4. EmailValidationScreen';
import EmailScreen from '../screens/2.Register/3. EmailScreen';
import { RootStackParamList, ScreenNames } from '../types/navigation';
import { LocationScreen } from '../screens/2.Register/5. LocationScreen';
import { SecurityScreen } from '../screens/2.Register/6. SecurityScreen';
import SuccessScreen from '../screens/2.Register/7. SuccessScreen';
import { VerificationMethodScreen } from '../screens/3.Change Password/1. VerificationMethodScreens';
import { EmailValidationScreen as ChangePasswordEmailValidationScreen } from '../screens/3.Change Password/2. EmailValidationScreen';
import { WhatsAppValidationScreen as ChangePasswordWhatsAppValidationScreen } from '../screens/3.Change Password/3. WhatsAppValidationScreen';
import { SecurityScreen as ChangePasswordSecurityScreen } from '../screens/3.Change Password/4. SecurityScreen';
import KeymansScreen from '../screens/7.Keymans/01.01.KeymansHomeScreen';
import CustomersHomeScreen from '../screens/8.Customers/1.CustomersHomeScreen';
import CalendarHomeScreen from '../screens/9.Agenda/1.CalendarHomeScreen';
import SalesHomeScreen from '../screens/10.Vendas/01.01.SalesHomeScreen';
import CommissionsHomeScreen from '../screens/11.Comissões/01.CommissionsHomeScreen';
import HomeScreenPaymentFlow from '../screens/12.FluxoDePagamento/1.HomeScreen-PaymentFlow';
import DailyCommitmentHomeScreen from '../screens/13.Commitments/01.DailyCommitment-HomeScreen';
import CardSandbox from '../screens/13.Commitments/99.CardSandbox'; // TEMPORARIO - Apagar depois dos testes
import TrainingHomeScreen from '../screens/14.Training/01.Training-HomeScreen';
import TrainingDetailScreen from '../screens/14.Training/05.Training-DetailScreen';
import ProductDetailScreen from '../screens/14.Training/06.Training-ProductDetailScreen';
import TrainingPlayerScreen from '../screens/14.Training/07.Training-PlayerScreen';
import CommercialScreen from '../screens/15.Commercial/00.CommercialScreen';
import WalletHomeScreen from '../screens/16.CarteiraDigital/01.WalletHomeScreen';
import WithdrawScreen from '../screens/16.CarteiraDigital/09.WithdrawScreen01';
import AnticipateScreen from '../screens/16.CarteiraDigital/20.AnticipateScreen01';
import ReconciliationScreen from '../screens/16.CarteiraDigital/27.ReconciliationScreen01';

import LeadLolaSwipeContainer from '../screens/15.Commercial/components/Chat/10.00.LeadLolaSwipeContainer';
import CameraScreen from '../screens/15.Commercial/components/Chat/camera/CameraScreen';
import PhotoPreviewScreen from '../screens/15.Commercial/components/Chat/camera/PhotoPreviewScreen';
import PhotoEditScreen from '../screens/15.Commercial/components/Chat/camera/PhotoEditScreen';
import VideoPreviewScreen from '../screens/15.Commercial/components/Chat/camera/VideoPreviewScreen';
import VideoTrimScreen from '../screens/15.Commercial/components/Chat/camera/VideoTrimScreen';
import VideoNoteRecordScreen from '../screens/15.Commercial/components/Chat/camera/VideoNoteRecordScreen';
import VideoNotePreviewScreen from '../screens/15.Commercial/components/Chat/camera/VideoNotePreviewScreen';
import GallerySelectScreen from '../screens/15.Commercial/components/Chat/camera/GallerySelectScreen';
import MultiPreviewScreen from '../screens/15.Commercial/components/Chat/camera/MultiPreviewScreen';
import { cameraTransitionOptions, previewTransitionOptions, fadeTransitionOptions } from '../screens/15.Commercial/components/Chat/camera/utils/cameraAnimations';

// ========================================
// REFERENCIA DE NAVEGACAO GLOBAL
// ========================================

// Referencia de navegacao para uso fora do NavigationContainer
export const navigationRef = createRef<NavigationContainerRef<RootStackParamList>>();

// Funcao para navegar de fora do NavigationContainer
export function navigate<RouteName extends keyof RootStackParamList>(
  name: RouteName,
  params?: RootStackParamList[RouteName]
) {
  if (navigationRef.current) {
    navigationRef.current.navigate(name, params as any);
  }
}

// ========================================
// STACK NAVIGATOR
// ========================================

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer
      ref={navigationRef}
	  documentTitle={{
        formatter: (options, route) => 
          `Partners - ${options?.title ?? route?.name ?? 'Partners'}`,
      }}	  
      linking={{
        prefixes: [
          'https://partners.app',
          'http://localhost',
          'http://localhost:8081',
          'http://localhost:19006',
          'http://localhost:19000',
          'http://localhost:22222',
        ],
        config: {
          screens: {
            [ScreenNames.PaymentFlowHome]: 'pagamento/:appointmentId?',
            [ScreenNames.CardSandbox]: 'sandbox', // TEMPORARIO - Apagar depois
          },
        },
        getStateFromPath: (path, options) => {
          const normalized = String(path).replace(/^\/?reuniao(\/|$)/, 'pagamento$1');
          return navigationGetStateFromPath(normalized, options);
        },
      }}
      onStateChange={(state) => { try { console.log('[Nav] state changed', state); } catch {} }}
    >
      <Stack.Navigator
        initialRouteName={ScreenNames.Splash}
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
        }}
      >
        <Stack.Screen
          name={ScreenNames.Splash}
          options={{}}
        >
          {() => <SplashScreen />}
        </Stack.Screen>
        <Stack.Screen
          name={ScreenNames.Login}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => <LoginScreen />}
        </Stack.Screen>

        <Stack.Screen
          name={ScreenNames.Enterprise}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => <EnterpriseScreen />}
        </Stack.Screen>

        <Stack.Screen
          name={ScreenNames.ProductList}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => <ProductListScreen />}
        </Stack.Screen>

        <Stack.Screen
          name={ScreenNames.PresentationScreen}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => <PresentationScreen />}
        </Stack.Screen>

        <Stack.Screen
          name={ScreenNames.TrainingScreen}
          component={TrainingScreen}
          options={{
            animationTypeForReplace: 'push',
          }}
        />

        <Stack.Screen
          name={ScreenNames.VideoPlayerScreen}
          component={VideoPlayerScreen}
          options={{
            animationTypeForReplace: 'push',
          }}
        />

        <Stack.Screen
          name={ScreenNames.PersonalInfo}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => <PersonalInfoScreen />}
        </Stack.Screen>

        <Stack.Screen
          name={ScreenNames.WhatsAppValidation}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => <WhatsAppValidationScreen />}
        </Stack.Screen>
        <Stack.Screen
          name={ScreenNames.Email}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => <EmailScreen />}
        </Stack.Screen>
        <Stack.Screen
          name={ScreenNames.EmailValidation}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => <EmailValidationScreen />}
        </Stack.Screen>
        {/* Rota específica para validação de email no fluxo de troca de senha */}
        <Stack.Screen
          name={ScreenNames.ChangePasswordEmailValidation}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => <ChangePasswordEmailValidationScreen />}
        </Stack.Screen>
        {/* Rota específica para validação de WhatsApp no fluxo de troca de senha */}
        <Stack.Screen
          name={ScreenNames.ChangePasswordWhatsAppValidation}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => <ChangePasswordWhatsAppValidationScreen />}
        </Stack.Screen>
        {/* Rota específica para Segurança no fluxo de troca de senha */}
        <Stack.Screen
          name={ScreenNames.ChangePasswordSecurity}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => <ChangePasswordSecurityScreen />}
        </Stack.Screen>
        <Stack.Screen
          name={ScreenNames.Location}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => <LocationScreen />}
        </Stack.Screen>
        {/* Rota de Segurança adicionada */}
        <Stack.Screen
          name={ScreenNames.Security}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => <SecurityScreen />}
        </Stack.Screen>
        {/* Rota de Sucesso adicionada */}
        <Stack.Screen
          name={ScreenNames.Success}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => <SuccessScreen />}
        </Stack.Screen>
        {/* Rota Keymans */}
        <Stack.Screen
          name={ScreenNames.Keymans}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => <KeymansScreen />}
        </Stack.Screen>
        <Stack.Screen
          name={ScreenNames.CustomersHome}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => <CustomersHomeScreen />}
        </Stack.Screen>
        {/* Rota Agenda (Calendar) */}
        <Stack.Screen
          name={ScreenNames.Schedule}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => <CalendarHomeScreen />}
        </Stack.Screen>
        {/* Rota Vendas */}
        <Stack.Screen
          name={ScreenNames.SalesHome}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => <SalesHomeScreen />}
        </Stack.Screen>
        <Stack.Screen
          name={ScreenNames.PaymentFlowHome}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => <HomeScreenPaymentFlow />}
        </Stack.Screen>
        <Stack.Screen
          name={ScreenNames.PaymentFlowPix}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => {
            const Comp = require('../screens/12.FluxoDePagamento/2.PaymentFlow-Pix').default;
            return <Comp />;
          }}
        </Stack.Screen>
        <Stack.Screen
          name={ScreenNames.PaymentFlowCreditCard}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => {
            const Comp = require('../screens/12.FluxoDePagamento/2.PaymentFlow-CreditCard').default;
            return <Comp />;
          }}
        </Stack.Screen>
        <Stack.Screen
          name={ScreenNames.PaymentFlowBankSlip}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => {
            const Comp = require('../screens/12.FluxoDePagamento/2.PaymentFlow-BankSlip').default;
            return <Comp />;
          }}
        </Stack.Screen>
        <Stack.Screen
          name={ScreenNames.PaymentFlowTed}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => {
            const Comp = require('../screens/12.FluxoDePagamento/2.PaymentFlow-Ted').default;
            return <Comp />;
          }}
        </Stack.Screen>
        <Stack.Screen
          name={ScreenNames.CommissionsHome}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => <CommissionsHomeScreen />}
        </Stack.Screen>
        {/* Rota Compromissos */}
        <Stack.Screen
          name={ScreenNames.DailyCommitmentHome}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => <DailyCommitmentHomeScreen />}
        </Stack.Screen>
        {/* TEMPORARIO - Sandbox para testes visuais de cards - Apagar depois */}
        <Stack.Screen
          name={ScreenNames.CardSandbox}
          component={CardSandbox}
          options={{
            animationTypeForReplace: 'push',
          }}
        />
        {/* Rota Desconto Vendas */}
        <Stack.Screen
          name={ScreenNames.DiscountSales}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => {
            const Comp = require('../screens/10.Vendas/03.02.Discount-Sales').default;
            return <Comp />;
          }}
        </Stack.Screen>
        {/* Rota Cliente (Visualização de Cliente) */}
        <Stack.Screen
          name={ScreenNames.DiscountCustomer}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => {
            const Comp = require('../screens/10.Vendas/03.01.Discount-Customer').default;
            return <Comp />;
          }}
        </Stack.Screen>
        {/* Rota Chat de Descontos */}
        <Stack.Screen
          name={ScreenNames.DiscountChat}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => {
            const Comp = require('../screens/10.Vendas/03.04.Discount-Chat').default;
            return <Comp />;
          }}
        </Stack.Screen>
        {/* Rota Gerenciar Descontos */}
        <Stack.Screen
          name={ScreenNames.DiscountManage}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => {
            const Comp = require('../screens/10.Vendas/03.03.Discount-Manage').default;
            return <Comp />;
          }}
        </Stack.Screen>
        <Stack.Screen
          name={ScreenNames.SchedulingDetailsMain}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => {
            const Comp = require('../screens/9.Agenda/19.SchedulingDetails-Main').default;
            return <Comp />;
          }}
        </Stack.Screen>
        <Stack.Screen
          name={ScreenNames.SchedulingDetailsMain02}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => {
            const Comp = require('../screens/10.Vendas/01.02.InformationGroup-Main').default;
            return <Comp />;
          }}
        </Stack.Screen>
        {/* Rota de Verificação de Método para Troca de Senha */}
        <Stack.Screen
          name={ScreenNames.VerificationMethod}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => <VerificationMethodScreen />}
        </Stack.Screen>
        {/* Rota Treinamentos */}
        <Stack.Screen
          name={ScreenNames.TrainingHome}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => <TrainingHomeScreen />}
        </Stack.Screen>
        {/* Rota Detalhes do Treinamento */}
        <Stack.Screen
          name={ScreenNames.TrainingDetail}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => <TrainingDetailScreen />}
        </Stack.Screen>
        {/* Rota Detalhes do Produto */}
        <Stack.Screen
          name={ScreenNames.ProductDetail}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => <ProductDetailScreen />}
        </Stack.Screen>
        {/* Rota Player de Treinamento */}
        <Stack.Screen
          name={ScreenNames.TrainingPlayer}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => <TrainingPlayerScreen />}
        </Stack.Screen>
        <Stack.Screen
          name={ScreenNames.CommercialHome}
          options={{
            headerShown: false,
            animationTypeForReplace: 'push',
          }}
        >
          {() => <CommercialScreen />}
        </Stack.Screen>
        {/* Rota Carteira Digital */}
        <Stack.Screen
          name={ScreenNames.WalletHome}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => <WalletHomeScreen />}
        </Stack.Screen>
        {/* Rota Resgate de Saldo */}
        <Stack.Screen
          name={ScreenNames.WalletWithdraw}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => <WithdrawScreen />}
        </Stack.Screen>
        {/* Rota Antecipacao de Recebiveis */}
        <Stack.Screen
          name={ScreenNames.WalletAnticipate}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => <AnticipateScreen />}
        </Stack.Screen>
        {/* Rota Conciliacao da Carteira */}
        <Stack.Screen
          name={ScreenNames.WalletReconciliation}
          options={{
            animationTypeForReplace: 'push',
          }}
        >
          {() => <ReconciliationScreen />}
        </Stack.Screen>
        {/* Rota Chat com Lead + Lola (Swipe) */}
        <Stack.Screen
          name={ScreenNames.LeadChatScreen}
          options={{
            headerShown: false,
            animationTypeForReplace: 'push',
          }}
        >
          {() => <LeadLolaSwipeContainer />}
        </Stack.Screen>
        {/* Rota Camera */}
        <Stack.Screen
          name={ScreenNames.CameraScreen}
          component={CameraScreen}
          options={{
            headerShown: false,
            ...cameraTransitionOptions,
          }}
        />
        {/* Rota Preview da Foto */}
        <Stack.Screen
          name={ScreenNames.PhotoPreviewScreen}
          component={PhotoPreviewScreen}
          options={{
            headerShown: false,
            ...previewTransitionOptions,
          }}
        />
        {/* Rota Edicao da Foto */}
        <Stack.Screen
          name={ScreenNames.PhotoEditScreen}
          component={PhotoEditScreen}
          options={{
            headerShown: false,
            ...fadeTransitionOptions,
          }}
        />
        {/* Rota Preview do Video */}
        <Stack.Screen
          name={ScreenNames.VideoPreviewScreen}
          component={VideoPreviewScreen}
          options={{
            headerShown: false,
            ...previewTransitionOptions,
          }}
        />
        {/* Rota Trim do Video */}
        <Stack.Screen
          name={ScreenNames.VideoTrimScreen}
          component={VideoTrimScreen}
          options={{
            headerShown: false,
            ...fadeTransitionOptions,
          }}
        />
        {/* Rota Gravacao de Video Note */}
        <Stack.Screen
          name={ScreenNames.VideoNoteRecordScreen}
          component={VideoNoteRecordScreen}
          options={{
            headerShown: false,
            ...cameraTransitionOptions,
          }}
        />
        {/* Rota Preview de Video Note */}
        <Stack.Screen
          name={ScreenNames.VideoNotePreviewScreen}
          component={VideoNotePreviewScreen}
          options={{
            headerShown: false,
            ...previewTransitionOptions,
          }}
        />
        {/* Rota Selecao de Galeria */}
        <Stack.Screen
          name={ScreenNames.GallerySelectScreen}
          component={GallerySelectScreen}
          options={{
            headerShown: false,
            ...cameraTransitionOptions,
          }}
        />
        {/* Rota Preview Multiplo */}
        <Stack.Screen
          name={ScreenNames.MultiPreviewScreen}
          component={MultiPreviewScreen}
          options={{
            headerShown: false,
            ...previewTransitionOptions,
          }}
        />
        <Stack.Screen
          name={ScreenNames.CompanySelection}
          component={() => null} // Placeholder para próxima tela
          options={{}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
