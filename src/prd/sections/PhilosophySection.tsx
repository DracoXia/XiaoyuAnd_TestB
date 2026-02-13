import { PRD_CONTENT } from '../prdContent';

export function PhilosophySection() {
  const { philosophy } = PRD_CONTENT;

  return (
    <section id="philosophy" className="min-h-screen py-24 px-8 bg-gradient-to-b from-white to-amber-50">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-light text-ink-gray mb-4">
            {philosophy.title}
          </h2>
          <p className="text-2xl text-dopamine-orange font-light tracking-wide mb-6">
            {philosophy.subtitle}
          </p>
          <p className="text-lg text-ink-light max-w-3xl mx-auto leading-relaxed">
            {philosophy.description}
          </p>
        </div>

        {/* Contrast Points */}
        <div className="grid gap-6">
          {philosophy.contrastPoints.map((point, index) => (
            <div
              key={index}
              className="flex items-center justify-center gap-8 p-6 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100"
            >
              {/* Traditional Approach */}
              <div className="flex-1 text-right">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-gray-500">
                  <span className="text-sm">传统方式</span>
                  <span className="font-medium">{point.traditional}</span>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-dopamine-orange/10">
                <svg
                  className="w-6 h-6 text-dopamine-orange"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </div>

              {/* Our Approach */}
              <div className="flex-1 text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-dopamine-orange/10 rounded-full text-dopamine-orange">
                  <span className="font-medium">{point.ourApproach}</span>
                  <span className="text-sm">小屿和</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
