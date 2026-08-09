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
import { CategorySelectorBar } from './components/categories/CategorySelectorBar';

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
  User,
  Category,
  DEFAULT_CATEGORIES
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
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
  const [selectedChampId, setSelectedChampId] = useState<string>('');
  const [isChampHubOpen, setIsChampHubOpen] = useState<boolean>(false);

  const [championship, setChampionship] = useState<Championship | null>(null);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');

  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [suspensions, setSuspensions] = useState<Suspension[]>([]);
  const [events, setEvents] = useState<MatchEvent[]>([]);

  const handleCreateCategory = (catData: Partial<Category>) => {
    if (!catData.id || !catData.name) return;
    const newCat: Category = {
      id: catData.id,
      name: catData.name,
      description: catData.description || '',
    };
    setCategories((prev) => {
      if (prev.some((c) => c.id === newCat.id)) return prev;
      return [...prev, newCat];
    });
  };

  const filteredTeams = teams.filter(
    (t) => selectedCategoryId === 'ALL' || (t.categoryId || 'principal') === selectedCategoryId
  );
  const filteredPlayers = players.filter(
    (p) => selectedCategoryId === 'ALL' || (p.categoryId || 'principal') === selectedCategoryId
  );
  const filteredMatches = matches.filter(
    (m) => selectedCategoryId === 'ALL' || (m.categoryId || 'principal') === selectedCategoryId
  );
  const filteredStandings = standings.filter(
    (s) => selectedCategoryId === 'ALL' || (s.team?.categoryId || 'principal') === selectedCategoryId
  );
  const filteredPhases = phases.filter(
    (p) => selectedCategoryId === 'ALL' || (p.categoryId || 'principal') === selectedCategoryId
  );
  const filteredGroups = groups.filter(
    (g) => selectedCategoryId === 'ALL' || (g.categoryId || 'principal') === selectedCategoryId
  );

  const [loading, setLoading] = useState(true);

  // Initial Data Fetch
  const fetchData = async (champId: string = selectedChampId, isBackground: boolean = false) => {
    if (!champId) {
      setChampionship(null);
      setTeams([]);
      setPlayers([]);
      setPhases([]);
      setGroups([]);
      setMatches([]);
      setStandings([]);
      setSuspensions([]);
      setEvents([]);
      setLoading(false);
      return;
    }
    try {
      if (!isBackground) setLoading(true);
      const data = await api.getChampionshipData(champId);
      setChampionship(data.championship || null);
      setTeams(Array.isArray(data.teams) ? data.teams : []);
      setPlayers(Array.isArray(data.players) ? data.players : []);
      setPhases(Array.isArray(data.phases) ? data.phases : []);
      setGroups(Array.isArray(data.groups) ? data.groups : []);
      const fetchedMatches = Array.isArray(data.matches) ? data.matches : [];
      setMatches(fetchedMatches);
      setStandings(Array.isArray(data.standings) ? data.standings : []);
      setSuspensions(Array.isArray(data.suspensions) ? data.suspensions : []);
      setEvents(Array.isArray(data.events) ? data.events : []);

      // Synchronize live control match state if open
      if (selectedMatchForLive) {
        const liveMatch = fetchedMatches.find((m) => m.id === selectedMatchForLive.id);
        if (liveMatch) {
          setSelectedMatchForLive(liveMatch);
        }
      }
    } catch (err) {
      console.error('Failed to load championship data:', err);
      setChampionship(null);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const fetchChampionshipsList = async () => {
    try {
      const list = await api.fetchChampionships();
      if (Array.isArray(list) && list.length > 0) {
        setChampionships(list);
        setSelectedChampId((prev) => {
          if (prev && list.some((c) => c.id === prev)) return prev;
          return list[0].id;
        });
      } else {
        setChampionships([]);
        setSelectedChampId('');
        setChampionship(null);
        setTeams([]);
        setPlayers([]);
        setPhases([]);
        setGroups([]);
        setMatches([]);
        setStandings([]);
        setSuspensions([]);
        setEvents([]);
      }
    } catch (err) {
      console.error('Failed to load championships list:', err);
      setChampionships([]);
      setSelectedChampId('');
      setChampionship(null);
    }
  };

  useEffect(() => {
    fetchChampionshipsList();
  }, []);

  useEffect(() => {
    if (selectedChampId) {
      fetchData(selectedChampId);
    } else {
      setChampionship(null);
      setTeams([]);
      setPlayers([]);
      setPhases([]);
      setGroups([]);
      setMatches([]);
      setStandings([]);
      setSuspensions([]);
      setEvents([]);
      setLoading(false);
    }
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
    await fetchData(selectedChampId);
  };

  const handleCreatePlayer = async (p: Partial<Player>) => {
    const newP = await api.createPlayer({ ...p, championshipId: selectedChampId });
    if (newP) {
      setPlayers((prev) => [...prev, newP]);
      await fetchData(selectedChampId);
    }
  };

  const handleUpdatePlayer = async (id: string, p: Partial<Player>) => {
    const updated = await api.updatePlayer(id, p);
    if (updated) {
      setPlayers((prev) => prev.map((item) => (item.id === id ? updated : item)));
      await fetchData(selectedChampId);
    }
  };

  const handleDeletePlayer = async (id: string) => {
    await api.deletePlayer(id);
    setPlayers((prev) => prev.filter((item) => item.id !== id));
    await fetchData(selectedChampId);
  };

  const handleCreateTeam = async (t: Partial<Team>) => {
    const newT = await api.createTeam({ ...t, championshipId: selectedChampId });
    if (newT) {
      setTeams((prev) => [...prev, newT]);
      await fetchData(selectedChampId);
    }
  };

  const handleUpdateTeam = async (id: string, t: Partial<Team>) => {
    const updated = await api.updateTeam(id, t);
    if (updated) {
      setTeams((prev) => prev.map((item) => (item.id === id ? updated : item)));
      await fetchData(selectedChampId);
    }
  };

  const handleDeleteTeam = async (id: string) => {
    await api.deleteTeam(id);
    setTeams((prev) => prev.filter((item) => item.id !== id));
    await fetchData(selectedChampId);
  };

  const handleAssignPlayerToTeam = async (playerId: string, teamId: string | null) => {
    await handleUpdatePlayer(playerId, { teamId: teamId || undefined });
  };

  const handleExecuteDraft = async (data: any) => {
    const result = await api.executeDraft({ ...data, championshipId: selectedChampId });
    if (result && result.players) {
      setPlayers(result.players);
      await fetchData(selectedChampId);
    }
  };

  const handleGenerateFixtures = async (options: any) => {
    const res = await api.generateFixtures(selectedChampId, options);
    await fetchData(selectedChampId);
    return res;
  };

  const handleCreateMatch = async (m: Partial<Match>) => {
    const newM = await api.createMatch({ ...m, championshipId: selectedChampId });
    if (newM) {
      setMatches((prev) => [...prev, newM]);
      await fetchData(selectedChampId);
    }
  };

  const handleUpdateMatch = async (id: string, data: Partial<Match>) => {
    const updated = await api.updateMatch(id, data);
    if (updated) {
      setMatches((prev) => prev.map((item) => (item.id === id ? updated : item)));
      if (selectedMatchForLive && selectedMatchForLive.id === id) {
        setSelectedMatchForLive(updated);
      }
      await fetchData(selectedChampId);
    }
  };

  const handleAddEvent = async (eventData: Partial<MatchEvent>) => {
    try {
      const newEv = await api.addMatchEvent(eventData);
      if (newEv) {
        setEvents((prev) => [newEv, ...prev]);

        // Optimistically update score if goal event
        if (newEv.matchId) {
          setMatches((prevMatches) =>
            prevMatches.map((m) => {
              if (m.id !== newEv.matchId) return m;
              let homeScore = m.homeScore || 0;
              let awayScore = m.awayScore || 0;
              if (newEv.type === 'GOAL' || newEv.type === 'PENALTY_GOAL') {
                if (newEv.teamId === m.homeTeamId) homeScore += 1;
                else awayScore += 1;
              } else if (newEv.type === 'OWN_GOAL') {
                if (newEv.teamId === m.homeTeamId) awayScore += 1;
                else homeScore += 1;
              }
              const updated = { ...m, homeScore, awayScore };
              if (selectedMatchForLive && selectedMatchForLive.id === m.id) {
                setSelectedMatchForLive(updated);
              }
              return updated;
            })
          );
        }
      }
      // Refresh standings, stats & data in background
      await fetchData(selectedChampId, true);
    } catch (err) {
      console.error('Error adding match event:', err);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const evToDelete = events.find((e) => e.id === eventId);
      await api.deleteMatchEvent(eventId);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));

      if (evToDelete && evToDelete.matchId) {
        setMatches((prevMatches) =>
          prevMatches.map((m) => {
            if (m.id !== evToDelete.matchId) return m;
            let homeScore = m.homeScore || 0;
            let awayScore = m.awayScore || 0;
            if (evToDelete.type === 'GOAL' || evToDelete.type === 'PENALTY_GOAL') {
              if (evToDelete.teamId === m.homeTeamId && homeScore > 0) homeScore -= 1;
              if (evToDelete.teamId === m.awayTeamId && awayScore > 0) awayScore -= 1;
            } else if (evToDelete.type === 'OWN_GOAL') {
              if (evToDelete.teamId === m.homeTeamId && awayScore > 0) awayScore -= 1;
              if (evToDelete.teamId === m.awayTeamId && homeScore > 0) homeScore -= 1;
            }
            const updated = { ...m, homeScore, awayScore };
            if (selectedMatchForLive && selectedMatchForLive.id === m.id) {
              setSelectedMatchForLive(updated);
            }
            return updated;
          })
        );
      }
      await fetchData(selectedChampId, true);
    } catch (err) {
      console.error('Error deleting match event:', err);
    }
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
    <div className="h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-row font-sans antialiased selection:bg-emerald-500 selection:text-slate-950">
      {/* Responsive Sidebar extends all the way to top */}
      <Sidebar
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        onOpenChampionshipsHub={() => setIsChampHubOpen(true)}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        userRole={userRole}
        currentUser={currentUser}
        onSelectRole={handleSelectRole}
        onLogout={handleLogout}
        championshipName={championship?.name || 'LigaPro'}
        liveMatchesCount={matches.filter((m) => m.status === 'IN_PROGRESS').length}
        suspendedCount={suspensions.length}
      />

      {/* Main Right Area containing Top Navbar and Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Navbar
          championship={championship}
          userRole={userRole}
          currentUser={currentUser || undefined}
          onSelectRole={handleSelectRole}
          onSelectModule={setActiveModule}
          onNewMatch={handleNewMatch}
          onOpenChampionshipsHub={() => setIsChampHubOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* Category Selector Bar */}
        <CategorySelectorBar
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          onCreateCategory={handleCreateCategory}
          userRole={userRole}
        />

        {/* Main Content Workspace - bottom padding pb-20 on mobile for Bottom Navigation Bar */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 pb-24 md:pb-6 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-7xl mx-auto space-y-6">
            {activeModule === 'dashboard' && (
              <DashboardView
                championship={championship}
                teams={filteredTeams}
                players={filteredPlayers}
                matches={filteredMatches}
                standings={filteredStandings}
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
                players={filteredPlayers}
                teams={teams}
                categories={categories}
                onCreatePlayer={handleCreatePlayer}
                onUpdatePlayer={handleUpdatePlayer}
                onDeletePlayer={handleDeletePlayer}
                userRole={userRole}
              />
            )}

            {activeModule === 'teams' && (
              <TeamsView
                teams={filteredTeams}
                players={players}
                standings={standings}
                categories={categories}
                onCreateTeam={handleCreateTeam}
                onUpdateTeam={handleUpdateTeam}
                onDeleteTeam={handleDeleteTeam}
                onAssignPlayerToTeam={handleAssignPlayerToTeam}
                userRole={userRole}
              />
            )}

            {activeModule === 'draft' && (
              <DraftView
                players={filteredPlayers}
                teams={filteredTeams}
                onExecuteDraft={handleExecuteDraft}
                onGenerateFixtures={handleGenerateFixtures}
                userRole={userRole}
              />
            )}

            {activeModule === 'phases_standings' && (
              <PhasesAndStandingsView
                championship={championship}
                phases={filteredPhases}
                groups={filteredGroups}
                standings={filteredStandings}
                matches={filteredMatches}
                teams={filteredTeams}
                onGenerateFixtures={handleGenerateFixtures}
                userRole={userRole}
              />
            )}

            {activeModule === 'matches' && (
              <MatchesView
                matches={filteredMatches}
                teams={teams}
                phases={phases}
                categories={categories}
                onCreateMatch={handleCreateMatch}
                onUpdateMatch={handleUpdateMatch}
                onOpenLiveOperator={handleOpenLiveOperator}
                onGenerateFixtures={handleGenerateFixtures}
                userRole={userRole}
                autoOpenCreateModal={autoOpenCreateMatch}
                onCloseAutoOpen={() => setAutoOpenCreateMatch(false)}
              />
            )}

            {activeModule === 'live_control' && selectedMatchForLive && (() => {
              const liveMatch = matches.find((m) => m.id === selectedMatchForLive.id) || selectedMatchForLive;
              return (
                <LiveOperatorView
                  match={liveMatch}
                  homeTeam={teams.find((t) => t.id === liveMatch.homeTeamId) || teams[0]}
                  awayTeam={teams.find((t) => t.id === liveMatch.awayTeamId) || teams[1]}
                  players={players}
                  events={(events || []).filter((e) => e && e.matchId === liveMatch.id)}
                  onUpdateMatch={handleUpdateMatch}
                  onAddEvent={handleAddEvent}
                  onDeleteEvent={handleDeleteEvent}
                  userRole={userRole}
                  matchDurationMinutes={championship?.rules?.matchDurationMinutes || 40}
                />
              );
            })()}

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
