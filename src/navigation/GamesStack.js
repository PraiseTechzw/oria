import { createNativeStackNavigator } from "@react-navigation/native-stack";
import GamesScreen from "../screens/GamesScreen/GamesScreen";
import VerseMemoryGame from "../screens/GamesScreen/games/VerseMemoryGame";
import WordScrambleGame from "../screens/GamesScreen/games/WordScrambleGame";
import BibleTriviaGame from "../screens/GamesScreen/games/BibleTriviaGame";
import React from "react";

const Stack = createNativeStackNavigator();

const GamesStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GamesHub" component={GamesScreen} />
      <Stack.Screen name="VerseMemory" component={VerseMemoryGame} />
      <Stack.Screen name="WordScramble" component={WordScrambleGame} />
      <Stack.Screen name="BibleTrivia" component={BibleTriviaGame} />
    </Stack.Navigator>
  );
};

export default GamesStack;
