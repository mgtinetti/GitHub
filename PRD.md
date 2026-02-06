# Product Requirements Document: RTVGRankings.com

## TV Season Rankings Platform

**Version:** 1.0
**Last Updated:** February 6, 2026
**Status:** Draft

---

## Table of Contents

1. [Overview](#1-overview)
2. [Goals & Success Metrics](#2-goals--success-metrics)
3. [Users & Roles](#3-users--roles)
4. [Information Architecture](#4-information-architecture)
5. [Feature Requirements](#5-feature-requirements)
6. [Data Model](#6-data-model)
7. [Design & UX](#7-design--ux)
8. [Technical Architecture](#8-technical-architecture)
9. [API Integrations](#9-api-integrations)
10. [URL Structure & Routing](#10-url-structure--routing)
11. [SEO & Social Sharing](#11-seo--social-sharing)
12. [Phased Rollout](#12-phased-rollout)
13. [Future Considerations](#13-future-considerations)

---

## 1. Overview

### 1.1 Product Summary

RTVGRankings.com is a private TV season ranking platform for a group of 3 friends to create, manage, and share their yearly television rankings. The site is publicly viewable by anyone but editable only by the 3 authenticated contributors. Rankings are organized by calendar year and track individual TV seasons (not entire series), based on when the season aired.

### 1.2 Problem Statement

There is no clean, purpose-built platform for a small group of friends to collaboratively rank TV seasons by year, compare their lists side-by-side, and share the results publicly. Existing tools (spreadsheets, social media posts, tier list generators) are fragmented, lack persistence, and don't support comparison features.

### 1.3 Vision

A dark, cinematic, visually rich website that serves as the definitive record of the group's TV opinions — past, present, and ongoing. It should feel like a personal TV awards show that anyone can browse and enjoy.

---

## 2. Goals & Success Metrics

### 2.1 Primary Goals

- Provide an intuitive interface for 3 contributors to rank TV seasons each year
- Enable compelling side-by-side comparison of rankings across all contributors
- Create a publicly shareable, visually engaging experience for viewers
- Maintain historical ranking data from 2021 onward

### 2.2 Success Metrics

- All 3 contributors actively maintain their rankings throughout the year
- Site is regularly shared via text/social links
- Rankings are backfilled for 2021-2025
- Public visitors can easily browse and compare rankings without friction

---

## 3. Users & Roles

### 3.1 Contributor (3 users)

- Authenticated via Google OAuth
- Whitelisted by email address (admin-managed)
- Can create, edit, reorder, and delete their own rankings
- Can create and manage their own supplementary lists (all-time, episodes, performances)
- Can create awards/superlatives
- Can write blog posts/writeups

### 3.2 Admin (1 user — elevated contributor)

- All contributor permissions
- Manage whitelisted email addresses
- Manage site settings and configuration
- Moderate content if needed
- Manage the show database and TMDB overrides

### 3.3 Public Viewer (unauthenticated)

- Full read access to all rankings, comparisons, lists, awards, and blog posts
- No login required
- Can browse all years, all users, all views
- Cannot create or edit any content

---

## 4. Information Architecture

### 4.1 Site Map

```
RTVGRankings.com
├── Home (current year side-by-side top 10 + activity feed)
├── Rankings by Year
│   ├── /2025 (side-by-side default)
│   │   ├── /2025/consensus
│   │   ├── /2025/disagreements
│   │   ├── /2025/[username] (individual full list)
│   │   └── /2025/genre/[genre]
│   ├── /2024
│   ├── /2023
│   ├── /2022
│   └── /2021
├── Awards
│   ├── /awards/2025
│   ├── /awards/2024
│   └── ...
├── Supplementary Lists
│   ├── /all-time/[username]
│   ├── /episodes/[year]
│   └── /performances/[year]
├── Blog
│   ├── /blog
│   └── /blog/[slug]
└── Admin (authenticated only)
    └── /admin
```

### 4.2 Navigation Structure

- **Primary nav:** Year selector (dropdown or horizontal scroll), Awards, Lists, Blog
- **Secondary nav:** View toggles within a year (side-by-side, consensus, individual users, genre filter)
- **Mobile nav:** Bottom tab bar or hamburger menu with year as primary navigation

---

## 5. Feature Requirements

### 5.1 Core Ranking System

#### 5.1.1 Show Search & Selection

- Contributors search for TV shows via TMDB integration
- Search returns show results with poster thumbnails for easy identification
- Upon selecting a show, contributor selects the specific season to rank
- System auto-populates all metadata from TMDB:
  - Show title
  - Season number
  - Poster/artwork
  - Network/streaming platform
  - Genre tags
  - Air date range
  - Episode count
- System validates that the selected season aired during the target ranking year
- If a season spans two calendar years (e.g., airs Nov 2025 - Jan 2026), the contributor chooses which year to assign it to

#### 5.1.2 Ranking Management

- Each contributor maintains one ordered list per year (1 through N, no limit)
- **Add**: Insert a new season at a specific rank position, or append to end of list
- **Reorder**: Drag-and-drop interface for repositioning entries
- **Remove**: Delete an entry from the list (with confirmation)
- **Edit**: Update optional fields (rewatchability, score) on any entry
- Rankings are saved automatically on change (auto-save with optimistic UI)
- No "draft" vs "published" distinction during the active year — the list is always live
- At year-end, contributor can mark their list as "finalized"
- Finalized lists display a "Final" badge but remain editable
- Any edit to a finalized list updates a "Last revised" timestamp visible to viewers

#### 5.1.3 Ranking Entry Fields

For each ranked season entry:

| Field | Type | Required | Source |
|-------|------|----------|--------|
| Show title | Text | Yes | TMDB (auto) |
| Season number | Integer | Yes | TMDB (auto) |
| Poster/artwork | Image URL | Yes | TMDB (auto) |
| Network/platform | Text | Yes | TMDB (auto) |
| Genre tags | Array of strings | Yes | TMDB (auto) |
| Air date range | Date range | Yes | TMDB (auto) |
| Episode count | Integer | Yes | TMDB (auto) |
| Rank position | Integer | Yes | User (manual) |
| Rewatchability | Enum (Low / Medium / High / Instant Classic) | No | User (manual) |
| Score | Float (0-10, 0.5 increments) | No | User (manual) |

#### 5.1.4 Tier View Toggle

- Any ranked list can be toggled to display as a tier view (S/A/B/C/D/F)
- Tier boundaries are auto-assigned based on rank position and list length, or can be manually adjusted by the contributor
- Tier view is a display mode, not a separate data structure — the underlying ordered list remains the source of truth
- Tier view is available to both contributors (for editing) and public viewers (for browsing)

### 5.2 Comparison Views

#### 5.2.1 Side-by-Side View (Default)

- Displays all 3 contributors' rankings for a given year in adjacent columns
- Default landing view shows the **top 10** from each contributor
- "Show More" / "View Full List" button expands to the complete list
- Each entry displays: rank number, poster thumbnail, show title + season
- Visual indicators when the same show appears in multiple users' lists (e.g., connecting lines or matching highlight colors)
- On mobile: horizontal swipe between users, or a stacked card view with user tabs
- Sticky header with user names/avatars at the top of each column

#### 5.2.2 Consensus Rankings

- Auto-generated aggregate ranking based on the average rank position across all contributors who ranked that season
- Shows that not all contributors ranked receive a weighted penalty or are placed in a separate "unranked by some" section
- Each entry in the consensus list shows the individual rank from each contributor alongside the aggregate position
- Consensus list updates in real-time as contributors modify their rankings

#### 5.2.3 Biggest Disagreements

- Accessible as a secondary view within each year
- Automatically identifies shows with the largest rank spread among contributors
- Displays as a list sorted by disagreement magnitude (largest spread first)
- Each entry shows: show title + season, each contributor's rank, and the spread value
- Only includes shows ranked by at least 2 contributors
- Example display: "The Bear S3 — Matt: #2, Mike: #14, Jake: #6 — Spread: 12"

### 5.3 Awards & Superlatives

#### 5.3.1 Overview

- Each year has a dedicated awards page where contributors can create and vote on custom superlative categories
- Serves as the group's personal TV awards ceremony

#### 5.3.2 Award Categories

- **Preset categories** (suggested each year, admin can customize):
  - Best New Show
  - Best Returning Show
  - Most Disappointing
  - Biggest Surprise
  - Best Finale
  - Best Pilot/Premiere
  - Most Overrated
  - Most Underrated
  - Show of the Year
- **Custom categories**: Any contributor can propose additional categories (e.g., "Best Cold Open," "Most Likely to Fall Off Next Season," "Guilty Pleasure of the Year")
- Admin can approve/reject proposed categories

#### 5.3.3 Award Nominations & Selections

- Each contributor selects their pick for each category
- Picks are linked to shows/seasons from TMDB (for metadata and poster display)
- A "group winner" is determined by majority (2 of 3) or highlighted when all 3 agree
- Unanimous picks receive special visual treatment (gold badge, animation, etc.)
- Each pick can include an optional short blurb explaining the choice

#### 5.3.4 Awards Display

- Awards page is visually distinct — more celebratory/event-like styling
- Categories displayed as cards with each contributor's pick and the group winner highlighted
- Sharable individual award cards (for social media / texting)

### 5.4 Activity Feed

#### 5.4.1 Feed Content

- Displayed on the homepage below/beside the current year's side-by-side top 10
- Tracks and displays the following events:
  - "[User] added [Show S#] to their [Year] rankings at #[position]"
  - "[User] moved [Show S#] from #[old] to #[new] on their [Year] rankings"
  - "[User] removed [Show S#] from their [Year] rankings"
  - "[User] marked their [Year] rankings as finalized"
  - "[User] selected [Show S#] for [Award Category]"
  - "[User] published a new post: [Title]"
- Each feed item includes a timestamp and links to the relevant page

#### 5.4.2 Feed Behavior

- Chronological order (most recent first)
- Paginated or infinite scroll (load 20 items at a time)
- Feed is visible to all users (public and authenticated)
- Bulk operations (e.g., reordering 5 shows at once) are collapsed into a single feed entry to avoid spam

### 5.5 Genre Filtering

#### 5.5.1 Auto-Generated Genre Views

- Genre tags are pulled from TMDB and applied to each ranked season
- Within any year view, users can filter by genre to see a genre-specific ranking
- Available genres are dynamically determined by the shows ranked that year (only show genres that have entries)
- Genre filter applies to individual lists, side-by-side view, and consensus view
- URL is linkable: `/2025/genre/drama`, `/2025/genre/comedy`, etc.
- Shows can have multiple genre tags and appear in multiple genre filters

### 5.6 Supplementary Lists

#### 5.6.1 All-Time Rankings

- Each contributor maintains a personal all-time top 10 or top 20 (contributor chooses length)
- Entries are pulled from their existing yearly rankings (select from previously ranked seasons)
- Same side-by-side comparison and consensus views available as with yearly rankings
- Updated at any time (no year boundary)

#### 5.6.2 Single Episode Rankings

- Per-year ranked list of the best individual episodes
- Each entry includes: show title, season number, episode number, episode title (from TMDB)
- Each contributor maintains their own episode ranking per year
- Same comparison views (side-by-side, consensus) available
- Search powered by TMDB episode data

#### 5.6.3 Performance Rankings

- Per-year ranked list of the best individual actor/actress performances
- Each entry includes:
  - Actor/actress name (type-ahead search with TMDB cast suggestions, with manual override)
  - Show title + season (linked to TMDB)
  - Role/character name (optional)
- Each contributor maintains their own performance ranking per year
- Same comparison views (side-by-side, consensus) available

### 5.7 Blog / Writeups

#### 5.7.1 Overview

- A blog section for contributors to write longer-form content
- Serves as the space for year-end summaries, mid-year check-ins, show-specific deep dives, or open discussion

#### 5.7.2 Post Features

- Rich text editor (Markdown-based with live preview)
- Posts can embed references to ranked shows (inline show cards with poster + rank)
- Posts can be tagged by year, genre, or topic
- Each post has a comments section (open to all 3 contributors)
- Posts are publicly viewable
- Admin can pin posts to the top of the blog

#### 5.7.3 Post Metadata

| Field | Type | Required |
|-------|------|----------|
| Title | Text | Yes |
| Author | User reference | Yes (auto) |
| Body | Rich text / Markdown | Yes |
| Tags | Array of strings | No |
| Published date | Timestamp | Yes (auto) |
| Pinned | Boolean | No (admin only) |

### 5.8 Rewatchability Indicator

- Each ranked season can be tagged with a rewatchability level:
  - **Low** — One and done
  - **Medium** — Would rewatch highlights
  - **High** — Would rewatch in full
  - **Instant Classic** — Have or will rewatch multiple times
- Displayed as a badge or icon on the ranking entry
- Filterable: viewers can filter a list to show only "Instant Classic" entries, for example
- Optional — contributors are not required to set this for every entry

---

## 6. Data Model

### 6.1 Entity Relationship Overview

```
Users
  └── has many Rankings (per year)
        └── has many RankingEntries
              └── references Show (TMDB)
              └── references Season (TMDB)
  └── has many AllTimeEntries
  └── has many EpisodeRankingEntries (per year)
  └── has many PerformanceRankingEntries (per year)
  └── has many AwardPicks (per year, per category)
  └── has many BlogPosts

Shows (cached from TMDB)
  └── has many Seasons
        └── has many Episodes

AwardCategories (per year)
  └── has many AwardPicks

ActivityFeedEvents
```

### 6.2 Core Tables

#### Users

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| email | String | Whitelisted, unique |
| display_name | String | Shown on site |
| avatar_url | String | From Google OAuth or custom |
| role | Enum (admin, contributor) | |
| created_at | Timestamp | |

#### Shows (TMDB Cache)

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| tmdb_id | Integer | TMDB show ID, unique |
| title | String | |
| poster_url | String | |
| genres | Array of strings | |
| network | String | |
| status | String | (returning, ended, etc.) |
| last_synced_at | Timestamp | When TMDB data was last refreshed |

#### Seasons (TMDB Cache)

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| show_id | UUID | FK to Shows |
| tmdb_season_id | Integer | |
| season_number | Integer | |
| air_date_start | Date | |
| air_date_end | Date | |
| episode_count | Integer | |
| poster_url | String | Can differ from show poster |

#### RankingEntries

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | FK to Users |
| season_id | UUID | FK to Seasons |
| year | Integer | The ranking year (e.g., 2025) |
| rank_position | Integer | 1-indexed |
| rewatchability | Enum | Low, Medium, High, Instant Classic |
| score | Float | 0-10, nullable |
| review | Text | Short review/comment, nullable |
| created_at | Timestamp | |
| updated_at | Timestamp | |
| **Unique constraint** | | (user_id, season_id, year) |

#### EpisodeRankingEntries

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | FK to Users |
| year | Integer | |
| rank_position | Integer | |
| show_id | UUID | FK to Shows |
| season_number | Integer | |
| episode_number | Integer | |
| episode_title | String | |
| created_at | Timestamp | |
| updated_at | Timestamp | |

#### PerformanceRankingEntries

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | FK to Users |
| year | Integer | |
| rank_position | Integer | |
| actor_name | String | Manually entered / TMDB-suggested |
| character_name | String | Optional |
| season_id | UUID | FK to Seasons |
| created_at | Timestamp | |
| updated_at | Timestamp | |

#### AllTimeEntries

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | FK to Users |
| season_id | UUID | FK to Seasons |
| rank_position | Integer | 1-indexed |
| updated_at | Timestamp | |

#### AwardCategories

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| year | Integer | |
| name | String | E.g., "Best New Show" |
| is_preset | Boolean | Preset vs. custom |
| created_by | UUID | FK to Users |
| approved | Boolean | Admin approval for custom categories |

#### AwardPicks

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| category_id | UUID | FK to AwardCategories |
| user_id | UUID | FK to Users |
| season_id | UUID | FK to Seasons (nullable for flexible picks) |
| blurb | Text | Optional explanation |
| created_at | Timestamp | |
| **Unique constraint** | | (category_id, user_id) |

#### BlogPosts

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| author_id | UUID | FK to Users |
| title | String | |
| slug | String | URL-friendly, unique |
| body | Text | Markdown content |
| tags | Array of strings | |
| is_pinned | Boolean | Admin only |
| published_at | Timestamp | |
| updated_at | Timestamp | |

#### BlogComments

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| post_id | UUID | FK to BlogPosts |
| author_id | UUID | FK to Users |
| body | Text | |
| created_at | Timestamp | |

#### ActivityFeedEvents

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | FK to Users |
| event_type | Enum | add, move, remove, finalize, award_pick, blog_post |
| metadata | JSONB | Event-specific data (show name, old/new rank, etc.) |
| year | Integer | Nullable (for non-year-specific events) |
| created_at | Timestamp | |

### 6.3 Indexes

- `RankingEntries`: Composite index on (user_id, year, rank_position) for fast list retrieval
- `RankingEntries`: Index on (season_id) for cross-user comparisons
- `EpisodeRankingEntries`: Composite index on (user_id, year, rank_position)
- `PerformanceRankingEntries`: Composite index on (user_id, year, rank_position)
- `AllTimeEntries`: Composite index on (user_id, rank_position)
- `ActivityFeedEvents`: Index on (created_at DESC) for chronological feed
- `Shows`: Index on (tmdb_id) for TMDB lookups
- `BlogPosts`: Index on (slug) for URL routing

---

## 7. Design & UX

### 7.1 Visual Direction

**Style: Dark & Cinematic**

- **Background**: Deep dark tones (#0a0a0f to #14141f range) — not pure black, slightly warm or cool tinted
- **Surface colors**: Elevated cards and panels use subtle lighter dark tones (#1a1a2e, #1e1e30)
- **Accent color**: A signature accent color for interactive elements, highlights, and branding (recommend a rich gold/amber or electric blue — to be finalized in design)
- **Typography**: Clean sans-serif (e.g., Inter, DM Sans, or Outfit) for body text; a display/serif font for headings and the logo to add cinematic weight
- **Poster art as hero**: Show posters are the primary visual element — large, high-res, with subtle hover effects (scale, glow, or parallax)
- **Glassmorphism / subtle blur**: For overlapping UI elements (modals, dropdowns) to add depth
- **Minimal borders**: Use shadow and elevation over hard borders
- **Animations**: Subtle, purposeful — rank position transitions, card reveals, smooth page transitions

### 7.2 Layout Principles

- **Mobile-first responsive design**: Design for 375px width first, then scale up
- **Breakpoints**:
  - Mobile: 375px - 767px (single column, stacked cards, swipe gestures)
  - Tablet: 768px - 1023px (two columns for side-by-side)
  - Desktop: 1024px+ (three columns for full side-by-side)
- **Content width**: Max container width of 1280px, centered
- **Card-based UI**: Each ranking entry is a card with poster, rank badge, and metadata
- **Generous spacing**: Let the content breathe — the site should feel curated, not cramped

### 7.3 Key Component Designs

#### Ranking Card (List Item)

```
┌──────────────────────────────────┐
│  #3                  ★ 8.5/10   │
│  ┌─────────┐                     │
│  │ POSTER  │  Severance          │
│  │  IMAGE  │  Season 2           │
│  │         │  Apple TV+          │
│  │         │  Drama, Thriller    │
│  │         │  10 episodes        │
│  └─────────┘  Rewatch: High 🔄  │
│                                  │
└──────────────────────────────────┘
```

#### Side-by-Side View (Desktop)

```
┌──────────────┬──────────────┬──────────────┐
│    Matt       │    Mike       │    Jake       │
│    ══════     │    ══════     │    ══════     │
│ 1. Show A S2  │ 1. Show C S1  │ 1. Show A S2  │
│ 2. Show B S3  │ 2. Show A S2  │ 2. Show D S1  │
│ 3. Show C S1  │ 3. Show D S1  │ 3. Show B S3  │
│ ...           │ ...           │ ...           │
│               │               │               │
│ [View Full]   │ [View Full]   │ [View Full]   │
└──────────────┴──────────────┴──────────────┘
```

#### Side-by-Side View (Mobile)

- Tab bar at top with user names to switch between columns
- Or: horizontal swipe carousel between users
- Consensus and disagreements available as additional tabs

#### Awards Card

```
┌────────────────────────────────────┐
│  🏆  BEST NEW SHOW 2025            │
│  ─────────────────────────         │
│  GROUP WINNER: Severance S1        │
│  ┌──────────────────────────────┐  │
│  │ Matt: Severance S1           │  │
│  │ Mike: Severance S1           │  │
│  │ Jake: The Studio S1          │  │
│  └──────────────────────────────┘  │
│  ★ UNANIMOUS (if applicable)       │
└────────────────────────────────────┘
```

### 7.4 Interaction Patterns

- **Drag and drop**: Primary reordering mechanism on desktop; long-press drag on mobile
- **Inline editing**: Click/tap a rank entry to expand it and edit optional fields
- **Optimistic updates**: UI updates immediately on change; saves in background
- **Toast notifications**: Brief confirmation messages on save/update ("Ranking saved", "Award pick updated")
- **Skeleton loading**: Show placeholder cards while data loads (maintain layout, prevent jumps)
- **Pull-to-refresh**: On mobile, pull down to refresh the current view

### 7.5 Homepage Layout

```
┌──────────────────────────────────────────────┐
│  RTVG RANKINGS          [2025 ▼]  [Awards]   │
│                         [Lists]   [Blog]      │
├──────────────────────────────────────────────┤
│                                              │
│  2025 Rankings                               │
│  ┌──────────┬──────────┬──────────┐          │
│  │  Matt    │  Mike    │  Jake    │          │
│  │  Top 10  │  Top 10  │  Top 10  │          │
│  │  ...     │  ...     │  ...     │          │
│  └──────────┴──────────┴──────────┘          │
│  [View Full Rankings →]                       │
│                                              │
│  Recent Activity                             │
│  ├─ Matt added Severance S2 at #1 — 2h ago  │
│  ├─ Jake moved White Lotus from #5→#3 — 5h  │
│  └─ Mike finalized 2025 rankings — 1d ago   │
│  [View All Activity →]                        │
│                                              │
└──────────────────────────────────────────────┘
```

---

## 8. Technical Architecture

### 8.1 Stack Overview

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | Next.js (App Router) | SSR for SEO/performance, React ecosystem, industry standard |
| **Language** | TypeScript | Type safety, better DX, catches errors at build time |
| **Styling** | Tailwind CSS | Utility-first, mobile-first by design, rapid iteration, pairs well with dark themes |
| **Database** | Supabase (PostgreSQL) | Managed Postgres, built-in auth with Google OAuth, real-time subscriptions, generous free tier |
| **Auth** | Supabase Auth (Google OAuth) | Native integration, handles token management, supports whitelisted emails |
| **API** | Next.js API Routes + Supabase Client | Server-side data fetching via React Server Components; mutations via API routes |
| **External Data** | TMDB API | Free, comprehensive TV metadata, well-documented |
| **Hosting** | Vercel | Native Next.js support, edge CDN, automatic deployments, free tier sufficient |
| **Image CDN** | TMDB image CDN + Next.js Image Optimization | Automatic resizing, lazy loading, WebP conversion |

### 8.2 Architecture Diagram

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Browser    │────▶│  Vercel (Edge)   │────▶│  Supabase    │
│  (Next.js)   │◀────│  Next.js SSR     │◀────│  PostgreSQL  │
└─────────────┘     │  API Routes      │     │  Auth        │
                    └──────────────────┘     │  Realtime    │
                           │                 └──────────────┘
                           │
                    ┌──────────────┐
                    │  TMDB API    │
                    │  (external)  │
                    └──────────────┘
```

### 8.3 Key Technical Decisions

#### Server-Side Rendering (SSR)

- All public-facing pages are server-rendered for fast initial load and SEO
- Ranking lists, comparison views, awards pages, and blog posts are rendered on the server
- Dynamic data (activity feed, real-time rank changes) hydrated on the client

#### Data Fetching Strategy

- **Server Components**: Fetch ranking data, show metadata, and comparisons at the server level
- **Client Components**: Handle interactive features (drag-and-drop, inline editing, search)
- **Caching**: TMDB show data cached in Supabase to minimize API calls; refreshed periodically (daily or on-demand)
- **Revalidation**: Use Next.js ISR (Incremental Static Regeneration) for public pages with a revalidation period of 60 seconds

#### Authentication Flow

1. User clicks "Sign In" (only visible to contributors — not prominently displayed)
2. Redirected to Google OAuth consent screen
3. On callback, Supabase Auth checks email against whitelist
4. If whitelisted, session is created; if not, access is denied with a friendly message
5. Authenticated users see edit controls overlaid on the standard views

#### Real-Time Considerations

- Supabase Realtime can be used for the activity feed to show live updates
- Not critical for MVP — polling every 60 seconds is acceptable for Phase 1
- Real-time rank reordering between users is not needed (each user manages their own list)

### 8.4 Project Structure

```
rtvg-rankings/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout (dark theme, nav)
│   │   ├── page.tsx            # Homepage
│   │   ├── [year]/
│   │   │   ├── page.tsx        # Side-by-side view
│   │   │   ├── consensus/
│   │   │   ├── disagreements/
│   │   │   ├── [username]/
│   │   │   └── genre/[genre]/
│   │   ├── awards/[year]/
│   │   ├── all-time/[username]/
│   │   ├── episodes/[year]/
│   │   ├── performances/[year]/
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   ├── admin/
│   │   └── api/
│   │       ├── rankings/
│   │       ├── awards/
│   │       ├── episodes/
│   │       ├── performances/
│   │       ├── blog/
│   │       ├── activity/
│   │       └── tmdb/
│   ├── components/
│   │   ├── ui/                 # Shared UI components
│   │   ├── ranking/            # Ranking-specific components
│   │   ├── awards/             # Award-specific components
│   │   ├── blog/               # Blog-specific components
│   │   └── layout/             # Navigation, footer, etc.
│   ├── lib/
│   │   ├── supabase/           # Supabase client & helpers
│   │   ├── tmdb/               # TMDB API client
│   │   └── utils/              # Shared utilities
│   ├── hooks/                  # Custom React hooks
│   └── types/                  # TypeScript type definitions
├── public/                     # Static assets
├── supabase/
│   └── migrations/             # Database migrations
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

### 8.5 Performance Targets

| Metric | Target |
|--------|--------|
| Largest Contentful Paint (LCP) | < 2.5s |
| First Input Delay (FID) | < 100ms |
| Cumulative Layout Shift (CLS) | < 0.1 |
| Time to Interactive (TTI) | < 3.5s |
| Lighthouse Score | > 90 (all categories) |

---

## 9. API Integrations

### 9.1 TMDB (The Movie Database)

**Base URL**: `https://api.themoviedb.org/3`

**Required Endpoints**:

| Endpoint | Purpose |
|----------|---------|
| `GET /search/tv` | Search for TV shows by title |
| `GET /tv/{id}` | Get show details (genres, network, status) |
| `GET /tv/{id}/season/{season}` | Get season details (air dates, episode count, poster) |
| `GET /tv/{id}/season/{season}/episode/{episode}` | Get episode details (for episode rankings) |
| `GET /tv/{id}/credits` | Get cast list (for performance ranking suggestions) |
| `GET /configuration` | Get image base URLs for posters |

**Image URLs**: Posters served from `https://image.tmdb.org/t/p/{size}/{path}`
- Sizes: `w92`, `w154`, `w185`, `w342`, `w500`, `w780`, `original`
- Use `w342` for list views, `w500` for detail views, `w185` for thumbnails

**Rate Limits**: TMDB allows ~40 requests per 10 seconds. Mitigate by:
- Caching show/season data in Supabase after first fetch
- Batch-fetching and caching during search
- Setting a `last_synced_at` field and only refreshing data older than 24 hours

**API Key**: Stored as environment variable (`TMDB_API_KEY`), never exposed client-side. All TMDB requests routed through Next.js API routes or server components.

### 9.2 Supabase Auth

- Google OAuth provider configured in Supabase dashboard
- Whitelist enforced via a `allowed_emails` table or Supabase RLS (Row Level Security) policies
- RLS policies:
  - `SELECT` on all tables: allowed for everyone (public read)
  - `INSERT/UPDATE/DELETE` on ranking tables: allowed only for authenticated users where `user_id` matches
  - `INSERT/UPDATE/DELETE` on admin tables: allowed only for users with `role = 'admin'`

---

## 10. URL Structure & Routing

### 10.1 Public Routes

| URL | Page | Description |
|-----|------|-------------|
| `/` | Homepage | Current year side-by-side top 10 + activity feed |
| `/[year]` | Year Rankings | Side-by-side view for given year |
| `/[year]/consensus` | Consensus | Aggregate group rankings for year |
| `/[year]/disagreements` | Disagreements | Biggest ranking disagreements for year |
| `/[year]/[username]` | User Rankings | Full individual list for user + year |
| `/[year]/genre/[genre]` | Genre Filter | Filtered rankings for genre + year |
| `/awards/[year]` | Awards | Superlatives and awards for year |
| `/all-time` | All-Time Overview | Links to all users' all-time lists |
| `/all-time/[username]` | User All-Time | Individual all-time top list |
| `/episodes/[year]` | Episode Rankings | Best episodes of the year |
| `/performances/[year]` | Performance Rankings | Best performances of the year |
| `/blog` | Blog Index | All posts, most recent first |
| `/blog/[slug]` | Blog Post | Individual post |

### 10.2 Authenticated Routes

| URL | Page | Description |
|-----|------|-------------|
| `/admin` | Admin Dashboard | User management, site settings |
| `/auth/callback` | OAuth Callback | Supabase auth redirect handler |

*Note: Editing is done in-place on the public routes (edit controls appear for authenticated users), not on separate admin pages.*

---

## 11. SEO & Social Sharing

### 11.1 SEO Strategy

- All public pages server-rendered with proper HTML structure
- Dynamic `<title>` and `<meta description>` per page:
  - Homepage: "RTVG Rankings — TV Season Rankings by Matt, Mike & Jake"
  - Year page: "Best TV Shows of 2025 — RTVG Rankings"
  - User page: "Matt's Top TV Shows of 2025 — RTVG Rankings"
  - Awards: "TV Awards & Superlatives 2025 — RTVG Rankings"
- Canonical URLs for all pages
- `sitemap.xml` auto-generated by Next.js
- `robots.txt` allowing full crawling of public routes

### 11.2 Open Graph & Social Cards

Every page generates Open Graph meta tags for rich link previews:

```html
<meta property="og:title" content="Best TV Shows of 2025 — RTVG Rankings" />
<meta property="og:description" content="See how Matt, Mike & Jake ranked the best TV seasons of 2025" />
<meta property="og:image" content="https://rtvgrankings.com/api/og/2025" />
<meta property="og:url" content="https://rtvgrankings.com/2025" />
<meta property="twitter:card" content="summary_large_image" />
```

**Dynamic OG Images**: Generated via Next.js `ImageResponse` API (or `@vercel/og`):
- Collage of the top 3-5 show posters for that page
- Overlaid with text: site name, year, and page context
- Auto-generated per year, per user, per awards page

### 11.3 Shareable List Images (Phase 3)

- "Share as Image" button on any ranking list or award
- Generates a styled image (PNG) of the list suitable for texting, Instagram stories, or Twitter
- Uses the same OG image pipeline (server-rendered image generation)

---

## 12. Phased Rollout

### Phase 1 — Core MVP

**Goal**: A functional ranking site where all 3 contributors can rank TV seasons by year and viewers can compare.

**Scope**:
- Google OAuth authentication with 3 whitelisted contributors + admin role
- TMDB integration for show search and metadata
- Yearly rankings: ordered lists (1 through N) per user per year, by individual season
- Show data auto-populated: title, season, poster, network, genres, air dates, episode count
- Side-by-side default view (top 10 landing, expandable to full list)
- Individual full list views per user per year
- Consensus/aggregate rankings per year
- Clean linkable URL structure for all views
- Mobile-first responsive design with dark cinematic aesthetic
- Auto-save with drag-and-drop reordering
- Year navigation (2021-present)
- Year finalization with "Final" badge and "Last revised" timestamp

**Estimated Effort**: Foundation — build first, everything else layers on top.

---

### Phase 2 — Enhanced Features

**Goal**: Add the features that make the site fun, social, and distinctive.

**Scope**:
- Awards/superlatives per year (preset + custom categories, picks per contributor, group winners)
- Biggest disagreements view per year
- Activity feed on homepage (add, move, remove, finalize events)
- Genre filtering (auto-generated from TMDB genre tags)
- Rewatchability indicator (Low / Medium / High / Instant Classic) on ranking entries
- Tier view toggle (display any list as S/A/B/C/D/F tiers)
- Single episode rankings per year (search, rank, compare)
- Score field (0-10) on ranking entries

**Estimated Effort**: Builds on Phase 1 data model and UI patterns. Awards is the largest new feature.

---

### Phase 3 — Supplementary Lists & Content

**Goal**: Round out the platform with additional ranking types, editorial content, and polish.

**Scope**:
- All-time rankings (top 10/20 per user, side-by-side + consensus)
- Performance rankings per year (actor/actress, type-ahead search with TMDB suggestions)
- Short reviews/comments on ranking entries
- Blog/writeup section (Markdown editor, tags, comments, pinned posts)
- SEO optimization (dynamic meta tags, sitemap, OG images)
- Open Graph social preview cards (dynamic image generation)
- Shareable list image export ("Share as Image" for social/texting)

**Estimated Effort**: Performance rankings and blog are the largest new features. SEO/OG images are moderate.

---

## 13. Future Considerations

These are not in scope for Phases 1-3 but are worth noting for potential future development:

- **Watchlist / tracking**: Track shows you're currently watching or plan to watch
- **Show recommendations**: Based on ranking patterns, suggest shows other users ranked highly that you haven't seen
- **Guest rankings**: Allow invited guests to create a one-time ranking list for a year (for expanding beyond the core 3)
- **Spoiler controls**: Hide reviews/blurbs behind a spoiler toggle
- **Viewing stats**: Analytics on how many shows were watched per year, genre distribution, platform distribution
- **Podcast/video integration**: If the group records discussions, embed links alongside rankings
- **API access**: Public read-only API for programmatic access to rankings data
- **Push notifications**: Notify contributors when a friend updates their rankings (via web push or email)
- **Yearly recap**: Auto-generated visual summary of each user's TV year (think Spotify Wrapped)

---

## Appendix A: Glossary

| Term | Definition |
|------|-----------|
| **Season** | A single season of a TV show (the unit being ranked) |
| **Ranking** | A user's ordered list of seasons for a given year |
| **Ranking Entry** | A single season within a user's ranking, with its position and optional metadata |
| **Consensus** | The auto-generated aggregate ranking based on averaging all contributors' positions |
| **Superlative / Award** | A category-based pick (e.g., "Best New Show") separate from the numerical rankings |
| **Contributor** | An authenticated user who can create and edit rankings (3 total) |
| **Viewer** | An unauthenticated visitor with read-only access |
| **Finalized** | A ranking list marked as complete for the year (still editable, but flagged as final) |

## Appendix B: TMDB Data Mapping

| RTVG Field | TMDB Source |
|-----------|-------------|
| Show title | `tv.name` |
| Season number | `tv/season.season_number` |
| Show poster | `tv.poster_path` |
| Season poster | `tv/season.poster_path` (fallback to show poster) |
| Network | `tv.networks[0].name` |
| Genres | `tv.genres[].name` |
| Air date start | `tv/season.air_date` |
| Episode count | `tv/season.episodes.length` |
| Episode title | `tv/season/episode.name` |
| Cast | `tv/credits.cast[].name` |
| Character name | `tv/credits.cast[].character` |
