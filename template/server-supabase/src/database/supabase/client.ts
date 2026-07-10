import { createClient } from '@supabase/supabase-js';
import { appConfig } from '../../config/app.config';

// Row/Insert/Update shapes for the `users` table, in DB (snake_case) form.
// Typing the client with this schema keeps every `supabase.from('users')`
// query fully typed — no `any` leaks into the repository layer.
// These MUST be `type` aliases, not `interface`. Supabase's schema generics
// require each table's Row/Insert/Update to satisfy `Record<string, unknown>`,
// and object-literal `type`s carry the implicit index signature that satisfies
// it — `interface`s do not, which silently collapses the schema to `never`.
export type UserRow = {
  id: string;
  email: string;
  password: string;
  name: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type UserInsert = {
  id?: string;
  email: string;
  password: string;
  name?: string | null;
  role?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type UserUpdate = {
  email?: string;
  password?: string;
  name?: string | null;
  role?: string;
  is_active?: boolean;
  updated_at?: string;
};

export type Database = {
  public: {
    Tables: {
      users: {
        Row: UserRow;
        Insert: UserInsert;
        Update: UserUpdate;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

// Trusted backend client. The SERVICE-ROLE key bypasses RLS, which is why this
// key must never reach the browser. Sessions are disabled — this is a stateless
// server process, so there is nothing to persist or refresh.
export const supabase = createClient<Database>(
  appConfig.supabase.url,
  appConfig.supabase.serviceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);

export default supabase;
