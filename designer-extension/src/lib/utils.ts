import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: string | number | bigint): string {
  if (!price || price === "0") {
    return "--";
  }
  
  if (typeof price === "bigint" || (typeof price === "string" && /^\d{12,}$/.test(price))) {
    try {
      const eth = Number(BigInt(price)) / 1e18;
      if (eth > 10000) {
        return "--";
      }
      return eth.toLocaleString(undefined, { maximumFractionDigits: 6 }) + " ETH";
    } catch {
      return "--";
    }
  }
  
  if (typeof price === "number" && price < 1e6) {
    return price + " ETH";
  }
  
  if (typeof price === "string" && /^\d*\.?\d+$/.test(price)) {
    return price + " ETH";
  }
  
  return "--";
}

export function formatCountdown(auctionEnd: string | number | bigint): string {
  if (!auctionEnd) return "Auction ended";
  
  const now = Date.now();
  const end = Number(auctionEnd) * 1000;
  const timeLeft = end - now;
  
  if (timeLeft <= 0) return "Auction ended";
  
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m remaining`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  } else {
    return `${minutes}m remaining`;
  }
}

export function validateNumericInput(value: string, tokenId: string): {
  isValid: boolean;
  formattedValue: string;
} {
  // Remove any non-numeric characters except decimal point
  const cleaned = value.replace(/[^0-9.]/g, '');
  
  // Ensure only one decimal point
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    return {
      isValid: false,
      formattedValue: parts[0] + '.' + parts.slice(1).join('')
    };
  }
  
  // Limit to 5 decimal places
  if (parts[1] && parts[1].length > 5) {
    return {
      isValid: false,
      formattedValue: parts[0] + '.' + parts[1].substring(0, 5)
    };
  }
  
  // Check if it's a valid number
  const num = parseFloat(cleaned);
  if (isNaN(num) || num < 0) {
    return {
      isValid: false,
      formattedValue: cleaned
    };
  }
  
  return {
    isValid: true,
    formattedValue: cleaned
  };
}

export function getAttribute(meta: any, traitType: string): string | undefined {
  return meta?.attributes?.find((attr: any) => attr.trait_type === traitType)?.value;
}

export function truncateAddress(address: string, start = 6, end = 4): string {
  if (!address) return '';
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

export function formatDate(timestamp: string | number | bigint): string {
  if (!timestamp) return "N/A";
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric"
  });
}

export function formatTime(timestamp: string | number | bigint): string {
  if (!timestamp) return "N/A";
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short"
  });
}
