const getInitData = () => window.Telegram?.WebApp?.initData ?? ''

async function apiFetch(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: {
      'X-Init-Data': getInitData(),
      ...options.headers,
    },
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

export const getWatchlist = () => apiFetch('/api/watchlist')

export const addCoin = (coinId) =>
  apiFetch('/api/watchlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ coin_id: coinId }),
  })

export const removeCoin = (coinId) =>
  apiFetch(`/api/watchlist/${coinId}`, { method: 'DELETE' })

export const getPrices = (ids, vsCurrency = 'usd') =>
  apiFetch(`/api/prices?ids=${ids.join(',')}&vs_currency=${vsCurrency}`)
