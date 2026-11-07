# Virtual Contest Maker (VCM)

A full-stack web application built with **Django REST Framework** and **React** that lets competitive programmers combine problems from **Codeforces**, **CodeChef**, and **AtCoder** into unified virtual contests, tracking performance with live solve verification.

---

## 🌟 Key Features

1. **Multi-Platform Contest Generation**:
   - Seamlessly aggregates problems from **Codeforces**, **CodeChef**, and **AtCoder** into a single contest.
   - Eliminates platform hopping and provides an authentic, high-quality contest environment.

2. **Unified Rating Normalization**:
   - Converts native difficulty ratings from all platforms onto an equivalent **Codeforces rating scale**.
   - Problems within every virtual contest are strictly arranged in **increasing order of difficulty (A, B, C, D, E, F...)**.

3. **Preset Difficulty Divisions**:
   - **Easy Contest**: Equivalent to **Codeforces Div. 4** (~800 to 1350 rating). Focuses on fundamentals, basic math, greedy, and simulation.
   - **Medium Contest**: Equivalent to **Codeforces Div. 3** (~800 to 1800 rating). Standard balanced contest covering binary search, DP, two pointers, and data structures.
   - **Hard Contest**: Equivalent to **Codeforces Div. 2** (~1100 to 2200+ rating). High-intensity challenge covering advanced graphs, segment trees, and dynamic programming.

4. **Multi-Platform Handle Synchronization**:
   - Link your **Codeforces**, **CodeChef**, and **AtCoder** handles in your profile.
   - During the contest, click **"Sync Submissions"** (or let auto-sync run): VCM queries the respective platforms to verify if you have received an **Accepted (AC)** verdict on that problem and marks it solved in real time.
   - Includes manual verify override support for offline solving or when third-party APIs experience downtime.

5. **Contest Arena & Performance History**:
   - Live countdown timer, score calculation, problem points, and direct links to open & solve each problem.
   - Past contest history and performance analytics.

---

## 📐 Rating Normalization Formula

| Platform | Native Metric | Codeforces Equivalent Formula |
|---|---|---|
| **Codeforces** | Native problem rating (800 - 3500) | $\text{CF} = \text{Rating}$ (Baseline Standard) |
| **AtCoder** | Kenkoooo difficulty (0 - 2400) | $\le 400 \implies 800 + (\text{diff}/400) \times 150$<br>$400 - 1200 \implies 950 + ((\text{diff}-400)/800) \times 550$<br>$1200 - 2000 \implies 1500 + ((\text{diff}-1200)/800) \times 500$<br>$> 2000 \implies 2000 + (\text{diff}-2000) \times 1.05$ |
| **CodeChef** | Problem rating (500 - 2500) | $\le 1000 \implies 800 + (\text{diff}/1000) \times 200$<br>$1000 - 1600 \implies 1000 + ((\text{diff}-1000)/600) \times 450$<br>$1600 - 2200 \implies 1450 + ((\text{diff}-1600)/600) \times 500$<br>$> 2200 \implies 1950 + (\text{diff}-2200) \times 0.95$ |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+** & npm

---

### 2. Backend Setup (Django REST Framework)

```bash
# 1. Activate the Python virtual environment
.\venv\Scripts\activate   # Windows
# source venv/bin/activate # Linux / macOS

# 2. Navigate to backend
cd backend

# 3. Apply database migrations
python manage.py migrate

# 4. Seed initial curated problem bank from Codeforces, CodeChef & AtCoder
python manage.py seed_problems

# 5. Start the Django API server
python manage.py runserver 127.0.0.1:8000
```

> **Demo User Account**:
> - **Username**: `coder`
> - **Password**: `coder123`
> *(Or register a new account instantly through the UI!)*

---

### 3. Frontend Setup (React + Vite + Tailwind CSS)

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies (if not already installed)
npm install

# 3. Start development server
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 🛠 API Endpoints

### Authentication & Handles (`/api/auth/`)
- `POST /api/auth/register/` - Register user with optional CF, CC, AC handles.
- `POST /api/auth/login/` - Login & obtain authentication token.
- `GET /api/auth/me/` - Retrieve user profile and linked handles.
- `PATCH /api/auth/me/` - Update Codeforces, CodeChef, and AtCoder handles.
- `POST /api/auth/verify-handles/` - Test if handles exist on external platforms.

### Problems & Normalizer (`/api/problems/`)
- `GET /api/problems/` - List all problems sorted by `normalized_cf_rating`.
- `POST /api/problems/convert-rating/` - Interactive rating conversion tool.
- `POST /api/problems/fetch-external/` - Fetch fresh problems from Codeforces.

### Virtual Contests (`/api/contests/`)
- `POST /api/contests/create/` - Create a virtual contest (`EASY`, `MEDIUM`, or `HARD`).
- `GET /api/contests/participations/<id>/` - Get live contest participation status.
- `POST /api/contests/participations/<id>/sync/` - Query CF, CC, and AC APIs to verify AC submissions.
- `POST /api/contests/participations/<id>/finish/` - Complete contest.
- `POST /api/contests/participations/<id>/manual-mark/` - Manual solve verification toggle.
- `GET /api/contests/history/` - Past virtual contest history.
