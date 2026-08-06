import React from 'react';
import {
  Award,
  Goal,
  Star,
  Shield,
  BarChart3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Player, Team, StandingRow } from '../../types';

interface StatsViewProps {
  players: Player[];
  teams: Team[];
  standings: StandingRow[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg border border-slate-700 text-xs space-y-1">
        <div className="flex items-center gap-2">
          {data.photoUrl && <img src={data.photoUrl} alt="" className="w-6 h-6 rounded-md object-cover" />}
          <div>
            <p className="font-extrabold text-sm text-white">{data.name}</p>
            <p className="text-[10px] text-slate-400">{data.teamName}</p>
          </div>
        </div>
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-4 font-mono">
          <span className="text-emerald-400 font-bold">{data.goals} Gols</span>
          <span className="text-sky-400">{data.assists} Assistências</span>
        </div>
      </div>
    );
  }
  return null;
};

export const StatsView: React.FC<StatsViewProps> = ({
  players = [],
  teams = [],
  standings = [],
}) => {
  const topScorers = [...(players || [])].sort((a, b) => (b.stats?.goals || 0) - (a.stats?.goals || 0)).slice(0, 10);
  const topAssists = [...(players || [])].sort((a, b) => (b.stats?.assists || 0) - (a.stats?.assists || 0)).slice(0, 10);

  // Top 5 scorers for Recharts column chart
  const top5ScorersChartData = topScorers.slice(0, 5).map((p) => {
    const team = teams.find((t) => t.id === p.teamId);
    return {
      name: p.displayName || p.fullName,
      goals: p.stats?.goals || 0,
      assists: p.stats?.assists || 0,
      teamName: team?.name || 'Sem Time',
      photoUrl: p.photoUrl,
    };
  });

  // Best Defense
  const bestDefenses = [...(standings || [])].sort((a, b) => (a.goalsAgainst || 0) - (b.goalsAgainst || 0));

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-500" />
            Artilharia & Rankings Individuais
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Líderes de gols, assistências, prêmios de MVP e estatísticas coletivas das equipes
          </p>
        </div>
      </div>

      {/* Top 5 Scorers Recharts Column Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-500" />
              Top 5 Artilheiros - Comparativo de Gols
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Visualização gráfica do desempenho dos 5 maiores marcadores</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            Gráficos Recharts
          </span>
        </div>

        <div className="h-64 w-full pt-2">
          {top5ScorersChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top5ScorersChartData} margin={{ top: 15, right: 15, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#64748b" opacity={0.15} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="goals" radius={[8, 8, 0, 0]} maxBarSize={50}>
                  {top5ScorersChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        index === 0
                          ? '#10b981'
                          : index === 1
                          ? '#3b82f6'
                          : index === 2
                          ? '#8b5cf6'
                          : index === 3
                          ? '#f59e0b'
                          : '#64748b'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              Nenhum dado de artilharia disponível.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Top Scorers Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Goal className="w-4 h-4 text-emerald-500" />
            Ranking de Artilharia (Gols)
          </h3>

          <div className="space-y-2">
            {topScorers.map((p, idx) => {
              const team = teams.find((t) => t.id === p.teamId);

              return (
                <div
                  key={p.id}
                  className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] ${
                        idx === 0
                          ? 'bg-amber-400 text-slate-950'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-950'
                          : idx === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <img src={p.photoUrl} alt="" className="w-7 h-7 rounded-lg object-cover" />
                    <div>
                      <p className="font-extrabold text-slate-900 dark:text-white">{p.displayName}</p>
                      <p className="text-[10px] text-slate-500">{team?.name || 'Sem Time'}</p>
                    </div>
                  </div>

                  <span className="font-black text-sm text-emerald-600 dark:text-emerald-400 font-mono">
                    {p.stats.goals} G
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Assists Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Star className="w-4 h-4 text-amber-500" />
            Líderes em Assistências
          </h3>

          <div className="space-y-2">
            {topAssists.map((p, idx) => {
              const team = teams.find((t) => t.id === p.teamId);

              return (
                <div
                  key={p.id}
                  className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center font-black text-[10px]">
                      {idx + 1}
                    </span>
                    <img src={p.photoUrl} alt="" className="w-7 h-7 rounded-lg object-cover" />
                    <div>
                      <p className="font-extrabold text-slate-900 dark:text-white">{p.displayName}</p>
                      <p className="text-[10px] text-slate-500">{team?.name || 'Sem Time'}</p>
                    </div>
                  </div>

                  <span className="font-black text-sm text-sky-500 font-mono">{p.stats.assists} A</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Best Defenses Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Shield className="w-4 h-4 text-sky-500" />
            Defesa Menos Vazada
          </h3>

          <div className="space-y-2">
            {bestDefenses.map((s, idx) => (
              <div
                key={s.teamId}
                className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center font-black text-[10px]">
                    {idx + 1}
                  </span>
                  <p className="font-extrabold text-slate-900 dark:text-white">{s.teamName}</p>
                </div>

                <span className="font-black text-xs text-rose-500 font-mono">{s.goalsAgainst} Gols Sofridos</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

