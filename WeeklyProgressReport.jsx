
import { useEffect, useState } from 'react'

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

const MEALS_PER_DAY = 4

function getCompletedCount(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean).length
  }

  if (value && typeof value === 'object') {
    return Object.values(value).filter(Boolean).length
  }

  return 0
}

function getDayProgress(data, day) {
  if (!data || typeof data !== 'object') return 0

  const matchingKey = Object.keys(data).find(
    (key) => key.toLowerCase() === day.toLowerCase()
  )

  if (matchingKey) {
    return Math.min(getCompletedCount(data[matchingKey]), MEALS_PER_DAY)
  }

  return 0
}

export default function WeeklyProgressReport() {
  const [completedData, setCompletedData] = useState({})
  const [error, setError] = useState('')

  useEffect(() => {
    try {
      const savedData = window.localStorage.getItem(
        'fitpulse-weekly-diet-completed'
      )

      if (savedData) {
        const parsedData = JSON.parse(savedData)

        if (parsedData && typeof parsedData === 'object') {
          setCompletedData(parsedData)
        }
      }
    } catch {
      setError('Unable to read saved progress. Please check your saved diet data.')
    }
  }, [])

  const dailyProgress = DAYS.map((day) => ({
    day,
    completed: getDayProgress(completedData, day),
  }))

  const totalCompleted = dailyProgress.reduce(
    (total, day) => total + day.completed,
    0
  )

  const totalMeals = DAYS.length * MEALS_PER_DAY
  const percentage = Math.round((totalCompleted / totalMeals) * 100)

  const cardStyle = {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  }

  const pageStyle = {
    padding: '24px',
    color: '#1f2937',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '1000px',
    margin: '0 auto',
  }

  const barBackgroundStyle = {
    width: '100%',
    height: '10px',
    background: '#e5e7eb',
    borderRadius: '10px',
    overflow: 'hidden',
    marginTop: '8px',
  }

  return (
    <div style={pageStyle}>
      <h1 style={{ marginBottom: '8px' }}>Weekly Progress Report</h1>

      <p style={{ color: '#6b7280', marginTop: 0 }}>
        Review your meal completion progress for the week.
      </p>

      {error && (
        <p role="alert" style={{ color: '#dc2626' }}>
          {error}
        </p>
      )}

      <div
        style={{
          ...cardStyle,
          marginTop: '24px',
          marginBottom: '24px',
        }}
      >
        <h2 style={{ marginTop: 0 }}>Your Weekly Summary</h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '20px',
          }}
        >
          <div>
            <p style={{ color: '#6b7280', marginBottom: '6px' }}>
              Meals Completed
            </p>
            <h2 style={{ margin: 0 }}>
              {totalCompleted} / {totalMeals}
            </h2>
          </div>

          <div>
            <p style={{ color: '#6b7280', marginBottom: '6px' }}>
              Weekly Completion
            </p>
            <h2 style={{ margin: 0 }}>{percentage}%</h2>
          </div>

          <div>
            <p style={{ color: '#6b7280', marginBottom: '6px' }}>
              Days With Completed Meals
            </p>
            <h2 style={{ margin: 0 }}>
              {dailyProgress.filter((day) => day.completed > 0).length} / 7
            </h2>
          </div>
        </div>

        <div style={barBackgroundStyle}>
          <div
            style={{
              width: `${percentage}%`,
              height: '100%',
              background: '#16a34a',
              borderRadius: '10px',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      <div style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Daily Breakdown</h2>

        {dailyProgress.map(({ day, completed }) => {
          const dailyPercentage = Math.round(
            (completed / MEALS_PER_DAY) * 100
          )

          return (
            <div
              key={day}
              style={{
                padding: '14px 0',
                borderBottom:
                  day === 'Sunday' ? 'none' : '1px solid #e5e7eb',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <strong>{day}</strong>
                <span style={{ color: '#6b7280' }}>
                  {completed} of {MEALS_PER_DAY} meals ({dailyPercentage}%)
                </span>
              </div>

              <div style={barBackgroundStyle}>
                <div
                  style={{
                    width: `${dailyPercentage}%`,
                    height: '100%',
                    background: '#2563eb',
                    borderRadius: '10px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div
        style={{
          ...cardStyle,
          marginTop: '24px',
          background: '#f9fafb',
        }}
      >
        <h3 style={{ marginTop: 0 }}>Weekly Recommendation</h3>
        <p style={{ marginBottom: 0 }}>
          {percentage === 100
            ? 'Excellent work! You completed all your tracked meals this week. Keep up the consistency.'
            : percentage >= 70
              ? 'Great progress! Keep following your meal plan to maintain consistency.'
              : percentage > 0
                ? 'You have made a start. Try marking your meals as completed each day to build a consistent routine.'
                : 'Your report has no completed meals recorded yet. Open Weekly Diet Calendar and mark meals as completed to track your progress.'}
        </p>
      </div>
    </div>
  )
}
