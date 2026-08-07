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
      categoryId VARCHAR(255),
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
      categoryId VARCHAR(255),
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
      categoryId VARCHAR(255),
      name VARCHAR(255),
      type VARCHAR(50),
      \`order\` INT,
      completed BOOLEAN,
      qualifiedPerGroup INT
    );`,

    `CREATE TABLE IF NOT EXISTS \`groups\` (
      id VARCHAR(255) PRIMARY KEY,
      phaseId VARCHAR(255),
      categoryId VARCHAR(255),
      name VARCHAR(255),
      teamIds JSON
    );`,

    `CREATE TABLE IF NOT EXISTS matches (
      id VARCHAR(255) PRIMARY KEY,
      championshipId VARCHAR(255),
      categoryId VARCHAR(255),
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

  const [rows]: any = await pool.query('SELECT COUNT(*) as cnt FROM users');
  if (rows && rows[0] && rows[0].cnt > 0) {
    console.log('[MySQL] Users already exist. Skipping seed.');
    return;
  }

  console.log('[MySQL] Seeding initial admin user into database...');

  // 1. Initial Admin User
  await pool.query(
    `INSERT IGNORE INTO users (id, name, email, password, role, avatarUrl, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      'usr_admin',
      'Organizador Geral',
      'contato@torneio.com.br',
      '123',
      'ADMIN',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      new Date().toISOString()
    ]
  );
  console.log('[MySQL] Initial seed completed successfully!');
}
