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
  const { data, error } = await supabase.from('applications').insert([
    {
      student_fname: 'Delete',
      student_surname: 'Me',
    }
  ]).select();
  console.log("Inserted:", data, error);
  if (data && data.length > 0) {
     const id = data[0].id;
     console.log("Deleting id:", id);
     const { data: d2, error: e2 } = await supabase.from('applications').delete().eq('id', id).select();
     console.log("Deleted:", d2, e2);
  }
}
run();
