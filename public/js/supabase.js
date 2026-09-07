import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const supabase = createClient(
  'https://kfyixpqiqlwocemedd.supabase.co',
  'YOUR_ANON_KEY_HERE'
);
