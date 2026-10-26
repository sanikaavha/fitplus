
import { useEffect, useState } from 'react'

function getSavedSetting(key) {
  try {
    return localStorage.getItem(key) || ''
  } catch {
    return ''
  }
}

function Nutrition() {
  const [weight, setWeight] = useState(() => getSavedSetting('fitpulse_weight'))
  const [height, setHeight] = useState(() => getSavedSetting('fitpulse_height'))
  const [age, setAge] = useState(() => getSavedSetting('fitpulse_age'))
  const [calories, setCalories] = useState(() => getSavedSetting('fitpulse_calories'))
  const [protein, setProtein] = useState(() => getSavedSetting('fitpulse_protein'))

  const [food, setFood] = useState('')
  const [foodCalories, setFoodCalories] = useState('')
  const [foodProtein, setFoodProtein] = useState('')
  const [meals, setMeals] = useState([])
  const [loadingMeals, setLoadingMeals] = useState(true)
  const [savingFood, setSavingFood] = useState(false)
  const [deletingFoodId, setDeletingFoodId] = useState('')
  const [editingFoodId, setEditingFoodId] = useState('')
  const [nutritionError, setNutritionError] = useState('')
  const [nutritionMessage, setNutritionMessage] = useState('')

  // Automatically save personal measurements and daily targets.
  useEffect(() => {
    try {
      localStorage.setItem('fitpulse_weight', weight)
      localStorage.setItem('fitpulse_height', height)
      localStorage.setItem('fitpulse_age', age)
      localStorage.setItem('fitpulse_calories', calories)
      localStorage.setItem('fitpulse_protein', protein)
    } catch (error) {
      console.error('Could not save nutrition settings:', error)
    }
  }, [weight, height, age, calories, protein])

  const bmi =
    Number(weight) > 0 && Number(height) > 0
      ? Number(weight) / ((Number(height) / 100) ** 2)
      : null

  const bmiCategory = !bmi
    ? ''
    : bmi < 18.5
      ? 'Underweight'
      : bmi < 25
        ? 'Normal range'
        : bmi < 30
          ? 'Overweight'
          : 'Obesity range'

  // Calculate nutrition totals using today's entries only.
  function isToday(dateValue) {
    if (!dateValue) return false

    const date = new Date(dateValue)
    const today = new Date()

    return (
      !Number.isNaN(date.getTime()) &&
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    )
  }

  const todayMeals = meals.filter((meal) => isToday(meal.date))

  const totalCalories = todayMeals.reduce(
    (sum, meal) => sum + (Number(meal.calories) || 0),
    0
  )

  const totalProtein = todayMeals.reduce(
    (sum, meal) => sum + (Number(meal.protein) || 0),
    0
  )

  useEffect(() => {
    async function loadMeals() {
      try {
        const response = await fetch(
          'http://localhost:5000/api/nutrition'
        )

        if (!response.ok) {
          throw new Error('Could not load saved food entries.')
        }

        const data = await response.json()

        setMeals(
          data.map((item) => ({
            id: item._id,
            name: item.food,
            calories: Number(item.calories),
            protein: Number(item.protein),
            date: item.date,
          }))
        )
      } catch (error) {
        setNutritionError(error.message)
      } finally {
        setLoadingMeals(false)
      }
    }

    loadMeals()
  }, [])

  function resetFoodForm() {
    setFood('')
    setFoodCalories('')
    setFoodProtein('')
    setEditingFoodId('')
  }

  function startEditingFood(meal) {
    setEditingFoodId(meal.id)
    setFood(meal.name)
    setFoodCalories(String(meal.calories))
    setFoodProtein(String(meal.protein))
    setNutritionError('')
    setNutritionMessage('')
  }

  async function addFood(event) {
    event.preventDefault()
    setNutritionError('')
    setNutritionMessage('')

    if (
      !food.trim() ||
      foodCalories === '' ||
      foodProtein === '' ||
      !Number.isFinite(Number(foodCalories)) ||
      !Number.isFinite(Number(foodProtein)) ||
      Number(foodCalories) < 0 ||
      Number(foodProtein) < 0
    ) {
      setNutritionError(
        'Enter a food name and valid calorie and protein values.'
      )
      return
    }

    try {
      setSavingFood(true)

      const isEditing = Boolean(editingFoodId)

      const response = await fetch(
        isEditing
          ? `http://localhost:5000/api/nutrition/${editingFoodId}`
          : 'http://localhost:5000/api/nutrition',
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            food: food.trim(),
            calories: Number(foodCalories),
            protein: Number(foodProtein),
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Could not save food entry.')
      }

      const saved = data.log

      const updatedMeal = {
        id: saved._id,
        name: saved.food,
        calories: Number(saved.calories),
        protein: Number(saved.protein),
        date: saved.date,
      }

      if (isEditing) {
        setMeals((current) =>
          current.map((meal) =>
            meal.id === editingFoodId ? updatedMeal : meal
          )
        )
      } else {
        setMeals((current) => [updatedMeal, ...current])
      }

      resetFoodForm()

      setNutritionMessage(
        isEditing
          ? 'Food entry updated successfully!'
          : 'Food entry saved to MongoDB successfully!'
      )
    } catch (error) {
      setNutritionError(error.message)
    } finally {
      setSavingFood(false)
    }
  }

  async function removeFood(id) {
    setNutritionError('')
    setNutritionMessage('')

    try {
      setDeletingFoodId(id)

      const response = await fetch(
        `http://localhost:5000/api/nutrition/${id}`,
        {
          method: 'DELETE',
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Could not delete food entry.')
      }

      setMeals((current) => current.filter((meal) => meal.id !== id))

      if (editingFoodId === id) {
        resetFoodForm()
      }

      setNutritionMessage('Food entry deleted successfully.')
    } catch (error) {
      setNutritionError(error.message)
    } finally {
      setDeletingFoodId('')
    }
  }

  return (
    <div className="dashboard-page">
      <section className="welcome">
        <div className="welcome-copy">
          <span className="welcome-tag">
            <span className="status-dot" /> FITNESS & NUTRITION
          </span>
          <h2>Your Nutrition Dashboard</h2>
          <p>Track your meals, calories, protein, and BMI in one place.</p>
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <div className="stat-top">
            <span>Today's Calories</span>
            <span className="stat-icon purple">C</span>
          </div>
          <h3>{totalCalories.toLocaleString('en-IN')}</h3>
          <p>Calories consumed today</p>
        </article>

        <article className="stat-card">
          <div className="stat-top">
            <span>Today's Protein</span>
            <span className="stat-icon green">P</span>
          </div>
          <h3>{Number(totalProtein.toFixed(2))} g</h3>
          <p>Protein consumed today</p>
        </article>

        <article className="stat-card">
          <div className="stat-top">
            <span>Your BMI</span>
            <span className="stat-icon orange">B</span>
          </div>
          <h3>{bmi ? bmi.toFixed(1) : '—'}</h3>
          <p>{bmiCategory || 'Enter your measurements below'}</p>
        </article>

        <article className="stat-card">
          <div className="stat-top">
            <span>Meals Today</span>
            <span className="stat-icon blue">M</span>
          </div>
          <h3>{todayMeals.length}</h3>
          <p>Food entries logged today</p>
        </article>
      </section>

      <section className="dashboard-lower-grid">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">HEALTH TRACKING</span>
              <h3>BMI calculator</h3>
              <p>Enter your measurements to calculate your BMI.</p>
            </div>
          </div>

          <div style={{ padding: '20px 0' }}>
            <label>
              Weight (kg)
              <input
                type="number"
                min="1"
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
                placeholder="e.g. 70"
                style={inputStyle}
              />
            </label>

            <label>
              Height (cm)
              <input
                type="number"
                min="1"
                value={height}
                onChange={(event) => setHeight(event.target.value)}
                placeholder="e.g. 175"
                style={inputStyle}
              />
            </label>

            <label>
              Age (years, optional)
              <input
                type="number"
                min="1"
                value={age}
                onChange={(event) => setAge(event.target.value)}
                placeholder="e.g. 25"
                style={inputStyle}
              />
            </label>

            {bmi && (
              <p style={{ marginTop: 16 }}>
                BMI: <strong>{bmi.toFixed(1)}</strong> — {bmiCategory}
              </p>
            )}

            <p style={{ fontSize: 12, opacity: 0.75 }}>
              BMI is a general screening measure, not a diagnosis.
              Adult BMI categories may not be appropriate for children
              or teens. Age is not used in this adult BMI calculation.
            </p>
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">DAILY TARGETS</span>
              <h3>Nutrition targets</h3>
              <p>Set your own daily calorie and protein goals.</p>
            </div>
          </div>

          <div style={{ padding: '20px 0' }}>
            <label>
              Daily calorie target
              <input
                type="number"
                min="0"
                value={calories}
                onChange={(event) => setCalories(event.target.value)}
                placeholder="e.g. 2200"
                style={inputStyle}
              />
            </label>

            <label>
              Daily protein target (g)
              <input
                type="number"
                min="0"
                value={protein}
                onChange={(event) => setProtein(event.target.value)}
                placeholder="e.g. 100"
                style={inputStyle}
              />
            </label>

            <div style={{ marginTop: 20 }}>
              <p>
                Calories: {totalCalories}
                {calories !== ''
                  ? ` / ${calories} kcal`
                  : ' kcal logged today'}
              </p>

              <div style={progressTrack}>
                <div
                  style={{
                    ...progressFill,
                    width: `${
                      calories !== '' && Number(calories) > 0
                        ? Math.min(
                            (totalCalories / Number(calories)) * 100,
                            100
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>

              <p>
                Protein: {Number(totalProtein.toFixed(2))}
                {protein !== '' ? ` / ${protein} g` : ' g logged today'}
              </p>

              <div style={progressTrack}>
                <div
                  style={{
                    ...progressFill,
                    width: `${
                      protein !== '' && Number(protein) > 0
                        ? Math.min(
                            (totalProtein / Number(protein)) * 100,
                            100
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="panel" style={{ marginTop: 24 }}>
        <div className="panel-heading">
          <div>
            <span className="section-kicker">FOOD TRACKER</span>
            <h3>{editingFoodId ? 'Edit food entry' : 'Log a meal'}</h3>
            <p>Enter nutrition values from a food label or reliable source.</p>
          </div>
        </div>

        <form onSubmit={addFood} style={{ padding: '20px 0' }}>
          <label>
            Food or meal name
            <input
              value={food}
              onChange={(event) => setFood(event.target.value)}
              placeholder="e.g. 2 eggs and toast"
              required
              maxLength={120}
              style={inputStyle}
            />
          </label>

          <label>
            Calories (kcal)
            <input
              type="number"
              min="0"
              step="any"
              value={foodCalories}
              onChange={(event) => setFoodCalories(event.target.value)}
              placeholder="e.g. 350"
              required
              style={inputStyle}
            />
          </label>

          <label>
            Protein (g)
            <input
              type="number"
              min="0"
              step="any"
              value={foodProtein}
              onChange={(event) => setFoodProtein(event.target.value)}
              placeholder="e.g. 20"
              required
              style={inputStyle}
            />
          </label>

          <button
            type="submit"
            className="text-link"
            disabled={savingFood}
          >
            {savingFood
              ? 'Saving...'
              : editingFoodId
                ? 'Save Changes'
                : '+ Add food'}
          </button>

          {editingFoodId && (
            <button
              type="button"
              className="text-link"
              disabled={savingFood}
              onClick={() => {
                resetFoodForm()
                setNutritionError('')
                setNutritionMessage('')
              }}
              style={{ marginLeft: 12 }}
            >
              Cancel
            </button>
          )}
        </form>

        {nutritionError && (
          <p role="alert" style={{ color: '#e57373', margin: '8px 0' }}>
            {nutritionError}
          </p>
        )}

        {nutritionMessage && (
          <p role="status" style={{ margin: '8px 0' }}>
            {nutritionMessage}
          </p>
        )}

        <div>
          <h3>Food log</h3>

          {loadingMeals ? (
            <p className="empty-state">Loading saved food entries...</p>
          ) : meals.length === 0 ? (
            <p className="empty-state">No meals logged yet.</p>
          ) : (
            meals.map((meal) => (
              <div
                key={meal.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 0',
                  borderBottom: '1px solid rgba(128,128,128,0.2)',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <strong>{meal.name}</strong>
                  <p style={{ margin: '5px 0 0', opacity: 0.75 }}>
                    {meal.calories} kcal · {meal.protein} g protein
                    {meal.date && (
                      <> · {new Date(meal.date).toLocaleDateString('en-IN')}</>
                    )}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="text-link"
                    disabled={savingFood || deletingFoodId === meal.id}
                    onClick={() => startEditingFood(meal)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="text-link"
                    disabled={deletingFoodId === meal.id || savingFood}
                    onClick={() => removeFood(meal.id)}
                  >
                    {deletingFoodId === meal.id ? 'Removing...' : 'Remove'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <p style={{ fontSize: 12, opacity: 0.7, marginTop: 16 }}>
        Food entries are saved in your local FitPulse MongoDB database.
        Your BMI measurements and nutrition targets are saved in this
        browser and will remain after refreshing the page.
      </p>
    </div>
  )
}

const inputStyle = {
  display: 'block',
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px',
  marginTop: '8px',
  marginBottom: '16px',
  borderRadius: '8px',
  border: '1px solid rgba(128,128,128,0.4)',
  background: 'transparent',
  color: 'inherit',
  font: 'inherit',
}

const progressTrack = {
  height: '8px',
  borderRadius: '8px',
  background: 'rgba(128,128,128,0.2)',
  overflow: 'hidden',
  margin: '8px 0 20px',
}

const progressFill = {
  height: '100%',
  borderRadius: '8px',
  background: '#8bb9f4',
  transition: 'width 0.2s ease',
}

export default Nutrition
