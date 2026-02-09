import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { fetchMovies, fetchShows } from "@/services/api";
import { updateSearchCount } from "@/services/appwrite";
import useFetch from "@/services/useFetch";
import AsyncStorage from "@react-native-async-storage/async-storage";
// 1. Import useLocalSearchParams
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import "../global.css";

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [searchType, setSearchType] = useState<"movie" | "tv">("movie");

  // 2. Get parameters from the URL/Route
  const params = useLocalSearchParams<{ type?: string }>();

  // 3. Effect: Check if a 'type' param was passed (e.g. from Shows tab)
  useEffect(() => {
    if (params.type === "tv") {
      setSearchType("tv");
    } else if (params.type === "movie") {
      setSearchType("movie");
    }
  }, [params.type]);

  // Dynamic Fetch Logic
  const fetchFunction =
    searchType === "movie"
      ? () => fetchMovies({ query: searchQuery })
      : () => fetchShows({ query: searchQuery });

  const {
    data: results,
    loading,
    error,
    refetch: loadResults,
    reset,
  } = useFetch(fetchFunction, false);

  // ... (Keep existing loadHistory, handleSearchSubmit, etc.) ...

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const historyJson = await AsyncStorage.getItem("search_history");
      if (historyJson) {
        setSearchHistory(JSON.parse(historyJson));
      }
    } catch (e) {
      console.log("Failed to load history", e);
    }
  };

  const handleSearchSubmit = async () => {
    if (!searchQuery.trim()) return;
    try {
      const newHistory = [
        searchQuery,
        ...searchHistory.filter((h) => h !== searchQuery),
      ].slice(0, 10);
      setSearchHistory(newHistory);
      await AsyncStorage.setItem("search_history", JSON.stringify(newHistory));
    } catch (e) {
      console.log("Failed to save history", e);
    }
  };

  const handleHistoryPress = (term: string) => {
    setSearchQuery(term);
  };

  const clearHistory = async () => {
    setSearchHistory([]);
    await AsyncStorage.removeItem("search_history");
  };

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim()) {
        await loadResults();
      } else {
        reset();
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchType]);

  useEffect(() => {
    if (results?.length > 0 && results?.[0]) {
      updateSearchCount(searchQuery, results[0]);
    }
  }, [results]);

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="flex-1 absolute w-full z-0"
        resizeMode="cover"
      />

      <FlatList
        data={results}
        renderItem={({ item }) => <MovieCard {...item} />}
        keyExtractor={(item) => item.id.toString()}
        className="px-5"
        numColumns={3}
        columnWrapperStyle={{
          justifyContent: "center",
          gap: 16,
          marginVertical: 16,
        }}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={
          <>
            <View className="w-full flex-row justify-center mt-20 items-center">
              <Image source={icons.logo} className="w-12 h-10" />
            </View>

            <View className="my-5">
              <SearchBar
                placeholder={`Search ${searchType === "movie" ? "movies" : "TV shows"}...`}
                value={searchQuery}
                onChangeText={(text: string) => setSearchQuery(text)}
                onSubmit={handleSearchSubmit}
              />
            </View>

            {/* Type Selector */}
            <View className="flex-row justify-center mb-6 gap-4">
              <TouchableOpacity
                onPress={() => setSearchType("movie")}
                className={`px-6 py-2 rounded-full border border-white/10 ${
                  searchType === "movie" ? "bg-accent" : "bg-black/40"
                }`}
              >
                <Text
                  className={`${
                    searchType === "movie"
                      ? "text-white font-bold"
                      : "text-gray-400"
                  }`}
                >
                  Movies
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSearchType("tv")}
                className={`px-6 py-2 rounded-full border border-white/10 ${
                  searchType === "tv" ? "bg-accent" : "bg-black/40"
                }`}
              >
                <Text
                  className={`${
                    searchType === "tv"
                      ? "text-white font-bold"
                      : "text-gray-400"
                  }`}
                >
                  TV Shows
                </Text>
              </TouchableOpacity>
            </View>

            {loading && (
              <ActivityIndicator
                size="large"
                color="#FACC15"
                className="my-3"
              />
            )}

            {/* ... (Keep existing error and result text logic) ... */}
            {error && (
              <Text className="text-red-500 px-5 my-3">
                Error: {error.message}
              </Text>
            )}

            {!loading &&
              !error &&
              searchQuery.trim() &&
              results?.length > 0 && (
                <Text className="text-xl text-white font-bold">
                  Search Results for{" "}
                  <Text className="text-accent">{searchQuery}</Text>
                </Text>
              )}
          </>
        }
        ListEmptyComponent={
          // ... (Keep existing ListEmptyComponent logic) ...
          !loading && !error ? (
            <View className="mt-2 px-2">
              {!searchQuery.trim() && searchHistory.length > 0 ? (
                <View>
                  <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-white text-lg font-bold">
                      Recent Searches
                    </Text>
                    <TouchableOpacity onPress={clearHistory}>
                      <Text className="text-gray-400 text-sm">Clear</Text>
                    </TouchableOpacity>
                  </View>

                  {searchHistory.map((term, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleHistoryPress(term)}
                      className="flex-row items-center py-3 border-b border-white/10"
                    >
                      <Image
                        source={icons.search}
                        className="size-4 mr-3"
                        tintColor="#9CA3AF"
                      />
                      <Text className="text-gray-300 text-base">{term}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text className="text-center text-gray-500 mt-8">
                  {searchQuery.trim()
                    ? `No ${searchType === "movie" ? "movies" : "shows"} found`
                    : `Search for a ${searchType === "movie" ? "movie" : "show"}`}
                </Text>
              )}
            </View>
          ) : null
        }
      />
    </View>
  );
}
