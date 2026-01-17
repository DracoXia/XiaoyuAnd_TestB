export enum AppPhase {
  LANDING = 'LANDING',
  IMMERSION = 'IMMERSION',
  ENDING = 'ENDING',
}

export interface ProductInfo {
  entryLabel: string;
  modal: {
    title: string;
    origin: {
      title: string;
      part1: string;
      highlight: string;
      part2: string;
      part3: string;
    };
    ingredients: {
      title: string;
      list: Array<{ name: string; desc: string }>;
    };
    reminder: {
      title: string;
      text: string;
    };
    footer: string;
  }
}

export interface StoryContent {
  quote: string;
  body: string[];
}

export interface AudioConfig {
  url: string;
  isPlaying: boolean;
  volume: number;
}