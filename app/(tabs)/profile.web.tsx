import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { useGlobalContext } from "@/lib/global-provider";
import { getSavedMovies, register, signIn, signOut } from "@/services/appwrite";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import "../global.css";

export default function ProfileWeb() {
  const { user, isLogged, loading, refetch } = useGlobalContext();

  const [isRegistering, setIsRegistering] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [savedCount, setSavedCount] = useState(0);

  // --- FIX: BREAK THE INFINITE LOOP ---

  // 1. Refresh Session: Runs ONLY when the tab is focused (Empty dependency array)
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, []),
  );

  // 2. Fetch Stats: Runs ONLY when 'user' specifically changes
  useEffect(() => {
    if (user?.$id) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      if (!user?.$id) return;
      const savedDocs = await getSavedMovies(user.$id);
      setSavedCount(savedDocs.length);
    } catch (e) {
      console.log("Error fetching stats", e);
    }
  };

  const handleAuth = async () => {
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    if (isRegistering && !form.username) {
      setError("Username is required for registration.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      if (isRegistering) {
        await register(form.email, form.password, form.username);
      } else {
        await signIn(form.email, form.password);
      }
      // This will trigger the useEffect above automatically
      await refetch();

      setForm({ username: "", email: "", password: "" });
    } catch (err: any) {
      console.error(err);
      setError("Authentication failed. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      await refetch();
      setSavedCount(0);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-primary items-center justify-center min-h-screen">
        <ActivityIndicator size="large" color="#AB8BFF" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-primary min-h-screen items-center justify-center">
      <Image
        source={images.bg}
        className="absolute top-0 left-0 w-full h-full opacity-50 z-0"
        resizeMode="cover"
      />

      {/* Main Card */}
      <View className="z-10 bg-dark-200/80 backdrop-blur-xl border border-white/10 p-10 rounded-3xl w-full max-w-[480px] shadow-2xl">
        {/* VIEW 1: LOGGED IN PROFILE */}
        {isLogged && user ? (
          <View className="items-center w-full">
            <View className="w-32 h-32 rounded-full border-4 border-accent mb-6 overflow-hidden shadow-lg">
              <Image
                source={{ uri: user.avatar || "https://placeholder.co/400" }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>

            <Text className="text-white text-3xl font-bold mb-1 text-center">
              {user.username}
            </Text>
            <Text className="text-light-200 text-sm mb-8 text-center">
              {user.email}
            </Text>

            <View className="flex-row justify-center w-full bg-dark-100/50 p-5 rounded-2xl border border-white/5 mb-8">
              <View className="items-center px-8">
                <Text className="text-accent text-3xl font-bold">
                  {savedCount}
                </Text>
                <Text className="text-gray-400 text-xs uppercase tracking-wider font-semibold mt-1">
                  Saved Movies
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleLogout}
              className="w-full bg-red-500/10 border border-red-500/50 py-4 rounded-xl flex-row items-center justify-center hover:bg-red-500/20 transition-colors cursor-pointer"
            >
              <Image
                source={icons.person}
                className="size-5 mr-2"
                tintColor="#ef4444"
              />
              <Text className="text-red-500 font-bold text-lg">Log Out</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* VIEW 2: GUEST (LOGIN FORM) */
          <View className="w-full">
            <View className="items-center mb-8">
              <Image
                source={icons.logo}
                className="w-16 h-16 mb-4"
                resizeMode="contain"
              />
              <Text className="text-white text-3xl font-bold">
                {isRegistering ? "Create Account" : "Welcome Back"}
              </Text>
              <Text className="text-light-200 text-sm mt-2 text-center">
                {isRegistering
                  ? "Sign up to start your collection"
                  : "Sign in to access your saved movies"}
              </Text>
            </View>

            {error ? (
              <View className="bg-red-500/10 border border-red-500/50 p-3 rounded-lg mb-6">
                <Text className="text-red-500 text-center text-sm font-medium">
                  {error}
                </Text>
              </View>
            ) : null}

            <View className="space-y-4">
              {isRegistering && (
                <View>
                  <Text className="text-light-200 text-sm mb-2 ml-1">
                    Username
                  </Text>
                  <TextInput
                    value={form.username}
                    onChangeText={(t) => setForm({ ...form, username: t })}
                    placeholder="Choose a username"
                    placeholderTextColor="#9CA4AB"
                    className="w-full h-14 bg-dark-100 border border-white/10 rounded-xl px-4 text-white focus:border-accent outline-none"
                  />
                </View>
              )}

              <View>
                <Text className="text-light-200 text-sm mb-2 ml-1">
                  Email Address
                </Text>
                <TextInput
                  value={form.email}
                  onChangeText={(t) => setForm({ ...form, email: t })}
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA4AB"
                  className="w-full h-14 bg-dark-100 border border-white/10 rounded-xl px-4 text-white focus:border-accent outline-none"
                />
              </View>

              <View>
                <Text className="text-light-200 text-sm mb-2 ml-1">
                  Password
                </Text>
                <TextInput
                  value={form.password}
                  onChangeText={(t) => setForm({ ...form, password: t })}
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA4AB"
                  secureTextEntry
                  className="w-full h-14 bg-dark-100 border border-white/10 rounded-xl px-4 text-white focus:border-accent outline-none"
                />
              </View>

              <TouchableOpacity
                onPress={handleAuth}
                disabled={isSubmitting}
                className={`w-full h-14 rounded-xl items-center justify-center mt-6 cursor-pointer transition-all ${
                  isSubmitting ? "bg-dark-100" : "bg-accent hover:bg-accent/90"
                }`}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text className="text-dark-200 text-lg font-bold">
                    {isRegistering ? "Sign Up" : "Sign In"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-center mt-8">
              <Text className="text-light-200">
                {isRegistering
                  ? "Already have an account? "
                  : "Don't have an account? "}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setIsRegistering(!isRegistering);
                  setError("");
                }}
              >
                <Text className="text-accent font-bold cursor-pointer hover:underline">
                  {isRegistering ? "Sign In" : "Sign Up"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
