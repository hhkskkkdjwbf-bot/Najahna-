import { supabaseConfig, isSupabaseConfigured } from "../config/supabase.js";

let clientPromise;
async function getClient() {
  if (!isSupabaseConfigured()) throw new Error("CLOUD_ACCOUNT_NOT_CONFIGURED");
  if (!clientPromise) clientPromise = import("https://esm.sh/@supabase/supabase-js@2").then(({ createClient }) =>
    createClient(supabaseConfig.url, supabaseConfig.anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      global: { headers: { "X-Client-Info": "najahna-web" } }
    })
  ).catch(error => { clientPromise = null; throw error; });
  return clientPromise;
}

export function cloudAccountConfigured() { return isSupabaseConfigured(); }

export async function registerCloudAccount({ email, password, displayName, gradeId }) {
  const client = await getClient();
  const redirectTo = new URL("./", window.location.href).href;
  const { data, error } = await client.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: { emailRedirectTo: redirectTo, data: { display_name: displayName.trim().slice(0, 60), grade_id: gradeId || "" } }
  });
  if (error) throw error;
  return { user: data.user, session: data.session, needsEmailVerification: !data.session };
}

export async function signInCloudAccount({ email, password }) {
  const client = await getClient();
  const { data, error } = await client.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
  if (error) throw error;
  return data;
}

export async function signOutCloudAccount() {
  const client = await getClient();
  const { error } = await client.auth.signOut({ scope: "local" });
  if (error) throw error;
}

export async function sendPasswordReset(email) {
  const client = await getClient();
  const redirectTo = new URL("./#reset-password", window.location.href).href;
  const { error } = await client.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo });
  if (error) throw error;
}

export async function updateCloudPassword(password) {
  const client = await getClient();
  const { data, error } = await client.auth.updateUser({ password });
  if (error) throw error;
  return data;
}

export async function getCloudSession() {
  const client = await getClient();
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function onCloudAuthStateChange(callback) {
  const client = await getClient();
  const { data } = client.auth.onAuthStateChange((event, session) => callback(event, session));
  return () => data.subscription.unsubscribe();
}

function getLocalStudyData(storage = globalThis.localStorage) {
  const entries = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key?.startsWith("najahna:") && key !== "najahna:account-profile") {
      const value = storage.getItem(key);
      if (typeof value === "string") entries.push([key, value]);
    }
  }
  return entries;
}

export async function uploadLocalStudyData() {
  const client = await getClient();
  const session = await getCloudSession();
  if (!session?.user?.id) throw new Error("AUTHENTICATION_REQUIRED");
  const entries = getLocalStudyData();
  const { error } = await client.from("learner_data").upsert({
    user_id: session.user.id,
    data: entries,
    updated_at: new Date().toISOString()
  }, { onConflict: "user_id" });
  if (error) throw error;
  return { count: entries.length };
}

export async function downloadCloudStudyData() {
  const client = await getClient();
  const session = await getCloudSession();
  if (!session?.user?.id) throw new Error("AUTHENTICATION_REQUIRED");
  const { data, error } = await client.from("learner_data").select("data,updated_at").eq("user_id", session.user.id).maybeSingle();
  if (error) throw error;
  if (!data) return { count: 0, updatedAt: null };
  if (!Array.isArray(data.data) || data.data.length > 20000) throw new Error("INVALID_CLOUD_BACKUP");
  const entries = [];
  const seen = new Set();
  for (const entry of data.data) {
    if (!Array.isArray(entry) || entry.length !== 2 || typeof entry[0] !== "string" ||
        !entry[0].startsWith("najahna:") || entry[0] === "najahna:account-profile" ||
        typeof entry[1] !== "string" || seen.has(entry[0]) || entry[0].length > 200) {
      throw new Error("INVALID_CLOUD_BACKUP");
    }
    // Validate JSON before touching existing local data.
    JSON.parse(entry[1]);
    seen.add(entry[0]);
    entries.push(entry);
  }
  const storage = globalThis.localStorage;
  const previous = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key?.startsWith("najahna:") && key !== "najahna:account-profile") previous.push([key, storage.getItem(key)]);
  }
  try {
    previous.forEach(([key]) => storage.removeItem(key));
    entries.forEach(([key, value]) => storage.setItem(key, value));
  } catch (error) {
    try {
      for (let index = storage.length - 1; index >= 0; index -= 1) {
        const key = storage.key(index);
        if (key?.startsWith("najahna:") && key !== "najahna:account-profile") storage.removeItem(key);
      }
      previous.forEach(([key, value]) => storage.setItem(key, value));
    } catch { /* best-effort rollback if browser storage is full */ }
    throw new Error("LOCAL_STORAGE_RESTORE_FAILED", { cause: error });
  }
  return { count: entries.length, updatedAt: data.updated_at };
}

export async function deleteCloudAccount() {
  const client = await getClient();
  const { data, error: sessionError } = await client.auth.getSession();
  if (sessionError) throw sessionError;
  if (!data.session?.access_token) throw new Error("AUTHENTICATION_REQUIRED");
  const response = await fetch(`${supabaseConfig.url}/functions/v1/delete-account`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": supabaseConfig.anonKey,
      "Authorization": `Bearer ${data.session.access_token}`
    },
    body: JSON.stringify({ confirm: true })
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || "ACCOUNT_DELETION_FAILED");
  }
  await client.auth.signOut({ scope: "local" });
  return true;
}
