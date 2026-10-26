
import { useEffect, useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Members from './pages/Members'
import AddMember from './pages/AddMember'
import Attendance from './pages/Attendance'
import Memberships from './pages/Membership'
import Trainers from './pages/Trainers'
import Payments from './pages/Payments'
import Nutrition from './pages/Nutrition'
import HealthChatbot from './pages/HealthChatbot'
import HealthDashboard from './pages/HealthDashboard'
import Notifications from './pages/Notifications'
import GymUpdates from './pages/GymUpdates'
import WeeklyDietCalendar from './pages/WeeklyDietCalendar'
import WeeklyProgressReport from './pages/WeeklyProgressReport'
import './App.css'

const API = 'http://localhost:5000/api'

function Dashboard() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMemberships: 0,
    todayAttendance: 0,
    monthlyRevenue: 0,
  })

  const [weeklyAttendance, setWeeklyAttendance] = useState([])
  const [revenueTrend, setRevenueTrend] = useState([])
  const [membershipMix, setMembershipMix] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [expiringMemberships, setExpiringMemberships] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)

  const formatDate = (date) =>
    new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)

  useEffect(() => {
    let isMounted = true

    async function loadDashboardStats(showLoading = false) {
      try {
        if (showLoading && isMounted) setLoading(true)

        const [membersRes, membershipsRes, attendanceRes, paymentsRes] =
          await Promise.all([
            fetch(`${API}/members`),
            fetch(`${API}/memberships`),
            fetch(`${API}/attendance`),
            fetch(`${API}/payments`),
          ])

        if (
          !membersRes.ok ||
          !membershipsRes.ok ||
          !attendanceRes.ok ||
          !paymentsRes.ok
        ) {
          throw new Error('Unable to load dashboard data.')
        }

        const [members, memberships, attendance, payments] =
          await Promise.all([
            membersRes.json(),
            membershipsRes.json(),
            attendanceRes.json(),
            paymentsRes.json(),
          ])

        if (
          !Array.isArray(members) ||
          !Array.isArray(memberships) ||
          !Array.isArray(attendance) ||
          !Array.isArray(payments)
        ) {
          throw new Error('The backend returned an unexpected response.')
        }

        const now = new Date()
        const startOfToday = new Date(now)
        startOfToday.setHours(0, 0, 0, 0)

        const startOfTomorrow = new Date(startOfToday)
        startOfTomorrow.setDate(startOfTomorrow.getDate() + 1)

        const isSameMonth = (value, date) => {
          if (!value) return false

          const parsed = new Date(value)

          return (
            !Number.isNaN(parsed.getTime()) &&
            parsed.getMonth() === date.getMonth() &&
            parsed.getFullYear() === date.getFullYear()
          )
        }

        const paidPayments = payments.filter(
          (payment) =>
            payment.status === 'Paid' && payment.paymentDate
        )

        const monthlyRevenue = paidPayments
          .filter((payment) =>
            isSameMonth(payment.paymentDate, now)
          )
          .reduce(
            (sum, payment) =>
              sum + (Number(payment.amount) || 0),
            0
          )

        const todayAttendance = attendance.filter((record) => {
          if (!record.checkIn) return false

          const date = new Date(record.checkIn)

          return date >= startOfToday && date < startOfTomorrow
        }).length

        const weeklyData = Array.from({ length: 7 }, (_, index) => {
          const date = new Date(startOfToday)
          date.setDate(date.getDate() - (6 - index))

          const nextDate = new Date(date)
          nextDate.setDate(nextDate.getDate() + 1)

          const count = attendance.filter((record) => {
            if (!record.checkIn) return false

            const checkIn = new Date(record.checkIn)

            return checkIn >= date && checkIn < nextDate
          }).length

          return {
            day: date.toLocaleDateString('en-IN', {
              weekday: 'short',
            }),
            date: date.toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
            }),
            count,
          }
        })

        const revenueData = Array.from({ length: 6 }, (_, index) => {
          const date = new Date(
            now.getFullYear(),
            now.getMonth() - 5 + index,
            1
          )

          const total = paidPayments
            .filter((payment) =>
              isSameMonth(payment.paymentDate, date)
            )
            .reduce(
              (sum, payment) =>
                sum + (Number(payment.amount) || 0),
              0
            )

          return {
            month: date.toLocaleDateString('en-IN', {
              month: 'short',
            }),
            total,
          }
        })

        const planNames = ['Basic', 'Standard', 'Premium']
        const planColors = ['#7dd3c7', '#8bb9f4', '#c5a6f6']

        const planData = planNames.map((plan, index) => ({
          name: plan,
          count: memberships.filter(
            (membership) =>
              membership.plan === plan &&
              membership.status === 'Active'
          ).length,
          color: planColors[index],
        }))

        const recentAttendance = attendance
          .filter((record) => record.checkIn)
          .map((record) => ({
            id: `attendance-${record._id || record.id || record.checkIn}`,
            type: 'attendance',
            title:
              record.member?.name ||
              record.memberName ||
              'Gym member',
            description: 'Checked in to the gym',
            date: new Date(record.checkIn),
          }))

        const recentPayments = paidPayments.map((payment) => ({
          id: `payment-${payment._id || payment.id || payment.paymentDate}`,
          type: 'payment',
          title:
            payment.member?.name ||
            payment.memberName ||
            'Member payment',
          description: `Payment received · ${formatCurrency(
            Number(payment.amount) || 0
          )}`,
          date: new Date(payment.paymentDate),
        }))

        const activity = [...recentAttendance, ...recentPayments]
          .filter((item) => !Number.isNaN(item.date.getTime()))
          .sort((a, b) => b.date - a.date)
          .slice(0, 5)

        const expiringSoon = memberships
          .filter((membership) => {
            if (
              !membership.expiryDate ||
              membership.status !== 'Active'
            ) {
              return false
            }

            const expiry = new Date(membership.expiryDate)
            const daysLeft = Math.ceil(
              (expiry - startOfToday) / (1000 * 60 * 60 * 24)
            )

            return daysLeft >= 0 && daysLeft <= 7
          })
          .sort(
            (a, b) =>
              new Date(a.expiryDate) - new Date(b.expiryDate)
          )
          .slice(0, 5)

        if (isMounted) {
          setStats({
            totalMembers: members.length,
            activeMemberships: memberships.filter(
              (membership) => membership.status === 'Active'
            ).length,
            todayAttendance,
            monthlyRevenue,
          })

          setWeeklyAttendance(weeklyData)
          setRevenueTrend(revenueData)
          setMembershipMix(planData)
          setRecentActivity(activity)
          setExpiringMemberships(expiringSoon)
          setLastUpdated(new Date())
          setError('')
        }
      } catch (err) {
        console.error('Dashboard loading error:', err)

        if (isMounted) {
          setError(
            'Could not refresh dashboard data. Please check the backend.'
          )
        }
      } finally {
        if (isMounted) {
          setLoading(false)
          setRefreshing(false)
        }
      }
    }

    loadDashboardStats(true)

    const refreshInterval = setInterval(
      () => loadDashboardStats(false),
      10000
    )

    return () => {
      isMounted = false
      clearInterval(refreshInterval)
    }
  }, [refreshKey])

  const handleRefresh = () => {
    setRefreshing(true)
    setRefreshKey((previous) => previous + 1)
  }

  const maxAttendance = Math.max(
    ...weeklyAttendance.map((item) => item.count),
    1
  )

  const maxRevenue = Math.max(
    ...revenueTrend.map((item) => item.total),
    1
  )

  const revenuePoints = revenueTrend
    .map((item, index) => {
      const x = 8 + (index * 284) / 5
      const y = 110 - (item.total / maxRevenue) * 90

      return `${x},${y}`
    })
    .join(' ')

  const membershipTotal = membershipMix.reduce(
    (sum, item) => sum + item.count,
    0
  )

  let donutOffset = 0

  const donutGradient = membershipMix
    .map((item) => {
      const start = donutOffset
      const portion = membershipTotal
        ? (item.count / membershipTotal) * 100
        : 0

      donutOffset += portion

      return `${item.color} ${start}% ${donutOffset}%`
    })
    .join(', ')

  return (
    <div className="dashboard-page">
      <section className="welcome">
        <div className="welcome-copy">
          <span className="welcome-tag">
            <span className="status-dot" /> YOUR GYM AT A GLANCE
          </span>

          <h2>Good to see you, Admin.</h2>
          <p>Here’s what’s happening at your gym today.</p>

          <div className="welcome-meta">
            <span>◷ Live dashboard</span>
            <span>·</span>
            <span>Auto-refreshes every 10 seconds</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              marginTop: '16px',
            }}
          >
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              style={{
                border: 'none',
                borderRadius: '8px',
                padding: '10px 16px',
                background: refreshing ? '#64748b' : '#7dd3c7',
                color: '#10212b',
                fontWeight: 700,
                fontSize: '13px',
                cursor: refreshing ? 'wait' : 'pointer',
                opacity: refreshing ? 0.8 : 1,
              }}
            >
              {refreshing ? '↻ Refreshing...' : '↻ Refresh Dashboard'}
            </button>

            {lastUpdated && (
              <span style={{ fontSize: '12px', opacity: 0.75 }}>
                Last updated: {formatDate(lastUpdated)}
              </span>
            )}
          </div>
        </div>

        <div className="welcome-art" aria-hidden="true">
          <div className="welcome-art-ring">
            <span>FP</span>
          </div>
          <div className="welcome-art-dot" />
        </div>
      </section>

      {error && (
        <div className="dashboard-error" role="alert">
          <span>!</span> {error}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            style={{ marginLeft: '12px', cursor: 'pointer' }}
          >
            Try again
          </button>
        </div>
      )}

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '14px',
          marginBottom: '24px',
        }}
      >
        <Link
          to="/add-member"
          className="panel"
          style={{
            padding: '18px',
            textDecoration: 'none',
            color: 'inherit',
            display: 'block',
            transition: 'transform 0.2s ease',
          }}
        >
          <strong>＋ Add Member</strong>
          <p style={{ marginBottom: 0 }}>Register a new gym member</p>
        </Link>

        <Link
          to="/attendance"
          className="panel"
          style={{
            padding: '18px',
            textDecoration: 'none',
            color: 'inherit',
            display: 'block',
            transition: 'transform 0.2s ease',
          }}
        >
          <strong>◷ Mark Attendance</strong>
          <p style={{ marginBottom: 0 }}>Manage member check-ins</p>
        </Link>

        <Link
          to="/payments"
          className="panel"
          style={{
            padding: '18px',
            textDecoration: 'none',
            color: 'inherit',
            display: 'block',
            transition: 'transform 0.2s ease',
          }}
        >
          <strong>₹ Record Payment</strong>
          <p style={{ marginBottom: 0 }}>View and manage payments</p>
        </Link>

        <Link
          to="/memberships"
          className="panel"
          style={{
            padding: '18px',
            textDecoration: 'none',
            color: 'inherit',
            display: 'block',
            transition: 'transform 0.2s ease',
          }}
        >
          <strong>▤ View Memberships</strong>
          <p style={{ marginBottom: 0 }}>Manage member plans</p>
        </Link>

        <Link
          to="/nutrition"
          className="panel"
          style={{
            padding: '18px',
            textDecoration: 'none',
            color: 'inherit',
            display: 'block',
          }}
        >
          <strong>🥗 Nutrition Tracker</strong>
          <p style={{ marginBottom: 0 }}>
            Track food, calories and protein
          </p>
        </Link>

        <Link
          to="/weekly-diet"
          className="panel"
          style={{
            padding: '18px',
            textDecoration: 'none',
            color: 'inherit',
            display: 'block',
          }}
        >
          <strong>📅 Smart Weekly Diet Calendar</strong>
          <p style={{ marginBottom: 0 }}>
            Plan meals for all seven days of the week
          </p>
        </Link>

        <Link
          to="/weekly-report"
          className="panel"
          style={{
            padding: '18px',
            textDecoration: 'none',
            color: 'inherit',
            display: 'block',
          }}
        >
          <strong>📊 Weekly Progress Report</strong>
          <p style={{ marginBottom: 0 }}>
            Review weekly meal completion and progress
          </p>
        </Link>

        <Link
          to="/chatbot"
          className="panel"
          style={{
            padding: '18px',
            textDecoration: 'none',
            color: 'inherit',
            display: 'block',
          }}
        >
          <strong>💬 Health & Diet Chatbot</strong>
          <p style={{ marginBottom: 0 }}>
            Ask fitness and nutrition questions
          </p>
        </Link>

        <Link
          to="/gym-updates"
          className="panel"
          style={{
            padding: '18px',
            textDecoration: 'none',
            color: 'inherit',
            display: 'block',
          }}
        >
          <strong>📢 Gym Live Updates</strong>
          <p style={{ marginBottom: 0 }}>
            Publish announcements and gym notices
          </p>
        </Link>

        <Link
          to="/health-dashboard"
          className="panel"
          style={{
            padding: '18px',
            textDecoration: 'none',
            color: 'inherit',
            display: 'block',
          }}
        >
          <strong>❤️ Personal Health Dashboard</strong>
          <p style={{ marginBottom: 0 }}>
            Track weight, water, workouts and health goals
          </p>
        </Link>

        <Link
          to="/notifications"
          className="panel"
          style={{
            padding: '18px',
            textDecoration: 'none',
            color: 'inherit',
            display: 'block',
          }}
        >
          <strong>🔔 Smart Notifications</strong>
          <p style={{ marginBottom: 0 }}>
            Check membership reminders and alerts
          </p>
        </Link>
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <div className="stat-top">
            <span>Total Members</span>
            <span className="stat-icon purple">♙</span>
          </div>
          <h3>
            {loading ? '—' : stats.totalMembers.toLocaleString('en-IN')}
          </h3>
          <p>
            <span className="stat-caption-dot purple-dot" /> Registered members
          </p>
        </article>

        <article className="stat-card">
          <div className="stat-top">
            <span>Active Memberships</span>
            <span className="stat-icon green">✓</span>
          </div>
          <h3>
            {loading ? '—' : stats.activeMemberships.toLocaleString('en-IN')}
          </h3>
          <p>
            <span className="stat-caption-dot green-dot" /> Currently active plans
          </p>
        </article>

        <article className="stat-card">
          <div className="stat-top">
            <span>Today's Attendance</span>
            <span className="stat-icon orange">◷</span>
          </div>
          <h3>
            {loading ? '—' : stats.todayAttendance.toLocaleString('en-IN')}
          </h3>
          <p>
            <span className="stat-caption-dot orange-dot" /> Check-ins recorded today
          </p>
        </article>

        <article className="stat-card">
          <div className="stat-top">
            <span>Monthly Revenue</span>
            <span className="stat-icon blue">₹</span>
          </div>
          <h3 className="revenue-number">
            {loading ? '—' : formatCurrency(stats.monthlyRevenue)}
          </h3>
          <p>
            <span className="stat-caption-dot blue-dot" /> Paid this month
          </p>
        </article>
      </section>

      <section className="dashboard-charts">
        <article className="panel attendance-panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">ACTIVITY</span>
              <h3>Attendance overview</h3>
              <p>Daily gym check-ins over the last 7 days</p>
            </div>
            <span className="panel-icon">▥</span>
          </div>

          <div className="attendance-chart">
            {weeklyAttendance.map((item, index) => {
              const height =
                item.count === 0
                  ? 3
                  : Math.max((item.count / maxAttendance) * 100, 8)

              return (
                <div
                  className="attendance-column"
                  key={`${item.date}-${index}`}
                >
                  <span className="attendance-value">{item.count}</span>

                  <div className="attendance-bar-area">
                    <div
                      className={`attendance-bar ${
                        index === 6 ? 'today-bar' : ''
                      }`}
                      style={{ height: `${height}%` }}
                      title={`${item.count} check-ins on ${item.date}`}
                    />
                  </div>

                  <span className="attendance-day">{item.day}</span>
                </div>
              )
            })}
          </div>

          <div className="chart-footer">
            <span>
              <span className="legend-dot teal-dot" /> Check-ins
            </span>
            <span>
              {weeklyAttendance.reduce((sum, item) => sum + item.count, 0)} total
              this week
            </span>
          </div>
        </article>

        <article className="panel revenue-panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">FINANCIALS</span>
              <h3>Revenue trend</h3>
              <p>Paid payments across the last 6 months</p>
            </div>
            <span className="panel-icon">↗</span>
          </div>

          <div className="revenue-chart">
            {revenueTrend.length > 0 ? (
              <>
                <div className="revenue-chart-total">
                  {loading ? 'Loading...' : formatCurrency(stats.monthlyRevenue)}
                  <span>This month</span>
                </div>

                <svg
                  className="revenue-svg"
                  viewBox="0 0 300 130"
                  role="img"
                  aria-label="Revenue trend for the last six months"
                >
                  <line
                    x1="8"
                    y1="110"
                    x2="292"
                    y2="110"
                    className="chart-grid-line"
                  />
                  <line
                    x1="8"
                    y1="65"
                    x2="292"
                    y2="65"
                    className="chart-grid-line"
                  />
                  <line
                    x1="8"
                    y1="20"
                    x2="292"
                    y2="20"
                    className="chart-grid-line"
                  />

                  <polyline points={revenuePoints} className="revenue-line" />

                  {revenueTrend.map((item, index) => {
                    const x = 8 + (index * 284) / 5
                    const y = 110 - (item.total / maxRevenue) * 90

                    return (
                      <circle
                        key={item.month}
                        cx={x}
                        cy={y}
                        r="3.5"
                        className="revenue-point"
                      >
                        <title>
                          {`${item.month}: ${formatCurrency(item.total)}`}
                        </title>
                      </circle>
                    )
                  })}
                </svg>

                <div className="revenue-months">
                  {revenueTrend.map((item) => (
                    <span key={item.month}>{item.month}</span>
                  ))}
                </div>
              </>
            ) : (
              <p className="empty-state">Revenue data will appear here.</p>
            )}
          </div>
        </article>
      </section>

      <section className="dashboard-lower-grid">
        <article className="panel membership-panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">SUBSCRIPTIONS</span>
              <h3>Membership mix</h3>
              <p>Active plans by membership type</p>
            </div>
          </div>

          <div className="membership-content">
            <div
              className="membership-donut"
              style={{
                background:
                  membershipTotal > 0
                    ? `conic-gradient(${donutGradient})`
                    : 'conic-gradient(#29364a 0% 100%)',
              }}
              role="img"
              aria-label={`Membership mix: ${membershipTotal} active memberships`}
            >
              <div className="donut-hole">
                <strong>{membershipTotal}</strong>
                <span>ACTIVE</span>
              </div>
            </div>

            <div className="membership-legend">
              {membershipMix.map((item) => (
                <div className="membership-legend-row" key={item.name}>
                  <span
                    className="legend-square"
                    style={{ background: item.color }}
                  />
                  <span>{item.name}</span>
                  <strong>{item.count}</strong>
                </div>
              ))}

              {membershipTotal === 0 && (
                <p className="empty-state">No active memberships yet.</p>
              )}
            </div>
          </div>
        </article>

        <article className="panel activity-panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">LATEST UPDATES</span>
              <h3>Recent activity</h3>
              <p>Latest check-ins and paid payments</p>
            </div>
          </div>

          {recentActivity.length > 0 ? (
            <div className="activity-list">
              {recentActivity.map((item) => (
                <div className="activity-item" key={item.id}>
                  <span
                    className={`activity-icon ${
                      item.type === 'payment'
                        ? 'payment-activity'
                        : 'checkin-activity'
                    }`}
                  >
                    {item.type === 'payment' ? '₹' : '✓'}
                  </span>

                  <div className="activity-details">
                    <strong>{item.title}</strong>
                    <span>{item.description}</span>
                  </div>

                  <time>{formatDate(item.date)}</time>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state activity-empty">
              {loading
                ? 'Loading recent activity...'
                : 'No recent activity to show yet.'}
            </div>
          )}
        </article>
      </section>

      <section className="panel expiring-panel">
        <div className="panel-heading">
          <div>
            <span className="section-kicker">MEMBER RETENTION</span>
            <h3>Memberships expiring soon</h3>
            <p>Active memberships ending within the next 7 days</p>
          </div>

          <Link to="/memberships" className="text-link">
            View memberships ↗
          </Link>
        </div>

        {expiringMemberships.length > 0 ? (
          <div className="expiring-list">
            {expiringMemberships.map((membership) => {
              const expiry = new Date(membership.expiryDate)
              const memberName =
                membership.member?.name ||
                membership.memberName ||
                'Gym member'

              return (
                <div
                  className="expiring-item"
                  key={
                    membership._id ||
                    `${memberName}-${membership.expiryDate}`
                  }
                >
                  <div className="expiring-avatar">
                    {memberName.charAt(0).toUpperCase()}
                  </div>

                  <div className="expiring-details">
                    <strong>{memberName}</strong>
                    <span>{membership.plan || 'Membership'} plan</span>
                  </div>

                  <div className="expiring-date">
                    <strong>
                      {expiry.toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </strong>
                    <span>Expiry date</span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="empty-state">
            {loading
              ? 'Checking membership dates...'
              : 'No active memberships are expiring in the next 7 days.'}
          </div>
        )}
      </section>

      <footer className="dashboard-footer">
        <span>© 2026 FitPulse Gym Management System</span>
        <span>
          <span className="status-dot" /> All systems operational
        </span>
      </footer>
    </div>
  )
}

function App() {
  const location = useLocation()

  const tabs = [
    'Dashboard',
    'Members',
    'Trainers',
    'Attendance',
    'Memberships',
    'Payments',
    'Nutrition',
    'Weekly Diet Calendar',
    'Weekly Progress Report',
    'Chatbot',
    'Health Dashboard',
    'Notifications',
    'Gym Updates',
  ]

  const getTabPath = (tab) => {
    const paths = {
      Dashboard: '/',
      Members: '/members',
      Trainers: '/trainers',
      Attendance: '/attendance',
      Memberships: '/memberships',
      Payments: '/payments',
      Nutrition: '/nutrition',
      'Weekly Diet Calendar': '/weekly-diet',
      'Weekly Progress Report': '/weekly-report',
      Chatbot: '/chatbot',
      'Health Dashboard': '/health-dashboard',
      Notifications: '/notifications',
      'Gym Updates': '/gym-updates',
    }

    return paths[tab]
  }

  const activeTab =
    tabs.find((tab) => getTabPath(tab) === location.pathname) ||
    (location.pathname === '/add-member' ? 'Members' : 'Dashboard')

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">F</div>
          <h1 className="logo">
            Fit<span>Pulse</span>
          </h1>
        </div>

        <p className="sidebar-label">WORKSPACE</p>

        <nav className="sidebar-nav">
          {tabs.map((tab) => (
            <Link
              key={tab}
              to={getTabPath(tab)}
              className={`nav-item ${
                activeTab === tab ? 'active' : ''
              }`}
            >
              <span className="nav-symbol">
                {tab === 'Dashboard' && '▦'}
                {tab === 'Members' && '♙'}
                {tab === 'Trainers' && '♟'}
                {tab === 'Attendance' && '◷'}
                {tab === 'Memberships' && '▤'}
                {tab === 'Payments' && '₹'}
                {tab === 'Nutrition' && '🥗'}
                {tab === 'Weekly Diet Calendar' && '📅'}
                {tab === 'Weekly Progress Report' && '📊'}
                {tab === 'Chatbot' && '💬'}
                {tab === 'Health Dashboard' && '❤️'}
                {tab === 'Notifications' && '🔔'}
                {tab === 'Gym Updates' && '📢'}
              </span>

              <span>{tab}</span>

              {activeTab === tab && (
                <span className="nav-active-mark" />
              )}
            </Link>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="avatar">A</div>
          <div className="admin-details">
            <strong>Admin User</strong>
            <small>Super Admin</small>
          </div>
          <span className="admin-menu-dot">···</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">FITPULSE / WORKSPACE</p>
            <h2>{activeTab}</h2>
          </div>

          <div className="topbar-right">
            <span className="system-status">
              <span className="status-dot" />
              System online
            </span>

            <span className="topbar-divider" />

            <div className="topbar-date">
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </div>

            <div className="avatar topbar-avatar">A</div>
          </div>
        </header>

        <div className="page-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/members" element={<Members />} />
            <Route path="/add-member" element={<AddMember />} />
            <Route path="/trainers" element={<Trainers />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/memberships" element={<Memberships />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/nutrition" element={<Nutrition />} />

            <Route
              path="/weekly-diet"
              element={<WeeklyDietCalendar />}
            />

            <Route
              path="/weekly-report"
              element={<WeeklyProgressReport />}
            />

            <Route path="/chatbot" element={<HealthChatbot />} />

            <Route
              path="/health-dashboard"
              element={<HealthDashboard />}
            />

            <Route
              path="/notifications"
              element={<Notifications />}
            />

            <Route path="/gym-updates" element={<GymUpdates />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

export default App
