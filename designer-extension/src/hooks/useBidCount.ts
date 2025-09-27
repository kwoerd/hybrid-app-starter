import { useEffect, useState } from "react";

interface UseBidCountParams {
  contractAddress: string;
  tokenId: string;
  auctionId?: string;
  chainId?: number;
}

export function useBidCount({ contractAddress, tokenId, auctionId, chainId = 8453 }: UseBidCountParams) {
  const [bidCount, setBidCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only run in browser, not during SSR/build
    if (typeof window === "undefined") {
      return;
    }

    let cancelled = false;

    async function fetchCounts() {
      try {
        setIsLoading(true);
        setError(null);

        // Use internal API endpoint for bid count
        const url = auctionId 
          ? `/api/insight/bid-count?contract=${contractAddress}&tokenId=${tokenId}&auctionId=${auctionId}`
          : `/api/insight/bid-count?contract=${contractAddress}&tokenId=${tokenId}`;
        const response = await fetch(url);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Failed to fetch bid count: ${response.status} ${response.statusText} - ${errorData.error || 'Unknown error'}`);
        }

        const data = await response.json();
        const netBidCount = data.count || 0;

        if (!cancelled) {
          setBidCount(netBidCount);
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Error fetching bid count:", err);
          setError(err instanceof Error ? err.message : "Failed to fetch bid count");
          setIsLoading(false);
        }
      }
    }

    fetchCounts();

    // Poll every 5 seconds for updates
    const interval = setInterval(fetchCounts, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [contractAddress, tokenId, auctionId, chainId]);

  return { bidCount, isLoading, error };
}
