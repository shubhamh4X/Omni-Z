# OmniGemini — Real-Time Dynamic AI Agent

<div align="center">

![OmniGemini Banner](https://img.shields.io/badge/OmniGemini-Real--Time%20AI%20Agent-38bdf8?style=for-the-badge&logo=google&logoColor=white)
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

**OmniGemini** is a full-stack, next-generation AI assistant built on the Google Gemini ecosystem. Designed with a clean, high-performance interface inspired by Google Gemini, OmniGemini gives users an expansive canvas for conversing, coding, researching, and creating.

The agent features real-time search grounding, interactive sandbox code execution, multi-turn conversational history saved to Firebase Cloud Firestore, KaTeX mathematical typesetting, audio input transcription, and rich media processing.

---

## ✨ Key Features

- **🌀 Galaxy Orbital Omni Logo**: Custom SVG toroidal double-helix logo featuring cosmic galaxy-style circular rotation and entrance swirl animations.
- **⚡ Multimodal Intelligence**: Powered by Google's Gemini models via `@google/genai` SDK for high-speed streaming, natural dialogue, and complex reasoning.
- **🔍 Real-Time Google Search Grounding**: Up-to-the-minute web information with interactive search queries and authoritative citation links.
- **🐍 Python Code Sandbox**: Live in-chat execution of Python code snippets with formatted stdout/stderr terminal output.
- **☁️ Persistent Cloud Firestore Storage**: Real-time sync of conversations, message histories, and user sessions across devices.
- **📐 Mathematical & Code Rendering**: Full support for KaTeX LaTeX equations, fenced syntax-highlighted code blocks, and markdown formatting.
- **🎙️ Voice & Multimodal Inputs**: Audio input support, drag-and-drop file attachments, image analysis, and PDF comprehension.
- **🎨 Modern Dark Mode UI**: Clean, distraction-free aesthetic with collapsible sidebar, pin/rename/delete chat controls, and responsive layouts for mobile and desktop.

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
   git clone https://github.com/your-username/omnigemini.git
   cd omnigemini
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

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/your-username/omnigemini/issues).

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
