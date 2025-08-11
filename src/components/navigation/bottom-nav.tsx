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
    <div className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-xl border-t border-border/50 safe-area-padding-bottom">
      {/* Active indicator line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item, index) => {
          const isActive = activeTab === item.key;

          return (
            <button
              key={item.key}
              onClick={() => onTabChange(item.key)}
              className={cn(
                "relative flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all duration-300 min-w-0 flex-1 group",
                isActive
                  ? "bg-primary/15 text-primary shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              )}
              style={{
                animationDelay: `${index * 50}ms`
              }}
            >
              {/* Background glow effect for active tab */}
              {isActive && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 animate-pulse" />
              )}

              <div className={cn(
                "relative transition-all duration-300 mb-1",
                isActive
                  ? "scale-110 text-primary drop-shadow-sm"
                  : "group-hover:scale-105"
              )}>
                {item.icon}

                {/* Badge for notifications */}
                {item.badge && (
                  <div className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                    {item.badge}
                  </div>
                )}
              </div>

              <span className={cn(
                "text-xs font-medium transition-all duration-300 relative",
                isActive
                  ? "text-primary font-semibold"
                  : "text-muted-foreground group-hover:text-foreground"
              )}>
                {item.label}

                {/* Active indicator dot */}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full animate-pulse" />
                )}
              </span>

              {/* Ripple effect on tap */}
              <div className="absolute inset-0 rounded-xl overflow-hidden">
                <div className={cn(
                  "absolute inset-0 bg-primary/20 rounded-xl scale-0 group-active:scale-100 transition-transform duration-200 ease-out"
                )} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom safe area for devices with notch */}
      <div className="h-safe-area-inset-bottom bg-card/50" />
    </div>
  );
}
