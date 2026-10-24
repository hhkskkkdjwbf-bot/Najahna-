import { schoolYears } from "../data/curriculum.js";
import { readJSON, writeJSON } from "./storage.js";

const ACCOUNT_KEY = "account-profile";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const AVATAR_COLORS = ["#176b55", "#3457a5", "#8b4b9b", "#a45d20", "#287a8c"];

function createAccountId() {
  const bytes = new Uint8Array(8);
  if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(bytes);
  else for (let index = 0; index < bytes.length; index++) bytes[index] = Math.floor(Math.random() * 256);
  return "NJ-" + [...bytes].map(value => value.toString(16).padStart(2, "0")).join("").toUpperCase();
}

function cleanString(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function getAccountProfile() {
  const profile = readJSON(ACCOUNT_KEY, null);
  if (!profile || typeof profile !== "object" || Array.isArray(profile)) return null;
  if (typeof profile.id !== "string" || !/^NJ-[A-F0-9]{16}$/.test(profile.id)) return null;
  const email = cleanString(profile.email, 254).toLowerCase();
  if (email && !EMAIL_PATTERN.test(email)) return null;
  const gradeId = typeof profile.gradeId === "string" && schoolYears.some(year => year.id === profile.gradeId) ? profile.gradeId : "";
  const name = cleanString(profile.name, 60);
  const avatarColor = AVATAR_COLORS.includes(profile.avatarColor) ? profile.avatarColor : AVATAR_COLORS[0];
  return {
    id: profile.id,
    name,
    email,
    gradeId,
    avatarColor,
    createdAt: typeof profile.createdAt === "string" ? profile.createdAt : "",
    updatedAt: typeof profile.updatedAt === "string" ? profile.updatedAt : ""
  };
}

export function saveAccountProfile(input) {
  const previous = getAccountProfile();
  const name = cleanString(input?.name, 60);
  const email = cleanString(input?.email, 254).toLowerCase();
  const gradeId = cleanString(input?.gradeId, 80);
  const avatarColor = cleanString(input?.avatarColor, 20);
  if (!name) throw new TypeError("Enter a display name.");
  if (email && !EMAIL_PATTERN.test(email)) throw new TypeError("Enter a valid email address.");
  if (gradeId && !schoolYears.some(year => year.id === gradeId)) throw new TypeError("Choose a valid school year.");
  if (avatarColor && !AVATAR_COLORS.includes(avatarColor)) throw new TypeError("Choose a supported avatar color.");
  const now = new Date().toISOString();
  const profile = {
    id: previous?.id || createAccountId(),
    name,
    email,
    gradeId,
    avatarColor: avatarColor || previous?.avatarColor || AVATAR_COLORS[0],
    createdAt: previous?.createdAt || now,
    updatedAt: now
  };
  if (!writeJSON(ACCOUNT_KEY, profile)) throw new Error("Could not save the local profile.");
  return profile;
}

export function deleteAccountProfile() {
  try {
    localStorage.removeItem("najahna:" + ACCOUNT_KEY);
    return true;
  } catch {
    return false;
  }
}

export function getAvatarInitials(name) {
  const words = cleanString(name, 60).split(/\s+/).filter(Boolean);
  if (!words.length) return "N";
  return words.slice(0, 2).map(word => [...word][0].toLocaleUpperCase()).join("");
}

export function isValidAccountEmail(email) {
  const value = cleanString(email, 254);
  return !value || EMAIL_PATTERN.test(value);
}

export const accountAvatarColors = AVATAR_COLORS;
