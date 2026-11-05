create table if not exists applications (
  id text primary key,
  full_name text not null,
  email text not null,
  phone text,
  city text not null default '',
  country text not null default '',
  languages text not null default '',
  bio text not null default '',
  instagram text,
  website text,
  profile_types jsonb not null default '[]'::jsonb,
  sports jsonb not null default '[]'::jsonb,
  sport_level text,
  looking_for jsonb not null default '[]'::jsonb,
  offering jsonb not null default '[]'::jsonb,
  destinations jsonb not null default '[]'::jsonb,
  trip_length text,
  budget text,
  travel_company text,
  experience_interest boolean not null default false,
  experiences jsonb not null default '[]'::jsonb,
  experience_note text,
  sport_goal text,
  support_needs jsonb not null default '[]'::jsonb,
  project_description text,
  offer_detail text,
  operates_where text,
  pricing_model text,
  portfolio_url text,
  contact_consent boolean not null default false,
  public_preview boolean not null default false,
  status text not null default 'New',
  internal_notes text not null default '',
  tags jsonb not null default '[]'::jsonb,
  points_sport integer not null default 0,
  points_travel integer not null default 0,
  points_knowledge integer not null default 0,
  points_community integer not null default 0,
  points_creative integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint applications_status_chk check (
    status in ('New', 'Reviewed', 'Accepted', 'Waitlisted', 'Rejected', 'Contacted')
  ),
  constraint applications_points_chk check (
    points_sport between 0 and 20
    and points_travel between 0 and 20
    and points_knowledge between 0 and 20
    and points_community between 0 and 20
    and points_creative between 0 and 20
  )
);

create index if not exists applications_created_at_idx on applications (created_at desc);
create index if not exists applications_status_idx on applications (status);
