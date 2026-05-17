import { createClient } from '@supabase/supabase-js';

let supabaseUrl = (process.env.VITE_SUPABASE_URL || '').trim();
const supabaseKey = (process.env.VITE_SUPABASE_ANON_KEY || '').trim();
if (supabaseUrl.endsWith('/rest/v1/')) supabaseUrl = supabaseUrl.replace('/rest/v1/', '');
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const payload = {
    student_fname: 'Jane',
    student_surname: 'Doe',
    dob: '2010-01-01',
    gender: 'female',
    class_applied: 'JS1',
    parent_name: 'John Doe',
    parent_phone: '1234567890',
    parent_email: 'test@test.com',
    address: '123 Street',
    prev_school: 'Old School',
    student_full_name: 'Jane Doe',
    parent_full_name: 'John Doe',
    student_type: 'New', 
    phone: '1234567890',
    email: 'test@test.com',
    status: 'Pending'
  };

  const { data, error } = await supabase.from('applications').insert([payload]);
  console.log("Insert Pending Error:", error);
}

run();
