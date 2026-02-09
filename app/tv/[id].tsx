import VideoPlayer from "@/components/MoviePlayer";
import { icons } from "@/constants/icons";
import { useGlobalContext } from "@/lib/global-provider";
import { fetchSeasonDetails, fetchTVDetails } from "@/services/api";
import {
  getSavedMovies,
  removeSavedMovie,
  saveMovie,
} from "@/services/appwrite";
import useFetch from "@/services/useFetch";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface InfoRowProps {
  label: string;
  value?: string | number | null | undefined;
}

const TVInfo = ({ label, value }: InfoRowProps) => (
  <View className="flex-col items-start justify-center mt-5">
    <Text className="text-light-200 text-sm font-normal">{label}:</Text>
    <Text className="text-light-200 font-bold text-sm mt-2">
      {value || "N/A"}
    </Text>
  </View>
);

const TVDetails = () => {
  const { id } = useLocalSearchParams();
  const { user, isLogged } = useGlobalContext();
  const tvId = Array.isArray(id) ? id[0] : id;

  // --- State ---
  const [isSaved, setIsSaved] = useState(false);
  const [savedDocId, setSavedDocId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // --- TV Logic State ---
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);

  // This holds the detailed data for the CURRENTLY selected season (Episodes, Overview, etc.)
  const [currentSeasonDetails, setCurrentSeasonDetails] = useState<any>(null);
  const [loadingSeason, setLoadingSeason] = useState(false);

  // 1. Fetch Basic Show Details (Global info)
  const { data: show, loading: loadingShow } = useFetch(() =>
    fetchTVDetails(tvId as string),
  );

  // 2. Fetch Specific Season Details whenever 'selectedSeason' changes
  useEffect(() => {
    if (!tvId) return;
    loadSeasonData(selectedSeason);
  }, [tvId, selectedSeason]);

  const loadSeasonData = async (seasonNum: number) => {
    setLoadingSeason(true);
    try {
      const data = await fetchSeasonDetails(tvId as string, seasonNum);
      setCurrentSeasonDetails(data);
      // Reset episode to 1 when changing seasons so we don't get stuck on Ep 20 of a season with 10 eps
      setSelectedEpisode(1);
    } catch (error) {
      console.error("Failed to load season data", error);
    } finally {
      setLoadingSeason(false);
    }
  };

  // 3. Save Logic
  useEffect(() => {
    checkIfSaved();
  }, [tvId, user, isLogged]);

  const checkIfSaved = async () => {
    if (!isLogged || !user) {
      setIsSaved(false);
      return;
    }
    try {
      const savedMovies = await getSavedMovies(user.$id);
      const match = savedMovies.find(
        (doc: any) => doc.movie_id.toString() === tvId?.toString(),
      );
      if (match) {
        setIsSaved(true);
        setSavedDocId(match.$id);
      } else {
        setIsSaved(false);
        setSavedDocId(null);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const toggleSave = async () => {
    if (!isLogged || !user) {
      Alert.alert("Login Required");
      return;
    }
    if (isSaving || !show) return;
    setIsSaving(true);
    try {
      if (isSaved && savedDocId) {
        await removeSavedMovie(savedDocId);
        setIsSaved(false);
        setSavedDocId(null);
      } else {
        await saveMovie(user.$id, {
          id: show.id,
          title: show.name,
          poster_path: show.poster_path ?? "",
          vote_average: show.vote_average,
          release_date: show.first_air_date,
          type: "tv",
        });
        setIsSaved(true);
      }
    } catch (error) {
      Alert.alert("Error saving");
    } finally {
      setIsSaving(false);
    }
  };

  const posterUrl = show?.poster_path
    ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
    : undefined;

  // Use the season poster if available, otherwise fallback to show poster
  const seasonPosterUrl = currentSeasonDetails?.poster_path
    ? `https://image.tmdb.org/t/p/w200${currentSeasonDetails.poster_path}`
    : null;

  if (loadingShow || !show)
    return <ActivityIndicator size="large" color="#FACC15" className="mt-20" />;

  return (
    <View className="bg-primary flex-1">
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Main Header Image */}
        <Image
          source={{ uri: posterUrl }}
          className="w-full h-[550px]"
          resizeMode="stretch"
        />

        <View className="flex-col items-start justify-center mt-5 px-5">
          {/* Header & Save */}
          <View className="flex-row justify-between items-center w-full">
            <Text className="text-white text-xl font-bold flex-1 mr-2">
              {show.name}
            </Text>
            <TouchableOpacity onPress={toggleSave} disabled={isSaving}>
              <Image
                source={icons.save}
                className="size-8"
                tintColor={isSaved ? "#FACC15" : "white"}
              />
            </TouchableOpacity>
          </View>

          {/* Basic Show Stats */}
          <View className="flex-row items-center gap-x-2 mt-2">
            <View className="flex-row items-center bg-dark-100 px-2 py-1 rounded-md">
              <Image source={icons.star} className="size-4 mr-1" />
              <Text className="text-white font-bold text-xs">
                {Math.round(show.vote_average * 10) / 10}
              </Text>
            </View>
            <Text className="text-light-200 text-sm">
              {show.first_air_date?.split("-")[0]}
            </Text>
            <Text className="text-light-200 text-sm">
              • {show.number_of_seasons} Seasons
            </Text>
          </View>

          {/* Show Overview */}
          <TVInfo label="Series Overview" value={show.overview} />
          <TVInfo
            label="Genres"
            value={show.genres?.map((g: any) => g.name).join(" - ")}
          />

          {/* ============================================================ */}
          {/* SEASON SELECTOR                         */}
          {/* ============================================================ */}
          <View className="mt-8 w-full">
            <Text className="text-white font-bold mb-3 text-lg">
              Select Season
            </Text>
            <FlatList
              horizontal
              data={show.seasons}
              keyExtractor={(item) => item.id.toString()}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => setSelectedSeason(item.season_number)}
                  className={`mr-3 px-4 py-2 rounded-lg border ${
                    selectedSeason === item.season_number
                      ? "bg-accent border-accent"
                      : "bg-dark-100 border-dark-200"
                  }`}
                >
                  <Text
                    className={
                      selectedSeason === item.season_number
                        ? "text-white font-bold"
                        : "text-light-200"
                    }
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>

          {/* ============================================================ */}
          {/* CURRENT SEASON DETAILS                     */}
          {/* ============================================================ */}
          {loadingSeason ? (
            <ActivityIndicator color="#FACC15" className="mt-10" />
          ) : (
            currentSeasonDetails && (
              <View className="mt-5 w-full bg-dark-100/50 p-4 rounded-xl border border-dark-200">
                <View className="flex-row gap-4">
                  {/* Season Poster (Optional) */}
                  {seasonPosterUrl && (
                    <Image
                      source={{ uri: seasonPosterUrl }}
                      className="w-20 h-32 rounded-md"
                      resizeMode="cover"
                    />
                  )}

                  <View className="flex-1">
                    <Text className="text-white font-bold text-lg mb-1">
                      {currentSeasonDetails.name}
                    </Text>
                    <Text className="text-light-300 text-xs mb-2">
                      {currentSeasonDetails.air_date?.split("-")[0]} •{" "}
                      {currentSeasonDetails.episodes?.length} Episodes
                    </Text>
                    <Text className="text-light-200 text-xs" numberOfLines={4}>
                      {currentSeasonDetails.overview ||
                        "No overview available for this season."}
                    </Text>
                  </View>
                </View>

                {/* ============================================================ */}
                {/* EPISODE LIST                            */}
                {/* ============================================================ */}
                <Text className="text-white font-bold mt-5 mb-3">Episodes</Text>
                <FlatList
                  horizontal
                  data={currentSeasonDetails.episodes}
                  keyExtractor={(item) => item.id.toString()}
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => setSelectedEpisode(item.episode_number)}
                      className={`mr-3 w-32 p-2 rounded-lg border flex-col justify-between ${
                        selectedEpisode === item.episode_number
                          ? "bg-accent border-accent"
                          : "bg-primary border-dark-200"
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold mb-1 ${selectedEpisode === item.episode_number ? "text-white" : "text-light-200"}`}
                      >
                        Ep {item.episode_number}
                      </Text>
                      <Text className="text-white text-xs" numberOfLines={2}>
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )
          )}

          {/* ============================================================ */}
          {/* PLAYER                               */}
          {/* ============================================================ */}
          <View className="flex-1 mt-8 w-full">
            <VideoPlayer
              movieId={tvId as string}
              posterUri={posterUrl}
              type="tv"
              season={selectedSeason}
              episode={selectedEpisode}
            />
            <Text className="text-light-200 text-center mt-2 text-xs">
              Now Playing: Season {selectedSeason} - Episode {selectedEpisode}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Back Button */}
      <TouchableOpacity
        className="absolute bottom-5 left-0 right-0 mx-5 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center z-50"
        onPress={router.back}
      >
        <Image
          source={icons.arrow}
          className="size-5 mr-1 rotate-180"
          tintColor="#fff"
        />
        <Text className="text-white font-semibold text-base">Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TVDetails;
