import fs from 'fs';

let content = fs.readFileSync('supabase_setup.sql', 'utf8');

const alterContactsLines = `
-- Fix: Add status column to contacts table for Archive/Read features
DO $$ 
BEGIN
    ALTER TABLE public.contacts ADD COLUMN status TEXT DEFAULT 'Unread';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
`;

if (!content.includes('status TEXT DEFAULT \'Unread\'')) {
  content += alterContactsLines;
}

fs.writeFileSync('supabase_setup.sql', content);
console.log("Updated supabase_setup.sql with extra migrations");

