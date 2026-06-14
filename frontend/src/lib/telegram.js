// Default dark theme used when running outside Telegram (e.g. npm run dev).
const FALLBACK_THEME = {
  bg_color: '#1c1c1e',
  text_color: '#ffffff',
  hint_color: '#8e8e93',
  link_color: '#0a84ff',
  button_color: '#0a84ff',
  button_text_color: '#ffffff',
  secondary_bg_color: '#2c2c2e',
}

const twa = window.Telegram?.WebApp ?? null
export const isTelegram = Boolean(twa?.initData)

if (isTelegram) {
  twa.ready()
  twa.expand()
}

const theme = isTelegram ? twa.themeParams : FALLBACK_THEME

// Expose theme as CSS custom properties so Tailwind classes can reference them.
const root = document.documentElement
root.style.setProperty('--tg-bg-color', theme.bg_color)
root.style.setProperty('--tg-text-color', theme.text_color)
root.style.setProperty('--tg-hint-color', theme.hint_color)
root.style.setProperty('--tg-link-color', theme.link_color)
root.style.setProperty('--tg-button-color', theme.button_color)
root.style.setProperty('--tg-button-text-color', theme.button_text_color)
root.style.setProperty('--tg-secondary-bg-color', theme.secondary_bg_color)

// Always dark: Telegram themes are dark; fallback is also dark.
root.classList.add('dark')

export { twa, theme }
