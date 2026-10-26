
import { useState } from 'react'
import './WorkoutRoutines.css'

const workoutPlans = {
  Beginner: {
    Monday: [
      { name: 'Bodyweight Squats', sets: '3 sets', reps: '12 reps', rest: '60 sec' },
      { name: 'Wall Push-ups', sets: '3 sets', reps: '10 reps', rest: '60 sec' },
      { name: 'Plank', sets: '3 sets', reps: '20 sec', rest: '45 sec' },
    ],
    Tuesday: [
      { name: 'Brisk Walking', sets: '1 session', reps: '20 minutes', rest: 'As needed' },
      { name: 'Jumping Jacks', sets: '3 sets', reps: '15 reps', rest: '45 sec' },
    ],
    Wednesday: [
      { name: 'Lunges', sets: '3 sets', reps: '10 each leg', rest: '60 sec' },
      { name: 'Knee Push-ups', sets: '3 sets', reps: '8 reps', rest: '60 sec' },
      { name: 'Glute Bridges', sets: '3 sets', reps: '12 reps', rest: '45 sec' },
    ],
    Thursday: [
      { name: 'Brisk Walking', sets: '1 session', reps: '25 minutes', rest: 'As needed' },
      { name: 'Stretching', sets: '1 session', reps: '10 minutes', rest: 'As needed' },
    ],
    Friday: [
      { name: 'Bodyweight Squats', sets: '3 sets', reps: '12 reps', rest: '60 sec' },
      { name: 'Wall Push-ups', sets: '3 sets', reps: '10 reps', rest: '60 sec' },
      { name: 'Plank', sets: '3 sets', reps: '25 sec', rest: '45 sec' },
    ],
    Saturday: [
      { name: 'Cycling or Walking', sets: '1 session', reps: '20 minutes', rest: 'As needed' },
      { name: 'Full Body Stretch', sets: '1 session', reps: '10 minutes', rest: 'As needed' },
    ],
    Sunday: [
      { name: 'Rest Day', sets: 'Recovery', reps: 'Rest and recover', rest: '—' },
    ],
  },

  'Muscle Building': {
    Monday: [
      { name: 'Bench Press', sets: '4 sets', reps: '8–10 reps', rest: '90 sec' },
      { name: 'Dumbbell Incline Press', sets: '3 sets', reps: '10 reps', rest: '75 sec' },
      { name: 'Triceps Pushdown', sets: '3 sets', reps: '12 reps', rest: '60 sec' },
    ],
    Tuesday: [
      { name: 'Lat Pulldown', sets: '4 sets', reps: '10 reps', rest: '90 sec' },
      { name: 'Seated Cable Row', sets: '3 sets', reps: '10 reps', rest: '75 sec' },
      { name: 'Dumbbell Biceps Curl', sets: '3 sets', reps: '12 reps', rest: '60 sec' },
    ],
    Wednesday: [
      { name: 'Bodyweight Squats', sets: '3 sets', reps: '12 reps', rest: '60 sec' },
      { name: 'Walking Lunges', sets: '3 sets', reps: '10 each leg', rest: '60 sec' },
      { name: 'Calf Raises', sets: '3 sets', reps: '15 reps', rest: '45 sec' },
    ],
    Thursday: [
      { name: 'Shoulder Press', sets: '4 sets', reps: '10 reps', rest: '90 sec' },
      { name: 'Lateral Raises', sets: '3 sets', reps: '12 reps', rest: '60 sec' },
      { name: 'Face Pulls', sets: '3 sets', reps: '12 reps', rest: '60 sec' },
    ],
    Friday: [
      { name: 'Goblet Squats', sets: '3 sets', reps: '10 reps', rest: '75 sec' },
      { name: 'Dumbbell Bench Press', sets: '3 sets', reps: '10 reps', rest: '75 sec' },
      { name: 'Lat Pulldown', sets: '3 sets', reps: '10 reps', rest: '75 sec' },
    ],
    Saturday: [
      { name: 'Easy Cycling', sets: '1 session', reps: '20 minutes', rest: 'As needed' },
      { name: 'Full Body Stretch', sets: '1 session', reps: '10 minutes', rest: 'As needed' },
    ],
    Sunday: [
      { name: 'Rest Day', sets: 'Recovery', reps: 'Rest and recover', rest: '—' },
    ],
  },

  Strength: {
    Monday: [
      { name: 'Squats', sets: '4 sets', reps: '5 reps', rest: '2–3 min' },
      { name: 'Leg Press', sets: '3 sets', reps: '8 reps', rest: '2 min' },
    ],
    Tuesday: [
      { name: 'Bench Press', sets: '4 sets', reps: '5 reps', rest: '2–3 min' },
      { name: 'Dumbbell Row', sets: '3 sets', reps: '8 reps', rest: '2 min' },
    ],
    Wednesday: [
      { name: 'Brisk Walking', sets: '1 session', reps: '20 minutes', rest: 'As needed' },
      { name: 'Mobility Exercises', sets: '1 session', reps: '10 minutes', rest: 'As needed' },
    ],
    Thursday: [
      { name: 'Deadlift', sets: '3 sets', reps: '5 reps', rest: '2–3 min' },
      { name: 'Lat Pulldown', sets: '3 sets', reps: '8 reps', rest: '90 sec' },
    ],
    Friday: [
      { name: 'Overhead Press', sets: '4 sets', reps: '5 reps', rest: '2 min' },
      { name: 'Lunges', sets: '3 sets', reps: '8 each leg', rest: '90 sec' },
    ],
    Saturday: [
      { name: 'Light Cycling', sets: '1 session', reps: '15 minutes', rest: 'As needed' },
      { name: 'Stretching', sets: '1 session', reps: '10 minutes', rest: 'As needed' },
    ],
    Sunday: [
      { name: 'Rest Day', sets: 'Recovery', reps: 'Rest and recover', rest: '—' },
    ],
  },

  'Weight Loss': {
    Monday: [
      { name: 'Treadmill Walking', sets: '1 session', reps: '20 minutes', rest: 'As needed' },
      { name: 'Bodyweight Squats', sets: '3 sets', reps: '12 reps', rest: '45 sec' },
      { name: 'Wall Push-ups', sets: '3 sets', reps: '10 reps', rest: '45 sec' },
    ],
    Tuesday: [
      { name: 'Stationary Cycling', sets: '1 session', reps: '20 minutes', rest: 'As needed' },
      { name: 'Step-ups', sets: '3 sets', reps: '10 each leg', rest: '45 sec' },
    ],
    Wednesday: [
      { name: 'Brisk Walking', sets: '1 session', reps: '25 minutes', rest: 'As needed' },
      { name: 'Plank', sets: '3 sets', reps: '20 sec', rest: '45 sec' },
    ],
    Thursday: [
      { name: 'Elliptical Trainer', sets: '1 session', reps: '20 minutes', rest: 'As needed' },
      { name: 'Bodyweight Lunges', sets: '3 sets', reps: '10 each leg', rest: '45 sec' },
    ],
    Friday: [
      { name: 'Treadmill Walking', sets: '1 session', reps: '20 minutes', rest: 'As needed' },
      { name: 'Squats', sets: '3 sets', reps: '12 reps', rest: '45 sec' },
      { name: 'Standing Crunches', sets: '3 sets', reps: '15 reps', rest: '45 sec' },
    ],
    Saturday: [
      { name: 'Cycling or Swimming', sets: '1 session', reps: '25 minutes', rest: 'As needed' },
      { name: 'Full Body Stretch', sets: '1 session', reps: '10 minutes', rest: 'As needed' },
    ],
    Sunday: [
      { name: 'Rest Day', sets: 'Recovery', reps: 'Rest and recover', rest: '—' },
    ],
  },
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function WorkoutRoutines() {
  const [selectedPlan, setSelectedPlan] = useState('Beginner')
  const [selectedDay, setSelectedDay] = useState('Monday')
  const [completed, setCompleted] = useState({})

  const exercises = workoutPlans[selectedPlan][selectedDay]
  const completedCount = exercises.filter((_, index) =>
    completed[`${selectedPlan}-${selectedDay}-${index}`]
  ).length

  const totalExercises = days.reduce(
    (total, day) => total + workoutPlans[selectedPlan][day].length,
    0
  )

  const totalCompleted = days.reduce(
    (total, day) =>
      total +
      workoutPlans[selectedPlan][day].filter((_, index) =>
        completed[`${selectedPlan}-${day}-${index}`]
      ).length,
    0
  )

  const progress = totalExercises
    ? Math.round((totalCompleted / totalExercises) * 100)
    : 0

  function toggleExercise(index) {
    const key = `${selectedPlan}-${selectedDay}-${index}`
    setCompleted(previous => ({
      ...previous,
      [key]: !previous[key],
    }))
  }

  function resetProgress() {
    setCompleted(previous => {
      const updated = { ...previous }
      Object.keys(updated).forEach(key => {
        if (key.startsWith(`${selectedPlan}-`)) {
          delete updated[key]
        }
      })
      return updated
    })
  }

  return (
    <div className="workout-page">
      <div className="workout-header">
        <div>
          <p className="workout-eyebrow">FITPULSE FITNESS</p>
          <h1>Workout Routines</h1>
          <p>Choose your plan, follow your exercises, and track your progress.</p>
        </div>
        <div className="workout-header-icon">💪</div>
      </div>

      <div className="workout-plan-selector">
        <label htmlFor="workout-plan">Select your workout plan</label>
        <select
          id="workout-plan"
          value={selectedPlan}
          onChange={event => {
            setSelectedPlan(event.target.value)
            setSelectedDay('Monday')
          }}
        >
          {Object.keys(workoutPlans).map(plan => (
            <option key={plan} value={plan}>{plan}</option>
          ))}
        </select>
      </div>

      <div className="workout-summary">
        <div className="workout-summary-card">
          <span className="summary-icon">📅</span>
          <div>
            <p>Weekly Exercises</p>
            <h2>{totalExercises}</h2>
          </div>
        </div>
        <div className="workout-summary-card">
          <span className="summary-icon">✅</span>
          <div>
            <p>Exercises Completed</p>
            <h2>{totalCompleted} / {totalExercises}</h2>
          </div>
        </div>
        <div className="workout-summary-card">
          <span className="summary-icon">📈</span>
          <div>
            <p>Weekly Progress</p>
            <h2>{progress}%</h2>
          </div>
        </div>
      </div>

      <div className="workout-progress-section">
        <div className="workout-progress-label">
          <span>Weekly completion</span>
          <strong>{progress}%</strong>
        </div>
        <div className="workout-progress-track">
          <div className="workout-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="workout-days">
        {days.map(day => {
          const dayExercises = workoutPlans[selectedPlan][day]
          const dayCompleted = dayExercises.filter((_, index) =>
            completed[`${selectedPlan}-${day}-${index}`]
          ).length

          return (
            <button
              type="button"
              key={day}
              className={`workout-day-button ${selectedDay === day ? 'active' : ''}`}
              onClick={() => setSelectedDay(day)}
            >
              <span>{day.slice(0, 3)}</span>
              <small>{dayCompleted}/{dayExercises.length}</small>
            </button>
          )
        })}
      </div>

      <div className="workout-exercises-section">
        <div className="workout-section-heading">
          <div>
            <h2>{selectedDay}'s Workout</h2>
            <p>{selectedPlan} plan · {exercises.length} activities</p>
          </div>
          <span className="workout-day-badge">{completedCount}/{exercises.length} done</span>
        </div>

        <div className="workout-exercise-list">
          {exercises.map((exercise, index) => {
            const key = `${selectedPlan}-${selectedDay}-${index}`
            const isCompleted = Boolean(completed[key])

            return (
              <div
                className={`workout-exercise-card ${isCompleted ? 'completed' : ''}`}
                key={`${selectedPlan}-${selectedDay}-${exercise.name}`}
              >
                <div className="exercise-number">{isCompleted ? '✓' : String(index + 1).padStart(2, '0')}</div>
                <div className="exercise-details">
                  <h3>{exercise.name}</h3>
                  <div className="exercise-meta">
                    <span>🏋️ {exercise.sets}</span>
                    <span>🔁 {exercise.reps}</span>
                    <span>⏱️ Rest: {exercise.rest}</span>
                  </div>
                </div>
                <label className="exercise-check">
                  <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={() => toggleExercise(index)}
                  />
                  <span>{isCompleted ? 'Done' : 'Mark done'}</span>
                </label>
              </div>
            )
          })}
        </div>

        {completedCount === exercises.length && (
          <div className="workout-success-message">
            🎉 Great work! You have completed all activities for {selectedDay}.
          </div>
        )}

        <div className="workout-actions">
          <button
            type="button"
            className="workout-reset-button"
            onClick={resetProgress}
          >
            Reset {selectedPlan} Progress
          </button>
        </div>
      </div>

      <div className="workout-tip">
        <span>💡</span>
        <div>
          <strong>Fitness tip</strong>
          <p>Warm up before exercising, use proper form, drink water, and choose weights that match your ability. Stop if you feel pain or dizziness.</p>
        </div>
      </div>
    </div>
  )
}

export default WorkoutRoutines
