import { useEffect, useState } from 'react'
import { getPrices, getWatchlist } from '../lib/api'

const FIAT = ['usd', 'eur', 'rub']

const KNOWN_LABELS = {
  bitcoin: 'BTC', ethereum: 'ETH', solana: 'SOL',
  binancecoin: 'BNB', 'the-open-network': 'TON',
  ripple: 'XRP', cardano: 'ADA', polkadot: 'DOT',
  litecoin: 'LTC', dogecoin: 'DOGE', 'avalanche-2': 'AVAX',
  usd: 'USD', eur: 'EUR', rub: 'RUB',
}

const getLabel = (id) => KNOWN_LABELS[id] ?? id.toUpperCase().slice(0, 6)
const isCrypto = (id) => !FIAT.includes(id)

function formatAmount(value, toCurrency) {
  if (value == null || isNaN(value)) return '—'
  if (isCrypto(toCurrency)) {
    return value.toLocaleString('en-US', { maximumFractionDigits: 8, minimumFractionDigits: 0 })
  }
  return value.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })
}

export default function ConverterPage() {
  const [cryptoList, setCryptoList] = useState([])
  const [initLoading, setInitLoading] = useState(true)

  const [amount, setAmount] = useState('1')
  const [from, setFrom] = useState(null)  // null until watchlist loaded
  const [to, setTo] = useState('usd')
  const [rate, setRate] = useState(null)
  const [rateLoading, setRateLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadWatchlist()
  }, [])

  useEffect(() => {
    if (from) fetchRate(from, to)
  }, [from, to])

  async function loadWatchlist() {
    try {
      const { coins } = await getWatchlist()
      if (coins.length > 0) {
        setCryptoList(coins)
        setFrom(coins[0])
      }
    } catch {
      // non-fatal: show empty state
    } finally {
      setInitLoading(false)
    }
  }

  async function fetchRate(fromId, toId) {
    if (fromId === toId) {
      setRate(1)
      setError(null)
      return
    }

    const fromIsFiat = !isCrypto(fromId)
    const toIsFiat = !isCrypto(toId)

    if (fromIsFiat && toIsFiat) {
      setRate(null)
      setError('Конвертация фиат → фиат не поддерживается')
      return
    }

    setRateLoading(true)
    setError(null)

    try {
      if (!fromIsFiat && !toIsFiat) {
        const data = await getPrices([fromId, toId], 'usd')
        setRate(data[fromId].usd / data[toId].usd)
      } else if (!fromIsFiat && toIsFiat) {
        const data = await getPrices([fromId], toId)
        setRate(data[fromId][toId])
      } else {
        const data = await getPrices([toId], fromId)
        setRate(1 / data[toId][fromId])
      }
    } catch {
      setError('Не удалось получить курс')
      setRate(null)
    } finally {
      setRateLoading(false)
    }
  }

  function handleSwap() {
    setFrom(to)
    setTo(from)
  }

  if (initLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-sm" style={{ color: 'var(--tg-hint-color)' }}>Загрузка…</span>
      </div>
    )
  }

  if (cryptoList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-center px-6">
        <span className="text-4xl">⭐</span>
        <h2 className="text-xl font-semibold">Нет монет</h2>
        <p className="text-sm" style={{ color: 'var(--tg-hint-color)' }}>
          Добавьте монеты в Watchlist, чтобы использовать конвертер
        </p>
      </div>
    )
  }

  const allCurrencies = [...cryptoList, ...FIAT]
  const numAmount = parseFloat(amount) || 0
  const result = rate != null ? numAmount * rate : null
  const fromLabel = getLabel(from)
  const toLabel = getLabel(to)
  const toSymbol = { usd: '$', eur: '€', rub: '₽' }[to] ?? ''

  return (
    <div className="flex flex-col h-full px-4 pt-6 pb-4 gap-6">

      {/* Amount input */}
      <div className="flex flex-col gap-1">
        <label className="text-xs" style={{ color: 'var(--tg-hint-color)' }}>
          Сумма
        </label>
        <input
          type="number"
          inputMode="decimal"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-4 py-3 rounded-xl text-lg outline-none"
          style={{
            background: 'var(--tg-secondary-bg-color)',
            color: 'var(--tg-text-color)',
          }}
        />
      </div>

      {/* Currency selectors */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex flex-col gap-1">
          <label className="text-xs" style={{ color: 'var(--tg-hint-color)' }}>Из</label>
          <select
            value={from ?? ''}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full px-3 py-3 rounded-xl text-sm font-medium outline-none"
            style={{ background: 'var(--tg-secondary-bg-color)', color: 'var(--tg-text-color)' }}
          >
            {allCurrencies.map((id) => (
              <option key={id} value={id}>{getLabel(id)}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSwap}
          className="mt-5 px-3 py-3 rounded-xl text-base"
          style={{ background: 'var(--tg-secondary-bg-color)', color: 'var(--tg-hint-color)' }}
          aria-label="Поменять местами"
        >
          ⇄
        </button>

        <div className="flex-1 flex flex-col gap-1">
          <label className="text-xs" style={{ color: 'var(--tg-hint-color)' }}>В</label>
          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full px-3 py-3 rounded-xl text-sm font-medium outline-none"
            style={{ background: 'var(--tg-secondary-bg-color)', color: 'var(--tg-text-color)' }}
          >
            {allCurrencies.map((id) => (
              <option key={id} value={id}>{getLabel(id)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Result */}
      <div
        className="flex flex-col gap-1 px-4 py-4 rounded-xl"
        style={{ background: 'var(--tg-secondary-bg-color)' }}
      >
        {rateLoading ? (
          <span className="text-sm" style={{ color: 'var(--tg-hint-color)' }}>Загрузка…</span>
        ) : error ? (
          <span className="text-sm" style={{ color: '#ff453a' }}>{error}</span>
        ) : (
          <>
            <div className="text-2xl font-semibold">
              {toSymbol}{formatAmount(result, to)} {isCrypto(to) ? toLabel : ''}
            </div>
            {rate != null && from !== to && (
              <div className="text-xs" style={{ color: 'var(--tg-hint-color)' }}>
                1 {fromLabel} = {toSymbol}{formatAmount(rate, to)} {isCrypto(to) ? toLabel : ''}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
