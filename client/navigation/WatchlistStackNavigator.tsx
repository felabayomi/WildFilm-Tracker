import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WatchlistScreen from "@/screens/WatchlistScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type WatchlistStackParamList = {
  Watchlist: undefined;
};

const Stack = createNativeStackNavigator<WatchlistStackParamList>();

export default function WatchlistStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Watchlist"
        component={WatchlistScreen}
        options={{
          headerTitle: "Watchlist",
        }}
      />
    </Stack.Navigator>
  );
}
