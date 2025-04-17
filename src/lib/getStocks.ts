import type { WatchlistItem } from '@/types/stocks'
import axios, { AxiosError } from 'axios'

const BASE_URL = import.meta.env.VITE_AWS_URL as string
const WATCHLIST_ENDPOINT = `${BASE_URL}/watchlist`
console.log('BASE_URL:', BASE_URL)
console.log('WATCHLIST_ENDPOINT:', WATCHLIST_ENDPOINT)

type WatchlistAddItem = Omit<WatchlistItem, 'id'>

interface SuccessResponse {
  message: string
}

export const apiServiceAxios = {
  async getWatchlist(): Promise<WatchlistItem[]> {
    try {
      const response = await axios.get<WatchlistItem[]>(WATCHLIST_ENDPOINT)
      return response.data
    } catch (error) {
      console.error('Axios GET Error:', error instanceof AxiosError ? error.message : error)
      throw error
    }
  },

  async addToWatchlist(item: WatchlistAddItem): Promise<WatchlistItem> {
    try {
      const response = await axios.post<WatchlistItem>(WATCHLIST_ENDPOINT, item, {
        headers: {},
      })
      return response.data
    } catch (error) {
      console.error('Axios POST Error:', error instanceof AxiosError ? error.message : error)
      throw error
    }
  },

  async removeFromWatchlist(symbol: string): Promise<SuccessResponse | void> {
    const deleteUrl = `${WATCHLIST_ENDPOINT}/${symbol}`

    try {
      const response = await axios.delete<SuccessResponse | void>(deleteUrl, { headers: {} })

      return response.data
    } catch (error) {
      console.error('Axios DELETE Error:', error instanceof AxiosError ? error.message : error)
      throw error
    }
  },

  async getWatchlistItemBySymbol(symbol: string): Promise<WatchlistItem> {
    const encodedSymbol = encodeURIComponent(symbol)
    const url = `${WATCHLIST_ENDPOINT}/${encodedSymbol}`

    console.log(`[API Service] Fetching watchlist item by symbol: ${symbol} from URL: ${url}`)

    try {
      const response = await axios.get<WatchlistItem>(url)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          `[API Service] Axios GET by Symbol (${symbol}) Error: Status ${error.response?.status}, Response:`,
          error.response?.data || error.message,
        )
      } else {
        console.error(`[API Service] GET by Symbol (${symbol}) Unknown Error:`, error)
      }

      throw error
    }
  },
}
