import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { register } from '../services/api'
import useAuthStore from '../store/authStore'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { user, setAuth } = useAuthStore()

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email) e.email = 'Email is required'
    if (form.password.length < 6) e.password = 'Minimum 6 characters'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) return setErrors(e2)
    setLoading(true)
    try {
      const res = await register(form)
      setAuth(res.data.user)
      toast.success('Account created!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm animate-scale-in">
        <Link to="/" className="flex items-center justify-center gap-1 mb-10">
          <span className="font-serif text-2xl text-ink">Vichar</span>
          <span className="text-amber text-2xl font-serif"> · </span>
          <span className="font-serif text-2xl text-ink">Setu</span>
        </Link>

        <div className="card p-8">
          <h1 className="font-serif text-2xl text-ink mb-1">Create account</h1>
          <p className="text-sm text-ink-muted mb-7">Start creating polls for free</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Name"
              type="text"
              placeholder="Your name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={errors.name}
            />
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
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password}
            />
            <Button type="submit" loading={loading} className="mt-2 w-full">
              Create account
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-ink-muted mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-amber hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}