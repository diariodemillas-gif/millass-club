alter table applications add column if not exists coach_verified boolean not null default false;

create table if not exists network_profiles (
  id text primary key,
  kind text not null,
  name text not null,
  city text not null,
  territory text not null,
  craft text not null,
  style text not null,
  bio text not null,
  email text not null,
  portfolio jsonb not null default '[]'::jsonb,
  status text not null,
  created_at timestamptz not null default now(),
  constraint network_profiles_kind_chk check (kind in ('creator', 'studio')),
  constraint network_profiles_status_chk check (
    status in ('draft', 'submitted', 'approved', 'published', 'suspended')
  )
);

create table if not exists network_briefs (
  id text primary key,
  org_id text not null references network_profiles (id),
  title text not null,
  summary text not null,
  craft text not null,
  status text not null,
  created_at timestamptz not null default now(),
  constraint network_briefs_status_chk check (status in ('open', 'closed'))
);

create table if not exists network_invites (
  brief_id text not null references network_briefs (id),
  profile_id text not null references network_profiles (id),
  primary key (brief_id, profile_id)
);

create table if not exists network_proposals (
  id text primary key,
  brief_id text not null references network_briefs (id),
  profile_id text not null references network_profiles (id),
  body text not null,
  created_at timestamptz not null default now(),
  unique (brief_id, profile_id)
);

create table if not exists network_messages (
  id text primary key,
  brief_id text not null references network_briefs (id),
  author_id text not null references network_profiles (id),
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists interest_leads (
  id text primary key,
  realm text not null,
  name text not null,
  email text not null,
  note text not null default '',
  source text not null,
  created_at timestamptz not null default now(),
  constraint interest_leads_realm_chk check (realm in ('club', 'network'))
);

create index if not exists network_profiles_status_idx on network_profiles (status);
create index if not exists interest_leads_realm_idx on interest_leads (realm, created_at desc);
