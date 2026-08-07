import React, { useState } from 'react';
import {
  Sparkles,
  Trophy,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Trash2,
  Layers,
  Flame,
  X,
  Shuffle,
  Grid,
  Users,
  Sliders
} from 'lucide-react';
import { Team, Category, DEFAULT_CATEGORIES } from '../../types';

interface FixturesDrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: Team[];
  categories?: Category[];
  onGenerateFixtures: (options: {
    format: 'ROUND_ROBIN' | 'DOUBLE_ROUND_ROBIN' | 'KNOCKOUT' | 'GROUPS';
    numGroups?: number;
    startDate: string;
    time: string;
    location: string;
    daysBetweenRounds: number;
    clearExisting: boolean;
    matchDurationMinutes?: number;
    matchIntervalMinutes?: number;
    categoryDailyGames?: Record<string, number>;
  }) => Promise<{ success: boolean; matches: any[] }>;
}

export const FixturesDrawModal: React.FC<FixturesDrawModalProps> = ({
  isOpen,
  onClose,
  teams,
  categories = DEFAULT_CATEGORIES,
  onGenerateFixtures,
}) => {
  const [format, setFormat] = useState<'ROUND_ROBIN' | 'DOUBLE_ROUND_ROBIN' | 'KNOCKOUT' | 'GROUPS'>('ROUND_ROBIN');
  const [numGroups, setNumGroups] = useState<number>(2);
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  );
  const [time, setTime] = useState<string>('14:00');
  const [location, setLocation] = useState<string>('Arena Principal - Campo 1');
  const [daysBetweenRounds, setDaysBetweenRounds] = useState<number>(7);
  const [clearExisting, setClearExisting] = useState<boolean>(true);

  const [matchDuration, setMatchDuration] = useState<number>(50);
  const [matchInterval, setMatchInterval] = useState<number>(10);

  // Default daily game counts per category
  const [categoryDailyGames, setCategoryDailyGames] = useState<Record<string, number>>({
    principal: 3,
    veteranos: 1,
    feminino: 1,
  });

  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawnMatches, setDrawnMatches] = useState<any[]>([]);
  const [drawCompleted, setDrawCompleted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen) return null;

  const handleCategoryGameChange = (catId: string, value: number) => {
    setCategoryDailyGames((prev) => ({
      ...prev,
      [catId]: Math.max(1, value),
    }));
  };

  const handleStartDraw = async () => {
    if (teams.length < 2) {
      setErrorMessage('É necessário ter no mínimo 2 equipes para sortear os confrontos.');
      return;
    }
    setErrorMessage('');
    setIsDrawing(true);

    try {
      await new Promise((r) => setTimeout(r, 1000));

      const res = await onGenerateFixtures({
        format,
        numGroups,
        startDate,
        time,
        location,
        daysBetweenRounds,
        clearExisting,
        matchDurationMinutes: matchDuration,
        matchIntervalMinutes: matchInterval,
        categoryDailyGames,
      });

      setDrawnMatches(res.matches || []);
      setDrawCompleted(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Ocorreu um erro ao gerar os confrontos.');
    } finally {
      setIsDrawing(false);
    }
  };

  const activeCategories = categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Sorteio e Gerador de Tabela
              </h2>
              <p className="text-xs text-slate-400">
                Gere confrontos automaticamente por categorias, chaves e horários por dia.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {errorMessage && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {!drawCompleted ? (
            <>
              {/* Teams & Categories Summary Banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-slate-800/40 p-4 rounded-2xl border border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>
                    Total de <strong className="text-white font-bold">{teams.length} equipes</strong> cadastradas
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {activeCategories.map((cat) => {
                    const catTeamCount = teams.filter((t) => (t.categoryId || 'principal') === cat.id).length;
                    return (
                      <span
                        key={cat.id}
                        className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-[10px] text-slate-300 font-semibold"
                      >
                        {cat.name}: {catTeamCount}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Format Selection */}
              <div className="space-y-3">
                <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block">
                  Formato da Competição
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormat('ROUND_ROBIN')}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      format === 'ROUND_ROBIN'
                        ? 'bg-emerald-500/10 border-emerald-500 text-white ring-2 ring-emerald-500/20'
                        : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Trophy className={`w-4 h-4 ${format === 'ROUND_ROBIN' ? 'text-emerald-400' : 'text-slate-500'}`} />
                      {format === 'ROUND_ROBIN' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-100">Turno Único</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Todos contra todos</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormat('GROUPS')}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      format === 'GROUPS'
                        ? 'bg-emerald-500/10 border-emerald-500 text-white ring-2 ring-emerald-500/20'
                        : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Grid className={`w-4 h-4 ${format === 'GROUPS' ? 'text-emerald-400' : 'text-slate-500'}`} />
                      {format === 'GROUPS' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-100">Por Chaves</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Fase de Grupos (A, B...)</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormat('DOUBLE_ROUND_ROBIN')}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      format === 'DOUBLE_ROUND_ROBIN'
                        ? 'bg-emerald-500/10 border-emerald-500 text-white ring-2 ring-emerald-500/20'
                        : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Layers className={`w-4 h-4 ${format === 'DOUBLE_ROUND_ROBIN' ? 'text-emerald-400' : 'text-slate-500'}`} />
                      {format === 'DOUBLE_ROUND_ROBIN' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-100">Ida e Volta</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Turno e Returno</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormat('KNOCKOUT')}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      format === 'KNOCKOUT'
                        ? 'bg-emerald-500/10 border-emerald-500 text-white ring-2 ring-emerald-500/20'
                        : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Flame className={`w-4 h-4 ${format === 'KNOCKOUT' ? 'text-emerald-400' : 'text-slate-500'}`} />
                      {format === 'KNOCKOUT' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-100">Mata-Mata</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Eliminatória Direta</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Number of Chaves option if GROUPS is selected */}
              {format === 'GROUPS' && (
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-2">
                  <label className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                    <Grid className="w-4 h-4" />
                    Quantidade de Chaves por Categoria
                  </label>
                  <div className="flex items-center gap-3">
                    <select
                      value={numGroups}
                      onChange={(e) => setNumGroups(Number(e.target.value))}
                      className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value={2}>2 Chaves (Chave A e Chave B)</option>
                      <option value={3}>3 Chaves (Chave A, B e C)</option>
                      <option value={4}>4 Chaves (Chave A, B, C e D)</option>
                    </select>
                    <span className="text-[11px] text-slate-400">
                      As equipes de cada categoria serão divididas em {numGroups} chaves balanceadas.
                    </span>
                  </div>
                </div>
              )}

              {/* Configuração de Jogos Por Dia Por Categoria */}
              <div className="space-y-3 bg-slate-800/30 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    Definir Jogos Por Dia Por Categoria
                  </label>
                  <span className="text-[10px] text-slate-400">Ex: 3 Principal, 1 Veterano, 1 Feminino</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {activeCategories.map((cat) => (
                    <div key={cat.id} className="p-3 bg-slate-900 border border-slate-700 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200">{cat.name}</span>
                        <span className="text-[10px] text-emerald-400 font-semibold">jogos/dia</span>
                      </div>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={categoryDailyGames[cat.id] ?? 1}
                        onChange={(e) => handleCategoryGameChange(cat.id, parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-xs font-bold text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Match Details & Timing Form */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-800/30 p-4 rounded-2xl border border-slate-800">
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
                    Horário do 1º Jogo
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
                    placeholder="Ex: Arena Principal"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    Duração por Jogo (min)
                  </label>
                  <input
                    type="number"
                    min={20}
                    max={120}
                    value={matchDuration}
                    onChange={(e) => setMatchDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    Intervalo entre Jogos (min)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={matchInterval}
                    onChange={(e) => setMatchInterval(Number(e.target.value))}
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
                    <option value={7}>7 dias (Semanal)</option>
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
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Sorteio Realizado com Sucesso!</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Foram gerados <strong className="text-emerald-400">{drawnMatches.length} confrontos</strong> divididos por categoria e horários.
                </p>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-800 max-h-48 overflow-y-auto text-left space-y-2">
                {drawnMatches.map((m, idx) => (
                  <div key={idx} className="text-xs flex items-center justify-between p-2 bg-slate-900/60 rounded-xl">
                    <span className="font-bold text-slate-300">Rodada {m.roundNumber} - {m.date} ({m.time})</span>
                    <span className="text-slate-400 uppercase text-[10px] font-semibold">{m.categoryId || 'Principal'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex items-center justify-end gap-3">
          {!drawCompleted ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDrawing}
                onClick={handleStartDraw}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/10 transition-all"
              >
                {isDrawing ? (
                  <>
                    <Shuffle className="w-4 h-4 animate-spin" />
                    <span>Realizando Sorteio...</span>
                  </>
                ) : (
                  <>
                    <Shuffle className="w-4 h-4" />
                    <span>Realizar Sorteio Automático</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition-colors"
            >
              Concluir
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
