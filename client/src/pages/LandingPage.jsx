import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Button from '../components/ui/Button'
import useAuthStore from '../store/authStore'

export default function LandingPage() {
  const { user } = useAuthStore()

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      {/* Hero */}
      <main className="max-w-4xl mx-auto px-5 pt-24 pb-20">
        <div className="max-w-2xl animate-slide-up">
          <span className="inline-block text-xs text-amber font-medium tracking-widest uppercase mb-6 border border-amber/30 bg-amber-faint px-3 py-1 rounded-full">
            Free · No credit card
          </span>

          <h1 className="font-serif text-5xl text-ink leading-[1.1] mb-6">
            Polls that actually
            <br />
            <em className="text-amber">get responses.</em>
          </h1>

          <p className="text-lg text-ink-muted mb-10 leading-relaxed max-w-lg">
            Create a poll in under a minute. Share the link. Watch the votes roll in —
            then publish the results when you're ready.
          </p>

          <div className="flex items-center gap-3">
            <Link to={user ? '/polls/new' : '/register'}>
              <Button size="lg">
                {user ? 'Create a poll →' : 'Get started free →'}
              </Button>
            </Link>
            {!user && (
              <Link to="/login">
                <Button variant="ghost" size="lg">Log in</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Feature strip */}
        <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-px bg-paper-border border border-paper-border rounded-lg overflow-hidden">
          {[
            {
              title: 'Create',
              desc: 'Set your question, options, expiry and share settings in one form.',
            },
            {
              title: 'Collect',
              desc: 'Share a single link. Works for anyone — logged in or anonymous.',
            },
            {
              title: 'Publish',
              desc: 'Close voting and publish results on the same link whenever you\'re ready.',
            },
          ].map((f, i) => (
            <div key={i} className="bg-paper p-7 animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="w-6 h-6 rounded-full bg-amber-faint border border-amber/20 flex items-center justify-center mb-4">
                <span className="text-amber text-xs font-medium">{i + 1}</span>
              </div>
              <h3 className="font-serif text-xl text-ink mb-2">{f.title}</h3>
              <p className="text-sm text-ink-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-paper-border py-6">
        <div className="max-w-4xl mx-auto px-5 flex items-center justify-between">
          <span className="font-serif text-ink-muted">Vichar<span className="text-amber"> · </span>Setu</span>
          <span className="text-xs text-ink-faint">Open & simple polling.</span>
        </div>
      </footer>
    </div>
  )
}