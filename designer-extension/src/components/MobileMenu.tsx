import React, { useState } from 'react';
import { Menu, X, Search, Filter, Heart, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import WalletIntegration from './WalletIntegration';
import { useFavorites } from '../hooks/useFavorites';

interface MobileMenuProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onToggleFilters: () => void;
  className?: string;
}

export default function MobileMenu({ 
  searchTerm, 
  setSearchTerm, 
  onToggleFilters, 
  className = '' 
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { favoritesCount } = useFavorites();

  return (
    <div className={`lg:hidden ${className}`}>
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 bg-bg-secondary border-b border-border-primary">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="text-text-primary"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
        
        <h1 className="text-lg font-bold" style={{ color: "#fffbeb" }}>
          SATOSHE SLUGGERS
        </h1>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleFilters}
            className="text-text-primary relative"
          >
            <Filter className="w-5 h-5" />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-pink text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {favoritesCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 lg:hidden">
          <div className="bg-bg-primary h-full w-80 max-w-sm shadow-xl">
            <div className="p-4">
              {/* Close Button */}
              <div className="flex justify-end mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-text-primary"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <Input
                    placeholder="Search NFTs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-bg-secondary border-border-primary text-text-primary"
                  />
                </div>
              </div>

              {/* Wallet Integration */}
              <div className="mb-6">
                <WalletIntegration />
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start text-text-primary border-border-primary hover:bg-bg-secondary"
                  onClick={() => {
                    onToggleFilters();
                    setIsOpen(false);
                  }}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters & Search
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start text-text-primary border-border-primary hover:bg-bg-secondary"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Favorites ({favoritesCount})
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start text-text-primary border-border-primary hover:bg-bg-secondary"
                >
                  <User className="w-4 h-4 mr-2" />
                  My NFTs
                </Button>
              </div>

              {/* Collection Stats */}
              <div className="mt-8 p-4 bg-bg-secondary rounded-lg">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Collection Stats</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-text-muted">Total Supply</p>
                    <p className="font-semibold text-text-primary">7,777</p>
                  </div>
                  <div>
                    <p className="text-text-muted">Rarity Tiers</p>
                    <p className="font-semibold text-text-primary">11</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
