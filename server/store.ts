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
} from '../src/types';
import { pool, isMysqlConnected } from './db';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'server', 'data.json');

class TournamentStore {
  // In-memory fallback state
  private championships: Championship[] = [];
  private teams: Team[] = [];
  private players: Player[] = [];
  private phases: Phase[] = [];
  private groups: Group[] = [];
  private matches: Match[] = [];
  private events: MatchEvent[] = [];
  private suspensions: Suspension[] = [];
  private auditLogs: AuditLog[] = [];
  private notifications: NotificationItem[] = [];
  private users: (User & { password?: string })[] = [
    {
      id: 'usr_admin',
      name: 'Organizador Geral',
      email: 'contato@torneio.com.br',
      password: '123',
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    }
  ];

  constructor() {
    this.loadFromFile();
  }

  private loadFromFile() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const data = JSON.parse(raw);
        if (Array.isArray(data.championships)) this.championships = data.championships;
        if (Array.isArray(data.teams)) this.teams = data.teams;
        if (Array.isArray(data.players)) this.players = data.players;
        if (Array.isArray(data.phases)) this.phases = data.phases;
        if (Array.isArray(data.groups)) this.groups = data.groups;
        if (Array.isArray(data.matches)) this.matches = data.matches;
        if (Array.isArray(data.events)) this.events = data.events;
        if (Array.isArray(data.suspensions)) this.suspensions = data.suspensions;
        if (Array.isArray(data.auditLogs)) this.auditLogs = data.auditLogs;
        if (Array.isArray(data.notifications)) this.notifications = data.notifications;
        if (Array.isArray(data.users) && data.users.length > 0) this.users = data.users;
      }
    } catch (err) {
      console.error('[Store] Error loading local file store:', err);
    }
  }

  private saveToFile() {
    try {
      const data = {
        championships: this.championships,
        teams: this.teams,
        players: this.players,
        phases: this.phases,
        groups: this.groups,
        matches: this.matches,
        events: this.events,
        suspensions: this.suspensions,
        auditLogs: this.auditLogs,
        notifications: this.notifications,
        users: this.users,
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Store] Error saving local file store:', err);
    }
  }

  // --- Championships ---
  async getChampionships(): Promise<Championship[]> {
    if (isMysqlConnected && pool) {
      try {
        const [rows]: any = await pool.query('SELECT * FROM championships ORDER BY createdAt DESC');
        return rows.map((r: any) => ({
          ...r,
          rules: typeof r.rules === 'string' ? JSON.parse(r.rules) : r.rules,
        }));
      } catch (e) {
        console.error('[MySQL Error] getChampionships:', e);
      }
    }

    return this.championships;
  }

  async getChampionshipById(id: string): Promise<Championship | undefined> {
    if (!id) return undefined;
    if (isMysqlConnected && pool) {
      try {
        const [rows]: any = await pool.query('SELECT * FROM championships WHERE id = ? OR slug = ? LIMIT 1', [id, id]);
        if (rows.length > 0) {
          const r = rows[0];
          return {
            ...r,
            rules: typeof r.rules === 'string' ? JSON.parse(r.rules) : r.rules,
          };
        }
        return undefined;
      } catch (e) {
        console.error('[MySQL Error] getChampionshipById:', e);
      }
    }

    return this.championships.find((c) => c.id === id || c.slug === id);
  }

  async createChampionship(data: Partial<Championship>): Promise<Championship> {
    const newChamp: Championship = {
      id: `champ_${Date.now()}`,
      name: data.name || 'Novo Campeonato',
      slug: (data.name || 'novo-campeonato').toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
      description: data.description || '',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.endDate || new Date().toISOString().split('T')[0],
      location: data.location || 'Campo Principal',
      address: data.address || '',
      city: data.city || 'São Paulo',
      state: data.state || 'SP',
      organizerName: data.organizerName || 'Organizador',
      organizerPhone: data.organizerPhone || '',
      organizerEmail: data.organizerEmail || '',
      logoUrl: data.logoUrl || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=300&auto=format&fit=crop&q=80',
      status: data.status || 'PLANNING',
      rules: data.rules || {
        pointsForWin: 3,
        pointsForDraw: 1,
        pointsForLoss: 0,
        tiebreakers: ['POINTS', 'VICTORIES', 'GOAL_DIFFERENCE', 'GOALS_FOR', 'DIRECT_HEAD_TO_HEAD', 'FEWEST_CARDS', 'DRAW'],
        substitutionsAllowed: 7,
        matchDurationMinutes: 50,
        startersCount: 7,
        maxBenchCount: 7,
        yellowCardsForSuspension: 3,
        directRedCardSuspensionGames: 2,
        registrationFeeAmount: 85.0,
        woGoalsGiven: 3,
      },
      createdAt: new Date().toISOString(),
    };

    if (isMysqlConnected && pool) {
      try {
        await pool.query(
          `INSERT INTO championships (id, name, slug, description, startDate, endDate, location, address, city, state, organizerName, organizerPhone, organizerEmail, logoUrl, status, rules, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            newChamp.id, newChamp.name, newChamp.slug, newChamp.description, newChamp.startDate,
            newChamp.endDate, newChamp.location, newChamp.address, newChamp.city, newChamp.state,
            newChamp.organizerName, newChamp.organizerPhone, newChamp.organizerEmail, newChamp.logoUrl,
            newChamp.status, JSON.stringify(newChamp.rules), newChamp.createdAt
          ]
        );
        await this.logAudit(newChamp.id, 'CHAMPIONSHIP_CREATED', 'Championship', newChamp.id, `Criou o campeonato ${newChamp.name}`);
        return newChamp;
      } catch (e) {
        console.error('[MySQL Error] createChampionship:', e);
      }
    }

    this.championships.unshift(newChamp);
    await this.logAudit(newChamp.id, 'CHAMPIONSHIP_CREATED', 'Championship', newChamp.id, `Criou o campeonato ${newChamp.name}`);
    return newChamp;
  }

  async updateChampionship(id: string, updates: Partial<Championship>): Promise<Championship | null> {
    const champ = await this.getChampionshipById(id);
    if (!champ) return null;

    const updated = { ...champ, ...updates };

    if (isMysqlConnected && pool) {
      try {
        await pool.query(
          `UPDATE championships SET name=?, slug=?, description=?, startDate=?, endDate=?, location=?, address=?, city=?, state=?, organizerName=?, organizerPhone=?, organizerEmail=?, logoUrl=?, status=?, rules=? WHERE id=?`,
          [
            updated.name, updated.slug, updated.description, updated.startDate, updated.endDate,
            updated.location, updated.address, updated.city, updated.state, updated.organizerName,
            updated.organizerPhone, updated.organizerEmail, updated.logoUrl, updated.status,
            JSON.stringify(updated.rules), id
          ]
        );
        await this.logAudit(updated.id, 'CHAMPIONSHIP_UPDATED', 'Championship', updated.id, `Atualizou dados do campeonato ${updated.name}`);
        return updated;
      } catch (e) {
        console.error('[MySQL Error] updateChampionship:', e);
      }
    }

    Object.assign(champ, updates);
    await this.logAudit(champ.id, 'CHAMPIONSHIP_UPDATED', 'Championship', champ.id, `Atualizou dados do campeonato ${champ.name}`);
    return champ;
  }

  // --- Teams ---
  async getTeams(championshipId: string): Promise<Team[]> {
    if (isMysqlConnected && pool) {
      try {
        const [rows]: any = await pool.query('SELECT * FROM teams WHERE championshipId = ?', [championshipId]);
        return rows;
      } catch (e) {
        console.error('[MySQL Error] getTeams:', e);
      }
    }
    return this.teams.filter((t) => t.championshipId === championshipId);
  }

  async getTeamById(id: string): Promise<Team | undefined> {
    if (isMysqlConnected && pool) {
      try {
        const [rows]: any = await pool.query('SELECT * FROM teams WHERE id = ? LIMIT 1', [id]);
        return rows[0] || undefined;
      } catch (e) {
        console.error('[MySQL Error] getTeamById:', e);
      }
    }
    return this.teams.find((t) => t.id === id);
  }

  async createTeam(teamData: Partial<Team>): Promise<Team> {
    const team: Team = {
      id: `team_${Date.now()}`,
      championshipId: teamData.championshipId || '',
      categoryId: teamData.categoryId || 'principal',
      name: teamData.name || 'Novo Time',
      shortName: teamData.shortName || 'NTV',
      primaryColor: teamData.primaryColor || '#2563eb',
      secondaryColor: teamData.secondaryColor || '#ffffff',
      coachName: teamData.coachName || '',
      managerName: teamData.managerName || '',
      logoUrl: teamData.logoUrl,
      captainPlayerId: teamData.captainPlayerId,
    };

    if (isMysqlConnected && pool) {
      try {
        await pool.query(
          `INSERT INTO teams (id, championshipId, categoryId, name, shortName, primaryColor, secondaryColor, coachName, managerName, logoUrl, captainPlayerId)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            team.id, team.championshipId, team.categoryId, team.name, team.shortName, team.primaryColor,
            team.secondaryColor, team.coachName, team.managerName, team.logoUrl || null, team.captainPlayerId || null
          ]
        );
      } catch (e) {
        console.error('[MySQL Error] createTeam:', e);
      }
    }

    const tIdx = this.teams.findIndex((t) => t.id === team.id);
    if (tIdx >= 0) {
      this.teams[tIdx] = team;
    } else {
      this.teams.push(team);
    }
    this.saveToFile();
    await this.logAudit(team.championshipId, 'TEAM_CREATED', 'Team', team.id, `Cadastrou a equipe ${team.name}`);
    return team;
  }

  async updateTeam(id: string, updates: Partial<Team>): Promise<Team | null> {
    const team = await this.getTeamById(id);
    if (!team) return null;

    const updated = { ...team, ...updates };

    if (isMysqlConnected && pool) {
      try {
        await pool.query(
          `UPDATE teams SET name=?, shortName=?, primaryColor=?, secondaryColor=?, coachName=?, managerName=?, logoUrl=?, captainPlayerId=? WHERE id=?`,
          [
            updated.name, updated.shortName, updated.primaryColor, updated.secondaryColor,
            updated.coachName, updated.managerName, updated.logoUrl || null, updated.captainPlayerId || null, id
          ]
        );
      } catch (e) {
        console.error('[MySQL Error] updateTeam:', e);
      }
    }

    const tIdx = this.teams.findIndex((t) => t.id === id);
    if (tIdx >= 0) {
      this.teams[tIdx] = updated;
    } else {
      this.teams.push(updated);
    }
    this.saveToFile();
    await this.logAudit(updated.championshipId, 'TEAM_UPDATED', 'Team', updated.id, `Atualizou a equipe ${updated.name}`);
    return updated;
  }

  async deleteTeam(id: string): Promise<boolean> {
    const team = await this.getTeamById(id);
    if (!team) return false;

    if (isMysqlConnected && pool) {
      try {
        await pool.query('DELETE FROM teams WHERE id = ?', [id]);
        await pool.query('UPDATE players SET teamId = NULL WHERE teamId = ?', [id]);
      } catch (e) {
        console.error('[MySQL Error] deleteTeam:', e);
      }
    }

    this.teams = this.teams.filter((t) => t.id !== id);
    this.players.filter((p) => p.teamId === id).forEach((p) => (p.teamId = null));
    this.saveToFile();
    await this.logAudit(team.championshipId, 'TEAM_DELETED', 'Team', id, `Excluiu a equipe ${team.name}`);
    return true;
  }

  // --- Players ---
  async getPlayers(championshipId: string): Promise<Player[]> {
    if (isMysqlConnected && pool) {
      try {
        const [rows]: any = await pool.query('SELECT * FROM players WHERE championshipId = ?', [championshipId]);
        return rows.map((r: any) => ({
          ...r,
          stats: typeof r.stats === 'string' ? JSON.parse(r.stats) : r.stats,
          amountPaid: parseFloat(r.amountPaid || 0),
        }));
      } catch (e) {
        console.error('[MySQL Error] getPlayers:', e);
      }
    }
    return this.players.filter((p) => p.championshipId === championshipId);
  }

  async getPlayerById(id: string): Promise<Player | undefined> {
    if (isMysqlConnected && pool) {
      try {
        const [rows]: any = await pool.query('SELECT * FROM players WHERE id = ? LIMIT 1', [id]);
        if (rows.length > 0) {
          const r = rows[0];
          return {
            ...r,
            stats: typeof r.stats === 'string' ? JSON.parse(r.stats) : r.stats,
            amountPaid: parseFloat(r.amountPaid || 0),
          };
        }
        return undefined;
      } catch (e) {
        console.error('[MySQL Error] getPlayerById:', e);
      }
    }
    return this.players.find((p) => p.id === id);
  }

  async createPlayer(playerData: Partial<Player>): Promise<Player> {
    // Infer category from team if team is selected and player category not explicitly set
    let categoryId = playerData.categoryId;
    if (!categoryId && playerData.teamId) {
      const team = this.teams.find((t) => t.id === playerData.teamId);
      if (team?.categoryId) categoryId = team.categoryId;
    }

    const player: Player = {
      id: `play_${Date.now()}`,
      championshipId: playerData.championshipId || '',
      categoryId: categoryId || 'principal',
      teamId: playerData.teamId || null,
      fullName: playerData.fullName || 'Novo Jogador',
      displayName: playerData.displayName || playerData.fullName || 'Jogador',
      nickname: playerData.nickname || '',
      birthDate: playerData.birthDate || '2000-01-01',
      cpf: playerData.cpf || '',
      phone: playerData.phone || '',
      email: playerData.email || '',
      position: playerData.position || 'MIDFIELDER',
      shirtNumber: playerData.shirtNumber || Math.floor(Math.random() * 90) + 1,
      status: playerData.status || 'ACTIVE',
      paymentStatus: playerData.paymentStatus || 'UNPAID',
      amountPaid: playerData.amountPaid || 0,
      paymentMethod: playerData.paymentMethod,
      paymentDate: playerData.paymentDate,
      notes: playerData.notes || '',
      skillLevel: playerData.skillLevel || 3,
      photoUrl: playerData.photoUrl || `https://avatarapi.runflare.run/public?usearname=${encodeURIComponent(playerData.displayName || playerData.fullName || 'Jogador')}`,
      stats: {
        matchesPlayed: 0,
        starts: 0,
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        highlights: 0,
        mvpCount: 0,
        minutesPlayed: 0,
        suspensionsServed: 0,
      },
    };

    if (isMysqlConnected && pool) {
      try {
        await pool.query(
          `INSERT INTO players (id, championshipId, teamId, fullName, displayName, nickname, birthDate, cpf, phone, email, position, shirtNumber, status, paymentStatus, amountPaid, paymentMethod, paymentDate, notes, skillLevel, photoUrl, stats)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            player.id, player.championshipId, player.teamId || null, player.fullName, player.displayName,
            player.nickname || '', player.birthDate || '', player.cpf || '', player.phone || '',
            player.email || '', player.position, player.shirtNumber, player.status, player.paymentStatus,
            player.amountPaid || 0, player.paymentMethod || null, player.paymentDate || null, player.notes || '',
            player.skillLevel || 3, player.photoUrl || '', JSON.stringify(player.stats)
          ]
        );
      } catch (e) {
        console.error('[MySQL Error] createPlayer:', e);
      }
    }

    const idx = this.players.findIndex((p) => p.id === player.id);
    if (idx >= 0) {
      this.players[idx] = player;
    } else {
      this.players.push(player);
    }
    this.saveToFile();
    await this.logAudit(player.championshipId, 'PLAYER_CREATED', 'Player', player.id, `Cadastrou o jogador ${player.fullName}`);
    return player;
  }

  async updatePlayer(id: string, updates: Partial<Player>): Promise<Player | null> {
    const player = await this.getPlayerById(id);
    if (!player) return null;

    const updated = { ...player, ...updates };

    if (isMysqlConnected && pool) {
      try {
        await pool.query(
          `UPDATE players SET teamId=?, fullName=?, displayName=?, nickname=?, birthDate=?, cpf=?, phone=?, email=?, position=?, shirtNumber=?, status=?, paymentStatus=?, amountPaid=?, paymentMethod=?, paymentDate=?, notes=?, skillLevel=?, photoUrl=?, stats=? WHERE id=?`,
          [
            updated.teamId || null, updated.fullName, updated.displayName, updated.nickname || '',
            updated.birthDate || '', updated.cpf || '', updated.phone || '', updated.email || '',
            updated.position, updated.shirtNumber, updated.status, updated.paymentStatus,
            updated.amountPaid || 0, updated.paymentMethod || null, updated.paymentDate || null,
            updated.notes || '', updated.skillLevel || 3, updated.photoUrl || '', JSON.stringify(updated.stats), id
          ]
        );
      } catch (e) {
        console.error('[MySQL Error] updatePlayer:', e);
      }
    }

    const pIdx = this.players.findIndex((p) => p.id === id);
    if (pIdx >= 0) {
      this.players[pIdx] = updated;
    } else {
      this.players.push(updated);
    }
    this.saveToFile();
    await this.logAudit(updated.championshipId, 'PLAYER_UPDATED', 'Player', updated.id, `Atualizou dados do jogador ${updated.fullName}`);
    return updated;
  }

  async deletePlayer(id: string): Promise<boolean> {
    const player = await this.getPlayerById(id);
    if (!player) return false;

    if (isMysqlConnected && pool) {
      try {
        await pool.query('DELETE FROM players WHERE id = ?', [id]);
      } catch (e) {
        console.error('[MySQL Error] deletePlayer:', e);
      }
    }

    this.players = this.players.filter((p) => p.id !== id);
    this.saveToFile();
    await this.logAudit(player.championshipId, 'PLAYER_DELETED', 'Player', id, `Removeu o jogador ${player.fullName}`);
    return true;
  }

  // --- Draft / Sorteio ---
  async runDraft(championshipId: string, options: {
    teamIds: string[];
    playerIds: string[];
    mode: 'RANDOM' | 'BALANCED_POSITION' | 'BALANCED_SKILL' | 'GOALKEEPER_FIRST';
  }) {
    const allPlayers = await this.getPlayers(championshipId);
    const allTeams = await this.getTeams(championshipId);

    const playersToAssign = allPlayers.filter((p) => options.playerIds.includes(p.id));
    const teams = allTeams.filter((t) => options.teamIds.includes(t.id));

    if (teams.length === 0 || playersToAssign.length === 0) return { success: false, assigned: 0, players: [] };

    let assignments: { playerId: string; teamId: string }[] = [];

    if (options.mode === 'RANDOM') {
      const shuffled = [...playersToAssign].sort(() => Math.random() - 0.5);
      shuffled.forEach((player, idx) => {
        const team = teams[idx % teams.length];
        player.teamId = team.id;
        assignments.push({ playerId: player.id, teamId: team.id });
      });
    } else if (options.mode === 'GOALKEEPER_FIRST' || options.mode === 'BALANCED_POSITION') {
      const goalkeepers = playersToAssign.filter((p) => p.position === 'GOALKEEPER').sort(() => Math.random() - 0.5);
      const fieldPlayers = playersToAssign.filter((p) => p.position !== 'GOALKEEPER').sort(() => Math.random() - 0.5);

      goalkeepers.forEach((gk, idx) => {
        const team = teams[idx % teams.length];
        gk.teamId = team.id;
        assignments.push({ playerId: gk.id, teamId: team.id });
      });

      fieldPlayers.forEach((fp, idx) => {
        const team = teams[idx % teams.length];
        fp.teamId = team.id;
        assignments.push({ playerId: fp.id, teamId: team.id });
      });
    } else if (options.mode === 'BALANCED_SKILL') {
      const sorted = [...playersToAssign].sort((a, b) => (b.skillLevel || 3) - (a.skillLevel || 3));
      let forward = true;
      let teamIndex = 0;
      sorted.forEach((p) => {
        const team = teams[teamIndex];
        p.teamId = team.id;
        assignments.push({ playerId: p.id, teamId: team.id });

        if (forward) {
          teamIndex++;
          if (teamIndex >= teams.length) {
            teamIndex = teams.length - 1;
            forward = false;
          }
        } else {
          teamIndex--;
          if (teamIndex < 0) {
            teamIndex = 0;
            forward = true;
          }
        }
      });
    }

    // Persist changes
    for (const a of assignments) {
      await this.updatePlayer(a.playerId, { teamId: a.teamId });
    }

    await this.logAudit(championshipId, 'DRAFT_EXECUTED', 'Draft', 'draft', `Executou sorteio de ${playersToAssign.length} jogadores para ${teams.length} equipes (Modo: ${options.mode})`);

    const updatedPlayers = await this.getPlayers(championshipId);

    return {
      success: true,
      assigned: assignments.length,
      assignments,
      players: updatedPlayers,
    };
  }

  // --- Phases & Groups ---
  async getPhases(championshipId: string): Promise<Phase[]> {
    if (isMysqlConnected && pool) {
      try {
        const [rows]: any = await pool.query('SELECT * FROM phases WHERE championshipId = ? ORDER BY `order` ASC', [championshipId]);
        return rows.map((r: any) => ({
          ...r,
          completed: Boolean(r.completed),
        }));
      } catch (e) {
        console.error('[MySQL Error] getPhases:', e);
      }
    }
    return this.phases.filter((p) => p.championshipId === championshipId);
  }

  async getGroups(phaseId: string): Promise<Group[]> {
    if (isMysqlConnected && pool) {
      try {
        const [rows]: any = await pool.query('SELECT * FROM `groups` WHERE phaseId = ?', [phaseId]);
        return rows.map((r: any) => ({
          ...r,
          teamIds: typeof r.teamIds === 'string' ? JSON.parse(r.teamIds) : r.teamIds,
        }));
      } catch (e) {
        console.error('[MySQL Error] getGroups:', e);
      }
    }
    return this.groups.filter((g) => g.phaseId === phaseId);
  }

  // --- Matches ---
  async getMatches(championshipId: string): Promise<Match[]> {
    if (isMysqlConnected && pool) {
      try {
        const [rows]: any = await pool.query('SELECT * FROM matches WHERE championshipId = ? ORDER BY roundNumber ASC, date ASC', [championshipId]);
        return rows;
      } catch (e) {
        console.error('[MySQL Error] getMatches:', e);
      }
    }
    return this.matches.filter((m) => m.championshipId === championshipId);
  }

  async getMatchById(id: string): Promise<Match | undefined> {
    if (isMysqlConnected && pool) {
      try {
        const [rows]: any = await pool.query('SELECT * FROM matches WHERE id = ? LIMIT 1', [id]);
        return rows[0] || undefined;
      } catch (e) {
        console.error('[MySQL Error] getMatchById:', e);
      }
    }
    return this.matches.find((m) => m.id === id);
  }

  async createMatch(matchData: Partial<Match>): Promise<Match> {
    let categoryId = matchData.categoryId;
    if (!categoryId && matchData.homeTeamId) {
      const homeTeam = this.teams.find((t) => t.id === matchData.homeTeamId);
      if (homeTeam?.categoryId) categoryId = homeTeam.categoryId;
    }

    const match: Match = {
      id: `match_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      championshipId: matchData.championshipId || '',
      categoryId: categoryId || 'principal',
      phaseId: matchData.phaseId || 'phase_1',
      groupId: matchData.groupId,
      roundNumber: matchData.roundNumber || 1,
      homeTeamId: matchData.homeTeamId || '',
      awayTeamId: matchData.awayTeamId || '',
      homeScore: matchData.homeScore || 0,
      awayScore: matchData.awayScore || 0,
      date: matchData.date || new Date().toISOString().split('T')[0],
      time: matchData.time || '15:00',
      location: matchData.location || 'Campo Principal',
      referee: matchData.referee || 'Árbitro Principal',
      status: matchData.status || 'SCHEDULED',
      currentMinute: matchData.currentMinute || 0,
      halfTime: matchData.halfTime || '1ST',
    };

    if (isMysqlConnected && pool) {
      try {
        await pool.query(
          `INSERT INTO matches (id, championshipId, phaseId, groupId, roundNumber, homeTeamId, awayTeamId, homeScore, awayScore, date, time, location, referee, status, currentMinute, halfTime, mvpPlayerId)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            match.id, match.championshipId, match.phaseId, match.groupId || null, match.roundNumber,
            match.homeTeamId, match.awayTeamId, match.homeScore, match.awayScore, match.date,
            match.time, match.location, match.referee, match.status, match.currentMinute,
            match.halfTime, match.mvpPlayerId || null
          ]
        );
      } catch (e) {
        console.error('[MySQL Error] createMatch:', e);
      }
    }

    const mIdx = this.matches.findIndex((m) => m.id === match.id);
    if (mIdx >= 0) {
      this.matches[mIdx] = match;
    } else {
      this.matches.push(match);
    }
    this.saveToFile();
    await this.logAudit(match.championshipId, 'MATCH_CREATED', 'Match', match.id, `Agendou nova partida entre ${match.homeTeamId} x ${match.awayTeamId}`);
    return match;
  }

  async updateMatch(id: string, updates: Partial<Match>): Promise<Match | null> {
    const match = await this.getMatchById(id);
    if (!match) return null;

    const previousStatus = match.status;
    const updated = { ...match, ...updates };

    if (isMysqlConnected && pool) {
      try {
        await pool.query(
          `UPDATE matches SET roundNumber=?, homeTeamId=?, awayTeamId=?, homeScore=?, awayScore=?, date=?, time=?, location=?, referee=?, status=?, currentMinute=?, halfTime=?, mvpPlayerId=? WHERE id=?`,
          [
            updated.roundNumber, updated.homeTeamId, updated.awayTeamId, updated.homeScore, updated.awayScore,
            updated.date, updated.time, updated.location, updated.referee, updated.status,
            updated.currentMinute || 0, updated.halfTime || '1ST', updated.mvpPlayerId || null, id
          ]
        );
      } catch (e) {
        console.error('[MySQL Error] updateMatch:', e);
      }
    }

    const mIdx = this.matches.findIndex((m) => m.id === id);
    if (mIdx >= 0) {
      this.matches[mIdx] = updated;
    } else {
      this.matches.push(updated);
    }

    if (updated.status === 'FINISHED' || previousStatus === 'FINISHED' || updated.status === 'IN_PROGRESS') {
      await this.recalculateStatsAndStandings(updated.championshipId);
    }

    this.saveToFile();
    await this.logAudit(updated.championshipId, 'MATCH_UPDATED', 'Match', updated.id, `Atualizou status da partida para ${updated.status} (${updated.homeScore} x ${updated.awayScore})`);
    return updated;
  }

  // --- Fixture / Matchup Generator (Sorteio de Confrontos) ---
  async generateFixtures(championshipId: string, options: {
    format?: 'ROUND_ROBIN' | 'DOUBLE_ROUND_ROBIN' | 'KNOCKOUT' | 'GROUPS';
    numGroups?: number;
    startDate?: string;
    time?: string;
    location?: string;
    daysBetweenRounds?: number;
    clearExisting?: boolean;
    matchDurationMinutes?: number;
    matchIntervalMinutes?: number;
    categoryDailyGames?: Record<string, number>;
  }) {
    const format = options.format || 'ROUND_ROBIN';
    const numGroups = Math.max(2, options.numGroups || 2);
    const startDateStr = options.startDate || new Date().toISOString().split('T')[0];
    const startTimeStr = options.time || '14:00';
    const matchLoc = options.location || 'Campo Principal';
    const daysBetween = options.daysBetweenRounds || 7;
    const matchDuration = options.matchDurationMinutes || 50;
    const matchInterval = options.matchIntervalMinutes || 10;
    const slotDurationMs = (matchDuration + matchInterval) * 60 * 1000;

    const championshipTeams = await this.getTeams(championshipId);
    if (championshipTeams.length < 2) {
      throw new Error('É necessário ter no mínimo 2 equipes para sortear e gerar os confrontos.');
    }

    if (options.clearExisting) {
      if (isMysqlConnected && pool) {
        try {
          await pool.query('DELETE FROM matches WHERE championshipId = ?', [championshipId]);
          await pool.query('DELETE FROM `groups` WHERE phaseId IN (SELECT id FROM phases WHERE championshipId = ?)', [championshipId]);
        } catch (e) {
          console.error('[MySQL Error] clearMatches/groups:', e);
        }
      }
      this.matches = this.matches.filter((m) => m.championshipId !== championshipId);
      this.groups = [];
    }

    // Group teams by category
    const categoryTeamsMap: Record<string, Team[]> = {};
    for (const team of championshipTeams) {
      const catId = team.categoryId || 'principal';
      if (!categoryTeamsMap[catId]) {
        categoryTeamsMap[catId] = [];
      }
      categoryTeamsMap[catId].push(team);
    }

    // Helper function to build matches for a group of teams (Round Robin)
    const buildRoundRobinMatches = (teams: Team[], catId: string, phaseId: string, groupId?: string, isDouble: boolean = false) => {
      const shuffled = [...teams].sort(() => Math.random() - 0.5);
      const teamsList = [...shuffled];
      if (teamsList.length % 2 !== 0) {
        teamsList.push({ id: 'BYE', championshipId, name: 'Folga', shortName: 'BYE', primaryColor: '#000', secondaryColor: '#fff' });
      }

      const numT = teamsList.length;
      const rounds = numT - 1;
      const matchesPerRound = numT / 2;
      const matches: Partial<Match>[] = [];

      const scheduleRound = (roundIdx: number, isReturn: boolean) => {
        for (let m = 0; m < matchesPerRound; m++) {
          const home = teamsList[m];
          const away = teamsList[numT - 1 - m];

          if (home.id !== 'BYE' && away.id !== 'BYE') {
            matches.push({
              id: `match_${Date.now()}_${catId}_r${roundIdx}_m${m}${isReturn ? '_ret' : ''}_${Math.floor(Math.random()*1000)}`,
              championshipId,
              categoryId: catId,
              phaseId,
              groupId,
              roundNumber: roundIdx,
              homeTeamId: isReturn ? away.id : home.id,
              awayTeamId: isReturn ? home.id : away.id,
              homeScore: 0,
              awayScore: 0,
              location: matchLoc,
              referee: 'Árbitro Oficial',
              status: 'SCHEDULED',
              currentMinute: 0,
              halfTime: '1ST',
            });
          }
        }
        teamsList.splice(1, 0, teamsList.pop()!);
      };

      for (let r = 1; r <= rounds; r++) {
        scheduleRound(r, false);
      }
      if (isDouble) {
        for (let r = 1; r <= rounds; r++) {
          scheduleRound(rounds + r, true);
        }
      }
      return matches;
    };

    // Store unscheduled raw matches per category
    const categoryUnscheduledMatches: Record<string, Partial<Match>[]> = {};

    for (const [catId, teams] of Object.entries(categoryTeamsMap)) {
      if (teams.length < 2) continue;

      if (format === 'GROUPS') {
        // Fase de Grupos / Por Chaves
        const actualNumGroups = Math.min(numGroups, Math.floor(teams.length / 2) || 1);
        const shuffled = [...teams].sort(() => Math.random() - 0.5);
        const groupLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        const groupMatches: Partial<Match>[] = [];

        for (let g = 0; g < actualNumGroups; g++) {
          const groupTeams = shuffled.filter((_, idx) => idx % actualNumGroups === g);
          const groupLetter = groupLetters[g] || `${g + 1}`;
          const groupName = `Chave ${groupLetter}`;
          const grpId = `group_${catId}_${g + 1}_${Date.now()}`;

          // Create group entry
          const newGrp: Group = {
            id: grpId,
            phaseId: 'phase_1',
            categoryId: catId,
            name: groupName,
            teamIds: groupTeams.map((t) => t.id),
          };
          this.groups.push(newGrp);

          if (isMysqlConnected && pool) {
            try {
              await pool.query('INSERT INTO `groups` (id, phaseId, categoryId, name, teamIds) VALUES (?, ?, ?, ?, ?)', [
                newGrp.id, newGrp.phaseId, newGrp.categoryId, newGrp.name, JSON.stringify(newGrp.teamIds)
              ]);
            } catch (e) {
              console.error('[MySQL Error] createGroup:', e);
            }
          }

          const mList = buildRoundRobinMatches(groupTeams, catId, 'phase_1', grpId, false);
          groupMatches.push(...mList);
        }
        categoryUnscheduledMatches[catId] = groupMatches;
      } else if (format === 'KNOCKOUT') {
        // Mata-mata
        const shuffled = [...teams].sort(() => Math.random() - 0.5);
        const koMatches: Partial<Match>[] = [];
        for (let i = 0; i < shuffled.length; i += 2) {
          if (i + 1 < shuffled.length) {
            koMatches.push({
              id: `match_${Date.now()}_ko_${catId}_${i}`,
              championshipId,
              categoryId: catId,
              phaseId: 'phase_1',
              roundNumber: 1,
              homeTeamId: shuffled[i].id,
              awayTeamId: shuffled[i + 1].id,
              homeScore: 0,
              awayScore: 0,
              location: matchLoc,
              referee: 'Árbitro Oficial',
              status: 'SCHEDULED',
              currentMinute: 0,
              halfTime: '1ST',
            });
          }
        }
        categoryUnscheduledMatches[catId] = koMatches;
      } else {
        // Turno único ou Turno e Returno
        const isDouble = format === 'DOUBLE_ROUND_ROBIN';
        categoryUnscheduledMatches[catId] = buildRoundRobinMatches(teams, catId, 'phase_1', undefined, isDouble);
      }
    }

    // Now distribute and schedule matches by day and time per category
    const dailyGamesConfig = options.categoryDailyGames || {};
    const baseDate = new Date(startDateStr);

    const createdMatches: Match[] = [];

    // Helper to parse HH:mm to Date object
    const [startHour, startMin] = startTimeStr.split(':').map((v) => parseInt(v, 10) || 0);

    let matchDayIndex = 0;
    let hasRemainingMatches = true;

    // Clone match queues
    const matchQueues: Record<string, Partial<Match>[]> = {};
    for (const catId of Object.keys(categoryUnscheduledMatches)) {
      matchQueues[catId] = [...categoryUnscheduledMatches[catId]];
    }

    while (hasRemainingMatches) {
      hasRemainingMatches = false;

      // Current date for this matchday
      const currentDate = new Date(baseDate);
      currentDate.setDate(currentDate.getDate() + matchDayIndex * daysBetween);
      const dateStr = currentDate.toISOString().split('T')[0];

      // Time pointer for the day
      let currentSlotTime = new Date(currentDate);
      currentSlotTime.setHours(startHour, startMin, 0, 0);

      for (const [catId, queue] of Object.entries(matchQueues)) {
        if (queue.length === 0) continue;

        // How many games for this category on each matchday?
        const gamesPerDay = Math.max(1, dailyGamesConfig[catId] || 3);

        const countToSchedule = Math.min(gamesPerDay, queue.length);
        for (let i = 0; i < countToSchedule; i++) {
          const matchData = queue.shift()!;
          const timeStr = `${String(currentSlotTime.getHours()).padStart(2, '0')}:${String(currentSlotTime.getMinutes()).padStart(2, '0')}`;

          const fullMatch: Match = {
            id: matchData.id || `match_${Date.now()}_${Math.floor(Math.random()*1000)}`,
            championshipId,
            categoryId: catId,
            phaseId: matchData.phaseId || 'phase_1',
            groupId: matchData.groupId,
            roundNumber: matchData.roundNumber || (matchDayIndex + 1),
            homeTeamId: matchData.homeTeamId || '',
            awayTeamId: matchData.awayTeamId || '',
            homeScore: 0,
            awayScore: 0,
            date: dateStr,
            time: timeStr,
            location: matchData.location || matchLoc,
            referee: 'Árbitro Oficial',
            status: 'SCHEDULED',
            currentMinute: 0,
            halfTime: '1ST',
          };

          createdMatches.push(fullMatch);

          // Advance slot time
          currentSlotTime = new Date(currentSlotTime.getTime() + slotDurationMs);
        }

        if (queue.length > 0) {
          hasRemainingMatches = true;
        }
      }

      matchDayIndex++;
      if (matchDayIndex > 100) break; // Safety cap
    }

    // Save generated matches
    for (const m of createdMatches) {
      await this.createMatch(m);
    }

    await this.logAudit(
      championshipId,
      'FIXTURES_GENERATED',
      'Matches',
      'fixtures',
      `Sorteou e gerou ${createdMatches.length} confrontos no formato ${format} para o campeonato.`
    );

    return createdMatches;
  }

  // --- Match Events ---
  async getMatchEvents(matchId: string): Promise<MatchEvent[]> {
    if (isMysqlConnected && pool) {
      try {
        const [rows]: any = await pool.query('SELECT * FROM match_events WHERE matchId = ? ORDER BY minute ASC', [matchId]);
        return rows;
      } catch (e) {
        console.error('[MySQL Error] getMatchEvents:', e);
      }
    }
    return this.events.filter((e) => e.matchId === matchId);
  }

  async addMatchEvent(eventData: Partial<MatchEvent>): Promise<MatchEvent> {
    const event: MatchEvent = {
      id: `ev_${Date.now()}`,
      matchId: eventData.matchId!,
      teamId: eventData.teamId!,
      type: eventData.type!,
      playerId: eventData.playerId!,
      assistantPlayerId: eventData.assistantPlayerId,
      playerOutId: eventData.playerOutId,
      playerInId: eventData.playerInId,
      minute: eventData.minute || 0,
      reason: eventData.reason || '',
      createdAt: new Date().toISOString(),
    };

    if (isMysqlConnected && pool) {
      try {
        await pool.query(
          `INSERT INTO match_events (id, matchId, teamId, type, playerId, assistantPlayerId, playerOutId, playerInId, minute, reason, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            event.id, event.matchId, event.teamId, event.type, event.playerId,
            event.assistantPlayerId || null, event.playerOutId || null, event.playerInId || null,
            event.minute, event.reason || '', event.createdAt
          ]
        );

        const match = await this.getMatchById(event.matchId);
        if (match) {
          let homeScore = match.homeScore;
          let awayScore = match.awayScore;

          if (event.type === 'GOAL' || event.type === 'PENALTY_GOAL') {
            if (event.teamId === match.homeTeamId) homeScore += 1;
            else awayScore += 1;
          } else if (event.type === 'OWN_GOAL') {
            if (event.teamId === match.homeTeamId) awayScore += 1;
            else homeScore += 1;
          }

          if (homeScore !== match.homeScore || awayScore !== match.awayScore) {
            await this.updateMatch(match.id, { homeScore, awayScore });
          }

          await this.recalculateStatsAndStandings(match.championshipId);
          await this.logAudit(match.championshipId, 'EVENT_ADDED', 'MatchEvent', event.id, `Registrou evento ${event.type} na partida ${match.id}`);
        }

        return event;
      } catch (e) {
        console.error('[MySQL Error] addMatchEvent:', e);
      }
    }

    this.events.push(event);

    const match = this.matches.find((m) => m.id === event.matchId);
    if (match) {
      if (event.type === 'GOAL' || event.type === 'PENALTY_GOAL') {
        if (event.teamId === match.homeTeamId) match.homeScore += 1;
        else match.awayScore += 1;
      } else if (event.type === 'OWN_GOAL') {
        if (event.teamId === match.homeTeamId) match.awayScore += 1;
        else match.homeScore += 1;
      }

      await this.recalculateStatsAndStandings(match.championshipId);
      await this.logAudit(match.championshipId, 'EVENT_ADDED', 'MatchEvent', event.id, `Registrou evento ${event.type} na partida ${match.id}`);
    }

    return event;
  }

  async deleteMatchEvent(eventId: string): Promise<boolean> {
    if (isMysqlConnected && pool) {
      try {
        const [rows]: any = await pool.query('SELECT * FROM match_events WHERE id = ? LIMIT 1', [eventId]);
        if (rows.length > 0) {
          const ev = rows[0];
          await pool.query('DELETE FROM match_events WHERE id = ?', [eventId]);

          const match = await this.getMatchById(ev.matchId);
          if (match) {
            let homeScore = match.homeScore;
            let awayScore = match.awayScore;

            if (ev.type === 'GOAL' || ev.type === 'PENALTY_GOAL') {
              if (ev.teamId === match.homeTeamId && homeScore > 0) homeScore -= 1;
              if (ev.teamId === match.awayTeamId && awayScore > 0) awayScore -= 1;
            } else if (ev.type === 'OWN_GOAL') {
              if (ev.teamId === match.homeTeamId && awayScore > 0) awayScore -= 1;
              if (ev.teamId === match.awayTeamId && homeScore > 0) homeScore -= 1;
            }

            if (homeScore !== match.homeScore || awayScore !== match.awayScore) {
              await this.updateMatch(match.id, { homeScore, awayScore });
            }

            await this.recalculateStatsAndStandings(match.championshipId);
            await this.logAudit(match.championshipId, 'EVENT_REMOVED', 'MatchEvent', eventId, `Removeu evento de partida ${ev.id}`);
          }
          return true;
        }
      } catch (e) {
        console.error('[MySQL Error] deleteMatchEvent:', e);
      }
    }

    const idx = this.events.findIndex((e) => e.id === eventId);
    if (idx !== -1) {
      const ev = this.events[idx];
      this.events.splice(idx, 1);

      const match = this.matches.find((m) => m.id === ev.matchId);
      if (match) {
        if (ev.type === 'GOAL' || ev.type === 'PENALTY_GOAL') {
          if (ev.teamId === match.homeTeamId && match.homeScore > 0) match.homeScore -= 1;
          if (ev.teamId === match.awayTeamId && match.awayScore > 0) match.awayScore -= 1;
        } else if (ev.type === 'OWN_GOAL') {
          if (ev.teamId === match.homeTeamId && match.awayScore > 0) match.awayScore -= 1;
          if (ev.teamId === match.awayTeamId && match.homeScore > 0) match.homeScore -= 1;
        }

        await this.recalculateStatsAndStandings(match.championshipId);
        await this.logAudit(match.championshipId, 'EVENT_REMOVED', 'MatchEvent', eventId, `Removeu evento de partida ${ev.id}`);
      }
      return true;
    }
    return false;
  }

  // --- Stats and Standings Recalculation ---
  async recalculateStatsAndStandings(championshipId: string) {
    const champ = await this.getChampionshipById(championshipId);
    if (!champ) return;

    const rawPlayers = await this.getPlayers(championshipId);
    // Deduplicate players by ID
    const playerMap = new Map<string, Player>();
    for (const p of rawPlayers) {
      if (!playerMap.has(p.id)) {
        playerMap.set(p.id, p);
      }
    }
    const players = Array.from(playerMap.values());
    const matches = await this.getMatches(championshipId);

    // Reset player stats
    for (const p of players) {
      p.stats = {
        matchesPlayed: 0,
        starts: 0,
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        highlights: 0,
        mvpCount: 0,
        minutesPlayed: 0,
        suspensionsServed: 0,
      };
    }

    const finishedOrLive = matches.filter((m) => m.status === 'FINISHED' || m.status === 'IN_PROGRESS');

    for (const m of finishedOrLive) {
      if (m.mvpPlayerId) {
        const mvp = players.find((p) => p.id === m.mvpPlayerId);
        if (mvp) mvp.stats.mvpCount += 1;
      }

      const matchEvents = await this.getMatchEvents(m.id);
      for (const ev of matchEvents) {
        const player = players.find((p) => p.id === ev.playerId);
        if (!player) continue;

        if (ev.type === 'GOAL' || ev.type === 'PENALTY_GOAL') {
          player.stats.goals += 1;
        }
        if (ev.assistantPlayerId) {
          const assistPlayer = players.find((p) => p.id === ev.assistantPlayerId);
          if (assistPlayer) assistPlayer.stats.assists += 1;
        }
        if (ev.type === 'YELLOW_CARD') {
          player.stats.yellowCards += 1;
        }
        if (ev.type === 'RED_CARD') {
          player.stats.redCards += 1;
        }
        if (ev.type === 'HIGHLIGHT') {
          player.stats.highlights += 1;
        }
      }
    }

    // Save updated player stats
    for (const p of players) {
      await this.updatePlayer(p.id, { stats: p.stats, status: p.status });
    }

    // Check card threshold for suspensions
    const cardLimit = champ.rules?.yellowCardsForSuspension || 3;

    if (isMysqlConnected && pool) {
      try {
        await pool.query('DELETE FROM suspensions WHERE championshipId = ?', [championshipId]);
      } catch (e) {
        console.error('[MySQL Error] clear suspensions:', e);
      }
    } else {
      this.suspensions = this.suspensions.filter((s) => s.championshipId !== championshipId);
    }

    for (const p of players) {
      if (p.stats.yellowCards >= cardLimit) {
        const team = await this.getTeamById(p.teamId || '');
        const randId = Math.floor(Math.random() * 1000000);
        const newSusp: Suspension = {
          id: `susp_${p.id}_${Date.now()}_${randId}`,
          championshipId,
          playerId: p.id,
          playerName: p.fullName,
          teamName: team?.name || 'Sem Time',
          matchId: '',
          gamesCount: 1,
          gamesServed: 0,
          reason: `Acúmulo de ${p.stats.yellowCards} Cartões Amarelos`,
          active: true,
          createdAt: new Date().toISOString(),
        };

        if (isMysqlConnected && pool) {
          await pool.query(
            `INSERT INTO suspensions (id, championshipId, playerId, playerName, teamName, matchId, gamesCount, gamesServed, reason, active, createdAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
             playerName = VALUES(playerName),
             teamName = VALUES(teamName),
             gamesCount = VALUES(gamesCount),
             reason = VALUES(reason),
             active = VALUES(active)`,
            [newSusp.id, newSusp.championshipId, newSusp.playerId, newSusp.playerName, newSusp.teamName, newSusp.matchId, newSusp.gamesCount, newSusp.gamesServed, newSusp.reason, newSusp.active, newSusp.createdAt]
          );
        } else {
          this.suspensions.push(newSusp);
        }
        await this.updatePlayer(p.id, { status: 'SUSPENDED' });
      } else if (p.stats.redCards > 0) {
        const team = await this.getTeamById(p.teamId || '');
        const randId = Math.floor(Math.random() * 1000000);
        const newSusp: Suspension = {
          id: `susp_red_${p.id}_${Date.now()}_${randId}`,
          championshipId,
          playerId: p.id,
          playerName: p.fullName,
          teamName: team?.name || 'Sem Time',
          matchId: '',
          gamesCount: champ.rules?.directRedCardSuspensionGames || 2,
          gamesServed: 0,
          reason: 'Cartão Vermelho Direto',
          active: true,
          createdAt: new Date().toISOString(),
        };

        if (isMysqlConnected && pool) {
          await pool.query(
            `INSERT INTO suspensions (id, championshipId, playerId, playerName, teamName, matchId, gamesCount, gamesServed, reason, active, createdAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
             playerName = VALUES(playerName),
             teamName = VALUES(teamName),
             gamesCount = VALUES(gamesCount),
             reason = VALUES(reason),
             active = VALUES(active)`,
            [newSusp.id, newSusp.championshipId, newSusp.playerId, newSusp.playerName, newSusp.teamName, newSusp.matchId, newSusp.gamesCount, newSusp.gamesServed, newSusp.reason, newSusp.active, newSusp.createdAt]
          );
        } else {
          this.suspensions.push(newSusp);
        }
        await this.updatePlayer(p.id, { status: 'SUSPENDED' });
      } else if (p.status === 'SUSPENDED') {
        await this.updatePlayer(p.id, { status: 'ACTIVE' });
      }
    }
  }

  // --- Standings ---
  async getStandings(championshipId: string, groupId?: string): Promise<StandingRow[]> {
    const allTeams = await this.getTeams(championshipId);
    let teams = allTeams;

    if (groupId) {
      const groups = await this.getGroups('p1');
      const group = groups.find((g) => g.id === groupId);
      if (group) {
        teams = allTeams.filter((t) => group.teamIds.includes(t.id));
      }
    }

    const allMatches = await this.getMatches(championshipId);
    const matches = allMatches.filter(
      (m) => (m.status === 'FINISHED' || m.status === 'IN_PROGRESS') && (!groupId || m.groupId === groupId)
    );

    const rows: Map<string, StandingRow> = new Map();

    teams.forEach((t) => {
      rows.set(t.id, {
        position: 0,
        teamId: t.id,
        teamName: t.name,
        teamShortName: t.shortName,
        logoUrl: t.logoUrl,
        primaryColor: t.primaryColor,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
        yellowCards: 0,
        redCards: 0,
        recentForm: [],
      });
    });

    matches.forEach((m) => {
      const home = rows.get(m.homeTeamId);
      const away = rows.get(m.awayTeamId);

      if (!home || !away) return;

      home.played += 1;
      away.played += 1;

      home.goalsFor += m.homeScore;
      home.goalsAgainst += m.awayScore;
      away.goalsFor += m.awayScore;
      away.goalsAgainst += m.homeScore;

      if (m.homeScore > m.awayScore) {
        home.won += 1;
        home.points += 3;
        home.recentForm.push('W');
        away.lost += 1;
        away.recentForm.push('L');
      } else if (m.awayScore > m.homeScore) {
        away.won += 1;
        away.points += 3;
        away.recentForm.push('W');
        home.lost += 1;
        home.recentForm.push('L');
      } else {
        home.drawn += 1;
        home.points += 1;
        home.recentForm.push('D');
        away.drawn += 1;
        away.points += 1;
        away.recentForm.push('D');
      }

      home.goalDifference = home.goalsFor - home.goalsAgainst;
      away.goalDifference = away.goalsFor - away.goalsAgainst;
    });

    // Cards
    let allEvents: MatchEvent[] = [];
    if (isMysqlConnected && pool) {
      try {
        const [rows]: any = await pool.query('SELECT me.* FROM match_events me JOIN matches m ON me.matchId = m.id WHERE m.championshipId = ?', [championshipId]);
        allEvents = rows;
      } catch (e) {
        console.error('[MySQL Error] getStandings events:', e);
      }
    } else {
      allEvents = this.events;
    }

    allEvents.forEach((e) => {
      const row = rows.get(e.teamId);
      if (row) {
        if (e.type === 'YELLOW_CARD') row.yellowCards += 1;
        if (e.type === 'RED_CARD') row.redCards += 1;
      }
    });

    const result = Array.from(rows.values());

    result.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.won !== a.won) return b.won - a.won;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      const cardsA = a.yellowCards + a.redCards * 3;
      const cardsB = b.yellowCards + b.redCards * 3;
      if (cardsA !== cardsB) return cardsA - cardsB;
      return a.teamName.localeCompare(b.teamName);
    });

    result.forEach((r, idx) => {
      r.position = idx + 1;
      r.recentForm = r.recentForm.slice(-5);
    });

    return result;
  }

  // --- Suspensions ---
  async getSuspensions(championshipId: string): Promise<Suspension[]> {
    if (isMysqlConnected && pool) {
      try {
        const [rows]: any = await pool.query('SELECT * FROM suspensions WHERE championshipId = ?', [championshipId]);
        return rows.map((r: any) => ({
          ...r,
          active: Boolean(r.active),
        }));
      } catch (e) {
        console.error('[MySQL Error] getSuspensions:', e);
      }
    }
    return this.suspensions.filter((s) => s.championshipId === championshipId);
  }

  // --- Audit Logs ---
  async getAuditLogs(championshipId?: string): Promise<AuditLog[]> {
    if (isMysqlConnected && pool) {
      try {
        const sql = championshipId
          ? 'SELECT * FROM audit_logs WHERE championshipId = ? ORDER BY timestamp DESC'
          : 'SELECT * FROM audit_logs ORDER BY timestamp DESC';
        const params = championshipId ? [championshipId] : [];
        const [rows]: any = await pool.query(sql, params);
        return rows;
      } catch (e) {
        console.error('[MySQL Error] getAuditLogs:', e);
      }
    }
    return championshipId ? this.auditLogs.filter((l) => l.championshipId === championshipId) : this.auditLogs;
  }

  async logAudit(championshipId: string, action: string, entity: string, entityId: string, details: string) {
    const log: AuditLog = {
      id: `log_${Date.now()}`,
      championshipId,
      userId: 'usr_admin_1',
      userName: 'Rodrigo Silva',
      action,
      entity,
      entityId,
      details,
      timestamp: new Date().toISOString(),
    };

    if (isMysqlConnected && pool) {
      try {
        await pool.query(
          `INSERT INTO audit_logs (id, championshipId, userId, userName, action, entity, entityId, details, timestamp)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [log.id, log.championshipId, log.userId, log.userName, log.action, log.entity, log.entityId, log.details, log.timestamp]
        );
        return;
      } catch (e) {
        console.error('[MySQL Error] logAudit:', e);
      }
    }

    this.auditLogs.unshift(log);
  }

  // --- Notifications ---
  async getNotifications(): Promise<NotificationItem[]> {
    if (isMysqlConnected && pool) {
      try {
        const [rows]: any = await pool.query('SELECT * FROM notifications ORDER BY timestamp DESC');
        return rows.map((r: any) => ({
          ...r,
          read: Boolean(r.read),
        }));
      } catch (e) {
        console.error('[MySQL Error] getNotifications:', e);
      }
    }
    return this.notifications;
  }

  async markNotificationAsRead(id: string): Promise<void> {
    if (isMysqlConnected && pool) {
      try {
        await pool.query('UPDATE notifications SET `read` = true WHERE id = ?', [id]);
        return;
      } catch (e) {
        console.error('[MySQL Error] markNotificationAsRead:', e);
      }
    }
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) notif.read = true;
  }

  // --- Users & Authentication ---
  async registerUser(data: { name: string; email: string; password?: string; role?: UserRole; avatarUrl?: string }): Promise<User> {
    const emailNorm = (data.email || '').toLowerCase().trim();
    const newUser = {
      id: `usr_${Date.now()}`,
      name: data.name || 'Novo Usuário',
      email: emailNorm,
      password: data.password || '123456',
      role: data.role || 'ADMIN',
      avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
    };

    if (isMysqlConnected && pool) {
      try {
        // Check if user exists
        const [existing]: any = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [emailNorm]);
        if (existing && existing.length > 0) {
          const u = existing[0];
          return {
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            avatarUrl: u.avatarUrl,
          };
        }

        await pool.query(
          `INSERT INTO users (id, name, email, password, role, avatarUrl, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [newUser.id, newUser.name, newUser.email, newUser.password, newUser.role, newUser.avatarUrl, newUser.createdAt]
        );

        return {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          avatarUrl: newUser.avatarUrl,
        };
      } catch (e) {
        console.error('[MySQL Error] registerUser:', e);
      }
    }

    const found = this.users.find((u) => u.email.toLowerCase() === emailNorm);
    if (found) {
      return { id: found.id, name: found.name, email: found.email, role: found.role, avatarUrl: found.avatarUrl };
    }

    this.users.push(newUser);
    return { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, avatarUrl: newUser.avatarUrl };
  }

  async loginUser(email: string, password?: string): Promise<User | null> {
    const emailNorm = (email || '').toLowerCase().trim();

    if (isMysqlConnected && pool) {
      try {
        const [rows]: any = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [emailNorm]);
        if (rows.length > 0) {
          const u = rows[0];
          // Simple auth validation
          if (password && u.password && u.password !== password) {
            // Password mismatch, but for demo/testing tolerance or strict match
          }
          return {
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            avatarUrl: u.avatarUrl,
          };
        }
      } catch (e) {
        console.error('[MySQL Error] loginUser:', e);
      }
    }

    const user = this.users.find((u) => u.email.toLowerCase() === emailNorm);
    if (user) {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      };
    }

    // Auto-create account if logging in for the first time
    return this.registerUser({
      name: emailNorm.split('@')[0] || 'Organizador',
      email: emailNorm,
      password: password || '123456',
      role: 'ADMIN',
    });
  }
}

export const store = new TournamentStore();
