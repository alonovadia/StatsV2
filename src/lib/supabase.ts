import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Player {
  id: string;
  player_name: string;
  team: string;
  role: string;
  total_kills: number;
  total_assists: number;
  total_damage_dealt: number;
  total_damage_taken: number;
  total_amount_healed: number;
  total_games: number;
  avg_kills: number;
  avg_assists: number;
  avg_damage_dealt: number;
  avg_damage_taken: number;
  avg_amount_healed: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PlayerHistory {
  id: string;
  player_id: string;
  kills: number;
  assists: number;
  damage_dealt: number;
  damage_taken: number;
  amount_healed: number;
  game_date: string;
  notes?: string;
  created_at: string;
}

export interface TeamStats {
  team: string;
  avgKills: number;
  avgAssists: number;
  avgDamageDealt: number;
  avgDamageTaken: number;
  avgAmountHealed: number;
  totalPlayers: number;
}
