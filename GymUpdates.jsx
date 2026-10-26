import { useState } from 'react'
import './GymUpdates.css'

function GymUpdates() {
  const [updates, setUpdates] = useState([
    {
      id: 1,
      title: 'Welcome to FitPulse!',
      category: 'Announcement',
      message: 'Welcome to our gym community. Stay consistent, train safely, and keep working toward your fitness goals!',
      date: new Date().toLocaleDateString(),
      priority: 'Normal',
    },
    {
      id: 2,
      title: 'Keep Your Membership Active',
      category: 'Reminder',
      message: 'Please check your membership expiry date and renew on time to continue your workouts without interruption.',
      date: new Date().toLocaleDateString(),
      priority: 'Important',
    },
    {
      id: 3,
      title: 'Maintain Gym Hygiene',
      category: 'Gym Notice',
      message: 'Please wipe equipment after use, return weights to their racks, and keep workout areas clean.',
      date: new Date().toLocaleDateString(),
      priority: 'Normal',
    },
  ])

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Announcement')
  const [message, setMessage] = useState('')
  const [priority, setPriority] = useState('Normal')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

  function addUpdate(event) {
    event.preventDefault()

    if (!title.trim() || !message.trim()) {
      alert('Please enter both a title and a message.')
      return
    }

    const newUpdate = {
      id: Date.now(),
      title: title.trim(),
      category,
      message: message.trim(),
      date: new Date().toLocaleString(),
      priority,
    }

    setUpdates((currentUpdates) => [newUpdate, ...currentUpdates])
    setTitle('')
    setMessage('')
    setCategory('Announcement')
    setPriority('Normal')
  }

  function deleteUpdate(id) {
    if (window.confirm('Are you sure you want to delete this update?')) {
      setUpdates((currentUpdates) =>
        currentUpdates.filter((update) => update.id !== id),
      )
    }
  }

  const filteredUpdates = updates.filter((update) => {
    const matchesSearch =
      update.title.toLowerCase().includes(search.toLowerCase()) ||
      update.message.toLowerCase().includes(search.toLowerCase())

    const matchesFilter = filter === 'All' || update.category === filter

    return matchesSearch && matchesFilter
  })

  return (
    <div className="gym-updates-page">
      <div className="updates-heading">
        <div>
          <span className="updates-eyebrow">FITPULSE COMMUNITY</span>
          <h1>Gym Live Updates</h1>
          <p>Announcements, reminders, and important gym notices.</p>
        </div>

        <div className="live-indicator">
          <span className="live-dot"></span>
          LIVE BOARD
        </div>
      </div>

      <div className="updates-stats">
        <div className="update-stat-card">
          <span className="update-stat-icon">📢</span>
          <div>
            <p>Total Updates</p>
            <h2>{updates.length}</h2>
          </div>
        </div>

        <div className="update-stat-card">
          <span className="update-stat-icon">⚠️</span>
          <div>
            <p>Important Notices</p>
            <h2>{updates.filter((item) => item.priority === 'Important').length}</h2>
          </div>
        </div>

        <div className="update-stat-card">
          <span className="update-stat-icon">📅</span>
          <div>
            <p>Categories</p>
            <h2>{new Set(updates.map((item) => item.category)).size}</h2>
          </div>
        </div>
      </div>

      <div className="updates-layout">
        <section className="update-form-card">
          <h2>➕ Create an Update</h2>
          <p className="update-form-description">
            Post an announcement for your gym community.
          </p>

          <form onSubmit={addUpdate}>
            <label htmlFor="update-title">Update Title</label>
            <input
              id="update-title"
              type="text"
              placeholder="e.g. Sunday Gym Timings"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={100}
              required
            />

            <label htmlFor="update-category">Category</label>
            <select
              id="update-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option>Announcement</option>
              <option>Reminder</option>
              <option>Gym Notice</option>
              <option>Event</option>
              <option>Maintenance</option>
            </select>

            <label htmlFor="update-priority">Priority</label>
            <select
              id="update-priority"
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
            >
              <option>Normal</option>
              <option>Important</option>
            </select>

            <label htmlFor="update-message">Message</label>
            <textarea
              id="update-message"
              placeholder="Write your gym update here..."
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={5}
              maxLength={1000}
              required
            />

            <button type="submit" className="publish-update-button">
              Publish Update
            </button>
          </form>
        </section>

        <section className="updates-feed">
          <div className="updates-feed-heading">
            <div>
              <h2>Latest Updates</h2>
              <p>Keep up with what's happening at FitPulse.</p>
            </div>
            <span className="updates-count">{filteredUpdates.length} shown</span>
          </div>

          <div className="updates-filters">
            <input
              type="search"
              placeholder="Search updates..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search updates"
            />

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              aria-label="Filter updates by category"
            >
              <option>All</option>
              <option>Announcement</option>
              <option>Reminder</option>
              <option>Gym Notice</option>
              <option>Event</option>
              <option>Maintenance</option>
            </select>
          </div>

          {filteredUpdates.length === 0 ? (
            <div className="no-updates">
              <span>🔎</span>
              <h3>No updates found</h3>
              <p>Try another search or publish a new update.</p>
            </div>
          ) : (
            <div className="updates-list">
              {filteredUpdates.map((update) => (
                <article className="update-item" key={update.id}>
                  <div className="update-item-top">
                    <span className="update-category-tag">{update.category}</span>
                    <span
                      className={`update-priority ${update.priority.toLowerCase()}`}
                    >
                      {update.priority}
                    </span>
                  </div>

                  <h3>{update.title}</h3>
                  <p className="update-message">{update.message}</p>

                  <div className="update-item-bottom">
                    <span>🕒 {update.date}</span>
                    <button
                      type="button"
                      className="delete-update-button"
                      onClick={() => deleteUpdate(update.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default GymUpdates
