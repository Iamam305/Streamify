import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import axios from "axios"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const fetcher = async <T>(url: string): Promise<T> => {
  const response = await axios.get<T>(url)
  return response.data
}

export const fetcherWithParams = async <T>(url: string, params: Record<string, unknown>): Promise<T> => {
  const response = await axios.get<T>(url, { params })
  return response.data
}