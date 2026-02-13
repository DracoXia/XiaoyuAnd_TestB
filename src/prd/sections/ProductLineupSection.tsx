import { PRD_CONTENT } from '../prdContent';

export function ProductLineupSection() {
  const { productLineup } = PRD_CONTENT;

  return (
    <section id="products" className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-white px-8">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif text-ink-gray mb-3">
            {productLineup.title}
          </h2>
          <p className="text-lg text-ink-light">
            {productLineup.subtitle}
          </p>
        </div>

        {/* Product Cards */}
        <div className="grid grid-cols-3 gap-8">
          {productLineup.products.map((product) => (
            <div
              key={product.id}
              className={`bg-gradient-to-br ${product.gradient} rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
            >
              {/* Color indicator */}
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${
                  product.id === 'wanxiang' ? 'from-amber-400 to-yellow-400' :
                  product.id === 'tinghe' ? 'from-pink-400 to-rose-400' :
                  'from-green-400 to-emerald-400'
                }`} />
                <span className="text-sm text-ink-light">{product.colorCode}</span>
              </div>

              {/* Name */}
              <h3 className="text-3xl font-serif text-ink-gray mb-1">
                {product.name}
              </h3>
              <p className="text-sm text-ink-light mb-4">{product.nameEn}</p>

              {/* Slogan */}
              <p className="text-lg font-medium text-ink-gray mb-4">
                {product.slogan}
              </p>

              {/* Vibe */}
              <p className="text-sm text-ink-light mb-6">
                {product.vibe}
              </p>

              {/* Ingredients */}
              <div className="border-t border-white/50 pt-4">
                <p className="text-xs text-ink-light mb-2">主成分</p>
                <div className="flex flex-wrap gap-2">
                  {product.ingredients.map((ingredient, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 bg-white/60 rounded-full text-ink-gray"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>

              {/* Audio/Visual */}
              <div className="mt-4 pt-4 border-t border-white/50">
                <p className="text-xs text-ink-light mb-1">场景音: {product.audioLayer1}</p>
                <p className="text-xs text-ink-light">视觉: {product.visualTone}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
