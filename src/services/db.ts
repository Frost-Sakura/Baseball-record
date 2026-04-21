import Dexie, { type Table } from 'dexie';

export interface Player {
  id?: number;
  name: string;
  number: string;
  position: string[];
  teamId: number;
  
  // 詳細資訊 (選填)
  details?: {
    battingSide: 'L' | 'R' | 'S';
    throwingSide: 'L' | 'R';
    birthDate?: string;
    height?: number;
    weight?: number;
    notes?: string;
  };

  // 統計數據
  stats: {
    avg: number;
    hr: number;
    rbi: number;
    era: number;
  };
}

export interface Team {
  id?: number;
  name: string;
  coach: string;
  isPrimary: boolean; // 標記是否為「我的球隊」
}

export interface Game {
  id?: number;
  date: string;
  homeTeamId: number;
  awayTeamId: number;
  score: {
    home: number;
    away: number;
  };
  status: 'upcoming' | 'ongoing' | 'finished' | 'suspended';
  // 先發名單 (球員 ID 陣列)
  lineups?: {
    home: number[];
    away: number[];
    homePitcher?: number;
    awayPitcher?: number;
  };
  settings?: {
    innings: number; // 預設 9 局或 7 局
    mercyRule?: number; // 扣殺規則
  };
}

// 賽事動作紀錄
export interface GameLog {
  id?: number;
  gameId: number;
  inning: number;
  half: 'top' | 'bottom';
  batterId: number;
  pitcherId: number;
  actionType: string;
  result: string;
  description?: string;
  timestamp: number;
  [key: string]: any; // Allow metadata
}

export class SmartScoreDB extends Dexie {
  players!: Table<Player>;
  teams!: Table<Team>;
  games!: Table<Game>;
  gameLogs!: Table<GameLog>;

  constructor() {
    super('SmartScoreDB');
    this.version(5).stores({ // 升級版本到 5
      players: '++id, name, number, teamId',
      teams: '++id, name, isPrimary',
      games: '++id, date, homeTeamId, awayTeamId, status',
      gameLogs: '++id, gameId, inning, batterId'
    });
  }
}

export const db = new SmartScoreDB();
