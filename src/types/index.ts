// User Types
export interface User {
  id: number;
  telegram_id: number;
  phone?: string;
  language: 'ru' | 'en';
  agreed_to_terms_at?: string;
  kyc_status: 'not_started' | 'pending' | 'completed' | 'declined';
  ref_code: string;
  referred_by_id?: number;
  created_at: string;
  updated_at: string;
}

export interface UserBalance {
  user_id: number;
  currency: 'USDT';
  available: number;
  bonus: number;
  locked: number;
  updated_at: string;
}

// Tariff Plans
export interface TariffPlan {
  id: number;
  code: string;
  name_ru: string;
  name_en: string;
  min_amount: number;
  max_amount: number;
  term_days: number;
  daily_percent: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Investments
export interface Investment {
  id: number;
  user_id: number;
  tariff_id: number;
  amount: number;
  daily_percent: number;
  term_days: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  tariff?: TariffPlan;
}

// Deposits
export interface Deposit {
  id: number;
  user_id: number;
  currency: 'USDT';
  amount: number;
  status: 'pending' | 'confirmed' | 'failed' | 'expired';
  provider: string;
  provider_tx_id?: string;
  address?: string;
  network_code?: string;
  url?: string;
  confirmed_at?: string;
  created_at: string;
  updated_at: string;
}

// Withdrawals
export interface Withdrawal {
  id: number;
  user_id: number;
  currency: 'USDT';
  amount: number;
  address: string;
  fee: number;
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected' | 'failed';
  network_code: string;
  provider?: string;
  provider_tx_id?: string;
  requested_at: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

// Referral Types
export interface ReferralReward {
  id: number;
  from_user_id: number;
  to_user_id: number;
  level: 1 | 2 | 3;
  percent: number;
  amount: number;
  created_at: string;
}

export interface ReferralStats {
  total_referrals: number;
  level1_count: number;
  level2_count: number;
  level3_count: number;
  total_earned: number;
  commission_rate: number;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Telegram WebApp Types
export interface TelegramWebApp {
  ready: () => void;
  close: () => void;
  expand: () => void;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  BackButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
    start_param?: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color: string;
    text_color: string;
    hint_color: string;
    link_color: string;
    button_color: string;
    button_text_color: string;
  };
}

// Dashboard Data
export interface DashboardData {
  user: User;
  balance: UserBalance;
  activeInvestments: Investment[];
  totalProfit: number;
  dailyProfit: number;
  referralStats: ReferralStats;
}

// Form Types
export interface DepositForm {
  amount: number;
  currency: 'USDT';
  network: string;
}

export interface WithdrawForm {
  amount: number;
  address: string;
  network: string;
}

export interface InvestmentForm {
  tariff_id: number;
  amount: number;
}

// Navigation Types
export interface NavItem {
  key: string;
  label: string;
  icon: string;
  href: string;
}
