export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Enterprise: undefined;
  Keymans: undefined;
  CustomersHome: undefined;
  Schedule: undefined;
  DailyCommitmentHome: undefined;
  CardSandbox: undefined; // TEMPORARIO - Apagar depois dos testes
  SalesHome: { autoOpenDiscount?: boolean } | undefined;
  PaymentFlowHome: { appointmentId?: string } | undefined;
  PaymentFlowPix: undefined;
  PaymentFlowCreditCard: undefined;
  PaymentFlowBankSlip: undefined;
  PaymentFlowTed: undefined;
  CommissionsHome: undefined;
  DiscountSales: undefined;
  DiscountManage: undefined;
  DiscountCustomer: undefined;
  DiscountChat: undefined;
  ProductList: undefined;
  SchedulingDetailsMain: {
    appointment: {
      id: string;
      date: string;
      slots?: { start: string; end: string }[];
      client?: string | null;
      product?: string | null;
      activity?: string | null;
      agendaType?: 'personal' | 'shared' | null;
      flowType?: 'guided' | 'free' | null;
      professional?: string | null;
      clientPhotoKey?: string | null;
      clientPhotoUri?: string | null;
    };
  };
  SchedulingDetailsMain02: {
    appointment: {
      id: string;
      date: string;
      slots?: { start: string; end: string }[];
      client?: string | null;
      product?: string | null;
      activity?: string | null;
      agendaType?: 'personal' | 'shared' | null;
      flowType?: 'guided' | 'free' | null;
      professional?: string | null;
      clientPhotoKey?: string | null;
      clientPhotoUri?: string | null;
    };
  };
  PresentationScreen: {
    product: {
      id: string;
      title: string;
      commission: string;
      averageTicket: string;
      averageClosingTime: string;
      image?: any;
    };
  };
  TrainingScreen: {
    product: {
      id: string;
      title: string;
      commission: string;
      averageTicket: string;
      averageClosingTime: string;
      image?: any;
    };
  };
  VideoPlayerScreen: {
    videoTitle?: string;
    videoDescription?: string;
    initialVideoId?: number;
  };
  CompanySelection: undefined;
  PersonalInfo: undefined;
  WhatsAppValidation: undefined;
  Email: undefined;
  EmailValidation: undefined;
  ChangePasswordEmailValidation: undefined;
  ChangePasswordWhatsAppValidation: undefined;
  ChangePasswordSecurity: undefined;
  Location: undefined;
  Security: undefined;
  Success: undefined;
  VerificationMethod: undefined;
  TrainingHome: undefined;
  TrainingDetail: { trainingId: string };
  ProductDetail: { productId: string };
  TrainingPlayer: { trainingId: string; lessonIndex?: number };
  CommercialHome: undefined;
  LeadChatScreen: {
    leadId: string;
    leadName: string;
    leadPhone: string;
    leadPhoto?: string;
    pendingPhoto?: {
      uri: string;
      width: number;
      height: number;
      caption?: string;
      viewOnce?: boolean;
    };
    pendingVideo?: {
      uri: string;
      duration: number;
      caption?: string;
    };
    pendingVideoNote?: {
      uri: string;
      duration: number;
    };
  };
  CameraScreen: {
    leadId: string;
    leadName: string;
    leadPhone: string;
    leadPhoto?: string;
  };
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
  VideoPreviewScreen: {
    videoUri: string;
    duration: number;
    leadName: string;
    leadId: string;
    leadPhone: string;
  };
  VideoTrimScreen: {
    videoUri: string;
    duration: number;
    leadName: string;
    leadId: string;
    leadPhone: string;
  };
  VideoNoteRecordScreen: {
    leadId: string;
    leadName: string;
    leadPhone: string;
  };
  VideoNotePreviewScreen: {
    videoUri: string;
    duration: number;
    leadName: string;
    leadId: string;
    leadPhone: string;
  };
  GallerySelectScreen: {
    leadId: string;
    leadName: string;
    leadPhone: string;
    mediaType?: 'photo' | 'video' | 'all';
  };
  MultiPreviewScreen: {
    assets: {
      id: string;
      uri: string;
      width: number;
      height: number;
      mediaType: 'photo' | 'video';
      duration?: number;
    }[];
    leadId: string;
    leadName: string;
    leadPhone: string;
  };
};

export const ScreenNames = {
  Splash: 'Splash' as const,
  Login: 'Login' as const,
  Enterprise: 'Enterprise' as const,
  Keymans: 'Keymans' as const,
  CustomersHome: 'CustomersHome' as const,
  Schedule: 'Schedule' as const,
  DailyCommitmentHome: 'DailyCommitmentHome' as const,
  CardSandbox: 'CardSandbox' as const, // TEMPORARIO - Apagar depois dos testes
  SalesHome: 'SalesHome' as const,
  PaymentFlowHome: 'PaymentFlowHome' as const,
  PaymentFlowPix: 'PaymentFlowPix' as const,
  PaymentFlowCreditCard: 'PaymentFlowCreditCard' as const,
  PaymentFlowBankSlip: 'PaymentFlowBankSlip' as const,
  PaymentFlowTed: 'PaymentFlowTed' as const,
  CommissionsHome: 'CommissionsHome' as const,
  DiscountSales: 'DiscountSales' as const,
  DiscountManage: 'DiscountManage' as const,
  DiscountCustomer: 'DiscountCustomer' as const,
  DiscountChat: 'DiscountChat' as const,
  ProductList: 'ProductList' as const,
  SchedulingDetailsMain: 'SchedulingDetailsMain' as const,
  SchedulingDetailsMain02: 'SchedulingDetailsMain02' as const,
  PresentationScreen: 'PresentationScreen' as const,
  TrainingScreen: 'TrainingScreen' as const,
  VideoPlayerScreen: 'VideoPlayerScreen' as const,
  CompanySelection: 'CompanySelection' as const,
  PersonalInfo: 'PersonalInfo' as const,
  WhatsAppValidation: 'WhatsAppValidation' as const,
  Email: 'Email' as const,
  EmailValidation: 'EmailValidation' as const,
  ChangePasswordEmailValidation: 'ChangePasswordEmailValidation' as const,
  ChangePasswordWhatsAppValidation: 'ChangePasswordWhatsAppValidation' as const,
  ChangePasswordSecurity: 'ChangePasswordSecurity' as const,
  Location: 'Location' as const,
  Security: 'Security' as const,
  Success: 'Success' as const,
  VerificationMethod: 'VerificationMethod' as const,
  TrainingHome: 'TrainingHome' as const,
  TrainingDetail: 'TrainingDetail' as const,
  ProductDetail: 'ProductDetail' as const,
  TrainingPlayer: 'TrainingPlayer' as const,
  CommercialHome: 'CommercialHome' as const,
  LeadChatScreen: 'LeadChatScreen' as const,
  CameraScreen: 'CameraScreen' as const,
  PhotoPreviewScreen: 'PhotoPreviewScreen' as const,
  PhotoEditScreen: 'PhotoEditScreen' as const,
  VideoPreviewScreen: 'VideoPreviewScreen' as const,
  VideoTrimScreen: 'VideoTrimScreen' as const,
  VideoNoteRecordScreen: 'VideoNoteRecordScreen' as const,
  VideoNotePreviewScreen: 'VideoNotePreviewScreen' as const,
  GallerySelectScreen: 'GallerySelectScreen' as const,
  MultiPreviewScreen: 'MultiPreviewScreen' as const,
} as const;

export type ScreenNamesType = keyof RootStackParamList;
