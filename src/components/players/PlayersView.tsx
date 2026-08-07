import React, { useState, useRef } from 'react';
import {
  Users,
  Search,
  Plus,
  Filter,
  DollarSign,
  UserCheck,
  AlertCircle,
  Eye,
  Trash2,
  Edit2,
  CheckCircle,
  Award,
  QrCode,
  X,
  Camera,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { Player, PlayerPosition, FinancialStatus, Team } from '../../types';
import { generateQrDataUrl } from '../../utils/qrGenerator';

interface PlayersViewProps {
  players: Player[];
  teams: Team[];
  onCreatePlayer: (p: Partial<Player>) => void;
  onUpdatePlayer: (id: string, p: Partial<Player>) => void;
  onDeletePlayer: (id: string) => void;
  userRole: 'ADMIN' | 'OPERATOR' | 'VIEWER';
}

export const PlayersView: React.FC<PlayersViewProps> = ({
  players = [],
  teams = [],
  onCreatePlayer,
  onUpdatePlayer,
  onDeletePlayer,
  userRole = 'ADMIN',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<string>('ALL');
  const [selectedPayment, setSelectedPayment] = useState<string>('ALL');
  const [selectedTeam, setSelectedTeam] = useState<string>('ALL');

  const [selectedPlayerForDetail, setSelectedPlayerForDetail] = useState<Player | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Partial<Player> | null>(null);
  const [qrModalUrl, setQrModalUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingPlayer) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingPlayer({
          ...editingPlayer,
          photoUrl: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const positionLabels: Record<PlayerPosition, string> = {
    GOALKEEPER: 'Goleiro',
    DEFENDER: 'Zagueiro',
    RIGHT_BACK: 'Lateral Dir.',
    LEFT_BACK: 'Lateral Esq.',
    DEF_MIDFIELDER: 'Volante',
    MIDFIELDER: 'Meio-Campo',
    ATT_MIDFIELDER: 'Meia-Atacante',
    WING: 'Ponta',
    FORWARD: 'Atacante',
  };

  const filteredPlayers = (players || []).filter((p) => {
    const matchesSearch =
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.nickname && p.nickname.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesPos = selectedPosition === 'ALL' || p.position === selectedPosition;
    const matchesPay = selectedPayment === 'ALL' || p.paymentStatus === selectedPayment;
    const matchesTeam =
      selectedTeam === 'ALL'
        ? true
        : selectedTeam === 'UNASSIGNED'
        ? !p.teamId
        : p.teamId === selectedTeam;

    return matchesSearch && matchesPos && matchesPay && matchesTeam;
  });

  const handleOpenAddModal = () => {
    setEditingPlayer({
      fullName: '',
      displayName: '',
      position: 'MIDFIELDER',
      shirtNumber: 10,
      paymentStatus: 'UNPAID',
      amountPaid: 0,
      skillLevel: 3,
      status: 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Player) => {
    setEditingPlayer({ ...p });
    setIsModalOpen(true);
  };

  const handleSavePlayer = () => {
    if (!editingPlayer || !editingPlayer.fullName) return;

    const nameForAvatar = editingPlayer.displayName || editingPlayer.fullName || 'Jogador';
    const defaultAvatarUrl = `https://avatarapi.runflare.run/public?usearname=${encodeURIComponent(nameForAvatar)}`;

    const playerToSave = {
      ...editingPlayer,
      photoUrl: editingPlayer.photoUrl || defaultAvatarUrl,
    };

    if (editingPlayer.id) {
      onUpdatePlayer(editingPlayer.id, playerToSave);
    } else {
      onCreatePlayer(playerToSave);
    }

    setIsModalOpen(false);
    setEditingPlayer(null);
  };

  const handleShowQrCode = async (player: Player) => {
    const url = await generateQrDataUrl(`https://futgestao.app/player/${player.id}`);
    setQrModalUrl(url);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-500" />
            Gestão de Jogadores
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Total de {(players || []).length} atletas cadastrados ({(players || []).filter((p) => p.paymentStatus === 'PAID').length} pagos)
          </p>
        </div>

        {userRole === 'ADMIN' && (
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Novo Jogador
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar nome ou apelido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Position Filter */}
          <select
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
          >
            <option value="ALL">Todas Posições</option>
            {Object.entries(positionLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          {/* Payment Filter */}
          <select
            value={selectedPayment}
            onChange={(e) => setSelectedPayment(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
          >
            <option value="ALL">Todos Pagamentos</option>
            <option value="PAID">Pago</option>
            <option value="UNPAID">Pendente / Não Pago</option>
            <option value="PARTIAL">Parcial</option>
            <option value="EXEMPT">Isento</option>
          </select>

          {/* Team Filter */}
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
          >
            <option value="ALL">Todas as Equipes</option>
            <option value="UNASSIGNED">Sem Time (Agente Livre)</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Players Table Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase font-bold text-slate-500">
                <th className="p-3.5">Atleta</th>
                <th className="p-3.5">Posição</th>
                <th className="p-3.5">Time Atual</th>
                <th className="p-3.5">Status Pgto.</th>
                <th className="p-3.5 text-center">Estatísticas</th>
                <th className="p-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredPlayers.map((p) => {
                const team = teams.find((t) => t.id === p.teamId);

                return (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.photoUrl}
                          alt={p.displayName}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">
                            {p.fullName}{' '}
                            {p.shirtNumber && (
                              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 font-mono">
                                #{p.shirtNumber}
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-slate-500">{p.nickname ? `"${p.nickname}"` : p.displayName}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md font-semibold text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {positionLabels[p.position]}
                      </span>
                    </td>

                    <td className="p-3.5 font-bold">
                      {team ? (
                        <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: team.primaryColor }} />
                          {team.name}
                        </span>
                      ) : (
                        <span className="text-amber-500 font-semibold italic">Sem Time (Livre)</span>
                      )}
                    </td>

                    <td className="p-3.5">
                      {p.paymentStatus === 'PAID' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          Pago (R$ {p.amountPaid.toFixed(2)})
                        </span>
                      )}
                      {p.paymentStatus === 'UNPAID' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                          Pendente
                        </span>
                      )}
                      {p.paymentStatus === 'PARTIAL' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          Parcial (R$ {p.amountPaid.toFixed(2)})
                        </span>
                      )}
                      {p.paymentStatus === 'EXEMPT' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/30">
                          Isento
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-2 font-mono font-bold text-[11px]">
                        <span className="text-emerald-600" title="Gols">{p.stats.goals} G</span>
                        <span className="text-slate-400">|</span>
                        <span className="text-amber-500" title="Cartões Amarelos">{p.stats.yellowCards} CA</span>
                        <span className="text-slate-400">|</span>
                        <span className="text-sky-500" title="MVPs">{p.stats.mvpCount} MVP</span>
                      </div>
                    </td>

                    <td className="p-3.5 text-right space-x-1">
                      <button
                        onClick={() => setSelectedPlayerForDetail(p)}
                        title="Ver Perfil Detalhado"
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleShowQrCode(p)}
                        title="QR Code de Inscrição"
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300"
                      >
                        <QrCode className="w-4 h-4 text-sky-500" />
                      </button>
                      {userRole === 'ADMIN' && (
                        <>
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            title="Editar"
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300"
                          >
                            <Edit2 className="w-4 h-4 text-emerald-500" />
                          </button>
                          <button
                            onClick={() => onDeletePlayer(p.id)}
                            title="Excluir"
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300"
                          >
                            <Trash2 className="w-4 h-4 text-rose-500" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Player Modal */}
      {isModalOpen && editingPlayer && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                {editingPlayer.id ? 'Editar Cadastro do Atleta' : 'Novo Atleta'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mt-4">
              {/* Photo / Avatar Editor */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Foto / Avatar do Jogador</span>
                  <span className="text-[10px] text-slate-400 font-normal">Upload ou URL</span>
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-700 border-2 border-emerald-500 overflow-hidden flex items-center justify-center shrink-0 shadow-inner group">
                    {editingPlayer.photoUrl || editingPlayer.fullName || editingPlayer.displayName ? (
                      <img
                        src={
                          editingPlayer.photoUrl ||
                          `https://avatarapi.runflare.run/public?usearname=${encodeURIComponent(
                            editingPlayer.displayName || editingPlayer.fullName || 'Jogador'
                          )}`
                        }
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Users className="w-6 h-6 text-slate-400" />
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-slate-950/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                      title="Alterar Imagem"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      placeholder="Cole a URL da imagem (https://...)"
                      value={editingPlayer.photoUrl || ''}
                      onChange={(e) => setEditingPlayer({ ...editingPlayer, photoUrl: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-emerald-500" />
                        Escolher Arquivo
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nome Completo</label>
                <input
                  type="text"
                  value={editingPlayer.fullName || ''}
                  onChange={(e) => setEditingPlayer({ ...editingPlayer, fullName: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nome de Exibição</label>
                  <input
                    type="text"
                    value={editingPlayer.displayName || ''}
                    onChange={(e) => setEditingPlayer({ ...editingPlayer, displayName: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Apelido</label>
                  <input
                    type="text"
                    value={editingPlayer.nickname || ''}
                    onChange={(e) => setEditingPlayer({ ...editingPlayer, nickname: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Posição</label>
                  <select
                    value={editingPlayer.position || 'MIDFIELDER'}
                    onChange={(e) => setEditingPlayer({ ...editingPlayer, position: e.target.value as any })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  >
                    {Object.entries(positionLabels).map(([k, label]) => (
                      <option key={k} value={k}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nº Camisa</label>
                  <input
                    type="number"
                    value={editingPlayer.shirtNumber || 10}
                    onChange={(e) => setEditingPlayer({ ...editingPlayer, shirtNumber: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Time V vinculado</label>
                  <select
                    value={editingPlayer.teamId || ''}
                    onChange={(e) => setEditingPlayer({ ...editingPlayer, teamId: e.target.value || null })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  >
                    <option value="">Sem Time (Agente Livre)</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Status Pgto Inscrição</label>
                  <select
                    value={editingPlayer.paymentStatus || 'UNPAID'}
                    onChange={(e) =>
                      setEditingPlayer({
                        ...editingPlayer,
                        paymentStatus: e.target.value as any,
                        amountPaid: e.target.value === 'PAID' ? 85.0 : editingPlayer.amountPaid,
                      })
                    }
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  >
                    <option value="PAID">Pago</option>
                    <option value="UNPAID">Pendente</option>
                    <option value="PARTIAL">Parcial</option>
                    <option value="EXEMPT">Isento</option>
                  </select>
                </div>
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
                onClick={handleSavePlayer}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md"
              >
                Salvar Atleta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {qrModalUrl && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 text-center space-y-4">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">QR Code do Atleta</h3>
            <img src={qrModalUrl} alt="QR Code" className="mx-auto w-48 h-48 rounded-xl border p-2 bg-white" />
            <button
              onClick={() => setQrModalUrl(null)}
              className="w-full py-2 bg-slate-800 text-white font-bold rounded-xl text-xs"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Player Detail Drawer Modal */}
      {selectedPlayerForDetail && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setSelectedPlayerForDetail(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <img
                src={selectedPlayerForDetail.photoUrl}
                alt={selectedPlayerForDetail.fullName}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
              />
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  {selectedPlayerForDetail.fullName}
                </h3>
                <p className="text-xs text-slate-500">{positionLabels[selectedPlayerForDetail.position]}</p>
                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase mt-1">
                  Nº Camisa: #{selectedPlayerForDetail.shirtNumber || '-'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 dark:border-slate-800 text-center font-mono">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                <p className="text-lg font-black text-emerald-600">{selectedPlayerForDetail.stats.goals}</p>
                <p className="text-[10px] text-slate-400 uppercase font-sans">Gols</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                <p className="text-lg font-black text-amber-500">{selectedPlayerForDetail.stats.yellowCards}</p>
                <p className="text-[10px] text-slate-400 uppercase font-sans">Amarelos</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                <p className="text-lg font-black text-sky-500">{selectedPlayerForDetail.stats.mvpCount}</p>
                <p className="text-[10px] text-slate-400 uppercase font-sans">MVPs</p>
              </div>
            </div>

            <div className="text-xs space-y-1 text-slate-600 dark:text-slate-400">
              <p><strong>Nascimento:</strong> {selectedPlayerForDetail.birthDate}</p>
              <p><strong>Status de Pagamento:</strong> {selectedPlayerForDetail.paymentStatus}</p>
              <p><strong>Valor Pago:</strong> R$ {selectedPlayerForDetail.amountPaid.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
