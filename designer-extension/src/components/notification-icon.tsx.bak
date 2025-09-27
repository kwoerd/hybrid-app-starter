"use client"

import { useState, useEffect } from "react"
import { Bell, Settings } from "lucide-react"
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer"
import { Checkbox } from "./ui/checkbox"

export default function NotificationIcon() {
  const [hasNotifications, setHasNotifications] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [preferences, setPreferences] = useState({
    outbidAlerts: true,
    currentWinningBidder: true,
    auctionEndingSoon: true,
    auctionEndingReminder: true,
    auctionWon: true,
    bidConfirmation: true,
    auctionCancelled: true,
    paymentReminder: false,
  })

  // Load preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('notification-preferences')
    if (saved) {
      try {
        setPreferences(JSON.parse(saved))
      } catch (error) {
        console.warn('Failed to load notification preferences:', error)
      }
    }
  }, [])

  // Save preferences to localStorage
  const savePreferences = (newPreferences: typeof preferences) => {
    setPreferences(newPreferences)
    localStorage.setItem('notification-preferences', JSON.stringify(newPreferences))
  }

  const handlePreferenceChange = (key: keyof typeof preferences, checked: boolean) => {
    const newPreferences = { ...preferences, [key]: checked }
    savePreferences(newPreferences)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 text-neutral-400 hover:text-white transition-colors"
          >
            <Bell className="h-5 w-5" />
            {hasNotifications && (
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-brand-pink rounded-full animate-pulse" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-64 bg-neutral-800 border-neutral-700"
          sideOffset={8}
        >
          <div className="px-3 py-2">
            <div className="text-sm font-normal" style={{ color: "#fffbeb" }}>Notifications</div>
            <div className="text-xs font-normal text-neutral-400">
              {hasNotifications ? "You have new alerts" : "No new notifications"}
            </div>
          </div>
          {hasNotifications && (
            <>
              <DropdownMenuSeparator className="bg-neutral-700" />
              
              <DropdownMenuItem 
                className="text-sm font-normal text-neutral-300 hover:bg-neutral-700 cursor-pointer"
                style={{ color: "#fffbeb" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#fffbeb"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#fffbeb"}
                onClick={() => setHasNotifications(false)}
              >
                <Bell className="h-4 w-4 mr-2" />
                Mark all as read
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-neutral-700" />
            </>
          )}
          
          <DropdownMenuItem 
            className="text-sm font-normal text-neutral-300 hover:bg-neutral-700 cursor-pointer"
            style={{ color: "#fffbeb" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#fffbeb"}
            onMouseLeave={(e) => e.currentTarget.style.color = "#fffbeb"}
            onClick={() => setIsDrawerOpen(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Notification Settings
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="bg-neutral-900 border-neutral-700">
          <DrawerHeader className="text-center">
            <DrawerTitle className="font-normal" style={{ color: "#fffbeb" }}>Notification Preferences</DrawerTitle>
            <DrawerDescription className="text-neutral-400 font-normal">
              Choose what notifications you'd like to receive
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="px-6 pb-6 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="outbidAlerts"
                  checked={preferences.outbidAlerts}
                  onCheckedChange={(checked) => handlePreferenceChange('outbidAlerts', checked as boolean)}
                  className="w-4 h-4 text-brand-pink bg-bg-primary border-border-primary rounded-sm focus:ring-brand-pink focus:ring-2"
                  style={{ accentColor: "#FF0099" }}
                />
                <label htmlFor="outbidAlerts" className="text-sm font-normal cursor-pointer" style={{ color: "#fffbeb" }}>
                  Outbid alerts - "You have been outbid on Lot #X"
                </label>
              </div>
              
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="currentWinningBidder"
                  checked={preferences.currentWinningBidder}
                  onCheckedChange={(checked) => handlePreferenceChange('currentWinningBidder', checked as boolean)}
                  className="w-4 h-4 text-brand-pink bg-bg-primary border-border-primary rounded-sm focus:ring-brand-pink focus:ring-2"
                  style={{ accentColor: "#FF0099" }}
                />
                <label htmlFor="currentWinningBidder" className="text-sm font-normal cursor-pointer" style={{ color: "#fffbeb" }}>
                  Current winning bidder - "You are the highest bidder!"
                </label>
              </div>
              
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="auctionEndingSoon"
                  checked={preferences.auctionEndingSoon}
                  onCheckedChange={(checked) => handlePreferenceChange('auctionEndingSoon', checked as boolean)}
                  className="w-4 h-4 text-brand-pink bg-bg-primary border-border-primary rounded-sm focus:ring-brand-pink focus:ring-2"
                  style={{ accentColor: "#FF0099" }}
                />
                <label htmlFor="auctionEndingSoon" className="text-sm font-normal cursor-pointer" style={{ color: "#fffbeb" }}>
                  Auction ending soon - "Auction ends in 1 hour/5 minutes"
                </label>
              </div>
              
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="auctionEndingReminder"
                  checked={preferences.auctionEndingReminder}
                  onCheckedChange={(checked) => handlePreferenceChange('auctionEndingReminder', checked as boolean)}
                  className="w-4 h-4 text-brand-pink bg-bg-primary border-border-primary rounded-sm focus:ring-brand-pink focus:ring-2"
                  style={{ accentColor: "#FF0099" }}
                />
                <label htmlFor="auctionEndingReminder" className="text-sm font-normal cursor-pointer" style={{ color: "#fffbeb" }}>
                  Auction ending reminder - "Auction for [item] ends today at [time]"
                </label>
              </div>
              
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="auctionWon"
                  checked={preferences.auctionWon}
                  onCheckedChange={(checked) => handlePreferenceChange('auctionWon', checked as boolean)}
                  className="w-4 h-4 text-brand-pink bg-bg-primary border-border-primary rounded-sm focus:ring-brand-pink focus:ring-2"
                  style={{ accentColor: "#FF0099" }}
                />
                <label htmlFor="auctionWon" className="text-sm font-normal cursor-pointer" style={{ color: "#fffbeb" }}>
                  Auction won - "Congratulations! You won the auction for [item]"
                </label>
              </div>
              
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="bidConfirmation"
                  checked={preferences.bidConfirmation}
                  onCheckedChange={(checked) => handlePreferenceChange('bidConfirmation', checked as boolean)}
                  className="w-4 h-4 text-brand-pink bg-bg-primary border-border-primary rounded-sm focus:ring-brand-pink focus:ring-2"
                  style={{ accentColor: "#FF0099" }}
                />
                <label htmlFor="bidConfirmation" className="text-sm font-normal cursor-pointer" style={{ color: "#fffbeb" }}>
                  Bid confirmation - "Your bid of [amount] ETH is submitted"
                </label>
              </div>
              
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="auctionCancelled"
                  checked={preferences.auctionCancelled}
                  onCheckedChange={(checked) => handlePreferenceChange('auctionCancelled', checked as boolean)}
                  className="w-4 h-4 text-brand-pink bg-bg-primary border-border-primary rounded-sm focus:ring-brand-pink focus:ring-2"
                  style={{ accentColor: "#FF0099" }}
                />
                <label htmlFor="auctionCancelled" className="text-sm font-normal cursor-pointer" style={{ color: "#fffbeb" }}>
                  Auction cancelled - "Auction for [item] has been cancelled"
                </label>
              </div>
              
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="paymentReminder"
                  checked={preferences.paymentReminder}
                  onCheckedChange={(checked) => handlePreferenceChange('paymentReminder', checked as boolean)}
                  className="w-4 h-4 text-brand-pink bg-bg-primary border-border-primary rounded-sm focus:ring-brand-pink focus:ring-2"
                  style={{ accentColor: "#FF0099" }}
                />
                <label htmlFor="paymentReminder" className="text-sm font-normal cursor-pointer" style={{ color: "#fffbeb" }}>
                  Payment reminder - "Please complete payment for your winning bid"
                </label>
              </div>
            </div>
            
            <div className="pt-4 border-t border-neutral-700">
              <Button
                onClick={() => setIsDrawerOpen(false)}
                className="w-full bg-brand-pink hover:bg-brand-pink-hover font-normal"
                style={{ color: "#fffbeb" }}
              >
                Save Preferences
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}
