import { X, TrendingUp, Users, Target } from 'lucide-react';
import { Player, TeamStats } from '../lib/supabase';

interface PlayerModalProps {
  player: Player;
  teamStats: TeamStats | null;
  allTeamsStats: TeamStats[];
  onClose: () => void;
}

export function PlayerModal({ player, teamStats, allTeamsStats, onClose }: PlayerModalProps) {
  const calculatePercentDiff = (playerVal: number, avgVal: number) => {
    if (avgVal === 0) return 0;
    return ((playerVal - avgVal) / avgVal) * 100;
  };

  const getPerformanceColor = (diff: number) => {
    if (diff > 20) return 'text-green-600';
    if (diff > 0) return 'text-green-500';
    if (diff > -20) return 'text-orange-500';
    return 'text-red-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{player.player_name}</h2>
            <p className="text-lg text-gray-600 mt-1">
              {player.team} • {player.role}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Combat Stats</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Kills</span>
                  <span className="font-semibold">{player.avg_kills.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Assists</span>
                  <span className="font-semibold">{player.avg_assists.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Games</span>
                  <span className="font-semibold">{player.total_games}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">Damage Stats</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Dealt</span>
                  <span className="font-semibold">{player.avg_damage_dealt.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Taken</span>
                  <span className="font-semibold">{player.avg_damage_taken.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Healed</span>
                  <span className="font-semibold">{player.avg_amount_healed.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Totals</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Kills</span>
                  <span className="font-semibold">{player.total_kills.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Assists</span>
                  <span className="font-semibold">{player.total_assists.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">KDA Ratio</span>
                  <span className="font-semibold">
                    {((player.total_kills + player.total_assists) / Math.max(player.total_games, 1)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {teamStats && (
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Performance vs Team Average</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { label: 'Kills', player: player.avg_kills, team: teamStats.avgKills },
                  { label: 'Assists', player: player.avg_assists, team: teamStats.avgAssists },
                  { label: 'Damage Dealt', player: player.avg_damage_dealt, team: teamStats.avgDamageDealt },
                  { label: 'Damage Taken', player: player.avg_damage_taken, team: teamStats.avgDamageTaken },
                  { label: 'Healing', player: player.avg_amount_healed, team: teamStats.avgAmountHealed }
                ].map((stat) => {
                  const diff = calculatePercentDiff(stat.player, stat.team);
                  return (
                    <div key={stat.label} className="text-center">
                      <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                      <p className={`text-2xl font-bold ${getPerformanceColor(diff)}`}>
                        {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {stat.player.toLocaleString(undefined, { maximumFractionDigits: 0 })} vs {stat.team.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">League-Wide Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-300">
                    <th className="pb-2 font-semibold">Team</th>
                    <th className="pb-2 font-semibold text-right">Avg Kills</th>
                    <th className="pb-2 font-semibold text-right">Avg Assists</th>
                    <th className="pb-2 font-semibold text-right">Avg Damage</th>
                    <th className="pb-2 font-semibold text-right">Players</th>
                  </tr>
                </thead>
                <tbody>
                  {allTeamsStats.map((team) => (
                    <tr
                      key={team.team}
                      className={`border-b border-gray-200 ${
                        team.team === player.team ? 'bg-blue-50 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3">{team.team}</td>
                      <td className="py-3 text-right">{team.avgKills.toFixed(2)}</td>
                      <td className="py-3 text-right">{team.avgAssists.toFixed(2)}</td>
                      <td className="py-3 text-right">{team.avgDamageDealt.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                      <td className="py-3 text-right">{team.totalPlayers}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
