-- USERS TABLE + AUTH TRIGGER
create table public.users (
  user_id uuid primary key references auth.users on delete cascade not null,
  username text unique,
  full_name text,
  avatar_url text,
  phone_number text unique,
  num_completed_tasks int default 0,
  constraint username_length check (char_length(username) >= 3)
);

alter table public.users enable row level security;

create policy "Users can insert their own profile." 
  on public.users
  for insert
  with check (auth.uid() = user_id);

create policy "Public profiles are viewable by everyone." 
  on public.users
  for select 
  using (true);

create policy "Users can update own profile." 
  on public.users
  for update 
  using (auth.uid() = user_id);

-- Automatically create a user row when a new user signs up through Supabase Auth
create function public.handle_new_user()
returns trigger
set search_path = ''
as $$
begin
  insert into public.users (user_id, username, full_name, avatar_url, phone_number)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'phone_number'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- STORAGE BUCKETS + POLICIES

-- Avatar bucket
insert into storage.buckets (id, name)
values ('avatars', 'avatars')
on conflict (id) do nothing;

create policy "Avatar images are publicly accessible." 
  on storage.objects
  for select 
  using (bucket_id = 'avatars');

create policy "Anyone can upload an avatar." 
  on storage.objects
  for insert 
  with check (bucket_id = 'avatars');

-- Task submissions bucket
insert into storage.buckets (id, name)
values ('task_submissions', 'task_submissions')
on conflict (id) do nothing;

create policy "Task submission images are publicly accessible." 
  on storage.objects
  for select 
  using (bucket_id = 'task_submissions');

create policy "Anyone can upload a task submission image." 
  on storage.objects
  for insert 
  with check (bucket_id = 'task_submissions');

-- FRIENDS + GROUPS + TASKS

create table public.friendRequests (
  sender_id uuid not null references public.users(user_id),
  recipient_id uuid not null references public.users(user_id),
  primary key (sender_id, recipient_id)
);

create table public.isFriendsWith (
  user1_id uuid not null references public.users(user_id),
  user2_id uuid not null references public.users(user_id),
  primary key (user1_id, user2_id)
);

create table public.groups (
  group_id uuid primary key,
  group_name text not null,
  date_created date default now()
);

create table public.isPartOf (
  user_id uuid not null references public.users(user_id),
  group_id uuid not null references public.groups(group_id),
  current_rank int,
  current_points int default 0,
  primary key (user_id, group_id)
);

create table public.tasks (
  group_id uuid not null references public.groups(group_id),
  task_name text not null,
  recurring boolean default false,
  primary key (group_id, task_name)
);

create table public.hasCompleted (
  user_id uuid not null references public.users(user_id),
  group_id uuid not null references public.groups(group_id),
  task_name text not null,
  submission_photo_url text not null,
  time_submitted timestamptz not null default now(),
  primary key (user_id, group_id, task_name, time_submitted),
  foreign key (task_name, group_id) references public.tasks (task_name, group_id)
);
