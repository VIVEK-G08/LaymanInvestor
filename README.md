# 💬🧠 LaymanInvestor

An AI-powered emotional-aware stock coach that explains market concepts using empathy, relatable examples, and zero jargon — built for people who've never invested before.

## 🚀 Features

- 🤖 AI-powered chat with emotion detection
- 📊 Real-time stock data (US & Indian markets)
- 🔍 Market depth search with comprehensive analysis
- ⭐ Personal watchlist
- 🔐 Secure authentication with Supabase
- 💬 Persistent chat history

## 🛠️ Tech Stack

**Frontend:**
- React 18
- Tailwind CSS
- Supabase (Auth & Database)
- Lucide Icons

**Backend:**
- Node.js + Express
- Groq API (LLM)
- Yahoo Finance API
- Finnhub API
- Supabase

## 🏃 Quick Start

### Prerequisites
- Node.js 14+
- Supabase account
- API keys (Groq, Finnhub, Alpha Vantage)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/LaymanInvestor.git
cd LaymanInvestor
```

2. Setup Backend
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your API keys
npm start
```

2. Setup Frontend
```bash
cd client
npm install
cp .env.example .env
# Edit .env with your configuration
npm start
```

📄 License
MIT


👨‍💻 Author
Vivek