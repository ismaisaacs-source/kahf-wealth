import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { designTokens } from "@kahf/config";
import { HomeScreen } from "../screens/home-screen";
import { EstateScreen } from "../screens/estate-screen";
import { ProfileScreen } from "../screens/profile-screen";
import { ScreeningScreen } from "../screens/screening-screen";
import { TrustCenterScreen } from "../screens/trust-center-screen";
import { ZakatScreen } from "../screens/zakat-screen";
import { FirebaseSetupScreen } from "../screens/firebase-setup-screen";
import { SignInScreen } from "../screens/auth/sign-in-screen";
import { SignUpScreen } from "../screens/auth/sign-up-screen";
import { useAuth } from "../state/auth-context";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: designTokens.colors.deepGreen,
        tabBarStyle: {
          height: 68,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen name="Dashboard" component={HomeScreen} />
      <Tab.Screen name="Zakat" component={ZakatScreen} />
      <Tab.Screen name="Screening" component={ScreeningScreen} />
      <Tab.Screen name="Estate" component={EstateScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AuthStack() {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  return mode === "sign-in" ? (
    <SignInScreen onCreateAccount={() => setMode("sign-up")} />
  ) : (
    <SignUpScreen onBackToSignIn={() => setMode("sign-in")} />
  );
}

function LoadingScreen() {
  return (
    <View style={styles.loadingScreen}>
      <ActivityIndicator color={designTokens.colors.deepGreen} size="large" />
      <Text style={styles.loadingText}>Restoring your Kahf Wealth session...</Text>
    </View>
  );
}

export function RootNavigator() {
  const { configIssues, firebaseUser, isConfigured, isLoading } = useAuth();

  if (!isConfigured) {
    return <FirebaseSetupScreen key={configIssues.join("|")} />;
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {firebaseUser ? (
        <>
          <Stack.Screen name="AppTabs" component={AppTabs} />
          <Stack.Screen name="TrustCenter" component={TrustCenterScreen} />
        </>
      ) : (
        <Stack.Screen name="AuthStack" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    alignItems: "center",
    backgroundColor: designTokens.colors.ivory,
    flex: 1,
    justifyContent: "center",
    padding: designTokens.spacing.lg,
  },
  loadingText: {
    color: designTokens.colors.ink,
    marginTop: designTokens.spacing.md,
    textAlign: "center",
  },
});
