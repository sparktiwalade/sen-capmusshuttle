'use client'

import Link from 'next/link'
import { LogIn, LogOut, UserRound } from 'lucide-react'
import { authClient } from '@/lib/auth-client'

export function AccountControls() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) return null

  if (!session?.user) {
    return <div className="account-controls"><Link className="account-link" href="/sign-in"><LogIn size={15} /> Sign in</Link><Link className="account-cta" href="/sign-up">Sign up</Link></div>
  }

  async function signOut() {
    await authClient.signOut()
    window.location.reload()
  }

  const username = session.user.username
  return <div className="account-controls"><span className="account-user"><UserRound size={15} /> {username || session.user.name}</span><button className="account-link" onClick={signOut}><LogOut size={15} /> Sign out</button></div>
}
