import { PRD_CONTENT } from '../prdContent';

const typeIcons: Record<string, { icon: string; color: string }> = {
  consumable: { icon: '🕯️', color: 'bg-amber-50 border-amber-200' },
  peripheral: { icon: '🛍️', color: 'bg-pink-50 border-pink-200' },
  hardware: { icon: '📱', color: 'bg-blue-50 border-blue-200' },
  service: { icon: '✨', color: 'bg-purple-50 border-purple-200' },
};

export function BusinessModelSection() {
  const { businessModel } = PRD_CONTENT;

  return (
    <section id="business" className="min-h-screen py-24 px-8 bg-gradient-to-b from-white to-amber-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-light text-ink-gray mb-4">
            {businessModel.title}
          </h2>
          <p className="text-lg text-ink-light mb-8">{businessModel.subtitle}</p>
          <div className="max-w-3xl mx-auto bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-100">
            <p className="text-ink-gray leading-relaxed">{businessModel.summary}</p>
          </div>
        </div>

        {/* Revenue Streams */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businessModel.revenueStreams.map((stream) => {
            const config = typeIcons[stream.type];
            return (
              <div
                key={stream.id}
                className={`${config.color} rounded-2xl p-6 border backdrop-blur-sm transition-transform hover:scale-105`}
              >
                <div className="text-3xl mb-4">{config.icon}</div>
                <h3 className="text-lg font-medium text-ink-gray mb-2">
                  {stream.name}
                </h3>
                <p className="text-sm text-ink-light">{stream.description}</p>
              </div>
            );
          })}
        </div>

        {/* Footer Summary */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-dopamine-orange/10 rounded-full">
            <span className="text-dopamine-orange font-medium">
              硬件即入口，流量带周边
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
