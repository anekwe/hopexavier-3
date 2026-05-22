import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

async function getOpenAPI() {
  let supabaseUrl = (process.env.VITE_SUPABASE_URL || '').trim();
  const supabaseKey = (process.env.VITE_SUPABASE_ANON_KEY || '').trim();

  if (supabaseUrl.endsWith('/rest/v1/')) supabaseUrl = supabaseUrl.replace('/rest/v1/', '');
  else if (supabaseUrl.endsWith('/rest/v1')) supabaseUrl = supabaseUrl.replace('/rest/v1', '');
  if (supabaseUrl.endsWith('/')) supabaseUrl = supabaseUrl.slice(0, -1);

  const url = `${supabaseUrl}/rest/v1/?apikey=${supabaseKey}`;
  const res = await fetch(url);
  const json = await res.json();
  
  fs.writeFileSync('openapi.json', JSON.stringify(json, null, 2));
}

getOpenAPI();
