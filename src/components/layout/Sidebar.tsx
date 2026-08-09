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
  DollarSign,
  X,
  LogOut,
  Menu,
  ChevronRight
} from 'lucide-react';
import { User } from '../../types';

interface SidebarProps {
  activeModule?: string;
  onSelectModule?: (tab: string) => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  userRole?: 'ADMIN' | 'OPERATOR' | 'VIEWER';
  liveMatchesCount?: number;
  suspendedCount?: number;
  onOpenChampionshipsHub?: () => void;
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (open: boolean) => void;
  currentUser?: User | null;
  onSelectRole?: (role: 'ADMIN' | 'OPERATOR' | 'VIEWER') => void;
  onLogout?: () => void;
  championshipName?: string;
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
  isMobileMenuOpen = false,
  setIsMobileMenuOpen,
  currentUser,
  onSelectRole,
  onLogout,
  championshipName = 'LigaPro',
}) => {
  const currentTab = activeModule || activeTab || 'dashboard';

  const selectTab = (tab: string) => {
    if (onSelectModule) onSelectModule(tab);
    if (setActiveTab) setActiveTab(tab);
    if (setIsMobileMenuOpen) setIsMobileMenuOpen(false);
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

  // Bottom Navigation Bar Items for quick mobile access
  const bottomNavItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'phases_standings', label: 'Tabela', icon: GitMerge },
    {
      id: 'live_control',
      label: 'Ao Vivo',
      icon: Radio,
      badge: liveMatchesCount > 0 ? liveMatchesCount : undefined,
    },
    { id: 'matches', label: 'Jogos', icon: Calendar },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-56 bg-slate-900 text-slate-300 flex-shrink-0 flex-col border-r border-slate-800 transition-all hidden md:flex h-full">
        {/* High Density Brand Header */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
              <Trophy className="w-4 h-4 text-white stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-white font-bold text-base tracking-tight leading-none">LigaPro</h1>
              <span className="text-[10px] text-slate-400 font-medium mt-0.5">Gerenciador Futebol</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id || (item.id === 'live_control' && currentTab === 'live');

            return (
              <button
                key={item.id}
                onClick={() => selectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
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
      </aside>

      {/* Mobile Slide-over Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative flex-1 max-w-xs w-full bg-slate-900 text-slate-300 flex flex-col h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0 shadow-md">
                  <Trophy className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-white font-extrabold text-sm tracking-tight leading-none">LigaPro</h2>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">{championshipName}</p>
                </div>
              </div>

              <button
                onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Role Switcher inside Drawer */}
            {onSelectRole && (
              <div className="p-3 border-b border-slate-800 bg-slate-900/50">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Perfil de Acesso
                </label>
                <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => {
                      onSelectRole('ADMIN');
                      if (setIsMobileMenuOpen) setIsMobileMenuOpen(false);
                    }}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      userRole === 'ADMIN'
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Admin
                  </button>
                  <button
                    onClick={() => {
                      onSelectRole('OPERATOR');
                      if (setIsMobileMenuOpen) setIsMobileMenuOpen(false);
                    }}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      userRole === 'OPERATOR'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Súmula
                  </button>
                  <button
                    onClick={() => {
                      onSelectRole('VIEWER');
                      if (setIsMobileMenuOpen) setIsMobileMenuOpen(false);
                    }}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      userRole === 'VIEWER'
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Público
                  </button>
                </div>
              </div>
            )}

            {/* Drawer Navigation List */}
            <div className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block px-2 mb-1">
                Módulos do Sistema
              </label>
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id || (item.id === 'live_control' && currentTab === 'live');

                return (
                  <button
                    key={item.id}
                    onClick={() => selectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-extrabold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-emerald-400' : item.highlight ? 'text-amber-400' : 'text-slate-400'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Drawer Footer User / Hub / Logout */}
            <div className="p-4 border-t border-slate-800 space-y-2 bg-slate-950">
              {onOpenChampionshipsHub && (
                <button
                  onClick={() => {
                    onOpenChampionshipsHub();
                    if (setIsMobileMenuOpen) setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-emerald-400" />
                    Central de Campeonatos
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              )}

              {currentUser && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center border border-emerald-400">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white truncate max-w-[120px]">
                        {currentUser.name}
                      </span>
                      <span className="text-[10px] text-slate-400">{currentUser.role}</span>
                    </div>
                  </div>

                  {onLogout && (
                    <button
                      onClick={onLogout}
                      className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                      title="Sair da Conta"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 md:hidden flex justify-around items-center p-1.5 shadow-2xl">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id || (item.id === 'live_control' && currentTab === 'live');

          return (
            <button
              key={item.id}
              onClick={() => selectTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
                isActive ? 'text-emerald-400 font-extrabold' : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400 scale-110' : 'text-slate-400'}`} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2.5 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}

        {/* Menu Button to trigger Drawer */}
        <button
          onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(true)}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            isMobileMenuOpen ? 'text-emerald-400 font-extrabold' : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">Menu</span>
        </button>
      </div>
    </>
  );
};

