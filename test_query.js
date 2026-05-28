import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testAll() {
  const tables = [
    'applications',
    'job_applications',
    'registered_students',
    'staff_documentation',
    'posts',
    'contacts',
    'site_settings'
  ];

  for (const table of tables) {
    try {
      console.log(`\nTesting table: ${table}...`);
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
        
      if (error) {
        console.error(`❌ Error on ${table}:`, error);
      } else {
        console.log(`✅ Success on ${table}! Total rows: ${count}`);
      }
    } catch (e) {
      console.error(`❌ Exception on ${table}:`, e);
    }
  }
}

testAll();
