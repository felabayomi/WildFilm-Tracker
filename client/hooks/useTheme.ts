import { Colors } from "@/constants/theme";
import { useThemeContext } from "@/contexts/ThemeContext";

export function useTheme() {
  const { isDarkMode } = useThemeContext();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  return {
    theme,
    isDark: isDarkMode,
  };
}
