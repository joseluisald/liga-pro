import React, { useState } from 'react';
import {
  Shuffle,
  Calendar,
  Clock,
  MapPin,
  Trophy,
  Sparkles,
  CheckCircle2,
  Trash2,
  Shield,
  Layers,
  Flame,
  X
} from 'lucide-react';
import { Team } from '../../types';

interface FixturesDrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: Team[];
  onGenerateFixtures: (options: {
    format: 'ROUND_ROBIN' | 'DOUBLE_ROUND_ROBIN' | 'KNOCKOUT';
    startDate: string;
    time: string;
    location: string;
    daysBetweenRounds: number;
    clearExisting: boolean;
  }) => Promise<{ success: boolean; matches: any[] }>;
}

export const FixturesDrawModal: React.FC<FixturesDrawModalProps> = ({
  isOpen,
  onClose,
  teams,
  onGenerateFixtures,
}) => {
  const [format, setFormat] = useState<'ROUND_ROBIN' | 'DOUBLE_ROUND_ROBIN' | 'KNOCKOUT'>('ROUND_ROBIN');
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  );
  const [time, setTime] = useState<string>('15:00');
  const [location, setLocation] = useState<string>('Arena Principal - Campo 1');
  const [daysBetweenRounds, setDaysBetweenRounds] = useState<number>(7);
  const [clearExisting, setClearExisting] = useState<boolean>(true);

  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawnMatches, setDrawnMatches] = useState<any[]>([]);
  const [drawCompleted, setDrawCompleted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen) return null;

  const handleStartDraw = async () => {
    if (teams.length < 2) {
      setErrorMessage('É necessário ter no mínimo 2 equipes para sortear os confrontos.');
      return;
    }
    setErrorMessage('');
    setIsDrawing(true);
    setDrawnMatches([]);
    setDrawCompleted(false);

    try {
      const res = await onGenerateFixtures({
        format,
        startDate,
        time,
        location,
        daysBetweenRounds,
        clearExisting,
      });

      // Simulate a fun 1.5s draw reveal effect
      setTimeout(() => {
        setIsDrawing(false);
        setDrawnMatches(res.matches || []);
        setDrawCompleted(true);
      }, 1200);
    } catch (err: any) {
      setIsDrawing(false);
      setErrorMessage(err.message || 'Erro ao realizar o sorteio');
    }
  };

  const getTeam = (id: string) => teams.find((t) => t.id === id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Shuffle className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                Sorteio de Confrontos
                <span className="px-2 py-0.5 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-bold">
                  Gerador Automático
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Monte a tabela de jogos e rodadas sorteando os cruzamentos entre os times
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1">
          {errorMessage && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-semibold">
              ⚠️ {errorMessage}
            </div>
          )}

          {!drawCompleted ? (
            <>
              {/* Teams Count Badge */}
              <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-amber-400" />
                  <div>
                    <span className="text-xs font-bold text-slate-200">Equipes Participantes</span>
                    <p className="text-[11px] text-slate-400">
                      {teams.length} {teams.length === 1 ? 'time cadastrado' : 'times cadastrados no campeonato'}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-black text-amber-400 bg-amber-400/10 px-3 py-1 rounded-xl border border-amber-400/20">
                  {teams.length} Times
                </span>
              </div>

              {/* Format Selection */}
              <div className="space-y-3">
                <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block">
                  Formato da Competção
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormat('ROUND_ROBIN')}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      format === 'ROUND_ROBIN'
                        ? 'bg-emerald-500/10 border-emerald-500 text-white ring-2 ring-emerald-500/20'
                        : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Trophy className={`w-5 h-5 ${format === 'ROUND_ROBIN' ? 'text-emerald-400' : 'text-slate-500'}`} />
                      {format === 'ROUND_ROBIN' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-100">Turno Único</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Todos contra todos (1 rodada)</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormat('DOUBLE_ROUND_ROBIN')}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      format === 'DOUBLE_ROUND_ROBIN'
                        ? 'bg-emerald-500/10 border-emerald-500 text-white ring-2 ring-emerald-500/20'
                        : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Layers className={`w-5 h-5 ${format === 'DOUBLE_ROUND_ROBIN' ? 'text-emerald-400' : 'text-slate-500'}`} />
                      {format === 'DOUBLE_ROUND_ROBIN' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-100">Turno e Returno</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Ida e Volta (2 rodadas)</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormat('KNOCKOUT')}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      format === 'KNOCKOUT'
                        ? 'bg-emerald-500/10 border-emerald-500 text-white ring-2 ring-emerald-500/20'
                        : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Flame className={`w-5 h-5 ${format === 'KNOCKOUT' ? 'text-emerald-400' : 'text-slate-500'}`} />
                      {format === 'KNOCKOUT' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-100">Mata-Mata</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Eliminatória Direta</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Match Details Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-800/30 p-4 rounded-2xl border border-slate-800">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    Data da 1ª Rodada
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    Horário Padrão
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    Local / Campo Padrão
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ex: Arena Principal - Campo 1"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    Intervalo entre Rodadas
                  </label>
                  <select
                    value={daysBetweenRounds}
                    onChange={(e) => setDaysBetweenRounds(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value={1}>1 dia (Diário)</option>
                    <option value={7}>7 dias (Semanal - Recomendado)</option>
                    <option value={14}>14 dias (Quinzenal)</option>
                  </select>
                </div>
              </div>

              {/* Clear Option */}
              <label className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={clearExisting}
                  onChange={(e) => setClearExisting(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-900 border-slate-700"
                />
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Substituir jogos já cadastrados anteriormente</span>
                </div>
              </label>
            </>
          ) : (
            /* Results View */
            <div className="space-y-6 animate-in fade-in">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-400">
                <Sparkles className="w-6 h-6 shrink-0" />
                <div>
                  <h3 className="font-extrabold text-sm text-emerald-300">
                    Sorteio Realizado com Sucesso!
                  </h3>
                  <p className="text-xs text-emerald-400/80">
                    {drawnMatches.length} confrontos foram gerados e adicionados à tabela oficial de jogos.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  Confrontos Sorteados:
                </h4>
                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {drawnMatches.map((m, idx) => {
                    const home = getTeam(m.homeTeamId);
                    const away = getTeam(m.awayTeamId);
                    return (
                      <div
                        key={m.id || idx}
                        className="p-3 bg-slate-800/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                      >
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-900 px-2 py-0.5 rounded-md">
                          Rodada {m.roundNumber}
                        </span>

                        <div className="flex items-center gap-3 font-bold text-slate-100">
                          <span className="flex items-center gap-1.5">
                            {home?.logoUrl && (
                              <img src={home.logoUrl} alt="" className="w-4 h-4 rounded-full object-cover" />
                            )}
                            {home?.name || m.homeTeamId}
                          </span>
                          <span className="text-slate-500 text-[10px] font-black">VS</span>
                          <span className="flex items-center gap-1.5">
                            {away?.name || m.awayTeamId}
                            {away?.logoUrl && (
                              <img src={away.logoUrl} alt="" className="w-4 h-4 rounded-full object-cover" />
                            )}
                          </span>
                        </div>

                        <span className="text-[10px] text-slate-400">{m.date}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex items-center justify-end gap-3 sticky bottom-0 z-10 backdrop-blur-md">
          {!drawCompleted ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleStartDraw}
                disabled={isDrawing || teams.length < 2}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
              >
                {isDrawing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    Sortear...
                  </>
                ) : (
                  <>
                    <Shuffle className="w-4 h-4" />
                    Realizar Sorteio dos Confrontos
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md"
            >
              Concluir & Ver Tabela
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
