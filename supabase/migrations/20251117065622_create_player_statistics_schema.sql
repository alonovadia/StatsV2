/*
  # Player Statistics Management System

  1. New Tables
    - `players`
      - `id` (uuid, primary key)
      - `player_name` (text, unique, not null)
      - `team` (text, not null)
      - `role` (text)
      - `total_kills` (integer, default 0)
      - `total_assists` (integer, default 0)
      - `total_damage_dealt` (bigint, default 0)
      - `total_damage_taken` (bigint, default 0)
      - `total_amount_healed` (bigint, default 0)
      - `total_games` (integer, default 0)
      - `avg_kills` (numeric)
      - `avg_assists` (numeric)
      - `avg_damage_dealt` (numeric)
      - `avg_damage_taken` (numeric)
      - `avg_amount_healed` (numeric)
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `player_history`
      - `id` (uuid, primary key)
      - `player_id` (uuid, foreign key to players)
      - `kills` (integer, not null)
      - `assists` (integer, not null)
      - `damage_dealt` (bigint, not null)
      - `damage_taken` (bigint, not null)
      - `amount_healed` (bigint, not null)
      - `game_date` (timestamptz, default now)
      - `notes` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for public access (read and write)
*/

CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name text UNIQUE NOT NULL,
  team text NOT NULL DEFAULT '',
  role text DEFAULT 'Unassigned',
  total_kills integer DEFAULT 0,
  total_assists integer DEFAULT 0,
  total_damage_dealt bigint DEFAULT 0,
  total_damage_taken bigint DEFAULT 0,
  total_amount_healed bigint DEFAULT 0,
  total_games integer DEFAULT 0,
  avg_kills numeric DEFAULT 0,
  avg_assists numeric DEFAULT 0,
  avg_damage_dealt numeric DEFAULT 0,
  avg_damage_taken numeric DEFAULT 0,
  avg_amount_healed numeric DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS player_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  kills integer NOT NULL DEFAULT 0,
  assists integer NOT NULL DEFAULT 0,
  damage_dealt bigint NOT NULL DEFAULT 0,
  damage_taken bigint NOT NULL DEFAULT 0,
  amount_healed bigint NOT NULL DEFAULT 0,
  game_date timestamptz DEFAULT now(),
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to players"
  ON players FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert access to players"
  ON players FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update access to players"
  ON players FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to players"
  ON players FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to player_history"
  ON player_history FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert access to player_history"
  ON player_history FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update access to player_history"
  ON player_history FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to player_history"
  ON player_history FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_players_team ON players(team);
CREATE INDEX IF NOT EXISTS idx_players_name ON players(player_name);
CREATE INDEX IF NOT EXISTS idx_player_history_player_id ON player_history(player_id);
CREATE INDEX IF NOT EXISTS idx_player_history_date ON player_history(game_date);