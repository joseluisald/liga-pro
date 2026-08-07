import {
  Championship,
  Team,
  Player,
  Phase,
  Group,
  Match,
  MatchEvent,
  StandingRow,
  Suspension,
  AuditLog,
  NotificationItem,
  User,
  UserRole
} from '../types';

const API_BASE = '/api';

export async function registerUser(data: { name: string; email: string; password?: string; role?: UserRole; avatarUrl?: string }): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Erro ao cadastrar usuário');
  }
  return res.json();
}

export async function loginUser(data: { email: string; password?: string }): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Erro ao realizar login');
  }
  return res.json();
}

export async function fetchChampionships(): Promise<Championship[]> {
  try {
    const res = await fetch(`${API_BASE}/championships`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function fetchChampionship(id: string): Promise<Championship> {
  const res = await fetch(`${API_BASE}/championships/${id}`);
  return res.json();
}

export async function createChampionship(data: Partial<Championship>): Promise<Championship> {
  const res = await fetch(`${API_BASE}/championships`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateChampionship(id: string, data: Partial<Championship>): Promise<Championship> {
  const res = await fetch(`${API_BASE}/championships/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function fetchTeams(champId: string): Promise<Team[]> {
  try {
    const res = await fetch(`${API_BASE}/championships/${champId}/teams`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function createTeam(team: Partial<Team>): Promise<Team> {
  const res = await fetch(`${API_BASE}/teams`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(team),
  });
  return res.json();
}

export async function updateTeam(id: string, team: Partial<Team>): Promise<Team> {
  const res = await fetch(`${API_BASE}/teams/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(team),
  });
  return res.json();
}

export async function deleteTeam(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/teams/${id}`, { method: 'DELETE' });
  return res.ok;
}

export async function fetchPlayers(champId: string): Promise<Player[]> {
  try {
    const res = await fetch(`${API_BASE}/championships/${champId}/players`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function createPlayer(player: Partial<Player>): Promise<Player> {
  const res = await fetch(`${API_BASE}/players`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(player),
  });
  return res.json();
}

export async function updatePlayer(id: string, player: Partial<Player>): Promise<Player> {
  const res = await fetch(`${API_BASE}/players/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(player),
  });
  return res.json();
}

export async function deletePlayer(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/players/${id}`, { method: 'DELETE' });
  return res.ok;
}

export async function runDraftApi(data: {
  championshipId: string;
  teamIds: string[];
  playerIds: string[];
  mode: 'RANDOM' | 'BALANCED_POSITION' | 'BALANCED_SKILL' | 'GOALKEEPER_FIRST';
}) {
  try {
    const res = await fetch(`${API_BASE}/draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) return { success: false, players: [] };
    const json = await res.json();
    return {
      success: json.success ?? true,
      players: Array.isArray(json.players) ? json.players : []
    };
  } catch {
    return { success: false, players: [] };
  }
}

export async function fetchMatches(champId: string): Promise<Match[]> {
  try {
    const res = await fetch(`${API_BASE}/championships/${champId}/matches`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function fetchMatch(id: string): Promise<Match> {
  const res = await fetch(`${API_BASE}/matches/${id}`);
  return res.json();
}

export async function createMatch(match: Partial<Match>): Promise<Match> {
  const res = await fetch(`${API_BASE}/matches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(match),
  });
  return res.json();
}

export async function generateFixtures(champId: string, options: {
  format?: 'ROUND_ROBIN' | 'DOUBLE_ROUND_ROBIN' | 'KNOCKOUT';
  startDate?: string;
  time?: string;
  location?: string;
  daysBetweenRounds?: number;
  clearExisting?: boolean;
}): Promise<{ success: boolean; matches: Match[] }> {
  const res = await fetch(`${API_BASE}/championships/${champId}/generate-fixtures`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Erro ao gerar confrontos');
  }
  return res.json();
}

export async function updateMatch(id: string, match: Partial<Match>): Promise<Match> {
  const res = await fetch(`${API_BASE}/matches/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(match),
  });
  return res.json();
}

export async function fetchMatchEvents(matchId: string): Promise<MatchEvent[]> {
  try {
    const res = await fetch(`${API_BASE}/matches/${matchId}/events`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function createMatchEvent(event: Partial<MatchEvent>): Promise<MatchEvent> {
  const matchId = event.matchId || '';
  const res = await fetch(`${API_BASE}/matches/${matchId}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  });
  return res.json();
}

export async function deleteMatchEvent(eventId: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/events/${eventId}`, { method: 'DELETE' });
  return res.ok;
}

export async function fetchStandings(champId: string, groupId?: string): Promise<StandingRow[]> {
  try {
    const url = groupId
      ? `${API_BASE}/championships/${champId}/standings?groupId=${groupId}`
      : `${API_BASE}/championships/${champId}/standings`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function fetchSuspensions(champId: string): Promise<Suspension[]> {
  try {
    const res = await fetch(`${API_BASE}/championships/${champId}/suspensions`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function fetchAuditLogs(champId: string): Promise<AuditLog[]> {
  try {
    const res = await fetch(`${API_BASE}/championships/${champId}/audit`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function fetchNotifications(): Promise<NotificationItem[]> {
  try {
    const res = await fetch(`${API_BASE}/notifications`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export const api = {
  getChampionshipData: async (id: string) => {
    try {
      const championship = await fetchChampionship(id);
      const teams = await fetchTeams(id);
      const players = await fetchPlayers(id);
      const matches = await fetchMatches(id);
      const standings = await fetchStandings(id);
      const suspensions = await fetchSuspensions(id);

      const safeTeams = Array.isArray(teams) ? teams : [];
      const safePlayers = Array.isArray(players) ? players : [];
      const safeMatches = Array.isArray(matches) ? matches : [];
      const safeStandings = Array.isArray(standings) ? standings : [];
      const safeSuspensions = Array.isArray(suspensions) ? suspensions : [];

      return {
        championship,
        teams: safeTeams,
        players: safePlayers,
        phases: [
          { id: 'p1', championshipId: id, name: 'Fase de Grupos', type: 'GROUPS' as const, order: 1, completed: false, qualifiedPerGroup: 2 }
        ],
        groups: [
          { id: 'g1', phaseId: 'p1', name: 'Grupo Único', teamIds: safeTeams.map((t) => t.id) }
        ],
        matches: safeMatches,
        standings: safeStandings,
        suspensions: safeSuspensions,
        events: []
      };
    } catch (err) {
      console.error('Failed to load championship data:', err);
      return {
        championship: {
          id: id,
          name: 'Campeonato',
          season: new Date().getFullYear().toString(),
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          city: '',
          state: '',
          status: 'PLANNING',
          maxTeams: 16,
          maxPlayersPerTeam: 20,
        },
        teams: [],
        players: [],
        phases: [],
        groups: [],
        matches: [],
        standings: [],
        suspensions: [],
        events: []
      };
    }
  },
  updateChampionship,
  createChampionship,
  fetchChampionships,
  registerUser,
  loginUser,
  createPlayer,
  updatePlayer,
  deletePlayer,
  createTeam,
  updateTeam,
  deleteTeam,
  executeDraft: runDraftApi,
  createMatch,
  generateFixtures,
  updateMatch,
  addMatchEvent: createMatchEvent,
  deleteMatchEvent,
};

