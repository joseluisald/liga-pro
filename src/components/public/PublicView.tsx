import React, { useState } from 'react';
import {
  Trophy,
  Calendar,
  Goal,
  Share2,
  Check,
  Radio,
  ChevronRight,
  Shield
} from 'lucide-react';
import { Championship, StandingRow, Match, Player, Team } from '../../types';

interface PublicViewProps {
  championship: Championship;
  standings: StandingRow[];
  matches: Match[];
  players: Player[];
  teams: Team[];
  onBackToAdmin?: () => void;
}

export const PublicView: React.FC<PublicViewProps> = ({
  championship,
  standings = [],
  matches = [],
  players = [],
  teams = [],
  onBackToAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<'STANDINGS' | 'MATCHES' | 'SCORERS'>('STANDINGS');
  const [copied, setCopied] = useState(false);

  const topScorers = [...(players || [])].sort((a, b) => (b.stats?.goals || 0) - (a.stats?.goals || 0)).slice(0, 5);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans pb-12 animate-in fade-in">
      {/* Public Header Hero */}
      <div className="bg-gradient-to-b from-emerald-950 via-slate-950 to-slate-950 p-6 border-b border-slate-800 text-center relative">
        {onBackToAdmin && (
          <button
            onClick={onBackToAdmin}
            className="absolute top-4 left-4 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-lg border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
          >
            ← Voltar ao Painel
          </button>
        )}
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 shadow-xl">
            <Trophy className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">{championship.name}</h1>
          <p className="text-xs text-slate-400 font-semibold">{championship.organizerName} | {championship.city} - {championship.state}</p>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-white" /> : <Share2 className="w-4 h-4" />}
            {copied ? 'Link Copiado!' : 'Compartilhar no WhatsApp'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-md mx-auto px-4 mt-4">
        <div className="bg-slate-900 p-1 rounded-2xl border border-slate-800 grid grid-cols-3 text-center text-xs font-bold">
          <button
            onClick={() => setActiveTab('STANDINGS')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'STANDINGS' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400'
            }`}
          >
            Tabela
          </button>
          <button
            onClick={() => setActiveTab('MATCHES')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'MATCHES' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400'
            }`}
          >
            Jogos
          </button>
          <button
            onClick={() => setActiveTab('SCORERS')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'SCORERS' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400'
            }`}
          >
            Artilharia
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-md mx-auto px-4 mt-6 space-y-6">
        {/* Standings Tab */}
        {activeTab === 'STANDINGS' && (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-800/60 border-b border-slate-800 flex items-center justify-between">
              <span className="font-extrabold text-xs uppercase tracking-wider text-emerald-400">Classificação Geral</span>
              <span className="text-[10px] text-slate-400">PTS = Pontos | SG = Saldo</span>
            </div>

            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase">
                  <th className="p-3 text-center">Pos</th>
                  <th className="p-3">Time</th>
                  <th className="p-3 text-center">J</th>
                  <th className="p-3 text-center">SG</th>
                  <th className="p-3 text-center font-bold text-white">PTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-semibold">
                {standings.map((s, idx) => (
                  <tr key={s.teamId} className="hover:bg-slate-800/40">
                    <td className="p-3 text-center">
                      <span className="w-5 h-5 rounded-full inline-flex items-center justify-center font-black text-[10px] bg-slate-800 text-slate-300">
                        {idx + 1}
                      </span>
                    </td>
                    <td className="p-3 font-bold flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.primaryColor }} />
                      {s.teamName}
                    </td>
                    <td className="p-3 text-center text-slate-400">{s.played}</td>
                    <td className="p-3 text-center text-sky-400 font-mono">{s.goalDifference}</td>
                    <td className="p-3 text-center font-black text-emerald-400 text-sm">{s.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Matches Tab */}
        {activeTab === 'MATCHES' && (
          <div className="space-y-3">
            {matches.map((m) => {
              const home = teams.find((t) => t.id === m.homeTeamId);
              const away = teams.find((t) => t.id === m.awayTeamId);

              return (
                <div key={m.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                    <span>Rodada {m.roundNumber}</span>
                    <span>{m.date} às {m.time}</span>
                  </div>

                  <div className="flex items-center justify-between font-black text-sm py-1">
                    <div className="flex items-center gap-2 w-32 truncate justify-end">
                      <span>{home?.name}</span>
                    </div>

                    <div className="px-3 py-1 bg-slate-800 rounded-lg font-mono text-emerald-400">
                      {m.status === 'SCHEDULED' ? 'v' : `${m.homeScore} - ${m.awayScore}`}
                    </div>

                    <div className="flex items-center gap-2 w-32 truncate justify-start">
                      <span>{away?.name}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Scorers Tab */}
        {activeTab === 'SCORERS' && (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-400">Top 5 Artilheiros</h3>

            <div className="space-y-2">
              {topScorers.map((p, idx) => (
                <div key={p.id} className="p-2.5 bg-slate-800/60 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="font-black text-amber-400">#{idx + 1}</span>
                    <img src={p.photoUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
                    <div>
                      <p className="font-bold text-white">{p.displayName}</p>
                      <p className="text-[10px] text-slate-400">{p.position}</p>
                    </div>
                  </div>
                  <span className="font-black font-mono text-emerald-400 text-sm">{p.stats.goals} Gols</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
