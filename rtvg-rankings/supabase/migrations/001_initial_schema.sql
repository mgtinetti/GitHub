-- ═══════════════════════════════════════════════════════════
-- RTVG Rankings - Initial Database Schema
-- ═══════════════════════════════════════════════════════════

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'contributor' CHECK (role IN ('admin', 'contributor')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Allowed emails whitelist
CREATE TABLE allowed_emails (
  email TEXT PRIMARY KEY,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shows (TMDB cache)
CREATE TABLE shows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tmdb_id INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  poster_url TEXT,
  genres TEXT[] NOT NULL DEFAULT '{}',
  network TEXT,
  status TEXT,
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seasons (TMDB cache)
CREATE TABLE seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  show_id UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
  tmdb_season_id INTEGER,
  season_number INTEGER NOT NULL,
  air_date_start DATE,
  air_date_end DATE,
  episode_count INTEGER DEFAULT 0,
  poster_url TEXT
);

CREATE INDEX idx_seasons_show_id ON seasons(show_id);

-- Ranking entries
CREATE TABLE ranking_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  rank_position INTEGER NOT NULL,
  rewatchability TEXT CHECK (rewatchability IN ('Low', 'Medium', 'High', 'Instant Classic')),
  score NUMERIC(3,1) CHECK (score >= 0 AND score <= 10),
  review TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, season_id, year)
);

CREATE INDEX idx_ranking_entries_user_year ON ranking_entries(user_id, year, rank_position);
CREATE INDEX idx_ranking_entries_season ON ranking_entries(season_id);

-- Episode ranking entries
CREATE TABLE episode_ranking_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  rank_position INTEGER NOT NULL,
  show_id UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
  season_number INTEGER NOT NULL,
  episode_number INTEGER NOT NULL,
  episode_title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_episode_rankings_user_year ON episode_ranking_entries(user_id, year, rank_position);

-- Performance ranking entries
CREATE TABLE performance_ranking_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  rank_position INTEGER NOT NULL,
  actor_name TEXT NOT NULL,
  character_name TEXT,
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_performance_rankings_user_year ON performance_ranking_entries(user_id, year, rank_position);

-- All-time entries
CREATE TABLE all_time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  rank_position INTEGER NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, season_id)
);

CREATE INDEX idx_all_time_user ON all_time_entries(user_id, rank_position);

-- Award categories
CREATE TABLE award_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  name TEXT NOT NULL,
  is_preset BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL REFERENCES users(id),
  approved BOOLEAN NOT NULL DEFAULT false
);

-- Award picks
CREATE TABLE award_picks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES award_categories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  season_id UUID REFERENCES seasons(id) ON DELETE SET NULL,
  blurb TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (category_id, user_id)
);

-- Blog posts
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  body TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);

-- Blog comments
CREATE TABLE blog_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Activity feed events
CREATE TABLE activity_feed_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('add', 'move', 'remove', 'finalize', 'award_pick', 'blog_post')),
  metadata JSONB NOT NULL DEFAULT '{}',
  year INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_feed_created ON activity_feed_events(created_at DESC);

-- ═══════════════════════════════════════════════════════════
-- Row Level Security Policies
-- ═══════════════════════════════════════════════════════════

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE ranking_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE episode_ranking_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_ranking_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE all_time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE award_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE award_picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed_events ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables
CREATE POLICY "Public read" ON users FOR SELECT USING (true);
CREATE POLICY "Public read" ON shows FOR SELECT USING (true);
CREATE POLICY "Public read" ON seasons FOR SELECT USING (true);
CREATE POLICY "Public read" ON ranking_entries FOR SELECT USING (true);
CREATE POLICY "Public read" ON episode_ranking_entries FOR SELECT USING (true);
CREATE POLICY "Public read" ON performance_ranking_entries FOR SELECT USING (true);
CREATE POLICY "Public read" ON all_time_entries FOR SELECT USING (true);
CREATE POLICY "Public read" ON award_categories FOR SELECT USING (true);
CREATE POLICY "Public read" ON award_picks FOR SELECT USING (true);
CREATE POLICY "Public read" ON blog_posts FOR SELECT USING (true);
CREATE POLICY "Public read" ON blog_comments FOR SELECT USING (true);
CREATE POLICY "Public read" ON activity_feed_events FOR SELECT USING (true);

-- Authenticated write access (users can only modify their own data)
CREATE POLICY "Own data write" ON ranking_entries FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "Own data write" ON episode_ranking_entries FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "Own data write" ON performance_ranking_entries FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "Own data write" ON all_time_entries FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "Own data write" ON award_picks FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "Own data write" ON blog_posts FOR ALL USING (auth.uid()::text = author_id::text);
CREATE POLICY "Own data write" ON blog_comments FOR ALL USING (auth.uid()::text = author_id::text);
