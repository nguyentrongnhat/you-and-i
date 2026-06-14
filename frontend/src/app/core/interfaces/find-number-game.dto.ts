import { GAME_DIFFICULTY_LEVEL, GAME_STATUSES } from "../enums";

export interface FindNumberGameDTO {
	id: string;

	player: string;

	totalNumbersToFind: number;

	difficultyLevel: GAME_DIFFICULTY_LEVEL;

	startTime: Date;

	endTime: string;

	completionTime: string;

	gameStatus: GAME_STATUSES;

	lastSelectedNumber: number;

	elapsedTime: string;

	bonusTime: number;
}