import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { ChampionshipView } from './components/championship/ChampionshipView';
import { PlayersView } from './components/players/PlayersView';
import { TeamsView } from './components/teams/TeamsView';
import { DraftView } from './components/draft/DraftView';
import { PhasesAndStandingsView } from './components/phases/PhasesAndStandingsView';
import { MatchesView } from './components/matches/MatchesView';
import { LiveOperatorView } from './components/live/LiveOperatorView';
import { DisciplineView } from './components/discipline/DisciplineView';
import { StatsView } from './components/stats/StatsView';
import { FinancialView } from './components/financial/FinancialView';
import { PublicView } from './components/public/PublicView';
import { ChampionshipsHubModal } from './components/championship/ChampionshipsHubModal';
import { AuthView } from './components/auth/AuthView';

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
  FinancialStatus,
  User
} from './types';
import { api } from './services/api';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('futgestao_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isGuestMode, setIsGuestMode] = useState<boolean>(false);

  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [userRole, setUserRole] = useState<'ADMIN' | 'OPERATOR' | 'VIEWER'>(
    currentUser?.role || 'ADMIN'
  );
  const [selectedMatchForLive, setSelectedMatchForLive] = useState<Match | null>(null);
  const [autoOpenCreateMatch, setAutoOpenCreateMatch] = useState<boolean>(false);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setUserRole(user.role);
    setIsGuestMode(false);
    setIsChampHubOpen(true);
  };

  const handleGuestContinue = () => {
    setIsGuestMode(true);
    setUserRole('VIEWER');
    setActiveModule('public');
    setIsChampHubOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('futgestao_user');
    setCurrentUser(null);
    setIsGuestMode(false);
    setIsChampHubOpen(false);
  };

  // Role selection handler
  const handleSelectRole = (role: 'ADMIN' | 'OPERATOR' | 'VIEWER') => {
    setUserRole(role);
    if (role === 'VIEWER') {
      setActiveModule('public');
    } else if (activeModule === 'public') {
      if (role === 'OPERATOR') {
        setActiveModule('live_control');
      } else {
        setActiveModule('dashboard');
      }
    }
  };

  // New match handler
  const handleNewMatch = () => {
    setActiveModule('matches');
    setAutoOpenCreateMatch(true);
  };

  // Core Data States
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [selectedChampId, setSelectedChampId] = useState<string>('champ_1');
  const [isChampHubOpen, setIsChampHubOpen] = useState<boolean>(false);

  const [championship, setChampionship] = useState<Championship | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [suspensions, setSuspensions] = useState<Suspension[]>([]);
  const [events, setEvents] = useState<MatchEvent[]>([]);

  const [loading, setLoading] = useState(true);

  // Initial Data Fetch
  const fetchData = async (champId: string = selectedChampId) => {
    try {
      setLoading(true);
      const data = await api.getChampionshipData(champId);
      setChampionship(data.championship || null);
      setTeams(Array.isArray(data.teams) ? data.teams : []);
      setPlayers(Array.isArray(data.players) ? data.players : []);
      setPhases(Array.isArray(data.phases) ? data.phases : []);
      setGroups(Array.isArray(data.groups) ? data.groups : []);
      setMatches(Array.isArray(data.matches) ? data.matches : []);
      setStandings(Array.isArray(data.standings) ? data.standings : []);
      setSuspensions(Array.isArray(data.suspensions) ? data.suspensions : []);
      setEvents(Array.isArray(data.events) ? data.events : []);
    } catch (err) {
      console.error('Failed to load championship data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChampionshipsList = async () => {
    try {
      const list = await api.fetchChampionships();
      if (Array.isArray(list) && list.length > 0) {
        setChampionships(list);
      }
    } catch (err) {
      console.error('Failed to load championships list:', err);
    }
  };

  useEffect(() => {
    fetchChampionshipsList();
    fetchData(selectedChampId);
  }, [selectedChampId]);

  const handleSelectChampionship = (champId: string) => {
    setSelectedChampId(champId);
  };

  const handleCreateChampionship = async (data: Partial<Championship>) => {
    const created = await api.createChampionship(data);
    await fetchChampionshipsList();
    if (created && created.id) {
      setSelectedChampId(created.id);
    }
    return created;
  };

  // Handlers
  const handleUpdateChampionship = async (updated: Partial<Championship>) => {
    const updatedChamp = await api.updateChampionship(selectedChampId, updated);
    setChampionship(updatedChamp);
  };

  const handleCreatePlayer = async (p: Partial<Player>) => {
    const newP = await api.createPlayer({ ...p, championshipId: selectedChampId });
    setPlayers([...players, newP]);
  };

  const handleUpdatePlayer = async (id: string, p: Partial<Player>) => {
    const updated = await api.updatePlayer(id, p);
    setPlayers(players.map((item) => (item.id === id ? updated : item)));
  };

  const handleDeletePlayer = async (id: string) => {
    await api.deletePlayer(id);
    setPlayers(players.filter((item) => item.id !== id));
  };

  const handleCreateTeam = async (t: Partial<Team>) => {
    const newT = await api.createTeam({ ...t, championshipId: selectedChampId });
    setTeams([...teams, newT]);
  };

  const handleUpdateTeam = async (id: string, t: Partial<Team>) => {
    const updated = await api.updateTeam(id, t);
    setTeams(teams.map((item) => (item.id === id ? updated : item)));
  };

  const handleDeleteTeam = async (id: string) => {
    await api.deleteTeam(id);
    setTeams(teams.filter((item) => item.id !== id));
  };

  const handleAssignPlayerToTeam = async (playerId: string, teamId: string | null) => {
    await handleUpdatePlayer(playerId, { teamId: teamId || undefined });
  };

  const handleExecuteDraft = async (data: any) => {
    const result = await api.executeDraft(data);
    setPlayers(result.players);
  };

  const handleCreateMatch = async (m: Partial<Match>) => {
    const newM = await api.createMatch({ ...m, championshipId: 'champ_1' });
    setMatches([...matches, newM]);
  };

  const handleUpdateMatch = async (id: string, data: Partial<Match>) => {
    const updated = await api.updateMatch(id, data);
    setMatches(matches.map((item) => (item.id === id ? updated : item)));
    if (selectedMatchForLive && selectedMatchForLive.id === id) {
      setSelectedMatchForLive(updated);
    }
  };

  const handleAddEvent = async (eventData: Partial<MatchEvent>) => {
    const newEv = await api.addMatchEvent(eventData);
    setEvents([...events, newEv]);

    // Refresh standings & stats automatically!
    fetchData();
  };

  const handleDeleteEvent = async (eventId: string) => {
    await api.deleteMatchEvent(eventId);
    setEvents(events.filter((e) => e.id !== eventId));
    fetchData();
  };

  const handleUpdatePayment = async (
    playerId: string,
    status: FinancialStatus,
    amount: number,
    method?: any
  ) => {
    await handleUpdatePlayer(playerId, { paymentStatus: status, amountPaid: amount, paymentMethod: method });
  };

  const handleOpenLiveOperator = (matchId: string) => {
    const m = matches.find((item) => item.id === matchId);
    if (m) {
      setSelectedMatchForLive(m);
      setActiveModule('live_control');
    }
  };

  if (!currentUser && !isGuestMode) {
    return (
      <AuthView
        onLoginSuccess={handleLoginSuccess}
        onContinueAsGuest={handleGuestContinue}
      />
    );
  }

  if (loading || !championship) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="font-extrabold text-sm uppercase tracking-widest text-emerald-400">
          Carregando FutGestão Pro...
        </p>
      </div>
    );
  }

  // Public View route override
  if (activeModule === 'public') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100 font-sans antialiased">
        <PublicView
          championship={championship}
          championships={championships}
          onSelectChampionship={handleSelectChampionship}
          standings={standings}
          matches={matches}
          players={players}
          teams={teams}
          onLoginClick={() => {
            if (currentUser) {
              handleSelectRole('ADMIN');
            } else {
              handleLogout();
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        championship={championship}
        userRole={userRole}
        currentUser={currentUser || undefined}
        onSelectRole={handleSelectRole}
        onSelectModule={setActiveModule}
        onNewMatch={handleNewMatch}
        onOpenChampionshipsHub={() => setIsChampHubOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Responsive Sidebar */}
        <Sidebar
          activeModule={activeModule}
          onSelectModule={setActiveModule}
          onOpenChampionshipsHub={() => setIsChampHubOpen(true)}
        />

        {/* Main Content Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-7xl mx-auto space-y-6">
            {activeModule === 'dashboard' && (
              <DashboardView
                championship={championship}
                teams={teams}
                players={players}
                matches={matches}
                standings={standings}
                onOpenLiveOperator={handleOpenLiveOperator}
              />
            )}

            {activeModule === 'championship' && (
              <ChampionshipView
                championship={championship}
                onUpdateChampionship={handleUpdateChampionship}
                userRole={userRole}
              />
            )}

            {activeModule === 'players' && (
              <PlayersView
                players={players}
                teams={teams}
                onCreatePlayer={handleCreatePlayer}
                onUpdatePlayer={handleUpdatePlayer}
                onDeletePlayer={handleDeletePlayer}
                userRole={userRole}
              />
            )}

            {activeModule === 'teams' && (
              <TeamsView
                teams={teams}
                players={players}
                standings={standings}
                onCreateTeam={handleCreateTeam}
                onUpdateTeam={handleUpdateTeam}
                onDeleteTeam={handleDeleteTeam}
                onAssignPlayerToTeam={handleAssignPlayerToTeam}
                userRole={userRole}
              />
            )}

            {activeModule === 'draft' && (
              <DraftView
                players={players}
                teams={teams}
                onExecuteDraft={handleExecuteDraft}
                userRole={userRole}
              />
            )}

            {activeModule === 'phases_standings' && (
              <PhasesAndStandingsView
                championship={championship}
                phases={phases}
                groups={groups}
                standings={standings}
                matches={matches}
                teams={teams}
              />
            )}

            {activeModule === 'matches' && (
              <MatchesView
                matches={matches}
                teams={teams}
                phases={phases}
                onCreateMatch={handleCreateMatch}
                onUpdateMatch={handleUpdateMatch}
                onOpenLiveOperator={handleOpenLiveOperator}
                userRole={userRole}
                autoOpenCreateModal={autoOpenCreateMatch}
                onCloseAutoOpen={() => setAutoOpenCreateMatch(false)}
              />
            )}

            {activeModule === 'live_control' && selectedMatchForLive && (
              <LiveOperatorView
                match={selectedMatchForLive}
                homeTeam={teams.find((t) => t.id === selectedMatchForLive.homeTeamId) || teams[0]}
                awayTeam={teams.find((t) => t.id === selectedMatchForLive.awayTeamId) || teams[1]}
                players={players}
                events={(events || []).filter((e) => e && e.matchId === selectedMatchForLive.id)}
                onUpdateMatch={handleUpdateMatch}
                onAddEvent={handleAddEvent}
                onDeleteEvent={handleDeleteEvent}
                userRole={userRole}
              />
            )}

            {activeModule === 'discipline' && (
              <DisciplineView
                players={players}
                suspensions={suspensions}
                teams={teams}
              />
            )}

            {activeModule === 'stats' && (
              <StatsView
                players={players}
                teams={teams}
                standings={standings}
              />
            )}

            {activeModule === 'financial' && (
              <FinancialView
                players={players}
                teams={teams}
                onUpdatePayment={handleUpdatePayment}
                userRole={userRole}
              />
            )}
          </div>
        </main>
      </div>

      <ChampionshipsHubModal
        isOpen={isChampHubOpen}
        onClose={() => setIsChampHubOpen(false)}
        championships={championships}
        selectedChampId={selectedChampId}
        onSelectChampionship={handleSelectChampionship}
        onCreateChampionship={handleCreateChampionship}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
    </div>
  );
}

export default App;
