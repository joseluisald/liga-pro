import React, { useState } from 'react';
import {
  GitMerge,
  Trophy,
  Download,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Shield,
  FileText,
  Shuffle
} from 'lucide-react';
import { Phase, Group, StandingRow, Championship, Team, Match } from '../../types';
import { generateStandingsPdf } from '../../utils/pdfGenerator';
import { FixturesDrawModal } from '../draft/FixturesDrawModal';

interface PhasesAndStandingsViewProps {
  championship: Championship;
  phases: Phase[];
  groups: Group[];
  standings: StandingRow[];
  matches: Match[];
  teams: Team[];
  onGenerateFixtures?: (options: {
    format: 'ROUND_ROBIN' | 'DOUBLE_ROUND_ROBIN' | 'KNOCKOUT';
    startDate: string;
    time: string;
    location: string;
    daysBetweenRounds: number;
    clearExisting: boolean;
  }) => Promise<{ success: boolean; matches: any[] }>;
  userRole?: 'ADMIN' | 'OPERATOR' | 'VIEWER';
}

export const PhasesAndStandingsView: React.FC<PhasesAndStandingsViewProps> = ({
  championship,
  phases = [],
  groups = [],
  standings = [],
  matches = [],
  teams = [],
  onGenerateFixtures,
  userRole = 'ADMIN',
}) => {
  const [activePhaseId, setActivePhaseId] = useState<string>(phases[0]?.id || 'phase_1');
  const [isFixturesModalOpen, setIsFixturesModalOpen] = useState(false);

  const currentPhase = (phases || []).find((p) => p.id === activePhaseId);

  const handleDownloadPdf = () => {
    generateStandingsPdf(championship, standings);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <GitMerge className="w-6 h-6 text-emerald-500" />
            Classificação & Chaveamento
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tabela de classificação atualizada automaticamente a cada partida encerrada
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onGenerateFixtures && userRole === 'ADMIN' && (
            <button
              onClick={() => setIsFixturesModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
            >
              <Shuffle className="w-4 h-4 text-white" />
              Sortear / Gerar Confrontos
            </button>
          )}

          <button
            onClick={handleDownloadPdf}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-2 border border-slate-700 shadow-sm transition-all"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Exportar PDF
          </button>
        </div>
      </div>

      {onGenerateFixtures && (
        <FixturesDrawModal
          isOpen={isFixturesModalOpen}
          onClose={() => setIsFixturesModalOpen(false)}
          teams={teams}
          onGenerateFixtures={onGenerateFixtures}
        />
      )}

      {/* Phase Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {phases.map((ph) => (
          <button
            key={ph.id}
            onClick={() => setActivePhaseId(ph.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activePhaseId === ph.id
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {ph.name}
          </button>
        ))}
      </div>

      {/* Group Phase View */}
      {currentPhase?.type === 'GROUPS' && (
        <div className="space-y-8">
          {(groups || []).map((group) => {
            const groupStandings = (standings || []).filter((s) => s && (group.teamIds || []).includes(s.teamId));

            return (
              <div
                key={group.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
              >
                <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    {group.name}
                  </h3>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    Classificam {currentPhase.qualifiedPerGroup || 2} equipes
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100/50 dark:bg-slate-800/40 text-[10px] font-extrabold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
                        <th className="p-3 text-center w-12">Pos</th>
                        <th className="p-3">Equipe</th>
                        <th className="p-3 text-center font-bold text-slate-900 dark:text-white">P</th>
                        <th className="p-3 text-center">J</th>
                        <th className="p-3 text-center">V</th>
                        <th className="p-3 text-center">E</th>
                        <th className="p-3 text-center">D</th>
                        <th className="p-3 text-center">GP</th>
                        <th className="p-3 text-center">GC</th>
                        <th className="p-3 text-center">SG</th>
                        <th className="p-3 text-center">Forma</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold">
                      {groupStandings.map((row, idx) => {
                        const isQualified = idx < (currentPhase.qualifiedPerGroup || 2);

                        return (
                          <tr
                            key={row.teamId}
                            className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                              isQualified ? 'bg-emerald-500/5' : ''
                            }`}
                          >
                            <td className="p-3 text-center">
                              <span
                                className={`w-6 h-6 rounded-full inline-flex items-center justify-center font-black text-xs ${
                                  isQualified
                                    ? 'bg-emerald-500 text-slate-950'
                                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}
                              >
                                {idx + 1}
                              </span>
                            </td>

                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: row.primaryColor }} />
                                <span className="font-bold text-slate-900 dark:text-white">{row.teamName}</span>
                              </div>
                            </td>

                            <td className="p-3 text-center font-black text-sm text-emerald-600 dark:text-emerald-400">
                              {row.points}
                            </td>
                            <td className="p-3 text-center">{row.played}</td>
                            <td className="p-3 text-center text-emerald-600">{row.won}</td>
                            <td className="p-3 text-center text-amber-500">{row.drawn}</td>
                            <td className="p-3 text-center text-rose-500">{row.lost}</td>
                            <td className="p-3 text-center font-mono">{row.goalsFor}</td>
                            <td className="p-3 text-center font-mono">{row.goalsAgainst}</td>
                            <td className="p-3 text-center font-mono font-bold text-sky-500">{row.goalDifference}</td>

                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                {row.recentForm.map((f, i) => (
                                  <span
                                    key={i}
                                    className={`w-4 h-4 rounded text-[9px] font-black flex items-center justify-center text-white ${
                                      f === 'W' ? 'bg-emerald-500' : f === 'D' ? 'bg-amber-500' : 'bg-rose-500'
                                    }`}
                                  >
                                    {f}
                                  </span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Knockout Bracket View */}
      {currentPhase?.type === 'KNOCKOUT' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-white space-y-6">
          <h3 className="text-sm font-extrabold flex items-center gap-2 text-emerald-400">
            <Trophy className="w-5 h-5 text-amber-400" />
            Chave do Mata-Mata (Semifinais & Final)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-center">
            {/* Semifinal 1 */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Semifinal 1</span>
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold p-2 bg-slate-900 rounded-lg">
                  <span>Real Boleiros FC (1º A)</span>
                  <span className="text-emerald-400">0</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold p-2 bg-slate-900 rounded-lg">
                  <span>Resenha & Futebol FC (2º B)</span>
                  <span className="text-emerald-400">0</span>
                </div>
              </div>
            </div>

            {/* Semifinal 2 */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Semifinal 2</span>
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold p-2 bg-slate-900 rounded-lg">
                  <span>Vila Nova FC (2º A)</span>
                  <span className="text-emerald-400">0</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold p-2 bg-slate-900 rounded-lg">
                  <span>Estrela D'Alva (1º B)</span>
                  <span className="text-emerald-400">0</span>
                </div>
              </div>
            </div>

            {/* Grande Final */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5" />
                Grande Final
              </span>
              <div className="bg-gradient-to-br from-amber-500/20 to-emerald-500/20 p-4 rounded-xl border border-amber-500/40 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold p-2 bg-slate-900 rounded-lg">
                  <span>Vencedor Semifinal 1</span>
                  <span className="text-amber-400">-</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold p-2 bg-slate-900 rounded-lg">
                  <span>Vencedor Semifinal 2</span>
                  <span className="text-amber-400">-</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
