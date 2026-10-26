import { useEffect, useMemo, useState } from 'react'

const API_URL = 'http://localhost:5000/api'

function getLocalDateValue(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function isSameLocalDay(value, dateString) {
  if (!value || !dateString) return false

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false

  return getLocalDateValue(date) === dateString
}

function formatDate(value) {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleString([], {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function Attendance() {
  const [members, setMembers] = useState([])
  const [records, setRecords] = useState([])
  const [memberId, setMemberId] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('success')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState(getLocalDateValue())
  const [statusFilter, setStatusFilter] = useState('All')

  async function loadData() {
    try {
      const [membersResponse, attendanceResponse] = await Promise.all([
        fetch(`${API_URL}/members`),
        fetch(`${API_URL}/attendance`),
      ])

      if (!membersResponse.ok) {
        throw new Error('Failed to load members.')
      }

      if (!attendanceResponse.ok) {
        throw new Error('Failed to load attendance records.')
      }

      const membersData = await membersResponse.json()
      const attendanceData = await attendanceResponse.json()

      if (!Array.isArray(membersData) || !Array.isArray(attendanceData)) {
        throw new Error('The server returned an unexpected data format.')
      }

      setMembers(membersData)
      setRecords(attendanceData)

      setMemberId((currentId) =>
        membersData.some((member) => member._id === currentId)
          ? currentId
          : ''
      )

      setMessage('')
    } catch (error) {
      setMessage(error.message || 'Unable to connect to the server.')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function checkIn() {
    if (!memberId || saving) {
      if (!memberId) {
        setMessage('Please select a member first.')
        setMessageType('error')
      }
      return
    }

    setSaving(true)
    setMessage('')

    try {
      const response = await fetch(`${API_URL}/attendance/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.message || 'Check-in failed.')
      }

      setMessage(data.message || 'Member checked in successfully.')
      setMessageType('success')
      await loadData()
    } catch (error) {
      setMessage(error.message || 'Check-in failed.')
      setMessageType('error')
    } finally {
      setSaving(false)
    }
  }

  async function checkOut(recordId) {
    if (saving) return

    setSaving(true)
    setMessage('')

    try {
      const response = await fetch(
        `${API_URL}/attendance/check-out/${recordId}`,
        { method: 'PUT' }
      )

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.message || 'Check-out failed.')
      }

      setMessage(data.message || 'Member checked out successfully.')
      setMessageType('success')
      await loadData()
    } catch (error) {
      setMessage(error.message || 'Check-out failed.')
      setMessageType('error')
    } finally {
      setSaving(false)
    }
  }

  const today = getLocalDateValue()

  const presentCount = records.filter(
    (record) => record.checkIn && !record.checkOut
  ).length

  const todayRecords = records.filter(
    (record) => isSameLocalDay(record.checkIn, today)
  )

  const todayPresentCount = todayRecords.filter(
    (record) => !record.checkOut
  ).length

  const todayCompletedCount = todayRecords.filter(
    (record) => Boolean(record.checkOut)
  ).length

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase()

    return records.filter((record) => {
      const name = record.member?.name || 'Member unavailable'
      const phone = record.member?.phone || ''

      const matchesSearch =
        name.toLowerCase().includes(query) ||
        phone.toLowerCase().includes(query)

      const matchesDate =
        !dateFilter || isSameLocalDay(record.checkIn, dateFilter)

      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Present' && !record.checkOut) ||
        (statusFilter === 'Completed' && Boolean(record.checkOut))

      return matchesSearch && matchesDate && matchesStatus
    })
  }, [records, search, dateFilter, statusFilter])

  return (
    <div className="page-content attendance-page">
      <div className="attendance-page-header">
        <div>
          <span className="attendance-eyebrow">GYM MANAGEMENT</span>
          <h1>Attendance</h1>
          <p>Track member check-ins, check-outs and daily gym activity.</p>
        </div>

        <button
          type="button"
          className="attendance-refresh-btn"
          onClick={loadData}
          disabled={saving}
        >
          <span aria-hidden="true">↻</span> Refresh Records
        </button>
      </div>

      {message && (
        <div
          className={`attendance-alert ${messageType === 'error' ? 'attendance-alert-error' : 'attendance-alert-success'}`}
          role={messageType === 'error' ? 'alert' : 'status'}
        >
          <span>{message}</span>
          <button
            type="button"
            className="attendance-alert-close"
            onClick={() => setMessage('')}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      <div className="attendance-stats-grid">
        <div className="attendance-stat-card">
          <div className="attendance-stat-icon attendance-stat-teal">P</div>
          <div>
            <span className="attendance-stat-label">Currently Present</span>
            <strong>{loading ? '—' : presentCount}</strong>
            <small>Members checked in, not checked out</small>
          </div>
        </div>

        <div className="attendance-stat-card">
          <div className="attendance-stat-icon attendance-stat-blue">T</div>
          <div>
            <span className="attendance-stat-label">Today's Check-ins</span>
            <strong>{loading ? '—' : todayRecords.length}</strong>
            <small>Total visits started today</small>
          </div>
        </div>

        <div className="attendance-stat-card">
          <div className="attendance-stat-icon attendance-stat-purple">C</div>
          <div>
            <span className="attendance-stat-label">Completed Today</span>
            <strong>{loading ? '—' : todayCompletedCount}</strong>
            <small>Visits with check-out recorded</small>
          </div>
        </div>

        <div className="attendance-stat-card">
          <div className="attendance-stat-icon attendance-stat-amber">R</div>
          <div>
            <span className="attendance-stat-label">All-Time Records</span>
            <strong>{loading ? '—' : records.length}</strong>
            <small>Total attendance entries</small>
          </div>
        </div>
      </div>

      <div className="attendance-checkin-card">
        <div className="attendance-checkin-heading">
          <div className="attendance-checkin-icon" aria-hidden="true">
            ✓
          </div>
          <div>
            <h2>Member Check-In</h2>
            <p>Select a registered member to record their visit.</p>
          </div>
        </div>

        <div className="attendance-checkin-form">
          <div className="attendance-field">
            <label htmlFor="attendance-member">Select Gym Member</label>
            <select
              id="attendance-member"
              value={memberId}
              onChange={(event) => setMemberId(event.target.value)}
              disabled={loading || members.length === 0 || saving}
            >
              <option value="">Choose a member...</option>
              {members.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name || 'Unnamed member'}
                  {member.phone ? ` — ${member.phone}` : ''}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="attendance-checkin-btn"
            onClick={checkIn}
            disabled={!memberId || saving || loading}
          >
            {saving ? 'Please wait...' : '✓  Check In Member'}
          </button>
        </div>

        {members.length === 0 && !loading && (
          <p className="attendance-helper">
            No members found. Add a member before recording attendance.
          </p>
        )}

        {todayPresentCount > 0 && (
          <p className="attendance-helper">
            {todayPresentCount} {todayPresentCount === 1 ? 'member is' : 'members are'} currently present from today's check-ins.
          </p>
        )}
      </div>

      <div className="attendance-history-card">
        <div className="attendance-history-heading">
          <div>
            <h2>Attendance History</h2>
            <p>Search visits and manage outstanding check-outs.</p>
          </div>
          <span className="attendance-record-count">
            {filteredRecords.length} {filteredRecords.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        <div className="attendance-toolbar">
          <div className="attendance-search">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              aria-label="Search attendance records"
              placeholder="Search member name or phone..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <input
            className="attendance-date-filter"
            type="date"
            aria-label="Filter attendance by check-in date"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
          />

          <select
            className="attendance-status-filter"
            aria-label="Filter by attendance status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Completed">Completed</option>
          </select>

          <button
            type="button"
            className="attendance-clear-btn"
            onClick={() => {
              setSearch('')
              setDateFilter('')
              setStatusFilter('All')
            }}
          >
            Clear
          </button>
        </div>

        {loading ? (
          <div className="attendance-state">
            <div className="attendance-loader" />
            <p>Loading attendance records...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="attendance-state">
            <div className="attendance-empty-icon">A</div>
            <h3>{records.length === 0 ? 'No attendance records yet' : 'No matching records'}</h3>
            <p>
              {records.length === 0
                ? 'Check in a member to create your first attendance record.'
                : 'Try changing the date, search term or status filter.'}
            </p>
            {records.length > 0 && (
              <button
                type="button"
                className="attendance-clear-btn"
                onClick={() => {
                  setSearch('')
                  setDateFilter('')
                  setStatusFilter('All')
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="attendance-table-wrapper">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>MEMBER</th>
                  <th>CHECK-IN TIME</th>
                  <th>CHECK-OUT TIME</th>
                  <th>STATUS</th>
                  <th className="attendance-action-heading">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => {
                  const isPresent = !record.checkOut
                  const memberName = record.member?.name || 'Member unavailable'

                  return (
                    <tr key={record._id}>
                      <td>
                        <div className="attendance-person">
                          <div className="attendance-avatar">
                            {memberName.trim().charAt(0).toUpperCase()}
                          </div>
                          <div className="attendance-person-details">
                            <strong>{memberName}</strong>
                            <span>{record.member?.phone || 'No phone number'}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="attendance-time">
                          {formatDate(record.checkIn)}
                        </span>
                      </td>
                      <td>
                        <span className="attendance-time">
                          {formatDate(record.checkOut)}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`attendance-status-badge ${isPresent ? 'attendance-status-present' : 'attendance-status-completed'}`}
                        >
                          <span className="attendance-status-dot" />
                          {isPresent ? 'Present' : 'Completed'}
                        </span>
                      </td>
                      <td>
                        {isPresent ? (
                          <button
                            type="button"
                            className="attendance-checkout-btn"
                            onClick={() => checkOut(record._id)}
                            disabled={saving}
                          >
                            {saving ? 'Please wait...' : 'Check Out'}
                          </button>
                        ) : (
                          <span className="attendance-finished">Visit ended</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredRecords.length > 0 && (
          <div className="attendance-table-footer">
            Showing <strong>{filteredRecords.length}</strong> of{' '}
            <strong>{records.length}</strong> attendance records
          </div>
        )}
      </div>
    </div>
  )
}