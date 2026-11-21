import React from 'react';
import { Pill, ShoppingBag, Car, HeartHandshake, AlertTriangle, HelpCircle } from 'lucide-react';
import { RequestCategory } from '../types';

interface CategoryIconProps {
  category: RequestCategory;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ category, className = 'w-5 h-5' }) => {
  switch (category) {
    case 'medicine_delivery':
      return <Pill className={`${className} text-rose-500`} />;
    case 'grocery_assistance':
      return <ShoppingBag className={`${className} text-emerald-500`} />;
    case 'transportation':
      return <Car className={`${className} text-blue-500`} />;
    case 'senior_citizen_support':
      return <HeartHandshake className={`${className} text-indigo-500`} />;
    case 'emergency_community_support':
      return <AlertTriangle className={`${className} text-amber-500`} />;
    default:
      return <HelpCircle className={`${className} text-slate-500`} />;
  }
};

export const getCategoryLabel = (category: RequestCategory): string => {
  switch (category) {
    case 'medicine_delivery':
      return 'Medicine & Prescription Delivery';
    case 'grocery_assistance':
      return 'Grocery & Daily Essentials';
    case 'transportation':
      return 'Transportation & Escort';
    case 'senior_citizen_support':
      return 'Senior Citizen Assistance';
    case 'emergency_community_support':
      return 'Community Support';
    default:
      return 'General Community Aid';
  }
};
