import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import PollCard from '../components/poll/PollCard'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import { getMyPolls } from '../services/api'
import useAuthStore from '../store/authStore'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchPolls = async () => {
    try {
      const res = await getMyPolls()
      setPolls(res.data.polls)
    } catch {
      // silently fail, user will see empty state
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPolls()
  }, [])

  const handleDelete = (pollId) => {
    setPolls((prev) => prev.filter((p) => p._id !== pollId))
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <main className="max-w-4xl mx-auto px-5 py-10">
        {/* Page header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs text-ink-faint uppercase tracking-widest mb-1">Dashboard</p>
            <h1 className="font-serif text-3xl text-ink">
              {user?.name ? `${user.name.split(' ')[0]}'s polls` : 'My polls'}
            </h1>
          </div>
          <Button onClick={() => navigate('/polls/new')}>
            New poll
          </Button>
        </div>

        {/* Stats bar */}
        {polls.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { label: 'Total polls', value: polls.length },
              {
                label: 'Live now',
                value: polls.filter((p) => !p.isPublished && new Date() < new Date(p.expiresAt)).length,
              },
              {
                label: 'Total responses',
                value: polls.reduce((acc, p) => acc + p.totalResponses, 0),
              },
            ].map((s) => (
              <div key={s.label} className="card p-4">
                <p className="text-2xs text-ink-faint uppercase tracking-wide mb-1">{s.label}</p>
                <p className="font-serif text-3xl text-ink">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Poll list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="w-5 h-5 border-2 border-amber border-t-transparent rounded-full animate-spin" />
          </div>
        ) : polls.length === 0 ? (
          <EmptyState
            title="No polls yet"
            description="Create your first poll and start collecting responses."
            action={
              <Button onClick={() => navigate('/polls/new')}>
                Create your first poll →
              </Button>
            }
          />
        ) : (
          <div className="flex flex-col gap-4">
            {polls.map((poll) => (
              <PollCard
                key={poll._id}
                poll={poll}
                onUpdate={fetchPolls}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}