import MovieCard from "@/components/MovieCard";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { useGlobalContext } from "@/lib/global-provider";
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

  useFocusEffect(
    useCallback(() => {
      if (isLogged && user) {
        loadSavedMovies();
      } else {
        setLoading(false);
      }
    }, [isLogged, user]),
  );

  const loadSavedMovies = async () => {
    try {
      setLoading(true);

      const result = await getSavedMovies(user.$id);

      // MAPPING DATA
      const mappedMovies = result.map((doc: any) => ({
        id: doc.movie_id,
        title: doc.title,
        poster_path: doc.poster_path,
        vote_average: doc.vote_average,
        release_date: doc.release_date,
        // 1. CRITICAL ADDITION: Pass the type from DB to the Card
        // If 'type' is missing (old saves), default to 'movie'
        media_type: doc.type || "movie",
      }));

      setSavedMovies(mappedMovies);
    } catch (error) {
      console.error("Error loading saved movies:", error);
    } finally {
      setLoading(false);
    }
  };

  if (isGlobalLoading || (isLogged && loading)) {
    return (
      <View className="flex-1 bg-primary justify-center items-center">
        <ActivityIndicator size="large" color="#FACC15" />
      </View>
    );
  }

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
            onPress={() => router.push("/profile")}
            className="bg-accent px-8 py-4 rounded-xl"
          >
            <Text className="text-primary font-bold text-lg">Go to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
          // 2. The MovieCard will now receive 'media_type' and redirect correctly
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
