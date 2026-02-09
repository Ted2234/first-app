import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { useGlobalContext } from "@/lib/global-provider";
import { getSavedMovies } from "@/services/appwrite";
import useFetch from "@/services/useFetch";
import { Link, useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import "../global.css";

// Reusing the high-quality Web Card component
const SavedCardWeb = ({ movie }: any) => {
  return (
    <Link href={`/movies/${movie.movie_id}`} asChild>
      <TouchableOpacity className="w-full group cursor-pointer">
        <View className="w-full h-[280px] rounded-xl overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-105">
          <Image
            source={{
              uri: movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : "https://placeholder.co/600x400/1a1a1a/ffffff/png",
            }}
            className="w-full h-full bg-dark-200"
            resizeMode="cover"
          />
        </View>

        <View className="mt-3">
          <Text
            className="text-white font-bold text-base group-hover:text-accent transition-colors"
            numberOfLines={1}
          >
            {movie.title}
          </Text>

          <View className="flex-row items-center justify-between mt-1 opacity-80">
            <View className="flex-row items-center">
              <Image
                source={icons.star}
                className="size-4 mr-1"
                tintColor="#FACC15"
              />
              <Text className="text-white text-xs font-bold">
                {Math.round(movie.vote_average)}/10
              </Text>
            </View>
            <Text className="text-light-300 text-xs font-medium">
              {movie.release_date?.split("-")[0] || "N/A"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

export default function SavedWeb() {
  const { user, loading: userLoading } = useGlobalContext();

  const {
    data: savedMovies,
    loading: moviesLoading,
    error,
    refetch,
  } = useFetch(() => getSavedMovies(user?.$id), false);

  // Auto-refetch when tab is focused so data stays fresh
  useFocusEffect(
    useCallback(() => {
      if (user) refetch();
    }, [user]),
  );

  if (userLoading || moviesLoading) {
    return (
      <View className="flex-1 bg-primary items-center justify-center min-h-screen">
        <ActivityIndicator size="large" color="#AB8BFF" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-primary min-h-screen">
      <Image
        source={images.bg}
        className="absolute top-0 left-0 w-full h-full opacity-50 z-0"
        resizeMode="cover"
      />

      <ScrollView
        className="flex-1 z-10"
        contentContainerStyle={{ paddingBottom: 150 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-[1400px] mx-auto px-10 mt-12">
          <Text className="text-white text-3xl font-bold mb-8">
            My Collection
          </Text>

          {!user ? (
            <View className="items-center justify-center h-[50vh]">
              <Text className="text-white text-lg">
                Please login to view saved movies.
              </Text>
            </View>
          ) : error ? (
            <Text className="text-red-500">Error loading movies</Text>
          ) : savedMovies?.length === 0 ? (
            <View className="items-center justify-center h-[50vh]">
              <Text className="text-light-200 text-lg">
                No movies saved yet.
              </Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap gap-8 justify-center sm:justify-start">
              {savedMovies?.map((movie: any) => (
                <View key={movie.movie_id} className="w-[180px]">
                  <SavedCardWeb movie={movie} />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
