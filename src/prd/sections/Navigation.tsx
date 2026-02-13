const navItems = [
  { id: 'hero', label: '品牌' },
  { id: 'philosophy', label: '核心理念' },
  { id: 'kano', label: 'Kano模型' },
  { id: 'hypotheses', label: '核心假设' },
  { id: 'userflow', label: '用户流程' },
  { id: 'products', label: '产品规格' },
  { id: 'strategy', label: '战略路径' },
  { id: 'roadmap', label: '路线图' },
  { id: 'business', label: '商业模式' },
];

export function Navigation() {
  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-100 shadow-sm"
      role="navigation"
    >
      <div className="max-w-6xl mx-auto px-8">
        <ul className="flex items-center justify-center gap-1 py-3">
          {navItems.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="px-3 py-2 text-sm text-ink-gray hover:text-dopamine-orange hover:bg-dopamine-orange/5 rounded-lg transition-colors"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
