export interface WatchlistItem {
  id: number
  user_id: number
  symbol: string
  company_name: string
  notes: string
  created_at: string
}

export interface WatchlistAddItem {
  symbol: string
  companyName: string
  notes: string
}

export interface SuccessResponse {
  message: string
}
