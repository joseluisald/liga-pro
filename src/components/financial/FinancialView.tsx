import React, { useState } from 'react';
import {
  DollarSign,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  TrendingUp,
  CreditCard,
  QrCode
} from 'lucide-react';
import { Player, Team, FinancialStatus } from '../../types';

interface FinancialViewProps {
  players: Player[];
  teams: Team[];
  onUpdatePayment: (playerId: string, status: FinancialStatus, amount: number, method?: any) => void;
  userRole: 'ADMIN' | 'OPERATOR' | 'VIEWER';
}

export const FinancialView: React.FC<FinancialViewProps> = ({
  players = [],
  teams = [],
  onUpdatePayment,
  userRole = 'ADMIN',
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const registrationFee = 85.0; // Default R$ 85 per player
  const paidPlayers = (players || []).filter((p) => p && p.paymentStatus === 'PAID');
  const unpaidPlayers = (players || []).filter((p) => p && p.paymentStatus === 'UNPAID');
  const partialPlayers = (players || []).filter((p) => p && p.paymentStatus === 'PARTIAL');

  const totalCollected = (players || []).reduce((sum, p) => sum + (p?.amountPaid || 0), 0);
  const totalExpected = (players || []).length * registrationFee;
  const totalPending = totalExpected - totalCollected;

  const filteredPlayers = (players || []).filter((p) => {
    if (!p) return false;
    if (filterStatus === 'ALL') return true;
    return p.paymentStatus === filterStatus;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-500" />
            Controle Financeiro de Inscrições
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestão do pagamento de inscrições de atletas e prestação de contas do campeonato
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Arrecadado</span>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            R$ {totalCollected.toFixed(2)}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">{paidPlayers.length} inscrições quitadas</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Pendente</span>
          <p className="text-3xl font-black text-rose-500 mt-1">R$ {totalPending.toFixed(2)}</p>
          <p className="text-[10px] text-slate-500 mt-1">{unpaidPlayers.length} atletas inadimplentes</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Taxa de Adimplência</span>
          <p className="text-3xl font-black text-sky-500 mt-1">
            {((paidPlayers.length / (players.length || 1)) * 100).toFixed(0)}%
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Meta: 100% até o início da Rodada 2</p>
        </div>
      </div>

      {/* Financial Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Lista de Pagamentos por Atleta</h3>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
          >
            <option value="ALL">Todos os Status</option>
            <option value="PAID">Pagos</option>
            <option value="UNPAID">Pendentes</option>
            <option value="PARTIAL">Parcial</option>
            <option value="EXEMPT">Isentos</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-[10px] font-extrabold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <th className="p-3.5">Atleta</th>
                <th className="p-3.5">Equipe</th>
                <th className="p-3.5">Valor Pago</th>
                <th className="p-3.5">Forma</th>
                <th className="p-3.5">Status</th>
                {userRole === 'ADMIN' && <th className="p-3.5 text-right">Confirmar Pgto</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold">
              {filteredPlayers.map((p) => {
                const team = teams.find((t) => t.id === p.teamId);

                return (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">{p.fullName}</td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-400">{team?.name || 'Sem Time'}</td>
                    <td className="p-3.5 font-mono">R$ {(p.amountPaid || 0).toFixed(2)}</td>
                    <td className="p-3.5 uppercase text-[10px] font-bold text-slate-500">{p.paymentMethod || '-'}</td>
                    <td className="p-3.5">
                      {p.paymentStatus === 'PAID' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          Quitado
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                          Pendente
                        </span>
                      )}
                    </td>

                    {userRole === 'ADMIN' && (
                      <td className="p-3.5 text-right space-x-2">
                        {p.paymentStatus !== 'PAID' && (
                          <button
                            onClick={() => onUpdatePayment(p.id, 'PAID', 85.0, 'PIX')}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[10px] shadow"
                          >
                            Dar Baixa PIX (R$ 85,00)
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
