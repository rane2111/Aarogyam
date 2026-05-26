create table consultations (
  id uuid primary key default gen_random_uuid(),

  patient_id uuid references auth.users(id) on delete cascade,
  doctor_id uuid references auth.users(id) on delete cascade,

  status text check (status in ('pending', 'accepted', 'rejected')) default 'pending',

  channel_name text,

  created_at timestamp with time zone default now()
);