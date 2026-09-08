'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export function AuthForm({ mode }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const isSignUp = mode === 'sign-up'

  async function submit(event) {
    event.preventDefault()
    setError('')
    const result = isSignUp
      ? await authClient.signUp.email({ name, username, email, password })
      : await authClient.signIn.email({ email, password })
    if (result.error) {
      const message = result.error.message?.toLowerCase() || ''
      setError(message.includes('username') || message.includes('unique') ? 'This username already exists' : 'We could not complete that request. Check your details and try again.')
      return
    }
    router.push('/')
    router.refresh()
  }

  async function continueWith(provider) {
    setError('')
    const result = await authClient.signIn.social({ provider, callbackURL: '/' })
    if (result.error) setError('We could not connect to that provider. Please try again.')
  }

  return (
    <div className="auth-card">
      <div className="auth-brand"><span className="brand-mark">▣</span><span>Campus Shuttle</span></div>
      <div className="auth-heading">
        <p className="auth-kicker">OAU transport services</p>
        <h1>{isSignUp ? 'Create your account' : 'Welcome back'}</h1>
        <p>{isSignUp ? 'Save routes and get your campus shuttle updates.' : 'Sign in to manage your shuttle experience.'}</p>
      </div>
      <div className="social-buttons">
        <button type="button" onClick={() => continueWith('google')}><span>G</span> Continue with Google</button>
        <button type="button" onClick={() => continueWith('apple')}><span>●</span> Continue with Apple</button>
      </div>
      <div className="auth-divider"><span>or use email</span></div>
      <form onSubmit={submit} className="auth-form">
        {isSignUp && <label>Full name<input value={name} onChange={event => setName(event.target.value)} required autoComplete="name" /></label>}
        {isSignUp && <label>Username<input value={username} onChange={event => setUsername(event.target.value)} required minLength={3} autoComplete="username" aria-describedby="username-hint" /></label>}
        {isSignUp && <small id="username-hint" className="field-hint">Choose a unique username.</small>}
        <label>Email address<input type="email" value={email} onChange={event => setEmail(event.target.value)} required autoComplete="email" /></label>
        <label>Password<input type="password" value={password} onChange={event => setPassword(event.target.value)} required minLength={8} autoComplete={isSignUp ? 'new-password' : 'current-password'} /></label>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button className="auth-submit" type="submit">{isSignUp ? 'Create account' : 'Sign in'}</button>
      </form>
      <p className="auth-switch">{isSignUp ? 'Already have an account?' : 'New to Campus Shuttle?'} <a href={isSignUp ? '/sign-in' : '/sign-up'}>{isSignUp ? 'Sign in' : 'Create an account'}</a></p>
    </div>
  )
}
