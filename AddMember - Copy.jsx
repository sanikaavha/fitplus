
import { useState } from 'react'

function AddMember() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    plan: 'Basic',
  })

  const [message, setMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setIsSaving(true)

    try {
      const response = await fetch(
        'http://localhost:5000/api/members',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to save member.')
      }

      setMessage('Member saved successfully!')
      setFormData({
        name: '',
        phone: '',
        email: '',
        plan: 'Basic',
      })
    } catch (error) {
      setMessage(
        error.message || 'Could not connect to the server.'
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="page-content">
      <h1>Add New Member</h1>
      <p>Enter the member's details below.</p>

      <form className="member-form" onSubmit={handleSubmit}>
        <label htmlFor="name">Full Name</label>
        <input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter full name"
          required
        />

        <label htmlFor="phone">Phone Number</label>
        <input
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Enter phone number"
          required
        />

        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter email address"
          required
        />

        <label htmlFor="plan">Membership Plan</label>
        <select
          id="plan"
          name="plan"
          value={formData.plan}
          onChange={handleChange}
        >
          <option value="Basic">Basic</option>
          <option value="Standard">Standard</option>
          <option value="Premium">Premium</option>
        </select>

        <button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Member'}
        </button>

        {message && <p role="status">{message}</p>}
      </form>
    </div>
  )
}

export default AddMember
