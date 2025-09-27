// Auction monitoring service for real-time notifications
import { notificationService } from './notification-service';
import { notificationPreferencesService } from './notification-preferences';

export interface AuctionMonitor {
  tokenId: string;
  auctionId: string;
  nftName: string;
  currentBid: string;
  endTime: number;
  userBidAmount?: string;
  isUserWinning: boolean;
  lastChecked: number;
}

class AuctionMonitoringService {
  private monitoredAuctions = new Map<string, AuctionMonitor>();
  private checkInterval: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL = 30000; // 30 seconds

  // Start monitoring an auction
  startMonitoring(auction: AuctionMonitor, walletAddress: string) {
    this.monitoredAuctions.set(auction.tokenId, auction);
    
    // Start interval if not already running
    if (!this.checkInterval) {
      this.startInterval(walletAddress);
    }
  }

  // Stop monitoring an auction
  stopMonitoring(tokenId: string) {
    this.monitoredAuctions.delete(tokenId);
    
    // Stop interval if no auctions being monitored
    if (this.monitoredAuctions.size === 0 && this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // Start the monitoring interval
  private startInterval(walletAddress: string) {
    this.checkInterval = setInterval(() => {
      this.checkAllAuctions(walletAddress);
    }, this.CHECK_INTERVAL);
  }

  // Check all monitored auctions
  private async checkAllAuctions(walletAddress: string) {
    const preferences = notificationPreferencesService.getPreferences(walletAddress);
    
    for (const [tokenId, auction] of this.monitoredAuctions) {
      try {
        await this.checkAuction(auction, preferences);
      } catch (error) {
        console.error(`Error checking auction ${tokenId}:`, error);
      }
    }
  }

  // Check a specific auction
  private async checkAuction(auction: AuctionMonitor, preferences: any) {
    const now = Date.now();
    const timeUntilEnd = auction.endTime - now;
    
    // Check if auction is ending soon
    if (preferences.auctionEndingSoon && timeUntilEnd <= preferences.auctionEndingSoonThreshold * 60 * 1000 && timeUntilEnd > 0) {
      const minutesLeft = Math.floor(timeUntilEnd / (1000 * 60));
      notificationService.addNotification({
        type: 'auction_ending_soon',
        title: 'Auction Ending Soon!',
        message: `${auction.nftName} auction ends in ${minutesLeft} minutes`,
        tokenId: auction.tokenId,
        nftName: auction.nftName,
        timeRemaining: `${minutesLeft}m`,
        actionUrl: `/nft/${auction.tokenId}`
      });
    }

    // Check if auction has ended
    if (timeUntilEnd <= 0) {
      if (auction.isUserWinning) {
        notificationService.addNotification({
          type: 'auction_won',
          title: 'Auction Won!',
          message: `Congratulations! You won the auction for ${auction.nftName}`,
          tokenId: auction.tokenId,
          nftName: auction.nftName,
          actionUrl: `/nft/${auction.tokenId}`
        });
      } else {
        notificationService.addNotification({
          type: 'auction_lost',
          title: 'Auction Lost',
          message: `The auction for ${auction.nftName} has ended and you didn't win`,
          tokenId: auction.tokenId,
          nftName: auction.nftName,
          actionUrl: `/nft/${auction.tokenId}`
        });
      }
      
      // Stop monitoring this auction
      this.stopMonitoring(auction.tokenId);
    }
  }

  // Update auction data
  updateAuction(tokenId: string, updates: Partial<AuctionMonitor>) {
    const auction = this.monitoredAuctions.get(tokenId);
    if (auction) {
      this.monitoredAuctions.set(tokenId, { ...auction, ...updates });
    }
  }

  // Get all monitored auctions
  getMonitoredAuctions(): AuctionMonitor[] {
    return Array.from(this.monitoredAuctions.values());
  }

  // Clear all monitoring
  clearAll() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.monitoredAuctions.clear();
  }
}

export const auctionMonitoringService = new AuctionMonitoringService();
