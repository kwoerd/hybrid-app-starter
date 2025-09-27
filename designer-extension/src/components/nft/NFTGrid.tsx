import React, { useState, useEffect, useMemo } from 'react';
import { NFTCard } from './NFTCard';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { formatPrice } from '../../lib/utils';
import { useActiveAccount } from 'thirdweb/react';
import { client } from '../../lib/thirdweb';

export interface NFTData {
  id: string;
  tokenId: string;
  name: string;
  image: string;
  rank: string | number;
  rarity: string;
  rarityPercent: string | number;
  startingPrice: string;
  currentBid?: string;
  buyNow: string;
  auctionEnd?: string | number | bigint;
  numBids: number;
  isForSale: boolean;
  auctionId?: string | number | bigint;
  buyNowValue?: number;
  buyNowWei?: string;
  minimumBidWei?: string;
}

export interface NFTGridProps {
  nfts: NFTData[];
  isLoading?: boolean;
  activeView: 'forSale' | 'sold';
  onViewChange: (view: 'forSale' | 'sold') => void;
  onBid: (nft: NFTData, bidAmount: string) => void;
  onBuyNow: (nft: NFTData) => void;
  onBidAmountChange: (tokenId: string, amount: string) => void;
  onFavorite?: (tokenId: string) => void;
  favorites?: Set<string>;
  className?: string;
}

export const NFTGrid: React.FC<NFTGridProps> = ({
  nfts,
  isLoading = false,
  activeView,
  onViewChange,
  onBid,
  onBuyNow,
  onBidAmountChange,
  onFavorite,
  favorites = new Set(),
  className,
}) => {
  const [bidAmounts, setBidAmounts] = useState<{ [id: string]: string }>({});
  const [isProcessingBid, setIsProcessingBid] = useState<{ [id: string]: boolean }>({});
  const [isProcessingBuyNow, setIsProcessingBuyNow] = useState<{ [id: string]: boolean }>({});
  const account = useActiveAccount({ client });

  // Initialize bid amounts
  useEffect(() => {
    const initialBids: { [id: string]: string } = {};
    nfts.forEach((nft) => {
      initialBids[nft.id] = bidAmounts[nft.id] || "";
    });
    setBidAmounts(initialBids);
  }, [nfts]);

  const handleBidAmountChange = (tokenId: string, amount: string) => {
    setBidAmounts(prev => ({ ...prev, [tokenId]: amount }));
    onBidAmountChange(tokenId, amount);
  };

  const handleBid = async (nft: NFTData) => {
    if (!account?.address) {
      alert("Please connect your wallet first");
      return;
    }
    
    setIsProcessingBid(prev => ({ ...prev, [nft.id]: true }));
    try {
      await onBid(nft, bidAmounts[nft.id] || "0");
    } finally {
      setIsProcessingBid(prev => ({ ...prev, [nft.id]: false }));
    }
  };

  const handleBuyNow = async (nft: NFTData) => {
    if (!account?.address) {
      alert("Please connect your wallet first");
      return;
    }
    
    setIsProcessingBuyNow(prev => ({ ...prev, [nft.id]: true }));
    try {
      await onBuyNow(nft);
    } finally {
      setIsProcessingBuyNow(prev => ({ ...prev, [nft.id]: false }));
    }
  };

  // Calculate counts
  const activeCount = nfts.filter(nft => nft.isForSale).length;
  const soldCount = nfts.filter(nft => !nft.isForSale && activeView === 'sold').length;

  if (isLoading) {
    return (
      <div className={`w-full max-w-full ${className}`}>
        <div className="mb-6">
          <div className="mb-4">
            <h2 className="text-lg font-medium text-text-primary">NFT Collection</h2>
            <div className="text-sm font-medium text-brand-pink mt-1">Loading...</div>
          </div>
        </div>
        <div className="mt-8 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 justify-between">
          {Array.from({ length: 12 }).map((_, index) => (
            <Card key={index} variant="nft" className="p-4 animate-pulse">
              <div className="aspect-square bg-bg-secondary rounded mb-3"></div>
              <div className="h-4 bg-bg-secondary rounded mb-2"></div>
              <div className="h-3 bg-bg-secondary rounded mb-1"></div>
              <div className="h-3 bg-bg-secondary rounded w-2/3"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-full ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="mb-4">
          <h2 className="text-lg font-medium text-text-primary">NFT Collection</h2>
          <div className="mt-1">
            <div className="text-xs font-medium text-success">
              {activeCount} Active
            </div>
            <div className="text-xs font-medium text-info">
              {soldCount} Sold
            </div>
          </div>
        </div>
        
        {/* View Toggle */}
        <div className="flex bg-bg-secondary rounded p-1 w-fit">
          <Button
            variant={activeView === "forSale" ? "primary" : "ghost"}
            size="sm"
            onClick={() => onViewChange("forSale")}
            className="px-3 py-1 text-sm"
          >
            Live
          </Button>
          <Button
            variant={activeView === "sold" ? "primary" : "ghost"}
            size="sm"
            onClick={() => onViewChange("sold")}
            className="px-3 py-1 text-sm"
          >
            Sold
          </Button>
        </div>
      </div>

      {/* NFT Grid */}
      {nfts.length > 0 ? (
        <div className="mt-8 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 justify-between">
          {nfts.map((nft) => (
            <NFTCard
              key={nft.id}
              image={nft.image}
              name={nft.name}
              rank={nft.rank}
              rarity={nft.rarity}
              rarityPercent={nft.rarityPercent}
              tokenId={nft.tokenId}
              startingPrice={nft.startingPrice}
              currentBid={nft.currentBid}
              buyNow={nft.buyNow}
              auctionEnd={nft.auctionEnd}
              numBids={nft.numBids}
              isForSale={nft.isForSale}
              auctionId={nft.auctionId}
              activeView={activeView}
              bidAmount={bidAmounts[nft.id] || ""}
              isProcessingBuyNow={isProcessingBuyNow[nft.id] || false}
              isProcessingBid={isProcessingBid[nft.id] || false}
              onBidAmountChange={handleBidAmountChange}
              onBid={() => handleBid(nft)}
              onBuyNow={() => handleBuyNow(nft)}
              onFavorite={onFavorite}
              isFavorited={favorites.has(nft.tokenId)}
              buyNowValue={nft.buyNowValue}
              buyNowWei={nft.buyNowWei}
              minimumBidWei={nft.minimumBidWei}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-lg mb-2 text-text-primary">No NFTs found</div>
          <div className="text-text-muted text-sm">
            Try adjusting your filters or check back later
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTGrid;
