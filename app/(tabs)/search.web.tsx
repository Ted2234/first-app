import SearchBar from "@/components/SearchBar";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { fetchMovies, fetchShows } from "@/services/api";
import useFetch from "@/services/useFetch";
import { Link, Route } from "expo-router";
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

// Dynamic Card that handles both Movie and TV routing
const SearchCardWeb = ({ item, type }: any) => {
  const route =
    type === "tv"
      ? (`/tv/${item.id}` as Route)
      : (`/movies/${item.id}` as Route);

  return (
    <Link href={route} asChild>
      <TouchableOpacity className="w-full group cursor-pointer">
        <View className="w-full h-[280px] rounded-xl overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-105">
          <Image
            source={{
              uri: item.poster_path
                ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
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
            {item.title}
          </Text>
          <Text className="text-light-300 text-xs mt-1">
            {item.release_date?.split("-")[0] || "N/A"}
          </Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

export default function SearchWeb() {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<"movie" | "tv">("movie");

  // Dynamic fetch function based on type
  const fetchFunction = () =>
    searchType === "movie" ? fetchMovies({ query }) : fetchShows({ query });

  const {
    data: results,
    loading,
    error,
    refetch,
  } = useFetch(fetchFunction, true); // Auto-fetch initial popular items

  // Re-fetch when Type or Query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      refetch();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [query, searchType]);

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
        <View className="w-full max-w-[1000px] mx-auto px-6 mt-16">
          <View className="mb-8 items-center">
            <Image
              source={icons.logo}
              className="w-16 h-16 mb-6"
              resizeMode="contain"
            />
            <Text className="text-white text-3xl font-bold mb-6">
              Find {searchType === "movie" ? "Movies" : "TV Shows"}
            </Text>

            {/* Search Type Toggle */}
            <View className="flex-row bg-dark-200 p-1 rounded-full mb-8 border border-white/10">
              <TouchableOpacity
                onPress={() => setSearchType("movie")}
                className={`px-8 py-2 rounded-full transition-all ${searchType === "movie" ? "bg-accent" : "hover:bg-white/5"}`}
              >
                <Text
                  className={`font-bold ${searchType === "movie" ? "text-dark-200" : "text-light-200"}`}
                >
                  Movies
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSearchType("tv")}
                className={`px-8 py-2 rounded-full transition-all ${searchType === "tv" ? "bg-accent" : "hover:bg-white/5"}`}
              >
                <Text
                  className={`font-bold ${searchType === "tv" ? "text-dark-200" : "text-light-200"}`}
                >
                  TV Shows
                </Text>
              </TouchableOpacity>
            </View>

            <View className="w-full max-w-2xl">
              <SearchBar
                placeholder={`Search for a ${searchType === "movie" ? "movie" : "show"}...`}
                value={query}
                onChangeText={setQuery}
              />
            </View>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#AB8BFF" className="mt-10" />
          ) : error ? (
            <Text className="text-red-500 text-center">
              Error fetching results
            </Text>
          ) : !results || results.length === 0 ? (
            <View className="items-center justify-center mt-20">
              <Image
                source={icons.search}
                className="w-16 h-16 opacity-20"
                tintColor="#fff"
              />
              <Text className="text-light-200 mt-4 text-lg">
                No results found
              </Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap justify-center gap-8">
              {results.map((item: any) => (
                <View key={item.id} className="w-[180px]">
                  <SearchCardWeb item={item} type={searchType} />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
