# Omni Z — Real-Time Dynamic AI Agent

<div align="center">

![Omni Z Banner](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop)

<br/>

[![React](https://img.shields.io/badge/React-19.0-61dafb?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646cff?style=flat-square&logo=vite)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.0-06b6d4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-ffca28?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![Google GenAI](https://img.shields.io/badge/Google%20GenAI-SDK%20v2.4-4285f4?style=flat-square&logo=google)](https://ai.google.dev/)

**An all-in-one cloud-connected AI agent with real-time web browsing, Python backend execution, persistent Firestore memory, code intelligence, and multimodal reasoning.**

</div>

---

## 🌟 Overview

**Omni Z** is a full-stack, next-generation AI assistant powered by Google's Gemini models. Featuring a clean, ultra-responsive dark interface, Omni Z provides a unified environment for multi-turn dialogue, real-time live search grounding, sandboxed Python code execution, mathematical LaTeX rendering, and multimodal analysis.

---

## ✨ Key Features

- **🌀 Galaxy Orbital Omni Z Logo**: Toroidal double-helix logo with smooth circular galaxy rotation and dynamic opening swirl animations.
- **⚡ Multimodal Intelligence**: Powered by Google Gemini models via `@google/genai` TypeScript SDK for fast streaming and complex problem-solving.
- **🔍 Real-Time Google Search Grounding**: Live web information with interactive search queries and inline source citations.
- **🐍 Python Code Execution**: In-chat sandboxed Python execution displaying stdout, stderr, and return evaluations.
- **☁️ Persistent Cloud Firestore Storage**: Real-time multi-session chat histories stored securely in Firebase Firestore.
- **📐 Mathematical & Code Rendering**: KaTeX LaTeX equation rendering, fenced syntax highlighting, and rich Markdown.
- **🎙️ Voice & Multimodal File Inputs**: Audio speech input, document parsing (PDFs, text files), and image comprehension.
- **🎨 Minimalist Dark UI**: Distraction-free Gemini dark aesthetics, collapsible drawer sidebar, and smooth transitions.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, KaTeX, Marked |
| **Backend** | Node.js, Express, `tsx` TypeScript runtime |
| **AI Engine** | Google Gemini API (`@google/genai` TypeScript SDK) |
| **Database** | Firebase Cloud Firestore (real-time collections and security rules) |
| **Styling** | Tailwind CSS v4 with custom keyframes for galaxy celestial orbits |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 20 or higher recommended)
- A [Google Gemini API Key](https://aistudio.google.com/apikey)
- A [Firebase Project](https://console.firebase.google.com/) with Cloud Firestore enabled

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/omni-z.git
   cd omni-z
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   Add your credentials to `.env`:
   ```env
   # Gemini API Key (get one at https://aistudio.google.com/apikey)
   GEMINI_API_KEY=your_actual_gemini_api_key

   # Base URL for the application (default for local dev)
   APP_URL=http://localhost:3000
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
├── public/
│   └── omni-z-banner.svg        # Vector preview banner asset
├── server.ts                    # Full-stack Express server integrating Vite dev middleware
├── server/                      # Server-side controllers, API routes, and agent executors
│   └── routes/                  # Express API proxy endpoints
├── src/
│   ├── components/
│   │   ├── ChatView.tsx         # Main chat interface with streaming, input, & message feed
│   │   ├── DnaRingLogo.tsx      # Toroidal galaxy-spinning Omni Z logo
│   │   ├── Header.tsx           # Top navigation bar with model selector and actions
│   │   └── Sidebar.tsx          # Collapsible sidebar with chat history & session management
│   ├── lib/
│   │   ├── firebase.ts          # Firebase SDK client initialization
│   │   └── gemini.ts            # Google GenAI SDK client configurations
│   ├── types/                   # TypeScript interfaces and data models
│   ├── App.tsx                  # Root application component
│   ├── index.css                # Tailwind CSS v4 & custom galaxy animations
│   └── main.tsx                 # React DOM client entry point
├── firestore.rules              # Firebase Firestore security rules
├── firebase-blueprint.json      # Database schema blueprint definition
├── metadata.json                # Project capabilities and descriptors
└── package.json                 # Project dependencies and script definitions
```

---

## 📜 Available Scripts

- `npm run dev`: Starts the Node.js Express server with Vite middleware on port 3000.
- `npm run build`: Compiles the TypeScript codebase and builds the production bundle into `/dist`.
- `npm run start`: Runs the production full-stack server.
- `npm run lint`: Performs strict TypeScript type checks (`tsc --noEmit`).
- `npm run preview`: Previews the production Vite build locally.

---

## 🔒 Security & Rules

Database interactions with Cloud Firestore are protected using role-based and user-isolated security rules defined in `firestore.rules`. User sessions are authenticated and each user can only read and write their own conversation threads.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/your-username/omni-z/issues).

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
