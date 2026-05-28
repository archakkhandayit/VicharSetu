import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import StatusPill from '../ui/StatusPill'
import Button from '../ui/Button'
import { formatDate, getPollUrl, copyToClipboard, isExpired } from '../../utils/helpers.js'
import { publishPollResults, deletePoll } from '../../services/api'

export default function PollCard({ poll, onUpdate, onDelete }) {
  const navigate = useNavigate()
  const [publishing, setPublishing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const pollUrl = getPollUrl(poll.publicLink)
  const expired = isExpired(poll.expiresAt)
  const canPublish = !poll.isPublished && (expired || poll.totalResponses > 0)

  const handleCopy = async () => {
    const ok = await copyToClipboard(pollUrl)
    if (ok) toast.success('Link copied!')
    else toast.error('Could not copy')
  }

  const handlePublish = async () => {
    if (!window.confirm('Publish results? Voting will close and results will be visible to everyone.')) return
    setPublishing(true)
    try {
      await publishPollResults(poll._id)
      toast.success('Results published!')
      onUpdate?.()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish')
    } finally {
      setPublishing(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this poll? This cannot be undone.')) return
    setDeleting(true)
    try {
      await deletePoll(poll._id)
      toast.success('Poll deleted')
      onDelete?.(poll._id)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="card p-5 hover:shadow-card-hover transition-shadow duration-200 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="font-medium text-md text-ink truncate">{poll.title}</h3>
          {poll.description && (
            <p className="text-sm text-ink-muted mt-0.5 truncate">{poll.description}</p>
          )}
        </div>
        <StatusPill poll={poll} />
      </div>

      {/* Question */}
      <p className="text-sm text-ink-soft font-serif italic mb-4 leading-snug">
        "{poll.questionText}"
      </p>

      {/* Stats row */}
      <div className="flex items-center gap-4 mb-4">
        <div>
          <p className="text-2xs text-ink-faint uppercase tracking-wide">Responses</p>
          <p className="text-2xl font-serif text-ink">{poll.totalResponses}</p>
        </div>
        <div className="w-px h-8 bg-paper-border" />
        <div>
          <p className="text-2xs text-ink-faint uppercase tracking-wide">Expires</p>
          <p className="text-sm text-ink-muted">{formatDate(poll.expiresAt)}</p>
        </div>
        <div className="w-px h-8 bg-paper-border" />
        <div>
          <p className="text-2xs text-ink-faint uppercase tracking-wide">Mode</p>
          <p className="text-sm text-ink-muted capitalize">{poll.responseMode}</p>
        </div>
      </div>

      <div className="divider mb-4" />

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* View analytics (owner private) */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/polls/${poll._id}/analytics`)}
        >
          Analytics
        </Button>

        {/* Copy link */}
        <Button variant="ghost" size="sm" onClick={handleCopy}>
          Copy link
        </Button>

        {/* Publish results */}
        {!poll.isPublished && (
          <Button
            size="sm"
            loading={publishing}
            onClick={handlePublish}
            disabled={publishing}
          >
            Publish results
          </Button>
        )}

        {/* Published badge */}
        {poll.isPublished && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(`/p/${poll.publicLink}`, '_blank')}
          >
            View results ↗
          </Button>
        )}

        {/* Delete */}
        <Button
          variant="danger"
          size="sm"
          loading={deleting}
          onClick={handleDelete}
          className="ml-auto"
        >
          Delete
        </Button>
      </div>
    </div>
  )
}