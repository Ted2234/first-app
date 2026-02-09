import { images } from "@/constants/images";
import MaskedView from "@react-native-masked-view/masked-view";
import { Href, Link } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

const TrendingCard = ({
  movie: { movie_id, title, poster_url, type, poster_path },
  index,
}: TrendingCardProps) => {
  const isTV = type === "tv";
  const hrefPath = (isTV ? `/tv/${movie_id}` : `/movies/${movie_id}`) as Href;
  const imageUri = poster_url
    ? poster_url
    : poster_path
      ? `https://image.tmdb.org/t/p/w500${poster_path}`
      : "https://placeholder.co/600x400/1a1a1a/ffffff/png";
  return (
    <Link href={hrefPath} asChild>
      <TouchableOpacity className="w-32 relative pl-5">
        <Image
          source={{
            uri: imageUri,
          }}
          className="w-32 h-48 rounded-lg"
          resizeMode="cover"
        />
        <View className="absolute bottom-9 -left-3.5 px-2 py-1 rounded-full">
          <MaskedView
            maskElement={
              <Text className="text-6xl font-bold text-white">{index + 1}</Text>
            }
          >
            <Image
              source={images.rankingGradient}
              className="size-14"
              resizeMode="cover"
            />
          </MaskedView>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

export default TrendingCard;
