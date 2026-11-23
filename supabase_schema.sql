-- ============================================================================
-- 🇮🇳 BharatVani (भारतवाणी) — Supabase PostgreSQL Schema
-- Real-Time News Archive, AI Storyboard Cache, Fact Reports & User Profiles
-- Stores full-text releases for generating video, audio & facts for past news
-- ============================================================================

-- 1. Create Articles Table (Historical PIB News Archive with Full Text)
CREATE TABLE IF NOT EXISTS public.articles (
    id TEXT PRIMARY KEY,                       -- Unique release slug: `${prid}_${lang}` (e.g. '2301058_hi')
    prid TEXT NOT NULL,                        -- Official PIB Release ID (e.g. '2301058')
    title TEXT NOT NULL,                       -- Headline / Release Title
    description TEXT,                          -- Snippet / Lead summary
    full_text TEXT,                            -- Complete text body of the press release for AI generation
    category TEXT DEFAULT 'governance',        -- 'agriculture', 'technology', 'economy', 'health', 'environment', 'governance'
    ministry TEXT,                             -- Issuing Ministry / Department
    lang TEXT NOT NULL DEFAULT 'hi',           -- 'hi', 'en', 'ta', 'te', 'gu'
    link TEXT,                                 -- Official PIB URL
    iframe_link TEXT,                          -- Official PIB Iframe URL
    pub_date TIMESTAMPTZ DEFAULT now(),        -- Original publication timestamp
    paragraphs JSONB DEFAULT '[]'::jsonb,      -- Full press release paragraphs array
    key_takeaways JSONB DEFAULT '[]'::jsonb,   -- Kisan Mode simplified takeaway points
    images JSONB DEFAULT '[]'::jsonb,          -- Extracted images from PIB release
    source TEXT DEFAULT 'Press Information Bureau (PIB), GoI',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure full_text exists if migrating an existing database
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS full_text TEXT;

-- Indexes for lightning-fast queries across historical news
CREATE INDEX IF NOT EXISTS idx_articles_lang ON public.articles(lang);
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_pub_date ON public.articles(pub_date DESC);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON public.articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_prid ON public.articles(prid);
CREATE INDEX IF NOT EXISTS idx_articles_search ON public.articles USING gin(to_tsvector('simple', title || ' ' || coalesce(description, '') || ' ' || coalesce(full_text, '')));


-- 2. Create Fact Reports Table (Zero-Hallucination Verified Claims Cache)
CREATE TABLE IF NOT EXISTS public.fact_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id TEXT NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    lang TEXT NOT NULL DEFAULT 'hi',
    atomic_claims JSONB DEFAULT '[]'::jsonb,
    deterministic_figures JSONB DEFAULT '[]'::jsonb,
    canonical_entities JSONB DEFAULT '[]'::jsonb,
    grounding_score REAL DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(article_id, lang)
);

CREATE INDEX IF NOT EXISTS idx_fact_reports_article ON public.fact_reports(article_id, lang);


-- 3. Create Storyboards Table (Gemini 3-Scene AI Video Bulletins Cache)
CREATE TABLE IF NOT EXISTS public.storyboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id TEXT NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    lang TEXT NOT NULL DEFAULT 'hi',
    title TEXT,
    category TEXT,
    scenes JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(article_id, lang)
);

CREATE INDEX IF NOT EXISTS idx_storyboards_article ON public.storyboards(article_id, lang);


-- 4. Create User Profiles Table (Authentication, State, District, Role, Avatar)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    role TEXT DEFAULT 'citizen',
    state TEXT,
    district TEXT,
    preferred_lang TEXT DEFAULT 'hi',
    avatar_url TEXT,
    bookmarks JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_state ON public.profiles(state);


-- 5. Enable Row Level Security (RLS) with Permissive Policies
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fact_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storyboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    -- Articles policies: Public read + open upsert for sync scripts / service role
    DROP POLICY IF EXISTS "Public Read Articles" ON public.articles;
    CREATE POLICY "Public Read Articles" ON public.articles FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Service Insert/Update Articles" ON public.articles;
    CREATE POLICY "Service Insert/Update Articles" ON public.articles FOR ALL USING (true) WITH CHECK (true);

    -- Fact Reports policies: Public read + open cache
    DROP POLICY IF EXISTS "Public Read Fact Reports" ON public.fact_reports;
    CREATE POLICY "Public Read Fact Reports" ON public.fact_reports FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Service All Fact Reports" ON public.fact_reports;
    CREATE POLICY "Service All Fact Reports" ON public.fact_reports FOR ALL USING (true) WITH CHECK (true);

    -- Storyboards policies: Public read + open cache
    DROP POLICY IF EXISTS "Public Read Storyboards" ON public.storyboards;
    CREATE POLICY "Public Read Storyboards" ON public.storyboards FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Service All Storyboards" ON public.storyboards;
    CREATE POLICY "Service All Storyboards" ON public.storyboards FOR ALL USING (true) WITH CHECK (true);

    -- Profiles policies
    DROP POLICY IF EXISTS "Profiles viewable by owner or service" ON public.profiles;
    CREATE POLICY "Profiles viewable by owner or service" ON public.profiles FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
    CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (true);

    DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
    CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
END $$;


-- 6. Trigger to automatically create a Profile entry on new auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, preferred_lang)
    VALUES (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
        coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', ''),
        coalesce(new.raw_user_meta_data->>'preferred_lang', 'hi')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 7. Enable Supabase Realtime for Articles
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'articles'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.articles;
    END IF;
END $$;
