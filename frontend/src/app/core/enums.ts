export const LAYOUT = {
	LAYOUT_1: 'layout1',
	LAYOUT_2: 'layout2',
	LAYOUT_3: 'layout3',
	EMPTY_LAYOUT: 'empty-layout'
};

export enum STORAGE_KEY {
	REDIRECT_URL = 'redirect_url',
	REFRESH_TOKEN = 'jom_781423554475_rft',
}

export enum MESSAGE_TYPE {
	SUCCESS = 'success',
	INFO = 'info',
	WARN = 'warn',
	ERROR = 'error',
	CONTRAST = 'contrast',
	SECONDARY = 'secondary'
}

export enum ROLE {
	SUPER_ADMIN = 'ROLE_SUPER_ADMIN',
	ADMIN = 'ROLE_ADMIN',
	USER = 'ROLE_USER',
	GUEST = 'ROLE_GUEST'
}

export enum BUTTON_STYLE {
	PRIMARY = 'primary',
	SECONDARY = 'secondary',
	SUCCESS = 'success',
	INFO = 'info',
	WARN = 'warn',
	HELP = 'help',
	DANGER = 'danger',
	CONTRAST = 'contrast'
}

export enum GAME_DIFFICULTY_LEVEL {
	NORMAL = 'NORMAL',
	HARD = 'HARD'
};

export enum GAME_STATUSES {
	NEW = 'NEW',
	PLAYING = 'PLAYING',
	PAUSED = 'PAUSED',
	DONE = 'DONE'
}