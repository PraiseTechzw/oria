import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome5 } from "@expo/vector-icons";
import { verseMemoryData } from "../../../constants/gameData";
import colors from "../../../constants/colors";
import React from "react";

const TOTAL_QUESTIONS = 10;

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function getQuestions() {
  return shuffle(verseMemoryData).slice(0, TOTAL_QUESTIONS);
}

const VerseMemoryGame = () => {
  const navigation = useNavigation();
  const [questions, setQuestions] = useState(getQuestions);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const question = questions[current];

  // Shuffle options once per question
  const [shuffledOptions, setShuffledOptions] = useState(() =>
    shuffle(question?.options ?? [])
  );

  useEffect(() => {
    if (question) setShuffledOptions(shuffle(question.options));
  }, [current]);

  const handleAnswer = (option) => {
    if (selected !== null) return;
    setSelected(option);
    const correct = option === question.blankWord;
    if (correct) setScore((s) => s + 1);

    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        if (current + 1 >= TOTAL_QUESTIONS) {
          setGameOver(true);
        } else {
          setCurrent((c) => c + 1);
          setSelected(null);
          fadeAnim.setValue(1);
        }
      });
    }, 900);
  };

  const restartGame = () => {
    setQuestions(getQuestions());
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setGameOver(false);
    fadeAnim.setValue(1);
  };

  if (gameOver) {
    const pct = Math.round((score / TOTAL_QUESTIONS) * 100);
    const msg =
      pct === 100
        ? "Perfect! 🎉 You know your Scripture!"
        : pct >= 80
        ? "Great job! 🙌 Keep memorizing!"
        : pct >= 50
        ? "Good effort! 📖 Keep reading!"
        : "Keep practicing! You'll get there! 💪";
    return (
      <View style={styles.root}>
        <View style={styles.resultCard}>
          <FontAwesome5 name="scroll" size={50} color={colors.tertiary} />
          <Text style={styles.resultTitle}>Verse Memory Complete!</Text>
          <Text style={styles.resultScore}>
            {score} / {TOTAL_QUESTIONS}
          </Text>
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

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <FontAwesome5 name="chevron-left" size={18} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verse Memory</Text>
        <Text style={styles.scoreText}>{score}/{TOTAL_QUESTIONS}</Text>
      </View>

      {/* Progress */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${((current) / TOTAL_QUESTIONS) * 100}%` }]} />
      </View>
      <Text style={styles.questionCount}>Question {current + 1} of {TOTAL_QUESTIONS}</Text>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Verse card */}
          <View style={styles.verseCard}>
            <Text style={styles.reference}>{question.reference}</Text>
            <Text style={styles.verseText}>{question.display}</Text>
          </View>

          {/* Options */}
          <Text style={styles.chooseLabel}>Choose the missing word:</Text>
          <View style={styles.optionsGrid}>
            {shuffledOptions.map((option) => {
              const isCorrect = option === question.blankWord;
              const isSelected = option === selected;
              let bgColor = colors.primaryDark;
              let borderColor = colors.secondaryLight;
              if (selected !== null) {
                if (isCorrect) { bgColor = "#1a4d2e"; borderColor = "#22c55e"; }
                else if (isSelected) { bgColor = "#4d1a1a"; borderColor = colors.quarternary; }
              }
              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.optionBtn, { backgroundColor: bgColor, borderColor }]}
                  onPress={() => handleAnswer(option)}
                  activeOpacity={0.75}>
                  <Text style={styles.optionText}>{option}</Text>
                  {selected !== null && isCorrect && (
                    <FontAwesome5 name="check" size={14} color="#22c55e" style={styles.optionIcon} />
                  )}
                  {selected !== null && isSelected && !isCorrect && (
                    <FontAwesome5 name="times" size={14} color={colors.quarternary} style={styles.optionIcon} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

export default VerseMemoryGame;

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
  scoreText: { fontSize: 16, fontWeight: "700", color: colors.tertiary },
  progressBar: {
    height: 6,
    backgroundColor: colors.primaryDark,
    marginHorizontal: 16,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    backgroundColor: colors.tertiary,
    borderRadius: 4,
  },
  questionCount: {
    textAlign: "center",
    color: colors.textGrey,
    fontSize: 13,
    marginTop: 6,
    marginBottom: 8,
  },
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  verseCard: {
    backgroundColor: colors.primaryDark,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.tertiaryDark,
  },
  reference: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.tertiary,
    marginBottom: 10,
    textAlign: "center",
  },
  verseText: {
    fontSize: 18,
    color: colors.text,
    lineHeight: 28,
    textAlign: "center",
    fontStyle: "italic",
  },
  chooseLabel: {
    fontSize: 15,
    color: colors.textGrey,
    textAlign: "center",
    marginBottom: 14,
  },
  optionsGrid: { gap: 12 },
  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
  },
  optionText: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  optionIcon: { marginLeft: 8 },
  // Results
  resultCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    gap: 14,
  },
  resultTitle: { fontSize: 26, fontWeight: "900", color: colors.text, textAlign: "center" },
  resultScore: { fontSize: 56, fontWeight: "900", color: colors.tertiary },
  resultPercent: { fontSize: 20, color: colors.textGrey },
  resultMsg: { fontSize: 17, color: colors.text, textAlign: "center", lineHeight: 26 },
  btn: {
    backgroundColor: colors.tertiary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 30,
    width: "80%",
    alignItems: "center",
  },
  btnText: { fontSize: 16, fontWeight: "900", color: colors.primary },
  btnSecondary: { backgroundColor: "transparent", borderWidth: 2, borderColor: colors.secondaryLight },
  btnTextSecondary: { fontSize: 16, fontWeight: "700", color: colors.text },
});
