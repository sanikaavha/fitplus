
import { useEffect, useState } from 'react'
import './Trainers.css'

const API_URL = 'http://localhost:5000/api/trainers'

const emptyForm = {
  name: '',
  phone: '',
  email: '',
  specialization: '',
  salary: '',
  joiningDate: new Date().toISOString().split('T')[0],
}

export default function Trainers() {
  const [trainers, setTrainers] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function loadTrainers() {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(API_URL)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to load trainers.')
      }

      setTrainers(data)
    } catch (err) {
      setError(err.message || 'Unable to connect to the backend.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTrainers()
  }, [])

  function handleChange(event) {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function resetForm() {
    setForm({
      ...emptyForm,
      joiningDate: new Date().toISOString().split('T')[0],
    })
    setEditingId(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    try {
      setSaving(true)

      const response = await fetch(
        editingId ? `${API_URL}/${editingId}` : API_URL,
        {
          method: editingId ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...form,
            salary: Number(form.salary),
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to save trainer.')
      }

      setSuccess(
        editingId
          ? 'Trainer updated successfully!'
          : 'Trainer added successfully!'
      )

      resetForm()
      await loadTrainers()
    } catch (err) {
      setError(err.message || 'Unable to save trainer.')
    } finally {
      setSaving(false)
    }
  }

  function handleEdit(trainer) {
    setEditingId(trainer._id)

    setForm({
      name: trainer.name || '',
      phone: trainer.phone || '',
      email: trainer.email || '',
      specialization: trainer.specialization || '',
      salary: String(trainer.salary ?? ''),
      joiningDate: trainer.joiningDate
        ? new Date(trainer.joiningDate).toISOString().split('T')[0]
        : '',
    })

    setError('')
    setSuccess('')

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this trainer?'
    )

    if (!confirmed) return

    setError('')
    setSuccess('')

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to delete trainer.')
      }

      setSuccess('Trainer deleted successfully!')

      if (editingId === id) {
        resetForm()
      }

      await loadTrainers()
    } catch (err) {
      setError(err.message || 'Unable to delete trainer.')
    }
  }

  const filteredTrainers = trainers.filter((trainer) => {
    const text = search.toLowerCase()

    return [
      trainer.name,
      trainer.phone,
      trainer.email,
      trainer.specialization,
      trainer.status,
    ].some((value) => String(value || '').toLowerCase().includes(text))
  })

  const activeCount = trainers.filter(
    (trainer) => (trainer.status || 'Active') === 'Active'
  ).length

  return (
    <section className="trainers-page">
      <header className="trainers-header">
        <div>
          <span className="trainers-eyebrow">TEAM MANAGEMENT</span>
          <h1 className="trainers-title">Trainer Management</h1>
          <p className="trainers-subtitle">
            Manage your fitness team, trainer details, and monthly salaries.
          </p>
        </div>

        <button
          type="button"
          className="trainers-refresh-btn"
          onClick={loadTrainers}
          disabled={loading}
        >
          ↻ Refresh Data
        </button>
      </header>

      {error && (
        <div className="trainers-message trainers-message-error" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div
          className="trainers-message trainers-message-success"
          role="status"
        >
          {success}
        </div>
      )}

      <div className="trainers-stats">
        <div className="trainers-stat-card">
          <span className="trainers-stat-label">Total Trainers</span>
          <strong className="trainers-stat-value">{trainers.length}</strong>
        </div>

        <div className="trainers-stat-card trainers-stat-card-active">
          <span className="trainers-stat-label">Active Trainers</span>
          <strong className="trainers-stat-value">{activeCount}</strong>
        </div>
      </div>

      <section className="trainers-card">
        <div>
          <h2 className="trainers-card-heading">
            {editingId ? 'Edit Trainer' : 'Add New Trainer'}
          </h2>
          <p className="trainers-card-description">
            {editingId
              ? 'Update the trainer information below.'
              : 'Enter the details to register a new gym trainer.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="trainers-form">
          <label className="trainers-field">
            Trainer Name
            <input
              className="trainers-input"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter full name"
              required
            />
          </label>

          <label className="trainers-field">
            Phone Number
            <input
              className="trainers-input"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              required
            />
          </label>

          <label className="trainers-field">
            Email Address
            <input
              className="trainers-input"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter email address"
              required
            />
          </label>

          <label className="trainers-field">
            Specialization
            <input
              className="trainers-input"
              name="specialization"
              value={form.specialization}
              onChange={handleChange}
              placeholder="e.g. Strength Training"
              required
            />
          </label>

          <label className="trainers-field">
            Monthly Salary (₹)
            <input
              className="trainers-input"
              name="salary"
              type="number"
              min="0"
              step="0.01"
              value={form.salary}
              onChange={handleChange}
              placeholder="Enter monthly salary"
              required
            />
          </label>

          <label className="trainers-field">
            Joining Date
            <input
              className="trainers-input"
              name="joiningDate"
              type="date"
              value={form.joiningDate}
              onChange={handleChange}
              required
            />
          </label>

          <div className="trainers-form-actions">
            <button
              type="submit"
              className="trainers-btn trainers-btn-primary"
              disabled={saving}
            >
              {saving
                ? 'Saving...'
                : editingId
                  ? '✓ Update Trainer'
                  : '+ Add Trainer'}
            </button>

            {editingId && (
              <button
                type="button"
                className="trainers-btn trainers-btn-secondary"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="trainers-card">
        <div className="trainers-list-header">
          <div>
            <h2 className="trainers-list-title">
              All Trainers
              <span className="trainers-count">
                {filteredTrainers.length}
              </span>
            </h2>
            <p className="trainers-card-description">
              View and manage your registered trainers.
            </p>
          </div>

          <input
            className="trainers-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search trainers..."
            aria-label="Search trainers"
          />
        </div>

        {loading ? (
          <div className="trainers-loading">Loading trainers...</div>
        ) : filteredTrainers.length === 0 ? (
          <div className="trainers-empty-state">
            <div className="trainers-empty-symbol">♙</div>
            <h3 className="trainers-empty-title">
              {search ? 'No matching trainers' : 'No trainers yet'}
            </h3>
            <p className="trainers-empty-text">
              {search
                ? 'Try another name, phone number, email, or specialization.'
                : 'Add your first trainer using the form above.'}
            </p>
          </div>
        ) : (
          <div className="trainers-table-wrapper">
            <table className="trainers-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Specialization</th>
                  <th>Salary</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredTrainers.map((trainer) => {
                  const status = trainer.status || 'Active'
                  const isInactive = status === 'Inactive'

                  return (
                    <tr key={trainer._id}>
                      <td className="trainers-name">{trainer.name}</td>
                      <td>{trainer.phone}</td>
                      <td className="trainers-email">{trainer.email}</td>
                      <td>{trainer.specialization}</td>
                      <td className="trainers-salary">
                        ₹
                        {Number(trainer.salary || 0).toLocaleString('en-IN')}
                      </td>
                      <td>
                        <span
                          className={`trainers-status ${
                            isInactive
                              ? 'trainers-status-inactive'
                              : 'trainers-status-active'
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td>
                        <div className="trainers-actions">
                          <button
                            type="button"
                            className="trainers-action-btn trainers-edit-btn"
                            onClick={() => handleEdit(trainer)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="trainers-action-btn trainers-delete-btn"
                            onClick={() => handleDelete(trainer._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  )
}
