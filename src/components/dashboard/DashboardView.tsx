import React from 'react';
import {
  Trophy,
  Users,
  Shield,
  Calendar,
  Goal,
  Award,
  Star,
  Activity,
  Flame,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Radio
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Championship, Team, Player, Match, StandingRow, MatchEvent } from '../../types';

interface DashboardViewProps {
  championship: Championship;
  teams: Team[];
  players: Player[];
  matches: Match[];
  standings: StandingRow[];
  events?: MatchEvent[];
  onNavigateTab?: (tab: string) => void;
  onOpenMatchLive?: (matchId: string) => void;
  onOpenLiveOperator?: (matchId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  championship,
  teams = [],
  players = [],
  matches = [],
  standings = [],
  events = [],
  onNavigateTab,
  onOpenMatchLive,
  onOpenLiveOperator,
}) => {
  const safePlayers = Array.isArray(players) ? players : [];
  const safeTeams = Array.isArray(teams) ? teams : [];
  const safeMatches = Array.isArray(matches) ? matches : [];
  const safeStandings = Array.isArray(standings) ? standings : [];
  const safeEvents = Array.isArray(events) ? events : [];

  const openMatch = onOpenMatchLive || onOpenLiveOperator;
  const finishedMatches = safeMatches.filter((m) => m && m.status === 'FINISHED');
  const pendingMatches = safeMatches.filter((m) => m && (m.status === 'SCHEDULED' || m.status === 'POSTPONED'));
  
  // Find in-progress or next scheduled match
  const liveMatch = safeMatches.find((m) => m && m.status === 'IN_PROGRESS') 
    || safeMatches.find((m) => m && m.status === 'SCHEDULED') 
    || safeMatches[0];

  const totalGoals = finishedMatches.reduce((acc, m) => acc + (m.homeScore || 0) + (m.awayScore || 0), 0) + (liveMatch && liveMatch.status === 'IN_PROGRESS' ? (liveMatch.homeScore || 0) + (liveMatch.awayScore || 0) : 0);
  
  // Count yellow cards from match events or player stats
  const eventYellows = safeEvents.filter((e) => e && e.type === 'YELLOW_CARD').length;
  const playerYellows = safePlayers.reduce((acc, p) => acc + (p.stats?.yellowCards || 0), 0);
  const totalYellowCards = Math.max(eventYellows, playerYellows);

  // Financial Stats from real Teams & Championship Fee
  const paidTeams = safeTeams.filter((t) => t.financialStatus === 'PAID');
  const totalTeamsCount = safeTeams.length;
  const paidPercentage = totalTeamsCount > 0 ? Math.round((paidTeams.length / totalTeamsCount) * 100) : 0;
  const feeAmount = championship?.rules?.registrationFeeAmount || 0;
  const totalPaidRevenue = paidTeams.length * feeAmount;

  // Recharts Data - Real Goals by Round
  const goalsByRoundMap: Record<number, number> = {};
  safeMatches.forEach((m) => {
    if (m.status === 'FINISHED' || m.status === 'IN_PROGRESS') {
      const rd = m.roundNumber || 1;
      const goalsInMatch = (m.homeScore || 0) + (m.awayScore || 0);
      goalsByRoundMap[rd] = (goalsByRoundMap[rd] || 0) + goalsInMatch;
    }
  });

  const roundGoalsData = Object.keys(goalsByRoundMap).length > 0
    ? Object.entries(goalsByRoundMap)
        .map(([rd, gols]) => ({ rodada: `R${rd}`, gols }))
        .sort((a, b) => Number(a.rodada.replace('R', '')) - Number(b.rodada.replace('R', '')))
    : [
        { rodada: 'R1', gols: 0 },
        { rodada: 'R2', gols: 0 },
      ];

  const homeTeam = safeTeams.find((t) => t && t.id === liveMatch?.homeTeamId);
  const awayTeam = safeTeams.find((t) => t && t.id === liveMatch?.awayTeamId);

  // Top Scorers
  const topScorers = [...safePlayers]
    .sort((a, b) => ((b && b.stats && b.stats.goals) || 0) - ((a && a.stats && a.stats.goals) || 0))
    .slice(0, 3);

  // Suspended Players
  const maxYellows = championship?.rules?.yellowCardsForSuspension || 3;
  const suspendedPlayers = safePlayers.filter(
    (p) =>
      p.status === 'SUSPENDED' ||
      ((p.stats?.yellowCards || 0) >= maxYellows) ||
      ((p.stats?.redCards || 0) > 0)
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in">
      {/* Top KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Jogos</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{safeMatches.length}</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium tracking-tight">
              {pendingMatches.length} Pendentes
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Gols Registrados</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{totalGoals}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {finishedMatches.length > 0 ? (totalGoals / finishedMatches.length).toFixed(1) : '0.0'} p/ jogo
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Cartões Amarelos</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-amber-500">{totalYellowCards}</span>
            <div className="w-2 h-3 bg-amber-400 rounded-sm inline-block"></div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Inscrições Pagas</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{paidPercentage}%</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-tight">
              R$ {totalPaidRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Banner and Standings Table */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Next Match Banner */}
          {liveMatch ? (
            <div className="bg-slate-900 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-center justify-between relative overflow-hidden shadow-md">
              <div className="absolute right-0 top-0 w-32 h-full bg-emerald-500/10 skew-x-[-20deg] translate-x-12 pointer-events-none"></div>
              <div className="flex flex-col mb-4 sm:mb-0">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                  {liveMatch.status === 'IN_PROGRESS' ? (
                    <>
                      <Radio className="w-3 h-3 text-rose-500 animate-pulse" />
                      Partida Em Andamento - Rodada {liveMatch.roundNumber || 1}
                    </>
                  ) : (
                    <>
                      Próxima Partida - Rodada {liveMatch.roundNumber || 1}
                    </>
                  )}
                </span>
                <div className="flex items-center gap-6 mt-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold truncate max-w-[120px] sm:max-w-[160px]">
                      {homeTeam?.name || 'Time Mandante'}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-black text-white shrink-0">
                      {homeTeam?.shortName?.[0] || homeTeam?.name?.[0] || 'M'}
                    </div>
                  </div>

                  <span className="text-2xl font-black text-slate-500">VS</span>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-black text-white shrink-0">
                      {awayTeam?.shortName?.[0] || awayTeam?.name?.[0] || 'V'}
                    </div>
                    <span className="text-sm font-bold truncate max-w-[120px] sm:max-w-[160px]">
                      {awayTeam?.name || 'Time Visitante'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-center sm:text-right z-10">
                <p className="text-xs font-medium text-slate-300">{liveMatch.location || 'Campo Principal'}</p>
                <p className="text-lg font-black text-emerald-400">{liveMatch.date || 'Hoje'} - {liveMatch.time || '20:00'}</p>
                {openMatch && (
                  <button
                    onClick={() => openMatch(liveMatch.id)}
                    className="mt-2 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-colors italic uppercase shadow cursor-pointer"
                  >
                    ABRIR SÚMULA / JOGO
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 rounded-2xl p-6 text-white text-center space-y-2 border border-slate-800">
              <Calendar className="w-8 h-8 mx-auto text-emerald-400 opacity-60" />
              <p className="text-sm font-bold">Nenhuma Partida Agendada</p>
              <p className="text-xs text-slate-400">Cadastre novas partidas no menu de Tabela e Jogos.</p>
            </div>
          )}

          {/* Detailed Standings Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex-1 flex flex-col shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Classificação Geral - {championship.name}</h3>
              {onNavigateTab && (
                <button
                  onClick={() => onNavigateTab('phases_standings')}
                  className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Ver tabela completa
                </button>
              )}
            </div>
            <div className="flex-1 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">
                  <tr>
                    <th className="px-4 py-2 text-left w-12">Pos</th>
                    <th className="px-4 py-2 text-left">Time</th>
                    <th className="px-4 py-2 text-center">P</th>
                    <th className="px-4 py-2 text-center">V</th>
                    <th className="px-4 py-2 text-center">E</th>
                    <th className="px-4 py-2 text-center">D</th>
                    <th className="px-4 py-2 text-center">SG</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {safeStandings.length > 0 ? (
                    safeStandings.map((row, idx) => (
                      <tr
                        key={row.teamId}
                        className={`border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${
                          idx >= safeStandings.length - 2 ? 'bg-rose-50/20 dark:bg-rose-950/10' : ''
                        }`}
                      >
                        <td className={`px-4 py-2.5 font-bold ${idx === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          {String(idx + 1).padStart(2, '0')}
                        </td>
                        <td className="px-4 py-2.5 font-semibold text-slate-800 dark:text-slate-200">
                          {row.teamName}
                        </td>
                        <td className="px-4 py-2.5 text-center font-bold text-slate-900 dark:text-slate-100">{row.points}</td>
                        <td className="px-4 py-2.5 text-center text-slate-600 dark:text-slate-400">{row.won}</td>
                        <td className="px-4 py-2.5 text-center text-slate-600 dark:text-slate-400">{row.drawn}</td>
                        <td className="px-4 py-2.5 text-center text-slate-600 dark:text-slate-400">{row.lost}</td>
                        <td className="px-4 py-2.5 text-center text-slate-600 dark:text-slate-400">
                          {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400 text-xs font-semibold">
                        Nenhum time cadastrado na tabela de classificação.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Stats & Leaders */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Top Scorers (Artilharia) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">Artilharia (Gols)</h3>
            <div className="space-y-3">
              {topScorers.length > 0 ? (
                topScorers.map((p, idx) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === 0 ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{p.displayName}</p>
                      <p className="text-[10px] text-slate-400 italic truncate">
                        {safeTeams.find((t) => t && t.id === p.teamId)?.name || 'Atleta Livre'}
                      </p>
                    </div>
                    <span className="text-sm font-black text-slate-800 dark:text-slate-100">{p.stats?.goals || 0}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-3">Sem registros de artilharia</p>
              )}
            </div>
          </div>

          {/* Gols por Rodada Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">Gols p/ Rodada</h3>
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roundGoalsData}>
                  <XAxis dataKey="rodada" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="gols" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Discipline Leaderboard */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Suspensões Próx. Rodada</h3>
              <div className="w-2 h-3 bg-rose-500 rounded-sm"></div>
            </div>
            <div className="space-y-2">
              {suspendedPlayers.length > 0 ? (
                suspendedPlayers.map((p) => {
                  const teamName = safeTeams.find((t) => t.id === p.teamId)?.name || 'Time';
                  return (
                    <div key={p.id} className="p-2 bg-rose-50 dark:bg-rose-950/40 rounded-lg flex items-center justify-between border border-rose-100 dark:border-rose-900/40">
                      <div>
                        <p className="text-xs font-bold text-rose-900 dark:text-rose-200">{p.displayName} ({teamName})</p>
                        <p className="text-[9px] text-rose-700 dark:text-rose-400 uppercase font-medium">
                          {(p.stats?.yellowCards || 0) >= maxYellows
                            ? `Acúmulo Amarelos (${p.stats?.yellowCards})`
                            : 'Cartão Vermelho'}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 bg-rose-600 text-white text-[9px] font-black rounded">SUSPENSO</span>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 text-center py-3 font-medium">
                  Nenhum atleta suspenso para a próxima rodada.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
