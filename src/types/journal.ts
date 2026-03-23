export type Mood =
  | "happy"
  | "sad"
  | "angry"
  | "anxious"
  | "calm"
  | "tired"
  | "hopeful";

export interface JournalEntry {
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly mood: Mood;
  readonly createdAt: string; // ISO 8601
  readonly updatedAt: string; // ISO 8601
}

export interface QuoteData {
  readonly text: string;
  readonly language: "id" | "en";
  readonly author?: string;
}

export type AmbientSound = "rain" | "whitenoise" | "forest";

export interface AmbientPlayerState {
  readonly activeSound: AmbientSound | null;
  readonly volume: number; // 0.0 - 1.0
  readonly isPlaying: boolean;
}

export interface MascotState {
  readonly mood: string;
  readonly expression: string;
  readonly glowColor: string;
  readonly animation: string;
}
