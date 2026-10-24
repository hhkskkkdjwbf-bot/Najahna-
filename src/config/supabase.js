// Public Supabase project settings. The anon/publishable key is designed for browser use.
// NEVER put a service-role key or other secret in this file.
export const supabaseConfig = Object.freeze({
  url: "",
  anonKey: ""
});
export const isSupabaseConfigured = () =>
  /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(supabaseConfig.url) &&
  typeof supabaseConfig.anonKey === "string" &&
  supabaseConfig.anonKey.length > 20;
