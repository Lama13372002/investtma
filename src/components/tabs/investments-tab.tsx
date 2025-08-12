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
        <div className="space-y-5">
          <h3 className="text-lg font-bold text-white/95 flex items-center">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-2">
              <TrendingUp size={14} className="text-primary" />
            </div>
            Active Investments
          </h3>

          {activeInvestments.map((investment) => (
            <Card key={investment.id} className="investment-card shine-effect overflow-hidden relative group">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 to-transparent opacity-30 -z-10"></div>
              <CardContent className="p-5 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-medium text-white/80">{investment.plan} Plan</p>
                    <p className="text-2xl font-bold text-primary quantum-glow">{investment.amount} USDT</p>
                  </div>
                  <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 px-3 py-1 group-hover:bg-primary/10 transition-all duration-300">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse mr-1.5"></div>
                    Active
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm bg-white/5 p-3 rounded-lg border border-white/5 group-hover:border-primary/10 transition-all duration-300">
                    <span className="text-white/60">Daily Profit</span>
                    <span className="text-primary font-bold">+{investment.dailyProfit} USDT</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">Progress</span>
                      <span className="text-white/90">{investment.totalDays - investment.daysLeft}/{investment.totalDays} days</span>
                    </div>
                    <Progress
                      value={((investment.totalDays - investment.daysLeft) / investment.totalDays) * 100}
                      className="h-2.5 rounded-full bg-white/10 overflow-hidden"
                    />
                  </div>

                  <div className="flex items-center text-sm text-white/60 bg-gradient-to-r from-primary/5 to-transparent p-2 rounded-lg">
                    <Clock size={14} className="mr-1.5 text-primary/80" />
                    {investment.daysLeft} days remaining
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Investment Plans */}
      <div className="space-y-5">
        <h3 className="text-lg font-bold text-white/95 flex items-center">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-2">
            <Crown size={14} className="text-primary" />
          </div>
          Investment Plans
        </h3>

        <div className="grid gap-5">
          {tariffPlans.map((plan) => (
            <Card key={plan.id} className="glass-card shine-effect relative overflow-hidden group border border-white/5 hover:border-primary/20 transition-all duration-300">
              {plan.isPopular && (
                <div className="absolute -top-1 -right-1 z-10">
                  <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg shadow-lg shadow-primary/20">
                    POPULAR
                  </div>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-20 transition-all duration-300 -z-10"></div>

              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-all duration-300`}>
                    {plan.icon}
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-white">{plan.name}</CardTitle>
                    <p className="text-sm text-primary/80">{plan.code}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 rounded-lg bg-white/5 border border-white/5 group-hover:border-primary/10 transition-all duration-300">
                      <p className="text-white/60 mb-1">Min Amount</p>
                      <p className="font-bold text-white group-hover:text-primary transition-colors duration-300">{plan.minAmount} USDT</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 border border-white/5 group-hover:border-primary/10 transition-all duration-300">
                      <p className="text-white/60 mb-1">Max Amount</p>
                      <p className="font-bold text-white group-hover:text-primary transition-colors duration-300">{plan.maxAmount.toLocaleString()} USDT</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 border border-white/5 group-hover:border-primary/10 transition-all duration-300">
                      <p className="text-white/60 mb-1">Daily Profit</p>
                      <p className="font-bold text-primary">{plan.dailyPercent}%</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 border border-white/5 group-hover:border-primary/10 transition-all duration-300">
                      <p className="text-white/60 mb-1">Term</p>
                      <p className="font-bold text-white group-hover:text-primary transition-colors duration-300">{plan.termDays} days</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-primary/10 to-transparent rounded-lg p-4 border border-primary/10">
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 font-medium">Total Return</span>
                      <span className="text-primary font-bold text-lg">
                        {(plan.dailyPercent * plan.termDays).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <Dialog open={isDialogOpen && selectedPlan?.id === plan.id} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full deposit-button h-12 rounded-xl mt-2 group-hover:shadow-lg group-hover:shadow-primary/20 transition-all duration-300"
                        onClick={() => setSelectedPlan(plan)}
                      >
                        <TrendingUp size={18} className="mr-2" />
                        Invest Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gradient-to-br from-card/98 via-card/95 to-card/98 backdrop-blur-xl border border-primary/20 shadow-2xl shadow-primary/10 max-w-md mx-auto">
                      <DialogHeader className="pb-4 border-b border-primary/10">
                        <DialogTitle className="text-2xl font-bold text-white flex items-center bg-gradient-to-r from-white via-primary/90 to-white bg-clip-text text-transparent">
                          <div className={`mr-4 w-12 h-12 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center shadow-lg border border-white/20`}>
                            {plan.icon}
                          </div>
                          Invest in {plan.name} Plan
                        </DialogTitle>
                      </DialogHeader>

                      <div className="space-y-6 relative pt-2">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full blur-3xl -z-10 opacity-30"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-2xl -z-10 opacity-20"></div>

                        <div className="space-y-3">
                          <Label htmlFor="amount" className="text-white/95 font-semibold text-sm tracking-wide">Investment Amount (USDT)</Label>
                          <Input
                            id="amount"
                            type="number"
                            placeholder={`Min: ${plan.minAmount}, Max: ${plan.maxAmount}`}
                            value={investmentAmount}
                            onChange={(e) => setInvestmentAmount(e.target.value)}
                            className="border-white/20 bg-gradient-to-r from-white/10 to-white/5 focus:border-primary/60 focus:bg-white/15 transition-all duration-300 h-14 rounded-xl text-white placeholder:text-white/50 shadow-inner"
                          />
                        </div>

                        {investmentAmount && (
                          <div className="bg-gradient-to-r from-primary/15 via-primary/8 to-transparent rounded-2xl p-5 border border-primary/25 space-y-4 shadow-lg shadow-primary/5 backdrop-blur-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-white/80 font-medium">Daily Profit:</span>
                              <span className="text-primary font-bold text-lg">
                                +{calculateProfit(plan, parseFloat(investmentAmount) || 0).dailyProfit.toFixed(2)} USDT
                              </span>
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-primary/20">
                              <span className="text-white/90 font-semibold">Total Profit:</span>
                              <span className="text-primary font-bold text-xl">
                                +{calculateProfit(plan, parseFloat(investmentAmount) || 0).totalProfit.toFixed(2)} USDT
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="flex space-x-4 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                            className="flex-1 h-14 border-white/20 bg-white/5 hover:bg-white/10 hover:text-white hover:border-white/30 transition-all duration-300 rounded-xl font-semibold"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleInvest}
                            className="flex-1 deposit-button h-14 rounded-xl font-semibold shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300"
                          >
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
