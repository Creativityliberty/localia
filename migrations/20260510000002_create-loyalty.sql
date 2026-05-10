-- =========================================================
-- Localia — Migration 0002 : module fidélité (optionnel)
-- =========================================================
-- Inspiré de Fydelyx, simplifié pour Localia.
-- =========================================================

-- ENUMS fidélité
do $$ begin
  if not exists (select 1 from pg_type where typname = 'loyalty_kind') then
    create type loyalty_kind as enum ('STAMP','POINTS');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'customer_status') then
    create type customer_status as enum ('ACTIVE','DORMANT','VIP','BLOCKED');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'customer_tier') then
    create type customer_tier as enum ('STANDARD','BRONZE','SILVER','GOLD','VIP');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'transaction_kind') then
    create type transaction_kind as enum (
      'POINTS_ADDED','POINTS_REMOVED',
      'STAMP_ADDED','STAMP_REMOVED',
      'REWARD_UNLOCKED','REWARD_REDEEMED',
      'MANUAL_ADJUSTMENT'
    );
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'reward_status') then
    create type reward_status as enum ('AVAILABLE','REDEEMED','EXPIRED','CANCELLED');
  end if;
end $$;

-- ---------------------------------------------------------
-- TABLE : loyalty_cards (programme du commerçant)
-- ---------------------------------------------------------
create table if not exists loyalty_cards (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,

  name varchar(160) not null,
  description text,
  kind loyalty_kind not null default 'STAMP',

  -- STAMP : nombre de tampons pour récompense
  stamps_required int,
  -- POINTS : seuil pour récompense
  points_per_visit int default 1,
  reward_threshold_points int,

  reward_label varchar(180) not null,
  reward_description text,

  -- Branding carte
  card_color varchar(20) default '#1B3D0A',
  card_accent varchar(20) default '#A6FF4D',
  icon varchar(40) default 'gift',

  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,

  constraint loyalty_stamp_required check (
    (kind = 'STAMP' and stamps_required is not null and stamps_required > 0)
    or kind = 'POINTS'
  ),
  constraint loyalty_points_required check (
    (kind = 'POINTS' and reward_threshold_points is not null and reward_threshold_points > 0)
    or kind = 'STAMP'
  )
);

create index if not exists idx_loyalty_cards_business on loyalty_cards(business_id);
create index if not exists idx_loyalty_cards_active on loyalty_cards(is_active);

create or replace trigger loyalty_cards_updated_at
  before update on loyalty_cards for each row execute function localia_set_updated_at();

-- ---------------------------------------------------------
-- TABLE : customers (clients d'un business)
-- ---------------------------------------------------------
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,

  first_name varchar(120) not null,
  last_name varchar(120),
  email varchar(255),
  phone varchar(40),
  birthday date,

  status customer_status not null default 'ACTIVE',
  tier customer_tier not null default 'STANDARD',

  consent_marketing boolean not null default false,
  consent_at timestamptz,

  source varchar(40) default 'QR_CODE',
  notes text,
  last_visit_at timestamptz,
  visit_count int not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,

  constraint customers_contact_present check (email is not null or phone is not null),
  unique (business_id, email),
  unique (business_id, phone)
);

create index if not exists idx_customers_business on customers(business_id);
create index if not exists idx_customers_status on customers(status);
create index if not exists idx_customers_phone on customers(phone);

create or replace trigger customers_updated_at
  before update on customers for each row execute function localia_set_updated_at();

-- ---------------------------------------------------------
-- TABLE : customer_cards (carte d'un client pour un programme)
-- ---------------------------------------------------------
create table if not exists customer_cards (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  business_id uuid not null references businesses(id) on delete cascade,
  loyalty_card_id uuid not null references loyalty_cards(id) on delete cascade,

  -- Token public pour la page client (URL : /c/[token])
  public_token varchar(64) unique not null,

  points_balance int not null default 0,
  lifetime_points int not null default 0,
  stamps_count int not null default 0,
  lifetime_stamps int not null default 0,

  reward_available boolean not null default false,
  rewards_redeemed_count int not null default 0,

  last_visit_at timestamptz,
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (customer_id, loyalty_card_id)
);

create index if not exists idx_customer_cards_business on customer_cards(business_id);
create index if not exists idx_customer_cards_customer on customer_cards(customer_id);
create index if not exists idx_customer_cards_token on customer_cards(public_token);
create index if not exists idx_customer_cards_reward on customer_cards(reward_available);

create or replace trigger customer_cards_updated_at
  before update on customer_cards for each row execute function localia_set_updated_at();

-- ---------------------------------------------------------
-- TABLE : transactions (historique points/tampons)
-- ---------------------------------------------------------
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  customer_card_id uuid not null references customer_cards(id) on delete cascade,
  loyalty_card_id uuid not null references loyalty_cards(id) on delete cascade,

  kind transaction_kind not null,
  points_delta int not null default 0,
  stamps_delta int not null default 0,
  amount decimal(10,2),

  reward_id uuid,
  note text,
  created_by uuid references auth.users(id) on delete set null,

  created_at timestamptz not null default now()
);

create index if not exists idx_transactions_business on transactions(business_id);
create index if not exists idx_transactions_customer on transactions(customer_id);
create index if not exists idx_transactions_card on transactions(customer_card_id);
create index if not exists idx_transactions_created on transactions(created_at desc);

-- ---------------------------------------------------------
-- TABLE : rewards (récompenses débloquées par un client)
-- ---------------------------------------------------------
create table if not exists rewards (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  customer_card_id uuid not null references customer_cards(id) on delete cascade,
  loyalty_card_id uuid not null references loyalty_cards(id) on delete cascade,

  title varchar(180) not null,
  description text,

  status reward_status not null default 'AVAILABLE',
  redemption_code varchar(40),

  unlocked_at timestamptz not null default now(),
  redeemed_at timestamptz,
  expires_at timestamptz,
  redeemed_by uuid references auth.users(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_rewards_business on rewards(business_id);
create index if not exists idx_rewards_customer on rewards(customer_id);
create index if not exists idx_rewards_status on rewards(status);

create or replace trigger rewards_updated_at
  before update on rewards for each row execute function localia_set_updated_at();
