import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_API_KEY;


if (!supabaseUrl) {
  throw new Error("supabaseUrl NO está llegando desde .env");
}

if (!supabaseKey) {
  throw new Error("supabaseKey NO está llegando desde .env");
}

export const supabase = createClient(supabaseUrl, supabaseKey);