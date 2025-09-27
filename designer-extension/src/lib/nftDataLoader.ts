import { NFTData } from '../components/nft/NFTGrid';

// We'll fetch the NFT data instead of importing JSON directly

export interface LoadedNFTData {
  nfts: NFTData[];
  isLoading: boolean;
  error?: string;
}

export class NFTDataLoader {
  private static instance: NFTDataLoader;
  private nfts: NFTData[] = [];
  private isLoading = false;
  private error?: string;

  private constructor() {}

  public static getInstance(): NFTDataLoader {
    if (!NFTDataLoader.instance) {
      NFTDataLoader.instance = new NFTDataLoader();
    }
    return NFTDataLoader.instance;
  }

  public async loadNFTs(): Promise<LoadedNFTData> {
    if (this.nfts.length > 0) {
      return { nfts: this.nfts, isLoading: false };
    }

    this.isLoading = true;
    this.error = undefined;

    try {
      // Fetch the NFT data from the public directory
      const [metadataResponse, urlsResponse] = await Promise.all([
        fetch('/combined_metadata.json'),
        fetch('/nft_urls.json')
      ]);

      if (!metadataResponse.ok || !urlsResponse.ok) {
        throw new Error('Failed to fetch NFT data');
      }

      const combinedMetadata = await metadataResponse.json();
      const nftUrls = await urlsResponse.json();

      // Create image URL map from nft_urls.json
      const imageUrlMap: { [tokenId: string]: string } = {};
      (nftUrls as any[]).forEach((item: any) => {
        if (item.TokenID !== undefined && item["Media URL"]) {
          imageUrlMap[item.TokenID.toString()] = item["Media URL"];
        }
      });

      // Map metadata to NFTData format
      const mappedNFTs: NFTData[] = (combinedMetadata as any[]).map((meta: any) => {
        const tokenId = meta.token_id?.toString() || "";
        const imageUrl = imageUrlMap[tokenId] || "/placeholder-nft.webp";
        
        return {
          id: tokenId,
          tokenId,
          name: meta.name || `Satoshe Slugger #${parseInt(tokenId) + 1}`,
          image: imageUrl,
          rank: meta.rank ?? "—",
          rarity: meta.rarity_tier ?? "Unknown",
          rarityPercent: meta.rarity_percent ?? "--",
          startingPrice: "0.01 ETH", // Default starting price
          currentBid: "0.01 ETH", // Default current bid
          buyNow: "0.05 ETH", // Default buy now price
          auctionEnd: undefined,
          numBids: 0,
          isForSale: true, // Default to for sale
          auctionId: undefined,
          buyNowValue: 0.05,
          buyNowWei: "50000000000000000", // 0.05 ETH in wei
          minimumBidWei: "10000000000000000", // 0.01 ETH in wei
        };
      });

      this.nfts = mappedNFTs;
      this.isLoading = false;

      return { nfts: this.nfts, isLoading: false };
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Failed to load NFT data';
      this.isLoading = false;
      return { nfts: [], isLoading: false, error: this.error };
    }
  }

  public getNFTs(): NFTData[] {
    return this.nfts;
  }

  public getLoadingState(): boolean {
    return this.isLoading;
  }

  public getError(): string | undefined {
    return this.error;
  }

  public clearCache(): void {
    this.nfts = [];
    this.error = undefined;
  }
}

// Export a singleton instance
export const nftDataLoader = NFTDataLoader.getInstance();

// Helper function to load NFTs with error handling
export async function loadNFTData(): Promise<LoadedNFTData> {
  try {
    return await nftDataLoader.loadNFTs();
  } catch (error) {
    console.error('Failed to load NFT data:', error);
    return {
      nfts: [],
      isLoading: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Helper function to get NFT by token ID
export function getNFTByTokenId(tokenId: string): NFTData | undefined {
  return nftDataLoader.getNFTs().find(nft => nft.tokenId === tokenId);
}

// Helper function to search NFTs
export function searchNFTs(query: string, nfts: NFTData[]): NFTData[] {
  if (!query.trim()) return nfts;
  
  const lowercaseQuery = query.toLowerCase();
  return nfts.filter(nft => 
    nft.name.toLowerCase().includes(lowercaseQuery) ||
    nft.tokenId.includes(query) ||
    nft.rarity.toLowerCase().includes(lowercaseQuery)
  );
}

// Helper function to filter NFTs by rarity
export function filterNFTsByRarity(nfts: NFTData[], rarities: string[]): NFTData[] {
  if (rarities.length === 0) return nfts;
  return nfts.filter(nft => rarities.includes(nft.rarity));
}
