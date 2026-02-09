import { icons } from "@/constants/icons"; // Import your icons
import React, { useState } from "react";
import { Image, Platform, Pressable, View } from "react-native";
import { WebView } from "react-native-webview";

interface VideoPlayerProps {
  movieId: string | number;
  posterUri?: string;
  type?: "movie" | "tv";
  season?: number;
  episode?: number;
}

export default function VideoPlayer({
  movieId,
  posterUri,
  type,
  season,
  episode,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Construct the Embed URL
  const ALLOWED_HOST = "vidsrcme.ru";
  const videoSource =
    type === "tv"
      ? `https://vidsrcme.ru/embed/tv?tmdb=${movieId}&season=${season}&episode=${episode}`
      : `https://vidsrcme.ru/embed/movie?tmdb=${movieId}`;

  if (Platform.OS === "web") {
    return (
      <View className="w-full aspect-video bg-black overflow-hidden rounded-lg relative z-50">
        <iframe
          src={videoSource}
          style={{ width: "100%", height: "100%", border: "none" }}
          allowFullScreen
          allow="autoplay; encrypted-media"
        />
      </View>
    );
  }

  return (
    <View className="w-full aspect-video bg-black overflow-hidden rounded-lg relative">
      {!isPlaying ? (
        <Pressable
          onPress={() => setIsPlaying(true)}
          className="flex-1 justify-center items-center"
        >
          {/* Background Poster */}
          {posterUri ? (
            <Image
              source={{ uri: posterUri }}
              className="absolute w-full h-full"
              resizeMode="cover"
            />
          ) : null}

          {/* Play Button Overlay */}
          <View className="w-12 h-12 bg-black/50 rounded-full justify-center items-center backdrop-blur-sm">
            <Image
              source={icons.play}
              className="w-6 h-6 ml-1"
              tintColor="white"
              resizeMode="contain"
            />
          </View>
        </Pressable>
      ) : (
        <WebView
          source={{ uri: videoSource }}
          className="flex-1 bg-black"
          allowsFullscreenVideo={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          scrollEnabled={false}
          // Optional: Improve Android playback
          androidLayerType="hardware"
        />
      )}
    </View>
  );
}
