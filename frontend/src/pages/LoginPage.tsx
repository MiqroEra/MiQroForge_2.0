import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { setToken, setStoredUser } from '../lib/auth'
import { postJSON, ApiError } from '../api/client'
import { useT, type DictKey } from '../lib/i18n'

// ─── Chemistry quotes ──────────────────────────────────────────────────────────

const QUOTES: readonly { text: DictKey; author: DictKey }[] = [
  { text: 'login.quote1Text', author: 'login.quote1Author' },
  { text: 'login.quote2Text', author: 'login.quote2Author' },
  { text: 'login.quote3Text', author: 'login.quote3Author' },
  { text: 'login.quote4Text', author: 'login.quote4Author' },
  { text: 'login.quote5Text', author: 'login.quote5Author' },
  { text: 'login.quote6Text', author: 'login.quote6Author' },
  { text: 'login.quote7Text', author: 'login.quote7Author' },
  { text: 'login.quote8Text', author: 'login.quote8Author' },
  { text: 'login.quote9Text', author: 'login.quote9Author' },
  { text: 'login.quote10Text', author: 'login.quote10Author' },
]

function useRandomQuote() {
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)])
  return quote
}

// ─── LoginPage ────────────────────────────────────────────────────────────────

export function LoginPage() {
  const { t } = useT()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const quote = useRandomQuote()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!username.trim() || !password) {
      setError(t('login.fillCredentials'))
      return
    }

    setLoading(true)
    try {
      const data = await postJSON<{ access_token: string; username: string; role: string }>(
        '/auth/login',
        { username: username.trim(), password },
      )
      setToken(data.access_token)
      setStoredUser({ username: data.username, role: data.role })
      navigate('/', { replace: true })
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 422)) {
        setError(t('login.invalidCredentials'))
      } else {
        const message = err instanceof Error ? err.message : String(err)
        setError(t('login.loginFailed', { error: message }))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-mf-base">
      <div className="w-full max-w-sm p-8 bg-mf-panel rounded-lg border border-mf-border shadow-lg">
        {/* Header */}
        <h1 className="text-2xl font-bold text-center text-mf-text-primary tracking-tight">
          MiQroForge <span className="text-[11px] text-mf-text-muted font-normal border border-mf-border rounded px-1 align-super">2.0</span>
        </h1>
        <p className="text-[13px] text-center text-mf-text-muted mt-1">
          {t('login.subtitle')}
        </p>

        {/* Quote */}
        <p className="text-[11px] text-center text-mf-text-muted italic mt-3 mb-6 leading-relaxed">
          &ldquo;{t(quote.text)}&rdquo;
          <br />
          <span className="not-italic text-[10px]">— {t(quote.author)}</span>
        </p>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-mf-text-primary mb-1">
              {t('login.username')}
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              autoComplete="username"
              className="w-full px-3 py-2 bg-mf-input border border-mf-border rounded text-mf-text-primary
                         placeholder-mf-text-muted focus:outline-none focus:border-blue-500"
              placeholder={t('login.usernamePlaceholder')}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-mf-text-primary mb-1">
              {t('login.password')}
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full px-3 py-2 pr-10 bg-mf-input border border-mf-border rounded text-mf-text-primary
                           placeholder-mf-text-muted focus:outline-none focus:border-blue-500"
                placeholder={t('login.passwordPlaceholder')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                title={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-mf-text-muted
                           hover:text-mf-text-primary focus:outline-none transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-2 text-sm text-red-400 bg-red-900/20 rounded border border-red-800">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded font-medium
                       hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors"
          >
            {loading ? t('login.loggingIn') : t('login.loginButton')}
          </button>
        </form>
      </div>
    </div>
  )
}
