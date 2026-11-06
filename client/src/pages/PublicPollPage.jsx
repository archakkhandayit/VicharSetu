import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getPublicPoll, submitResponse } from '../services/api.js'
import Button from '../components/ui/Button'
import { formatDate } from '../utils/helpers.js'
import useAuthStore from '../store/authStore.js'

// ─── Sub-views ────────────────────────────────────────────────────────────────

function VoteView({ poll, options, onVoteSuccess }) {
  const { user } = useAuthStore()
  const [selected, setSelected] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleVote = async () => {
    if (!selected) return toast.error('Pick an option first')
    setLoading(true)
    try {
      await submitResponse(poll._id, { selectedOptionId: selected })
      setSubmitted(true)
      toast.success('Vote submitted!')
      if (onVoteSuccess) {
        onVoteSuccess()
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit vote')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-16 animate-scale-in">
        <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
          <span className="text-emerald-600 text-xl font-bold">✓</span>
        </div>
        <h2 className="font-serif text-2xl text-ink mb-2">Vote recorded</h2>
        <p className="text-sm text-ink-muted">Results will be shared when the poll closes.</p>
      </div>
    )
  }

  return (
    <div className="animate-slide-up">
      {/* Options */}
      <div className="flex flex-col gap-2 mb-6">
        {options.map((opt) => (
          <button
            key={opt._id}
            type="button"
            onClick={() => setSelected(opt._id)}
            className={`w-full text-left px-4 py-3.5 rounded-lg border text-sm transition-all duration-150 ${
              selected === opt._id
                ? 'border-amber bg-amber-faint text-ink'
                : 'border-paper-border bg-white hover:border-ink-faint text-ink'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                  selected === opt._id ? 'border-amber' : 'border-paper-border'
                }`}
              >
                {selected === opt._id && (
                  <div className="w-2 h-2 rounded-full bg-amber" />
                )}
              </div>
              {opt.optionText}
            </div>
          </button>
        ))}
      </div>

      <Button onClick={handleVote} loading={loading} className="w-full">
        Submit vote
      </Button>

      {!user && poll.responseMode === 'public' && (
        <p className="text-center text-xs text-ink-faint mt-3">
          Voting anonymously ·{' '}
          <Link to="/login" className="text-amber hover:underline">
            Log in
          </Link>{' '}
          to track your votes
        </p>
      )}
    </div>
  )
}

function AlreadyVotedView({ options, selectedOptionId }) {
  const selectedOpt = options?.find((opt) => opt._id === selectedOptionId)

  return (
    <div className="text-center py-12 animate-scale-in">
      <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
        <span className="text-emerald-600 text-xl font-bold">✓</span>
      </div>
      <h2 className="font-serif text-2xl text-ink mb-2">Vote recorded</h2>
      <p className="text-sm text-ink-muted mb-4">
        You have already voted in this poll.
      </p>
      {selectedOpt && (
        <div className="inline-block px-4 py-2 bg-paper-warm rounded-lg text-xs font-medium text-ink mb-4">
          Your choice: <span className="text-amber font-semibold">{selectedOpt.optionText}</span>
        </div>
      )}
      <p className="text-xs text-ink-faint">
        Final results will appear here once voting closes or results are published.
      </p>
    </div>
  )
}

function ResultsView({ results, totalResponses }) {
  return (
    <div className="flex flex-col gap-4 animate-slide-up">
      {results.map((r, i) => (
        <div key={r.optionId} className="animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm text-ink">{r.optionText}</span>
            <span className="text-sm font-medium text-ink-soft tabular-nums">
              {r.percentage}%
              <span className="text-xs text-ink-faint ml-1.5">({r.votes})</span>
            </span>
          </div>
          <div className="h-2 bg-paper-warm rounded-full overflow-hidden">
            <div
              className="h-full bg-amber rounded-full transition-all duration-700 ease-out"
              style={{ width: `${r.percentage}%` }}
            />
          </div>
        </div>
      ))}

      <div className="divider mt-2" />
      <p className="text-xs text-ink-faint text-center">
        {totalResponses} total response{totalResponses !== 1 ? 's' : ''}
      </p>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function PublicPollPage() {
  const { publicLink } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPoll = async () => {
    try {
      const res = await getPublicPoll(publicLink)
      setData(res.data)
    } catch (err) {
      setError({
        status: err.response?.status,
        message: err.response?.data?.message || 'Something went wrong',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPoll()
  }, [publicLink])

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <span className="w-5 h-5 border-2 border-amber border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Error states
  if (error) {
    const messages = {
      404: { heading: 'Poll not found', sub: 'This link doesn\'t exist or has been removed.' },
      400: { heading: 'Poll has expired', sub: 'Voting on this poll has closed.' },
      401: { heading: 'Login required', sub: 'This poll requires you to be signed in to vote.' },
    }
    const m = messages[error.status] || { heading: 'Something went wrong', sub: error.message }

    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-5 text-center">
        <div className="mb-6">
          <span className="font-serif text-5xl text-ink-faint italic">"</span>
        </div>
        <h1 className="font-serif text-2xl text-ink mb-2">{m.heading}</h1>
        <p className="text-sm text-ink-muted mb-8">{m.sub}</p>
        {error.status === 401 && (
          <Link to="/login">
            <Button>Log in to vote</Button>
          </Link>
        )}
        <Link to="/" className="text-sm text-amber hover:underline mt-4 block">
          ← Back to Vichar·Setu
        </Link>
      </div>
    )
  }

  const { type, poll } = data

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      {/* Minimal top bar */}
      <header className="border-b border-paper-border py-4 px-5">
        <Link to="/" className="flex items-center gap-1 w-fit">
          <span className="font-serif text-lg text-ink">Vichar</span>
          <span className="text-amber text-lg font-serif"> · </span>
          <span className="font-serif text-lg text-ink">Setu</span>
        </Link>
      </header>

      <main className="flex-1 flex items-start justify-center px-5 py-12">
        <div className="w-full max-w-lg animate-scale-in">
          {/* Poll header */}
          <div className="mb-8">
            {type === 'results' && (
              <span className="inline-flex items-center gap-1.5 text-2xs font-medium px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Results published
              </span>
            )}
            {type === 'already_voted' && (
              <span className="inline-flex items-center gap-1.5 text-2xs font-medium px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Vote submitted
              </span>
            )}
            {type === 'poll' && (
              <span className="inline-flex items-center gap-1.5 text-2xs font-medium px-2 py-1 rounded-full bg-amber-faint text-amber border border-amber/20 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />
                Live · closes {formatDate(poll.expiresAt)}
              </span>
            )}

            <h1 className="font-serif text-3xl text-ink mb-2 leading-tight">
              {poll.questionText}
            </h1>
            {poll.description && (
              <p className="text-sm text-ink-muted">{poll.description}</p>
            )}
          </div>

          <div className="divider mb-8" />

          {type === 'poll' && (
            <VoteView
              poll={poll}
              options={data.options}
              onVoteSuccess={fetchPoll}
            />
          )}

          {type === 'already_voted' && (
            <AlreadyVotedView
              options={data.options}
              selectedOptionId={data.selectedOptionId}
            />
          )}

          {type === 'results' && (
            <ResultsView results={data.results} totalResponses={data.totalResponses} />
          )}
        </div>
      </main>
    </div>
  )
}
