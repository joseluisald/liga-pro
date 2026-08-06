import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { store } from './server/store';
import { initDatabase } from './server/db';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize MySQL database (create tables & seed initial data)
  await initDatabase();

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  const apiRouter = express.Router();

  // Championships
  apiRouter.get('/championships', async (req, res) => {
    res.json(await store.getChampionships());
  });

  apiRouter.get('/championships/:id', async (req, res) => {
    const champ = await store.getChampionshipById(req.params.id);
    if (!champ) return res.status(404).json({ error: 'Campeonato não encontrado' });
    res.json(champ);
  });

  apiRouter.post('/championships', async (req, res) => {
    const created = await store.createChampionship(req.body);
    res.status(201).json(created);
  });

  apiRouter.put('/championships/:id', async (req, res) => {
    const updated = await store.updateChampionship(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Campeonato não encontrado' });
    res.json(updated);
  });

  // Teams
  apiRouter.get('/championships/:id/teams', async (req, res) => {
    res.json(await store.getTeams(req.params.id));
  });

  apiRouter.post('/teams', async (req, res) => {
    const created = await store.createTeam(req.body);
    res.status(201).json(created);
  });

  apiRouter.put('/teams/:id', async (req, res) => {
    const updated = await store.updateTeam(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Time não encontrado' });
    res.json(updated);
  });

  apiRouter.delete('/teams/:id', async (req, res) => {
    const success = await store.deleteTeam(req.params.id);
    if (!success) return res.status(404).json({ error: 'Time não encontrado' });
    res.json({ success: true });
  });

  // Players
  apiRouter.get('/championships/:id/players', async (req, res) => {
    res.json(await store.getPlayers(req.params.id));
  });

  apiRouter.post('/players', async (req, res) => {
    const created = await store.createPlayer(req.body);
    res.status(201).json(created);
  });

  apiRouter.put('/players/:id', async (req, res) => {
    const updated = await store.updatePlayer(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Jogador não encontrado' });
    res.json(updated);
  });

  apiRouter.delete('/players/:id', async (req, res) => {
    const success = await store.deletePlayer(req.params.id);
    if (!success) return res.status(404).json({ error: 'Jogador não encontrado' });
    res.json({ success: true });
  });

  // Draft
  apiRouter.post('/draft', async (req, res) => {
    const { championshipId, teamIds, playerIds, mode } = req.body;
    const result = await store.runDraft(championshipId, { teamIds, playerIds, mode });
    res.json(result);
  });

  // Phases & Groups
  apiRouter.get('/championships/:id/phases', async (req, res) => {
    res.json(await store.getPhases(req.params.id));
  });

  apiRouter.get('/phases/:id/groups', async (req, res) => {
    res.json(await store.getGroups(req.params.id));
  });

  // Matches
  apiRouter.get('/championships/:id/matches', async (req, res) => {
    res.json(await store.getMatches(req.params.id));
  });

  apiRouter.get('/matches/:id', async (req, res) => {
    const match = await store.getMatchById(req.params.id);
    if (!match) return res.status(404).json({ error: 'Partida não encontrada' });
    res.json(match);
  });

  apiRouter.post('/matches', async (req, res) => {
    const created = await store.createMatch(req.body);
    res.status(201).json(created);
  });

  apiRouter.put('/matches/:id', async (req, res) => {
    const updated = await store.updateMatch(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Partida não encontrada' });
    res.json(updated);
  });

  // Match Events
  apiRouter.get('/matches/:id/events', async (req, res) => {
    res.json(await store.getMatchEvents(req.params.id));
  });

  apiRouter.post('/matches/:id/events', async (req, res) => {
    const event = await store.addMatchEvent({ ...req.body, matchId: req.params.id });
    res.status(201).json(event);
  });

  apiRouter.delete('/events/:id', async (req, res) => {
    const success = await store.deleteMatchEvent(req.params.id);
    if (!success) return res.status(404).json({ error: 'Evento não encontrado' });
    res.json({ success: true });
  });

  // Standings
  apiRouter.get('/championships/:id/standings', async (req, res) => {
    const groupId = req.query.groupId as string | undefined;
    res.json(await store.getStandings(req.params.id, groupId));
  });

  // Suspensions
  apiRouter.get('/championships/:id/suspensions', async (req, res) => {
    res.json(await store.getSuspensions(req.params.id));
  });

  // Audit Logs
  apiRouter.get('/championships/:id/audit', async (req, res) => {
    res.json(await store.getAuditLogs(req.params.id));
  });

  // Notifications
  apiRouter.get('/notifications', async (req, res) => {
    res.json(await store.getNotifications());
  });

  apiRouter.put('/notifications/:id/read', async (req, res) => {
    await store.markNotificationAsRead(req.params.id);
    res.json({ success: true });
  });

  app.use('/api', apiRouter);


  // Serve Frontend with Vite
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FutGestão Pro] Server running on http://localhost:${PORT}`);
  });
}

startServer();
