import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

let supabaseUrl = (process.env.VITE_SUPABASE_URL || '').trim();
const supabaseKey = (process.env.VITE_SUPABASE_ANON_KEY || '').trim();

if (supabaseUrl.endsWith('/rest/v1/')) supabaseUrl = supabaseUrl.replace('/rest/v1/', '');
else if (supabaseUrl.endsWith('/rest/v1')) supabaseUrl = supabaseUrl.replace('/rest/v1', '');
if (supabaseUrl.endsWith('/')) supabaseUrl = supabaseUrl.slice(0, -1);

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkVals() {
  const payload = {
    student_fname: 'Jane', student_surname: 'Doe', dob: '2010-01-01', gender: 'female',
    class_applied: 'JS1', parent_name: 'John Doe', parent_phone: '1234567890', parent_email: 'x@x.com',
    address: '123', prev_school: '123', student_full_name: 'Jane Doe', parent_full_name: 'John Doe',
    phone: '1234567890', email: 'x@x.com', status: 'Pending'
  };

  const types = ["New", "Returning", "Transfer", "new", "day", "boarding", "Day", "Boarding", "returning"];
  
  for (const t of types) {
     payload.student_type = t;
     const { data, error } = await supabase.from('applications').insert([payload]);
     if (error) {
        console.log(`Failed for ${t}`);
     } else {
        console.log(`SUCCESS for ${t}`);
     }
  }
}

checkVals();
