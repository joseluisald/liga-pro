import React, { useState } from 'react';
import {
  Trophy,
  Calendar,
  Goal,
  Share2,
  Check,
  Radio,
  ChevronRight,
  Shield,
  Users,
  LogIn,
  Layers
} from 'lucide-react';
import { Championship, StandingRow, Match, Player, Team } from '../../types';

interface PublicViewProps {
  championship: Championship;
  championships?: Championship[];
  onSelectChampionship?: (id: string) => void;
  standings: StandingRow[];
  matches: Match[];
  players: Player[];
  teams: Team[];
  onLoginClick?: () => void;
}

export const PublicView: React.FC<PublicViewProps> = ({
  championship,
  championships = [],
  onSelectChampionship,
  standings = [],
  matches = [],
  players = [],
  teams = [],
  onLoginClick,
}) => {
  const [activeTab, setActiveTab] = useState<'STANDINGS' | 'MATCHES' | 'SCORERS' | 'TEAMS'>('STANDINGS');
  const [copied, setCopied] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  const topScorers = [...(players || [])]
    .sort((a, b) => (b.stats?.goals || 0) - (a.stats?.goals || 0))
    .filter((p) => (p.stats?.goals || 0) > 0)
    .slice(0, 10);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const activeTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];
  const activeTeamPlayers = activeTeam ? players.filter((p) => p.teamId === activeTeam.id) : [];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans pb-16 animate-in fade-in">
      {/* Top Bar for Spectators */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-black text-slate-950 shadow-md">
              <Trophy className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-white tracking-tight">FutGestão</span>
                <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase rounded border border-emerald-500/30">
                  Portal Público
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">Acompanhe estatísticas, jogos e tabelas em tempo real</p>
            </div>
          </div>

          {/* Championship Switcher & Login button */}
          <div className="flex items-center gap-2">
            {championships.length > 1 && onSelectChampionship && (
              <div className="relative">
                <select
                  value={championship.id}
                  onChange={(e) => onSelectChampionship(e.target.value)}
                  className="bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {championships.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.season})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {onLoginClick && (
              <button
                onClick={onLoginClick}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Área do Organizador</span>
                <span className="sm:hidden">Entrar</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Public Hero Banner */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-6 border-b border-slate-800/80 text-center relative overflow-hidden">
        <div className="max-w-md mx-auto space-y-3 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 shadow-xl">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">{championship.name}</h1>
            <p className="text-xs text-slate-400 font-semibold mt-1">
              Organizador: {championship.organizerName || 'Comissão Organizadora'} {championship.city ? `| ${championship.city} - ${championship.state}` : ''}
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-slate-300 pt-1">
            <div className="bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block font-semibold">TIMES</span>
              <span className="font-black text-emerald-400 text-sm">{teams.length}</span>
            </div>
            <div className="bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block font-semibold">PARTIDAS</span>
              <span className="font-black text-emerald-400 text-sm">{matches.length}</span>
            </div>
            <div className="bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block font-semibold">JOGADORES</span>
              <span className="font-black text-emerald-400 text-sm">{players.length}</span>
            </div>
          </div>

          <div>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg transition-all cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-white" /> : <Share2 className="w-4 h-4" />}
              {copied ? 'Link Copiado!' : 'Compartilhar Campeonato'}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-lg mx-auto px-4 mt-4">
        <div className="bg-slate-900 p-1 rounded-2xl border border-slate-800 grid grid-cols-4 text-center text-xs font-bold">
          <button
            onClick={() => setActiveTab('STANDINGS')}
            className={`py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'STANDINGS' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tabela
          </button>
          <button
            onClick={() => setActiveTab('MATCHES')}
            className={`py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'MATCHES' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Jogos
          </button>
          <button
            onClick={() => setActiveTab('SCORERS')}
            className={`py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'SCORERS' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Artilharia
          </button>
          <button
            onClick={() => setActiveTab('TEAMS')}
            className={`py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'TEAMS' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Times
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-lg mx-auto px-4 mt-6 space-y-6">
        {/* Standings Tab */}
        {activeTab === 'STANDINGS' && (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-800/60 border-b border-slate-800 flex items-center justify-between">
              <span className="font-extrabold text-xs uppercase tracking-wider text-emerald-400">Classificação Geral</span>
              <span className="text-[10px] text-slate-400">PTS = Pontos | SG = Saldo</span>
            </div>

            {standings.length > 0 ? (
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
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.primaryColor || '#10b981' }} />
                        <span className="truncate max-w-[140px]">{s.teamName}</span>
                      </td>
                      <td className="p-3 text-center text-slate-400">{s.played}</td>
                      <td className="p-3 text-center text-sky-400 font-mono">
                        {s.goalDifference > 0 ? `+${s.goalDifference}` : s.goalDifference}
                      </td>
                      <td className="p-3 text-center font-black text-emerald-400 text-sm">{s.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs font-medium">
                Tabela de classificação ainda não iniciada.
              </div>
            )}
          </div>
        )}

        {/* Matches Tab */}
        {activeTab === 'MATCHES' && (
          <div className="space-y-3">
            {matches.length > 0 ? (
              matches.map((m) => {
                const home = teams.find((t) => t.id === m.homeTeamId);
                const away = teams.find((t) => t.id === m.awayTeamId);

                return (
                  <div key={m.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2 shadow-md">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                      <span className="text-emerald-400 font-bold">Rodada {m.roundNumber || 1}</span>
                      <span>{m.date || 'Data a definir'} {m.time ? `às ${m.time}` : ''}</span>
                    </div>

                    <div className="flex items-center justify-between font-black text-sm py-1">
                      <div className="flex items-center gap-2 w-32 truncate justify-end">
                        <span className="truncate">{home?.name || 'A definir'}</span>
                      </div>

                      <div className="px-3 py-1 bg-slate-800 rounded-lg font-mono text-emerald-400 text-xs font-bold border border-slate-700/60">
                        {m.status === 'SCHEDULED' ? 'v' : `${m.homeScore ?? 0} - ${m.awayScore ?? 0}`}
                      </div>

                      <div className="flex items-center gap-2 w-32 truncate justify-start">
                        <span className="truncate">{away?.name || 'A definir'}</span>
                      </div>
                    </div>

                    {m.location && (
                      <p className="text-[10px] text-slate-500 text-center">{m.location}</p>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-8 bg-slate-900 rounded-2xl border border-slate-800 text-center text-slate-400 text-xs">
                Nenhuma partida cadastrada para este campeonato.
              </div>
            )}
          </div>
        )}

        {/* Scorers Tab */}
        {activeTab === 'SCORERS' && (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-3 shadow-xl">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-400">Top Artilheiros</h3>

            {topScorers.length > 0 ? (
              <div className="space-y-2">
                {topScorers.map((p, idx) => {
                  const playerTeam = teams.find((t) => t.id === p.teamId);
                  return (
                    <div key={p.id} className="p-2.5 bg-slate-800/60 rounded-xl flex items-center justify-between text-xs border border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <span className="font-black text-amber-400 w-5 text-center">#{idx + 1}</span>
                        <div className="w-8 h-8 rounded-lg bg-slate-700 overflow-hidden flex items-center justify-center text-slate-300 font-black text-xs shrink-0">
                          {p.photoUrl ? (
                            <img src={p.photoUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            p.displayName?.[0] || 'A'
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white">{p.displayName}</p>
                          <p className="text-[10px] text-slate-400">{playerTeam?.name || 'Atleta Livre'}</p>
                        </div>
                      </div>
                      <span className="font-black font-mono text-emerald-400 text-sm">{p.stats?.goals || 0} Gols</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">Nenhum gol registrado no campeonato até o momento.</p>
            )}
          </div>
        )}

        {/* Teams Tab */}
        {activeTab === 'TEAMS' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {teams.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTeamId(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                    (selectedTeamId || teams[0]?.id) === t.id
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>

            {activeTeam ? (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-4 shadow-xl">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-lg shrink-0"
                    style={{ backgroundColor: activeTeam.primaryColor || '#10b981' }}
                  >
                    {activeTeam.shortName || activeTeam.name?.[0] || 'T'}
                  </div>
                  <div>
                    <h3 className="font-black text-base text-white">{activeTeam.name}</h3>
                    <p className="text-xs text-slate-400 font-medium">Técnico: {activeTeam.coachName || 'Não informado'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                    Elenco de Atletas ({activeTeamPlayers.length})
                  </h4>
                  {activeTeamPlayers.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeTeamPlayers.map((p) => (
                        <div key={p.id} className="p-2.5 bg-slate-800/50 rounded-xl flex items-center justify-between text-xs border border-slate-800/80">
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-6 h-6 rounded bg-slate-700 flex items-center justify-center font-mono font-bold text-slate-300 text-[10px] shrink-0">
                              {p.number || '0'}
                            </span>
                            <span className="font-bold text-slate-200 truncate">{p.displayName}</span>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-semibold uppercase shrink-0">{p.position}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-4">Nenhum jogador cadastrado neste time.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 bg-slate-900 rounded-2xl border border-slate-800 text-center text-slate-400 text-xs">
                Nenhum time cadastrado neste campeonato.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

