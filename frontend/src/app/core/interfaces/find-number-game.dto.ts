import { GAME_DIFFICULTY_LEVEL, GAME_STATUSES } from "../enums";

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