console.log('=== ENVIRONMENT VARIABLES TEST ===');
console.log('API URL:', process.env.REACT_APP_API_URL);
console.log('Supabase URL:', process.env.REACT_APP_SUPABASE_URL);
console.log('Supabase Key exists:', !!process.env.REACT_APP_SUPABASE_ANON_KEY);
console.log('All env vars:', Object.keys(process.env).filter(key => key.startsWith('REACT_APP_')));