// track searches made by user
import "node-appwrite";
import { ID, Query } from "react-native-appwrite";

export const config = {
  platform: "com.jsm.firstapp",
  endpoint: "https://fra.cloud.appwrite.io/v1",
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
  collectionId: process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!,
  savedCollectionId: process.env.EXPO_PUBLIC_APPWRITE_SAVED_COLLECTION_ID!,
};

const sdk = require("node-appwrite");

const client = new sdk.Client()
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setSelfSigned(true);

const database = new sdk.Databases(client);
const account = new sdk.Account(client);
const avatars = new sdk.Avatars(client);

export const register = async (
  email: string,
  password: string,
  username: string,
) => {
  try {
    // 1. Create the Auth Account (Native)
    // The 4th argument 'username' sets the native Name field
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username,
    );

    if (!newAccount) throw new Error("Account creation failed");

    // 2. Auto Login
    await signIn(email, password);

    // 3. Save Avatar to "Preferences" (Native feature)
    // We don't need a DB collection for this anymore!
    const avatarUrl = avatars.getInitials(username).toString();
    await account.updatePrefs({
      avatar: avatarUrl,
    });
    return newAccount;
  } catch (error: any) {
    console.error("Register Error:", error);
    throw new Error(error.message);
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    try {
      await account.deleteSession("current");
    } catch (e) {
      /* Ignore */
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
    const session = await account.deleteSession("current");
    return session;
  } catch (error: any) {
    console.error(error);
    throw new Error(error.message);
  }
};

export const getCurrentUser = async () => {
  try {
    // 1. Get the Native Account
    const currentAccount = await account.get();

    if (!currentAccount) return null;

    // 2. Format it to match your app's expectations
    // We pull the avatar from 'prefs' or generate a default one
    return {
      $id: currentAccount.$id,
      username: currentAccount.name,
      email: currentAccount.email,
      avatar:
        currentAccount.prefs?.avatar ||
        avatars.getInitials(currentAccount.name).toString(),
    };
  } catch (error) {
    console.log(error);
    return null;
  }
};

interface MovieData {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
}

export const saveMovie = async (userId: string, movie: MovieData) => {
  try {
    const result = await database.createDocument(
      config.databaseId,
      config.savedCollectionId,
      ID.unique(),
      {
        user_id: userId,
        movie_id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
        release_date: movie.release_date,
      },
    );
    return result;
  } catch (error: any) {
    console.error("Error saving movie:", error);
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
    console.error("Error fetching saved:", error);
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
    console.error("Error removing movie:", error);
    return false;
  }
};

export const updateSearchCount = async (query: string, movies: Movie) => {
  try {
    const result = await database.listDocuments({
      databaseId: config.databaseId,
      collectionId: config.collectionId,
      queries: [Query.equal("searchTerm", query)],
    });

    if (result.documents.length > 0) {
      const existingMovie = result.documents[0];

      await database.updateDocument({
        databaseId: config.databaseId,
        collectionId: config.collectionId,
        documentId: existingMovie.$id,
        data: {
          count: existingMovie.count + 1,
        },
      });
    } else {
      await database.createDocument(
        config.databaseId,
        config.collectionId,
        ID.unique(),
        {
          searchTerm: query,
          movie_id: movies.id,
          count: 1,
          title: movies.title,
          poster_url: `https://image.tmdb.org/t/p/w500${movies.poster_path}`,
        },
      );
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getTrendingMovies = async (): Promise<
  TrendingMovie[] | undefined
> => {
  try {
    const result = await database.listDocuments({
      databaseId: config.databaseId,
      collectionId: config.collectionId,
      queries: [Query.orderDesc("count"), Query.limit(5)],
    });
    return result.documents as unknown as TrendingMovie[];
  } catch (error) {
    console.log(error);
    return undefined;
  }
};
