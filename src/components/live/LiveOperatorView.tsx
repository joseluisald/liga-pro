import React, { useState, useEffect } from 'react';
import {
  Radio,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  Goal,
  Activity,
  UserX,
  Star,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowRightLeft,
  X,
  Lock
} from 'lucide-react';
import { Match, MatchEvent, Team, Player, EventType } from '../../types';

interface LiveOperatorViewProps {
  match: Match;
  homeTeam: Team;
  awayTeam: Team;
  players: Player[];
  events: MatchEvent[];
  onUpdateMatch: (id: string, data: Partial<Match>) => void;
  onAddEvent: (event: Partial<MatchEvent>) => void;
  onDeleteEvent: (eventId: string) => void;
  userRole: 'ADMIN' | 'OPERATOR' | 'VIEWER';
}

export const LiveOperatorView: React.FC<LiveOperatorViewProps> = ({
  match,
  homeTeam,
  awayTeam,
  players = [],
  events = [],
  onUpdateMatch,
  onAddEvent,
  onDeleteEvent,
  userRole = 'OPERATOR',
}) => {
  const [isRunning, setIsRunning] = useState<boolean>(match?.status === 'IN_PROGRESS');
  const [currentMinute, setCurrentMinute] = useState<number>(match?.currentMinute || 0);

  const [activeModal, setActiveModal] = useState<EventType | 'LINEUP' | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string>(homeTeam?.id || '');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [selectedAssistId, setSelectedAssistId] = useState<string>('');
  const [cardReason, setCardReason] = useState<string>('');

  const homePlayers = (players || []).filter((p) => p && homeTeam && p.teamId === homeTeam.id);
  const awayPlayers = (players || []).filter((p) => p && awayTeam && p.teamId === awayTeam.id);
  const activeTeamPlayers = selectedTeamId === homeTeam.id ? homePlayers : awayPlayers;

  // Live Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (isRunning && match.status === 'IN_PROGRESS') {
      interval = setInterval(() => {
        setCurrentMinute((prev) => {
          const next = prev + 1;
          onUpdateMatch(match.id, { currentMinute: next });
          return next;
        });
      }, 60000); // 1 min tick
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, match.status]);

  const handleStartMatch = () => {
    setIsRunning(true);
    onUpdateMatch(match.id, { status: 'IN_PROGRESS', currentMinute: 1, halfTime: '1ST' });
  };

  const handlePauseTimer = () => {
    setIsRunning(!isRunning);
  };

  const handleFinishMatch = () => {
    setIsRunning(false);
    onUpdateMatch(match.id, { status: 'FINISHED', halfTime: 'FINISHED' });
  };

  const handleReopenMatch = () => {
    onUpdateMatch(match.id, { status: 'IN_PROGRESS' });
  };

  const handleSaveEvent = () => {
    if (!activeModal || !selectedPlayerId) return;

    onAddEvent({
      matchId: match.id,
      teamId: selectedTeamId,
      type: activeModal as EventType,
      playerId: selectedPlayerId,
      assistantPlayerId: selectedAssistId || undefined,
      minute: currentMinute,
      reason: cardReason || undefined,
    });

    setActiveModal(null);
    setSelectedPlayerId('');
    setSelectedAssistId('');
    setCardReason('');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in max-w-5xl mx-auto">
      {/* Live Operator Scoreboard Panel */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 rounded-3xl p-6 text-white border-2 border-rose-500/30 shadow-2xl relative overflow-hidden">
        {/* Top Status Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs font-bold">
          <span className="flex items-center gap-2 text-rose-500 uppercase tracking-wider">
            <Radio className="w-4 h-4 animate-ping" />
            Mesa de Operação Ao Vivo
          </span>

          <span className="text-slate-400">
            {match.location} | Árbitro: {match.referee || 'Mesa'}
          </span>
        </div>

        {/* Big Digital Scoreboard */}
        <div className="grid grid-cols-3 items-center py-8 text-center">
          {/* Home Team */}
          <div className="space-y-2">
            <div
              className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center font-black text-xl border-2 border-white/20 shadow-lg"
              style={{ backgroundColor: homeTeam.primaryColor }}
            >
              {homeTeam.shortName}
            </div>
            <h2 className="text-lg sm:text-xl font-black drop-shadow">{homeTeam.name}</h2>
            <span className="text-xs text-slate-400 font-semibold">Mandante</span>
          </div>

          {/* Live Score & Timer Center */}
          <div className="space-y-3">
            <div className="text-4xl sm:text-6xl font-black font-mono tracking-wider flex items-center justify-center gap-3">
              <span className="bg-slate-800 px-4 py-2 rounded-2xl border border-slate-700">{match.homeScore}</span>
              <span className="text-rose-500 animate-pulse">:</span>
              <span className="bg-slate-800 px-4 py-2 rounded-2xl border border-slate-700">{match.awayScore}</span>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-800 rounded-full border border-slate-700 font-mono text-sm font-bold text-amber-400">
              <Clock className="w-4 h-4" />
              <span>{currentMinute}' min</span>
              <span className="text-[10px] text-slate-400 font-sans">
                ({match.halfTime === '1ST' ? '1º T' : match.halfTime === '2ND' ? '2º T' : 'Fim'})
              </span>
            </div>
          </div>

          {/* Away Team */}
          <div className="space-y-2">
            <div
              className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center font-black text-xl border-2 border-white/20 shadow-lg"
              style={{ backgroundColor: awayTeam.primaryColor }}
            >
              {awayTeam.shortName}
            </div>
            <h2 className="text-lg sm:text-xl font-black drop-shadow">{awayTeam.name}</h2>
            <span className="text-xs text-slate-400 font-semibold">Visitante</span>
          </div>
        </div>

        {/* Timer Control Bar */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {match.status !== 'IN_PROGRESS' && match.status !== 'FINISHED' && (
              <button
                onClick={handleStartMatch}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg"
              >
                <Play className="w-4 h-4" />
                Iniciar Partida
              </button>
            )}

            {match.status === 'IN_PROGRESS' && (
              <>
                <button
                  onClick={handlePauseTimer}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-extrabold rounded-xl text-xs flex items-center gap-2"
                >
                  <Pause className="w-4 h-4" />
                  {isRunning ? 'Pausar' : 'Retomar'}
                </button>

                <button
                  onClick={() => {
                    const next = currentMinute + 1;
                    setCurrentMinute(next);
                    onUpdateMatch(match.id, { currentMinute: next });
                  }}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
                >
                  +1 Min
                </button>
              </>
            )}
          </div>

          {match.status === 'IN_PROGRESS' && (
            <button
              onClick={handleFinishMatch}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg"
            >
              <CheckCircle className="w-4 h-4" />
              Encerrar Partida
            </button>
          )}

          {match.status === 'FINISHED' && userRole === 'ADMIN' && (
            <button
              onClick={handleReopenMatch}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
              Reabrir Partida (Admin)
            </button>
          )}
        </div>
      </div>

      {/* Rapid Action Event Buttons */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Plus className="w-4 h-4 text-emerald-500" />
          Registrar Evento da Partida em Tempo Real
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setActiveModal('GOAL')}
            className="p-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-2xl flex flex-col items-center justify-center gap-2 font-black text-xs transition-all shadow-sm"
          >
            <Goal className="w-6 h-6" />
            Registrar Gol
          </button>

          <button
            onClick={() => setActiveModal('YELLOW_CARD')}
            className="p-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-2xl flex flex-col items-center justify-center gap-2 font-black text-xs transition-all shadow-sm"
          >
            <Activity className="w-6 h-6" />
            Cartão Amarelo
          </button>

          <button
            onClick={() => setActiveModal('RED_CARD')}
            className="p-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 rounded-2xl flex flex-col items-center justify-center gap-2 font-black text-xs transition-all shadow-sm"
          >
            <UserX className="w-6 h-6" />
            Cartão Vermelho
          </button>

          <button
            onClick={() => setActiveModal('SUBSTITUTION')}
            className="p-4 bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30 rounded-2xl flex flex-col items-center justify-center gap-2 font-black text-xs transition-all shadow-sm"
          >
            <ArrowRightLeft className="w-6 h-6" />
            Substituição
          </button>
        </div>
      </div>

      {/* Match Event Timeline Log */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-500" />
          Linha do Tempo de Ocorrências
        </h3>

        <div className="space-y-2">
          {events.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4 text-center">Nenhum evento registrado até o momento.</p>
          ) : (
            events.map((ev) => {
              const team = ev.teamId === homeTeam.id ? homeTeam : awayTeam;
              const player = players.find((p) => p.id === ev.playerId);

              return (
                <div
                  key={ev.id}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-amber-500">{ev.minute}'</span>
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: team.primaryColor }} />
                    <span className="font-extrabold text-slate-900 dark:text-white">[{team.shortName}]</span>
                    <span className="text-slate-800 dark:text-slate-200">
                      {ev.type === 'GOAL' && '⚽ GOL de '}
                      {ev.type === 'YELLOW_CARD' && '🟨 Cartão Amarelo para '}
                      {ev.type === 'RED_CARD' && '🟥 Cartão Vermelho para '}
                      {player?.fullName} {ev.reason ? `(${ev.reason})` : ''}
                    </span>
                  </div>

                  <button
                    onClick={() => onDeleteEvent(ev.id)}
                    className="p-1 hover:bg-rose-500/10 text-rose-500 rounded"
                    title="Excluir Evento"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Event Add Modal */}
      {activeModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Registrar {activeModal} (aos {currentMinute}')
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Equipe</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedTeamId(homeTeam.id)}
                    className={`p-2.5 rounded-xl border text-xs font-bold ${
                      selectedTeamId === homeTeam.id
                        ? 'bg-slate-900 text-white border-emerald-500'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600'
                    }`}
                  >
                    {homeTeam.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTeamId(awayTeam.id)}
                    className={`p-2.5 rounded-xl border text-xs font-bold ${
                      selectedTeamId === awayTeam.id
                        ? 'bg-slate-900 text-white border-emerald-500'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600'
                    }`}
                  >
                    {awayTeam.name}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Selecione o Atleta</label>
                <select
                  value={selectedPlayerId}
                  onChange={(e) => setSelectedPlayerId(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                >
                  <option value="">Selecione...</option>
                  {activeTeamPlayers.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.shirtNumber || '-'} {p.fullName} ({p.position})
                    </option>
                  ))}
                </select>
              </div>

              {(activeModal === 'YELLOW_CARD' || activeModal === 'RED_CARD') && (
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Motivo da Advertência</label>
                  <input
                    type="text"
                    placeholder="Ex: Falta tática, Reclamação, Carrinho"
                    value={cardReason}
                    onChange={(e) => setCardReason(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEvent}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md"
              >
                Confirmar Evento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
