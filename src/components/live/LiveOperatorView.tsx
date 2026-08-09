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
  matchDurationMinutes?: number;
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
  matchDurationMinutes = 40,
}) => {
  const matchDuration = matchDurationMinutes || 40;
  const halfDuration = Math.max(1, Math.floor(matchDuration / 2)); // e.g. 20 min per half for 40 min match

  const [isRunning, setIsRunning] = useState<boolean>(match?.status === 'IN_PROGRESS');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(() => {
    if (match?.currentMinute) return match.currentMinute * 60;
    return 0;
  });

  const [showTimeEditModal, setShowTimeEditModal] = useState<boolean>(false);
  const [editMinutes, setEditMinutes] = useState<number>(0);
  const [editSeconds, setEditSeconds] = useState<number>(0);

  const [activeModal, setActiveModal] = useState<EventType | 'LINEUP' | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string>(homeTeam?.id || '');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [selectedAssistId, setSelectedAssistId] = useState<string>('');
  const [cardReason, setCardReason] = useState<string>('');

  const homePlayers = (players || []).filter((p) => p && homeTeam && p.teamId === homeTeam.id);
  const awayPlayers = (players || []).filter((p) => p && awayTeam && p.teamId === awayTeam.id);
  const activeTeamPlayers = selectedTeamId === homeTeam.id ? homePlayers : awayPlayers;

  // Live Digital Clock Timer Effect (ticks every 1s)
  useEffect(() => {
    let interval: any = null;
    if (isRunning && match.status === 'IN_PROGRESS') {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev + 1;
          const calcMin = Math.max(1, Math.ceil(next / 60));
          // Update match current minute in backend/parent every 5s or on minute change
          if (next % 5 === 0) {
            onUpdateMatch(match.id, { currentMinute: calcMin });
          }
          return next;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, match.status, match.id]);

  const currentMinute = Math.max(1, Math.ceil(elapsedSeconds / 60));

  const formatMMSS = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Period specific time calculations
  const is2ndHalf = match.halfTime === '2ND';
  const halfDurationSecs = halfDuration * 60;

  // Seconds in current half
  const periodSeconds = is2ndHalf
    ? Math.max(0, elapsedSeconds - halfDurationSecs)
    : elapsedSeconds;

  const isStoppageTime = periodSeconds > halfDurationSecs;
  const stoppageSeconds = isStoppageTime ? periodSeconds - halfDurationSecs : 0;

  // Percentage of current half completed
  const progressPercentage = Math.min(
    100,
    Math.max(0, (periodSeconds / halfDurationSecs) * 100)
  );

  const handleStart1stHalf = () => {
    setIsRunning(true);
    setElapsedSeconds(0);
    onUpdateMatch(match.id, { status: 'IN_PROGRESS', halfTime: '1ST', currentMinute: 1 });
  };

  const handleGoToHalfTime = () => {
    setIsRunning(false);
    const minSecs = halfDurationSecs;
    const finalSecs = elapsedSeconds < minSecs ? minSecs : elapsedSeconds;
    setElapsedSeconds(finalSecs);
    onUpdateMatch(match.id, {
      status: 'IN_PROGRESS',
      halfTime: 'HALF',
      currentMinute: Math.ceil(finalSecs / 60),
    });
  };

  const handleStart2ndHalf = () => {
    setIsRunning(true);
    const start2ndSecs = halfDurationSecs;
    const finalSecs = elapsedSeconds < start2ndSecs ? start2ndSecs : elapsedSeconds;
    setElapsedSeconds(finalSecs);
    onUpdateMatch(match.id, {
      status: 'IN_PROGRESS',
      halfTime: '2ND',
      currentMinute: Math.ceil(finalSecs / 60),
    });
  };

  const handlePauseTimer = () => {
    setIsRunning(!isRunning);
  };

  const handleFinishMatch = () => {
    setIsRunning(false);
    onUpdateMatch(match.id, { status: 'FINISHED', halfTime: 'FINISHED' });
  };

  const handleReopenMatch = () => {
    onUpdateMatch(match.id, { status: 'IN_PROGRESS', halfTime: '1ST' });
  };

  const handleAdjustSeconds = (delta: number) => {
    setElapsedSeconds((prev) => {
      const next = Math.max(0, prev + delta);
      onUpdateMatch(match.id, { currentMinute: Math.max(1, Math.ceil(next / 60)) });
      return next;
    });
  };

  const handleApplyTimeEdit = () => {
    const total = editMinutes * 60 + editSeconds;
    setElapsedSeconds(total);
    onUpdateMatch(match.id, { currentMinute: Math.max(1, Math.ceil(total / 60)) });
    setShowTimeEditModal(false);
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
          <div className="space-y-3 flex flex-col items-center">
            <div className="text-4xl sm:text-6xl font-black font-mono tracking-wider flex items-center justify-center gap-3">
              <span className="bg-slate-800 px-4 py-2 rounded-2xl border border-slate-700 shadow-inner">{match.homeScore}</span>
              <span className="text-rose-500 animate-pulse">:</span>
              <span className="bg-slate-800 px-4 py-2 rounded-2xl border border-slate-700 shadow-inner">{match.awayScore}</span>
            </div>

            {/* Digital Clock Banner */}
            <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl px-5 py-2.5 flex flex-col items-center gap-1 shadow-lg min-w-[240px]">
              <div className="flex items-center gap-2">
                <Clock className={`w-4 h-4 ${isRunning ? 'text-emerald-400 animate-spin' : 'text-amber-400'}`} />
                <span className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">
                  {formatMMSS(periodSeconds)}
                </span>
                {isStoppageTime && (
                  <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/20 px-1.5 py-0.5 rounded border border-rose-500/30 animate-pulse">
                    +{formatMMSS(stoppageSeconds)}
                  </span>
                )}
              </div>

              {/* Half / Period Status */}
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <span className="px-2.5 py-0.5 bg-slate-800 rounded-full border border-slate-700 text-[11px] text-amber-300 font-bold">
                  {match.halfTime === '1ST' && `1º Tempo (${halfDuration} min)`}
                  {match.halfTime === 'HALF' && 'Intervalo'}
                  {match.halfTime === '2ND' && `2º Tempo (${halfDuration} min)`}
                  {match.halfTime === 'FINISHED' && 'Fim de Jogo'}
                  {(!match.halfTime || match.status === 'SCHEDULED') && `A Iniciar (${matchDuration} min total)`}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">({currentMinute}' min total)</span>
              </div>

              {/* Progress Bar for Current Half */}
              {match.status === 'IN_PROGRESS' && match.halfTime !== 'HALF' && (
                <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden border border-slate-700">
                  <div
                    className={`h-full transition-all duration-300 ${isStoppageTime ? 'bg-rose-500 animate-pulse' : 'bg-emerald-400'}`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              )}
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
          <div className="flex flex-wrap items-center gap-2">
            {match.status !== 'IN_PROGRESS' && match.status !== 'FINISHED' && (
              <button
                onClick={handleStart1stHalf}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                Iniciar 1º Tempo ({halfDuration} min)
              </button>
            )}

            {match.status === 'IN_PROGRESS' && (
              <>
                <button
                  onClick={handlePauseTimer}
                  className={`px-4 py-2 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 transition-all ${
                    isRunning
                      ? 'bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-950/40'
                      : 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-950/40'
                  }`}
                >
                  {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  {isRunning ? 'Pausar Relógio' : 'Retomar Relógio'}
                </button>

                {match.halfTime === '1ST' && (
                  <button
                    onClick={handleGoToHalfTime}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 transition-all"
                  >
                    <Clock className="w-4 h-4" />
                    Ir p/ Intervalo (Fim 1ºT)
                  </button>
                )}

                {match.halfTime === 'HALF' && (
                  <button
                    onClick={handleStart2ndHalf}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-950/40"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Iniciar 2º Tempo ({halfDuration} min)
                  </button>
                )}

                {/* Quick Time Adjusters */}
                <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
                  <button
                    onClick={() => handleAdjustSeconds(-60)}
                    className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 font-mono text-[11px] font-bold rounded-lg"
                    title="Voltar 1 minuto"
                  >
                    -1m
                  </button>
                  <button
                    onClick={() => handleAdjustSeconds(-10)}
                    className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 font-mono text-[11px] font-bold rounded-lg"
                    title="Voltar 10 segundos"
                  >
                    -10s
                  </button>
                  <button
                    onClick={() => handleAdjustSeconds(10)}
                    className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 font-mono text-[11px] font-bold rounded-lg"
                    title="Avançar 10 segundos"
                  >
                    +10s
                  </button>
                  <button
                    onClick={() => handleAdjustSeconds(60)}
                    className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 font-mono text-[11px] font-bold rounded-lg"
                    title="Avançar 1 minuto"
                  >
                    +1m
                  </button>
                </div>

                <button
                  onClick={() => {
                    setEditMinutes(Math.floor(elapsedSeconds / 60));
                    setEditSeconds(elapsedSeconds % 60);
                    setShowTimeEditModal(true);
                  }}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-slate-700"
                  title="Ajustar tempo do jogo"
                >
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  Ajustar Tempo
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
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
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs flex items-center gap-2 border border-slate-700"
              >
                <RotateCcw className="w-4 h-4 text-amber-400" />
                Reabrir Partida (Admin)
              </button>
            )}
          </div>
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
            onClick={() => { setSelectedTeamId(homeTeam.id); setActiveModal('GOAL'); }}
            className="p-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-2xl flex flex-col items-center justify-center gap-2 font-black text-xs transition-all shadow-sm"
          >
            <Goal className="w-6 h-6" />
            Registrar Gol
          </button>

          <button
            onClick={() => { setSelectedTeamId(homeTeam.id); setActiveModal('YELLOW_CARD'); }}
            className="p-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-2xl flex flex-col items-center justify-center gap-2 font-black text-xs transition-all shadow-sm"
          >
            <Activity className="w-6 h-6" />
            Cartão Amarelo
          </button>

          <button
            onClick={() => { setSelectedTeamId(homeTeam.id); setActiveModal('RED_CARD'); }}
            className="p-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 rounded-2xl flex flex-col items-center justify-center gap-2 font-black text-xs transition-all shadow-sm"
          >
            <UserX className="w-6 h-6" />
            Cartão Vermelho
          </button>

          <button
            onClick={() => { setSelectedTeamId(homeTeam.id); setActiveModal('SUBSTITUTION'); }}
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
                      {(ev.type === 'GOAL' || ev.type === 'GOAL_NORMAL') && '⚽ GOL de '}
                      {ev.type === 'PENALTY_GOAL' && '⚽ GOL (Pênalti) de '}
                      {ev.type === 'OWN_GOAL' && '⚽ GOL Contra de '}
                      {ev.type === 'YELLOW_CARD' && '🟨 Cartão Amarelo para '}
                      {ev.type === 'RED_CARD' && '🟥 Cartão Vermelho para '}
                      {ev.type === 'SUBSTITUTION' && '🔄 Substituição para '}
                      {player?.fullName || 'Atleta'} {ev.reason ? `(${ev.reason})` : ''}
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

      {/* Manual Time Adjuster Modal */}
      {showTimeEditModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                Ajustar Cronômetro
              </h3>
              <button onClick={() => setShowTimeEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Defina o tempo exato de jogo ou utilize um dos atalhos rápidos abaixo:
            </p>

            <div className="flex items-center justify-center gap-3 py-2">
              <div className="text-center">
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Minutos</label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={editMinutes}
                  onChange={(e) => setEditMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-20 text-center text-2xl font-black font-mono px-2 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>
              <span className="text-2xl font-black text-slate-400 mt-4">:</span>
              <div className="text-center">
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Segundos</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={editSeconds}
                  onChange={(e) => setEditSeconds(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-20 text-center text-2xl font-black font-mono px-2 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Atalhos de Tempo</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { setEditMinutes(0); setEditSeconds(0); }}
                  className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  00:00 (Início)
                </button>
                <button
                  type="button"
                  onClick={() => { setEditMinutes(Math.floor(halfDuration / 2)); setEditSeconds(0); }}
                  className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  {Math.floor(halfDuration / 2)}:00 (Metade 1ºT)
                </button>
                <button
                  type="button"
                  onClick={() => { setEditMinutes(halfDuration); setEditSeconds(0); }}
                  className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  {halfDuration}:00 (Fim 1ºT)
                </button>
                <button
                  type="button"
                  onClick={() => { setEditMinutes(matchDuration); setEditSeconds(0); }}
                  className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  {matchDuration}:00 (Fim 2ºT)
                </button>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowTimeEditModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleApplyTimeEdit}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs shadow-md"
              >
                Aplicar Tempo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
