import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  useSharedValue,
  withTiming,
  Easing,
  useDerivedValue,
} from "react-native-reanimated";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import React, { useRef, useEffect } from "react";
import { ReText } from "react-native-redash";
import { useSelector, useDispatch } from "react-redux";
import { refreshDailyVerse } from "../../features/globalData/globalDataSlice";
import HomeMilestonesRender from "../../components/molecules/HomeMilestonesRender/HomeMilestonesRender";
import CircularProgress from "react-native-circular-progress-indicator";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import graphic from "../../../assets/images/Logo.png";
import colors from "../../constants/colors";

const HomeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  const userProgress = useSelector((state) => state.globalData.userProgress);
  const streak = useSelector((state) => state.globalData.streak ?? { current: 0, best: 0 });
  const dailyVerse = useSelector((state) => state.globalData.dailyVerse);

  const points = userProgress.stats.totalPoints;
  const chapters = userProgress.stats.numChaptersCompleted;
  const books = userProgress.stats.numBooksCompleted;
  const { recentEarnedMilestones } = userProgress;

  const bibleChapterNumber = 1189;
  const bibleBookNumber = 66;
  const chapterPercentage = Math.ceil((chapters / bibleChapterNumber) * 100);
  const bookPercentage = Math.ceil((books / bibleBookNumber) * 100);

  // Animation
  const chapProgressRef = useRef(0);
  const bookProgressRef = useRef(0);
  const pointsValueAnim = useSharedValue(0);
  const pointsText = useDerivedValue(() => {
    return Math.ceil(pointsValueAnim.value).toLocaleString();
  });

  useEffect(() => {
    if (isFocused) {
      chapProgressRef.current.reAnimate();
      bookProgressRef.current.reAnimate();
      pointsValueAnim.value = 0;
      pointsValueAnim.value = withTiming(points, {
        duration: 1100,
        easing: Easing.inOut(Easing.quad),
      });
      // Refresh daily verse each time home is focused
      dispatch(refreshDailyVerse());
    } else {
      pointsValueAnim.value = 0;
    }
  }, [isFocused, points, pointsValueAnim]);

  const handleProgressPress = () => navigation.navigate("BIBLE");
  const handleMilestonePressed = () => navigation.navigate("MILESTONES");
  const handleGamesPress = () => navigation.navigate("GAMES");
  const handleBookmarksPress = () => navigation.navigate("BOOKMARKS");

  const streakColor =
    streak.current >= 30 ? colors.quarternaryLight :
    streak.current >= 7 ? colors.tertiary :
    streak.current >= 1 ? colors.secondaryLight :
    colors.textGrey;

  return (
    <ScrollView contentContainerStyle={styles.root} showsVerticalScrollIndicator={false}>
      {/* Top logo bar */}
      <View style={styles.topBar}>
        <Image source={graphic} style={styles.graphic} />
      </View>

      <View style={styles.mainContentContainer}>
        <View style={styles.mainContent}>

          {/* ── Progress section ──────────────────────── */}
          <View style={styles.progressSectionContainer}>
            <Text style={styles.progressHeader}>YOUR PROGRESS</Text>

            {/* Points ticker */}
            <TouchableOpacity
              style={styles.pointsContainer}
              onPress={handleProgressPress}
              activeOpacity={0.7}>
              <ReText style={styles.pointsText} text={pointsText} />
              <Text style={styles.pointsText}>POINTS</Text>
            </TouchableOpacity>

            {/* Circles */}
            <View style={styles.progressCirclesContainer}>
              <TouchableOpacity
                style={styles.progressCircleContainer}
                onPress={handleProgressPress}
                activeOpacity={0.7}>
                <CircularProgress
                  ref={chapProgressRef}
                  value={chapterPercentage}
                  radius={52}
                  duration={900}
                  progressValueColor={colors.secondary}
                  activeStrokeColor={colors.secondaryLight}
                  inActiveStrokeColor={colors.secondaryDark}
                  circleBackgroundColor={colors.primaryDark}
                  maxValue={100}
                  valueSuffix={"%"}
                />
                <Text style={styles.chapterInfoUnderCircle}>
                  {chapters} / 1,189{"\n"}Chapters
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.progressCircleContainer}
                onPress={handleProgressPress}
                activeOpacity={0.7}>
                <CircularProgress
                  ref={bookProgressRef}
                  value={bookPercentage}
                  radius={52}
                  duration={900}
                  progressValueColor={colors.quarternary}
                  activeStrokeColor={colors.quarternaryLight}
                  inActiveStrokeColor={colors.quarternaryDark}
                  circleBackgroundColor={colors.primaryDark}
                  maxValue={100}
                  valueSuffix={"%"}
                />
                <Text style={styles.bookInfoUnderCircle}>
                  {books} / 66{"\n"}Books
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Reading Streak ────────────────────────── */}
          <View style={styles.streakContainer}>
            <FontAwesome5 name="fire" size={24} color={streakColor} />
            <View style={styles.streakTextBlock}>
              <Text style={[styles.streakCount, { color: streakColor }]}>
                {streak.current} {streak.current === 1 ? "day" : "day"} streak
              </Text>
              {streak.best > 0 && (
                <Text style={styles.streakBest}>Best: {streak.best} days</Text>
              )}
            </View>
            <TouchableOpacity onPress={handleProgressPress} style={styles.streakReadBtn}>
              <Text style={styles.streakReadText}>Read Today</Text>
            </TouchableOpacity>
          </View>

          {/* ── Daily Verse ───────────────────────────── */}
          {dailyVerse && (
            <View style={styles.dailyVerseContainer}>
              <View style={styles.dailyVerseHeader}>
                <FontAwesome5 name="sun" size={16} color={colors.tertiary} />
                <Text style={styles.dailyVerseLabel}>Daily Verse</Text>
              </View>
              <Text style={styles.dailyVerseText}>"{dailyVerse.text}"</Text>
              <Text style={styles.dailyVerseRef}>— {dailyVerse.reference}</Text>
            </View>
          )}

          {/* ── Quick actions ─────────────────────────── */}
          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={[styles.quickActionBtn, { borderColor: colors.quarternaryDark, backgroundColor: "rgba(110,29,24,0.25)" }]}
              onPress={handleGamesPress}
              activeOpacity={0.75}>
              <FontAwesome5 name="gamepad" size={22} color={colors.quarternaryLight} />
              <Text style={styles.quickActionText}>Games</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickActionBtn, { borderColor: colors.tertiaryDark, backgroundColor: "rgba(163,139,0,0.2)" }]}
              onPress={handleBookmarksPress}
              activeOpacity={0.75}>
              <Ionicons name="bookmark" size={22} color={colors.tertiary} />
              <Text style={styles.quickActionText}>Bookmarks</Text>
            </TouchableOpacity>
          </View>

          {/* ── Milestones ────────────────────────────── */}
          <Text style={styles.milestonesHeader}>Milestones</Text>
          <View style={styles.milestonesSectionContainer}>
            <View style={styles.milestonesContainer}>
              <HomeMilestonesRender
                milestones={userProgress.milestones}
                recentEarnedMilestones={recentEarnedMilestones}
              />
              <TouchableOpacity onPress={handleMilestonePressed}>
                <Text style={styles.viewMore}>View All →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    alignItems: "center",
    paddingBottom: 30,
  },
  topBar: {
    width: "100%",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 8,
  },
  graphic: {
    width: 120,
    height: 50,
    resizeMode: "contain",
  },
  mainContentContainer: {
    width: "100%",
    alignItems: "center",
  },
  mainContent: {
    width: "95%",
    maxWidth: 600,
    gap: 16,
  },
  // Progress
  progressSectionContainer: {
    backgroundColor: colors.primaryDarkTranslucent,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.secondaryDark,
    padding: 16,
    alignItems: "center",
  },
  progressHeader: {
    fontWeight: "900",
    fontSize: 14,
    color: colors.textGrey,
    letterSpacing: 2,
    marginBottom: 8,
  },
  pointsContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  pointsText: {
    fontWeight: "900",
    fontSize: 36,
    color: colors.secondary,
    textAlign: "center",
  },
  progressCirclesContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  progressCircleContainer: {
    alignItems: "center",
    gap: 8,
  },
  chapterInfoUnderCircle: {
    fontWeight: "700",
    fontSize: 14,
    color: colors.secondary,
    textAlign: "center",
  },
  bookInfoUnderCircle: {
    fontWeight: "700",
    fontSize: 14,
    color: colors.quarternary,
    textAlign: "center",
  },
  // Streak
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryDarkTranslucent,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.secondaryDark,
    padding: 14,
    gap: 12,
  },
  streakTextBlock: { flex: 1 },
  streakCount: { fontSize: 18, fontWeight: "900" },
  streakBest: { fontSize: 12, color: colors.textGrey, marginTop: 2 },
  streakReadBtn: {
    backgroundColor: colors.secondaryDark,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  streakReadText: { fontSize: 13, fontWeight: "800", color: colors.text },
  // Daily verse
  dailyVerseContainer: {
    backgroundColor: colors.primaryDarkTranslucent,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.tertiaryDark,
    padding: 18,
    gap: 10,
  },
  dailyVerseHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dailyVerseLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.tertiary,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  dailyVerseText: {
    fontSize: 16,
    color: colors.text,
    fontStyle: "italic",
    lineHeight: 24,
  },
  dailyVerseRef: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.tertiary,
    textAlign: "right",
  },
  // Quick actions
  quickActionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 2,
    borderRadius: 14,
    paddingVertical: 14,
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },
  // Milestones
  milestonesHeader: {
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    color: colors.text,
    marginTop: 4,
  },
  milestonesSectionContainer: {
    alignItems: "center",
  },
  milestonesContainer: {
    width: "100%",
    borderWidth: 2,
    borderRadius: 20,
    borderColor: colors.tertiaryDark,
    backgroundColor: colors.primaryDarkTranslucent,
  },
  viewMore: {
    fontWeight: "800",
    fontSize: 16,
    color: colors.textGrey,
    textAlign: "center",
    padding: 10,
  },
});
