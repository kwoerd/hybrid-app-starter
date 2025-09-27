import React, { useState, useEffect } from 'react';
import { NFTGrid } from '../nft/NFTGrid';
import { ConnectWallet } from '../wallet/ConnectWallet';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useActiveAccount } from 'thirdweb/react';
import { client } from '../../lib/thirdweb';
import { NFTData } from '../nft/NFTGrid';

export interface NFTMarketplaceProps {
  nfts: NFTData[];
  isLoading?: boolean;
  onBid?: (nft: NFTData, bidAmount: string) => Promise<void>;
  onBuyNow?: (nft: NFTData) => Promise<void>;
  onFavorite?: (tokenId: string) => void;
  favorites?: Set<string>;
  className?: string;
}

export const NFTMarketplace: React.FC<NFTMarketplaceProps> = ({
  nfts,
  isLoading = false,
  onBid,
  onBuyNow,
  onFavorite,
  favorites = new Set(),
  className = '',
}) => {
  const [activeView, setActiveView] = useState<'forSale' | 'sold'>('forSale');
  const [bidAmounts, setBidAmounts] = useState<{ [tokenId: string]: string }>({});
  const account = useActiveAccount({ client });

  // Filter NFTs based on active view
  const filteredNFTs = nfts.filter(nft => {
    if (activeView === 'forSale') {
      return nft.isForSale;
    } else {
      return !nft.isForSale;
    }
  });

  const handleBidAmountChange = (tokenId: string, amount: string) => {
    setBidAmounts(prev => ({ ...prev, [tokenId]: amount }));
  };

  const handleBid = async (nft: NFTData, bidAmount: string) => {
    if (onBid) {
      try {
        await onBid(nft, bidAmount);
        // Reset bid amount after successful bid
        setBidAmounts(prev => ({ ...prev, [nft.tokenId]: "" }));
      } catch (error) {
        console.error('Bid failed:', error);
        throw error;
      }
    }
  };

  const handleBuyNow = async (nft: NFTData) => {
    if (onBuyNow) {
      try {
        await onBuyNow(nft);
      } catch (error) {
        console.error('Buy now failed:', error);
        throw error;
      }
    }
  };

  const handleFavorite = (tokenId: string) => {
    if (onFavorite) {
      onFavorite(tokenId);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              Satoshe Sluggers Marketplace
            </h1>
            <p className="text-text-secondary">
              Discover and collect unique baseball-themed NFTs
            </p>
          </div>
          
          {/* Wallet Connection */}
          <div className="flex items-center gap-4">
            {account ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-sm text-text-secondary">
                  Connected: {account.address.slice(0, 6)}...{account.address.slice(-4)}
                </span>
              </div>
            ) : (
              <ConnectWallet size="md" />
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card variant="info" className="p-4">
            <div className="text-sm text-text-muted mb-1">Total Collection</div>
            <div className="text-2xl font-bold text-text-primary">7,777</div>
          </Card>
          <Card variant="info" className="p-4">
            <div className="text-sm text-text-muted mb-1">Active Listings</div>
            <div className="text-2xl font-bold text-success">
              {nfts.filter(nft => nft.isForSale).length}
            </div>
          </Card>
          <Card variant="info" className="p-4">
            <div className="text-sm text-text-muted mb-1">Total Volume</div>
            <div className="text-2xl font-bold text-info">-- ETH</div>
          </Card>
        </div>
      </div>

      {/* NFT Grid */}
      <NFTGrid
        nfts={filteredNFTs}
        isLoading={isLoading}
        activeView={activeView}
        onViewChange={setActiveView}
        onBid={handleBid}
        onBuyNow={handleBuyNow}
        onBidAmountChange={handleBidAmountChange}
        onFavorite={handleFavorite}
        favorites={favorites}
      />

      {/* Footer */}
      <div className="mt-12 pt-8 border-t border-border-primary">
        <div className="text-center text-text-muted text-sm">
          <p>Powered by thirdweb • Built for Webflow</p>
          <p className="mt-2">
            <a 
              href="https://satoshesluggers.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-brand-pink hover:text-brand-pink-hover transition-colors"
            >
              View Collection Site →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NFTMarketplace;
