import { PRD_CONTENT } from '../prdContent';

export function StrategySection() {
  const { strategy } = PRD_CONTENT;

  return (
    <section id="strategy" className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-amber-50 px-8">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif text-ink-gray mb-3">
            {strategy.title}
          </h2>
          <p className="text-lg text-ink-light">
            {strategy.subtitle}
          </p>
        </div>

        {/* Strategy Stages */}
        <div className="grid grid-cols-3 gap-8">
          {strategy.stages.map((stage, index) => (
            <div
              key={stage.id}
              className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {/* Stage number */}
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                {stage.stage}
              </div>

              {/* Name */}
              <h3 className="text-2xl font-serif text-ink-gray mb-1 mt-2">
                {stage.name}
              </h3>
              <p className="text-sm text-ink-light mb-4">{stage.nameEn}</p>

              {/* Strategic Goal */}
              <p className="text-sm text-ink-gray leading-relaxed mb-6">
                {stage.strategicGoal}
              </p>

              {/* Hypotheses */}
              <div className="mb-4">
                <p className="text-xs font-medium text-ink-light mb-2">核心假设</p>
                {stage.hypotheses.slice(0, 2).map((h) => (
                  <div key={h.id} className="text-xs text-ink-light mb-1 flex items-start gap-1">
                    <span className="text-amber-500">•</span>
                    <span>{h.metric}: {h.target}</span>
                  </div>
                ))}
              </div>

              {/* Milestones */}
              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-medium text-ink-light mb-2">里程碑</p>
                <p className="text-xs text-ink-light leading-relaxed">
                  {stage.milestones[0]}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-12 text-center">
          <p className="text-lg text-ink-gray font-serif italic">
            前期靠"硬"把门打开，中期靠"软"把人留住，后期靠"宽"把钱赚到
          </p>
        </div>
      </div>
    </section>
  );
}
