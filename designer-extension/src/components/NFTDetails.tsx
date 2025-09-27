import React, { useState, useEffect, useMemo } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { client } from '../lib/thirdweb';
import { loadNFTData, NFTData } from '../lib/nftDataLoader';
import { useBidding } from '../hooks/useBidding';
import { useFavorites } from '../hooks/useFavorites';
import { ArrowLeft, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import AuctionTimer from './AuctionTimer';

interface NFTDetailsProps {
  tokenId: string;
  onBack: () => void;
}

export default function NFTDetails({ tokenId, onBack }: NFTDetailsProps) {
  const [nftData, setNftData] = useState<NFTData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState('');

  const account = useActiveAccount({ client });
  const { placeBid, buyNow, isProcessing } = useBidding();
  const { toggleFavorite, isFavorite } = useFavorites();

  // Load NFT data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const loader = loadNFTData();
        const data = await loader.loadNFTs();
        setNftData(data.nfts);
        setError(data.error);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load NFT data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Find the specific NFT
  const nft = useMemo(() => {
    return nftData.find(n => n.tokenId === tokenId);
  }, [nftData, tokenId]);

  // Find previous/next NFTs
  const currentIndex = useMemo(() => {
    return nftData.findIndex(n => n.tokenId === tokenId);
  }, [nftData, tokenId]);

  const previousNFT = currentIndex > 0 ? nftData[currentIndex - 1] : null;
  const nextNFT = currentIndex < nftData.length - 1 ? nftData[currentIndex + 1] : null;

  const handleBid = async () => {
    if (!account?.address) {
      alert('Please connect your wallet to place a bid');
      return;
    }
    if (!bidAmount) {
      alert('Please enter a bid amount');
      return;
    }
    
    try {
      await placeBid(tokenId, bidAmount);
      alert('Bid placed successfully!');
      setBidAmount('');
    } catch (error) {
      console.error('Bid failed:', error);
      alert(`Bid failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleBuyNow = async () => {
    if (!account?.address) {
      alert('Please connect your wallet to buy now');
      return;
    }
    
    try {
      await buyNow(tokenId);
      alert('Purchase initiated!');
    } catch (error) {
      console.error('Buy now failed:', error);
      alert(`Purchase failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleFavorite = () => {
    toggleFavorite(tokenId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-xl">Loading NFT details...</div>
      </div>
    );
  }

  if (error || !nft) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-error text-xl mb-4">NFT not found</div>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Collection
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 sm:pt-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-6">
          <Button onClick={onBack} variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Collection
          </Button>
          <h1 className="text-4xl sm:text-5xl font-bold" style={{ color: "#fffbeb" }}>
            {nft.name}
          </h1>
          <p className="text-lg text-neutral-400 mt-2">Token ID: {nft.tokenId}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="space-y-4">
            <Card className="p-4">
              <div className="aspect-square bg-bg-primary rounded-lg overflow-hidden">
                <img
                  src={nft.image}
                  alt={nft.name}
                  className="w-full h-full object-contain"
                />
              </div>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                disabled={!previousNFT}
                onClick={() => previousNFT && (window.location.href = `/nft/${previousNFT.tokenId}`)}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={!nextNFT}
                onClick={() => nextNFT && (window.location.href = `/nft/${nextNFT.tokenId}`)}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            {/* Basic Info */}
            <Card className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: "#fffbeb" }}>
                    {nft.name}
                  </h2>
                  <p className="text-neutral-400">#{nft.tokenId}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFavorite}
                  className={`${isFavorite(tokenId) ? 'text-brand-pink' : 'text-text-muted'} hover:text-brand-pink-hover`}
                >
                  <Heart className={`w-5 h-5 ${isFavorite(tokenId) ? 'fill-current' : ''}`} />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-neutral-400">Rarity</p>
                  <p className="font-semibold" style={{ color: "#fffbeb" }}>
                    {nft.rarity}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-400">Rarity %</p>
                  <p className="font-semibold" style={{ color: "#fffbeb" }}>
                    {nft.rarityPercent}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-400">Tier</p>
                  <p className="font-semibold" style={{ color: "#fffbeb" }}>
                    {nft.tier || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-400">Status</p>
                  <p className="font-semibold text-brand-pink">
                    {nft.isForSale ? 'For Sale' : 'Not for Sale'}
                  </p>
                </div>
              </div>

              {/* Pricing */}
              {nft.isForSale && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-neutral-400">Starting Price</p>
                      <p className="text-xl font-bold" style={{ color: "#fffbeb" }}>
                        {nft.startingPrice} ETH
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-400">Buy Now</p>
                      <p className="text-xl font-bold" style={{ color: "#fffbeb" }}>
                        {nft.buyNow} ETH
                      </p>
                    </div>
                  </div>

                  {/* Bidding Section */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-neutral-400 mb-2 block">
                        Enter your bid (ETH)
                      </label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="0.01"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          className="flex-1"
                          step="0.001"
                          min="0"
                        />
                        <Button
                          onClick={handleBid}
                          disabled={isProcessing || !bidAmount}
                          variant="outline"
                        >
                          {isProcessing ? 'Bidding...' : 'Bid'}
                        </Button>
                      </div>
                    </div>

                    <Button
                      onClick={handleBuyNow}
                      disabled={isProcessing}
                      className="w-full bg-brand-pink hover:bg-brand-pink-hover text-white"
                    >
                      {isProcessing ? 'Processing...' : `Buy Now for ${nft.buyNow} ETH`}
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="space-y-4">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4" style={{ color: "#fffbeb" }}>
                    NFT Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Token ID</span>
                      <span style={{ color: "#fffbeb" }}>{nft.tokenId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Name</span>
                      <span style={{ color: "#fffbeb" }}>{nft.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Rarity</span>
                      <span style={{ color: "#fffbeb" }}>{nft.rarity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Rarity Percentage</span>
                      <span style={{ color: "#fffbeb" }}>{nft.rarityPercent}%</span>
                    </div>
                    {nft.tier && (
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Tier</span>
                        <span style={{ color: "#fffbeb" }}>{nft.tier}</span>
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>
              <TabsContent value="history" className="space-y-4">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4" style={{ color: "#fffbeb" }}>
                    Transaction History
                  </h3>
                  <p className="text-neutral-400">No transaction history available</p>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
