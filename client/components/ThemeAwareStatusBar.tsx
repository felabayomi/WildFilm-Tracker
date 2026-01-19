import React from "react";
import { StatusBar } from "expo-status-bar";
import { useThemeContext } from "@/contexts/ThemeContext";

export function ThemeAwareStatusBar() {
  const { isDarkMode } = useThemeContext();
  
  return <StatusBar style={isDarkMode ? "light" : "dark"} />;
}
