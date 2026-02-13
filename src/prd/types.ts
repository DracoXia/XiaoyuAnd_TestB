/**
 * PRD Showcase Types
 * 小屿和 PRD 展示页面类型定义
 */

// ==================== Hero Section ====================

export interface HeroContent {
  brandName: string;
  brandNameEn: string;
  chineseName: string;
  tagline: string;
  taglineEn: string;
  version: string;
  lastUpdated: string;
}

// ==================== Philosophy Section ====================

export interface PhilosophyContent {
  title: string;
  subtitle: string;
  description: string;
  contrastPoints: ContrastPoint[];
}

export interface ContrastPoint {
  traditional: string;
  ourApproach: string;
}

// ==================== Kano Model Section ====================

export type KanoCategory = 'must-be' | 'one-dimensional' | 'delighter' | 'reverse';

export interface KanoFeature {
  feature: string;
  category: KanoCategory;
  psychology: string;
}

export interface KanoModelContent {
  title: string;
  subtitle: string;
  features: KanoFeature[];
}

// ==================== Hypotheses Section ====================

export interface HypothesisMetric {
  name: string;
  definition: string;
  target: string;
}

export interface Hypothesis {
  id: string;
  type: 'behavioral' | 'emotional' | 'social';
  title: string;
  titleEn: string;
  description: string;
  riskPoint: string;
  metrics: HypothesisMetric[];
}

export interface HypothesesContent {
  title: string;
  subtitle: string;
  hypotheses: Hypothesis[];
}

// ==================== User Flow Section ====================

export interface FlowStep {
  step: number;
  action: string;
  touchpoint: string;
  expectation: string;
}

export interface UserFlow {
  id: string;
  name: string;
  nameEn: string;
  steps: number;
  ritualLevel: number; // 1-5 stars
  stepsList: FlowStep[];
}

export interface UserFlowContent {
  title: string;
  flows: UserFlow[];
}

// ==================== Product Lineup Section ====================

export interface FragranceProduct {
  id: string;
  name: string;
  nameEn: string;
  internalCode: string;
  vibe: string;
  slogan: string;
  ingredients: string[];
  scentProfile: string;
  inspiration: string;
  mood: string;
  recommendedTime: string;
  audioLayer1: string;
  visualTone: string;
  colorCode: string;
  gradient: string;
}

export interface ProductLineupContent {
  title: string;
  subtitle: string;
  products: FragranceProduct[];
}

// ==================== Strategy Section ====================

export interface StrategyStage {
  id: string;
  stage: number;
  name: string;
  nameEn: string;
  strategicGoal: string;
  hypotheses: StrategyHypothesis[];
  keyActions: StrategyAction[];
  milestones: string[];
}

export interface StrategyHypothesis {
  id: string;
  content: string;
  metric: string;
  target: string;
}

export interface StrategyAction {
  dimension: string;
  action: string;
}

export interface StrategyContent {
  title: string;
  subtitle: string;
  stages: StrategyStage[];
}

// ==================== Roadmap Section ====================

export type FeatureStatus = 'completed' | 'in-progress' | 'planned' | 'not-recommended';

export interface RoadmapFeature {
  id: string;
  name: string;
  description: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  status: FeatureStatus;
  version: string;
}

export interface RoadmapContent {
  title: string;
  subtitle: string;
  features: RoadmapFeature[];
}

// ==================== Business Model Section ====================

export interface RevenueStream {
  id: string;
  name: string;
  description: string;
  type: 'consumable' | 'peripheral' | 'hardware' | 'service';
}

export interface BusinessModelContent {
  title: string;
  subtitle: string;
  summary: string;
  revenueStreams: RevenueStream[];
}

// ==================== Full PRD Content ====================

export interface PRDContent {
  hero: HeroContent;
  philosophy: PhilosophyContent;
  kanoModel: KanoModelContent;
  hypotheses: HypothesesContent;
  userFlow: UserFlowContent;
  productLineup: ProductLineupContent;
  strategy: StrategyContent;
  roadmap: RoadmapContent;
  businessModel: BusinessModelContent;
}
