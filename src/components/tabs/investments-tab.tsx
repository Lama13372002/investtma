'use client';

import { useState } from 'react';
import { TrendingUp, Clock, DollarSign, Calendar, Star, Zap, Crown, Gem } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

interface TariffPlan {
  id: number;
  code: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  termDays: number;
  dailyPercent: number;
  isPopular?: boolean;
  icon: React.ReactNode;
  color: string;
}

export function InvestmentsTab() {
  const [selectedPlan, setSelectedPlan] = useState<TariffPlan | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const tariffPlans: TariffPlan[] = [
    {
      id: 1,
      code: 'T1',
      name: 'Start',
      minAmount: 50,
      maxAmount: 499,
      termDays: 30,
      dailyPercent: 1.0,
      icon: <Star size={24} />,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 2,
      code: 'T2',
      name: 'Basic',
      minAmount: 500,
      maxAmount: 1999,
      termDays: 60,
      dailyPercent: 1.2,
      isPopular: true,
      icon: <Zap size={24} />,
      color: 'from-primary to-primary/80'
    },
    {
      id: 3,
      code: 'T3',
      name: 'Premium',
      minAmount: 2000,
      maxAmount: 9999,
      termDays: 90,
      dailyPercent: 1.4,
      icon: <Crown size={24} />,
      color: 'from-warning to-warning/80'
    },
    {
      id: 4,
      code: 'T4',
      name: 'Professional',
      minAmount: 10000,
      maxAmount: 1000000,
      termDays: 120,
      dailyPercent: 1.6,
      icon: <Gem size={24} />,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const calculateProfit = (plan: TariffPlan, amount: number) => {
    const dailyProfit = (amount * plan.dailyPercent) / 100;
    const totalProfit = dailyProfit * plan.termDays;
    return { dailyProfit, totalProfit };
  };

  const handleInvest = () => {
    if (!selectedPlan || !investmentAmount) return;

    const amount = parseFloat(investmentAmount);
    if (amount < selectedPlan.minAmount || amount > selectedPlan.maxAmount) {
      alert(`Amount must be between ${selectedPlan.minAmount} and ${selectedPlan.maxAmount} USDT`);
      return;
    }

    // В реальном приложении здесь будет API вызов
    alert(`Investment of ${amount} USDT in ${selectedPlan.name} plan initiated!`);
    setIsDialogOpen(false);
    setInvestmentAmount('');
    setSelectedPlan(null);
  };

  // Mock active investments
  const activeInvestments = [
    {
      id: 1,
      plan: 'Basic',
      amount: 1000,
      dailyProfit: 12,
      daysLeft: 45,
      totalDays: 60,
      status: 'active'
    },
    {
      id: 2,
      plan: 'Start',
      amount: 200,
      dailyProfit: 2,
      daysLeft: 15,
      totalDays: 30,
      status: 'active'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Active Investments */}
      {activeInvestments.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Active Investments</h3>

          {activeInvestments.map((investment) => (
            <Card key={investment.id} className="investment-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium">{investment.plan} Plan</p>
                    <p className="text-2xl font-bold text-primary">{investment.amount} USDT</p>
                  </div>
                  <Badge variant="outline" className="text-primary border-primary/20">
                    Active
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Daily Profit</span>
                    <span className="text-primary font-medium">+{investment.dailyProfit} USDT</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span>{investment.totalDays - investment.daysLeft}/{investment.totalDays} days</span>
                    </div>
                    <Progress
                      value={((investment.totalDays - investment.daysLeft) / investment.totalDays) * 100}
                      className="h-2"
                    />
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock size={14} className="mr-1" />
                    {investment.daysLeft} days remaining
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Investment Plans */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Investment Plans</h3>

        <div className="grid gap-4">
          {tariffPlans.map((plan) => (
            <Card key={plan.id} className="investment-card relative overflow-hidden">
              {plan.isPopular && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-bl-lg">
                  Popular
                </div>
              )}

              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center text-white`}>
                    {plan.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{plan.code}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Min Amount</p>
                      <p className="font-medium">{plan.minAmount} USDT</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Max Amount</p>
                      <p className="font-medium">{plan.maxAmount.toLocaleString()} USDT</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Daily Profit</p>
                      <p className="font-medium text-primary">{plan.dailyPercent}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Term</p>
                      <p className="font-medium">{plan.termDays} days</p>
                    </div>
                  </div>

                  <div className="bg-muted/20 rounded-lg p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Total Return</span>
                      <span className="text-primary font-medium">
                        {(plan.dailyPercent * plan.termDays).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <Dialog open={isDialogOpen && selectedPlan?.id === plan.id} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full deposit-button"
                        onClick={() => setSelectedPlan(plan)}
                      >
                        <TrendingUp size={16} className="mr-2" />
                        Invest Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Invest in {plan.name} Plan</DialogTitle>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="amount">Investment Amount (USDT)</Label>
                          <Input
                            id="amount"
                            type="number"
                            placeholder={`Min: ${plan.minAmount}, Max: ${plan.maxAmount}`}
                            value={investmentAmount}
                            onChange={(e) => setInvestmentAmount(e.target.value)}
                          />
                        </div>

                        {investmentAmount && (
                          <div className="bg-muted/20 rounded-lg p-3 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Daily Profit:</span>
                              <span className="text-primary">
                                {calculateProfit(plan, parseFloat(investmentAmount) || 0).dailyProfit.toFixed(2)} USDT
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Total Profit:</span>
                              <span className="text-primary">
                                {calculateProfit(plan, parseFloat(investmentAmount) || 0).totalProfit.toFixed(2)} USDT
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                            Cancel
                          </Button>
                          <Button onClick={handleInvest} className="flex-1 deposit-button">
                            Confirm Investment
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
