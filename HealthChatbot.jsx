
import { useState } from 'react'
import './HealthChatbot.css'

const answers = [
  {
    keywords: ['protein', 'muscle gain', 'muscle building'],
    answer:
      'For muscle growth, include protein-rich foods such as eggs, milk, curd, paneer, dal, beans, soy, fish or chicken. Combine balanced meals with strength training and enough sleep. Your protein needs depend on your body weight and health.'
  },
  {
    keywords: ['weight loss', 'lose weight', 'fat loss'],
    answer:
      'For gradual weight loss, focus on balanced meals, vegetables, fruit, protein and regular activity. Portion sizes and consistency matter. Avoid crash diets and extreme calorie restrictions.'
  },
  {
    keywords: ['vegetarian', 'veg diet', 'vegetarian diet'],
    answer:
      'A balanced vegetarian meal can include dal, rajma, chole, paneer or tofu, curd, vegetables, whole grains and fruit. Include a protein source with your main meals.'
  },
  {
    keywords: ['breakfast', 'morning meal'],
    answer:
      'Breakfast ideas include oats with milk and fruit, vegetable poha with curd, eggs with whole-grain toast, or paneer/tofu with roti. Choose portions that fit your needs and activity.'
  },
  {
    keywords: ['before workout', 'pre workout'],
    answer:
      'Before exercising, try a banana, oats, toast or another easy-to-digest snack. A larger meal is usually best a few hours before training. Drink water.'
  },
  {
    keywords: ['after workout', 'post workout', 'recovery'],
    answer:
      'After training, have a balanced meal containing protein and carbohydrates. Examples include dal with rice, eggs with toast, paneer with roti, or yogurt with oats. Rest and hydration also support recovery.'
  },
  {
    keywords: ['calories', 'calorie'],
    answer:
      'Calories measure the energy you get from food. Your daily needs depend on age, body size, activity and goals. Food labels and a food diary can help estimate intake; avoid extreme calorie targets.'
  },
  {
    keywords: ['water', 'hydration', 'drink'],
    answer:
      'Drink water regularly throughout the day and around exercise. Needs vary with heat, activity and sweat loss. During long or intense sessions in hot weather, you may need extra fluids.'
  },
  {
    keywords: ['cardio', 'cardiovascular'],
    answer:
      'Begin with a manageable activity such as brisk walking, cycling or swimming. Increase duration gradually, and combine cardio with strength training if appropriate for your fitness level.'
  },
  {
    keywords: ['beginner', 'new to gym', 'starting gym'],
    answer:
      'If you are new to the gym, start with light resistance, learn proper technique and allow recovery between strength sessions. A qualified trainer can help you adapt exercises to your ability.'
  },
  {
    keywords: ['sleep', 'rest'],
    answer:
      'Sleep supports recovery, energy and training performance. Keep a regular sleep schedule and allow worked muscles time to recover between challenging sessions.'
  },
  {
    keywords: ['diet plan', 'meal plan'],
    answer:
      'A simple balanced day could include oats or eggs at breakfast, fruit as a snack, dal or paneer with rice/roti and vegetables at lunch, yogurt or nuts as a snack, and a balanced dinner with protein and vegetables. Adjust foods and portions to your preferences and needs.'
  }
]

function getAnswer(question) {
  const text = question.toLowerCase()

  const match = answers.find(item =>
    item.keywords.some(keyword => text.includes(keyword))
  )

  if (match) return match.answer

  if (
    text.includes('hello') ||
    text.includes('hi') ||
    text.includes('hey')
  ) {
    return 'Hello! Welcome to FitPulse Health & Diet Assistant. Ask me about nutrition, protein, workouts, hydration, recovery or meal ideas.'
  }

  return 'I can help with general fitness and nutrition topics. Try asking about protein, weight loss, vegetarian meals, calories, pre-workout food, recovery, cardio or sleep. I use a set of prepared answers, so I may not understand every question.'
}

export default function HealthChatbot() {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hi! I am your FitPulse Health & Diet Assistant. Ask me about healthy meals, protein, calories or workouts!'
    }
  ])

  function sendMessage(event) {
    event.preventDefault()

    const text = question.trim()
    if (!text) return

    const answer = getAnswer(text)

    setMessages(previous => [
      ...previous,
      { sender: 'user', text },
      { sender: 'bot', text: answer }
    ])

    setQuestion('')
  }

  return (
    <main className="health-chat-page">
      <section className="health-chat-card">
        <header className="health-chat-header">
          <div className="health-chat-avatar">💪</div>
          <div>
            <h1>FitPulse Health Assistant</h1>
            <p>Health, fitness and diet guidance</p>
          </div>
          <span className="health-chat-status">Ready</span>
        </header>

        <div className="health-chat-notice">
          Free fitness assistant · Uses prepared answers, not live AI
        </div>

        <div className="health-chat-messages" aria-live="polite">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`health-chat-message ${message.sender}`}
            >
              <span>{message.sender === 'bot' ? 'FitPulse' : 'You'}</span>
              <p>{message.text}</p>
            </div>
          ))}
        </div>

        <div className="health-chat-suggestions">
          {[
            'Suggest a vegetarian diet',
            'How can I build muscle?',
            'What should I eat after workout?',
            'Tell me about hydration'
          ].map(suggestion => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setQuestion(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>

        <form className="health-chat-form" onSubmit={sendMessage}>
          <input
            type="text"
            value={question}
            onChange={event => setQuestion(event.target.value)}
            placeholder="Ask about food, diet or fitness..."
            aria-label="Your health or diet question"
          />
          <button type="submit">Send</button>
        </form>

        <p className="health-chat-disclaimer">
          General educational information only. This assistant does not
          diagnose conditions or replace a qualified healthcare professional.
          Seek professional advice for medical or specialised dietary needs.
        </p>
      </section>
    </main>
  )
}
