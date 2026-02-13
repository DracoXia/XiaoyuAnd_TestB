import { describe, it, expect } from 'vitest';
import { PRD_CONTENT } from './prdContent';
import type {
  PRDContent,
  HeroContent,
  KanoCategory,
  Hypothesis,
  FragranceProduct,
  StrategyStage,
  RoadmapFeature,
} from './types';

describe('PRD Content', () => {
  describe('Structure Validation', () => {
    it('should have all required top-level sections', () => {
      expect(PRD_CONTENT).toHaveProperty('hero');
      expect(PRD_CONTENT).toHaveProperty('philosophy');
      expect(PRD_CONTENT).toHaveProperty('kanoModel');
      expect(PRD_CONTENT).toHaveProperty('hypotheses');
      expect(PRD_CONTENT).toHaveProperty('userFlow');
      expect(PRD_CONTENT).toHaveProperty('productLineup');
      expect(PRD_CONTENT).toHaveProperty('strategy');
      expect(PRD_CONTENT).toHaveProperty('roadmap');
      expect(PRD_CONTENT).toHaveProperty('businessModel');
    });
  });

  describe('Hero Section', () => {
    it('should have correct brand name', () => {
      expect(PRD_CONTENT.hero.brandName).toBe('小屿和');
      expect(PRD_CONTENT.hero.brandNameEn).toBe('Xiaoyu And');
    });

    it('should have correct tagline', () => {
      expect(PRD_CONTENT.hero.tagline).toBe('线香即入口');
      expect(PRD_CONTENT.hero.taglineEn).toBe('Incense First');
    });

    it('should have version info', () => {
      expect(PRD_CONTENT.hero.version).toBe('v2.3');
      expect(PRD_CONTENT.hero.lastUpdated).toBe('2026-02-13');
    });
  });

  describe('Philosophy Section', () => {
    it('should have Incense First as core philosophy', () => {
      expect(PRD_CONTENT.philosophy.subtitle).toBe('Incense First');
    });

    it('should have contrast points between traditional and our approach', () => {
      expect(PRD_CONTENT.philosophy.contrastPoints.length).toBeGreaterThan(0);
      expect(PRD_CONTENT.philosophy.contrastPoints[0]).toHaveProperty('traditional');
      expect(PRD_CONTENT.philosophy.contrastPoints[0]).toHaveProperty('ourApproach');
    });
  });

  describe('Kano Model Section', () => {
    it('should have 6 features mapped to Kano categories', () => {
      expect(PRD_CONTENT.kanoModel.features).toHaveLength(6);
    });

    it('should have valid Kano categories', () => {
      const validCategories: KanoCategory[] = ['must-be', 'one-dimensional', 'delighter', 'reverse'];
      PRD_CONTENT.kanoModel.features.forEach((feature) => {
        expect(validCategories).toContain(feature.category);
      });
    });

    it('should have NFC as must-be feature', () => {
      const nfcFeature = PRD_CONTENT.kanoModel.features.find((f) => f.feature.includes('NFC'));
      expect(nfcFeature?.category).toBe('must-be');
    });

    it('should have traditional community as reverse feature', () => {
      const communityFeature = PRD_CONTENT.kanoModel.features.find((f) =>
        f.feature.includes('传统社区')
      );
      expect(communityFeature?.category).toBe('reverse');
    });
  });

  describe('Hypotheses Section', () => {
    it('should have 3 hypotheses', () => {
      expect(PRD_CONTENT.hypotheses.hypotheses).toHaveLength(3);
    });

    it('should have behavioral, emotional, and social hypotheses', () => {
      const types = PRD_CONTENT.hypotheses.hypotheses.map((h) => h.type);
      expect(types).toContain('behavioral');
      expect(types).toContain('emotional');
      expect(types).toContain('social');
    });

    it('should have metrics for each hypothesis', () => {
      PRD_CONTENT.hypotheses.hypotheses.forEach((hypothesis) => {
        expect(hypothesis.metrics.length).toBeGreaterThan(0);
        hypothesis.metrics.forEach((metric) => {
          expect(metric).toHaveProperty('name');
          expect(metric).toHaveProperty('definition');
          expect(metric).toHaveProperty('target');
        });
      });
    });
  });

  describe('User Flow Section', () => {
    it('should have 2 flows (NFC and Dashboard)', () => {
      expect(PRD_CONTENT.userFlow.flows).toHaveLength(2);
    });

    it('should have NFC flow with higher ritual level', () => {
      const nfcFlow = PRD_CONTENT.userFlow.flows.find((f) => f.id === 'nfc');
      const dashboardFlow = PRD_CONTENT.userFlow.flows.find((f) => f.id === 'dashboard');
      expect(nfcFlow?.ritualLevel).toBeGreaterThan(dashboardFlow?.ritualLevel ?? 0);
    });

    it('should have steps list for each flow', () => {
      PRD_CONTENT.userFlow.flows.forEach((flow) => {
        expect(flow.stepsList.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Product Lineup Section', () => {
    it('should have 3 fragrance products', () => {
      expect(PRD_CONTENT.productLineup.products).toHaveLength(3);
    });

    it('should have the three core products: 晚巷, 听荷, 小院', () => {
      const productNames = PRD_CONTENT.productLineup.products.map((p) => p.name);
      expect(productNames).toContain('晚巷');
      expect(productNames).toContain('听荷');
      expect(productNames).toContain('小院');
    });

    it('should have required fields for each product', () => {
      PRD_CONTENT.productLineup.products.forEach((product) => {
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('nameEn');
        expect(product).toHaveProperty('vibe');
        expect(product).toHaveProperty('slogan');
        expect(product).toHaveProperty('ingredients');
        expect(product.ingredients.length).toBeGreaterThan(0);
      });
    });

    it('should have unique IDs for each product', () => {
      const ids = PRD_CONTENT.productLineup.products.map((p) => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('Strategy Section', () => {
    it('should have 3 strategy stages', () => {
      expect(PRD_CONTENT.strategy.stages).toHaveLength(3);
    });

    it('should have stages in correct order', () => {
      const stages = PRD_CONTENT.strategy.stages;
      expect(stages[0].name).toContain('孤岛'); // 点亮孤岛
      expect(stages[1].name).toContain('群岛'); // 连接群岛
      expect(stages[2].name).toContain('屿宙'); // 构建屿宙
    });

    it('should have hypotheses and key actions for each stage', () => {
      PRD_CONTENT.strategy.stages.forEach((stage) => {
        expect(stage.hypotheses.length).toBeGreaterThan(0);
        expect(stage.keyActions.length).toBeGreaterThan(0);
        expect(stage.milestones.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Roadmap Section', () => {
    it('should have features with valid status', () => {
      const validStatuses = ['completed', 'in-progress', 'planned', 'not-recommended'];
      PRD_CONTENT.roadmap.features.forEach((feature) => {
        expect(validStatuses).toContain(feature.status);
      });
    });

    it('should have P0 features marked as completed', () => {
      const p0Features = PRD_CONTENT.roadmap.features.filter((f) => f.priority === 'P0');
      p0Features.forEach((feature) => {
        expect(feature.status).toBe('completed');
      });
    });

    it('should have at least 10 roadmap items', () => {
      expect(PRD_CONTENT.roadmap.features.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Business Model Section', () => {
    it('should have revenue streams', () => {
      expect(PRD_CONTENT.businessModel.revenueStreams.length).toBeGreaterThan(0);
    });

    it('should have consumable type for incense', () => {
      const consumable = PRD_CONTENT.businessModel.revenueStreams.find(
        (r) => r.type === 'consumable'
      );
      expect(consumable).toBeDefined();
    });

    it('should have summary statement', () => {
      expect(PRD_CONTENT.businessModel.summary).toContain('硬件');
      expect(PRD_CONTENT.businessModel.summary).toContain('流量');
    });
  });
});
