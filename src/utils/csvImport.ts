import { supabase } from '../lib/supabase';

export async function importCSVData() {
  try {
    const response = await fetch('/src/data/player-statistics-2025-11-17.csv');
    const csvText = await response.text();

    const lines = csvText.split('\n');
    const headers = lines[0].split(',');

    const players = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const values = lines[i].match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g);
      if (!values || values.length < 13) continue;

      const cleanValue = (val: string) => val.replace(/^"|"$/g, '').trim();

      players.push({
        player_name: cleanValue(values[0]),
        team: cleanValue(values[1]),
        role: cleanValue(values[2]),
        total_kills: parseInt(cleanValue(values[3])) || 0,
        total_assists: parseInt(cleanValue(values[4])) || 0,
        total_damage_dealt: parseInt(cleanValue(values[5])) || 0,
        total_damage_taken: parseInt(cleanValue(values[6])) || 0,
        total_amount_healed: parseInt(cleanValue(values[7])) || 0,
        total_games: parseInt(cleanValue(values[8])) || 0,
        avg_kills: parseFloat(cleanValue(values[9])) || 0,
        avg_assists: parseFloat(cleanValue(values[10])) || 0,
        avg_damage_dealt: parseFloat(cleanValue(values[11])) || 0,
        avg_damage_taken: parseFloat(cleanValue(values[12])) || 0,
        avg_amount_healed: parseFloat(cleanValue(values[13])) || 0
      });
    }

    const { data, error } = await supabase
      .from('players')
      .upsert(players, { onConflict: 'player_name' });

    if (error) throw error;

    return { success: true, count: players.length };
  } catch (error) {
    console.error('Error importing CSV:', error);
    return { success: false, error };
  }
}
