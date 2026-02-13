import { PRD_CONTENT } from '../prdContent';

const typeColors: Record<string, { bg: string; border: string; text: string }> = {
  behavioral: { bg: 'bg-blue-50', border: 'border-dopamine-blue', text: 'text-dopamine-blue' },
  emotional: { bg: 'bg-purple-50', border: 'border-dopamine-purple', text: 'text-dopamine-purple' },
  social: { bg: 'bg-pink-50', border: 'border-dopamine-pink', text: 'text-dopamine-pink' },
};

export function HypothesesSection() {
  const { hypotheses } = PRD_CONTENT;

  return (
    <section id="hypotheses" className="min-h-screen py-24 px-8 bg-gradient-to-b from-amber-50 to-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-light text-ink-gray mb-4">
            {hypotheses.title}
          </h2>
          <p className="text-lg text-ink-light max-w-3xl mx-auto">
            {hypotheses.subtitle}
          </p>
        </div>

        {/* Hypothesis Cards */}
        <div className="grid gap-8">
          {hypotheses.hypotheses.map((hypothesis) => {
            const colors = typeColors[hypothesis.type];
            return (
              <div
                key={hypothesis.id}
                className={`${colors.bg} rounded-3xl p-8 border-l-4 ${colors.border}`}
              >
                {/* Hypothesis Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <span className={`text-sm ${colors.text} font-medium`}>
                      {hypothesis.title}
                    </span>
                    <h3 className="text-xl text-ink-gray mt-1">{hypothesis.titleEn}</h3>
                  </div>
                  <div className={`w-10 h-10 rounded-full ${colors.bg} flex items-center justify-center border-2 ${colors.border}`}>
                    <span className={`text-lg font-bold ${colors.text}`}>
                      {hypothesis.id.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-ink-gray leading-relaxed mb-6">
                  {hypothesis.description}
                </p>

                {/* Risk Point */}
                <div className="bg-white/60 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="text-sm font-medium text-red-500">风险点</span>
                  </div>
                  <p className="text-ink-light text-sm">{hypothesis.riskPoint}</p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {hypothesis.metrics.map((metric, idx) => (
                    <div key={idx} className="bg-white/60 rounded-xl p-4">
                      <p className="text-sm font-medium text-ink-gray mb-1">{metric.name}</p>
                      <p className="text-xs text-ink-light mb-2">{metric.definition}</p>
                      <div className={`text-sm font-medium ${colors.text}`}>
                        目标: {metric.target}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
