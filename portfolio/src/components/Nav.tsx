interface NavProps {
  currentPage: string
  onNavigate: (page: string) => void
}

const NAV_ITEMS = [
  { id: 'home', label: '首页' },
  { id: 'experience', label: '经历' },
  { id: 'projects', label: '项目' },
  { id: 'ai', label: 'AI 技能' },
  { id: 'honors', label: '荣誉墙' },
  { id: 'blog', label: '博客' },
]

export default function Nav({ currentPage, onNavigate }: NavProps) {
  return (
    <nav className="nav">
      <div className="nav-logo" onClick={() => onNavigate('home')}>
        LI<span>.</span>YC
      </div>
      <div className="nav-links">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`nav-link${currentPage === item.id ? ' active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  )
}