import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { login, clearAuthError } from '@/features/auth/authSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthLayout, FormAlert } from './AuthLayout'

export function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { loading, error, token } = useAppSelector((s) => s.auth)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // Clear any stale error when arriving on this page
  useEffect(() => {
    dispatch(clearAuthError())
  }, [dispatch])

  // Already signed in — go straight to the panel
  useEffect(() => {
    if (token) navigate('/', { replace: true })
  }, [token, navigate])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password) return
    const result = await dispatch(login({ username: username.trim(), password }))
    if (login.fulfilled.match(result)) navigate('/', { replace: true })
  }

  return (
    <AuthLayout
      title="ನಮ್ಮ ಸಂಭ್ರಮ"
      subtitle="Admin panel sign in"
      footer={
        <>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--color-accent)' }}>
            Create one
          </Link>
        </>
      }
    >
      {error && <FormAlert message={error} />}

      <form onSubmit={submit} className="flex flex-col gap-[14px]">
        <div>
          <Label htmlFor="username" style={{ fontSize: 13, marginBottom: 6 }}>
            Username or email
          </Label>
          <Input
            id="username"
            value={username}
            autoComplete="username"
            autoFocus
            placeholder="username or you@example.com"
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="password" style={{ fontSize: 13, marginBottom: 6 }}>
            Password
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            autoComplete="current-password"
            placeholder="••••••••"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          className="btn-block"
          disabled={loading || !username.trim() || !password}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthLayout>
  )
}
