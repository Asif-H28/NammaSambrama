import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  sendOtp,
  resendOtp,
  verifyOtp,
  clearAuthError,
  backToSignupForm,
} from '@/features/auth/authSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthLayout, FieldError, FormAlert } from './AuthLayout'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const RESEND_COOLDOWN = 30

export function SignupPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { loading, error, token, signupStage, pendingEmail, devMode, deliveryError } =
    useAppSelector((s) => s.auth)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    dispatch(clearAuthError())
  }, [dispatch])

  useEffect(() => {
    if (token) navigate('/', { replace: true })
  }, [token, navigate])

  const emailError =
    touched && email && !EMAIL_REGEX.test(email) ? 'Enter a valid email address' : undefined
  const passwordError =
    touched && password && password.length < 6
      ? 'Password must be at least 6 characters'
      : undefined

  const formValid =
    username.trim().length > 0 && password.length >= 6 && EMAIL_REGEX.test(email)

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (!formValid) return
    dispatch(sendOtp({ username: username.trim(), password, email: email.trim() }))
  }

  if (signupStage === 'otp') {
    return (
      <OtpStage
        email={pendingEmail}
        devMode={devMode}
        deliveryError={deliveryError}
        loading={loading}
        error={error}
        onVerified={() => navigate('/', { replace: true })}
      />
    )
  }

  return (
    <AuthLayout
      title="ನಮ್ಮ ಸಂಭ್ರಮ"
      subtitle="Create an admin account"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-accent)' }}>
            Sign in
          </Link>
        </>
      }
    >
      {error && <FormAlert message={error} />}

      <form onSubmit={submitForm} className="flex flex-col gap-[14px]">
        <div>
          <Label htmlFor="su-username" style={{ fontSize: 13, marginBottom: 6 }}>
            Username
          </Label>
          <Input
            id="su-username"
            value={username}
            autoComplete="username"
            autoFocus
            placeholder="choose a username"
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="su-password" style={{ fontSize: 13, marginBottom: 6 }}>
            Password
          </Label>
          <Input
            id="su-password"
            type="password"
            value={password}
            autoComplete="new-password"
            placeholder="at least 6 characters"
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched(true)}
          />
          <FieldError message={passwordError} />
        </div>

        <div>
          <Label htmlFor="su-email" style={{ fontSize: 13, marginBottom: 6 }}>
            Email address
          </Label>
          <Input
            id="su-email"
            type="email"
            value={email}
            autoComplete="email"
            placeholder="you@example.com"
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched(true)}
          />
          <FieldError message={emailError} />
          <div style={{ fontSize: 12, opacity: 0.6, marginTop: 5 }}>
            We'll email a 4-digit code to verify this address.
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="btn-block"
          disabled={loading || !formValid}
        >
          {loading ? 'Sending code…' : 'Send verification code'}
        </Button>
      </form>
    </AuthLayout>
  )
}

/** Stage two — 4-box OTP entry with a resend timer. */
function OtpStage({
  email,
  devMode,
  deliveryError,
  loading,
  error,
  onVerified,
}: {
  email: string
  devMode: boolean
  deliveryError: string | null
  loading: boolean
  error: string | null
  onVerified: () => void
}) {
  const dispatch = useAppDispatch()
  const [digits, setDigits] = useState(['', '', '', ''])
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const otp = digits.join('')

  const setDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    setDigits((prev) => {
      const next = [...prev]
      next[index] = digit
      return next
    })
    if (digit && index < 3) inputs.current[index + 1]?.focus()
  }

  const onKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  const onPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
    if (!pasted) return
    e.preventDefault()
    const next = ['', '', '', '']
    pasted.split('').forEach((d, i) => (next[i] = d))
    setDigits(next)
    inputs.current[Math.min(pasted.length, 3)]?.focus()
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 4) return
    const result = await dispatch(verifyOtp({ email, otp }))
    if (verifyOtp.fulfilled.match(result)) onVerified()
    else setDigits(['', '', '', ''])
  }

  const doResend = async () => {
    const result = await dispatch(resendOtp(email))
    if (resendOtp.fulfilled.match(result)) {
      setCooldown(RESEND_COOLDOWN)
      setDigits(['', '', '', ''])
      inputs.current[0]?.focus()
    }
  }

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={`Code sent to ${email}`}
      footer={
        <button
          type="button"
          onClick={() => dispatch(backToSignupForm())}
          style={{ color: 'var(--color-accent)', background: 'none', border: 0, cursor: 'pointer', font: 'inherit' }}
        >
          ← Change details
        </button>
      }
    >
      {error && <FormAlert message={error} />}

      {devMode && (
        <div
          style={{
            fontSize: 12,
            borderRadius: 9,
            padding: '9px 12px',
            marginBottom: 14,
            background: 'color-mix(in srgb, var(--color-accent) 12%, transparent)',
            border: '1px solid color-mix(in srgb, var(--color-accent) 35%, transparent)',
          }}
        >
          Email not delivered — the OTP is printed in the backend console.
          {deliveryError && (
            <div style={{ marginTop: 5, opacity: 0.8 }}>Reason: {deliveryError}</div>
          )}
        </div>
      )}

      <form onSubmit={submit} className="flex flex-col gap-[16px]">
        <div className="flex justify-center gap-[10px]" onPaste={onPaste}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputs.current[i] = el
              }}
              value={digit}
              inputMode="numeric"
              maxLength={1}
              aria-label={`Digit ${i + 1}`}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              className="input"
              style={{ width: 52, height: 56, textAlign: 'center', fontSize: 22, padding: 0 }}
            />
          ))}
        </div>

        <Button type="submit" variant="primary" className="btn-block" disabled={loading || otp.length !== 4}>
          {loading ? 'Verifying…' : 'Verify & create account'}
        </Button>

        <div style={{ textAlign: 'center', fontSize: 13, opacity: 0.75 }}>
          {cooldown > 0 ? (
            <>Resend code in {cooldown}s</>
          ) : (
            <button
              type="button"
              onClick={doResend}
              disabled={loading}
              style={{ color: 'var(--color-accent)', background: 'none', border: 0, cursor: 'pointer', font: 'inherit' }}
            >
              Resend code
            </button>
          )}
        </div>
      </form>
    </AuthLayout>
  )
}
