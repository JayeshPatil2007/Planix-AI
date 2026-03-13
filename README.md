<div align="center">

# 🚀 Planix AI  
### The AI Learning Operating System

Turn learning goals into structured execution systems.

AI generates personalized learning roadmaps, teaches concepts, and tracks progress — all inside one intelligent platform.

</div>

---

# 🌍 Overview

**Planix AI** is an AI-powered learning operating system designed to help people learn complex skills with structured guidance.

Modern learners face a common problem:

- Too many tutorials
- No clear starting point
- No structured roadmap
- No progress system

Planix AI solves this by transforming a simple goal into a **structured learning architecture**.

Users simply provide:

- A learning goal  
- Available days  
- Daily learning time  

The system then generates a **phase-based learning roadmap** with clear milestones.

---

# 🎯 Problem

Self-directed learning on the internet is chaotic.

Learners often experience:

- Information overload
- Unstructured tutorials
- Lack of direction
- No accountability
- No progress tracking

This leads to **abandoned learning journeys**.

---

# 💡 Solution

Planix AI acts as a **Learning Architect**.

Instead of recommending random content, it **designs a structured progression system**.

The platform:

1️⃣ Converts goals into learning architecture  
2️⃣ Breaks knowledge into phases  
3️⃣ Generates milestones with estimated effort  
4️⃣ Provides AI explanations  
5️⃣ Tracks progress through a dashboard

The result is a **clear path from beginner to mastery**.

---

# ⚙️ Key Features

### 🧠 AI Roadmap Generator
Generate structured learning roadmaps based on:
- skill goal
- time availability
- learning duration

Each roadmap includes phases and milestones.

---

### 📚 Teaching Mode
Explains complex topics with clean structured outputs designed for beginners.

---

### 📝 Smart Notes Mode
Automatically generates well-structured learning notes for revision and clarity.

---

### 📊 Progress Tracking
Track completed milestones and visualize progress through the dashboard.

---

### 🗂 Roadmap History
Users can access previously generated learning paths and continue progress.

---

### 🔐 Authentication
Secure login system supporting:
- Google authentication
- Email authentication

---

# 🏗 Architecture

The system follows a simple full-stack architecture.

```
Frontend (Next.js + React)
        │
        ▼
API Layer (Next.js API Routes)
        │
        ▼
AI Engine (Google Gemini API/ASI-1 API/Nova API)
        │
        ▼
Database (PostgreSQL via Prisma ORM)
```

---

# 🛠 Tech Stack

| Layer | Technology |
|------|-------------|
| Frontend | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| AI Engine | ASI-1 API/Google Gemini API |
| Database | PostgreSQL |
| ORM | Prisma |
| UI Components | Shadcn UI / Radix |
| Deployment | Vercel |

---

# 📂 Project Structure

```
Planix-AI/
│
├── app/
│   ├── api/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   └── Input.tsx
│   │
│   ├── views/
│   │   ├── Onboarding.tsx
│   │   ├── SplashIntro.tsx
│   │   └── Workspace.tsx
│   │
│   └── workspace/
│       ├── HistoryDrawer.tsx
│       ├── Navbar.tsx
│       └── Roadmap.tsx
│
├── hooks/
│   └── use-mobile.ts
│
├── lib/
│   ├── gemini.ts
│   ├── prisma.ts
│   └── utils.ts
│
├── prisma/
│   └── schema.prisma
│
├── README.md
└── package.json
```

---

# ⚙️ Local Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/Planix-AI.git
cd Planix-AI
```

---

### 2️⃣ Install Dependencies

```bash
npm install
```

---

### 3️⃣ Configure Environment Variables

Create `.env.local`:

```
API_KEY=your_api_key
DATABASE_URL=your_database_url
```

---

### 4️⃣ Run Development Server

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

# 🔄 How It Works

1️⃣ User enters learning goal  
2️⃣ User sets timeline and daily hours  
3️⃣ AI generates a structured roadmap  
4️⃣ Roadmap is divided into phases  
5️⃣ Milestones guide the learning journey  
6️⃣ Progress is tracked inside the dashboard

---

# 🚀 Hackathon Submission Highlights

This project demonstrates:

- AI-powered planning systems
- structured output generation
- full-stack architecture
- interactive learning workflow
- real-world AI application

Planix AI explores a future where AI acts not just as a chatbot, but as a **structured learning architect**.

---

# 🔮 Future Improvements

Potential future features include:

- collaborative learning spaces
- AI-powered progress analytics
- community roadmap sharing
- multi-model AI integration
- mobile app version

---

# 📜 License

MIT License

---

<div align="center">

Built by **Jayesh Patil**

AI Builder • Hackathon Developer

</div>
