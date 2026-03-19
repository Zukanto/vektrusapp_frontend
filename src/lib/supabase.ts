import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const externalSupabaseUrl = import.meta.env.VITE_EXTERNAL_SUPABASE_URL;
const externalSupabaseAnonKey = import.meta.env.VITE_EXTERNAL_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing internal Supabase environment variables');
}

if (!externalSupabaseUrl || !externalSupabaseAnonKey) {
  throw new Error('Missing external Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const externalSupabase = createClient(externalSupabaseUrl, externalSupabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
        };
      };
      teams: {
        Row: {
          id: string;
          name: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string | null;
          created_at?: string | null;
        };
      };
      team_members: {
        Row: {
          team_id: string;
          user_id: string;
          role: string | null;
          created_at: string | null;
        };
        Insert: {
          team_id: string;
          user_id: string;
          role?: string | null;
          created_at?: string | null;
        };
        Update: {
          team_id?: string;
          user_id?: string;
          role?: string | null;
          created_at?: string | null;
        };
      };
      team_ai_config: {
        Row: {
          team_id: string;
          assistant_id: string;
          created_at: string | null;
        };
        Insert: {
          team_id: string;
          assistant_id: string;
          created_at?: string | null;
        };
        Update: {
          team_id?: string;
          assistant_id?: string;
          created_at?: string | null;
        };
      };
      chat_threads: {
        Row: {
          id: string;
          team_id: string;
          title: string | null;
          openai_thread_id: string | null;
          created_by: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          team_id: string;
          title?: string | null;
          openai_thread_id?: string | null;
          created_by: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          team_id?: string;
          title?: string | null;
          openai_thread_id?: string | null;
          created_by?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          thread_id: string;
          team_id: string;
          role: string;
          content: string;
          meta: Record<string, any>;
          status: string;
          created_by: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          thread_id: string;
          team_id: string;
          role: string;
          content?: string;
          meta?: Record<string, any>;
          status?: string;
          created_by?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          thread_id?: string;
          team_id?: string;
          role?: string;
          content?: string;
          meta?: Record<string, any>;
          status?: string;
          created_by?: string | null;
          created_at?: string | null;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
        };
      };
      stripe_customers: {
        Row: {
          id: number;
          user_id: string;
          customer_id: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          user_id: string;
          customer_id: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          user_id?: string;
          customer_id?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      stripe_subscriptions: {
        Row: {
          id: number;
          customer_id: string;
          subscription_id: string | null;
          price_id: string | null;
          current_period_start: number | null;
          current_period_end: number | null;
          cancel_at_period_end: boolean;
          payment_method_brand: string | null;
          payment_method_last4: string | null;
          status: 'not_started' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'paused';
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          customer_id: string;
          subscription_id?: string | null;
          price_id?: string | null;
          current_period_start?: number | null;
          current_period_end?: number | null;
          cancel_at_period_end?: boolean;
          payment_method_brand?: string | null;
          payment_method_last4?: string | null;
          status: 'not_started' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'paused';
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          customer_id?: string;
          subscription_id?: string | null;
          price_id?: string | null;
          current_period_start?: number | null;
          current_period_end?: number | null;
          cancel_at_period_end?: boolean;
          payment_method_brand?: string | null;
          payment_method_last4?: string | null;
          status?: 'not_started' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'paused';
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      stripe_orders: {
        Row: {
          id: number;
          checkout_session_id: string;
          payment_intent_id: string;
          customer_id: string;
          amount_subtotal: number;
          amount_total: number;
          currency: string;
          payment_status: string;
          status: 'pending' | 'completed' | 'canceled';
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          checkout_session_id: string;
          payment_intent_id: string;
          customer_id: string;
          amount_subtotal: number;
          amount_total: number;
          currency: string;
          payment_status: string;
          status?: 'pending' | 'completed' | 'canceled';
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          checkout_session_id?: string;
          payment_intent_id?: string;
          customer_id?: string;
          amount_subtotal?: number;
          amount_total?: number;
          currency?: string;
          payment_status?: string;
          status?: 'pending' | 'completed' | 'canceled';
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
    };
    Views: {
      stripe_user_subscriptions: {
        Row: {
          customer_id: string;
          subscription_id: string | null;
          subscription_status: 'not_started' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'paused';
          price_id: string | null;
          current_period_start: number | null;
          current_period_end: number | null;
          cancel_at_period_end: boolean;
          payment_method_brand: string | null;
          payment_method_last4: string | null;
        };
      };
      stripe_user_orders: {
        Row: {
          customer_id: string;
          order_id: number;
          checkout_session_id: string;
          payment_intent_id: string;
          amount_subtotal: number;
          amount_total: number;
          currency: string;
          payment_status: string;
          order_status: 'pending' | 'completed' | 'canceled';
          order_date: string;
        };
      };
    };
  };
};