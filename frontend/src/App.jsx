import { useState } from 'react'
import './lib/telegram.js'
import TabBar from './components/TabBar'
import WatchlistPage from './components/WatchlistPage'
import ConverterPage from './components/ConverterPage'

const PAGES = {
  watchlist: <WatchlistPage />,
  converter: <ConverterPage />,
}

export default function App() {
  const [activeTab, setActiveTab] = useState('watchlist')

  return (
    <div className="flex flex-col h-screen">
      <main className="flex-1 overflow-y-auto">
        {PAGES[activeTab]}
      </main>
      <TabBar active={activeTab} onChange={setActiveTab} />
    </div>
  )
}
