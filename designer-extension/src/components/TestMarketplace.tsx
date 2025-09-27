import React, { useState, useEffect } from 'react';
import { ThirdwebProvider } from 'thirdweb/react';
import { NFTMarketplace } from './marketplace/NFTMarketplace';
import { loadNFTData, NFTData } from '../lib/nftDataLoader';
import { client, supportedChains } from '../lib/thirdweb';

/**
 * Test component for development - bypasses Webflow extension requirements
 */
export const TestMarketplace: React.FC = () => {
  const [nftData, setNftData] = useState<NFTData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await loadNFTData();
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading NFT data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <ThirdwebProvider>
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">
            Retinal Delights NFT Marketplace
          </h1>
          <p className="text-gray-400 text-center mb-8">
            Development Test - {nftData.length} NFTs loaded
          </p>
          <NFTMarketplace 
            nfts={nftData}
            onBid={() => console.log('Bid clicked')}
            onBuyNow={() => console.log('Buy now clicked')}
            onFavorite={() => console.log('Favorite clicked')}
          />
        </div>
      </div>
    </ThirdwebProvider>
  );
};
