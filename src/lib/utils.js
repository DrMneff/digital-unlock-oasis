import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

export function formatPrice(price, currency = 'SAR') {
  return new Intl.NumberFormat('ar-SA', { style: 'currency', currency }).format(price);
}