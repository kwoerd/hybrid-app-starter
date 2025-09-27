// Simple localStorage-based notification system
// No external dependencies, works entirely in the browser

export interface Notification {
  id: string;
  type: 'bid_placed' | 'outbid' | 'auction_won' | 'auction_lost' | 'auction_ended' | 'auction_created' | 'auction_canceled' | 'nft_transferred' | 'bid_successful' | 'purchase_successful' | 'auction_ending_soon' | 'price_drop' | 'new_listing';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  tokenId?: string;
  auctionId?: string;
  bidAmount?: string;
  nftName?: string;
  actionUrl?: string;
  timeRemaining?: string;
}

class NotificationService {
  private storageKey = 'satoshe_sluggers_notifications';
  private maxNotifications = 100; // Keep only last 100 notifications

  // Get all notifications for current user
  getNotifications(): Notification[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return [];
      
      const notifications = JSON.parse(stored);
      return Array.isArray(notifications) ? notifications : [];
    } catch (error) {
      console.error('Error loading notifications:', error);
      return [];
    }
  }

  // Save notifications to localStorage
  private saveNotifications(notifications: Notification[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      // Keep only the most recent notifications
      const recentNotifications = (notifications || [])
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, this.maxNotifications);
      
      localStorage.setItem(this.storageKey, JSON.stringify(recentNotifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }

  // Add a new notification
  async addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>, walletAddress?: string): Promise<Notification> {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      read: false,
    };

    const notifications = this.getNotifications();
    notifications.unshift(newNotification); // Add to beginning
    this.saveNotifications(notifications);

    // Show browser notification if permission granted
    this.showBrowserNotification(newNotification);

    // Send email notification if enabled
    if (walletAddress) {
      await this.sendEmailNotification(newNotification, walletAddress);
    }

    return newNotification;
  }

  // Send email notification
  private async sendEmailNotification(notification: Notification, walletAddress: string): Promise<void> {
    try {
      // Import preferences service dynamically to avoid circular imports
      const { notificationPreferencesService } = await import('./notification-preferences');
      const preferences = notificationPreferencesService.getPreferences(walletAddress);
      
      if (!preferences.emailNotifications || !preferences.emailAddress) {
        return;
      }

      // Check if this notification type is enabled
      const notificationTypeKey = notification.type as keyof typeof preferences;
      if (!preferences[notificationTypeKey]) {
        return;
      }

      // Send email via API
      const response = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: preferences.emailAddress,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          nftName: notification.nftName,
          tokenId: notification.tokenId,
          actionUrl: notification.actionUrl,
        }),
      });

      if (!response.ok) {
        console.error('Failed to send email notification:', await response.text());
      }
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }

  // Mark notification as read
  markAsRead(notificationId: string): void {
    const notifications = this.getNotifications();
    const notification = (notifications || []).find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotifications(notifications);
    }
  }

  // Mark all notifications as read
  markAllAsRead(): void {
    const notifications = this.getNotifications();
    (notifications || []).forEach(n => n.read = true);
    this.saveNotifications(notifications);
  }

  // Delete a notification
  deleteNotification(notificationId: string): void {
    const notifications = this.getNotifications();
    const filtered = (notifications || []).filter(n => n.id !== notificationId);
    this.saveNotifications(filtered);
  }

  // Clear all notifications
  clearAll(): void {
    this.saveNotifications([]);
  }

  // Get unread count
  getUnreadCount(): number {
    const notifications = this.getNotifications();
    return (notifications || []).filter(n => !n.read).length;
  }

  // Show browser notification (if permission granted)
  private showBrowserNotification(notification: Notification): void {
    if (typeof window === 'undefined') return;
    
    // Check if browser supports notifications
    if (!('Notification' in window)) return;
    
    // Check if permission is granted
    if (Notification.permission === 'granted') {
      const browserNotif = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id, // Prevents duplicate notifications
      });

      // Auto-close after 5 seconds
      setTimeout(() => {
        browserNotif.close();
      }, 5000);

      // Mark as read when clicked
      browserNotif.onclick = () => {
        this.markAsRead(notification.id);
        window.focus();
        browserNotif.close();
      };
    }
  }

  // Request notification permission
  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    if (!('Notification' in window)) return false;
    
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // Check if notifications are supported
  isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'Notification' in window;
  }

  // Get permission status
  getPermissionStatus(): 'granted' | 'denied' | 'default' {
    if (typeof window === 'undefined') return 'default';
    if (!('Notification' in window)) return 'default';
    return Notification.permission;
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

// Helper functions for creating specific notification types
export const createBidPlacedNotification = (nftName: string, bidAmount: string, tokenId: string) => {
  return notificationService.addNotification({
    type: 'bid_placed',
    title: 'Bid Placed Successfully',
    message: `Your bid of ${bidAmount} ETH on ${nftName} has been placed`,
    tokenId,
    actionUrl: `/nft/${tokenId}`,
  });
};

export const createPurchaseSuccessfulNotification = (nftName: string, price: string, tokenId: string) => {
  return notificationService.addNotification({
    type: 'purchase_successful',
    title: 'NFT Purchased Successfully',
    message: `You successfully purchased ${nftName} for ${price} ETH`,
    tokenId,
    actionUrl: `/nft/${tokenId}`,
  });
};

export const createOutbidNotification = (nftName: string, bidAmount: string, tokenId: string) => {
  return notificationService.addNotification({
    type: 'outbid',
    title: 'You\'ve Been Outbid',
    message: `Someone bid ${bidAmount} ETH on ${nftName}, outbidding you`,
    tokenId,
    actionUrl: `/nft/${tokenId}`,
  });
};

export const createAuctionWonNotification = (nftName: string, tokenId: string) => {
  return notificationService.addNotification({
    type: 'auction_won',
    title: 'Auction Won!',
    message: `Congratulations! You won the auction for ${nftName}`,
    tokenId,
    actionUrl: `/nft/${tokenId}`,
  });
};

export const createAuctionEndedNotification = (nftName: string, tokenId: string) => {
  return notificationService.addNotification({
    type: 'auction_ended',
    title: 'Auction Ended',
    message: `The auction for ${nftName} has ended`,
    tokenId,
    actionUrl: `/nft/${tokenId}`,
  });
};

export const createAuctionEndingSoonNotification = (nftName: string, tokenId: string, timeRemaining: string) => {
  return notificationService.addNotification({
    type: 'auction_ending_soon',
    title: 'Auction Ending Soon',
    message: `${nftName} auction ends in ${timeRemaining}`,
    tokenId,
    timeRemaining,
    actionUrl: `/nft/${tokenId}`,
  });
};

export const createPriceDropNotification = (nftName: string, tokenId: string, oldPrice: string, newPrice: string) => {
  return notificationService.addNotification({
    type: 'price_drop',
    title: 'Price Drop Alert',
    message: `${nftName} price dropped from ${oldPrice} to ${newPrice} ETH`,
    tokenId,
    actionUrl: `/nft/${tokenId}`,
  });
};

export const createNewListingNotification = (nftName: string, tokenId: string, price: string) => {
  return notificationService.addNotification({
    type: 'new_listing',
    title: 'New NFT Listed',
    message: `${nftName} is now available for ${price} ETH`,
    tokenId,
    actionUrl: `/nft/${tokenId}`,
  });
};
