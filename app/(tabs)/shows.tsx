import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
import TrendingCard from "@/components/TrendingCard";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { fetchShows } from "@/services/api";
import { getTrendingTV } from "@/services/appwrite";
import useFetch from "@/services/useFetch";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  Text,
  View,
} from "react-native";
import "../global.css";

export default function Shows() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const {
    data: trendingTV,
    loading: trendingLoading,
    error: trendingError,
    refetch: loadTrending,
  } = useFetch(getTrendingTV, false);

  const {
    data: shows,
    loading: showsLoading,
    error: showsError,
    refetch: loadShows,
  } = useFetch(() => fetchShows({ query }), false);

  useFocusEffect(
    useCallback(() => {
      loadTrending();
      loadShows();
    }, [query]),
  );

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full z-0" />

      <ScrollView
        className="flex-1 px-5"
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled={true}
        contentContainerStyle={{
          minHeight: "100%",
          paddingBottom: 10,
        }}
      >
        <Image source={icons.logo} className="w-12 h-10 mt-20 mb-5 mx-auto " />

        {showsLoading || trendingLoading ? (
          <ActivityIndicator
            size="large"
            color="#0000ff"
            className="mt-10 self-center"
          />
        ) : showsError || trendingError ? (
          <Text className="text-red-500 text-center mt-5">
            Error: {showsError?.message || trendingError?.message}
          </Text>
        ) : (
          <View className="flex-1 mt-5">
            <SearchBar
              onPress={() =>
                router.push({ pathname: "/search", params: { type: "tv" } })
              }
              placeholder="Search for a TV show"
              value={query}
              onChangeText={(text) => setQuery(text)}
            />

            {/* Trending TV Section */}
            {!query && trendingTV && trendingTV.length > 0 && (
              <View className="mt-10">
                <Text className="text-lg text-white font-bold mb-3">
                  Trending TV Shows
                </Text>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  ItemSeparatorComponent={() => <View className="w-4" />}
                  className="mb-4 mt-3"
                  data={trendingTV}
                  renderItem={({ item, index }) => (
                    <TrendingCard movie={item} index={index} />
                  )}
                  keyExtractor={(item, index) =>
                    item.movie_id?.toString() || index.toString()
                  }
                />
              </View>
            )}

            {/* TV Shows Grid */}
            <View>
              <Text className="text-lg text-white font-bold mt-5 mb-3">
                {query ? "Search Results" : "Latest TV Shows"}
              </Text>

              <FlatList
                data={shows}
                renderItem={({ item }) => <MovieCard {...item} />}
                keyExtractor={(item) => item.id.toString()}
                numColumns={3}
                columnWrapperStyle={{
                  justifyContent: "flex-start",
                  gap: 20,
                  paddingRight: 5,
                  marginBottom: 10,
                }}
                className="mt-2 pb-32"
                scrollEnabled={false}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
