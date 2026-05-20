import dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL.replace(/\/$/, '') + '/rest/v1/?apikey=' + process.env.VITE_SUPABASE_ANON_KEY;
fetch(url)
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(console.error);
