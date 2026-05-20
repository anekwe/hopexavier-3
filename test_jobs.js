import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL.replace('/rest/v1/', '').replace('/rest/v1', '').replace(/\/$/, '');
const supabase = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase
    .from('job_applications')
    .select('*').limit(1);
  console.log("Job Applications result:", { data, error });
}
run();
