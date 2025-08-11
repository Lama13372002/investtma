'use client';

import { useState } from 'react';
import {
  Home,
  TrendingUp,
  Wallet,
  Users,
  Settings,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const navItems: NavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: <Home size={20} />,
  },
  {
    key: 'investments',
    label: 'Invest',
    icon: <TrendingUp size={20} />,
  },
  {
    key: 'wallet',
    label: 'Wallet',
    icon: <Wallet size={20} />,
  },
  {
    key: 'referral',
    label: 'Referral',
    icon: <Users size={20} />,
    badge: 3, // Show new referrals count
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: <Settings size={20} />,
  },
];

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-card via-card/95 to-card/90 backdrop-blur-xl border-t border-white/5 shadow-lg shadow-black/30 safe-area-padding-bottom z-50">
      {/* Active indicator line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />

      <div className="flex items-center justify-around px-3 py-4">
        {navItems.map((item, index) => {
          const isActive = activeTab === item.key;

          return (
            <button
              key={item.key}
              onClick={() => onTabChange(item.key)}
              className={cn(
                "relative flex flex-col items-center justify-center px-3 py-2.5 rounded-2xl transition-all duration-300 min-w-0 flex-1 group",
                isActive
                  ? "bg-gradient-to-b from-primary/20 to-primary/5 text-primary shadow-lg shadow-primary/10"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              )}
              style={{
                animationDelay: `${index * 50}ms`
              }}
            >
              {/* Background glow effect for active tab */}
              {isActive && (
                <div className="absolute inset-0 rounded-2xl shine-effect" />
              )}

              <div className={cn(
                "relative transition-all duration-300 mb-1.5",
                isActive
                  ? "scale-110 text-primary quantum-glow"
                  : "group-hover:scale-105 group-hover:text-primary/80"
              )}>
                {item.icon}

                {/* Badge for notifications */}
                {item.badge && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-br from-destructive to-destructive/80 text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-lg shadow-destructive/20 animate-pulse">
                    {item.badge}
                  </div>
                )}
              </div>

              <span className={cn(
                "text-xs font-medium transition-all duration-300 relative",
                isActive
                  ? "text-primary font-semibold quantum-glow"
                  : "text-muted-foreground group-hover:text-primary/80"
              )}>
                {item.label}

                {/* Active indicator dot */}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full animate-pulse" />
                )}
              </span>

              {/* Ripple effect on tap */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden">
                <div className={cn(
                  "absolute inset-0 bg-primary/20 rounded-2xl scale-0 group-active:scale-100 transition-transform duration-200 ease-out"
                )} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom safe area for devices with notch */}
      <div className="h-safe-area-inset-bottom bg-card/80" />
    </div>
  );
}
