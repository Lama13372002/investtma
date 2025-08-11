'use client';

import { useState, useEffect } from 'react';
import { useTelegram } from '@/components/providers/telegram-provider';
import { BottomNav } from '@/components/navigation/bottom-nav';
import { DashboardTab } from '@/components/tabs/dashboard-tab';
import { InvestmentsTab } from '@/components/tabs/investments-tab';
import { WalletTab } from '@/components/tabs/wallet-tab';
import { ReferralTab } from '@/components/tabs/referral-tab';
import { SettingsTab } from '@/components/tabs/settings-tab';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Header } from '@/components/layout/header';


export default function Home() {
  const { isReady, user, startParam } = useTelegram();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isReady) {
      // Simulate loading data
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isReady]);

  if (!isReady || isLoading) {
    return <LoadingScreen />;
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'investments':
        return <InvestmentsTab />;
      case 'wallet':
        return <WalletTab />;
      case 'referral':
        return <ReferralTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header user={user} />

      <main className="flex-1 overflow-auto pb-20">
        <div className="container mx-auto px-4 py-4 max-w-md">
          {renderActiveTab()}
        </div>
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
