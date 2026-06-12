-- Local development seed data. NEVER run against production.
-- Users (password for all: password123):
--   asha@example.com  (admin)
--   ravi@example.com  (volunteer)
--   meera@example.com (user)
set search_path = public, extensions;

-- ---------------------------------------------------------------------------
-- Auth users (handle_new_user trigger provisions profiles + user_settings).
-- ---------------------------------------------------------------------------
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
values
  ('00000000-0000-0000-0000-000000000000', 'f0000000-0000-4000-8000-000000000001',
   'authenticated', 'authenticated', 'asha@example.com',
   crypt('password123', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Asha Verma"}',
   now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'f0000000-0000-4000-8000-000000000002',
   'authenticated', 'authenticated', 'ravi@example.com',
   crypt('password123', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Ravi Kumar"}',
   now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'f0000000-0000-4000-8000-000000000003',
   'authenticated', 'authenticated', 'meera@example.com',
   crypt('password123', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Meera Iyer"}',
   now(), now(), '', '', '', '');

insert into auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
)
select
  gen_random_uuid(), u.id, u.id::text,
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  'email', now(), now(), now()
from auth.users u
where u.email in ('asha@example.com', 'ravi@example.com', 'meera@example.com');

update public.profiles set role = 'admin', username = 'asha'
  where id = 'f0000000-0000-4000-8000-000000000001';
update public.profiles set role = 'volunteer', username = 'ravi'
  where id = 'f0000000-0000-4000-8000-000000000002';
update public.profiles set username = 'meera'
  where id = 'f0000000-0000-4000-8000-000000000003';

-- Give users a last known location (Bengaluru) so push fan-out queries match.
update public.user_settings
set last_known_location = st_setsrid(st_makepoint(77.6245, 12.9352), 4326)::geography,
    notification_radius_m = 5000
where user_id in (
  'f0000000-0000-4000-8000-000000000001',
  'f0000000-0000-4000-8000-000000000002',
  'f0000000-0000-4000-8000-000000000003'
);

-- ---------------------------------------------------------------------------
-- Dogs: 25 across Bengaluru neighbourhoods (triggers create the initial
-- location row, activity entry, and bump author counters).
-- ---------------------------------------------------------------------------
insert into public.dogs (
  id, name, description, gender, estimated_age_months, temperament, color_markings,
  health_status, has_puppies, vaccination_status, sterilization_status,
  location, address_text, city, created_by
)
values
  -- Koramangala cluster
  ('d0000000-0000-4000-8000-000000000001', 'Sheru', 'Gentle male who naps outside the bakery on 5th Block.', 'male', 48, 'friendly', 'Brown with white chest', 'healthy', false, 'yes', 'yes', st_setsrid(st_makepoint(77.6245, 12.9352), 4326), '5th Block, Koramangala', 'Bengaluru', 'f0000000-0000-4000-8000-000000000001'),
  ('d0000000-0000-4000-8000-000000000002', 'Rani', 'Shy female, usually near the park gate. Has puppies under the culvert.', 'female', 36, 'shy', 'Tan, torn left ear', 'nursing', true, 'unknown', 'no', st_setsrid(st_makepoint(77.6268, 12.9341), 4326), 'Koramangala 4th Block park', 'Bengaluru', 'f0000000-0000-4000-8000-000000000001'),
  ('d0000000-0000-4000-8000-000000000003', 'Kalu', 'Black male, follows the chai vendor in the mornings.', 'male', 60, 'calm', 'All black', 'healthy', false, 'yes', 'yes', st_setsrid(st_makepoint(77.6221, 12.9376), 4326), '6th Block, Koramangala', 'Bengaluru', 'f0000000-0000-4000-8000-000000000002'),
  ('d0000000-0000-4000-8000-000000000004', 'Brownie', 'Playful young dog near the tech park gate.', 'female', 18, 'playful', 'Light brown', 'healthy', false, 'no', 'no', st_setsrid(st_makepoint(77.6301, 12.9329), 4326), 'Koramangala 1st Block', 'Bengaluru', 'f0000000-0000-4000-8000-000000000002'),
  ('d0000000-0000-4000-8000-000000000005', 'Tiger', 'Striped male, wary of strangers but never aggressive.', 'male', 72, 'fearful', 'Brindle stripes', 'healthy', false, 'unknown', 'unknown', st_setsrid(st_makepoint(77.6189, 12.9398), 4326), 'Koramangala 8th Block', 'Bengaluru', 'f0000000-0000-4000-8000-000000000003'),
  -- Indiranagar cluster
  ('d0000000-0000-4000-8000-000000000006', 'Moti', 'Big friendly male outside the metro station.', 'male', 84, 'friendly', 'White with brown patches', 'healthy', false, 'yes', 'yes', st_setsrid(st_makepoint(77.6412, 12.9719), 4326), '100 Feet Road, Indiranagar', 'Bengaluru', 'f0000000-0000-4000-8000-000000000001'),
  ('d0000000-0000-4000-8000-000000000007', 'Laila', 'Sweet female, limps slightly on the right front leg.', 'female', 42, 'friendly', 'Cream', 'injured', false, 'yes', 'no', st_setsrid(st_makepoint(77.6435, 12.9731), 4326), '12th Main, Indiranagar', 'Bengaluru', 'f0000000-0000-4000-8000-000000000002'),
  ('d0000000-0000-4000-8000-000000000008', 'Jimmy', 'Energetic, loves the school children.', 'male', 24, 'playful', 'Black and tan', 'healthy', false, 'no', 'unknown', st_setsrid(st_makepoint(77.6398, 12.9698), 4326), 'CMH Road, Indiranagar', 'Bengaluru', 'f0000000-0000-4000-8000-000000000003'),
  ('d0000000-0000-4000-8000-000000000009', 'Chameli', 'Quiet female near the flower market.', 'female', 54, 'calm', 'Golden', 'pregnant', false, 'unknown', 'no', st_setsrid(st_makepoint(77.6457, 12.9744), 4326), 'Defence Colony, Indiranagar', 'Bengaluru', 'f0000000-0000-4000-8000-000000000001'),
  -- HSR Layout cluster
  ('d0000000-0000-4000-8000-000000000010', 'Chotu', 'Small young male, very vocal at night.', 'male', 12, 'playful', 'White', 'healthy', false, 'no', 'no', st_setsrid(st_makepoint(77.6473, 12.9116), 4326), 'Sector 2, HSR Layout', 'Bengaluru', 'f0000000-0000-4000-8000-000000000002'),
  ('d0000000-0000-4000-8000-000000000011', 'Bholu', 'Lazy old male, sleeps by the bakery.', 'male', 108, 'calm', 'Grey muzzle, brown body', 'healthy', false, 'yes', 'yes', st_setsrid(st_makepoint(77.6491, 12.9132), 4326), 'Sector 3, HSR Layout', 'Bengaluru', 'f0000000-0000-4000-8000-000000000002'),
  ('d0000000-0000-4000-8000-000000000012', 'Julie', 'Mother of the Sector 1 puppies, protective but knows feeders.', 'female', 48, 'friendly', 'Black with white socks', 'nursing', true, 'yes', 'no', st_setsrid(st_makepoint(77.6445, 12.9098), 4326), 'Sector 1, HSR Layout', 'Bengaluru', 'f0000000-0000-4000-8000-000000000003'),
  ('d0000000-0000-4000-8000-000000000013', 'Gabbar', 'Large male, barks at bikes. Approach calmly.', 'male', 66, 'aggressive', 'Dark brown', 'healthy', false, 'unknown', 'unknown', st_setsrid(st_makepoint(77.6512, 12.9145), 4326), 'Sector 4, HSR Layout', 'Bengaluru', 'f0000000-0000-4000-8000-000000000001'),
  -- MG Road / Cubbon Park cluster
  ('d0000000-0000-4000-8000-000000000014', 'Simba', 'Confident male, hangs around the boulevard benches.', 'male', 36, 'friendly', 'Golden brown', 'healthy', false, 'yes', 'yes', st_setsrid(st_makepoint(77.6063, 12.9758), 4326), 'MG Road Boulevard', 'Bengaluru', 'f0000000-0000-4000-8000-000000000003'),
  ('d0000000-0000-4000-8000-000000000015', 'Rosy', 'Park regular, loves morning walkers.', 'female', 30, 'friendly', 'Reddish brown', 'healthy', false, 'yes', 'no', st_setsrid(st_makepoint(77.5929, 12.9763), 4326), 'Cubbon Park east gate', 'Bengaluru', 'f0000000-0000-4000-8000-000000000001'),
  ('d0000000-0000-4000-8000-000000000016', 'Shadow', 'Skittish black male, seen at dusk near the bandstand.', 'male', 40, 'fearful', 'All black, white tail tip', 'sick', false, 'no', 'unknown', st_setsrid(st_makepoint(77.5951, 12.9747), 4326), 'Cubbon Park bandstand', 'Bengaluru', 'f0000000-0000-4000-8000-000000000002'),
  -- Jayanagar cluster
  ('d0000000-0000-4000-8000-000000000017', 'Raja', 'Market dog, well fed by shopkeepers.', 'male', 90, 'calm', 'White and brown', 'healthy', false, 'yes', 'yes', st_setsrid(st_makepoint(77.5838, 12.9308), 4326), '4th Block market, Jayanagar', 'Bengaluru', 'f0000000-0000-4000-8000-000000000001'),
  ('d0000000-0000-4000-8000-000000000018', 'Goldie', 'Friendly female outside the library.', 'female', 26, 'friendly', 'Golden', 'healthy', false, 'no', 'no', st_setsrid(st_makepoint(77.5854, 12.9286), 4326), '3rd Block, Jayanagar', 'Bengaluru', 'f0000000-0000-4000-8000-000000000003'),
  ('d0000000-0000-4000-8000-000000000019', 'Veeru', 'Young male, often with Basanti.', 'male', 20, 'playful', 'Tan with black muzzle', 'healthy', false, 'unknown', 'no', st_setsrid(st_makepoint(77.5871, 12.9331), 4326), '5th Block, Jayanagar', 'Bengaluru', 'f0000000-0000-4000-8000-000000000002'),
  ('d0000000-0000-4000-8000-000000000020', 'Basanti', 'Always with Veeru near the temple.', 'female', 22, 'shy', 'Light tan', 'healthy', false, 'unknown', 'no', st_setsrid(st_makepoint(77.5868, 12.9334), 4326), '5th Block, Jayanagar', 'Bengaluru', 'f0000000-0000-4000-8000-000000000002'),
  -- Malleshwaram cluster
  ('d0000000-0000-4000-8000-000000000021', 'Lucky', 'Three-legged but fast. Local favourite.', 'male', 56, 'friendly', 'Brown, missing left hind leg', 'recovering', false, 'yes', 'yes', st_setsrid(st_makepoint(77.5709, 13.0035), 4326), '8th Cross, Malleshwaram', 'Bengaluru', 'f0000000-0000-4000-8000-000000000001'),
  ('d0000000-0000-4000-8000-000000000022', 'Munna', 'Puppy adopted by the street, everyone feeds him.', 'male', 8, 'playful', 'White with brown ears', 'healthy', false, 'no', 'no', st_setsrid(st_makepoint(77.5723, 13.0048), 4326), 'Sampige Road, Malleshwaram', 'Bengaluru', 'f0000000-0000-4000-8000-000000000003'),
  -- Whitefield cluster
  ('d0000000-0000-4000-8000-000000000023', 'Bruno', 'Guard-dog of the tech park parking lot.', 'male', 64, 'calm', 'Black and brown', 'healthy', false, 'yes', 'no', st_setsrid(st_makepoint(77.7500, 12.9698), 4326), 'ITPL Main Road, Whitefield', 'Bengaluru', 'f0000000-0000-4000-8000-000000000002'),
  ('d0000000-0000-4000-8000-000000000024', 'Pintu', 'Small male, rides the security cabin steps.', 'male', 32, 'friendly', 'Fawn', 'healthy', false, 'unknown', 'unknown', st_setsrid(st_makepoint(77.7478, 12.9711), 4326), 'Whitefield Main Road', 'Bengaluru', 'f0000000-0000-4000-8000-000000000001'),
  ('d0000000-0000-4000-8000-000000000025', 'Badal', 'Grey male who appears before rain, hence the name.', 'male', 44, 'shy', 'Grey', 'healthy', false, 'no', 'unknown', st_setsrid(st_makepoint(77.7521, 12.9685), 4326), 'Hope Farm Junction, Whitefield', 'Bengaluru', 'f0000000-0000-4000-8000-000000000003');

-- ---------------------------------------------------------------------------
-- Feedings: mix of green (<24h), yellow (24–72h) and red (>72h / never).
-- Trigger maintains dogs.last_fed_at + counters + activity log.
-- ---------------------------------------------------------------------------
insert into public.feeding_records (dog_id, fed_by, food_type, notes, fed_at)
select
  ('d0000000-0000-4000-8000-0000000000' || lpad(v.dog_no::text, 2, '0'))::uuid,
  v.fed_by::uuid, v.food_type::public.food_type, v.notes,
  now() - (v.hours_ago || ' hours')::interval
from (
  values
    (1,  'f0000000-0000-4000-8000-000000000002', 'dog_food', 'Morning round', 3),
    (2,  'f0000000-0000-4000-8000-000000000001', 'milk', 'For the pups too', 5),
    (3,  'f0000000-0000-4000-8000-000000000002', 'rice', null, 18),
    (4,  'f0000000-0000-4000-8000-000000000003', 'biscuits', null, 30),
    (6,  'f0000000-0000-4000-8000-000000000001', 'dog_food', null, 8),
    (7,  'f0000000-0000-4000-8000-000000000002', 'meat', 'Extra portion, she is healing', 12),
    (8,  'f0000000-0000-4000-8000-000000000003', 'biscuits', null, 40),
    (9,  'f0000000-0000-4000-8000-000000000001', 'dog_food', 'Eating well', 6),
    (10, 'f0000000-0000-4000-8000-000000000002', 'rice', null, 55),
    (11, 'f0000000-0000-4000-8000-000000000002', 'leftovers', 'From the bakery', 26),
    (12, 'f0000000-0000-4000-8000-000000000003', 'dog_food', 'Puppies tried solid food', 4),
    (14, 'f0000000-0000-4000-8000-000000000003', 'biscuits', null, 90),
    (15, 'f0000000-0000-4000-8000-000000000001', 'dog_food', null, 10),
    (17, 'f0000000-0000-4000-8000-000000000001', 'rice', 'Market scraps too', 20),
    (18, 'f0000000-0000-4000-8000-000000000003', 'milk', null, 48),
    (21, 'f0000000-0000-4000-8000-000000000001', 'dog_food', null, 7),
    (22, 'f0000000-0000-4000-8000-000000000003', 'milk', 'Growing fast', 2),
    (23, 'f0000000-0000-4000-8000-000000000002', 'dog_food', null, 36),
    (24, 'f0000000-0000-4000-8000-000000000001', 'biscuits', null, 100)
) as v (dog_no, fed_by, food_type, notes, hours_ago);

-- ---------------------------------------------------------------------------
-- Vaccinations (trigger flips dogs.vaccination_status to 'yes').
-- ---------------------------------------------------------------------------
insert into public.vaccination_records
  (dog_id, vaccine_type, vaccine_name, administered_at, next_due_at, administered_by_text, recorded_by)
select
  ('d0000000-0000-4000-8000-0000000000' || lpad(v.dog_no::text, 2, '0'))::uuid,
  'rabies', 'Raksharab', (now() - (v.months_ago || ' months')::interval)::date,
  (now() + ((12 - v.months_ago) || ' months')::interval)::date,
  v.vet, v.recorded_by::uuid
from (
  values
    (1,  3, 'CUPA mobile clinic', 'f0000000-0000-4000-8000-000000000001'),
    (3,  5, 'BBMP ABC drive', 'f0000000-0000-4000-8000-000000000002'),
    (6,  2, 'CUPA mobile clinic', 'f0000000-0000-4000-8000-000000000001'),
    (7,  7, 'Private vet, Indiranagar', 'f0000000-0000-4000-8000-000000000002'),
    (11, 9, 'BBMP ABC drive', 'f0000000-0000-4000-8000-000000000002'),
    (12, 4, 'CUPA mobile clinic', 'f0000000-0000-4000-8000-000000000003'),
    (14, 6, 'BBMP ABC drive', 'f0000000-0000-4000-8000-000000000003'),
    (15, 1, 'Charlie''s Animal Rescue', 'f0000000-0000-4000-8000-000000000001'),
    (17, 8, 'BBMP ABC drive', 'f0000000-0000-4000-8000-000000000001'),
    (21, 2, 'Charlie''s Animal Rescue', 'f0000000-0000-4000-8000-000000000001'),
    (23, 5, 'Private vet, Whitefield', 'f0000000-0000-4000-8000-000000000002')
) as v (dog_no, months_ago, vet, recorded_by);

-- ---------------------------------------------------------------------------
-- Medical: sterilizations + Laila's injury + Shadow's illness.
-- ---------------------------------------------------------------------------
insert into public.medical_records
  (dog_id, record_type, title, description, observed_health_status, severity, performed_at, recorded_by)
values
  ('d0000000-0000-4000-8000-000000000001', 'sterilization', 'ABC surgery', 'Neutered under BBMP ABC programme, ear notched.', null, null, now() - interval '14 months', 'f0000000-0000-4000-8000-000000000001'),
  ('d0000000-0000-4000-8000-000000000003', 'sterilization', 'ABC surgery', 'Neutered, recovered well.', null, null, now() - interval '20 months', 'f0000000-0000-4000-8000-000000000002'),
  ('d0000000-0000-4000-8000-000000000006', 'sterilization', 'ABC surgery', 'Neutered at CUPA.', null, null, now() - interval '10 months', 'f0000000-0000-4000-8000-000000000001'),
  ('d0000000-0000-4000-8000-000000000011', 'sterilization', 'ABC surgery', 'Neutered years ago, ear notch visible.', null, null, now() - interval '36 months', 'f0000000-0000-4000-8000-000000000002'),
  ('d0000000-0000-4000-8000-000000000014', 'sterilization', 'ABC surgery', 'Neutered.', null, null, now() - interval '8 months', 'f0000000-0000-4000-8000-000000000003'),
  ('d0000000-0000-4000-8000-000000000017', 'sterilization', 'ABC surgery', 'Neutered under ABC drive.', null, null, now() - interval '30 months', 'f0000000-0000-4000-8000-000000000001'),
  ('d0000000-0000-4000-8000-000000000021', 'sterilization', 'ABC surgery', 'Neutered during amputation recovery.', null, null, now() - interval '12 months', 'f0000000-0000-4000-8000-000000000001'),
  ('d0000000-0000-4000-8000-000000000007', 'injury_treatment', 'Front leg sprain', 'Limping on right front leg. Anti-inflammatory given, monitoring.', 'injured', 'medium', now() - interval '2 days', 'f0000000-0000-4000-8000-000000000002'),
  ('d0000000-0000-4000-8000-000000000016', 'treatment', 'Skin infection', 'Patchy fur and scratching — started ivermectin protocol.', 'sick', 'medium', now() - interval '5 days', 'f0000000-0000-4000-8000-000000000002');

-- ---------------------------------------------------------------------------
-- Emergencies: one open critical (hit by vehicle), one in_progress.
-- ---------------------------------------------------------------------------
insert into public.emergency_reports
  (id, dog_id, reported_by, emergency_type, severity, description, location, address_text, status)
values
  ('e0000000-0000-4000-8000-000000000001',
   'd0000000-0000-4000-8000-000000000007', 'f0000000-0000-4000-8000-000000000003',
   'accident', 'critical',
   'Laila was clipped by a two-wheeler near 12th Main. Conscious but not putting weight on the leg. Needs transport to a vet.',
   st_setsrid(st_makepoint(77.6435, 12.9731), 4326), '12th Main, Indiranagar', 'open'),
  ('e0000000-0000-4000-8000-000000000002',
   'd0000000-0000-4000-8000-000000000016', 'f0000000-0000-4000-8000-000000000002',
   'illness', 'medium',
   'Shadow looks weak and is not eating. Possible infection — volunteer en route with medication.',
   st_setsrid(st_makepoint(77.5951, 12.9747), 4326), 'Cubbon Park bandstand', 'in_progress');

-- ---------------------------------------------------------------------------
-- Follows (trigger maintains dogs.followers_count).
-- ---------------------------------------------------------------------------
insert into public.dog_follows (user_id, dog_id)
values
  ('f0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000001'),
  ('f0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000007'),
  ('f0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000012'),
  ('f0000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000002'),
  ('f0000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000022'),
  ('f0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000016');
