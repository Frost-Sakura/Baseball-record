import Dexie, { type Table } from 'dexie';

export interface Player {
  id?: number;
  name: string;
  number: string;
  position: string[];
  teamId?: number;
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
  players: number[]; // Player IDs
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
    this.version(1).stores({
      players: '++id, name, teamId',
      teams: '++id, name',
      games: '++id, date, homeTeamId, awayTeamId, status'
    });
  }
}

export const db = new SmartScoreDB();
