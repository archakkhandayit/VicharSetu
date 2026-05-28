import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Navbar from '../components/layout/Navbar'
import Input, { Textarea } from '../components/ui/Input'
import Button from '../components/ui/Button'
import Toggle from '../components/ui/Toggle'
import { createPoll } from '../services/api'

export default function CreatePollPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: '',
    description: '',
    questionText: '',
    options: ['', ''],
    responseMode: 'public',
    expiresAt: '',
    // isAnonymousAllowed: true,
    // requireAuthentication: false,
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const setOption = (i, val) => {
    const opts = [...form.options]
    opts[i] = val
    set('options', opts)
  }

  const addOption = () => {
    if (form.options.length >= 8) return toast.error('Maximum 8 options')
    set('options', [...form.options, ''])
  }

  const removeOption = (i) => {
    if (form.options.length <= 2) return toast.error('Minimum 2 options required')
    set('options', form.options.filter((_, idx) => idx !== i))
  }

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.questionText.trim()) e.questionText = 'Question is required'
    if (!form.expiresAt) e.expiresAt = 'Expiry date is required'
    const filledOpts = form.options.filter((o) => o.trim())
    if (filledOpts.length < 2) e.options = 'At least 2 options required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) {
      setErrors(e2)
      return toast.error('Please fix the errors below')
    }
    setLoading(true)
    try {
      const payload = {
        ...form,
        options: form.options.filter((o) => o.trim()),
        expiresAt: new Date(form.expiresAt).toISOString(),
      }
      await createPoll(payload)
      toast.success('Poll created!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create poll')
    } finally {
      setLoading(false)
    }
  }

  // Min datetime string for the date input (now)
  const minDate = new Date(Date.now() + 60000).toISOString().slice(0, 16)

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <main className="max-w-2xl mx-auto px-5 py-10">
        <div className="mb-8">
          <p className="text-xs text-ink-faint uppercase tracking-widest mb-1">Polls</p>
          <h1 className="font-serif text-3xl text-ink">New poll</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Basic info */}
          <div className="card p-6 flex flex-col gap-4">
            <h2 className="text-sm font-medium text-ink-soft uppercase tracking-wider">Details</h2>
            <Input
              label="Title"
              placeholder="e.g. Frontend Survey"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              error={errors.title}
            />
            <Textarea
              label="Description (optional)"
              placeholder="Give voters some context..."
              rows={2}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
            <Textarea
              label="Question"
              placeholder="What do you want to ask?"
              rows={2}
              value={form.questionText}
              onChange={(e) => set('questionText', e.target.value)}
              error={errors.questionText}
            />
          </div>

          {/* Options */}
          <div className="card p-6 flex flex-col gap-3">
            <h2 className="text-sm font-medium text-ink-soft uppercase tracking-wider mb-1">Options</h2>
            {form.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-ink-faint w-4 text-right shrink-0">{i + 1}</span>
                <input
                  className="input-field flex-1"
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChange={(e) => setOption(i, e.target.value)}
                />
                {form.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(i)}
                    className="text-ink-faint hover:text-red-400 transition-colors text-lg leading-none shrink-0"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            {errors.options && <p className="text-xs text-red-500">{errors.options}</p>}
            <button
              type="button"
              onClick={addOption}
              className="text-sm text-amber hover:text-amber-hover transition-colors text-left mt-1"
            >
              + Add option
            </button>
          </div>

          {/* Settings */}
          <div className="card p-6 flex flex-col gap-5">
            <h2 className="text-sm font-medium text-ink-soft uppercase tracking-wider">Settings</h2>

            {/* Expiry */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-ink-muted font-medium tracking-wide">Expiry date & time</label>
              <input
                type="datetime-local"
                className="input-field"
                min={minDate}
                value={form.expiresAt}
                onChange={(e) => set('expiresAt', e.target.value)}
              />
              {errors.expiresAt && <p className="text-xs text-red-500">{errors.expiresAt}</p>}
            </div>

            {/* Response mode */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-ink-muted font-medium tracking-wide">Response mode</label>
              <div className="flex gap-2">
                {['public', 'authenticated'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => set('responseMode', mode)}
                    className={`flex-1 py-2 px-3 rounded text-sm border transition-all ${
                      form.responseMode === mode
                        ? 'border-amber bg-amber-faint text-amber'
                        : 'border-paper-border text-ink-muted hover:border-ink-faint'
                    }`}
                  >
                    {mode === 'public' ? 'Public (anyone)' : 'Authenticated (login required)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            {/* <div className="flex flex-col gap-4 pt-1">
              <Toggle
                checked={form.isAnonymousAllowed}
                onChange={(v) => set('isAnonymousAllowed', v)}
                label="Allow anonymous votes"
                description="Voters don't need an account to participate"
              />
              <Toggle
                checked={form.requireAuthentication}
                onChange={(v) => set('requireAuthentication', v)}
                label="Require authentication"
                description="Only logged-in users can see and vote on this poll"
              />
            </div> */}
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 justify-end pb-4">
            <Button variant="ghost" type="button" onClick={() => navigate('/dashboard')}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Create poll →
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}