'use client';

import { useEffect, useState } from 'react';

export function LoadingScreen() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center space-y-6">
        {/* Logo */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center glow-effect">
            <div className="text-2xl font-bold text-primary-foreground">Q</div>
          </div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-primary/60 animate-ping opacity-20"></div>
        </div>

        {/* Brand */}
        <div className="text-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            QUANTUM
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            AI Investment Platform
          </p>
        </div>

        {/* Loading indicator */}
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
        </div>

        <p className="text-muted-foreground text-sm">
          Loading{dots}
        </p>
      </div>
    </div>
  );
}
