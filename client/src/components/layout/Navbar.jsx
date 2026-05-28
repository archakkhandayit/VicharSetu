import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import Button from '../ui/Button'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-paper/90 backdrop-blur-sm border-b border-paper-border">
      <div className="max-w-4xl mx-auto px-5 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-1">
          <span className="font-serif text-xl text-ink">Vichar</span>
          <span className="text-amber text-xl font-serif"> · </span>
          <span className="font-serif text-xl text-ink">Setu</span>
        </Link>

        {/* Nav actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-ink-muted hidden sm:block">{user.name}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Sign out
              </Button>
              <Button size="sm" onClick={() => navigate('/polls/new')}>
                New poll
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}