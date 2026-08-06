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
  NotificationItem
} from '../src/types';
import {
  sampleChampionship,
  sampleChampionships,
  sampleTeams,
  samplePlayers,
  samplePhases,
  sampleGroups,
  sampleMatches,
  sampleEvents,
  sampleSuspensions,
  sampleAuditLogs,
  sampleNotifications
} from '../src/mockData';
import { pool, isMysqlConnected } from './db';

class TournamentStore {
  // In-memory fallback state
  private championships: Championship[] = [...sampleChampionships];
  private teams: Team[] = [...sampleTeams];
  private players: Player[] = [...samplePlayers];
  private phases: Phase[] = [...samplePhases];
  private groups: Group[] = [...sampleGroups];
  private matches: Match[] = [...sampleMatches];
  private events: MatchEvent[] = [...sampleEvents];
  private suspensions: Suspension[] = [...sampleSuspensions];
  private auditLogs: AuditLog[] = [...sampleAuditLogs];
  private notifications: NotificationItem[] = [...sampleNotifications];

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
      championshipId: teamData.championshipId || 'champ_1',
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
          `INSERT INTO teams (id, championshipId, name, shortName, primaryColor, secondaryColor, coachName, managerName, logoUrl, captainPlayerId)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            team.id, team.championshipId, team.name, team.shortName, team.primaryColor,
            team.secondaryColor, team.coachName, team.managerName, team.logoUrl || null, team.captainPlayerId || null
          ]
        );
        await this.logAudit(team.championshipId, 'TEAM_CREATED', 'Team', team.id, `Cadastrou a equipe ${team.name}`);
        return team;
      } catch (e) {
        console.error('[MySQL Error] createTeam:', e);
      }
    }

    this.teams.push(team);
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
        await this.logAudit(updated.championshipId, 'TEAM_UPDATED', 'Team', updated.id, `Atualizou a equipe ${updated.name}`);
        return updated;
      } catch (e) {
        console.error('[MySQL Error] updateTeam:', e);
      }
    }

    Object.assign(team, updates);
    await this.logAudit(team.championshipId, 'TEAM_UPDATED', 'Team', team.id, `Atualizou a equipe ${team.name}`);
    return team;
  }

  async deleteTeam(id: string): Promise<boolean> {
    const team = await this.getTeamById(id);
    if (!team) return false;

    if (isMysqlConnected && pool) {
      try {
        await pool.query('DELETE FROM teams WHERE id = ?', [id]);
        await pool.query('UPDATE players SET teamId = NULL WHERE teamId = ?', [id]);
        await this.logAudit(team.championshipId, 'TEAM_DELETED', 'Team', id, `Excluiu a equipe ${team.name}`);
        return true;
      } catch (e) {
        console.error('[MySQL Error] deleteTeam:', e);
      }
    }

    const index = this.teams.findIndex((t) => t.id === id);
    if (index !== -1) {
      const deleted = this.teams[index];
      this.teams.splice(index, 1);
      this.players.filter((p) => p.teamId === id).forEach((p) => (p.teamId = null));
      await this.logAudit(deleted.championshipId, 'TEAM_DELETED', 'Team', id, `Excluiu a equipe ${deleted.name}`);
      return true;
    }
    return false;
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
    const player: Player = {
      id: `play_${Date.now()}`,
      championshipId: playerData.championshipId || 'champ_1',
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
      photoUrl: playerData.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
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
        await this.logAudit(player.championshipId, 'PLAYER_CREATED', 'Player', player.id, `Cadastrou o jogador ${player.fullName}`);
        return player;
      } catch (e) {
        console.error('[MySQL Error] createPlayer:', e);
      }
    }

    this.players.push(player);
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
        await this.logAudit(updated.championshipId, 'PLAYER_UPDATED', 'Player', updated.id, `Atualizou dados do jogador ${updated.fullName}`);
        return updated;
      } catch (e) {
        console.error('[MySQL Error] updatePlayer:', e);
      }
    }

    Object.assign(player, updates);
    await this.logAudit(player.championshipId, 'PLAYER_UPDATED', 'Player', player.id, `Atualizou dados do jogador ${player.fullName}`);
    return player;
  }

  async deletePlayer(id: string): Promise<boolean> {
    const player = await this.getPlayerById(id);
    if (!player) return false;

    if (isMysqlConnected && pool) {
      try {
        await pool.query('DELETE FROM players WHERE id = ?', [id]);
        await this.logAudit(player.championshipId, 'PLAYER_DELETED', 'Player', id, `Removeu o jogador ${player.fullName}`);
        return true;
      } catch (e) {
        console.error('[MySQL Error] deletePlayer:', e);
      }
    }

    const index = this.players.findIndex((p) => p.id === id);
    if (index !== -1) {
      const deleted = this.players[index];
      this.players.splice(index, 1);
      await this.logAudit(deleted.championshipId, 'PLAYER_DELETED', 'Player', id, `Removeu o jogador ${deleted.fullName}`);
      return true;
    }
    return false;
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
    const match: Match = {
      id: `match_${Date.now()}`,
      championshipId: matchData.championshipId || 'champ_1',
      phaseId: matchData.phaseId || 'phase_1',
      groupId: matchData.groupId,
      roundNumber: matchData.roundNumber || 1,
      homeTeamId: matchData.homeTeamId || '',
      awayTeamId: matchData.awayTeamId || '',
      homeScore: 0,
      awayScore: 0,
      date: matchData.date || new Date().toISOString().split('T')[0],
      time: matchData.time || '15:00',
      location: matchData.location || 'Campo Principal',
      referee: matchData.referee || 'Árbitro Principal',
      status: 'SCHEDULED',
      currentMinute: 0,
      halfTime: '1ST',
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
        await this.logAudit(match.championshipId, 'MATCH_CREATED', 'Match', match.id, `Agendou nova partida entre ${match.homeTeamId} x ${match.awayTeamId}`);
        return match;
      } catch (e) {
        console.error('[MySQL Error] createMatch:', e);
      }
    }

    this.matches.push(match);
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

        if (updated.status === 'FINISHED' || previousStatus === 'FINISHED' || updated.status === 'IN_PROGRESS') {
          await this.recalculateStatsAndStandings(updated.championshipId);
        }

        await this.logAudit(updated.championshipId, 'MATCH_UPDATED', 'Match', updated.id, `Atualizou status da partida para ${updated.status} (${updated.homeScore} x ${updated.awayScore})`);
        return updated;
      } catch (e) {
        console.error('[MySQL Error] updateMatch:', e);
      }
    }

    Object.assign(match, updates);

    if (match.status === 'FINISHED' || previousStatus === 'FINISHED' || match.status === 'IN_PROGRESS') {
      await this.recalculateStatsAndStandings(match.championshipId);
    }

    await this.logAudit(match.championshipId, 'MATCH_UPDATED', 'Match', match.id, `Atualizou status da partida para ${match.status} (${match.homeScore} x ${match.awayScore})`);
    return match;
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

    const players = await this.getPlayers(championshipId);
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
        const newSusp: Suspension = {
          id: `susp_${p.id}_${Date.now()}`,
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
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [newSusp.id, newSusp.championshipId, newSusp.playerId, newSusp.playerName, newSusp.teamName, newSusp.matchId, newSusp.gamesCount, newSusp.gamesServed, newSusp.reason, newSusp.active, newSusp.createdAt]
          );
        } else {
          this.suspensions.push(newSusp);
        }
        await this.updatePlayer(p.id, { status: 'SUSPENDED' });
      } else if (p.stats.redCards > 0) {
        const team = await this.getTeamById(p.teamId || '');
        const newSusp: Suspension = {
          id: `susp_red_${p.id}_${Date.now()}`,
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
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
}

export const store = new TournamentStore();
