-- SQL setup script for Supabase
-- You can copy and paste this into the Supabase SQL Editor to run it.

-- 1. Create the 'registered_students' table
CREATE TABLE IF NOT EXISTS public.registered_students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    surname TEXT NOT NULL,
    other_names TEXT NOT NULL,
    date_of_birth TEXT,
    gender TEXT,
    house_address TEXT,
    parents_name TEXT,
    parents_phone TEXT,
    email_address TEXT,
    class_applied TEXT,
    registration_number TEXT UNIQUE,
    passport_photo_url TEXT,
    status TEXT DEFAULT 'active'
);

-- Safely add columns if the table already existed but was missing fields
DO $$ 
BEGIN
    BEGIN ALTER TABLE public.registered_students ADD COLUMN surname TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.registered_students ADD COLUMN other_names TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.registered_students ADD COLUMN date_of_birth TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.registered_students ADD COLUMN gender TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.registered_students ADD COLUMN house_address TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.registered_students ADD COLUMN parents_name TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.registered_students ADD COLUMN parents_phone TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.registered_students ADD COLUMN email_address TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.registered_students ADD COLUMN class_applied TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.registered_students ADD COLUMN registration_number TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.registered_students ADD CONSTRAINT registered_students_registration_number_key UNIQUE (registration_number); EXCEPTION WHEN duplicate_column THEN NULL; WHEN duplicate_object THEN NULL; WHEN others THEN NULL; END;
    BEGIN ALTER TABLE public.registered_students ADD COLUMN status TEXT DEFAULT 'active'; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.registered_students ADD COLUMN passport_photo_url TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
END $$;

ALTER TABLE public.registered_students ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow public read access on registered_students" ON public.registered_students;
    CREATE POLICY "Allow public read access on registered_students" ON public.registered_students FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Allow authenticated insert access on registered_students" ON public.registered_students;
    CREATE POLICY "Allow authenticated insert access on registered_students" ON public.registered_students FOR INSERT TO authenticated WITH CHECK (true);
    
    DROP POLICY IF EXISTS "Allow authenticated update access on registered_students" ON public.registered_students;
    CREATE POLICY "Allow authenticated update access on registered_students" ON public.registered_students FOR UPDATE TO authenticated USING (true);
    
    DROP POLICY IF EXISTS "Allow authenticated delete access on registered_students" ON public.registered_students;
    CREATE POLICY "Allow authenticated delete access on registered_students" ON public.registered_students FOR DELETE TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- 2. Create the 'posts' table
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT,
    author TEXT,
    image_url TEXT,
    published BOOLEAN DEFAULT true
);

-- Safely add columns if 'posts' existed but missing recent fields
DO $$ 
BEGIN
    BEGIN ALTER TABLE public.posts ADD COLUMN image_url TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.posts ADD COLUMN author TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.posts ADD COLUMN excerpt TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.posts ADD COLUMN published BOOLEAN DEFAULT true; EXCEPTION WHEN duplicate_column THEN NULL; END;
END $$;

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Public can view published posts" ON public.posts;
    CREATE POLICY "Public can view published posts" ON public.posts FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Admins can manage posts" ON public.posts;
    CREATE POLICY "Admins can manage posts" ON public.posts FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- 3. Set up Storage Buckets (blog-images and student-passports)
INSERT INTO storage.buckets (id, name, public)
SELECT 'blog-images', 'blog-images', true
WHERE NOT EXISTS ( SELECT 1 FROM storage.buckets WHERE id = 'blog-images' );

INSERT INTO storage.buckets (id, name, public)
SELECT 'student-passports', 'student-passports', true
WHERE NOT EXISTS ( SELECT 1 FROM storage.buckets WHERE id = 'student-passports' );

DO $$
BEGIN
    DROP POLICY IF EXISTS "Public Access" ON storage.objects;
    CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'blog-images');
    
    DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
    CREATE POLICY "Allow public uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'blog-images');
    
    DROP POLICY IF EXISTS "Public Access Passports" ON storage.objects;
    CREATE POLICY "Public Access Passports" ON storage.objects FOR SELECT USING (bucket_id = 'student-passports');
    
    DROP POLICY IF EXISTS "Allow public uploads Passports" ON storage.objects;
    CREATE POLICY "Allow public uploads Passports" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'student-passports');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- 4. Create the 'applications' table
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    student_fname TEXT NOT NULL,
    student_surname TEXT NOT NULL,
    dob TEXT,
    gender TEXT,
    class_applied TEXT,
    parent_name TEXT,
    parent_phone TEXT,
    parent_email TEXT,
    address TEXT,
    prev_school TEXT,
    student_full_name TEXT,
    parent_full_name TEXT,
    student_type TEXT,
    phone TEXT,
    email TEXT,
    status TEXT DEFAULT 'pending'
);

DO $$
BEGIN
    BEGIN ALTER TABLE public.applications ADD COLUMN student_fname TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.applications ADD COLUMN student_surname TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.applications ADD COLUMN dob TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.applications ADD COLUMN gender TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.applications ADD COLUMN class_applied TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.applications ADD COLUMN address TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.applications ADD COLUMN prev_school TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.applications ADD COLUMN parent_name TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.applications ADD COLUMN parent_phone TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.applications ADD COLUMN parent_email TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.applications ADD COLUMN student_full_name TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.applications ADD COLUMN parent_full_name TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.applications ADD COLUMN student_type TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.applications ADD COLUMN phone TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.applications ADD COLUMN email TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.applications ADD COLUMN status TEXT DEFAULT 'pending'; EXCEPTION WHEN duplicate_column THEN NULL; END;
END $$;

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow public insert access on applications" ON public.applications;
    CREATE POLICY "Allow public insert access on applications" ON public.applications FOR INSERT TO authenticated WITH CHECK (true);
    
    DROP POLICY IF EXISTS "Allow public read access on applications" ON public.applications;
    CREATE POLICY "Allow public read access on applications" ON public.applications FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Allow authenticated update access on applications" ON public.applications;
    CREATE POLICY "Allow authenticated update access on applications" ON public.applications FOR UPDATE TO authenticated USING (true);
    
    DROP POLICY IF EXISTS "Allow authenticated delete access on applications" ON public.applications;
    CREATE POLICY "Allow authenticated delete access on applications" ON public.applications FOR DELETE TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- 5. Create the 'contacts' table
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    message TEXT NOT NULL
);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow public insert access on contacts" ON public.contacts;
    CREATE POLICY "Allow public insert access on contacts" ON public.contacts FOR INSERT TO authenticated WITH CHECK (true);
    
    DROP POLICY IF EXISTS "Allow public read access on contacts" ON public.contacts;
    CREATE POLICY "Allow public read access on contacts" ON public.contacts FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Allow authenticated update access on contacts" ON public.contacts;
    CREATE POLICY "Allow authenticated update access on contacts" ON public.contacts FOR UPDATE TO authenticated USING (true);
    
    DROP POLICY IF EXISTS "Allow authenticated delete access on contacts" ON public.contacts;
    CREATE POLICY "Allow authenticated delete access on contacts" ON public.contacts FOR DELETE TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- 6. Site Settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow public read access on site_settings" ON public.site_settings;
    CREATE POLICY "Allow public read access on site_settings" ON public.site_settings FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Allow authenticated all access on site_settings" ON public.site_settings;
    -- Changed to public so the mock login system can still update settings centrally without real Supabase session
    CREATE POLICY "Allow authenticated all access on site_settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- 7. Create the 'job_applications' table
CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    surname TEXT NOT NULL,
    other_names TEXT,
    educational_qualifications TEXT,
    phone_number TEXT NOT NULL,
    email_address TEXT NOT NULL UNIQUE,
    gender TEXT,
    job_category TEXT,
    selected_qualifications JSONB,
    application_status TEXT DEFAULT 'Pending',
    documentation_status TEXT DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow public insert access on job_applications" ON public.job_applications;
    CREATE POLICY "Allow public insert access on job_applications" ON public.job_applications FOR INSERT TO authenticated WITH CHECK (true);
    
    DROP POLICY IF EXISTS "Allow public read access on job_applications" ON public.job_applications;
    CREATE POLICY "Allow public read access on job_applications" ON public.job_applications FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Allow authenticated read and manage access on job_applications" ON public.job_applications;
    CREATE POLICY "Allow authenticated read and manage access on job_applications" ON public.job_applications FOR ALL USING (true) WITH CHECK(true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- 8. Create the 'staff_documentation' table
CREATE TABLE IF NOT EXISTS public.staff_documentation (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_number TEXT NOT NULL UNIQUE,
    surname TEXT NOT NULL,
    first_name TEXT NOT NULL,
    other_names TEXT,
    date_of_birth DATE,
    gender TEXT,
    phone_number TEXT NOT NULL,
    email_address TEXT NOT NULL UNIQUE,
    residential_address TEXT,
    educational_records TEXT,
    passport_photo_url TEXT,
    job_category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.staff_documentation ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow public insert access on staff_documentation" ON public.staff_documentation;
    CREATE POLICY "Allow public insert access on staff_documentation" ON public.staff_documentation FOR INSERT TO authenticated WITH CHECK (true);
    
    DROP POLICY IF EXISTS "Allow public read access on staff_documentation" ON public.staff_documentation;
    CREATE POLICY "Allow public read access on staff_documentation" ON public.staff_documentation FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Allow authenticated read and manage access on staff_documentation" ON public.staff_documentation;
    CREATE POLICY "Allow authenticated read and manage access on staff_documentation" ON public.staff_documentation FOR ALL USING (true) WITH CHECK(true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- 9. Create WhatsApp Integration Tables
CREATE TABLE IF NOT EXISTS public.whatsapp_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.whatsapp_contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone_number TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    last_message_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contact_id UUID REFERENCES public.whatsapp_contacts(id) ON DELETE CASCADE,
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    message_type TEXT DEFAULT 'text',
    content TEXT,
    status TEXT DEFAULT 'sent',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    read_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.chatbot_replies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    keyword TEXT UNIQUE NOT NULL,
    reply_text TEXT NOT NULL,
    is_exact_match BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.broadcasts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'failed')),
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Basic Policies for WhatsApp Tables
ALTER TABLE public.whatsapp_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Admin full access on whatsapp_settings" ON public.whatsapp_settings;
    CREATE POLICY "Admin full access on whatsapp_settings" ON public.whatsapp_settings FOR ALL USING (true) WITH CHECK(true);

    DROP POLICY IF EXISTS "Admin full access on whatsapp_contacts" ON public.whatsapp_contacts;
    CREATE POLICY "Admin full access on whatsapp_contacts" ON public.whatsapp_contacts FOR ALL USING (true) WITH CHECK(true);

    DROP POLICY IF EXISTS "Admin full access on whatsapp_messages" ON public.whatsapp_messages;
    CREATE POLICY "Admin full access on whatsapp_messages" ON public.whatsapp_messages FOR ALL USING (true) WITH CHECK(true);

    DROP POLICY IF EXISTS "Admin full access on chatbot_replies" ON public.chatbot_replies;
    CREATE POLICY "Admin full access on chatbot_replies" ON public.chatbot_replies FOR ALL USING (true) WITH CHECK(true);

    DROP POLICY IF EXISTS "Admin full access on broadcasts" ON public.broadcasts;
    CREATE POLICY "Admin full access on broadcasts" ON public.broadcasts FOR ALL USING (true) WITH CHECK(true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 10. Enable realtime on all relevant tables
DO $$
BEGIN
    -- This handles the supabase_realtime publication
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_publication 
        WHERE pubname = 'supabase_realtime'
    ) THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
END $$;

DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT unnest(ARRAY['applications', 'job_applications', 'registered_students', 'posts', 'contacts', 'staff_documentation', 'site_settings'])
    LOOP
        BEGIN
            EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
        EXCEPTION
            WHEN duplicate_object THEN
                -- Ignore if it is already added
                NULL;
        END;
    END LOOP;
END $$;

-- 11. Optional: Auto-confirm users (useful for development)
-- Run this if you are getting "Email not confirmed" errors and don't have SMTP setup
CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS trigger AS $$
BEGIN
  NEW.email_confirmed_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.auto_confirm_user();
