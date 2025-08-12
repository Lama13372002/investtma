'use client';

import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Wallet, Users, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export function DashboardTab() {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('TRON');
  const { toast } = useToast();

  const networks = [
    { value: 'TRON', label: 'TRON (TRC20)', fee: '1.70 USDT' },
    { value: 'BSC', label: 'BSC (BEP20)', fee: '0.30 USDT' },
    { value: 'ETH', label: 'Ethereum (ERC20)', fee: '10.00 USDT' },
    { value: 'POLYGON', label: 'Polygon (POS)', fee: '0.01 USDT' }
  ];

  useEffect(() => {
    // Trigger animation after mount
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Mock data - в реальном приложении это будет из API
  const mockData = {
    balance: {
      available: 1250.50,
      locked: 500.00,
      bonus: 75.25,
      total: 1825.75
    },
    stats: {
      totalProfit: 325.75,
      dailyProfit: 12.50,
      roi: 15.2,
      activeInvestments: 3,
      totalReferrals: 8,
      weeklyGrowth: 8.3
    }
  };

  const formatBalance = (amount: number) => {
    return balanceVisible ? `${amount.toFixed(2)} USDT` : '••••• USDT';
  };

  const handleDeposit = () => {
    if (!depositAmount || parseFloat(depositAmount) < 10) {
      toast({
        title: "Invalid Amount",
        description: "Minimum deposit amount is 10 USDT",
        variant: "destructive",
      });
      return;
    }

    // В реальном приложении здесь будет создание платежа через Cryptomus API
    toast({
      title: "Deposit Initiated",
      description: "You will receive payment instructions shortly",
    });
    setDepositOpen(false);
    setDepositAmount('');
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || !withdrawAddress) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (amount < 10) {
      toast({
        title: "Invalid Amount",
        description: "Minimum withdrawal amount is 10 USDT",
        variant: "destructive",
      });
      return;
    }

    if (amount > mockData.balance.available) {
      toast({
        title: "Insufficient Balance",
        description: "Not enough available balance",
        variant: "destructive",
      });
      return;
    }

    // В реальном приложении здесь будет создание выплаты через Cryptomus API
    toast({
      title: "Withdrawal Request Submitted",
      description: "Your withdrawal will be processed within 24 hours",
    });
    setWithdrawOpen(false);
    setWithdrawAmount('');
    setWithdrawAddress('');
  };

  return (
    <div className="space-y-6">
      {/* Balance Cards */}
      <div className="space-y-4">
        {/* Main Balance Card */}
        <Card className={`balance-card glow-effect transition-all duration-700 ${
          isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}>
          <CardHeader className="pb-3 relative">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-white/95">Available Balance</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBalanceVisible(!balanceVisible)}
                className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-110 rounded-full w-8 h-8 p-0"
              >
                {balanceVisible ? <Eye size={16} /> : <EyeOff size={16} />}
              </Button>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10 opacity-30"></div>
          </CardHeader>
          <CardContent className="pt-0 relative">
            <div className="space-y-6">
              <div className={`text-4xl font-bold text-primary transition-all duration-300 quantum-glow ${
                balanceVisible ? 'scale-100' : 'scale-95'
              }`}>
                {formatBalance(mockData.balance.available)}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 p-4 rounded-lg glass-card transition-all duration-300 hover:bg-warning/5 group hover:border-warning/30 hover:shadow-lg hover:shadow-warning/5">
                  <p className="text-xs text-muted-foreground group-hover:text-warning/80 transition-colors duration-300">Locked</p>
                  <p className="text-sm font-medium text-warning/90 group-hover:text-warning transition-colors duration-300">
                    {formatBalance(mockData.balance.locked)}
                  </p>
                </div>
                <div className="space-y-1 p-4 rounded-lg glass-card transition-all duration-300 hover:bg-primary/5 group hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                  <p className="text-xs text-muted-foreground group-hover:text-primary/80 transition-colors duration-300">Bonus</p>
                  <p className="text-sm font-medium text-primary/90 group-hover:text-primary transition-colors duration-300">
                    {formatBalance(mockData.balance.bonus)}
                  </p>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="deposit-button flex-1 transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 h-12 rounded-xl"
                      size="default"
                    >
                      <ArrowDownRight size={18} className="mr-2" />
                      Deposit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gradient-to-br from-card/98 via-card/95 to-card/98 backdrop-blur-xl border border-primary/20 shadow-2xl shadow-primary/10 max-w-md mx-auto">
                    <DialogHeader className="pb-4 border-b border-primary/10">
                      <DialogTitle className="text-2xl font-bold text-white flex items-center bg-gradient-to-r from-white via-primary/90 to-white bg-clip-text text-transparent">
                        <div className="mr-4 bg-gradient-to-br from-primary/30 to-primary/10 rounded-full p-3 border border-primary/20 shadow-lg shadow-primary/20">
                          <ArrowDownRight size={24} className="text-primary" />
                        </div>
                        Deposit USDT
                      </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 relative pt-2">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full blur-3xl -z-10 opacity-30"></div>
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-2xl -z-10 opacity-20"></div>

                      <div className="space-y-3">
                        <Label htmlFor="deposit-amount" className="text-white/95 font-semibold text-sm tracking-wide">Amount (USDT)</Label>
                        <Input
                          id="deposit-amount"
                          type="number"
                          placeholder="Minimum: 10 USDT"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          className="border-white/20 bg-gradient-to-r from-white/10 to-white/5 focus:border-primary/60 focus:bg-white/15 transition-all duration-300 h-14 rounded-xl text-white placeholder:text-white/50 shadow-inner"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="deposit-network" className="text-white/95 font-semibold text-sm tracking-wide">Network</Label>
                        <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                          <SelectTrigger className="border-white/20 bg-gradient-to-r from-white/10 to-white/5 focus:border-primary/60 transition-all duration-300 h-14 rounded-xl text-white shadow-inner">
                            <SelectValue placeholder="Select network" />
                          </SelectTrigger>
                          <SelectContent className="bg-gradient-to-b from-card via-card/95 to-card/90 border border-white/20 rounded-xl backdrop-blur-xl shadow-2xl">
                            {networks.map((network) => (
                              <SelectItem key={network.value} value={network.value} className="focus:bg-primary/15 focus:text-primary hover:bg-primary/10 hover:text-primary rounded-lg mx-1 my-0.5 transition-all duration-200">
                                {network.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-5 border border-primary/20 shadow-lg shadow-primary/5 backdrop-blur-sm">
                        <div className="flex justify-between text-sm mb-3">
                          <span className="text-white/80 font-medium">Network:</span>
                          <span className="text-primary font-bold">{networks.find(n => n.value === selectedNetwork)?.label}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/80 font-medium">Fee:</span>
                          <span className="text-primary font-bold">{networks.find(n => n.value === selectedNetwork)?.fee}</span>
                        </div>
                      </div>

                      <div className="flex space-x-4 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setDepositOpen(false)}
                          className="flex-1 h-14 border-white/20 bg-white/5 hover:bg-white/10 hover:text-white hover:border-white/30 transition-all duration-300 rounded-xl font-semibold"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleDeposit}
                          className="flex-1 deposit-button h-14 rounded-xl font-semibold shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300"
                        >
                          Generate Address
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="withdraw-button flex-1 transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 h-12 rounded-xl"
                      size="default"
                    >
                      <ArrowUpRight size={18} className="mr-2" />
                      Withdraw
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gradient-to-br from-card/98 via-card/95 to-card/98 backdrop-blur-xl border border-destructive/20 shadow-2xl shadow-destructive/10 max-w-md mx-auto">
                    <DialogHeader className="pb-4 border-b border-destructive/10">
                      <DialogTitle className="text-2xl font-bold text-white flex items-center bg-gradient-to-r from-white via-destructive/90 to-white bg-clip-text text-transparent">
                        <div className="mr-4 bg-gradient-to-br from-destructive/30 to-destructive/10 rounded-full p-3 border border-destructive/20 shadow-lg shadow-destructive/20">
                          <ArrowUpRight size={24} className="text-destructive" />
                        </div>
                        Withdraw USDT
                      </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 relative pt-2">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-destructive/20 to-destructive/5 rounded-full blur-3xl -z-10 opacity-30"></div>
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-destructive/10 to-transparent rounded-full blur-2xl -z-10 opacity-20"></div>

                      <div className="space-y-3">
                        <Label htmlFor="withdraw-amount" className="text-white/95 font-semibold text-sm tracking-wide">Amount (USDT)</Label>
                        <Input
                          id="withdraw-amount"
                          type="number"
                          placeholder="Minimum: 10 USDT"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          className="border-white/20 bg-gradient-to-r from-white/10 to-white/5 focus:border-destructive/60 focus:bg-white/15 transition-all duration-300 h-14 rounded-xl text-white placeholder:text-white/50 shadow-inner"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="withdraw-address" className="text-white/95 font-semibold text-sm tracking-wide">Wallet Address</Label>
                        <Input
                          id="withdraw-address"
                          placeholder="Enter your wallet address"
                          value={withdrawAddress}
                          onChange={(e) => setWithdrawAddress(e.target.value)}
                          className="border-white/20 bg-gradient-to-r from-white/10 to-white/5 focus:border-destructive/60 focus:bg-white/15 transition-all duration-300 h-14 rounded-xl text-white placeholder:text-white/50 shadow-inner"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="withdraw-network" className="text-white/95 font-semibold text-sm tracking-wide">Network</Label>
                        <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                          <SelectTrigger className="border-white/20 bg-gradient-to-r from-white/10 to-white/5 focus:border-destructive/60 transition-all duration-300 h-14 rounded-xl text-white shadow-inner">
                            <SelectValue placeholder="Select network" />
                          </SelectTrigger>
                          <SelectContent className="bg-gradient-to-b from-card via-card/95 to-card/90 border border-white/20 rounded-xl backdrop-blur-xl shadow-2xl">
                            {networks.map((network) => (
                              <SelectItem key={network.value} value={network.value} className="focus:bg-destructive/15 focus:text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg mx-1 my-0.5 transition-all duration-200">
                                {network.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="bg-gradient-to-r from-destructive/10 via-destructive/5 to-transparent rounded-2xl p-5 border border-destructive/20 shadow-lg shadow-destructive/5 backdrop-blur-sm">
                        <div className="flex justify-between text-sm mb-3">
                          <span className="text-white/80 font-medium">Amount:</span>
                          <span className="text-white font-bold">{withdrawAmount || '0'} USDT</span>
                        </div>
                        <div className="flex justify-between text-sm mb-3">
                          <span className="text-white/80 font-medium">Fee:</span>
                          <span className="text-white/90 font-bold">{networks.find(n => n.value === selectedNetwork)?.fee}</span>
                        </div>
                        <div className="flex justify-between text-sm font-medium border-t border-destructive/20 pt-3">
                          <span className="text-white/90 font-semibold">You will receive:</span>
                          <span className="text-destructive font-bold text-lg">{withdrawAmount ? (parseFloat(withdrawAmount) - parseFloat(networks.find(n => n.value === selectedNetwork)?.fee?.split(' ')[0] || '0')).toFixed(2) : '0'} USDT</span>
                        </div>
                      </div>

                      <div className="flex space-x-4 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setWithdrawOpen(false)}
                          className="flex-1 h-14 border-white/20 bg-white/5 hover:bg-white/10 hover:text-white hover:border-white/30 transition-all duration-300 rounded-xl font-semibold"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleWithdraw}
                          className="flex-1 withdraw-button h-14 rounded-xl font-semibold shadow-xl shadow-destructive/30 hover:shadow-2xl hover:shadow-destructive/40 transition-all duration-300"
                        >
                          Submit Withdrawal
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ROI Card */}
        <Card className={`investment-card transition-all duration-700 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 ${
          isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`} style={{ animationDelay: '100ms' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center transition-all duration-300 hover:bg-primary/20 hover:scale-110">
                  <TrendingUp size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">ROI</p>
                  <p className="text-2xl font-bold text-primary transition-all duration-300 hover:scale-105">
                    {mockData.stats.roi}%
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Daily Profit</p>
                <p className="text-lg font-semibold text-primary transition-all duration-300 hover:scale-105">
                  +{formatBalance(mockData.stats.dailyProfit)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Section */}
      <div className={`space-y-4 transition-all duration-700 ${
        isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`} style={{ animationDelay: '200ms' }}>
        <h3 className="text-lg font-semibold">Performance</h3>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Weekly Growth</span>
                <Badge variant="outline" className="text-primary border-primary/20 animate-pulse">
                  +{mockData.stats.weeklyGrowth}%
                </Badge>
              </div>
              <Progress value={mockData.stats.weeklyGrowth * 5} className="h-2 transition-all duration-1000" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group">
            <CardContent className="p-4 text-center">
              <Wallet size={24} className="mx-auto mb-2 text-primary transition-all duration-300 group-hover:scale-110" />
              <p className="text-2xl font-bold transition-all duration-300 group-hover:text-primary">{mockData.stats.activeInvestments}</p>
              <p className="text-xs text-muted-foreground">Active Plans</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group">
            <CardContent className="p-4 text-center">
              <Users size={24} className="mx-auto mb-2 text-primary transition-all duration-300 group-hover:scale-110" />
              <p className="text-2xl font-bold transition-all duration-300 group-hover:text-primary">{mockData.stats.totalReferrals}</p>
              <p className="text-xs text-muted-foreground">Referrals</p>
            </CardContent>
          </Card>
        </div>
      </div>


    </div>
  );
}
