import dotenv from 'dotenv';
dotenv.config();

const key = process.env.VITE_SUPABASE_ANON_KEY || '';
console.log("Key begins with:", key.substring(0, 20));
