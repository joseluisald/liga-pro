import React from 'react';
import {
  LayoutDashboard,
  Trophy,
  Users,
  Shield,
  Shuffle,
  GitMerge,
  Calendar,
  Radio,
  AlertTriangle,
  Award,
  Star,
  DollarSign,
  FileText,
  Share2,
  Tv,
  History,
  Settings
} from 'lucide-react';

interface SidebarProps {
  activeModule?: string;
  onSelectModule?: (tab: string) => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  userRole?: 'ADMIN' | 'OPERATOR' | 'VIEWER';
  liveMatchesCount?: number;
  suspendedCount?: number;
  onOpenChampionshipsHub?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  activeTab,
  setActiveTab,
  userRole = 'ADMIN',
  liveMatchesCount = 0,
  suspendedCount = 0,
  onOpenChampionshipsHub,
}) => {
  const currentTab = activeModule || activeTab || 'dashboard';
  const selectTab = (tab: string) => {
    if (onSelectModule) onSelectModule(tab);
    if (setActiveTab) setActiveTab(tab);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'championship', label: 'Campeonato & Regras', icon: Trophy },
    { id: 'players', label: 'Jogadores', icon: Users },
    { id: 'teams', label: 'Times & Elencos', icon: Shield },
    { id: 'draft', label: 'Sorteio de Jogadores', icon: Shuffle, highlight: true },
    { id: 'phases_standings', label: 'Classificação & Chaves', icon: GitMerge },
    { id: 'matches', label: 'Jogos & Calendário', icon: Calendar },
    {
      id: 'live_control',
      label: 'Controle Ao Vivo',
      icon: Radio,
      badge: liveMatchesCount > 0 ? `${liveMatchesCount} AO VIVO` : undefined,
      badgeColor: 'bg-rose-500 text-white animate-pulse',
    },
    {
      id: 'discipline',
      label: 'Disciplina & Suspensões',
      icon: AlertTriangle,
      badge: suspendedCount > 0 ? `${suspendedCount}` : undefined,
      badgeColor: 'bg-amber-500 text-slate-900 font-bold',
    },
    { id: 'stats', label: 'Artilharia & Rankings', icon: Award },
    { id: 'financial', label: 'Controle Financeiro', icon: DollarSign },
  ];

  const visibleItems = navItems.filter((item) => userRole === 'ADMIN' || item.id !== 'financial');

  return (
    <aside className="w-56 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col border-r border-slate-800 transition-all hidden md:flex">
      {/* High Density Brand Header */}
      <div className="p-4 border-b border-slate-800 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
            <Trophy className="w-4 h-4 text-white stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-white font-bold text-base tracking-tight leading-none">LigaPro</h1>
            <span className="text-[10px] text-slate-400 font-medium mt-0.5">Gerenciador SaaS</span>
          </div>
        </div>

        {onOpenChampionshipsHub && (
          <button
            onClick={onOpenChampionshipsHub}
            className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700/80 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer group"
            title="Ver Todos / Cadastrar Novo Campeonato"
          >
            <span className="flex items-center gap-2">
              <Trophy className="w-3.5 h-3.5 text-emerald-400" />
              <span>Meus Campeonatos</span>
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-black group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              + / ⇄
            </span>
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id || (item.id === 'live_control' && currentTab === 'live');

          return (
            <button
              key={item.id}
              onClick={() => selectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-emerald-600/10 text-emerald-400 border-l-2 border-emerald-500 font-semibold'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-emerald-400' : item.highlight ? 'text-amber-400' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* High Density User Footer */}
      <div className="p-4 mt-auto border-t border-slate-800 bg-slate-900/90">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white border border-slate-600">
            AM
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">Admin Master</p>
            <p className="text-[10px] text-slate-500 truncate">Gerenciador SaaS</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
