export enum AppPhase {
  LANDING = 'LANDING',     // Entry point (permission request)
  RITUAL = 'RITUAL',       // Pouring tea interaction
  SIGN = 'SIGN',           // AI generated daily sign
  IMMERSION = 'IMMERSION', // 10 min meditation
  TREEHOLE = 'TREEHOLE',   // Mood input & AI Echo
  DASHBOARD = 'DASHBOARD', // The "World" map
}

export interface ScenarioCard {
  id: string;
  title: string;
  subtitle: string;
  iconType: 'leaf' | 'flame' | 'moon' | 'snowflake';
  status: 'active' | 'locked';
  color: string;
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
