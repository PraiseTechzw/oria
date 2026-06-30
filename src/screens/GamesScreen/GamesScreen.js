import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "../../constants/colors";
import React from "react";

const GAMES = [
  {
    name: "Verse Memory",
    route: "VerseMemory",
    icon: <FontAwesome5 name="scroll" size={36} color={colors.tertiary} />,
    description: "Fill in the missing word from a famous Bible verse.",
    color: colors.tertiaryDark,
    border: colors.tertiary,
  },
  {
    name: "Bible Trivia",
    route: "BibleTrivia",
    icon: <MaterialCommunityIcons name="head-question" size={40} color={colors.secondaryLight} />,
    description: "Test your Bible knowledge with 10 multiple-choice questions.",
    color: colors.secondaryDark,
    border: colors.secondaryLight,
  },
  {
    name: "Word Scramble",
    route: "WordScramble",
    icon: <FontAwesome5 name="random" size={34} color={colors.quarternaryLight} />,
    description: "Unscramble Bible people, places, books, and more.",
    color: colors.quarternaryDark,
    border: colors.quarternaryLight,
  },
];

const GamesScreen = () => {
  const navigation = useNavigation();

  return (
    <ScrollView contentContainerStyle={styles.root} showsVerticalScrollIndicator={false}>
      <Text style={styles.header}>Games</Text>
      <Text style={styles.subHeader}>Challenge yourself and grow in knowledge!</Text>
      <View style={styles.cardsContainer}>
        {GAMES.map((game) => (
          <TouchableOpacity
            key={game.route}
            style={[styles.card, { borderColor: game.border, backgroundColor: game.color }]}
            activeOpacity={0.75}
            onPress={() => navigation.navigate(game.route)}>
            <View style={styles.cardIcon}>{game.icon}</View>
            <Text style={styles.cardTitle}>{game.name}</Text>
            <Text style={styles.cardDesc}>{game.description}</Text>
            <View style={styles.playBtn}>
              <Text style={styles.playBtnText}>Play</Text>
              <FontAwesome5 name="chevron-right" size={14} color={colors.primary} />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

export default GamesScreen;

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  header: {
    fontSize: 34,
    fontWeight: "900",
    textAlign: "center",
    color: colors.text,
    marginTop: 30,
    marginBottom: 6,
  },
  subHeader: {
    fontSize: 15,
    color: colors.textGrey,
    textAlign: "center",
    marginBottom: 30,
  },
  cardsContainer: {
    gap: 20,
    maxWidth: 600,
    alignSelf: "center",
    width: "100%",
  },
  card: {
    borderRadius: 18,
    borderWidth: 2,
    padding: 24,
    alignItems: "center",
  },
  cardIcon: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  cardDesc: {
    fontSize: 15,
    color: colors.textGrey,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 18,
  },
  playBtn: {
    flexDirection: "row",
    backgroundColor: colors.text,
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 30,
    alignItems: "center",
    gap: 8,
  },
  playBtnText: {
    color: colors.primary,
    fontWeight: "800",
    fontSize: 16,
  },
});
