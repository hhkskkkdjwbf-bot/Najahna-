const PREFIX = "najahna:";

export function readJSON(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(PREFIX + key) ?? "null");
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
