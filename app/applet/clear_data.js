import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; 

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearData() {
  console.log("Clearing data...");
  const fakeUuid = '00000000-0000-0000-0000-000000000000';
  await supabase.from('applications').delete().neq('id', fakeUuid);
  await supabase.from('job_applications').delete().neq('id', fakeUuid);
  await supabase.from('registered_students').delete().neq('id', fakeUuid);
  await supabase.from('posts').delete().neq('id', fakeUuid);
  await supabase.from('contacts').delete().neq('id', fakeUuid);
  await supabase.from('staff_documentation').delete().neq('id', fakeUuid);
  console.log("Data cleared.");
}

clearData();
