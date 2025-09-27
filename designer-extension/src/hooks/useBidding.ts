import { useState } from 'react';
import { useActiveAccount, useSendTransaction } from 'thirdweb/react';
import { client } from '../lib/thirdweb';
import { bidInAuction, buyoutAuction } from 'thirdweb/extensions/marketplace';
import { toWei } from 'thirdweb';
import { base } from 'thirdweb/chains';

export function useBidding() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const account = useActiveAccount({ client });
  const { mutate: sendTransaction } = useSendTransaction();

  const placeBid = async (auctionId: string, bidAmount: string) => {
    if (!account?.address) {
      throw new Error('Please connect your wallet to place a bid');
    }

    setIsProcessing(true);
    setError(null);

    try {
      const bidAmountWei = toWei(bidAmount, 18);
      
      const transaction = bidInAuction({
        contract: {
          address: "0xF0f26455b9869d4A788191f6AEdc78410731072C", // Marketplace contract
          chain: base,
          client,
        },
        auctionId: BigInt(auctionId),
        bidAmount: bidAmountWei,
      });

      await sendTransaction(transaction);
      
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to place bid';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const buyNow = async (auctionId: string) => {
    if (!account?.address) {
      throw new Error('Please connect your wallet to buy now');
    }

    setIsProcessing(true);
    setError(null);

    try {
      const transaction = buyoutAuction({
        contract: {
          address: "0xF0f26455b9869d4A788191f6AEdc78410731072C", // Marketplace contract
          chain: base,
          client,
        },
        auctionId: BigInt(auctionId),
      });

      await sendTransaction(transaction);
      
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to buy now';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    placeBid,
    buyNow,
    isProcessing,
    error,
  };
}
