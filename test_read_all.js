import { createClient } from '@supabase/supabase-js';

let supabaseUrl = (process.env.VITE_SUPABASE_URL || '').trim();
const supabaseKey = (process.env.VITE_SUPABASE_ANON_KEY || '').trim();
if (supabaseUrl.endsWith('/rest/v1/')) supabaseUrl = supabaseUrl.replace('/rest/v1/', '');
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: contacts, error: e1 } = await supabase.from('contacts').select('*');
  console.log("Contacts:", contacts?.length, "Err:", e1);
  
  const { data: posts, error: e2 } = await supabase.from('posts').select('*');
  console.log("Posts:", posts?.length, "Err:", e2);

  const { data: students, error: e3 } = await supabase.from('registered_students').select('*');
  console.log("Students:", students?.length, "Err:", e3);
}

run();
