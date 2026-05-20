import fs from 'fs';

let content = fs.readFileSync('supabase_setup.sql', 'utf8');

content = content.replace(/FOR INSERT WITH CHECK \(true\);/g, "FOR INSERT TO authenticated WITH CHECK (true);");
content = content.replace(/FOR UPDATE USING \(true\);/g, "FOR UPDATE TO authenticated USING (true);");
content = content.replace(/FOR DELETE USING \(true\);/g, "FOR DELETE TO authenticated USING (true);");

fs.writeFileSync('supabase_setup.sql', content);
console.log("Updated supabase_setup.sql");
