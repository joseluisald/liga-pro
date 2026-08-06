import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import {
  sampleChampionship,
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

dotenv.config();

const dbHost = process.env.MYSQL_HOST || 'localhost';
const dbPort = parseInt(process.env.MYSQL_PORT || '3306', 10);
const dbUser = process.env.MYSQL_USER || 'root';
const dbPassword = process.env.MYSQL_PASSWORD || 'root';
const dbName = process.env.MYSQL_DATABASE || 'futgestao_db';
const dbUrl = process.env.MYSQL_URL;

export let pool: mysql.Pool | null = null;
export let isMysqlConnected = false;

export async function initDatabase() {
  console.log(`[MySQL] Attempting connection to host=${dbHost}, port=${dbPort}, database=${dbName}...`);
  try {
    // 1. Ensure database exists if possible
    if (!dbUrl) {
      try {
        const rootConn = await mysql.createConnection({
          host: dbHost,
          port: dbPort,
          user: dbUser,
          password: dbPassword,
        });
        await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
        await rootConn.end();
      } catch (err: any) {
        console.warn(`[MySQL Warning] Could not check/create database \`${dbName}\`:`, err.message);
      }
    }

    // 2. Create connection pool
    pool = dbUrl
      ? mysql.createPool(dbUrl)
      : mysql.createPool({
          host: dbHost,
          port: dbPort,
          user: dbUser,
          password: dbPassword,
          database: dbName,
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
        });

    // Test connection
    await pool.query('SELECT 1');
    isMysqlConnected = true;
    console.log('[MySQL] Connected successfully to database!');

    // 3. Create Tables
    await createTables();

    // 4. Seed tables if empty
    await seedInitialData();

  } catch (error: any) {
    console.warn('[MySQL Warning] Could not connect to MySQL database:', error.message);
    console.warn('[MySQL Warning] Application will use in-memory fallback store.');
    isMysqlConnected = false;
  }
}

async function createTables() {
  if (!pool) return;

  const queries = [
    `CREATE TABLE IF NOT EXISTS championships (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255),
      description TEXT,
      startDate VARCHAR(50),
      endDate VARCHAR(50),
      location VARCHAR(255),
      address TEXT,
      city VARCHAR(100),
      state VARCHAR(50),
      organizerName VARCHAR(255),
      organizerPhone VARCHAR(50),
      organizerEmail VARCHAR(255),
      logoUrl TEXT,
      status VARCHAR(50),
      rules JSON,
      createdAt VARCHAR(100)
    );`,

    `CREATE TABLE IF NOT EXISTS teams (
      id VARCHAR(255) PRIMARY KEY,
      championshipId VARCHAR(255),
      name VARCHAR(255) NOT NULL,
      shortName VARCHAR(50),
      primaryColor VARCHAR(50),
      secondaryColor VARCHAR(50),
      coachName VARCHAR(255),
      managerName VARCHAR(255),
      logoUrl TEXT,
      captainPlayerId VARCHAR(255)
    );`,

    `CREATE TABLE IF NOT EXISTS players (
      id VARCHAR(255) PRIMARY KEY,
      championshipId VARCHAR(255),
      teamId VARCHAR(255),
      fullName VARCHAR(255) NOT NULL,
      displayName VARCHAR(255),
      nickname VARCHAR(255),
      birthDate VARCHAR(50),
      cpf VARCHAR(50),
      phone VARCHAR(50),
      email VARCHAR(255),
      position VARCHAR(50),
      shirtNumber INT,
      status VARCHAR(50),
      paymentStatus VARCHAR(50),
      amountPaid DECIMAL(10,2),
      paymentMethod VARCHAR(50),
      paymentDate VARCHAR(50),
      notes TEXT,
      skillLevel INT,
      photoUrl TEXT,
      stats JSON
    );`,

    `CREATE TABLE IF NOT EXISTS phases (
      id VARCHAR(255) PRIMARY KEY,
      championshipId VARCHAR(255),
      name VARCHAR(255),
      type VARCHAR(50),
      \`order\` INT,
      completed BOOLEAN,
      qualifiedPerGroup INT
    );`,

    `CREATE TABLE IF NOT EXISTS \`groups\` (
      id VARCHAR(255) PRIMARY KEY,
      phaseId VARCHAR(255),
      name VARCHAR(255),
      teamIds JSON
    );`,

    `CREATE TABLE IF NOT EXISTS matches (
      id VARCHAR(255) PRIMARY KEY,
      championshipId VARCHAR(255),
      phaseId VARCHAR(255),
      groupId VARCHAR(255),
      roundNumber INT,
      homeTeamId VARCHAR(255),
      awayTeamId VARCHAR(255),
      homeScore INT,
      awayScore INT,
      date VARCHAR(50),
      time VARCHAR(50),
      location VARCHAR(255),
      referee VARCHAR(255),
      status VARCHAR(50),
      currentMinute INT,
      halfTime VARCHAR(50),
      mvpPlayerId VARCHAR(255)
    );`,

    `CREATE TABLE IF NOT EXISTS match_events (
      id VARCHAR(255) PRIMARY KEY,
      matchId VARCHAR(255),
      teamId VARCHAR(255),
      type VARCHAR(50),
      playerId VARCHAR(255),
      assistantPlayerId VARCHAR(255),
      playerOutId VARCHAR(255),
      playerInId VARCHAR(255),
      minute INT,
      reason TEXT,
      createdAt VARCHAR(100)
    );`,

    `CREATE TABLE IF NOT EXISTS suspensions (
      id VARCHAR(255) PRIMARY KEY,
      championshipId VARCHAR(255),
      playerId VARCHAR(255),
      playerName VARCHAR(255),
      teamName VARCHAR(255),
      matchId VARCHAR(255),
      gamesCount INT,
      gamesServed INT,
      reason TEXT,
      active BOOLEAN,
      createdAt VARCHAR(100)
    );`,

    `CREATE TABLE IF NOT EXISTS audit_logs (
      id VARCHAR(255) PRIMARY KEY,
      championshipId VARCHAR(255),
      userId VARCHAR(255),
      userName VARCHAR(255),
      action VARCHAR(100),
      entity VARCHAR(100),
      entityId VARCHAR(255),
      details TEXT,
      timestamp VARCHAR(100)
    );`,

    `CREATE TABLE IF NOT EXISTS notifications (
      id VARCHAR(255) PRIMARY KEY,
      title VARCHAR(255),
      message TEXT,
      timestamp VARCHAR(100),
      \`read\` BOOLEAN,
      type VARCHAR(50)
    );`,

    `CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL,
      avatarUrl TEXT,
      createdAt VARCHAR(100)
    );`
  ];

  for (const q of queries) {
    await pool.query(q);
  }
  console.log('[MySQL] Database tables checked/created successfully.');
}

async function seedInitialData() {
  if (!pool) return;

  const [rows]: any = await pool.query('SELECT COUNT(*) as cnt FROM championships');
  if (rows && rows[0] && rows[0].cnt > 0) {
    console.log('[MySQL] Data already exists. Skipping initial seed.');
    return;
  }

  console.log('[MySQL] Seeding initial mock data into database...');

  // 1. Championships
  const c = sampleChampionship;
  await pool.query(
    `INSERT INTO championships (id, name, slug, description, startDate, endDate, location, address, city, state, organizerName, organizerPhone, organizerEmail, logoUrl, status, rules, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      c.id, c.name, c.slug, c.description, c.startDate, c.endDate, c.location,
      c.address, c.city, c.state, c.organizerName, c.organizerPhone, c.organizerEmail,
      c.logoUrl, c.status, JSON.stringify(c.rules), c.createdAt
    ]
  );

  // 2. Teams
  for (const t of sampleTeams) {
    await pool.query(
      `INSERT INTO teams (id, championshipId, name, shortName, primaryColor, secondaryColor, coachName, managerName, logoUrl, captainPlayerId)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [t.id, t.championshipId, t.name, t.shortName, t.primaryColor, t.secondaryColor, t.coachName || '', t.managerName || '', t.logoUrl || '', t.captainPlayerId || null]
    );
  }

  // 3. Players
  for (const p of samplePlayers) {
    await pool.query(
      `INSERT INTO players (id, championshipId, teamId, fullName, displayName, nickname, birthDate, cpf, phone, email, position, shirtNumber, status, paymentStatus, amountPaid, paymentMethod, paymentDate, notes, skillLevel, photoUrl, stats)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.id, p.championshipId, p.teamId || null, p.fullName, p.displayName, p.nickname || '',
        p.birthDate || '', p.cpf || '', p.phone || '', p.email || '', p.position,
        p.shirtNumber, p.status, p.paymentStatus, p.amountPaid || 0, p.paymentMethod || null,
        p.paymentDate || null, p.notes || '', p.skillLevel || 3, p.photoUrl || '', JSON.stringify(p.stats)
      ]
    );
  }

  // 4. Phases
  for (const ph of samplePhases) {
    await pool.query(
      `INSERT INTO phases (id, championshipId, name, type, \`order\`, completed, qualifiedPerGroup)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [ph.id, ph.championshipId, ph.name, ph.type, ph.order, ph.completed, ph.qualifiedPerGroup]
    );
  }

  // 5. Groups
  for (const g of sampleGroups) {
    await pool.query(
      `INSERT INTO \`groups\` (id, phaseId, name, teamIds)
       VALUES (?, ?, ?, ?)`,
      [g.id, g.phaseId, g.name, JSON.stringify(g.teamIds)]
    );
  }

  // 6. Matches
  for (const m of sampleMatches) {
    await pool.query(
      `INSERT INTO matches (id, championshipId, phaseId, groupId, roundNumber, homeTeamId, awayTeamId, homeScore, awayScore, date, time, location, referee, status, currentMinute, halfTime, mvpPlayerId)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        m.id, m.championshipId, m.phaseId, m.groupId || null, m.roundNumber,
        m.homeTeamId, m.awayTeamId, m.homeScore, m.awayScore, m.date, m.time,
        m.location, m.referee, m.status, m.currentMinute || 0, m.halfTime || '1ST', m.mvpPlayerId || null
      ]
    );
  }

  // 7. Events
  for (const ev of sampleEvents) {
    await pool.query(
      `INSERT INTO match_events (id, matchId, teamId, type, playerId, assistantPlayerId, playerOutId, playerInId, minute, reason, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ev.id, ev.matchId, ev.teamId, ev.type, ev.playerId, ev.assistantPlayerId || null,
        ev.playerOutId || null, ev.playerInId || null, ev.minute, ev.reason || '', ev.createdAt || new Date().toISOString()
      ]
    );
  }

  // 8. Suspensions
  for (const s of sampleSuspensions) {
    await pool.query(
      `INSERT INTO suspensions (id, championshipId, playerId, playerName, teamName, matchId, gamesCount, gamesServed, reason, active, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        s.id, s.championshipId, s.playerId, s.playerName, s.teamName, s.matchId || '',
        s.gamesCount, s.gamesServed, s.reason, s.active, s.createdAt || new Date().toISOString()
      ]
    );
  }

  // 9. Audit Logs
  for (const a of sampleAuditLogs) {
    await pool.query(
      `INSERT INTO audit_logs (id, championshipId, userId, userName, action, entity, entityId, details, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        a.id, a.championshipId, a.userId, a.userName, a.action, a.entity, a.entityId, a.details, a.timestamp
      ]
    );
  }

  // 10. Notifications
  for (const n of sampleNotifications) {
    await pool.query(
      `INSERT INTO notifications (id, title, message, timestamp, \`read\`, type)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        n.id, n.title, n.message, n.timestamp, n.read, n.type
      ]
    );
  }

  // 11. Initial Admin User
  await pool.query(
    `INSERT IGNORE INTO users (id, name, email, password, role, avatarUrl, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      'usr_admin',
      'Organizador Geral',
      'contato@torneio.com.br',
      '123456',
      'ADMIN',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      new Date().toISOString()
    ]
  );

  console.log('[MySQL] Initial seed completed successfully!');
}
