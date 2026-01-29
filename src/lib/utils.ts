import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return value.toLocaleString("vi-VN", { style: "decimal" }) // 2000000 -> 2.000.000
}

// lmao
// lmao 222
