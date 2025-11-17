import { useState } from 'react';
import { Edit2, Save, X, Trash2, Plus, Calendar } from 'lucide-react';
import { Player, PlayerHistory, supabase } from '../lib/supabase';

interface PlayerTicketProps {
  player: Player;
  onUpdate: () => void;
  onDelete: () => void;
  onClick: () => void;
  history: PlayerHistory[];
}

export function PlayerTicket({ player, onUpdate, onDelete, onClick, history }: PlayerTicketProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showAddHistory, setShowAddHistory] = useState(false);
  const [editData, setEditData] = useState({
    team: player.team,
    role: player.role,
    notes: player.notes || ''
  });
  const [historyData, setHistoryData] = useState({
    kills: 0,
    assists: 0,
    damage_dealt: 0,
    damage_taken: 0,
    amount_healed: 0,
    notes: ''
  });

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const { error } = await supabase
      .from('players')
      .update({
        ...editData,
        updated_at: new Date().toISOString()
      })
      .eq('id', player.id);

    if (!error) {
      setIsEditing(false);
      onUpdate();
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete ${player.player_name}?`)) {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', player.id);

      if (!error) {
        onDelete();
      }
    }
  };

  const handleAddHistory = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const { error } = await supabase
      .from('player_history')
      .insert({
        player_id: player.id,
        ...historyData
      });

    if (!error) {
      const newTotalKills = player.total_kills + historyData.kills;
      const newTotalAssists = player.total_assists + historyData.assists;
      const newTotalDamageDealt = player.total_damage_dealt + historyData.damage_dealt;
      const newTotalDamageTaken = player.total_damage_taken + historyData.damage_taken;
      const newTotalHealed = player.total_amount_healed + historyData.amount_healed;
      const newTotalGames = player.total_games + 1;

      await supabase
        .from('players')
        .update({
          total_kills: newTotalKills,
          total_assists: newTotalAssists,
          total_damage_dealt: newTotalDamageDealt,
          total_damage_taken: newTotalDamageTaken,
          total_amount_healed: newTotalHealed,
          total_games: newTotalGames,
          avg_kills: newTotalKills / newTotalGames,
          avg_assists: newTotalAssists / newTotalGames,
          avg_damage_dealt: newTotalDamageDealt / newTotalGames,
          avg_damage_taken: newTotalDamageTaken / newTotalGames,
          avg_amount_healed: newTotalHealed / newTotalGames,
          updated_at: new Date().toISOString()
        })
        .eq('id', player.id);

      setHistoryData({
        kills: 0,
        assists: 0,
        damage_dealt: 0,
        damage_taken: 0,
        amount_healed: 0,
        notes: ''
      });
      setShowAddHistory(false);
      onUpdate();
    }
  };

  const handleDeleteHistory = async (historyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this history record?')) {
      const historyRecord = history.find(h => h.id === historyId);
      if (!historyRecord) return;

      const { error } = await supabase
        .from('player_history')
        .delete()
        .eq('id', historyId);

      if (!error) {
        const newTotalKills = player.total_kills - historyRecord.kills;
        const newTotalAssists = player.total_assists - historyRecord.assists;
        const newTotalDamageDealt = player.total_damage_dealt - historyRecord.damage_dealt;
        const newTotalDamageTaken = player.total_damage_taken - historyRecord.damage_taken;
        const newTotalHealed = player.total_amount_healed - historyRecord.amount_healed;
        const newTotalGames = Math.max(player.total_games - 1, 0);

        await supabase
          .from('players')
          .update({
            total_kills: newTotalKills,
            total_assists: newTotalAssists,
            total_damage_dealt: newTotalDamageDealt,
            total_damage_taken: newTotalDamageTaken,
            total_amount_healed: newTotalHealed,
            total_games: newTotalGames,
            avg_kills: newTotalGames > 0 ? newTotalKills / newTotalGames : 0,
            avg_assists: newTotalGames > 0 ? newTotalAssists / newTotalGames : 0,
            avg_damage_dealt: newTotalGames > 0 ? newTotalDamageDealt / newTotalGames : 0,
            avg_damage_taken: newTotalGames > 0 ? newTotalDamageTaken / newTotalGames : 0,
            avg_amount_healed: newTotalGames > 0 ? newTotalHealed / newTotalGames : 0,
            updated_at: new Date().toISOString()
          })
          .eq('id', player.id);

        onUpdate();
      }
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer hover:border-blue-400"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900">{player.player_name}</h3>
          {isEditing ? (
            <div className="mt-2 space-y-2">
              <input
                type="text"
                value={editData.team}
                onChange={(e) => setEditData({ ...editData, team: e.target.value })}
                onClick={(e) => e.stopPropagation()}
                className="w-full px-2 py-1 border rounded text-sm"
                placeholder="Team"
              />
              <input
                type="text"
                value={editData.role}
                onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                onClick={(e) => e.stopPropagation()}
                className="w-full px-2 py-1 border rounded text-sm"
                placeholder="Role"
              />
              <textarea
                value={editData.notes}
                onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                onClick={(e) => e.stopPropagation()}
                className="w-full px-2 py-1 border rounded text-sm"
                placeholder="Notes"
                rows={2}
              />
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600">{player.team} • {player.role}</p>
              {player.notes && (
                <p className="text-xs text-gray-500 mt-1 italic">{player.notes}</p>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-1 ml-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="p-1 hover:bg-green-100 rounded text-green-600"
                title="Save"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(false);
                }}
                className="p-1 hover:bg-gray-100 rounded"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="p-1 hover:bg-blue-100 rounded text-blue-600"
                title="Edit"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                className="p-1 hover:bg-red-100 rounded text-red-600"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="text-center p-2 bg-blue-50 rounded">
          <p className="text-xs text-gray-600">Kills</p>
          <p className="text-sm font-bold">{player.avg_kills.toFixed(1)}</p>
        </div>
        <div className="text-center p-2 bg-green-50 rounded">
          <p className="text-xs text-gray-600">Assists</p>
          <p className="text-sm font-bold">{player.avg_assists.toFixed(1)}</p>
        </div>
        <div className="text-center p-2 bg-purple-50 rounded">
          <p className="text-xs text-gray-600">Games</p>
          <p className="text-sm font-bold">{player.total_games}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowHistory(!showHistory);
          }}
          className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium transition-colors"
        >
          <Calendar className="w-4 h-4 inline mr-1" />
          History ({history.length})
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowAddHistory(!showAddHistory);
          }}
          className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4 inline" />
        </button>
      </div>

      {showAddHistory && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-3 p-3 bg-gray-50 rounded border border-gray-200"
        >
          <h4 className="font-semibold text-sm mb-2">Add Game Record</h4>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input
              type="number"
              value={historyData.kills}
              onChange={(e) => setHistoryData({ ...historyData, kills: parseInt(e.target.value) || 0 })}
              className="px-2 py-1 border rounded text-sm"
              placeholder="Kills"
            />
            <input
              type="number"
              value={historyData.assists}
              onChange={(e) => setHistoryData({ ...historyData, assists: parseInt(e.target.value) || 0 })}
              className="px-2 py-1 border rounded text-sm"
              placeholder="Assists"
            />
            <input
              type="number"
              value={historyData.damage_dealt}
              onChange={(e) => setHistoryData({ ...historyData, damage_dealt: parseInt(e.target.value) || 0 })}
              className="px-2 py-1 border rounded text-sm"
              placeholder="Damage Dealt"
            />
            <input
              type="number"
              value={historyData.damage_taken}
              onChange={(e) => setHistoryData({ ...historyData, damage_taken: parseInt(e.target.value) || 0 })}
              className="px-2 py-1 border rounded text-sm"
              placeholder="Damage Taken"
            />
            <input
              type="number"
              value={historyData.amount_healed}
              onChange={(e) => setHistoryData({ ...historyData, amount_healed: parseInt(e.target.value) || 0 })}
              className="px-2 py-1 border rounded text-sm col-span-2"
              placeholder="Amount Healed"
            />
            <textarea
              value={historyData.notes}
              onChange={(e) => setHistoryData({ ...historyData, notes: e.target.value })}
              className="px-2 py-1 border rounded text-sm col-span-2"
              placeholder="Notes"
              rows={2}
            />
          </div>
          <button
            onClick={handleAddHistory}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
          >
            Add Record
          </button>
        </div>
      )}

      {showHistory && history.length > 0 && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-3 space-y-2 max-h-60 overflow-y-auto"
        >
          {history.map((record) => (
            <div key={record.id} className="p-2 bg-gray-50 rounded text-xs border border-gray-200">
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-gray-700">
                  {new Date(record.game_date).toLocaleDateString()}
                </span>
                <button
                  onClick={(e) => handleDeleteHistory(record.id, e)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-1 text-gray-600">
                <span>K: {record.kills}</span>
                <span>A: {record.assists}</span>
                <span>D: {record.damage_dealt.toLocaleString()}</span>
              </div>
              {record.notes && (
                <p className="mt-1 text-gray-500 italic">{record.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
