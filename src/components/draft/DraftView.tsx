import React, { useState } from 'react';
import {
  Shuffle,
  Play,
  RotateCcw,
  Sparkles,
  Users,
  Shield,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sliders,
  Calendar,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Player, Team } from '../../types';
import { FixturesDrawModal } from './FixturesDrawModal';

interface DraftViewProps {
  players: Player[];
  teams: Team[];
  onExecuteDraft: (data: {
    championshipId?: string;
    teamIds: string[];
    playerIds: string[];
    mode: 'RANDOM' | 'BALANCED_POSITION' | 'BALANCED_SKILL' | 'GOALKEEPER_FIRST';
  }) => Promise<void>;
  onGenerateFixtures?: (options: {
    format: 'ROUND_ROBIN' | 'DOUBLE_ROUND_ROBIN' | 'KNOCKOUT';
    startDate: string;
    time: string;
    location: string;
    daysBetweenRounds: number;
    clearExisting: boolean;
  }) => Promise<{ success: boolean; matches: any[] }>;
  userRole: 'ADMIN' | 'OPERATOR' | 'VIEWER';
}

export const DraftView: React.FC<DraftViewProps> = ({
  players = [],
  teams = [],
  onExecuteDraft,
  onGenerateFixtures,
  userRole = 'ADMIN',
}) => {
  const safePlayers = Array.isArray(players) ? players : [];
  const safeTeams = Array.isArray(teams) ? teams : [];

  const [selectedTeams, setSelectedTeams] = useState<string[]>(safeTeams.map((t) => t.id));
  const [draftMode, setDraftMode] = useState<'RANDOM' | 'BALANCED_POSITION' | 'BALANCED_SKILL' | 'GOALKEEPER_FIRST'>('BALANCED_POSITION');
  const [isDrafting, setIsDrafting] = useState(false);
  const [currentDraftingName, setCurrentDraftingName] = useState<string | null>(null);
  const [isFixturesModalOpen, setIsFixturesModalOpen] = useState(false);

  const unassignedPlayers = safePlayers.filter((p) => p && !p.teamId);

  const toggleTeamSelect = (id: string) => {
    if (selectedTeams.includes(id)) {
      setSelectedTeams((selectedTeams || []).filter((t) => t !== id));
    } else {
      setSelectedTeams([...selectedTeams, id]);
    }
  };

  const handleStartDraftAnimation = async () => {
    if (selectedTeams.length === 0 || safePlayers.length === 0) return;

    setIsDrafting(true);

    // Simulate roulette animation
    const sampleNames = safePlayers.map((p) => p.fullName);
    let iterations = 0;
    const interval = setInterval(() => {
      const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
      setCurrentDraftingName(randomName);
      iterations++;

      if (iterations > 20) {
        clearInterval(interval);
        executeRealDraft();
      }
    }, 100);
  };

  const executeRealDraft = async () => {
    await onExecuteDraft({
      championshipId: 'champ_1',
      teamIds: selectedTeams,
      playerIds: safePlayers.map((p) => p.id),
      mode: draftMode,
    });

    setIsDrafting(false);
    setCurrentDraftingName(null);

    // Trigger celebration confetti!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Shuffle className="w-6 h-6 text-amber-500 animate-spin-slow" />
            Sorteio & Distribuição de Jogadores
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Sorteie automaticamente os atletas entre as equipes selecionadas com balanceamento inteligente por posição ou nível técnico.
          </p>
        </div>

        {userRole === 'ADMIN' && (
          <div className="flex flex-wrap items-center gap-3">
            {onGenerateFixtures && (
              <button
                onClick={() => setIsFixturesModalOpen(true)}
                className="px-5 py-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
              >
                <Calendar className="w-4 h-4 text-emerald-400" />
                Sortear Confrontos (Tabela)
              </button>
            )}

            <button
              onClick={handleStartDraftAnimation}
              disabled={isDrafting || selectedTeams.length === 0}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-slate-950 font-black rounded-2xl text-xs flex items-center gap-2 shadow-xl transition-all uppercase tracking-wider"
            >
              <Sparkles className="w-4 h-4" />
              {isDrafting ? 'Sortear Atletas...' : 'Iniciar Sorteio de Jogadores'}
            </button>
          </div>
        )}
      </div>

      {onGenerateFixtures && (
        <FixturesDrawModal
          isOpen={isFixturesModalOpen}
          onClose={() => setIsFixturesModalOpen(false)}
          teams={safeTeams}
          onGenerateFixtures={onGenerateFixtures}
        />
      )}

      {/* Animation Overlay Container */}
      {isDrafting && (
        <div className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl p-8 text-center text-white space-y-4 shadow-2xl animate-pulse">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-2xl font-black border border-amber-500/40">
            <Shuffle className="w-8 h-8 animate-spin" />
          </div>
          <h3 className="text-xl font-black">SORTEANDO ATLETAS E BALANCEANDO EQUIPES...</h3>
          <p className="text-2xl font-mono text-emerald-400 font-extrabold h-8">{currentDraftingName}</p>
        </div>
      )}

      {/* Draft Setup Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Column */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-500" />
              Algoritmo do Sorteio
            </h3>

            <div className="space-y-2">
              {[
                {
                  id: 'BALANCED_POSITION',
                  title: 'Balancear por Posição',
                  desc: 'Distribui igualmente Goleiros, Zagueiros, Meias e Atacantes.',
                },
                {
                  id: 'GOALKEEPER_FIRST',
                  title: 'Goleiros Primeiro',
                  desc: 'Sorteia 1 goleiro titular para cada time e distribui os demais.',
                },
                {
                  id: 'BALANCED_SKILL',
                  title: 'Nível Técnico (Draft Snake)',
                  desc: 'Equilibra a força total das equipes.',
                },
                {
                  id: 'RANDOM',
                  title: 'Completamente Aleatório',
                  desc: 'Sorteio aleatório sem restrições.',
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setDraftMode(opt.id as any)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                    draftMode === opt.id
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-slate-900 dark:text-white font-bold'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <p className="font-extrabold">{opt.title}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              Equipes Participantes do Sorteio
            </h3>

            <div className="space-y-2 max-h-52 overflow-y-auto custom-scrollbar">
              {teams.map((t) => {
                const isSelected = selectedTeams.includes(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => toggleTeamSelect(t.id)}
                    className={`w-full p-2.5 rounded-xl border text-xs flex items-center justify-between font-bold transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white border-emerald-500'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    <span>{t.name}</span>
                    <CheckCircle2 className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Squad Allocation Results Preview */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-500" />
            Resultado Atual da Distribuição
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {safeTeams.map((t) => {
              const teamPlayers = safePlayers.filter((p) => p && p.teamId === t.id);

              return (
                <div
                  key={t.id}
                  className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.primaryColor }} />
                      {t.name}
                    </h4>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-bold text-slate-600 dark:text-slate-400">
                      {teamPlayers.length} atletas
                    </span>
                  </div>

                  <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar text-xs">
                    {teamPlayers.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic py-2">Nenhum jogador sorteado ainda</p>
                    ) : (
                      teamPlayers.map((p) => (
                        <div
                          key={p.id}
                          className="p-1.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg flex items-center justify-between"
                        >
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{p.fullName}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{p.position.substring(0, 3)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
