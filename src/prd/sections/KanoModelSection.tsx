import { PRD_CONTENT } from '../prdContent';
import type { KanoCategory } from '../types';

const CATEGORY_LABELS: Record<KanoCategory, { zh: string; en: string; color: string }> = {
  'must-be': { zh: '基本型', en: 'Must-be', color: 'bg-gray-100 text-gray-700' },
  'one-dimensional': { zh: '期望型', en: 'One-dimensional', color: 'bg-blue-100 text-blue-700' },
  'delighter': { zh: '兴奋型', en: 'Delighter', color: 'bg-amber-100 text-amber-700' },
  'reverse': { zh: '反向型', en: 'Reverse', color: 'bg-red-100 text-red-700' },
};

export function KanoModelSection() {
  const { kanoModel } = PRD_CONTENT;

  return (
    <section id="kano" className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-slate-50 px-8">
      <div className="max-w-5xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif text-ink-gray mb-3">
            {kanoModel.title}
          </h2>
          <p className="text-lg text-ink-light">
            {kanoModel.subtitle}
          </p>
        </div>

        {/* Features Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-6 py-4 text-left text-sm font-medium text-ink-light">特性</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-ink-light">属性</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-ink-light">用户心理分析</th>
              </tr>
            </thead>
            <tbody>
              {kanoModel.features.map((feature, index) => {
                const categoryInfo = CATEGORY_LABELS[feature.category];
                return (
                  <tr
                    key={index}
                    className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-ink-gray">
                      {feature.feature}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm ${categoryInfo.color}`}>
                        <span>{categoryInfo.zh}</span>
                        <span className="text-xs opacity-60">({categoryInfo.en})</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-ink-light leading-relaxed">
                      {feature.psychology}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
