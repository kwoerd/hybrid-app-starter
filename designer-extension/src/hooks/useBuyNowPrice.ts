import { useState, useEffect } from "react";

interface UseBuyNowPriceParams {
  contractAddress: string;
  tokenId: string;
  chainId?: number;
}

export function useBuyNowPrice({ contractAddress, tokenId, chainId = 8453 }: UseBuyNowPriceParams) {
  const [buyNowPrice, setBuyNowPrice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only run in browser, not during SSR/build
    if (typeof window === "undefined") {
      return;
    }

    let cancelled = false;

    async function fetchBuyNowPrice() {
      try {
        setIsLoading(true);
        setError(null);

        // Use internal API endpoint for buy now price
        const response = await fetch(
          `/api/insight/buy-now?contract=${contractAddress}&tokenId=${tokenId}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch buy now price: ${response.statusText}`);
        }

        const data = await response.json();
        const price = data.buyNow;

        if (!cancelled) {
          setBuyNowPrice(price);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error fetching buy now price:", err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to fetch buy now price");
          setIsLoading(false);
        }
      }
    }

    fetchBuyNowPrice();

    // Poll every 15 seconds for real-time updates
    const interval = setInterval(fetchBuyNowPrice, 15000);
    
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [contractAddress, tokenId, chainId]);

  return { buyNowPrice, isLoading, error };
}