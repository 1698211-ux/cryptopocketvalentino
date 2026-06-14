export default function WatchlistPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2 text-center px-6">
      <span className="text-4xl">⭐</span>
      <h2 className="text-xl font-semibold">Watchlist</h2>
      <p className="text-sm" style={{ color: 'var(--tg-hint-color)' }}>
        Избранные монеты появятся здесь
      </p>
    </div>
  )
}
