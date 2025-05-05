# Calmora

Calmora is a thoughtfully designed mental-wellness web application that helps users track their moods, visualize emotional trends, and receive personalized AI-driven tips and recommendations. Built with Flask and SQLAlchemy, Calmora delivers a seamless, secure, and responsive experience across desktop and mobile devices.

---

## 🔍 Table of Contents

1. [Key Features](#key-features)
2. [User Interface & Experience](#user-interface--experience)
3. [Architecture & Tech Stack](#architecture--tech-stack)
4. [Getting Started](#getting-started)
5. [Project Structure](#project-structure)
6. [Configuration & Environment Variables](#configuration--environment-variables)
7. [Database Migrations](#database-migrations)
8. [Deployment](#deployment)
9. [Contributing](#contributing)
10. [License](#license)

---

## 🚀 Key Features

* **Mood Tracking**

  * Users can log free-form text entries describing their current feelings or select from predefined mood categories.
  * Each entry is time-stamped and persisted in a MySQL database.

* **Sentiment Analysis & Scoring**

  * Integration with a lightweight NLP pipeline (e.g., VADER) analyzes entry sentiment in real time.
  * Each entry receives a sentiment label (Positive, Neutral, Negative) and a numeric score (–1.0 to +1.0).

* **AI-Driven Recommendations**

  * Generates tailored suggestions—mindfulness exercises, motivational quotes, self-care tips—based on recent sentiment trends.
  * Provides a “Your Mood Insights” dashboard with weekly trend charts and personalized notes.

* **Historical Mood Journal**

  * A paginated history view lets users browse, filter, and revisit all past entries.
  * Drill down into individual entry details and their associated AI recommendations.

* **User Authentication & Profile Management**

  * Secure signup/login with Flask-Login and Werkzeug password hashing.
  * 30-minute inactivity timeout to protect session data.
  * Profile page for updating name, email, and password.

* **Theme Toggle & Responsive Design**

  * Light/dark theme switch powered by vanilla JavaScript, with preference stored per user.
  * Fully responsive layout using Flexbox and CSS custom properties for a polished look on any device.

* **Flash Messaging & Form Validation**

  * All forms utilize Flask-WTF/WTForms with CSRF protection and built-in validators.
  * Users receive real-time feedback on actions (success, warning, error) via styled flash alerts.

* **Health Check & API Endpoints**

  * `/api/insights` endpoint returns trend data (JSON) for integration with custom front-end widgets or mobile apps.
  * `/ _health` endpoint for deployment platform health checks (returns HTTP 200).

---

## 🎨 User Interface & Experience

* **Landing Page**

  * Overview of Calmora’s core benefits, feature highlights, and a prominent call to action (Sign Up).
* **Dashboard (Home)**

  * Greeting by name, mood entry form, last entry summary, real-time AI tips, and a scrollable list of recent moods.
* **History**

  * Chronological timeline, mood cards with sentiment badge, score, and “View Details” links.
* **Results**

  * Full view of a single entry’s text, timestamp, sentiment breakdown, and expanded AI recommendations.
* **Auth & Profile**

  * Clean, focused auth pages with inline validations and helpful illustrations.
  * Profile update form preserves existing data and allows password changes.

Color palette (customizable via CSS variables):

| Name       | Hex       | Usage                           |
| ---------- | --------- | ------------------------------- |
| Mint Mist  | `#F6FFFD` | Backgrounds, containers         |
| Slate Text | `#2E3A44` | Primary text, headings, icons   |
| Leaf Green | `#37D69C` | Buttons, accent elements        |
| Lavender   | `#C5B8F2` | Secondary buttons, hover states |
| Sky Blue   | `#8FD5F8` | Info banners, tooltips, badges  |
| Peach Glow | `#F2D5B3` | Warnings, alerts, highlights    |

---

## 🏗 Architecture & Tech Stack

* **Backend**

  * [Flask](https://flask.palletsprojects.com/) — lightweight web framework
  * Application Factory Pattern for flexible configuration and easy testing
  * Blueprints for modular separation of `auth`, `main`, and `api` routes

* **Database**

  * [MySQL](https://www.mysql.com/) (production) / SQLite (development fallback)
  * [Flask-SQLAlchemy](https://flask-sqlalchemy.palletsprojects.com/) as ORM
  * [Flask-Migrate](https://flask-migrate.readthedocs.io/) (Alembic) for schema migrations

* **Forms & Security**

  * [Flask-WTF](https://flask-wtf.readthedocs.io/) + [WTForms](https://wtforms.readthedocs.io/) for CSRF-protected forms
  * Validators: `DataRequired`, `Email`, `EqualTo`, custom uniqueness checks
  * [Werkzeug.security](https://werkzeug.palletsprojects.com/) for password hashing

* **Sentiment Analysis**

  * NLTK’s VADER or a custom lightweight model
  * Python function `analyze_sentiment(text) → (label, score)`

* **AI Insights & Trends**

  * Pandas for time-series resampling and data manipulation
  * NumPy for linear regression (`polyfit`) to detect upward/downward mood trends
  * Exposed as JSON via `/api/insights` for chart rendering

* **Frontend**

  * Jinja2 templating with `base.html` + template inheritance
  * Custom CSS (Flexbox, CSS variables, transitions)
  * JavaScript for:

    * Theme toggle (light/dark)
    * Fetching AI insights via the `/api/insights` endpoint
    * Modal dialogs and interactive UI enhancements

---

## 🛠 Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/calmora.git
   cd calmora
   ```

2. **Create & activate a virtual environment**

   ```bash
   python3 -m venv venv
   source venv/bin/activate   # macOS/Linux
   venv\Scripts\activate      # Windows
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   Copy `.env.example` → `.env` and update:

   ```
   SECRET_KEY=your-flask-secret-key
   SQLALCHEMY_DATABASE_URI=mysql+pymysql://user:pass@host/dbname
   ```

5. **Initialize & run database migrations**

   ```bash
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   ```

6. **Run the development server**

   ```bash
   flask run
   ```

   Visit `http://127.0.0.1:5000` in your browser.

---

## 🗂 Project Structure

```
calmora/
├── app/
│   ├── auth/               # Authentication blueprint
│   ├── main/               # Dashboard, history, profile blueprint
│   ├── api/                # API endpoints (e.g., /api/insights)
│   ├── utils/              # Error handlers, helpers
│   └── templates/          # Jinja2 HTML templates
│       ├── base.html
│       ├── index.html
│       ├── home.html
│       ├── history.html
│       ├── results.html
│       ├── login.html
│       ├── signup.html
│       └── 404.html
├── migrations/             # Flask-Migrate / Alembic migrations
├── static/
│   ├── css/                # style.css
│   ├── js/                 # script.js
│   └── images/             # logos, illustrations, favicons
├── models/
│   └── database.py         # SQLAlchemy Base models & SessionLocal
├── sentiment_analysis.py   # analyze_sentiment(), generate_recommendations()
├── run.py                  # Create app via factory and run
├── requirements.txt
└── README.md
```

---

## 🔧 Configuration & Environment Variables

| Variable                     | Description                                          |
| ---------------------------- | ---------------------------------------------------- |
| `SECRET_KEY`                 | Flask application secret for sessions & CSRF         |
| `WTF_CSRF_SECRET_KEY`        | CSRF protection key (typically same as `SECRET_KEY`) |
| `SQLALCHEMY_DATABASE_URI`    | Connection URI to your MySQL (or SQLite) database    |
| `PERMANENT_SESSION_LIFETIME` | (Optional) Session timeout in seconds                |

---

## 📦 Database Migrations

Calmora uses Flask-Migrate (Alembic) to keep track of schema changes:

```bash
# After updating models...
flask db migrate -m "Describe your change"
flask db upgrade
```

Generated migration scripts live in `migrations/versions/`.

---

## ☁️ Deployment

### Gunicorn (e.g., on Railway, Heroku, Render)

1. **Procfile** (or `railway.json` / Render `start` command):

   ```
   web: gunicorn run:app --workers 2 --bind 0.0.0.0:$PORT --timeout 90
   ```

2. **Ensure** you have the proper database driver in `requirements.txt`:

   ```
   pymysql
   ...
   ```

3. **Deploy** via your chosen platform’s CLI or UI, set environment variables in the dashboard, and push your code.

### Docker

1. **Dockerfile** example:

   ```dockerfile
   FROM python:3.11-slim
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt
   COPY . .
   ENV FLASK_ENV=production
   CMD ["gunicorn", "run:app", "--bind", "0.0.0.0:5000", "--workers", "2"]
   ```
2. Build & run:

   ```bash
   docker build -t calmora .
   docker run -e SQLALCHEMY_DATABASE_URI=... -e SECRET_KEY=... -p 5000:5000 calmora
   ```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m "Add awesome feature"`)
4. Push (`git push origin feature/YourFeature`)
5. Open a Pull Request and describe your work

Please adhere to PEP8, include unit tests for new functionality, and update documentation as needed.

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).

---

Thank you for checking out Calmora! Your feedback and contributions are very welcome. Stay calm and code on! 🚀✨
