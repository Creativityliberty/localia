-- =========================================================
-- Localia — Migration 0003 : Row Level Security
-- =========================================================
-- Active RLS sur toutes les tables. Le SDK InsForge passe
-- automatiquement le JWT de l'utilisateur, qui peuple
-- auth.uid() côté Postgres.
-- =========================================================

-- ---------------------------------------------------------
-- businesses : un user voit/édite uniquement les siens
-- ---------------------------------------------------------
alter table businesses enable row level security;

create policy businesses_select_own on businesses
  for select using (owner_id = auth.uid());
create policy businesses_insert_own on businesses
  for insert with check (owner_id = auth.uid());
create policy businesses_update_own on businesses
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy businesses_delete_own on businesses
  for delete using (owner_id = auth.uid());

-- Lecture publique des businesses actifs (pour la page publique du site)
create policy businesses_public_read on businesses
  for select using (is_active = true and deleted_at is null);

-- ---------------------------------------------------------
-- Helper : vérifie que l'user est owner du business
-- ---------------------------------------------------------
create or replace function localia_owns_business(b_id uuid)
returns boolean as $$
  select exists (
    select 1 from businesses
    where id = b_id and owner_id = auth.uid()
  );
$$ language sql security definer stable;

-- ---------------------------------------------------------
-- Pattern réutilisable pour toutes les tables business-scoped
-- ---------------------------------------------------------

-- sites
alter table sites enable row level security;
create policy sites_owner_all on sites
  using (localia_owns_business(business_id))
  with check (localia_owns_business(business_id));
create policy sites_public_read on sites
  for select using (status = 'published' and deleted_at is null);

-- themes
alter table themes enable row level security;
create policy themes_owner_all on themes
  using (localia_owns_business(business_id))
  with check (localia_owns_business(business_id));
create policy themes_public_read on themes for select using (true);

-- sections
alter table sections enable row level security;
create policy sections_owner_all on sections
  using (localia_owns_business(business_id))
  with check (localia_owns_business(business_id));
create policy sections_public_read on sections
  for select using (
    is_visible = true
    and exists (select 1 from sites s where s.id = sections.site_id and s.status = 'published')
  );

-- services
alter table services enable row level security;
create policy services_owner_all on services
  using (localia_owns_business(business_id))
  with check (localia_owns_business(business_id));
create policy services_public_read on services
  for select using (is_visible = true and deleted_at is null);

-- ctas
alter table ctas enable row level security;
create policy ctas_owner_all on ctas
  using (localia_owns_business(business_id))
  with check (localia_owns_business(business_id));
create policy ctas_public_read on ctas
  for select using (is_visible = true);

-- leads : owner peut tout, anonyme peut juste insérer
alter table leads enable row level security;
create policy leads_owner_select on leads
  for select using (localia_owns_business(business_id));
create policy leads_owner_update on leads
  for update using (localia_owns_business(business_id));
create policy leads_owner_delete on leads
  for delete using (localia_owns_business(business_id));
create policy leads_public_insert on leads
  for insert with check (
    exists (
      select 1 from businesses b
      where b.id = leads.business_id and b.is_active = true and b.deleted_at is null
    )
  );

-- qr_codes
alter table qr_codes enable row level security;
create policy qr_codes_owner_all on qr_codes
  using (localia_owns_business(business_id))
  with check (localia_owns_business(business_id));
create policy qr_codes_public_read on qr_codes
  for select using (is_active = true);

-- events : insertion publique, lecture owner
alter table events enable row level security;
create policy events_public_insert on events
  for insert with check (true);
create policy events_owner_select on events
  for select using (localia_owns_business(business_id));

-- media_assets
alter table media_assets enable row level security;
create policy media_owner_all on media_assets
  using (localia_owns_business(business_id))
  with check (localia_owns_business(business_id));
create policy media_public_read on media_assets
  for select using (deleted_at is null);

-- offers
alter table offers enable row level security;
create policy offers_owner_all on offers
  using (localia_owns_business(business_id))
  with check (localia_owns_business(business_id));
create policy offers_public_read on offers
  for select using (is_active = true and deleted_at is null);

-- ---------------------------------------------------------
-- Fidélité
-- ---------------------------------------------------------

alter table loyalty_cards enable row level security;
create policy loyalty_cards_owner_all on loyalty_cards
  using (localia_owns_business(business_id))
  with check (localia_owns_business(business_id));
create policy loyalty_cards_public_read on loyalty_cards
  for select using (is_active = true and deleted_at is null);

alter table customers enable row level security;
create policy customers_owner_all on customers
  using (localia_owns_business(business_id))
  with check (localia_owns_business(business_id));

alter table customer_cards enable row level security;
create policy customer_cards_owner_all on customer_cards
  using (localia_owns_business(business_id))
  with check (localia_owns_business(business_id));
-- Lecture publique par token (pour la page /c/[token])
create policy customer_cards_public_read on customer_cards
  for select using (is_active = true);

alter table transactions enable row level security;
create policy transactions_owner_all on transactions
  using (localia_owns_business(business_id))
  with check (localia_owns_business(business_id));

alter table rewards enable row level security;
create policy rewards_owner_all on rewards
  using (localia_owns_business(business_id))
  with check (localia_owns_business(business_id));
create policy rewards_public_read on rewards
  for select using (status = 'AVAILABLE');
