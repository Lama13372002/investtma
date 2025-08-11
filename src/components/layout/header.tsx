'use client';

import { Bell, Globe, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState } from 'react';

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
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 py-3 max-w-md">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <span className="text-lg font-bold text-primary-foreground">Q</span>
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
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
              className="text-muted-foreground hover:text-foreground"
            >
              <Globe size={16} />
              <span className="ml-1 text-xs uppercase">{language}</span>
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground relative"
            >
              <Bell size={16} />
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 w-2 h-2 p-0 rounded-full"
              />
            </Button>

            {/* User Avatar */}
            <div className="flex items-center space-x-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-muted text-xs">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        {/* Welcome message */}
        {user && (
          <div className="mt-2">
            <p className="text-sm text-muted-foreground">
              {language === 'ru' ? 'Добро пожаловать' : 'Welcome'}, {getDisplayName()}!
            </p>
            <Badge variant="outline" className="text-xs mt-1">
              <User size={10} className="mr-1" />
              {language === 'ru' ? 'Верифицирован' : 'Verified'}
            </Badge>
          </div>
        )}
      </div>
    </header>
  );
}
