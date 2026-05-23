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
    registration_number: 'HXFA/2026/00000_999',
    status: 'active'
  };

  const { data: insData, error: insErr } = await supabase.from('registered_students').insert([payload]).select();
  console.log("Insert mock student:", insData, "Error:", insErr);
  if (insData) {
     const delId = insData[0].id;
     const { data: delData, error: delErr } = await supabase.from('registered_students').delete().eq('id', delId).select();
     console.log("Deleted mock student:", delData, "Error:", delErr);
     if (delData && delData.length === 0) {
        console.log("Wait, we didn't receive deleted row? Oh, policies might not allow select or maybe it worked.");
     }
  }
}

run();
