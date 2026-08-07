import React, { useState } from 'react';
import {
  Trophy,
  Bell,
  Search,
  UserCheck,
  Moon,
  Sun,
  Tv,
  QrCode,
  Share2,
  ExternalLink,
  ShieldAlert,
  Sliders,
  Sparkles
} from 'lucide-react';
import { Championship, User, NotificationItem } from '../../types';

interface NavbarProps {
  championship?: Championship | null;
  currentChampionship?: Championship | null;
  championships?: Championship[];
  onSelectChampionship?: (champ: Championship) => void;
  userRole?: 'ADMIN' | 'OPERATOR' | 'VIEWER';
  onSelectRole?: (role: 'ADMIN' | 'OPERATOR' | 'VIEWER') => void;
  currentUser?: User;
  onRoleChange?: (role: 'ADMIN' | 'OPERATOR' | 'VIEWER') => void;
  notifications?: NotificationItem[];
  onOpenStadiumTv?: () => void;
  onOpenPublicLink?: () => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  onSelectModule?: (mod: string) => void;
  onNewMatch?: () => void;
  onOpenChampionshipsHub?: () => void;
  darkMode?: boolean;
  setDarkMode?: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  championship,
  currentChampionship,
  championships = [],
  onSelectChampionship,
  userRole = 'ADMIN',
  onSelectRole,
  currentUser,
  onRoleChange,
  notifications = [],
  onOpenStadiumTv,
  onOpenPublicLink,
  activeTab,
  setActiveTab,
  onSelectModule,
  onNewMatch,
  onOpenChampionshipsHub,
  darkMode = false,
  setDarkMode,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const champ = championship || currentChampionship;
  const role = userRole || currentUser?.role || 'ADMIN';
  const handleRoleChange = (r: 'ADMIN' | 'OPERATOR' | 'VIEWER') => {
    if (onSelectRole) onSelectRole(r);
    if (onRoleChange) onRoleChange(r);
  };

  const handleNewMatchClick = () => {
    if (onNewMatch) {
      onNewMatch();
    } else if (onSelectModule) {
      onSelectModule('matches');
    } else if (setActiveTab) {
      setActiveTab('matches');
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 sm:px-8 flex items-center justify-between sticky top-0 z-40 transition-colors">
      {/* High Density Header Info */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onOpenChampionshipsHub}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer group text-left"
          title="Clique para Selecionar ou Cadastrar Outro Campeonato"
        >
          <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <h2 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 truncate max-w-[180px] sm:max-w-md group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {champ?.name || 'Selecione ou Crie um Campeonato'}
          </h2>
          <span className="text-[10px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 font-bold">
            ▼
          </span>
        </button>
      </div>

      {/* High Density Right Actions */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Role Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium">
          <button
            onClick={() => handleRoleChange('ADMIN')}
            title="Modo Administrador"
            className={`px-2 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
              role === 'ADMIN'
                ? 'bg-slate-900 dark:bg-slate-700 text-white font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => handleRoleChange('OPERATOR')}
            title="Modo Operador de Súmula"
            className={`px-2 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
              role === 'OPERATOR'
                ? 'bg-amber-600 text-white font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Operador
          </button>
          <button
            onClick={() => handleRoleChange('VIEWER')}
            title="Modo Visão Pública"
            className={`px-2 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
              role === 'VIEWER'
                ? 'bg-sky-600 text-white font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Público
          </button>
        </div>

        {/* Action Buttons */}
        <button
          onClick={handleNewMatchClick}
          className="px-2.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 rounded shadow-sm transition-all flex items-center gap-1 cursor-pointer"
          title="Agendar Nova Partida"
        >
          <span>+ Nova Partida</span>
        </button>

        {/* User Badge & Hub button */}
        {currentUser && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <button
              onClick={onOpenChampionshipsHub}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-left"
              title="Central de Campeonatos / Perfil do Usuário"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center overflow-hidden border border-emerald-400">
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  currentUser.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="hidden xl:flex flex-col">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-none">
                  {currentUser.name}
                </span>
                <span className="text-[9px] text-slate-400 font-medium">{currentUser.email}</span>
              </div>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
