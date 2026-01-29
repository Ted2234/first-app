import { useVideoPlayer, VideoView } from "expo-video";
import React, { useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";

export default function VideoPlayer() {
  const [showPoster, setShowPoster] = useState(true);
  const playbackId = "OfjbQ3esQifgboENTs4oDXslCP5sSnst";
  const videoSource = `https://stream.mux.com/${playbackId}.m3u8`;
  const posterSource = `https://image.mux.com/${playbackId}/thumbnail.png?time=0`;

  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = false;
    // Don't autoplay - wait for user to tap poster
  });

  const handlePosterPress = () => {
    setShowPoster(false);
    player.play();
  };

  return (
    <View className="flex-1 justify-center items-center bg-black">
      <VideoView
        player={player}
        className="w-100% aspect-video"
        allowsFullscreen
        allowsPictureInPicture
        nativeControls
        contentFit="contain"
      />
      {showPoster && (
        <Pressable onPress={handlePosterPress} style={styles.poster}>
          <Image
            className="absolute w-full aspect-video"
            source={{ uri: posterSource }}
            resizeMode="cover"
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  video: {
    width: "100%",
    aspectRatio: 16 / 9,
  },
  poster: {
    position: "absolute",
    width: "100%",
    aspectRatio: 16 / 9,
  },
});
