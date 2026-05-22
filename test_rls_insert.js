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
  const { data, error } = await supabase.from('applications').select('*');
  console.log("Returned sample length:", data?.length);
  
  // also try to get RLS info if we can, wait we can't via REST API.
  // Instead let's just insert a mock one to see if insertion is fine.
  const payload = {
    student_fname: 'Jane', student_surname: 'Doe', dob: '2010-01-01', gender: 'female',
    class_applied: 'JS1', parent_name: 'John Doe', parent_phone: '1234567890', parent_email: 'x@x.com',
    address: '123', prev_school: '123', student_full_name: 'Jane Doe', parent_full_name: 'John Doe',
    student_type: 'New', phone: '1234567890', email: 'x@x.com', status: 'Pending'
  };

  const res = await supabase.from('applications').insert([payload]).select();
  console.log("Insert result:", res.data, "Error:", res.error);
}

run();
