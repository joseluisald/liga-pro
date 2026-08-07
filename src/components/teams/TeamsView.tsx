import React, { useState, useRef } from 'react';
import {
  Shield,
  Plus,
  Users,
  Edit2,
  Trash2,
  UserPlus,
  Crown,
  Shirt,
  X,
  CheckCircle,
  Trophy,
  Camera,
  Upload
} from 'lucide-react';
import { Team, Player, StandingRow, Category, DEFAULT_CATEGORIES } from '../../types';

interface TeamsViewProps {
  teams: Team[];
  players: Player[];
  standings: StandingRow[];
  categories?: Category[];
  onCreateTeam: (t: Partial<Team>) => void;
  onUpdateTeam: (id: string, t: Partial<Team>) => void;
  onDeleteTeam: (id: string) => void;
  onAssignPlayerToTeam: (playerId: string, teamId: string | null) => void;
  userRole: 'ADMIN' | 'OPERATOR' | 'VIEWER';
}

export const TeamsView: React.FC<TeamsViewProps> = ({
  teams = [],
  players = [],
  standings = [],
  categories = DEFAULT_CATEGORIES,
  onCreateTeam,
  onUpdateTeam,
  onDeleteTeam,
  onAssignPlayerToTeam,
  userRole = 'ADMIN',
}) => {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Partial<Team> | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingTeam) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingTeam({
          ...editingTeam,
          logoUrl: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenAddModal = () => {
    setEditingTeam({
      name: '',
      shortName: '',
      primaryColor: '#10b981',
      secondaryColor: '#ffffff',
      coachName: '',
      managerName: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (t: Team) => {
    setEditingTeam({ ...t });
    setIsModalOpen(true);
  };

  const handleSaveTeam = () => {
    if (!editingTeam || !editingTeam.name) return;

    if (editingTeam.id) {
      onUpdateTeam(editingTeam.id, editingTeam);
    } else {
      onCreateTeam(editingTeam);
    }

    setIsModalOpen(false);
    setEditingTeam(null);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-500" />
            Gestão de Equipes & Elencos
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {teams.length} equipes participantes ativas no campeonato
          </p>
        </div>

        {userRole === 'ADMIN' && (
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Nova Equipe
          </button>
        )}
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(teams || []).map((t) => {
          const teamPlayers = (players || []).filter((p) => p && p.teamId === t.id);
          const standing = standings.find((s) => s.teamId === t.id);
          const captain = players.find((p) => p.id === t.captainPlayerId);

          return (
            <div
              key={t.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Header Badge */}
              <div
                className="p-4 text-white relative flex items-center justify-between"
                style={{
                  background: `linear-gradient(135deg, ${t.primaryColor} 0%, ${t.secondaryColor || '#000000'} 100%)`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-lg border border-white/40 shadow">
                    {t.shortName}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base drop-shadow-md">{t.name}</h3>
                    <p className="text-[11px] font-semibold opacity-90">Técnico: {t.coachName || 'Não Informado'}</p>
                  </div>
                </div>

                {userRole === 'ADMIN' && (
                  <div className="flex items-center gap-1 bg-black/30 backdrop-blur-md p-1 rounded-lg">
                    <button
                      onClick={() => handleOpenEditModal(t)}
                      className="p-1 hover:bg-white/20 rounded text-white"
                      title="Editar Equipe"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteTeam(t.id)}
                      className="p-1 hover:bg-rose-500 rounded text-white"
                      title="Excluir Equipe"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Team Stats Summary */}
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-4 gap-2 text-center font-mono text-xs bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl">
                  <div>
                    <p className="font-black text-slate-900 dark:text-white">{standing?.played || 0}</p>
                    <p className="text-[10px] text-slate-400 font-sans uppercase">Jogos</p>
                  </div>
                  <div>
                    <p className="font-black text-emerald-600">{standing?.won || 0}</p>
                    <p className="text-[10px] text-slate-400 font-sans uppercase">Vitórias</p>
                  </div>
                  <div>
                    <p className="font-black text-sky-500">{standing?.goalDifference || 0}</p>
                    <p className="text-[10px] text-slate-400 font-sans uppercase">Saldo</p>
                  </div>
                  <div>
                    <p className="font-black text-amber-500">{standing?.points || 0}</p>
                    <p className="text-[10px] text-slate-400 font-sans uppercase">Pontos</p>
                  </div>
                </div>

                {/* Squad Members Quick List */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-emerald-500" />
                      Elenco ({teamPlayers.length} atletas)
                    </span>
                    <button
                      onClick={() => setSelectedTeam(t)}
                      className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      Ver / Gerenciar
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                    {teamPlayers.slice(0, 5).map((p) => (
                      <div
                        key={p.id}
                        className="p-1.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-xs flex items-center justify-between"
                      >
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {p.shirtNumber ? `#${p.shirtNumber} ` : ''}
                          {p.fullName}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{p.position.substring(0, 3)}</span>
                      </div>
                    ))}
                    {teamPlayers.length > 5 && (
                      <p className="text-[10px] text-slate-400 italic text-center pt-1">
                        + {teamPlayers.length - 5} atletas no elenco
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Team Squad Manager Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-500" />
                Elenco de {selectedTeam.name}
              </h3>
              <button onClick={() => setSelectedTeam(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Atletas Vinculados</h4>
              <div className="space-y-2">
                {(players || [])
                  .filter((p) => p && p.teamId === selectedTeam.id)
                  .map((p) => (
                    <div
                      key={p.id}
                      className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <img src={p.photoUrl} alt="" className="w-7 h-7 rounded-lg object-cover" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">
                            #{p.shirtNumber || '-'} {p.fullName}
                          </p>
                          <p className="text-[10px] text-slate-500">{p.position}</p>
                        </div>
                      </div>

                      {userRole === 'ADMIN' && (
                        <button
                          onClick={() => onAssignPlayerToTeam(p.id, null)}
                          className="px-2.5 py-1 bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white font-bold rounded-lg text-[10px] transition-all"
                        >
                          Remover do Time
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Team Modal */}
      {isModalOpen && editingTeam && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                {editingTeam.id ? 'Editar Equipe' : 'Cadastrar Nova Equipe'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Logo / Escudo do Time */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Escudo / Logo da Equipe</span>
                  <span className="text-[10px] text-slate-400 font-normal">Upload ou URL</span>
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-700 border-2 border-emerald-500 overflow-hidden flex items-center justify-center shrink-0 shadow-inner group">
                    {editingTeam.logoUrl ? (
                      <img src={editingTeam.logoUrl} alt="Escudo" className="w-full h-full object-cover" />
                    ) : (
                      <Shield className="w-6 h-6 text-slate-400" />
                    )}
                    <button
                      type="button"
                      onClick={() => logoFileInputRef.current?.click()}
                      className="absolute inset-0 bg-slate-950/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                      title="Alterar Logo"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      placeholder="URL do Escudo (https://...)"
                      value={editingTeam.logoUrl || ''}
                      onChange={(e) => setEditingTeam({ ...editingTeam, logoUrl: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => logoFileInputRef.current?.click()}
                        className="px-3 py-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-emerald-500" />
                        Escolher Arquivo
                      </button>
                      <input
                        ref={logoFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Categoria do Time</label>
                <select
                  value={editingTeam.categoryId || 'principal'}
                  onChange={(e) => setEditingTeam({ ...editingTeam, categoryId: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                >
                  {(categories.length > 0 ? categories : DEFAULT_CATEGORIES).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nome do Time</label>
                <input
                  type="text"
                  value={editingTeam.name || ''}
                  onChange={(e) => setEditingTeam({ ...editingTeam, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nome Abreviado (3 Letras)</label>
                <input
                  type="text"
                  maxLength={3}
                  value={editingTeam.shortName || ''}
                  onChange={(e) => setEditingTeam({ ...editingTeam, shortName: e.target.value.toUpperCase() })}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Cor Principal</label>
                  <input
                    type="color"
                    value={editingTeam.primaryColor || '#10b981'}
                    onChange={(e) => setEditingTeam({ ...editingTeam, primaryColor: e.target.value })}
                    className="w-full mt-1 h-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer p-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Cor Secundária</label>
                  <input
                    type="color"
                    value={editingTeam.secondaryColor || '#ffffff'}
                    onChange={(e) => setEditingTeam({ ...editingTeam, secondaryColor: e.target.value })}
                    className="w-full mt-1 h-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer p-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nome do Técnico</label>
                <input
                  type="text"
                  value={editingTeam.coachName || ''}
                  onChange={(e) => setEditingTeam({ ...editingTeam, coachName: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveTeam}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md"
              >
                Salvar Equipe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
