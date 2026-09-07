create table if not exists public.products (
  id text primary key,
  name text not null,
  cat text not null,
  level text not null,
  price integer not null,
  old_price integer,
  badge text,
  image text,
  desc text,
  specs jsonb,
  includes text[],
  created_at timestamp default now()
);

alter table public.products enable row level security;

create policy "Allow public read" on public.products
  for select using (true);

create policy "Allow insert for authenticated" on public.products
  for insert to authenticated with check (true);

create policy "Allow update for authenticated" on public.products
  for update to authenticated using (true) with check (true);

insert into public.products
  (id, name, cat, level, price, old_price, badge, image, desc, specs, includes)
values
  ('ard-starter', 'Imvelaphi Arduino Starter Lab Kit', 'starter', 'beginner', 899, 1099, 'BESTSELLER', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600', 'Complete beginner kit: Arduino Uno R3, breadboard, LEDs, sensors, motors', '{"MCU":"Arduino Uno R3","Projects":"12 builds","Components":"85+ parts"}', '{"Arduino Uno R3","Breadboard + wires","Sensors + motor","Printed guide"}'),
  ('line-follower', 'Line Follower Robot Kit', 'advanced', 'intermediate', 1499, null, 'NEW', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600', 'Build autonomous line-follower with PID', '{"Sensors":"TCRT5000","Motors":"N20 micro"}', '{"Custom PCB","PID guide","LiPo batteries"}'),
  ('prosthetic-hand', '3D-Printed Robotic Prosthetic Hand', 'prosthetic', 'advanced', 4850, 5500, 'IMPACT', 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600', '5-finger servo-driven myo-ready hand', '{"Fingers":"5","Servos":"6x MG90S"}', '{"3D printed hand","Servos + wiring","EMG module"}')
on conflict (id) do nothing;
