"use client";

import { useBidCount } from "../hooks/useBidCount";
import { useCurrentBid } from "../hooks/useCurrentBid";
import { useBuyNowPrice } from "../hooks/useBuyNowPrice";
import { marketplace } from "../lib/contracts";
import NFTCard from "./nft-card";

interface NFTCardWithRealtimeProps {
  // Static props from combined_metadata.json
  image: string;
  name: string;
  rank: string | number;
  rarity: string;
  rarityPercent: string | number;
  tier?: string;
  startingPrice: string;
  buyNow: string;
  tokenId: string;
  auctionEnd?: string | number | bigint;
  numBids: number; // This will be overridden by real-time data
  activeView: string;
  bidAmount: string;
  isProcessingBuyNow: boolean;
  isForSale: boolean;
  currentBid?: string;
  auctionId?: string | number | bigint;
  
  // Purchase handlers (from parent/page)
  onBid: (bidAmount: string) => void;
  onBuyNow: () => void;
  onBidAmountChange: (tokenId: string, amount: string) => void;
  buyNowValue?: number;
  buyNowWei?: string;
  minimumBidWei?: string;
}

export default function NFTCardWithRealtime(props: NFTCardWithRealtimeProps) {
  // TEMPORARY FIX: Map token ID 0 to auction ID 7803
  const actualAuctionId = props.tokenId === "0" && (!props.auctionId || props.auctionId === "0" || props.auctionId === 0n) 
    ? "7803" 
    : props.auctionId?.toString();
  

  // Get real-time bid count from contract
  const { bidCount: realBidCount, isLoading: bidCountLoading } = useBidCount({
    contractAddress: marketplace.address,
    tokenId: props.tokenId,
    auctionId: actualAuctionId
  });

  // Get real-time current bid from contract
  const { currentBid: realCurrentBid, isLoading: currentBidLoading } = useCurrentBid({
    contractAddress: marketplace.address,
    tokenId: props.tokenId,
    auctionId: actualAuctionId
  });

  // Get real-time buy now price from contract - TEMPORARILY DISABLED FOR BUILD DEBUGGING
  // const { buyNowPrice: realBuyNowPrice, isLoading: buyNowLoading } = useBuyNowPrice({
  //   contractAddress: marketplace.address,
  //   tokenId: props.tokenId
  // });

  // Use real-time data, fallback to props if loading
  const numBids = bidCountLoading ? (props.numBids ?? 0) : (realBidCount ?? 0);
  const currentBid = currentBidLoading ? props.currentBid : (realCurrentBid ?? undefined);
  const buyNow = props.buyNow; // TEMPORARILY USE PROPS FOR BUILD DEBUGGING

  return (
    <NFTCard
      {...props}
      numBids={numBids}
      currentBid={currentBid}
      buyNow={buyNow}
    />
  );
}
