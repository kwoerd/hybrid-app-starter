import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format ETH price without trailing zeros
export function formatETHPrice(price: string | number | bigint): string {
  if (!price || price === "0") return "0";
  
  try {
    let ethValue: number;
    
    if (typeof price === "bigint" || (typeof price === "string" && /^\d{12,}$/.test(price))) {
      // Convert from wei
      ethValue = Number(BigInt(price)) / 1e18;
    } else {
      ethValue = Number(price);
    }
    
    if (isNaN(ethValue) || ethValue < 0) return "0";
    
    // Remove trailing zeros and unnecessary decimal point
    return parseFloat(ethValue.toString()).toString();
  } catch {
    return "0";
  }
}

// Format price for display
export function formatPrice(price: string | number): string {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(numPrice)) return "0.00";
  
  if (numPrice >= 1) {
    return numPrice.toFixed(2);
  } else if (numPrice >= 0.01) {
    return numPrice.toFixed(4);
  } else {
    return numPrice.toFixed(6);
  }
}

// Format countdown timer
export function formatCountdown(endTime: number): string {
  const now = Date.now();
  const timeLeft = endTime - now;
  
  if (timeLeft <= 0) return "Ended";
  
  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

// Validate numeric input
export function validateNumericInput(value: string): boolean {
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0;
}
