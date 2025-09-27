import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { formatPrice, formatCountdown, validateNumericInput } from '../../lib/utils';
import { useActiveAccount } from 'thirdweb/react';
import { client } from '../../lib/thirdweb';

export interface NFTCardProps {
  // NFT Data
  image: string;
  name: string;
  rank: string | number;
  rarity: string;
  rarityPercent: string | number;
  tokenId: string;
  
  // Auction Data
  startingPrice: string;
  currentBid?: string;
  buyNow: string;
  auctionEnd?: string | number | bigint;
  numBids: number;
  isForSale: boolean;
  auctionId?: string | number | bigint;
  
  // UI State
  activeView: 'forSale' | 'sold';
  bidAmount: string;
  isProcessingBuyNow: boolean;
  isProcessingBid: boolean;
  
  // Handlers
  onBid: (bidAmount: string) => void;
  onBuyNow: () => void;
  onBidAmountChange: (tokenId: string, amount: string) => void;
  onFavorite?: (tokenId: string) => void;
  isFavorited?: boolean;
  
  // Values
  buyNowValue?: number;
  buyNowWei?: string;
  minimumBidWei?: string;
}

export const NFTCard: React.FC<NFTCardProps> = ({
  image,
  name,
  rank,
  rarity,
  rarityPercent,
  tokenId,
  startingPrice,
  currentBid,
  buyNow,
  auctionEnd,
  numBids,
  isForSale,
  auctionId,
  activeView,
  bidAmount,
  isProcessingBuyNow,
  isProcessingBid,
  onBid,
  onBuyNow,
  onBidAmountChange,
  onFavorite,
  isFavorited = false,
  buyNowValue,
  buyNowWei,
  minimumBidWei,
}) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [countdown, setCountdown] = useState("");
  const account = useActiveAccount({ client });

  // Countdown update
  useEffect(() => {
    const updateCountdown = () => setCountdown(formatCountdown(auctionEnd || 0));
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [auctionEnd]);

  // Calculate minimum bid
  const minIncrement = 0.05; // 5%
  const currentBidValue = Number(currentBid?.replace(' ETH', '') || '0');
  const minimumBidDisplay = numBids > 0
    ? (currentBidValue * (1 + minIncrement))
    : currentBidValue;
  
  const formatBidAmount = (amount: number) => parseFloat(amount.toFixed(5)).toString();
  const displayBidAmount = bidAmount === "" ? formatBidAmount(minimumBidDisplay) : bidAmount;
  const placeholder = "/placeholder-nft.webp";
  const showPlaceholder = !imgLoaded || imgError;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!account?.address) {
      alert('Please connect your wallet to favorite NFTs');
      return;
    }
    onFavorite?.(tokenId);
  };

  const handleBidClick = () => {
    if (!account?.address) {
      alert("Please connect your wallet first");
      return;
    }
    onBid(displayBidAmount);
  };

  const handleBuyNowClick = () => {
    if (!account?.address) {
      alert("Please connect your wallet first");
      return;
    }
    onBuyNow();
  };

  return (
    <Card variant="nft" hover className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl mx-auto flex flex-col h-full">
      {/* Image Section */}
      <div className="relative bg-bg-primary w-full overflow-visible" style={{ aspectRatio: "0.9/1" }}>
        <img
          src={showPlaceholder ? placeholder : image}
          alt={name}
          width="100%"
          height="100%"
          className={`object-contain p-2 hover:scale-[1.02] hover:rotate-[5deg] hover:-translate-y-1 transition-all duration-300 ease-out relative z-20 ${
            showPlaceholder ? 'animate-pulse' : ''
          }`}
          onLoad={() => { setImgLoaded(true); }}
          onError={() => { setImgError(true); }}
        />
        {!imgLoaded && !showPlaceholder && (
          <div className="absolute inset-0 bg-bg-primary/80 flex items-center justify-center">
            <div className="animate-pulse text-text-muted text-sm">Loading...</div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-3 bg-bg-primary flex-1 flex flex-col">
        {/* Header */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm md:text-base lg:text-lg font-medium leading-tight whitespace-nowrap pr-2 text-text-primary">
              {name}
            </h4>
            {onFavorite && (
              <button
                onClick={handleFavoriteClick}
                className="p-1 rounded-full hover:bg-bg-secondary transition-colors"
                title={isFavorited ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart 
                  className={`w-5 h-5 transition-colors ${
                    isFavorited 
                      ? "fill-brand-pink text-brand-pink" 
                      : "text-text-muted hover:text-brand-pink"
                  }`} 
                />
              </button>
            )}
          </div>
          {auctionEnd && (
            <div className="text-xs md:text-sm text-text-muted mb-2">
              Ends: {countdown}
            </div>
          )}
        </div>

        {/* NFT Details */}
        {activeView === "forSale" && (
          <div className="flex flex-col flex-1">
            <div className="space-y-0 text-xs mb-2 flex-1 leading-none">
              <div className="flex justify-between py-0.5">
                <span className="text-text-muted">Rank:</span>
                <span className="text-text-muted">{rank || '—'} of 7777</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-text-muted">Rarity:</span>
                <span className="text-text-muted">{rarityPercent || '--'}%</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-text-muted">Tier:</span>
                <span className="text-text-muted">{rarity || 'Unknown'}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-text-muted">Bids:</span>
                <span className="text-text-muted">{numBids}</span>
              </div>
              {!isForSale && (
                <div className="flex justify-between py-0.5">
                  <span className="text-text-muted">Status:</span>
                  <span className="text-text-muted">Not for Sale</span>
                </div>
              )}
            </div>

            {/* Bidding Section */}
            {isForSale && (
              <>
                <div className="pt-1 mb-1 p-2 bg-bg-secondary rounded">
                  <div className="text-xs mb-1 font-normal text-text-primary">Enter your max bid</div>
                  <div className="flex gap-2 mb-1">
                    <div className="relative flex-1">
                      <Input
                        type="number"
                        placeholder={formatBidAmount(minimumBidDisplay)}
                        value={displayBidAmount}
                        onChange={(e) => {
                          const validation = validateNumericInput(e.target.value, tokenId);
                          if (validation.isValid) {
                            onBidAmountChange(tokenId, validation.formattedValue);
                          }
                        }}
                        className="w-full text-xs md:text-sm bg-bg-primary border-success focus:border-success focus:ring-success"
                        style={{ height: "32px" }}
                        step="0.00001"
                        min={currentBid?.replace(' ETH', '') || '0'}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-xs pointer-events-none">
                        ETH
                      </div>
                    </div>
                    <Button
                      onClick={handleBidClick}
                      disabled={isProcessingBid}
                      variant="success"
                      size="sm"
                      className="px-3 text-xs md:text-sm min-w-[50px] h-8"
                    >
                      {isProcessingBid ? "BIDDING..." : "BID"}
                    </Button>
                  </div>
                  <div className="text-xs text-text-muted whitespace-nowrap">
                    Min: {formatBidAmount(minimumBidDisplay)} ETH
                  </div>
                </div>

                {/* Buy Now Section */}
                <div className="pt-1 p-2 bg-bg-secondary rounded">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-xs md:text-sm mb-0.5 text-text-primary">Buy Now</div>
                      <div className="text-sm md:text-base font-medium leading-tight text-info">
                        {buyNow.replace(' ETH', '')} ETH
                      </div>
                    </div>
                    <Button
                      onClick={handleBuyNowClick}
                      disabled={isProcessingBuyNow}
                      variant="info"
                      size="sm"
                      className="px-3 text-xs md:text-sm min-w-[50px] h-8"
                    >
                      {isProcessingBuyNow ? "BUYING..." : "BUY"}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default NFTCard;
