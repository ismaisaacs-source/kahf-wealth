import React from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { designTokens } from "@kahf/config";
import { AppProviders } from "./src/providers/app-providers";
import { RootNavigator } from "./src/navigation/root-navigator";

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: designTokens.colors.ivory,
    card: designTokens.colors.ivory,
    text: designTokens.colors.ink,
    primary: designTokens.colors.deepGreen,
    border: designTokens.colors.mist,
  },
};

export default function App() {
  return (
    <AppProviders>
      <NavigationContainer theme={theme}>
        <StatusBar style="dark" />
        <RootNavigator />
      </NavigationContainer>
    </AppProviders>
  );
}
