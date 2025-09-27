import { useState, useEffect } from "react";

interface UseCurrentBidParams {
  contractAddress: string;
  tokenId: string;
  auctionId?: string;
  chainId?: number;
}

export function useCurrentBid({ contractAddress, tokenId, auctionId, chainId = 8453 }: UseCurrentBidParams) {
  const [currentBid, setCurrentBid] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only run in browser, not during SSR/build
    if (typeof window === "undefined") {
      return;
    }

    let cancelled = false;

    async function fetchCurrentBid() {
      try {
        setIsLoading(true);
        setError(null);

        // Use internal API endpoint for current bid
        const url = auctionId 
          ? `/api/insight/current-bid?contract=${contractAddress}&tokenId=${tokenId}&auctionId=${auctionId}`
          : `/api/insight/current-bid?contract=${contractAddress}&tokenId=${tokenId}`;
        const response = await fetch(url);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Failed to fetch current bid: ${response.status} ${response.statusText} - ${errorData.error || 'Unknown error'}`);
        }

        const data = await response.json();
        const bidEth = data.highest;

        if (!cancelled) {
          setCurrentBid(bidEth);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error fetching current bid:", err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to fetch current bid");
          setIsLoading(false);
        }
      }
    }

    fetchCurrentBid();
    
    // Poll every 5 seconds for real-time updates
    const interval = setInterval(fetchCurrentBid, 5000);
    
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [contractAddress, tokenId, auctionId, chainId]);

  return { currentBid, isLoading, error };
}
