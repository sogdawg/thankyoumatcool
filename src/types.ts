// src/types.ts

export interface PointercrateDemon {
    id: number;
    level_id: number;
    name: string;
    position: number;
    publisher: {
        id: number;
        name: string;
        banned: boolean;
    };
    requirement: number;
    verifier: {
        id: number;
        name: string;
        banned: boolean;
    };
    video: string | null;
}

export interface SimplifiedDemon {
    name: string;
    position: number;
    video: string | null;
    creator: string;
    levelID?: number;
    link?: string;
}

export interface RouletteState {
    playing: boolean;
    selectedLists: {
        main: boolean;
        extended: boolean;
        legacy: boolean;
    };
    demons: SimplifiedDemon[];
    current: SimplifiedDemon | null; // <-- CHANGED: Can now be a SimplifiedDemon object or null
    percent: number;
    percents: number[];
    completedDemonNames: string[]; // <-- ADDED: To track completed levels by name
    version?: number; // <-- ADDED: Optional version for save file compatibility
}
