import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { fetchMovies } from "@/services/api";
import { updateSearchCount } from "@/services/appwrite";
import useFetch from "@/services/useFetch";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

  const {
    data: movies,
    loading,
    error,
    refetch: loadMovies,
    reset,
  } = useFetch(() => fetchMovies({ query: searchQuery }), false);

  // 1. Load History on Mount
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

  // 2. Save Query to History
  const handleSearchSubmit = async () => {
    if (!searchQuery.trim()) return;

    try {
      // Create new history: Remove duplicate of current query, add to top, keep max 10
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

  // 3. Handle History Item Click
  const handleHistoryPress = (term: string) => {
    setSearchQuery(term);
  };

  // 4. Clear History (Optional utility)
  const clearHistory = async () => {
    setSearchHistory([]);
    await AsyncStorage.removeItem("search_history");
  };

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim()) {
        await loadMovies();
      } else {
        reset();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    if (movies?.length > 0 && movies?.[0]) {
      updateSearchCount(searchQuery, movies[0]);
    }
  }, [movies]);

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="flex-1 absolute w-full z-0"
        resizeMode="cover"
      />

      <FlatList
        data={movies}
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
                placeholder="Search movies..."
                value={searchQuery}
                onChangeText={(text: string) => setSearchQuery(text)}
                onSubmit={handleSearchSubmit}
              />
            </View>

            {loading && (
              <ActivityIndicator
                size="large"
                color="#0000ff"
                className="my-3"
              />
            )}

            {error && (
              <Text className="text-red-500 px-5 my-3">
                Error: {error.message}
              </Text>
            )}

            {!loading && !error && searchQuery.trim() && movies?.length > 0 && (
              <Text className="text-xl text-white font-bold">
                Search Results for{" "}
                <Text className="text-accent">{searchQuery}</Text>
              </Text>
            )}
          </>
        }
        ListEmptyComponent={
          !loading && !error ? (
            <View className="mt-2 px-2">
              {/* Show History if query is empty AND history exists */}
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
                        tintColor="#9CA3AF" // gray-400
                      />
                      <Text className="text-gray-300 text-base">{term}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text className="text-center text-gray-500 mt-8">
                  {searchQuery.trim()
                    ? "No movies found"
                    : "Search for a movie"}
                </Text>
              )}
            </View>
          ) : null
        }
      />
    </View>
  );
}
