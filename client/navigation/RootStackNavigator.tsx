import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import FilmDetailsScreen from "@/screens/FilmDetailsScreen";
import CategoryFilmsScreen from "@/screens/CategoryFilmsScreen";
import CollectionScreen from "@/screens/CollectionScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { FilmCategory } from "@/types/film";

export type RootStackParamList = {
  Main: undefined;
  FilmDetails: { filmId: string };
  CategoryFilms: { category: FilmCategory };
  Collection: { collectionId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FilmDetails"
        component={FilmDetailsScreen}
        options={{
          headerTitle: "",
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="CategoryFilms"
        component={CategoryFilmsScreen}
        options={{
          headerTitle: "Category",
        }}
      />
      <Stack.Screen
        name="Collection"
        component={CollectionScreen}
        options={{
          headerTitle: "Collection",
        }}
      />
    </Stack.Navigator>
  );
}
