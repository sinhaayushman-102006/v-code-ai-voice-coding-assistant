# V-Code

### An AI Voice-First Coding Assistant for Visually Impaired Learners

V-Code is an AI-powered, voice-first coding and learning platform designed to make programming more accessible to visually impaired learners.

It combines an accessible code editor, AI coding assistance, speech-to-text, text-to-speech, voice-controlled navigation, code execution, and an interactive programming tutor into a unified environment.

> **Speak. Code. Understand. Execute. Learn.**

---

## Why V-Code?

Traditional coding environments rely heavily on visual interfaces. V-Code reduces this dependency by enabling learners to interact with their coding environment through natural voice commands and audio feedback.

A learner can:

- Navigate code using voice
- Listen to source code and errors
- Ask AI to explain or generate code
- Debug programs with AI assistance
- Execute code safely
- Learn programming through interactive lessons

---

## Key Features

- **Voice-First Coding** — Control the coding environment using natural speech.
- **Speech-to-Text** — Convert spoken programming commands into text.
- **AI Voice Assistant** — Interact with the coding assistant through voice.
- **Text-to-Speech** — Read code, errors, AI responses, and lessons aloud.
- **AI Coding Assistant** — Code explanation, generation, debugging, and programming guidance.
- **Voice Code Navigation** — Navigate lines, functions, and files using voice commands.
- **Code Execution** — Run programs through a sandboxed execution environment.
- **AI Error Assistance** — Understand programming errors through simple explanations.
- **Interactive Programming Tutor** — Learn concepts through lessons, exercises, hints, and feedback.
- **Read Current Line / Entire File** — Listen to source code without relying entirely on visual reading.
- **Keyboard Accessibility** — Keyboard shortcuts for essential operations.
- **Accessible UI** — Designed around accessibility and reduced visual dependency.
- **Learning Progress** — Track lessons and coding exercises.

---

## Core Workflow

```text
             USER
               |
          Voice / Keyboard
               |
               v
        Speech-to-Text
               |
               v
       Command Processing
               |
       +-------+-------+
       |               |
       v               v
   Code Editor      AI Assistant
       |               |
       |          Explanation /
       |          Generation /
       |          Debugging
       |               |
       +-------+-------+
               |
               v
        Code Execution
               |
               v
        Output / Error
               |
               v
        Text-to-Speech
               |
               v
             USER
````

---

## Technology Stack

### Frontend

* React.js
* TypeScript
* Vite
* Tailwind CSS

### Backend

* Node.js
* Express.js
* TypeScript
* REST APIs
* dotenv

### AI

* Groq API / Compatible LLM Provider
* AI-powered code generation
* Code explanation
* Debugging assistance

### Voice

* Web Speech API
* Speech Recognition
* Speech Synthesis
* Speech-to-Text
* Text-to-Speech

### Code Execution

* Judge0
* Sandboxed program execution

### Development

* Git
* GitHub
* Vitest
* Visual Studio Code
* npm

---

## Project Structure

```text
V-Code/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── src/
│   ├── uploads/
│   ├── .env.example
│   ├── package.json
│   └── vitest.config.ts
│
└── README.md
```

---

## Getting Started

### Prerequisites

* Node.js 18+
* npm
* Git

### Clone

```bash
git clone <YOUR_REPOSITORY_URL>
cd V-Code
```

### Install Backend

```bash
cd backend
npm install
```

### Install Frontend

```bash
cd ../frontend
npm install
```

### Configure Environment

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

GROQ_API_KEY=your_api_key_here

JUDGE0_API_URL=https://ce.judge0.com
JUDGE0_API_KEY=
```

Never commit API keys or `.env` files to GitHub.

### Run Backend

```bash
cd backend
npm run dev
```

### Run Frontend

Open a second terminal:

```bash
cd frontend
npm run dev
```

Open:

```text
http://localhost:5173
```

---

## Example Voice Commands

```text
"Read the current line."

"Explain this code."

"Go to line 20."

"Find the error."

"Run my program."

"Read the entire file."

"Generate a Python program to calculate factorial."

"Give me a hint."

"Start the next lesson."
```

---

## Accessibility Focus

V-Code is designed to reduce the visual barriers associated with traditional programming environments.

The platform focuses on:

* Voice-first interaction
* Audio-based code reading
* Keyboard navigation
* Screen-reader-friendly design
* Spoken error feedback
* AI-assisted learning
* Reduced dependence on mouse-based interaction

The accessibility approach is guided by **WCAG 2.2** principles.

---

## Impact

V-Code aims to enable visually impaired learners to independently:

**Navigate → Code → Understand → Debug → Execute → Learn**

By combining AI, voice technology, and programming education, V-Code transforms the traditional coding workflow into a more accessible and interactive learning experience.

---

## Future Scope

* Multilingual voice interaction
* Hindi and regional-language support
* Offline/local AI models
* Advanced screen-reader integration
* Personalized learning paths
* AI-powered code review
* Voice-based project management
* Learning analytics
* Collaborative coding

---

## References

1. W3C — Web Content Accessibility Guidelines (WCAG) 2.2
2. WHO — Assistive Technology
3. MDN Web Docs — Web Speech API
4. Judge0 — Online Code Execution System and API
5. Groq — API Documentation
