import { useEffect, useState } from 'react'
import { addCoin, getPrices, getWatchlist, removeCoin } from '../lib/api'

function formatPrice(usd) {
  return usd.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
}

function formatChange(pct) {
  const sign = pct >= 0 ? '+' : ''
  return `${sign}${pct.toFixed(2)}%`
}

function CoinRow({ id, price, change24h, onRemove }) {
  const name = id.charAt(0).toUpperCase() + id.slice(1)
  const changeColor = change24h >= 0 ? 'var(--tg-button-color)' : '#ff453a'

  return (
    <div
      className="flex items-center justify-between px-4 py-3 rounded-xl"
      style={{ background: 'var(--tg-secondary-bg-color)' }}
    >
      <span className="font-medium">{name}</span>
      <div className="flex items-center gap-3">
        {price != null ? (
          <>
            <span className="font-mono text-sm">{formatPrice(price)}</span>
            <span className="font-mono text-sm w-16 text-right" style={{ color: changeColor }}>
              {formatChange(change24h)}
            </span>
          </>
        ) : (
          <span className="text-sm" style={{ color: 'var(--tg-hint-color)' }}>—</span>
        )}
        <button
          onClick={onRemove}
          className="text-lg leading-none"
          style={{ color: 'var(--tg-hint-color)' }}
          aria-label={`Remove ${name}`}
        >
          ×
        </button>
      </div>
    </div>
  )
}

export default function WatchlistPage() {
  const [coins, setCoins] = useState([])
  const [prices, setPrices] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [input, setInput] = useState('')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState(null)

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const { coins: list } = await getWatchlist()
      setCoins(list)
      if (list.length > 0) {
        const data = await getPrices(list)
        setPrices(data)
      } else {
        setPrices({})
      }
    } catch (e) {
      setError('Не удалось загрузить данные')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  async function handleAdd(e) {
    e.preventDefault()
    const id = input.trim().toLowerCase()
    if (!id) return
    setAdding(true)
    setAddError(null)
    try {
      const priceCheck = await getPrices([id])
      if (!priceCheck[id]) {
        setAddError(`Монета "${id}" не найдена в CoinGecko`)
        return
      }
      await addCoin(id)
      setInput('')
      await loadData()
    } catch (e) {
      setAddError('Ошибка при добавлении')
    } finally {
      setAdding(false)
    }
  }

  async function handleRemove(id) {
    try {
      await removeCoin(id)
      await loadData()
    } catch {
      setError('Ошибка при удалении')
    }
  }

  return (
    <div className="flex flex-col h-full px-4 pt-4 pb-2 gap-3">
      {/* Error banner */}
      {error && (
        <div className="text-sm text-center py-2 px-3 rounded-lg" style={{ background: '#ff453a22', color: '#ff453a' }}>
          {error}
        </div>
      )}

      {/* Coin list */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2">
        {loading ? (
          <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--tg-hint-color)' }}>
            Загрузка…
          </div>
        ) : coins.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
            <span className="text-4xl">⭐</span>
            <p className="text-sm" style={{ color: 'var(--tg-hint-color)' }}>
              Добавь первую монету ↓
            </p>
          </div>
        ) : (
          coins.map((id) => (
            <CoinRow
              key={id}
              id={id}
              price={prices[id]?.usd}
              change24h={prices[id]?.usd_24h_change ?? 0}
              onRemove={() => handleRemove(id)}
            />
          ))
        )}
      </div>

      {/* Add coin form */}
      <form onSubmit={handleAdd} className="flex flex-col gap-1">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => { setInput(e.target.value); setAddError(null) }}
            placeholder="bitcoin, ethereum…"
            className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
            style={{
              background: 'var(--tg-secondary-bg-color)',
              color: 'var(--tg-text-color)',
            }}
          />
          <button
            type="submit"
            disabled={adding || !input.trim()}
            className="px-4 py-2 rounded-xl text-sm font-medium"
            style={{
              background: 'var(--tg-button-color)',
              color: 'var(--tg-button-text-color)',
              opacity: adding || !input.trim() ? 0.5 : 1,
            }}
          >
            {adding ? '…' : 'Добавить'}
          </button>
        </div>
        {addError && (
          <p className="text-xs px-1" style={{ color: '#ff453a' }}>{addError}</p>
        )}
      </form>
    </div>
  )
}
