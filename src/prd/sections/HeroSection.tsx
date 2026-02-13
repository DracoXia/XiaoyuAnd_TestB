import { PRD_CONTENT } from '../prdContent';

export function HeroSection() {
  const { hero } = PRD_CONTENT;

  return (
    <section id="hero" className="h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-amber-50 to-white">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-amber-100/40 to-transparent animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-rose-100/30 to-transparent animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-8">
        {/* Chinese name */}
        <h1 className="text-8xl font-light tracking-wider text-ink-gray mb-4 font-serif">
          {hero.brandName}
        </h1>

        {/* English name */}
        <p className="text-2xl text-ink-light tracking-[0.3em] mb-12">
          {hero.brandNameEn}
        </p>

        {/* Divider */}
        <div className="w-24 h-px bg-amber-300 mx-auto mb-12" />

        {/* Tagline */}
        <h2 className="text-4xl font-serif text-ink-gray mb-3">
          {hero.tagline}
        </h2>
        <p className="text-xl text-ink-light tracking-wide mb-16">
          {hero.taglineEn}
        </p>

        {/* Version badge */}
        <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-amber-200">
          <span className="text-sm text-ink-light">PRD {hero.version}</span>
          <span className="w-1 h-1 rounded-full bg-amber-300" />
          <span className="text-sm text-ink-light">{hero.lastUpdated}</span>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-amber-300 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-amber-400 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
}
