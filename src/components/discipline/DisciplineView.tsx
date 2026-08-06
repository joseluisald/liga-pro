import React from 'react';
import {
  AlertTriangle,
  UserX,
  Activity,
  Shield,
  CheckCircle
} from 'lucide-react';
import { Player, Suspension, Team } from '../../types';

interface DisciplineViewProps {
  players: Player[];
  suspensions: Suspension[];
  teams: Team[];
}

export const DisciplineView: React.FC<DisciplineViewProps> = ({
  players = [],
  suspensions = [],
  teams = [],
}) => {
  // Players with 2 yellow cards (Pendurados)
  const pendurados = (players || []).filter((p) => p && p.stats?.yellowCards === 2);
  const activeSuspensions = (suspensions || []).filter((s) => s && s.active);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            Controle Disciplinar & Suspensões
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Controle automático de cartões amarelos acumulados e suspensões por cartão vermelho direto
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Suspensions */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <UserX className="w-4 h-4 text-rose-500" />
            Atletas Atualmente Suspensos ({activeSuspensions.length})
          </h3>

          <div className="space-y-2">
            {activeSuspensions.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">Nenhum atleta suspenso no momento.</p>
            ) : (
              activeSuspensions.map((s) => (
                <div
                  key={s.id}
                  className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-extrabold text-slate-900 dark:text-white">{s.playerName}</p>
                    <p className="text-[10px] text-slate-500">{s.teamName} | Motivo: {s.reason}</p>
                  </div>

                  <span className="px-2.5 py-1 bg-rose-600 text-white font-extrabold rounded-lg text-[10px] uppercase">
                    {s.gamesCount} Jogo(s) Suspenso
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Players Warning Threshold - Pendurados */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-500" />
            Atletas Pendurados com 2 Amarelos ({pendurados.length})
          </h3>

          <div className="space-y-2">
            {pendurados.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">Nenhum atleta pendurado.</p>
            ) : (
              pendurados.map((p) => {
                const team = teams.find((t) => t.id === p.teamId);

                return (
                  <div
                    key={p.id}
                    className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <img src={p.photoUrl} alt="" className="w-7 h-7 rounded-lg object-cover" />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{p.fullName}</p>
                        <p className="text-[10px] text-slate-500">{team?.name || 'Sem Time'}</p>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-black rounded text-[10px]">
                      🟨 2 Cartões Amarelos
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
