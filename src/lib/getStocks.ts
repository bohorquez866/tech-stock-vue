import axios, { AxiosError } from 'axios'

const BASE_URL = import.meta.env.AWS_URL as string
const WATCHLIST_ENDPOINT = `${BASE_URL}/watchlist`

interface WatchlistItem {
  id: number
  user_id: number
  symbol: string
  company_name: string
  notes: string
  created_at: string
}

type WatchlistAddItem = Omit<WatchlistItem, 'id'>

interface SuccessResponse {
  message: string
}

export const apiServiceFetch = {
  async getWatchlist(): Promise<WatchlistItem[]> {
    try {
      const response = await fetch(WATCHLIST_ENDPOINT)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status} ${response.statusText}`)
      }
      const data: WatchlistItem[] = await response.json()
      return data
    } catch (error) {
      console.error('Fetch GET Error:', error)
      throw error
    }
  },

  async addToWatchlist(item: WatchlistAddItem): Promise<WatchlistItem> {
    try {
      const response = await fetch(WATCHLIST_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status} ${response.statusText}`)
      }
      const data: WatchlistItem = await response.json()
      return data
    } catch (error) {
      console.error('Fetch POST Error:', error)
      throw error
    }
  },

  async removeFromWatchlist(itemId: string): Promise<SuccessResponse | void> {
    const deleteUrl = `${WATCHLIST_ENDPOINT}/${itemId}`

    try {
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {},
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status} ${response.statusText}`)
      }

      if (response.status === 204) {
        return
      } else {
        try {
          const data: SuccessResponse = await response.json()
          return data
        } catch (jsonError) {
          console.warn('DELETE request successful, but response body was not valid JSON.')
          return
        }
      }
    } catch (error) {
      console.error('Fetch DELETE Error:', error)
      throw error
    }
  },
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

  async removeFromWatchlist(itemId: string): Promise<SuccessResponse | void> {
    const deleteUrl = `${WATCHLIST_ENDPOINT}/${itemId}`

    try {
      const response = await axios.delete<SuccessResponse | void>(deleteUrl, { headers: {} })

      return response.data
    } catch (error) {
      console.error('Axios DELETE Error:', error instanceof AxiosError ? error.message : error)
      throw error
    }
  },
}
