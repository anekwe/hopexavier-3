import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

let supabaseUrl = (process.env.VITE_SUPABASE_URL || '').trim();
const supabaseKey = (process.env.VITE_SUPABASE_ANON_KEY || '').trim();

if (supabaseUrl.endsWith('/rest/v1/')) supabaseUrl = supabaseUrl.replace('/rest/v1/', '');
else if (supabaseUrl.endsWith('/rest/v1')) supabaseUrl = supabaseUrl.replace('/rest/v1', '');
if (supabaseUrl.endsWith('/')) supabaseUrl = supabaseUrl.slice(0, -1);

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { count, error } = await supabase.from('applications').select('*', { count: 'exact', head: true });
  console.log("Count exact applications:", count, "Error:", error);
  const res = await supabase.from('job_applications').select('*', { count: 'exact', head: true });
  console.log("Count exact job apps:", res.count, "Error:", res.error);
  
  const dRes = await supabase.from('applications').select('id, created_at, student_fname, student_surname, class_applied').order('created_at', { ascending: false }).limit(3);
  console.log("Recent applications:", dRes.data, "Error:", dRes.error);
}

run();
