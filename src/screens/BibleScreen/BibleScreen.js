import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Share,
  Alert,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import {
  setChapterSelected,
  addBookmark,
  removeBookmark,
} from "../../features/globalData/globalDataSlice";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { ProgressBar } from "react-native-paper";
import { useNetInfo } from "@react-native-community/netinfo";
import { quizMap } from "../../constants/quizData/quizMap";
import { fetchChapter, BIBLE_VERSIONS } from "../../services/bibleService";
import StyledTextButton from "../../components/atoms/StyledTextButton/StyledTextButton";
import LearnMoreButton from "../../components/molecules/LearnMoreButton/LearnMoreButton";
import NoQuizModal from "../../components/organisms/Quiz Components/NoQuizModal/NoQuizModal";
import QuizModal from "../../components/organisms/Quiz Components/QuizModal/QuizModal";
import capybara from "../../../assets/images/capybara.png";
import colors from "../../constants/colors";
import React from "react";

const BibleScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const testamentIndex = route.params?.testamentIndex;
  const bookIndex = route.params?.bookIndex;
  const bookName = route.params?.bookName;
  const chapterNum = route.params?.chapter;
  const chapterIndex = chapterNum - 1;

  const bibleState = useSelector((state) => state.globalData.bibleData);
  const userProgress = useSelector((state) => state.globalData.userProgress);
  const settings = useSelector(
    (state) => state.globalData.settings ?? { fontSize: 20, bibleVersion: "esv" }
  );
  const bookmarks = useSelector((state) => state.globalData.bookmarks ?? []);
  const dispatch = useDispatch();

  const fontSize = settings.fontSize ?? 20;
  const bibleVersion = settings.bibleVersion ?? "esv";
  const lineHeight = fontSize * 1.6;

  const [nextChapterExists, setNextChapterExists] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [error, setError] = useState("");
  const [response, setResponse] = useState("");
  const [numOfVerses, setNumOfVerses] = useState(null);
  const [highlightedText, setHighlightedText] = useState([]);
  const [linesData, setLinesData] = useState([]);
  const [scrollY, setScrollY] = useState(0);
  const [shouldRenderPressable, setShouldRenderPressable] = useState(false);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [noQuizModalOpen, setNoQuizModalOpen] = useState(false);
  const [copyright, setCopyright] = useState("ESV® Bible © 2001 Crossway");

  const quizData = quizMap?.[bookName]?.chapters?.[chapterIndex] ?? null;

  const isCurrentChapterCompleted =
    bibleState[testamentIndex].books[bookIndex].chapters[chapterIndex].completed;

  const reference = `${bookName} ${chapterNum}`;
  const isBookmarked = bookmarks.some((b) => b.reference === reference);

  const milestonesArray = userProgress.recentEarnedMilestones;
  const currentMilestonesArray = useRef(
    JSON.parse(JSON.stringify(milestonesArray))
  ).current;

  const currentQuizBooks = Object.keys(quizMap).filter((bookName) => {
    const bookData = quizMap[bookName];
    return (
      bookData &&
      Array.isArray(bookData.chapters) &&
      bookData.chapters.length > 0
    );
  });

  const onTextLayout = (event) => {
    const lines = event?.nativeEvent.lines;
    setLinesData(lines);
  };
  const scrollViewRef = useRef(null);
  const netInfo = useNetInfo();

  const versionLabel =
    BIBLE_VERSIONS.find((v) => v.id === bibleVersion)?.label ?? "ESV";

  // Bookmark toggle
  const handleBookmarkToggle = () => {
    if (isBookmarked) {
      const bm = bookmarks.find((b) => b.reference === reference);
      if (bm) dispatch(removeBookmark({ id: bm.id }));
    } else {
      dispatch(addBookmark({ bookName, chapterNum }));
    }
  };

  // Share
  const handleShare = async () => {
    if (!response) return;
    const preview = response.substring(0, 300).replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, "");
    try {
      await Share.share({
        message: `${bookName} ${chapterNum} (${versionLabel})\n\n${preview}...\n\nRead more in the Level-Up Bible app!`,
      });
    } catch (e) {
      // ignore
    }
  };

  // Wait 1sec to show no-connection state
  useEffect(() => {
    const timerId = setTimeout(() => {
      setIsConnected(netInfo.isConnected);
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timerId);
  }, [netInfo]);

  // Fetch chapter text whenever chapter or version changes
  const fetchData = async () => {
    setIsLoading(true);
    setResponse("");
    setHighlightedText([]);
    setLinesData([]);
    setShouldRenderPressable(false);
    try {
      const result = await fetchChapter({
        bookName,
        chapterNum,
        version: bibleVersion,
        bibleState,
        testamentIndex,
        bookIndex,
      });
      setResponse(result.text);
      setNumOfVerses(result.numOfVerses);
      setCopyright(result.copyright);
    } catch (err) {
      setError(err);
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const nextChapterNumIndex = chapterNum;
    if (
      bibleState[testamentIndex]?.books[bookIndex]?.chapters[nextChapterNumIndex]
    ) {
      setNextChapterExists(true);
    } else {
      setNextChapterExists(false);
    }
    fetchData();
  }, [chapterNum, isConnected, bibleVersion]);

  // Scroll handler
  const [contentHeight, setContentHeight] = useState(1);
  const [scrollViewHeight, setScrollViewHeight] = useState(1);

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const denominator = Math.max(1, contentHeight - scrollViewHeight);
    const scrollProgress = Math.min(1, Math.max(0, offsetY / denominator));
    setScrollY(scrollProgress);
    const linesOutOfViewRaw = linesData.filter((line) => {
      const lineYEnd = line.y + line.height;
      return line && lineYEnd < offsetY - line.height * 2 - 8;
    });
    setHighlightedText(linesOutOfViewRaw.map((line) => line.text));

    // Show quiz button when near the bottom
    const distanceFromBottom =
      contentHeight - scrollViewHeight - offsetY;
    if (distanceFromBottom <= 15) {
      setTimeout(() => setShouldRenderPressable(true), 500);
    }
  };

  const handleNextChapterPress = () => {
    const nextChapterNum = chapterNum + 1;
    dispatch(
      setChapterSelected({
        testamentIndex,
        bookIndex,
        chapterNum: nextChapterNum,
      })
    );
    navigation.navigate("Bible", {
      testamentIndex,
      bookIndex,
      bookName,
      chapter: nextChapterNum,
    });
  };

  const handleQuizModalToggle = () => setQuizModalOpen(!quizModalOpen);
  const handleNoQuizModalToggle = () => setNoQuizModalOpen(!noQuizModalOpen);

  return (
    <View style={styles.root}>
      {/* Header row */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.goBackArrow}
          onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" color={colors.text} size={20} />
        </TouchableOpacity>
        <View style={styles.progressBarContainer}>
          <ProgressBar
            progress={scrollY}
            color={colors.secondaryLight}
            style={styles.progressBar}
          />
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleBookmarkToggle} style={styles.actionBtn}>
            <Ionicons
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              size={22}
              color={isBookmarked ? colors.tertiary : colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.actionBtn}>
            <FontAwesome5 name="share-alt" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bible card */}
      <View style={styles.card}>
        {/* Chapter heading */}
        <View style={styles.chapterHeading}>
          <Text style={styles.heading}>
            {bookName} {chapterNum}
          </Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionBadgeText}>{versionLabel}</Text>
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={colors.secondaryLight}
            style={{ flex: 1 }}
          />
        ) : !isConnected ? (
          <View style={styles.noConnectionContainer}>
            <Image source={capybara} style={styles.capybara} />
            <Text style={styles.heading}>No connection</Text>
            <Text style={[styles.heading, { fontSize: 16 }]}>
              Please connect to the internet to read the Bible.
            </Text>
          </View>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onLayout={(e) => setScrollViewHeight(e.nativeEvent.layout.height)}>
            <View
              style={styles.passageContainer}
              onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}>
              {/* Hidden highlighted text layer */}
              <View style={styles.highlightTextContainer} pointerEvents="none">
                <Text
                  style={[styles.highlightText, { fontSize, lineHeight }]}
                  textBreakStrategy="simple">
                  {highlightedText.join("")}
                </Text>
              </View>
              {/* Main text */}
              <Text
                onTextLayout={onTextLayout}
                style={[styles.text, { fontSize, lineHeight }]}
                textBreakStrategy="simple"
                selectable>
                {response}
              </Text>
            </View>

            <View style={styles.bottomSection}>
              <Text style={styles.copyrightText}>{copyright}</Text>
              {isCurrentChapterCompleted ? (
                <Text style={styles.completeText}>Chapter Completed! ✓</Text>
              ) : (
                <View>
                  <StyledTextButton
                    backgroundColor={
                      shouldRenderPressable ? colors.tertiary : null
                    }
                    backgroundPressedColor={
                      shouldRenderPressable ? colors.tertiaryLight : null
                    }
                    borderWidth={2}
                    borderColor={
                      shouldRenderPressable
                        ? colors.tertiary
                        : colors.secondaryLight
                    }
                    margin={12}
                    onPress={
                      shouldRenderPressable
                        ? quizData
                          ? handleQuizModalToggle
                          : handleNoQuizModalToggle
                        : null
                    }>
                    Take Quiz
                  </StyledTextButton>
                </View>
              )}
              {nextChapterExists && (
                <StyledTextButton
                  backgroundPressedColor={colors.secondary}
                  borderWidth={2}
                  borderColor={colors.secondaryLight}
                  margin={30}
                  onPress={handleNextChapterPress}>
                  Next Chapter
                </StyledTextButton>
              )}
            </View>
          </ScrollView>
        )}
      </View>

      {noQuizModalOpen && (
        <NoQuizModal
          modalOpen={noQuizModalOpen}
          modalToggle={handleNoQuizModalToggle}
          currentQuizBooks={currentQuizBooks}
          numOfVerses={numOfVerses}
          testamentIndex={testamentIndex}
          bookIndex={bookIndex}
          bookName={bookName}
          chapterIndex={chapterIndex}
          milestones={currentMilestonesArray}
        />
      )}
      {quizModalOpen && (
        <QuizModal
          modalOpen={quizModalOpen}
          modalToggle={handleQuizModalToggle}
          QuizData={quizData}
          numOfVerses={numOfVerses}
          testamentIndex={testamentIndex}
          bookIndex={bookIndex}
          bookName={bookName}
          chapterIndex={chapterIndex}
          milestones={currentMilestonesArray}
        />
      )}
    </View>
  );
};

export default BibleScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    width: "95%",
    flex: 0.5,
    flexDirection: "row",
    alignItems: "center",
  },
  goBackArrow: {
    flex: 1,
    height: "100%",
    alignItems: "flex-start",
    justifyContent: "center",
    paddingLeft: 8,
  },
  progressBarContainer: {
    flex: 5,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  progressBar: {
    height: 8,
    width: 200,
    borderRadius: 12,
  },
  headerActions: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingRight: 4,
    gap: 4,
  },
  actionBtn: { padding: 6 },
  card: {
    width: "95%",
    height: "95%",
    maxWidth: 800,
    backgroundColor: colors.primaryDark,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
    flex: 9,
    marginVertical: 8,
  },
  chapterHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 4,
  },
  heading: {
    color: colors.text,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "800",
  },
  versionBadge: {
    backgroundColor: colors.secondaryDark,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  versionBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.text,
  },
  noConnectionContainer: {
    width: "100%",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  capybara: { width: 300, height: 300 },
  scroll: { flex: 1 },
  passageContainer: { width: "100%", flex: 0 },
  text: {
    color: colors.text,
    fontWeight: "400",
    letterSpacing: 0.3,
    padding: 16,
    position: "relative",
    top: 0,
    left: 0,
  },
  highlightTextContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: "100%",
    overflow: "hidden",
  },
  highlightText: {
    color: colors.textHighlight,
    fontWeight: "400",
    letterSpacing: 0.3,
    padding: 16,
  },
  bottomSection: { marginBottom: 45 },
  copyrightText: {
    color: colors.textGrey,
    textAlign: "center",
    fontSize: 12,
    padding: 8,
  },
  completeText: {
    fontWeight: "800",
    textAlign: "center",
    padding: 16,
    color: colors.tertiary,
    marginBottom: 24,
    fontSize: 20,
  },
});
