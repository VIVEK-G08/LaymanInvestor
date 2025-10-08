import React from 'react';
import { TrendingUp, Brain, Shield, Zap, BarChart3, Heart, Sparkles } from 'lucide-react';

const LandingPage = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl mb-6 shadow-lg">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            LaymanInvestor
            <Sparkles className="w-8 h-8 text-indigo-500" />
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your AI-powered investment coach that understands your emotions and explains the stock market in simple, jargon-free language.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center mb-16">
          <button
            onClick={onGetStarted}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
          >
            Start Learning For Free →
          </button>
          <p className="text-sm text-gray-500 mt-3">No credit card required • 100% Free Forever</p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Emotion-Aware AI</h3>
            <p className="text-gray-600">
              Detects if you're scared, confused, or excited and adjusts explanations accordingly. No judgment, just support.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Zero Jargon Promise</h3>
            <p className="text-gray-600">
              Every financial term explained using pizza shops, mango trees, and real-world examples you already understand.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Real-Time Data</h3>
            <p className="text-gray-600">
              Live stock prices for 1000+ stocks across Indian (NSE/BSE) and US markets (NASDAQ/NYSE).
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="bg-yellow-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Instant Answers</h3>
            <p className="text-gray-600">
              Get responses in under 2 seconds. No waiting, no complexity - just clear, friendly explanations.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Built for Beginners</h3>
            <p className="text-gray-600">
              Never invested before? Perfect! We start from absolute zero and build your confidence step by step.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Personal Watchlist</h3>
            <p className="text-gray-600">
              Track stocks you're learning about. Your watchlist and chat history are saved securely.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-indigo-600">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Ask Anything</h3>
              <p className="text-gray-600">Type your question in plain English. No need to know technical terms.</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-purple-600">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">AI Understands You</h3>
              <p className="text-gray-600">Our AI detects your emotion and adjusts the explanation to match your needs.</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-green-600">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Learn & Grow</h3>
              <p className="text-gray-600">Get clear answers with examples. Build confidence one question at a time.</p>
            </div>
          </div>
        </div>

        {/* Sample Questions */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Try Asking:</h2>
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              "What is a stock in simple words?"
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              "I'm scared to invest, where do I start?"
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              "How do I know if a stock is expensive?"
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              "Can I invest with just ₹500?"
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Start Your Investment Journey?</h2>
          <p className="text-gray-600 mb-8">Join thousands learning to invest confidently</p>
          <button
            onClick={onGetStarted}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-xl"
          >
            Get Started Free →
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-600">
          <p className="mb-2">Built with ❤️ for beginner investors</p>
          <p className="text-sm">Powered by Groq AI • Real-time data from Yahoo Finance & Finnhub</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;