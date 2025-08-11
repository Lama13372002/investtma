'use client';

import { useState } from 'react';
import { Users, Copy, Share, Gift, TrendingUp, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

export function ReferralTab() {
  const [referralLink] = useState('https://t.me/quantum_bot?start=refABC123');
  const { toast } = useToast();

  // Mock referral data
  const referralStats = {
    totalEarned: 156.75,
    thisMonth: 42.50,
    totalReferrals: 12,
    level1: 8,
    level2: 3,
    level3: 1,
    commissionRates: {
      level1: 5,
      level2: 2,
      level3: 1
    }
  };

  const recentReferrals = [
    {
      id: 1,
      name: 'User #1234',
      level: 1,
      joinDate: '2024-01-15',
      earnings: 25.50,
      status: 'active',
      investment: 500
    },
    {
      id: 2,
      name: 'User #5678',
      level: 1,
      joinDate: '2024-01-14',
      earnings: 12.30,
      status: 'active',
      investment: 250
    },
    {
      id: 3,
      name: 'User #9012',
      level: 2,
      joinDate: '2024-01-13',
      earnings: 8.75,
      status: 'active',
      investment: 300
    }
  ];

  const recentEarnings = [
    {
      id: 1,
      from: 'User #1234',
      amount: 2.50,
      level: 1,
      date: '2024-01-15 14:30',
      type: 'Daily Profit'
    },
    {
      id: 2,
      from: 'User #5678',
      amount: 1.25,
      level: 1,
      date: '2024-01-15 12:15',
      type: 'Daily Profit'
    },
    {
      id: 3,
      from: 'User #9012',
      amount: 0.60,
      level: 2,
      date: '2024-01-15 10:45',
      type: 'Daily Profit'
    }
  ];

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
  };

  const shareReferralLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Quantum Investment',
          text: 'Start earning with AI-powered investments!',
          url: referralLink,
        });
      } catch (error) {
        copyReferralLink();
      }
    } else {
      copyReferralLink();
    }
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1:
        return 'text-primary border-primary/20 bg-primary/5';
      case 2:
        return 'text-warning border-warning/20 bg-warning/5';
      case 3:
        return 'text-purple-500 border-purple-500/20 bg-purple-500/5';
      default:
        return 'text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-6">
      {/* Referral Stats Overview */}
      <Card className="balance-card glow-effect overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 to-transparent opacity-30 -z-10"></div>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-white/95 flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
              <Gift size={16} className="text-primary" />
            </div>
            Referral Earnings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="text-center pt-2">
              <p className="text-4xl font-bold text-primary quantum-glow tracking-wide">{referralStats.totalEarned} USDT</p>
              <p className="text-sm text-white/60 mt-1">Total Earned</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg glass-card border border-white/5 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 group">
                <p className="text-lg font-bold text-primary quantum-glow">{referralStats.thisMonth} USDT</p>
                <p className="text-xs text-white/60 mt-1 group-hover:text-primary/80 transition-colors duration-300">This Month</p>
              </div>
              <div className="text-center p-4 rounded-lg glass-card border border-white/5 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 group">
                <p className="text-lg font-bold text-primary quantum-glow">{referralStats.totalReferrals}</p>
                <p className="text-xs text-white/60 mt-1 group-hover:text-primary/80 transition-colors duration-300">Total Referrals</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commission Structure */}
      <Card className="glass-card overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-white/95 flex items-center">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-2">
              <TrendingUp size={14} className="text-primary" />
            </div>
            Commission Structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-5 pt-2">
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center text-sm font-bold shadow-lg shadow-primary/20 group-hover:scale-110 transition-all duration-300">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-white/90">Level 1</p>
                    <p className="text-sm text-white/60 group-hover:text-primary/80 transition-colors duration-300">{referralStats.level1} referrals</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 px-3 py-1.5 text-base font-bold">
                  {referralStats.commissionRates.level1}%
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-warning/10 to-transparent border border-warning/20 hover:border-warning/40 transition-all duration-300 hover:shadow-lg hover:shadow-warning/5 group">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-warning to-warning/70 text-warning-foreground flex items-center justify-center text-sm font-bold shadow-lg shadow-warning/20 group-hover:scale-110 transition-all duration-300">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-white/90">Level 2</p>
                    <p className="text-sm text-white/60 group-hover:text-warning/80 transition-colors duration-300">{referralStats.level2} referrals</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-warning border-warning/30 bg-warning/5 px-3 py-1.5 text-base font-bold">
                  {referralStats.commissionRates.level2}%
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-transparent border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5 group">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600/70 text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-all duration-300">
                    3
                  </div>
                  <div>
                    <p className="font-bold text-white/90">Level 3</p>
                    <p className="text-sm text-white/60 group-hover:text-purple-400/80 transition-colors duration-300">{referralStats.level3} referrals</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-purple-400 border-purple-500/30 bg-purple-500/5 px-3 py-1.5 text-base font-bold">
                  {referralStats.commissionRates.level3}%
                </Badge>
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary/5 to-transparent rounded-xl p-4 border border-primary/10">
              <p className="text-sm text-white/80">
                Earn commission from the daily profits of your referrals and their referrals up to 3 levels deep!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral Link */}
      <Card className="glass-card shine-effect overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-white/95 flex items-center">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-2">
              <Share size={14} className="text-primary" />
            </div>
            Your Referral Link
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-5 pt-2">
            <div className="space-y-3">
              <Label htmlFor="referral-link" className="text-white/90 font-medium">Share this link to earn commissions</Label>
              <div className="flex space-x-2">
                <Input
                  id="referral-link"
                  value={referralLink}
                  readOnly
                  className="flex-1 border-white/10 bg-white/5 focus:border-primary/50 transition-all duration-300 h-12"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyReferralLink}
                  className="h-12 w-12 border-white/10 bg-white/5 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all duration-300"
                >
                  <Copy size={18} />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={copyReferralLink}
                variant="outline"
                className="h-12 rounded-xl border-white/10 hover:bg-white/5 hover:text-white transition-all duration-300"
              >
                <Copy size={18} className="mr-2" />
                Copy Link
              </Button>
              <Button
                onClick={shareReferralLink}
                className="promote-button h-12 rounded-xl"
              >
                <Share size={18} className="mr-2" />
                Share
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Referrals */}
      <Card className="glass-card overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-white/95 flex items-center">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-2">
              <Users size={14} className="text-primary" />
            </div>
            Your Referrals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 pt-2">
            {recentReferrals.map((referral) => (
              <div key={referral.id} className="flex items-center justify-between p-4 rounded-lg glass-card border border-white/5 hover:border-primary/20 transition-all duration-300 group">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shadow-lg shadow-primary/10 group-hover:scale-110 transition-all duration-300">
                    <Users size={22} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-white/90">{referral.name}</p>
                    <p className="text-sm text-white/60 group-hover:text-primary/70 transition-colors duration-300">Joined {referral.joinDate}</p>
                    <p className="text-xs text-white/50">Invested: {referral.investment} USDT</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold text-lg text-primary quantum-glow">+{referral.earnings} USDT</p>
                  <Badge variant="outline" className={`${getLevelColor(referral.level)} px-2 py-0.5 group-hover:bg-white/5 transition-all duration-300`}>
                    Level {referral.level}
                  </Badge>
                  <p className="text-xs text-primary mt-1 opacity-80 group-hover:opacity-100 transition-opacity duration-300">{referral.status}</p>
                </div>
              </div>
            ))}

            {recentReferrals.length === 0 && (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4">
                  <Users size={32} className="text-primary/70" />
                </div>
                <p className="text-white/80 font-medium">No referrals yet</p>
                <p className="text-sm text-white/60 mt-1">Share your link to start earning!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Earnings */}
      <Card className="glass-card overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-white/95 flex items-center">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-2">
              <Gift size={14} className="text-primary" />
            </div>
            Recent Earnings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 pt-2">
            {recentEarnings.map((earning) => (
              <div key={earning.id} className="flex items-center justify-between p-4 rounded-lg glass-card border border-white/5 hover:border-primary/20 transition-all duration-300 group">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shadow-lg shadow-primary/10 group-hover:scale-110 transition-all duration-300">
                    <TrendingUp size={22} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-white/90">From {earning.from}</p>
                    <p className="text-sm text-white/60 group-hover:text-primary/70 transition-colors duration-300">{earning.type}</p>
                    <p className="text-xs text-white/50">{earning.date}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold text-lg text-primary quantum-glow">+{earning.amount} USDT</p>
                  <Badge variant="outline" className={`${getLevelColor(earning.level)} px-2 py-0.5 group-hover:bg-white/5 transition-all duration-300`}>
                    Level {earning.level}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
