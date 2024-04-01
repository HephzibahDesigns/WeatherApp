import StackNavigation from "./Navigation/StackNavigation";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold,
  Poppins_300Light,
} from "@expo-google-fonts/dev";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // You can perform any asynchronous tasks here.
        // This function will be called immediately without any delay.
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    // Call the prepare function
    prepare();

    // Hide the splash screen after 2 seconds (adjust as needed)
    const splashScreenTimeout = setTimeout(async () => {
      await SplashScreen.hideAsync();
    }, 3000); // Adjust the delay as needed

    // Clear the timeout to prevent memory leaks
    return () => clearTimeout(splashScreenTimeout);
  }, []);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold,
    Poppins_300Light,
  });

  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#2d3283" />
      <StackNavigation />
    </NavigationContainer>
  );
}
