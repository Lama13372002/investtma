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
  AlertTriangle
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
      <Card className="balance-card">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <User size={32} className="text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">Test User</h3>
              <p className="text-sm text-muted-foreground">@testuser</p>
              <p className="text-xs text-muted-foreground">ID: 123456789</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KYC Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="text-primary" size={20} />
            <span>Verification Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getKYCStatusIcon()}
                <div>
                  <p className="font-medium">KYC Verification</p>
                  <p className="text-sm text-muted-foreground">
                    Identity verification required for withdrawals
                  </p>
                </div>
              </div>
              <Badge variant="outline" className={getKYCStatusColor()}>
                {getKYCStatusText()}
              </Badge>
            </div>

            {kycStatus === 'not_started' && (
              <div className="space-y-3">
                <div className="bg-muted/20 rounded-lg p-3">
                  <p className="text-sm text-muted-foreground">
                    Complete KYC verification to unlock:
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• Unlimited withdrawals</li>
                    <li>• Higher investment limits</li>
                    <li>• Enhanced security</li>
                  </ul>
                </div>
                <Button onClick={handleStartKYC} className="w-full deposit-button">
                  Start Verification
                </Button>
              </div>
            )}

            {kycStatus === 'pending' && (
              <div className="bg-warning/5 border border-warning/20 rounded-lg p-3">
                <p className="text-sm text-warning">
                  Your verification is being reviewed. This usually takes 24-48 hours.
                </p>
              </div>
            )}

            {kycStatus === 'completed' && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <p className="text-sm text-primary">
                  ✓ Your account is fully verified! You can now use all features.
                </p>
              </div>
            )}

            {kycStatus === 'declined' && (
              <div className="space-y-3">
                <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
                  <p className="text-sm text-destructive">
                    Verification was declined. Please review your documents and try again.
                  </p>
                </div>
                <Button onClick={handleStartKYC} variant="outline" className="w-full">
                  Retry Verification
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Settings Sections */}
      {settingsSections.map((section, sectionIndex) => (
        <Card key={sectionIndex}>
          <CardHeader>
            <CardTitle>{section.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex}>
                  <div
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={item.action}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-muted-foreground">
                        {item.icon}
                      </div>
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.value}</p>
                      </div>
                    </div>

                    {item.toggle ? (
                      <Switch
                        checked={item.checked}
                        onCheckedChange={item.onToggle}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <ChevronRight size={16} className="text-muted-foreground" />
                    )}
                  </div>
                  {itemIndex < section.items.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* App Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto">
              <span className="text-xl font-bold text-primary-foreground">Q</span>
            </div>
            <h3 className="font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              QUANTUM
            </h3>
            <p className="text-sm text-muted-foreground">Version 1.0.0</p>
            <p className="text-xs text-muted-foreground">© 2024 Quantum Investment</p>
          </div>
        </CardContent>
      </Card>


    </div>
  );
}
