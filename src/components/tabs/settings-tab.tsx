'use client';

import { useState } from 'react';
import {
  User,
  Shield,
  Globe,
  Bell,
  HelpCircle,
  FileText,
  ChevronRight,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

export function SettingsTab() {
  const [language, setLanguage] = useState('en');
  const [notifications, setNotifications] = useState(true);
  const [kycStatus, setKycStatus] = useState<'not_started' | 'pending' | 'completed' | 'declined'>('not_started');
  const { toast } = useToast();

  const handleStartKYC = () => {
    // В реальном приложении здесь будет интеграция с Sumsub
    setKycStatus('pending');
    toast({
      title: "KYC Verification Started",
      description: "You will be redirected to complete your verification",
    });
  };

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    toast({
      title: "Language Changed",
      description: `Language switched to ${newLang === 'en' ? 'English' : 'Русский'}`,
    });
  };

  const getKYCStatusIcon = () => {
    switch (kycStatus) {
      case 'completed':
        return <CheckCircle size={20} className="text-primary" />;
      case 'pending':
        return <Clock size={20} className="text-warning" />;
      case 'declined':
        return <XCircle size={20} className="text-destructive" />;
      default:
        return <AlertTriangle size={20} className="text-muted-foreground" />;
    }
  };

  const getKYCStatusText = () => {
    switch (kycStatus) {
      case 'completed':
        return 'Verified';
      case 'pending':
        return 'Under Review';
      case 'declined':
        return 'Declined';
      default:
        return 'Not Started';
    }
  };

  const getKYCStatusColor = () => {
    switch (kycStatus) {
      case 'completed':
        return 'text-primary border-primary/20 bg-primary/5';
      case 'pending':
        return 'text-warning border-warning/20 bg-warning/5';
      case 'declined':
        return 'text-destructive border-destructive/20 bg-destructive/5';
      default:
        return 'text-muted-foreground border-border bg-muted/5';
    }
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          icon: <User size={20} />,
          label: 'Profile Information',
          value: 'Manage your profile',
          action: () => toast({ title: "Coming Soon", description: "Profile management will be available soon" })
        },
        {
          icon: <Shield size={20} />,
          label: 'Security',
          value: 'Two-factor authentication',
          action: () => toast({ title: "Coming Soon", description: "2FA setup will be available soon" })
        }
      ]
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: <Globe size={20} />,
          label: 'Language',
          value: language === 'en' ? 'English' : 'Русский',
          action: () => handleLanguageChange(language === 'en' ? 'ru' : 'en')
        },
        {
          icon: <Bell size={20} />,
          label: 'Notifications',
          value: notifications ? 'Enabled' : 'Disabled',
          toggle: true,
          checked: notifications,
          onToggle: setNotifications
        }
      ]
    },
    {
      title: 'Support',
      items: [
        {
          icon: <HelpCircle size={20} />,
          label: 'Help Center',
          value: 'Get help and support',
          action: () => toast({ title: "Help Center", description: "Opening support chat..." })
        },
        {
          icon: <FileText size={20} />,
          label: 'Terms & Privacy',
          value: 'Legal documents',
          action: () => toast({ title: "Legal", description: "Opening legal documents..." })
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* User Profile Card */}
      <Card className="balance-card overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-30 -z-10"></div>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-5">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-xl shadow-primary/20 ring-4 ring-white/5 shine-effect">
              <User size={36} className="text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white">Test User</h3>
              <p className="text-sm text-primary/90 font-medium">@testuser</p>
              <p className="text-xs text-white/60 mt-1">ID: 123456789</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KYC Status */}
      <Card className="glass-card overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-white/95 flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
              <Shield size={16} className="text-primary" />
            </div>
            Verification Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-5 pt-2">
            <div className="flex items-center justify-between p-4 rounded-lg glass-card border border-white/5 hover:border-primary/20 transition-all duration-300 group">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-lg shadow-primary/5 group-hover:scale-110 transition-all duration-300">
                  {getKYCStatusIcon()}
                </div>
                <div>
                  <p className="font-bold text-white/90">KYC Verification</p>
                  <p className="text-sm text-white/60 group-hover:text-primary/70 transition-colors duration-300">
                    Identity verification required for withdrawals
                  </p>
                </div>
              </div>
              <Badge variant="outline" className={`${getKYCStatusColor()} px-3 py-1 group-hover:bg-white/5 transition-all duration-300`}>
                {getKYCStatusText()}
              </Badge>
            </div>

            {kycStatus === 'not_started' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-primary/5 to-transparent rounded-xl p-4 border border-primary/10">
                  <p className="text-sm text-white/80 font-medium mb-2">
                    Complete KYC verification to unlock:
                  </p>
                  <ul className="text-sm text-white/70 mt-2 space-y-2">
                    <li className="flex items-center">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                        <CheckCircle size={12} className="text-primary" />
                      </div>
                      Unlimited withdrawals
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                        <CheckCircle size={12} className="text-primary" />
                      </div>
                      Higher investment limits
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                        <CheckCircle size={12} className="text-primary" />
                      </div>
                      Enhanced security
                    </li>
                  </ul>
                </div>
                <Button onClick={handleStartKYC} className="w-full deposit-button h-12 rounded-xl">
                  Start Verification
                </Button>
              </div>
            )}

            {kycStatus === 'pending' && (
              <div className="bg-gradient-to-r from-warning/10 to-transparent rounded-xl p-4 border border-warning/20">
                <p className="text-sm text-warning font-medium flex items-center">
                  <Clock size={16} className="mr-2" />
                  Your verification is being reviewed. This usually takes 24-48 hours.
                </p>
              </div>
            )}

            {kycStatus === 'completed' && (
              <div className="bg-gradient-to-r from-primary/10 to-transparent rounded-xl p-4 border border-primary/20">
                <p className="text-sm text-primary font-medium flex items-center">
                  <CheckCircle size={16} className="mr-2" />
                  Your account is fully verified! You can now use all features.
                </p>
              </div>
            )}

            {kycStatus === 'declined' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-destructive/10 to-transparent rounded-xl p-4 border border-destructive/20">
                  <p className="text-sm text-destructive font-medium flex items-center">
                    <XCircle size={16} className="mr-2" />
                    Verification was declined. Please review your documents and try again.
                  </p>
                </div>
                <Button onClick={handleStartKYC} variant="outline" className="w-full h-12 rounded-xl border-white/10 hover:bg-white/5 hover:text-white transition-all duration-300">
                  Retry Verification
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Settings Sections */}
      {settingsSections.map((section, sectionIndex) => (
        <Card key={sectionIndex} className="glass-card overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-white/95 flex items-center">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                {section.title === 'Account' && <User size={14} className="text-primary" />}
                {section.title === 'Preferences' && <Settings size={14} className="text-primary" />}
                {section.title === 'Support' && <HelpCircle size={14} className="text-primary" />}
              </div>
              {section.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-3">
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex}>
                  <div
                    className="flex items-center justify-between p-4 rounded-lg glass-card border border-white/5 hover:border-primary/20 hover:bg-white/5 transition-all duration-300 cursor-pointer group"
                    onClick={item.action}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-all duration-300 text-primary">
                        {item.icon}
                      </div>
                      <div>
                        <p className="font-bold text-white/90 group-hover:text-white transition-colors duration-300">{item.label}</p>
                        <p className="text-sm text-white/60 group-hover:text-primary/80 transition-colors duration-300">{item.value}</p>
                      </div>
                    </div>

                    {item.toggle ? (
                      <Switch
                        checked={item.checked}
                        onCheckedChange={item.onToggle}
                        onClick={(e) => e.stopPropagation()}
                        className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                      />
                    ) : (
                      <ChevronRight size={18} className="text-primary/50 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* App Info */}
      <Card className="glass-card shine-effect overflow-hidden relative border border-white/10 group hover:border-primary/20 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-20 transition-all duration-300 -z-10"></div>
        <CardContent className="pt-8 pb-8">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto shadow-xl shadow-primary/20 ring-4 ring-white/5 group-hover:scale-110 transition-all duration-500">
              <span className="text-2xl font-bold text-primary-foreground">Q</span>
            </div>
            <h3 className="text-xl font-bold text-white quantum-glow tracking-wider">
              QUANTUM
            </h3>
            <p className="text-sm text-primary/80 font-medium">Version 1.0.0</p>
            <p className="text-xs text-white/60">© 2024 Quantum Investment</p>
          </div>
        </CardContent>
      </Card>


    </div>
  );
}
