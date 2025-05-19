export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      wallets: {
        Row: {
          address: string
          created_at: string
          has_voted: boolean
          id: number
        }
        Insert: {
          address: string
          created_at?: string
          has_voted?: boolean
          id?: number
        }
        Update: {
          address?: string
          created_at?: string
          has_voted?: boolean
          id?: number
        }
        Relationships: []
      }
      votes: {
        Row: {
          created_at: string
          id: number
          option: string
          wallet_address: string
        }
        Insert: {
          created_at?: string
          id?: number
          option: string
          wallet_address: string
        }
        Update: {
          created_at?: string
          id?: number
          option?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_wallet_address_fkey"
            columns: ["wallet_address"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["address"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}