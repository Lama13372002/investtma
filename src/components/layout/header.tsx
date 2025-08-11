'use client';

import { Bell, Globe, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState } from 'react';
import Image from 'next/image';

interface HeaderProps {
  user: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
  } | null | undefined;
}

export function Header({ user }: HeaderProps) {
  const [language, setLanguage] = useState(user?.language_code || 'en');

  const getInitials = () => {
    if (!user) return 'U';
    const firstInitial = user.first_name?.[0] || '';
    const lastInitial = user.last_name?.[0] || '';
    return (firstInitial + lastInitial).toUpperCase() || user.username?.[0]?.toUpperCase() || 'U';
  };

  const getDisplayName = () => {
    if (!user) return 'User';
    return user.first_name + (user.last_name ? ` ${user.last_name}` : '');
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ru' : 'en');
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-b from-background via-card/95 to-card/90 backdrop-blur-xl border-b border-white/5 shadow-md shadow-black/20">
      <div className="container mx-auto px-4 py-3 max-w-md">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white quantum-glow tracking-wider">
                QUANTUM
              </h1>
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-3">
            {/* Language toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="text-muted-foreground hover:text-primary transition-all duration-300 hover:bg-primary/10 rounded-full"
            >
              <Globe size={16} />
              <span className="ml-1 text-xs uppercase">{language}</span>
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary transition-all duration-300 hover:bg-primary/10 rounded-full relative"
            >
              <Bell size={16} />
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 w-2 h-2 p-0 rounded-full animate-pulse"
              />
            </Button>

            {/* User Avatar */}
            <div className="flex items-center">
              <Avatar className="w-8 h-8 border-2 border-primary/30 ring-2 ring-primary/10 transition-all duration-300 hover:ring-primary/30">
                <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 text-xs font-bold text-primary-foreground">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        {/* Welcome message */}
        {user && (
          <div className="mt-2">
            <p className="text-sm text-white/90 font-medium">
              {language === 'ru' ? 'Добро пожаловать' : 'Welcome'}, <span className="text-primary">{getDisplayName()}</span>!
            </p>
            <Badge variant="outline" className="text-xs mt-1 border-primary/20 bg-primary/5 text-primary">
              <User size={10} className="mr-1" />
              {language === 'ru' ? 'Верифицирован' : 'Verified'}
            </Badge>
          </div>
        )}
      </div>
    </header>
  );
}
