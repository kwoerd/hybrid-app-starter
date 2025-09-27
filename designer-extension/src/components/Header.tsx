import React, { useState } from 'react';
import { Menu, X, Search, Heart, User, Wallet } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import WalletIntegration from './WalletIntegration';
import { useFavorites } from '../hooks/useFavorites';
import { useNotifications } from './NotificationSystem';

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onToggleMobileMenu: () => void;
  isMobileMenuOpen: boolean;
  onNavigateToDashboard?: () => void;
  onNavigateToAnalytics?: () => void;
}

export default function Header({ 
  searchTerm, 
  setSearchTerm, 
  onToggleMobileMenu, 
  isMobileMenuOpen,
  onNavigateToDashboard,
  onNavigateToAnalytics
}: HeaderProps) {
  const { favoritesCount } = useFavorites();
  const { notifyInfo } = useNotifications();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-bg-primary/95 backdrop-blur-sm border-b border-border-primary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleMobileMenu}
              className="lg:hidden text-text-primary"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-brand-pink rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">SS</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold" style={{ color: "#fffbeb" }}>
                SATOSHE SLUGGERS
              </h1>
            </div>
          </div>

          {/* Desktop Search */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted" />
              <Input
                placeholder="Search NFTs, collections, or traits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-bg-secondary border-border-primary text-text-primary"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-text-primary hover:text-brand-pink"
            >
              <Heart className="w-4 h-4 mr-2" />
              Favorites ({favoritesCount})
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-text-primary hover:text-brand-pink"
              onClick={onNavigateToDashboard}
            >
              <User className="w-4 h-4 mr-2" />
              My NFTs
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-text-primary hover:text-brand-pink"
              onClick={onNavigateToAnalytics}
            >
              <Wallet className="w-4 h-4 mr-2" />
              Analytics
            </Button>
            
            <WalletIntegration />
          </div>

          {/* Mobile Actions */}
          <div className="flex lg:hidden items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-text-primary relative"
            >
              <Heart className="w-5 h-5" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-pink text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </Button>
            
            <WalletIntegration />
          </div>
        </div>
      </div>
    </header>
  );
}
