// NFT Types based on your actual data structure
export interface NFTMetadata {
  name: string;
  description: string;
  token_id: number;
  card_number: number;
  collection_number: number;
  edition: number;
  series: string;
  rarity_score: number;
  rank: number;
  rarity_percent: number;
  rarity_tier: string;
  attributes: NFTAttribute[];
  artist: string;
  platform: string;
  compiler: string;
  copyright: string;
  date: number;
}

export interface NFTAttribute {
  trait_type: string;
  value: string;
  occurrence: number;
  rarity: number;
}

export interface NFTURLs {
  TokenID: number;
  "Media URL": string;
  "Metadata URL": string;
}

// Combined NFT data structure for the marketplace
export interface NFT {
  id: string;
  tokenId: number;
  name: string;
  description: string;
  image: string;
  metadataUrl: string;
  attributes: NFTAttribute[];
  rarity: {
    score: number;
    rank: number;
    percent: number;
    tier: string;
  };
  collection: {
    number: number;
    edition: number;
    series: string;
  };
  artist: string;
  platform: string;
  copyright: string;
  date: number;
  // Marketplace specific fields
  price?: string;
  currency?: string;
  isListed: boolean;
  owner?: string;
  lastSale?: NFTSale;
}

export interface NFTSale {
  id: string;
  nftId: string;
  price: string;
  currency: string;
  seller: string;
  buyer: string;
  timestamp: number;
  transactionHash: string;
}

// Marketplace state types
export interface MarketplaceState {
  nfts: NFT[];
  selectedNFT: NFT | null;
  filters: MarketplaceFilters;
  sortBy: SortOption;
  viewMode: 'grid' | 'list';
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
}

export interface MarketplaceFilters {
  priceRange: {
    min: number;
    max: number;
  };
  rarityTiers: string[];
  series: string[];
  attributes: Record<string, string[]>;
  status: ('listed' | 'unlisted' | 'sold')[];
}

export type SortOption = 
  | 'rarity_high_to_low'
  | 'rarity_low_to_high'
  | 'rank_high_to_low'
  | 'rank_low_to_high'
  | 'name_a_to_z'
  | 'name_z_to_a'
  | 'price_low_to_high'
  | 'price_high_to_low'
  | 'newest'
  | 'oldest';

// Wallet types
export interface WalletState {
  address: string | null;
  isConnected: boolean;
  chainId: number | null;
  balance: string;
  isLoading: boolean;
  error: string | null;
}

// Collection stats
export interface CollectionStats {
  totalSupply: number;
  totalListed: number;
  floorPrice: string;
  averagePrice: string;
  totalVolume: string;
  uniqueOwners: number;
  rarityDistribution: {
    [tier: string]: number;
  };
  seriesDistribution: {
    [series: string]: number;
  };
}

// Configuration types
export interface MarketplaceConfig {
  name: string;
  description: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  supportedChains: number[];
  defaultChain: number;
  collection: {
    name: string;
    symbol: string;
    description: string;
    image: string;
    contractAddress?: string;
    royalty: number;
  };
  features: {
    enableBuying: boolean;
    enableSelling: boolean;
    enableMinting: boolean;
    enableOffers: boolean;
    enableRarity: boolean;
    enableAnalytics: boolean;
    enableFavorites: boolean;
    enableSharing: boolean;
  };
  socialLinks: {
    twitter?: string;
    discord?: string;
    website?: string;
  };
}

// API response types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
