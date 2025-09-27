import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export type SortOption = 
  | 'newest'
  | 'oldest'
  | 'price-low'
  | 'price-high'
  | 'rarity-low'
  | 'rarity-high'
  | 'name-a-z'
  | 'name-z-a';

interface SortingControlsProps {
  sortBy: SortOption;
  onSortChange: (sortBy: SortOption) => void;
  className?: string;
}

export default function SortingControls({ sortBy, onSortChange, className = '' }: SortingControlsProps) {
  const getSortIcon = (option: SortOption) => {
    if (option.includes('high') || option.includes('z-a')) {
      return <ArrowUp className="w-4 h-4" />;
    } else if (option.includes('low') || option.includes('a-z')) {
      return <ArrowDown className="w-4 h-4" />;
    }
    return <ArrowUpDown className="w-4 h-4" />;
  };

  const sortOptions = [
    { value: 'newest', label: 'Newest First', icon: getSortIcon('newest') },
    { value: 'oldest', label: 'Oldest First', icon: getSortIcon('oldest') },
    { value: 'price-low', label: 'Price: Low to High', icon: getSortIcon('price-low') },
    { value: 'price-high', label: 'Price: High to Low', icon: getSortIcon('price-high') },
    { value: 'rarity-low', label: 'Rarity: Low to High', icon: getSortIcon('rarity-low') },
    { value: 'rarity-high', label: 'Rarity: High to Low', icon: getSortIcon('rarity-high') },
    { value: 'name-a-z', label: 'Name: A to Z', icon: getSortIcon('name-a-z') },
    { value: 'name-z-a', label: 'Name: Z to A', icon: getSortIcon('name-z-a') },
  ];

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="text-sm text-text-secondary">Sort by:</span>
      <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
        <SelectTrigger className="w-48 bg-bg-secondary border-border-primary">
          <SelectValue>
            <div className="flex items-center space-x-2">
              {getSortIcon(sortBy)}
              <span>{sortOptions.find(opt => opt.value === sortBy)?.label}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-bg-secondary border-border-primary">
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center space-x-2">
                {option.icon}
                <span>{option.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
