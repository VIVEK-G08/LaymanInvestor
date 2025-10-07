import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

async function testGroqAPI() {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  console.log('Testing Groq API...');
  console.log('API Key:', GROQ_API_KEY ? `${GROQ_API_KEY.substring(0, 10)}...` : 'MISSING');

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile', // UPDATED MODEL
        messages: [
          { role: 'user', content: 'Say hello in 5 words' }
        ],
        temperature: 0.7,
        max_tokens: 100
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ SUCCESS! Groq API is working');
    console.log('Response:', response.data.choices[0].message.content);
  } catch (error) {
    console.error('❌ FAILED!');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data?.error || error.message);
  }
}

testGroqAPI();