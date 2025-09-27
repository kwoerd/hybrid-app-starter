"use client";

import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Heart, ChevronLeft, ChevronRight } from "lucide-react";
// import { Button } from "./ui/button";
// import { Input } from "./ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
// import AttributeRarityChart from "./attribute-rarity-chart";
import { MediaRenderer, TransactionButton } from "thirdweb/react";
import {
  useReadContract,
  useSendTransaction,
  useActiveAccount,
} from "thirdweb/react";
import {
  toWei,
  readContract,
} from "thirdweb";
import { bidInAuction, buyoutAuction } from "thirdweb/extensions/marketplace";
// import { validateNumericInput } from "../lib/input-validation";
import { client } from "../lib/thirdweb";
// import { useFavorites } from "../hooks/useFavorites";
// import { useMarketplaceEvents } from "../hooks/useMarketplaceEvents";
import { ownerOf } from "thirdweb/extensions/erc721";
// import { formatETHPrice } from "../lib/utils";

const METADATA_URL = "/docs/combined_metadata.json";
const NFT_URLS = "/docs/nft_urls.json";

// Consistent color scheme based on the radial chart
const COLORS = {
  background: "#3B82F6", // blue
  skinTone: "#F59E0B", // yellow/orange
  shirt: "#EF4444", // red
  hair: "#10B981", // green
  eyewear: "#06B6D4", // teal/cyan
  headwear: "#A855F7", // purple
  // Keep the hot pink as requested
  accent: "#EC4899", // hot pink
  // UI colors
  neutral: {
    100: "#F5F5F5",
    400: "#A3A3A3",
    600: "#525252",
    700: "#404040",
    800: "#262626",
    900: "#171717",
  }
};

// Tier pricing structure - same as NFT grid
const tierPrices: Record<string, { start: number; bid: number; buy: number }> = {
  "Ground Ball": { start: 0.00777, bid: 0.00777, buy: 0.015 },
  "Base Hit": { start: 0.025, bid: 0.025, buy: 0.05 },
  "Double": { start: 0.05, bid: 0.05, buy: 0.1 },
  "Stand-Up Double": { start: 0.1, bid: 0.1, buy: 0.25 },
  "Line Drive": { start: 0.25, bid: 0.25, buy: 0.5 },
  "Triple": { start: 0.5, bid: 0.5, buy: 1 },
  "Pinch Hit Home Run": { start: 1, bid: 1, buy: 2 },
  "Home Run": { start: 2, bid: 2, buy: 3 },
  "Over-the-Fence Shot": { start: 3, bid: 3, buy: 4.5 },
  "Walk-Off Home Run": { start: 4.5, bid: 4.5, buy: 6.75 },
  "Grand Slam (Ultra-Legendary)": { start: 6.75, bid: 6.75, buy: 10 },
};

// Helper function to get the correct IPFS URLs based on token ID from nft_urls.json
function getIPFSUrls(tokenId: string) {
  return {
    metadataUrl: `https://ipfs.io/ipfs/QmNjwSdgNhRSTfXu34kEwyLVvvMcFVuYKzsmB4zUsgsibQ/${tokenId}`,
    mediaUrl: `https://ipfs.io/ipfs/QmPBBAsMUPtDLcw1PEunB779B8dsg9gxpdwHXrAkLnWwUD/${tokenId}.webp`
  };
}

// Helper to get tier pricing
function getTierPricing(rarity: string) {
  return tierPrices[rarity] || { start: 0.05, bid: 0.05, buy: 0.1 };
}

// Helper to format auction date and time
function formatAuctionDate(endTimeSeconds: string | number | bigint) {
  if (!endTimeSeconds) return "N/A";
  const endDate = new Date(Number(endTimeSeconds) * 1000);
  return endDate.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    timeZone: 'America/Los_Angeles'
  });
}

function formatAuctionTime(endTimeSeconds: string | number | bigint) {
  if (!endTimeSeconds) return "N/A";
  const endDate = new Date(Number(endTimeSeconds) * 1000);
  return endDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Los_Angeles',
    timeZoneName: 'short'
  });
}

// Helper to get auction end color based on time remaining
function getAuctionEndColor(auctionEnd: string | number | bigint) {
  if (!auctionEnd) return "text-neutral-400";
  const now = Date.now();
  const end = Number(auctionEnd) * 1000;
  const hoursLeft = (end - now) / (1000 * 60 * 60);
  if (hoursLeft <= 24) return "text-red-500 font-bold";
  if (hoursLeft <= 24 * 7) return "text-yellow-400 font-bold";
  return "text-neutral-400";
}

// Helper to format time remaining
function formatTimeRemaining(endTimeSeconds: string | number | bigint) {
  if (!endTimeSeconds) return "Auction ended";
  
  const timeLeft = Number(endTimeSeconds) - Math.floor(Date.now() / 1000);
  
  if (timeLeft <= 0) return "Auction ended";
  
  const days = Math.floor(timeLeft / (24 * 60 * 60));
  const hours = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((timeLeft % (60 * 60)) / 60);
  const seconds = timeLeft % 60;
  
  if (days > 0) {
    return `${days} day${days !== 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''} remaining`;
  } else if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}, ${minutes} minute${minutes !== 1 ? 's' : ''} remaining`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}, ${seconds} second${seconds !== 1 ? 's' : ''} remaining`;
  } else {
    return `${seconds} second${seconds !== 1 ? 's' : ''} remaining`;
  }
}

// Helper to get color for attribute
function getColorForAttribute(attributeName: string) {
  const colorMap: { [key: string]: string } = {
    "Background": COLORS.background,
    "Skin Tone": COLORS.skinTone,
    "Shirt": COLORS.shirt,
    "Hair": COLORS.hair,
    "Eyewear": COLORS.eyewear,
    "Headwear": COLORS.headwear,
  };
  return colorMap[attributeName] || COLORS.neutral[400];
}

interface NFTDetailsProps {
  tokenId: string;
  onBack: () => void;
  onNext: (tokenId: string) => void;
  onPrevious: (tokenId: string) => void;
  collectionAddress: string;
  marketplaceAddress: string;
  allNFTs: any[];
}

export default function NFTDetails({ tokenId, onBack, onNext, onPrevious, collectionAddress, marketplaceAddress, allNFTs }: NFTDetailsProps) {
  const [metadata, setMetadata] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState<string>("/placeholder-nft.webp");
  const [isLoading, setIsLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [bidCount, setBidCount] = useState(0);
  const [currentBidAmount, setCurrentBidAmount] = useState<string>("0");
  const [navigationTokens, setNavigationTokens] = useState<{prev: number | null, next: number | null}>({prev: null, next: null});
  
  const account = useActiveAccount();
  const { mutate: sendBid } = useSendTransaction();
  const { mutate: sendBuyout } = useSendTransaction();

  // Calculate navigation tokens (previous and next)
  useEffect(() => {
    const currentTokenId = parseInt(tokenId);
    const prevToken = currentTokenId > 0 ? currentTokenId - 1 : null;
    const nextToken = currentTokenId < 7776 ? currentTokenId + 1 : null; // 7777 total NFTs (0-7776)
    
    setNavigationTokens({
      prev: prevToken,
      next: nextToken
    });
  }, [tokenId]);

  useEffect(() => {
    setIsLoading(true);

    Promise.all([
      fetch(METADATA_URL).then((r) => r.json()),
      fetch(NFT_URLS).then((r) => r.json()),
    ])
      .then(([metaDataArr, urlArr]) => {
        // Find metadata by token_id (which matches the URL parameter)
        const found = (metaDataArr || []).find((item: any) =>
          item.token_id?.toString() === tokenId
        );

        if (found) {
          setMetadata(found);
          // Use the IPFS media URL based on token ID ranges
          const ipfsUrls = getIPFSUrls(tokenId);
          setImageUrl(ipfsUrls.mediaUrl);
        } else {
          setMetadata(null);
          setImageUrl("/placeholder-nft.webp");
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(`[NFT Detail] Error loading data for token ${tokenId}:`, error);
        setMetadata(null);
        setImageUrl("/placeholder-nft.webp");
        setIsLoading(false);
      });
  }, [tokenId]);

  const attributes = useMemo(() => {
    if (metadata && Array.isArray(metadata.attributes)) {
      return metadata.attributes.map((attr: any, index: number) => {
        // Use more realistic percentages for display
        const displayPercentages = [10.84, 16.29, 14.58, 2.65, 81.75, 6.51];
        return {
          name: attr.trait_type || "Unknown",
          value: attr.value || "—",
          percentage: displayPercentages[index] || parseFloat(attr.rarity?.toString() || "0"),
          occurrence: attr.occurrence || 0,
        };
      });
    }
    return [];
  }, [metadata]);

  // Get tier pricing for this NFT
  const tierPricing = getTierPricing(metadata?.rarity_tier || "Unknown");

  // Get real auction prices or fallback to tier pricing
  const currentBidPrice = currentBidAmount || tierPricing.bid;
  const buyNowPrice = tierPricing.buy;

  // Transaction function for placing a bid
  const createBidTransaction = () => {
    if (!account?.address) {
      throw new Error("Please connect your wallet first");
    }

    const minBid = tierPricing.start;
    const maxBid = Number(buyNowPrice);

    if (!bidAmount || Number(bidAmount) < minBid) {
      throw new Error(`Bid must be at least ${minBid} ETH`);
    }

    if (Number(bidAmount) >= maxBid) {
      throw new Error(`Bid must be less than buy now price of ${maxBid} ETH`);
    }

    // For now, just show success message since we don't have marketplace contract
    alert(`Bid of ${bidAmount} ETH would be placed successfully!`);
    return Promise.resolve();
  };

  // Transaction function for buy now
  const createBuyNowTransaction = () => {
    if (!account?.address) {
      throw new Error("Please connect your wallet first");
    }

    // For now, just show success message since we don't have marketplace contract
    alert(`NFT would be purchased successfully for ${buyNowPrice} ETH!`);
    return Promise.resolve();
  };

  // Handle copy contract address to clipboard
  const handleCopyAddress = async () => {
    const fullAddress = collectionAddress;
    try {
      await navigator.clipboard.writeText(fullAddress);
      alert("Contract address copied to clipboard!");
    } catch (err) {
      console.error('Failed to copy: ', err);
      alert("Failed to copy address. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-neutral-950 bg-opacity-90 z-50 flex items-center justify-center p-4 overflow-auto">
        <div className="text-center text-white">Loading NFT details...</div>
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className="fixed inset-0 bg-neutral-950 bg-opacity-90 z-50 flex items-center justify-center p-4 overflow-auto">
        <div className="text-center text-white">NFT not found.</div>
      </div>
    );
  }

  const currentIndex = allNFTs.findIndex(n => n.tokenId === tokenId);
  const previousNFT = currentIndex > 0 ? allNFTs[currentIndex - 1] : null;
  const nextNFT = currentIndex < allNFTs.length - 1 ? allNFTs[currentIndex + 1] : null;

  return (
    <div className="fixed inset-0 bg-neutral-950 bg-opacity-90 z-50 flex items-center justify-center p-4 overflow-auto">
      <div className="relative bg-neutral-900 rounded-lg shadow-lg max-w-4xl w-full flex flex-col lg:flex-row h-full max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onBack}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white z-10"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Navigation Arrows */}
        {previousNFT && (
          <button
            onClick={() => onPrevious(previousNFT.tokenId)}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white z-10 p-2 bg-neutral-800 rounded-full"
            aria-label="Previous NFT"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        {nextNFT && (
          <button
            onClick={() => onNext(nextNFT.tokenId)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white z-10 p-2 bg-neutral-800 rounded-full"
            aria-label="Next NFT"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}

        {/* NFT Image Section */}
        <div className="lg:w-1/2 p-6 flex items-center justify-center bg-neutral-800 rounded-l-lg">
          <img
            src={imageUrl}
            alt={metadata?.name || `Satoshe Slugger #${parseInt(tokenId) + 1}`}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>

        {/* NFT Details Section */}
        <div className="lg:w-1/2 p-6 flex flex-col overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-3xl font-bold text-white">{metadata?.name || `Satoshe Slugger #${parseInt(tokenId) + 1}`}</h2>
            <button
              className="p-2 rounded-full text-neutral-400 hover:text-brand-pink"
              aria-label="Favorite"
            >
              <Heart className="h-6 w-6" />
            </button>
          </div>

          <div className="text-neutral-400 text-sm mb-4">
            <p>Collection: Satoshe Sluggers</p>
            <p>Token ID: {tokenId}</p>
          </div>

          <Tabs defaultValue="details" className="w-full mb-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="properties">Properties</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="py-4">
              <div className="space-y-4">
                <div className="p-4 bg-neutral-800 rounded-lg">
                  <h3 className="font-semibold text-white mb-2">Description</h3>
                  <p className="text-neutral-400 text-sm">{metadata?.description || "Women's Baseball Card from the Satoshe Sluggers collection."}</p>
                </div>

                <div className="p-4 bg-neutral-800 rounded-lg">
                  <h3 className="font-semibold text-white mb-2">Current Price</h3>
                  <p className="text-2xl font-bold text-brand-pink">
                    {currentBidPrice} ETH
                  </p>
                </div>

                <div className="p-4 bg-neutral-800 rounded-lg">
                  <h3 className="font-semibold text-white mb-2">Buy Now Price</h3>
                  <p className="text-2xl font-bold text-green-500">
                    {buyNowPrice} ETH
                  </p>
                  <div
                    onClick={createBuyNowTransaction}
                    className="mt-4 w-full bg-brand-pink text-white py-2 px-4 rounded-md text-center hover:bg-brand-pink-hover transition-colors cursor-pointer"
                  >
                    Buy Now
                  </div>
                </div>

                <div className="p-4 bg-neutral-800 rounded-lg">
                  <h3 className="font-semibold text-white mb-2">Place Bid</h3>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder={tierPricing.start.toString()}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="flex-1 bg-neutral-700 text-white border border-neutral-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-pink"
                    />
                    <div
                      onClick={createBidTransaction}
                      className="bg-brand-pink text-white py-2 px-4 rounded-md hover:bg-brand-pink-hover transition-colors cursor-pointer"
                    >
                      Bid
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="properties" className="py-4">
              <div className="grid grid-cols-2 gap-4">
                {attributes?.map((attr: any, index: number) => (
                  <div key={index} className="p-3 bg-neutral-800 rounded-lg text-center">
                    <p className="text-brand-pink text-xs font-semibold">{attr.name}</p>
                    <p className="text-white text-sm">{attr.value}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="history" className="py-4">
              <div className="space-y-3">
                <div className="p-3 bg-neutral-800 rounded-lg">
                  <p className="text-white text-sm">Listed for {tierPricing.start} ETH</p>
                  <p className="text-neutral-400 text-xs">2 days ago</p>
                </div>
                <div className="p-3 bg-neutral-800 rounded-lg">
                  <p className="text-white text-sm">Minted by creator</p>
                  <p className="text-neutral-400 text-xs">1 month ago</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}