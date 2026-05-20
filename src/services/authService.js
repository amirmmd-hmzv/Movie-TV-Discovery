/**
 * authService.js
 * Appwrite Auth — کامل‌ترین روش با email/password
 */
import { Client, Account, ID } from "appwrite";

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const account = new Account(client);

// ── Sign Up ──────────────────────────────
export const signUp = async (name, email, password) => {
  const user = await account.create(ID.unique(), email, password, name);
  // بعد از ثبت‌نام، مستقیم لاگین کن
  await signIn(email, password);
  return user;
};

// ── Sign In ──────────────────────────────
export const signIn = async (email, password) => {
  return await account.createEmailPasswordSession(email, password);
};

// ── Logout ───────────────────────────────
export const signOut = async () => {
  return await account.deleteSession("current");
};

// ── Get current user ─────────────────────
export const getCurrentUser = async () => {
  try {
    return await account.get();
  } catch {
    return null;
  }
};