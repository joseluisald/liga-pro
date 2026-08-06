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
  const liveMatch = safeMatches.find((m) => m && m.status === 'IN_PROGRESS') || safeMatches[0];

  const totalGoals = finishedMatches.reduce((acc, m) => acc + (m.homeScore || 0) + (m.awayScore || 0), 0) + (liveMatch && liveMatch.status === 'IN_PROGRESS' ? (liveMatch.homeScore || 0) + (liveMatch.awayScore || 0) : 0);
  const totalYellowCards = safeEvents.filter((e) => e && e.type === 'YELLOW_CARD').length || 84;
  const topScorers = [...safePlayers].sort((a, b) => ((b && b.stats && b.stats.goals) || 0) - ((a && a.stats && a.stats.goals) || 0)).slice(0, 3);

  // Recharts Data - Goals by Round
  const roundGoalsData = [
    { rodada: 'R1', gols: 18 },
    { rodada: 'R2', gols: 26 },
    { rodada: 'R3', gols: 31 },
    { rodada: 'R4', gols: 12 },
    { rodada: 'R5', gols: 22 },
  ];

  const homeTeam = safeTeams.find((t) => t && t.id === liveMatch?.homeTeamId) || safeTeams[0];
  const awayTeam = safeTeams.find((t) => t && t.id === liveMatch?.awayTeamId) || safeTeams[1];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in">
      {/* Top KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Jogos</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{matches.length || 48}</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium tracking-tight">
              {pendingMatches.length} Pendentes
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Gols Registrados</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{totalGoals || 142}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {((totalGoals || 142) / (finishedMatches.length || 1)).toFixed(1)} p/ jogo
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
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">92%</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-tight">R$ 14.500</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Banner and Standings Table */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Next Match Banner */}
          <div className="bg-slate-900 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-center justify-between relative overflow-hidden shadow-md">
            <div className="absolute right-0 top-0 w-32 h-full bg-emerald-500/10 skew-x-[-20deg] translate-x-12 pointer-events-none"></div>
            <div className="flex flex-col mb-4 sm:mb-0">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                Próxima Partida - Rodada {liveMatch?.roundNumber || 7}
              </span>
              <div className="flex items-center gap-6 mt-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold truncate max-w-[120px] sm:max-w-[160px]">
                    {homeTeam?.name || 'Fúria F.C.'}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-black text-white shrink-0">
                    {homeTeam?.shortName?.[0] || 'F'}
                  </div>
                </div>

                <span className="text-2xl font-black text-slate-500">VS</span>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-black text-white shrink-0">
                    {awayTeam?.shortName?.[0] || 'D'}
                  </div>
                  <span className="text-sm font-bold truncate max-w-[120px] sm:max-w-[160px]">
                    {awayTeam?.name || 'Dragões FC'}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center sm:text-right z-10">
              <p className="text-xs font-medium text-slate-300">Arena Central</p>
              <p className="text-lg font-black text-emerald-400">HOJE - {liveMatch?.time || '20:30'}</p>
              <button
                onClick={() => openMatch && openMatch(liveMatch.id)}
                className="mt-2 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-colors italic uppercase shadow"
              >
                INICIAR SÚMULA LIVE
              </button>
            </div>
          </div>

          {/* Detailed Standings Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex-1 flex flex-col shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Classificação Geral - Série A</h3>
              {onNavigateTab && (
                <button
                  onClick={() => onNavigateTab('phases_standings')}
                  className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
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
                    <th className="px-4 py-2 text-right pr-6">Forma</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {safeStandings.map((row, idx) => (
                    <tr
                      key={row.teamId}
                      className={`border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${
                        idx >= 3 ? 'bg-rose-50/20 dark:bg-rose-950/10' : ''
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
                      <td className="px-4 py-2.5 text-right pr-6">
                        <div className="flex justify-end gap-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                          <span className={`w-2.5 h-2.5 rounded-full ${row.drawn > 0 ? 'bg-slate-300 dark:bg-slate-600' : 'bg-emerald-500'}`}></span>
                          <span className={`w-2.5 h-2.5 rounded-full ${row.lost > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                        </div>
                      </td>
                    </tr>
                  ))}
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
              {topScorers.map((p, idx) => (
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
              ))}
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
              <div className="p-2 bg-rose-50 dark:bg-rose-950/40 rounded-lg flex items-center justify-between border border-rose-100 dark:border-rose-900/40">
                <div>
                  <p className="text-xs font-bold text-rose-900 dark:text-rose-200">J. Petronilo</p>
                  <p className="text-[9px] text-rose-700 dark:text-rose-400 uppercase font-medium">Acúmulo Amarelos (3)</p>
                </div>
                <span className="px-2 py-0.5 bg-rose-600 text-white text-[9px] font-black rounded">SUSPENSO</span>
              </div>
              <div className="p-2 bg-rose-50 dark:bg-rose-950/40 rounded-lg flex items-center justify-between border border-rose-100 dark:border-rose-900/40">
                <div>
                  <p className="text-xs font-bold text-rose-900 dark:text-rose-200">Carlos Eduardo</p>
                  <p className="text-[9px] text-rose-700 dark:text-rose-400 uppercase font-medium">Vermelho Direto (R5)</p>
                </div>
                <span className="px-2 py-0.5 bg-rose-600 text-white text-[9px] font-black rounded">SUSPENSO</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
