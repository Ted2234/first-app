import {
    Account,
    Avatars,
    Client,
    Databases,
    ID,
    Query,
} from "react-native-appwrite";

export const config = {
  platform: "com.jsm.firstapp",
  endpoint: "https://fra.cloud.appwrite.io/v1",
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
  collectionId: process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!,
  savedCollectionId: process.env.EXPO_PUBLIC_APPWRITE_SAVED_COLLECTION_ID!,
};

// 1. WEB CLIENT SETUP
// CRITICAL: We do NOT use setPlatform() here.
// Browsers must be identified by their URL (localhost), not a Bundle ID.
const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.projectId);

const account = new Account(client);
const avatars = new Avatars(client);
const database = new Databases(client);

// 2. AUTH FUNCTIONS
export const register = async (
  email: string,
  password: string,
  username: string,
) => {
  try {
    await account.create(ID.unique(), email, password, username);
    return await signIn(email, password);
  } catch (error: any) {
    console.error("Register Error:", error);
    throw new Error(error.message);
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    // Check for existing session to prevent 401 errors
    try {
      const active = await account.getSession("current");
      if (active) return active;
    } catch (e) {
      // No session exists, proceed to login
    }

    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (error: any) {
    console.error("Login Error:", error);
    throw new Error(error.message);
  }
};

export const signOut = async () => {
  try {
    await account.deleteSession("current");
  } catch (error) {
    console.log("Already signed out");
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();

    // Fallback avatar if name is missing
    const avatar = avatars
      .getInitials(currentAccount.name || "User")
      .toString();

    return {
      $id: currentAccount.$id,
      username: currentAccount.name,
      email: currentAccount.email,
      avatar: currentAccount.prefs?.avatar || avatar,
    };
  } catch (error) {
    // CRITICAL: Swallow error so the app doesn't crash on guest mode
    return null;
  }
};

// 3. DATABASE FUNCTIONS
export const saveMovie = async (userId: string, movieData: any) => {
  try {
    const result = await database.createDocument(
      config.databaseId,
      config.savedCollectionId,
      ID.unique(),
      {
        user_id: userId,
        movie_id: movieData.id,
        title: movieData.title,
        poster_path: movieData.poster_path,
        vote_average: movieData.vote_average,
        release_date: movieData.release_date,
        type: movieData.type || "movie",
      },
    );
    return result;
  } catch (error: any) {
    console.error(error);
    throw new Error(error.message);
  }
};

export const getSavedMovies = async (userId: string) => {
  try {
    const result = await database.listDocuments(
      config.databaseId,
      config.savedCollectionId,
      [Query.equal("user_id", userId), Query.orderDesc("$createdAt")],
    );
    return result.documents;
  } catch (error: any) {
    return [];
  }
};

export const removeSavedMovie = async (documentId: string) => {
  try {
    await database.deleteDocument(
      config.databaseId,
      config.savedCollectionId,
      documentId,
    );
    return true;
  } catch (error: any) {
    return false;
  }
};

export const getTrendingMovies = async () => {
  try {
    const result = await database.listDocuments(
      config.databaseId,
      config.collectionId,
      [Query.orderDesc("count"), Query.limit(5), Query.equal("type", "movie")],
    );
    return result.documents;
  } catch (error) {
    return undefined;
  }
};

export const getTrendingTV = async () => {
  try {
    const result = await database.listDocuments(
      config.databaseId,
      config.collectionId,
      [Query.orderDesc("count"), Query.limit(5), Query.equal("type", "tv")],
    );
    return result.documents;
  } catch (error) {
    return undefined;
  }
};

export const updateSearchCount = async (query: string, movies: any) => {
  try {
    const result = await database.listDocuments(
      config.databaseId,
      config.collectionId,
      [
        Query.equal("searchTerm", query),
        Query.equal("type", movies.media_type || "movie"),
      ],
    );

    if (result.documents.length > 0) {
      await database.updateDocument(
        config.databaseId,
        config.collectionId,
        result.documents[0].$id,
        { count: result.documents[0].count + 1 },
      );
    } else {
      await database.createDocument(
        config.databaseId,
        config.collectionId,
        ID.unique(),
        {
          searchTerm: query,
          type: movies.media_type || "movie",
          movie_id: movies.id,
          count: 1,
          title: movies.title,
          poster_url: `https://image.tmdb.org/t/p/w500${movies.poster_path}`,
        },
      );
    }
  } catch (error) {
    console.log(error);
  }
};
