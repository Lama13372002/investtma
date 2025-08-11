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
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-foreground">Available Balance</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBalanceVisible(!balanceVisible)}
                className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110"
              >
                {balanceVisible ? <Eye size={16} /> : <EyeOff size={16} />}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div className={`text-3xl font-bold text-primary transition-all duration-300 ${
                balanceVisible ? 'scale-100' : 'scale-95'
              }`}>
                {formatBalance(mockData.balance.available)}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 p-3 rounded-lg bg-warning/5 border border-warning/20 transition-all duration-300 hover:bg-warning/10">
                  <p className="text-xs text-muted-foreground">Locked</p>
                  <p className="text-sm font-medium text-warning">
                    {formatBalance(mockData.balance.locked)}
                  </p>
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-primary/5 border border-primary/20 transition-all duration-300 hover:bg-primary/10">
                  <p className="text-xs text-muted-foreground">Bonus</p>
                  <p className="text-sm font-medium text-primary">
                    {formatBalance(mockData.balance.bonus)}
                  </p>
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
                  <DialogTrigger asChild>
                    <Button className="deposit-button flex-1 transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95" size="sm">
                      <ArrowDownRight size={16} className="mr-2" />
                      Deposit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Deposit USDT</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="deposit-amount">Amount (USDT)</Label>
                        <Input
                          id="deposit-amount"
                          type="number"
                          placeholder="Minimum: 10 USDT"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="deposit-network">Network</Label>
                        <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select network" />
                          </SelectTrigger>
                          <SelectContent>
                            {networks.map((network) => (
                              <SelectItem key={network.value} value={network.value}>
                                {network.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="bg-muted/20 rounded-lg p-3">
                        <p className="text-sm text-muted-foreground">
                          Network: {networks.find(n => n.value === selectedNetwork)?.label}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Fee: {networks.find(n => n.value === selectedNetwork)?.fee}
                        </p>
                      </div>

                      <div className="flex space-x-2">
                        <Button variant="outline" onClick={() => setDepositOpen(false)} className="flex-1">
                          Cancel
                        </Button>
                        <Button onClick={handleDeposit} className="flex-1 deposit-button">
                          Generate Address
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
                  <DialogTrigger asChild>
                    <Button className="withdraw-button flex-1 transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95" size="sm">
                      <ArrowUpRight size={16} className="mr-2" />
                      Withdraw
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Withdraw USDT</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="withdraw-amount">Amount (USDT)</Label>
                        <Input
                          id="withdraw-amount"
                          type="number"
                          placeholder="Minimum: 10 USDT"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="withdraw-address">Wallet Address</Label>
                        <Input
                          id="withdraw-address"
                          placeholder="Enter your wallet address"
                          value={withdrawAddress}
                          onChange={(e) => setWithdrawAddress(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="withdraw-network">Network</Label>
                        <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select network" />
                          </SelectTrigger>
                          <SelectContent>
                            {networks.map((network) => (
                              <SelectItem key={network.value} value={network.value}>
                                {network.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="bg-muted/20 rounded-lg p-3">
                        <div className="flex justify-between text-sm">
                          <span>Amount:</span>
                          <span>{withdrawAmount || '0'} USDT</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Fee:</span>
                          <span>{networks.find(n => n.value === selectedNetwork)?.fee}</span>
                        </div>
                        <div className="flex justify-between text-sm font-medium border-t pt-2 mt-2">
                          <span>You will receive:</span>
                          <span>{withdrawAmount ? (parseFloat(withdrawAmount) - parseFloat(networks.find(n => n.value === selectedNetwork)?.fee?.split(' ')[0] || '0')).toFixed(2) : '0'} USDT</span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button variant="outline" onClick={() => setWithdrawOpen(false)} className="flex-1">
                          Cancel
                        </Button>
                        <Button onClick={handleWithdraw} className="flex-1 withdraw-button">
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

      {/* Quick Actions */}
      <div className={`space-y-4 transition-all duration-700 ${
        isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`} style={{ animationDelay: '300ms' }}>
        <h3 className="text-lg font-semibold">Quick Actions</h3>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="h-16 flex-col space-y-1 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary/50 group">
            <TrendingUp size={20} className="transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
            <span className="text-xs transition-all duration-300 group-hover:text-primary">Invest Now</span>
          </Button>

          <Button variant="outline" className="h-16 flex-col space-y-1 promote-button transition-all duration-300 hover:scale-105 hover:shadow-lg group">
            <Users size={20} className="transition-all duration-300 group-hover:scale-110" />
            <span className="text-xs transition-all duration-300">Invite Friends</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
