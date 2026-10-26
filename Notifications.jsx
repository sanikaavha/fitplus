
import { useEffect, useState } from 'react'
import './Notifications.css'

const API = 'http://localhost:5000/api'

function Notifications() {
  const [memberships, setMemberships] = useState([])
  const [healthLogs, setHealthLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dismissed, setDismissed] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem('fitpulse-dismissed-notifications') || '[]'
      )
    } catch {
      return []
    }
  })

  useEffect(() => {
    let mounted = true

    async function loadNotifications() {
      try {
        const response = await fetch(`${API}/memberships`)

        if (!response.ok) {
          throw new Error('Could not load memberships.')
        }

        const data = await response.json()

        if (!Array.isArray(data)) {
          throw new Error('Unexpected membership data.')
        }

        const savedLogs = JSON.parse(
          localStorage.getItem('fitpulse-health-logs') || '[]'
        )

        if (mounted) {
          setMemberships(data)
          setHealthLogs(Array.isArray(savedLogs) ? savedLogs : [])
          setError('')
        }
      } catch (err) {
        if (mounted) {
          setError(
            'Could not load membership reminders. Please check that your backend is running.'
          )
        }
        console.error(err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadNotifications()

    return () => {
      mounted = false
    }
  }, [])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const notifications = []

  memberships.forEach((membership) => {
    if (!membership.expiryDate || membership.status !== 'Active') return

    const expiry = new Date(membership.expiryDate)
    if (Number.isNaN(expiry.getTime())) return

    expiry.setHours(0, 0, 0, 0)

    const daysLeft = Math.ceil(
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysLeft < 0 || daysLeft > 7) return

    const memberName =
      membership.member?.name ||
      membership.memberName ||
      'Gym member'

    notifications.push({
      id: `membership-${membership._id || memberName}-${membership.expiryDate}`,
      type: 'membership',
      title:
        daysLeft === 0
          ? 'Membership expires today'
          : daysLeft === 1
            ? 'Membership expires tomorrow'
            : 'Membership expiring soon',
      message: `${memberName}'s ${membership.plan || ''} membership ${
        daysLeft === 0
          ? 'expires today.'
          : `expires in ${daysLeft} days.`
      }`,
      date: expiry,
      priority: daysLeft <= 1 ? 'High priority' : 'Reminder',
    })
  })

  const latestLog = [...healthLogs]
    .filter((log) => log && log.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0]

  if (latestLog) {
    const todayString = today.toDateString()
    const logDate = new Date(latestLog.date)

    if (!Number.isNaN(logDate.getTime()) && logDate.toDateString() === todayString) {
      notifications.push({
        id: `health-${latestLog.id || latestLog.date}`,
        type: 'health',
        title: 'Daily health progress recorded',
        message: `Today's progress has been saved. ${
          Number(latestLog.water) || 0
        } glasses of water and ${Number(latestLog.workouts) || 0} workouts recorded.`,
        date: logDate,
        priority: 'Information',
      })
    }
  }

  const visibleNotifications = notifications
    .filter((item) => !dismissed.includes(item.id))
    .sort((a, b) => a.date - b.date)

  function dismissNotification(id) {
    const updated = [...dismissed, id]
    setDismissed(updated)
    localStorage.setItem(
      'fitpulse-dismissed-notifications',
      JSON.stringify(updated)
    )
  }

  function clearDismissed() {
    setDismissed([])
    localStorage.removeItem('fitpulse-dismissed-notifications')
  }

  return (
    <div className="notifications-page">
      <section className="notifications-header">
        <div>
          <span className="notifications-eyebrow">FITPULSE ALERT CENTRE</span>
          <h2>Smart Notifications</h2>
          <p>Important reminders to help keep your gym running smoothly.</p>
        </div>

        <div className="notification-count">
          <span>🔔</span>
          <strong>{visibleNotifications.length}</strong>
          <small>Active alerts</small>
        </div>
      </section>

      {error && <div className="notification-error">{error}</div>}

      <section className="notification-summary">
        <article>
          <span className="summary-icon">📅</span>
          <div>
            <strong>
              {memberships.filter((membership) => {
                if (!membership.expiryDate || membership.status !== 'Active') {
                  return false
                }

                const expiry = new Date(membership.expiryDate)
                expiry.setHours(0, 0, 0, 0)

                const daysLeft = Math.ceil(
                  (expiry.getTime() - today.getTime()) / 86400000
                )

                return daysLeft >= 0 && daysLeft <= 7
              }).length}
            </strong>
            <span>Memberships expiring in 7 days</span>
          </div>
        </article>

        <article>
          <span className="summary-icon">🔔</span>
          <div>
            <strong>{visibleNotifications.length}</strong>
            <span>Undismissed notifications</span>
          </div>
        </article>
      </section>

      <section className="notifications-list-panel">
        <div className="notifications-list-heading">
          <div>
            <h3>Your reminders</h3>
            <p>Membership alerts update whenever you reopen this page.</p>
          </div>

          {dismissed.length > 0 && (
            <button type="button" onClick={clearDismissed}>
              Restore dismissed
            </button>
          )}
        </div>

        {loading ? (
          <p className="notifications-empty">Loading your reminders...</p>
        ) : visibleNotifications.length === 0 ? (
          <div className="notifications-empty">
            <span>🎉</span>
            <h3>You're all caught up!</h3>
            <p>No new membership expiry alerts at the moment.</p>
          </div>
        ) : (
          <div className="notification-items">
            {visibleNotifications.map((item) => (
              <article
                className={`notification-item ${
                  item.priority === 'High priority' ? 'urgent' : ''
                }`}
                key={item.id}
              >
                <div className="notification-item-icon">
                  {item.type === 'membership' ? '📅' : '❤️'}
                </div>

                <div className="notification-item-content">
                  <div className="notification-item-top">
                    <h4>{item.title}</h4>
                    <span
                      className={`notification-priority ${
                        item.priority === 'High priority' ? 'high' : ''
                      }`}
                    >
                      {item.priority}
                    </span>
                  </div>

                  <p>{item.message}</p>

                  <small>
                    {item.date.toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </small>
                </div>

                <button
                  type="button"
                  className="dismiss-notification"
                  onClick={() => dismissNotification(item.id)}
                >
                  Dismiss
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <p className="notifications-note">
        Note: These are in-app reminders. This version does not send SMS,
        WhatsApp messages, emails, or background push notifications.
      </p>
    </div>
  )
}

export default Notifications
