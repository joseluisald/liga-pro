import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Radio,
  Clock,
  CheckCircle2,
  MapPin,
  Users,
  Search,
  Sliders,
  Sparkles,
  Edit2,
  X
} from 'lucide-react';
import { Match, Team, Phase } from '../../types';

interface MatchesViewProps {
  matches: Match[];
  teams: Team[];
  phases: Phase[];
  onCreateMatch: (m: Partial<Match>) => void;
  onUpdateMatch: (id: string, m: Partial<Match>) => void;
  onOpenLiveOperator: (matchId: string) => void;
  userRole: 'ADMIN' | 'OPERATOR' | 'VIEWER';
  autoOpenCreateModal?: boolean;
  onCloseAutoOpen?: () => void;
}

export const MatchesView: React.FC<MatchesViewProps> = ({
  matches = [],
  teams = [],
  phases = [],
  onCreateMatch,
  onUpdateMatch,
  onOpenLiveOperator,
  userRole = 'ADMIN',
  autoOpenCreateModal,
  onCloseAutoOpen,
}) => {
  const [selectedRound, setSelectedRound] = useState<number | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedTeam, setSelectedTeam] = useState<string>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Partial<Match> | null>(null);

  useEffect(() => {
    if (autoOpenCreateModal) {
      handleOpenAddModal();
      if (onCloseAutoOpen) {
        onCloseAutoOpen();
      }
    }
  }, [autoOpenCreateModal]);

  const filteredMatches = (matches || []).filter((m) => {
    const matchesRound = selectedRound === 'ALL' || m.roundNumber === selectedRound;
    const matchesStat = selectedStatus === 'ALL' || m.status === selectedStatus;
    const matchesT =
      selectedTeam === 'ALL' || m.homeTeamId === selectedTeam || m.awayTeamId === selectedTeam;

    return matchesRound && matchesStat && matchesT;
  });

  const handleOpenAddModal = () => {
    setEditingMatch({
      homeTeamId: teams[0]?.id || '',
      awayTeamId: teams[1]?.id || '',
      date: new Date().toISOString().split('T')[0],
      time: '15:00',
      location: 'Arena Park - Campo 1',
      referee: 'Árbitro Principal',
      status: 'SCHEDULED',
      roundNumber: 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (m: Match) => {
    setEditingMatch({ ...m });
    setIsModalOpen(true);
  };

  const handleSaveMatch = () => {
    if (!editingMatch || !editingMatch.homeTeamId || !editingMatch.awayTeamId) return;

    if (editingMatch.id) {
      onUpdateMatch(editingMatch.id, editingMatch);
    } else {
      onCreateMatch(editingMatch);
    }

    setIsModalOpen(false);
    setEditingMatch(null);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-emerald-500" />
            Tabela de Jogos & Calendário
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Total de {(matches || []).length} partidas no campeonato ({(matches || []).filter((m) => m && m.status === 'FINISHED').length} encerradas)
          </p>
        </div>

        {userRole === 'ADMIN' && (
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            Agendar Partida
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Round Selector */}
          <select
            value={selectedRound}
            onChange={(e) => setSelectedRound(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
          >
            <option value="ALL">Todas as Rodadas</option>
            <option value="1">Rodada 1</option>
            <option value="2">Rodada 2</option>
            <option value="3">Rodada 3</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
          >
            <option value="ALL">Todos os Status</option>
            <option value="SCHEDULED">Agendadas</option>
            <option value="IN_PROGRESS">Ao Vivo / Em Andamento</option>
            <option value="FINISHED">Finalizadas</option>
          </select>

          {/* Team Filter */}
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
          >
            <option value="ALL">Todos os Times</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Matches List */}
      <div className="space-y-4">
        {filteredMatches.map((m) => {
          const home = teams.find((t) => t.id === m.homeTeamId);
          const away = teams.find((t) => t.id === m.awayTeamId);

          return (
            <div
              key={m.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 shadow-sm transition-all ${
                m.status === 'IN_PROGRESS'
                  ? 'border-rose-500/50 ring-2 ring-rose-500/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Round & Meta */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold">
                    Rodada {m.roundNumber || 1}
                  </span>

                  {m.status === 'IN_PROGRESS' && (
                    <span className="px-2.5 py-1 bg-rose-500 text-white rounded-lg text-xs font-extrabold flex items-center gap-1 animate-pulse">
                      <Radio className="w-3.5 h-3.5" />
                      AO VIVO ({m.currentMinute}')
                    </span>
                  )}

                  {m.status === 'FINISHED' && (
                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold">
                      Encerrado
                    </span>
                  )}

                  {m.status === 'SCHEDULED' && (
                    <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-lg text-xs font-bold">
                      Agendado
                    </span>
                  )}
                </div>

                {/* Scoreboard Display */}
                <div className="flex items-center gap-4 text-slate-900 dark:text-white font-black text-base sm:text-lg">
                  {/* Home Team */}
                  <div className="flex items-center gap-2 text-right justify-end w-40">
                    <span className="truncate">{home?.name}</span>
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: home?.primaryColor }} />
                  </div>

                  {/* Score */}
                  <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-mono text-xl flex items-center gap-2">
                    <span>{m.status === 'SCHEDULED' ? '-' : m.homeScore}</span>
                    <span className="text-slate-400 font-sans text-xs">x</span>
                    <span>{m.status === 'SCHEDULED' ? '-' : m.awayScore}</span>
                  </div>

                  {/* Away Team */}
                  <div className="flex items-center gap-2 text-left justify-start w-40">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: away?.primaryColor }} />
                    <span className="truncate">{away?.name}</span>
                  </div>
                </div>

                {/* Date / Location & Actions */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  <div className="text-right text-xs text-slate-500">
                    <p className="font-semibold">{m.date} às {m.time}</p>
                    <p className="text-[10px]">{m.location}</p>
                  </div>

                  <button
                    onClick={() => onOpenLiveOperator(m.id)}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    Operar
                  </button>

                  {userRole === 'ADMIN' && (
                    <button
                      onClick={() => handleOpenEditModal(m)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Match Modal */}
      {isModalOpen && editingMatch && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                {editingMatch.id ? 'Editar Partida' : 'Agendar Nova Partida'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Time Mandante</label>
                <select
                  value={editingMatch.homeTeamId || ''}
                  onChange={(e) => setEditingMatch({ ...editingMatch, homeTeamId: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Time Visitante</label>
                <select
                  value={editingMatch.awayTeamId || ''}
                  onChange={(e) => setEditingMatch({ ...editingMatch, awayTeamId: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Data</label>
                  <input
                    type="date"
                    value={editingMatch.date || ''}
                    onChange={(e) => setEditingMatch({ ...editingMatch, date: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Horário</label>
                  <input
                    type="time"
                    value={editingMatch.time || '15:00'}
                    onChange={(e) => setEditingMatch({ ...editingMatch, time: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Local / Campo</label>
                <input
                  type="text"
                  value={editingMatch.location || ''}
                  onChange={(e) => setEditingMatch({ ...editingMatch, location: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveMatch}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md"
              >
                Salvar Partida
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
