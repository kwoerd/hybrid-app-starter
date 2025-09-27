// Enhanced notifications hook using simple localStorage-based system
import { useState, useEffect, useCallback } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { 
  notificationService, 
  createBidPlacedNotification,
  createPurchaseSuccessfulNotification,
  createOutbidNotification,
  createAuctionWonNotification,
  createAuctionEndedNotification,
  createAuctionEndingSoonNotification,
  createPriceDropNotification,
  createNewListingNotification
} from '@/lib/notification-service';

export interface EnhancedNotification {
  id: string;
  walletAddress: string;
  type: 'bid_placed' | 'outbid' | 'auction_won' | 'auction_lost' | 'auction_ending_soon' | 'auction_ended' | 'auction_created' | 'auction_canceled' | 'nft_transferred' | 'bid_successful' | 'purchase_successful' | 'price_drop' | 'new_listing';
  title: string;
  message: string;
  tokenId?: string;
  auctionId?: string;
  bidAmount?: string;
  nftName?: string;
  timeRemaining?: string;
  timestamp: number;
  read: boolean;
}

export function useEnhancedNotifications() {
  // Early return for SSR
  if (typeof window === 'undefined') {
    return {
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,
      createNotification: () => Promise.resolve(null),
      markAsRead: () => Promise.resolve(),
      markAllAsRead: () => Promise.resolve(),
      clearAll: () => Promise.resolve(),
      deleteNotification: () => Promise.resolve(),
      refresh: () => Promise.resolve(),
    };
  }

  const account = useActiveAccount();
  const [notifications, setNotifications] = useState<EnhancedNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load notifications from localStorage
  const loadNotifications = useCallback(() => {
    try {
      const loadedNotifications = notificationService.getNotifications();
      // Convert to EnhancedNotification format
      const enhancedNotifications: EnhancedNotification[] = (loadedNotifications || []).map(notif => ({
        id: notif.id,
        walletAddress: account?.address || '',
        type: notif.type as EnhancedNotification['type'],
        title: notif.title,
        message: notif.message,
        timestamp: notif.timestamp,
        read: notif.read,
        tokenId: notif.tokenId,
        auctionId: notif.auctionId,
        bidAmount: notif.bidAmount,
        nftName: notif.nftName,
        timeRemaining: notif.timeRemaining,
      }));
      
      setNotifications(enhancedNotifications);
      setUnreadCount(notificationService.getUnreadCount());
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    }
  }, [account?.address]);

  // Load notifications on mount and when account changes
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Create a new notification
  const createNotification = useCallback(async (
    type: EnhancedNotification['type'],
    title: string,
    message: string,
    options: {
      tokenId?: string;
      auctionId?: string;
      bidAmount?: string;
      nftName?: string;
      timeRemaining?: string;
    } = {}
  ): Promise<EnhancedNotification | null> => {
    if (!account?.address) return null;

    try {
      const notification = await notificationService.addNotification({
        type: type as any,
        title,
        message,
        ...options
      }, account.address);

      // Convert to EnhancedNotification format
      const enhancedNotification: EnhancedNotification = {
        id: notification.id,
        walletAddress: account.address,
        type: notification.type as EnhancedNotification['type'],
        title: notification.title,
        message: notification.message,
        timestamp: notification.timestamp,
        read: notification.read,
        tokenId: notification.tokenId,
        auctionId: notification.auctionId,
        bidAmount: notification.bidAmount,
        nftName: notification.nftName,
        timeRemaining: notification.timeRemaining,
      };

      setNotifications(prev => [enhancedNotification, ...prev]);
      setUnreadCount(prev => prev + 1);

      return enhancedNotification;
    } catch (err) {
      console.error('Error creating notification:', err);
      setError(err instanceof Error ? err.message : 'Failed to create notification');
      return null;
    }
  }, [account?.address]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string): Promise<void> => {
    try {
      notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        (prev || []).map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read');
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async (): Promise<void> => {
    try {
      notificationService.markAllAsRead();
      setNotifications(prev => (prev || []).map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all notifications as read');
    }
  }, []);

  // Delete a notification
  const deleteNotification = useCallback(async (notificationId: string): Promise<void> => {
    try {
      notificationService.deleteNotification(notificationId);
      setNotifications(prev => {
        const notification = (prev || []).find(n => n.id === notificationId);
        const filtered = (prev || []).filter(n => n.id !== notificationId);
        if (notification && !notification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        return filtered;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete notification');
    }
  }, []);

  // Clear all notifications
  const clearAll = useCallback(async (): Promise<void> => {
    try {
      notificationService.clearAll();
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear notifications');
    }
  }, []);

  // Refresh notifications
  const refresh = useCallback(async (): Promise<void> => {
    loadNotifications();
  }, [loadNotifications]);

  // Convenience functions for specific notification types
  const createBidPlacedNotification = useCallback(async (nftName: string, bidAmount: string, tokenId: string) => {
    return createNotification('bid_placed', 'Bid Placed Successfully', `Your bid of ${bidAmount} ETH on ${nftName} has been placed`, {
      tokenId,
      bidAmount,
      nftName,
    });
  }, [createNotification]);

  const createPurchaseSuccessfulNotification = useCallback(async (nftName: string, price: string, tokenId: string) => {
    return createNotification('purchase_successful', 'NFT Purchased Successfully', `You successfully purchased ${nftName} for ${price} ETH`, {
      tokenId,
      bidAmount: price,
      nftName,
    });
  }, [createNotification]);

  const createOutbidNotification = useCallback(async (nftName: string, bidAmount: string, tokenId: string) => {
    return createNotification('outbid', 'You\'ve Been Outbid', `Someone bid ${bidAmount} ETH on ${nftName}, outbidding you`, {
      tokenId,
      bidAmount,
      nftName,
    });
  }, [createNotification]);

  const createAuctionWonNotification = useCallback(async (nftName: string, tokenId: string) => {
    return createNotification('auction_won', 'Auction Won!', `Congratulations! You won the auction for ${nftName}`, {
      tokenId,
      nftName,
    });
  }, [createNotification]);

  const createAuctionEndedNotification = useCallback(async (nftName: string, tokenId: string) => {
    return createNotification('auction_ended', 'Auction Ended', `The auction for ${nftName} has ended`, {
      tokenId,
      nftName,
    });
  }, [createNotification]);

  const createAuctionEndingSoonNotification = useCallback(async (nftName: string, tokenId: string, timeRemaining: string) => {
    return createNotification('auction_ending_soon', 'Auction Ending Soon', `${nftName} auction ends in ${timeRemaining}`, {
      tokenId,
      nftName,
      timeRemaining,
    });
  }, [createNotification]);

  const createPriceDropNotification = useCallback(async (nftName: string, tokenId: string, oldPrice: string, newPrice: string) => {
    return createNotification('price_drop', 'Price Drop Alert', `${nftName} price dropped from ${oldPrice} to ${newPrice} ETH`, {
      tokenId,
      nftName,
    });
  }, [createNotification]);

  const createNewListingNotification = useCallback(async (nftName: string, tokenId: string, price: string) => {
    return createNotification('new_listing', 'New NFT Listed', `${nftName} is now available for ${price} ETH`, {
      tokenId,
      nftName,
    });
  }, [createNotification]);

  const createAuctionLostNotification = useCallback(async (nftName: string, tokenId: string) => {
    return createNotification('auction_lost', 'Auction Lost', `You lost the auction for ${nftName}`, {
      tokenId,
      nftName,
    });
  }, [createNotification]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refresh,
    // Convenience functions
    createBidPlacedNotification,
    createPurchaseSuccessfulNotification,
    createOutbidNotification,
    createAuctionWonNotification,
    createAuctionEndedNotification,
    createAuctionEndingSoonNotification,
    createPriceDropNotification,
    createNewListingNotification,
    createAuctionLostNotification,
  };
}
