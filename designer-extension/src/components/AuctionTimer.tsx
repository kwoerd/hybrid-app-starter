import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';

interface AuctionTimerProps {
  endTime: number; // Unix timestamp
  onEnd?: () => void;
  className?: string;
}

export default function AuctionTimer({ endTime, onEnd, className = '' }: AuctionTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now() / 1000;
      const difference = endTime - now;

      if (difference <= 0) {
        setIsEnded(true);
        onEnd?.();
        return null;
      }

      const days = Math.floor(difference / (24 * 60 * 60));
      const hours = Math.floor((difference % (24 * 60 * 60)) / (60 * 60));
      const minutes = Math.floor((difference % (60 * 60)) / 60);
      const seconds = Math.floor(difference % 60);

      return { days, hours, minutes, seconds };
    };

    const updateTimer = () => {
      const time = calculateTimeLeft();
      setTimeLeft(time);
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endTime, onEnd]);

  if (isEnded) {
    return (
      <div className={`flex items-center space-x-2 text-red-500 ${className}`}>
        <AlertCircle className="w-4 h-4" />
        <span className="text-sm font-semibold">Auction Ended</span>
      </div>
    );
  }

  if (!timeLeft) {
    return (
      <div className={`flex items-center space-x-2 text-text-muted ${className}`}>
        <Clock className="w-4 h-4" />
        <span className="text-sm">Calculating...</span>
      </div>
    );
  }

  const { days, hours, minutes, seconds } = timeLeft;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Clock className="w-4 h-4 text-brand-pink" />
      <div className="flex items-center space-x-1 text-sm">
        {days > 0 && (
          <>
            <span className="font-mono font-semibold text-text-primary">{days.toString().padStart(2, '0')}</span>
            <span className="text-text-muted">d</span>
          </>
        )}
        <span className="font-mono font-semibold text-text-primary">{hours.toString().padStart(2, '0')}</span>
        <span className="text-text-muted">h</span>
        <span className="font-mono font-semibold text-text-primary">{minutes.toString().padStart(2, '0')}</span>
        <span className="text-text-muted">m</span>
        <span className="font-mono font-semibold text-text-primary">{seconds.toString().padStart(2, '0')}</span>
        <span className="text-text-muted">s</span>
      </div>
    </div>
  );
}
