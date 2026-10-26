import { useEffect, useMemo, useState } from 'react'

function Members() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingMember, setEditingMember] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('All')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('success')

  async function fetchMembers() {
    try {
      const response = await fetch('http://localhost:5000/api/members')

      if (!response.ok) {
        throw new Error('Unable to load members.')
      }

      const data = await response.json()
      setMembers(Array.isArray(data) ? data : [])
      setError('')
    } catch {
      setError('Could not load members. Please check that the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  const filteredMembers = useMemo(() => {
    const searchText = search.trim().toLowerCase()

    return members.filter((member) => {
      const matchesSearch = [
        member.name,
        member.phone,
        member.email,
      ].some((value) => String(value || '').toLowerCase().includes(searchText))

      const matchesPlan =
        planFilter === 'All' || member.plan === planFilter

      return matchesSearch && matchesPlan
    })
  }, [members, search, planFilter])

  const planCounts = useMemo(() => ({
    Basic: members.filter((member) => member.plan === 'Basic').length,
    Standard: members.filter((member) => member.plan === 'Standard').length,
    Premium: members.filter((member) => member.plan === 'Premium').length,
  }), [members])

  function showMessage(text, type = 'success') {
    setMessage(text)
    setMessageType(type)
  }

  function startEditing(member) {
    setEditingMember({
      _id: member._id,
      name: member.name || '',
      phone: member.phone || '',
      email: member.email || '',
      plan: member.plan || 'Basic',
    })
    setMessage('')
  }

  function handleChange(event) {
    const { name, value } = event.target

    setEditingMember((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  async function handleUpdate(event) {
    event.preventDefault()

    if (saving) return

    setSaving(true)
    setMessage('')

    try {
      const response = await fetch(
        `http://localhost:5000/api/members/${editingMember._id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: editingMember.name.trim(),
            phone: editingMember.phone.trim(),
            email: editingMember.email.trim(),
            plan: editingMember.plan,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to update member.')
      }

      const updatedMember = data.member || data

      setMembers((previous) =>
        previous.map((member) =>
          member._id === editingMember._id ? updatedMember : member
        )
      )

      setEditingMember(null)
      showMessage('Member details updated successfully.')
    } catch (err) {
      showMessage(err.message || 'Could not update member.', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function deleteMember(member) {
    if (deletingId) return

    const confirmed = window.confirm(
      `Are you sure you want to delete ${member.name}? This cannot be undone.`
    )

    if (!confirmed) return

    setDeletingId(member._id)
    setMessage('')

    try {
      const response = await fetch(
        `http://localhost:5000/api/members/${member._id}`,
        { method: 'DELETE' }
      )

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.message || 'Unable to delete member.')
      }

      setMembers((previous) =>
        previous.filter((item) => item._id !== member._id)
      )

      if (editingMember?._id === member._id) {
        setEditingMember(null)
      }

      showMessage('Member deleted successfully.')
    } catch (err) {
      showMessage(err.message || 'Could not delete member.', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="page-content members-page">
      <div className="members-page-header">
        <div>
          <span className="members-eyebrow">GYM MANAGEMENT</span>
          <h1>Members</h1>
          <p>Manage your members, membership plans and contact details.</p>
        </div>

        <button
          type="button"
          className="members-primary-btn"
          onClick={() => {
            window.location.href = '/add-member'
          }}
        >
          <span aria-hidden="true">+</span> Add New Member
        </button>
      </div>

      {message && (
        <div
          className={`members-alert ${messageType === 'error' ? 'members-alert-error' : 'members-alert-success'}`}
          role="status"
        >
          <span>{message}</span>
          <button
            type="button"
            className="members-alert-close"
            onClick={() => setMessage('')}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <div className="members-alert members-alert-error" role="alert">
          {error}
          <button
            type="button"
            className="members-secondary-btn"
            onClick={() => {
              setLoading(true)
              fetchMembers()
            }}
          >
            Try Again
          </button>
        </div>
      )}

      <div className="members-summary-grid">
        <div className="members-summary-card">
          <div className="members-summary-icon members-icon-total">M</div>
          <div>
            <span className="members-summary-label">Total Members</span>
            <strong>{members.length}</strong>
            <small>Registered in the system</small>
          </div>
        </div>

        <div className="members-summary-card">
          <div className="members-summary-icon members-icon-basic">B</div>
          <div>
            <span className="members-summary-label">Basic Plan</span>
            <strong>{planCounts.Basic}</strong>
            <small>Members on Basic</small>
          </div>
        </div>

        <div className="members-summary-card">
          <div className="members-summary-icon members-icon-standard">S</div>
          <div>
            <span className="members-summary-label">Standard Plan</span>
            <strong>{planCounts.Standard}</strong>
            <small>Members on Standard</small>
          </div>
        </div>

        <div className="members-summary-card">
          <div className="members-summary-icon members-icon-premium">P</div>
          <div>
            <span className="members-summary-label">Premium Plan</span>
            <strong>{planCounts.Premium}</strong>
            <small>Members on Premium</small>
          </div>
        </div>
      </div>

      {editingMember && (
        <div className="members-edit-card">
          <div className="members-section-heading">
            <div>
              <span className="members-eyebrow">MEMBER DETAILS</span>
              <h2>Edit Member</h2>
              <p>Update the selected member's information.</p>
            </div>
            <button
              type="button"
              className="members-close-btn"
              onClick={() => setEditingMember(null)}
              disabled={saving}
              aria-label="Close edit form"
            >
              ×
            </button>
          </div>

          <form className="members-edit-form" onSubmit={handleUpdate}>
            <div className="members-field">
              <label htmlFor="edit-name">Full Name</label>
              <input
                id="edit-name"
                name="name"
                value={editingMember.name}
                onChange={handleChange}
                placeholder="Enter full name"
                maxLength={100}
                required
              />
            </div>

            <div className="members-field">
              <label htmlFor="edit-phone">Phone Number</label>
              <input
                id="edit-phone"
                name="phone"
                type="tel"
                value={editingMember.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                maxLength={20}
                required
              />
            </div>

            <div className="members-field">
              <label htmlFor="edit-email">Email Address</label>
              <input
                id="edit-email"
                name="email"
                type="email"
                value={editingMember.email}
                onChange={handleChange}
                placeholder="Enter email address"
                maxLength={150}
                required
              />
            </div>

            <div className="members-field">
              <label htmlFor="edit-plan">Membership Plan</label>
              <select
                id="edit-plan"
                name="plan"
                value={editingMember.plan}
                onChange={handleChange}
              >
                <option value="Basic">Basic</option>
                <option value="Standard">Standard</option>
                <option value="Premium">Premium</option>
              </select>
            </div>

            <div className="members-form-actions">
              <button
                type="button"
                className="members-secondary-btn"
                onClick={() => setEditingMember(null)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="members-primary-btn"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="members-directory-card">
        <div className="members-section-heading">
          <div>
            <h2>Member Directory</h2>
            <p>View and manage all registered gym members.</p>
          </div>
          <span className="members-count-badge">
            {filteredMembers.length} {filteredMembers.length === 1 ? 'member' : 'members'}
          </span>
        </div>

        <div className="members-toolbar">
          <div className="members-search">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              aria-label="Search members"
              placeholder="Search name, phone or email..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            className="members-filter"
            aria-label="Filter by membership plan"
            value={planFilter}
            onChange={(event) => setPlanFilter(event.target.value)}
          >
            <option value="All">All Plans</option>
            <option value="Basic">Basic</option>
            <option value="Standard">Standard</option>
            <option value="Premium">Premium</option>
          </select>
        </div>

        {loading ? (
          <div className="members-state">
            <div className="members-loader" />
            <p>Loading member records...</p>
          </div>
        ) : !error && filteredMembers.length === 0 ? (
          <div className="members-state">
            <div className="members-empty-icon">M</div>
            <h3>{members.length === 0 ? 'No members yet' : 'No matching members'}</h3>
            <p>
              {members.length === 0
                ? 'Add your first gym member to get started.'
                : 'Try another search term or change the plan filter.'}
            </p>
            {members.length === 0 ? (
              <button
                type="button"
                className="members-primary-btn"
                onClick={() => {
                  window.location.href = '/add-member'
                }}
              >
                + Add New Member
              </button>
            ) : (
              <button
                type="button"
                className="members-secondary-btn"
                onClick={() => {
                  setSearch('')
                  setPlanFilter('All')
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : !error ? (
          <div className="members-table-wrapper">
            <table className="members-table">
              <thead>
                <tr>
                  <th>MEMBER</th>
                  <th>PHONE</th>
                  <th>EMAIL ADDRESS</th>
                  <th>MEMBERSHIP PLAN</th>
                  <th className="members-actions-heading">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member._id}>
                    <td>
                      <div className="members-person">
                        <div className="members-avatar">
                          {(member.name || 'M').trim().charAt(0).toUpperCase()}
                        </div>
                        <div className="members-person-name">
                          <strong>{member.name}</strong>
                          <span>Gym Member</span>
                        </div>
                      </div>
                    </td>
                    <td>{member.phone || '—'}</td>
                    <td className="members-email-cell">{member.email || '—'}</td>
                    <td>
                      <span
                        className={`members-plan-badge members-plan-${(member.plan || 'basic').toLowerCase()}`}
                      >
                        <span className="members-plan-dot" />
                        {member.plan || 'Basic'}
                      </span>
                    </td>
                    <td>
                      <div className="members-row-actions">
                        <button
                          type="button"
                          className="members-edit-btn"
                          onClick={() => startEditing(member)}
                          disabled={Boolean(deletingId)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="members-delete-btn"
                          onClick={() => deleteMember(member)}
                          disabled={Boolean(deletingId)}
                        >
                          {deletingId === member._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {!loading && !error && members.length > 0 && (
          <div className="members-table-footer">
            Showing <strong>{filteredMembers.length}</strong> of{' '}
            <strong>{members.length}</strong> registered members
          </div>
        )}
      </div>
    </div>
  )
}

export default Members