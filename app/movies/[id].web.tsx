import { icons } from "@/constants/icons";
import { useGlobalContext } from "@/lib/global-provider";
import { fetchMovieDetails } from "@/services/api"; // Removed fetchMovieCredits
import {
  getSavedMovies,
  removeSavedMovie,
  saveMovie,
} from "@/services/appwrite";
import useFetch from "@/services/useFetch";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import "../global.css";

export default function MovieDetailsWeb() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useGlobalContext();

  // 1. Fetch Data (Only Details)
  const { data: movie, loading: movieLoading } = useFetch(
    () => fetchMovieDetails(id as string),
    true,
  );

  // 2. Save State
  const [isSaved, setIsSaved] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Check if already saved
  useEffect(() => {
    if (user && movie) {
      checkSavedStatus();
    }
  }, [user, movie]);

  const checkSavedStatus = async () => {
    // FIX: Stop immediately if user OR movie are missing
    if (!user?.$id || !movie?.id) return;

    try {
      const savedDocs = await getSavedMovies(user.$id);

      // Now it's safe to use movie.id because we checked it above
      const exists = savedDocs.find((doc: any) => doc.movie_id === movie.id);

      if (exists) {
        setIsSaved(true);
        setSavedId(exists.$id);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const toggleSave = async () => {
    if (!user) return alert("Please login to save movies");
    setIsSaving(true);
    try {
      if (isSaved && savedId) {
        await removeSavedMovie(savedId);
        setIsSaved(false);
        setSavedId(null);
      } else {
        const result = await saveMovie(user.$id, { ...movie, type: "movie" });
        setIsSaved(true);
        setSavedId(result.$id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  if (movieLoading || !movie) {
    return (
      <View className="flex-1 bg-primary items-center justify-center min-h-screen">
        <ActivityIndicator size="large" color="#AB8BFF" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-primary min-h-screen">
      {/* Background with Gradient Overlay */}
      <Image
        source={{
          uri: `https://image.tmdb.org/t/p/original${movie.backdrop_path}`,
        }}
        className="top-0 left-0 w-full h-full opacity-30 fixed"
        resizeMode="cover"
        blurRadius={10}
      />
      <View className="absolute top-0 left-0 w-full h-full bg-primary/60" />

      <ScrollView
        className="flex-1 z-10"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute top-8 left-8 z-50 bg-dark-200/50 p-3 rounded-full hover:bg-accent/20 transition-colors"
        >
          <Image
            source={icons.arrow}
            className="size-6 rotate-180"
            tintColor="white"
          />
        </TouchableOpacity>

        <View className="max-w-7xl mx-auto w-full px-4 pt-20">
          {/* --- VIDEO PLAYER SECTION --- */}
          <View className="w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 mb-10 relative group">
            {/* @ts-ignore */}
            <iframe
              src={`https://vidsrc.to/embed/movie/${movie.id}`}
              width="100%"
              height="100%"
              allowFullScreen
              style={{ border: "none" }}
            />
          </View>

          {/* --- INFO SECTION --- */}
          <View className="flex-row flex-wrap gap-10">
            {/* Left: Poster & Actions */}
            <View className="w-full md:w-[300px] items-center md:items-start">
              <Image
                source={{
                  uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                }}
                className="w-[300px] h-[450px] rounded-2xl shadow-xl mb-6"
                resizeMode="cover"
              />

              <TouchableOpacity
                onPress={toggleSave}
                disabled={isSaving}
                className={`w-full py-4 rounded-xl flex-row items-center justify-center border transition-all ${
                  isSaved
                    ? "bg-accent border-accent"
                    : "bg-transparent border-white/20 hover:bg-white/10"
                }`}
              >
                <Image
                  source={icons.save}
                  className="size-6 mr-2"
                  tintColor={isSaved ? "#030014" : "white"}
                />
                <Text
                  className={`font-bold text-lg ${isSaved ? "text-dark-200" : "text-white"}`}
                >
                  {isSaved ? "Saved" : "Add to List"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Right: Details */}
            <View className="flex-1 min-w-[300px]">
              <Text className="text-5xl font-black text-white mb-4 tracking-tight">
                {movie.title}
              </Text>

              <View className="flex-row items-center gap-4 mb-8">
                <View className="bg-accent px-3 py-1 rounded-md">
                  <Text className="text-dark-200 font-bold">
                    {movie.release_date?.split("-")[0]}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Image
                    source={icons.star}
                    className="size-5 mr-1"
                    tintColor="#FACC15"
                  />
                  <Text className="text-white font-bold text-lg">
                    {Math.round(movie.vote_average * 10) / 10}
                  </Text>
                </View>
                <Text className="text-light-200">{movie.runtime} min</Text>
              </View>

              <View className="flex-row flex-wrap gap-2 mb-8">
                {movie.genres?.map((g: any) => (
                  <View
                    key={g.id}
                    className="border border-white/20 px-4 py-2 rounded-full"
                  >
                    <Text className="text-light-100 text-sm">{g.name}</Text>
                  </View>
                ))}
              </View>

              <Text className="text-light-100 text-lg leading-8 mb-10 font-light">
                {movie.overview}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
