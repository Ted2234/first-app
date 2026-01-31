import MovieCard from "@/components/MovieCard";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { useGlobalContext } from "@/lib/global-provider"; // <--- 1. Get User Context
import { getSavedMovies } from "@/services/appwrite";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import "../global.css";

export default function Saved() {
  const { user, isLogged, loading: isGlobalLoading } = useGlobalContext();
  const [savedMovies, setSavedMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Reload the list whenever the user navigates to this screen
  useFocusEffect(
    useCallback(() => {
      if (isLogged && user) {
        loadSavedMovies();
      } else {
        setLoading(false); // Stop loading if guest
      }
    }, [isLogged, user]),
  );

  const loadSavedMovies = async () => {
    try {
      setLoading(true);

      // Fetch from Appwrite Database
      const result = await getSavedMovies(user.$id);

      // 4. DATA MAPPING
      // The DB returns 'movie_id', but MovieCard expects 'id'.
      // We map the data to match the component's needs.
      const mappedMovies = result.map((doc: any) => ({
        id: doc.movie_id, // <--- CRITICAL FIX
        title: doc.title,
        poster_path: doc.poster_path,
        vote_average: doc.vote_average,
        release_date: doc.release_date,
      }));

      setSavedMovies(mappedMovies);
    } catch (error) {
      console.error("Error loading saved movies:", error);
    } finally {
      setLoading(false);
    }
  };

  // 5. LOADING STATE
  if (isGlobalLoading || (isLogged && loading)) {
    return (
      <View className="flex-1 bg-primary justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // 6. GUEST STATE (Not Logged In)
  if (!isLogged) {
    return (
      <View className="flex-1 bg-primary">
        <View className="flex-1 justify-center items-center">
          <Image
            source={images.bg}
            className="absolute w-full h-full z-0"
            resizeMode="cover"
          />
          <Image
            source={icons.save}
            className="size-20 mb-5"
            tintColor="#6b7280"
          />
          <Text className="text-white text-2xl font-bold mb-2">
            Login Required
          </Text>
          <Text className="text-gray-400 text-center mb-8 p-5">
            Please sign in to view and sync your saved movies across devices.
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/profile")} // Send to Profile Tab
            className="bg-accent px-8 py-4 rounded-xl"
          >
            <Text className="text-primary font-bold text-lg">Go to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 7. USER STATE (Logged In)
  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="absolute w-full h-full z-0"
        resizeMode="cover"
      />

      <View className="flex-1 px-5">
        <Image source={icons.logo} className="w-12 h-10 mt-20 mb-5 mx-auto" />

        <Text className="text-xl font-bold text-white mb-5">
          My Saved Movies
        </Text>

        <FlatList
          data={savedMovies}
          renderItem={({ item }) => <MovieCard {...item} />}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          columnWrapperStyle={{
            justifyContent: "flex-start",
            gap: 20,
            paddingRight: 5,
            marginBottom: 10,
          }}
          contentContainerStyle={{
            paddingBottom: 100,
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View className="flex justify-center items-center mt-20 gap-5">
              <Image
                source={icons.save}
                className="size-16"
                tintColor="#6b7280"
              />
              <Text className="text-gray-500 text-base font-medium">
                You haven't saved any movies yet.
              </Text>
            </View>
          )}
        />
      </View>
    </View>
  );
}
