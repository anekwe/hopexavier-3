import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const tryInsert = async (val) => {
    console.log(`Trying: ${val}`);
    const { data, error } = await supabase.from('applications').insert([{
      student_fname: 'Jane',
      student_surname: 'Doe',
      dob: '2010-01-01',
      gender: 'female',
      class_applied: 'JS1',
      parent_name: 'John Doe',
      parent_phone: '1234567890',
      parent_email: 'test@example.com',
      address: '123 Street',
      prev_school: 'None',
      student_full_name: 'Jane Doe',
      parent_full_name: 'John Doe',
      phone: '1234567890',
      email: 'test@example.com',
      status: 'Pending',
      student_type: val
    }]);
    if (error) {
      console.log(`  Failed: ${error.message}`);
    } else {
      console.log(`  Success!`);
    }
  };
  
  await tryInsert('New');
  await tryInsert('Returning');
  await tryInsert('Transfer');
  await tryInsert('Day');
  await tryInsert('Boarding');
  await tryInsert('Day Student');
  await tryInsert('Boarding Student');
}

check();
