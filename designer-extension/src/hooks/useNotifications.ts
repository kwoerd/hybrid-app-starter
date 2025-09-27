import { useState, useEffect, useCallback } from 'react';
import { useActiveAccount } from 'thirdweb/react';
// import { usePushNotifications } from './usePushNotifications';

export interface Notification {
  id: string;
  type: 'bid_placed' | 'outbid' | 'auction_won' | 'auction_ended' | 'auction_created' | 'auction_canceled' | 'nft_transferred' | 'bid_successful' | 'purchase_successful';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  tokenId?: string;
  auctionId?: string;
  bidAmount?: string;
  nftName?: string;
  actionUrl?: string;
}

export function useNotifications() {
  const account = useActiveAccount();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  // const { sendBidNotification, sendPurchaseNotification, sendOutbidNotification, sendAuctionWonNotification } = usePushNotifications();
  
  // Stub functions for now
  const sendBidNotification = async () => {};
  const sendPurchaseNotification = async () => {};
  const sendOutbidNotification = async () => {};
  const sendAuctionWonNotification = async () => {};

  // Get storage key for current wallet
  const getStorageKey = () => {
    if (!account?.address) return null;
    return `notifications_${account.address.toLowerCase()}`;
  };

  // Load notifications from localStorage
  useEffect(() => {
    const storageKey = getStorageKey();
    if (!storageKey) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsedNotifications = JSON.parse(stored);
        setNotifications(parsedNotifications);
        setUnreadCount((parsedNotifications || []).filter((n: Notification) => !n.read).length);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [account?.address]);

  // Save notifications to localStorage
  const saveNotifications = (newNotifications: Notification[]) => {
    const storageKey = getStorageKey();
    if (!storageKey) return;

    try {
      localStorage.setItem(storageKey, JSON.stringify(newNotifications));
      setNotifications(newNotifications);
      setUnreadCount((newNotifications || []).filter(n => !n.read).length);
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  };

  // Add a new notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    if (!account?.address) return;

    const newNotification: Notification = {
      ...notification,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      read: false,
    };

    const updatedNotifications = [newNotification, ...(notifications || [])].slice(0, 100); // Keep last 100 notifications
    saveNotifications(updatedNotifications);
  }, [account?.address, notifications]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    const updatedNotifications = (notifications || []).map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    saveNotifications(updatedNotifications);
  }, [notifications]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    const updatedNotifications = (notifications || []).map(n => ({ ...n, read: true }));
    saveNotifications(updatedNotifications);
  }, [notifications]);

  // Clear all notifications
  const clearAll = useCallback(() => {
    saveNotifications([]);
  }, []);

  // Remove a specific notification
  const removeNotification = useCallback((notificationId: string) => {
    const updatedNotifications = notifications.filter(n => n.id !== notificationId);
    saveNotifications(updatedNotifications);
  }, [notifications]);

  // Notification templates for common events
  const createBidPlacedNotification = (nftName: string, bidAmount: string, tokenId: string) => {
    addNotification({
      type: 'bid_placed',
      title: 'Bid Placed Successfully',
      message: `Your bid of ${bidAmount} ETH on ${nftName} has been placed`,
      tokenId,
      actionUrl: `/nft/${tokenId}`,
    });
    
    // Also send push notification
    // sendBidNotification(nftName, bidAmount);
  };

  const createOutbidNotification = (nftName: string, bidAmount: string, tokenId: string) => {
    addNotification({
      type: 'outbid',
      title: 'You\'ve Been Outbid',
      message: `Someone placed a higher bid of ${bidAmount} ETH on ${nftName}`,
      tokenId,
      actionUrl: `/nft/${tokenId}`,
    });
    
    // Also send push notification
    // sendOutbidNotification(nftName, bidAmount);
  };

  const createAuctionWonNotification = (nftName: string, tokenId: string) => {
    addNotification({
      type: 'auction_won',
      title: 'Auction Won! 🎉',
      message: `Congratulations! You won the auction for ${nftName}`,
      tokenId,
      actionUrl: `/nft/${tokenId}`,
    });
    
    // Also send push notification
    // sendAuctionWonNotification(nftName);
  };

  const createAuctionEndedNotification = (nftName: string, tokenId: string) => {
    addNotification({
      type: 'auction_ended',
      title: 'Auction Ended',
      message: `The auction for ${nftName} has ended`,
      tokenId,
      actionUrl: `/nft/${tokenId}`,
    });
  };

  const createPurchaseSuccessfulNotification = (nftName: string, price: string, tokenId: string) => {
    addNotification({
      type: 'purchase_successful',
      title: 'Purchase Successful! 🎉',
      message: `You successfully purchased ${nftName} for ${price} ETH`,
      tokenId,
      actionUrl: `/nft/${tokenId}`,
    });
    
    // Also send push notification
    // sendPurchaseNotification(nftName, price);
  };

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    removeNotification,
    createBidPlacedNotification,
    createOutbidNotification,
    createAuctionWonNotification,
    createAuctionEndedNotification,
    createPurchaseSuccessfulNotification,
    isConnected: !!account?.address,
  };
}
