import { Client } from "appwrite";

const ENDPOINT =
  import.meta.env.VITE_APPWRITE_ENDPOINT ||
  "https://fra.cloud.appwrite.io/v1";

export const appwriteClient = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const APPWRITE_DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
export const APPWRITE_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
export const APPWRITE_WATCHLIST_COLLECTION_ID = import.meta.env
  .VITE_APPWRITE_WATCHLIST_COLLECTION_ID;
