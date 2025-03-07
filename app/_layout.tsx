import React, { useEffect, useState } from "react";
import { View, StyleSheet, Image } from "react-native";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { useColorScheme } from "@/hooks/useColorScheme"; // Assurez-vous que ce hook fonctionne
import Index from "./(tabs)/index";
import Details from "./Details";
import Cart from "./CartScreen";
import { CartProvider } from "./cartProvider";
import AddBookScreen from "./AddBookScreen";
import BookListScreen from "./BookListScreen";
import UpdateBookScreen from "./UpdateBookScreen";
// Empêcher le splash screen de se cacher automatiquement
SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [appIsReady, setAppIsReady] = useState(false);
  
  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Simulation d’une préparation (chargement API, vérifications, etc.)
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        if (fontsLoaded) {
          await SplashScreen.hideAsync();
        }
      }
    }

    prepare();
  }, [fontsLoaded]);

  if (!appIsReady || !fontsLoaded) {
    return (
      <View style={styles.splashContainer}>
        <Image source={require("../assets/images/livre.png")} style={styles.splashImage} />
      </View>
    );
  }

  return (
    <CartProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack.Navigator initialRouteName="Index">
  {/* <Stack.Screen name="CrudBooks" component={CrudBooks} options={{ headerShown: false }} /> */}
  {/* <Stack.Screen name="AddBookForm" component={AddBookForm} options={{ title: "Add Book" }} /> */}
  <Stack.Screen name="AddBookScreen" component={AddBookScreen} options={{ headerShown: false }} />
  <Stack.Screen name="BookListScreen" component={BookListScreen} options={{ headerShown: false }} />
  <Stack.Screen name="UpdateBookScreen" component={UpdateBookScreen} options={{ headerShown: false }} />     
          {/* Autres écrans */}
          <Stack.Screen name="Index" component={Index} />
          <Stack.Screen name="Details" component={Details} />
          <Stack.Screen name="Cart" component={Cart} />
        </Stack.Navigator>
        <StatusBar style="auto" />
      </ThemeProvider>
    </CartProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  splashImage: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
});
