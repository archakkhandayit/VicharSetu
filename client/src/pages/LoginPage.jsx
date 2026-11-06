import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { login } from '../services/api'
import useAuthStore from '../store/authStore'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

export default function LoginPage() {
  const navigate = useNavigate()
  const { user, setAuth } = useAuthStore()

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.email) e.email = 'Email is required'
    if (!form.password) e.password = 'Password is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) return setErrors(e2)
    setLoading(true)
    try {
      const res = await login(form)
      setAuth(res.data.user)
      toast.success(`Welcome back, ${res.data.user.name}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm animate-scale-in">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-1 mb-10">
          <span className="font-serif text-2xl text-ink">Vichar</span>
          <span className="text-amber text-2xl font-serif"> · </span>
          <span className="font-serif text-2xl text-ink">Setu</span>
        </Link>

        <div className="card p-8">
          <h1 className="font-serif text-2xl text-ink mb-1">Welcome back</h1>
          <p className="text-sm text-ink-muted mb-7">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password}
            />
            <Button type="submit" loading={loading} className="mt-2 w-full">
              Sign in
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-ink-muted mt-5">
          No account?{' '}
          <Link to="/register" className="text-amber hover:underline">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  )
}