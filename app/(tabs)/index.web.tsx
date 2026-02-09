import SearchBar from "@/components/SearchBar";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { fetchMovies } from "@/services/api";
import { getTrendingMovies } from "@/services/appwrite";
import useFetch from "@/services/useFetch";
import { Link, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import "../global.css";

// --- 1. LOCAL WEB CARD COMPONENTS ---

const MovieCardWeb = ({
  id,
  poster_path,
  title,
  vote_average,
  release_date,
}: any) => {
  return (
    <Link href={`/movies/${id}`} asChild>
      <TouchableOpacity className="w-full group cursor-pointer">
        {/* Poster with Hover Scale */}
        <View className="w-full h-[280px] rounded-xl overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-105">
          <Image
            source={{
              uri: poster_path
                ? `https://image.tmdb.org/t/p/w500${poster_path}`
                : "https://placeholder.co/600x400/1a1a1a/ffffff/png",
            }}
            className="w-full h-full bg-dark-200"
            resizeMode="cover"
          />
        </View>

        {/* Info Section */}
        <View className="mt-3">
          <Text
            className="text-white font-bold text-base group-hover:text-accent transition-colors"
            numberOfLines={1}
          >
            {title}
          </Text>

          <View className="flex-row items-center justify-between mt-1 opacity-80">
            <View className="flex-row items-center">
              <Image
                source={icons.star}
                className="size-4 mr-1"
                tintColor="#FACC15"
              />
              <Text className="text-white text-xs font-bold">
                {Math.round(vote_average / 2)}/5
              </Text>
            </View>

            <Text className="text-light-300 text-xs font-medium">
              {release_date?.split("-")[0] || "N/A"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

// FIX: New Gradient Number Style
const TrendingCardWeb = ({ movie, index }: any) => {
  return (
    <Link href={`/movies/${movie.movie_id}`} asChild>
      <TouchableOpacity className="w-[160px] relative group cursor-pointer mr-8">
        {/* Poster */}
        <View className="w-full h-[240px] rounded-xl overflow-hidden shadow-xl transition-transform duration-300 group-hover:scale-105">
          <Image
            source={{
              uri:
                movie.poster_url ||
                `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            }}
            className="w-full h-full bg-dark-200"
            resizeMode="cover"
          />
        </View>

        {/* WEB GRADIENT NUMBER */}
        <View className="absolute -bottom-5 -left-3 z-20">
          <Text
            style={{
              fontSize: 90,
              lineHeight: 100,
              fontWeight: "900",
              // @ts-ignore: Web-specific styles to create the Masked Gradient effect
              backgroundImage:
                "linear-gradient(180deg, #FFFFFF 20%, #AB8BFF 100%)",
              backgroundClip: "text",
              color: "transparent", // Fallback
              filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.5))", // Subtle shadow for legibility
            }}
            className="font-black italic tracking-tighter"
          >
            {index + 1}
          </Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

// --- 2. MAIN PAGE ---

export default function IndexWeb() {
  const router = useRouter();

  const {
    data: trendingMovies,
    loading: trendingLoading,
    error: trendingError,
  } = useFetch(getTrendingMovies, true);

  const {
    data: movies,
    loading: moviesLoading,
    error: moviesError,
  } = useFetch(() => fetchMovies({ query: "" }), true);

  if (moviesLoading || trendingLoading) {
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
        className="fixed top-0 left-0 w-full h-full opacity-50 z-0 size-fit"
        resizeMode="stretch"
      />

      <ScrollView
        className="flex-1 z-10"
        contentContainerStyle={{ paddingBottom: 150 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full mt-12 mb-10 items-center justify-center">
          <Image
            source={icons.logo}
            className="w-24 h-24 mb-6"
            resizeMode="contain"
          />
          <View className="w-full max-w-xl px-4 z-50">
            <SearchBar
              onPress={() => router.push("/search")}
              placeholder="Search for a movie..."
              value=""
              onChangeText={() => {}}
            />
          </View>
        </View>

        {trendingMovies && trendingMovies.length > 0 && (
          <View className="w-full max-w-[1400px] mx-auto px-10 mb-16">
            <Text className="text-white text-2xl font-bold mb-6 ml-2">
              Trending Now
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="pl-2 py-4"
            >
              {trendingMovies.map((movie: any, index: number) => (
                <TrendingCardWeb
                  key={movie.movie_id || index}
                  movie={movie}
                  index={index}
                />
              ))}
            </ScrollView>
          </View>
        )}

        <View className="w-full max-w-[1400px] mx-auto px-10">
          <Text className="text-white text-2xl font-bold mb-8 ml-2">
            Latest Movies
          </Text>

          <View className="flex-row flex-wrap justify-center gap-8">
            {movies?.map((movie: any) => (
              <View key={movie.id} className="w-[180px]">
                <MovieCardWeb {...movie} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
