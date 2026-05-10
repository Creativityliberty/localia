-- =========================================================
-- Localia — Migration 0001 : schéma core
-- =========================================================
-- Apply via InsForge dashboard or `pnpm dlx @insforge/cli migrate`.
-- Requires `auth.users` (provided by InsForge).
-- =========================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------
-- Trigger helper : updated_at automatique
-- ---------------------------------------------------------
create or replace function localia_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ---------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------
do $$ begin
  if not exists (select 1 from pg_type where typname = 'business_category') then
    create type business_category as enum (
      'BARBER','HAIRDRESSER','BEAUTY','NAILS','SPA',
      'RESTAURANT','SNACK','FOODTRUCK','BAKERY','COFFEE',
      'COACH','FITNESS','YOGA','PHYSIO','THERAPIST',
      'CRAFTSMAN','GARAGE','CLEANING','PHOTOGRAPHER',
      'SHOP','BOUTIQUE','FLORIST','OTHER'
    );
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'site_status') then
    create type site_status as enum ('draft','published','archived');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'section_kind') then
    create type section_kind as enum (
      'hero','about','services','offer','gallery','testimonials',
      'faq','contact','hours','map','cta','custom'
    );
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'cta_kind') then
    create type cta_kind as enum (
      'whatsapp','phone','email','form','booking',
      'directions','external','google_review','instagram'
    );
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'lead_status') then
    create type lead_status as enum ('new','read','contacted','converted','archived','spam');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'qr_purpose') then
    create type qr_purpose as enum (
      'site','offer','review','loyalty','whatsapp',
      'menu','booking','custom'
    );
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'plan_tier') then
    create type plan_tier as enum ('free','start','business','funnel','growth');
  end if;
end $$;

-- ---------------------------------------------------------
-- TABLE : businesses (1 commerçant peut avoir plusieurs)
-- ---------------------------------------------------------
create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name varchar(160) not null,
  slug varchar(180) unique not null,
  category business_category not null default 'OTHER',
  tagline text,
  description text,

  -- Branding
  logo_url text,
  logo_key text,
  banner_url text,
  banner_key text,
  primary_color varchar(20) not null default '#1B3D0A',
  accent_color varchar(20) not null default '#A6FF4D',

  -- Coordonnées
  email varchar(255),
  phone varchar(40),
  whatsapp_number varchar(40),
  address text,
  city varchar(120),
  postal_code varchar(20),
  country varchar(120) default 'France',
  timezone varchar(80) not null default 'Europe/Paris',
  currency varchar(10) not null default 'EUR',

  -- Liens externes
  website_url text,
  instagram_url text,
  facebook_url text,
  tiktok_url text,
  google_business_url text,
  google_review_url text,
  google_maps_url text,
  booking_url text,

  -- Horaires (JSON : { mon: [{open: "09:00", close: "18:00"}], ... })
  opening_hours jsonb default '{}'::jsonb,

  -- Plan
  plan plan_tier not null default 'free',
  plan_expires_at timestamptz,

  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,

  constraint businesses_slug_format check (slug ~ '^[a-z0-9][a-z0-9-]{1,160}[a-z0-9]$'),
  constraint businesses_name_length check (char_length(name) between 2 and 160)
);

create index if not exists idx_businesses_owner on businesses(owner_id);
create index if not exists idx_businesses_slug on businesses(slug);
create index if not exists idx_businesses_category on businesses(category);
create unique index if not exists idx_businesses_owner_active on businesses(owner_id, slug) where deleted_at is null;

create or replace trigger businesses_updated_at
  before update on businesses
  for each row execute function localia_set_updated_at();

-- ---------------------------------------------------------
-- TABLE : themes (presets visuels par site)
-- ---------------------------------------------------------
create table if not exists themes (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,

  name varchar(80) not null default 'Default',
  preset varchar(40) not null default 'fresh',

  -- Couleurs
  background_color varchar(20) not null default '#F4F7F2',
  surface_color varchar(20) not null default '#FFFFFF',
  primary_color varchar(20) not null default '#1B3D0A',
  primary_dark_color varchar(20) not null default '#0A2A05',
  accent_color varchar(20) not null default '#A6FF4D',
  text_primary_color varchar(20) not null default '#111611',
  text_secondary_color varchar(20) not null default '#5E6B5B',

  -- Forme
  radius varchar(20) not null default '24px',
  font_display varchar(80) default 'Fraunces',
  font_body varchar(80) default 'Geist',

  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_themes_business on themes(business_id);

create or replace trigger themes_updated_at
  before update on themes for each row execute function localia_set_updated_at();

-- ---------------------------------------------------------
-- TABLE : sites (le mini-site publié)
-- ---------------------------------------------------------
create table if not exists sites (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  theme_id uuid references themes(id) on delete set null,

  title varchar(180) not null default 'Mon mini-site',
  slug varchar(180) unique not null,
  status site_status not null default 'draft',

  -- SEO
  seo_title text,
  seo_description text,
  og_image_url text,

  -- Contenu hero (rapide à éditer sans toucher aux sections)
  hero_title text,
  hero_subtitle text,
  hero_image_url text,

  -- Tracking & domaine
  custom_domain varchar(180),
  ai_generated boolean not null default false,
  ai_prompt text,

  published_at timestamptz,
  view_count int not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,

  constraint sites_slug_format check (slug ~ '^[a-z0-9][a-z0-9-]{1,160}[a-z0-9]$')
);

create index if not exists idx_sites_business on sites(business_id);
create unique index if not exists idx_sites_slug_active on sites(slug) where deleted_at is null;
create index if not exists idx_sites_status on sites(status);

create or replace trigger sites_updated_at
  before update on sites for each row execute function localia_set_updated_at();

-- ---------------------------------------------------------
-- TABLE : sections (blocs du mini-site, ordonnés)
-- ---------------------------------------------------------
create table if not exists sections (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references sites(id) on delete cascade,
  business_id uuid not null references businesses(id) on delete cascade,

  kind section_kind not null,
  title text,
  subtitle text,
  body text,

  -- Bloc générique : structure libre selon kind
  content jsonb not null default '{}'::jsonb,

  position int not null default 0,
  is_visible boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_sections_site_position on sections(site_id, position);
create index if not exists idx_sections_business on sections(business_id);

create or replace trigger sections_updated_at
  before update on sections for each row execute function localia_set_updated_at();

-- ---------------------------------------------------------
-- TABLE : services (offres / prestations affichées)
-- ---------------------------------------------------------
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  site_id uuid references sites(id) on delete cascade,

  title varchar(180) not null,
  description text,
  price_label varchar(60),
  price_amount decimal(10,2),
  duration_minutes int,
  image_url text,
  badge varchar(40),

  position int not null default 0,
  is_featured boolean not null default false,
  is_visible boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists idx_services_business on services(business_id);
create index if not exists idx_services_site_position on services(site_id, position);

create or replace trigger services_updated_at
  before update on services for each row execute function localia_set_updated_at();

-- ---------------------------------------------------------
-- TABLE : ctas (boutons d'action sur le site)
-- ---------------------------------------------------------
create table if not exists ctas (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references sites(id) on delete cascade,
  business_id uuid not null references businesses(id) on delete cascade,
  section_id uuid references sections(id) on delete cascade,

  label varchar(120) not null,
  kind cta_kind not null,
  value text not null,
  -- Pour WhatsApp : message prérempli
  prefilled_message text,

  position int not null default 0,
  is_primary boolean not null default false,
  is_visible boolean not null default true,
  click_count int not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_ctas_site on ctas(site_id);
create index if not exists idx_ctas_business on ctas(business_id);

create or replace trigger ctas_updated_at
  before update on ctas for each row execute function localia_set_updated_at();

-- ---------------------------------------------------------
-- TABLE : leads (demandes reçues via formulaire)
-- ---------------------------------------------------------
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  site_id uuid references sites(id) on delete set null,

  name varchar(160),
  email varchar(255),
  phone varchar(40),
  message text not null,
  service_requested varchar(180),

  status lead_status not null default 'new',

  -- Source
  source varchar(80),
  utm_source varchar(80),
  utm_medium varchar(80),
  utm_campaign varchar(80),
  referrer text,
  user_agent text,

  -- Notes commerçant
  internal_notes text,
  contacted_at timestamptz,
  converted_at timestamptz,

  consent_marketing boolean not null default false,
  consent_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,

  constraint leads_contact_present check (email is not null or phone is not null)
);

create index if not exists idx_leads_business_created on leads(business_id, created_at desc);
create index if not exists idx_leads_status on leads(status);
create index if not exists idx_leads_business_status on leads(business_id, status, created_at desc) where deleted_at is null;

create or replace trigger leads_updated_at
  before update on leads for each row execute function localia_set_updated_at();

-- ---------------------------------------------------------
-- TABLE : qr_codes (générés pour différents usages)
-- ---------------------------------------------------------
create table if not exists qr_codes (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  site_id uuid references sites(id) on delete cascade,

  label varchar(160) not null,
  purpose qr_purpose not null,
  short_token varchar(40) unique not null,
  target_url text not null,

  -- Tracking
  utm_source varchar(80),
  utm_medium varchar(80) default 'qr',
  utm_campaign varchar(80),
  scan_count int not null default 0,
  last_scanned_at timestamptz,

  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_qr_codes_business on qr_codes(business_id);
create index if not exists idx_qr_codes_token on qr_codes(short_token);

create or replace trigger qr_codes_updated_at
  before update on qr_codes for each row execute function localia_set_updated_at();

-- ---------------------------------------------------------
-- TABLE : events (analytics légères)
-- ---------------------------------------------------------
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  site_id uuid references sites(id) on delete cascade,

  -- Identité visiteur (anonyme par défaut)
  anonymous_id varchar(120),
  session_id varchar(120),

  -- Type d'événement
  name varchar(80) not null,
  cta_id uuid references ctas(id) on delete set null,
  qr_code_id uuid references qr_codes(id) on delete set null,
  service_id uuid references services(id) on delete set null,

  -- Source / contexte
  utm_source varchar(80),
  utm_medium varchar(80),
  utm_campaign varchar(80),
  referrer text,
  path text,

  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_events_business_created on events(business_id, created_at desc);
create index if not exists idx_events_site_name on events(site_id, name, created_at desc);
create index if not exists idx_events_name on events(name);

-- ---------------------------------------------------------
-- TABLE : media_assets (uploads par business)
-- ---------------------------------------------------------
create table if not exists media_assets (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  uploaded_by uuid not null references auth.users(id) on delete cascade,

  bucket varchar(80) not null default 'localia-media',
  storage_key text not null,
  public_url text not null,

  filename varchar(255),
  mime_type varchar(80) not null,
  size_bytes int not null default 0,
  width int,
  height int,

  -- Lien optionnel à un parent
  owner_entity_type varchar(40),
  owner_entity_id uuid,

  created_at timestamptz not null default now(),
  deleted_at timestamptz,

  constraint media_size_check check (size_bytes >= 0 and size_bytes <= 10485760)
);

create index if not exists idx_media_business on media_assets(business_id);

-- ---------------------------------------------------------
-- TABLE : offers (offres de bienvenue, promos mensuelles)
-- ---------------------------------------------------------
create table if not exists offers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  site_id uuid references sites(id) on delete cascade,

  title varchar(180) not null,
  description text,
  promo_code varchar(40),
  reward_label varchar(180),
  conditions text,

  -- Trigger
  is_welcome boolean not null default false,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,

  -- Stats
  view_count int not null default 0,
  claim_count int not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists idx_offers_business on offers(business_id);
create index if not exists idx_offers_active on offers(is_active);

create or replace trigger offers_updated_at
  before update on offers for each row execute function localia_set_updated_at();
