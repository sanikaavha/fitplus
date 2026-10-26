import { useEffect, useState } from 'react'
import './Membership.css'

const API_URL = 'http://localhost:5000/api'

export default function Membership() {
  const [memberships, setMemberships] = useState([])
  const [members, setMembers] = useState([])
  const [memberId, setMemberId] = useState('')
  const [plan, setPlan] = useState('Basic')
  const [price, setPrice] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function loadData() {
    try {
      setLoading(true)
      setError('')

      const [membersResponse, membershipsResponse] = await Promise.all([
        fetch(`${API_URL}/members`),
        fetch(`${API_URL}/memberships`),
      ])

      if (!membersResponse.ok || !membershipsResponse.ok) {
        throw new Error('Could not load data. Please check the backend.')
      }

      const membersData = await membersResponse.json()
      const membershipsData = await membershipsResponse.json()

      setMembers(membersData)
      setMemberships(membershipsData)

      if (membersData.length > 0) {
        setMemberId((currentId) => currentId || membersData[0]._id)
      }
    } catch (err) {
      setError(err.message || 'Something went wrong while loading data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!memberId) {
      setError('Please add a gym member before creating a membership.')
      return
    }

    const enteredPrice = Number(price)

    if (
      price.trim() === '' ||
      !Number.isFinite(enteredPrice) ||
      enteredPrice <= 0
    ) {
      setError('Please enter a membership price greater than ₹0.')
      return
    }

    if (!expiryDate) {
      setError('Please select an expiry date.')
      return
    }

    // Validate the date as a calendar date in YYYY-MM-DD format.
    const dateParts = expiryDate.split('-').map(Number)
    const [year, month, day] = dateParts
    const selectedDate = new Date(Date.UTC(year, month - 1, day))

    const isValidDate =
      dateParts.length === 3 &&
      year > 0 &&
      selectedDate.getUTCFullYear() === year &&
      selectedDate.getUTCMonth() === month - 1 &&
      selectedDate.getUTCDate() === day

    if (!isValidDate) {
      setError('Please select a valid expiry date.')
      return
    }

    const today = new Date()
    const todayString = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0'),
    ].join('-')

    if (expiryDate < todayString) {
      setError('Expiry date cannot be in the past.')
      return
    }

    try {
      setSaving(true)

      const response = await fetch(`${API_URL}/memberships`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member: memberId,
          plan,
          price: enteredPrice,
          expiryDate,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Could not create membership.')
      }

      setSuccess('Membership added successfully!')
      setPrice('')
      setExpiryDate('')
      await loadData()
    } catch (err) {
      setError(err.message || 'Could not save membership.')
    } finally {
      setSaving(false)
    }
  }

  const activeCount = memberships.filter(
    (membership) => membership.status === 'Active'
  ).length

  const expiredCount = memberships.filter(
    (membership) => membership.status === 'Expired'
  ).length

  const totalValue = memberships.reduce(
    (total, membership) => total + (Number(membership.price) || 0),
    0
  )

  const filteredMemberships = memberships.filter((membership) => {
    const memberName = membership.member?.name || 'Unknown'
    const searchText =
      `${memberName} ${membership.plan || ''} ${membership.status || ''}`.toLowerCase()

    return searchText.includes(search.toLowerCase().trim())
  })

  function formatDate(date) {
    if (!date) return '—'

    const parsedDate = new Date(date)
    if (Number.isNaN(parsedDate.getTime())) return '—'

    return parsedDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    })
  }

  function formatPrice(value) {
    return `₹${(Number(value) || 0).toLocaleString('en-IN')}`
  }

  function getStatusClass(status) {
    if (status === 'Active') return 'membership-status-active'
    if (status === 'Expired') return 'membership-status-expired'
    return 'membership-status-other'
  }

  return (
    <section className="membership-page">
      <div className="membership-heading">
        <div>
          <h2>Membership Management</h2>
          <p>Manage plans, track expiry dates, and keep your members moving.</p>
        </div>

        <div className="membership-count">
          {memberships.length} Total Memberships
        </div>
      </div>

      {error && (
        <div className="membership-message membership-error" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="membership-message membership-success" role="status">
          {success}
        </div>
      )}

      <div className="membership-summary">
        <div className="membership-summary-card">
          <span>Total Memberships</span>
          <strong>{memberships.length}</strong>
          <small>All recorded gym plans</small>
        </div>

        <div className="membership-summary-card">
          <span>Active Memberships</span>
          <strong>{activeCount}</strong>
          <small>Currently marked active</small>
        </div>

        <div className="membership-summary-card">
          <span>Total Plan Value</span>
          <strong>{formatPrice(totalValue)}</strong>
          <small>Combined listed membership prices</small>
        </div>
      </div>

      <div className="membership-panel">
        <div className="membership-panel-heading">
          <div>
            <h3>Add New Membership</h3>
            <p>Assign a plan and set its expiry date.</p>
          </div>
        </div>

        {members.length === 0 && !loading && (
          <div className="membership-notice">
            No gym members found. Add a member before creating a membership.
          </div>
        )}

        <form className="membership-form" onSubmit={handleSubmit}>
          <label className="membership-field">
            Select Member
            <select
              value={memberId}
              onChange={(event) => setMemberId(event.target.value)}
              required
              disabled={members.length === 0 || saving}
            >
              <option value="">Choose a member</option>
              {members.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>

          <label className="membership-field">
            Membership Plan
            <select
              value={plan}
              onChange={(event) => setPlan(event.target.value)}
              disabled={saving}
            >
              <option value="Basic">Basic</option>
              <option value="Standard">Standard</option>
              <option value="Premium">Premium</option>
            </select>
          </label>

          <label className="membership-field">
            Price (₹)
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="Enter membership price"
              required
              disabled={saving}
            />
          </label>

          <label className="membership-field">
            Expiry Date
            <input
              type="date"
              value={expiryDate}
              onChange={(event) => setExpiryDate(event.target.value)}
              min={(() => {
                const today = new Date()
                return [
                  today.getFullYear(),
                  String(today.getMonth() + 1).padStart(2, '0'),
                  String(today.getDate()).padStart(2, '0'),
                ].join('-')
              })()}
              required
              disabled={saving}
            />
          </label>

          <button
            className="membership-submit"
            type="submit"
            disabled={saving || loading || members.length === 0}
          >
            {saving ? 'Saving Membership...' : '+ Add Membership'}
          </button>
        </form>
      </div>

      <div className="membership-panel">
        <div className="membership-table-tools">
          <div>
            <h3>All Memberships</h3>
            <p style={{ color: '#9698aa', fontSize: 13, margin: '7px 0 0' }}>
              {filteredMemberships.length} result
              {filteredMemberships.length === 1 ? '' : 's'} found
              {expiredCount > 0 ? ` · ${expiredCount} marked expired` : ''}
            </p>
          </div>

          <input
            className="membership-search"
            type="search"
            placeholder="Search member, plan, status..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search memberships"
          />
        </div>

        {loading ? (
          <p>Loading memberships...</p>
        ) : (
          <div className="membership-table-wrap">
            <table className="membership-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Plan</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Start Date</th>
                  <th>Expiry Date</th>
                </tr>
              </thead>

              <tbody>
                {filteredMemberships.length === 0 ? (
                  <tr>
                    <td className="membership-empty" colSpan="6">
                      {memberships.length === 0
                        ? 'No memberships yet. Use the form above to add one.'
                        : 'No memberships match your search.'}
                    </td>
                  </tr>
                ) : (
                  filteredMemberships.map((membership) => (
                    <tr key={membership._id}>
                      <td>
                        <span className="membership-member-name">
                          {membership.member?.name || 'Unknown'}
                        </span>
                      </td>

                      <td>
                        <span className="membership-plan">
                          {membership.plan || '—'}
                        </span>
                      </td>

                      <td>{formatPrice(membership.price)}</td>

                      <td>
                        <span
                          className={`membership-status ${getStatusClass(
                            membership.status
                          )}`}
                        >
                          {membership.status || 'Unknown'}
                        </span>
                      </td>

                      <td>{formatDate(membership.startDate)}</td>
                      <td>{formatDate(membership.expiryDate)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
