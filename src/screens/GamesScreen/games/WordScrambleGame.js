import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome5 } from "@expo/vector-icons";
import { scrambleWords } from "../../../constants/gameData";
import colors from "../../../constants/colors";
import React from "react";

const TOTAL_ROUNDS = 10;

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function scramble(word) {
  const arr = word.split("");
  let scrambled;
  let attempts = 0;
  do {
    scrambled = shuffle(arr).join("");
    attempts++;
  } while (scrambled === word && attempts < 20);
  return scrambled;
}

function getOptions(word, allWords) {
  const others = allWords
    .filter((w) => w.word !== word)
    .map((w) => w.word);
  const distractors = shuffle(others).slice(0, 3);
  return shuffle([word, ...distractors]);
}

function getQuestions(allWords) {
  return shuffle(allWords).slice(0, TOTAL_ROUNDS).map((item) => ({
    ...item,
    scrambled: scramble(item.word),
    options: getOptions(item.word, allWords),
  }));
}

const WordScrambleGame = () => {
  const navigation = useNavigation();
  const [questions, setQuestions] = useState(() => getQuestions(scrambleWords));
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  const question = questions[current];

  const handleAnswer = (option) => {
    if (selected !== null) return;
    setSelected(option);
    if (option === question.word) setScore((s) => s + 1);

    setTimeout(() => {
      if (current + 1 >= TOTAL_ROUNDS) {
        setGameOver(true);
      } else {
        setCurrent((c) => c + 1);
        setSelected(null);
      }
    }, 900);
  };

  const restartGame = () => {
    setQuestions(getQuestions(scrambleWords));
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setGameOver(false);
  };

  if (gameOver) {
    const pct = Math.round((score / TOTAL_ROUNDS) * 100);
    const msg =
      pct === 100 ? "Word Master! 🎉" :
      pct >= 80 ? "Great job! 🙌" :
      pct >= 50 ? "Good effort! 📖" :
      "Keep practicing! 💪";
    return (
      <View style={styles.root}>
        <View style={styles.resultCard}>
          <FontAwesome5 name="random" size={50} color={colors.quarternaryLight} />
          <Text style={styles.resultTitle}>Word Scramble Complete!</Text>
          <Text style={styles.resultScore}>{score} / {TOTAL_ROUNDS}</Text>
          <Text style={styles.resultPercent}>{pct}%</Text>
          <Text style={styles.resultMsg}>{msg}</Text>
          <TouchableOpacity style={styles.btn} onPress={restartGame}>
            <Text style={styles.btnText}>Play Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={() => navigation.goBack()}>
            <Text style={styles.btnTextSecondary}>Back to Games</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const categoryColors = {
    Person: colors.tertiary,
    Place: colors.secondaryLight,
    Book: "#22c55e",
    Word: colors.quarternaryLight,
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <FontAwesome5 name="chevron-left" size={18} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Word Scramble</Text>
        <Text style={styles.scoreText}>{score}/{TOTAL_ROUNDS}</Text>
      </View>

      {/* Progress */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(current / TOTAL_ROUNDS) * 100}%` }]} />
      </View>
      <Text style={styles.questionCount}>Round {current + 1} of {TOTAL_ROUNDS}</Text>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Category badge */}
        <View style={styles.categoryBadge}>
          <Text style={[styles.categoryText, { color: categoryColors[question.category] ?? colors.text }]}>
            {question.category}
          </Text>
        </View>

        {/* Scrambled word */}
        <View style={styles.scrambleCard}>
          <Text style={styles.scrambleLabel}>Unscramble this word:</Text>
          <Text style={styles.scrambledWord}>{question.scrambled}</Text>
          <Text style={styles.hintText}>Hint: {question.hint}</Text>
        </View>

        {/* Options */}
        <Text style={styles.chooseLabel}>Choose the correct word:</Text>
        <View style={styles.optionsGrid}>
          {question.options.map((option) => {
            const isCorrect = option === question.word;
            const isSelected = option === selected;
            let bg = colors.primaryDark;
            let border = colors.quarternaryLight;
            if (selected !== null) {
              if (isCorrect) { bg = "#1a4d2e"; border = "#22c55e"; }
              else if (isSelected) { bg = "#4d1a1a"; border = colors.quarternary; }
              else { border = colors.primaryDark; }
            }
            return (
              <TouchableOpacity
                key={option}
                style={[styles.optionBtn, { backgroundColor: bg, borderColor: border }]}
                onPress={() => handleAnswer(option)}
                activeOpacity={0.75}>
                <Text style={styles.optionText}>{option}</Text>
                {selected !== null && isCorrect && <FontAwesome5 name="check" size={14} color="#22c55e" />}
                {selected !== null && isSelected && !isCorrect && <FontAwesome5 name="times" size={14} color={colors.quarternary} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default WordScrambleGame;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.primary },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: "900", color: colors.text },
  scoreText: { fontSize: 16, fontWeight: "700", color: colors.quarternaryLight },
  progressBar: {
    height: 6,
    backgroundColor: colors.primaryDark,
    marginHorizontal: 16,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: { height: 6, backgroundColor: colors.quarternaryLight, borderRadius: 4 },
  questionCount: {
    textAlign: "center",
    color: colors.textGrey,
    fontSize: 13,
    marginTop: 6,
    marginBottom: 8,
  },
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  categoryBadge: {
    alignSelf: "center",
    borderWidth: 1,
    borderColor: colors.secondaryDark,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 12,
  },
  categoryText: { fontSize: 13, fontWeight: "800", letterSpacing: 1 },
  scrambleCard: {
    backgroundColor: colors.primaryDark,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.quarternaryDark,
    gap: 10,
  },
  scrambleLabel: { fontSize: 14, color: colors.textGrey },
  scrambledWord: {
    fontSize: 38,
    fontWeight: "900",
    color: colors.quarternaryLight,
    letterSpacing: 6,
    textAlign: "center",
  },
  hintText: {
    fontSize: 14,
    color: colors.textGrey,
    fontStyle: "italic",
    textAlign: "center",
  },
  chooseLabel: {
    fontSize: 15,
    color: colors.textGrey,
    textAlign: "center",
    marginBottom: 12,
  },
  optionsGrid: { gap: 12 },
  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    gap: 10,
  },
  optionText: { fontSize: 17, fontWeight: "700", color: colors.text, textAlign: "center" },
  // Results
  resultCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    gap: 14,
  },
  resultTitle: { fontSize: 26, fontWeight: "900", color: colors.text, textAlign: "center" },
  resultScore: { fontSize: 56, fontWeight: "900", color: colors.quarternaryLight },
  resultPercent: { fontSize: 20, color: colors.textGrey },
  resultMsg: { fontSize: 17, color: colors.text, textAlign: "center", lineHeight: 26 },
  btn: {
    backgroundColor: colors.quarternaryLight,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 30,
    width: "80%",
    alignItems: "center",
  },
  btnText: { fontSize: 16, fontWeight: "900", color: colors.text },
  btnSecondary: { backgroundColor: "transparent", borderWidth: 2, borderColor: colors.secondaryLight },
  btnTextSecondary: { fontSize: 16, fontWeight: "700", color: colors.text },
});
