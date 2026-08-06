import React, { useState } from 'react';
import {
  Trophy,
  Plus,
  Calendar,
  MapPin,
  CheckCircle,
  ArrowRight,
  X,
  Search,
  Users,
  Shield,
  FileText,
  Sliders,
  Sparkles,
  User as UserIcon,
  LogOut
} from 'lucide-react';
import { Championship, User } from '../../types';

interface ChampionshipsHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  championships: Championship[];
  selectedChampId: string;
  onSelectChampionship: (champId: string) => void;
  onCreateChampionship: (data: Partial<Championship>) => Promise<Championship>;
  currentUser?: User | null;
  onLogout?: () => void;
}

export const ChampionshipsHubModal: React.FC<ChampionshipsHubModalProps> = ({
  isOpen,
  onClose,
  championships = [],
  selectedChampId,
  onSelectChampionship,
  onCreateChampionship,
  currentUser,
  onLogout,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterTab, setFilterTab] = useState<'MY' | 'ALL'>('MY');

  // Form state for creating new championship
  const [newForm, setNewForm] = useState<Partial<Championship>>({
    name: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    location: 'Arena Principal',
    address: 'Av. dos Esportes, 100',
    city: 'São Paulo',
    state: 'SP',
    organizerName: currentUser?.name || 'Organização Esportiva',
    organizerPhone: '(11) 99999-8888',
    organizerEmail: currentUser?.email || 'contato@torneio.com.br',
    logoUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=300&auto=format&fit=crop&q=80',
    status: 'IN_PROGRESS',
    rules: {
      pointsForWin: 3,
      pointsForDraw: 1,
      pointsForLoss: 0,
      tiebreakers: ['POINTS', 'VICTORIES', 'GOAL_DIFFERENCE', 'GOALS_FOR', 'DIRECT_HEAD_TO_HEAD', 'FEWEST_CARDS'],
      substitutionsAllowed: 7,
      matchDurationMinutes: 50,
      startersCount: 7,
      maxBenchCount: 7,
      yellowCardsForSuspension: 3,
      directRedCardSuspensionGames: 2,
      registrationFeeAmount: 100.0,
      woGoalsGiven: 3,
    },
  });

  if (!isOpen) return null;

  const myChampionships = championships.filter(
    (c) =>
      !currentUser ||
      (c.organizerEmail && c.organizerEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
      c.id === selectedChampId ||
      championships.length <= 1
  );

  const displayedList = (filterTab === 'MY' && currentUser ? myChampionships : championships).filter((c) =>
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.city || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (id: string) => {
    onSelectChampionship(id);
    onClose();
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.name) return;
    try {
      setSubmitting(true);
      const created = await onCreateChampionship({
        ...newForm,
        organizerEmail: currentUser?.email || newForm.organizerEmail,
        organizerName: newForm.organizerName || currentUser?.name || 'Organizador',
        slug: (newForm.name || '').toLowerCase().replace(/\s+/g, '-'),
      });
      setIsCreating(false);
      setSubmitting(false);
      if (created && created.id) {
        onSelectChampionship(created.id);
      }
      onClose();
    } catch (err) {
      console.error('Error creating championship:', err);
      setSubmitting(false);
    }
  };

  const statusBadge = (status?: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 uppercase tracking-wider">
            Em Andamento
          </span>
        );
      case 'REGISTRATION_OPEN':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-400 border border-sky-200 dark:border-sky-800 uppercase tracking-wider">
            Inscrições Abertas
          </span>
        );
      case 'PLANNING':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-400 border border-amber-200 dark:border-amber-800 uppercase tracking-wider">
            Em Planejamento
          </span>
        );
      case 'FINISHED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 uppercase tracking-wider">
            Finalizado
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 uppercase tracking-wider">
            {status || 'Ativo'}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  {isCreating ? 'Cadastrar Novo Campeonato' : 'Central de Campeonatos'}
                </h2>
                {currentUser && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                    {currentUser.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {isCreating
                  ? 'Preencha os dados e crie uma nova competição isolada para sua conta.'
                  : currentUser
                  ? `Selecione qual competição de ${currentUser.name} deseja abrir, ou crie um novo torneio.`
                  : 'Selecione um campeonato ativo para gerenciar ou crie uma nova competição.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isCreating && (
              <button
                onClick={() => setIsCreating(true)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Campeonato</span>
              </button>
            )}

            {onLogout && (
              <button
                onClick={onLogout}
                title="Sair da Conta"
                className="px-3 py-2 text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {!isCreating && currentUser && (
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilterTab('MY')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterTab === 'MY'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-white'
                  }`}
                >
                  Meus Campeonatos ({myChampionships.length})
                </button>
                <button
                  onClick={() => setFilterTab('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterTab === 'ALL'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-white'
                  }`}
                >
                  Todos os Torneios ({championships.length})
                </button>
              </div>

              <span className="text-[11px] text-slate-400 hidden sm:inline font-medium">
                Conectado como <strong className="text-slate-700 dark:text-slate-200">{currentUser.email}</strong>
              </span>
            </div>
          )}

          {isCreating ? (
            /* Creation Form */
            <form onSubmit={handleCreateSubmit} className="space-y-6 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Nome do Campeonato *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 1º Torneio Primavera de Futebol 7"
                    value={newForm.name || ''}
                    onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                    className="w-full mt-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Descrição e Categoria
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Breve descrição dos objetivos, regras ou categoria (Ex: Categoria Aberta / Livre)..."
                    value={newForm.description || ''}
                    onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                    className="w-full mt-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Data de Início
                  </label>
                  <input
                    type="date"
                    value={newForm.startDate || ''}
                    onChange={(e) => setNewForm({ ...newForm, startDate: e.target.value })}
                    className="w-full mt-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Data de Término
                  </label>
                  <input
                    type="date"
                    value={newForm.endDate || ''}
                    onChange={(e) => setNewForm({ ...newForm, endDate: e.target.value })}
                    className="w-full mt-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Local Principal / Arena
                  </label>
                  <input
                    type="text"
                    value={newForm.location || ''}
                    onChange={(e) => setNewForm({ ...newForm, location: e.target.value })}
                    className="w-full mt-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Cidade / UF
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Cidade"
                      value={newForm.city || ''}
                      onChange={(e) => setNewForm({ ...newForm, city: e.target.value })}
                      className="col-span-2 mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="UF"
                      value={newForm.state || ''}
                      onChange={(e) => setNewForm({ ...newForm, state: e.target.value })}
                      className="col-span-1 mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Organizador / Responsável
                  </label>
                  <input
                    type="text"
                    value={newForm.organizerName || ''}
                    onChange={(e) => setNewForm({ ...newForm, organizerName: e.target.value })}
                    className="w-full mt-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Status Inicial
                  </label>
                  <select
                    value={newForm.status || 'IN_PROGRESS'}
                    onChange={(e) => setNewForm({ ...newForm, status: e.target.value as any })}
                    className="w-full mt-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="PLANNING">Planejamento</option>
                    <option value="REGISTRATION_OPEN">Inscrições Abertas</option>
                    <option value="IN_PROGRESS">Em Andamento</option>
                    <option value="FINISHED">Finalizado</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || !newForm.name}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{submitting ? 'Criando Torneio...' : 'Criar & Acessar Campeonato'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Championships Selector List */
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar campeonato por nome ou cidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                />
              </div>

              {/* Grid of Championships */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {displayedList.map((champ) => {
                  const isSelected = champ.id === selectedChampId;
                  return (
                    <div
                      key={champ.id}
                      onClick={() => handleSelect(champ.id)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                        isSelected
                          ? 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500 dark:border-emerald-500/50 shadow-md ring-2 ring-emerald-500/20'
                          : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            {champ.logoUrl ? (
                              <img
                                src={champ.logoUrl}
                                alt={champ.name}
                                className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 text-emerald-500 flex items-center justify-center font-bold">
                                <Trophy className="w-6 h-6" />
                              </div>
                            )}
                            <div>
                              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white line-clamp-1">
                                {champ.name}
                              </h3>
                              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {champ.city || 'São Paulo'} - {champ.state || 'SP'}
                              </p>
                            </div>
                          </div>

                          {statusBadge(champ.status)}
                        </div>

                        {champ.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                            {champ.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                          <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{champ.startDate ? new Date(champ.startDate).toLocaleDateString('pt-BR') : '2026'}</span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(champ.id);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-700 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Ativo</span>
                            </>
                          ) : (
                            <>
                              <span>Acessar</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}

                {displayedList.length === 0 && (
                  <div className="col-span-2 py-12 text-center text-slate-400 space-y-3">
                    <Trophy className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
                    <p className="text-xs font-semibold">Nenhum campeonato encontrado.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
