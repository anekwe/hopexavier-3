import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL.replace('/rest/v1/', '').replace('/rest/v1', '').replace(/\/$/, '');
const supabase = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const payload = {
      student_fname: 'Test',
      student_surname: 'User',
      dob: '2010-01-01',
      gender: 'male',
      class_applied: 'JS1',
      parent_name: 'Parent',
      parent_phone: '1234567890',
      parent_email: 'test@example.com',
      address: 'Test Address',
      prev_school: 'Test School',
      status: 'Pending'
  };
  const { data, error } = await supabase.from('applications').insert([payload]);
  console.log("Insert result:", { data, error });
}
run();
