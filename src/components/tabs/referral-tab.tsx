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
      <Card className="balance-card glow-effect">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gift className="text-primary" size={20} />
            <span>Referral Earnings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{referralStats.totalEarned} USDT</p>
              <p className="text-sm text-muted-foreground">Total Earned</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-lg font-semibold text-primary">{referralStats.thisMonth} USDT</p>
                <p className="text-xs text-muted-foreground">This Month</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-primary">{referralStats.totalReferrals}</p>
                <p className="text-xs text-muted-foreground">Total Referrals</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commission Structure */}
      <Card>
        <CardHeader>
          <CardTitle>Commission Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Level 1</p>
                    <p className="text-sm text-muted-foreground">{referralStats.level1} referrals</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-primary border-primary/20">
                  {referralStats.commissionRates.level1}%
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-warning/5 border border-warning/20">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-warning text-warning-foreground flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Level 2</p>
                    <p className="text-sm text-muted-foreground">{referralStats.level2} referrals</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-warning border-warning/20">
                  {referralStats.commissionRates.level2}%
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Level 3</p>
                    <p className="text-sm text-muted-foreground">{referralStats.level3} referrals</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-purple-500 border-purple-500/20">
                  {referralStats.commissionRates.level3}%
                </Badge>
              </div>
            </div>

            <div className="bg-muted/20 rounded-lg p-3">
              <p className="text-sm text-muted-foreground">
                Earn commission from the daily profits of your referrals and their referrals up to 3 levels deep!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral Link */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="referral-link">Share this link to earn commissions</Label>
              <div className="flex space-x-2">
                <Input
                  id="referral-link"
                  value={referralLink}
                  readOnly
                  className="flex-1"
                />
                <Button variant="outline" size="icon" onClick={copyReferralLink}>
                  <Copy size={16} />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button onClick={copyReferralLink} variant="outline" size="sm">
                <Copy size={16} className="mr-2" />
                Copy Link
              </Button>
              <Button onClick={shareReferralLink} className="promote-button" size="sm">
                <Share size={16} className="mr-2" />
                Share
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Referrals */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referrals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentReferrals.map((referral) => (
              <div key={referral.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Users size={20} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{referral.name}</p>
                    <p className="text-sm text-muted-foreground">Joined {referral.joinDate}</p>
                    <p className="text-xs text-muted-foreground">Invested: {referral.investment} USDT</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-medium text-primary">+{referral.earnings} USDT</p>
                  <Badge variant="outline" className={getLevelColor(referral.level)}>
                    Level {referral.level}
                  </Badge>
                  <p className="text-xs text-primary mt-1">{referral.status}</p>
                </div>
              </div>
            ))}

            {recentReferrals.length === 0 && (
              <div className="text-center py-8">
                <Users size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No referrals yet</p>
                <p className="text-sm text-muted-foreground">Share your link to start earning!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Earnings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentEarnings.map((earning) => (
              <div key={earning.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">From {earning.from}</p>
                    <p className="text-sm text-muted-foreground">{earning.type}</p>
                    <p className="text-xs text-muted-foreground">{earning.date}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-medium text-primary">+{earning.amount} USDT</p>
                  <Badge variant="outline" className={getLevelColor(earning.level)}>
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
