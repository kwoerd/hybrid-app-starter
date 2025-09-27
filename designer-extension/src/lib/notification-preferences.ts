// Notification preferences management
export interface NotificationPreferences {
  // Email notifications
  emailNotifications: boolean;
  emailAddress?: string;
  
  // Browser notifications
  browserNotifications: boolean;
  
  // Specific notification types
  bidPlaced: boolean;
  bidSuccessful: boolean;
  outbid: boolean;
  auctionWon: boolean;
  auctionLost: boolean;
  purchaseSuccessful: boolean;
  auctionEndingSoon: boolean;
  auctionEnded: boolean;
  auctionCreated: boolean;
  auctionCanceled: boolean;
  nftTransferred: boolean;
  priceDrop: boolean;
  newListing: boolean;
  
  // Timing preferences
  auctionEndingSoonThreshold: number; // minutes before auction ends
  priceDropThreshold: number; // percentage drop to trigger notification
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  emailNotifications: false,
  browserNotifications: false, // Changed to false - opt-in
  bidPlaced: false, // Changed to false - opt-in
  bidSuccessful: false, // Changed to false - opt-in
  outbid: false, // Changed to false - opt-in
  auctionWon: false, // Changed to false - opt-in
  auctionLost: false, // Changed to false - opt-in
  purchaseSuccessful: false, // Changed to false - opt-in
  auctionEndingSoon: false, // Changed to false - opt-in
  auctionEnded: false, // Changed to false - opt-in
  auctionCreated: false,
  auctionCanceled: false, // Changed to false - opt-in
  nftTransferred: false, // Changed to false - opt-in
  priceDrop: false, // Changed to false - opt-in
  newListing: false,
  auctionEndingSoonThreshold: 60, // 1 hour
  priceDropThreshold: 10, // 10%
};

class NotificationPreferencesService {
  private storageKey = 'satoshe_notification_preferences';

  // Get preferences for current wallet
  getPreferences(walletAddress?: string): NotificationPreferences {
    if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
    
    try {
      const key = walletAddress ? `${this.storageKey}_${walletAddress.toLowerCase()}` : this.storageKey;
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_PREFERENCES, ...parsed };
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
    
    return DEFAULT_PREFERENCES;
  }

  // Save preferences for current wallet
  savePreferences(preferences: Partial<NotificationPreferences>, walletAddress?: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      const key = walletAddress ? `${this.storageKey}_${walletAddress.toLowerCase()}` : this.storageKey;
      const current = this.getPreferences(walletAddress);
      const updated = { ...current, ...preferences };
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving notification preferences:', error);
    }
  }

  // Check if a specific notification type is enabled
  isNotificationEnabled(type: keyof NotificationPreferences, walletAddress?: string): boolean {
    const preferences = this.getPreferences(walletAddress);
    return preferences[type] as boolean;
  }

  // Get email address if notifications are enabled
  getEmailAddress(walletAddress?: string): string | null {
    const preferences = this.getPreferences(walletAddress);
    return preferences.emailNotifications ? preferences.emailAddress || null : null;
  }

  // Check if browser notifications are enabled
  isBrowserNotificationEnabled(walletAddress?: string): boolean {
    const preferences = this.getPreferences(walletAddress);
    return preferences.browserNotifications;
  }
}

export const notificationPreferencesService = new NotificationPreferencesService();
