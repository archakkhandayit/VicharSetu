import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Navbar from '../components/layout/Navbar'
import Button from '../components/ui/Button'
import StatusPill from '../components/ui/StatusPill'
import { getPollAnalytics, publishPollResults } from '../services/api.js'
import socket from '../services/socket.js'
import { formatDate, getPollUrl, copyToClipboard } from '../utils/helpers.js'

export default function AnalyticsPage() {
  const { pollId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [isLive, setIsLive] = useState(() => socket.connected)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getPollAnalytics(pollId)
        setData(res.data)
      } catch (err) {
        toast.error(err.response?.data?.message || 'Could not load analytics')
        navigate('/dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetch()

    // Socket real-time events
    const onConnect = () => setIsLive(true)
    const onDisconnect = () => setIsLive(false)

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)

    // Scoped connection: connect only while viewing Analytics
    socket.connect()
    socket.emit('join_poll', pollId)

    const handleUpdate = (payload) => {
      // Handles lean delta payload ({ totalResponses, votes: { [optionId]: count } })
      if (payload && payload.votes) {
        setData((prev) => {
          if (!prev) return prev
          const updatedTotal =
            payload.totalResponses !== undefined
              ? payload.totalResponses
              : prev.poll.totalResponses
          const updatedResults = prev.results.map((r) => ({
            ...r,
            votes:
              payload.votes[r.optionId] !== undefined
                ? payload.votes[r.optionId]
                : r.votes,
          }))
          return {
            ...prev,
            poll: {
              ...prev.poll,
              totalResponses: updatedTotal,
            },
            results: updatedResults,
          }
        })
      } else if (payload?.poll?._id === pollId) {
        // Fallback for full payload
        setData(payload)
      }
    }

    const handleSocketError = (err) => {
      if (err?.code === 'FORBIDDEN' || err?.code === 'UNAUTHORIZED') {
        setIsLive(false)
      }
    }

    const handleStaticPoll = () => {
      setIsLive(false)
    }

    socket.on('poll_analytics_updated', handleUpdate)
    socket.on('error', handleSocketError)
    socket.on('poll_static', handleStaticPoll)

    return () => {
      socket.emit('leave_poll', pollId)
      socket.off('poll_analytics_updated', handleUpdate)
      socket.off('error', handleSocketError)
      socket.off('poll_static', handleStaticPoll)
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      // Disconnect socket immediately upon leaving analytics page to release server resources
      socket.disconnect()
    }
  }, [pollId, navigate])

  const handlePublish = async () => {
    if (!window.confirm('Publish results? Voting will close and results will be visible to everyone at the poll link.')) return
    setPublishing(true)
    try {
      await publishPollResults(pollId)
      toast.success('Results published!')
      // Refresh data
      const res = await getPollAnalytics(pollId)
      setData(res.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish')
    } finally {
      setPublishing(false)
    }
  }

  const handleCopy = async () => {
    if (!data) return
    const ok = await copyToClipboard(getPollUrl(data.poll.publicLink))
    if (ok) toast.success('Link copied!')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <span className="w-5 h-5 border-2 border-amber border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  const { poll, results } = data
  const totalVotes = results.reduce((acc, r) => acc + r.votes, 0)
  const topOption = results.length > 0 ? results.reduce((a, b) => (a.votes > b.votes ? a : b)) : null

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <main className="max-w-4xl mx-auto px-5 py-10">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-ink-muted hover:text-ink transition-colors mb-4 flex items-center gap-1"
          >
            ← Dashboard
          </button>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs text-ink-faint uppercase tracking-widest">Analytics</p>
                {isLive && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-2xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live
                  </span>
                )}
              </div>
              <h1 className="font-serif text-3xl text-ink leading-tight">{poll.title}</h1>
              <p className="font-serif text-lg text-ink-muted italic mt-1">"{poll.questionText}"</p>
            </div>
            <StatusPill poll={poll} />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Total responses', value: totalVotes },
            { label: 'Options', value: results.length },
            { label: 'Expires', value: formatDate(poll.expiresAt) },
            { label: 'Mode', value: poll.responseMode },
          ].map((s) => (
            <div key={s.label} className="card p-4">
              <p className="text-2xs text-ink-faint uppercase tracking-wide mb-1">{s.label}</p>
              <p className={`font-serif text-ink ${typeof s.value === 'number' ? 'text-3xl' : 'text-lg'}`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Results */}
        <div className="card p-6 mb-6">
          <h2 className="text-sm font-medium text-ink-soft uppercase tracking-wider mb-6">
            Results breakdown
          </h2>

          {results.length === 0 ? (
            <p className="text-sm text-ink-muted text-center py-8">No responses yet.</p>
          ) : (
            <div className="flex flex-col gap-5">
              {results
                .sort((a, b) => b.votes - a.votes)
                .map((r, i) => {
                  const pct = totalVotes > 0 ? ((r.votes / totalVotes) * 100).toFixed(1) : 0
                  const isTop = r.optionId === topOption?.optionId

                  return (
                    <div key={r.optionId} className="animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-ink font-medium">{r.optionText}</span>
                          {isTop && totalVotes > 0 && (
                            <span className="text-2xs text-amber border border-amber/20 bg-amber-faint px-2 py-0.5 rounded-full">
                              leading
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium text-ink tabular-nums">{pct}%</span>
                          <span className="text-xs text-ink-faint ml-2 tabular-nums">
                            {r.votes} vote{r.votes !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <div className="h-2.5 bg-paper-warm rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${pct}%`,
                            background: isTop ? '#C4621A' : '#DDD9D3',
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-ink">
              {poll.isPublished ? 'Results are public' : 'Results are private'}
            </p>
            <p className="text-xs text-ink-muted mt-0.5">
              {poll.isPublished
                ? 'Anyone with the poll link can see these results.'
                : 'Only you can see this. Publish to share results on the poll link.'}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              Copy link
            </Button>
            {!poll.isPublished ? (
              <Button size="sm" loading={publishing} onClick={handlePublish}>
                Publish results
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(`/p/${poll.publicLink}`, '_blank')}
              >
                View public page ↗
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}