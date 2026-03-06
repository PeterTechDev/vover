import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Using untyped client — types are enforced at the db.ts layer
// TODO: regenerate types with `supabase gen types typescript` once CLI is set up
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
