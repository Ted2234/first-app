import { icons } from "@/constants/icons";
import { Tabs } from "expo-router";
import React from "react";
import { Image, Text, View } from "react-native";
import "../global.css";

// 1. Updated Component to accept explicit size in pixels
const WebTabIcon = ({ focused, icon, title, size }: any) => {
  return (
    <View
      className={`
        flex-row items-center justify-center 
        py-2 px-5 rounded-full 
        transition-all duration-300 ease-in-out
        ${focused ? "bg-accent scale-105" : "hover:bg-white/10"}
      `}
    >
      <Image
        source={icon}
        style={{
          width: size,
          height: size,
          tintColor: focused ? "#030014" : "#A8B5DB",
        }}
        resizeMode="contain"
      />

      {focused && (
        <Text className="text-[#030014] text-sm font-bold ml-2">{title}</Text>
      )}
    </View>
  );
};

export default function TabLayoutWeb() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0f0D23",
          borderTopWidth: 0,
          height: 80,
          position: "absolute",
          bottom: 20,
          left: 0,
          right: 0,
          width: "90%",
          maxWidth: 500,
          marginHorizontal: "auto",
          borderRadius: 24,
          borderColor: "rgba(255,255,255,0.1)",
          borderWidth: 1,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.5,
          shadowRadius: 20,
          elevation: 5,
          // FIX: Add High Z-Index to sit on top of the Grid
          zIndex: 100,
        },
        tabBarItemStyle: {
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Movies",
          tabBarIcon: ({ focused }) => (
            <WebTabIcon
              focused={focused}
              icon={icons.movie}
              title="Movies"
              size={18}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="shows"
        options={{
          title: "Shows",
          tabBarIcon: ({ focused }) => (
            <WebTabIcon
              focused={focused}
              icon={icons.shows}
              title="Shows"
              size={18}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ focused }) => (
            <WebTabIcon
              focused={focused}
              icon={icons.search}
              title="Search"
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ focused }) => (
            <WebTabIcon
              focused={focused}
              icon={icons.save}
              title="Saved"
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <WebTabIcon
              focused={focused}
              icon={icons.person}
              title="Profile"
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}
