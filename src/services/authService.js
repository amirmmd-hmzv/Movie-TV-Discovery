import { Account, ID } from "appwrite";
import { appwriteClient } from "@/lib/appwriteClient";

export const account = new Account(appwriteClient);

export const signUp = async (name, email, password) => {
  const user = await account.create(ID.unique(), email, password, name);
  await signIn(email, password);
  return user;
};

export const signIn = async (email, password) => {
  return account.createEmailPasswordSession(email, password);
};

export const signOut = async () => {
  return account.deleteSession("current");
};

export const getCurrentUser = async () => {
  try {
    return await account.get();
  } catch {
    return null;
  }
};
