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
          nft_verified: boolean | null
          nft_policy_id: string | null
          nft_count: number | null
          verification_method: string | null
        }
        Insert: {
          address: string
          created_at?: string
          has_voted?: boolean
          id?: number
          nft_verified?: boolean | null
          nft_policy_id?: string | null
          nft_count?: number | null
          verification_method?: string | null
        }
        Update: {
          address?: string
          created_at?: string
          has_voted?: boolean
          id?: number
          nft_verified?: boolean | null
          nft_policy_id?: string | null
          nft_count?: number | null
          verification_method?: string | null
        }
        Relationships: []
      }
      votes: {
        Row: {
          created_at: string
          id: number
          option: string
          wallet_address: string
          nft_verified: boolean | null
          policy_id: string | null
          verification_method: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          option: string
          wallet_address: string
          nft_verified?: boolean | null
          policy_id?: string | null
          verification_method?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          option?: string
          wallet_address?: string
          nft_verified?: boolean | null
          policy_id?: string | null
          verification_method?: string | null
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
      users: {
        Row: {
          id: string
          email: string
          google_id: string
          wallet_address: string | null
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          google_id: string
          wallet_address?: string | null
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          google_id?: string
          wallet_address?: string | null
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      voting_sessions: {
        Row: {
          id: string
          title: string
          description: string | null
          options: Json
          start_date: string
          end_date: string | null
          nft_policy_id: string | null
          is_active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          options?: Json
          start_date?: string
          end_date?: string | null
          nft_policy_id?: string | null
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          options?: Json
          start_date?: string
          end_date?: string | null
          nft_policy_id?: string | null
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "voting_sessions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      session_votes: {
        Row: {
          id: string
          session_id: string
          user_id: string
          option: string
          nft_verified: boolean
          nft_count: number
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          option: string
          nft_verified?: boolean
          nft_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string
          option?: string
          nft_verified?: boolean
          nft_count?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_votes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "voting_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      nft_distributions: {
        Row: {
          id: string
          session_id: string | null
          recipient_user_id: string | null
          recipient_address: string
          nft_policy_id: string
          nft_asset_name: string | null
          quantity: number
          transaction_hash: string | null
          status: string
          created_at: string
          distributed_at: string | null
        }
        Insert: {
          id?: string
          session_id?: string | null
          recipient_user_id?: string | null
          recipient_address: string
          nft_policy_id: string
          nft_asset_name?: string | null
          quantity?: number
          transaction_hash?: string | null
          status?: string
          created_at?: string
          distributed_at?: string | null
        }
        Update: {
          id?: string
          session_id?: string | null
          recipient_user_id?: string | null
          recipient_address?: string
          nft_policy_id?: string
          nft_asset_name?: string | null
          quantity?: number
          transaction_hash?: string | null
          status?: string
          created_at?: string
          distributed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nft_distributions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "voting_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nft_distributions_recipient_user_id_fkey"
            columns: ["recipient_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      vote_statistics: {
        Row: {
          session_id: string | null
          title: string | null
          is_active: boolean | null
          total_voters: number | null
          verified_voters: number | null
          results: Json | null
        }
      }
      nft_verified_votes: {
        Row: {
          id: number | null
          wallet_address: string | null
          option: string | null
          created_at: string | null
          nft_verified: boolean | null
          policy_id: string | null
          verification_method: string | null
          nft_policy_id: string | null
          nft_count: number | null
          wallet_verification_method: string | null
        }
      }
    }
    Functions: {
      get_user_voting_history: {
        Args: {
          user_uuid: string
        }
        Returns: {
          session_id: string
          session_title: string
          voted_option: string
          voted_at: string
          nft_verified: boolean
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Additional types for better type safety
export type User = Database['public']['Tables']['users']['Row']
export type VotingSession = Database['public']['Tables']['voting_sessions']['Row']
export type SessionVote = Database['public']['Tables']['session_votes']['Row']
export type NFTDistribution = Database['public']['Tables']['nft_distributions']['Row']

export interface VotingOption {
  id: string
  label: string
  description?: string
}