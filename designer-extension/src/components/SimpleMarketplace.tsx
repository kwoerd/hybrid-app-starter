"use client"
import React, { useState, useEffect } from "react";
import { ThirdwebProvider } from "thirdweb/react";
import { loadNFTData, NFTData } from "../lib/nftDataLoader";

export const SimpleMarketplace: React.FC = () => {
  const [nftData, setNftData] = useState<NFTData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadNFTData();
        setNftData(data.nfts);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load NFT data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load NFT data');
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-2xl">Loading NFTs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-2xl text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          <span className="text-yellow-400">SATO</span>
          <span className="text-pink-500">SHE</span>
          <span className="text-yellow-400"> SLUGGERS</span>
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {nftData.map((nft) => (
            <div key={nft.tokenId} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="aspect-square bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                <img 
                  src={nft.image} 
                  alt={nft.name}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <h3 className="text-lg font-semibold mb-2">{nft.name}</h3>
              <p className="text-gray-400 text-sm mb-2">Token ID: {nft.tokenId}</p>
              <p className="text-gray-400 text-sm mb-4">
                {nft.attributes?.find(attr => attr.trait_type === 'Rarity')?.value || 'Unknown Rarity'}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-yellow-400 font-bold">
                  {nft.price ? `${nft.price} ETH` : 'Not for sale'}
                </span>
                <button className="bg-pink-500 hover:bg-pink-600 px-4 py-2 rounded text-sm font-medium transition-colors">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
