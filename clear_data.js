import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

let supabaseUrl = (process.env.VITE_SUPABASE_URL || '').trim();
const supabaseKey = (process.env.VITE_SUPABASE_ANON_KEY || '').trim();
if (supabaseUrl.endsWith('/rest/v1/')) supabaseUrl = supabaseUrl.replace('/rest/v1/', '');
else if (supabaseUrl.endsWith('/rest/v1')) supabaseUrl = supabaseUrl.replace('/rest/v1', '');
if (supabaseUrl.endsWith('/')) supabaseUrl = supabaseUrl.slice(0, -1);
const supabase = createClient(supabaseUrl, supabaseKey);

async function wipe() {
  const tables = ['applications', 'job_applications', 'registered_students', 'posts', 'contacts', 'staff_documentation'];
  for (const table of tables) {
     console.log(`Wiping ${table}...`);
     let hasMore = true;
     let loopCount = 0;
     while(hasMore && loopCount < 50) {
        loopCount++;
        const { data, error } = await supabase.from(table).select('id').limit(1000);
        if (error) { console.error(error); break; }
        if (!data || data.length === 0) { break; }
        const ids = data.map(r => r.id);
        const { error: delError } = await supabase.from(table).delete().in('id', ids);
        if (delError) {
          console.warn(`Fallback delete for ${table}`);
          await supabase.from(table).delete().not('created_at', 'is', null);
          break;
        } else {
          const { count } = await supabase.from(table).select('id', { count: 'exact', head: true }).in('id', ids);
          if (count && count > 0) {
              await supabase.from(table).delete().not('created_at', 'is', null);
              break;
          }
        }
     }
  }
  console.log("All testing data wiped from database.");
  
  // also delete test js files
  const files = fs.readdirSync('.');
  files.forEach(f => {
     if (f.startsWith('test_') && f.endsWith('.js')) {
        fs.unlinkSync(f);
     }
  });
  console.log("Test scripts cleaned up.");
}
wipe();
