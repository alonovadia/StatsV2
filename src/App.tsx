import { useEffect, useState } from 'react';
import { Upload, Search, Filter, Download, Users } from 'lucide-react';
import { Player, PlayerHistory, TeamStats, supabase } from './lib/supabase';
import { importCSVData } from './utils/csvImport';
import { PlayerTicket } from './components/PlayerTicket';
import { PlayerModal } from './components/PlayerModal';

function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerHistories, setPlayerHistories] = useState<Record<string, PlayerHistory[]>>({});
  const [teamStats, setTeamStats] = useState<Record<string, TeamStats>>({});
  const [allTeamsStats, setAllTeamsStats] = useState<TeamStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTeam, setFilterTeam] = useState('all');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const fetchPlayers = async () => {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('avg_kills', { ascending: false });

    if (!error && data) {
      setPlayers(data);
      calculateTeamStats(data);
    }
  };

  const fetchPlayerHistory = async (playerId: string) => {
    const { data } = await supabase
      .from('player_history')
      .select('*')
      .eq('player_id', playerId)
      .order('game_date', { ascending: false });

    if (data) {
      setPlayerHistories(prev => ({ ...prev, [playerId]: data }));
    }
  };

  const calculateTeamStats = (playerData: Player[]) => {
    const teamMap: Record<string, Player[]> = {};

    playerData.forEach(player => {
      if (!teamMap[player.team]) {
        teamMap[player.team] = [];
      }
      teamMap[player.team].push(player);
    });

    const stats: Record<string, TeamStats> = {};
    const allStats: TeamStats[] = [];

    Object.entries(teamMap).forEach(([team, teamPlayers]) => {
      const stat: TeamStats = {
        team,
        avgKills: teamPlayers.reduce((sum, p) => sum + p.avg_kills, 0) / teamPlayers.length,
        avgAssists: teamPlayers.reduce((sum, p) => sum + p.avg_assists, 0) / teamPlayers.length,
        avgDamageDealt: teamPlayers.reduce((sum, p) => sum + p.avg_damage_dealt, 0) / teamPlayers.length,
        avgDamageTaken: teamPlayers.reduce((sum, p) => sum + p.avg_damage_taken, 0) / teamPlayers.length,
        avgAmountHealed: teamPlayers.reduce((sum, p) => sum + p.avg_amount_healed, 0) / teamPlayers.length,
        totalPlayers: teamPlayers.length
      };
      stats[team] = stat;
      allStats.push(stat);
    });

    setTeamStats(stats);
    setAllTeamsStats(allStats.sort((a, b) => b.avgKills - a.avgKills));
  };

  useEffect(() => {
    fetchPlayers().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    players.forEach(player => {
      if (!playerHistories[player.id]) {
        fetchPlayerHistory(player.id);
      }
    });
  }, [players]);

  const handleImport = async () => {
    setImporting(true);
    const result = await importCSVData();
    if (result.success) {
      await fetchPlayers();
      alert(`Successfully imported ${result.count} players!`);
    } else {
      alert('Failed to import data. Check console for details.');
    }
    setImporting(false);
  };

  const handleExport = () => {
    const csv = [
      ['Player Name', 'Team', 'Role', 'Avg Kills', 'Avg Assists', 'Avg Damage Dealt', 'Total Games'].join(','),
      ...filteredPlayers.map(p =>
        [p.player_name, p.team, p.role, p.avg_kills, p.avg_assists, p.avg_damage_dealt, p.total_games].join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `player-stats-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.player_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         player.team.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTeam = filterTeam === 'all' || player.team === filterTeam;
    return matchesSearch && matchesTeam;
  });

  const teams = Array.from(new Set(players.map(p => p.team))).sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading player data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Player Statistics Dashboard
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Manage and analyze player performance data
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleImport}
                disabled={importing}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                {importing ? 'Importing...' : 'Import CSV'}
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Total Players</p>
              <p className="text-3xl font-bold text-gray-900">{players.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Total Teams</p>
              <p className="text-3xl font-bold text-gray-900">{teams.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Avg Games/Player</p>
              <p className="text-3xl font-bold text-gray-900">
                {(players.reduce((sum, p) => sum + p.total_games, 0) / players.length || 0).toFixed(1)}
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search players or teams..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="relative min-w-[200px]">
                <Filter className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  value={filterTeam}
                  onChange={(e) => setFilterTeam(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">All Teams</option>
                  {teams.map(team => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {filteredPlayers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No players found. Try adjusting your filters or import data.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPlayers.map((player) => (
              <PlayerTicket
                key={player.id}
                player={player}
                history={playerHistories[player.id] || []}
                onUpdate={fetchPlayers}
                onDelete={fetchPlayers}
                onClick={() => setSelectedPlayer(player)}
              />
            ))}
          </div>
        )}

        {selectedPlayer && (
          <PlayerModal
            player={selectedPlayer}
            teamStats={teamStats[selectedPlayer.team] || null}
            allTeamsStats={allTeamsStats}
            onClose={() => setSelectedPlayer(null)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
