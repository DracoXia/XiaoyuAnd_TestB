import { Navigation } from './sections/Navigation';
import { HeroSection } from './sections/HeroSection';
import { PhilosophySection } from './sections/PhilosophySection';
import { KanoModelSection } from './sections/KanoModelSection';
import { HypothesesSection } from './sections/HypothesesSection';
import { UserFlowSection } from './sections/UserFlowSection';
import { ProductLineupSection } from './sections/ProductLineupSection';
import { StrategySection } from './sections/StrategySection';
import { RoadmapSection } from './sections/RoadmapSection';
import { BusinessModelSection } from './sections/BusinessModelSection';

export function PRDShowcase() {
  return (
    <main className="bg-white">
      <Navigation />
      <HeroSection />
      <PhilosophySection />
      <KanoModelSection />
      <HypothesesSection />
      <UserFlowSection />
      <ProductLineupSection />
      <StrategySection />
      <RoadmapSection />
      <BusinessModelSection />
    </main>
  );
}
