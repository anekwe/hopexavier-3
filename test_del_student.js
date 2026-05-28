import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

let supabaseUrl = (process.env.VITE_SUPABASE_URL || '').trim();
const supabaseKey = (process.env.VITE_SUPABASE_ANON_KEY || '').trim();

if (supabaseUrl.endsWith('/rest/v1/')) supabaseUrl = supabaseUrl.replace('/rest/v1/', '');
else if (supabaseUrl.endsWith('/rest/v1')) supabaseUrl = supabaseUrl.replace('/rest/v1', '');
if (supabaseUrl.endsWith('/')) supabaseUrl = supabaseUrl.slice(0, -1);

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const payload = {
    surname: 'DeleteMe',
    other_names: 'DeleteMe',
    date_of_birth: '2010-01-01',
    gender: 'Male',
    house_address: '123',
    parents_name: 'Parent',
    parents_phone: '1234567890',
    email_address: 'x@x.com',
    class_applied: 'JS1',
    registration_number: 'DEL_001',
    status: 'active'
  };

  const { data, error } = await supabase.from('registered_students').insert([payload]).select();
  console.log("Insert result:", data, error);
  if (data && data.length) {
     const id = data[0].id;
     console.log("Deleting id:", id);
     const { data: d2, error: e2 } = await supabase.from('registered_students').delete().eq('id', id).select();
     console.log("Deleted result:", d2, e2);
  }
}

check();
