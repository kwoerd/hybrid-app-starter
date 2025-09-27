// components/nft-grid.tsx

"use client";

import { useState, useEffect, useMemo, useRef } from "react";
// import Link from "next/link";
// import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import Pagination from "./ui/pagination";
import { useActiveAccount, useWalletBalance, useSendTransaction, TransactionButton, useContractEvents } from "thirdweb/react";
import { useCallback } from "react";
// import { safeRpcCall } from "../lib/circuit-breaker";
// import { emergencySafeRpcCall } from "../lib/emergency-stop";
// import { cacheManager, CACHE_KEYS, CACHE_TTL, getCachedDataFromStorage, setCachedDataToStorage } from "../lib/cache-manager";
import { format } from "date-fns";
import { readContract } from "thirdweb";
import { bidInAuction, buyoutAuction, auctionClosedEvent } from "thirdweb/extensions/marketplace";
import { base } from "thirdweb/chains";
import { client } from "../lib/thirdweb";
// import { marketplace } from "../lib/contracts";
import { toWei } from "thirdweb";
import NFTCardWithRealtime from "./nft-card-with-realtime";
// import { track } from '@vercel/analytics';

// Utility to convert wei to ETH
function fromWei(wei: string | number | bigint): string {
  try {
    const value = BigInt(wei);
    const eth = Number(value) / 1e18;
    return eth.toLocaleString(undefined, { maximumFractionDigits: 6 });
  } catch {
    return "0";
  }
}

function getAuctionCountdown(auctionEnd: string | number | bigint) {
  if (!auctionEnd) return "Auction ended";

  const now = Date.now();
  const end = Number(auctionEnd) * 1000;
  const timeLeft = end - now;

  if (timeLeft <= 0) return "Auction ended";

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m remaining`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  } else {
    return `${minutes}m remaining`;
  }
}

function displayPrice(val: string | number | bigint) {
  if (!val || val === "0") {
    return "--";
  }
  if ((typeof val === "string" && /^\d{12,}$/.test(val)) || typeof val === "bigint") {
    try {
      const eth = Number(BigInt(val)) / 1e18;
      if (eth > 10000) {
        return "--";
      }
      return eth + " ETH";
    } catch {
      return "--";
    }
  }
  if (typeof val === "number" && val < 1e6) {
    return val + " ETH";
  }
  if (typeof val === "string" && /^\d*\.?\d+$/.test(val)) {
    return val + " ETH";
  }
  return "--";
}

const FALLBACK_IMAGE = "/placeholder-nft.webp";
const METADATA_URL = "/docs/combined_metadata.json";
const NFT_URLS = "/docs/nft_urls.json";

type NFTGridItem = {
  id: string;
  tokenId: string;
  name: string;
  image: string;
  bidPriceWei: string | number | bigint;
  currentBidWei: string | number | bigint;
  priceWei: string | number | bigint;
  auctionEnd: string | number | bigint;
  auctionStart: string | number | bigint;
  rank: number | string;
  rarity: string;
  rarityPercent: string | number;
  auctionId: bigint;
  numBids: number;
  isForSale: boolean;
  isCancelled: boolean;
  isSold: boolean;
  background?: string;
  skinTone?: string;
  shirt?: string;
  eyewear?: string;
  hair?: Record<string, string[]>;
  headwear?: Record<string, string[]>;
};

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

// Helper to determine if a value is likely wei (big number string)
const isWei = (val: any) => typeof val === "string" && /^[0-9]+$/.test(val) && val.length > 10;

interface NFTGridProps {
  searchTerm: string;
  searchMode: "exact" | "contains";
  selectedFilters: any;
  onFilteredCountChange?: (count: number) => void;
  onTraitCountsChange?: (counts: Record<string, Record<string, number>>) => void;
}

// Set the total number of NFTs in your collection
const TOTAL_NFTS = 7777;

// Cancelled/Expired Listings - DO NOT USE THESE LISTING IDS
const CANCELLED_LISTING_IDS = [0, 1, 2, 3, 4, 5, 6, 7782, 7783, 7784, 7785, 7786, 7787, 7788, 7796, 7797, 7798, 7799, 7800, 7801, 7802];

// Helper function to check if a listing ID is cancelled
const isCancelledListing = (listingId: string | number | bigint) => {
  return CANCELLED_LISTING_IDS.includes(Number(listingId));
};

// Helper to extract attribute value from metadata
function getAttribute(meta: any, traitType: string) {
  return meta?.attributes?.find((attr: any) => attr.trait_type === traitType)?.value;
}

// Helper to get all unique values for a trait type from metadata
function getUniqueTraitValues(metadata: any[], traitType: string) {
  const values = new Set<string>();
  (metadata || []).forEach((meta: any) => {
    const value = getAttribute(meta, traitType);
    if (value) values.add(value);
  });
  return Array.from(values).sort();
}

// After filtering, compute dynamic trait counts for every filterable option
function computeTraitCounts(nfts: NFTGridItem[], categories: string[]) {
  const counts: Record<string, Record<string, number>> = {};
  (categories || []).forEach(category => {
    counts[category] = {};
    (nfts || []).forEach(nft => {
      const value = (nft as any)[category];
      if (value) {
        if (!counts[category][value]) counts[category][value] = 0;
        counts[category][value]++;
      }
    });
  });
  return counts;
}

export default function NFTGrid({ searchTerm, searchMode, selectedFilters, onFilteredCountChange, onTraitCountsChange }: NFTGridProps) {
  const [activeView, setActiveView] = useState("forSale");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [sortBy, setSortBy] = useState("default");
  const [nfts, setNfts] = useState<NFTGridItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bidAmounts, setBidAmounts] = useState<{
    [id: string]: string;
  }>({});
  const [isProcessingBid, setIsProcessingBid] = useState<{
    [id: string]: boolean;
  }>({});
  const [isProcessingBuyNow, setIsProcessingBuyNow] = useState<{
    [id: string]: boolean;
  }>({});
  const [allMetadata, setAllMetadata] = useState<any[]>([]);
  const [imageUrlMap, setImageUrlMap] = useState<{ [tokenId: string]: string }>({});
  const [isMetadataLoaded, setIsMetadataLoaded] = useState(false);

  // Business metrics tracking
  const [sessionMetrics, setSessionMetrics] = useState(() => ({
    pageViews: 0,
    uniqueNFTsViewed: new Set<string>(),
    totalBidVolume: 0,
    totalPurchaseVolume: 0,
    sessionStartTime: Date.now()
  }));

  const account = useActiveAccount();
  // const { data: balance } = useWalletBalance({ client, address: account?.address, chain: base });

      // Create a more efficient approach: use static metadata and minimal auction data
  // Only fetch auction IDs and basic info, not full NFT metadata
  const [auctionMap, setAuctionMap] = useState<Map<number, any>>(new Map());
  const [soldNFTs, setSoldNFTs] = useState<Set<number>>(new Set());
  const [cancelledNFTs, setCancelledNFTs] = useState<Set<number>>(new Set());
  const [isLoadingAuctions, setIsLoadingAuctions] = useState(true);

        // Fetch real auction data from marketplace contract with batching
      useEffect(() => {
        const fetchAuctionData = async () => {
          try {
            setIsLoadingAuctions(true);

            // For now, just set empty auction data to avoid complex contract calls
            setAuctionMap(new Map());
            setIsLoadingAuctions(false);
          } catch (error) {
            console.error('[fetchAuctionData] Error:', error);
            setAuctionMap(new Map());
            setIsLoadingAuctions(false);
          }
        };

        fetchAuctionData();
      }, []); // Run once on mount
  const { mutate: sendBid } = useSendTransaction();
  const { mutate: sendBuyout } = useSendTransaction();

  // Listen for all auction events for real-time updates - TEMPORARILY DISABLED FOR FAST REFRESH DEBUGGING
  // const { data: auctionEvents } = useContractEvents({
  //   contract: marketplace,
  //   events: [auctionClosedEvent()],
  // });
  const auctionEvents = null;

  // Load sold NFTs from localStorage on mount
  useEffect(() => {
    const savedSoldNFTs = localStorage.getItem('sold-nfts');
    if (savedSoldNFTs) {
      try {
        const soldArray = JSON.parse(savedSoldNFTs);
        setSoldNFTs(new Set(soldArray));
      } catch (error) {
        console.warn('Failed to load sold NFTs from localStorage:', error);
      }
    }
  }, []);

  // Save sold NFTs to localStorage whenever it changes
  useEffect(() => {
    if (soldNFTs.size > 0) {
      localStorage.setItem('sold-nfts', JSON.stringify(Array.from(soldNFTs)));
    }
  }, [soldNFTs]);

  // Real-time sync: Handle all auction events for live updates
  useEffect(() => {
    if (!auctionEvents || !Array.isArray(auctionEvents) || (auctionEvents as any[]).length === 0) return;
    
    let updated = false;
    const newAuctionMap = new Map(auctionMap);
    const newSoldNFTs = new Set(soldNFTs);
    
    // Process each event for real-time updates
    ((auctionEvents as any[]) || []).forEach((event: any) => {
      const tokenId = Number(event.args.tokenId);
      if (tokenId === undefined) return;
      
      if (event.eventName === "AuctionClosed") {
        // Mark NFT as sold
        newSoldNFTs.add(tokenId);
        if (newAuctionMap.has(tokenId)) {
          const auction = newAuctionMap.get(tokenId);
          newAuctionMap.set(tokenId, { ...auction, status: 0 }); // 0 = closed
        }
        updated = true;
      }
      
      
    });
    
    // Update state only if there were changes
    if (updated) {
      setAuctionMap(newAuctionMap);
      setSoldNFTs(newSoldNFTs);
    }
  }, [auctionEvents]);

    useEffect(() => {
    // Load all static metadata and image URLs from local JSON files
    Promise.all([
      fetch(METADATA_URL).then((r) => {
        return r.json();
      }),
      fetch(NFT_URLS).then((r) => {
        return r.json();
      })
    ])
      .then(([metadataData, urlData]) => {

        // Use all metadata from combined_metadata.json
        const allMetadataItems = metadataData || [];
        const allUrlItems = urlData || [];


        // Set metadata
        setAllMetadata(allMetadataItems);

        // Create image URL map from nft_urls.json
        const map: { [tokenId: string]: string } = {};
        (allUrlItems || []).forEach((item: any) => {
          if (item.TokenID !== undefined && item["Media URL"]) {
            map[item.TokenID.toString()] = item["Media URL"];
          }
        });
        setImageUrlMap(map);
        setIsMetadataLoaded(true);
      })
      .catch((error) => {
        console.error("Error loading metadata:", error);
        setAllMetadata([]);
        setImageUrlMap({});
        setIsMetadataLoaded(true);
      });
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, searchTerm, selectedFilters]);

    // Track session and page performance metrics (optimized - only track on significant changes)
  useEffect(() => {
    // Only track page views, not on every filter change
    setSessionMetrics(prev => ({ ...prev, pageViews: prev.pageViews + 1 }));
  }, [activeView]); // Only track when view changes

  // Track marketplace performance metrics (separate, less frequent)
  useEffect(() => {
    if (nfts && Array.isArray(nfts) && nfts.length > 0) {
      const totalListings = nfts?.length || 0;
      const nftsWithBids = (nfts || []).filter(nft => nft.numBids > 0).length;
      const averagePrice = (nfts || []).reduce((sum, nft) => sum + (Number(nft.priceWei) / 1e18), 0) / totalListings;
      const totalBids = (nfts || []).reduce((sum, nft) => sum + nft.numBids, 0);
      const rarityDist = (nfts || []).reduce((acc, nft) => {
        acc[nft.rarity] = (acc[nft.rarity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Track analytics (commented out for now)
      // track('Marketplace Performance', {
      //   totalActiveListings: totalListings,
      //   nftsWithBids,
      //   bidToListingRatio: ((nftsWithBids / totalListings) * 100).toFixed(1),
      //   averagePriceETH: averagePrice.toFixed(4),
      //   totalActiveBids: totalBids,
      //   averageBidsPerNFT: (totalBids / totalListings).toFixed(2),
      //   legendaryCount: rarityDist['Legendary'] || 0,
      //   mythicCount: rarityDist['Mythic'] || 0,
      //   epicCount: rarityDist['Epic'] || 0,
      //   rareCount: rarityDist['Rare'] || 0,
      //   uncommonCount: rarityDist['Uncommon'] || 0,
      //   commonCount: rarityDist['Common'] || 0
      // });
    }
  }, [nfts?.length || 0]); // Only track when NFT count changes significantly

  // Track session summary when component unmounts or user leaves
  useEffect(() => {
    const handleBeforeUnload = () => {
      const sessionDuration = Math.floor((Date.now() - sessionMetrics.sessionStartTime) / 1000);

      // Track analytics (commented out for now)
      // track('Session Summary', {
      //   sessionDurationSeconds: sessionDuration,
      //   sessionDurationMinutes: Math.floor(sessionDuration / 60),
      //   totalPageViews: sessionMetrics.pageViews,
      //   uniqueNFTsViewed: sessionMetrics.uniqueNFTsViewed.size,
      //   totalBidVolumeETH: sessionMetrics.totalBidVolume,
      //   totalPurchaseVolumeETH: sessionMetrics.totalPurchaseVolume,
      //   totalTransactionVolumeETH: sessionMetrics.totalBidVolume + sessionMetrics.totalPurchaseVolume,
      //   engagementRate: sessionMetrics.uniqueNFTsViewed.size > 0 ?
      //     ((sessionMetrics.totalBidVolume + sessionMetrics.totalPurchaseVolume) / sessionMetrics.uniqueNFTsViewed.size).toFixed(4) : '0',
      //   averageTimePerNFT: sessionMetrics.uniqueNFTsViewed.size > 0 ?
      //     (sessionDuration / sessionMetrics.uniqueNFTsViewed.size).toFixed(1) : '0'
      // });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Also track on component unmount
      handleBeforeUnload();
    };
  }, []); // Empty dependency array since we only want this to run once

  // Load NFTs when essential data changes - moved logic directly into useEffect to prevent re-renders
  useEffect(() => {
    // Only load if we have all required data
    if (!isMetadataLoaded || isLoadingAuctions || !imageUrlMap || Object.keys(imageUrlMap).length === 0) {
      return;
    }

    setIsLoading(true);

    try {
      // Map ALL metadata for NFTs - show entire collection
      // Apply auction data when available, show "Not for Sale" when not
      // Filter out cancelled/expired listings from being considered "for sale"
      const mappedNFTs: NFTGridItem[] = (allMetadata && Array.isArray(allMetadata) ? allMetadata : [])
        .map((meta: any) => {
          const tokenId = meta.token_id?.toString() || "";
          const auction = auctionMap.get(Number(tokenId));
          
          
          
          
          // Use image URL from nft_urls.json, fallback to placeholder
          const imageUrl = imageUrlMap[tokenId] || FALLBACK_IMAGE;

          // Extract static content from combined_metadata.json
          const name = meta.name || `Satoshe Slugger #${parseInt(tokenId) + 1}`;
          const rank = meta.rank ?? "—";
          const rarityPercent = meta.rarity_percent ?? "--";
          const rarity = meta.rarity_tier ?? "Unknown";
          const numBids = auction?.totalBids ?? auction?.bidsCount ?? 0;
          const auctionStart = auction?.startTimeInSeconds ?? 0;

          return {
            id: tokenId,
            tokenId,
            name,
            image: imageUrl,
            bidPriceWei:
              auction?.startingPrice && auction.startingPrice !== "0"
                ? auction.startingPrice
                : auction?.minimumBidAmount && auction.minimumBidAmount !== "0"
                ? auction.minimumBidAmount
                : "0",
            currentBidWei:
              auction?.currentBidAmount && auction.currentBidAmount !== "0"
                ? auction.currentBidAmount
                : auction?.minimumBidAmount && auction.minimumBidAmount !== "0"
                ? auction.minimumBidAmount
                : auction?.startingPrice && auction.startingPrice !== "0"
                ? auction.startingPrice
                : "0",
            priceWei:
              auction?.buyoutAmount && auction.buyoutAmount !== "0"
                ? auction.buyoutAmount
                : auction?.buyNowPrice && auction.buyNowPrice !== "0"
                ? auction.buyNowPrice
                : auction?.price && auction.price !== "0"
                ? auction.price
                : "0",
             // Add flag to indicate if NFT is for sale (exclude cancelled and sold listings)
             isForSale: !!auction && auction.status === 1 && !isCancelledListing(auction?.auctionId) && !soldNFTs.has(Number(tokenId)),
             // Add flag to indicate if NFT listing was cancelled
             isCancelled: !!auction && isCancelledListing(auction?.auctionId),
             // Add flag to indicate if NFT was sold
             isSold: soldNFTs.has(Number(tokenId)),
            auctionEnd: auction?.endTimeInSeconds ?? "",
            auctionStart,
            rank,
            rarity,
            rarityPercent,
            auctionId: auction?.auctionId ? (typeof auction.auctionId === 'bigint' ? auction.auctionId : BigInt(auction.auctionId)) : BigInt(0),
            numBids,
            // Extract attribute values from metadata for filtering
            background: getAttribute(meta, "Background"),
            skinTone: getAttribute(meta, "Skin Tone"),
            shirt: getAttribute(meta, "Shirt"),
            eyewear: getAttribute(meta, "Eyewear"),
            hair: getAttribute(meta, "Hair"),
            headwear: getAttribute(meta, "Headwear"),
          };
        });
        

      
      setNfts(mappedNFTs);
      // Set bid amounts (default to minimum bid, format as ETH)
      const initialBids: { [id: string]: string } = {};
      (mappedNFTs || []).forEach((nft) => {
        initialBids[nft.id] = ""; // Always use empty string by default
      });
      setBidAmounts(initialBids);
      
      // Only set loading to false when we have successfully processed the data
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading NFTs:", error);
      setNfts([]);
      setIsLoading(false);
    }
  }, [isMetadataLoaded, isLoadingAuctions, imageUrlMap, allMetadata, auctionMap, soldNFTs]);



  // Time formatting
  const formatAuctionDate = (
    endTimeSeconds: string | number | bigint,
  ) => {
    if (!endTimeSeconds) return "N/A";
    const endDate = new Date(Number(endTimeSeconds) * 1000);
    return format(endDate, "MM/dd/yyyy");
  };
  const formatAuctionTime = (
    endTimeSeconds: string | number | bigint,
  ) => {
    if (!endTimeSeconds) return "N/A";
    const endDate = new Date(Number(endTimeSeconds) * 1000);
    return format(endDate, "h:mm a 'PT'");
  };

  const handleBidAmountChange = (
    id: string,
    value: string,
  ) => {
    setBidAmounts((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handlePlaceBid = async (nft: NFTGridItem) => {
    if (!account?.address) {
      alert("Please connect your wallet first");
      return;
    }
    setIsProcessingBid((prev) => ({ ...prev, [nft.id]: true }));
    try {
      // Let Thirdweb handle validation - just get the bid amount
      const amount = bidAmounts[nft.id] || fromWei(nft.bidPriceWei);
      
      // Get the real auction data
      const auction = auctionMap.get(Number(nft.tokenId));
      if (!auction) {
        alert("No active auction found for this NFT");
        setIsProcessingBid((prev) => ({ ...prev, [nft.id]: false }));
        return;
      }

      const bidAmountWei = toWei(amount);
      const buyoutWei = auction.buyoutAmount;
      const minimumBidWei = auction.minimumBidAmount;

      // For now, just show success message since we don't have marketplace contract
      alert("Bid placed successfully!");
    } catch (error) {
      console.error("Error placing bid:", error);
      alert("Failed to place bid. Please try again.");
    } finally {
      setIsProcessingBid((prev) => ({ ...prev, [nft.id]: false }));
    }
  };

  const handleBuyNow = async (nft: NFTGridItem) => {
    if (!account?.address) {
      alert("Please connect your wallet first");
      return;
    }
    setIsProcessingBuyNow((prev) => ({ ...prev, [nft.id]: true }));
    try {
      // Get the real auction data
      const auction = auctionMap.get(Number(nft.tokenId));
      if (!auction) {
        alert("No active auction found for this NFT");
        setIsProcessingBid((prev) => ({ ...prev, [nft.id]: false }));
        return;
      }

      // For now, just show success message since we don't have marketplace contract
      alert("NFT purchased successfully!");
    } catch (error) {
      console.error("Error buying NFT:", error);
      alert("Failed to buy NFT. Please try again.");
    } finally {
      setIsProcessingBuyNow((prev) => ({ ...prev, [nft.id]: false }));
    }
  };

  // Before sorting and paginating, filter nfts:
  const filteredNFTs = (nfts || []).filter(nft => {
    // Search by name or tokenId based on search mode
    let matchesSearch = false;
    
    if (searchMode === "exact") {
      // Exact mode: match exact token ID, NFT number, or exact name
      const nftNumber = (parseInt(nft.tokenId) + 1).toString(); // NFT number is token ID + 1
      matchesSearch = 
        nft.tokenId.toString() === searchTerm ||
        nftNumber === searchTerm ||
        nft.name.toLowerCase() === searchTerm.toLowerCase();
    } else {
      // Contains mode: match partial token ID or name (original behavior)
      matchesSearch =
        nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nft.tokenId.toString().includes(searchTerm);
    }

  // View filter (Live vs Sold) - proper handling of different NFT states
  // In exact search mode, show matching NFTs regardless of sale status for better UX
  const matchesView = searchMode === "exact" && searchTerm 
    ? (nft.isForSale || nft.isSold) // Show both live and sold when searching exactly
    : activeView === "forSale" 
      ? nft.isForSale 
      : nft.isSold;
    

    // Rarity filter
    const matchesRarity =
      !selectedFilters.rarity ||
      !Array.isArray(selectedFilters.rarity) ||
      !selectedFilters.rarity || selectedFilters.rarity.length === 0 ||
      
      selectedFilters.rarity.includes(nft.rarity);

    // Background filter
    const matchesBackground =
      !selectedFilters.background ||
      !Array.isArray(selectedFilters.background) ||
      !selectedFilters.background || selectedFilters.background.length === 0 ||
      selectedFilters.background.includes(nft.background);

    // Skin Tone filter
    const matchesSkinTone =
      !selectedFilters.skinTone ||
      !Array.isArray(selectedFilters.skinTone) ||
      !selectedFilters.skinTone || selectedFilters.skinTone.length === 0 ||
      selectedFilters.skinTone.includes(nft.skinTone);

    // Shirt filter
    const matchesShirt =
      !selectedFilters.shirt ||
      !Array.isArray(selectedFilters.shirt) ||
      !selectedFilters.shirt || selectedFilters.shirt.length === 0 ||
      selectedFilters.shirt.includes(nft.shirt);

        // Eyewear filter
    const matchesEyewear =
      !selectedFilters.eyewear ||
      !Array.isArray(selectedFilters.eyewear) ||
      !selectedFilters.eyewear || selectedFilters.eyewear.length === 0 ||
      selectedFilters.eyewear.includes(nft.eyewear);

    // Hair filter (subcategory + color logic)
    const hairFilters = selectedFilters.hair || {};
    const hairSubcats = Object.keys(hairFilters);
    const matchesHair =
      !hairSubcats || hairSubcats.length === 0 ||
      hairSubcats.some(subcat => {
        const colors = hairFilters[subcat];
        const nftHair = nft.hair ? String(nft.hair) : "";
        if (!nftHair) return false;
        if (!colors || !Array.isArray(colors) || colors.length === 0) {
          // Match any variant of the subcategory (e.g., 'Ponytail ...')
          return nftHair.startsWith(subcat);
        } else {
          return (colors as string[]).some((color: string) => nftHair === `${subcat} ${color}`);
        }
      });

    // Headwear filter (subcategory + color logic)
    const headwearFilters = selectedFilters.headwear || {};
    const headwearSubcats = Object.keys(headwearFilters);
    const matchesHeadwear =
      !headwearSubcats || headwearSubcats.length === 0 ||
      headwearSubcats.some(subcat => {
        const colors = headwearFilters[subcat];
        const nftHeadwear = nft.headwear ? String(nft.headwear) : "";
        if (!nftHeadwear) return false;
        if (!colors || !Array.isArray(colors) || colors.length === 0) {
          return nftHeadwear.startsWith(subcat);
        } else {
          return (colors as string[]).some((color: string) => nftHeadwear === `${subcat} ${color}`);
        }
      });

    return (
      matchesSearch &&
      matchesView &&
      matchesRarity &&
      matchesBackground &&
      matchesSkinTone &&
      matchesShirt &&
      matchesEyewear &&
      matchesHair &&
      matchesHeadwear
    );
  });
  // Then sort and paginate filteredNFTs
  const sortedNFTs = [...filteredNFTs].sort((a, b) => {
    switch (sortBy) {
      case "rank-asc":
        return Number(a.rank) - Number(b.rank);
      case "rank-desc":
        return Number(b.rank) - Number(a.rank);
      case "price-asc":
        return Number(a.priceWei) - Number(b.priceWei);
      case "price-desc":
        return Number(b.priceWei) - Number(a.priceWei);
      case "ending-soonest":
        // Sort by auction end time ascending (soonest first)
        return Number(a.auctionEnd ?? 0) - Number(b.auctionEnd ?? 0);
      default:
        return 0;
    }
  });

      // Apply proper pagination to the sorted and filtered results
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = itemsPerPage === 100000 ? (sortedNFTs?.length || 0) : startIndex + itemsPerPage;
  const paginatedNFTs = (sortedNFTs || []).slice(startIndex, endIndex);

  // Calculate total pages based on filtered results
  const totalFilteredPages = itemsPerPage === 100000
    ? 1 // When "View All" is selected, always show 1 page
    : Math.ceil((sortedNFTs?.length || 0) / itemsPerPage) || 1;

  // Reset to page 1 if current page exceeds total pages
  useEffect(() => {
    if (currentPage > totalFilteredPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalFilteredPages]);

  // After filteredNFTs is computed:
  const traitCounts = useMemo(() => {
    return computeTraitCounts(filteredNFTs, ["background", "skinTone", "shirt", "eyewear", "hair", "headwear", "rarity"]);
  }, [filteredNFTs]);

  // Use refs to track previous values and prevent unnecessary updates
  const prevFilteredCountRef = useRef<number>(0);
  const prevTraitCountsRef = useRef<Record<string, Record<string, number>>>({});

  // Notify parent of filtered count changes
  useEffect(() => {
    if (onFilteredCountChange && (filteredNFTs?.length || 0) !== prevFilteredCountRef.current) {
      prevFilteredCountRef.current = filteredNFTs?.length || 0;
      onFilteredCountChange(filteredNFTs?.length || 0);
    }
  }, [filteredNFTs?.length, onFilteredCountChange]);

  // Notify parent of trait counts changes
  useEffect(() => {
    if (onTraitCountsChange) {
      // Deep comparison to check if trait counts actually changed
      const traitCountsString = JSON.stringify(traitCounts);
      const prevTraitCountsString = JSON.stringify(prevTraitCountsRef.current);

      if (traitCountsString !== prevTraitCountsString) {
        prevTraitCountsRef.current = traitCounts;
        onTraitCountsChange(traitCounts);
      }
    }
  }, [traitCounts, onTraitCountsChange]);

  // Debug logging removed to prevent errors



  if (isLoading) {
    // Show pulsating placeholder NFTs while loading
    return (
      <div className="w-full max-w-full">
        <div className="mb-6">
          <div className="mb-4">
            <h2 className="text-lg font-medium" style={{ color: "#fffbeb" }}>NFT Collection</h2>
            <div className="text-sm font-medium text-brand-pink mt-1">Loading...</div>
          </div>
        </div>
        <div className="mt-8 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 justify-between">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="bg-neutral-800 rounded p-4 animate-pulse">
              <div className="aspect-square bg-neutral-700 rounded mb-3"></div>
              <div className="h-4 bg-neutral-700 rounded mb-2"></div>
              <div className="h-3 bg-neutral-700 rounded mb-1"></div>
              <div className="h-3 bg-neutral-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={1}
          totalItems={0}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>
    );
  }

  // Calculate counts for active and sold NFTs
  const activeCount = (nfts || []).filter(nft => nft.isForSale).length;
  const soldCount = (nfts || []).filter(nft => nft.isSold).length;

  return (
    <div className="w-full max-w-full">
      <div className="mb-6">
        <div className="mb-4">
          <h2 className="text-lg font-medium" style={{ color: "#fffbeb" }}>
            NFT Collection
          </h2>
          <div className="mt-1">
            <div className="text-xs font-medium" style={{ color: "#10b981" }}>
              {activeCount} Active
            </div>
            <div className="text-xs font-medium" style={{ color: "#3b82f6" }}>
              {soldCount} Sold
            </div>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex bg-neutral-800 rounded p-1">
            <button
              className={`px-3 py-1 text-sm rounded transition-colors ${
                activeView === "forSale"
                  ? "bg-brand-pink text-white"
                  : "hover:text-[#ff0099]"
              }`}
              onClick={() => setActiveView("forSale")}
            >
              Live
            </button>
            <button
              className={`px-3 py-1 text-sm rounded transition-colors ${
                activeView === "sold"
                  ? "bg-brand-pink text-white"
                  : "hover:text-[#ff0099]"
              }`}
              onClick={() => setActiveView("sold")}
            >
              Sold
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-sm w-16 flex-shrink-0 sm:w-16" style={{ color: "#fffbeb" }}>
              Sort by:
            </span>
            <Select
              value={sortBy}
              onValueChange={(value) => {
                // Track analytics (commented out for now)
                // track('NFT Sort Changed', {
                //   sortBy: value,
                //   previousSort: sortBy,
                //   totalNFTs: nfts?.length || 0,
                //   activeView
                // });
                setSortBy(value);
              }}
            >
              <SelectTrigger className="w-[180px] h-9 text-sm rounded" style={{ color: "#fffbeb" }}>
                <SelectValue placeholder="Default" />
              </SelectTrigger>
              <SelectContent className="text-sm rounded">
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="rank-asc">Rank: Low to High</SelectItem>
                <SelectItem value="rank-desc">Rank: High to Low</SelectItem>
                <SelectItem value="ending-soonest">Ending Soonest</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm w-12 flex-shrink-0 sm:w-12" style={{ color: "#fffbeb" }}>
              Show:
            </span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(val) => {
                const newValue = Number.parseInt(val);
                // Track analytics (commented out for now)
                // track('Items Per Page Changed', {
                //   itemsPerPage: newValue,
                //   previousItemsPerPage: itemsPerPage,
                //   totalNFTs: nfts?.length || 0,
                //   activeView
                // });
                setItemsPerPage(newValue);
              }}
            >
              <SelectTrigger className="w-[110px] h-9 text-sm rounded" style={{ color: "#fffbeb" }}>
                <SelectValue placeholder="12 items" />
              </SelectTrigger>
              <SelectContent className="text-sm rounded">
                <SelectItem value="12">12 items</SelectItem>
                <SelectItem value="25">25 items</SelectItem>
                <SelectItem value="50">50 items</SelectItem>
                <SelectItem value="100">100 items</SelectItem>
                <SelectItem value="250">250 items</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          
        </div>
      </div>
      {/* Only render the grid if there are NFTs, otherwise show empty state */}
      {(paginatedNFTs?.length || 0) > 0 ? (
        <div className="mt-8 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 justify-between">
          {paginatedNFTs.map((nft) => {
            const bidPriceFormatted = displayPrice(nft.bidPriceWei);
            const currentBidFormatted = displayPrice(nft.currentBidWei);
            const buyNowFormatted = displayPrice(nft.priceWei);

            return (
              <div key={nft.id}>
                <NFTCardWithRealtime
                  image={nft.image}
                  name={nft.name}
                  rank={nft.rank}
                  rarity={nft.rarity}
                  rarityPercent={nft.rarityPercent}
                  startingPrice={displayPrice(nft.bidPriceWei)}
                  currentBid={currentBidFormatted}
                  buyNow={buyNowFormatted}
                  tokenId={nft.tokenId}
                  auctionEnd={nft.auctionEnd}
                  numBids={nft.numBids ?? 0}
                  activeView="forSale"
                  bidAmount={bidAmounts[nft.id]}
                  isProcessingBuyNow={isProcessingBuyNow[nft.id]}
                  isForSale={nft.isForSale}
                  auctionId={nft.auctionId.toString()}
                  onBidAmountChange={(id, value) => handleBidAmountChange(nft.id, value)}
                  onBid={() => handlePlaceBid(nft)}
                  onBuyNow={() => handleBuyNow(nft)}
                  buyNowValue={Number(nft.priceWei) / 1e18}
                  buyNowWei={nft.priceWei?.toString()}
                  minimumBidWei={nft.bidPriceWei?.toString()}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-lg mb-2" style={{ color: "#fffbeb" }}>No NFTs found</div>
          <div className="text-neutral-500 text-sm">
            {searchTerm
              ? `No NFTs match "${searchTerm}"`
              : "Try adjusting your filters or check back later"}
          </div>
        </div>
      )}
      <Pagination
        key={`pagination-${activeView}-${filteredNFTs?.length || 0}`}
        currentPage={currentPage}
        totalPages={totalFilteredPages}
        totalItems={filteredNFTs?.length || 0}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
      </div>
    </div>
  );
}