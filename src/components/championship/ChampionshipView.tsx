import React, { useState, useEffect, useRef } from 'react';
import {
  Trophy,
  Save,
  FileText,
  Sliders,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Archive,
  Download,
  CheckCircle,
  HelpCircle,
  Upload,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { Championship, ChampionshipRule, TiebreakerCriterion } from '../../types';

interface ChampionshipViewProps {
  championship: Championship;
  onUpdateChampionship: (updated: Partial<Championship>) => void;
  userRole: 'ADMIN' | 'OPERATOR' | 'VIEWER';
}

const DEFAULT_RULES: ChampionshipRule = {
  pointsForWin: 3,
  pointsForDraw: 1,
  pointsForLoss: 0,
  yellowCardsForSuspension: 3,
  directRedCardSuspensionGames: 1,
  matchDurationMinutes: 80,
  startersCount: 11,
  maxBenchCount: 9,
  registrationFeeAmount: 500,
  substitutionsAllowed: 7,
  woGoalsGiven: 3,
  tiebreakers: [
    'POINTS',
    'VICTORIES',
    'GOAL_DIFFERENCE',
    'GOALS_FOR',
    'DIRECT_HEAD_TO_HEAD',
    'FEWEST_CARDS',
    'DRAW',
  ],
};

export const ChampionshipView: React.FC<ChampionshipViewProps> = ({
  championship,
  onUpdateChampionship,
  userRole,
}) => {
  const [formData, setFormData] = useState<Partial<Championship>>(() => ({ ...championship }));
  const [rules, setRules] = useState<ChampionshipRule>(() => ({
    ...DEFAULT_RULES,
    ...(championship?.rules || {}),
    tiebreakers: Array.isArray(championship?.rules?.tiebreakers)
      ? championship.rules.tiebreakers
      : DEFAULT_RULES.tiebreakers,
  }));
  const [saved, setSaved] = useState(false);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          logoUrl: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (championship) {
      setFormData({ ...championship });
      setRules({
        ...DEFAULT_RULES,
        ...(championship.rules || {}),
        tiebreakers: Array.isArray(championship.rules?.tiebreakers)
          ? championship.rules.tiebreakers
          : DEFAULT_RULES.tiebreakers,
      });
    }
  }, [championship]);

  const tiebreakerLabels: Record<TiebreakerCriterion, string> = {
    POINTS: 'Pontos Conquistados',
    VICTORIES: 'Número de Vitórias',
    GOAL_DIFFERENCE: 'Saldo de Gols (GP - GC)',
    GOALS_FOR: 'Gols Pró (Marcados)',
    DIRECT_HEAD_TO_HEAD: 'Confronto Direto',
    FEWEST_CARDS: 'Menor Número de Cartões (Fair Play)',
    DRAW: 'Sorteio Público',
  };

  const handleSave = () => {
    onUpdateChampionship({
      ...formData,
      rules,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-emerald-500" />
            Configurações & Regulamento do Campeonato
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gerencie as informações gerais, locais, taxas de inscrição e regras oficiais do campeonato.
          </p>
        </div>

        {userRole === 'ADMIN' && (
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
          >
            {saved ? <CheckCircle className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
            {saved ? 'Salvo com Sucesso!' : 'Salvar Alterações'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-500" />
              Informações Gerais do Torneio
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Logo / Emblema do Campeonato */}
              <div className="sm:col-span-2 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Logo / Emblema Oficial do Campeonato</span>
                  <span className="text-[10px] text-slate-400 font-normal">Upload de Imagem ou Link URL</span>
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-16 rounded-2xl bg-slate-200 dark:bg-slate-700 border-2 border-emerald-500 overflow-hidden flex items-center justify-center shrink-0 shadow-inner group">
                    {formData.logoUrl ? (
                      <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Trophy className="w-8 h-8 text-emerald-500" />
                    )}
                    {userRole === 'ADMIN' && (
                      <button
                        type="button"
                        onClick={() => logoFileInputRef.current?.click()}
                        className="absolute inset-0 bg-slate-950/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                        title="Alterar Logo"
                      >
                        <Camera className="w-6 h-6" />
                      </button>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      placeholder="URL do Logotipo (https://...)"
                      value={formData.logoUrl || ''}
                      onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                      disabled={userRole !== 'ADMIN'}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />

                    {userRole === 'ADMIN' && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => logoFileInputRef.current?.click()}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          Escolher Arquivo do Computador
                        </button>
                        <input
                          ref={logoFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nome do Campeonato</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={userRole !== 'ADMIN'}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Descrição / Apresentação</label>
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={userRole !== 'ADMIN'}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Data de Início</label>
                <input
                  type="date"
                  value={formData.startDate || ''}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  disabled={userRole !== 'ADMIN'}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Data de Término</label>
                <input
                  type="date"
                  value={formData.endDate || ''}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  disabled={userRole !== 'ADMIN'}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Local Principal</label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  disabled={userRole !== 'ADMIN'}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Endereço</label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled={userRole !== 'ADMIN'}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Cidade</label>
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  disabled={userRole !== 'ADMIN'}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Estado (UF)</label>
                <input
                  type="text"
                  value={formData.state || ''}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  disabled={userRole !== 'ADMIN'}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Responsável / Organização</label>
                <input
                  type="text"
                  value={formData.organizerName || ''}
                  onChange={(e) => setFormData({ ...formData, organizerName: e.target.value })}
                  disabled={userRole !== 'ADMIN'}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Status do Torneio</label>
                <select
                  value={formData.status || 'PLANNING'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  disabled={userRole !== 'ADMIN'}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                >
                  <option value="PLANNING">Planejamento</option>
                  <option value="REGISTRATION_OPEN">Inscrições Abertas</option>
                  <option value="REGISTRATION_CLOSED">Inscrições Encerradas</option>
                  <option value="IN_PROGRESS">Em Andamento</option>
                  <option value="FINISHED">Finalizado</option>
                  <option value="CANCELLED">Cancelado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Rules & Match Settings */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-500" />
              Regras do Jogo e Disciplina
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Duração do Jogo (Min.)</label>
                <input
                  type="number"
                  value={rules.matchDurationMinutes}
                  onChange={(e) => setRules({ ...rules, matchDurationMinutes: Number(e.target.value) })}
                  disabled={userRole !== 'ADMIN'}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Titulares em Campo</label>
                <input
                  type="number"
                  value={rules.startersCount}
                  onChange={(e) => setRules({ ...rules, startersCount: Number(e.target.value) })}
                  disabled={userRole !== 'ADMIN'}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Máximo Reservas</label>
                <input
                  type="number"
                  value={rules.maxBenchCount}
                  onChange={(e) => setRules({ ...rules, maxBenchCount: Number(e.target.value) })}
                  disabled={userRole !== 'ADMIN'}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Amarelos p/ Suspensão</label>
                <input
                  type="number"
                  value={rules.yellowCardsForSuspension}
                  onChange={(e) => setRules({ ...rules, yellowCardsForSuspension: Number(e.target.value) })}
                  disabled={userRole !== 'ADMIN'}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Vermelho Direto (Jogos)</label>
                <input
                  type="number"
                  value={rules.directRedCardSuspensionGames}
                  onChange={(e) => setRules({ ...rules, directRedCardSuspensionGames: Number(e.target.value) })}
                  disabled={userRole !== 'ADMIN'}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Valor Inscrição (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={rules.registrationFeeAmount}
                  onChange={(e) => setRules({ ...rules, registrationFeeAmount: Number(e.target.value) })}
                  disabled={userRole !== 'ADMIN'}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tiebreaker Criteria & Preview */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-emerald-500" />
              Critérios de Desempate
            </h3>
            <p className="text-xs text-slate-500">
              A ordem abaixo determina como a classificação é calculada em caso de igualdade de pontos.
            </p>

            <div className="space-y-2">
              {(rules?.tiebreakers || DEFAULT_RULES.tiebreakers).map((crit, idx) => (
                <div
                  key={crit}
                  className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-[10px]">
                      {idx + 1}
                    </span>
                    {tiebreakerLabels[crit]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
