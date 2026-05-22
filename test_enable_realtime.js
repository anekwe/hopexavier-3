import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

let supabaseUrl = (process.env.VITE_SUPABASE_URL || '').trim();
// Use the service role or anon key. Wait, we don't have service_role here. We can't rpc like this usually unless we have a custom SQL function exposed. But wait.
// I will just add the SQL to supabase_setup.sql and we will check it.
