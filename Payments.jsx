
import { useEffect, useState } from 'react'
import './Payments.css'

const API_URL = 'http://localhost:5000/api/payments'
const MEMBERS_URL = 'http://localhost:5000/api/members'

function Payments() {
  const [payments, setPayments] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [form, setForm] = useState({
    member: '',
    amount: '',
    paymentMethod: 'UPI',
    paymentDate: new Date().toISOString().slice(0, 10),
    status: 'Paid',
    transactionId: '',
    description: '',
  })

  async function loadData() {
    setLoading(true)
    setError('')

    try {
      const [paymentsResponse, membersResponse] = await Promise.all([
        fetch(API_URL),
        fetch(MEMBERS_URL),
      ])

      if (!paymentsResponse.ok || !membersResponse.ok) {
        throw new Error('Could not load payments or members.')
      }

      const paymentsData = await paymentsResponse.json()
      const membersData = await membersResponse.json()

      setPayments(Array.isArray(paymentsData) ? paymentsData : [])
      setMembers(Array.isArray(membersData) ? membersData : [])
    } catch (err) {
      setError(err.message || 'Unable to connect to the backend.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!form.member) {
      setError('Please select a member.')
      return
    }

    if (!Number.isFinite(Number(form.amount)) || Number(form.amount) <= 0) {
      setError('Enter an amount greater than zero.')
      return
    }

    setSaving(true)

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
          paymentDate: form.paymentDate
            ? new Date(`${form.paymentDate}T12:00:00`).toISOString()
            : undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Could not save the payment.')
      }

      setMessage('Payment recorded successfully!')

      setForm({
        member: '',
        amount: '',
        paymentMethod: 'UPI',
        paymentDate: new Date().toISOString().slice(0, 10),
        status: 'Paid',
        transactionId: '',
        description: '',
      })

      await loadData()
    } catch (err) {
      setError(err.message || 'Could not save the payment.')
    } finally {
      setSaving(false)
    }
  }

  async function updateStatus(payment, status) {
    setError('')
    setMessage('')

    try {
      const response = await fetch(`${API_URL}/${payment._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Could not update payment status.')
      }

      setMessage('Payment status updated.')
      await loadData()
    } catch (err) {
      setError(err.message || 'Could not update payment.')
    }
  }

  async function deletePayment(payment) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this payment record?'
    )

    if (!confirmed) return

    setError('')
    setMessage('')

    try {
      const response = await fetch(`${API_URL}/${payment._id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Could not delete payment.')
      }

      setMessage('Payment deleted successfully.')
      await loadData()
    } catch (err) {
      setError(err.message || 'Could not delete payment.')
    }
  }

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0)

  const totalPaid = payments
    .filter((payment) => payment.status === 'Paid')
    .reduce((total, payment) => total + Number(payment.amount || 0), 0)

  const totalPending = payments
    .filter((payment) => payment.status === 'Pending')
    .reduce((total, payment) => total + Number(payment.amount || 0), 0)

  return (
    <section className="payments-page">
      <header className="payments-header">
        <div>
          <span className="payments-eyebrow">FINANCE MANAGEMENT</span>
          <h2>Payments</h2>
          <p>Record, track, and manage your gym payments.</p>
        </div>

        <button
          className="payments-refresh"
          type="button"
          onClick={loadData}
          disabled={loading}
        >
          {loading ? 'Loading...' : '↻ Refresh Data'}
        </button>
      </header>

      {error && <p className="payment-notice payment-error" role="alert">{error}</p>}
      {message && <p className="payment-notice payment-success" role="status">{message}</p>}

      <div className="stats-grid">
        <article className="stat-card">
          <div className="stat-top">
            <span>Total Records</span>
            <span className="stat-icon purple">₹</span>
          </div>
          <h3>{payments.length}</h3>
          <p>All recorded payments</p>
        </article>

        <article className="stat-card">
          <div className="stat-top">
            <span>Total Paid</span>
            <span className="stat-icon green">✓</span>
          </div>
          <h3>{formatCurrency(totalPaid)}</h3>
          <p>Payments marked as paid</p>
        </article>

        <article className="stat-card">
          <div className="stat-top">
            <span>Pending Amount</span>
            <span className="stat-icon orange">◷</span>
          </div>
          <h3>{formatCurrency(totalPending)}</h3>
          <p>Payments awaiting completion</p>
        </article>
      </div>

      <div className="panel">
        <div className="panel-heading">
          <div>
            <h3>Record a Payment</h3>
            <p>Enter payment details below to update your records.</p>
          </div>
          <span className="payments-form-icon">₹</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="payment-form-grid">
            <label>
              Member *
              <select
                name="member"
                value={form.member}
                onChange={handleChange}
                required
              >
                <option value="">Select member</option>
                {members.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Amount (₹) *
              <input
                type="number"
                name="amount"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={handleChange}
                placeholder="Enter amount"
                required
              />
            </label>

            <label>
              Payment Method *
              <select
                name="paymentMethod"
                value={form.paymentMethod}
                onChange={handleChange}
                required
              >
                <option>UPI</option>
                <option>Cash</option>
                <option>Card</option>
                <option>Bank Transfer</option>
              </select>
            </label>

            <label>
              Payment Date *
              <input
                type="date"
                name="paymentDate"
                value={form.paymentDate}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Status *
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                required
              >
                <option>Paid</option>
                <option>Pending</option>
                <option>Failed</option>
              </select>
            </label>

            <label>
              Transaction ID
              <input
                type="text"
                name="transactionId"
                value={form.transactionId}
                onChange={handleChange}
                placeholder="Optional transaction reference"
              />
            </label>

            <label className="payment-description">
              Description
              <input
                type="text"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="e.g. Monthly membership fee"
              />
            </label>
          </div>

          <div className="payment-form-footer">
            <p>Fields marked with * are required.</p>
            <button
              className="payment-submit"
              type="submit"
              disabled={saving || members.length === 0}
            >
              {saving ? 'Saving Payment...' : '+ Record Payment'}
            </button>
          </div>

          {members.length === 0 && !loading && (
            <p className="payment-empty-hint">
              Add a member before recording a payment.
            </p>
          )}
        </form>
      </div>

      <div className="panel">
        <div className="panel-heading">
          <div>
            <h3>Payment History</h3>
            <p>Review payments and manage their status.</p>
          </div>
          <span className="payments-count">
            {payments.length} {payments.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        {loading ? (
          <p className="payment-empty-state">Loading payments...</p>
        ) : payments.length === 0 ? (
          <p className="payment-empty-state">No payments recorded yet.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Transaction ID</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {payments.map((payment) => {
                  const member =
                    payment.member && typeof payment.member === 'object'
                      ? payment.member
                      : null

                  const statusClass =
                    payment.status === 'Paid'
                      ? 'status-paid'
                      : payment.status === 'Pending'
                        ? 'status-pending'
                        : 'status-failed'

                  return (
                    <tr key={payment._id}>
                      <td>
                        <span className="payment-member-name">
                          {member?.name || 'Unknown member'}
                        </span>
                      </td>
                      <td className="payment-amount">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td>{payment.paymentMethod || '—'}</td>
                      <td>
                        {payment.paymentDate
                          ? new Date(payment.paymentDate).toLocaleDateString('en-IN')
                          : '—'}
                      </td>
                      <td>
                        <span className={`payment-status ${statusClass}`}>
                          {payment.status}
                        </span>
                        <select
                          className="payment-status-select"
                          aria-label={`Change status for ${member?.name || 'payment'}`}
                          value={payment.status}
                          onChange={(event) =>
                            updateStatus(payment, event.target.value)
                          }
                        >
                          <option>Paid</option>
                          <option>Pending</option>
                          <option>Failed</option>
                        </select>
                      </td>
                      <td>{payment.transactionId || '—'}</td>
                      <td>
                        <button
                          className="payment-delete"
                          type="button"
                          onClick={() => deletePayment(payment)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

export default Payments
