import { icons } from "@/constants/icons";
import { useGlobalContext } from "@/lib/global-provider";
import { fetchSeasonDetails, fetchTVDetails } from "@/services/api";
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

export default function TVDetailsWeb() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useGlobalContext();

  // 1. Fetch Main TV Details
  const { data: tv, loading: tvLoading } = useFetch(
    () => fetchTVDetails(id as string),
    true,
  );

  // 2. Playback State
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);

  // 3. Fetch Season Details (Episodes) when season changes
  const [seasonDetails, setSeasonDetails] = useState<any>(null);
  const [loadingSeason, setLoadingSeason] = useState(false);

  useEffect(() => {
    if (id && selectedSeason) {
      loadSeasonData();
    }
  }, [id, selectedSeason]);

  const loadSeasonData = async () => {
    setLoadingSeason(true);
    try {
      const data = await fetchSeasonDetails(id as string, selectedSeason);
      setSeasonDetails(data);
    } catch (error) {
      console.error("Failed to load season details", error);
    } finally {
      setLoadingSeason(false);
    }
  };

  // 4. Save State
  const [isSaved, setIsSaved] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user && tv) checkSavedStatus();
  }, [user, tv]);

  const checkSavedStatus = async () => {
    if (!user?.$id || !tv?.id) return;
    try {
      const savedDocs = await getSavedMovies(user.$id);
      const exists = savedDocs.find((doc: any) => doc.movie_id === tv.id);
      if (exists) {
        setIsSaved(true);
        setSavedId(exists.$id);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const toggleSave = async () => {
    if (!user) return alert("Please login to save shows");
    if (!tv) return;

    setIsSaving(true);
    try {
      if (isSaved && savedId) {
        await removeSavedMovie(savedId);
        setIsSaved(false);
        setSavedId(null);
      } else {
        const result = await saveMovie(user.$id, {
          id: tv.id,
          title: tv.name,
          poster_path: tv.poster_path,
          vote_average: tv.vote_average,
          release_date: tv.first_air_date,
          type: "tv",
        });
        setIsSaved(true);
        setSavedId(result.$id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  if (tvLoading || !tv) {
    return (
      <View className="flex-1 bg-primary items-center justify-center min-h-screen">
        <ActivityIndicator size="large" color="#AB8BFF" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-primary min-h-screen relative">
      {/* Fixed Background */}
      <View
        // @ts-ignore
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <Image
          source={{
            uri: `https://image.tmdb.org/t/p/original${tv.backdrop_path}`,
          }}
          className="w-full h-full opacity-30"
          resizeMode="cover"
          blurRadius={10}
        />
        <View className="absolute top-0 left-0 w-full h-full bg-primary/60" />
      </View>

      <ScrollView
        className="flex-1 z-10"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute top-8 left-8 z-50 bg-dark-200/50 p-3 rounded-full hover:bg-accent/20 transition-colors"
        >
          <Image
            source={icons.arrow}
            className="size-9 rotate-180"
            tintColor="white"
          />
        </TouchableOpacity>

        <View className="max-w-7xl mx-auto w-full px-4 pt-20">
          {/* --- VIDEO PLAYER --- */}
          <View className="w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 mb-8 group relative">
            {/* @ts-ignore */}
            <iframe
              src={`https://vidsrc.to/embed/tv/${tv.id}/${selectedSeason}/${selectedEpisode}`}
              width="100%"
              height="100%"
              allowFullScreen
              style={{ border: "none" }}
            />
          </View>

          {/* --- MAIN INFO (Title, Rating, Save) --- */}
          <View className="flex-row justify-between items-start mb-10">
            <View className="flex-1">
              <Text className="text-4xl font-black text-white mb-2">
                {tv.name}
              </Text>
              <View className="flex-row items-center gap-4">
                <View className="bg-accent px-3 py-1 rounded-md">
                  <Text className="text-dark-200 font-bold text-xs">
                    {tv.first_air_date?.split("-")[0]}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Image
                    source={icons.star}
                    className="size-4 mr-1"
                    tintColor="#FACC15"
                  />
                  <Text className="text-white font-bold">
                    {Math.round(tv.vote_average * 10) / 10}
                  </Text>
                </View>
                <Text className="text-light-200 text-sm">
                  {tv.number_of_seasons} Seasons • {tv.status}
                </Text>
              </View>
              <Text className="text-light-100 mt-4 leading-6 max-w-2xl">
                {tv.overview}
              </Text>
            </View>

            <TouchableOpacity
              onPress={toggleSave}
              disabled={isSaving}
              className={`px-6 py-3 rounded-xl flex-row items-center transition-all ${
                isSaved ? "bg-accent" : "bg-white/10 hover:bg-white/20"
              }`}
            >
              <Image
                source={icons.save}
                className="size-5 mr-2"
                tintColor={isSaved ? "#030014" : "white"}
              />
              <Text
                className={`font-bold ${isSaved ? "text-dark-200" : "text-white"}`}
              >
                {isSaved ? "Saved" : "Add to List"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* --- SEASON SELECTOR --- */}
          <View className="mb-8">
            <Text className="text-white text-xl font-bold mb-4">Seasons</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="pb-2"
            >
              {Array.from(
                { length: tv.number_of_seasons },
                (_, i) => i + 1,
              ).map((seasonNum) => (
                <TouchableOpacity
                  key={seasonNum}
                  onPress={() => setSelectedSeason(seasonNum)}
                  className={`mr-3 px-5 py-2 rounded-full border transition-all ${
                    selectedSeason === seasonNum
                      ? "bg-accent border-accent"
                      : "bg-transparent border-white/20 hover:bg-white/10"
                  }`}
                >
                  <Text
                    className={`font-bold ${selectedSeason === seasonNum ? "text-dark-200" : "text-light-200"}`}
                  >
                    Season {seasonNum}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* --- EPISODE LIST --- */}
          <View>
            <Text className="text-white text-xl font-bold mb-4">
              Episodes (Season {selectedSeason})
            </Text>

            {loadingSeason ? (
              <ActivityIndicator
                size="large"
                color="#AB8BFF"
                className="mt-10"
              />
            ) : (
              <View className="gap-4">
                {seasonDetails?.episodes?.map((ep: any) => (
                  <TouchableOpacity
                    key={ep.id}
                    onPress={() => {
                      setSelectedEpisode(ep.episode_number);
                      // Scroll to top logic could be added here if needed
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`flex-row p-4 rounded-xl border transition-all cursor-pointer group ${
                      selectedEpisode === ep.episode_number
                        ? "bg-white/10 border-accent"
                        : "bg-dark-200/40 border-white/5 hover:bg-white/5"
                    }`}
                  >
                    {/* Still Image */}
                    <View className="w-[160px] h-[90px] rounded-lg overflow-hidden bg-dark-100 mr-4 shrink-0">
                      <Image
                        source={{
                          uri: ep.still_path
                            ? `https://image.tmdb.org/t/p/w300${ep.still_path}`
                            : "https://placeholder.co/300x169/1a1a1a/ffffff?text=No+Image",
                        }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                      {selectedEpisode === ep.episode_number && (
                        <View className="absolute inset-0 bg-black/60 items-center justify-center">
                          <Text className="text-accent font-bold text-xs tracking-widest">
                            PLAYING
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Details */}
                    <View className="flex-1 justify-center">
                      <View className="flex-row justify-between items-start mb-1">
                        <Text
                          className={`font-bold text-lg ${selectedEpisode === ep.episode_number ? "text-accent" : "text-white group-hover:text-accent transition-colors"}`}
                        >
                          {ep.episode_number}. {ep.name}
                        </Text>
                        <Text className="text-light-300 text-xs mt-1">
                          {ep.runtime ? `${ep.runtime}m` : "N/A"}
                        </Text>
                      </View>
                      <Text
                        className="text-light-200 text-sm leading-5"
                        numberOfLines={2}
                      >
                        {ep.overview ||
                          "No description available for this episode."}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
