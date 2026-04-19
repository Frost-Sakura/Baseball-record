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
  status: 'upcoming' | 'ongoing' | 'finished';
}

export class SmartScoreDB extends Dexie {
  players!: Table<Player>;
  teams!: Table<Team>;
  games!: Table<Game>;

  constructor() {
    super('SmartScoreDB');
    this.version(4).stores({ // 升級版本到 4
      players: '++id, name, number, teamId',
      teams: '++id, name, isPrimary',
      games: '++id, date, homeTeamId, awayTeamId, status'
    });
  }
}

export const db = new SmartScoreDB();
