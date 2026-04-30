# Critique AI

An AI-powered assignment analysis and critique platform built with Next.js, Firebase, and Gemini AI. 

Critique AI empowers users to submit drafts of their assignments, automates document text extraction, and uses AI to provide actionable feedback, helping students or writers iterate and improve their work over time.

## 🚀 Features

- **Authentication**: Secure login and signup powered by [Firebase Authentication](https://firebase.google.com/).
- **Assignment Management**: Create, and manage ongoing assignments from a dedicated dashboard.
- **Draft History & Tracking**: Iteratively upload new drafts and track progress visually over time using Recharts.
- **Document Processing**: Automatic text extraction from `.pdf` and `.docx` using `pdf-parse` and `mammoth`.
- **AI Analysis**: Intelligent, tailored critiques and actionable feedback provided using the Gemini API (`@google/generative-ai`).

## 🛠 Tech Stack

- **Framework**: [Next.js](https://nextjs.org) (App Router)
- **Library**: [React](https://react.dev)
- **Database & Auth**: [Firebase](https://firebase.google.com/)
- **AI Integration**: [Google Gemini API](https://ai.google.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Data Visualization**: [Recharts](https://recharts.org/)

## ⚙️ Getting Started

### Prerequisites
- Node.js
- Firebase project configuration details
- Google Gemini API key

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd critique-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory and add your Firebase and Gemini credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open the App:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.
