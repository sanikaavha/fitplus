
import { useState } from 'react'
import './HealthDashboard.css'

const STORAGE_KEY = 'fitpulse-health-logs'

function readEntries() {
  try {
    const entries = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(entries) ? entries : []
  } catch {
    return []
  }
}

function getTodayKey() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getTodayEntry(entries) {
  const today = getTodayKey()
  return entries.find((entry) => entry.dateKey === today) ||
    entries.find((entry) => !entry.dateKey && entry.date === new Date().toLocaleDateString())
}

function HealthDashboard() {
  const [savedEntries, setSavedEntries] = useState(readEntries)

  const [weight, setWeight] = useState(() => {
    const entry = getTodayEntry(readEntries())
    return entry?.weight ? String(entry.weight) : ''
  })

  const [goalWeight, setGoalWeight] = useState(() => {
    const entry = getTodayEntry(readEntries())
    return entry?.goalWeight ? String(entry.goalWeight) : ''
  })

  const [water, setWater] = useState(() => {
    const entry = getTodayEntry(readEntries())
    return Number(entry?.water) || 0
  })

  const [workouts, setWorkouts] = useState(() => {
    const entry = getTodayEntry(readEntries())
    return Number(entry?.workouts) || 0
  })

  const [calories, setCalories] = useState(() => {
    const entry = getTodayEntry(readEntries())
    return entry?.calories ? String(entry.calories) : ''
  })

  const [message, setMessage] = useState('')

  const todayKey = getTodayKey()
  const todayEntry = getTodayEntry(savedEntries)

  const latestEntry = savedEntries[0]
  const previousEntry = savedEntries[1]
  const oldestEntry = savedEntries[savedEntries.length - 1]

  const weightChange =
    latestEntry && previousEntry
      ? Number((latestEntry.weight - previousEntry.weight).toFixed(1))
      : null

  const startingWeight = oldestEntry?.weight
  const currentWeight = latestEntry?.weight
  const targetWeight = latestEntry?.goalWeight

  let goalProgress = 0

  if (
    startingWeight != null &&
    currentWeight != null &&
    targetWeight != null &&
    startingWeight !== targetWeight
  ) {
    goalProgress = Math.max(
      0,
      Math.min(
        100,
        ((currentWeight - startingWeight) / (targetWeight - startingWeight)) * 100,
      ),
    )
  } else if (currentWeight === targetWeight && currentWeight != null) {
    goalProgress = 100
  }

  const lastSevenEntries = [...savedEntries]
    .slice(0, 7)
    .reverse()

  const chartWeights = lastSevenEntries.map((entry) => Number(entry.weight) || 0)
  const minWeight = chartWeights.length ? Math.min(...chartWeights) : 0
  const maxWeight = chartWeights.length ? Math.max(...chartWeights) : 0

  function saveProgress(event) {
    event.preventDefault()
    setMessage('')

    const current = Number(weight)
    const target = Number(goalWeight)
    const calorieCount = Number(calories) || 0

    if (
      !Number.isFinite(current) ||
      current < 1 ||
      current > 500 ||
      !Number.isFinite(target) ||
      target < 1 ||
      target > 500 ||
      calorieCount < 0 ||
      calorieCount > 20000
    ) {
      setMessage('Please enter valid weight, target weight, and calorie values.')
      return
    }

    const entry = {
      id: todayEntry?.id || Date.now(),
      date: new Date().toLocaleDateString(),
      dateKey: todayKey,
      weight: current,
      goalWeight: target,
      water,
      workouts,
      calories: calorieCount,
    }

    // Update today's entry instead of creating duplicate daily entries.
    const updatedEntries = todayEntry
      ? savedEntries.map((item) =>
          item.id === todayEntry.id ? entry : item,
        )
      : [entry, ...savedEntries]

    // Keep newest entries first.
    updatedEntries.sort((a, b) => {
      const dateA = a.dateKey || ''
      const dateB = b.dateKey || ''
      return dateB.localeCompare(dateA) || Number(b.id) - Number(a.id)
    })

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries))
      setSavedEntries(updatedEntries)
      setMessage('Progress saved successfully!')
    } catch {
      setMessage('Could not save progress. Please check your browser storage.')
    }
  }

  function deleteEntry(id) {
    if (!window.confirm('Delete this progress entry?')) return

    const updatedEntries = savedEntries.filter((entry) => entry.id !== id)

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries))
      setSavedEntries(updatedEntries)
      setMessage('Progress entry deleted.')
    } catch {
      setMessage('Could not delete the entry. Please try again.')
    }
  }

  function formatDate(entry) {
    if (entry.dateKey) {
      return new Date(`${entry.dateKey}T12:00:00`).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    }

    return entry.date || 'Previous entry'
  }

  return (
    <div className="health-dashboard">
      <div className="health-dashboard-heading">
        <div>
          <p className="health-eyebrow">FITPULSE WELLNESS</p>
          <h1>Personal Progress Details</h1>
          <p>Understand your progress and build healthier daily habits.</p>
        </div>

        <div className="health-date">
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </div>
      </div>

      {message && (
        <div className="health-message" role="status">
          {message}
        </div>
      )}

      <div className="health-summary-grid">
        <div className="health-summary-card">
          <span>⚖️</span>
          <p>Latest Weight</p>
          <h2>{latestEntry ? `${latestEntry.weight} kg` : '--'}</h2>
          <small>
            {weightChange === null
              ? 'Save another entry to compare'
              : `${weightChange > 0 ? '+' : ''}${weightChange} kg since previous entry`}
          </small>
        </div>

        <div className="health-summary-card">
          <span>🎯</span>
          <p>Target Weight</p>
          <h2>{targetWeight != null ? `${targetWeight} kg` : '--'}</h2>
          <div className="health-progress-track">
            <div
              className="health-progress-fill"
              style={{ width: `${goalProgress}%` }}
            />
          </div>
          <small>{Math.round(goalProgress)}% progress from your first saved weight</small>
        </div>

        <div className="health-summary-card">
          <span>💧</span>
          <p>Today's Water</p>
          <h2>{water} / 8 glasses</h2>
          <div className="health-progress-track">
            <div
              className="health-progress-fill"
              style={{ width: `${Math.min((water / 8) * 100, 100)}%` }}
            />
          </div>
          <div className="health-button-row">
            <button
              type="button"
              onClick={() => setWater((value) => Math.max(0, value - 1))}
            >
              −
            </button>
            <button
              type="button"
              onClick={() => setWater((value) => Math.min(8, value + 1))}
            >
              + Water
            </button>
          </div>
        </div>

        <div className="health-summary-card">
          <span>🏋️</span>
          <p>Today's Workouts</p>
          <h2>{workouts}</h2>
          <small>{workouts === 1 ? 'Workout recorded' : 'Workouts recorded today'}</small>
          <div className="health-button-row">
            <button
              type="button"
              onClick={() => setWorkouts((value) => Math.max(0, value - 1))}
            >
              −
            </button>
            <button
              type="button"
              onClick={() => setWorkouts((value) => value + 1)}
            >
              + Workout
            </button>
          </div>
        </div>
      </div>

      <div className="health-content-grid">
        <section className="health-panel">
          <h2>📝 Record Your Progress</h2>
          <p>Save your measurements and daily activity.</p>

          <form onSubmit={saveProgress}>
            <label htmlFor="health-weight">Current weight (kg)</label>
            <input
              id="health-weight"
              type="number"
              min="1"
              max="500"
              step="0.1"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              placeholder="e.g. 68.5"
              required
            />

            <label htmlFor="health-goal">Target weight (kg)</label>
            <input
              id="health-goal"
              type="number"
              min="1"
              max="500"
              step="0.1"
              value={goalWeight}
              onChange={(event) => setGoalWeight(event.target.value)}
              placeholder="e.g. 65"
              required
            />

            <label htmlFor="health-calories">Daily calories (optional)</label>
            <input
              id="health-calories"
              type="number"
              min="0"
              max="20000"
              value={calories}
              onChange={(event) => setCalories(event.target.value)}
              placeholder="e.g. 2200"
            />

            <div className="health-form-summary">
              <span>Water: <strong>{water} glasses</strong></span>
              <span>Workouts: <strong>{workouts}</strong></span>
            </div>

            <button className="health-save-button" type="submit">
              {todayEntry ? "Update Today's Progress" : "Save Today's Progress"}
            </button>
          </form>
        </section>

        <section className="health-panel">
          <h2>📈 Weight Progress</h2>
          <p>Your seven most recent saved entries.</p>

          {lastSevenEntries.length === 0 ? (
            <div className="health-empty-state">
              <span>🌱</span>
              <h3>Your progress starts here</h3>
              <p>Save your first entry to see your weight history.</p>
            </div>
          ) : (
            <div className="health-chart">
              {lastSevenEntries.map((entry, index) => {
                const value = Number(entry.weight) || 0
                const range = maxWeight - minWeight
                const barHeight =
                  range === 0 ? 65 : 30 + ((value - minWeight) / range) * 70

                return (
                  <div className="health-chart-column" key={entry.id}>
                    <strong>{value} kg</strong>
                    <div className="health-chart-bar-area">
                      <div
                        className="health-chart-bar"
                        style={{ height: `${barHeight}%` }}
                        title={`${value} kg`}
                      />
                    </div>
                    <small>
                      {entry.dateKey
                        ? new Date(`${entry.dateKey}T12:00:00`).toLocaleDateString(
                            'en-IN',
                            { day: 'numeric', month: 'short' },
                          )
                        : `Entry ${index + 1}`}
                    </small>
                  </div>
                )
              })}
            </div>
          )}

          {latestEntry && (
            <div className="health-goal-note">
              <strong>Goal:</strong> {latestEntry.goalWeight} kg
              {latestEntry.weight === latestEntry.goalWeight
                ? ' — Your latest weight matches your target!'
                : ' — Keep recording your progress consistently.'}
            </div>
          )}
        </section>
      </div>

      <section className="health-panel health-history-panel">
        <h2>🗓️ Detailed Progress History</h2>
        <p>Your saved measurements and daily habits, stored in this browser.</p>

        {savedEntries.length === 0 ? (
          <div className="health-empty-state">
            <span>🌱</span>
            <h3>No progress entries yet</h3>
            <p>Save your first entry to begin your fitness journey.</p>
          </div>
        ) : (
          <div className="health-history-list">
            {savedEntries.map((entry) => (
              <div className="health-history-item" key={entry.id}>
                <div className="health-history-details">
                  <strong>{formatDate(entry)}</strong>
                  <p>
                    Weight: {entry.weight} kg · Goal: {entry.goalWeight} kg
                  </p>
                  <small>
                    Water: {Number(entry.water) || 0} glasses · Workouts:{' '}
                    {Number(entry.workouts) || 0} · Calories:{' '}
                    {Number(entry.calories) || 0}
                  </small>
                </div>

                <button
                  type="button"
                  className="health-delete-button"
                  onClick={() => deleteEntry(entry.id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="health-note">
        <strong>Health note:</strong> This page tracks general fitness habits and is
        not a medical diagnosis. Progress depends on the entries you record. Your
        history is stored in this browser; clearing browser data may remove it.
      </div>
    </div>
  )
}

export default HealthDashboard
