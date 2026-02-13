import { PRD_CONTENT } from '../prdContent';

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  completed: { label: '已完成', bg: 'bg-green-100', text: 'text-green-700' },
  'in-progress': { label: '进行中', bg: 'bg-blue-100', text: 'text-blue-700' },
  planned: { label: '计划中', bg: 'bg-gray-100', text: 'text-gray-600' },
  'not-recommended': { label: '不推荐', bg: 'bg-red-100', text: 'text-red-700' },
};

const priorityConfig: Record<string, { bg: string; text: string }> = {
  P0: { bg: 'bg-red-500', text: 'text-white' },
  P1: { bg: 'bg-orange-500', text: 'text-white' },
  P2: { bg: 'bg-yellow-500', text: 'text-white' },
  P3: { bg: 'bg-gray-400', text: 'text-white' },
};

export function RoadmapSection() {
  const { roadmap } = PRD_CONTENT;

  return (
    <section id="roadmap" className="min-h-screen py-24 px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-light text-ink-gray mb-4">
            {roadmap.title}
          </h2>
          <p className="text-lg text-ink-light">{roadmap.subtitle}</p>
        </div>

        {/* Feature Table */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-ink-gray">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-ink-gray">
                  功能
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-ink-gray">
                  描述
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-ink-gray">
                  优先级
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-ink-gray">
                  状态
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-ink-gray">
                  版本
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {roadmap.features.map((feature) => {
                const status = statusConfig[feature.status];
                const priority = priorityConfig[feature.priority];
                return (
                  <tr key={feature.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-ink-light font-mono">
                      {feature.id}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-ink-gray">
                      {feature.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-ink-light">
                      {feature.description}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${priority.bg} ${priority.text}`}
                      >
                        {feature.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-ink-light">
                      {feature.version}
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
