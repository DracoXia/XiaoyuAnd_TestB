import { PRD_CONTENT } from '../prdContent';

export function UserFlowSection() {
  const { userFlow } = PRD_CONTENT;

  return (
    <section id="userflow" className="min-h-screen py-24 px-8 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-light text-ink-gray mb-4">
            {userFlow.title}
          </h2>
        </div>

        {/* Flow Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {userFlow.flows.map((flow) => (
            <div
              key={flow.id}
              className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100"
            >
              {/* Flow Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-medium text-ink-gray">
                    {flow.name}
                  </h3>
                  <p className="text-sm text-ink-light">{flow.nameEn}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-ink-light">仪式感</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-4 h-4 ${
                          star <= flow.ritualLevel
                            ? 'text-dopamine-orange'
                            : 'text-gray-200'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-4">
                {flow.stepsList.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    {/* Step Number */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-dopamine-orange/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-dopamine-orange">
                        {step.step}
                      </span>
                    </div>

                    {/* Step Content */}
                    <div className="flex-1">
                      <h4 className="font-medium text-ink-gray">{step.action}</h4>
                      <p className="text-sm text-ink-light">{step.touchpoint}</p>
                      <p className="text-xs text-dopamine-blue mt-1">
                        期望: {step.expectation}
                      </p>
                    </div>

                    {/* Connector */}
                    {idx < flow.stepsList.length - 1 && (
                      <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-4 bg-gray-200" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
