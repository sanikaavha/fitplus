
import { useEffect, useState } from 'react'
import './WeeklyDietCalendar.css'

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks']

const DEFAULT_PLAN = {
  Monday: {
    Breakfast: 'Oats, milk and banana',
    Lunch: 'Rice, dal and vegetables',
    Dinner: 'Roti, paneer and salad',
    Snacks: 'Fruit and nuts',
  },
  Tuesday: {
    Breakfast: 'Poha and a glass of milk',
    Lunch: 'Roti, dal and mixed vegetables',
    Dinner: 'Rice and chickpea curry',
    Snacks: 'Yogurt and fruit',
  },
  Wednesday: {
    Breakfast: 'Idli and sambar',
    Lunch: 'Rice, rajma and salad',
    Dinner: 'Roti, tofu and vegetables',
    Snacks: 'Roasted chana',
  },
  Thursday: {
    Breakfast: 'Vegetable upma and yogurt',
    Lunch: 'Roti, chole and salad',
    Dinner: 'Rice, dal and vegetables',
    Snacks: 'Banana and nuts',
  },
  Friday: {
    Breakfast: 'Besan chilla and yogurt',
    Lunch: 'Rice, dal and paneer',
    Dinner: 'Roti, mixed vegetables and curd',
    Snacks: 'Fruit and roasted chana',
  },
  Saturday: {
    Breakfast: 'Vegetable sandwich and milk',
    Lunch: 'Rice, dal and vegetables',
    Dinner: 'Roti, chickpea curry and salad',
    Snacks: 'Yogurt and nuts',
  },
  Sunday: {
    Breakfast: 'Dosa and sambar',
    Lunch: 'Roti, dal and seasonal vegetables',
    Dinner: 'Vegetable khichdi and curd',
    Snacks: 'Fruit of your choice',
  },
}

function readSavedData(key, fallback) {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallback
  } catch {
    return fallback
  }
}

function WeeklyDietCalendar() {
  const [selectedDay, setSelectedDay] = useState('Monday')
  const [mealPlan, setMealPlan] = useState(() =>
    readSavedData('fitpulse-weekly-diet-plan', DEFAULT_PLAN)
  )
  const [completedMeals, setCompletedMeals] = useState(() =>
    readSavedData('fitpulse-weekly-diet-completed', {})
  )
  const [editingMeal, setEditingMeal] = useState(null)
  const [mealText, setMealText] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    try {
      localStorage.setItem(
        'fitpulse-weekly-diet-plan',
        JSON.stringify(mealPlan)
      )
    } catch {
      setMessage('Could not save your plan in this browser.')
    }
  }, [mealPlan])

  useEffect(() => {
    try {
      localStorage.setItem(
        'fitpulse-weekly-diet-completed',
        JSON.stringify(completedMeals)
      )
    } catch {
      setMessage('Could not save meal completion status.')
    }
  }, [completedMeals])

  const dayMeals = mealPlan[selectedDay] || {}
  const completedForDay = completedMeals[selectedDay] || {}

  const completedCount = MEAL_TYPES.filter(
    (type) => completedForDay[type]
  ).length

  function toggleMeal(type) {
    setCompletedMeals((current) => ({
      ...current,
      [selectedDay]: {
        ...(current[selectedDay] || {}),
        [type]: !(current[selectedDay] || {})[type],
      },
    }))
    setMessage('')
  }

  function startEditing(type) {
    setEditingMeal(type)
    setMealText(dayMeals[type] || '')
    setMessage('')
  }

  function saveMeal(event) {
    event.preventDefault()

    if (!mealText.trim()) {
      setMessage('Please enter a meal description.')
      return
    }

    setMealPlan((current) => ({
      ...current,
      [selectedDay]: {
        ...(current[selectedDay] || {}),
        [editingMeal]: mealText.trim(),
      },
    }))

    setEditingMeal(null)
    setMealText('')
    setMessage('Meal plan updated successfully.')
  }

  function cancelEditing() {
    setEditingMeal(null)
    setMealText('')
    setMessage('')
  }

  return (
    <div className="weekly-diet-page">
      <header className="weekly-diet-header">
        <div>
          <span className="weekly-diet-eyebrow">FITPULSE NUTRITION</span>
          <h1>Smart Weekly Diet Calendar</h1>
          <p>Plan your meals, track completion and build consistent habits.</p>
        </div>

        <div className="weekly-diet-progress">
          <strong>{completedCount} / {MEAL_TYPES.length}</strong>
          <span>Meals completed today in your plan</span>
          <div className="weekly-diet-progress-track">
            <div
              className="weekly-diet-progress-fill"
              style={{
                width: `${(completedCount / MEAL_TYPES.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </header>

      <section className="weekly-diet-days">
        {DAYS.map((day) => (
          <button
            key={day}
            type="button"
            className={`weekly-diet-day ${
              selectedDay === day ? 'selected' : ''
            }`}
            onClick={() => {
              setSelectedDay(day)
              setMessage('')
              cancelEditing()
            }}
          >
            {day}
          </button>
        ))}
      </section>

      <section className="weekly-diet-meals">
        <div className="weekly-diet-section-heading">
          <div>
            <span className="weekly-diet-eyebrow">YOUR DAILY PLAN</span>
            <h2>{selectedDay}'s Meals</h2>
          </div>
          <span className="weekly-diet-count">
            {completedCount} of {MEAL_TYPES.length} completed
          </span>
        </div>

        {MEAL_TYPES.map((type) => (
          <article className="weekly-diet-meal" key={type}>
            <div className="weekly-diet-meal-icon">
              {type === 'Breakfast'
                ? '🌅'
                : type === 'Lunch'
                  ? '🥗'
                  : type === 'Dinner'
                    ? '🌙'
                    : '🍎'}
            </div>

            <div className="weekly-diet-meal-content">
              <h3>{type}</h3>

              {editingMeal === type ? (
                <form onSubmit={saveMeal} className="weekly-diet-edit-form">
                  <textarea
                    value={mealText}
                    onChange={(event) => setMealText(event.target.value)}
                    maxLength={300}
                    rows={3}
                    required
                    aria-label={`Edit ${type}`}
                  />
                  <div className="weekly-diet-actions">
                    <button type="submit">Save meal</button>
                    <button type="button" onClick={cancelEditing}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <p>{dayMeals[type] || 'No meal added yet.'}</p>
                  <button
                    type="button"
                    className="weekly-diet-edit-link"
                    onClick={() => startEditing(type)}
                  >
                    Edit meal
                  </button>
                </>
              )}
            </div>

            <label className="weekly-diet-check">
              <input
                type="checkbox"
                checked={Boolean(completedForDay[type])}
                onChange={() => toggleMeal(type)}
              />
              <span>
                {completedForDay[type] ? 'Completed' : 'Mark done'}
              </span>
            </label>
          </article>
        ))}
      </section>

      {message && (
        <p className="weekly-diet-message" role="status">
          {message}
        </p>
      )}

      <p className="weekly-diet-note">
        This is a general meal-planning example, not a personalized medical
        diet. Adjust portions and ingredients to your needs, preferences and
        allergies. Your plan and completion checkboxes are saved in this
        browser.
      </p>
    </div>
  )
}

export default WeeklyDietCalendar
