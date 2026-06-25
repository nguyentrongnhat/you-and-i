import { GAME_DIFFICULTY_LEVEL, GAME_STATUSES } from '../enums';

export interface FindNumberGameDTO {
  id: string;
  player: string;
  totalNumbersToFind: number;
  difficultyLevel: GAME_DIFFICULTY_LEVEL;
  startTime: Date;
  endTime: Date;
  completionTime: number;
  gameStatus: GAME_STATUSES;
  lastSelectedNumber: number;
  elapsedTime: number;
  bonusTime: number;
  updateAt: Date;
}

export interface FindNumberGameBestRecordDTO {
  gameId: string;
  playerFullName: string;
  playerDisplayname: string;
  playerUsername: string;
  archivedTime: string;
  completionTime: number;
}

export interface FindNumberGameHistoryItem {
  startTime: string;
  endTime: string;
  completionTime: number;
  bonusTime: number;
}

export interface FindNumberGameHistory {
  history: FindNumberGameHistoryItem[];
  bestRecord: FindNumberGameBestRecordDTO;
  unfinishedGames: FindNumberGameDTO[];
  totalGamesPlayed: number;
}

export interface FindNumberGameHistory {
  history: FindNumberGameHistoryItem[];
  bestRecord: FindNumberGameBestRecordDTO;
}
