export type UserRole = 'ADMIN' | 'OPERATOR' | 'VIEWER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'principal', name: 'Principal', description: 'Categoria Principal Livre' },
  { id: 'veteranos', name: 'Veteranos', description: 'Categoria Veteranos (35+)' },
  { id: 'feminino', name: 'Feminino', description: 'Categoria Feminina Livre' },
];

export type ChampionshipStatus = 
  | 'PLANNING' 
  | 'REGISTRATION_OPEN' 
  | 'REGISTRATION_CLOSED' 
  | 'IN_PROGRESS' 
  | 'FINISHED' 
  | 'CANCELLED';

export type TiebreakerCriterion = 
  | 'POINTS' 
  | 'VICTORIES' 
  | 'GOAL_DIFFERENCE' 
  | 'GOALS_FOR' 
  | 'DIRECT_HEAD_TO_HEAD' 
  | 'FEWEST_CARDS' 
  | 'DRAW';

export interface ChampionshipRule {
  pointsForWin: number;
  pointsForDraw: number;
  pointsForLoss: number;
  tiebreakers: TiebreakerCriterion[];
  substitutionsAllowed: number;
  matchDurationMinutes: number;
  startersCount: number;
  maxBenchCount: number;
  yellowCardsForSuspension: number;
  directRedCardSuspensionGames: number;
  registrationFeeAmount: number;
  woGoalsGiven: number;
}

export interface Championship {
  id: string;
  name: string;
  slug: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  address: string;
  city: string;
  state: string;
  organizerName: string;
  organizerPhone: string;
  organizerEmail: string;
  logoUrl?: string;
  rulesPdfUrl?: string;
  status: ChampionshipStatus;
  rules: ChampionshipRule;
  categories?: Category[];
  archived?: boolean;
  createdAt: string;
}

export type PlayerPosition = 
  | 'GOALKEEPER' 
  | 'DEFENDER' 
  | 'RIGHT_BACK' 
  | 'LEFT_BACK' 
  | 'DEF_MIDFIELDER' 
  | 'MIDFIELDER' 
  | 'ATT_MIDFIELDER' 
  | 'WING' 
  | 'FORWARD';

export type FinancialStatus = 'PAID' | 'UNPAID' | 'PARTIAL' | 'EXEMPT';

export interface PlayerStats {
  matchesPlayed: number;
  starts: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  highlights: number;
  mvpCount: number;
  minutesPlayed: number;
  suspensionsServed: number;
}

export interface Player {
  id: string;
  championshipId: string;
  categoryId?: string;
  teamId?: string | null;
  fullName: string;
  displayName: string;
  nickname?: string;
  photoUrl?: string;
  birthDate?: string;
  cpf?: string;
  phone?: string;
  email?: string;
  position: PlayerPosition;
  shirtNumber?: number;
  status: 'ACTIVE' | 'INJURED' | 'SUSPENDED' | 'INACTIVE';
  paymentStatus: FinancialStatus;
  amountPaid: number;
  paymentDate?: string;
  paymentMethod?: 'PIX' | 'CASH' | 'CARD' | 'TRANSFER';
  notes?: string;
  skillLevel?: number; // 1-5 rating for draft balancing
  stats: PlayerStats;
}

export interface Team {
  id: string;
  championshipId: string;
  categoryId?: string;
  name: string;
  shortName: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  coachName?: string;
  captainPlayerId?: string;
  managerName?: string;
  notes?: string;
}

export type PhaseType = 'GROUPS' | 'SINGLE_ROUND' | 'ROUND_ROBIN' | 'KNOCKOUT';

export interface Phase {
  id: string;
  championshipId: string;
  categoryId?: string;
  name: string;
  type: PhaseType;
  order: number;
  groupsCount?: number;
  teamsPerGroup?: number;
  qualifiedPerGroup?: number;
  roundsCount?: number;
  isTwoLegged?: boolean;
  completed: boolean;
}

export interface Group {
  id: string;
  phaseId: string;
  categoryId?: string;
  name: string;
  teamIds: string[];
}

export interface Round {
  id: string;
  phaseId: string;
  number: number;
  name: string;
}

export type MatchStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'FINISHED' | 'POSTPONED' | 'CANCELLED';

export interface Match {
  id: string;
  championshipId: string;
  categoryId?: string;
  phaseId: string;
  groupId?: string;
  roundId?: string;
  roundNumber?: number;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  homePenaltyScore?: number;
  awayPenaltyScore?: number;
  date: string;
  time: string;
  location: string;
  field?: string;
  referee?: string;
  status: MatchStatus;
  currentMinute?: number;
  halfTime?: '1ST' | 'HALF' | '2ND' | 'FINISHED';
  isWo?: boolean;
  woWinnerTeamId?: string;
  mvpPlayerId?: string;
  notes?: string;
}

export interface MatchLineup {
  matchId: string;
  teamId: string;
  starterPlayerIds: string[];
  benchPlayerIds: string[];
  captainPlayerId?: string;
  goalkeeperPlayerId?: string;
}

export type EventType = 
  | 'GOAL' 
  | 'OWN_GOAL' 
  | 'PENALTY_GOAL' 
  | 'PENALTY_MISSED' 
  | 'YELLOW_CARD' 
  | 'RED_CARD' 
  | 'SUBSTITUTION' 
  | 'HIGHLIGHT' 
  | 'INJURY' 
  | 'WO';

export interface MatchEvent {
  id: string;
  matchId: string;
  teamId: string;
  type: EventType;
  playerId: string;
  assistantPlayerId?: string; // For assists
  playerOutId?: string; // For substitution
  playerInId?: string; // For substitution
  minute: number;
  period?: '1ST_HALF' | '2ND_HALF' | 'EXTRA_TIME' | 'PENALTIES';
  reason?: string;
  createdAt: string;
}

export interface StandingRow {
  position: number;
  teamId: string;
  teamName: string;
  teamShortName: string;
  logoUrl?: string;
  primaryColor: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  yellowCards: number;
  redCards: number;
  recentForm: ('W' | 'D' | 'L')[];
}

export interface Suspension {
  id: string;
  championshipId: string;
  playerId: string;
  playerName: string;
  teamName: string;
  matchId: string;
  gamesCount: number;
  gamesServed: number;
  reason: string;
  active: boolean;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  championshipId: string;
  playerId: string;
  playerName: string;
  amount: number;
  date: string;
  method: 'PIX' | 'CASH' | 'CARD' | 'TRANSFER';
  status: FinancialStatus;
  note?: string;
}

export interface AuditLog {
  id: string;
  championshipId: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId?: string;
  details: string;
  previousData?: string;
  newData?: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS';
  timestamp: string;
  read: boolean;
  link?: string;
}
