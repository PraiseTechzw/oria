import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { trivia } from "../../../constants/gameData";
import colors from "../../../constants/colors";
import React from "react";

const TOTAL_QUESTIONS = 10;
const TIME_PER_QUESTION = 15; // seconds

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function getQuestions() {
  return shuffle(trivia).slice(0, TOTAL_QUESTIONS);
}

const BibleTriviaGame = () => {
  const navigation = useNavigation();
  const [questions, setQuestions] = useState(getQuestions);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const timerRef = useRef(null);

  const question = questions[current];

  const advance = (answered) => {
    clearInterval(timerRef.current);
    setTimeout(() => {
      if (current + 1 >= TOTAL_QUESTIONS) {
        setGameOver(true);
      } else {
        setCurrent((c) => c + 1);
        setSelected(null);
        setTimeLeft(TIME_PER_QUESTION);
      }
    }, answered ? 900 : 400);
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          advance(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [current]);

  const handleAnswer = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === question.correctIndex) setScore((s) => s + 1);
    advance(true);
  };

  const restartGame = () => {
    clearInterval(timerRef.current);
    setQuestions(getQuestions());
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setGameOver(false);
    setTimeLeft(TIME_PER_QUESTION);
  };

  if (gameOver) {
    const pct = Math.round((score / TOTAL_QUESTIONS) * 100);
    const msg =
      pct === 100 ? "Bible Scholar! 🎉" :
      pct >= 80 ? "Excellent! 🙌 You know your Bible!" :
      pct >= 60 ? "Good work! 📖 Keep learning!" :
      pct >= 40 ? "Nice try! 📚 Keep reading!" :
      "Keep studying! 💪 You'll improve!";

    return (
      <View style={styles.root}>
        <View style={styles.resultCard}>
          <MaterialCommunityIcons name="head-question" size={60} color={colors.secondaryLight} />
          <Text style={styles.resultTitle}>Trivia Complete!</Text>
          <Text style={styles.resultScore}>{score} / {TOTAL_QUESTIONS}</Text>
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

  const timerColor = timeLeft <= 5 ? colors.quarternary : timeLeft <= 10 ? colors.tertiary : "#22c55e";

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <FontAwesome5 name="chevron-left" size={18} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bible Trivia</Text>
        <Text style={[styles.timer, { color: timerColor }]}>{timeLeft}s</Text>
      </View>

      {/* Progress */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(current / TOTAL_QUESTIONS) * 100}%` }]} />
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.questionCount}>Q {current + 1}/{TOTAL_QUESTIONS}</Text>
        <Text style={styles.scoreLabel}>Score: {score}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{question.question}</Text>
        </View>

        <View style={styles.optionsContainer}>
          {question.options.map((opt, idx) => {
            const isCorrect = idx === question.correctIndex;
            const isSelected = idx === selected;
            let bg = colors.primaryDark;
            let border = colors.secondaryLight;
            if (selected !== null) {
              if (isCorrect) { bg = "#1a4d2e"; border = "#22c55e"; }
              else if (isSelected) { bg = "#4d1a1a"; border = colors.quarternary; }
              else { border = colors.primaryDark; }
            }
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.optionBtn, { backgroundColor: bg, borderColor: border }]}
                onPress={() => handleAnswer(idx)}
                activeOpacity={0.75}>
                <Text style={styles.optionLetter}>{["A", "B", "C", "D"][idx]}</Text>
                <Text style={styles.optionText}>{opt}</Text>
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

export default BibleTriviaGame;

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
  timer: { fontSize: 20, fontWeight: "900", minWidth: 36, textAlign: "right" },
  progressBar: {
    height: 6,
    backgroundColor: colors.primaryDark,
    marginHorizontal: 16,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: { height: 6, backgroundColor: colors.secondaryLight, borderRadius: 4 },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 6,
    marginBottom: 10,
  },
  questionCount: { color: colors.textGrey, fontSize: 13 },
  scoreLabel: { color: colors.secondaryLight, fontWeight: "700", fontSize: 13 },
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  questionCard: {
    backgroundColor: colors.primaryDark,
    borderRadius: 16,
    padding: 22,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: colors.secondaryDark,
    minHeight: 100,
    justifyContent: "center",
  },
  questionText: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
    lineHeight: 30,
  },
  optionsContainer: { gap: 12 },
  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 2,
    padding: 14,
    gap: 12,
  },
  optionLetter: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.textGrey,
    minWidth: 22,
    textAlign: "center",
  },
  optionText: { flex: 1, fontSize: 16, fontWeight: "600", color: colors.text },
  // Results
  resultCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    gap: 14,
  },
  resultTitle: { fontSize: 26, fontWeight: "900", color: colors.text, textAlign: "center" },
  resultScore: { fontSize: 56, fontWeight: "900", color: colors.secondaryLight },
  resultPercent: { fontSize: 20, color: colors.textGrey },
  resultMsg: { fontSize: 17, color: colors.text, textAlign: "center", lineHeight: 26 },
  btn: {
    backgroundColor: colors.secondaryLight,
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
