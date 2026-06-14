const TABS = [
  { id: 'watchlist', label: 'Watchlist', icon: '⭐' },
  { id: 'converter', label: 'Converter', icon: '🔄' },
]

export default function TabBar({ active, onChange }) {
  return (
    <nav
      className="flex border-t"
      style={{
        borderColor: 'var(--tg-secondary-bg-color)',
        backgroundColor: 'var(--tg-bg-color)',
      }}
    >
      {TABS.map((tab) => {
        const isActive = tab.id === active
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="flex-1 flex flex-col items-center py-3 gap-0.5 text-xs transition-colors"
            style={{
              color: isActive ? 'var(--tg-button-color)' : 'var(--tg-hint-color)',
            }}
          >
            <span className="text-xl">{tab.icon}</span>
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}
