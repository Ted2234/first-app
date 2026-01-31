import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import GlobalProvider, { useGlobalContext } from "@/lib/global-provider"; // <--- Import our new Context
import { getSavedMovies, register, signIn, signOut } from "@/services/appwrite";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import "../global.css";

export default function Profile() {
  const { user, isLogged, loading, refetch } = useGlobalContext();

  const [isRegistering, setIsRegistering] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  // Add stats state
  const [stats, setStats] = useState({ saved: 0, history: 0 });

  // 2. NEW: Fetch stats when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (isLogged && user) {
        loadProfileStats();
      }
    }, [isLogged, user]),
  );

  const loadProfileStats = async () => {
    try {
      // A. Fetch Saved Movies from Appwrite Cloud
      // We already have the service that gets the array, we just need the .length
      const savedDocs = await getSavedMovies(user.$id);

      // B. Fetch Search History from Local Storage
      const historyJson = await AsyncStorage.getItem("search_history");
      const historyArray = historyJson ? JSON.parse(historyJson) : [];

      // C. Update State
      setStats({
        saved: savedDocs.length,
        history: historyArray.length,
      });
    } catch (error) {
      console.log("Error loading stats:", error);
    }
  };

  const handleAuth = async () => {
    if (!form.email || !form.password) {
      alert("Please fill in all fields.");
      return;
    }
    if (isRegistering && !form.username) {
      alert("Username is required for registration");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isRegistering) {
        await register(form.email, form.password, form.username);
        alert("Registration successful!");
      } else {
        await signIn(form.email, form.password);
      }

      await refetch();
    } catch (error) {
      console.error("Authentication error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      await refetch();
      setForm({
        username: "",
        email: "",
        password: "",
      });
    } catch (error) {
      alert("Login failed! Please check your credentials and try again.");
      console.error("Sign out error:", error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-primary">
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <GlobalProvider>
      <View className="flex-1 bg-primary">
        <Image
          source={images.bg}
          className="absolute w-full h-full z-0"
          resizeMode="cover"
        />

        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 60 }}
          showsVerticalScrollIndicator={false}
        >
          <Image source={icons.logo} className="w-12 h-10 mb-10 mx-auto" />

          {/* ============================================================ */}
          {/* VIEW 1: THE LOGGED IN USER (Profile)                        */}
          {/* ============================================================ */}
          {isLogged && user ? (
            <View className="items-center w-full">
              {/* Avatar */}
              <View className="size-28 rounded-full border-2 border-accent p-1 mb-4">
                <Image
                  source={{ uri: user.avatar }}
                  className="w-full h-full rounded-full"
                  resizeMode="cover"
                />
              </View>

              <Text className="text-white text-2xl font-bold">
                {user.username}
              </Text>
              <Text className="text-gray-400 text-sm mt-1 mb-10">
                {user.email}
              </Text>

              {/* 3. NEW: Display the real stats */}
              <View className="flex-row justify-between w-full bg-dark-200 p-5 rounded-2xl border border-white/10 mb-10">
                <View className="items-center flex-1">
                  <Text className="text-accent text-xl font-bold">
                    {stats.saved}
                  </Text>
                  <Text className="text-gray-400 text-xs">Saved</Text>
                </View>
                <View className="w-[1px] h-full bg-white/10" />
                <View className="items-center flex-1">
                  <Text className="text-white text-xl font-bold">
                    {stats.history}
                  </Text>
                  <Text className="text-gray-400 text-xs">History</Text>
                </View>
              </View>

              {/* Logout Button */}
              <TouchableOpacity
                onPress={handleSignOut}
                className="bg-red-500/10 border border-red-500 w-full py-4 rounded-xl flex-row justify-center items-center"
              >
                <Image
                  source={icons.person}
                  className="size-5 mr-2"
                  tintColor="#ef4444"
                />
                <Text className="text-red-500 font-bold">Log Out</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* ============================================================ */
            /* VIEW 2: THE GUEST (Login / Register Form)                    */
            /* ============================================================ */
            <View className="w-full">
              <Text className="text-white text-3xl font-bold mb-2">
                {isRegistering ? "Create Account" : "Welcome Back"}
              </Text>
              <Text className="text-gray-400 text-base mb-8">
                {isRegistering
                  ? "Sign up to sync your saved movies across devices"
                  : "Sign in to access your collection"}
              </Text>

              {/* Username Field (Register Only) */}
              {isRegistering && (
                <View className="mb-4">
                  <Text className="text-gray-300 mb-2 ml-1">Username</Text>
                  <TextInput
                    value={form.username}
                    onChangeText={(t) => setForm({ ...form, username: t })}
                    placeholder="Enter your username"
                    placeholderTextColor="#6b7280"
                    className="bg-dark-200 w-full p-4 rounded-xl text-white border border-white/10 focus:border-accent"
                  />
                </View>
              )}

              {/* Email Field */}
              <View className="mb-4">
                <Text className="text-gray-300 mb-2 ml-1">Email Address</Text>
                <TextInput
                  value={form.email}
                  onChangeText={(t) => setForm({ ...form, email: t })}
                  placeholder="Enter your email"
                  placeholderTextColor="#6b7280"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="bg-dark-200 w-full p-4 rounded-xl text-white border border-white/10 focus:border-accent"
                />
              </View>

              {/* Password Field */}
              <View className="mb-8">
                <Text className="text-gray-300 mb-2 ml-1">Password</Text>
                <TextInput
                  value={form.password}
                  onChangeText={(t) => setForm({ ...form, password: t })}
                  placeholder="Enter your password"
                  placeholderTextColor="#6b7280"
                  secureTextEntry
                  className="bg-dark-200 w-full p-4 rounded-xl text-white border border-white/10 focus:border-accent"
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleAuth}
                disabled={isSubmitting}
                className={`w-full py-4 rounded-xl flex items-center justify-center ${
                  isSubmitting ? "bg-accent/50" : "bg-accent"
                }`}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-primary font-bold text-lg">
                    {isRegistering ? "Sign Up" : "Sign In"}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Toggle Login/Register */}
              <View className="flex-row justify-center mt-6">
                <Text className="text-gray-400">
                  {isRegistering
                    ? "Already have an account? "
                    : "Don't have an account? "}
                </Text>
                <TouchableOpacity
                  onPress={() => setIsRegistering(!isRegistering)}
                >
                  <Text className="text-accent font-bold">
                    {isRegistering ? "Sign In" : "Sign Up"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </GlobalProvider>
  );
}
function setStats(arg0: { saved: any; history: any }) {
  throw new Error("Function not implemented.");
}
