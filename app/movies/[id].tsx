import VideoPlayer from "@/components/MoviePlayer";
import { icons } from "@/constants/icons";
import { useGlobalContext } from "@/lib/global-provider"; // <--- 1. Get User
import { fetchMovieDetails } from "@/services/api";
import {
  getSavedMovies,
  removeSavedMovie,
  saveMovie,
} from "@/services/appwrite"; // <--- 2. Get DB Services
import useFetch from "@/services/useFetch";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface MovieInfoProps {
  label: string;
  value?: string | number | null | undefined;
}

const MovieInfo = ({ label, value }: MovieInfoProps) => (
  <View className="flex-col items-start justify-center mt-5">
    <Text className="text-light-200 text-sm font-normal">{label}:</Text>
    <Text className="text-light-200 font-bold text-sm mt-2">
      {value || "N/A"}
    </Text>
  </View>
);

const MovieDetails = () => {
  const { id } = useLocalSearchParams();
  const { user, isLogged } = useGlobalContext(); // Get current user

  const [isSaved, setIsSaved] = useState(false);
  const [savedDocId, setSavedDocId] = useState<string | null>(null); // Store the specific DB Document ID
  const [isSaving, setIsSaving] = useState(false); // Loading state for the button

  const movieId = Array.isArray(id) ? id[0] : id;

  const { data: movie, loading } = useFetch(() =>
    fetchMovieDetails(movieId as string),
  );

  // 1. Check if movie is saved in DB
  useEffect(() => {
    checkIfSaved();
  }, [movieId, user, isLogged]);

  const checkIfSaved = async () => {
    if (!isLogged || !user) {
      setIsSaved(false);
      return;
    }

    try {
      const savedMovies = await getSavedMovies(user.$id);

      // Look for a match
      const match = savedMovies.find(
        (doc: any) => doc.movie_id.toString() === movieId?.toString(),
      );

      if (match) {
        setIsSaved(true);
        setSavedDocId(match.$id); // Save the Document ID so we can delete it later
      } else {
        setIsSaved(false);
        setSavedDocId(null);
      }
    } catch (error) {
      console.log("Error checking saved status:", error);
    }
  };

  // 2. Handle Click
  const toggleSave = async () => {
    // A. Guest Protection
    if (!isLogged || !user) {
      Alert.alert(
        "Login Required",
        "Please login to save movies to your collection.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Login", onPress: () => router.push("/profile") },
        ],
      );
      return;
    }

    if (isSaving || !movie) return;

    setIsSaving(true);
    try {
      if (isSaved && savedDocId) {
        // --- UNSAVE (Delete Document) ---
        const success = await removeSavedMovie(savedDocId);
        if (success) {
          setIsSaved(false);
          setSavedDocId(null);
        } else {
          Alert.alert("Error", "Failed to remove movie.");
        }
      } else {
        // --- SAVE (Create Document) ---
        // We prepare the clean data object
        const movieData = {
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path ?? "", // Ensure string, fallback to empty string
          vote_average: movie.vote_average,
          release_date: movie.release_date,
        };

        const result = await saveMovie(user.$id, movieData);
        if (result) {
          setIsSaved(true);
          setSavedDocId(result.$id); // Capture the new ID immediately
        }
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", "Something went wrong saving the movie.");
    } finally {
      setIsSaving(false);
    }
  };

  const posterUrl = movie?.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : undefined;

  return (
    <View className="bg-primary flex-1">
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View>
          <Image
            source={{ uri: posterUrl }}
            className="w-full h-[550px]"
            resizeMode="stretch"
          />
        </View>

        <View className="flex-col items-start justify-center mt-5 px-5">
          <View className="flex-row justify-between items-center w-full">
            <Text className="text-white text-xl font-bold flex-1 mr-2">
              {movie?.title}
            </Text>

            <TouchableOpacity onPress={toggleSave} disabled={isSaving}>
              {isSaving ? (
                <ActivityIndicator size="small" color="#FACC15" />
              ) : (
                <Image
                  source={icons.save}
                  className="size-8"
                  tintColor={isSaved ? "#FACC15" : "white"}
                />
              )}
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center gap-x-1 mt-2">
            <Text className="text-light-200 text-sm">
              {movie?.release_date?.split("-")[0]}
            </Text>
            <Text className="text-light-200 text-sm">{movie?.runtime} min</Text>
          </View>

          <View className="flex-row items-center bg-dark-100 px-2 py-1 rounded-md gap-x-1 mt-2">
            <Image source={icons.star} className="size-4" />
            <Text className="text-white font-bold text-sm">
              {Math.round(movie?.vote_average ?? 0)}/10
            </Text>
            <Text className="text-light-200 text-sm">
              ({movie?.vote_count} votes)
            </Text>
          </View>

          <MovieInfo label="Overview" value={movie?.overview} />
          <MovieInfo
            label="Genres"
            value={movie?.genres?.map((g) => g.name).join(" - ") || "N/A"}
          />
          <View className="flex-row justify-between w-1/2">
            <MovieInfo
              label="Budget"
              value={`$${(movie?.budget ?? 0) / 1_000_000} millions`}
            />
            <MovieInfo
              label="Revenue"
              value={`$${Math.round((movie?.revenue ?? 0) / 1_000_000)} millions`}
            />
          </View>
          <MovieInfo
            label="Production Companies"
            value={
              movie?.production_companies?.map((c) => c.name).join(" - ") ||
              "N/A"
            }
          />

          <View className="flex-1 mt-5">
            <VideoPlayer movieId={movieId as string} posterUri={posterUrl} />
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        className="absolute bottom-5 left-0 right-0 mx-5 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center z-50"
        onPress={router.back}
      >
        <Image
          source={icons.arrow}
          className="size-5 mr-1 mt-0.5 rotate-180"
          tintColor="#fff"
        />
        <Text className="text-white font-semibold text-base">Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MovieDetails;
