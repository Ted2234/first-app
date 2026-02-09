import SearchBar from "@/components/SearchBar";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { fetchShows } from "@/services/api";
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

// --- 1. LOCAL WEB CARD COMPONENTS (Reused for Consistency) ---

const TVCardWeb = ({
  id,
  poster_path,
  title,
  vote_average,
  release_date,
}: any) => {
  return (
    <Link href={`/tv/${id}`} asChild>
      <TouchableOpacity className="w-full group cursor-pointer">
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

const TrendingTVWeb = ({ movie, index }: any) => {
  return (
    <Link href={`/tv/${movie.id}`} asChild>
      <TouchableOpacity className="w-[160px] relative group cursor-pointer mr-8">
        <View className="w-full h-[240px] rounded-xl overflow-hidden shadow-xl transition-transform duration-300 group-hover:scale-105">
          <Image
            source={{
              uri: movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : "https://placeholder.co/400",
            }}
            className="w-full h-full bg-dark-200"
            resizeMode="cover"
          />
        </View>

        <View className="absolute -bottom-5 -left-3 z-20">
          <Text
            style={{
              fontSize: 90,
              lineHeight: 100,
              fontWeight: "900",
              // @ts-ignore
              backgroundImage:
                "linear-gradient(180deg, #FFFFFF 20%, #AB8BFF 100%)",
              backgroundClip: "text",
              color: "transparent",
              filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.5))",
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

export default function ShowsWeb() {
  const router = useRouter();

  // Use fetchShows for both since we don't have a specific Appwrite "Trending Shows" endpoint yet
  // We'll use the top 5 results as "Trending" and the rest as "Latest"
  const {
    data: shows,
    loading: showsLoading,
    error: showsError,
  } = useFetch(() => fetchShows({ query: "" }), true);

  if (showsLoading) {
    return (
      <View className="flex-1 bg-primary items-center justify-center min-h-screen">
        <ActivityIndicator size="large" color="#AB8BFF" />
      </View>
    );
  }

  // Slice data for sections
  const trendingShows = shows ? shows.slice(0, 5) : [];
  const latestShows = shows ? shows.slice(5) : [];

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
        {/* Header */}
        <View className="w-full mt-12 mb-10 items-center justify-center">
          <Image
            source={icons.logo}
            className="w-24 h-24 mb-6"
            resizeMode="contain"
          />
          <View className="w-full max-w-xl px-4 z-50">
            <SearchBar
              onPress={() => router.push("/search")}
              placeholder="Search for a TV show..."
              value=""
              onChangeText={() => {}}
            />
          </View>
        </View>

        {/* Trending Section */}
        {trendingShows.length > 0 && (
          <View className="w-full max-w-[1400px] mx-auto px-10 mb-16">
            <Text className="text-white text-2xl font-bold mb-6 ml-2">
              Trending Shows
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="pl-2 py-4"
            >
              {trendingShows.map((show: any, index: number) => (
                <TrendingTVWeb
                  key={show.id || index}
                  movie={show}
                  index={index}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Latest Shows Grid */}
        <View className="w-full max-w-[1400px] mx-auto px-10">
          <Text className="text-white text-2xl font-bold mb-8 ml-2">
            Latest TV Shows
          </Text>

          <View className="flex-row flex-wrap justify-center gap-8">
            {latestShows?.map((show: any) => (
              <View key={show.id} className="w-[180px]">
                <TVCardWeb {...show} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
